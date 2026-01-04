import { connectToDatabase } from '../../../config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const ADMIN_EMAIL = 'emailswizz@gmail.com';

export default async function handler(req, res) {
  // Check admin auth
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user?.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { db } = await connectToDatabase();

  if (req.method === 'GET') {
    // Return info about orphan session IDs and users
    try {
      const allModels = await db.collection('models').find({}).toArray();
      const allImages = await db.collection('images').find({}).toArray();
      const allUsers = await db.collection('users').find({}).toArray();
      
      // Get unique userIds from content
      const contentUserIds = new Set([
        ...allModels.map(m => m.userId?.toString()).filter(Boolean),
        ...allImages.map(i => i.userId?.toString()).filter(Boolean)
      ]);
      
      // Get user _ids
      const userIdSet = new Set(allUsers.map(u => u._id.toString()));
      
      // Find orphan IDs (content userIds not in users table)
      const orphanIds = [...contentUserIds].filter(id => !userIdSet.has(id));
      
      // Build info about each orphan
      const orphanInfo = orphanIds.map(sessionId => {
        const modelCount = allModels.filter(m => m.userId?.toString() === sessionId).length;
        const imageCount = allImages.filter(i => i.userId?.toString() === sessionId).length;
        return { sessionId, modelCount, imageCount };
      });
      
      return res.status(200).json({
        orphanSessionIds: orphanInfo,
        users: allUsers.map(u => ({ 
          id: u._id.toString(), 
          email: u.email, 
          name: u.name 
        }))
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    // Migrate a session ID to a real user ID
    let { sessionId, targetEmail } = req.body;
    
    // If no sessionId provided, find the orphan for this email
    if (!sessionId && targetEmail) {
      const allModels = await db.collection('models').find({}).toArray();
      const allImages = await db.collection('images').find({}).toArray();
      const allUsers = await db.collection('users').find({}).toArray();
      
      const userIdSet = new Set(allUsers.map(u => u._id.toString()));
      const orphanIds = new Set();
      
      allModels.forEach(m => {
        if (m.userId && !userIdSet.has(m.userId.toString())) {
          orphanIds.add(m.userId.toString());
        }
      });
      allImages.forEach(i => {
        if (i.userId && !userIdSet.has(i.userId.toString())) {
          orphanIds.add(i.userId.toString());
        }
      });
      
      // Return available orphans
      return res.status(200).json({
        message: 'No sessionId provided. Here are orphan session IDs to choose from:',
        orphanSessionIds: [...orphanIds]
      });
    }
    
    if (!sessionId || !targetEmail) {
      return res.status(400).json({ error: 'sessionId and targetEmail are required' });
    }
    
    try {
      // Find the target user
      const targetUser = await db.collection('users').findOne({ email: targetEmail });
      if (!targetUser) {
        return res.status(404).json({ error: `User with email ${targetEmail} not found` });
      }
      
      const newUserId = targetUser._id.toString();
      
      // Update all models with this session ID
      const modelResult = await db.collection('models').updateMany(
        { userId: sessionId },
        { $set: { userId: newUserId } }
      );
      
      // Update all images with this session ID
      const imageResult = await db.collection('images').updateMany(
        { userId: sessionId },
        { $set: { userId: newUserId } }
      );
      
      // Update AI creations too
      const aiResult = await db.collection('ai_creations').updateMany(
        { userId: sessionId },
        { $set: { userId: newUserId } }
      );
      
      return res.status(200).json({
        success: true,
        message: `Migrated session ${sessionId} to user ${targetEmail}`,
        newUserId,
        modelsUpdated: modelResult.modifiedCount,
        imagesUpdated: imageResult.modifiedCount,
        aiCreationsUpdated: aiResult.modifiedCount
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

