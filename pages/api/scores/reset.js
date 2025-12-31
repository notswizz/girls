import { connectToDatabase } from '../../../config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { BASE_RATING } from '../../../utils/eloCalculator';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'You must be logged in to reset scores' });
    }

    const userId = session.user.id;
    const { db } = await connectToDatabase();

    const now = new Date();

    // Reset image-level stats (your photos all start equal again)
    const imageResult = await db.collection('images').updateMany(
      { userId },
      {
        $set: {
          elo: BASE_RATING,
          wins: 0,
          losses: 0,
          winRate: 0,
          timesRated: 0,
          averageScore: null,
          lastOpponents: [],
          updatedAt: now,
        },
      }
    );

    // Reset model-level stats (derived from images; we start them equal too)
    const modelResult = await db.collection('models').updateMany(
      { userId },
      {
        $set: {
          elo: BASE_RATING,
          wins: 0,
          losses: 0,
          winRate: 0,
          averageScore: null,
          eloHistory: [],
          updatedAt: now,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Reset complete',
      imagesMatched: imageResult.matchedCount,
      imagesUpdated: imageResult.modifiedCount,
      modelsMatched: modelResult.matchedCount,
      modelsUpdated: modelResult.modifiedCount,
    });
  } catch (error) {
    console.error('Error resetting scores:', error);
    return res.status(500).json({ error: 'Failed to reset scores' });
  }
}


