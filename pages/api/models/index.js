import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import Model from '../../../models/Model';

export default async function handler(req, res) {
  const { method } = req;

  try {
    const { db } = await connectToDatabase();
    
    // Get user session
    const session = await getServerSession(req, res, authOptions);

    switch (method) {
      case 'GET':
        // Fetch models
        try {
          // Add logging to trace request
          console.log('GET /api/models - Fetching models');
          
          // Build query - filter by user if logged in
          const query = { 
            $or: [{ isActive: true }, { isActive: { $exists: false } }],
            // Exclude any model named "AI" (legacy AI creations model)
            name: { $not: { $regex: /^AI$/i } }
          };
          
          // If user is logged in, only show their models
          if (session?.user?.id) {
            query.userId = session.user.id;
            console.log(`Filtering models for user: ${session.user.id}`);
          } else {
            // If not logged in, don't return any models (user-specific data)
            return res.status(200).json({ 
              success: true, 
              models: [],
              message: 'Login to see your models'
            });
          }
          
          // Find all models belonging to the user (excluding "AI" model)
          const models = await db
            .collection('models')
            .find(query)
            .sort({ name: 1 })
            .toArray();
          
          console.log(`Found ${models.length} models in database`);
          
          // For any model without isActive field, update it to set isActive to true
          const modelsToUpdate = models.filter(m => m.isActive === undefined);
          if (modelsToUpdate.length > 0) {
            console.log(`Updating ${modelsToUpdate.length} models to set isActive=true`);
            const updatePromises = modelsToUpdate.map(model => 
              db.collection('models').updateOne(
                { _id: model._id },
                { $set: { isActive: true } }
              )
            );
            await Promise.all(updatePromises);
          }
          
          // Get the count of images for each model (only user's images)
          const imageQuery = { isActive: true };
          if (session?.user?.id) {
            imageQuery.userId = session.user.id;
          }
          const modelImagesCount = await db.collection('images').aggregate([
            { $match: imageQuery },
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
                },
                imageIds: { $push: { $toString: '$_id' } }
              } 
            }
          ]).toArray();
          
          // Get all image IDs to fetch community stats
          const allImageIds = modelImagesCount.flatMap(item => item.imageIds || []);
          
          // Fetch community ratings for all images at once
          const communityRatings = await db.collection('community_ratings')
            .find({ imageId: { $in: allImageIds } })
            .toArray();
          
          // Create a map of imageId -> community stats
          const imageIdToCommunityStats = {};
          for (const rating of communityRatings) {
            imageIdToCommunityStats[rating.imageId] = {
              wins: rating.wins || 0,
              losses: rating.losses || 0,
              score: rating.score || 0
            };
          }
          
          // Create a map of model ID to image count
          const modelIdToStats = {};
          modelImagesCount.forEach(item => {
            if (item && item._id) {
              // Aggregate community stats for this model's images
              let communityWins = 0;
              let communityLosses = 0;
              let topCommunityScore = 0;
              
              (item.imageIds || []).forEach(imgId => {
                const cStats = imageIdToCommunityStats[imgId];
                if (cStats) {
                  communityWins += cStats.wins;
                  communityLosses += cStats.losses;
                  if (cStats.score > topCommunityScore) {
                    topCommunityScore = cStats.score;
                  }
                }
              });
              
              modelIdToStats[item._id.toString()] = {
                totalImages: item.count,
                totalWins: item.totalWins,
                totalLosses: item.totalLosses,
                averageElo: item.avgElo,
                highestElo: item.highestElo,
                ratedImages: item.ratedImagesCount,
                // Community stats
                communityWins,
                communityLosses,
                topCommunityScore
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
              ratedImages: 0,
              communityWins: 0,
              communityLosses: 0,
              topCommunityScore: 0
            };
            
            // Calculate win rate (personal/gallery)
            const totalMatches = stats.totalWins + stats.totalLosses;
            const winRate = totalMatches > 0 ? stats.totalWins / totalMatches : 0;
            
            // Calculate community win rate
            const communityMatches = stats.communityWins + stats.communityLosses;
            const communityWinRate = communityMatches > 0 ? stats.communityWins / communityMatches : 0;
            
            // Ensure all required fields exist
            return { 
              ...model, 
              imageCount: stats.totalImages || 0,
              wins: stats.totalWins || 0,
              losses: stats.totalLosses || 0,
              winRate: winRate || 0,
              elo: stats.averageElo > 0 ? stats.averageElo : null,
              // Community stats
              communityWins: stats.communityWins || 0,
              communityLosses: stats.communityLosses || 0,
              communityWinRate: communityWinRate || 0,
              topCommunityScore: stats.topCommunityScore || 0,
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
          // Require authentication to create models
          if (!session || !session.user) {
            return res.status(401).json({ success: false, message: 'You must be logged in to create models' });
          }
          
          const userId = session.user.id;
          
          console.log('POST /api/models - Creating new model for user:', userId);
          const { name, username, description, instagram, twitter, onlyfans } = req.body;
          
          // Log request body
          console.log('Request body:', req.body);
          
          if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, message: 'Model name is required' });
          }
          
          // Check if a model with this name already exists FOR THIS USER
          const existingModel = await db.collection('models').findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            userId: userId,
            isActive: true
          });
          
          if (existingModel) {
            return res.status(400).json({ success: false, message: 'You already have a model with this name' });
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
            userId: userId, // Associate with the creating user
            isActive: true,
            isPublic: req.body.isPublic !== false, // Default to public
            createdAt: new Date(),
            updatedAt: new Date(),
            imageCount: 0,
            averageScore: null,
            wins: 0,
            losses: 0,
            winRate: 0,
            elo: 1500 // Starting ELO rating - higher base for more dynamic range
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