import { connectToDatabase } from '../../lib/mongodb';
import User from '../../models/User';
import Model from '../../models/Model';
import { getSession } from 'next-auth/react';

// Helper: Elo-based price
const getRevealPrice = (elo) => Math.ceil((elo - 1200) / 80) + 2;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { modelId } = req.body;
  if (!modelId) return res.status(400).json({ error: 'Missing modelId' });

  await connectToDatabase();
  // Find user
  const user = await User.findOne({ email: session.user.email });
  if (!user) return res.status(404).json({ error: 'User not found' });
  // Find model
  const model = await Model.findById(modelId);
  if (!model) return res.status(404).json({ error: 'Model not found' });
  if (!model.instagram) return res.status(400).json({ error: 'No Instagram available for this model' });

  const price = getRevealPrice(model.elo || 1200);
  if ((user.tokens ?? 0) < price) {
    return res.status(403).json({ error: 'Not enough tokens' });
  }
  // Check if already revealed
  if (user.revealHistory && user.revealHistory.includes(modelId)) {
    return res.status(200).json({ instagram: model.instagram, alreadyRevealed: true });
  }
  // Deduct tokens and add to revealHistory
  user.tokens -= price;
  user.revealHistory = user.revealHistory || [];
  user.revealHistory.push(modelId);
  await user.save();

  return res.status(200).json({ instagram: model.instagram, tokens: user.tokens });
}
