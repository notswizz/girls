import React, { useState, useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaHeart, FaSearchPlus, FaImages, FaVideo } from 'react-icons/fa';
import { useAIGeneration } from '../context/AIGenerationContext';
import { AIGenerationIndicator } from './GlobalAIModal';
import AIPromptModal from './AIPromptModal';
import { markWinSound } from '../pages/_app';

// Maximum number of recent models to track (minimum ratings apart)
const RECENT_MODELS_LIMIT = 6;

export default function ExploreRating() {
  const { data: session, status } = useSession();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [celebrating, setCelebrating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [recentModels, setRecentModels] = useState([]);
  const containerRef = useRef(null);
  
  // AI Generation - using global context
  const { startGeneration, isGenerating } = useAIGeneration();
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [promptReferenceImage, setPromptReferenceImage] = useState(null);
  const [currentAiImage, setCurrentAiImage] = useState(null);
  
  const handleOpenAiModal = (e, image) => {
    e.stopPropagation();
    setPromptReferenceImage(image.url);
    setCurrentAiImage(image);
    setPromptModalOpen(true);
  };
  
  const handlePromptSubmit = (prompt) => {
    // Pass model info for filtering in creations
    const modelInfo = currentAiImage ? {
      id: currentAiImage.modelId,
      name: currentAiImage.modelName || currentAiImage.modelUsername
    } : null;
    startGeneration(promptReferenceImage, prompt, 'video', modelInfo);
    setPromptModalOpen(false);
  };

  const fetchImages = async (currentRecentModels = recentModels) => {
    try {
      setLoading(true);
      
      // Build URL with recent models to avoid repetition
      const params = new URLSearchParams();
      if (currentRecentModels.length > 0) {
        params.append('recentModels', currentRecentModels.join(','));
      }
      
      const url = `/api/explore/compare${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success && data.images?.length >= 2) {
        setImages(data.images);
        setCurrentIndex(0);
        if (containerRef.current) {
          containerRef.current.scrollTo({ left: 0, behavior: 'instant' });
        }
        
        // Track models shown (to avoid showing same model within 6 ratings)
        const newModelIds = data.images
          .map(img => img.modelId?.toString() || img.modelId)
          .filter(Boolean);
        
        setRecentModels(prev => {
          const updated = [...prev, ...newModelIds];
          return updated.slice(-RECENT_MODELS_LIMIT);
        });
      } else {
        setImages([]);
      }
    } catch (err) {
      console.error('Error fetching images:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchImages();
    }
  }, [session]);

  const handleScroll = (e) => {
    if (selectedId) return;
    const container = e.target;
    const scrollLeft = container.scrollLeft;
    const width = container.offsetWidth;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < images.length) {
      setCurrentIndex(newIndex);
    }
  };

  const handleVote = async (winnerId) => {
    if (zoomedImage) return;
    const loserId = images.find(img => img._id !== winnerId)?._id;
    if (!loserId) return;

    setSelectedId(winnerId);
    setCelebrating(true);
    
    // Play win sound and mark it to prevent click sound
    try {
      markWinSound();
      const winSound = new Audio('/win.wav');
      winSound.volume = 0.4;
      winSound.play().catch(() => {});
    } catch (e) {}

    try {
      // Build URL for pre-fetching next images
      const params = new URLSearchParams();
      if (recentModels.length > 0) {
        params.append('recentModels', recentModels.join(','));
      }
      const nextUrl = `/api/explore/compare${params.toString() ? '?' + params.toString() : ''}`;
      
      // Submit vote and pre-fetch next images in parallel
      const [, nextRes] = await Promise.all([
        fetch('/api/explore/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ winnerId, loserId })
        }),
        fetch(nextUrl)
      ]);
      
      const nextData = await nextRes.json();

      // Brief celebration then show next
      setTimeout(() => {
        setCelebrating(false);
        setSelectedId(null);
        if (nextData.success && nextData.images?.length >= 2) {
          setImages(nextData.images);
          setCurrentIndex(0);
          if (containerRef.current) {
            containerRef.current.scrollTo({ left: 0, behavior: 'instant' });
          }
          const newModelIds = nextData.images
            .map(img => img.modelId?.toString() || img.modelId)
            .filter(Boolean);
          setRecentModels(prev => [...prev, ...newModelIds].slice(-RECENT_MODELS_LIMIT));
        } else {
          fetchImages();
        }
      }, 400);
    } catch (err) {
      console.error('Error voting:', err);
      setCelebrating(false);
      setSelectedId(null);
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500" />
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
          <FaGoogle className="text-3xl text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Sign in to Explore</h2>
        <p className="text-white/60 mb-8">
          Rate photos from public galleries and compete on the community leaderboard.
        </p>
        <button
          onClick={() => signIn('google')}
          className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
        >
          <FaGoogle className="text-xl" />
          Sign in with Google
        </button>
      </div>
    );
  }

  // No images available
  if (!loading && images.length < 2) {
    return (
      <div className="text-center py-12">
        <FaImages className="text-4xl text-white/20 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Public Photos</h3>
        <p className="text-white/60 mb-6">There aren't enough public galleries to rate yet.</p>
        <p className="text-white/40 text-sm">Make some of your models public to get started!</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Side-by-side on desktop, swipeable on mobile */}
      <div 
        ref={containerRef}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide md:overflow-x-visible md:justify-center md:items-center md:gap-6 lg:gap-8 py-3 px-3"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((image, i) => {
          const isWinner = selectedId === image._id;
          const isLoser = selectedId && selectedId !== image._id;
          
          return (
            <div
              key={image._id}
              className="w-[80vw] flex-shrink-0 snap-center flex items-center justify-center px-1 md:w-[320px] lg:w-[360px]"
            >
              {/* Image Card - Fixed aspect ratio */}
              <motion.div
                className={`
                  relative rounded-3xl overflow-hidden cursor-pointer
                  w-full aspect-[3/4]
                  transition-all duration-300
                  ${isLoser ? 'opacity-30 scale-90 grayscale' : ''}
                  ${!selectedId ? 'active:scale-[0.98]' : ''}
                `}
                onClick={() => !selectedId && handleVote(image._id)}
                animate={{
                  scale: isLoser ? 0.9 : (celebrating && isWinner ? 1.02 : 1),
                }}
              >
                {/* Outer glow for winner */}
                {isWinner && (
                  <div className="absolute -inset-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-[32px] blur-xl opacity-70 animate-pulse" />
                )}
                
                {/* Gradient border */}
                <div 
                  className={`absolute -inset-[2px] rounded-3xl ${
                    isWinner 
                      ? 'bg-gradient-to-r from-cyan-500 via-blue-400 to-cyan-500' 
                      : 'bg-gradient-to-br from-white/20 via-white/5 to-white/10'
                  }`}
                  style={{
                    backgroundSize: isWinner ? '200% 200%' : '100% 100%',
                    animation: isWinner ? 'gradient-shift 2s ease infinite' : 'none',
                  }}
                />
                
                {/* Inner card */}
                <div className="absolute inset-[2px] rounded-[22px] overflow-hidden bg-black">
                  {/* Full bleed image */}
                  <img
                    src={image.url}
                    alt=""
                    loading="eager"
                    decoding="async"
                    className={`
                      absolute inset-0 w-full h-full object-cover brightness-110
                      transition-all duration-500
                      ${celebrating && isWinner ? 'scale-[1.05] brightness-125' : ''}
                    `}
                  />
                  
                  {/* Gradient overlays - reduced opacity */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50 pointer-events-none" />
                  
                  {/* Top info - ELO only */}
                  <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-end p-3">
                    {image.elo && (
                      <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 shadow-lg">
                        <span className="text-xs font-bold text-white">{Math.round(image.elo)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Bottom controls */}
                  <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between gap-2 p-3">
                    {/* AI Video Button */}
                    <motion.button
                      onClick={(e) => handleOpenAiModal(e, image)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/50 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/20 transition-all shadow-lg"
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaVideo className="text-purple-400" size={12} />
                      <span className="text-xs font-medium text-white">AI Video</span>
                    </motion.button>
                    
                    {/* Zoom Button */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomedImage(image);
                      }}
                      className="p-2.5 rounded-xl bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg"
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaSearchPlus size={14} />
                    </motion.button>
                  </div>
                </div>

                {/* Winner celebration overlay */}
                <AnimatePresence>
                  {isWinner && celebrating && (
                    <motion.div
                      className="absolute inset-0 z-20 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-blue-500/20 to-transparent" />
                      
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-2xl opacity-60" />
                        <div className="relative bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 rounded-full p-6 shadow-2xl">
                          <FaHeart className="text-white text-4xl drop-shadow-lg" />
                        </div>
                      </motion.div>
                      
                      {/* Floating hearts */}
                      {[...Array(12)].map((_, idx) => (
                        <motion.div
                          key={idx}
                          className="absolute"
                          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                          animate={{ 
                            opacity: [0, 1, 0],
                            scale: [0.5, 1.2, 0.5],
                            x: (Math.random() - 0.5) * 250,
                            y: -120 - Math.random() * 150
                          }}
                          transition={{ duration: 1, delay: idx * 0.05 }}
                        >
                          <FaHeart className={`${idx % 2 === 0 ? 'text-cyan-400' : 'text-blue-400'} text-lg`} />
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

      {/* AI Prompt Modal */}
      <AIPromptModal
        isOpen={promptModalOpen}
        onClose={() => setPromptModalOpen(false)}
        mode="video"
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
}

