import React, { useState, useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaFire, FaTrophy, FaImages, FaArrowRight, FaHeart, FaCrown, FaUsers, FaChevronLeft, FaSearchPlus } from 'react-icons/fa';
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

// Community Rating Mode - Card swipe experience
function CommunityRatingMode({ galleryOwnerId, onBack, onComplete }) {
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
      const url = galleryOwnerId 
        ? `/api/explore/compare?galleryId=${galleryOwnerId}`
        : '/api/explore/compare';
      const res = await fetch(url);
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
    fetchImages();
  }, [galleryOwnerId]);

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

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col -mx-4">
      {/* Header - just back button */}
      <div className="p-4 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <FaChevronLeft />
          <span className="text-sm">Back</span>
        </button>
      </div>

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
                  ${isWinner ? 'ring-4 ring-pink-400 shadow-[0_0_40px_rgba(236,72,153,0.5)]' : ''}
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
                <div className="absolute -inset-[2px] rounded-3xl bg-gradient-to-br from-pink-500/50 via-purple-500/50 to-cyan-500/50 -z-10 blur-sm" />
                
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
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 via-purple-500/20 to-transparent" />
                      
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full blur-2xl opacity-60" />
                        <div className="relative bg-gradient-to-br from-pink-400 via-pink-500 to-purple-600 rounded-full p-6 shadow-2xl">
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
                          <FaHeart className={`${idx % 2 === 0 ? 'text-pink-400' : 'text-purple-400'} text-lg`} />
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

