import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { connectToDatabase } from '../../../config';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Must be logged in' });
  }

  const userId = session.user.id;
  const { db } = await connectToDatabase();

  if (req.method === 'GET') {
    // Get user's tag preferences
    try {
      const preferences = await db.collection('userPreferences').findOne({ userId });
      
      if (!preferences) {
        return res.status(200).json({
          success: true,
          preferences: {
            likedTags: {},
            dislikedTags: {},
            totalVotes: 0,
          },
        });
      }

      // Sort tags by score for display
      const sortedLiked = Object.entries(preferences.likedTags || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);
      
      const sortedDisliked = Object.entries(preferences.dislikedTags || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);

      return res.status(200).json({
        success: true,
        preferences: {
          likedTags: Object.fromEntries(sortedLiked),
          dislikedTags: Object.fromEntries(sortedDisliked),
          totalVotes: preferences.totalVotes || 0,
          topLiked: sortedLiked.slice(0, 5).map(([tag]) => tag),
          topDisliked: sortedDisliked.slice(0, 5).map(([tag]) => tag),
        },
      });
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return res.status(500).json({ error: 'Failed to fetch preferences' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Helper function to update preferences based on a vote
// This is exported so it can be called from the vote API
export async function updateUserPreferences(db, userId, winnerTags, loserTags) {
  try {
    // Get or create user preferences
    let prefs = await db.collection('userPreferences').findOne({ userId });
    
    if (!prefs) {
      prefs = {
        userId,
        likedTags: {},
        dislikedTags: {},
        totalVotes: 0,
        createdAt: new Date(),
      };
    }

    const likedTags = { ...prefs.likedTags };
    const dislikedTags = { ...prefs.dislikedTags };

    // Increase score for winner's tags (what user likes)
    for (const tagObj of winnerTags) {
      const tag = tagObj.tag;
      const confidence = tagObj.confidence || 1.0;
      const weight = confidence * 1.0; // Weight by confidence
      
      likedTags[tag] = (likedTags[tag] || 0) + weight;
      
      // If this tag was in disliked, reduce it slightly
      if (dislikedTags[tag]) {
        dislikedTags[tag] = Math.max(0, dislikedTags[tag] - weight * 0.5);
        if (dislikedTags[tag] === 0) delete dislikedTags[tag];
      }
    }

    // Increase score for loser's tags (what user doesn't prefer as much)
    for (const tagObj of loserTags) {
      const tag = tagObj.tag;
      const confidence = tagObj.confidence || 1.0;
      const weight = confidence * 0.5; // Lower weight for dislikes
      
      dislikedTags[tag] = (dislikedTags[tag] || 0) + weight;
      
      // If this tag was in liked, reduce it slightly
      if (likedTags[tag]) {
        likedTags[tag] = Math.max(0, likedTags[tag] - weight * 0.25);
        if (likedTags[tag] === 0) delete likedTags[tag];
      }
    }

    // Update in database
    await db.collection('userPreferences').updateOne(
      { userId },
      {
        $set: {
          likedTags,
          dislikedTags,
          updatedAt: new Date(),
        },
        $inc: { totalVotes: 1 },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    return { likedTags, dislikedTags };
  } catch (error) {
    console.error('Error updating preferences:', error);
    return null;
  }
}

// Calculate preference score for an image based on its tags
export function calculatePreferenceScore(imageTags, userPrefs) {
  if (!imageTags || !userPrefs) return 0;
  
  let score = 0;
  const likedTags = userPrefs.likedTags || {};
  const dislikedTags = userPrefs.dislikedTags || {};
  
  for (const tagObj of imageTags) {
    const tag = tagObj.tag;
    const confidence = tagObj.confidence || 1.0;
    
    // Add liked score
    if (likedTags[tag]) {
      score += likedTags[tag] * confidence;
    }
    
    // Subtract disliked score
    if (dislikedTags[tag]) {
      score -= dislikedTags[tag] * confidence * 0.5;
    }
  }
  
  return score;
}

