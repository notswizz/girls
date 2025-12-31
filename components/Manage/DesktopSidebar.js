import { FaPlus, FaSync, FaChartPie } from 'react-icons/fa';

export default function DesktopSidebar({ models, selectedModel, onSelectModel, onAddModel, onRefresh, isLoading }) {
  return (
    <div className="hidden md:flex w-56 flex-shrink-0 border-r border-white/10 flex-col bg-black/20">
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/70">Models</h2>
        <button
          onClick={onAddModel}
          className="p-1.5 bg-pink-500 rounded-lg text-white hover:bg-pink-600 transition-colors"
          title="Add model"
        >
          <FaPlus size={10} />
        </button>
      </div>

      {/* Overview button */}
      <div className="p-2 border-b border-white/10">
        <button
          onClick={() => onSelectModel(null)}
          className={`
            w-full flex items-center gap-2 p-3 rounded-lg transition-all text-sm
            ${!selectedModel 
              ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-500/50' 
              : 'hover:bg-white/10 border border-transparent'}
          `}
        >
          <FaChartPie className="text-cyan-400" />
          <span className="font-medium text-white">Overview</span>
        </button>
      </div>
      
      {/* Model list - scrollable */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-3 space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : models.length === 0 ? (
          <div className="p-4 text-center text-white/40 text-sm">
            No models yet
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {models.map((model) => (
              <button
                key={model._id}
                onClick={() => onSelectModel(model)}
                className={`
                  w-full text-left p-3 rounded-lg transition-all text-sm
                  ${selectedModel?._id === model._id 
                    ? 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 border border-pink-500/50' 
                    : 'hover:bg-white/10 border border-transparent'}
                `}
              >
                <div className="font-medium text-white truncate">{model.name}</div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-white/40 text-xs">@{model.username}</span>
                  <span className="text-white/50 text-xs">{model.imageCount || 0}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Refresh button */}
      <div className="p-2 border-t border-white/10">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 p-2 text-white/40 hover:text-white/70 text-xs transition-colors"
        >
          <FaSync className={isLoading ? 'animate-spin' : ''} size={10} />
          Refresh
        </button>
      </div>
    </div>
  );
}

