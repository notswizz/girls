import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectToDatabase } from "../../../config";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const ADMIN_EMAIL = 'emailswizz@gmail.com';
    
    if (!session) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    if (session.user?.email !== ADMIN_EMAIL) {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const { db } = await connectToDatabase();

    // Fetch all users
    const users = await db.collection("users").find({}).toArray();

    // Get all models and images to build counts
    const allModels = await db.collection("models").find({}).toArray();
    const allImages = await db.collection("images").find({}).toArray();
    
    // Build count maps
    const modelCountMap = {};
    const imageCountMap = {};
    const voteCountMap = {};
    
    allModels.forEach(m => {
      const key = m.userId?.toString() || 'unknown';
      modelCountMap[key] = (modelCountMap[key] || 0) + 1;
    });
    
    allImages.forEach(i => {
      const key = i.userId?.toString() || 'unknown';
      imageCountMap[key] = (imageCountMap[key] || 0) + 1;
      const votes = (i.wins || 0) + (i.losses || 0);
      voteCountMap[key] = (voteCountMap[key] || 0) + votes;
    });

    // Get unique userIds from models/images that aren't in users table
    const allContentUserIds = new Set([
      ...allModels.map(m => m.userId?.toString()),
      ...allImages.map(i => i.userId?.toString())
    ].filter(Boolean));
    
    const userIdSet = new Set(users.map(u => u._id?.toString()));
    
    // Find content creators not in users table (orphan session IDs)
    const orphanUserIds = [...allContentUserIds].filter(id => !userIdSet.has(id));

    // Enrich registered users with stats
    const enrichedUsers = users.map(user => {
      const idString = user._id?.toString();
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt || user.updatedAt || user.createdAt,
        modelCount: modelCountMap[idString] || 0,
        imageCount: imageCountMap[idString] || 0,
        voteCount: voteCountMap[idString] || 0,
        isOrphan: false
      };
    });

    // Add orphan content creators (session IDs with content but no matching user)
    orphanUserIds.forEach(sessionId => {
      enrichedUsers.push({
        _id: sessionId,
        name: `Unmapped Session`,
        email: sessionId,
        image: null,
        createdAt: null,
        lastLoginAt: null,
        modelCount: modelCountMap[sessionId] || 0,
        imageCount: imageCountMap[sessionId] || 0,
        voteCount: voteCountMap[sessionId] || 0,
        isOrphan: true,
        sessionId: sessionId
      });
    });

    return res.status(200).json({
      success: true,
      users: enrichedUsers
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message
    });
  }
}
