import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../lib/mongodb';
import { calculateNewRatings, BASE_RATING } from '../../../utils/eloCalculator';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { updateUserPreferences } from '../user/preferences';

export default async function handler(req, res) {
  // Only accept POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { db } = await connectToDatabase();
    
    // Get the winnerId and loserId from the request body
    const { winnerId, loserId, userId } = req.body;
    
    // Validate input
    if (!winnerId || !loserId) {
      return res.status(400).json({ error: 'Both winnerId and loserId are required' });
    }
    
    // Validate IDs and get images
    let winnerObjectId, loserObjectId;
    try {
      winnerObjectId = new ObjectId(winnerId);
      loserObjectId = new ObjectId(loserId);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid image ID format' });
    }
    
    // Get the images from the database
    const winnerImage = await db.collection('images').findOne({ _id: winnerObjectId, isActive: true });
    const loserImage = await db.collection('images').findOne({ _id: loserObjectId, isActive: true });
    
    if (!winnerImage || !loserImage) {
      return res.status(404).json({ error: 'One or both images not found' });
    }
    
    // Get authenticated user
    let authenticatedUserId = null;
    const session = await getServerSession(req, res, authOptions);
    
    // Learn user preferences from tags (if images have tags)
    if (session?.user?.id && (winnerImage.tags || loserImage.tags)) {
      await updateUserPreferences(
        db, 
        session.user.id, 
        winnerImage.tags || [], 
        loserImage.tags || []
      );
    }
    
    if (session) {
      // If session, get the user from our database
      const user = await db.collection('users').findOne({ email: session.user.email });
      if (user) {
        authenticatedUserId = user._id;
        
        // Update the user's ratings count AND tokens
        await db.collection('users').updateOne(
          { _id: user._id },
          {
            $inc: { ratingsCount: 1, tokens: 1 },
            $set: { updatedAt: new Date() }
          }
        );
      }
    }
    
    // Save the comparison result
    await db.collection('comparisons').insertOne({
      winnerId: winnerObjectId,
      loserId: loserObjectId,
      userId: authenticatedUserId || userId || null, // Use authenticated or provided user ID
      timestamp: new Date(),
      winnerRating: winnerImage.elo || BASE_RATING,
      loserRating: loserImage.elo || BASE_RATING
    });
    
    // Calculate new ELO ratings - pass full image objects for proper K-factor calculation
    const { winnerNewRating, loserNewRating, winnerDelta, loserDelta } = calculateNewRatings(
      winnerImage,
      loserImage
    );
    
    // Update winner image
    await db.collection('images').updateOne(
      { _id: winnerObjectId },
      {
        $set: {
          elo: winnerNewRating,
          updatedAt: new Date()
        },
        $inc: {
          wins: 1,
          timesRated: 1
        },
        $push: {
          lastOpponents: {
            $each: [loserObjectId],
            $slice: -10 // Keep only the last 10 opponents
          }
        }
      }
    );
    
    // Update loser image
    await db.collection('images').updateOne(
      { _id: loserObjectId },
      { 
        $set: {
          elo: loserNewRating,
          updatedAt: new Date()
        },
        $inc: {
          losses: 1,
          timesRated: 1
        },
        $push: {
          lastOpponents: {
            $each: [winnerObjectId],
            $slice: -10 // Keep only the last 10 opponents
          }
        }
      }
    );
    
    // Update model stats if model IDs are available
    if (winnerImage.modelId) {
      await updateModelStats(db, winnerImage.modelId);
      // Add new elo point to model's eloHistory
      await db.collection('models').updateOne(
        { _id: typeof winnerImage.modelId === 'string' ? new ObjectId(winnerImage.modelId) : winnerImage.modelId },
        {
          $push: {
            eloHistory: {
              $each: [{ elo: winnerNewRating, timestamp: new Date() }],
              $slice: -100 // Keep last 100 points
            }
          }
        }
      );
    }

    if (loserImage.modelId) {
      await updateModelStats(db, loserImage.modelId);
      // Add new elo point to model's eloHistory
      await db.collection('models').updateOne(
        { _id: typeof loserImage.modelId === 'string' ? new ObjectId(loserImage.modelId) : loserImage.modelId },
        {
          $push: {
            eloHistory: {
              $each: [{ elo: loserNewRating, timestamp: new Date() }],
              $slice: -100 // Keep last 100 points
            }
          }
        }
      );
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Comparison recorded successfully',
      newRatings: {
        winner: {
          id: winnerId,
          oldRating: winnerImage.elo || BASE_RATING,
          newRating: winnerNewRating
        },
        loser: {
          id: loserId,
          oldRating: loserImage.elo || BASE_RATING,
          newRating: loserNewRating
        }
      }
    });
    
  } catch (error) {
    console.error('Error recording comparison:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}

// Update a model's stats based on its images
async function updateModelStats(db, modelId) {
  try {
    // Convert to ObjectId if it's a string
    const modelObjectId = typeof modelId === 'string' 
      ? new ObjectId(modelId) 
      : modelId;
    
    // Get all active images for this model
    const images = await db.collection('images')
      .find({ modelId: modelObjectId, isActive: true })
      .toArray();
    
    if (!images || images.length === 0) return;
    
    // Calculate aggregate stats
    const totalWins = images.reduce((sum, img) => sum + (img.wins || 0), 0);
    const totalLosses = images.reduce((sum, img) => sum + (img.losses || 0), 0);
    const totalMatches = totalWins + totalLosses;
    const winRate = totalMatches > 0 ? totalWins / totalMatches : 0;
    
    // Calculate average ELO
    const totalElo = images.reduce((sum, img) => sum + (img.elo || BASE_RATING), 0);
    const averageElo = images.length > 0 ? totalElo / images.length : BASE_RATING;
    
    // Update the model document
    await db.collection('models').updateOne(
      { _id: modelObjectId },
      {
        $set: {
          wins: totalWins,
          losses: totalLosses,
          winRate: winRate,
          elo: averageElo,
          imageCount: images.length,
          updatedAt: new Date()
        }
      }
    );
  } catch (error) {
    console.error('Error updating model stats:', error);
  }
} 