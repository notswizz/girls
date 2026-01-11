import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCamera, FaImages, FaUsers, FaPlay, FaVideo, FaTrophy, FaExpand } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { useAIGeneration } from '../../context/AIGenerationContext';
import AIPromptModal from '../AIPromptModal';

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
  const { startGeneration, isGenerating } = useAIGeneration();
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [promptReferenceImage, setPromptReferenceImage] = useState(null);

  const handleOpenAiModal = (e, image) => {
    e.stopPropagation();
    setPromptReferenceImage(image.url);
    setPromptModalOpen(true);
  };

  const handlePromptSubmit = (prompt) => {
    const modelInfo = selectedModel ? {
      id: selectedModel._id || selectedModel.id,
      name: selectedModel.name || selectedModel.username
    } : null;
    startGeneration(promptReferenceImage, prompt, 'video', modelInfo);
    setPromptModalOpen(false);
  };

  if (!selectedModel) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 flex items-center justify-center">
            <FaImages className="text-3xl text-white/20" />
          </div>
          <p className="text-xl font-semibold text-white/60 mb-2">Select a Model</p>
          <p className="text-sm text-white/30">or tap + to add one</p>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {[...Array(12)].map((_, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="aspect-[3/4] bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-2xl animate-pulse" 
          />
        ))}
      </div>
    );
  }

  if (modelImages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-4 py-12"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-white/10 flex items-center justify-center">
            {ratingMode === 'explore' ? (
              <FaUsers className="text-3xl text-purple-400/50" />
            ) : (
              <FaCamera className="text-3xl text-pink-400/50" />
            )}
          </div>
          {ratingMode === 'explore' ? (
            <>
              <p className="text-xl font-semibold text-white/70 mb-2">No Community Votes Yet</p>
              <p className="text-sm text-white/40 max-w-xs mx-auto">
                Make your model public and add photos to get community ratings
              </p>
            </>
          ) : (
            <>
              <p className="text-xl font-semibold text-white/70 mb-3">No Photos Yet</p>
              <motion.button
                onClick={onUploadClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg shadow-pink-500/20"
              >
                Upload Photos
              </motion.button>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  // Sort images by ELO/score
  const sortedImages = [...modelImages].sort((a, b) => {
    return ratingMode === 'gallery' 
      ? (b.elo || 1200) - (a.elo || 1200)
      : (b.score || 0) - (a.score || 0);
  });
  
  const imageRanks = {};
  sortedImages.forEach((img, i) => { imageRanks[img._id] = i + 1; });

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
        {modelImages.map((image, index) => {
          const wins = image.wins || 0;
          const losses = image.losses || 0;
          const totalMatches = wins + losses;
          const rank = imageRanks[image._id];
          const elo = image.elo || 1200;
          const score = image.score || 0;
          const isExplore = ratingMode === 'explore';
          const isVideo = isVideoUrl(image.url) || image.aiType === 'video';

          return (
            <motion.div
              key={image._id}
              className="relative group cursor-pointer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.02, 0.3) }}
              onClick={() => onImageClick({ ...image, ratingMode })}
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-black border border-white/5 group-hover:border-pink-500/40 transition-all shadow-lg">
                {isVideo ? (
                  <div className="relative w-full h-full">
                    <video
                      src={image.url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      preload="none"
                      onMouseEnter={(e) => e.target.play()}
                      onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                    />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full p-1.5">
                      <FaPlay className="text-white text-[8px]" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={image.url}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                
                {/* Rank Badge - Top 3 */}
                {rank <= 3 && totalMatches > 0 && (
                  <div className={`absolute top-2 left-2 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-lg ${
                    rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
                    rank === 2 ? 'bg-gradient-to-br from-slate-300 to-gray-400 text-gray-700' :
                    'bg-gradient-to-br from-amber-600 to-orange-700 text-white'
                  }`}>
                    {rank === 1 ? '👑' : `#${rank}`}
                  </div>
                )}

                {/* Stats Bar - Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                  {totalMatches > 0 ? (
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-white font-bold text-base sm:text-lg tabular-nums drop-shadow-lg">
                          {isExplore ? score : Math.round(elo)}
                        </div>
                        <div className="text-[10px] sm:text-xs text-white/70 drop-shadow-md">
                          <span className="text-green-400">{wins}W</span>
                          <span className="mx-0.5 text-white/40">·</span>
                          <span className="text-red-400">{losses}L</span>
                        </div>
                      </div>
                      {rank > 3 && (
                        <div className="px-2 py-1 rounded-md bg-black/40 backdrop-blur-sm">
                          <span className="text-[10px] text-white/60">#{rank}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-[10px] sm:text-xs text-white/40 bg-black/30 backdrop-blur-sm px-2 py-1 rounded">
                        Not rated
                      </span>
                    </div>
                  )}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/80 backdrop-blur-sm">
                  <motion.div
                    initial={false}
                    className="text-center"
                  >
                    {/* Large Score Display */}
                    <div className="mb-4">
                      <div className="text-4xl font-black text-white drop-shadow-lg">
                        {isExplore ? score : Math.round(elo)}
                      </div>
                      <div className="text-sm text-white/50 font-medium">
                        {isExplore ? 'Community Score' : 'ELO Rating'}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 justify-center">
                      <motion.button
                        onClick={(e) => handleOpenAiModal(e, image)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 hover:bg-purple-500/30 transition-all"
                      >
                        <HiSparkles className="text-purple-400" size={14} />
                        <span className="text-xs font-semibold text-purple-300">AI Video</span>
                      </motion.button>
                      
                      <motion.button
                        onClick={(e) => { e.stopPropagation(); onImageClick({ ...image, ratingMode }); }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
                      >
                        <FaExpand className="text-white/70" size={14} />
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <AIPromptModal
        isOpen={promptModalOpen}
        onClose={() => setPromptModalOpen(false)}
        mode="video"
        referenceImageUrl={promptReferenceImage}
        onSubmit={handlePromptSubmit}
        isGenerating={isGenerating}
      />
    </>
  );
}
