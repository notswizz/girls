import { getServerSession } from "next-auth/next";
import { authOptions } from "./[...nextauth]";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get current session
    const session = await getServerSession(req, res, authOptions);

    // Not authenticated
    if (!session) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    // Get user from database
    const { db } = await connectToDatabase();
    const usersCollection = db.collection("users");
    
    const userDoc = await usersCollection.findOne({ email: session.user.email });
    
    if (!userDoc) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Convert to User model
    const user = User.fromDatabase(userDoc);
    
    // Remove sensitive information
    const sanitizedUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      isAdmin: user.isAdmin,
      ratingsCount: user.ratingsCount,
      createdAt: user.createdAt,
      tokens: user.tokens || 0,
      tokensFromWins: userDoc.tokensFromWins || 0,
      tokensSpent: userDoc.tokensSpent || 0,
      referralCount: user.referralCount || 0,
      referralTokensEarned: user.referralTokensEarned || 0,
    };

    return res.status(200).json({
      success: true,
      user: sanitizedUser,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user data",
    });
  }
} 