import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaGlobe, FaLock, FaTrophy, FaFire, FaChartLine, FaUsers, FaArrowLeft } from 'react-icons/fa';

export default function ModelHeader({ 
  selectedModel, 
  imageCount, 
  onUploadClick, 
  onModelUpdated, 
  modelImages,
  communityImages,
  communityStats,
  ratingMode,
  onRatingModeChange
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!selectedModel) return null;

  const analytics = ratingMode === 'gallery' 
    ? calculateModelAnalytics(modelImages || [])
    : calculateCommunityAnalytics(communityImages || [], communityStats);

  const togglePublic = async () => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/models/${selectedModel._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedModel.name,
          username: selectedModel.username,
          isPublic: !selectedModel.isPublic,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (onModelUpdated) {
          onModelUpdated(data.model);
        }
      }
    } catch (err) {
      console.error('Error updating model:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex-shrink-0 border-b border-white/5">
      {/* Header row */}
      <div className="px-4 py-4 sm:py-5 flex items-center gap-3 sm:gap-4">
        {/* Model Avatar */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-pink-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center shadow-lg">
          <span className="text-2xl sm:text-3xl font-black text-white/90">
            {selectedModel.name[0]?.toUpperCase()}
          </span>
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-white truncate">{selectedModel.name}</h1>
            <motion.button
              onClick={togglePublic}
              disabled={isUpdating}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedModel.isPublic 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' 
                  : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
              }`}
            >
              {selectedModel.isPublic ? <FaGlobe size={10} /> : <FaLock size={10} />}
              {selectedModel.isPublic ? 'Public' : 'Private'}
            </motion.button>
          </div>
          <p className="text-white/40 text-sm mt-0.5">{imageCount} photos</p>
        </div>
        
        <motion.button
          onClick={onUploadClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40"
        >
          <FaUpload size={14} />
          <span className="hidden sm:inline">Upload</span>
        </motion.button>
      </div>

      {/* Rating Mode Toggle + Stats */}
      <div className="px-4 pb-4 flex flex-wrap items-center gap-3">
        {/* Mode Toggle */}
        <div className="relative inline-flex bg-black/30 rounded-xl p-1 border border-white/10">
          <motion.div
            className="absolute top-1 bottom-1 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg"
            initial={false}
            animate={{
              left: ratingMode === 'gallery' ? '4px' : '50%',
              right: ratingMode === 'gallery' ? '50%' : '4px',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
          <button
            onClick={() => onRatingModeChange('gallery')}
            className={`relative z-10 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              ratingMode === 'gallery' ? 'text-white' : 'text-white/50 hover:text-white/70'
            }`}
          >
            <FaLock size={10} />
            My Ratings
          </button>
          <button
            onClick={() => onRatingModeChange('explore')}
            className={`relative z-10 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              ratingMode === 'explore' ? 'text-white' : 'text-white/50 hover:text-white/70'
            }`}
          >
            <FaUsers size={10} />
            Community
          </button>
        </div>

        {/* Stats Pills */}
        {analytics.totalMatches > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <StatPill 
              icon={<FaTrophy className="text-yellow-400" size={11} />}
              value={analytics.score}
              label="score"
              highlight
            />
            <StatPill 
              icon={<span className="text-xs">⚔️</span>}
              value={`${analytics.wins}-${analytics.losses}`}
              label={`${Math.round(analytics.winRate * 100)}%`}
            />
            {ratingMode === 'gallery' && analytics.avgElo && (
              <StatPill 
                icon={<FaChartLine className="text-cyan-400" size={11} />}
                value={analytics.avgElo}
                label="elo"
              />
            )}
            <StatPill 
              icon={<FaFire className="text-orange-400" size={11} />}
              value={analytics.totalMatches}
              label="votes"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StatPill({ icon, value, label, highlight }) {
  return (
    <div className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
      highlight 
        ? 'bg-yellow-500/10 border-yellow-500/20' 
        : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
    }`}>
      {icon}
      <span className="text-sm font-bold text-white">{value}</span>
      <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
    </div>
  );
}

// Calculate Wilson Score
function calculateWilsonScore(wins, losses, z = 1.96) {
  const n = wins + losses;
  if (n === 0) return 0;
  const p = wins / n;
  const denominator = 1 + (z * z) / n;
  const centre = p + (z * z) / (2 * n);
  const spread = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
  return (centre - spread) / denominator;
}

function calculateModelAnalytics(images) {
  const BASE_ELO = 1500;
  if (!images || images.length === 0) {
    return { score: BASE_ELO, wins: 0, losses: 0, totalMatches: 0, winRate: 0, avgElo: BASE_ELO, topElo: BASE_ELO };
  }

  const ratedImages = images.filter(img => (img.wins || 0) + (img.losses || 0) > 0);
  if (ratedImages.length === 0) {
    return { score: BASE_ELO, wins: 0, losses: 0, totalMatches: 0, winRate: 0, avgElo: BASE_ELO, topElo: BASE_ELO };
  }

  const wins = ratedImages.reduce((sum, img) => sum + (img.wins || 0), 0);
  const losses = ratedImages.reduce((sum, img) => sum + (img.losses || 0), 0);
  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? wins / totalMatches : 0;
  
  const avgElo = Math.round(ratedImages.reduce((sum, img) => sum + (img.elo || BASE_ELO), 0) / ratedImages.length);
  const topElo = Math.max(...ratedImages.map(img => img.elo || BASE_ELO));
  
  // Score is now just the average ELO
  return { score: avgElo, wins, losses, totalMatches, winRate, avgElo, topElo };
}

function calculateCommunityAnalytics(images, stats) {
  const BASE_ELO = 1500;
  
  if (stats) {
    // Use ELO from stats if available
    const avgElo = stats.avgElo || BASE_ELO;
    const topElo = stats.topElo || BASE_ELO;
    return {
      score: avgElo,
      wins: stats.totalWins || 0,
      losses: stats.totalLosses || 0,
      totalMatches: stats.totalMatches || 0,
      winRate: stats.winRate || 0,
      avgElo,
      topElo
    };
  }

  if (!images || images.length === 0) {
    return { score: BASE_ELO, wins: 0, losses: 0, totalMatches: 0, winRate: 0, avgElo: BASE_ELO, topElo: BASE_ELO };
  }

  const ratedImages = images.filter(img => (img.wins || 0) + (img.losses || 0) > 0);
  const wins = images.reduce((sum, img) => sum + (img.wins || 0), 0);
  const losses = images.reduce((sum, img) => sum + (img.losses || 0), 0);
  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? wins / totalMatches : 0;
  
  // Calculate ELO from images
  const avgElo = ratedImages.length > 0 
    ? Math.round(ratedImages.reduce((sum, img) => sum + (img.elo || BASE_ELO), 0) / ratedImages.length)
    : BASE_ELO;
  const topElo = ratedImages.length > 0
    ? Math.max(...ratedImages.map(img => img.elo || BASE_ELO))
    : BASE_ELO;

  return { score: avgElo, wins, losses, totalMatches, winRate, avgElo, topElo };
}
