import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../../config';
import Model from '../../../../models/Model';

export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  try {
    const { db } = await connectToDatabase();
    
    // Validate ObjectId
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid model ID format' });
    }

    switch (method) {
      // Get a single model
      case 'GET':
        try {
          console.log(`GET /api/models/${id} - Fetching single model`);
          
          const model = await db.collection('models').findOne({ _id: objectId });
          
          if (!model) {
            console.log(`Model with ID ${id} not found`);
            return res.status(404).json({ success: false, error: 'Model not found' });
          }
          
          console.log(`Found model: ${model.name} (${model._id})`);
          
          // Calculate additional stats
          const stats = await db.collection('images').aggregate([
            { $match: { modelId: id, isActive: true } },
            { $group: { 
              _id: "$modelId", 
              totalImages: { $sum: 1 },
              ratedImages: { $sum: { $cond: [{ $or: [{ $gt: ["$wins", 0] }, { $gt: ["$losses", 0] }] }, 1, 0] } },
              averageElo: { $avg: "$elo" },
              highestElo: { $max: "$elo" },
              totalWins: { $sum: { $ifNull: ["$wins", 0] } },
              totalLosses: { $sum: { $ifNull: ["$losses", 0] } }
            }}
          ]).toArray();
          
          // Calculate model stats
          const modelStats = stats.length > 0 ? stats[0] : {
            totalImages: 0,
            ratedImages: 0,
            averageElo: 1200,
            highestElo: 1200,
            totalWins: 0,
            totalLosses: 0
          };
          
          // Calculate win rate
          const totalMatches = modelStats.totalWins + modelStats.totalLosses;
          const winRate = totalMatches > 0 ? modelStats.totalWins / totalMatches : 0;
          
          // Construct the full model with stats
          const extendedModel = {
            ...model,
            imageCount: modelStats.totalImages || 0,
            wins: modelStats.totalWins || 0,
            losses: modelStats.totalLosses || 0,
            winRate: winRate || 0,
            elo: modelStats.averageElo > 0 ? modelStats.averageElo : 1200,
            stats: modelStats
          };
          
          console.log(`Returning model with stats:`, {
            id: extendedModel._id,
            name: extendedModel.name,
            imageCount: extendedModel.imageCount
          });
          
          return res.status(200).json({ 
            success: true, 
            model: extendedModel,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error(`Error fetching model with ID ${id}:`, error);
          return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
        break;
        
      // Update a model
      case 'PUT':
        try {
          const { id } = req.query;
          
          if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid model ID format' });
          }
          
          const { name, username, description, instagram, twitter, onlyfans } = req.body;
          
          // Validate required fields
          if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, message: 'Model name is required' });
          }
          
          if (!username || username.trim() === '') {
            return res.status(400).json({ success: false, message: 'Username is required' });
          }
          
          // Check if another model with this name exists (excluding this model)
          const existingModel = await db.collection('models').findOne({ 
            _id: { $ne: new ObjectId(id) },
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            isActive: true
          });
          
          if (existingModel) {
            return res.status(400).json({ success: false, message: 'Another model with this name already exists' });
          }
          
          // Get the current model to check if username has changed
          const currentModel = await db.collection('models').findOne({ _id: new ObjectId(id) });
          const usernameChanged = currentModel && currentModel.username !== username;
          
          // Update the model
          const result = await db.collection('models').updateOne(
            { _id: new ObjectId(id) },
            { 
              $set: { 
                name,
                username,
                description: description || '',
                instagram: instagram || '',
                twitter: twitter || '',
                onlyfans: onlyfans || '',
                updatedAt: new Date()
              } 
            }
          );
          
          if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Model not found' });
          }
          
          // If username was changed, update all associated images
          if (usernameChanged) {
            const imageUpdateResult = await db.collection('images').updateMany(
              { modelId: new ObjectId(id) },
              { $set: { modelUsername: username } }
            );
            
            console.log(`Updated modelUsername for ${imageUpdateResult.modifiedCount} images`);
          }
          
          // If model name was changed, update modelName in all associated images
          if (currentModel && currentModel.name !== name) {
            const imageNameUpdateResult = await db.collection('images').updateMany(
              { modelId: new ObjectId(id) },
              { $set: { modelName: name } }
            );
            
            console.log(`Updated modelName for ${imageNameUpdateResult.modifiedCount} images`);
          }
          
          // Get the updated model
          const updatedModel = await db.collection('models').findOne({ _id: new ObjectId(id) });
          
          return res.status(200).json({ success: true, model: updatedModel });
        } catch (error) {
          console.error('Error updating model:', error);
          return res.status(500).json({ success: false, message: 'Failed to update model' });
        }
        break;
        
      // Delete a model
      case 'DELETE':
        // Check if model exists
        const modelToDelete = await db.collection('models').findOne({ _id: objectId });
        if (!modelToDelete) {
          return res.status(404).json({ error: 'Model not found' });
        }
        
        // Start a session for transaction
        const session = db.client.startSession();
        
        try {
          session.startTransaction();
          
          // Soft delete the model
          const deleteResult = await db.collection('models').updateOne(
            { _id: objectId },
            { $set: { isActive: false, deletedAt: new Date() } },
            { session }
          );
          
          // Soft delete all associated images
          await db.collection('images').updateMany(
            { modelId: id },
            { $set: { isActive: false, deletedAt: new Date() } },
            { session }
          );
          
          await session.commitTransaction();
          
          res.status(200).json({ 
            message: 'Model and associated images deleted successfully'
          });
        } catch (error) {
          await session.abortTransaction();
          throw error;
        } finally {
          session.endSession();
        }
        break;
        
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error(`Error handling model ${method} request:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
} 