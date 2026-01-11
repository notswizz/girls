import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../../config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { BASE_RATING } from '../../../../utils/eloCalculator';

/**
 * Get community (explore) ratings for a model's images
 * These are ratings from OTHER users voting on your public photos
 * Now uses proper ELO rating system
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
        elo: rating.elo || BASE_RATING,
        lastVotedAt: rating.lastVotedAt
      };
    }

    // Map images with community stats
    const imagesWithCommunityStats = images.map(img => {
      const imgId = img._id.toString();
      const communityStats = communityStatsMap[imgId] || { wins: 0, losses: 0, elo: BASE_RATING };
      const totalMatches = communityStats.wins + communityStats.losses;
      const winRate = totalMatches > 0 ? communityStats.wins / totalMatches : 0;

      return {
        _id: imgId,
        id: imgId,
        url: img.url,
        name: img.name || '',
        // Community stats - now using ELO
        wins: communityStats.wins,
        losses: communityStats.losses,
        totalMatches,
        winRate,
        elo: communityStats.elo,
        score: communityStats.elo, // For backwards compatibility, score = elo now
        lastVotedAt: communityStats.lastVotedAt
      };
    });

    // Calculate aggregate community stats for the model
    const totalWins = imagesWithCommunityStats.reduce((sum, img) => sum + img.wins, 0);
    const totalLosses = imagesWithCommunityStats.reduce((sum, img) => sum + img.losses, 0);
    const totalMatches = totalWins + totalLosses;
    const overallWinRate = totalMatches > 0 ? totalWins / totalMatches : 0;
    
    // Calculate average and top ELO for rated images only
    const ratedImages = imagesWithCommunityStats.filter(img => img.totalMatches > 0);
    const avgElo = ratedImages.length > 0 
      ? Math.round(ratedImages.reduce((sum, img) => sum + img.elo, 0) / ratedImages.length)
      : BASE_RATING;
    const topElo = ratedImages.length > 0
      ? Math.max(...ratedImages.map(img => img.elo))
      : BASE_RATING;

    return res.status(200).json({
      success: true,
      images: imagesWithCommunityStats,
      stats: {
        totalWins,
        totalLosses,
        totalMatches,
        winRate: overallWinRate,
        avgElo,
        topElo,
        topScore: topElo // backwards compatibility
      }
    });
  } catch (error) {
    console.error('Error fetching community stats:', error);
    return res.status(500).json({ error: 'Failed to fetch community stats' });
  }
}
