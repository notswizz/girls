import dbConnect from '../../utils/dbConnect';
import User from '../../models/User';
import { getSession } from 'next-auth/react';

// POST /api/dex/swap: Swap 10 ratings for 1 token
// POST /api/dex/buy: Spend 1 token to buy a reveal
// GET /api/dex/balance: Get swaps (ratings) and tokens

export default async function handler(req, res) {
  await dbConnect();
  const session = await getSession({ req });
  if (!session || !session.user?.email) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const user = await User.findOne({ email: session.user.email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (req.method === 'GET') {
    return res.json({ swaps: user.ratingsCount, tokens: user.tokens, revealHistory: user.revealHistory });
  }

  if (req.method === 'POST') {
    const { action, modelId } = req.body;
    if (action === 'swap') {
      if (user.ratingsCount < 10) return res.status(400).json({ error: 'Not enough swaps' });
      user.ratingsCount -= 10;
      user.tokens += 1;
      await user.save();
      return res.json({ swaps: user.ratingsCount, tokens: user.tokens, revealHistory: user.revealHistory });
    }
    if (action === 'buy') {
      if (user.tokens < 1) return res.status(400).json({ error: 'Not enough tokens' });
      user.tokens -= 1;
      user.revealHistory.push({ modelId, timestamp: new Date(), cost: 1 });
      await user.save();
      return res.json({ swaps: user.ratingsCount, tokens: user.tokens, revealHistory: user.revealHistory });
    }
    return res.status(400).json({ error: 'Invalid action' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
