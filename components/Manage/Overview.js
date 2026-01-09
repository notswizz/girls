import { motion } from 'framer-motion';
import { FaCrown, FaPlus, FaArrowRight, FaMedal, FaGlobe } from 'react-icons/fa';

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
    .filter(m => (m.communityWins || 0) + (m.communityLosses || 0) > 0)
    .sort((a, b) => {
      // Sort by win rate, then by total votes
      const aWins = a.communityWins || 0;
      const aLosses = a.communityLosses || 0;
      const bWins = b.communityWins || 0;
      const bLosses = b.communityLosses || 0;
      const aTotal = aWins + aLosses;
      const bTotal = bWins + bLosses;
      const aRate = aTotal > 0 ? aWins / aTotal : 0;
      const bRate = bTotal > 0 ? bWins / bTotal : 0;
      if (bRate !== aRate) return bRate - aRate;
      return bTotal - aTotal;
    });

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-transparent via-purple-950/10 to-transparent">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">


        {/* Top 3 Podium - Only if there are ranked models, hidden on mobile */}
        {rankedModels.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="hidden sm:block mb-10"
          >
            <h2 className="text-lg font-bold text-white mb-6">
              Top Performers <span className="text-sm font-normal text-cyan-400">(Explore)</span>
            </h2>
            
            <div className="flex items-end justify-center gap-2 sm:gap-4">
              {/* 2nd Place */}
              <PodiumCard model={rankedModels[1]} rank={2} onClick={() => onSelectModel(rankedModels[1])} />
              
              {/* 1st Place */}
              <PodiumCard model={rankedModels[0]} rank={1} onClick={() => onSelectModel(rankedModels[0])} />
              
              {/* 3rd Place */}
              <PodiumCard model={rankedModels[2]} rank={3} onClick={() => onSelectModel(rankedModels[2])} />
            </div>
          </motion.div>
        )}

        {/* Models Grid */}
        {models.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">All Models</h2>
              <motion.button
                onClick={onAddModel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500/20 border border-pink-500/30 text-pink-400 text-sm font-medium hover:bg-pink-500/30 transition-all"
              >
                <FaPlus size={10} />
                Add New
              </motion.button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {models.map((model, i) => (
                <ModelCard key={model._id} model={model} index={i} onClick={() => onSelectModel(model)} />
              ))}
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
            <div className="w-28 h-28 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
              <FaPlus className="text-4xl text-pink-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">Start Your Collection</h3>
            <p className="text-white/50 mb-8 max-w-md mx-auto text-sm sm:text-base">
              Add your first model to start uploading photos and rating them head-to-head.
            </p>
            <motion.button
              onClick={onAddModel}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl font-semibold shadow-xl shadow-pink-500/25 text-lg"
            >
              Add Your First Model
            </motion.button>
          </motion.div>
        )}


        {/* Bottom spacing for mobile action bar */}
        <div className="h-24 md:h-8" />
      </div>
    </div>
  );
}

