import React, { useState, useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaUpload, FaGoogle } from 'react-icons/fa';
import { markWinSound } from '../../pages/_app';

// Utils
import { fetchComparisonImages, submitWinnerSelection } from './utils/api';
import { fireCelebrationEffects } from './utils/animations';

// Components
import MobileSwipeRating from './components/MobileSwipeRating';
import ErrorDisplay from './components/ErrorDisplay';
import LoadingSpinner from './components/LoadingSpinner';

// Maximum number of recent models to track (minimum ratings apart)
const RECENT_MODELS_LIMIT = 6;

const HeadToHeadCompare = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [celebratingId, setCelebratingId] = useState(null);
  const [recentModels, setRecentModels] = useState([]);
  const { data: session, status } = useSession();
  const hasFetched = useRef(false);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedImageId(null);
      setCelebratingId(null);
      
      const fetchedImages = await fetchComparisonImages(recentModels);
      setImages(fetchedImages);
      
      // Track models shown in this comparison (to avoid showing same model within 6 ratings)
      const newModelIds = fetchedImages
        .map(img => img.modelId?.toString() || img.modelId)
        .filter(Boolean);
      
      setRecentModels(prev => {
        const updated = [...prev, ...newModelIds];
        // Keep only the last RECENT_MODELS_LIMIT models
        return updated.slice(-RECENT_MODELS_LIMIT);
      });
    } catch (err) {
      // Don't log AUTH_REQUIRED as an error - it's expected when not logged in
      if (err.message === 'AUTH_REQUIRED') {
        setError('AUTH_REQUIRED');
      } else if (err.message === 'NEED_MORE_IMAGES') {
        setError('NEED_MORE_IMAGES');
      } else {
        console.error('Error fetching images:', err);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Wait for session status to be determined before fetching
  useEffect(() => {
    // Don't fetch while session is still loading
    if (status === 'loading') return;
    
    // If not authenticated, set error immediately without API call
    if (!session) {
      setError('AUTH_REQUIRED');
      setLoading(false);
      return;
    }
    
    // Only fetch once when authenticated
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchImages();
    }
  }, [session, status]);

  // Refetch when session changes (user logs in)
  useEffect(() => {
    if (session && hasFetched.current) {
      // User just logged in, refetch
      fetchImages();
    }
  }, [session]);
  
  const handleSelectWinner = async (winnerId) => {
    try {
      const loserId = images.find(img => img._id !== winnerId)?._id;
      if (!loserId) return;
      
      setSelectedImageId(winnerId);
      setCelebratingId(winnerId);
      
      // Play win sound and mark it to prevent click sound
      try {
        markWinSound();
        const winSound = new Audio('/win.wav');
        winSound.volume = 0.4;
        winSound.play().catch(() => {});
      } catch (e) {}
      
      fireCelebrationEffects();
      
      // Submit vote and pre-fetch next images in parallel
      const [, nextImages] = await Promise.all([
        submitWinnerSelection(winnerId, loserId, session?.user?.id || null),
        fetchComparisonImages(recentModels)
      ]);
      
      // Brief celebration then show next
      setTimeout(() => {
        setCelebratingId(null);
        setSelectedImageId(null);
        if (nextImages?.length >= 2) {
          setImages(nextImages);
          const newModelIds = nextImages
            .map(img => img.modelId?.toString() || img.modelId)
            .filter(Boolean);
          setRecentModels(prev => [...prev, ...newModelIds].slice(-RECENT_MODELS_LIMIT));
        } else {
          fetchImages();
        }
      }, 400);
    } catch (err) {
      console.error('Error selecting winner:', err);
      setCelebratingId(null);
      fetchImages();
    }
  };

  // Show loading while session is being determined
  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  // Show login prompt if not authenticated
  if (!session || error === 'AUTH_REQUIRED') {
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
            Create your private bank and start rating your collection head-to-head.
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

  // Show generic error
  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchImages} />;
  }

  return (
    <>
      {loading && celebratingId && (
        <LoadingSpinner overlay={true} celebrating={true} />
      )}
      
      {loading && !celebratingId ? (
        <LoadingSpinner />
      ) : (
        <MobileSwipeRating
          images={images}
          selectedImageId={selectedImageId}
          celebratingId={celebratingId}
          loading={loading}
          onSelectWinner={handleSelectWinner}
          onSkip={fetchImages}
        />
      )}
    </>
  );
};

export default HeadToHeadCompare;
