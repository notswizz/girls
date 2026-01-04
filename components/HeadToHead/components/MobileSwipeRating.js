import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCrown, FaHeart, FaSearchPlus, FaTrophy, FaImages, FaImage, FaVideo, FaMagic, FaRobot } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { useAIGeneration } from '../../../context/AIGenerationContext';
import { AIGenerationIndicator } from '../../GlobalAIModal';
import AIPromptModal from '../../AIPromptModal';

const MobileSwipeRating = ({
  images,
  selectedImageId,
  celebratingId,
  loading,
  onSelectWinner,
  onSkip
}) => {
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  // AI Generation - using global context
  const { startGeneration, isGenerating } = useAIGeneration();
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [promptMode, setPromptMode] = useState('image');
  const [promptReferenceImage, setPromptReferenceImage] = useState(null);
  const [currentAiImage, setCurrentAiImage] = useState(null);
  
  const handleOpenAiModal = (e, image, mode) => {
    e.stopPropagation();
    setPromptReferenceImage(image.url);
    setCurrentAiImage(image);
    setPromptMode(mode);
    setPromptModalOpen(true);
  };
  
  const handlePromptSubmit = (prompt) => {
    // Pass model info for filtering in creations
    const modelInfo = currentAiImage ? {
      id: currentAiImage.modelId,
      name: currentAiImage.modelName || currentAiImage.modelUsername
    } : null;
    startGeneration(promptReferenceImage, prompt, promptMode, modelInfo);
    setPromptModalOpen(false);
  };

  // Reset scroll when images change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'instant' });
      setCurrentIndex(0);
    }
  }, [images]);

  // Track scroll position to determine current card
  const handleScroll = () => {
    if (!scrollRef.current || selectedImageId) return;
    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.offsetWidth;
    const index = Math.round(scrollLeft / cardWidth);
    setCurrentIndex(Math.min(Math.max(0, index), images.length - 1));
  };

  const handleTapToVote = (imageId) => {
    if (selectedImageId || loading || zoomedImage) return;
    onSelectWinner(imageId);
  };

  const handleZoom = (e, image) => {
    e.stopPropagation();
    setZoomedImage(image);
  };

  if (!images || images.length < 2) return null;

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Side-by-side on desktop, swipeable on mobile */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide md:overflow-x-visible md:justify-center md:items-center md:gap-6 lg:gap-8 py-3 px-3"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((image, index) => {
          const isWinner = selectedImageId === image._id;
          const isCelebrating = celebratingId === image._id;
          const isLoser = selectedImageId && selectedImageId !== image._id;

          return (
            <div
              key={image._id}
              className="w-[80vw] flex-shrink-0 snap-center flex items-center justify-center px-1 md:w-[320px] lg:w-[360px]"
            >
              {/* Image Card - Fixed aspect ratio container */}
              <motion.div
                className={`
                  relative rounded-3xl overflow-hidden cursor-pointer
                  w-full aspect-[3/4]
                  transition-all duration-300
                  ${isLoser ? 'opacity-30 scale-90 grayscale' : ''}
                  ${!selectedImageId ? 'active:scale-[0.98]' : ''}
                `}
                onClick={() => handleTapToVote(image._id)}
                animate={{
                  scale: isLoser ? 0.9 : (isCelebrating ? 1.02 : 1),
                }}
              >
                {/* Outer glow for winner */}
                {isWinner && (
                  <div className="absolute -inset-3 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-[32px] blur-xl opacity-70 animate-pulse" />
                )}
                
                {/* Gradient border */}
                <div 
                  className={`absolute -inset-[2px] rounded-3xl ${
                    isWinner 
                      ? 'bg-gradient-to-r from-pink-500 via-rose-400 to-purple-500' 
                      : 'bg-gradient-to-br from-white/20 via-white/5 to-white/10'
                  }`}
                  style={{
                    backgroundSize: isWinner ? '200% 200%' : '100% 100%',
                    animation: isWinner ? 'gradient-shift 2s ease infinite' : 'none',
                  }}
                />
                
                {/* Inner card */}
                <div className="absolute inset-[2px] rounded-[22px] overflow-hidden bg-black">
                  {/* Full bleed image - covers the entire card */}
                  <img
                    src={image.url}
                    alt=""
                    className={`
                      absolute inset-0 w-full h-full object-cover brightness-110
                      transition-all duration-500
                      ${isCelebrating ? 'scale-[1.05] brightness-125' : ''}
                    `}
                  />
                  
                  {/* Gradient overlays for text readability - reduced opacity */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50 pointer-events-none" />
                  
                  {/* Top info bar - ELO only */}
                  <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-end p-3">
                    {/* ELO badge */}
                    {image.elo && (
                      <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 shadow-lg">
                        <span className="text-xs font-bold text-white">{Math.round(image.elo)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Bottom controls bar */}
                  <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between gap-2 p-3">
                    {/* AI Buttons */}
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={(e) => handleOpenAiModal(e, image, 'image')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/50 backdrop-blur-sm border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/20 transition-all shadow-lg"
                        whileTap={{ scale: 0.95 }}
                      >
                        <HiSparkles className="text-cyan-400" size={14} />
                        <span className="text-xs font-medium text-white">Photo</span>
                      </motion.button>
                      
                      <motion.button
                        onClick={(e) => handleOpenAiModal(e, image, 'video')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/50 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/20 transition-all shadow-lg"
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaVideo className="text-purple-400" size={12} />
                        <span className="text-xs font-medium text-white">Video</span>
                      </motion.button>
                    </div>
                    
                    {/* Zoom Button */}
                    <motion.button
                      onClick={(e) => handleZoom(e, image)}
                      className="p-2.5 rounded-xl bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg"
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaSearchPlus size={14} />
                    </motion.button>
                  </div>
                </div>

                {/* Winner celebration overlay */}
                <AnimatePresence>
                  {isCelebrating && (
                    <motion.div
                      className="absolute inset-0 z-20 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 via-purple-500/20 to-transparent" />
                      
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full blur-2xl opacity-60" />
                        <div className="relative bg-gradient-to-br from-pink-400 via-pink-500 to-purple-600 rounded-full p-6 shadow-2xl">
                          <FaHeart className="text-white text-4xl drop-shadow-lg" />
                        </div>
                      </motion.div>
                      
                      {/* Floating hearts */}
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute"
                          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                          animate={{ 
                            opacity: [0, 1, 0],
                            scale: [0.5, 1.2, 0.5],
                            x: (Math.random() - 0.5) * 250,
                            y: -120 - Math.random() * 150
                          }}
                          transition={{ duration: 1, delay: i * 0.05 }}
                        >
                          <FaHeart className={`${i % 2 === 0 ? 'text-pink-400' : 'text-purple-400'} text-lg`} />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

            </div>
          );
        })}
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setZoomedImage(null)}
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={zoomedImage.url}
              alt=""
              className="max-w-full max-h-full object-contain rounded-2xl"
            />
            <p className="absolute bottom-8 text-white/50 text-sm">tap anywhere to close</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Leaderboard Modal */}
      <AnimatePresence>
        {showLeaderboard && (
          <GalleryLeaderboardModal onClose={() => setShowLeaderboard(false)} />
        )}
      </AnimatePresence>

      {/* AI Prompt Modal */}
      <AIPromptModal
        isOpen={promptModalOpen}
        onClose={() => setPromptModalOpen(false)}
        mode={promptMode}
        referenceImageUrl={promptReferenceImage}
        onSubmit={handlePromptSubmit}
        isGenerating={isGenerating}
      />

      {/* AI Generation Indicator (floating button when generating) */}
      <AIGenerationIndicator />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
};

// Gallery Leaderboard Modal (for personal gallery)
function GalleryLeaderboardModal({ onClose }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/scores/leaderboard');
        const data = await res.json();
        if (data.success || data.leaderboard) {
          setLeaderboard(data.leaderboard || []);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[80vh] overflow-y-auto bg-gradient-to-b from-gray-900 to-black rounded-t-3xl sm:rounded-2xl border border-white/10"
      >
        {/* Handle bar for mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-white/30 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <FaTrophy className="text-yellow-400 text-xl" />
          <div>
            <h2 className="text-lg font-bold text-white">My Gallery Leaderboard</h2>
            <p className="text-white/50 text-xs">Your models ranked by ELO</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500" />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              <FaTrophy className="text-3xl mx-auto mb-3 text-white/20" />
              <p>No rankings yet</p>
              <p className="text-sm mt-1">Rate some photos to build your leaderboard!</p>
            </div>
          ) : (
            leaderboard.slice(0, 10).map((entry, i) => (
              <div
                key={entry._id || i}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5"
              >
                {/* Rank */}
                <div className="w-8 text-center">
                  {i < 3 ? (
                    <FaTrophy className={`mx-auto ${
                      i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : 'text-amber-600'
                    }`} />
                  ) : (
                    <span className="text-white/50 text-sm">{i + 1}</span>
                  )}
                </div>

                {/* Preview */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                  {entry.url || entry.imageUrl ? (
                    <img src={entry.url || entry.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaImages className="text-white/20" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{entry.modelName || entry.name || 'Photo'}</p>
                  <p className="text-white/50 text-xs">{entry.wins || 0}W - {entry.losses || 0}L</p>
                </div>

                {/* ELO Score */}
                <div className="text-right">
                  <p className="text-pink-400 font-bold">{Math.round(entry.elo || 1200)}</p>
                  <p className="text-white/40 text-xs">elo</p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default MobileSwipeRating;