// Podium Card Component
function PodiumCard({ model, rank, onClick }) {
  const wins = model.communityWins || 0;
  const losses = model.communityLosses || 0;
  const totalVotes = wins + losses;
  const winRate = totalVotes > 0 ? Math.round((wins / totalVotes) * 100) : 0;
  
  const heights = { 1: 'h-32 sm:h-40', 2: 'h-24 sm:h-32', 3: 'h-20 sm:h-28' };
  const widths = { 1: 'w-28 sm:w-36', 2: 'w-24 sm:w-32', 3: 'w-24 sm:w-32' };
  const gradients = {
    1: 'from-yellow-400 via-amber-500 to-orange-500',
    2: 'from-slate-300 via-gray-400 to-slate-500',
    3: 'from-amber-600 via-orange-600 to-red-700'
  };
  const shadows = {
    1: 'shadow-yellow-500/30',
    2: 'shadow-slate-400/20',
    3: 'shadow-orange-600/20'
  };
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`${widths[rank]} cursor-pointer`}
    >
      {/* Avatar */}
      <div className="flex justify-center mb-2">
        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${gradients[rank]} flex items-center justify-center shadow-xl ${shadows[rank]} border-2 border-white/20`}>
          {rank === 1 ? (
            <FaCrown className="text-white text-xl sm:text-2xl" />
          ) : (
            <FaMedal className="text-white text-lg sm:text-xl" />
          )}
        </div>
      </div>
      
      {/* Pedestal */}
      <div className={`${heights[rank]} rounded-t-2xl bg-gradient-to-b ${gradients[rank]} bg-opacity-20 border border-white/10 flex flex-col items-center justify-end p-3 relative overflow-hidden`}>
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
        
        <div className="relative text-center">
          <div className="text-white font-bold text-sm sm:text-base truncate max-w-full px-1">{model.name}</div>
          <div className="text-white/60 text-xs mt-1">
            <span className="text-green-300 font-medium">{wins}W</span>
            <span className="mx-1">·</span>
            <span className="text-red-300 font-medium">{losses}L</span>
          </div>
          <div className="text-white font-bold text-base sm:text-lg">{winRate}%</div>
        </div>
      </div>
    </motion.div>
  );
}

// Model Card Component
function ModelCard({ model, index, onClick }) {
  const wins = model.communityWins || 0;
  const losses = model.communityLosses || 0;
  const totalVotes = wins + losses;
  const winRate = totalVotes > 0 ? Math.round((wins / totalVotes) * 100) : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 + index * 0.02 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      <div className="relative p-4 rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-pink-500/40 transition-all overflow-hidden">
        {/* Hover glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-pink-500/10 via-transparent to-purple-500/10" />
        
        {/* Public indicator */}
        {model.isPublic && (
          <div className="absolute top-3 left-3">
            <FaGlobe className="text-emerald-400" size={10} />
          </div>
        )}
        
        {/* Avatar */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-pink-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center group-hover:border-pink-500/50 transition-all shadow-lg">
          <span className="text-2xl font-black text-white/90 group-hover:text-pink-300 transition-colors">
            {model.name[0].toUpperCase()}
          </span>
        </div>
        
        {/* Info */}
        <div className="relative text-center">
          <div className="text-white font-semibold text-sm truncate group-hover:text-pink-300 transition-colors">
            {model.name}
          </div>
          <div className="text-white/40 text-xs mt-1">
            {model.imageCount || 0} photos
          </div>
          
          {/* Record */}
          {totalVotes > 0 ? (
            <div className="mt-2 flex items-center justify-center gap-2 text-xs">
              <span className="text-green-400 font-medium">{wins}W</span>
              <span className="text-red-400 font-medium">{losses}L</span>
              <span className={`font-medium ${winRate >= 50 ? 'text-green-400' : 'text-white/40'}`}>
                {winRate}%
              </span>
            </div>
          ) : (
            <div className="mt-2 text-white/30 text-xs italic">No votes</div>
          )}
        </div>
        
        {/* Arrow indicator */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <FaArrowRight className="text-pink-400 text-xs" />
        </div>
      </div>
    </motion.div>
  );
}

// Calculate overview stats
function calculateOverviewStats(models) {
  if (!models || models.length === 0) {
    return { totalImages: 0, totalVotes: 0, overallWinRate: 0, topModel: null };
  }

  let totalImages = 0, totalWins = 0, totalLosses = 0, topWinRate = 0, topModel = null;

  for (const model of models) {
    totalImages += model.imageCount || 0;
    totalWins += model.communityWins || 0;
    totalLosses += model.communityLosses || 0;
    
    const modelTotal = (model.communityWins || 0) + (model.communityLosses || 0);
    const modelWinRate = modelTotal > 0 ? (model.communityWins || 0) / modelTotal : 0;
    if (modelWinRate > topWinRate && modelTotal >= 5) {
      topWinRate = modelWinRate;
      topModel = model.name;
    }
  }

  const totalVotes = totalWins + totalLosses;
  const overallWinRate = totalVotes > 0 ? Math.round((totalWins / totalVotes) * 100) : 0;

  return { totalImages, totalVotes, overallWinRate, topModel };
}
