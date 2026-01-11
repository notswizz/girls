import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import { connectToDatabase } from '../../../../../config';
import { ObjectId } from 'mongodb';

/**
 * Handle upvote/downvote for AI creations
 * POST - Cast a vote (upvote: 1, downvote: -1)
 * Users can vote multiple times with no cooldown
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Must be logged in to vote' });
  }

  const { id } = req.query;
  const { vote } = req.body; // 1 = upvote, -1 = downvote

  if (vote !== 1 && vote !== -1) {
    return res.status(400).json({ error: 'Vote must be 1 or -1' });
  }

  try {
    const { db } = await connectToDatabase();
    
    let creationId;
    try {
      creationId = new ObjectId(id);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid creation ID' });
    }

    // Check if creation exists
    const creation = await db.collection('ai_creations').findOne({ _id: creationId });
    if (!creation) {
      return res.status(404).json({ error: 'Creation not found' });
    }

    // Simply increment upvotes or downvotes - no tracking, no limits
    const updateOps = {
      $inc: vote === 1 ? { upvotes: 1 } : { downvotes: 1 }
    };

    await db.collection('ai_creations').updateOne(
      { _id: creationId },
      updateOps
    );

    // Get updated counts
    const updatedCreation = await db.collection('ai_creations').findOne({ _id: creationId });
    const upvotes = updatedCreation?.upvotes || 0;
    const downvotes = updatedCreation?.downvotes || 0;

    return res.status(200).json({
      success: true,
      vote: vote,
      upvotes,
      downvotes,
      score: upvotes - downvotes
    });

  } catch (error) {
    console.error('Vote error:', error);
    return res.status(500).json({ error: 'Failed to vote' });
  }
}

