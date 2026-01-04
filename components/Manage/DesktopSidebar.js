import { motion } from 'framer-motion';
import { FaPlus, FaSync, FaChartPie, FaImages } from 'react-icons/fa';

export default function DesktopSidebar({ models, selectedModel, onSelectModel, onAddModel, onRefresh, isLoading }) {
  return (
    <div className="hidden md:flex w-64 flex-shrink-0 border-r border-white/5 flex-col bg-gradient-to-b from-white/[0.02] to-transparent">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/60">Your Models</h2>
        <motion.button
          onClick={onAddModel}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg text-white shadow-lg shadow-pink-500/20"
          title="Add model"
        >
          <FaPlus size={12} />
        </motion.button>
      </div>

      {/* Overview button */}
      <div className="px-3 pb-3">
        <motion.button
          onClick={() => onSelectModel(null)}
          whileTap={{ scale: 0.98 }}
          className={`
            w-full flex items-center gap-3 p-3 rounded-xl transition-all
            ${!selectedModel 
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border border-cyan-500/30' 
              : 'bg-white/[0.02] hover:bg-white/[0.05] border border-white/5'}
          `}
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            !selectedModel ? 'bg-cyan-500/20' : 'bg-white/5'
          }`}>
            <FaChartPie className={!selectedModel ? 'text-cyan-400' : 'text-white/40'} />
          </div>
          <div className="text-left">
            <div className={`text-sm font-medium ${!selectedModel ? 'text-white' : 'text-white/70'}`}>
              Overview
            </div>
            <div className="text-[10px] text-white/40">All stats</div>
          </div>
        </motion.button>
      </div>
      
      {/* Model list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-white/[0.02] rounded-xl animate-pulse" />
          ))
        ) : models.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/5 flex items-center justify-center">
              <FaImages className="text-white/20" />
            </div>
            <p className="text-white/40 text-sm mb-3">No models yet</p>
            <button
              onClick={onAddModel}
              className="text-pink-400 text-sm hover:text-pink-300 transition-colors"
            >
              Add your first model →
            </button>
          </div>
        ) : (
          models.map((model, i) => {
            const isSelected = selectedModel?._id === model._id;
            return (
              <motion.button
                key={model._id}
                onClick={() => onSelectModel(model)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left
                  ${isSelected 
                    ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/10 border border-pink-500/30' 
                    : 'bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10'}
                `}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                  isSelected 
                    ? 'bg-gradient-to-br from-pink-500/30 to-purple-500/30 text-pink-400' 
                    : 'bg-white/5 text-white/60'
                }`}>
                  {model.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-white/70'}`}>
                    {model.name}
                  </div>
                  <div className="text-[10px] text-white/40">
                    {model.imageCount || 0} photos
                  </div>
                </div>
                {model.wins > 0 && (
                  <div className="text-right">
                    <div className="text-xs font-medium text-white/60">
                      {model.wins}W
                    </div>
                  </div>
                )}
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
          className="w-full flex items-center justify-center gap-2 py-2 text-white/30 hover:text-white/50 text-xs transition-colors rounded-lg hover:bg-white/[0.02]"
        >
          <FaSync className={isLoading ? 'animate-spin' : ''} size={10} />
          Refresh
        </button>
      </div>
    </div>
  );
}
