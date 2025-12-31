import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: 'Must be logged in to rate' });
    }

    const currentUserId = session.user.id;
    const { galleryId } = req.query;

    // Build query - get images from OTHER users (not yourself)
    const baseQuery = {
      isActive: true,
      userId: { $ne: currentUserId }
    };

    // If galleryId specified, only get from that gallery
    if (galleryId) {
      baseQuery.userId = galleryId;
    }

    // Get first random image
    const firstImages = await db.collection('images').aggregate([
      { $match: baseQuery },
      { $sample: { size: 1 } }
    ]).toArray();

    if (firstImages.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'NEED_MORE_GALLERIES',
        images: []
      });
    }

    const firstImage = firstImages[0];

    // Get second random image from a DIFFERENT model
    const secondQuery = {
      ...baseQuery,
      modelId: { $ne: firstImage.modelId }
    };

    const secondImages = await db.collection('images').aggregate([
      { $match: secondQuery },
      { $sample: { size: 1 } }
    ]).toArray();

    if (secondImages.length === 0) {
      // No images from different models, try to get any other image
      const fallbackImages = await db.collection('images').aggregate([
        { $match: { 
          ...baseQuery,
          _id: { $ne: firstImage._id }
        }},
        { $sample: { size: 1 } }
      ]).toArray();

      if (fallbackImages.length === 0) {
        return res.status(200).json({
          success: false,
          message: 'NEED_MORE_GALLERIES',
          images: []
        });
      }

      // Use fallback (might be same model but different image)
      const images = [firstImage, fallbackImages[0]];
      
      // Lookup model info for both
      const enrichedImages = await enrichWithModelInfo(db, images);
      
      return res.status(200).json({
        success: true,
        images: enrichedImages
      });
    }

    const images = [firstImage, secondImages[0]];
    
    // Lookup model info for both
    const enrichedImages = await enrichWithModelInfo(db, images);

    return res.status(200).json({
      success: true,
      images: enrichedImages
    });
  } catch (error) {
    console.error('Error fetching explore images:', error);
    return res.status(500).json({ message: 'Failed to fetch images' });
  }
}

// Helper to add model info to images
async function enrichWithModelInfo(db, images) {
  const modelIds = [...new Set(images.map(img => img.modelId))];
  
  const models = await db.collection('models').find({
    $or: modelIds.map(id => {
      try {
        return { _id: new ObjectId(id) };
      } catch {
        return { _id: id };
      }
    })
  }).toArray();

  const modelMap = {};
  models.forEach(m => {
    modelMap[m._id.toString()] = m;
  });

  return images.map(img => ({
    ...img,
    modelUsername: modelMap[img.modelId]?.username || null
  }));
}
