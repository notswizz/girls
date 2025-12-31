/**
 * Model class representing the girls/models in the hot or not game
 */
class Model {
  constructor({
    _id = null,
    name = '',
    username = '',
    description = '',
    instagram = '',
    twitter = '',
    onlyfans = '',
    userId = null, // User who owns this model
    isActive = true,
    createdAt = new Date(),
    imageCount = 0,
    averageScore = null,
    wins = 0,
    losses = 0,
    winRate = 0,
    elo = 1200, // Starting ELO rating
    eloHistory = []
  }) {
    this._id = _id;
    this.name = name;
    this.username = username;
    this.description = description;
    this.instagram = instagram;
    this.twitter = twitter;
    this.onlyfans = onlyfans;
    this.userId = userId;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.imageCount = imageCount;
    this.averageScore = averageScore;
    this.wins = wins;
    this.losses = losses;
    this.winRate = winRate;
    this.elo = elo;
    // Add price/elo history for market graph
    this.eloHistory = Array.isArray(eloHistory) ? eloHistory : [];
  }

  // Format for database insertion
  toDatabase() {
    return {
      name: this.name,
      username: this.username,
      description: this.description,
      instagram: this.instagram,
      twitter: this.twitter,
      onlyfans: this.onlyfans,
      userId: this.userId,
      isActive: this.isActive,
      createdAt: this.createdAt,
      imageCount: this.imageCount,
      averageScore: this.averageScore,
      wins: this.wins,
      losses: this.losses,
      winRate: this.winRate,
      elo: this.elo,
      eloHistory: this.eloHistory
    };
  }

  static fromDatabase(doc) {
    return new Model({
      _id: doc._id,
      name: doc.name,
      username: doc.username || '',
      description: doc.description,
      instagram: doc.instagram || '',
      twitter: doc.twitter || '',
      onlyfans: doc.onlyfans || '',
      userId: doc.userId || null,
      isActive: doc.isActive !== undefined ? doc.isActive : true,
      createdAt: doc.createdAt,
      imageCount: doc.imageCount,
      averageScore: doc.averageScore,
      wins: doc.wins || 0,
      losses: doc.losses || 0,
      winRate: doc.winRate || 0,
      elo: doc.elo || 1200,
      eloHistory: doc.eloHistory || []
    });
  }
}

export default Model; 