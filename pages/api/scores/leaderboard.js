import { connectToDatabase } from '../../../config';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { db } = await connectToDatabase();
    
    // Query parameters
    const { limit = 20, minRatings = 5 } = req.query;
    
    // Convert query params to numbers
    const limitNum = parseInt(limit);
    const minRatingsNum = parseInt(minRatings);
    
    // Get top images by average score
    // Only include images with at least minRatings ratings
    const topImages = await db
      .collection('images')
      .find({ 
        timesRated: { $gte: minRatingsNum },
        isActive: true 
      })
      .sort({ averageScore: -1 }) // Highest score first
      .limit(limitNum)
      .project({
        url: 1,
        name: 1,
        averageScore: 1,
        timesRated: 1,
        description: 1
      })
      .toArray();
    
    // Map to add the MongoDB _id as id
    const mappedImages = topImages.map((img, index) => ({
      id: img._id,
      rank: index + 1,
      url: img.url,
      name: img.name,
      description: img.description,
      averageScore: img.averageScore,
      timesRated: img.timesRated
    }));
    
    res.status(200).json({ leaderboard: mappedImages });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
} 