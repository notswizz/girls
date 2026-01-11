import { connectToDatabase } from '../../../config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { calculateWilsonScore, calculateModelScore } from '../../../utils/eloCalculator';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { db } = await connectToDatabase();
    
    // Get user session
    const session = await getServerSession(req, res, authOptions);
    
    // Query parameters
    const { 
      limit = 20, 
      minRatings = 3,
      type = 'images' // 'images' or 'models'
    } = req.query;
    
    // Convert query params to numbers
    const limitNum = parseInt(limit);
    const minRatingsNum = parseInt(minRatings);
    
    // Build user filter
    const userFilter = session?.user?.id ? { userId: session.user.id } : {};
    
    if (type === 'models') {
      // MODEL LEADERBOARD
      // Get all models for this user
      const models = await db.collection('models')
        .find({ ...userFilter, isActive: true })
        .toArray();
      
      // For each model, get their images and calculate score
      const modelScores = await Promise.all(models.map(async (model) => {
        const images = await db.collection('images')
          .find({ 
            modelId: model._id,
            isActive: true,
            ...userFilter
          })
          .toArray();
        
        const scoreData = calculateModelScore(images, 3); // Use top 3 images
        
        return {
          id: model._id,
          name: model.name,
          username: model.username,
          imageCount: images.length,
          ...scoreData
        };
      }));
      
      // Filter out models with not enough ratings
      const ratedModels = modelScores.filter(m => (m.totalWins + m.totalLosses) >= minRatingsNum);
      
      // Sort by Wilson score (statistically fair ranking)
      ratedModels.sort((a, b) => b.wilsonScore - a.wilsonScore);
      
      // Add rank and limit
      const rankedModels = ratedModels.slice(0, limitNum).map((model, index) => ({
        ...model,
        rank: index + 1
      }));
      
      return res.status(200).json({ 
        leaderboard: rankedModels,
        type: 'models'
      });
      
    } else {
      // IMAGE LEADERBOARD
      // Get top images by Wilson score (more statistically fair than raw ELO)
      const images = await db
        .collection('images')
        .find({ 
          isActive: true,
          ...userFilter
        })
        .toArray();
      
      // Calculate Wilson score for each image
      const scoredImages = images
        .filter(img => ((img.wins || 0) + (img.losses || 0)) >= minRatingsNum)
        .map(img => {
          const wins = img.wins || 0;
          const losses = img.losses || 0;
          const wilsonScore = calculateWilsonScore(wins, losses);
          const winRate = (wins + losses) > 0 ? wins / (wins + losses) : 0;
          
          return {
            id: img._id,
            url: img.url,
            name: img.name || img.modelName || 'Unknown',
            modelName: img.modelName,
            modelUsername: img.modelUsername,
            modelId: img.modelId,
            elo: img.elo || 1500,
            wins,
            losses,
            winRate,
            wilsonScore,
            score: Math.round(wilsonScore * 1000), // 0-1000 scale
            timesRated: wins + losses
          };
        });
      
      // Sort by Wilson score
      scoredImages.sort((a, b) => b.wilsonScore - a.wilsonScore);
      
      // Add rank and limit
      const rankedImages = scoredImages.slice(0, limitNum).map((img, index) => ({
        ...img,
        rank: index + 1
      }));
      
      return res.status(200).json({ 
        leaderboard: rankedImages,
        type: 'images'
      });
    }
    
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
} 