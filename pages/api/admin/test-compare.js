import { connectToDatabase } from '../../../config';

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();
    
    const userId = '69547e4dad412c631a97c30b';
    
    // Exact same query as compare API
    const query = { isActive: true, userId: userId };
    
    // Count total
    const totalImages = await db.collection('images').countDocuments(query);
    
    // Run aggregation
    const modelsWithImages = await db
      .collection('images')
      .aggregate([
        { $match: query },
        { $group: { 
            _id: "$modelId", 
            modelName: { $first: "$modelName" },
            imageCount: { $sum: 1 }
          } 
        },
        { $match: { 
            _id: { $ne: null },
            imageCount: { $gt: 0 }
          } 
        },
        { $project: { 
            modelId: "$_id", 
            modelName: 1,
            imageCount: 1,
            _id: 0 
          } 
        }
      ])
      .toArray();
    
    return res.status(200).json({
      success: true,
      userId: userId,
      totalImagesMatching: totalImages,
      modelsWithImages: modelsWithImages.length,
      models: modelsWithImages.slice(0, 10)
    });
    
  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({ error: error.message });
  }
}

