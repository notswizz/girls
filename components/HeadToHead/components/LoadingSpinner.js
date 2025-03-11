import React from 'react';

/**
 * Component for displaying loading animations
 */
const LoadingSpinner = ({ overlay = false, celebrating = false }) => {
  // If overlay is true, this spinner will be displayed over content
  // If celebrating is true, it's a transition after celebrating
  if (overlay && celebrating) {
    return (
      <div className="absolute inset-0 flex justify-center items-center z-30 bg-black/30 backdrop-blur-sm">
        <div className="relative">
          <div className="w-16 h-16 border-t-4 border-b-4 border-cyber-pink rounded-full animate-spin"></div>
          <div className="w-16 h-16 border-r-4 border-l-4 border-cyber-blue rounded-full animate-spin-slow absolute top-0 left-0"></div>
          <div className="w-8 h-8 bg-gradient-to-br from-cyber-pink to-cyber-purple rounded-full absolute top-4 left-4 animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Regular full-screen loading spinner
  return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="relative">
        <div className="w-16 h-16 border-t-4 border-b-4 border-cyber-pink rounded-full animate-spin"></div>
        <div className="w-16 h-16 border-r-4 border-l-4 border-cyber-blue rounded-full animate-spin-slow absolute top-0 left-0"></div>
        <div className="w-8 h-8 bg-gradient-to-br from-cyber-pink to-cyber-purple rounded-full absolute top-4 left-4 animate-pulse"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
