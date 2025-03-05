import React, { useState, useEffect, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import { FaChevronLeft, FaChevronRight, FaHeart } from 'react-icons/fa';
import Confetti from 'react-confetti';

export default function HeadToHeadCompare() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600,
  });

  // Fetch images for comparison
  const fetchImages = useCallback(async () => {
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
      
      setImages(data.images);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchImages();
    
    // Update window size on resize
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fetchImages]);

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
      
      // Show confetti effect
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
      
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

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => !loading && images.length >= 2 && handleSelect(images[1]._id),
    onSwipedRight: () => !loading && images.length >= 2 && handleSelect(images[0]._id),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  // Handle key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (loading || images.length < 2) return;
      
      if (e.key === 'ArrowLeft') {
        handleSelect(images[0]._id);
      } else if (e.key === 'ArrowRight') {
        handleSelect(images[1]._id);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, images]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 max-w-lg w-full">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button 
          onClick={fetchImages}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto pt-0" {...swipeHandlers}>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
        />
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4">
          {images.map((image, index) => (
            <div 
              key={image._id}
              className={`relative flex-1 h-[75vh] min-h-[300px] border-4 rounded-lg overflow-hidden transition-all duration-300 ${
                selectedImageId === image._id
                  ? 'border-green-500 scale-105 z-10' 
                  : selectedImageId !== null 
                    ? 'border-red-300 opacity-80'
                    : 'border-gray-300 hover:border-blue-400'
              }`}
              onClick={() => !loading && handleSelect(image._id)}
            >
              <img 
                src={image.url} 
                alt={image.name || `Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                <h3 className="font-semibold text-lg">
                  {image.modelName || 'Unknown Model'}
                </h3>
                
                {image.elo && (
                  <div className="text-sm opacity-80">
                    ELO: {Math.round(image.elo)}
                  </div>
                )}
              </div>
              
              {selectedImageId === image._id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-green-500 text-white rounded-full p-3 animate-pulse">
                    <FaHeart size={30} />
                  </div>
                </div>
              )}
              
              <button
                className={`absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-r-lg shadow-lg text-pink-500 ${
                  index === 1 ? 'hidden' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  !loading && handleSelect(image._id);
                }}
                disabled={loading}
              >
                <FaChevronLeft size={20} />
              </button>
              
              <button
                className={`absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-l-lg shadow-lg text-pink-500 ${
                  index === 0 ? 'hidden' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  !loading && handleSelect(image._id);
                }}
                disabled={loading}
              >
                <FaChevronRight size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 