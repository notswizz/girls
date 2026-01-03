import React, { useState, useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaHeart, FaSearchPlus, FaImages, FaImage, FaVideo, FaMagic } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { useAIGeneration } from '../context/AIGenerationContext';
import { AIGenerationIndicator } from './GlobalAIModal';
import AIPromptModal from './AIPromptModal';

export default function ExploreRating() {
  const { data: session, status } = useSession();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [celebrating, setCelebrating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomedImage, setZoomedImage] = useState(null);
  const containerRef = useRef(null);
  
  // AI Generation - using global context
  const { startGeneration, isGenerating } = useAIGeneration();
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [promptMode, setPromptMode] = useState('image');
  const [promptReferenceImage, setPromptReferenceImage] = useState(null);
  
  const handleOpenAiModal = (e, image, mode) => {
    e.stopPropagation();
    setPromptReferenceImage(image.url);
    setPromptMode(mode);
    setPromptModalOpen(true);
  };
  
  const handlePromptSubmit = (prompt) => {
    startGeneration(promptReferenceImage, prompt, promptMode);
    setPromptModalOpen(false);
  };

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/explore/compare');
      const data = await res.json();
      
      if (data.success && data.images?.length >= 2) {
        setImages(data.images);
        setCurrentIndex(0);
        if (containerRef.current) {
          containerRef.current.scrollTo({ left: 0, behavior: 'instant' });
        }
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

    try {
      await fetch('/api/explore/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerId, loserId })
      });

      setTimeout(() => {
        setCelebrating(false);
        setSelectedId(null);
        fetchImages();
      }, 1000);
    } catch (err) {
      console.error('Error voting:', err);
      setCelebrating(false);
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
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide md:overflow-x-visible md:justify-center md:items-center md:gap-4 lg:gap-6 py-2"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((image, i) => {
          const isWinner = selectedId === image._id;
          const isLoser = selectedId && selectedId !== image._id;
          
          return (
            <div
              key={image._id}
              className="w-[88vw] h-full flex-shrink-0 snap-center flex flex-col items-center justify-center px-2 md:w-auto md:flex-shrink md:max-w-[45%] lg:max-w-[380px]"
            >
              {/* Image Card */}
              <motion.div
                className={`
                  relative rounded-2xl overflow-hidden cursor-pointer
                  w-full h-full max-h-full shadow-2xl
                  transition-all duration-300
                  ${isWinner ? 'shadow-[0_0_40px_rgba(34,211,238,0.5)]' : ''}
                  ${isLoser ? 'opacity-20 scale-95 grayscale' : ''}
                  ${!selectedId ? 'active:scale-[0.98]' : ''}
                `}
                onClick={() => !selectedId && handleVote(image._id)}
                animate={{
                  scale: isLoser ? 0.95 : (celebrating && isWinner ? 1.01 : 1),
                }}
              >
                {/* Gradient border */}
                <div 
                  className={`absolute -inset-[1.5px] rounded-2xl ${
                    isWinner 
                      ? 'bg-gradient-to-r from-cyan-500 via-blue-400 to-cyan-500' 
                      : 'bg-gradient-to-br from-cyan-500/30 via-blue-500/20 to-purple-500/30'
                  }`}
                  style={{
                    backgroundSize: isWinner ? '200% 200%' : '100% 100%',
                    animation: isWinner ? 'gradient-shift 2s ease infinite' : 'none',
                  }}
                />
                
                {/* Inner card */}
                <div className="relative rounded-[14px] overflow-hidden bg-gray-950 m-[1.5px] h-full flex flex-col">
                  {/* Image container */}
                  <div className="flex-1 relative bg-black flex items-center justify-center min-h-0">
                    <img
                      src={image.url}
                      alt=""
                      className={`
                        max-w-full max-h-full w-auto h-auto object-contain
                        transition-all duration-500
                        ${celebrating && isWinner ? 'scale-[1.02] brightness-110' : ''}
                      `}
                    />
                    
                    {/* Subtle vignette */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/30 via-transparent to-black/10" />
                  </div>
                  
                  {/* AI Controls bar at bottom */}
                  <div className="flex-shrink-0 flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-t from-black via-black/90 to-black/70 border-t border-white/10">
                    {/* AI Photo Button */}
                    <motion.button
                      onClick={(e) => handleOpenAiModal(e, image, 'image')}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/30 transition-all shadow-lg shadow-cyan-500/10"
                      whileTap={{ scale: 0.95 }}
                    >
                      <HiSparkles className="text-cyan-400" size={14} />
                      <span className="text-xs font-semibold text-cyan-300">AI Photo</span>
                    </motion.button>
                    
                    {/* AI Video Button */}
                    <motion.button
                      onClick={(e) => handleOpenAiModal(e, image, 'video')}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/30 transition-all shadow-lg shadow-purple-500/10"
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaVideo className="text-purple-400" size={12} />
                      <span className="text-xs font-semibold text-purple-300">AI Video</span>
                    </motion.button>
                    
                    {/* Zoom Button */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomedImage(image);
                      }}
                      className="p-2.5 rounded-full bg-white/10 border border-white/20 text-white/70 hover:text-white hover:border-white/40 hover:bg-white/20 transition-all"
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaSearchPlus size={12} />
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
}

