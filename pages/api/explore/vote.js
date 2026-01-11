import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { updateUserPreferences } from '../user/preferences';
import { calculateNewRatings, BASE_RATING } from '../../../utils/eloCalculator';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: 'Must be logged in to vote' });
    }

    const voterId = session.user.id;
    const { winnerId, loserId } = req.body;

    if (!winnerId || !loserId) {
      return res.status(400).json({ message: 'Winner and loser IDs required' });
    }

    // Get both images to find their owners
    const winnerImage = await db.collection('images').findOne({ 
      _id: new ObjectId(winnerId) 
    });
    const loserImage = await db.collection('images').findOne({ 
      _id: new ObjectId(loserId) 
    });

    if (!winnerImage || !loserImage) {
      return res.status(404).json({ message: 'Images not found' });
    }

    // Learn user preferences from tags (if images have tags)
    if (winnerImage.tags || loserImage.tags) {
      await updateUserPreferences(
        db, 
        voterId, 
        winnerImage.tags || [], 
        loserImage.tags || []
      );
    }

    // Record the community vote
    const vote = {
      voterId,
      winnerId,
      loserId,
      winnerOwnerId: winnerImage.userId,
      loserOwnerId: loserImage.userId,
      createdAt: new Date()
    };

    await db.collection('community_votes').insertOne(vote);

    // Get current community stats for ELO calculation
    const winnerStats = await db.collection('community_ratings').findOne({
      galleryOwnerId: winnerImage.userId,
      imageId: winnerId
    }) || { wins: 0, losses: 0, elo: BASE_RATING };

    const loserStats = await db.collection('community_ratings').findOne({
      galleryOwnerId: loserImage.userId,
      imageId: loserId
    }) || { wins: 0, losses: 0, elo: BASE_RATING };

    // Calculate new ELO ratings using the proper algorithm
    const { winnerNewRating, loserNewRating, winnerDelta, loserDelta } = calculateNewRatings(
      { elo: winnerStats.elo || BASE_RATING, wins: winnerStats.wins || 0, losses: winnerStats.losses || 0 },
      { elo: loserStats.elo || BASE_RATING, wins: loserStats.wins || 0, losses: loserStats.losses || 0 }
    );

    // Update community stats for winner's gallery with proper ELO
    await db.collection('community_ratings').updateOne(
      { 
        galleryOwnerId: winnerImage.userId,
        imageId: winnerId
      },
      {
        $inc: { wins: 1 },
        $set: { 
          elo: winnerNewRating,
          lastVotedAt: new Date() 
        },
        $setOnInsert: { 
          galleryOwnerId: winnerImage.userId,
          imageId: winnerId,
          losses: 0,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    // Update community stats for loser's gallery with proper ELO
    await db.collection('community_ratings').updateOne(
      { 
        galleryOwnerId: loserImage.userId,
        imageId: loserId
      },
      {
        $inc: { losses: 1 },
        $set: { 
          elo: loserNewRating,
          lastVotedAt: new Date() 
        },
        $setOnInsert: { 
          galleryOwnerId: loserImage.userId,
          imageId: loserId,
          wins: 0,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    // Increment voter's community rating count
    await db.collection('users').updateOne(
      { _id: voterId },
      { $inc: { communityRatingsCount: 1 } }
    );

    // Award 1 token to the owner of the winning photo (only if voter is NOT the owner)
    const winnerOwnerId = winnerImage.userId;
    if (winnerOwnerId && winnerOwnerId !== voterId) {
      try {
        // Try to convert to ObjectId if it's a string
        let ownerQuery;
        if (ObjectId.isValid(winnerOwnerId)) {
          ownerQuery = { 
            $or: [
              { _id: new ObjectId(winnerOwnerId) },
              { _id: winnerOwnerId }
            ]
          };
        } else {
          ownerQuery = { _id: winnerOwnerId };
        }

        const tokenResult = await db.collection('users').updateOne(
          ownerQuery,
          { 
            $inc: { 
              tokens: 1,
              tokensFromWins: 1 // Track tokens earned from wins separately
            } 
          }
        );

        if (tokenResult.modifiedCount > 0) {
          console.log(`[EXPLORE] Awarded 1 token to user ${winnerOwnerId} for winning vote`);
        }
      } catch (tokenError) {
        // Don't fail the vote if token award fails, just log it
        console.error('[EXPLORE] Failed to award token to winner owner:', tokenError);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Vote recorded',
      ratings: {
        winner: { oldElo: winnerStats.elo || BASE_RATING, newElo: winnerNewRating, delta: winnerDelta },
        loser: { oldElo: loserStats.elo || BASE_RATING, newElo: loserNewRating, delta: loserDelta }
      }
    });
  } catch (error) {
    console.error('Error recording vote:', error);
    return res.status(500).json({ message: 'Failed to record vote' });
  }
}
