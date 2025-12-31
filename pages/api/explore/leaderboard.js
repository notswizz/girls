import { connectToDatabase } from '../../../config';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();

    // Get community leaderboard - galleries ranked by community votes
    const leaderboard = await db.collection('community_ratings').aggregate([
      // Group by gallery owner
      { $group: {
        _id: '$galleryOwnerId',
        totalWins: { $sum: '$wins' },
        totalLosses: { $sum: '$losses' },
        totalScore: { $sum: '$score' },
        imagesRated: { $sum: 1 }
      }},
      // Calculate win rate
      { $addFields: {
        totalVotes: { $add: ['$totalWins', '$totalLosses'] },
        winRate: {
          $cond: {
            if: { $gt: [{ $add: ['$totalWins', '$totalLosses'] }, 0] },
            then: { $divide: ['$totalWins', { $add: ['$totalWins', '$totalLosses'] }] },
            else: 0
          }
        }
      }},
      // Only include galleries with at least 5 votes
      { $match: { totalVotes: { $gte: 5 } } },
      // Lookup first model to get username for display (NOT real user name)
      { $lookup: {
        from: 'models',
        let: { odid: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$userId', { $toString: '$$odid' }] }, isActive: true } },
          { $sort: { createdAt: 1 } },
          { $limit: 1 }
        ],
        as: 'firstModel'
      }},
      // Use model username as gallery name
      { $addFields: {
        galleryName: { 
          $concat: [
            '@', 
            { $ifNull: [{ $arrayElemAt: ['$firstModel.username', 0] }, 'gallery'] }
          ]
        }
      }},
      // Get preview images
      { $lookup: {
        from: 'images',
        let: { odid: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$userId', { $toString: '$$odid' }] }, isActive: true } },
          { $sort: { elo: -1 } },
          { $limit: 1 }
        ],
        as: 'topImage'
      }},
      { $addFields: {
        previewUrl: { $arrayElemAt: ['$topImage.url', 0] }
      }},
      // Sort by score
      { $sort: { totalScore: -1 } },
      // Limit
      { $limit: 50 },
      // Clean up output - NO real names
      { $project: {
        userId: '$_id',
        galleryName: 1,
        totalWins: 1,
        totalLosses: 1,
        totalScore: 1,
        totalVotes: 1,
        winRate: 1,
        imagesRated: 1,
        previewUrl: 1
      }}
    ]).toArray();

    return res.status(200).json({
      success: true,
      leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
}
