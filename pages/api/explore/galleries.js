import { connectToDatabase } from '../../../config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const session = await getServerSession(req, res, authOptions);
    const currentUserId = session?.user?.id;

    // Get all users who have PUBLIC models with images
    // Also include legacy models without isPublic field (treat as public)
    const galleries = await db.collection('models').aggregate([
      // Only active AND public models (or legacy models without the field)
      { $match: { 
        isActive: true, 
        $or: [
          { isPublic: true },
          { isPublic: { $exists: false } }
        ]
      }},
      // Group by userId to get galleries
      { $group: {
        _id: '$userId',
        models: { $push: {
          username: '$username',
          imageCount: '$imageCount'
        }},
        modelCount: { $sum: 1 },
        totalImages: { $sum: { $ifNull: ['$imageCount', 0] } },
        // Get first model username for display
        displayName: { $first: '$username' }
      }},
      // Only galleries with at least 1 image
      { $match: { totalImages: { $gt: 0 } } },
      // Get community stats for this gallery
      { $lookup: {
        from: 'community_ratings',
        localField: '_id',
        foreignField: 'galleryOwnerId',
        as: 'communityRatings'
      }},
      // Calculate community stats
      { $addFields: {
        communityVotes: { $size: '$communityRatings' },
        communityScore: {
          $cond: {
            if: { $gt: [{ $size: '$communityRatings' }, 0] },
            then: { $avg: '$communityRatings.score' },
            else: 0
          }
        }
      }},
      // Project final shape - NO real names or personal info
      { $project: {
        _id: 1,
        userId: '$_id',
        // Use first model username as gallery display name
        galleryName: { 
          $concat: ['@', { $ifNull: ['$displayName', 'gallery'] }] 
        },
        modelCount: 1,
        totalImages: 1,
        communityVotes: 1,
        communityScore: 1,
        // Get model usernames only (no real names)
        modelUsernames: {
          $slice: [
            { $map: { input: '$models', as: 'm', in: '$$m.username' } },
            4
          ]
        },
        isOwnGallery: { $eq: [{ $toString: '$_id' }, currentUserId] }
      }},
      // Sort by community votes, then total images
      { $sort: { communityVotes: -1, totalImages: -1 } },
      // Limit results
      { $limit: 50 }
    ]).toArray();

    // Get preview images for each gallery (just URLs, no personal data)
    for (const gallery of galleries) {
      // Handle both string and ObjectId userId formats
      const userIdStr = gallery.userId?.toString() || gallery.userId;
      
      const images = await db.collection('images')
        .find({ 
          $or: [
            { userId: userIdStr },
            { userId: gallery.userId }
          ],
          isActive: true 
        })
        .sort({ elo: -1 })
        .limit(4)
        .toArray();
      
      // Only return URL and elo, no other metadata
      gallery.previewImages = images.map(img => ({
        url: img.url,
        elo: img.elo
      }));
    }

    return res.status(200).json({
      success: true,
      galleries
    });
  } catch (error) {
    console.error('Error fetching galleries:', error);
    return res.status(500).json({ message: 'Failed to fetch galleries' });
  }
}
