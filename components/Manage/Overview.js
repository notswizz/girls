import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaImages, FaFire, FaChartLine, FaCrown, FaPlus, FaTags, FaSpinner, FaArrowRight } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import Link from 'next/link';

export default function Overview({ models, onSelectModel, onAddModel, isLoading }) {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-2 border-pink-500/20 border-t-pink-500"
        />
      </div>
    );
  }

  const stats = calculateOverviewStats(models);
  
  const rankedModels = [...models]
    .filter(m => (m.wins || 0) + (m.losses || 0) > 0)
    .sort((a, b) => calculateModelScore(b) - calculateModelScore(a));

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-white">Your Bank</h1>
            <p className="text-white/40 text-sm">Collection overview</p>
          </div>
          
          <motion.button
            onClick={onAddModel}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-pink-500/20"
          >
            <FaPlus size={12} />
            New Model
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            { icon: FaImages, value: stats.totalImages, label: 'Photos', color: 'text-cyan-400', bg: 'from-cyan-500/20 to-blue-500/10' },
            { icon: FaCrown, value: models.length, label: 'Models', color: 'text-pink-400', bg: 'from-pink-500/20 to-rose-500/10' },
            { icon: FaFire, value: stats.totalVotes, label: 'Votes', color: 'text-orange-400', bg: 'from-orange-500/20 to-amber-500/10' },
            { icon: FaChartLine, value: `${stats.overallWinRate}%`, label: 'Win Rate', color: 'text-green-400', bg: 'from-green-500/20 to-emerald-500/10' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className={`relative p-4 rounded-2xl bg-gradient-to-br ${stat.bg} border border-white/5 overflow-hidden`}
            >
              <stat.icon className={`${stat.color} text-lg mb-2`} />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-white/40 text-xs">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Top Performer Card */}
        {stats.topScore > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative p-6 rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-orange-500/20" />
            <div className="absolute inset-0 border border-yellow-500/20 rounded-2xl" />
            
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <FaTrophy className="text-white text-2xl" />
              </div>
              <div className="flex-1">
                <div className="text-white/60 text-sm mb-1">Top Performer</div>
                <div className="text-3xl font-black text-yellow-400">{stats.topScore}</div>
                <div className="text-white/80 text-sm">{stats.topModel}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Model Rankings */}
        {rankedModels.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FaCrown className="text-yellow-400" />
                Rankings
              </h2>
            </div>
            
            <div className="space-y-2">
              {rankedModels.slice(0, 5).map((model, index) => {
                const score = calculateModelScore(model);
                const wins = model.wins || 0;
                const losses = model.losses || 0;
                
                return (
                  <motion.div
                    key={model._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + index * 0.05 }}
                    onClick={() => onSelectModel(model)}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 cursor-pointer transition-all"
                  >
                    {/* Rank Badge */}
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold
                      ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-500/30' : 
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700' :
                        index === 2 ? 'bg-gradient-to-br from-amber-600 to-orange-700 text-white' :
                        'bg-white/10 text-white/60'}
                    `}>
                      {index + 1}
                    </div>
                    
                    {/* Model Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate group-hover:text-pink-400 transition-colors">
                        {model.name}
                      </div>
                      <div className="text-white/40 text-xs">
                        {model.imageCount || 0} photos
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{score}</div>
                      <div className="text-xs">
                        <span className="text-green-400">{wins}W</span>
                        <span className="text-white/30 mx-1">/</span>
                        <span className="text-red-400">{losses}L</span>
                      </div>
                    </div>
                    
                    <FaArrowRight className="text-white/20 group-hover:text-white/40 transition-colors" size={12} />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* All Models Grid */}
        {models.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-lg font-semibold text-white mb-4">All Models</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {models.map((model, i) => (
                <motion.div
                  key={model._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.55 + i * 0.02 }}
                  onClick={() => onSelectModel(model)}
                  className="group p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-pink-500/30 cursor-pointer transition-all text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mx-auto mb-3 group-hover:border-pink-500/50 transition-colors">
                    <span className="text-lg font-bold text-white/80 group-hover:text-pink-400 transition-colors">
                      {model.name[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="text-white font-medium truncate text-sm group-hover:text-pink-400 transition-colors">
                    {model.name}
                  </div>
                  <div className="text-white/40 text-xs mt-1">
                    {model.imageCount || 0} photos
                  </div>
                </motion.div>
              ))}
              
              {/* Add Model Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55 + models.length * 0.02 }}
                onClick={onAddModel}
                className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-dashed border-white/10 hover:border-pink-500/30 cursor-pointer transition-all text-center"
              >
                <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto mb-3">
                  <FaPlus className="text-pink-400" />
                </div>
                <div className="text-white/60 font-medium text-sm">Add Model</div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {models.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
              <FaPlus className="text-3xl text-pink-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Start Your Collection</h3>
            <p className="text-white/50 mb-8 max-w-md mx-auto">
              Add your first model to start uploading photos and rating them head-to-head.
            </p>
            <motion.button
              onClick={onAddModel}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-pink-500/25"
            >
              Add Your First Model
            </motion.button>
          </motion.div>
        )}

        {/* Quick Actions */}
        {models.length > 0 && (
          <QuickActions onAddModel={onAddModel} />
        )}

        {/* Bottom spacing for mobile nav */}
        <div className="h-8" />
      </div>
    </div>
  );
}

// Calculate overview stats
function calculateOverviewStats(models) {
  if (!models || models.length === 0) {
    return { totalImages: 0, totalVotes: 0, overallWinRate: 0, topScore: 0, topModel: null };
  }

  let totalImages = 0, totalWins = 0, totalLosses = 0, topScore = 0, topModel = null;

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

  return { totalImages, totalVotes, overallWinRate, topScore, topModel };
}

// Calculate model score
function calculateModelScore(model) {
  const wins = model.wins || 0;
  const losses = model.losses || 0;
  const elo = model.elo || 1200;
  
  if (wins + losses === 0) return 0;
  
  const n = wins + losses;
  const p = wins / n;
  const z = 1.96;
  const denominator = 1 + (z * z) / n;
  const centre = p + (z * z) / (2 * n);
  const spread = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
  const wilsonScore = (centre - spread) / denominator;
  
  const eloNormalized = (elo - 800) / 1600;
  
  return Math.round((wilsonScore * 0.7 + eloNormalized * 0.3) * 1000);
}

// Quick Actions
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
        setTagResult({ type: 'success', message: data.queued > 0 ? `Tagging ${data.queued} images...` : 'All tagged!' });
      } else {
        setTagResult({ type: 'error', message: data.error || 'Failed' });
      }
    } catch (err) {
      setTagResult({ type: 'error', message: 'Connection error' });
    } finally {
      setTagging(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="flex justify-center gap-6 pt-4 border-t border-white/5"
    >
      <Link href="/rate" className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
        <FaTrophy size={12} />
        Rate Photos
      </Link>
      
      <Link href="/creations" className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
        <HiSparkles size={12} />
        AI Creations
      </Link>
      
      <button
        onClick={handleTagAll}
        disabled={tagging}
        className={`flex items-center gap-2 text-sm transition-colors ${tagging ? 'text-white/30' : 'text-cyan-400/70 hover:text-cyan-400'}`}
      >
        {tagging ? <FaSpinner className="animate-spin" size={12} /> : <FaTags size={12} />}
        {tagging ? 'Tagging...' : 'Tag All'}
      </button>
      
      {tagResult && (
        <span className={`text-sm ${tagResult.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
          {tagResult.message}
        </span>
      )}
    </motion.div>
  );
}
