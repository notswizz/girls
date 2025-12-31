import React, { useState, useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { FaUpload, FaGoogle } from 'react-icons/fa';

// Utils
import { checkAnonymousAccess, fetchComparisonImages, submitWinnerSelection } from './utils/api';
import { fireCelebrationEffects } from './utils/animations';

// Components
import SignInPrompt from './components/SignInPrompt';
import ImageCard from './components/ImageCard';
import FullImageModal from './components/FullImageModal';
import ErrorDisplay from './components/ErrorDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import HeadToHeadStyles from './components/HeadToHeadStyles';

const HeadToHeadCompare = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [fullViewImage, setFullViewImage] = useState(null);
  const [celebratingId, setCelebratingId] = useState(null);
  const confettiCanvasRef = useRef(null);
  const { data: session, status } = useSession();
  const [anonymousState, setAnonymousState] = useState({
    remaining: 3,
    showSignInPrompt: false
  });

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedImageId(null);
      setCelebratingId(null);
      
      const fetchedImages = await fetchComparisonImages();
      setImages(fetchedImages);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleSelectWinner = async (winnerId) => {
    try {
      const loserId = images.find(img => img._id !== winnerId)?._id;
      if (!loserId) return;
      
      setSelectedImageId(winnerId);
      setCelebratingId(winnerId);
      
      fireCelebrationEffects();
      
      await submitWinnerSelection(
        winnerId, 
        loserId, 
        session?.user?.id || null
      );
      
      setTimeout(() => {
        setLoading(true);
        setTimeout(() => {
          setCelebratingId(null);
          fetchImages();
        }, 300);
      }, 800);
    } catch (err) {
      console.error('Error selecting winner:', err);
      setCelebratingId(null);
      fetchImages();
    }
  };
  
  const toggleFullView = (e, image) => {
    e.stopPropagation();
    setFullViewImage(image === fullViewImage ? null : image);
  };
  
  useEffect(() => {
    if (session) {
      // Refetch when user logs in
      fetchImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Show login prompt if auth is required
  if (error === 'AUTH_REQUIRED' || (!session && status !== 'loading')) {
    return (
      <div className="w-full max-w-xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
            <FaGoogle className="text-3xl text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Sign in to Rate</h2>
          <p className="text-white/60 mb-8">
            Create your personal gallery and start rating your own hot girl shit collection.
          </p>
          <button
            onClick={() => signIn('google')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            <FaGoogle className="text-xl" />
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  // Show prompt to upload more images
  if (error === 'NEED_MORE_IMAGES') {
    return (
      <div className="w-full max-w-xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
            <FaUpload className="text-3xl text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Need More Photos</h2>
          <p className="text-white/60 mb-8">
            You need at least 2 models with photos to start comparing. Upload some pics to your gallery first!
          </p>
          <Link href="/manage">
            <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
              <FaUpload className="text-xl" />
              Go to Gallery
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchImages} />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 relative">
      {/* Simple header */}
      <motion.div 
        className="text-center mb-4 sm:mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
          Who wins?
        </h1>
        <p className="text-white/40 text-xs sm:text-sm mt-1">
          Tap to vote
        </p>
      </motion.div>

    
      <canvas 
        ref={confettiCanvasRef} 
        className="fixed inset-0 pointer-events-none z-50 opacity-0" 
        style={{ width: '100vw', height: '100vh' }}
      />
      
      {loading && celebratingId && (
        <LoadingSpinner overlay={true} celebrating={true} />
      )}
      
      {loading && !celebratingId ? (
        <LoadingSpinner />
      ) : (
        <div className="relative">
          {/* Main battle area - stacked on mobile, side by side on desktop */}
          <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:gap-6 items-stretch">
            {/* Left/Top card */}
            {images[0] && (
              <ImageCard
                image={images[0]}
                index={0}
                selectedImageId={selectedImageId}
                celebratingId={celebratingId}
                loading={loading}
                onSelectWinner={handleSelectWinner}
                onToggleFullView={toggleFullView}
                totalImages={images.length}
                position="left"
              />
            )}
            
            {/* VS Badge - centered between cards */}
            <div className="flex justify-center items-center py-1 lg:py-0 lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 z-30">
              <motion.div
                className="relative"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-xl opacity-50" />
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl border-2 lg:border-4 border-white/20">
                  <span className="text-white font-black text-base sm:text-lg lg:text-2xl">VS</span>
                </div>
              </motion.div>
            </div>
            
            {/* Right/Bottom card */}
            {images[1] && (
              <ImageCard
                image={images[1]}
                index={1}
                selectedImageId={selectedImageId}
                celebratingId={celebratingId}
                loading={loading}
                onSelectWinner={handleSelectWinner}
                onToggleFullView={toggleFullView}
                totalImages={images.length}
                position="right"
              />
            )}
          </div>
          
          {/* Skip button */}
          <motion.div 
            className="text-center mt-4 sm:mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={fetchImages}
              disabled={loading}
              className="text-white/30 hover:text-white/60 text-xs sm:text-sm transition-colors disabled:opacity-30"
            >
              Skip →
            </button>
          </motion.div>
          
          {/* Full image modal */}
          <AnimatePresence>
            {fullViewImage && (
              <FullImageModal 
                image={fullViewImage} 
                onClose={(e) => toggleFullView(e, fullViewImage)} 
              />
            )}
          </AnimatePresence>
        </div>
      )}
      
      <HeadToHeadStyles />
    </div>
  );
};

export default HeadToHeadCompare;
