// New images start at 1500 for more room to move up/down
const DEFAULT_ELO = 1500;

/**
 * Image model representing the girls in the hot or not game
 */
class Image {
  constructor({
    _id = null,
    url = '',
    name = '',
    description = '',
    modelId = null,
    modelName = '',
    modelUsername = '',
    userId = null, // User who uploaded this image
    createdAt = new Date(),
    isActive = true,
    averageScore = null,
    timesRated = 0,
    wins = 0,
    losses = 0,
    winRate = 0,
    elo = DEFAULT_ELO, // Starting ELO rating
    lastOpponents = [] // Track recent opponents for analysis
  }) {
    this._id = _id;
    this.url = url;
    this.name = name;
    this.description = description;
    this.modelId = modelId;
    this.modelName = modelName;
    this.modelUsername = modelUsername;
    this.userId = userId;
    this.createdAt = createdAt;
    this.isActive = isActive;
    this.averageScore = averageScore;
    this.timesRated = timesRated;
    this.wins = wins;
    this.losses = losses;
    this.winRate = winRate;
    this.elo = elo;
    this.lastOpponents = lastOpponents;
  }

  toDatabase() {
    return {
      url: this.url,
      name: this.name,
      description: this.description,
      modelId: this.modelId,
      modelName: this.modelName,
      modelUsername: this.modelUsername,
      userId: this.userId,
      createdAt: this.createdAt,
      isActive: this.isActive,
      averageScore: this.averageScore,
      timesRated: this.timesRated,
      wins: this.wins,
      losses: this.losses,
      winRate: this.winRate,
      elo: this.elo,
      lastOpponents: this.lastOpponents
    };
  }

  static fromDatabase(doc) {
    return new Image({
      _id: doc._id,
      url: doc.url,
      name: doc.name,
      description: doc.description,
      modelId: doc.modelId,
      modelName: doc.modelName || '',
      modelUsername: doc.modelUsername || doc.modelName || '', // Default to modelName if username not set
      userId: doc.userId || null,
      createdAt: doc.createdAt,
      isActive: doc.isActive !== false,
      averageScore: doc.averageScore,
      timesRated: doc.timesRated || 0,
      wins: doc.wins || 0,
      losses: doc.losses || 0,
      winRate: doc.winRate || 0,
      elo: doc.elo || 1500,
      lastOpponents: doc.lastOpponents || []
    });
  }

  // Calculate win rate
  calculateWinRate() {
    const totalMatches = this.wins + this.losses;
    return totalMatches > 0 ? (this.wins / totalMatches) : 0;
  }

  // Update win rate
  updateWinRate() {
    this.winRate = this.calculateWinRate();
    return this.winRate;
  }

  // Calculate the average score
  calculateScore() {
    if (this.ratings.length === 0) {
      this.averageScore = 0;
      this.totalScore = 0;
      this.timesRated = 0;
      return;
    }

    this.timesRated = this.ratings.length;
    this.totalScore = this.ratings.reduce((sum, rating) => sum + rating.score, 0);
    this.averageScore = this.totalScore / this.timesRated;
  }

  // Add a new rating
  addRating(userId, score) {
    // Check if the user already rated this image
    const existingRatingIndex = this.ratings.findIndex(r => r.userId === userId);
    
    if (existingRatingIndex !== -1) {
      // Update existing rating
      this.ratings[existingRatingIndex].score = score;
    } else {
      // Add new rating
      this.ratings.push({
        userId,
        score,
        ratedAt: new Date()
      });
    }
    
    // Recalculate score
    this.calculateScore();
  }
}

export default Image; 