import React from 'react';
import { FaFire, FaExpand, FaQuestion, FaChevronLeft, FaChevronRight, FaCrown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Component for displaying an individual image in the comparison
 */
const ImageCard = ({
  image,
  index,
  selectedImageId,
  celebratingId,
  loading,
  onSelectWinner,
  onToggleFullView,
  onInstagramReveal,
  totalImages
}) => {
  return (
    <motion.div
      key={image._id}
      className={`relative md:flex-1 h-[60vh] md:h-[75vh] min-h-[400px] rounded-xl overflow-hidden transition-all duration-300 group mb-8 md:mb-0 ${
        selectedImageId === image._id ? 'scale-105 z-10' : ''
      } ${celebratingId === image._id ? 'celebration-glow' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      whileHover={selectedImageId === null ? { scale: 1.03 } : {}}
      onClick={() => !loading && onSelectWinner(image._id)}
    >
      {/* Pulsing particles on celebrating image */}
      {celebratingId === image._id && (
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-cyber-pink to-cyber-blue animate-float-outward"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1000}ms`,
                opacity: 0.7
              }}
            />
          ))}
        </div>
      )}

      {/* Image border effect */}
      <div className={`absolute inset-0 rounded-xl p-1 ${
        selectedImageId === image._id
          ? 'bg-gradient-to-r from-cyber-pink via-cyber-purple to-cyber-blue animate-shimmer shadow-xl' 
          : 'bg-gradient-to-r from-white/10 to-white/5'
      }`}>
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <img
            src={image.url}
            alt={image.name || `Image ${index + 1}`}
            className={`w-full h-full object-cover transition-all duration-300 ${
              celebratingId === image._id ? 'scale-105 brightness-110' : ''
            }`}
          />
        </div>
      </div>
      
      {/* Username in top left (discreet) */}
      <div className="absolute top-3 left-3">
        <div className="px-3 py-1 bg-black/30 backdrop-blur-sm rounded-md text-sm font-medium">
          <span className="text-white/90">{image.modelUsername || 'unknown'}</span>
        </div>
      </div>
      
      {/* ELO badge in top right */}
      {image.elo && (
        <div className="absolute top-3 right-3">
          <div className={`
            w-auto min-w-[40px] h-[40px] rounded-full flex items-center justify-center p-1
            ${image.elo > 1500 
              ? 'bg-gradient-to-br from-cyber-pink/60 to-cyber-purple/60 shadow-neon' 
              : 'bg-gradient-to-br from-cyber-blue/50 to-cyber-dark/40'} 
            backdrop-blur-md border border-white/20 group-hover:shadow-neon transition-all duration-300`}
          >
            <div className="flex items-center justify-center">
              <span className="text-white font-bold">{Math.round(image.elo)}</span>
              {image.elo > 1500 && <FaFire className="text-cyber-yellow text-xs ml-1" />}
            </div>
          </div>
        </div>
      )}
      
      {/* "Who is she?" button - Only show if the model has an Instagram */}
      {image.modelData && image.modelData.instagram && (
        <div className="absolute bottom-3 left-3 z-20">
          <button
            className="px-3 py-2 bg-gradient-to-r from-cyber-pink/80 to-cyber-purple/80 backdrop-blur-sm rounded-lg text-sm font-medium text-white flex items-center hover:shadow-neon transition-all duration-300"
            onClick={(e) => {
              e.stopPropagation();
              onInstagramReveal(e, image);
            }}
          >
            <FaQuestion className="mr-2" />
            Who is she?
          </button>
        </div>
      )}
      
      {/* Winner effect */}
      <AnimatePresence>
        {selectedImageId === image._id && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <div className="bg-gradient-to-r from-cyber-pink to-cyber-purple text-white rounded-full p-5 shadow-neon-strong animate-pulse-fast">
              <FaCrown size={40} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Full view button (bottom right) */}
      <button
        className="absolute bottom-3 right-3 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all z-10"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFullView(e, image);
        }}
      >
        <FaExpand size={16} />
      </button>
      
      {/* Mobile-friendly selection buttons */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 md:px-0">
        <button
          className={`bg-white/10 hover:bg-white/20 backdrop-blur-lg p-3 md:p-4 rounded-lg text-white shadow-lg ${
            index === 1 || loading ? 'opacity-0 pointer-events-none' : ''
          }`}
          onClick={(e) => {
            e.stopPropagation();
            !loading && onSelectWinner(image._id);
          }}
          disabled={loading}
        >
          <FaChevronLeft size={24} className="text-cyber-pink drop-shadow-md" />
        </button>
        
        <button
          className={`bg-white/10 hover:bg-white/20 backdrop-blur-lg p-3 md:p-4 rounded-lg text-white shadow-lg ${
            index === 0 || loading ? 'opacity-0 pointer-events-none' : ''
          }`}
          onClick={(e) => {
            e.stopPropagation();
            !loading && onSelectWinner(image._id);
          }}
          disabled={loading}
        >
          <FaChevronRight size={24} className="text-cyber-pink drop-shadow-md" />
        </button>
      </div>
    </motion.div>
  );
};

export default ImageCard;
