import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaGlobe, FaLock, FaTrophy, FaFire, FaChartLine, FaUsers } from 'react-icons/fa';

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
    <div className="flex-shrink-0 bg-gradient-to-b from-white/[0.03] to-transparent">
      {/* Header row */}
      <div className="px-4 py-4 flex items-center gap-4">
        {/* Model Avatar */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
          <span className="text-xl font-bold text-white/80">
            {selectedModel.name[0]?.toUpperCase()}
          </span>
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white truncate">{selectedModel.name}</h1>
            <motion.button
              onClick={togglePublic}
              disabled={isUpdating}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                selectedModel.isPublic 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-white/5 text-white/40 border border-white/10'
              }`}
            >
              {selectedModel.isPublic ? <FaGlobe size={8} /> : <FaLock size={8} />}
              {selectedModel.isPublic ? 'Public' : 'Private'}
            </motion.button>
          </div>
          <p className="text-white/40 text-sm">{imageCount} photos</p>
        </div>
        
        <motion.button
          onClick={onUploadClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20"
        >
          <FaUpload size={12} />
          <span className="hidden sm:inline">Upload</span>
        </motion.button>
      </div>

      {/* Rating Mode Toggle + Stats */}
      <div className="px-4 pb-4 flex flex-wrap items-center gap-3">
        {/* Mode Toggle */}
        <div className="relative inline-flex bg-white/5 rounded-xl p-1 border border-white/10">
          <motion.div
            className="absolute top-1 bottom-1 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600"
            initial={false}
            animate={{
              left: ratingMode === 'gallery' ? '4px' : '50%',
              right: ratingMode === 'gallery' ? '50%' : '4px',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
          <button
            onClick={() => onRatingModeChange('gallery')}
            className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              ratingMode === 'gallery' ? 'text-white' : 'text-white/50 hover:text-white/70'
            }`}
          >
            <FaLock size={10} />
            My Ratings
          </button>
          <button
            onClick={() => onRatingModeChange('explore')}
            className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
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
              icon={<FaTrophy className="text-yellow-400" size={10} />}
              value={analytics.score}
              label="score"
            />
            <StatPill 
              icon={<span className="text-[10px]">⚔️</span>}
              value={`${analytics.wins}-${analytics.losses}`}
              label={`${Math.round(analytics.winRate * 100)}%`}
            />
            {ratingMode === 'gallery' && analytics.avgElo && (
              <StatPill 
                icon={<FaChartLine className="text-cyan-400" size={10} />}
                value={analytics.avgElo}
                label="elo"
              />
            )}
            <StatPill 
              icon={<FaFire className="text-orange-400" size={10} />}
              value={analytics.totalMatches}
              label="votes"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StatPill({ icon, value, label }) {
  return (
    <div className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg border border-white/5">
      {icon}
      <span className="text-xs font-bold text-white">{value}</span>
      <span className="text-[10px] text-white/40">{label}</span>
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
  if (!images || images.length === 0) {
    return { score: 0, wins: 0, losses: 0, totalMatches: 0, winRate: 0, avgElo: 1200, topElo: 1200 };
  }

  const ratedImages = images.filter(img => (img.wins || 0) + (img.losses || 0) > 0);
  if (ratedImages.length === 0) {
    return { score: 0, wins: 0, losses: 0, totalMatches: 0, winRate: 0, avgElo: 1200, topElo: 1200 };
  }

  const wins = ratedImages.reduce((sum, img) => sum + (img.wins || 0), 0);
  const losses = ratedImages.reduce((sum, img) => sum + (img.losses || 0), 0);
  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? wins / totalMatches : 0;
  
  const wilsonScore = calculateWilsonScore(wins, losses);
  const avgElo = Math.round(ratedImages.reduce((sum, img) => sum + (img.elo || 1200), 0) / ratedImages.length);
  const topElo = Math.max(...ratedImages.map(img => img.elo || 1200));
  const eloNormalized = (avgElo - 800) / 1600;
  const score = Math.round((wilsonScore * 0.7 + eloNormalized * 0.3) * 1000);

  return { score, wins, losses, totalMatches, winRate, avgElo, topElo };
}

function calculateCommunityAnalytics(images, stats) {
  if (stats) {
    const wilsonScore = calculateWilsonScore(stats.totalWins || 0, stats.totalLosses || 0);
    return {
      score: Math.round(wilsonScore * 1000),
      wins: stats.totalWins || 0,
      losses: stats.totalLosses || 0,
      totalMatches: stats.totalMatches || 0,
      winRate: stats.winRate || 0,
      avgElo: null,
      topElo: null
    };
  }

  if (!images || images.length === 0) {
    return { score: 0, wins: 0, losses: 0, totalMatches: 0, winRate: 0, avgElo: null, topElo: null };
  }

  const wins = images.reduce((sum, img) => sum + (img.wins || 0), 0);
  const losses = images.reduce((sum, img) => sum + (img.losses || 0), 0);
  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? wins / totalMatches : 0;
  const wilsonScore = calculateWilsonScore(wins, losses);
  const score = Math.round(wilsonScore * 1000);

  return { score, wins, losses, totalMatches, winRate, avgElo: null, topElo: null };
}
