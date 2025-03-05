/**
 * Model class representing the girls/models in the hot or not game
 */
class Model {
  constructor({
    _id = null,
    name = '',
    description = '',
    instagram = '',
    twitter = '',
    onlyfans = '',
    createdAt = new Date(),
    imageCount = 0,
    averageScore = null,
    wins = 0,
    losses = 0,
    winRate = 0,
    elo = 1200 // Starting ELO rating
  }) {
    this._id = _id;
    this.name = name;
    this.description = description;
    this.instagram = instagram;
    this.twitter = twitter;
    this.onlyfans = onlyfans;
    this.createdAt = createdAt;
    this.imageCount = imageCount;
    this.averageScore = averageScore;
    this.wins = wins;
    this.losses = losses;
    this.winRate = winRate;
    this.elo = elo;
  }

  // Format for database insertion
  toDatabase() {
    return {
      name: this.name,
      description: this.description,
      instagram: this.instagram,
      twitter: this.twitter,
      onlyfans: this.onlyfans,
      createdAt: this.createdAt,
      imageCount: this.imageCount,
      averageScore: this.averageScore,
      wins: this.wins,
      losses: this.losses,
      winRate: this.winRate,
      elo: this.elo
    };
  }

  static fromDatabase(doc) {
    return new Model({
      _id: doc._id,
      name: doc.name,
      description: doc.description,
      instagram: doc.instagram || '',
      twitter: doc.twitter || '',
      onlyfans: doc.onlyfans || '',
      createdAt: doc.createdAt,
      imageCount: doc.imageCount,
      averageScore: doc.averageScore,
      wins: doc.wins || 0,
      losses: doc.losses || 0,
      winRate: doc.winRate || 0,
      elo: doc.elo || 1200
    });
  }
}

export default Model; 