/**
 * User model representing authenticated users in the application
 */
class User {
  constructor({
    _id = null,
    name = '',
    email = '',
    image = '',
    emailVerified = null,
    googleId = '',
    isAdmin = false,
    createdAt = new Date(),
    updatedAt = new Date(),
    // Track user activity and preferences
    ratingsCount = 0,
    lastLoginAt = null,
    // Token system fields
    tokens = 0, // spendable tokens, default 0
    revealHistory = [], // array of { modelId, timestamp, cost }
  }) {
    this._id = _id;
    this.name = name;
    this.email = email;
    this.image = image;
    this.emailVerified = emailVerified;
    this.googleId = googleId;
    this.isAdmin = isAdmin;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.ratingsCount = ratingsCount;
    this.lastLoginAt = lastLoginAt;
    this.tokens = tokens;
    this.revealHistory = revealHistory;
  }

  // Format for database insertion
  toDatabase() {
    return {
      name: this.name,
      email: this.email,
      image: this.image,
      emailVerified: this.emailVerified,
      googleId: this.googleId,
      isAdmin: this.isAdmin,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      ratingsCount: this.ratingsCount,
      lastLoginAt: this.lastLoginAt,
      tokens: this.tokens,
      revealHistory: this.revealHistory,
    };
  }

  static fromDatabase(doc) {
    if (!doc) return null;
    
    return new User({
      _id: doc._id,
      name: doc.name || '',
      email: doc.email || '',
      image: doc.image || '',
      emailVerified: doc.emailVerified || null,
      googleId: doc.googleId || '',
      isAdmin: doc.isAdmin || false,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
      ratingsCount: doc.ratingsCount || 0,
      lastLoginAt: doc.lastLoginAt || null,
      tokens: doc.tokens || 0,
      revealHistory: doc.revealHistory || [],
    });
  }

  // Increment ratings count
  incrementRatingsCount() {
    this.ratingsCount += 1;
    this.updatedAt = new Date();
  }

  // Update login timestamp
  updateLastLogin() {
    this.lastLoginAt = new Date();
    this.updatedAt = new Date();
  }
}

export default User; 