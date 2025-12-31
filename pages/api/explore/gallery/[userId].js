import { connectToDatabase } from '../../../../config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  const { userId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const session = await getServerSession(req, res, authOptions);
    const currentUserId = session?.user?.id;
    const isOwnGallery = currentUserId === userId;

    // Get all models for this user
    const models = await db.collection('models')
      .find({ userId: userId, isActive: true })
      .sort({ name: 1 })
      .toArray();

    // Get images for each model
    for (const model of models) {
      const images = await db.collection('images')
        .find({ modelId: model._id.toString(), isActive: true })
        .sort({ elo: -1 })
        .toArray();
      
      // Only return safe image data (URL, elo)
      model.images = images.map(img => ({
        _id: img._id,
        url: img.url,
        elo: img.elo,
        wins: img.wins,
        losses: img.losses
      }));
    }

    // Strip private info for public view
    const publicModels = models.map(model => {
      if (isOwnGallery) {
        // Owner sees everything
        return model;
      } else {
        // Public only sees username and images
        return {
          _id: model._id,
          username: model.username,
          imageCount: model.imageCount || model.images?.length || 0,
          images: model.images
          // NO: name, instagram, onlyfans, twitter, description
        };
      }
    });

    // Get community rating stats
    const communityStats = await db.collection('community_ratings').aggregate([
      { $match: { galleryOwnerId: userId } },
      { $group: {
        _id: null,
        totalVotes: { $sum: 1 },
        avgScore: { $avg: '$score' },
        uniqueVoters: { $addToSet: '$voterId' }
      }}
    ]).toArray();

    const stats = communityStats[0] || { totalVotes: 0, avgScore: 0, uniqueVoters: [] };

    // Get first model username for gallery display name
    const galleryDisplayName = models[0]?.username 
      ? `@${models[0].username}` 
      : 'Gallery';

    return res.status(200).json({
      success: true,
      gallery: {
        userId,
        // Use model username as gallery name, not real user name
        galleryName: galleryDisplayName,
        models: publicModels,
        communityStats: {
          totalVotes: stats.totalVotes,
          avgScore: Math.round(stats.avgScore || 0),
          uniqueVoters: stats.uniqueVoters?.length || 0
        },
        isOwnGallery
      }
    });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return res.status(500).json({ message: 'Failed to fetch gallery' });
  }
}
