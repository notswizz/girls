import { connectToDatabase } from '../../../lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

/**
 * Claim accumulated points and convert them to spendable tokens
 * POST - Claim all unclaimed points
 * GET - Check unclaimed points balance
 */
export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Must be logged in' });
    }

    const user = await db.collection('users').findOne({ 
      $or: [
        { email: session.user.email },
        { _id: session.user.id }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // GET - Just check unclaimed balance
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        unclaimedPoints: user.unclaimedPoints || 0,
        currentTokens: user.tokens || 0,
        totalPointsClaimed: user.totalPointsClaimed || 0,
        lastClaimAt: user.lastClaimAt || null
      });
    }

    // POST - Claim points
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const unclaimedPoints = user.unclaimedPoints || 0;

    if (unclaimedPoints === 0) {
      return res.status(400).json({ 
        error: 'No points to claim',
        unclaimedPoints: 0,
        currentTokens: user.tokens || 0
      });
    }

    // Claim all points - transfer to tokens
    const result = await db.collection('users').updateOne(
      { _id: user._id },
      {
        $inc: { 
          tokens: unclaimedPoints,
          totalPointsClaimed: unclaimedPoints
        },
        $set: { 
          unclaimedPoints: 0,
          lastClaimAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(500).json({ error: 'Failed to claim points' });
    }

    const newTokenBalance = (user.tokens || 0) + unclaimedPoints;

    return res.status(200).json({
      success: true,
      claimed: unclaimedPoints,
      newTokenBalance,
      totalPointsClaimed: (user.totalPointsClaimed || 0) + unclaimedPoints,
      message: `🎉 Claimed ${unclaimedPoints} points!`
    });

  } catch (error) {
    console.error('Error claiming points:', error);
    return res.status(500).json({ error: 'Failed to claim points' });
  }
}

