import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectToDatabase } from "../../../config";
import { ObjectId } from "mongodb";

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

    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId required" });
    }

    const { db } = await connectToDatabase();

    // Fetch user info
    let user;
    try {
      user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    } catch (e) {
      // userId might be a string (old session ID)
      user = await db.collection("users").findOne({ _id: userId });
    }

    // Fetch models for this user
    const models = await db.collection("models").find({ 
      userId: userId,
      $or: [{ isActive: true }, { isActive: { $exists: false } }]
    }).sort({ name: 1 }).toArray();

    // Fetch images for this user
    const images = await db.collection("images").find({
      userId: userId,
      isActive: true
    }).toArray();

    // Get community ratings for images
    const imageIds = images.map(img => img._id.toString());
    const communityRatings = await db.collection("community_ratings").find({
      imageId: { $in: imageIds }
    }).toArray();

    // Create map of imageId to community stats
    const communityStatsMap = {};
    for (const rating of communityRatings) {
      communityStatsMap[rating.imageId] = {
        wins: rating.wins || 0,
        losses: rating.losses || 0,
        score: rating.score || 0
      };
    }

    // Group images by model and add stats
    const imagesByModel = {};
    for (const image of images) {
      const modelId = image.modelId?.toString() || 'unknown';
      if (!imagesByModel[modelId]) {
        imagesByModel[modelId] = [];
      }
      const imgId = image._id.toString();
      const communityStats = communityStatsMap[imgId] || { wins: 0, losses: 0, score: 0 };
      imagesByModel[modelId].push({
        ...image,
        communityWins: communityStats.wins,
        communityLosses: communityStats.losses,
        communityScore: communityStats.score
      });
    }

    // Enrich models with stats
    const enrichedModels = models.map(model => {
      const modelId = model._id.toString();
      const modelImages = imagesByModel[modelId] || [];
      const communityWins = modelImages.reduce((sum, img) => sum + (img.communityWins || 0), 0);
      const communityLosses = modelImages.reduce((sum, img) => sum + (img.communityLosses || 0), 0);
      
      return {
        ...model,
        imageCount: modelImages.length,
        images: modelImages,
        communityWins,
        communityLosses
      };
    });

    return res.status(200).json({
      success: true,
      user: user || { _id: userId, name: 'Unknown', email: userId },
      models: enrichedModels,
      totalImages: images.length,
      totalModels: models.length
    });
  } catch (error) {
    console.error("Error fetching user bank:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user bank",
      error: error.message
    });
  }
}

