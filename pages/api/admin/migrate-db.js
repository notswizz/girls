import { connectToDatabase } from '../../../config';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  try {
    // Connect to database
    const { db } = await connectToDatabase();
    
    console.log('Starting database migration to fix usernames...');
    
    // Get all models
    const models = await db.collection('models').find({}).toArray();
    
    // Update each model to fix username if it's $name or doesn't exist
    let modelsUpdated = 0;
    
    for (const model of models) {
      if (!model.username || model.username === '$name') {
        const result = await db.collection('models').updateOne(
          { _id: model._id },
          { $set: { username: model.name } }
        );
        
        if (result.modifiedCount > 0) {
          modelsUpdated++;
          console.log(`Updated model ${model.name} to set username`);
        }
      }
    }
    
    console.log(`Updated models with incorrect usernames: ${modelsUpdated}`);
    
    // Reload models with updated usernames
    const updatedModels = await db.collection('models').find({}).toArray();
    const modelMap = {};
    updatedModels.forEach(model => {
      modelMap[model._id.toString()] = {
        name: model.name,
        username: model.username || model.name
      };
    });
    
    console.log(`Loaded ${updatedModels.length} models for username mapping`);
    
    // Update each image to include the correct model username
    let totalImagesUpdated = 0;
    
    // Get all images
    const images = await db.collection('images').find({}).toArray();
    
    for (const image of images) {
      // Check if modelUsername is missing or incorrect
      if (!image.modelUsername || image.modelUsername === '$modelName') {
        let username = null;
        
        // First try to get username from model map
        if (image.modelId) {
          const modelIdStr = image.modelId.toString();
          if (modelMap[modelIdStr]) {
            username = modelMap[modelIdStr].username;
          }
        }
        
        // If we couldn't find a username, use modelName as fallback
        if (!username && image.modelName) {
          username = image.modelName;
        }
        
        // If we have a username to set, update the image
        if (username) {
          const result = await db.collection('images').updateOne(
            { _id: image._id },
            { $set: { modelUsername: username } }
          );
          
          if (result.modifiedCount > 0) {
            totalImagesUpdated++;
            console.log(`Updated image ${image._id} to set modelUsername to ${username}`);
          }
        }
      }
    }
    
    console.log(`Total images updated: ${totalImagesUpdated}`);
    console.log('Database migration completed');
    
    return res.status(200).json({
      success: true,
      message: 'Database migration completed successfully',
      stats: {
        modelsUpdated: modelsUpdated,
        imagesUpdated: totalImagesUpdated
      }
    });
  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({ success: false, message: 'Migration failed', error: error.message });
  }
} 