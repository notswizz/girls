import { connectToDatabase } from '../../../lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

/**
 * Recalibrate all ELO ratings to create more dynamic spread
 * 
 * This migration:
 * 1. Shifts base from 1200 to 1500
 * 2. Expands rating range based on win rate and matches
 * 3. Creates real differentiation between top performers and losers
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Only allow admins
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const { db } = await connectToDatabase();
    
    // Get all images with rating history
    const images = await db.collection('images').find({
      isActive: true
    }).toArray();

    console.log(`Recalibrating ${images.length} images...`);

    const OLD_BASE = 1200;
    const NEW_BASE = 1500;
    const results = { updated: 0, unchanged: 0 };

    for (const image of images) {
      const wins = image.wins || 0;
      const losses = image.losses || 0;
      const totalMatches = wins + losses;
      const currentElo = image.elo || OLD_BASE;
      
      if (totalMatches === 0) {
        // No matches - just set to new base
        if (currentElo !== NEW_BASE) {
          await db.collection('images').updateOne(
            { _id: image._id },
            { $set: { elo: NEW_BASE } }
          );
          results.updated++;
        } else {
          results.unchanged++;
        }
        continue;
      }

      // Calculate win rate
      const winRate = wins / totalMatches;
      
      // Calculate how much to expand the rating based on performance
      // Win rate > 0.5 goes UP, < 0.5 goes DOWN
      // More matches = more confident adjustment
      const confidenceMultiplier = Math.min(1, totalMatches / 20);
      
      // Calculate performance-based adjustment
      // winRate 1.0 -> +400, winRate 0.5 -> 0, winRate 0.0 -> -400
      const performanceBonus = (winRate - 0.5) * 800 * confidenceMultiplier;
      
      // Shift from old base to new base, then apply performance expansion
      let newElo = NEW_BASE + performanceBonus;
      
      // If they had a notable ELO already (different from base), incorporate that info
      const oldDelta = currentElo - OLD_BASE;
      if (Math.abs(oldDelta) > 10) {
        // Blend old deviation with new calculation, trusting match history more
        newElo = NEW_BASE + (oldDelta * 0.3) + (performanceBonus * 0.7);
      }
      
      // Extra boost for high performers
      if (winRate > 0.7 && totalMatches >= 10) {
        newElo += 100 * (winRate - 0.7) * 3; // Up to +90 bonus
      }
      
      // Extra penalty for poor performers
      if (winRate < 0.3 && totalMatches >= 10) {
        newElo -= 100 * (0.3 - winRate) * 3; // Up to -90 penalty
      }
      
      // Clamp to valid range
      newElo = Math.max(600, Math.min(2800, Math.round(newElo)));
      
      // Only update if changed
      if (newElo !== currentElo) {
        await db.collection('images').updateOne(
          { _id: image._id },
          { $set: { elo: newElo } }
        );
        results.updated++;
        console.log(`Image ${image._id}: ${currentElo} -> ${newElo} (${wins}W/${losses}L = ${(winRate * 100).toFixed(1)}%)`);
      } else {
        results.unchanged++;
      }
    }

    // Also update model ELOs based on their images
    const models = await db.collection('models').find({ isActive: true }).toArray();
    
    for (const model of models) {
      const modelImages = await db.collection('images').find({
        modelId: model._id,
        isActive: true
      }).toArray();
      
      if (modelImages.length === 0) {
        await db.collection('models').updateOne(
          { _id: model._id },
          { $set: { elo: NEW_BASE } }
        );
        continue;
      }
      
      // Calculate weighted average (top images count more)
      const sortedImages = modelImages.sort((a, b) => (b.elo || NEW_BASE) - (a.elo || NEW_BASE));
      const topImages = sortedImages.slice(0, Math.min(5, sortedImages.length));
      
      const weights = topImages.map((_, i) => Math.pow(0.7, i));
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      const weightedElo = topImages.reduce((sum, img, i) => {
        return sum + (img.elo || NEW_BASE) * weights[i];
      }, 0) / totalWeight;
      
      // Calculate aggregate stats
      const totalWins = modelImages.reduce((sum, img) => sum + (img.wins || 0), 0);
      const totalLosses = modelImages.reduce((sum, img) => sum + (img.losses || 0), 0);
      const winRate = (totalWins + totalLosses) > 0 ? totalWins / (totalWins + totalLosses) : 0;
      
      await db.collection('models').updateOne(
        { _id: model._id },
        { 
          $set: { 
            elo: Math.round(weightedElo),
            wins: totalWins,
            losses: totalLosses,
            winRate: winRate
          } 
        }
      );
    }

    // Get stats for confirmation
    const newStats = await db.collection('images').aggregate([
      { $match: { isActive: true } },
      { $group: {
        _id: null,
        minElo: { $min: '$elo' },
        maxElo: { $max: '$elo' },
        avgElo: { $avg: '$elo' },
        count: { $sum: 1 }
      }}
    ]).toArray();

    return res.status(200).json({
      success: true,
      message: 'Ratings recalibrated successfully',
      results,
      stats: newStats[0] || { minElo: 1500, maxElo: 1500, avgElo: 1500, count: 0 }
    });

  } catch (error) {
    console.error('Recalibration error:', error);
    return res.status(500).json({ error: error.message });
  }
}

