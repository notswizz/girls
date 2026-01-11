/**
 * Enhanced ELO/Glicko-inspired Rating System
 * 
 * This system produces DYNAMIC, SPREAD OUT ratings that make sense.
 * 
 * Key improvements:
 * - High K-factors for volatile, exciting rating changes
 * - Rating Deviation (RD) tracking for uncertainty-based adjustments
 * - Upset bonuses that reward surprising wins massively
 * - Streak multipliers for momentum
 * - Anti-clustering: forces ratings to spread apart
 * - Confidence intervals that tighten over time
 */

// Rating constants
const BASE_RATING = 1500;          // Starting rating (higher base for more room to fall)
const RATING_FLOOR = 800;          // Absolute minimum (raised from 600)
const RATING_CEILING = 2400;       // Absolute maximum (lowered from 2800)
const PROVISIONAL_THRESHOLD = 15;  // Matches before considered established (raised from 10)

// K-factor constants (LOWERED for less volatility)
const K_NEW = 40;                  // Brand new images - moderate volatility
const K_PROVISIONAL = 32;          // Still finding their level
const K_ESTABLISHED = 24;          // Have a track record
const K_ELITE = 16;                // Top tier, more stable

// Rating Deviation constants (uncertainty)
const RD_INITIAL = 250;            // Starting uncertainty (lowered from 350)
const RD_MIN = 50;                 // Minimum uncertainty (very confident)
const RD_MAX = 350;                // Maximum uncertainty (lowered from 500)
const RD_DECAY_PER_MATCH = 10;     // How much RD decreases per match (slower decay)

/**
 * Calculate Rating Deviation (uncertainty) for an image
 * Higher RD = less confident about rating = bigger potential swings
 */
const calculateRD = (matchCount, currentRD = RD_INITIAL) => {
  if (matchCount === 0) return RD_INITIAL;
  
  // RD decreases with more matches (we become more confident)
  const calculatedRD = RD_INITIAL - (matchCount * RD_DECAY_PER_MATCH);
  
  // Clamp between min and max
  return Math.max(RD_MIN, Math.min(RD_MAX, calculatedRD));
};

/**
 * Get dynamic K-factor based on rating, matches, and uncertainty
 * This determines how much ratings can swing in a single match
 */
const getKFactor = (rating, matchCount, rd = null) => {
  // Calculate RD if not provided
  const ratingDeviation = rd || calculateRD(matchCount);
  
  // Base K from match count tier
  let baseK;
  if (matchCount < 5) {
    baseK = K_NEW;           // First 5 matches: MAXIMUM volatility
  } else if (matchCount < PROVISIONAL_THRESHOLD) {
    baseK = K_PROVISIONAL;   // 5-10 matches: Still finding level
  } else if (matchCount < 30) {
    baseK = K_ESTABLISHED;   // 10-30 matches: Getting stable
  } else {
    baseK = K_ELITE;         // 30+: More stable
  }
  
  // Uncertainty multiplier: higher RD = modestly bigger swings (reduced from 0.5 to 0.25)
  const rdMultiplier = 1 + (ratingDeviation - RD_MIN) / (RD_INITIAL - RD_MIN) * 0.25;
  
  // Rating zone adjustments - gentler extremes
  let ratingMultiplier = 1.0;
  if (rating > 2200) {
    ratingMultiplier = 0.85;  // Very top: harder to move
  } else if (rating > 1900) {
    ratingMultiplier = 0.92; // Elite: somewhat harder
  } else if (rating < 1000) {
    ratingMultiplier = 0.9;  // Very bottom: can't fall too fast
  }
  
  return Math.round(baseK * rdMultiplier * ratingMultiplier);
};

/**
 * Calculate expected win probability using logistic curve
 * Includes RD in the calculation for more nuanced expectations
 */
const getExpectedScore = (ratingA, ratingB, rdA = RD_INITIAL, rdB = RD_INITIAL) => {
  // Standard ELO expected score with combined uncertainty
  const combinedRD = Math.sqrt(rdA * rdA + rdB * rdB);
  const scaleFactor = 400 * (1 + combinedRD / 1000); // Higher uncertainty = less predictable
  
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / scaleFactor));
};

/**
 * Calculate how surprising/upset a result is
 * Returns multiplier from 0.85 (expected) to 1.5 (modest upset)
 */
const getUpsetMultiplier = (winnerRating, loserRating, expectedWinnerScore) => {
  // If winner was expected to win (>50%), slight reduction
  if (expectedWinnerScore >= 0.5) {
    const dominanceFactor = expectedWinnerScore - 0.5;
    return Math.max(0.85, 1 - dominanceFactor * 0.3);
  }
  
  // UPSET! Winner was expected to lose
  // The bigger the upset, the bigger the multiplier (but capped lower)
  const upsetMagnitude = 0.5 - expectedWinnerScore; // 0 to 0.5
  
  // Linear upset bonus: gentler scaling, max ~1.5x
  return 1 + upsetMagnitude * 1.0;
};

