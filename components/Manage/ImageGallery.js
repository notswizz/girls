import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCamera, FaImages, FaUsers, FaPlay, FaVideo } from 'react-icons/fa';
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
      <div className="h-full flex items-center justify-center text-white/30">
        <div className="text-center px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-white/[0.03] rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (modelImages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-white/30">
        <div className="text-center px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
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
              <motion.button
                onClick={onUploadClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold mt-2"
              >
                Upload Photos
              </motion.button>
            </>
          )}
        </div>
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {modelImages.map((image, index) => {
        const wins = image.wins || 0;
        const losses = image.losses || 0;
        const totalMatches = wins + losses;
        const rank = imageRanks[image._id];
        const elo = image.elo || 1200;
        const score = image.score || 0;
        const isExplore = ratingMode === 'explore';

        return (
          <motion.div
            key={image._id}
            className="relative group cursor-pointer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
            onClick={() => onImageClick({ ...image, ratingMode })}
          >
            {/* Image Container */}
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5 group-hover:border-pink-500/30 transition-all">
              {isVideoUrl(image.url) || image.aiType === 'video' ? (
                <div className="relative w-full h-full">
                  <video
                    src={image.url}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    onMouseEnter={(e) => e.target.play()}
                    onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                  />
                  <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full p-1.5">
                    <FaPlay className="text-white text-[8px]" />
                  </div>
                </div>
              ) : (
                <img
                  src={image.url}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              )}
            </div>
            
            {/* Rank Badge */}
            {rank <= 3 && totalMatches > 0 && (
              <div className="absolute top-2 left-2 text-lg drop-shadow-lg">
                {rank === 1 ? '👑' : rank === 2 ? '🥈' : '🥉'}
              </div>
            )}

            {/* Stats Overlay - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent rounded-b-2xl">
              {totalMatches > 0 ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold text-sm tabular-nums">
                      {isExplore ? score : Math.round(elo)}
                    </div>
                    <div className="text-[10px] text-white/50">
                      <span className="text-green-400">{wins}W</span>
                      <span className="mx-0.5">·</span>
                      <span className="text-red-400">{losses}L</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-white/40 text-right">
                    #{rank}
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-white/40 text-center">
                  Not rated
                </div>
              )}
            </div>

            {/* Hover Overlay with AI Video Button */}
            <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/70 backdrop-blur-sm">
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-white">
                  {isExplore ? score : Math.round(elo)}
                </div>
                <div className="text-white/50 text-xs">
                  {isExplore ? 'Score' : 'ELO'}
                </div>
              </div>
              
              <motion.button
                onClick={(e) => handleOpenAiModal(e, image)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-500/30 hover:border-purple-400/50 transition-all"
              >
                <FaVideo className="text-purple-400" size={14} />
                <span className="text-xs font-semibold text-purple-300">AI Video</span>
              </motion.button>
            </div>
          </motion.div>
        );
      })}
      
      <AIPromptModal
        isOpen={promptModalOpen}
        onClose={() => setPromptModalOpen(false)}
        mode="video"
        referenceImageUrl={promptReferenceImage}
        onSubmit={handlePromptSubmit}
        isGenerating={isGenerating}
      />
    </div>
  );
}
