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
          // Add logging to trace request
          console.log('GET /api/models - Fetching models');
          
          const models = await db
            .collection('models')
            .find({ isActive: true })
            .sort({ name: 1 })
            .toArray();
          
          console.log(`Found ${models.length} models in database`);
            
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
            if (item && item._id) {
              modelIdToStats[item._id.toString()] = {
                totalImages: item.count,
                totalWins: item.totalWins,
                totalLosses: item.totalLosses,
                averageElo: item.avgElo,
                highestElo: item.highestElo,
                ratedImages: item.ratedImagesCount
              };
            }
          });
          
          // Add the image count to each model
          const modelsWithStats = models.map(model => {
            // Convert ObjectId to string for consistent comparison
            const modelIdStr = model._id.toString();
            const stats = modelIdToStats[modelIdStr] || { 
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
            
            // Ensure all required fields exist
            return { 
              ...model, 
              imageCount: stats.totalImages || 0,
              wins: stats.totalWins || 0,
              losses: stats.totalLosses || 0,
              winRate: winRate || 0,
              elo: stats.averageElo > 0 ? stats.averageElo : null,
              stats: stats
            };
          });
          
          console.log(`Returning ${modelsWithStats.length} models with stats`);
          return res.status(200).json({ 
            success: true, 
            models: modelsWithStats,
            timestamp: new Date().toISOString() // Add timestamp for cache validation
          });
        } catch (error) {
          console.error('Error fetching models:', error);
          return res.status(500).json({ success: false, message: 'Failed to fetch models' });
        }
        break;
        
      case 'POST':
        // Create a new model
        try {
          console.log('POST /api/models - Creating new model');
          const { name, username, description, instagram, twitter, onlyfans } = req.body;
          
          // Log request body
          console.log('Request body:', req.body);
          
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
          
          // Format username if provided, or generate a default one
          let formattedUsername = username || '';
          if (!formattedUsername && name) {
            // Generate a username based on the first 3 letters of the name + 3 random digits
            const namePrefix = name.slice(0, 3).toUpperCase();
            const randomDigits = Math.floor(100 + Math.random() * 900).toString();
            formattedUsername = namePrefix + randomDigits;
          }
          
          // Make sure username field isn't null or undefined
          formattedUsername = formattedUsername || '';
          
          const modelData = {
            name: name.trim(),
            username: formattedUsername,
            description: description || '',
            instagram: instagram || '',
            twitter: twitter || '',
            onlyfans: onlyfans || '',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            imageCount: 0,
            averageScore: null,
            wins: 0,
            losses: 0,
            winRate: 0,
            elo: 1200 // Starting ELO rating
          };
          
          console.log('Creating model with data:', modelData);
          const model = new Model(modelData);
          
          const result = await db.collection('models').insertOne(model.toDatabase());
          
          if (!result.acknowledged) {
            throw new Error('Failed to create model');
          }
          
          // Retrieve the created model to ensure all fields are present
          const createdModelFromDb = await db.collection('models').findOne({ _id: result.insertedId });
          
          if (!createdModelFromDb) {
            throw new Error('Model created but failed to retrieve it from the database');
          }
          
          // Return the full model
          console.log('Successfully created model:', createdModelFromDb);
          
          return res.status(201).json({ 
            success: true, 
            model: createdModelFromDb 
          });
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