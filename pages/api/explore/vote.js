import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

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

    // Update community stats for winner's gallery
    await db.collection('community_ratings').updateOne(
      { 
        galleryOwnerId: winnerImage.userId,
        imageId: winnerId
      },
      {
        $inc: { wins: 1, score: 10 },
        $set: { lastVotedAt: new Date() },
        $setOnInsert: { 
          galleryOwnerId: winnerImage.userId,
          imageId: winnerId,
          losses: 0,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    // Update community stats for loser's gallery
    await db.collection('community_ratings').updateOne(
      { 
        galleryOwnerId: loserImage.userId,
        imageId: loserId
      },
      {
        $inc: { losses: 1, score: -5 },
        $set: { lastVotedAt: new Date() },
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

    return res.status(200).json({
      success: true,
      message: 'Vote recorded'
    });
  } catch (error) {
    console.error('Error recording vote:', error);
    return res.status(500).json({ message: 'Failed to record vote' });
  }
}

