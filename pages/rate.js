import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';
import HeadToHeadCompare from '../components/HeadToHeadCompare';
import ExploreRating from '../components/ExploreRating';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLock, FaGlobe } from 'react-icons/fa';

export default function RatePage() {
  const { data: session } = useSession();
  const [mode, setMode] = useState('explore'); // 'gallery' or 'explore' - explore is default
  
  // Track if each component has been mounted at least once
  const [galleryMounted, setGalleryMounted] = useState(false);
  const [exploreMounted, setExploreMounted] = useState(true);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === 'explore' && !exploreMounted) {
      setExploreMounted(true);
    }
    if (newMode === 'gallery' && !galleryMounted) {
      setGalleryMounted(true);
    }
  };

  const seoProps = {
    title: "Rate - Head-to-Head Battles",
    description: "Vote for your favorite in head-to-head comparisons. Discover your top-rated content with ELO ranking.",
    keywords: "photo rating, head to head comparison, image battle, ELO ranking, private gallery",
    ogType: "website"
  };

  return (
    <Layout {...seoProps} fullHeight>
      <div className="h-full flex flex-col overflow-hidden relative">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-600/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]" />
        </div>

        {/* Header with Mode Toggle */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex-shrink-0 px-4 py-3"
        >
          <div className="max-w-lg mx-auto">
            {/* Toggle Container */}
            <div className="relative flex bg-white/[0.03] backdrop-blur-sm rounded-2xl p-1 border border-white/[0.08]">
              {/* Animated background pill */}
              <motion.div
                className="absolute top-1 bottom-1 rounded-xl"
                initial={false}
                animate={{
                  left: mode === 'gallery' ? '4px' : '50%',
                  width: 'calc(50% - 4px)',
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                style={{
                  background: mode === 'gallery' 
                    ? 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)'
                    : 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                }}
              />
              
              {/* Gallery Button */}
              <button
                onClick={() => handleModeChange('gallery')}
                className="relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-colors"
              >
                <FaLock 
                  size={12} 
                  className={mode === 'gallery' ? 'text-white' : 'text-white/40'}
                />
                <span className={`text-sm font-semibold ${mode === 'gallery' ? 'text-white' : 'text-white/40'}`}>
                  My Gallery
                </span>
              </button>
              
              {/* Explore Button */}
              <button
                onClick={() => handleModeChange('explore')}
                className="relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-colors"
              >
                <FaGlobe 
                  size={12} 
                  className={mode === 'explore' ? 'text-white' : 'text-white/40'}
                />
                <span className={`text-sm font-semibold ${mode === 'explore' ? 'text-white' : 'text-white/40'}`}>
                  Explore
                </span>
              </button>
            </div>

            {/* Mode subtitle */}
            <motion.p
              key={mode}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-[11px] text-white/30 mt-2"
            >
              {mode === 'gallery' 
                ? 'Rate photos from your private collection'
                : 'Discover and rate public galleries'
              }
            </motion.p>
          </div>
        </motion.div>

        {/* Decorative VS indicator */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none hidden md:block">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-2xl w-24 h-24" />
            <div className="relative w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center">
              <span className="text-2xl font-black text-white/20">VS</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-hidden relative">
          {/* Gallery */}
          {galleryMounted && (
            <div 
              className={`absolute inset-0 transition-all duration-300 ${
                mode === 'gallery' 
                  ? 'z-10 opacity-100 scale-100' 
                  : 'z-0 opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <HeadToHeadCompare />
            </div>
          )}
          
          {/* Explore */}
          {exploreMounted && (
            <div 
              className={`absolute inset-0 transition-all duration-300 ${
                mode === 'explore' 
                  ? 'z-10 opacity-100 scale-100' 
                  : 'z-0 opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <ExploreRating />
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
