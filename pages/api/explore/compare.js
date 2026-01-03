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

    // Get all PUBLIC models only (explicitly exclude private models and AI models)
    // Include legacy models without isPublic field, but EXCLUDE isPublic: false
    const publicModels = await db.collection('models').find({
      isActive: true,
      isPublic: { $ne: false }, // This includes true AND undefined/missing
      $or: [
        { isAIModel: { $exists: false } },
        { isAIModel: false },
        { isAIModel: null }
      ]
    }).toArray();

    if (publicModels.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'NEED_MORE_GALLERIES',
        images: []
      });
    }

    // Get model IDs in both formats for matching (ObjectId and string)
    const publicModelIdsObj = publicModels.map(m => m._id);
    const publicModelIdsStr = publicModels.map(m => m._id.toString());

    // Get all images from public models (excluding AI generated content)
    // Match on modelId as both ObjectId and string (different storage formats)
    const allImages = await db.collection('images').find({
      isActive: true,
      // Exclude AI generated images (allow missing field, false, or null)
      $and: [
        { $or: [
          { isAIGenerated: { $exists: false } },
          { isAIGenerated: false },
          { isAIGenerated: null }
        ]},
        { $or: [
          { modelId: { $in: publicModelIdsObj } },
          { modelId: { $in: publicModelIdsStr } }
        ]}
      ]
    }).toArray();

    if (allImages.length < 2) {
      return res.status(200).json({
        success: false,
        message: 'NEED_MORE_GALLERIES',
        images: []
      });
    }

    // Shuffle and pick 2 images, preferring different models
    const shuffled = allImages.sort(() => Math.random() - 0.5);
    const firstImage = shuffled[0];
    const firstModelId = firstImage.modelId?.toString() || firstImage.modelId;
    
    // Try to find image from different model
    let secondImage = shuffled.find(img => {
      const imgModelId = img.modelId?.toString() || img.modelId;
      return imgModelId !== firstModelId;
    });
    
    // If no different model, just get any other image
    if (!secondImage) {
      secondImage = shuffled.find(img => img._id.toString() !== firstImage._id.toString());
    }

    if (!secondImage) {
      return res.status(200).json({
        success: false,
        message: 'NEED_MORE_GALLERIES',
        images: []
      });
    }

    const images = [firstImage, secondImage];
    
    // Add model info
    const modelMap = {};
    publicModels.forEach(m => {
      modelMap[m._id.toString()] = m;
    });

    const enrichedImages = images.map(img => {
      const imgModelId = img.modelId?.toString() || img.modelId;
      return {
        ...img,
        modelUsername: modelMap[imgModelId]?.username || null
      };
    });

    return res.status(200).json({
      success: true,
      images: enrichedImages
    });
  } catch (error) {
    console.error('Error fetching explore images:', error);
    return res.status(500).json({ message: 'Failed to fetch images' });
  }
}
