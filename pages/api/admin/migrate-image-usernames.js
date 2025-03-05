import { connectToDatabase } from '../../../config';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  try {
    // Connect to database
    const { db } = await connectToDatabase();
    
    console.log('Starting migration to update image usernames from model data...');
    
    // Get all models with their usernames
    const models = await db.collection('models').find({}).toArray();
    
    // Create a map of model IDs to usernames
    const modelMap = {};
    models.forEach(model => {
      if (model._id && model.username) {
        modelMap[model._id.toString()] = model.username;
      }
    });
    
    console.log(`Loaded ${Object.keys(modelMap).length} models with usernames`);
    
    // Update all images with the correct usernames from their models
    let imagesUpdated = 0;
    let imagesSkipped = 0;
    
    // Get all images
    const images = await db.collection('images').find({}).toArray();
    console.log(`Found ${images.length} images to process`);
    
    for (const image of images) {
      // Skip images without a modelId
      if (!image.modelId) {
        imagesSkipped++;
        continue;
      }
      
      const modelIdStr = image.modelId.toString();
      const username = modelMap[modelIdStr];
      
      // Skip if we don't have a username for this model
      if (!username) {
        console.log(`No username found for model ID: ${modelIdStr}`);
        imagesSkipped++;
        continue;
      }
      
      // Update the image with the correct username
      const result = await db.collection('images').updateOne(
        { _id: image._id },
        { $set: { modelUsername: username } }
      );
      
      if (result.modifiedCount > 0) {
        imagesUpdated++;
        console.log(`Updated image ${image._id} with username ${username} (was: ${image.modelUsername || 'none'})`);
      } else {
        imagesSkipped++;
      }
    }
    
    console.log(`Migration completed: ${imagesUpdated} images updated, ${imagesSkipped} images skipped`);
    
    return res.status(200).json({
      success: true,
      message: 'Image username migration completed successfully',
      stats: {
        imagesUpdated,
        imagesSkipped,
        totalImages: images.length
      }
    });
  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({ success: false, message: 'Migration failed', error: error.message });
  }
} 