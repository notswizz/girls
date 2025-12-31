import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../../config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const { db } = await connectToDatabase();
    
    // Get user session
    const session = await getServerSession(req, res, authOptions);

    // Validate ObjectId
    let modelId;
    try {
      modelId = new ObjectId(id);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid model ID format' });
    }

    // Check if model exists and belongs to user
    const modelQuery = { _id: modelId };
    if (session?.user?.id) {
      modelQuery.userId = session.user.id;
    }
    
    const model = await db.collection('models').findOne(modelQuery);
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // Get images for this model - filter by user
    const imageQuery = { 
      $or: [
        { modelId: modelId },
        { modelId: id }
      ],
      isActive: true 
    };
    
    // Filter by user if logged in
    if (session?.user?.id) {
      imageQuery.userId = session.user.id;
    }
    
    const images = await db
      .collection('images')
      .find(imageQuery)
      .sort({ createdAt: -1 })
      .toArray();

    // Map to add the MongoDB _id as id and include all stats
    const mappedImages = images.map(img => ({
      _id: img._id.toString(),
      id: img._id.toString(),
      url: img.url,
      name: img.name || '',
      description: img.description || '',
      createdAt: img.createdAt,
      averageScore: img.averageScore || null,
      timesRated: img.timesRated || 0,
      elo: img.elo || 1200,
      wins: img.wins || 0,
      losses: img.losses || 0,
      winRate: img.winRate || 0
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