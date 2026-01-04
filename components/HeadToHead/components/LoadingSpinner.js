import React from 'react';
import { motion } from 'framer-motion';
import { FaTrophy } from 'react-icons/fa';

const LoadingSpinner = ({ overlay = false, celebrating = false }) => {
  if (overlay && celebrating) {
    return (
      <motion.div 
        className="absolute inset-0 flex justify-center items-center z-30 bg-black/60 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 rounded-full border-3 border-white/10 border-t-pink-500 mx-auto"
          />
        </div>
      </motion.div>
    );
  }

  // Beautiful skeleton loading state
  return (
    <div className="h-full flex flex-col items-center justify-center px-4">
      {/* Central loading indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {/* Animated trophy */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative mb-6"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 to-purple-500/30 rounded-full blur-2xl" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
            <FaTrophy className="text-3xl text-pink-400/80" />
          </div>
        </motion.div>

        {/* Loading text */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <p className="text-white/50 text-sm font-medium">Finding match...</p>
        </motion.div>

        {/* Dots animation */}
        <div className="flex justify-center gap-1.5 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-pink-500/60"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 0.8, 
                repeat: Infinity,
                delay: i * 0.15
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Skeleton cards in background (subtle) */}
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-center gap-4 opacity-10 pointer-events-none">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="w-32 h-44 sm:w-40 sm:h-56 rounded-2xl bg-white/20"
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner;
