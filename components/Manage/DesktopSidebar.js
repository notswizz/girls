import { motion } from 'framer-motion';
import { FaPlus, FaSync, FaChartPie, FaImages, FaGlobe } from 'react-icons/fa';

export default function DesktopSidebar({ models, selectedModel, onSelectModel, onAddModel, onRefresh, isLoading }) {
  // Calculate total stats (community)
  const totalPhotos = models.reduce((sum, m) => sum + (m.imageCount || 0), 0);
  const totalCommunityWins = models.reduce((sum, m) => sum + (m.communityWins || 0), 0);
  const totalCommunityLosses = models.reduce((sum, m) => sum + (m.communityLosses || 0), 0);
  const totalCommunityVotes = totalCommunityWins + totalCommunityLosses;

  return (
    <div className="hidden md:flex w-72 flex-shrink-0 border-r border-white/5 flex-col bg-gradient-to-b from-white/[0.02] to-transparent">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white">Models</h2>
          <motion.button
            onClick={onAddModel}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg text-white text-xs font-semibold shadow-lg shadow-pink-500/20"
          >
            <FaPlus size={10} />
            Add
          </motion.button>
        </div>
        
        {/* Mini stats */}
        <div className="flex gap-2">
          <div className="flex-1 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
            <div className="text-lg font-bold text-white">{totalPhotos}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider">Photos</div>
          </div>
          <div className="flex-1 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
            <div className="text-lg font-bold text-cyan-400">{totalCommunityVotes}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider">Votes</div>
          </div>
        </div>
      </div>

      {/* Overview button */}
      <div className="px-3 py-3">
        <motion.button
          onClick={() => onSelectModel(null)}
          whileTap={{ scale: 0.98 }}
          className={`
            w-full flex items-center gap-3 p-3 rounded-xl transition-all
            ${!selectedModel 
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 shadow-lg shadow-cyan-500/10' 
              : 'bg-white/[0.02] hover:bg-white/[0.05] border border-white/5'}
          `}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            !selectedModel ? 'bg-cyan-500/20' : 'bg-white/5'
          }`}>
            <FaChartPie className={!selectedModel ? 'text-cyan-400' : 'text-white/40'} size={16} />
          </div>
          <div className="text-left">
            <div className={`text-sm font-semibold ${!selectedModel ? 'text-white' : 'text-white/70'}`}>
              Overview
            </div>
            <div className="text-[10px] text-white/40">Collection stats</div>
          </div>
        </motion.button>
      </div>
      
      {/* Model list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-white/[0.02] rounded-xl animate-pulse" />
          ))
        ) : models.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-white/10 flex items-center justify-center">
              <FaImages className="text-2xl text-pink-400/40" />
            </div>
            <p className="text-white/50 text-sm mb-4">No models yet</p>
            <motion.button
              onClick={onAddModel}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-pink-400 text-sm font-medium hover:text-pink-300 transition-colors"
            >
              Add your first model →
            </motion.button>
          </div>
        ) : (
          models.map((model, i) => {
            const isSelected = selectedModel?._id === model._id;
            // Use community stats instead of personal stats
            const wins = model.communityWins || 0;
            const losses = model.communityLosses || 0;
            const totalVotes = wins + losses;
            const winRate = totalVotes > 0 ? Math.round((wins / totalVotes) * 100) : 0;
            
            return (
              <motion.button
                key={model._id}
                onClick={() => onSelectModel(model)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  w-full p-4 rounded-xl transition-all text-left group
                  ${isSelected 
                    ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/10 border border-pink-500/40 shadow-lg shadow-pink-500/10' 
                    : 'bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10'}
                `}
              >
                {/* Name row */}
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                    isSelected 
                      ? 'bg-gradient-to-br from-pink-500/40 to-purple-500/40 text-white' 
                      : 'bg-white/5 text-white/60 group-hover:text-white/80'
                  }`}>
                    {model.name[0]?.toUpperCase()}
                  </div>
                  <span className={`text-base font-semibold truncate flex-1 ${isSelected ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
                    {model.name}
                  </span>
                  {model.isPublic && (
                    <FaGlobe className="text-emerald-400 flex-shrink-0" size={12} />
                  )}
                </div>
                
                {/* Stats row */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-white/50">{model.imageCount || 0} photos</span>
                  {totalVotes > 0 ? (
                    <>
                      <span className="text-white/20">•</span>
                      <span className="text-green-400 font-medium">{wins}W</span>
                      <span className="text-red-400 font-medium">{losses}L</span>
                      <span className="text-white/20">•</span>
                      <span className={`font-medium ${winRate >= 50 ? 'text-green-400' : 'text-white/50'}`}>
                        {winRate}%
                      </span>
                    </>
                  ) : (
                    <span className="text-white/30 italic">No votes yet</span>
                  )}
                </div>
              </motion.button>
            );
          })
        )}
      </div>
      
      {/* Refresh button */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-white/40 hover:text-white/60 text-xs font-medium transition-colors rounded-xl hover:bg-white/[0.03] border border-white/5"
        >
          <FaSync className={isLoading ? 'animate-spin' : ''} size={10} />
          Refresh
        </button>
      </div>
    </div>
  );
}

