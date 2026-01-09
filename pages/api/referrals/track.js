import { connectToDatabase } from '../../../lib/mongodb';
import { isValidReferralCode } from '../../../utils/referralCode';
import Referral from '../../../models/Referral';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, source } = req.body;

  if (!code || !isValidReferralCode(code)) {
    return res.status(400).json({ error: 'Invalid referral code' });
  }

  try {
    const { db } = await connectToDatabase();
    const users = db.collection('users');
    const referrals = db.collection('referrals');

    // Find the user who owns this referral code
    const referrer = await users.findOne({ 
      referralCode: code.toUpperCase() 
    });

    if (!referrer) {
      return res.status(404).json({ error: 'Referral code not found' });
    }

    // Get IP and user agent for deduplication
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
               req.headers['x-real-ip'] || 
               req.connection?.remoteAddress || 
               'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Check for recent duplicate clicks (same IP within last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentClick = await referrals.findOne({
      referrerCode: code.toUpperCase(),
      ip: ip,
      clickedAt: { $gte: oneHourAgo },
    });

    if (recentClick) {
      // Already tracked this click recently
      return res.status(200).json({ 
        success: true, 
        message: 'Click already tracked',
        referrerId: referrer._id.toString(),
      });
    }

    // Create new referral tracking record
    const referral = new Referral({
      referrerId: referrer._id.toString(),
      referrerCode: code.toUpperCase(),
      clickedAt: new Date(),
      ip: ip,
      userAgent: userAgent,
      source: source || null,
      status: 'clicked',
    });

    await referrals.insertOne(referral.toDatabase());

    return res.status(200).json({ 
      success: true,
      message: 'Click tracked successfully',
      referrerId: referrer._id.toString(),
    });
  } catch (error) {
    console.error('Error tracking referral click:', error);
    return res.status(500).json({ error: 'Failed to track referral click' });
  }
}

