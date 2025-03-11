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
    
    // Get top images by ELO score
    // Only include images with at least minRatings
    const topImages = await db
      .collection('images')
      .find({ 
        timesRated: { $gte: minRatingsNum },
        isActive: true 
      })
      .sort({ elo: -1 }) // Sort by ELO instead of average score
      .limit(limitNum)
      .project({
        url: 1,
        name: 1,
        modelName: 1,
        modelUsername: 1,
        averageScore: 1,
        timesRated: 1,
        description: 1,
        elo: 1,
        wins: 1,
        losses: 1,
        winRate: 1
      })
      .toArray();
    
    // Map to add the MongoDB _id as id and ensure all fields exist
    const mappedImages = topImages.map((img, index) => ({
      id: img._id,
      rank: index + 1,
      url: img.url,
      name: img.name || img.modelName || 'Unknown',
      modelName: img.modelName,
      modelUsername: img.modelUsername,
      description: img.description,
      averageScore: img.averageScore || 0,
      timesRated: img.timesRated || 0,
      elo: img.elo || 1200,
      wins: img.wins || 0,
      losses: img.losses || 0,
      winRate: img.winRate || (img.wins && img.losses ? img.wins / (img.wins + img.losses) : 0)
    }));
    
    res.status(200).json({ leaderboard: mappedImages });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
} 