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
    
    // Parse recently shown models to avoid (minimum 6 ratings apart)
    const { recentModels = '' } = req.query;
    const recentModelIds = recentModels ? recentModels.split(',').filter(Boolean) : [];

    // Get all PUBLIC models only (explicitly exclude private models and AI models)
    const allModels = await db.collection('models').find({ isActive: true }).toArray();
    
    console.log('=== EXPLORE COMPARE DEBUG ===');
    console.log('Total active models:', allModels.length);
    allModels.forEach(m => {
      console.log(`Model "${m.name}": isPublic=${m.isPublic}, isAIModel=${m.isAIModel}`);
    });
    
    // Include legacy models without isPublic field, but EXCLUDE isPublic: false
    const publicModels = allModels.filter(m => {
      const isNotPrivate = m.isPublic !== false;
      const isNotAIModel = !m.isAIModel;
      console.log(`  "${m.name}": isNotPrivate=${isNotPrivate}, isNotAIModel=${isNotAIModel}, included=${isNotPrivate && isNotAIModel}`);
      return isNotPrivate && isNotAIModel;
    });
    
    console.log('Public non-AI models count:', publicModels.length);

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

    // Filter out images from recently shown models (minimum 6 ratings apart rule)
    let availableImages = allImages;
    if (recentModelIds.length > 0) {
      availableImages = allImages.filter(img => {
        const imgModelId = img.modelId?.toString() || img.modelId;
        return !recentModelIds.includes(imgModelId);
      });
      
      // If not enough images after filtering, fall back to all images
      if (availableImages.length < 2) {
        console.log(`Not enough images after filtering recent models, using all ${allImages.length}`);
        availableImages = allImages;
      }
    }

    // Shuffle and pick 2 images, preferring different models
    const shuffled = availableImages.sort(() => Math.random() - 0.5);
    const firstImage = shuffled[0];
    const firstModelId = firstImage.modelId?.toString() || firstImage.modelId;
    
    // Try to find image from different model (also excluding recent models)
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
