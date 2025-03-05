import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ComparisonSwiper({ images, onSubmitComparison }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);
  
  // Reset selection when images change
  useEffect(() => {
    setSelectedImageId(null);
  }, [images]);

  // Make sure we have exactly two images
  if (!images || images.length !== 2) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
        <p className="text-red-500">Error: Need exactly 2 images for comparison</p>
      </div>
    );
  }

  // Handle image selection
  const handleSelectImage = async (imageId) => {
    if (isSubmitting) return;
    
    setSelectedImageId(imageId);
    
    // Get the IDs of the winner and loser
    const winnerId = imageId;
    const loserId = images.find(img => img.id !== imageId).id;
    
    setIsSubmitting(true);
    await onSubmitComparison({ winnerId, loserId });
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-4 sm:p-6 mb-6">
        <h2 className="text-center text-xl sm:text-2xl font-semibold mb-6 text-gray-800">
          Which do you prefer?
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {images.map((image) => {
            const isSelected = selectedImageId === image.id;
            
            return (
              <div 
                key={image.id}
                className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 transform ${
                  isSelected ? 'ring-4 ring-pink-500 scale-102' : 'hover:ring-2 hover:ring-pink-300 hover:scale-101'
                } ${isSubmitting && !isSelected ? 'opacity-50' : ''}`}
                onClick={() => !isSubmitting && handleSelectImage(image.id)}
              >
                <div className="relative w-full pt-[125%]">
                  <Image
                    src={image.url}
                    alt={image.name || 'Image'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                    priority
                  />
                </div>
                
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300" />
                
                {/* Model name label */}
                <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-lg font-medium text-center">
                  {image.modelName || 'Unknown Model'}
                </div>
                
                {/* Selected overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-pink-500 bg-opacity-20 flex items-center justify-center">
                    <div className="bg-white rounded-full p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 text-center text-gray-500 text-sm">
          {isSubmitting ? (
            <p className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Recording your choice...
            </p>
          ) : (
            <p>Click on the image you prefer</p>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-4 shadow-md text-center">
        <h3 className="font-medium text-gray-800 mb-2">About this comparison</h3>
        <p className="text-sm text-gray-600">
          These images are from different models. Your choices help determine which models produce the most appealing results.
        </p>
      </div>
    </div>
  );
} 