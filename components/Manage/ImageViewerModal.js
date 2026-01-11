import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaTrash, FaTrophy, FaChartLine, FaFire, FaUsers, FaTags, FaTimes, FaPlay, FaRobot, FaCrown, FaExpand } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

// Helper to check if URL is a video
const isVideoUrl = (url) => {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext));
};

export default function ImageViewerModal({ image, onClose, onDelete }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!image) return null;
  if (!mounted) return null;

  const wins = image.wins || 0;
  const losses = image.losses || 0;
  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? wins / totalMatches : 0;
  const elo = image.elo || 1500;

  // ELO tier system - adjusted for new 1500 base
  const getEloTier = (elo) => {
    if (elo >= 2000) return { label: 'Legendary', color: 'text-yellow-400', bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20', border: 'border-yellow-500/30' };
    if (elo >= 1800) return { label: 'Elite', color: 'text-purple-400', bg: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30' };
    if (elo >= 1600) return { label: 'Excellent', color: 'text-cyan-400', bg: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30' };
    if (elo >= 1400) return { label: 'Great', color: 'text-green-400', bg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20', border: 'border-green-500/30' };
    if (elo >= 1200) return { label: 'Average', color: 'text-white/60', bg: 'bg-white/10', border: 'border-white/10' };
    if (elo >= 1000) return { label: 'Below Avg', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
    return { label: 'Rising', color: 'text-white/40', bg: 'bg-white/5', border: 'border-white/5' };
  };

  const tier = getEloTier(elo);

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black overflow-y-auto"
      style={{ 
        zIndex: 99999,
        paddingTop: 'env(safe-area-inset-top, 0px)', 
        paddingBottom: 'env(safe-area-inset-bottom, 0px)' 
      }}
    >
      {/* Fixed Header */}
      <div 
        className="sticky top-0 left-0 right-0 flex items-center justify-between px-4 py-4 bg-gradient-to-b from-black via-black/90 to-transparent backdrop-blur-sm"
        style={{ 
          zIndex: 100000,
          paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))',
          paddingBottom: '24px'
        }}
      >
        {/* Back button */}
        <motion.button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 text-white font-medium hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10"
          whileTap={{ scale: 0.95 }}
        >
          <FaArrowLeft size={14} />
          <span>Back</span>
        </motion.button>
        
        {/* Status badge */}
        <div className={`px-4 py-2 rounded-full text-xs font-bold ${tier.bg} ${tier.color} border ${tier.border}`}>
          {tier.label}
        </div>
        
        {/* Delete button */}
        <motion.button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-3 rounded-full text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 transition-all border border-red-500/20"
          whileTap={{ scale: 0.95 }}
        >
          <FaTrash size={14} />
        </motion.button>
      </div>

      {/* Scrollable Content */}
      <div className="flex flex-col min-h-0 px-4">
        {/* Image/Video Container */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 shadow-2xl"
        >
          {isVideoUrl(image.url) || image.aiType === 'video' ? (
            <video
              src={image.url}
              className="w-full"
              style={{ maxHeight: '50vh', objectFit: 'contain' }}
              controls
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={image.url}
              alt=""
              className="w-full"
              style={{ maxHeight: '50vh', objectFit: 'contain' }}
            />
          )}
          
          {/* AI Generated badge */}
          {image.isAIGenerated && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
              <HiSparkles className="text-white text-xs" />
              <span className="text-white text-xs font-bold">AI Generated</span>
            </div>
          )}
        </motion.div>

        {/* Stats Section */}
        <div className="mt-6 space-y-4">
          {/* Main Score Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-5 rounded-2xl ${tier.bg} border ${tier.border}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isExplore ? (
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <FaUsers className="text-cyan-400 text-lg" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <FaTrophy className="text-yellow-400 text-lg" />
                  </div>
                )}
                <div>
                  <div className="text-white/50 text-xs uppercase tracking-wider">
                    ELO Rating
                  </div>
                  <div className="text-3xl font-black text-white">{Math.round(elo)}</div>
                </div>
              </div>
              <div className={`text-right ${tier.color}`}>
                <div className="text-2xl font-bold">{tier.label}</div>
                <div className="text-xs opacity-70">Tier</div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          {totalMatches > 0 ? (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-3 gap-3"
              >
                {/* Win Rate */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                  <div className="text-2xl font-bold text-white">{Math.round(winRate * 100)}%</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Win Rate</div>
                </div>

                {/* Total Votes */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <FaFire className="text-orange-400" size={14} />
                  </div>
                  <div className="text-2xl font-bold text-white">{totalMatches}</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Votes</div>
                </div>

                {/* ELO (only for gallery mode) */}
                {!isExplore ? (
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <FaChartLine className="text-cyan-400" size={14} />
                    </div>
                    <div className="text-2xl font-bold text-white">{Math.round(elo)}</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">ELO</div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <FaCrown className="text-yellow-400" size={14} />
                    </div>
                    <div className="text-2xl font-bold text-white">{wins}</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Wins</div>
                  </div>
                )}
              </motion.div>

              {/* Win/Loss Bar */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/5"
              >
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-green-400 font-bold">{wins} Wins</span>
                  <span className="text-red-400 font-bold">{losses} Losses</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden bg-red-500/30 flex">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${winRate * 100}%` }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full"
                  />
                </div>
              </motion.div>
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-8 rounded-2xl bg-white/[0.03] border border-white/5 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                <FaTrophy className="text-2xl text-white/20" />
              </div>
              <p className="text-white/60 text-base mb-2">
                {isExplore ? 'No community votes yet' : 'Not rated yet'}
              </p>
              <p className="text-white/30 text-sm">
                {isExplore 
                  ? 'Make your model public to get community ratings' 
                  : 'Go to Rate to start voting!'}
              </p>
            </motion.div>
          )}

          {/* Tags Display */}
          {image.tags && image.tags.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/5"
            >
              <div className="flex items-center gap-2 mb-3">
                <FaTags className="text-purple-400" size={14} />
                <span className="text-sm font-medium text-white/60">AI Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {image.tags.slice(0, 12).map((tagObj, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1.5 text-xs rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium"
                  >
                    {tagObj.tag || tagObj}
                  </span>
                ))}
                {image.tags.length > 12 && (
                  <span className="px-3 py-1.5 text-xs text-white/30">+{image.tags.length - 12} more</span>
                )}
              </div>
            </motion.div>
          )}

          {/* Community badge */}
          {isExplore && (
            <div className="flex items-center justify-center gap-2 py-3">
              <FaUsers className="text-cyan-400" size={14} />
              <span className="text-sm text-cyan-400 font-medium">Community Ratings</span>
            </div>
          )}
        </div>

        {/* Bottom spacing */}
        <div className="h-12" />
      </div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
}

function calculateWilsonScore(wins, losses, z = 1.96) {
  const n = wins + losses;
  if (n === 0) return 0;
  
  const p = wins / n;
  const denominator = 1 + (z * z) / n;
  const centre = p + (z * z) / (2 * n);
  const spread = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
  
  return (centre - spread) / denominator;
}
