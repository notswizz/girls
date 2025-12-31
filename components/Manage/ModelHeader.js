import { useState } from 'react';
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

  // Calculate analytics based on rating mode
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

  const getScoreColor = (score) => {
    if (score >= 700) return 'text-yellow-400';
    if (score >= 500) return 'text-purple-400';
    if (score >= 300) return 'text-cyan-400';
    if (score >= 100) return 'text-green-400';
    return 'text-white/50';
  };

  return (
    <div className="flex-shrink-0 border-b border-white/10 bg-black/20">
      {/* Header row */}
      <div className="p-4 flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white truncate">{selectedModel.name}</h1>
            <button
              onClick={togglePublic}
              disabled={isUpdating}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all ${
                selectedModel.isPublic 
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                  : 'bg-white/10 text-white/50 hover:bg-white/20'
              }`}
              title={selectedModel.isPublic ? 'Public - click to make private' : 'Private - click to make public'}
            >
              {selectedModel.isPublic ? (
                <>
                  <FaGlobe size={10} />
                  <span className="hidden sm:inline">Public</span>
                </>
              ) : (
                <>
                  <FaLock size={10} />
                  <span className="hidden sm:inline">Private</span>
                </>
              )}
            </button>
          </div>
          <p className="text-white/40 text-sm">@{selectedModel.username} · {imageCount} photos</p>
        </div>
        <button
          onClick={onUploadClick}
          className="flex-shrink-0 ml-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg hover:shadow-pink-500/25 active:scale-95"
        >
          <FaUpload size={12} />
          <span className="hidden sm:inline">Upload</span>
        </button>
      </div>

      {/* Rating Mode Toggle */}
      <div className="px-4 pb-3">
        <div className="inline-flex bg-white/5 rounded-xl p-1 border border-white/10">
          <button
            onClick={() => onRatingModeChange('gallery')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              ratingMode === 'gallery'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <FaLock size={10} />
            My Ratings
          </button>
          <button
            onClick={() => onRatingModeChange('explore')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              ratingMode === 'explore'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <FaUsers size={10} />
            Community
          </button>
        </div>
      </div>

      {/* Analytics row */}
      {analytics.totalMatches > 0 && (
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {/* Score */}
          <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
            <FaTrophy className={`text-sm ${getScoreColor(analytics.score)}`} />
            <div>
              <div className={`text-sm font-bold ${getScoreColor(analytics.score)}`}>
                {analytics.score}
              </div>
              <div className="text-[10px] text-white/40">score</div>
            </div>
          </div>

          {/* Win Rate */}
          <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
            <div className="w-8 h-8 relative">
              <svg className="w-8 h-8 -rotate-90">
                <circle cx="16" cy="16" r="12" stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none" />
                <circle 
                  cx="16" cy="16" r="12" 
                  stroke="url(#winGradient)" 
                  strokeWidth="3" 
                  fill="none"
                  strokeDasharray={`${analytics.winRate * 75.4} 75.4`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="winGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                {Math.round(analytics.winRate * 100)}%
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-white">
                {analytics.wins}W-{analytics.losses}L
              </div>
              <div className="text-[10px] text-white/40">record</div>
            </div>
          </div>

          {/* Avg ELO - only show for gallery mode */}
          {ratingMode === 'gallery' && analytics.avgElo && (
            <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
              <FaChartLine className="text-sm text-cyan-400" />
              <div>
                <div className="text-sm font-bold text-white">{analytics.avgElo}</div>
                <div className="text-[10px] text-white/40">avg elo</div>
              </div>
            </div>
          )}

          {/* Total Votes */}
          <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
            <FaFire className="text-sm text-orange-400" />
            <div>
              <div className="text-sm font-bold text-white">{analytics.totalMatches}</div>
              <div className="text-[10px] text-white/40">votes</div>
            </div>
          </div>
        </div>
      )}
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

// Calculate model analytics from images
function calculateModelAnalytics(images) {
  if (!images || images.length === 0) {
    return {
      score: 0,
      wins: 0,
      losses: 0,
      totalMatches: 0,
      winRate: 0,
      avgElo: 1200,
      topElo: 1200
    };
  }

  const ratedImages = images.filter(img => (img.wins || 0) + (img.losses || 0) > 0);
  
  if (ratedImages.length === 0) {
    return {
      score: 0,
      wins: 0,
      losses: 0,
      totalMatches: 0,
      winRate: 0,
      avgElo: 1200,
      topElo: 1200
    };
  }

  const wins = ratedImages.reduce((sum, img) => sum + (img.wins || 0), 0);
  const losses = ratedImages.reduce((sum, img) => sum + (img.losses || 0), 0);
  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? wins / totalMatches : 0;
  
  const wilsonScore = calculateWilsonScore(wins, losses);
  const avgElo = Math.round(ratedImages.reduce((sum, img) => sum + (img.elo || 1200), 0) / ratedImages.length);
  const topElo = Math.max(...ratedImages.map(img => img.elo || 1200));
  
  // Composite score
  const eloNormalized = (avgElo - 800) / 1600;
  const score = Math.round((wilsonScore * 0.7 + eloNormalized * 0.3) * 1000);

  return {
    score,
    wins,
    losses,
    totalMatches,
    winRate,
    avgElo,
    topElo
  };
}

// Calculate community analytics from community images
function calculateCommunityAnalytics(images, stats) {
  if (stats) {
    // Use pre-calculated stats if available
    const wilsonScore = calculateWilsonScore(stats.totalWins || 0, stats.totalLosses || 0);
    return {
      score: Math.round(wilsonScore * 1000),
      wins: stats.totalWins || 0,
      losses: stats.totalLosses || 0,
      totalMatches: stats.totalMatches || 0,
      winRate: stats.winRate || 0,
      avgElo: null, // Community ratings don't have ELO
      topElo: null
    };
  }

  if (!images || images.length === 0) {
    return {
      score: 0,
      wins: 0,
      losses: 0,
      totalMatches: 0,
      winRate: 0,
      avgElo: null,
      topElo: null
    };
  }

  const wins = images.reduce((sum, img) => sum + (img.wins || 0), 0);
  const losses = images.reduce((sum, img) => sum + (img.losses || 0), 0);
  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? wins / totalMatches : 0;
  
  const wilsonScore = calculateWilsonScore(wins, losses);
  const score = Math.round(wilsonScore * 1000);

  return {
    score,
    wins,
    losses,
    totalMatches,
    winRate,
    avgElo: null,
    topElo: null
  };
}
