import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import { connectToDatabase } from '../../../../../config';
import { ObjectId } from 'mongodb';

/**
 * Handle upvote/downvote for AI creations
 * POST - Cast a vote (upvote: 1, downvote: -1, remove: 0)
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
  const { vote } = req.body; // 1 = upvote, -1 = downvote, 0 = remove vote

  if (vote !== 1 && vote !== -1 && vote !== 0) {
    return res.status(400).json({ error: 'Vote must be 1, -1, or 0' });
  }

  try {
    const { db } = await connectToDatabase();
    
    let creationId;
    try {
      creationId = new ObjectId(id);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid creation ID' });
    }

    const voterId = session.user.id;

    // Check if creation exists
    const creation = await db.collection('ai_creations').findOne({ _id: creationId });
    if (!creation) {
      return res.status(404).json({ error: 'Creation not found' });
    }

    // Get existing vote by this user
    const existingVote = await db.collection('creation_votes').findOne({
      creationId: creationId,
      voterId: voterId
    });

    const previousVote = existingVote?.vote || 0;

    if (vote === 0) {
      // Remove vote
      if (existingVote) {
        await db.collection('creation_votes').deleteOne({
          creationId: creationId,
          voterId: voterId
        });
      }
    } else {
      // Upsert vote
      await db.collection('creation_votes').updateOne(
        { creationId: creationId, voterId: voterId },
        {
          $set: {
            vote: vote,
            updatedAt: new Date()
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        { upsert: true }
      );
    }

    // Calculate vote delta for updating creation
    const voteDelta = vote - previousVote;

    // Update the creation's vote counts
    const updateOps = {};
    
    if (voteDelta !== 0) {
      if (vote === 1 || previousVote === 1) {
        // Upvote changed
        updateOps.$inc = updateOps.$inc || {};
        if (vote === 1 && previousVote !== 1) {
          updateOps.$inc.upvotes = 1;
        } else if (vote !== 1 && previousVote === 1) {
          updateOps.$inc.upvotes = -1;
        }
      }
      
      if (vote === -1 || previousVote === -1) {
        // Downvote changed
        updateOps.$inc = updateOps.$inc || {};
        if (vote === -1 && previousVote !== -1) {
          updateOps.$inc.downvotes = 1;
        } else if (vote !== -1 && previousVote === -1) {
          updateOps.$inc.downvotes = -1;
        }
      }
    }

    if (Object.keys(updateOps).length > 0) {
      await db.collection('ai_creations').updateOne(
        { _id: creationId },
        updateOps
      );
    }

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

