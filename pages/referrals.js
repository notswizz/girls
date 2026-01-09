import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaLink, FaCopy, FaCheck, FaUsers, FaCoins, FaMousePointer,
  FaUserPlus, FaGift, FaShareAlt, FaTwitter, FaWhatsapp
} from 'react-icons/fa';
import { HiSparkles, HiRefresh } from 'react-icons/hi';

// Animated stat card component
const StatCard = ({ icon: Icon, label, value, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="relative group"
  >
    <div className={`absolute inset-0 bg-gradient-to-r ${color} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity`} />
    <div className="relative p-4 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 mb-3 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
        <Icon className="text-white text-lg sm:text-xl" />
      </div>
      <div className="text-2xl sm:text-3xl font-black text-white mb-1">{value}</div>
      <div className="text-xs sm:text-sm text-white/50 font-medium">{label}</div>
    </div>
  </motion.div>
);

// Referral activity item
const ActivityItem = ({ referral, index }) => {
  const isSignedUp = referral.status === 'signed_up' || referral.status === 'rewarded';
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
        isSignedUp 
          ? 'bg-gradient-to-br from-emerald-500 to-green-600' 
          : 'bg-white/10'
      }`}>
        {isSignedUp ? (
          <FaUserPlus className="text-white text-xs" />
        ) : (
          <FaMousePointer className="text-white/50 text-xs" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        {isSignedUp && referral.referredUser ? (
          <div className="flex items-center gap-2">
            {referral.referredUser.image && (
              <img 
                src={referral.referredUser.image} 
                alt="" 
                className="w-5 h-5 rounded-full"
              />
            )}
            <span className="text-sm text-white font-medium truncate">
              {referral.referredUser.name || 'New User'}
            </span>
            <span className="text-xs text-emerald-400 font-bold">signed up!</span>
          </div>
        ) : (
          <span className="text-sm text-white/50">Link clicked</span>
        )}
        <div className="text-xs text-white/30">
          {new Date(referral.clickedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
      
      {isSignedUp && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30">
          <FaCoins className="text-amber-400 text-xs" />
          <span className="text-xs font-bold text-amber-400">+50</span>
        </div>
      )}
    </motion.div>
  );
};

export default function ReferralsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [referralData, setReferralData] = useState(null);
  const [regenerating, setRegenerating] = useState(false);

  // Fetch referral data
  const fetchReferralData = useCallback(async () => {
    try {
      const res = await fetch('/api/referrals');
      const data = await res.json();
      if (data.success) {
        setReferralData(data);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchReferralData();
    } else if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [session, status, fetchReferralData, router]);

  // Generate referral link
  const referralLink = referralData?.referralCode 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${referralData.referralCode}`
    : '';

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Share functions
  const shareTwitter = () => {
    const text = encodeURIComponent('Check out fap bank - your private vault for storing, creating, and rating! 🔥');
    const url = encodeURIComponent(referralLink);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareWhatsapp = () => {
    const text = encodeURIComponent(`Check out fap bank! ${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Regenerate code
  const regenerateCode = async () => {
    setRegenerating(true);
    try {
      const res = await fetch('/api/referrals', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setReferralData(prev => ({ ...prev, referralCode: data.referralCode }));
      }
    } catch (error) {
      console.error('Error regenerating code:', error);
    } finally {
      setRegenerating(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <Layout title="Referrals - fap bank">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Layout title="Referrals - fap bank">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/30"
          >
            <FaGift className="text-2xl text-white" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            Referral Program
          </h1>
          <p className="text-white/50 max-w-md mx-auto">
            Invite friends and earn <span className="text-amber-400 font-bold">50 tokens</span> for each signup!
          </p>
        </motion.div>

        {/* Referral Link Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-violet-500/20 rounded-3xl blur-xl" />
          <div className="relative p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <FaLink className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Your Referral Link</h2>
                <p className="text-xs text-white/40">Share this link to earn rewards</p>
              </div>
            </div>

            {/* Link display */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 p-4 rounded-xl bg-black/40 border border-white/10 font-mono text-sm text-white/80 overflow-x-auto">
                {referralLink || 'Loading...'}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={copyToClipboard}
                className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg hover:shadow-pink-500/30'
                }`}
              >
                {copied ? (
                  <>
                    <FaCheck className="text-lg" />
                    Copied!
                  </>
                ) : (
                  <>
                    <FaCopy className="text-lg" />
                    Copy
                  </>
                )}
              </motion.button>
            </div>

            {/* Referral code */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-white/40 text-sm">Your code:</span>
                <span className="font-mono font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                  {referralData?.referralCode || '...'}
                </span>
              </div>
              <button
                onClick={regenerateCode}
                disabled={regenerating}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <HiRefresh className={`${regenerating ? 'animate-spin' : ''}`} />
                New code
              </button>
            </div>

            {/* Share buttons */}
            <div className="flex items-center gap-3 mt-4">
              <span className="text-sm text-white/40">Share:</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={shareTwitter}
                className="w-10 h-10 rounded-xl bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 flex items-center justify-center hover:bg-[#1DA1F2]/30 transition-all"
              >
                <FaTwitter className="text-[#1DA1F2]" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={shareWhatsapp}
                className="w-10 h-10 rounded-xl bg-[#25D366]/20 border border-[#25D366]/30 flex items-center justify-center hover:bg-[#25D366]/30 transition-all"
              >
                <FaWhatsapp className="text-[#25D366]" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={copyToClipboard}
                className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <FaShareAlt className="text-white/70" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          <StatCard
            icon={FaMousePointer}
            label="Link Clicks"
            value={referralData?.stats?.clicks || 0}
            color="from-blue-500 to-cyan-500"
            delay={0.2}
          />
          <StatCard
            icon={FaUsers}
            label="Signups"
            value={referralData?.stats?.signups || 0}
            color="from-emerald-500 to-green-500"
            delay={0.25}
          />
          <StatCard
            icon={FaCoins}
            label="Tokens Earned"
            value={referralData?.stats?.tokensEarned || 0}
            color="from-amber-500 to-orange-500"
            delay={0.3}
          />
        </div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-8"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <HiSparkles className="text-purple-400" />
            How it works
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: 1, title: 'Share your link', desc: 'Copy your unique referral link and share it with friends' },
              { step: 2, title: 'They sign up', desc: 'When they create an account using your link, we track it' },
              { step: 3, title: 'Earn rewards', desc: 'You get 50 tokens, they get 25 tokens. Everyone wins!' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
              >
                <div className="w-8 h-8 mb-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-sm font-bold text-purple-400">
                  {item.step}
                </div>
                <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-white/40">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaUsers className="text-pink-400" />
            Recent Activity
          </h3>
          
          {referralData?.recentReferrals?.length > 0 ? (
            <div className="space-y-2">
              <AnimatePresence>
                {referralData.recentReferrals.map((referral, index) => (
                  <ActivityItem key={referral.id} referral={referral} index={index} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <FaShareAlt className="text-4xl text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">
                No referrals yet. Share your link to start earning!
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}

