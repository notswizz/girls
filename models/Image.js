/**
 * Image model representing the girls in the hot or not game
 */
class Image {
  constructor(data) {
    this.id = data.id;
    this.url = data.url;
    this.name = data.name || '';
    this.description = data.description || '';
    this.modelId = data.modelId || null; // Reference to the model
    this.modelName = data.modelName || ''; // For convenience
    this.uploadedAt = data.uploadedAt || new Date();
    this.ratings = data.ratings || [];
    this.totalScore = data.totalScore || 0;
    this.averageScore = data.averageScore || 0;
    this.timesRated = data.timesRated || 0;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
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

  // Format for database insertion
  toDatabase() {
    return {
      url: this.url,
      name: this.name,
      description: this.description,
      modelId: this.modelId,
      modelName: this.modelName,
      uploadedAt: this.uploadedAt,
      ratings: this.ratings,
      totalScore: this.totalScore,
      averageScore: this.averageScore,
      timesRated: this.timesRated,
      isActive: this.isActive
    };
  }
}

export default Image; 