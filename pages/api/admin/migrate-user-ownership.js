import { connectToDatabase } from '../../../config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { db } = await connectToDatabase();
    
    // Get the current session to use the actual session user ID
    const session = await getServerSession(req, res, authOptions);
    
    let userId;
    let targetEmail;
    
    if (session && session.user) {
      // Use the session user ID (this is what the app actually uses)
      userId = session.user.id;
      targetEmail = session.user.email;
      console.log(`Using session user: ${targetEmail} with ID: ${userId}`);
    } else {
      // Fallback to query param or hardcoded
      const { email } = req.query;
      targetEmail = email || 'emailswizz@gmail.com';
      const user = await db.collection('users').findOne({ email: targetEmail });
      
      if (!user) {
        return res.status(404).json({ 
          error: `User with email ${targetEmail} not found. Make sure to sign in first.` 
        });
      }
      
      userId = user._id.toString();
    }
    console.log(`Found user: ${user.name} (${userId})`);
    
    // Old user ID that was used in previous migration (MongoDB _id)
    const oldUserId = '67cf78fad2d9e67b37c17b6d';
    
    // Update all images that don't have a userId OR have the old userId
    const imageResult = await db.collection('images').updateMany(
      { 
        $or: [
          { userId: { $exists: false } },
          { userId: null },
          { userId: oldUserId }
        ]
      },
      { $set: { userId: userId } }
    );
    
    console.log(`Updated ${imageResult.modifiedCount} images`);
    
    // Update all models that don't have a userId OR have the old userId
    const modelResult = await db.collection('models').updateMany(
      { 
        $or: [
          { userId: { $exists: false } },
          { userId: null },
          { userId: oldUserId }
        ]
      },
      { $set: { userId: userId } }
    );
    
    console.log(`Updated ${modelResult.modifiedCount} models`);
    
    return res.status(200).json({
      success: true,
      message: `Migration complete for user ${targetEmail}`,
      userId: userId,
      imagesUpdated: imageResult.modifiedCount,
      modelsUpdated: modelResult.modifiedCount
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({ error: 'Migration failed', message: error.message });
  }
}

