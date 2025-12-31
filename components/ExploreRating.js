import React, { useState, useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaHeart, FaSearchPlus, FaImages } from 'react-icons/fa';

export default function ExploreRating() {
  const { data: session, status } = useSession();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [celebrating, setCelebrating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomedImage, setZoomedImage] = useState(null);
  const containerRef = useRef(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/explore/compare');
      const data = await res.json();
      
      if (data.success && data.images?.length >= 2) {
        setImages(data.images);
        setCurrentIndex(0);
        if (containerRef.current) {
          containerRef.current.scrollTo({ left: 0, behavior: 'instant' });
        }
      } else {
        setImages([]);
      }
    } catch (err) {
      console.error('Error fetching images:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchImages();
    }
  }, [session]);

  const handleScroll = (e) => {
    if (selectedId) return;
    const container = e.target;
    const scrollLeft = container.scrollLeft;
    const width = container.offsetWidth;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < images.length) {
      setCurrentIndex(newIndex);
    }
  };

  const handleVote = async (winnerId) => {
    if (zoomedImage) return;
    const loserId = images.find(img => img._id !== winnerId)?._id;
    if (!loserId) return;

    setSelectedId(winnerId);
    setCelebrating(true);

    try {
      await fetch('/api/explore/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerId, loserId })
      });

      setTimeout(() => {
        setCelebrating(false);
        setSelectedId(null);
        fetchImages();
      }, 1000);
    } catch (err) {
      console.error('Error voting:', err);
      setCelebrating(false);
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500" />
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
          <FaGoogle className="text-3xl text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Sign in to Explore</h2>
        <p className="text-white/60 mb-8">
          Rate photos from public galleries and compete on the community leaderboard.
        </p>
        <button
          onClick={() => signIn('google')}
          className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
        >
          <FaGoogle className="text-xl" />
          Sign in with Google
        </button>
      </div>
    );
  }

  // No images available
  if (!loading && images.length < 2) {
    return (
      <div className="text-center py-12">
        <FaImages className="text-4xl text-white/20 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Public Photos</h3>
        <p className="text-white/60 mb-6">There aren't enough public galleries to rate yet.</p>
        <p className="text-white/40 text-sm">Make some of your models public to get started!</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">

      {/* Swipeable Card Container */}
      <div 
        ref={containerRef}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((image, i) => {
          const isWinner = selectedId === image._id;
          const isLoser = selectedId && selectedId !== image._id;
          
          return (
            <div
              key={image._id}
              className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center px-3 py-2"
            >
              <motion.div
                className={`
                  relative rounded-2xl overflow-hidden cursor-pointer
                  w-full max-w-md shadow-2xl
                  transition-all duration-300
                  ${isWinner ? 'ring-4 ring-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.5)]' : ''}
                  ${isLoser ? 'opacity-20 scale-90 grayscale' : ''}
                  ${!selectedId ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}
                `}
                onClick={() => !selectedId && handleVote(image._id)}
                animate={{
                  scale: isLoser ? 0.9 : (celebrating && isWinner ? 1.02 : 1),
                }}
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                }}
              >
                {/* Cute border glow effect */}
                <div className="absolute -inset-[2px] rounded-3xl bg-gradient-to-br from-cyan-500/50 via-blue-500/50 to-purple-500/50 -z-10 blur-sm" />
                
                {/* Image container - taller aspect ratio for bigger images */}
                <div className="relative aspect-[9/14] bg-black/20">
                  <img
                    src={image.url}
                    alt=""
                    className={`
                      w-full h-full object-cover
                      transition-all duration-500
                      ${celebrating && isWinner ? 'scale-105 brightness-110' : ''}
                    `}
                  />
                  
                  {/* Zoom button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomedImage(image);
                    }}
                    className="absolute bottom-3 right-3 p-2.5 bg-black/50 backdrop-blur-sm rounded-full text-white/70 hover:text-white hover:bg-black/70 transition-all"
                  >
                    <FaSearchPlus size={14} />
                  </button>
                </div>

                {/* Winner celebration overlay */}
                <AnimatePresence>
                  {isWinner && celebrating && (
                    <motion.div
                      className="absolute inset-0 z-20 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-blue-500/20 to-transparent" />
                      
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-2xl opacity-60" />
                        <div className="relative bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 rounded-full p-6 shadow-2xl">
                          <FaHeart className="text-white text-4xl drop-shadow-lg" />
                        </div>
                      </motion.div>
                      
                      {/* Floating hearts */}
                      {[...Array(12)].map((_, idx) => (
                        <motion.div
                          key={idx}
                          className="absolute"
                          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                          animate={{ 
                            opacity: [0, 1, 0],
                            scale: [0.5, 1.2, 0.5],
                            x: (Math.random() - 0.5) * 250,
                            y: -120 - Math.random() * 150
                          }}
                          transition={{ duration: 1, delay: idx * 0.05 }}
                        >
                          <FaHeart className={`${idx % 2 === 0 ? 'text-cyan-400' : 'text-blue-400'} text-lg`} />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setZoomedImage(null)}
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={zoomedImage.url}
              alt=""
              className="max-w-full max-h-full object-contain rounded-2xl"
            />
            <p className="absolute bottom-8 text-white/50 text-sm">tap anywhere to close</p>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

