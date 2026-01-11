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
    unclaimedPoints = 0, // points waiting to be claimed
    lastClaimAt = null, // when they last claimed points
    totalPointsClaimed = 0, // lifetime total claimed
    revealHistory = [], // array of { modelId, timestamp, cost }
    // Referral system fields
    referralCode = null, // Unique code for this user to share
    referredBy = null, // User ID of who referred them
    referralCount = 0, // Number of successful referrals
    referralTokensEarned = 0, // Total tokens earned from referrals
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
    this.unclaimedPoints = unclaimedPoints;
    this.lastClaimAt = lastClaimAt;
    this.totalPointsClaimed = totalPointsClaimed;
    this.revealHistory = revealHistory;
    this.referralCode = referralCode;
    this.referredBy = referredBy;
    this.referralCount = referralCount;
    this.referralTokensEarned = referralTokensEarned;
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
      unclaimedPoints: this.unclaimedPoints,
      lastClaimAt: this.lastClaimAt,
      totalPointsClaimed: this.totalPointsClaimed,
      revealHistory: this.revealHistory,
      referralCode: this.referralCode,
      referredBy: this.referredBy,
      referralCount: this.referralCount,
      referralTokensEarned: this.referralTokensEarned,
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
      unclaimedPoints: doc.unclaimedPoints || 0,
      lastClaimAt: doc.lastClaimAt || null,
      totalPointsClaimed: doc.totalPointsClaimed || 0,
      revealHistory: doc.revealHistory || [],
      referralCode: doc.referralCode || null,
      referredBy: doc.referredBy || null,
      referralCount: doc.referralCount || 0,
      referralTokensEarned: doc.referralTokensEarned || 0,
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