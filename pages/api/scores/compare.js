import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../config';
import { calculateNewRatings } from '../../../utils/eloCalculator';

export default async function handler(req, res) {
  // Only accept POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { db } = await connectToDatabase();
    
    // Get the winnerId and loserId from the request body
    const { winnerId, loserId } = req.body;
    
    // Validate input
    if (!winnerId || !loserId) {
      return res.status(400).json({ error: 'Both winnerId and loserId are required' });
    }
    
    // Validate IDs and get images
    let winnerObjectId, loserObjectId;
    try {
      winnerObjectId = new ObjectId(winnerId);
      loserObjectId = new ObjectId(loserId);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid image ID format' });
    }
    
    // Get the images from the database
    const winnerImage = await db.collection('images').findOne({ _id: winnerObjectId, isActive: true });
    const loserImage = await db.collection('images').findOne({ _id: loserObjectId, isActive: true });
    
    if (!winnerImage || !loserImage) {
      return res.status(404).json({ error: 'One or both images not found' });
    }
    
    // Calculate new ELO ratings
    const newRatings = calculateNewRatings(winnerImage, loserImage);
    
    // Record match results and update ELO ratings
    // Winner updates
    await db.collection('images').updateOne(
      { _id: winnerObjectId },
      { 
        $inc: { 
          timesRated: 1,
          wins: 1 
        },
        $set: { 
          elo: newRatings.winnerNewRating,
          winRate: (winnerImage.wins + 1) / (winnerImage.wins + winnerImage.losses + 1)
        },
        $push: { 
          lastOpponents: { 
            id: loserImage._id.toString(),
            modelId: loserImage.modelId,
            elo: loserImage.elo,
            result: 'win',
            timestamp: new Date()
          } 
        }
      }
    );
    
    // Loser updates
    await db.collection('images').updateOne(
      { _id: loserObjectId },
      { 
        $inc: { 
          timesRated: 1,
          losses: 1 
        },
        $set: { 
          elo: newRatings.loserNewRating,
          winRate: loserImage.wins / (loserImage.wins + loserImage.losses + 1)
        },
        $push: { 
          lastOpponents: { 
            id: winnerImage._id.toString(),
            modelId: winnerImage.modelId,
            elo: winnerImage.elo,
            result: 'loss',
            timestamp: new Date()
          } 
        }
      }
    );
    
    // Now update the model stats
    if (winnerImage.modelId) {
      await updateModelStats(db, winnerImage.modelId);
    }
    
    if (loserImage.modelId && loserImage.modelId !== winnerImage.modelId) {
      await updateModelStats(db, loserImage.modelId);
    }
    
    res.status(200).json({
      message: 'Comparison recorded successfully',
      winner: {
        id: winnerImage._id,
        modelId: winnerImage.modelId,
        modelName: winnerImage.modelName,
        newElo: newRatings.winnerNewRating,
        eloDelta: newRatings.winnerDelta
      },
      loser: {
        id: loserImage._id,
        modelId: loserImage.modelId,
        modelName: loserImage.modelName,
        newElo: newRatings.loserNewRating,
        eloDelta: newRatings.loserDelta
      }
    });
  } catch (error) {
    console.error('Error recording comparison:', error);
    res.status(500).json({ error: 'Failed to record comparison' });
  }
}

// Helper function to update model stats
async function updateModelStats(db, modelId) {
  try {
    // Calculate updated model stats
    const modelStats = await db.collection('images').aggregate([
      { $match: { modelId: modelId, isActive: true } },
      { $group: { 
        _id: "$modelId", 
        totalWins: { $sum: "$wins" },
        totalLosses: { $sum: "$losses" },
        averageElo: { $avg: "$elo" }
      }}
    ]).toArray();
    
    if (modelStats.length > 0) {
      const stats = modelStats[0];
      const totalMatches = stats.totalWins + stats.totalLosses;
      const winRate = totalMatches > 0 ? stats.totalWins / totalMatches : 0;
      
      await db.collection('models').updateOne(
        { _id: new ObjectId(modelId) },
        { $set: { 
          wins: stats.totalWins,
          losses: stats.totalLosses,
          winRate: winRate,
          elo: stats.averageElo
        }}
      );
    }
  } catch (error) {
    console.error('Error updating model stats:', error);
  }
} 