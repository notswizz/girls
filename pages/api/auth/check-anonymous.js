import { getServerSession } from "next-auth/next";
import { authOptions } from "./[...nextauth]";
import { trackAnonymousUsage } from "../../../lib/anonymousUsage";

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Check if user is already authenticated
    const session = await getServerSession(req, res, authOptions);
    
    // If authenticated, they have unlimited access
    if (session) {
      return res.status(200).json({
        authenticated: true,
        allowed: true,
        remaining: -1 // -1 indicates unlimited
      });
    }
    
    // Track anonymous usage and check if they're allowed
    const { allowed, remaining } = await trackAnonymousUsage(req);
    
    return res.status(200).json({
      authenticated: false,
      allowed,
      remaining
    });
  } catch (error) {
    console.error("Error checking anonymous access:", error);
    // In case of error, default to allowed
    return res.status(500).json({
      success: false,
      message: "Error checking access",
      allowed: true
    });
  }
} 