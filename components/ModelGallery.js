import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const RandomImages = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRandomImages = async () => {
      try {
        setLoading(true);
        // Fetch directly from images API
        const response = await fetch('/api/images');
        const data = await response.json();
        
        if (data.success && data.images && data.images.length > 0) {
          // Get all active images
          const activeImages = data.images.filter(img => img.isActive && img.url);
          
          if (activeImages.length > 0) {
            // Shuffle and pick 4 random images
            const shuffled = activeImages.sort(() => 0.5 - Math.random());
            setImages(shuffled.slice(0, 4));
          } else {
            console.log('No active images found');
          }
        } else {
          console.log('Failed to fetch images or no images returned');
        }
      } catch (error) {
        console.error('Error fetching random images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomImages();
  }, []);

  if (loading) {
    return null; // Don't show anything during loading
  }
  
  if (images.length === 0) {
    return null; // Don't show anything if no images
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 justify-center mx-auto w-full max-w-3xl">
      {images.map((image, index) => (
        <motion.div
          key={image._id}
          initial={{ opacity: 0, scale: 0.8, rotate: -6 + index * 6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ 
            duration: 0.6, 
            delay: index * 0.13,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="relative group flex justify-center"
        >
          {/* Cyberpunk animated border and glass effect */}
          <div className="absolute inset-0 animated-border glass z-0 pointer-events-none"></div>
          {/* Image container with cyber styling */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-xl overflow-hidden border-2 border-white/10 z-10 shadow-lg card-glass-hover transition-transform duration-700 group-hover:scale-105 group-hover:rotate-1">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
            {/* Cyber corner accent */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyber-blue z-20"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyber-pink z-20"></div>
            {/* Animated scan line effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-blue/10 to-transparent opacity-0 group-hover:opacity-30 z-20 animate-scan"></div>
            <span className="absolute left-1/2 top-1/2 w-10 h-10 bg-cyber-yellow rounded-full opacity-0 group-hover:opacity-40 blur-lg pointer-events-none animate-pulse" style={{transform:'translate(-50%,-50%)'}}></span>
            <img
              src={image.url}
              alt="Random model"
              width={176}
              height={176}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:saturate-150"
              loading="lazy"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default RandomImages;
