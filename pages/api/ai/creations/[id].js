import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { connectToDatabase } from '../../../../config';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
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

  if (req.method === 'DELETE') {
    try {
      // Try to delete from new ai_creations collection first
      let result = await db.collection('ai_creations').deleteOne({
        _id: objectId,
        userId: session.user.id
      });

      // If not found in new collection, try old images collection (legacy AI content)
      if (result.deletedCount === 0) {
        result = await db.collection('images').deleteOne({
          _id: objectId,
          userId: session.user.id,
          isAIGenerated: true
        });
      }

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Creation not found or not authorized' });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting creation:', error);
      return res.status(500).json({ error: 'Failed to delete creation' });
    }
  }

  if (req.method === 'GET') {
    try {
      // Try new collection first
      let creation = await db.collection('ai_creations').findOne({
        _id: objectId,
        userId: session.user.id
      });

      // If not found, try old images collection
      if (!creation) {
        const oldImage = await db.collection('images').findOne({
          _id: objectId,
          userId: session.user.id,
          isAIGenerated: true
        });

        if (oldImage) {
          // Normalize to new format
          creation = {
            _id: oldImage._id,
            url: oldImage.url,
            prompt: oldImage.description || oldImage.name || 'AI Generated',
            userId: oldImage.userId,
            createdAt: oldImage.createdAt,
            isActive: oldImage.isActive,
            type: oldImage.aiType || 'image',
            sourceModelId: null,
            sourceModelName: null,
            _isLegacy: true
          };
        }
      }

      if (!creation) {
        return res.status(404).json({ error: 'Creation not found' });
      }

      return res.status(200).json(creation);
    } catch (error) {
      console.error('Error fetching creation:', error);
      return res.status(500).json({ error: 'Failed to fetch creation' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
