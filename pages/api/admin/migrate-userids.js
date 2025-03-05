import { connectToDatabase } from '../../../config';
import { ObjectId } from 'mongodb';
import { generateModelUsername } from '../../../utils/idGenerator';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  try {
    // Connect to database
    const { db } = await connectToDatabase();
    
    console.log('Starting database migration to update user IDs...');
    
    // Get all models
    const models = await db.collection('models').find({}).toArray();
    
    // Update each model with a new 3-letter-3-number username
    let modelsUpdated = 0;
    const modelUpdates = [];
    
    for (const model of models) {
      const newUsername = generateModelUsername();
      
      // Store update for later processing
      modelUpdates.push({
        model,
        oldUsername: model.username || model.name,
        newUsername
      });
      
      // Update the model
      const result = await db.collection('models').updateOne(
        { _id: model._id },
        { $set: { username: newUsername } }
      );
      
      if (result.modifiedCount > 0) {
        modelsUpdated++;
        console.log(`Updated model ${model.name} with new user ID ${newUsername}`);
      }
    }
    
    // Update images to use the new model usernames
    let imagesUpdated = 0;
    
    for (const update of modelUpdates) {
      // Update all images for this model
      const result = await db.collection('images').updateMany(
        { modelId: update.model._id },
        { $set: { modelUsername: update.newUsername } }
      );
      
      imagesUpdated += result.modifiedCount;
      console.log(`Updated ${result.modifiedCount} images for model ${update.model.name} with new user ID ${update.newUsername}`);
    }
    
    console.log(`Total: ${modelsUpdated} models and ${imagesUpdated} images updated with new user IDs`);
    console.log('Database migration completed');
    
    return res.status(200).json({
      success: true,
      message: 'Database migration completed successfully',
      stats: {
        modelsUpdated,
        imagesUpdated,
        modelUpdates: modelUpdates.map(update => ({
          modelName: update.model.name,
          oldUsername: update.oldUsername,
          newUsername: update.newUsername
        }))
      }
    });
  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({ success: false, message: 'Migration failed', error: error.message });
  }
} 