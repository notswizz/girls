import { connectToDatabase } from '../../../lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { ObjectId } from 'mongodb';

// Cost that was charged for video generation
const VIDEO_GENERATION_COST = 100;

/**
 * Refund tokens for a mini-game win during video generation
 * POST - Refund the video generation cost
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Must be logged in' });
    }

    const { reason, amount } = req.body;
    
    // Only allow mini-game refunds for now
    if (reason !== 'minigame_win') {
      return res.status(400).json({ error: 'Invalid refund reason' });
    }

    // Refund amount should match video cost
    const refundAmount = amount || VIDEO_GENERATION_COST;

    // Find user
    let userId;
    try {
      userId = new ObjectId(session.user.id);
    } catch {
      userId = session.user.id;
    }

    const user = await db.collection('users').findOne({
      $or: [
        { _id: userId },
        { email: session.user.email }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already refunded for this session (prevent double refund)
    // We'll use a simple flag based on last refund time
    const lastRefund = user.lastMiniGameRefund;
    const now = new Date();
    if (lastRefund && (now - new Date(lastRefund)) < 60000) { // 1 minute cooldown
      return res.status(400).json({ 
        error: 'Already claimed',
        message: 'You already claimed your free generation!'
      });
    }

    // Refund the tokens
    const result = await db.collection('users').updateOne(
      { _id: user._id },
      {
        $inc: { 
          tokens: refundAmount,
          miniGameRefunds: 1 // Track total mini-game wins
        },
        $set: { 
          lastMiniGameRefund: now,
          updatedAt: now
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(500).json({ error: 'Failed to refund tokens' });
    }

    const newBalance = (user.tokens || 0) + refundAmount;

    console.log(`[MINIGAME] Refunded ${refundAmount} tokens to user ${user.email} for mini-game win`);

    return res.status(200).json({
      success: true,
      refunded: refundAmount,
      newBalance,
      message: `🎮 FREE GENERATION! +${refundAmount} tokens refunded!`
    });

  } catch (error) {
    console.error('Refund error:', error);
    return res.status(500).json({ error: 'Failed to refund tokens' });
  }
}

