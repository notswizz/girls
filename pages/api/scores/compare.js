import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../config';
import Image from '../../../models/Image';

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
    
    // Update the winner's score
    const winnerResult = await db.collection('images').updateOne(
      { _id: winnerObjectId },
      { 
        $inc: { 
          timesRated: 1,
          winCount: 1 
        },
        $set: { 
          averageScore: ((winnerImage.averageScore || 0) * (winnerImage.timesRated || 0) + 1) / ((winnerImage.timesRated || 0) + 1)
        }
      }
    );
    
    // Update the loser's score
    const loserResult = await db.collection('images').updateOne(
      { _id: loserObjectId },
      { 
        $inc: { 
          timesRated: 1,
          loseCount: 1 
        },
        $set: { 
          averageScore: ((loserImage.averageScore || 0) * (loserImage.timesRated || 0)) / ((loserImage.timesRated || 0) + 1)
        }
      }
    );
    
    // Now update the model scores
    if (winnerImage.modelId) {
      // Calculate updated model average score
      const winnerModelStats = await db.collection('images').aggregate([
        { $match: { modelId: winnerImage.modelId, isActive: true } },
        { $group: { 
          _id: "$modelId", 
          averageScore: { $avg: "$averageScore" } 
        }}
      ]).toArray();
      
      if (winnerModelStats.length > 0) {
        await db.collection('models').updateOne(
          { _id: new ObjectId(winnerImage.modelId) },
          { $set: { averageScore: winnerModelStats[0].averageScore } }
        );
      }
    }
    
    if (loserImage.modelId && loserImage.modelId !== winnerImage.modelId) {
      // Calculate updated model average score
      const loserModelStats = await db.collection('images').aggregate([
        { $match: { modelId: loserImage.modelId, isActive: true } },
        { $group: { 
          _id: "$modelId", 
          averageScore: { $avg: "$averageScore" } 
        }}
      ]).toArray();
      
      if (loserModelStats.length > 0) {
        await db.collection('models').updateOne(
          { _id: new ObjectId(loserImage.modelId) },
          { $set: { averageScore: loserModelStats[0].averageScore } }
        );
      }
    }
    
    res.status(200).json({
      message: 'Comparison recorded successfully',
      winner: {
        id: winnerImage._id,
        modelId: winnerImage.modelId,
        modelName: winnerImage.modelName
      },
      loser: {
        id: loserImage._id,
        modelId: loserImage.modelId,
        modelName: loserImage.modelName
      }
    });
  } catch (error) {
    console.error('Error recording comparison:', error);
    res.status(500).json({ error: 'Failed to record comparison' });
  }
} 