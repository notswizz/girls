import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function RankingSwiper({ images, onSubmitRankings }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rankings, setRankings] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);

  // Reset rankings when images change
  useEffect(() => {
    setRankings([]);
    setCurrentIndex(0);
  }, [images]);

  // Handle touch/mouse start
  const handleDragStart = (e) => {
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    setDragStart(clientX);
  };

  // Handle touch/mouse move
  const handleDragMove = (e) => {
    if (dragStart === null) return;
    
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const offset = clientX - dragStart;
    setDragOffset(offset);
    
    // Determine swipe direction for visual feedback
    if (offset > 50) {
      setSwipeDirection('right');
    } else if (offset < -50) {
      setSwipeDirection('left');
    } else {
      setSwipeDirection(null);
    }
  };

  // Handle touch/mouse end
  const handleDragEnd = () => {
    if (dragStart === null) return;
    
    // If swiped far enough, go to next or previous image
    if (dragOffset > 100 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (dragOffset < -100 && currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    
    // Reset drag state
    setDragStart(null);
    setDragOffset(0);
    setSwipeDirection(null);
  };

  // Handle ranking selection
  const handleRankSelect = (rank) => {
    // Create a copy of current rankings
    const newRankings = [...rankings];
    
    // Find if this image is already ranked
    const existingIndex = newRankings.findIndex(r => r.imageId === images[currentIndex].id);
    
    // Find if this rank is already assigned to another image
    const rankExistsIndex = newRankings.findIndex(r => r.rank === rank);
    
    // If this rank is already assigned to another image, remove that ranking
    if (rankExistsIndex !== -1 && rankExistsIndex !== existingIndex) {
      newRankings.splice(rankExistsIndex, 1);
    }
    
    if (existingIndex !== -1) {
      // Update existing ranking
      newRankings[existingIndex].rank = rank;
    } else {
      // Add new ranking
      newRankings.push({
        imageId: images[currentIndex].id,
        rank: rank
      });
    }
    
    setRankings(newRankings);
    
    // Move to next image if not the last one
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Get the current rank for the displayed image
  const getCurrentRank = () => {
    const ranking = rankings.find(r => r.imageId === images[currentIndex].id);
    return ranking ? ranking.rank : null;
  };

  // Check if all images have been ranked with exactly one image per rank
  const isValidRanking = () => {
    if (rankings.length !== images.length) return false;
    
    // Check if we have exactly one image for each rank 1, 2, and 3
    const rankCounts = { 1: 0, 2: 0, 3: 0 };
    
    rankings.forEach(r => {
      if (r.rank >= 1 && r.rank <= 3) {
        rankCounts[r.rank]++;
      }
    });
    
    return rankCounts[1] === 1 && rankCounts[2] === 1 && rankCounts[3] === 1;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!isValidRanking()) return;
    
    setIsSubmitting(true);
    await onSubmitRankings(rankings);
    setIsSubmitting(false);
  };

  // Calculate transform style for swipe effect
  const getTransformStyle = () => {
    if (dragOffset) {
      return { transform: `translateX(${dragOffset}px)` };
    }
    return {};
  };

  // Get background color based on swipe direction
  const getSwipeBackground = () => {
    if (swipeDirection === 'right') {
      return 'bg-gradient-to-r from-green-100 to-transparent';
    } else if (swipeDirection === 'left') {
      return 'bg-gradient-to-l from-green-100 to-transparent';
    }
    return '';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md mx-auto border border-gray-100 transition-all duration-300 hover:shadow-2xl">
      {/* Image container with swipe functionality */}
      <div 
        className={`relative w-full pt-[125%] sm:pt-[100%] ${getSwipeBackground()}`}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        {images.map((image, index) => (
          <div 
            key={image.id}
            className={`absolute inset-0 transition-all duration-500 ${
              index === currentIndex ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-95'
            }`}
            style={index === currentIndex ? getTransformStyle() : {}}
          >
            <Image
              src={image.url}
              alt={`Image ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 500px"
              priority={index === currentIndex}
            />
            
            {/* Image counter */}
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        ))}
        
        {/* Navigation arrows */}
        <button 
          onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-full p-3 z-20 shadow-lg transition-all duration-200 ${
            currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-80 hover:opacity-100 hover:scale-105'
          }`}
          disabled={currentIndex === 0}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          onClick={() => currentIndex < images.length - 1 && setCurrentIndex(currentIndex + 1)}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-full p-3 z-20 shadow-lg transition-all duration-200 ${
            currentIndex === images.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-80 hover:opacity-100 hover:scale-105'
          }`}
          disabled={currentIndex === images.length - 1}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Ranking UI */}
      <div className="p-5 sm:p-6 bg-gradient-to-b from-white to-gray-50">
        <div className="flex justify-center gap-4 my-4">
          {[1, 2, 3].map((rank) => {
            const currentRank = getCurrentRank();
            const isSelected = currentRank === rank;
            
            return (
              <button
                key={rank}
                onClick={() => handleRankSelect(rank)}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300
                  ${isSelected 
                    ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white scale-110 transform shadow-lg ring-2 ring-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-pink-100 hover:scale-105'}`}
                aria-label={`Rank ${rank}`}
              >
                {rank}{rank === 1 ? 'st' : rank === 2 ? 'nd' : 'rd'}
              </button>
            );
          })}
        </div>
        
        {/* Progress indicator */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-pink-500 to-purple-600 h-1.5 rounded-full transition-all duration-500" 
            style={{ width: `${(rankings.length / images.length) * 100}%` }}
          ></div>
        </div>
        
        <div className="flex justify-center mt-4">
          <button
            onClick={handleSubmit}
            disabled={!isValidRanking() || isSubmitting}
            className={`px-8 py-3 rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 shadow-md
              ${isValidRanking() && !isSubmitting
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg hover:scale-105 transform' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing
              </span>
            ) : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
} 