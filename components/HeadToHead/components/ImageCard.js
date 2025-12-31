import React from 'react';
import { FaExpand, FaCrown, FaHeart } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ImageCard = ({
  image,
  index,
  selectedImageId,
  celebratingId,
  loading,
  onSelectWinner,
  onToggleFullView,
  totalImages,
  position
}) => {
  const isSelected = selectedImageId === image._id;
  const isCelebrating = celebratingId === image._id;
  const isLoser = selectedImageId && selectedImageId !== image._id;
  
  return (
    <motion.div
      className="flex-1 relative"
      initial={{ opacity: 0, x: position === 'left' ? -30 : 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <motion.div
        className={`
          relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer
          transition-all duration-500 ease-out
          ${isSelected ? 'ring-4 ring-green-400 shadow-[0_0_40px_rgba(74,222,128,0.4)]' : ''}
          ${isLoser ? 'opacity-30 scale-95 grayscale' : ''}
          ${!selectedImageId ? 'active:scale-[0.98]' : ''}
        `}
        whileHover={!selectedImageId && !loading ? { scale: 1.02 } : {}}
        onClick={() => !loading && !selectedImageId && onSelectWinner(image._id)}
      >
        {/* Image container with aspect ratio for full image display */}
        <div className="relative w-full" style={{ paddingBottom: '133%' }}>
          <img
            src={image.url}
            alt={`Contestant ${index + 1}`}
            className={`
              absolute inset-0 w-full h-full object-cover transition-all duration-500
              ${isCelebrating ? 'scale-105 brightness-110' : ''}
            `}
          />
          
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />
        </div>
        
        {/* Celebration overlay */}
        <AnimatePresence>
          {isCelebrating && (
            <motion.div
              className="absolute inset-0 z-20 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20" />
              
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.6 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full blur-2xl opacity-60" />
                <div className="relative bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-full p-4 sm:p-6 shadow-2xl">
                  <FaCrown className="text-white text-3xl sm:text-5xl drop-shadow-lg" />
                </div>
              </motion.div>
              
              {/* Floating hearts */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.5],
                    x: (Math.random() - 0.5) * 150,
                    y: -80 - Math.random() * 80
                  }}
                  transition={{ duration: 0.8, delay: i * 0.08 }}
                >
                  <FaHeart className="text-pink-500 text-lg sm:text-2xl" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        
        {/* Bottom expand button */}
        <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 z-20">
          <motion.button
            className="p-2 sm:p-2.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white/80 hover:bg-black/60 hover:text-white transition-all"
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFullView(e, image);
            }}
          >
            <FaExpand size={12} className="sm:w-3.5 sm:h-3.5" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ImageCard;
