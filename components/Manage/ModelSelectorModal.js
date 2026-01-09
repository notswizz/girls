import { motion } from 'framer-motion';
import { FaTimes, FaPlus, FaImages, FaCheck, FaChartPie, FaTrophy, FaGlobe } from 'react-icons/fa';

export default function ModelSelectorModal({ 
  isOpen, 
  onClose, 
  models, 
  selectedModel, 
  onSelectModel, 
  onAddModel,
  isLoading 
}) {
  if (!isOpen) return null;

  const handleSelect = (model) => {
    onSelectModel(model);
    onClose();
  };

  // Sort models by score/activity
  const sortedModels = [...models].sort((a, b) => {
    const aActivity = (a.wins || 0) + (a.losses || 0);
    const bActivity = (b.wins || 0) + (b.losses || 0);
    return bActivity - aActivity;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md max-h-[85vh] bg-gradient-to-b from-gray-900/95 to-black rounded-t-3xl sm:rounded-3xl border border-white/10 overflow-hidden flex flex-col"
      >
        {/* Handle bar for mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-white">Select Model</h2>
            <p className="text-white/40 text-sm mt-0.5">{models.length} models</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Model list */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                <FaImages className="text-3xl text-pink-400/50" />
              </div>
              <p className="text-white/50 mb-4">No models yet</p>
              <motion.button
                onClick={() => { onClose(); onAddModel(); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white font-semibold shadow-lg shadow-pink-500/25"
              >
                Create Your First Model
              </motion.button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Overview option */}
              <motion.button
                onClick={() => handleSelect(null)}
                className={`
                  w-full p-4 rounded-2xl transition-all flex items-center gap-4
                  ${!selectedModel 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/10' 
                    : 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.06]'
                  }
                `}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0
                  ${!selectedModel 
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30' 
                    : 'bg-white/10'
                  }
                `}>
                  <FaChartPie className="text-white text-xl" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-white text-lg">Overview</div>
                  <div className="text-white/40 text-sm">View all collection stats</div>
                </div>
                {!selectedModel && (
                  <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                    <FaCheck className="text-white text-sm" />
                  </div>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-black px-4 text-white/30 text-xs uppercase tracking-wider">Your Models</span>
                </div>
              </div>

              {sortedModels.map((model, i) => {
                const isSelected = selectedModel?._id === model._id;
                const wins = model.wins || 0;
                const losses = model.losses || 0;
                const hasVotes = wins + losses > 0;
                
                return (
                  <motion.button
                    key={model._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => handleSelect(model)}
                    className={`
                      w-full p-4 rounded-2xl transition-all flex items-center gap-4
                      ${isSelected 
                        ? 'bg-gradient-to-r from-pink-500/20 to-purple-600/10 border-2 border-pink-500/50 shadow-lg shadow-pink-500/10' 
                        : 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.06]'
                      }
                    `}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Model avatar */}
                    <div className={`
                      w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl font-black
                      ${isSelected 
                        ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30' 
                        : 'bg-white/10 text-white/70'
                      }
                    `}>
                      {model.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Model info */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white truncate">{model.name}</span>
                        {model.isPublic && (
                          <FaGlobe className="text-emerald-400 flex-shrink-0" size={10} />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-white/40 text-sm flex items-center gap-1">
                          <FaImages size={10} />
                          {model.imageCount || 0}
                        </span>
                        {hasVotes && (
                          <span className="text-white/40 text-sm flex items-center gap-1">
                            <FaTrophy className="text-yellow-400/60" size={10} />
                            <span className="text-green-400/70">{wins}W</span>
                            <span className="text-white/20">·</span>
                            <span className="text-red-400/70">{losses}L</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Selected checkmark */}
                    {isSelected && (
                      <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <FaCheck className="text-white text-sm" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Add new model button */}
        <div 
          className="p-4 border-t border-white/5"
          style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <motion.button
            onClick={() => { onClose(); onAddModel(); }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center gap-2 text-white/50 hover:border-pink-500/40 hover:text-pink-400 hover:bg-pink-500/5 transition-all"
          >
            <FaPlus size={14} />
            <span className="font-semibold">Add New Model</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
