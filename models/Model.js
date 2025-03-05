/**
 * Model class representing the girls/models in the hot or not game
 */
class Model {
  constructor(data) {
    this.id = data.id;
    this.name = data.name || '';
    this.description = data.description || '';
    this.createdAt = data.createdAt || new Date();
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.imageCount = data.imageCount || 0;
    this.averageScore = data.averageScore || 0;
  }

  // Format for database insertion
  toDatabase() {
    return {
      name: this.name,
      description: this.description,
      createdAt: this.createdAt,
      isActive: this.isActive,
      imageCount: this.imageCount,
      averageScore: this.averageScore
    };
  }
}

export default Model; 