import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaImages, FaUsers, FaFire, FaChartLine, FaCrown, FaPlus, FaTags, FaSpinner } from 'react-icons/fa';

export default function Overview({ models, onSelectModel, onAddModel, isLoading }) {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500" />
      </div>
    );
  }

  // Calculate aggregate stats
  const stats = calculateOverviewStats(models);
  
  // Sort models by performance for the ranking
  const rankedModels = [...models]
    .filter(m => (m.wins || 0) + (m.losses || 0) > 0)
    .sort((a, b) => {
      const aScore = calculateModelScore(a);
      const bScore = calculateModelScore(b);
      return bScore - aScore;
    });

  const getScoreColor = (score) => {
    if (score >= 700) return 'text-yellow-400';
    if (score >= 500) return 'text-purple-400';
    if (score >= 300) return 'text-cyan-400';
    if (score >= 100) return 'text-green-400';
    return 'text-white/50';
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Overview</h1>
          <p className="text-white/50">Your gallery at a glance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={<FaUsers className="text-pink-400" />}
            value={stats.totalModels}
            label="Models"
            delay={0}
          />
          <StatCard
            icon={<FaImages className="text-cyan-400" />}
            value={stats.totalImages}
            label="Photos"
            delay={0.1}
          />
          <StatCard
            icon={<FaFire className="text-orange-400" />}
            value={stats.totalVotes}
            label="Total Votes"
            delay={0.2}
          />
          <StatCard
            icon={<FaChartLine className="text-green-400" />}
            value={`${stats.overallWinRate}%`}
            label="Win Rate"
            delay={0.3}
          />
        </div>

        {/* Top Score */}
        {stats.topScore > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-pink-500/20 rounded-2xl p-6 border border-yellow-500/30 text-center"
          >
            <FaTrophy className="text-yellow-400 text-3xl mx-auto mb-2" />
            <div className={`text-4xl font-bold ${getScoreColor(stats.topScore)}`}>
              {stats.topScore}
            </div>
            <div className="text-white/60 text-sm">Top Model Score</div>
            {stats.topModel && (
              <div className="text-white/80 mt-1">{stats.topModel}</div>
            )}
          </motion.div>
        )}

        {/* Model Rankings */}
        {rankedModels.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FaCrown className="text-yellow-400" />
              Model Rankings
            </h2>
            
            <div className="space-y-2">
              {rankedModels.map((model, index) => {
                const score = calculateModelScore(model);
                const wins = model.wins || 0;
                const losses = model.losses || 0;
                const totalMatches = wins + losses;
                const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
                
                return (
                  <motion.div
                    key={model._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    onClick={() => onSelectModel(model)}
                    className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 cursor-pointer transition-all group"
                  >
                    {/* Rank */}
                    <div className="w-10 text-center text-lg">
                      {getRankBadge(index + 1)}
                    </div>
                    
                    {/* Model Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate group-hover:text-pink-400 transition-colors">
                        {model.name}
                      </div>
                      <div className="text-white/50 text-xs">
                        {model.imageCount || 0} photos · {winRate}% win rate
                      </div>
                    </div>
                    
                    {/* Score */}
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getScoreColor(score)}`}>
                        {score}
                      </div>
                      <div className="text-white/40 text-[10px]">score</div>
                    </div>
                    
                    {/* Win/Loss */}
                    <div className="hidden sm:block text-right text-sm">
                      <span className="text-green-400">{wins}W</span>
                      <span className="text-white/30 mx-1">·</span>
                      <span className="text-red-400">{losses}L</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : models.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-8 bg-white/5 rounded-2xl border border-white/10"
          >
            <FaFire className="text-4xl text-white/20 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white mb-1">No Ratings Yet</h3>
            <p className="text-white/50 text-sm">
              Go to Rate to start voting on your photos!
            </p>
          </motion.div>
        ) : null}

        {/* Unranked Models */}
        {models.filter(m => (m.wins || 0) + (m.losses || 0) === 0).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-3"
          >
            <h2 className="text-lg font-semibold text-white/60">Unrated Models</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {models
                .filter(m => (m.wins || 0) + (m.losses || 0) === 0)
                .map((model, index) => (
                  <motion.div
                    key={model._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.03 }}
                    onClick={() => onSelectModel(model)}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 cursor-pointer transition-all text-center"
                  >
                    <div className="text-white font-medium truncate text-sm">
                      {model.name}
                    </div>
                    <div className="text-white/40 text-xs">
                      {model.imageCount || 0} photos
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {models.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 flex items-center justify-center border border-pink-500/30">
              <FaPlus className="text-2xl text-pink-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Models Yet</h3>
            <p className="text-white/50 mb-6">Add your first model to get started!</p>
            <button
              onClick={onAddModel}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all"
            >
              Add Model
            </button>
          </motion.div>
        )}

        {/* Quick Actions */}
        {models.length > 0 && (
          <QuickActions onAddModel={onAddModel} />
        )}
      </motion.div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, value, label, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/5 rounded-xl p-4 border border-white/10 text-center"
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-white/50 text-xs">{label}</div>
    </motion.div>
  );
}

// Calculate overview stats from all models
function calculateOverviewStats(models) {
  if (!models || models.length === 0) {
    return {
      totalModels: 0,
      totalImages: 0,
      totalVotes: 0,
      overallWinRate: 0,
      topScore: 0,
      topModel: null
    };
  }

  let totalImages = 0;
  let totalWins = 0;
  let totalLosses = 0;
  let topScore = 0;
  let topModel = null;

  for (const model of models) {
    totalImages += model.imageCount || 0;
    totalWins += model.wins || 0;
    totalLosses += model.losses || 0;
    
    const score = calculateModelScore(model);
    if (score > topScore) {
      topScore = score;
      topModel = model.name;
    }
  }

  const totalVotes = totalWins + totalLosses;
  const overallWinRate = totalVotes > 0 ? Math.round((totalWins / totalVotes) * 100) : 0;

  return {
    totalModels: models.length,
    totalImages,
    totalVotes,
    overallWinRate,
    topScore,
    topModel
  };
}

// Calculate Wilson score for a model
function calculateWilsonScore(wins, losses, z = 1.96) {
  const n = wins + losses;
  if (n === 0) return 0;
  
  const p = wins / n;
  const denominator = 1 + (z * z) / n;
  const centre = p + (z * z) / (2 * n);
  const spread = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
  
  return (centre - spread) / denominator;
}

// Calculate composite score for a model
function calculateModelScore(model) {
  const wins = model.wins || 0;
  const losses = model.losses || 0;
  const elo = model.elo || 1200;
  
  if (wins + losses === 0) return 0;
  
  const wilsonScore = calculateWilsonScore(wins, losses);
  const eloNormalized = (elo - 800) / 1600;
  
  return Math.round((wilsonScore * 0.7 + eloNormalized * 0.3) * 1000);
}

// Quick Actions Component with Tag All button
function QuickActions({ onAddModel }) {
  const [tagging, setTagging] = useState(false);
  const [tagResult, setTagResult] = useState(null);

  const handleTagAll = async () => {
    setTagging(true);
    setTagResult(null);
    
    try {
      const response = await fetch('/api/ai/tag-batch', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setTagResult({
          type: 'success',
          message: data.queued > 0 
            ? `Tagging ${data.queued} images in background...` 
            : 'All images already tagged!'
        });
      } else {
        setTagResult({
          type: 'error',
          message: data.error || 'Failed to start tagging'
        });
      }
    } catch (err) {
      setTagResult({
        type: 'error',
        message: 'Failed to connect to server'
      });
    } finally {
      setTagging(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9 }}
      className="space-y-3 pt-4"
    >
      <div className="flex justify-center gap-4 flex-wrap">
        <button
          onClick={onAddModel}
          className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white text-sm transition-colors"
        >
          <FaPlus size={12} />
          Add New Model
        </button>
        
        <button
          onClick={handleTagAll}
          disabled={tagging}
          className={`
            flex items-center gap-2 px-4 py-2 text-sm transition-all rounded-lg
            ${tagging 
              ? 'text-white/40 cursor-not-allowed' 
              : 'text-cyan-400/80 hover:text-cyan-400 hover:bg-cyan-500/10'
            }
          `}
        >
          {tagging ? (
            <>
              <FaSpinner className="animate-spin" size={12} />
              Tagging...
            </>
          ) : (
            <>
              <FaTags size={12} />
              Tag All Images (AI)
            </>
          )}
        </button>
      </div>
      
      {/* Result message */}
      {tagResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center text-sm ${
            tagResult.type === 'success' ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {tagResult.message}
        </motion.div>
      )}
    </motion.div>
  );
}

