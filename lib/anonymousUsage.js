import { connectToDatabase } from './mongodb';

// Maximum allowed comparisons for anonymous users
const MAX_ANONYMOUS_COMPARISONS = 3;

/**
 * Track anonymous usage based on IP address
 * @param {Object} req - The request object
 * @returns {Promise<{allowed: boolean, remaining: number}>} Whether the request is allowed and how many comparisons remain
 */
export async function trackAnonymousUsage(req) {
  try {
    const { db } = await connectToDatabase();
    
    // Get IP address from request (using X-Forwarded-For or directly from connection)
    const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim();
    
    // If no IP found, allow the request (fallback)
    if (!ip) {
      console.warn('Could not determine IP address');
      return { allowed: true, remaining: MAX_ANONYMOUS_COMPARISONS };
    }
    
    // Collection to store anonymous usage
    const anonymousUsage = db.collection('anonymousUsage');
    
    // Find or create usage record for this IP
    const usageRecord = await anonymousUsage.findOne({ ip });
    
    if (!usageRecord) {
      // Create new record for this IP
      await anonymousUsage.insertOne({
        ip,
        comparisons: 1,
        firstSeen: new Date(),
        lastSeen: new Date()
      });
      
      // Allow the request with remaining counts
      return { 
        allowed: true, 
        remaining: MAX_ANONYMOUS_COMPARISONS - 1 
      };
    }
    
    // Update last seen time
    await anonymousUsage.updateOne(
      { ip },
      { 
        $set: { lastSeen: new Date() },
        $inc: { comparisons: 1 }
      }
    );
    
    // Check if user has exceeded allowed comparisons
    const totalComparisons = (usageRecord.comparisons || 0) + 1;
    const remaining = Math.max(0, MAX_ANONYMOUS_COMPARISONS - totalComparisons);
    const allowed = totalComparisons <= MAX_ANONYMOUS_COMPARISONS;
    
    return { allowed, remaining };
  } catch (error) {
    console.error('Error tracking anonymous usage:', error);
    // In case of error, allow the request
    return { allowed: true, remaining: 0 };
  }
}

/**
 * Reset anonymous usage for an IP address (e.g., after they sign in)
 * @param {string} ip - The IP address to reset
 */
export async function resetAnonymousUsage(ip) {
  try {
    if (!ip) return;
    
    const { db } = await connectToDatabase();
    const anonymousUsage = db.collection('anonymousUsage');
    
    await anonymousUsage.deleteOne({ ip });
  } catch (error) {
    console.error('Error resetting anonymous usage:', error);
  }
} 