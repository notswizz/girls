import { useState, useEffect } from 'react';
import Image from 'next/image';
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
            // Shuffle and pick 2 random images
            const shuffled = activeImages.sort(() => 0.5 - Math.random());
            setImages(shuffled.slice(0, 2));
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
    <div className="flex justify-center gap-6 md:gap-8">
      {images.map((image, index) => (
        <motion.div
          key={image._id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.6, 
            delay: index * 0.2,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="relative group"
        >
          {/* Animated border container */}
          <div className="absolute inset-0 rounded-xl border-2 border-cyber-pink/60 z-0 animate-pulse-slow"></div>
          
          {/* Glowing background effect */}
          <div className="absolute inset-0 bg-cyber-pink/20 blur-md rounded-xl z-0 group-hover:bg-cyber-blue/20 transition-all duration-700"></div>
          
          {/* Image container with cyber styling */}
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-xl overflow-hidden border-2 border-white/10 z-10">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
            
            {/* Cyber corner accent */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyber-blue z-20"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyber-pink z-20"></div>
            
            {/* Animated scan line effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-blue/10 to-transparent opacity-0 group-hover:opacity-30 z-20 animate-scan"></div>
            
            <Image
              src={image.url}
              alt="Random model"
              width={200}
              height={200}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default RandomImages;
