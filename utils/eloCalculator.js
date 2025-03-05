/**
 * ELO Rating System for Hot or Not app
 * 
 * This system calculates the new ELO ratings after a match between two images/models.
 * It includes different K-factors based on rating and match count, and considers the 
 * strength of opponents when calculating score changes.
 */

// Default K-factor (determines maximum possible adjustment per match)
const DEFAULT_K_FACTOR = 32;

// K-factors based on rating and experience
const getKFactor = (rating, matchCount) => {
  // Newer images/models get bigger adjustments (faster calibration)
  if (matchCount < 30) {
    return 40; 
  }
  
  // High-rated images/models get smaller adjustments (more stability)
  if (rating > 2000) {
    return 16;
  }
  
  // For ratings 1500-2000, slightly smaller adjustments
  if (rating > 1500) {
    return 24;
  }
  
  // Default K factor
  return DEFAULT_K_FACTOR;
};

/**
 * Calculate expected win probability
 * 
 * @param {Number} ratingA - Rating of player A
 * @param {Number} ratingB - Rating of player B
 * @returns {Number} - Expected score (probability of winning) for player A
 */
const getExpectedScore = (ratingA, ratingB) => {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
};

/**
 * Calculate new ELO ratings after a match
 * 
 * @param {Object} winner - The winning image/model
 * @param {Object} loser - The losing image/model
 * @returns {Object} - New ratings for both participants
 */
const calculateNewRatings = (winner, loser) => {
  // Get current ratings
  const winnerRating = winner.elo || 1200;
  const loserRating = loser.elo || 1200;
  
  // Get match counts
  const winnerMatches = (winner.wins || 0) + (winner.losses || 0);
  const loserMatches = (loser.wins || 0) + (loser.losses || 0);
  
  // Calculate expected scores
  const expectedWinnerScore = getExpectedScore(winnerRating, loserRating);
  const expectedLoserScore = getExpectedScore(loserRating, winnerRating);
  
  // Get K-factors based on rating and match count
  const winnerK = getKFactor(winnerRating, winnerMatches);
  const loserK = getKFactor(loserRating, loserMatches);
  
  // Calculate new ratings
  const newWinnerRating = Math.round(winnerRating + winnerK * (1 - expectedWinnerScore));
  const newLoserRating = Math.round(loserRating + loserK * (0 - expectedLoserScore));
  
  return {
    winnerNewRating: newWinnerRating,
    loserNewRating: newLoserRating,
    winnerDelta: newWinnerRating - winnerRating,
    loserDelta: newLoserRating - loserRating
  };
};

/**
 * Get a quality score for a match (how balanced the match is)
 * 
 * @param {Number} ratingA - Rating of player A
 * @param {Number} ratingB - Rating of player B
 * @returns {Number} - Quality score between 0 and 1
 */
const getMatchQuality = (ratingA, ratingB) => {
  const expectedA = getExpectedScore(ratingA, ratingB);
  return 2 * Math.min(expectedA, 1 - expectedA);
};

export { calculateNewRatings, getExpectedScore, getMatchQuality }; 