import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';
import HeadToHeadCompare from '../components/HeadToHeadCompare';
import ExploreRating from '../components/ExploreRating';
import { FaLock, FaGlobe } from 'react-icons/fa';

export default function RatePage() {
  const { data: session } = useSession();
  const [mode, setMode] = useState('gallery'); // 'gallery' or 'explore'
  
  // Track if each component has been mounted at least once
  const [galleryMounted, setGalleryMounted] = useState(true);
  const [exploreMounted, setExploreMounted] = useState(false);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    // Mark the component as mounted when first visited
    if (newMode === 'explore' && !exploreMounted) {
      setExploreMounted(true);
    }
    if (newMode === 'gallery' && !galleryMounted) {
      setGalleryMounted(true);
    }
  };

  const seoProps = {
    title: "Rate Models - Head-to-Head Comparison",
    description: "Vote for your favorite models in our head-to-head comparisons. Participate in ranking the hottest content with our interactive rating system.",
    keywords: "olivia ponton, jordyn jones, fapello, onlyfans, boutinella, livvy dunne, madison pettis, jasmine skye, millie bobby brown, hannah ann sluss, rate models, compare hot girls, vote for models, head to head comparison",
    ogType: "website"
  };

  return (
    <Layout {...seoProps} fullHeight>
      <div className="h-full flex flex-col overflow-hidden">
        {/* Mode Toggle - compact on mobile */}
        <div className="flex-shrink-0 flex justify-center py-2 px-4">
          <div className="inline-flex bg-white/5 rounded-xl p-0.5 border border-white/10">
            <button
              onClick={() => handleModeChange('gallery')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                mode === 'gallery'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <FaLock size={10} />
              <span>My Gallery</span>
            </button>
            <button
              onClick={() => handleModeChange('explore')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                mode === 'explore'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <FaGlobe size={10} />
              <span>Explore</span>
            </button>
          </div>
        </div>

        {/* Content - keep both mounted to preserve state, but only show active one */}
        <div className="flex-1 min-h-0 overflow-hidden relative">
          {/* Gallery (always rendered once visited) */}
          {galleryMounted && (
            <div 
              className={`absolute inset-0 ${mode === 'gallery' ? 'z-10 visible' : 'z-0 invisible pointer-events-none'}`}
            >
              <HeadToHeadCompare />
            </div>
          )}
          
          {/* Explore (rendered once visited) */}
          {exploreMounted && (
            <div 
              className={`absolute inset-0 ${mode === 'explore' ? 'z-10 visible' : 'z-0 invisible pointer-events-none'}`}
            >
              <ExploreRating />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
