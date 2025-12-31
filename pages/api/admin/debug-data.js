import { connectToDatabase } from '../../../config';

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();
    
    const userId = '69547e4dad412c631a97c30b';
    
    // Get models for this user
    const models = await db.collection('models')
      .find({ userId: userId })
      .toArray();
    
    // Get images for this user
    const images = await db.collection('images')
      .find({ userId: userId, isActive: true })
      .toArray();
    
    // Group images by modelId
    const imagesByModel = {};
    images.forEach(img => {
      const modelId = img.modelId ? img.modelId.toString() : 'no-model';
      if (!imagesByModel[modelId]) {
        imagesByModel[modelId] = 0;
      }
      imagesByModel[modelId]++;
    });
    
    // Check how many models have images
    const modelsWithImages = Object.keys(imagesByModel).filter(k => k !== 'no-model');
    
    return res.status(200).json({
      success: true,
      userId: userId,
      totalModels: models.length,
      totalImages: images.length,
      modelsWithImages: modelsWithImages.length,
      imagesByModel: imagesByModel,
      sampleModels: models.slice(0, 5).map(m => ({ 
        id: m._id.toString(), 
        name: m.name,
        userId: m.userId 
      })),
      sampleImages: images.slice(0, 5).map(i => ({ 
        id: i._id.toString(), 
        modelId: i.modelId?.toString(),
        userId: i.userId 
      }))
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    return res.status(500).json({ error: error.message });
  }
}

