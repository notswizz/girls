import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../../config';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const { db } = await connectToDatabase();

    // Validate ObjectId
    let modelId;
    try {
      modelId = new ObjectId(id);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid model ID format' });
    }

    // Check if model exists
    const model = await db.collection('models').findOne({ _id: modelId });
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // Get images for this model - try both ObjectId and string for backwards compatibility
    const images = await db
      .collection('images')
      .find({ 
        $or: [
          { modelId: modelId },
          { modelId: id }
        ],
        isActive: true 
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Map to add the MongoDB _id as id
    const mappedImages = images.map(img => ({
      _id: img._id.toString(),
      id: img._id.toString(),
      url: img.url,
      name: img.name || '',
      description: img.description || '',
      createdAt: img.createdAt,
      averageScore: img.averageScore || null,
      timesRated: img.timesRated || 0,
      elo: img.elo || 1000
    }));

    // Get detailed statistics
    const stats = {
      totalImages: mappedImages.length,
      averageScore: model.averageScore || null,
      ratedImages: mappedImages.filter(img => img.timesRated > 0).length,
      highestRated: null,
      lowestRated: null
    };

    // Find highest and lowest rated images
    if (mappedImages.length > 0) {
      const ratedImages = mappedImages.filter(img => img.averageScore !== null);
      
      if (ratedImages.length > 0) {
        const sortedByScore = [...ratedImages].sort((a, b) => 
          (b.averageScore || 0) - (a.averageScore || 0)
        );
        
        stats.highestRated = sortedByScore[0];
        stats.lowestRated = sortedByScore[sortedByScore.length - 1];
      }
    }

    res.status(200).json({ 
      success: true,
      model: {
        id: model._id,
        name: model.name,
        description: model.description || '',
        averageScore: model.averageScore || null
      },
      images: mappedImages,
      stats
    });
  } catch (error) {
    console.error('Error fetching model images:', error);
    res.status(500).json({ error: 'Failed to fetch model images' });
  }
} 