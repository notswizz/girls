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

    // Get all counts in parallel
    const [
      totalUsers,
      totalModels,
      totalImages,
      publicModels,
      aiCreations,
      comparisonsCount,
      communityVotesCount
    ] = await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("models").countDocuments(),
      db.collection("images").countDocuments(),
      db.collection("models").countDocuments({ isPublic: true }),
      db.collection("ai_creations").countDocuments(),
      db.collection("comparisons").countDocuments(),
      db.collection("community_votes").countDocuments()
    ]);

    // Total votes = comparisons (personal rating) + community votes (explore)
    const totalVotes = comparisonsCount + communityVotesCount;

    return res.status(200).json({
      success: true,
      totalUsers,
      totalModels,
      totalImages,
      publicModels,
      totalAICreations: aiCreations,
      totalVotes
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching stats",
      error: error.message
    });
  }
}