/**
 * Calculate streak bonus/penalty
 * Winning streaks make wins worth slightly more
 */
const getStreakMultiplier = (wins, losses) => {
  const total = wins + losses;
  if (total < 5) return 1.0; // Not enough data
  
  const winRate = wins / total;
  
  // Hot streak bonus (>75% win rate) - very modest
  if (winRate > 0.75) {
    return 1.0 + (winRate - 0.75) * 0.2; // Up to 1.05x
  }
  
  // Cold streak penalty (<25% win rate) - very modest
  if (winRate < 0.25) {
    return 1.0 + (0.25 - winRate) * 0.2; // Up to 1.05x
  }
  
  return 1.0;
};

/**
 * Main rating calculation function
 * Returns new ratings after a head-to-head match
 */
const calculateNewRatings = (winner, loser) => {
  // Get current ratings with defaults
  const winnerRating = winner.elo || BASE_RATING;
  const loserRating = loser.elo || BASE_RATING;
  
  // Get match counts
  const winnerMatches = (winner.wins || 0) + (winner.losses || 0);
  const loserMatches = (loser.wins || 0) + (loser.losses || 0);
  
  // Calculate Rating Deviations
  const winnerRD = calculateRD(winnerMatches);
  const loserRD = calculateRD(loserMatches);
  
  // Calculate expected scores (probability of winning)
  const expectedWinnerScore = getExpectedScore(winnerRating, loserRating, winnerRD, loserRD);
  const expectedLoserScore = 1 - expectedWinnerScore;
  
  // Get base K-factors
  let winnerK = getKFactor(winnerRating, winnerMatches, winnerRD);
  let loserK = getKFactor(loserRating, loserMatches, loserRD);
  
  // Apply upset multiplier
  const upsetMult = getUpsetMultiplier(winnerRating, loserRating, expectedWinnerScore);
  winnerK = Math.round(winnerK * upsetMult);
  loserK = Math.round(loserK * upsetMult);
  
  // Apply streak multipliers
  const winnerStreakMult = getStreakMultiplier(winner.wins || 0, winner.losses || 0);
  const loserStreakMult = getStreakMultiplier(loser.wins || 0, loser.losses || 0);
  winnerK = Math.round(winnerK * winnerStreakMult);
  loserK = Math.round(loserK * loserStreakMult);
  
  // Calculate raw rating changes
  let winnerDelta = Math.round(winnerK * (1 - expectedWinnerScore));
  let loserDelta = Math.round(loserK * (0 - expectedLoserScore));
  
  // Minimum change guarantee: ensure some movement (reduced from 5 to 2)
  if (winnerDelta < 2) winnerDelta = 2;
  if (loserDelta > -2) loserDelta = -2;
  
  // Provisional bonus: new images beating established ones get modest boost
  if (winnerMatches < PROVISIONAL_THRESHOLD && loserMatches >= PROVISIONAL_THRESHOLD) {
    const provisionalBonus = Math.round(8 * (1 - expectedWinnerScore));
    winnerDelta += provisionalBonus;
  }
  
  // Anti-clustering: if ratings are very close, push them apart slightly
  const ratingDiff = Math.abs(winnerRating - loserRating);
  if (ratingDiff < 50) {
    const clusteringPenalty = Math.round((50 - ratingDiff) / 15);
    winnerDelta += clusteringPenalty;
    loserDelta -= clusteringPenalty;
  }
  
  // Calculate new ratings
  let newWinnerRating = winnerRating + winnerDelta;
  let newLoserRating = loserRating + loserDelta;
  
  // Clamp to valid range
  newWinnerRating = Math.max(RATING_FLOOR, Math.min(RATING_CEILING, newWinnerRating));
  newLoserRating = Math.max(RATING_FLOOR, Math.min(RATING_CEILING, newLoserRating));
  
  // Recalculate actual deltas after clamping
  const actualWinnerDelta = newWinnerRating - winnerRating;
  const actualLoserDelta = newLoserRating - loserRating;
  
  return {
    winnerNewRating: newWinnerRating,
    loserNewRating: newLoserRating,
    winnerDelta: actualWinnerDelta,
    loserDelta: actualLoserDelta,
    // Bonus info for debugging/display
    upset: upsetMult > 1.1,
    upsetMultiplier: upsetMult,
    expectedWinnerScore,
    winnerRD,
    loserRD
  };
};

/**
 * Get a quality score for a match (how balanced/interesting it is)
 * 1.0 = perfectly balanced, 0.0 = completely one-sided
 */
const getMatchQuality = (ratingA, ratingB) => {
  const expectedA = getExpectedScore(ratingA, ratingB);
  // Quality is highest when expected score is near 0.5
  return 1 - Math.abs(expectedA - 0.5) * 2;
};

