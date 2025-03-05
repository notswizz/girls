import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../config';
import Model from '../../../models/Model';

export default async function handler(req, res) {
  const { method } = req;

  try {
    const { db } = await connectToDatabase();

    switch (method) {
      case 'GET':
        // Fetch models
        try {
          const models = await db
            .collection('models')
            .find({ isActive: true })
            .sort({ name: 1 })
            .toArray();
            
          // Get the count of images for each model
          const modelImagesCount = await db.collection('images').aggregate([
            { $match: { isActive: true } },
            { $group: { 
                _id: '$modelId', 
                count: { $sum: 1 },
                totalWins: { $sum: { $ifNull: ['$wins', 0] } },
                totalLosses: { $sum: { $ifNull: ['$losses', 0] } },
                avgElo: { $avg: { $ifNull: ['$elo', 0] } },
                highestElo: { $max: { $ifNull: ['$elo', 0] } },
                ratedImagesCount: { 
                  $sum: { 
                    $cond: [
                      { $or: [
                        { $gt: [{ $ifNull: ['$wins', 0] }, 0] },
                        { $gt: [{ $ifNull: ['$losses', 0] }, 0] }
                      ]},
                      1,
                      0
                    ]
                  }
                }
              } 
            }
          ]).toArray();
          
          // Create a map of model ID to image count
          const modelIdToStats = {};
          modelImagesCount.forEach(item => {
            modelIdToStats[item._id] = {
              totalImages: item.count,
              totalWins: item.totalWins,
              totalLosses: item.totalLosses,
              averageElo: item.avgElo,
              highestElo: item.highestElo,
              ratedImages: item.ratedImagesCount
            };
          });
          
          // Add the image count to each model
          const modelsWithStats = models.map(model => {
            const stats = modelIdToStats[model._id] || { 
              totalImages: 0, 
              totalWins: 0, 
              totalLosses: 0,
              averageElo: 0,
              highestElo: 0,
              ratedImages: 0
            };
            
            // Calculate win rate
            const totalMatches = stats.totalWins + stats.totalLosses;
            const winRate = totalMatches > 0 ? stats.totalWins / totalMatches : 0;
            
            return { 
              ...model, 
              imageCount: stats.totalImages,
              wins: stats.totalWins,
              losses: stats.totalLosses,
              winRate: winRate,
              elo: stats.averageElo > 0 ? stats.averageElo : null,
              stats: stats
            };
          });
          
          return res.status(200).json({ success: true, models: modelsWithStats });
        } catch (error) {
          console.error('Error fetching models:', error);
          return res.status(500).json({ success: false, message: 'Failed to fetch models' });
        }
        break;
        
      case 'POST':
        // Create a new model
        try {
          const { name, description, instagram, twitter, onlyfans } = req.body;
          
          if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, message: 'Model name is required' });
          }
          
          // Check if a model with this name already exists
          const existingModel = await db.collection('models').findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            isActive: true
          });
          
          if (existingModel) {
            return res.status(400).json({ success: false, message: 'A model with this name already exists' });
          }
          
          const model = new Model({
            name,
            description: description || '',
            instagram: instagram || '',
            twitter: twitter || '',
            onlyfans: onlyfans || '',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          const result = await db.collection('models').insertOne(model.toDatabase());
          
          if (!result.acknowledged) {
            throw new Error('Failed to create model');
          }
          
          return res.status(201).json({ success: true, model: { ...model, _id: result.insertedId } });
        } catch (error) {
          console.error('Error creating model:', error);
          return res.status(500).json({ success: false, message: 'Failed to create model' });
        }
        break;
        
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
} 