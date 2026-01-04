import { connectToDatabase } from '../../../config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const ADMIN_EMAIL = 'emailswizz@gmail.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check admin auth
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user?.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const { db } = await connectToDatabase();
    const { targetEmail } = req.body || {};
    
    // Get all users to build a set of valid user IDs
    const allUsers = await db.collection('users').find({}).toArray();
    const userIdSet = new Set(allUsers.map(u => u._id.toString()));
    
    // Find the target user to migrate orphan data to
    const emailToUse = targetEmail || ADMIN_EMAIL;
    const targetUser = await db.collection('users').findOne({ email: emailToUse });
    if (!targetUser) {
      return res.status(404).json({ error: `User with email ${emailToUse} not found` });
    }
    const targetUserId = targetUser._id.toString();
    
    // Get all content to find orphan userIds
    const allModels = await db.collection('models').find({}).toArray();
    const allImages = await db.collection('images').find({}).toArray();
    const allAICreations = await db.collection('ai_creations').find({}).toArray();
    
    // Find all orphan session IDs (userIds not in users table)
    const orphanIds = new Set();
    
    allModels.forEach(m => {
      const uid = m.userId?.toString();
      if (uid && !userIdSet.has(uid)) orphanIds.add(uid);
    });
    allImages.forEach(i => {
      const uid = i.userId?.toString();
      if (uid && !userIdSet.has(uid)) orphanIds.add(uid);
    });
    allAICreations.forEach(a => {
      const uid = a.userId?.toString();
      if (uid && !userIdSet.has(uid)) orphanIds.add(uid);
    });
    
    const orphanSessionIds = [...orphanIds];
    console.log(`Found ${orphanSessionIds.length} orphan session IDs:`, orphanSessionIds);
    
    if (orphanSessionIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No orphan data found - everything is already linked to real users!'
      });
    }
    
    // Migrate ALL orphan session IDs to target user
    let totalModels = 0;
    let totalImages = 0;
    let totalAI = 0;
    
    for (const sessionId of orphanSessionIds) {
      console.log(`Migrating orphan session ${sessionId} to ${emailToUse}`);
      
      const modelResult = await db.collection('models').updateMany(
        { userId: sessionId },
        { $set: { userId: targetUserId } }
      );
      const imageResult = await db.collection('images').updateMany(
        { userId: sessionId },
        { $set: { userId: targetUserId } }
      );
      const aiResult = await db.collection('ai_creations').updateMany(
        { userId: sessionId },
        { $set: { userId: targetUserId } }
      );
      
      totalModels += modelResult.modifiedCount;
      totalImages += imageResult.modifiedCount;
      totalAI += aiResult.modifiedCount;
      
      console.log(`  → ${modelResult.modifiedCount} models, ${imageResult.modifiedCount} images, ${aiResult.modifiedCount} AI`);
    }
    
    return res.status(200).json({
      success: true,
      message: `Migrated ${orphanSessionIds.length} orphan sessions to ${emailToUse}`,
      orphanSessionIds,
      migrated: {
        toUser: emailToUse,
        toUserId: targetUserId,
        models: totalModels,
        images: totalImages,
        aiCreations: totalAI
      }
    });
    
  } catch (error) {
    console.error('Fix data error:', error);
    return res.status(500).json({ error: error.message });
  }
}

