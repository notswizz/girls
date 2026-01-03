import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { db } = await connectToDatabase();
      
      // Get user session - user must be logged in to compare their own images
      const session = await getServerSession(req, res, authOptions);
      
      if (!session || !session.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'You must be logged in to compare images',
          requiresAuth: true
        });
      }
      
      // Get user ID - try multiple sources
      let userId = session.user.id;
      
      // If userId is not in session directly, look up by email
      if (!userId && session.user.email) {
        const user = await db.collection('users').findOne({ email: session.user.email });
        if (user) {
          userId = user._id.toString();
        }
      }
      
      console.log('Session user:', { 
        id: session.user.id, 
        email: session.user.email,
        resolvedUserId: userId 
      });
      
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Could not determine user ID' 
        });
      }
      
      // Parse query parameters
      const { count = 2, exclude = '' } = req.query;
      const countNum = parseInt(count, 10);
      
      // Validate count
      if (countNum < 2) {
        return res.status(400).json({ 
          success: false, 
          message: 'Count must be at least 2' 
        });
      }
      
      // Parse excluded IDs
      let excludedIds = [];
      if (exclude) {
        excludedIds = exclude.split(',').filter(id => {
          try {
            return ObjectId.isValid(id);
          } catch (err) {
            return false;
          }
        }).map(id => new ObjectId(id));
      }
      
      // Build query object - only show user's own images, exclude AI generated content
      // Use $or to handle images that don't have these fields yet (legacy images)
      // Also match userId in multiple formats (string, ObjectId)
      const userIdMatches = [{ userId: userId }];
      try {
        if (ObjectId.isValid(userId)) {
          userIdMatches.push({ userId: new ObjectId(userId) });
        }
      } catch (e) {
        // userId is not a valid ObjectId, just use string match
      }
      
      const query = { 
        isActive: true, 
        $or: userIdMatches
      };
      
      // Also exclude AI generated images
      query.$and = [
        { $or: [
          { isAIGenerated: { $exists: false } },
          { isAIGenerated: false },
          { isAIGenerated: null }
        ]},
        { $or: [
          { excludeFromRatings: { $exists: false } },
          { excludeFromRatings: false },
          { excludeFromRatings: null }
        ]}
      ];
      
      // Add exclusions if provided
      if (excludedIds.length > 0) {
        query._id = { $nin: excludedIds };
      }
      
      // Debug: Count total images for this user
      const totalImagesForUser = await db.collection('images').countDocuments(query);
      console.log(`Total images for user ${userId}: ${totalImagesForUser}`);
      
      // Get all models that have at least one image belonging to this user
      const modelsWithImages = await db
        .collection('images')
        .aggregate([
          { $match: query },
          { $group: { 
              _id: "$modelId", 
              modelName: { $first: "$modelName" },
              imageCount: { $sum: 1 }
            } 
          },
          { $match: { 
              _id: { $ne: null },
              imageCount: { $gt: 0 }
            } 
          },
          { $project: { 
              modelId: "$_id", 
              modelName: 1,
              imageCount: 1,
              _id: 0 
            } 
          }
        ])
        .toArray();
      
      console.log(`Found ${modelsWithImages.length} models with images for user ${userId}`);
      
      // Check if we have enough models to compare
      if (modelsWithImages.length < countNum) {
        return res.status(400).json({ 
          success: false, 
          message: `Not enough models with images. Need ${countNum}, but only found ${modelsWithImages.length}.` 
        });
      }
      
      // Randomly select models
      const shuffledModels = modelsWithImages.sort(() => 0.5 - Math.random()).slice(0, countNum);
      
      console.log(`Selected ${shuffledModels.length} random models for comparison`);
      
      // For each selected model, get a random image
      const selectedImages = [];
      const modelIdsForLogging = [];
      
      for (const model of shuffledModels) {
        // Add model ID to our logging array
        modelIdsForLogging.push(model.modelId.toString());
        
        // Select a random image from this model (user's own images only, excluding AI)
        const imageMatchConditions = [
          { modelId: model.modelId },
          { isActive: true },
          { $or: userIdMatches },
          { $or: [
            { isAIGenerated: { $exists: false } },
            { isAIGenerated: false },
            { isAIGenerated: null }
          ]},
          { $or: [
            { excludeFromRatings: { $exists: false } },
            { excludeFromRatings: false },
            { excludeFromRatings: null }
          ]}
        ];
        
        if (excludedIds.length > 0) {
          imageMatchConditions.push({ _id: { $nin: excludedIds } });
        }
        
        const images = await db
          .collection('images')
          .aggregate([
            { $match: { $and: imageMatchConditions } },
            { $sample: { size: 1 } }
          ])
          .toArray();
        
        if (images.length > 0) {
          selectedImages.push(images[0]);
        }
      }
      
      console.log(`Selected ${selectedImages.length} images for comparison from models: ${modelIdsForLogging.join(', ')}`);
      
      // Make sure we got enough images
      if (selectedImages.length < countNum) {
        return res.status(400).json({ 
          success: false, 
          message: `Could not find enough images. Need ${countNum}, but only found ${selectedImages.length}.` 
        });
      }
      
      // Verify all images are from different models (safety check)
      const modelIds = selectedImages.map(img => img.modelId.toString());
      const uniqueModelIds = [...new Set(modelIds)];
      
      if (uniqueModelIds.length !== modelIds.length) {
        console.error('Error: Duplicate models in selected images', {
          modelIds,
          uniqueModelIds
        });
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to select images from different models' 
        });
      }
      
      // Log the images data for debugging
      console.log('SELECTED IMAGES DATA:', selectedImages.map(img => ({
        id: img._id.toString(),
        modelName: img.modelName,
        modelUsername: img.modelUsername || '[MISSING]',
        url: img.url.substring(0, 50) + '...' // Truncate URL for readability
      })));
      
      return res.status(200).json({
        success: true,
        images: selectedImages
      });
    } catch (error) {
      console.error('Error fetching comparison images:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch comparison images' 
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ 
      success: false, 
      message: `Method ${req.method} Not Allowed` 
    });
  }
} 