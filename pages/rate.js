import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';
import HeadToHeadCompare from '../components/HeadToHeadCompare';
import ExploreRating from '../components/ExploreRating';
import { FaLock, FaGlobe } from 'react-icons/fa';

export default function RatePage() {
  const { data: session } = useSession();
  const [mode, setMode] = useState('gallery'); // 'gallery' or 'explore'

  const seoProps = {
    title: "Rate Models - Head-to-Head Comparison",
    description: "Vote for your favorite models in our head-to-head comparisons. Participate in ranking the hottest content with our interactive rating system.",
    keywords: "olivia ponton, jordyn jones, fapello, onlyfans, boutinella, livvy dunne, madison pettis, jasmine skye, millie bobby brown, hannah ann sluss, rate models, compare hot girls, vote for models, head to head comparison",
    ogType: "website"
  };

  return (
    <Layout {...seoProps} fullHeight>
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-gradient-to-r from-pink-600/20 to-purple-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/3 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-600/10 to-blue-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
      </div>
      
      <div className="h-full flex flex-col overflow-hidden">
        {/* Mode Toggle */}
        <div className="flex-shrink-0 flex justify-center py-3">
          <div className="inline-flex bg-white/5 rounded-2xl p-1 border border-white/10">
            <button
              onClick={() => setMode('gallery')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                mode === 'gallery'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <FaLock size={12} />
              My Gallery
            </button>
            <button
              onClick={() => setMode('explore')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                mode === 'explore'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <FaGlobe size={12} />
              Explore
            </button>
          </div>
        </div>

        {/* Content based on mode */}
        <div className="flex-1 overflow-hidden">
          {mode === 'gallery' ? (
            <HeadToHeadCompare />
          ) : (
            <ExploreRating />
          )}
        </div>
      </div>
    </Layout>
  );
}
