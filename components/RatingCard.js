import { useState } from 'react';
import Image from 'next/image';

export default function RatingCard({ image, onRate, onSkip }) {
  const [selectedRating, setSelectedRating] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingClick = (rating) => {
    setSelectedRating(rating);
  };

  const handleSubmit = async () => {
    if (!selectedRating) return;
    
    setIsSubmitting(true);
    await onRate(image.id, selectedRating);
    setSelectedRating(null);
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-md mx-auto">
      {/* Image container with fixed aspect ratio */}
      <div className="relative w-full pt-[125%] sm:pt-[100%]">
        {image?.url ? (
          <Image
            src={image.url}
            alt={image.name || 'Rate this image'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 500px"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">Image not available</p>
          </div>
        )}
      </div>
      
      {/* Rating UI */}
      <div className="p-4 sm:p-6">
        {image?.name && (
          <h3 className="text-lg font-semibold text-center mb-2">
            {image.name}
            {image.modelName && <span className="text-sm text-gray-500 ml-2">({image.modelName})</span>}
          </h3>
        )}
        
        <div className="flex justify-center gap-4 my-6">
          {[1, 2, 3].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingClick(rating)}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold transition-all
                ${selectedRating === rating 
                  ? 'bg-pink-500 text-white scale-110 transform' 
                  : 'bg-gray-100 text-gray-700 hover:bg-pink-100'}`}
              disabled={isSubmitting}
              aria-label={`Rate ${rating}`}
            >
              {rating}
            </button>
          ))}
        </div>
        
        <div className="flex justify-between mt-6">
          <button
            onClick={onSkip}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 rounded-md"
            disabled={isSubmitting}
          >
            Skip
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!selectedRating || isSubmitting}
            className={`px-6 py-2 rounded-full font-medium transition-all focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50
              ${selectedRating 
                ? 'bg-pink-500 text-white hover:bg-pink-600' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
} 