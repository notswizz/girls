import { motion } from 'framer-motion';
import { FaPlus, FaCamera, FaImages, FaTrophy, FaChartLine, FaUsers, FaPlay } from 'react-icons/fa';

// Helper to check if URL is a video
const isVideoUrl = (url) => {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext));
};

export default function ImageGallery({ 
  selectedModel, 
  modelImages, 
  isLoading, 
  onImageClick, 
  onUploadClick,
  ratingMode = 'gallery'
}) {
  if (!selectedModel) {
    return (
      <div className="h-full flex items-center justify-center text-white/30">
        <div className="text-center px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <FaImages className="text-2xl text-white/20" />
          </div>
          <p className="text-lg mb-2">Select a model</p>
          <p className="text-sm">or tap + to add one</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (modelImages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-white/30">
        <div className="text-center px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            {ratingMode === 'explore' ? (
              <FaUsers className="text-2xl text-white/20" />
            ) : (
              <FaCamera className="text-2xl text-white/20" />
            )}
          </div>
          {ratingMode === 'explore' ? (
            <>
              <p className="text-lg mb-2">No community votes yet</p>
              <p className="text-sm text-white/40">Make your model public to get community ratings</p>
            </>
          ) : (
            <>
              <p className="text-lg mb-2">No photos yet</p>
              <button
                onClick={onUploadClick}
                className="text-pink-400 hover:text-pink-300 text-sm font-medium"
              >
                Upload some →
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Sort images by appropriate metric for ranking
  const sortedImages = [...modelImages].sort((a, b) => {
    if (ratingMode === 'gallery') {
      return (b.elo || 1200) - (a.elo || 1200);
    } else {
      // For community mode, sort by score or wins
      return (b.score || 0) - (a.score || 0);
    }
  });
  const imageRanks = {};
  sortedImages.forEach((img, i) => {
    imageRanks[img._id] = i + 1;
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
      {modelImages.map((image) => {
        const wins = image.wins || 0;
        const losses = image.losses || 0;
        const totalMatches = wins + losses;
        const winRate = totalMatches > 0 ? wins / totalMatches : 0;
        const rank = imageRanks[image._id];
        const elo = image.elo || 1200;
        const score = image.score || 0;
        
        // Color based on mode
        const getScoreColor = (val, isElo = false) => {
          if (isElo) {
            if (val >= 1600) return 'from-yellow-400 to-orange-500';
            if (val >= 1400) return 'from-purple-400 to-pink-500';
            if (val >= 1200) return 'from-cyan-400 to-blue-500';
            return 'from-gray-400 to-gray-500';
          } else {
            if (val >= 700) return 'from-yellow-400 to-orange-500';
            if (val >= 500) return 'from-purple-400 to-pink-500';
            if (val >= 300) return 'from-cyan-400 to-blue-500';
            return 'from-gray-400 to-gray-500';
          }
        };

        const getRankBadge = (rank) => {
          if (rank === 1) return { bg: 'bg-yellow-500', text: '👑' };
          if (rank === 2) return { bg: 'bg-gray-300', text: '🥈' };
          if (rank === 3) return { bg: 'bg-amber-600', text: '🥉' };
          return null;
        };

        const rankBadge = getRankBadge(rank);
        const isExplore = ratingMode === 'explore';

        return (
          <motion.div
            key={image._id}
            className="relative group cursor-pointer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => onImageClick({ ...image, ratingMode })}
            whileTap={{ scale: 0.97 }}
          >
            <div className={`aspect-[3/4] rounded-xl overflow-hidden bg-white/5 border ${
              isExplore ? 'border-cyan-500/30' : 'border-white/10'
            }`}>
              {isVideoUrl(image.url) || image.aiType === 'video' ? (
                <div className="relative w-full h-full">
                  <video
                    src={image.url}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    muted
                    loop
                    playsInline
                    onMouseEnter={(e) => e.target.play()}
                    onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                  />
                  {/* Video indicator */}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full p-1.5">
                    <FaPlay className="text-white text-[10px]" />
                  </div>
                </div>
              ) : (
                <img
                  src={image.url}
                  alt=""
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              )}
            </div>
            
            {/* Gradient overlay - always visible on bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-xl pointer-events-none" />
            
            {/* Rank badge for top 3 */}
            {rankBadge && totalMatches > 0 && (
              <div className="absolute top-2 left-2 text-lg">
                {rankBadge.text}
              </div>
            )}

            {/* Mode indicator for explore */}
            {isExplore && (
              <div className="absolute top-2 right-2">
                <FaUsers className="text-cyan-400 text-xs" />
              </div>
            )}

            {/* Stats overlay - always visible */}
            <div className="absolute bottom-0 left-0 right-0 p-2 pointer-events-none">
              {totalMatches > 0 ? (
                <div className="space-y-1">
                  {/* Score/ELO with gradient bar */}
                  <div className="flex items-center gap-1.5">
                    <div className={`h-1.5 rounded-full bg-gradient-to-r ${
                      isExplore ? getScoreColor(score, false) : getScoreColor(elo, true)
                    } flex-1`} 
                         style={{ 
                           width: isExplore 
                             ? `${Math.min(100, score / 10)}%`
                             : `${Math.min(100, ((elo - 800) / 800) * 100)}%`, 
                           maxWidth: '100%' 
                         }} 
                    />
                    <span className="text-white text-xs font-bold tabular-nums">
                      {isExplore ? score : Math.round(elo)}
                    </span>
                  </div>
                  
                  {/* Win/Loss record */}
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-white/70">
                      <span className="text-green-400 font-medium">{wins}W</span>
                      <span className="text-white/30 mx-0.5">·</span>
                      <span className="text-red-400 font-medium">{losses}L</span>
                    </span>
                    <span className="text-white/50">
                      {Math.round(winRate * 100)}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-white/40 text-[10px]">
                  {isExplore ? 'No community votes' : 'Not rated yet'}
                </div>
              )}
            </div>

            {/* Hover details overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl bg-black/40">
              <div className="text-center">
                <div className="text-white font-bold text-lg">
                  {isExplore ? score : Math.round(elo)}
                </div>
                <div className="text-white/60 text-xs">
                  {isExplore ? 'Community Score' : 'ELO Rating'}
                </div>
                {totalMatches > 0 && (
                  <div className="text-white/80 text-xs mt-1">
                    #{rank} of {modelImages.length}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

