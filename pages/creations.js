import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { FaVideo, FaFilter, FaTimes, FaDownload, FaTrash, FaHeart, FaRegHeart, FaSortAmountDown } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import Layout from '../components/Layout';

// Video thumbnail component with hover to play
function VideoThumbnail({ src, className, onClick }) {
  const videoRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      muted
      loop
      playsInline
      preload="metadata"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    />
  );
}

export default function CreationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent'); // 'recent' or 'favorites'
  const [showFilters, setShowFilters] = useState(false);
  const [viewingCreation, setViewingCreation] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [togglingFavorite, setTogglingFavorite] = useState(null);

  // Fetch creations
  const fetchCreations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('type', 'video'); // Only fetch videos
      if (sortBy === 'favorites') params.append('favoritesFirst', 'true');
      
      const response = await fetch(`/api/ai/creations?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setCreations(data.creations || []);
      }
    } catch (error) {
      console.error('Failed to fetch creations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchCreations();
    }
  }, [session, sortBy]);

  // Toggle favorite
  const handleToggleFavorite = async (e, creation) => {
    e.stopPropagation();
    
    setTogglingFavorite(creation._id);
    try {
      const response = await fetch(`/api/ai/creations/${creation._id}/favorite`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update the creation in state
        setCreations(prev => prev.map(c => 
          c._id === creation._id ? { ...c, isFavorite: data.isFavorite } : c
        ));
        // Update viewing creation if open
        if (viewingCreation?._id === creation._id) {
          setViewingCreation(prev => ({ ...prev, isFavorite: data.isFavorite }));
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setTogglingFavorite(null);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm('Delete this creation?')) return;
    
    setDeleting(id);
    try {
      const response = await fetch(`/api/ai/creations/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setCreations(prev => prev.filter(c => c._id !== id));
        if (viewingCreation?._id === id) {
          setViewingCreation(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setDeleting(null);
    }
  };

  // Handle download - open in new tab (avoids CORS issues)
  const handleDownload = (creation) => {
    // Open video URL directly - browser will handle download/playback
    window.open(creation.url, '_blank');
  };


  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500" />
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <HiSparkles className="text-white text-4xl" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">AI Creations</h1>
          <p className="text-white/60 mb-6">Sign in to view your AI-generated content</p>
          <button
            onClick={() => router.push('/api/auth/signin')}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold"
          >
            Sign In
          </button>
        </div>
      </Layout>
    );
  }

  const activeFilters = sortBy !== 'recent' ? 1 : 0;
  const favoriteCount = creations.filter(c => c.isFavorite).length;

  return (
    <Layout>
      <div className="min-h-screen pb-20">
        {/* Header */}
        <div className="sticky top-14 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 px-4 py-3">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <HiSparkles className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Creations</h1>
                <p className="text-xs text-white/40">
                  {creations.length} AI generated
                  {favoriteCount > 0 && ` · ${favoriteCount} favorites`}
                </p>
              </div>
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative p-2.5 rounded-xl transition-all ${
                showFilters || activeFilters > 0
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              <FaFilter size={16} />
              {activeFilters > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-[10px] text-white flex items-center justify-center font-bold">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 pb-2 space-y-3">
                  {/* Sort */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40 w-16">Sort:</span>
                    <div className="flex gap-2">
                      {[
                        { value: 'recent', label: 'Recent', icon: FaSortAmountDown },
                        { value: 'favorites', label: 'Favorites First', icon: FaHeart }
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setSortBy(opt.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                            sortBy === opt.value
                              ? 'bg-purple-500 text-white'
                              : 'bg-white/10 text-white/60 hover:bg-white/20'
                          }`}
                        >
                          <opt.icon size={10} />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>


                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="px-4 py-4 max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : creations.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <HiSparkles className="text-white/20 text-2xl" />
              </div>
              <h3 className="text-white/60 font-medium mb-2">No creations yet</h3>
              <p className="text-white/40 text-sm mb-4">
                Use AI Photo or Video on your images to create new content
              </p>
              <button
                onClick={() => router.push('/rate')}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold"
              >
                Start Rating
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {creations.map((creation) => (
                <motion.div
                  key={creation._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-black border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer"
                  onClick={() => setViewingCreation(creation)}
                >
                  <VideoThumbnail
                    src={creation.url}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm flex items-center gap-1 text-[10px] text-white/80">
                    <FaVideo size={8} />
                    Video
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => handleToggleFavorite(e, creation)}
                    disabled={togglingFavorite === creation._id}
                    className={`absolute top-2 left-2 p-2 rounded-full backdrop-blur-sm transition-all ${
                      creation.isFavorite
                        ? 'bg-pink-500/80 text-white'
                        : 'bg-black/40 text-white/60 hover:text-pink-400 hover:bg-black/60'
                    }`}
                  >
                    {creation.isFavorite ? <FaHeart size={12} /> : <FaRegHeart size={12} />}
                  </button>


                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 pointer-events-none">
                    <p className="text-white text-xs line-clamp-2">{creation.prompt}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {viewingCreation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
            onClick={() => setViewingCreation(null)}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <FaVideo className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">AI Video</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Favorite in modal */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggleFavorite(e, viewingCreation); }}
                  disabled={togglingFavorite === viewingCreation._id}
                  className={`p-2.5 rounded-full transition-all ${
                    viewingCreation.isFavorite
                      ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                      : 'bg-white/5 text-white/60 hover:text-pink-400 hover:bg-white/10'
                  }`}
                >
                  {viewingCreation.isFavorite ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
                </button>
                <button
                  onClick={() => setViewingCreation(null)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all"
                >
                  <FaTimes size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-auto" onClick={(e) => e.stopPropagation()}>
              <div className="max-w-4xl w-full">
                <video
                  src={viewingCreation.url}
                  className="w-full max-h-[60vh] object-contain rounded-xl"
                  controls
                  autoPlay
                  loop
                  playsInline
                />

                {/* Prompt */}
                {viewingCreation.prompt && (
                  <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs text-white/40 mb-1">Prompt</p>
                    <p className="text-white/80 text-sm">{viewingCreation.prompt}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleDownload(viewingCreation)}
                    className="flex-1 py-3 rounded-xl bg-purple-500/20 text-purple-300 font-medium flex items-center justify-center gap-2 hover:bg-purple-500/30 transition-all border border-purple-500/30"
                  >
                    <FaDownload size={14} />
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(viewingCreation._id)}
                    disabled={deleting === viewingCreation._id}
                    className="px-6 py-3 rounded-xl bg-red-500/20 text-red-300 font-medium flex items-center justify-center gap-2 hover:bg-red-500/30 transition-all border border-red-500/30"
                  >
                    <FaTrash size={14} />
                    {deleting === viewingCreation._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
