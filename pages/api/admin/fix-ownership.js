import { connectToDatabase } from '../../../config';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { db } = await connectToDatabase();
    
    // The session user ID from the logs
    const newUserId = '69547e4dad412c631a97c30b';
    // Old user ID that was used in previous migration (MongoDB _id)
    const oldUserId = '67cf78fad2d9e67b37c17b6d';
    
    console.log(`Migrating from old ID ${oldUserId} to new session ID ${newUserId}`);
    
    // Update all images with old userId or no userId
    const imageResult = await db.collection('images').updateMany(
      { 
        $or: [
          { userId: { $exists: false } },
          { userId: null },
          { userId: oldUserId }
        ]
      },
      { $set: { userId: newUserId } }
    );
    
    console.log(`Updated ${imageResult.modifiedCount} images`);
    
    // Update all models with old userId or no userId
    const modelResult = await db.collection('models').updateMany(
      { 
        $or: [
          { userId: { $exists: false } },
          { userId: null },
          { userId: oldUserId }
        ]
      },
      { $set: { userId: newUserId } }
    );
    
    console.log(`Updated ${modelResult.modifiedCount} models`);
    
    return res.status(200).json({
      success: true,
      message: `Migration complete`,
      newUserId: newUserId,
      oldUserId: oldUserId,
      imagesUpdated: imageResult.modifiedCount,
      modelsUpdated: modelResult.modifiedCount
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({ error: 'Migration failed', message: error.message });
  }
}

