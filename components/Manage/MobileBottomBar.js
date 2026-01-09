import { motion } from 'framer-motion';
import { FaPlus, FaCamera, FaChevronUp, FaFolderOpen } from 'react-icons/fa';

export default function MobileBottomBar({ 
  selectedModel, 
  onSelectModel, 
  onAddModel, 
  onUpload,
  modelCount 
}) {
  return (
    <div 
      className="md:hidden fixed left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-t border-white/10"
      style={{ bottom: 'calc(56px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex items-stretch h-16">
        {/* Current model / selector */}
        <button
          onClick={onSelectModel}
          className="flex-1 flex items-center gap-3 px-4 hover:bg-white/5 active:bg-white/10 transition-colors border-r border-white/10"
        >
          {selectedModel ? (
            <>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/40 to-purple-500/40 flex items-center justify-center border border-pink-500/30">
                <span className="text-lg font-black text-white">
                  {selectedModel.name[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {selectedModel.name}
                </div>
                <div className="text-xs text-white/40">
                  Tap to switch
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <FaFolderOpen className="text-white/60" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-semibold text-white">
                  {modelCount > 0 ? 'Select Model' : 'Overview'}
                </div>
                <div className="text-xs text-white/40">
                  {modelCount} model{modelCount !== 1 ? 's' : ''}
                </div>
              </div>
            </>
          )}
          <FaChevronUp className="text-white/30" size={12} />
        </button>

        {/* Add Model */}
        <motion.button
          onClick={onAddModel}
          whileTap={{ scale: 0.95 }}
          className="w-16 flex flex-col items-center justify-center gap-0.5 hover:bg-white/5 active:bg-white/10 transition-colors border-r border-white/10"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <FaPlus className="text-purple-400" size={12} />
          </div>
          <span className="text-[10px] text-white/50 font-medium">Add</span>
        </motion.button>

        {/* Upload Photos - highlighted when model is selected */}
        <motion.button
          onClick={onUpload}
          whileTap={{ scale: 0.95 }}
          disabled={!selectedModel}
          className={`w-20 flex flex-col items-center justify-center gap-0.5 transition-all ${
            selectedModel 
              ? 'bg-gradient-to-t from-pink-500/20 to-transparent hover:from-pink-500/30' 
              : 'opacity-40'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            selectedModel 
              ? 'bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-pink-500/30' 
              : 'bg-white/10'
          }`}>
            <FaCamera className="text-white" size={16} />
          </div>
          <span className={`text-[10px] font-semibold ${selectedModel ? 'text-pink-400' : 'text-white/30'}`}>
            Upload
          </span>
        </motion.button>
      </div>
    </div>
  );
}

