import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { connectToDatabase } from '../../../lib/mongodb';
import { isValidReferralCode, REFERRAL_REWARD_TOKENS, REFERRAL_BONUS_TOKENS } from '../../../utils/referralCode';
import { ObjectId } from 'mongodb';

/**
 * Complete a referral after a new user signs up
 * Called by frontend after successful signup if there's a pending referral code
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'You must be logged in' });
  }

  const { code } = req.body;

  if (!code || !isValidReferralCode(code)) {
    return res.status(400).json({ error: 'Invalid referral code' });
  }

  try {
    const { db } = await connectToDatabase();
    const users = db.collection('users');
    const referrals = db.collection('referrals');

    const userId = new ObjectId(session.user.id);
    const user = await users.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow self-referral
    if (user.referralCode === code.toUpperCase()) {
      return res.status(400).json({ error: 'Cannot refer yourself' });
    }

    // Check if user was already referred
    if (user.referredBy) {
      return res.status(400).json({ error: 'You have already been referred' });
    }

    // Find the referrer
    const referrer = await users.findOne({ 
      referralCode: code.toUpperCase() 
    });

    if (!referrer) {
      return res.status(404).json({ error: 'Referral code not found' });
    }

    // Check if this referral was already completed
    const existingReferral = await referrals.findOne({
      referredUserId: userId.toString(),
      status: { $in: ['signed_up', 'rewarded'] },
    });

    if (existingReferral) {
      return res.status(400).json({ error: 'Referral already completed' });
    }

    // Find any pending click referral for this code and update it
    const pendingReferral = await referrals.findOne({
      referrerCode: code.toUpperCase(),
      status: 'clicked',
      referredUserId: null,
    }, {
      sort: { clickedAt: -1 }
    });

    const now = new Date();

    if (pendingReferral) {
      // Update existing click record
      await referrals.updateOne(
        { _id: pendingReferral._id },
        {
          $set: {
            referredUserId: userId.toString(),
            referredUserEmail: user.email,
            signedUpAt: now,
            status: 'rewarded',
            rewardedAt: now,
            tokensRewarded: REFERRAL_REWARD_TOKENS,
          }
        }
      );
    } else {
      // Create new referral record
      await referrals.insertOne({
        referrerId: referrer._id.toString(),
        referrerCode: code.toUpperCase(),
        clickedAt: now,
        signedUpAt: now,
        referredUserId: userId.toString(),
        referredUserEmail: user.email,
        status: 'rewarded',
        rewardedAt: now,
        tokensRewarded: REFERRAL_REWARD_TOKENS,
      });
    }

    // Update the referrer's stats and tokens
    await users.updateOne(
      { _id: referrer._id },
      {
        $inc: {
          tokens: REFERRAL_REWARD_TOKENS,
          referralCount: 1,
          referralTokensEarned: REFERRAL_REWARD_TOKENS,
        }
      }
    );

    // Update the referred user
    await users.updateOne(
      { _id: userId },
      {
        $set: { referredBy: referrer._id.toString() },
        $inc: { tokens: REFERRAL_BONUS_TOKENS },
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Referral completed successfully!',
      tokensEarned: REFERRAL_BONUS_TOKENS,
      referrerName: referrer.name,
    });
  } catch (error) {
    console.error('Error completing referral:', error);
    return res.status(500).json({ error: 'Failed to complete referral' });
  }
}

