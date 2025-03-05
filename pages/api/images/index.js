import { connectToDatabase } from '../../../config';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { db } = await connectToDatabase();
        
        // Query parameters
        const { count = 3, unrated = false } = req.query;
        
        // Convert query params to numbers
        const countNum = parseInt(count);
        
        // Build query
        let query = { isActive: true };
        
        // If unrated=true, only return images the user hasn't rated yet
        // This would require user authentication - simplified for now
        
        // Get distinct model IDs to ensure we get images from different models
        const distinctModels = await db
          .collection('images')
          .aggregate([
            { $match: query },
            { $group: { _id: "$modelId" } },
            { $project: { modelId: "$_id", _id: 0 } }
          ])
          .toArray();
        
        // Extract model IDs, filtering out null values
        const modelIds = distinctModels
          .map(item => item.modelId)
          .filter(id => id !== null);
        
        // Prepare to store our selected images
        let selectedImages = [];
        
        // If we have enough distinct models
        if (modelIds.length >= countNum) {
          // Shuffle the model IDs
          const shuffledModelIds = modelIds.sort(() => 0.5 - Math.random()).slice(0, countNum);
          
          // For each selected model ID, get a random image
          for (const modelId of shuffledModelIds) {
            const images = await db
              .collection('images')
              .find({ modelId: modelId, isActive: true })
              .toArray();
            
            if (images.length > 0) {
              // Select a random image from this model
              const randomImage = images[Math.floor(Math.random() * images.length)];
              selectedImages.push(randomImage);
            }
          }
        }
        
        // If we don't have enough images from different models, get random images
        if (selectedImages.length < countNum) {
          const remainingCount = countNum - selectedImages.length;
          const existingIds = selectedImages.map(img => img._id.toString());
          
          const randomImages = await db
            .collection('images')
            .aggregate([
              { $match: { 
                _id: { $nin: existingIds.map(id => new ObjectId(id)) },
                isActive: true 
              } },
              { $sample: { size: remainingCount } }
            ])
            .toArray();
          
          selectedImages = [...selectedImages, ...randomImages];
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