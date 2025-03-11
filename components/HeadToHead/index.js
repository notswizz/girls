import React, { useState, useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { AnimatePresence } from 'framer-motion';

// Utils
import { checkAnonymousAccess, fetchComparisonImages, submitWinnerSelection, createPaymentIntent } from './utils/api';
import { fireCelebrationEffects } from './utils/animations';
import { REVEAL_COST_DISPLAY } from './utils/constants';

// Components
import SignInPrompt from './components/SignInPrompt';
import InstagramRevealModal from './components/InstagramRevealModal';
import ImageCard from './components/ImageCard';
import FullImageModal from './components/FullImageModal';
import ErrorDisplay from './components/ErrorDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import HeadToHeadStyles from './components/HeadToHeadStyles';

/**
 * Main component for head-to-head image comparison
 */
const HeadToHeadCompare = () => {
  // State
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [fullViewImage, setFullViewImage] = useState(null);
  const [celebratingId, setCelebratingId] = useState(null);
  const confettiCanvasRef = useRef(null);
  const { data: session } = useSession();
  const [anonymousState, setAnonymousState] = useState({
    remaining: 3,
    showSignInPrompt: false
  });
  
  // Instagram reveal modal state
  const [instagramModal, setInstagramModal] = useState({
    open: false,
    modelId: null,
    modelName: '',
    modelUsername: '',
    instagram: '',
    paid: false,
    clientSecret: null,
    loading: false,
    error: null,
    amount: REVEAL_COST_DISPLAY
  });

  // Fetch images for comparison
  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedImageId(null);
      setCelebratingId(null);
      
      // Check if anonymous user is allowed to continue
      if (!session) {
        const accessData = await checkAnonymousAccess();
        if (!accessData.allowed) {
          setAnonymousState(prev => ({ ...prev, showSignInPrompt: true }));
          setLoading(false);
          return;
        }
        
        setAnonymousState({
          remaining: accessData.remaining,
          showSignInPrompt: false
        });
      }
      
      const fetchedImages = await fetchComparisonImages();
      
      // Fetch model data for each image if needed
      const imagesWithModelData = await Promise.all(fetchedImages.map(async (img) => {
        // If the image already has model data with Instagram, just return it
        if (img.modelData && img.modelData.instagram) {
          return img;
        }
        
        // If the image has a modelId, fetch the model data
        if (img.modelId) {
          try {
            // Ensure modelId is valid format (24 character hex string)
            const modelId = String(img.modelId);
            if (!modelId.match(/^[0-9a-fA-F]{24}$/)) {
              console.warn(`Invalid model ID format: ${modelId}`);
              return img;
            }
            
            const modelResponse = await fetch(`/api/models/${modelId}`);
            if (modelResponse.ok) {
              const modelData = await modelResponse.json();
              return { ...img, modelData: modelData.model };
            } else {
              console.warn(`Failed to fetch model data: ${modelResponse.status}`);
            }
          } catch (e) {
            console.error('Error fetching model data:', e);
          }
        }
        
        return img;
      }));
      
      console.log('Images loaded successfully:', imagesWithModelData.map(img => ({
        id: img._id,
        modelName: img.modelName,
        modelUsername: img.modelUsername,
        hasInstagram: !!img.modelData?.instagram
      })));
      
      setImages(imagesWithModelData);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Handle selection of a winner
  const handleSelectWinner = async (winnerId) => {
    try {
      // Get the loser ID
      const loserId = images.find(img => img._id !== winnerId)?._id;
      if (!loserId) return;
      
      // First check if anonymous user has reached limit
      if (!session) {
        const accessData = await checkAnonymousAccess();
        if (!accessData.allowed) {
          setAnonymousState(prev => ({ ...prev, showSignInPrompt: true }));
          return;
        }
      }
      
      setSelectedImageId(winnerId);
      setCelebratingId(winnerId);
      
      // Trigger celebration effects
      fireCelebrationEffects();
      
      // Submit the result with user identification if available
      await submitWinnerSelection(
        winnerId, 
        loserId, 
        session?.user?.id || null
      );
      
      // Show celebration for a moment, then transition to loading state
      setTimeout(() => {
        setLoading(true);
        
        // Finally, fetch new images after the transition
        setTimeout(() => {
          setCelebratingId(null);
          fetchImages();
        }, 300);
      }, 900);
    } catch (err) {
      console.error('Error selecting winner:', err);
      setCelebratingId(null);
      fetchImages();
    }
  };
  
  // Handle full view toggle
  const toggleFullView = (e, image) => {
    e.stopPropagation(); // Prevent selecting the image
    setFullViewImage(image === fullViewImage ? null : image);
  };
  
  // Handle Instagram reveal button click
  const handleInstagramReveal = async (e, image) => {
    e.stopPropagation(); // Prevent selecting the image
    
    // Get model data (either from the image or fetch it)
    const modelData = image.modelData;
    
    setInstagramModal({
      open: true,
      modelId: image.modelId,
      modelName: modelData?.name || image.modelName || 'This model',
      modelUsername: image.modelUsername || modelData?.username || 'this model',
      instagram: modelData?.instagram || '',
      paid: false,
      clientSecret: null,
      loading: true,
      error: null,
      amount: REVEAL_COST_DISPLAY
    });
    
    try {
      console.log('Creating payment intent for model:', image.modelId);
      
      // Create a payment intent
      const paymentData = await createPaymentIntent(
        image.modelId,
        modelData?.name || image.modelName || 'Unknown'
      );
      
      console.log('Payment intent created successfully');
      
      setInstagramModal(prev => ({
        ...prev,
        clientSecret: paymentData.clientSecret,
        loading: false,
        amount: paymentData.formatted_amount || REVEAL_COST_DISPLAY
      }));
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setInstagramModal(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to initialize payment. Please try again later.'
      }));
    }
  };
  
  // Handle payment success
  const handlePaymentSuccess = (paymentIntent) => {
    // In a production app, you would verify the payment on the server
    // For now, we just set paid to true to reveal the Instagram handle
    setInstagramModal(prev => ({
      ...prev,
      paid: true,
      clientSecret: null
    }));
  };
  
  // Handle payment error
  const handlePaymentError = (error) => {
    setInstagramModal(prev => ({
      ...prev,
      error: error.message || 'Payment failed'
    }));
  };
  
  // Listen for session changes to update UI
  useEffect(() => {
    if (session) {
      // If user signs in, reset the sign-in prompt
      setAnonymousState({
        remaining: -1,
        showSignInPrompt: false
      });
      
      // Reload images if we were showing the sign-in prompt
      if (anonymousState.showSignInPrompt) {
        fetchImages();
      }
    } else {
      // Check anonymous access when not signed in
      checkAnonymousAccess()
        .then(data => {
          if (!data.authenticated && data.remaining <= 0) {
            setAnonymousState({
              remaining: 0,
              showSignInPrompt: true
            });
          } else {
            setAnonymousState({
              remaining: data.remaining,
              showSignInPrompt: false
            });
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // If there's an error, display error component
  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchImages} />;
  }

  // If showing sign-in prompt
  if (anonymousState.showSignInPrompt) {
    return <SignInPrompt />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto pt-0 relative">
      {/* Anonymous usage counter - only show if not signed in and remaining counts exist */}
      {!session && anonymousState.remaining > 0 && (
        <div className="mb-4 p-3 rounded-md bg-cyber-dark/50 text-white/80 text-sm text-center">
          <span className="font-medium">Anonymous mode:</span> {anonymousState.remaining} comparison{anonymousState.remaining !== 1 ? 's' : ''} remaining. 
          <button 
            onClick={() => signIn('google')} 
            className="ml-2 text-cyber-pink underline hover:text-cyber-blue transition-colors"
          >
            Sign in for unlimited access.
          </button>
        </div>
      )}
    
      {/* Hidden canvas for confetti (needed for some browsers) */}
      <canvas 
        ref={confettiCanvasRef} 
        className="fixed inset-0 pointer-events-none z-50 opacity-0" 
        style={{ width: '100vw', height: '100vh' }}
      />
      
      {/* Loading spinner overlaid during transition */}
      {loading && celebratingId && (
        <LoadingSpinner overlay={true} celebrating={true} />
      )}
      
      {loading && !celebratingId ? (
        <LoadingSpinner />
      ) : (
        <div className="relative">
          {/* VS indicator in the middle */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 hidden md:block">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyber-purple to-cyber-pink flex items-center justify-center shadow-neon">
              <span className="text-white font-bold text-xl">VS</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {images.map((image, index) => (
              <ImageCard
                key={image._id}
                image={image}
                index={index}
                selectedImageId={selectedImageId}
                celebratingId={celebratingId}
                loading={loading}
                onSelectWinner={(winnerId) => handleSelectWinner(winnerId)}
                onToggleFullView={(e, image) => toggleFullView(e, image)}
                onInstagramReveal={(e, image) => handleInstagramReveal(e, image)}
                totalImages={images.length}
              />
            ))}
          </div>
          
          {/* Full image modal */}
          <AnimatePresence>
            {fullViewImage && (
              <FullImageModal 
                image={fullViewImage} 
                onClose={(e) => toggleFullView(e, fullViewImage)} 
              />
            )}
          </AnimatePresence>
          
          {/* Instagram Reveal Modal */}
          <InstagramRevealModal
            modalState={instagramModal}
            onClose={() => setInstagramModal(prev => ({ ...prev, open: false }))}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onRevealRequest={() => handleInstagramReveal(
              { stopPropagation: () => {} }, 
              { 
                modelId: instagramModal.modelId, 
                modelName: instagramModal.modelName, 
                modelUsername: instagramModal.modelUsername 
              }
            )}
          />
        </div>
      )}
      
      {/* Global styles */}
      <HeadToHeadStyles />
    </div>
  );
};

export default HeadToHeadCompare;
