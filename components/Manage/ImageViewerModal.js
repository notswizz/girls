import { motion } from 'framer-motion';
import { FaTimes, FaTrash, FaTrophy, FaChartLine, FaFire, FaUsers } from 'react-icons/fa';

export default function ImageViewerModal({ image, onClose, onDelete }) {
  if (!image) return null;

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col"
      onClick={onClose}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 safe-top">
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-white/70 hover:text-white transition-colors"
        >
          <FaTimes size={20} />
        </button>
        <div className="flex items-center gap-2">
          {isExplore && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
              <FaUsers size={10} />
              Community
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${tier.bg} ${tier.color}`}>
            {tier.label}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-2 text-red-400 hover:text-red-300 transition-colors"
        >
          <FaTrash size={16} />
        </button>
      </div>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <motion.img
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          src={image.url}
          alt=""
          className="max-w-full max-h-full object-contain rounded-xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Analytics Footer */}
      <div className="p-4 safe-bottom" onClick={(e) => e.stopPropagation()}>
        {totalMatches > 0 ? (
          <div className="max-w-md mx-auto">
            {/* Stats Grid */}
            <div className={`grid ${isExplore ? 'grid-cols-3' : 'grid-cols-4'} gap-2 mb-3`}>
              {/* Score */}
              <div className={`bg-white/5 rounded-xl p-3 text-center border ${isExplore ? 'border-cyan-500/30' : 'border-white/10'}`}>
                {isExplore ? (
                  <FaUsers className="mx-auto mb-1 text-cyan-400" />
                ) : (
                  <FaTrophy className={`mx-auto mb-1 ${
                    compositeScore >= 500 ? 'text-yellow-400' : 
                    compositeScore >= 300 ? 'text-purple-400' : 'text-cyan-400'
                  }`} />
                )}
                <div className="text-lg font-bold text-white">{compositeScore}</div>
                <div className="text-[10px] text-white/40">{isExplore ? 'Community Score' : 'Score'}</div>
              </div>

              {/* ELO - only for gallery mode */}
              {!isExplore && (
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                  <FaChartLine className="mx-auto mb-1 text-cyan-400" />
                  <div className="text-lg font-bold text-white">{Math.round(elo)}</div>
                  <div className="text-[10px] text-white/40">ELO</div>
                </div>
              )}

              {/* Win Rate */}
              <div className={`bg-white/5 rounded-xl p-3 text-center border ${isExplore ? 'border-cyan-500/30' : 'border-white/10'}`}>
                <div className="text-lg font-bold text-white">{Math.round(winRate * 100)}%</div>
                <div className="text-[10px] text-white/40">Win Rate</div>
              </div>

              {/* Total Votes */}
              <div className={`bg-white/5 rounded-xl p-3 text-center border ${isExplore ? 'border-cyan-500/30' : 'border-white/10'}`}>
                <FaFire className="mx-auto mb-1 text-orange-400" />
                <div className="text-lg font-bold text-white">{totalMatches}</div>
                <div className="text-[10px] text-white/40">Votes</div>
              </div>
            </div>

            {/* Win/Loss Bar */}
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-green-400 font-medium">{wins} Wins</span>
                <span className="text-red-400 font-medium">{losses} Losses</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-red-500/30 flex">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-500 h-full transition-all"
                  style={{ width: `${winRate * 100}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-white/50 text-sm">
            <p>{isExplore ? 'No community votes yet' : 'Not rated yet'}</p>
            <p className="text-xs text-white/30 mt-1">
              {isExplore 
                ? 'Make your model public to get community ratings!' 
                : 'Go to Rate to start voting!'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
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

