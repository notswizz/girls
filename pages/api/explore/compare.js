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

    // For each public model, get only TOP 10 images by ELO score
    // This ensures only owner-curated best images appear in Explore
    const TOP_IMAGES_PER_MODEL = 10;
    
    let allEligibleImages = [];
    
    for (const model of publicModels) {
      const modelIdStr = model._id.toString();
      
      // Get top 10 images for this model, sorted by ELO (owner's rating determines quality)
      const topImages = await db.collection('images')
        .find({
          isActive: true,
          $or: [
            { modelId: model._id },
            { modelId: modelIdStr }
          ],
          // Exclude AI generated images
          $and: [
            { $or: [
              { isAIGenerated: { $exists: false } },
              { isAIGenerated: false },
              { isAIGenerated: null }
            ]}
          ]
        })
        .sort({ elo: -1, wins: -1, createdAt: -1 }) // Sort by ELO, then wins, then newest
        .limit(TOP_IMAGES_PER_MODEL)
        .toArray();
      
      allEligibleImages.push(...topImages);
    }
    
    console.log(`Total eligible images (top ${TOP_IMAGES_PER_MODEL} per model): ${allEligibleImages.length}`);

    if (allEligibleImages.length < 2) {
      return res.status(200).json({
        success: false,
        message: 'NEED_MORE_GALLERIES',
        images: []
      });
    }

    // Filter out images from recently shown models (minimum 6 ratings apart rule)
    let availableImages = allEligibleImages;
    if (recentModelIds.length > 0) {
      availableImages = allEligibleImages.filter(img => {
        const imgModelId = img.modelId?.toString() || img.modelId;
        return !recentModelIds.includes(imgModelId);
      });
      
      // If not enough images after filtering, fall back to all eligible images
      if (availableImages.length < 2) {
        console.log(`Not enough images after filtering recent models, using all ${allEligibleImages.length}`);
        availableImages = allEligibleImages;
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
