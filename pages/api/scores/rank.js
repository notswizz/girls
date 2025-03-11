import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../config';
import Image from '../../../models/Image';

export default async function handler(req, res) {
  // Handle GET request for model leaderboard
  if (req.method === 'GET') {
    try {
      const { db } = await connectToDatabase();
      
      // Query parameters
      const { limit = 20 } = req.query;
      const limitNum = parseInt(limit);
      
      // Get models sorted by ELO
      const models = await db.collection('models')
        .find({ isActive: true })
        .sort({ elo: -1 })
        .limit(limitNum)
        .toArray();
      
      // Return the models
      return res.status(200).json({ 
        success: true,
        models: models.map((model, index) => ({
          ...model,
          rank: index + 1,
          winRate: model.winRate || (model.wins && model.losses ? model.wins / (model.wins + model.losses) : 0)
        }))
      });
    } catch (error) {
      console.error('Error fetching model rankings:', error);
      return res.status(500).json({ error: 'Failed to fetch model rankings' });
    }
  }
  
  // Handle POST request for submitting rankings
  if (req.method === 'POST') {
    try {
      const { db } = await connectToDatabase();
      const { rankings, userId = 'anonymous' } = req.body;

      // Validate input
      if (!rankings || !Array.isArray(rankings) || rankings.length === 0) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          message: 'Rankings array is required' 
        });
      }

      // Process each ranking
      const results = [];
      
      for (let i = 0; i < rankings.length; i++) {
        const { imageId, rank } = rankings[i];
        
        if (!imageId || !rank || rank < 1 || rank > 3) {
          return res.status(400).json({ 
            error: 'Invalid ranking', 
            message: 'Each ranking must include imageId and rank (1-3)' 
          });
        }
        
        // Convert string ID to ObjectId
        let objectId;
        try {
          objectId = new ObjectId(imageId);
        } catch (e) {
          return res.status(400).json({ error: 'Invalid image ID format' });
        }

        // Find the image in the database
        const imageData = await db.collection('images').findOne({ _id: objectId });
        
        if (!imageData) {
          return res.status(404).json({ error: `Image with ID ${imageId} not found` });
        }

        // Create Image instance with found data
        const image = new Image({
          id: imageData._id,
          ...imageData
        });

        // Convert rank to score (1st place = 3 points, 2nd place = 2 points, 3rd place = 1 point)
        const score = 4 - rank; // 1->3, 2->2, 3->1
        
        // Add the new rating
        image.addRating(userId, score);

        // Update in database
        await db.collection('images').updateOne(
          { _id: objectId },
          { 
            $set: {
              ratings: image.ratings,
              totalScore: image.totalScore,
              averageScore: image.averageScore,
              timesRated: image.timesRated
            } 
          }
        );
        
        // If the image has a modelId, update the model's average score
        if (image.modelId) {
          try {
            // Get all images for this model
            const modelImages = await db
              .collection('images')
              .find({ modelId: image.modelId })
              .toArray();
            
            // Calculate the average score across all images
            const totalScores = modelImages.reduce((sum, img) => sum + (img.averageScore || 0), 0);
            const avgScore = modelImages.length > 0 ? totalScores / modelImages.length : 0;
            
            // Update the model's average score
            await db.collection('models').updateOne(
              { _id: new ObjectId(image.modelId) },
              { $set: { averageScore: avgScore } }
            );
          } catch (err) {
            console.error('Error updating model score:', err);
            // Continue even if model update fails
          }
        }

        results.push({
          imageId,
          rank,
          newScore: image.averageScore,
          totalRatings: image.timesRated
        });
      }

      res.status(200).json({ 
        message: 'Rankings submitted successfully',
        results
      });
    } catch (error) {
      console.error('Error processing rankings:', error);
      return res.status(500).json({ error: 'Failed to process rankings' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
} 