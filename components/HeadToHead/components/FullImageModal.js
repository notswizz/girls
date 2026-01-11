import React from 'react';
import { FaTimes, FaFire } from 'react-icons/fa';
import { motion } from 'framer-motion';

const FullImageModal = ({ image, onClose }) => {
  if (!image) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-2 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Close button */}
      <motion.button
        className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm border border-white/10 z-10"
        onClick={onClose}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FaTimes size={18} />
      </motion.button>
      
      {/* Image container */}
      <motion.div
        className="relative max-w-4xl w-full max-h-[90vh]"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
          <img
            src={image.url}
            alt="Full view"
            className="w-full max-h-[85vh] object-contain bg-black/50"
          />
          
          {/* Top gradient */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/60 to-transparent" />
          
          {/* Info bar */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-12 sm:right-16 flex justify-between items-start">
            <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
              <span className="text-white font-semibold text-sm">
                @{image.modelUsername || 'unknown'}
              </span>
            </div>
            
            <div className={`
              px-3 py-1.5 sm:px-4 sm:py-2 rounded-full backdrop-blur-md border flex items-center gap-2
              ${(image.elo || 1500) > 1600 
                ? 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 border-amber-500/50' 
                : 'bg-black/50 border-white/10'}
            `}>
              <span className={`font-bold text-sm ${(image.elo || 1500) > 1600 ? 'text-amber-400' : 'text-white'}`}>
                {Math.round(image.elo || 1500)}
              </span>
              {(image.elo || 1500) > 1600 && <FaFire className="text-amber-400" />}
            </div>
          </div>
        </div>
        
        {/* Tap hint */}
        <p className="text-center text-white/30 text-xs sm:text-sm mt-3 sm:mt-4">
          Tap anywhere to close
        </p>
      </motion.div>
    </motion.div>
  );
};

export default FullImageModal;
