import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { connectToDatabase } from '../../../lib/mongodb';
import { generateReferralCode, REFERRAL_REWARD_TOKENS } from '../../../utils/referralCode';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'You must be logged in to access referrals' });
  }

  const { db } = await connectToDatabase();
  const users = db.collection('users');
  const referrals = db.collection('referrals');

  const userId = new ObjectId(session.user.id);

  if (req.method === 'GET') {
    try {
      // Get user's referral code (generate if doesn't exist)
      let user = await users.findOne({ _id: userId });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Generate referral code if user doesn't have one
      if (!user.referralCode) {
        let code = generateReferralCode();
        
        // Ensure code is unique
        let attempts = 0;
        while (await users.findOne({ referralCode: code }) && attempts < 10) {
          code = generateReferralCode();
          attempts++;
        }

        await users.updateOne(
          { _id: userId },
          { 
            $set: { 
              referralCode: code,
              referralCount: user.referralCount || 0,
              referralTokensEarned: user.referralTokensEarned || 0,
            } 
          }
        );

        user = await users.findOne({ _id: userId });
      }

      // Get referral stats
      const clickCount = await referrals.countDocuments({ 
        referrerId: userId.toString() 
      });

      const signupCount = await referrals.countDocuments({ 
        referrerId: userId.toString(),
        status: { $in: ['signed_up', 'rewarded'] }
      });

      // Get recent referrals
      const recentReferrals = await referrals.find({
        referrerId: userId.toString(),
      })
        .sort({ clickedAt: -1 })
        .limit(20)
        .toArray();

      // Get referred users info
      const referredUserIds = recentReferrals
        .filter(r => r.referredUserId)
        .map(r => {
          try {
            return new ObjectId(r.referredUserId);
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      const referredUsers = referredUserIds.length > 0 
        ? await users.find({ _id: { $in: referredUserIds } }).toArray()
        : [];

      const referredUsersMap = {};
      referredUsers.forEach(u => {
        referredUsersMap[u._id.toString()] = {
          name: u.name,
          image: u.image,
          createdAt: u.createdAt,
        };
      });

      return res.status(200).json({
        success: true,
        referralCode: user.referralCode,
        stats: {
          clicks: clickCount,
          signups: signupCount,
          tokensEarned: user.referralTokensEarned || 0,
          rewardPerReferral: REFERRAL_REWARD_TOKENS,
        },
        recentReferrals: recentReferrals.map(r => ({
          id: r._id.toString(),
          clickedAt: r.clickedAt,
          signedUpAt: r.signedUpAt,
          status: r.status,
          referredUser: r.referredUserId ? referredUsersMap[r.referredUserId] : null,
        })),
      });
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      return res.status(500).json({ error: 'Failed to fetch referral stats' });
    }
  }

  if (req.method === 'POST') {
    // Regenerate referral code
    try {
      let code = generateReferralCode();
      
      // Ensure code is unique
      let attempts = 0;
      while (await users.findOne({ referralCode: code }) && attempts < 10) {
        code = generateReferralCode();
        attempts++;
      }

      await users.updateOne(
        { _id: userId },
        { $set: { referralCode: code } }
      );

      return res.status(200).json({
        success: true,
        referralCode: code,
      });
    } catch (error) {
      console.error('Error generating referral code:', error);
      return res.status(500).json({ error: 'Failed to generate referral code' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

