import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import { connectToDatabase } from '../../../../../config';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get user session
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid creation ID' });
  }

  const { db } = await connectToDatabase();
  const objectId = new ObjectId(id);

  try {
    // Try new ai_creations collection first
    let creation = await db.collection('ai_creations').findOne({
      _id: objectId,
      userId: session.user.id
    });

    let collection = 'ai_creations';

    // If not found, try old images collection
    if (!creation) {
      creation = await db.collection('images').findOne({
        _id: objectId,
        userId: session.user.id,
        isAIGenerated: true
      });
      collection = 'images';
    }

    if (!creation) {
      return res.status(404).json({ error: 'Creation not found' });
    }

    // Toggle favorite status
    const newFavoriteStatus = !creation.isFavorite;

    await db.collection(collection).updateOne(
      { _id: objectId },
      { $set: { isFavorite: newFavoriteStatus } }
    );

    return res.status(200).json({ 
      success: true, 
      isFavorite: newFavoriteStatus 
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return res.status(500).json({ error: 'Failed to toggle favorite' });
  }
}

