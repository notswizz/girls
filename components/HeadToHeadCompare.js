import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaHeart, FaStar, FaFire, FaCrown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeadToHeadCompare() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageId, setSelectedImageId] = useState(null);

  // Fetch images for comparison
  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedImageId(null);
      
      const response = await fetch('/api/images/compare?count=2');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch images');
      }
      
      const data = await response.json();
      
      if (!data.success || !data.images || data.images.length < 2) {
        throw new Error('Not enough images for comparison');
      }
      
      console.log('Images loaded successfully:', data.images.map(img => ({
        id: img._id,
        modelName: img.modelName,
        modelUsername: img.modelUsername
      })));
      
      setImages(data.images);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchImages();
  }, []);

  // Handle selection
  const handleSelect = async (winnerImageId) => {
    if (!winnerImageId || loading || images.length < 2) return;
    
    setLoading(true);
    setSelectedImageId(winnerImageId);
    
    // Find the winner and loser images
    const winnerImage = images.find(img => img._id === winnerImageId);
    const loserImage = images.find(img => img._id !== winnerImageId);
    
    if (!winnerImage || !loserImage) {
      setError('Could not identify winner and loser');
      setLoading(false);
      return;
    }
    
    try {
      // Submit the comparison result
      const response = await fetch('/api/scores/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          winnerId: winnerImage._id,
          loserId: loserImage._id,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit comparison');
      }
      
      // Fetch new images after a delay
      setTimeout(() => {
        fetchImages();
      }, 1500);
    } catch (err) {
      console.error('Error submitting comparison:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="card-neo border-cyber-pink border-2 p-6 max-w-lg w-full">
          <div className="flex items-center justify-center text-cyber-pink mb-4">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="font-bold text-xl mb-2 text-center">Error Detected</h3>
          <p className="text-white/70 text-center mb-6">{error}</p>
          <button 
            onClick={fetchImages}
            className="btn-cyber w-full flex items-center justify-center"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto pt-0">
      {loading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <div className="relative">
            <div className="w-16 h-16 border-t-4 border-b-4 border-cyber-pink rounded-full animate-spin"></div>
            <div className="w-16 h-16 border-r-4 border-l-4 border-cyber-blue rounded-full animate-spin-slow absolute top-0 left-0"></div>
            <div className="w-8 h-8 bg-gradient-to-br from-cyber-pink to-cyber-purple rounded-full absolute top-4 left-4 animate-pulse"></div>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* VS indicator in the middle */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 hidden md:block">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyber-purple to-cyber-pink flex items-center justify-center shadow-neon">
              <span className="text-white font-bold text-xl">VS</span>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            {images.map((image, index) => (
              <motion.div 
                key={image._id}
                className={`relative md:flex-1 h-[60vh] md:h-[75vh] min-h-[400px] rounded-xl overflow-hidden transition-all duration-300 group mb-8 md:mb-0 ${
                  selectedImageId === image._id
                    ? 'scale-105 z-10' 
                    : selectedImageId !== null 
                      ? 'opacity-60 blur-sm'
                      : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={selectedImageId === null ? { scale: 1.03 } : {}}
                onClick={() => !loading && handleSelect(image._id)}
              >
                {/* Image border effect */}
                <div className={`absolute inset-0 rounded-xl p-1 ${
                  selectedImageId === image._id
                    ? 'bg-gradient-to-r from-cyber-pink via-cyber-purple to-cyber-blue animate-shimmer' 
                    : selectedImageId !== null 
                      ? 'bg-cyber-dark/50'
                      : 'bg-gradient-to-r from-white/10 to-white/5'
                }`}>
                  <div className="absolute inset-0 rounded-lg overflow-hidden">
                    <img 
                      src={image.url} 
                      alt={image.name || `Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Glass panel with info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyber-dark/90 to-transparent p-4 md:p-6 backdrop-blur-sm">
                  <h3 className="font-bold text-xl text-white flex items-center gap-2">
                    {image.modelUsername || 'unknown'}
                    <FaStar className="text-cyber-yellow text-sm" />
                  </h3>
                  
                  {image.elo && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="text-sm px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">
                        ELO: {Math.round(image.elo)}
                      </div>
                      {image.elo > 1500 && (
                        <div className="text-sm px-3 py-1 bg-gradient-to-r from-cyber-pink/20 to-cyber-purple/20 rounded-full backdrop-blur-sm flex items-center gap-1">
                          <FaFire className="text-cyber-pink" />
                          Hot
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
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
                
                {/* Mobile-friendly selection buttons */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 md:px-0">
                  <button
                    className={`bg-white/10 hover:bg-white/20 backdrop-blur-lg p-3 md:p-4 rounded-lg text-white shadow-lg ${
                      index === 1 || loading ? 'opacity-0 pointer-events-none' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      !loading && handleSelect(image._id);
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
                      !loading && handleSelect(image._id);
                    }}
                    disabled={loading}
                  >
                    <FaChevronRight size={24} className="text-cyber-pink drop-shadow-md" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 