/**
 * Referral model for tracking referral link clicks and signups
 */
class Referral {
  constructor({
    _id = null,
    referrerId = null, // User ID of the person who shared the link
    referrerCode = '', // The referral code used
    clickedAt = new Date(),
    signedUpAt = null, // When the referred user signed up
    referredUserId = null, // User ID of the person who signed up
    referredUserEmail = null, // Email for tracking before signup
    ip = null, // For deduplication
    userAgent = null,
    source = null, // Where the click came from (optional tracking)
    status = 'clicked', // clicked | signed_up | rewarded
    rewardedAt = null,
    tokensRewarded = 0,
  }) {
    this._id = _id;
    this.referrerId = referrerId;
    this.referrerCode = referrerCode;
    this.clickedAt = clickedAt;
    this.signedUpAt = signedUpAt;
    this.referredUserId = referredUserId;
    this.referredUserEmail = referredUserEmail;
    this.ip = ip;
    this.userAgent = userAgent;
    this.source = source;
    this.status = status;
    this.rewardedAt = rewardedAt;
    this.tokensRewarded = tokensRewarded;
  }

  toDatabase() {
    return {
      referrerId: this.referrerId,
      referrerCode: this.referrerCode,
      clickedAt: this.clickedAt,
      signedUpAt: this.signedUpAt,
      referredUserId: this.referredUserId,
      referredUserEmail: this.referredUserEmail,
      ip: this.ip,
      userAgent: this.userAgent,
      source: this.source,
      status: this.status,
      rewardedAt: this.rewardedAt,
      tokensRewarded: this.tokensRewarded,
    };
  }

  static fromDatabase(doc) {
    if (!doc) return null;
    
    return new Referral({
      _id: doc._id,
      referrerId: doc.referrerId,
      referrerCode: doc.referrerCode,
      clickedAt: doc.clickedAt || new Date(),
      signedUpAt: doc.signedUpAt || null,
      referredUserId: doc.referredUserId || null,
      referredUserEmail: doc.referredUserEmail || null,
      ip: doc.ip || null,
      userAgent: doc.userAgent || null,
      source: doc.source || null,
      status: doc.status || 'clicked',
      rewardedAt: doc.rewardedAt || null,
      tokensRewarded: doc.tokensRewarded || 0,
    });
  }
}

export default Referral;

