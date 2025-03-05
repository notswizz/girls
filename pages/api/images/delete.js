import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../config';

export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const { db } = await connectToDatabase();
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Image ID is required' });
    }

    // Validate ObjectId
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid image ID format' });
    }

    // Find the image to get its model ID before deletion
    const image = await db.collection('images').findOne({ _id: objectId });
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const modelId = image.modelId;

    // Delete the image (soft delete by setting isActive to false)
    const result = await db.collection('images').updateOne(
      { _id: objectId },
      { $set: { isActive: false } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Image not found or already deleted' });
    }

    // Update model statistics if needed
    if (modelId) {
      // Recalculate model's average score
      const modelStats = await db.collection('images').aggregate([
        { $match: { modelId: modelId, isActive: true } },
        { $group: { 
          _id: "$modelId", 
          count: { $sum: 1 },
          averageScore: { $avg: "$averageScore" }
        }}
      ]).toArray();

      if (modelStats.length > 0) {
        const stats = modelStats[0];
        await db.collection('models').updateOne(
          { _id: new ObjectId(modelId) },
          { $set: { 
            imageCount: stats.count,
            averageScore: stats.averageScore || null
          }}
        );
      } else {
        // No active images left for this model
        await db.collection('models').updateOne(
          { _id: new ObjectId(modelId) },
          { $set: { 
            imageCount: 0,
            averageScore: null
          }}
        );
      }
    }

    res.status(200).json({ 
      message: 'Image deleted successfully',
      modelId: modelId
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
} 