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
        const model = await db.collection('models').findOne({ _id: objectId });
        
        if (!model) {
          return res.status(404).json({ error: 'Model not found' });
        }
        
        // Calculate additional stats
        const stats = await db.collection('images').aggregate([
          { $match: { modelId: id, isActive: true } },
          { $group: { 
            _id: "$modelId", 
            totalImages: { $sum: 1 },
            ratedImages: { $sum: { $cond: [{ $gt: ["$timesRated", 0] }, 1, 0] } },
            averageElo: { $avg: "$elo" },
            highestElo: { $max: "$elo" },
            totalWins: { $sum: "$wins" },
            totalLosses: { $sum: "$losses" }
          }}
        ]).toArray();
        
        const extendedModel = {
          ...model,
          stats: stats.length > 0 ? stats[0] : {
            totalImages: 0,
            ratedImages: 0,
            averageElo: 1200,
            highestElo: 1200,
            totalWins: 0,
            totalLosses: 0
          }
        };
        
        res.status(200).json({ model: extendedModel });
        break;
        
      // Update a model
      case 'PUT':
        const { name, description, instagram, twitter, onlyfans } = req.body;
        
        // Validate input
        if (!name) {
          return res.status(400).json({ error: 'Model name is required' });
        }
        
        // Check if the model exists
        const existingModel = await db.collection('models').findOne({ _id: objectId });
        if (!existingModel) {
          return res.status(404).json({ error: 'Model not found' });
        }
        
        // Check if name is changed and if new name already exists
        if (name !== existingModel.name) {
          const nameExists = await db.collection('models').findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            _id: { $ne: objectId }
          });
          
          if (nameExists) {
            return res.status(400).json({ error: 'A model with this name already exists' });
          }
        }
        
        // Update model
        const updatedModel = {
          ...existingModel,
          name,
          description: description || '',
          instagram: instagram || '',
          twitter: twitter || '',
          onlyfans: onlyfans || '',
          updatedAt: new Date()
        };
        
        // Update in database
        const result = await db.collection('models').updateOne(
          { _id: objectId },
          { $set: updatedModel }
        );
        
        if (result.modifiedCount === 0) {
          return res.status(400).json({ error: 'Failed to update model' });
        }
        
        // If model name was changed, update modelName in all associated images
        if (name !== existingModel.name) {
          await db.collection('images').updateMany(
            { modelId: id },
            { $set: { modelName: name } }
          );
        }
        
        res.status(200).json({ 
          message: 'Model updated successfully',
          model: updatedModel
        });
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