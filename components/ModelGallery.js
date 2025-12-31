import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const RandomImages = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRandomImages = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/images');
        const data = await response.json();
        
        if (data.success && data.images && data.images.length > 0) {
          const activeImages = data.images.filter(img => img.isActive && img.url);
          
          if (activeImages.length > 0) {
            const shuffled = activeImages.sort(() => 0.5 - Math.random());
            setImages(shuffled.slice(0, 6));
          }
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
    return (
      <div className="flex justify-center gap-4">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="w-24 h-32 sm:w-32 sm:h-40 rounded-2xl bg-white/5 animate-pulse"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    );
  }
  
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Gradient fade on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#050215] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#050215] to-transparent z-10 pointer-events-none" />
      
      <div className="flex justify-center gap-3 sm:gap-4 overflow-hidden px-4">
        {images.map((image, index) => (
          <Link href="/rate" key={image._id}>
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.08,
                ease: [0.22, 1, 0.36, 1]
              }}
              whileHover={{ y: -8, scale: 1.05 }}
              className="relative group cursor-pointer"
            >
              {/* Glow effect on hover */}
              <div className="absolute -inset-2 bg-gradient-to-r from-pink-500/50 to-purple-500/50 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
              
              {/* Image container */}
              <div className="relative w-24 h-32 sm:w-32 sm:h-40 md:w-36 md:h-48 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-pink-500/50 transition-all duration-300 shadow-xl">
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />
                
                {/* Image */}
                <img
                  src={image.url}
                  alt="Model"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Username badge */}
                {image.modelUsername && (
                  <div className="absolute bottom-2 left-2 right-2 z-20">
                    <span className="text-[10px] sm:text-xs text-white/80 font-medium truncate block">
                      @{image.modelUsername}
                    </span>
                  </div>
                )}
                
                {/* ELO badge */}
                {image.elo && (
                  <div className="absolute top-2 right-2 z-20">
                    <span className="text-[10px] px-1.5 py-0.5 bg-black/50 backdrop-blur-sm rounded text-white/90 font-bold">
                      {Math.round(image.elo)}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RandomImages;