/**
 * Get a descriptive tier/category based on rating
 * (adjusted for tighter rating range 800-2400)
 */
const getRatingTier = (rating) => {
  if (rating >= 2200) return 'LEGENDARY';
  if (rating >= 2000) return 'ELITE';
  if (rating >= 1800) return 'OUTSTANDING';
  if (rating >= 1650) return 'EXCELLENT';
  if (rating >= 1500) return 'ABOVE AVERAGE';
  if (rating >= 1350) return 'AVERAGE';
  if (rating >= 1200) return 'BELOW AVERAGE';
  if (rating >= 1000) return 'STRUGGLING';
  return 'BEGINNER';
};

/**
 * Calculate percentile of a rating among all ratings
 */
const calculatePercentile = (rating, allRatings) => {
  if (!allRatings || allRatings.length === 0) return 50;
  
  const sortedRatings = [...allRatings].sort((a, b) => a - b);
  const position = sortedRatings.findIndex(r => r >= rating);
  
  if (position === -1) return 100;
  return Math.round((position / sortedRatings.length) * 100);
};

/**
 * Wilson Score Lower Bound
 * Statistically fair ranking that accounts for sample size
 */
const calculateWilsonScore = (wins, losses, z = 1.96) => {
  const n = wins + losses;
  if (n === 0) return 0;
  
  const p = wins / n;
  const denominator = 1 + (z * z) / n;
  const centre = p + (z * z) / (2 * n);
  const spread = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
  
  return (centre - spread) / denominator;
};

/**
 * Calculate a model's aggregate score from their top images
 * Uses a combination of ELO, Wilson score, and confidence
 */
const calculateModelScore = (images, topN = 5) => {
  if (!images || images.length === 0) {
    return {
      score: 0,
      wilsonScore: 0,
      avgElo: BASE_RATING,
      topElo: BASE_RATING,
      totalWins: 0,
      totalLosses: 0,
      winRate: 0,
      confidence: 0,
      imagesUsed: 0
    };
  }
  
  // Filter to only rated images
  const ratedImages = images.filter(img => (img.wins || 0) + (img.losses || 0) > 0);
  
  if (ratedImages.length === 0) {
    return {
      score: 0,
      wilsonScore: 0,
      avgElo: BASE_RATING,
      topElo: BASE_RATING,
      totalWins: 0,
      totalLosses: 0,
      winRate: 0,
      confidence: 0,
      imagesUsed: 0
    };
  }
  
  // Sort by ELO descending
  const sortedByElo = [...ratedImages].sort((a, b) => (b.elo || BASE_RATING) - (a.elo || BASE_RATING));
  
  // Take top N images
  const topImages = sortedByElo.slice(0, Math.min(topN, sortedByElo.length));
  
  // Calculate aggregate stats from top images
  const totalWins = topImages.reduce((sum, img) => sum + (img.wins || 0), 0);
  const totalLosses = topImages.reduce((sum, img) => sum + (img.losses || 0), 0);
  const totalMatches = totalWins + totalLosses;
  
  const winRate = totalMatches > 0 ? totalWins / totalMatches : 0;
  const wilsonScore = calculateWilsonScore(totalWins, totalLosses);
  
  // Weighted average ELO (top image counts more)
  const weights = topImages.map((_, i) => Math.pow(0.7, i)); // 1.0, 0.7, 0.49, ...
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const weightedElo = topImages.reduce((sum, img, i) => {
    return sum + (img.elo || BASE_RATING) * weights[i];
  }, 0) / totalWeight;
  
  const topElo = topImages[0]?.elo || BASE_RATING;
  
  // Confidence based on matches
  const confidence = Math.min(1, totalMatches / 30);
  
  // Combined score: blend of Wilson score (sample-size adjusted) and ELO
  // Wilson gives 0-1, scale to 0-1000 then blend with normalized ELO
  const normalizedElo = Math.max(0, Math.min(1000, (weightedElo - 600) / 2.2));
  const wilsonComponent = wilsonScore * 500;
  
  // More weight to ELO as confidence grows
  const score = Math.round(wilsonComponent * (1 - confidence * 0.5) + normalizedElo * (confidence * 0.5));
  
  return {
    score,
    wilsonScore,
    avgElo: Math.round(weightedElo),
    topElo: Math.round(topElo),
    totalWins,
    totalLosses,
    winRate,
    confidence,
    imagesUsed: topImages.length
  };
};

export { 
  calculateNewRatings, 
  getExpectedScore, 
  getMatchQuality, 
  getRatingTier,
  calculatePercentile,
  calculateWilsonScore,
  calculateModelScore,
  calculateRD,
  getKFactor,
  BASE_RATING,
  RATING_FLOOR,
  RATING_CEILING
};
