import React, { useState, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight, FaFire, FaCrown, FaExpand, FaTimes, FaLock, FaGoogle, FaInstagram, FaCreditCard, FaQuestion } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useSession, signIn } from 'next-auth/react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';

// Load Stripe outside of component render to avoid recreating it on each render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Get the cost from environment variable or default to $1
const REVEAL_COST = parseFloat(process.env.NEXT_PUBLIC_INSTAGRAM_REVEAL_COST || '1').toFixed(2);
const REVEAL_COST_DISPLAY = `$${REVEAL_COST}`;

export default function HeadToHeadCompare() {
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

  // Check anonymous access state
  const checkAnonymousAccess = async () => {
    try {
      const response = await fetch('/api/auth/check-anonymous');
      if (!response.ok) {
        throw new Error('Failed to check access');
      }
      
      const data = await response.json();
      
      // If not authenticated and remaining is 0, show sign-in prompt
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
      
      return data.allowed;
    } catch (error) {
      console.error('Error checking anonymous access:', error);
      return true; // Default to allowed in case of error
    }
  };

  // Fetch images for comparison
  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedImageId(null);
      setCelebratingId(null);
      
      // Check if anonymous user is allowed to continue
      if (!session) {
        const isAllowed = await checkAnonymousAccess();
        if (!isAllowed) {
          setAnonymousState(prev => ({ ...prev, showSignInPrompt: true }));
          setLoading(false);
          return;
        }
      }
      
      const response = await fetch('/api/images/compare?count=2');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch images');
      }
      
      const data = await response.json();
      
      if (!data.success || !data.images || data.images.length < 2) {
        throw new Error('Not enough images for comparison');
      }
      
      // Fetch model data for each image if needed
      const imagesWithModelData = await Promise.all(data.images.map(async (img) => {
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
  
  // Fire confetti and celebration effects
  const fireCelebrationEffects = () => {
    // Multiple confetti bursts
    const duration = 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
    
    const randomInRange = (min, max) => Math.random() * (max - min) + min;
    
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      
      const particleCount = 50 * (timeLeft / duration);
      
      // Left side confetti
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: randomInRange(0.3, 0.7) },
        colors: ['#FF00A0', '#9b30ff', '#4CC9F0']
      });
      
      // Right side confetti
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: randomInRange(0.3, 0.7) },
        colors: ['#F038FF', '#6EE7B7', '#3CFFE6']
      });
      
      // Top center explosion
      confetti({
        ...defaults,
        particleCount: particleCount * 0.5,
        origin: { x: 0.5, y: 0.2 },
        gravity: 1.2,
        scalar: 1.2
      });
    }, 150);
  };
  
  // Handle selection of a winner
  const handleSelectWinner = async (winnerId, loserId) => {
    try {
      // First check if anonymous user has reached limit
      if (!session) {
        const isAllowed = await checkAnonymousAccess();
        if (!isAllowed) {
          setAnonymousState(prev => ({ ...prev, showSignInPrompt: true }));
          return;
        }
      }
      
      setSelectedImageId(winnerId);
      setCelebratingId(winnerId);
      
      // Trigger celebration effects
      fireCelebrationEffects();
      
      // Submit the result with user identification if available
      const payload = {
        winnerId,
        loserId,
        // Include user ID if authenticated
        ...(session?.user?.id && { userId: session.user.id })
      };
      
      // Submit the matchup result
      const response = await fetch('/api/scores/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit matchup result');
      }
      
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
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: image.modelId,
          modelName: modelData?.name || image.modelName || 'Unknown'
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Payment intent creation failed:', data);
        throw new Error(data.message || 'Failed to create payment intent');
      }
      
      console.log('Payment intent created successfully');
      
      setInstagramModal(prev => ({
        ...prev,
        clientSecret: data.clientSecret,
        loading: false,
        amount: data.formatted_amount || REVEAL_COST_DISPLAY
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
    
    // In a production app, here you would:
    // 1. Verify the payment was successful via server
    // 2. Record the transaction in your database
    // 3. Update user's access rights to this content
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
      checkAnonymousAccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Sign-in prompt component
  const SignInPrompt = () => (
    <div className="w-full max-w-md mx-auto p-6 card-neo bg-cyber-dark/70 rounded-xl backdrop-blur-md shadow-neon">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyber-pink/20 flex items-center justify-center">
          <FaLock className="text-3xl text-cyber-pink" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Limited Access</h2>
        <p className="text-white/80 mb-6">
          You've reached the limit for anonymous comparisons. Sign in to continue rating and unlock full access.
        </p>
        
        <button
          onClick={() => signIn('google')}
          className="btn-cyber px-6 py-3 font-bold flex items-center justify-center gap-2 mx-auto"
        >
          <FaGoogle className="text-lg" /> 
          <span>Sign in with Google</span>
        </button>
      </div>
    </div>
  );
  
  // Instagram Reveal Modal
  const renderInstagramModal = () => {
    const { open, modelUsername, instagram, paid, clientSecret, loading, error, amount } = instagramModal;
    
    if (!open) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto">
        <div className="relative bg-cyber-dark border-2 border-cyber-blue/50 rounded-lg w-full max-w-md p-4 shadow-xl max-h-[90vh] overflow-y-auto my-8">
          <button
            onClick={() => setInstagramModal(prev => ({ ...prev, open: false }))}
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white bg-cyber-dark/80 rounded-full z-10"
          >
            <FaTimes />
          </button>
          
          <div className="text-center mb-4">
            <div className="h-12 w-12 mx-auto bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-full flex items-center justify-center mb-2">
              <FaInstagram className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Instagram Reveal</h3>
          </div>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin h-8 w-8 border-4 border-cyber-blue border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-white">Initializing payment...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 mb-3">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
              <button
                onClick={() => setInstagramModal(prev => ({ ...prev, open: false }))}
                className="btn-cyber bg-gradient-to-r from-cyber-blue to-cyber-purple px-6 py-2"
              >
                Close
              </button>
            </div>
          ) : paid ? (
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-pink-500/40 rounded-lg p-4 mb-4">
                <div className="flex flex-col items-center">
                  <div className="mb-3 text-white text-sm">
                    Check out <span className="font-bold text-cyber-success">@{modelUsername}</span> on Instagram!
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-0.5 rounded-lg w-full mb-4">
                    <div className="bg-cyber-dark-lighter p-3 rounded-md flex items-center justify-center">
                      <FaInstagram className="text-pink-500 text-xl mr-2" />
                      <span className="font-bold text-xl text-white break-all">@{instagram}</span>
                    </div>
                  </div>
                  
                  <a
                    href={`https://instagram.com/${instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-cyber bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-2 flex items-center justify-center w-full mb-2"
                  >
                    <FaInstagram className="mr-2" />
                    Visit Instagram Profile
                  </a>
                  
                  <div className="text-xs text-white/60 mt-2">
                    You can now follow and connect with this model on Instagram.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInstagramModal(prev => ({ ...prev, open: false }))}
                className="btn-cyber bg-gradient-to-r from-cyber-blue to-cyber-purple px-6 py-2"
              >
                Close
              </button>
            </div>
          ) : clientSecret ? (
            <div>
              <div className="mb-3">
                <p className="text-white mb-3 text-sm">
                  Unlock <span className="font-bold text-cyber-pink">@{modelUsername}'s</span> Instagram handle for a one-time fee.
                </p>
                <div className="bg-cyber-dark/50 border border-white/10 rounded-lg p-3 mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white/80 text-sm">Reveal fee:</span>
                    <span className="text-cyber-pink font-bold">{amount}</span>
                  </div>
                  <div className="text-xs text-white/60">
                    One-time payment to reveal this model's Instagram.
                  </div>
                </div>
              </div>
            
              <Elements 
                stripe={stripePromise} 
                options={{ 
                  clientSecret,
                  appearance: {
                    theme: 'night',
                    variables: {
                      colorPrimary: '#4CC9F0',
                      colorBackground: '#0F1223',
                      colorText: '#FFFFFF',
                      colorDanger: '#FF0080',
                      fontFamily: 'system-ui, sans-serif',
                      spacingUnit: '4px',
                      borderRadius: '8px'
                    }
                  }
                }}
              >
                <PaymentForm 
                  clientSecret={clientSecret} 
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  amount={amount}
                />
              </Elements>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-white mb-3 text-sm">
                Unlock <span className="font-bold text-cyber-pink">@{modelUsername}'s</span> Instagram handle for a one-time fee.
              </p>
              <div className="bg-cyber-dark/50 border border-white/10 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white/80 text-sm">Reveal fee:</span>
                  <span className="text-cyber-pink font-bold">{amount}</span>
                </div>
                <div className="text-xs text-white/60">
                  One-time payment to reveal this model's Instagram.
                </div>
              </div>
              <button
                onClick={() => handleInstagramReveal({ stopPropagation: () => {} }, { modelId: instagramModal.modelId, modelName: instagramModal.modelName, modelUsername: instagramModal.modelUsername })}
                className="btn-cyber bg-gradient-to-r from-cyber-blue to-cyber-purple w-full py-2 flex items-center justify-center text-sm"
              >
                <FaCreditCard className="mr-2" />
                Pay {amount} to Reveal
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="card-neo border-cyber-pink border-2 p-6 max-w-lg w-full">
          <div className="flex items-center justify-center text-cyber-pink mb-4">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="font-bold text-xl mb-2 text-center">Error Detected</h3>
          <p className="text-white/70 text-center mb-6">{error}</p>
          <button
            onClick={fetchImages}
            className="btn-cyber w-full flex items-center justify-center"
          >
            Try Again
          </button>
        </div>
      </div>
    );
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
        <div className="absolute inset-0 flex justify-center items-center z-30 bg-black/30 backdrop-blur-sm">
          <div className="relative">
            <div className="w-16 h-16 border-t-4 border-b-4 border-cyber-pink rounded-full animate-spin"></div>
            <div className="w-16 h-16 border-r-4 border-l-4 border-cyber-blue rounded-full animate-spin-slow absolute top-0 left-0"></div>
            <div className="w-8 h-8 bg-gradient-to-br from-cyber-pink to-cyber-purple rounded-full absolute top-4 left-4 animate-pulse"></div>
          </div>
        </div>
      )}
      
      {loading && !celebratingId ? (
        <div className="flex justify-center items-center h-[60vh]">
          <div className="relative">
            <div className="w-16 h-16 border-t-4 border-b-4 border-cyber-pink rounded-full animate-spin"></div>
            <div className="w-16 h-16 border-r-4 border-l-4 border-cyber-blue rounded-full animate-spin-slow absolute top-0 left-0"></div>
            <div className="w-8 h-8 bg-gradient-to-br from-cyber-pink to-cyber-purple rounded-full absolute top-4 left-4 animate-pulse"></div>
          </div>
        </div>
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
              <motion.div
                key={image._id}
                className={`relative md:flex-1 h-[60vh] md:h-[75vh] min-h-[400px] rounded-xl overflow-hidden transition-all duration-300 group mb-8 md:mb-0 ${
                  selectedImageId === image._id ? 'scale-105 z-10' : ''
                } ${celebratingId === image._id ? 'celebration-glow' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={selectedImageId === null ? { scale: 1.03 } : {}}
                onClick={() => !loading && handleSelectWinner(image._id, images.find(img => img._id !== image._id)._id)}
              >
                {/* Pulsing particles on celebrating image */}
                {celebratingId === image._id && (
                  <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-cyber-pink to-cyber-blue animate-float-outward"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 1000}ms`,
                          opacity: 0.7
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Image border effect */}
                <div className={`absolute inset-0 rounded-xl p-1 ${
                  selectedImageId === image._id
                    ? 'bg-gradient-to-r from-cyber-pink via-cyber-purple to-cyber-blue animate-shimmer shadow-xl' 
                    : 'bg-gradient-to-r from-white/10 to-white/5'
                }`}>
                  <div className="absolute inset-0 rounded-lg overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.name || `Image ${index + 1}`}
                      className={`w-full h-full object-cover transition-all duration-300 ${
                        celebratingId === image._id ? 'scale-105 brightness-110' : ''
                      }`}
                    />
                  </div>
                </div>
                
                {/* Username in top left (discreet) */}
                <div className="absolute top-3 left-3">
                  <div className="px-3 py-1 bg-black/30 backdrop-blur-sm rounded-md text-sm font-medium">
                    <span className="text-white/90">{image.modelUsername || 'unknown'}</span>
                  </div>
                </div>
                
                {/* ELO badge in top right */}
                {image.elo && (
                  <div className="absolute top-3 right-3">
                    <div className={`
                      w-auto min-w-[40px] h-[40px] rounded-full flex items-center justify-center p-1
                      ${image.elo > 1500 
                        ? 'bg-gradient-to-br from-cyber-pink/60 to-cyber-purple/60 shadow-neon' 
                        : 'bg-gradient-to-br from-cyber-blue/50 to-cyber-dark/40'} 
                      backdrop-blur-md border border-white/20 group-hover:shadow-neon transition-all duration-300`}
                    >
                      <div className="flex items-center justify-center">
                        <span className="text-white font-bold">{Math.round(image.elo)}</span>
                        {image.elo > 1500 && <FaFire className="text-cyber-yellow text-xs ml-1" />}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* "Who is she?" button - Only show if the model has an Instagram */}
                {image.modelData && image.modelData.instagram && (
                  <div className="absolute bottom-3 left-3 z-20">
                    <button
                      className="px-3 py-2 bg-gradient-to-r from-cyber-pink/80 to-cyber-purple/80 backdrop-blur-sm rounded-lg text-sm font-medium text-white flex items-center hover:shadow-neon transition-all duration-300"
                      onClick={(e) => handleInstagramReveal(e, image)}
                    >
                      <FaQuestion className="mr-2" />
                      Who is she?
                    </button>
                  </div>
                )}
                
                {/* Winner effect */}
                <AnimatePresence>
                  {selectedImageId === image._id && (
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                    >
                      <div className="bg-gradient-to-r from-cyber-pink to-cyber-purple text-white rounded-full p-5 shadow-neon-strong animate-pulse-fast">
                        <FaCrown size={40} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Full view button (bottom right) */}
                <button
                  className="absolute bottom-3 right-3 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all z-10"
                  onClick={(e) => toggleFullView(e, image)}
                >
                  <FaExpand size={16} />
                </button>
                
                {/* Mobile-friendly selection buttons */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 md:px-0">
                  <button
                    className={`bg-white/10 hover:bg-white/20 backdrop-blur-lg p-3 md:p-4 rounded-lg text-white shadow-lg ${
                      index === 1 || loading ? 'opacity-0 pointer-events-none' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      !loading && handleSelectWinner(image._id, images.find(img => img._id !== image._id)._id);
                    }}
                    disabled={loading}
                  >
                    <FaChevronLeft size={24} className="text-cyber-pink drop-shadow-md" />
                  </button>
                  
                  <button
                    className={`bg-white/10 hover:bg-white/20 backdrop-blur-lg p-3 md:p-4 rounded-lg text-white shadow-lg ${
                      index === 0 || loading ? 'opacity-0 pointer-events-none' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      !loading && handleSelectWinner(image._id, images.find(img => img._id !== image._id)._id);
                    }}
                    disabled={loading}
                  >
                    <FaChevronRight size={24} className="text-cyber-pink drop-shadow-md" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Full image modal */}
          <AnimatePresence>
            {fullViewImage && (
              <motion.div
                className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => toggleFullView(e, fullViewImage)}
              >
                <button
                  className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
                  onClick={(e) => toggleFullView(e, fullViewImage)}
                >
                  <FaTimes size={24} />
                </button>
                
                <motion.div
                  className="w-full max-w-4xl max-h-[90vh] relative"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                >
                  <img
                    src={fullViewImage.url}
                    alt={fullViewImage.modelUsername || 'Full view'}
                    className="w-full h-full object-contain"
                  />
                  
                  <div className="absolute top-3 left-0 right-0 flex justify-between px-4">
                    <div className="px-4 py-2 bg-black/40 backdrop-blur-sm rounded-lg">
                      <span className="text-white font-medium">
                        {fullViewImage.modelUsername || 'Unknown'}
                      </span>
                    </div>
                    
                    {fullViewImage.elo && (
                      <div className="px-4 py-2 bg-gradient-to-r from-cyber-pink/40 to-cyber-purple/40 backdrop-blur-sm rounded-lg flex items-center">
                        <span className="text-white font-bold mr-1">{Math.round(fullViewImage.elo)}</span>
                        {fullViewImage.elo > 1500 && <FaFire className="text-cyber-yellow" />}
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Instagram Reveal Modal */}
          {renderInstagramModal()}
        </div>
      )}
      
      <style jsx global>{`
        .celebration-glow {
          box-shadow: 0 0 15px 5px rgba(255, 0, 160, 0.5), 0 0 30px 15px rgba(76, 201, 240, 0.3);
          animation: pulse-glow 1s infinite alternate;
        }
        
        @keyframes pulse-glow {
          from {
            box-shadow: 0 0 15px 5px rgba(255, 0, 160, 0.5), 0 0 30px 15px rgba(76, 201, 240, 0.3);
          }
          to {
            box-shadow: 0 0 25px 10px rgba(255, 0, 160, 0.6), 0 0 50px 25px rgba(76, 201, 240, 0.4);
          }
        }
        
        @keyframes float-outward {
          0% {
            transform: scale(0.5) translate(0, 0);
            opacity: 0.8;
          }
          100% {
            transform: scale(2) translate(var(--x, 50px), var(--y, 50px));
            opacity: 0;
          }
        }
        
        .animate-float-outward {
          --x: ${Math.random() * 100 - 50}px;
          --y: ${Math.random() * 100 - 50}px;
          animation: float-outward 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
} 