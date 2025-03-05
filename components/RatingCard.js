import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaSkull, FaFire, FaHeart } from 'react-icons/fa';

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

  // Rating icons and colors
  const ratingOptions = [
    { value: 1, icon: <FaSkull />, label: 'Meh', color: 'from-gray-400 to-gray-600', bgColor: 'bg-white/10', hoverColor: 'bg-white/20' },
    { value: 2, icon: <FaStar />, label: 'Good', color: 'from-cyber-yellow to-amber-500', bgColor: 'bg-cyber-yellow/10', hoverColor: 'bg-cyber-yellow/20' },
    { value: 3, icon: <FaHeart />, label: 'Hot', color: 'from-cyber-pink to-cyber-purple', bgColor: 'bg-cyber-pink/10', hoverColor: 'bg-cyber-pink/20' },
  ];

  return (
    <motion.div 
      className="card-neo overflow-hidden w-full max-w-md mx-auto shadow-lg hover:shadow-neon transition-all duration-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Image container with fixed aspect ratio */}
      <div className="relative w-full pt-[125%] sm:pt-[100%]">
        {image?.url ? (
          <div className="absolute inset-0 p-1">
            <div className="relative w-full h-full rounded-t-lg overflow-hidden">
              <Image
                src={image.url}
                alt={image.name || 'Rate this image'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 500px"
                priority
              />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-cyber-dark/50 flex items-center justify-center">
            <p className="text-white/60">Image not available</p>
          </div>
        )}
        
        {/* Floating model name tag */}
        {image?.name && (
          <div className="absolute top-4 right-4 bg-cyber-dark/60 backdrop-blur-md px-3 py-1 rounded-full">
            <span className="text-white text-sm font-medium">
              {image.modelUsername || image.name}
            </span>
          </div>
        )}
      </div>
      
      {/* Rating UI */}
      <div className="p-6 bg-gradient-to-b from-cyber-dark/80 to-cyber-dark">
        <h3 className="text-center text-xl font-bold mb-1 text-white">Rate This Model</h3>
        <p className="text-center text-white/60 text-sm mb-6">How would you rate this image?</p>
        
        <div className="flex justify-center gap-4 my-6">
          <AnimatePresence>
            {ratingOptions.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => handleRatingClick(option.value)}
                className={`group relative flex flex-col items-center justify-center gap-1 w-16 h-20 rounded-lg transition-all duration-300 border ${
                  selectedRating === option.value 
                    ? `border-2 border-transparent bg-gradient-to-br ${option.color} shadow-lg scale-110` 
                    : `${option.bgColor} hover:${option.hoverColor} border-white/10`
                }`}
                disabled={isSubmitting}
                aria-label={`Rate ${option.value}`}
                whileHover={{ scale: selectedRating === option.value ? 1.1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className={`text-xl ${selectedRating === option.value ? 'text-white' : 'text-white/80'}`}>
                  {option.icon}
                </span>
                <span className={`text-xs font-medium ${selectedRating === option.value ? 'text-white' : 'text-white/60'}`}>
                  {option.label}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
        
        <div className="flex justify-between mt-8">
          <motion.button
            onClick={onSkip}
            className="px-4 py-2 text-white/70 hover:text-white border border-white/10 hover:border-white/30 rounded-md backdrop-blur-sm transition-colors focus:outline-none"
            disabled={isSubmitting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Skip
          </motion.button>
          
          <motion.button
            onClick={handleSubmit}
            disabled={!selectedRating || isSubmitting}
            className={`px-6 py-2 rounded-md font-medium transition-all duration-300 focus:outline-none flex items-center gap-2 ${
              selectedRating 
                ? 'btn-cyber' 
                : 'bg-white/5 text-white/40 cursor-not-allowed border border-white/10'
            }`}
            whileHover={selectedRating ? { scale: 1.05 } : {}}
            whileTap={selectedRating ? { scale: 0.95 } : {}}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            {selectedRating && <FaFire className="text-cyber-pink" />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
} 