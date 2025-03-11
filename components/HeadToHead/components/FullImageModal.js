import React from 'react';
import { FaTimes, FaFire } from 'react-icons/fa';
import { motion } from 'framer-motion';

/**
 * Full image modal component
 */
const FullImageModal = ({ image, onClose }) => {
  if (!image) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
        onClick={onClose}
      >
        <FaTimes size={24} />
      </button>
      
      <motion.div
        className="w-full max-w-4xl max-h-[90vh] relative"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
      >
        <img
          src={image.url}
          alt={image.modelUsername || 'Full view'}
          className="w-full h-full object-contain"
        />
        
        <div className="absolute top-3 left-0 right-0 flex justify-between px-4">
          <div className="px-4 py-2 bg-black/40 backdrop-blur-sm rounded-lg">
            <span className="text-white font-medium">
              {image.modelUsername || 'Unknown'}
            </span>
          </div>
          
          {image.elo && (
            <div className="px-4 py-2 bg-gradient-to-r from-cyber-pink/40 to-cyber-purple/40 backdrop-blur-sm rounded-lg flex items-center">
              <span className="text-white font-bold mr-1">{Math.round(image.elo)}</span>
              {image.elo > 1500 && <FaFire className="text-cyber-yellow" />}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FullImageModal;
