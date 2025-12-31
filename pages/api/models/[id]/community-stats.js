import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../../config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

/**
 * Get community (explore) ratings for a model's images
 * These are ratings from OTHER users voting on your public photos
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { db } = await connectToDatabase();
    const { id } = req.query;
    
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Must be logged in' });
    }

    // Validate model ID
    let modelId;
    try {
      modelId = new ObjectId(id);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid model ID format' });
    }

    // Get model and verify ownership
    const model = await db.collection('models').findOne({
      _id: modelId,
      userId: session.user.id
    });

    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // Get all images for this model
    const images = await db.collection('images')
      .find({
        $or: [
          { modelId: modelId },
          { modelId: id }
        ],
        userId: session.user.id,
        isActive: true
      })
      .toArray();

    const imageIds = images.map(img => img._id.toString());

    // Get community ratings for these images
    const communityRatings = await db.collection('community_ratings')
      .find({
        imageId: { $in: imageIds }
      })
      .toArray();

    // Create a map of imageId -> community stats
    const communityStatsMap = {};
    for (const rating of communityRatings) {
      communityStatsMap[rating.imageId] = {
        wins: rating.wins || 0,
        losses: rating.losses || 0,
        score: rating.score || 0,
        lastVotedAt: rating.lastVotedAt
      };
    }

    // Map images with community stats
    const imagesWithCommunityStats = images.map(img => {
      const imgId = img._id.toString();
      const communityStats = communityStatsMap[imgId] || { wins: 0, losses: 0, score: 0 };
      const totalMatches = communityStats.wins + communityStats.losses;
      const winRate = totalMatches > 0 ? communityStats.wins / totalMatches : 0;
      
      // Calculate Wilson score for community ratings
      const wilsonScore = calculateWilsonScore(communityStats.wins, communityStats.losses);
      const compositeScore = Math.round(wilsonScore * 1000);

      return {
        _id: imgId,
        id: imgId,
        url: img.url,
        name: img.name || '',
        // Community stats
        wins: communityStats.wins,
        losses: communityStats.losses,
        totalMatches,
        winRate,
        score: compositeScore,
        communityScore: communityStats.score,
        lastVotedAt: communityStats.lastVotedAt
      };
    });

    // Calculate aggregate community stats for the model
    const totalWins = imagesWithCommunityStats.reduce((sum, img) => sum + img.wins, 0);
    const totalLosses = imagesWithCommunityStats.reduce((sum, img) => sum + img.losses, 0);
    const totalMatches = totalWins + totalLosses;
    const overallWinRate = totalMatches > 0 ? totalWins / totalMatches : 0;
    const topScore = Math.max(0, ...imagesWithCommunityStats.map(img => img.score));

    return res.status(200).json({
      success: true,
      images: imagesWithCommunityStats,
      stats: {
        totalWins,
        totalLosses,
        totalMatches,
        winRate: overallWinRate,
        topScore
      }
    });
  } catch (error) {
    console.error('Error fetching community stats:', error);
    return res.status(500).json({ error: 'Failed to fetch community stats' });
  }
}

function calculateWilsonScore(wins, losses, z = 1.96) {
  const n = wins + losses;
  if (n === 0) return 0;
  
  const p = wins / n;
  const denominator = 1 + (z * z) / n;
  const centre = p + (z * z) / (2 * n);
  const spread = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
  
  return (centre - spread) / denominator;
}

