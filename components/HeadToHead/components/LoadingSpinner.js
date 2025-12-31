import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ overlay = false, celebrating = false }) => {
  if (overlay && celebrating) {
    return (
      <motion.div 
        className="absolute inset-0 flex justify-center items-center z-30 bg-black/40 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-white/20 border-t-pink-500 mx-auto mb-3"
          />
          <p className="text-white/60 text-xs sm:text-sm">Loading...</p>
        </div>
      </motion.div>
    );
  }

  // Skeleton loading state
  return (
    <div className="w-full">
      {/* Header skeleton */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="h-6 sm:h-8 w-32 sm:w-40 bg-white/10 rounded-full mx-auto mb-2 animate-pulse" />
        <div className="h-3 sm:h-4 w-20 sm:w-24 bg-white/5 rounded-full mx-auto animate-pulse" />
      </div>
      
      {/* Cards skeleton - stacked on mobile */}
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:gap-6">
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/10 to-white/5 overflow-hidden relative"
            style={{ paddingBottom: '133%' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="absolute inset-0">
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" 
                   style={{ backgroundSize: '200% 100%' }} />
              
              {/* Top badges skeleton */}
              <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex justify-between">
                <div className="h-6 sm:h-7 w-20 sm:w-24 bg-white/10 rounded-full animate-pulse" />
                <div className="h-6 sm:h-7 w-12 sm:w-14 bg-white/10 rounded-full animate-pulse" />
              </div>
              
              {/* Bottom skeleton */}
              <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3">
                <div className="h-8 sm:h-9 w-8 sm:w-9 bg-white/10 rounded-full animate-pulse" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* VS badge skeleton */}
      <div className="flex justify-center py-1 lg:hidden">
        <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse" />
      </div>
    </div>
  );
};

export default LoadingSpinner;
