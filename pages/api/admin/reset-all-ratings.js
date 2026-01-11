import { connectToDatabase } from '../../../lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

/**
 * NUCLEAR RESET: Wipes all ratings back to base
 * - Resets all image ELOs to 1500
 * - Clears all wins/losses
 * - Deletes all comparison history
 * - Resets all model stats
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Allow admin users OR secret key for CLI access
  const { secret } = req.body || {};
  const session = await getServerSession(req, res, authOptions);
  
  const isAdmin = session?.user?.isAdmin;
  const hasSecret = secret === 'reset-now-2026';
  
  if (!isAdmin && !hasSecret) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const { db } = await connectToDatabase();
    
    const BASE_ELO = 1500;
    
    console.log('🔥 NUCLEAR RESET: Wiping all ratings...');

    // 1. Reset ALL images to base
    const imageResult = await db.collection('images').updateMany(
      {},
      {
        $set: {
          elo: BASE_ELO,
          wins: 0,
          losses: 0,
          winRate: 0,
          timesRated: 0,
          lastOpponents: []
        }
      }
    );
    console.log(`Reset ${imageResult.modifiedCount} images`);

    // 2. Reset ALL models to base
    const modelResult = await db.collection('models').updateMany(
      {},
      {
        $set: {
          elo: BASE_ELO,
          wins: 0,
          losses: 0,
          winRate: 0,
          eloHistory: []
        }
      }
    );
    console.log(`Reset ${modelResult.modifiedCount} models`);

    // 3. Delete all comparisons/votes
    const comparisonsResult = await db.collection('comparisons').deleteMany({});
    console.log(`Deleted ${comparisonsResult.deletedCount} comparisons`);

    // 4. Delete community votes if they exist
    let communityVotesDeleted = 0;
    try {
      const communityResult = await db.collection('community_votes').deleteMany({});
      communityVotesDeleted = communityResult.deletedCount;
      console.log(`Deleted ${communityVotesDeleted} community votes`);
    } catch (e) {
      // Collection might not exist
    }

    // 5. Reset community ratings (now with ELO)
    let communityRatingsDeleted = 0;
    try {
      const ratingsResult = await db.collection('community_ratings').deleteMany({});
      communityRatingsDeleted = ratingsResult.deletedCount;
      console.log(`Deleted ${communityRatingsDeleted} community ratings`);
    } catch (e) {
      // Collection might not exist
    }
    
    // 6. Reset user rating counts
    await db.collection('users').updateMany(
      {},
      {
        $set: {
          ratingsCount: 0,
          communityRatingsCount: 0
        }
      }
    );
    console.log('Reset user rating counts');

    console.log('✅ NUCLEAR RESET COMPLETE');

    return res.status(200).json({
      success: true,
      message: 'All ratings reset to base',
      results: {
        imagesReset: imageResult.modifiedCount,
        modelsReset: modelResult.modifiedCount,
        comparisonsDeleted: comparisonsResult.deletedCount,
        communityVotesDeleted,
        communityRatingsDeleted,
        newBaseElo: BASE_ELO
      }
    });

  } catch (error) {
    console.error('Reset error:', error);
    return res.status(500).json({ error: error.message });
  }
}

