/**
 * Enhanced ELO Rating System for Hot or Not app
 * 
 * This system calculates new ELO ratings after matches between images/models.
 * Features:
 * - Dynamic K-factors based on rating, match count, and rating volatility
 * - Rating floors to prevent unrealistic low ratings
 * - Adjustment multiplier based on expectedness of outcome
 * - Provisional period handling for new entries
 * - Match quality calculation for balanced matchmaking
 */

// Constants for the ELO system
const DEFAULT_K_FACTOR = 32;      // Standard adjustment amount
const BASE_RATING = 1200;         // Starting rating for new images
const RATING_FLOOR = 800;         // Minimum possible rating
const PROVISIONAL_THRESHOLD = 15; // Number of matches before an image is no longer provisional

/**
 * Get the appropriate K-factor based on image characteristics
 * K-factor determines how much a rating can change in a single match
 * 
 * @param {Number} rating - Current rating of the image
 * @param {Number} matchCount - Number of matches the image has participated in
 * @returns {Number} - The K-factor to use for this image
 */
const getKFactor = (rating, matchCount) => {
  // Provisional period - new images need faster calibration
  if (matchCount < PROVISIONAL_THRESHOLD) {
    return 40 + Math.max(0, PROVISIONAL_THRESHOLD - matchCount) * 2; // Even faster for very new images
  }
  
  // Very new images (but past initial provisional) still need larger adjustments
  if (matchCount < 30) {
    return 40;
  }
  
  // High-rated images get smaller adjustments for stability at the top
  if (rating > 2100) {
    return 12; // More stability for the highest rated
  }
  
  if (rating > 1800) {
    return 16;
  }
  
  // Intermediate ratings
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
  // Get current ratings with defaults
  const winnerRating = winner.elo || BASE_RATING;
  const loserRating = loser.elo || BASE_RATING;
  
  // Get match counts
  const winnerMatches = (winner.wins || 0) + (winner.losses || 0);
  const loserMatches = (loser.wins || 0) + (loser.losses || 0);
  
  // Calculate expected scores (probability of winning)
  const expectedWinnerScore = getExpectedScore(winnerRating, loserRating);
  const expectedLoserScore = getExpectedScore(loserRating, winnerRating);
  
  // Calculate unexpectedness factor - increase rating changes for surprising outcomes
  // This rewards upsets more and penalizes favorites who lose more
  const unexpectednessMultiplier = 1 + Math.max(0, 0.5 - expectedWinnerScore);
  
  // Get base K-factors based on rating and match count
  let winnerK = getKFactor(winnerRating, winnerMatches);
  let loserK = getKFactor(loserRating, loserMatches);
  
  // Apply the unexpectedness multiplier to boost changes for surprising results
  winnerK = Math.round(winnerK * unexpectednessMultiplier);
  loserK = Math.round(loserK * unexpectednessMultiplier);
  
  // Calculate new ratings
  let newWinnerRating = Math.round(winnerRating + winnerK * (1 - expectedWinnerScore));
  let newLoserRating = Math.round(loserRating + loserK * (0 - expectedLoserScore));
  
  // Apply rating floor to prevent unrealistically low ratings
  newLoserRating = Math.max(RATING_FLOOR, newLoserRating);
  
  // Special handling for new images (extra boost to help establish clear hierarchies)
  if (winnerMatches < PROVISIONAL_THRESHOLD && loserMatches > PROVISIONAL_THRESHOLD) {
    // New image beating established image gets extra boost
    newWinnerRating += Math.round(10 * (1 - expectedWinnerScore));
  }
  
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

/**
 * Get a descriptive tier/category based on an Elo rating
 * 
 * @param {Number} rating - The Elo rating
 * @returns {String} - The tier/category name
 */
const getRatingTier = (rating) => {
  if (rating >= 2200) return 'LEGENDARY';
  if (rating >= 2000) return 'ELITE';
  if (rating >= 1800) return 'OUTSTANDING';
  if (rating >= 1600) return 'EXCELLENT';
  if (rating >= 1400) return 'ABOVE AVERAGE';
  if (rating >= 1200) return 'AVERAGE';
  if (rating >= 1000) return 'BELOW AVERAGE';
  return 'BEGINNER';
};

/**
 * Calculate the percentile of a rating among all ratings
 * 
 * @param {Number} rating - The rating to find the percentile for
 * @param {Array} allRatings - Array of all ratings in the system
 * @returns {Number} - Percentile from 0 to 100
 */
const calculatePercentile = (rating, allRatings) => {
  if (!allRatings || allRatings.length === 0) return 50;
  
  const sortedRatings = [...allRatings].sort((a, b) => a - b);
  const position = sortedRatings.findIndex(r => r >= rating);
  
  if (position === -1) return 100; // Higher than all ratings
  return Math.round((position / sortedRatings.length) * 100);
};

export { 
  calculateNewRatings, 
  getExpectedScore, 
  getMatchQuality, 
  getRatingTier,
  calculatePercentile,
  BASE_RATING
}; 