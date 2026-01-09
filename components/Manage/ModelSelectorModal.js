import { motion } from 'framer-motion';
import { FaTimes, FaPlus, FaImages, FaCheck, FaChartPie } from 'react-icons/fa';

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md max-h-[80vh] bg-gradient-to-b from-gray-900 to-black rounded-t-3xl sm:rounded-2xl border border-white/10 overflow-hidden flex flex-col"
      >
        {/* Handle bar for mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-white/30 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Select Model</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-white/50 hover:text-white transition-colors"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Model list */}
        <div className="flex-1 overflow-y-auto p-3">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              <p className="mb-4">No models yet</p>
              <button
                onClick={() => { onClose(); onAddModel(); }}
                className="text-pink-400 hover:text-pink-300 font-medium"
              >
                Create your first model →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Overview option */}
              <motion.button
                onClick={() => handleSelect(null)}
                className={`
                  w-full p-4 rounded-xl transition-all flex items-center gap-4
                  ${!selectedModel 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/50' 
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 active:scale-[0.98]'
                  }
                `}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                  ${!selectedModel 
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600' 
                    : 'bg-white/10'
                  }
                `}>
                  <FaChartPie className="text-white text-lg" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-white">Overview</div>
                  <div className="text-white/40 text-sm">View all stats</div>
                </div>
                {!selectedModel && (
                  <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                    <FaCheck className="text-white text-sm" />
                  </div>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-gray-900 px-3 text-white/30 text-xs">Models</span>
                </div>
              </div>

              {models.map((model) => {
                const isSelected = selectedModel?._id === model._id;
                return (
                  <motion.button
                    key={model._id}
                    onClick={() => handleSelect(model)}
                    className={`
                      w-full p-4 rounded-xl transition-all flex items-center gap-4
                      ${isSelected 
                        ? 'bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-pink-500/50' 
                        : 'bg-white/5 border border-white/10 hover:bg-white/10 active:scale-[0.98]'
                      }
                    `}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Model icon/avatar */}
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                      ${isSelected 
                        ? 'bg-gradient-to-br from-pink-500 to-purple-600' 
                        : 'bg-white/10'
                      }
                    `}>
                      <span className="text-white font-bold text-lg">
                        {model.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Model info */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-semibold text-white truncate">{model.name}</div>
                      <div className="text-white/50 text-sm flex items-center gap-1 mt-0.5">
                        <FaImages size={10} />
                        {model.imageCount || 0} photos
                      </div>
                    </div>

                    {/* Selected checkmark */}
                    {isSelected && (
                      <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0">
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
          className="p-3 border-t border-white/10"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <button
            onClick={() => { onClose(); onAddModel(); }}
            className="w-full py-4 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center gap-2 text-white/50 hover:border-pink-500/50 hover:text-pink-400 hover:bg-white/5 transition-all"
          >
            <FaPlus size={14} />
            <span className="font-medium">Add New Model</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

