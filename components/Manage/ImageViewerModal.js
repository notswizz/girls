import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaTrash, FaTrophy, FaChartLine, FaFire, FaUsers, FaTags, FaTimes, FaPlay, FaRobot } from 'react-icons/fa';

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
    // Lock body scroll when modal is open
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
  const elo = image.elo || 1200;
  const isExplore = image.ratingMode === 'explore';
  const score = image.score || 0;

  // Calculate Wilson score for display (for gallery mode)
  const wilsonScore = calculateWilsonScore(wins, losses);
  const compositeScore = isExplore 
    ? score 
    : Math.round((wilsonScore * 0.7 + ((elo - 800) / 1600) * 0.3) * 1000);

  const getEloTier = (elo) => {
    if (elo >= 1800) return { label: 'Elite', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (elo >= 1600) return { label: 'Excellent', color: 'text-purple-400', bg: 'bg-purple-500/20' };
    if (elo >= 1400) return { label: 'Great', color: 'text-cyan-400', bg: 'bg-cyan-500/20' };
    if (elo >= 1200) return { label: 'Good', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (elo >= 1000) return { label: 'Average', color: 'text-white/60', bg: 'bg-white/10' };
    return { label: 'Rising', color: 'text-white/40', bg: 'bg-white/5' };
  };

  const getScoreTier = (score) => {
    if (score >= 700) return { label: 'Hot', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (score >= 500) return { label: 'Popular', color: 'text-purple-400', bg: 'bg-purple-500/20' };
    if (score >= 300) return { label: 'Rising', color: 'text-cyan-400', bg: 'bg-cyan-500/20' };
    if (score >= 100) return { label: 'New', color: 'text-green-400', bg: 'bg-green-500/20' };
    return { label: 'Starting', color: 'text-white/40', bg: 'bg-white/5' };
  };

  const tier = isExplore ? getScoreTier(score) : getEloTier(elo);

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
      {/* Fixed Header - Very prominent back button */}
      <div 
        className="sticky top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black via-black to-transparent"
        style={{ 
          zIndex: 100000,
          paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))',
          paddingBottom: '20px'
        }}
      >
        {/* Back button - BIG and obvious */}
        <motion.button
          onClick={onClose}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/20 text-white font-semibold hover:bg-white/30 transition-all shadow-lg backdrop-blur-sm border border-white/10"
          whileTap={{ scale: 0.95 }}
        >
          <FaArrowLeft size={18} />
          <span className="text-base">Back</span>
        </motion.button>
        
        {/* Status badge */}
        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${tier.bg} ${tier.color}`}>
          {tier.label}
        </span>
        
        {/* Delete button */}
        <motion.button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-3 rounded-full text-red-400 hover:text-red-300 bg-white/10 hover:bg-red-500/20 transition-all border border-white/10"
          whileTap={{ scale: 0.95 }}
        >
          <FaTrash size={16} />
        </motion.button>
      </div>

      {/* Scrollable Content */}
      <div className="flex flex-col min-h-0">
        {/* Image or Video */}
        <div className="flex items-center justify-center p-3 bg-gradient-to-b from-gray-900/20 to-black">
          {isVideoUrl(image.url) || image.aiType === 'video' ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <video
                src={image.url}
                className="max-w-full rounded-xl shadow-2xl"
                style={{ maxHeight: '50vh' }}
                controls
                autoPlay
                loop
                muted
                playsInline
              />
              {/* AI Generated badge for videos */}
              {image.isAIGenerated && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/80 to-pink-500/80 backdrop-blur-sm">
                  <FaRobot className="text-white text-xs" />
                  <span className="text-white text-xs font-medium">AI Video</span>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <img
                src={image.url}
                alt=""
                className="max-w-full rounded-xl shadow-2xl"
                style={{ maxHeight: '50vh' }}
              />
              {/* AI Generated badge for images */}
              {image.isAIGenerated && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/80 to-pink-500/80 backdrop-blur-sm">
                  <FaRobot className="text-white text-xs" />
                  <span className="text-white text-xs font-medium">AI Generated</span>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Info Section */}
        <div className="px-4 py-4 space-y-4">
          {/* Tags Display */}
          {image.tags && image.tags.length > 0 && (
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <FaTags className="text-purple-400" size={12} />
                <span className="text-xs font-medium text-white/60">AI Tags</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {image.tags.slice(0, 12).map((tagObj, i) => (
                  <span 
                    key={i}
                    className="px-2 py-1 text-[10px] rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20"
                  >
                    {tagObj.tag || tagObj}
                  </span>
                ))}
                {image.tags.length > 12 && (
                  <span className="px-2 py-1 text-[10px] text-white/40">+{image.tags.length - 12} more</span>
                )}
              </div>
            </div>
          )}

          {/* Stats Section */}
          {totalMatches > 0 ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2">
                {/* Score */}
                <div className={`bg-white/5 rounded-xl p-3 text-center border ${isExplore ? 'border-cyan-500/20' : 'border-white/10'}`}>
                  {isExplore ? (
                    <FaUsers className="mx-auto mb-1 text-cyan-400" size={14} />
                  ) : (
                    <FaTrophy className="mx-auto mb-1 text-yellow-400" size={14} />
                  )}
                  <div className="text-xl font-bold text-white">{compositeScore}</div>
                  <div className="text-[9px] text-white/40 uppercase tracking-wide">Score</div>
                </div>

                {/* Win Rate */}
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                  <div className="text-xl font-bold text-white">{Math.round(winRate * 100)}%</div>
                  <div className="text-[9px] text-white/40 uppercase tracking-wide">Win Rate</div>
                </div>

                {/* Total Votes */}
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                  <FaFire className="mx-auto mb-1 text-orange-400" size={14} />
                  <div className="text-xl font-bold text-white">{totalMatches}</div>
                  <div className="text-[9px] text-white/40 uppercase tracking-wide">Votes</div>
                </div>
              </div>

              {/* ELO (only for gallery mode) */}
              {!isExplore && (
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaChartLine className="text-cyan-400" size={14} />
                      <span className="text-sm text-white/60">ELO Rating</span>
                    </div>
                    <span className="text-lg font-bold text-white">{Math.round(elo)}</span>
                  </div>
                </div>
              )}

              {/* Win/Loss Bar */}
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-green-400 font-medium">{wins} Wins</span>
                  <span className="text-red-400 font-medium">{losses} Losses</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden bg-red-500/20 flex">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full transition-all"
                    style={{ width: `${winRate * 100}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
              <p className="text-white/60 text-sm mb-1">
                {isExplore ? 'No community votes yet' : 'Not rated yet'}
              </p>
              <p className="text-white/30 text-xs">
                {isExplore 
                  ? 'Make your model public to get community ratings!' 
                  : 'Go to Rate to start voting!'}
              </p>
            </div>
          )}

          {/* Community badge */}
          {isExplore && (
            <div className="flex items-center justify-center gap-2 py-2">
              <FaUsers className="text-cyan-400" size={12} />
              <span className="text-xs text-cyan-400 font-medium">Community Ratings</span>
            </div>
          )}
        </div>

        {/* Bottom padding for safe scroll */}
        <div className="h-8" />
      </div>
    </motion.div>
  );

  // Use portal to render at document body level, escaping all parent stacking contexts
  return createPortal(modalContent, document.body);
}

// Wilson Score calculation
function calculateWilsonScore(wins, losses, z = 1.96) {
  const n = wins + losses;
  if (n === 0) return 0;
  
  const p = wins / n;
  const denominator = 1 + (z * z) / n;
  const centre = p + (z * z) / (2 * n);
  const spread = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
  
  return (centre - spread) / denominator;
}

