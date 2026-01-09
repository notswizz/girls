import { connectToDatabase } from '../../../config';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();

    // Get counts in parallel
    const [
      totalPhotos,
      totalModels,
      totalUsers,
      totalCreations,
      totalVotes,
      tokenStats,
    ] = await Promise.all([
      // Total photos
      db.collection('images').countDocuments({ isActive: true }),
      
      // Total models
      db.collection('models').countDocuments({}),
      
      // Total users
      db.collection('users').countDocuments({}),
      
      // Total AI creations
      db.collection('ai_creations').countDocuments({}),
      
      // Total votes (from community_ratings)
      db.collection('community_ratings').countDocuments({}),
      
      // Token stats - sum up all tokens
      db.collection('users').aggregate([
        {
          $group: {
            _id: null,
            totalTokens: { $sum: { $ifNull: ['$tokens', 0] } },
            totalEarnedFromWins: { $sum: { $ifNull: ['$tokensFromWins', 0] } },
            totalEarnedFromReferrals: { $sum: { $ifNull: ['$referralTokensEarned', 0] } },
            totalSpent: { $sum: { $ifNull: ['$tokensSpent', 0] } },
          }
        }
      ]).toArray(),
    ]);

    const tokens = tokenStats[0] || {
      totalTokens: 0,
      totalEarnedFromWins: 0,
      totalEarnedFromReferrals: 0,
      totalSpent: 0,
    };

    // Calculate total tokens in circulation (current balances)
    // Plus total ever earned for context
    const totalTokensInCirculation = tokens.totalTokens;
    const totalTokensEverEarned = tokens.totalEarnedFromWins + tokens.totalEarnedFromReferrals;

    return res.status(200).json({
      success: true,
      stats: {
        photos: totalPhotos,
        models: totalModels,
        users: totalUsers,
        creations: totalCreations,
        votes: totalVotes,
        tokensInCirculation: totalTokensInCirculation,
        tokensEarned: totalTokensEverEarned,
        tokensSpent: tokens.totalSpent,
      }
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch stats' 
    });
  }
}

