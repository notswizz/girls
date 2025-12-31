import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCrown, FaHeart, FaChevronLeft } from 'react-icons/fa';

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
    if (selectedImageId || loading) return;
    onSelectWinner(imageId);
  };

  if (!images || images.length < 2) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header - overlaid on image */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <h1 className="text-lg font-bold">Who wins?</h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full">
            <FaHeart className="text-pink-400 text-sm" />
            <span className="text-white/60 text-sm">Tap to pick</span>
          </div>
        </div>
      </div>

      {/* Fullscreen Swipeable Image Container */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((image, index) => {
          const isWinner = selectedImageId === image._id;
          const isCelebrating = celebratingId === image._id;
          const isLoser = selectedImageId && selectedImageId !== image._id;

          return (
            <div
              key={image._id}
              className="w-full h-full flex-shrink-0 snap-center relative flex items-center justify-center cursor-pointer"
              onClick={() => handleTapToVote(image._id)}
            >
              <img
                src={image.url}
                alt=""
                className={`w-full h-full object-contain transition-all duration-500 ${
                  isLoser ? 'opacity-30 scale-90 grayscale' : ''
                } ${isCelebrating ? 'scale-105 brightness-110' : ''}`}
              />
              
              {/* Tap hint overlay - shown when not celebrating */}
              {!selectedImageId && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="absolute bottom-32 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full">
                    <span className="text-white/70 text-sm font-medium">Tap to pick</span>
                  </div>
                </div>
              )}

              {/* Winner celebration overlay */}
              <AnimatePresence>
                {isCelebrating && (
                  <motion.div
                    className="absolute inset-0 z-20 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-emerald-500/30" />
                    
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full blur-2xl opacity-60" />
                      <div className="relative bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-full p-6 shadow-2xl">
                        <FaCrown className="text-white text-5xl drop-shadow-lg" />
                      </div>
                    </motion.div>
                    
                    {/* Floating hearts */}
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                        animate={{ 
                          opacity: [0, 1, 0],
                          scale: [0.5, 1.2, 0.5],
                          x: (Math.random() - 0.5) * 200,
                          y: -100 - Math.random() * 100
                        }}
                        transition={{ duration: 0.8, delay: i * 0.06 }}
                      >
                        <FaHeart className="text-pink-500 text-xl" />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 pb-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
        {/* Image indicator dots */}
        <div className="flex justify-center gap-2 mb-3">
          {images.map((img, i) => (
            <div
              key={img._id}
              className={`h-2 rounded-full transition-all ${
                i === currentIndex 
                  ? 'bg-pink-500 w-8' 
                  : 'bg-white/30 w-2'
              }`}
            />
          ))}
        </div>

        {/* Swipe hint */}
        <p className="text-center text-white/50 text-xs">
          ← Swipe to compare · Tap to pick →
        </p>

        {/* Skip option */}
        <button
          onClick={onSkip}
          disabled={loading || selectedImageId}
          className="block mx-auto mt-3 text-white/30 hover:text-white/60 text-sm transition-colors pointer-events-auto disabled:opacity-30"
        >
          Skip →
        </button>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default MobileSwipeRating;
