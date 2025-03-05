import { connectToDatabase } from '../../../config';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { db } = await connectToDatabase();
        
        // Query parameters
        const { limit = 10, skip = 0, unrated = false } = req.query;
        
        // Convert query params to numbers
        const limitNum = parseInt(limit);
        const skipNum = parseInt(skip);
        
        // Build query
        let query = { isActive: true };
        
        // If unrated=true, only return images the user hasn't rated yet
        // This would require user authentication - simplified for now
        
        // Get images from MongoDB
        const images = await db
          .collection('images')
          .find(query)
          .sort({ uploadedAt: -1 }) // Latest images first
          .skip(skipNum)
          .limit(limitNum)
          .toArray();
        
        // Map to add the MongoDB _id as id
        const mappedImages = images.map(img => ({
          id: img._id,
          url: img.url,
          name: img.name,
          description: img.description,
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