import React, { useState, useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaFire, FaTrophy, FaImages, FaArrowRight, FaHeart, FaCrown, FaUsers, FaChevronLeft } from 'react-icons/fa';
import Link from 'next/link';

// Gallery Card Component
function GalleryCard({ gallery, onRate }) {
  const hasImages = gallery.previewImages?.length > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-pink-500/30 transition-all group"
    >
      {/* Preview Images Grid */}
      <div className="aspect-square relative">
        {hasImages ? (
          <div className="grid grid-cols-2 gap-0.5 h-full">
            {gallery.previewImages.slice(0, 4).map((img, i) => (
              <div key={i} className="relative overflow-hidden bg-white/5">
                <img 
                  src={img.url} 
                  alt="" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
            {gallery.previewImages.length < 4 && 
              [...Array(4 - gallery.previewImages.length)].map((_, i) => (
                <div key={`empty-${i}`} className="bg-white/5" />
              ))
            }
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-white/5">
            <FaImages className="text-4xl text-white/20" />
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Stats badge */}
        {gallery.communityVotes > 0 && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full flex items-center gap-1">
            <FaFire className="text-pink-400 text-xs" />
            <span className="text-white text-xs font-medium">{gallery.communityVotes}</span>
          </div>
        )}
        
        {/* Gallery info - just stats, no username */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
            <span>{gallery.totalImages} photos</span>
            <span className="text-white/30">·</span>
            <span>{gallery.modelCount} models</span>
          </div>
        </div>
      </div>
      
      {/* Action button */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={() => onRate(gallery)}
          disabled={gallery.isOwnGallery}
          className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            gallery.isOwnGallery
              ? 'bg-white/5 text-white/30 cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg hover:shadow-pink-500/25'
          }`}
        >
          {gallery.isOwnGallery ? (
            'Your Gallery'
          ) : (
            <>
              <FaFire />
              Rate This Gallery
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// Community Rating Mode - Fullscreen swipe experience
function CommunityRatingMode({ galleryOwnerId, onBack, onComplete }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [celebrating, setCelebrating] = useState(false);
  const [votesThisSession, setVotesThisSession] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const url = galleryOwnerId 
        ? `/api/explore/compare?galleryId=${galleryOwnerId}`
        : '/api/explore/compare';
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success && data.images?.length >= 2) {
        setImages(data.images);
        setCurrentIndex(0);
        // Reset scroll position
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
    fetchImages();
  }, [galleryOwnerId]);

  // Handle scroll snap to detect current image
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

      setVotesThisSession(prev => prev + 1);

      setTimeout(() => {
        setCelebrating(false);
        setSelectedId(null);
        fetchImages();
      }, 800);
    } catch (err) {
      console.error('Error voting:', err);
      setCelebrating(false);
    }
  };

  if (loading && images.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500" />
      </div>
    );
  }

  if (images.length < 2) {
    return (
      <div className="text-center py-12">
        <FaImages className="text-4xl text-white/20 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No More Photos</h3>
        <p className="text-white/60 mb-6">Check back later for more galleries to rate!</p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
        >
          Back to Galleries
        </button>
      </div>
    );
  }

  const currentImage = images[currentIndex];
  const isWinner = selectedId === currentImage?._id;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header - overlaid on image */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <FaChevronLeft className="text-lg" />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full">
            <FaHeart className="text-pink-400 text-sm" />
            <span className="text-white font-medium text-sm">{votesThisSession}</span>
          </div>
        </div>
      </div>

      {/* Swipeable Image Container */}
      <div 
        ref={containerRef}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((image, i) => {
          const isThisWinner = selectedId === image._id;
          const isThisLoser = selectedId && selectedId !== image._id;
          
          return (
            <div
              key={image._id}
              className="w-full h-full flex-shrink-0 snap-center relative flex items-center justify-center cursor-pointer"
              onClick={() => !selectedId && handleVote(image._id)}
            >
              <img
                src={image.url}
                alt=""
                className={`w-full h-full object-contain transition-all duration-500 ${
                  isThisLoser ? 'opacity-30 scale-90' : ''
                } ${isThisWinner && celebrating ? 'scale-105' : ''}`}
              />
              
              {/* Tap hint overlay - shown when not celebrating */}
              {!selectedId && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="absolute bottom-32 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full">
                    <span className="text-white/70 text-sm font-medium">Tap to pick</span>
                  </div>
                </div>
              )}
              
              {/* Winner celebration overlay */}
              {isThisWinner && celebrating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-green-500/20"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full p-6 shadow-2xl"
                  >
                    <FaCrown className="text-white text-5xl" />
                  </motion.div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 pb-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
        {/* Image indicator dots */}
        <div className="flex justify-center gap-2 mb-3">
          {images.map((img, i) => (
            <div
              key={img._id}
              className={`h-2 rounded-full transition-all ${
                i === currentIndex 
                  ? 'bg-pink-500 w-8' 
                  : 'bg-white/30 w-2'
              }`}
            />
          ))}
        </div>

        {/* Swipe hint */}
        <p className="text-center text-white/50 text-xs">
          ← Swipe to compare · Tap to pick →
        </p>

        {/* Skip option */}
        <button
          onClick={fetchImages}
          disabled={loading || selectedId}
          className="block mx-auto mt-3 text-white/30 hover:text-white/60 text-sm transition-colors pointer-events-auto"
        >
          Skip →
        </button>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

// Community Leaderboard
function CommunityLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/explore/leaderboard');
        const data = await res.json();
        if (data.success) {
          setLeaderboard(data.leaderboard);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-8 text-white/40">
        <FaTrophy className="text-3xl mx-auto mb-3 text-white/20" />
        <p>No community rankings yet</p>
        <p className="text-sm mt-1">Start rating galleries to build the leaderboard!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {leaderboard.slice(0, 10).map((entry, i) => (
        <div
          key={entry.userId}
          className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5"
        >
          {/* Rank */}
          <div className="w-8 text-center">
            {i < 3 ? (
              <FaTrophy className={`mx-auto ${
                i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : 'text-amber-600'
              }`} />
            ) : (
              <span className="text-white/50 text-sm">{i + 1}</span>
            )}
          </div>

          {/* Preview */}
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
            {entry.previewUrl ? (
              <img src={entry.previewUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FaUsers className="text-white/20" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{entry.galleryName || 'Gallery'}</p>
            <p className="text-white/50 text-xs">{entry.totalVotes} votes · {Math.round(entry.winRate * 100)}% wins</p>
          </div>

          {/* Score */}
          <div className="text-right">
            <p className="text-pink-400 font-bold">{entry.totalScore}</p>
            <p className="text-white/40 text-xs">pts</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ExplorePage() {
  const { data: session, status } = useSession();
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('galleries'); // 'galleries', 'rate', 'leaderboard'
  const [ratingGallery, setRatingGallery] = useState(null);

  useEffect(() => {
    if (session) {
      fetchGalleries();
    }
  }, [session]);

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/explore/galleries');
      const data = await res.json();
      if (data.success) {
        setGalleries(data.galleries);
      }
    } catch (err) {
      console.error('Error fetching galleries:', err);
    } finally {
      setLoading(false);
    }
  };

  const startRating = (gallery = null) => {
    setRatingGallery(gallery);
    setActiveTab('rate');
  };

  if (status === 'loading') {
    return (
      <Layout title="Explore">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500" />
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout title="Explore">
        <div className="max-w-xl mx-auto px-4 py-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
            <FaUsers className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Explore Galleries</h1>
          <p className="text-white/60 mb-8">
            Discover and rate other users' galleries. See how your collection stacks up against the community!
          </p>
          <button
            onClick={() => signIn('google')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            <FaGoogle className="text-xl" />
            Sign in with Google
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Explore">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Explore</h1>
            <p className="text-white/50 text-sm mt-1">Rate other galleries · Community rankings</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => { setActiveTab('galleries'); setRatingGallery(null); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'galleries'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <FaImages className="inline mr-2" />
            Galleries
          </button>
          <button
            onClick={() => startRating(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'rate'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <FaFire className="inline mr-2" />
            Rate Random
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <FaTrophy className="inline mr-2" />
            Leaderboard
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'galleries' && (
            <motion.div
              key="galleries"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-square bg-white/5 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : galleries.length === 0 ? (
                <div className="text-center py-12">
                  <FaUsers className="text-4xl text-white/20 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Galleries Yet</h3>
                  <p className="text-white/60 mb-6">Be the first to upload photos and share your gallery!</p>
                  <Link href="/manage">
                    <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium">
                      Create Your Gallery
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleries.map((gallery) => (
                    <GalleryCard
                      key={gallery.userId}
                      gallery={gallery}
                      onRate={startRating}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'rate' && (
            <motion.div
              key="rate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CommunityRatingMode
                galleryOwnerId={ratingGallery?.userId}
                onBack={() => { setActiveTab('galleries'); setRatingGallery(null); }}
                onComplete={() => setActiveTab('leaderboard')}
              />
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaTrophy className="text-yellow-400" />
                  Community Leaderboard
                </h2>
                <p className="text-white/50 text-sm mt-1">Top galleries ranked by community votes</p>
              </div>
              <CommunityLeaderboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

