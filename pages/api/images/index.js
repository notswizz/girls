import { connectToDatabase } from '../../../config';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { db } = await connectToDatabase();
        
        // Query parameters
        const { count = 3, unrated = false, limit, skip } = req.query;
        
        // If limit and skip are provided, use the old pagination logic
        if (limit !== undefined && skip !== undefined) {
          const limitNum = parseInt(limit);
          const skipNum = parseInt(skip);
          
          const images = await db
            .collection('images')
            .find({ isActive: true })
            .sort({ _id: -1 })
            .skip(skipNum)
            .limit(limitNum)
            .toArray();
          
          const mappedImages = images.map(img => ({
            id: img._id,
            url: img.url,
            name: img.name,
            description: img.description,
            modelId: img.modelId,
            modelName: img.modelName,
            averageScore: img.averageScore,
            timesRated: img.timesRated
          }));
          
          return res.status(200).json({ images: mappedImages });
        }
        
        // For the ranking feature, we want one image per model
        // Convert query params to numbers
        const countNum = parseInt(count);
        
        // Build query
        let query = { isActive: true };
        
        // Get all models that have at least one image
        const modelsWithImages = await db
          .collection('images')
          .aggregate([
            { $match: query },
            { $group: { _id: "$modelId", modelName: { $first: "$modelName" } } },
            { $match: { _id: { $ne: null } } }, // Exclude null modelIds
            { $project: { modelId: "$_id", modelName: 1, _id: 0 } }
          ])
          .toArray();
        
        console.log(`Found ${modelsWithImages.length} models with images`);
        
        // If we don't have enough models with images
        if (modelsWithImages.length < countNum) {
          return res.status(400).json({ 
            error: `Not enough models with images. Need ${countNum}, but only found ${modelsWithImages.length}.` 
          });
        }
        
        // Shuffle the models to get a random selection
        const shuffledModels = modelsWithImages.sort(() => 0.5 - Math.random()).slice(0, countNum);
        
        console.log(`Selected ${shuffledModels.length} random models`);
        
        // For each selected model, get a random image
        const selectedImages = [];
        
        for (const model of shuffledModels) {
          const images = await db
            .collection('images')
            .aggregate([
              { $match: { modelId: model.modelId, isActive: true } },
              { $sample: { size: 1 } }
            ])
            .toArray();
          
          if (images.length > 0) {
            selectedImages.push(images[0]);
          }
        }
        
        console.log(`Selected ${selectedImages.length} images from different models`);
        
        // Verify we have the right number of images
        if (selectedImages.length < countNum) {
          return res.status(400).json({ 
            error: `Could not find enough images. Need ${countNum}, but only found ${selectedImages.length}.` 
          });
        }
        
        // Map to add the MongoDB _id as id
        const mappedImages = selectedImages.map(img => ({
          id: img._id,
          url: img.url,
          name: img.name,
          description: img.description,
          modelId: img.modelId,
          modelName: img.modelName,
          averageScore: img.averageScore,
          timesRated: img.timesRated
        }));
        
        // Double-check that all images are from different models
        const modelIds = mappedImages.map(img => img.modelId);
        const uniqueModelIds = [...new Set(modelIds)];
        
        if (uniqueModelIds.length !== modelIds.length) {
          console.error('Error: Duplicate models in selected images', {
            modelIds,
            uniqueModelIds
          });
          return res.status(500).json({ error: 'Failed to select images from different models' });
        }
        
        res.status(200).json({ images: mappedImages });
      } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ error: 'Failed to fetch images' });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
} 