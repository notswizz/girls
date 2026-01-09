import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCoins, FaVideo, FaTimes, FaGift } from 'react-icons/fa';
import Link from 'next/link';

const AIGenerationContext = createContext(null);

// Video generation cost
const VIDEO_GENERATION_COST = 100;

// LocalStorage key for persisting state
const STORAGE_KEY = 'ai_generation_state';

// Load state from localStorage
const loadPersistedState = () => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Check if it's still valid (not too old - 10 minutes)
      if (parsed.timestamp && Date.now() - parsed.timestamp < 10 * 60 * 1000) {
        return parsed;
      }
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to load AI generation state:', e);
  }
  return null;
};

// Save state to localStorage
const persistState = (state) => {
  if (typeof window === 'undefined') return;
  try {
    if (state.predictionId || state.result) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...state,
        timestamp: Date.now()
      }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to persist AI generation state:', e);
  }
};

// Token Confirmation Modal Component
function TokenConfirmModal({ isOpen, onConfirm, onCancel, currentTokens, cost }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const hasEnough = currentTokens >= cost;
  const remaining = currentTokens - cost;

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 100000, backgroundColor: 'rgba(0,0,0,0.9)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#0d0d14] rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="relative p-6 pb-4 text-center">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <FaTimes size={14} />
          </button>
          
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <FaVideo className="text-white text-2xl" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-1">Generate AI Video</h3>
          <p className="text-white/40 text-sm">This action will use tokens</p>
        </div>

        {/* Token Info */}
        <div className="px-6 pb-4">
          <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4 space-y-3">
            {/* Cost */}
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-sm">Cost</span>
              <div className="flex items-center gap-2">
                <FaCoins className="text-amber-400" />
                <span className="text-white font-bold text-lg">{cost}</span>
              </div>
            </div>
            
            <div className="h-px bg-white/5" />
            
            {/* Current Balance */}
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-sm">Your balance</span>
              <span className={`font-semibold ${hasEnough ? 'text-white' : 'text-red-400'}`}>
                {currentTokens} tokens
              </span>
            </div>
            
            {hasEnough && (
              <>
                <div className="h-px bg-white/5" />
                
                {/* After */}
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-sm">After generation</span>
                  <span className="text-white/70 font-medium">{remaining} tokens</span>
                </div>
              </>
            )}
          </div>

          {/* Not enough tokens warning */}
          {!hasEnough && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm text-center mb-3">
                You need {cost - currentTokens} more tokens
              </p>
              <Link
                href="/referrals"
                onClick={onCancel}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-all"
              >
                <FaGift />
                Invite friends to earn tokens
              </Link>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 pt-0 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-xl font-medium text-white/60 bg-white/5 hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!hasEnough}
            className={`flex-1 py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              hasEnough
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            <FaCoins className="text-sm" />
            Spend {cost}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(
    <AnimatePresence>{isOpen && modalContent}</AnimatePresence>,
    document.body
  );
}

export function AIGenerationProvider({ children }) {
  // Load initial state from localStorage
  const [initialized, setInitialized] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [predictionId, setPredictionId] = useState(null);
  const [generationType, setGenerationType] = useState(null); // 'image' or 'video'
  const [referenceImageUrl, setReferenceImageUrl] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [progress, setProgress] = useState('');
  const [pollCount, setPollCount] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // The generated content URL
  const [showModal, setShowModal] = useState(false);
  // Track source model for filtering in creations
  const [sourceModelId, setSourceModelId] = useState(null);
  const [sourceModelName, setSourceModelName] = useState(null);
  
  // Token confirmation modal state
  const [showTokenConfirm, setShowTokenConfirm] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [pendingGeneration, setPendingGeneration] = useState(null);
  
  const pollIntervalRef = useRef(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const persisted = loadPersistedState();
    if (persisted) {
      console.log('Restoring AI generation state:', persisted);
      if (persisted.predictionId) {
        setPredictionId(persisted.predictionId);
        setIsGenerating(true);
        setShowModal(true);
      }
      if (persisted.generationType) setGenerationType(persisted.generationType);
      if (persisted.referenceImageUrl) setReferenceImageUrl(persisted.referenceImageUrl);
      if (persisted.prompt) setPrompt(persisted.prompt);
      if (persisted.sourceModelId) setSourceModelId(persisted.sourceModelId);
      if (persisted.sourceModelName) setSourceModelName(persisted.sourceModelName);
      if (persisted.result) {
        setResult(persisted.result);
        setShowModal(true);
      }
    }
    setInitialized(true);
  }, []);

  // Persist state changes
  useEffect(() => {
    if (!initialized) return;
    persistState({
      predictionId,
      generationType,
      referenceImageUrl,
      prompt,
      result,
      isGenerating,
      sourceModelId,
      sourceModelName
    });
  }, [initialized, predictionId, generationType, referenceImageUrl, prompt, result, isGenerating, sourceModelId, sourceModelName]);

  // Custom cursor effect during AI generation
  useEffect(() => {
    if (!isGenerating) return;

    // Create the cursor follower element
    const follower = document.createElement('div');
    follower.id = 'ai-cursor-follower';
    follower.innerHTML = `
      <div class="ai-cursor-ring"></div>
      <div class="ai-cursor-dot"></div>
      <div class="ai-cursor-sparkles">
        <span></span><span></span><span></span><span></span>
      </div>
    `;
    document.body.appendChild(follower);

    // Create styles
    const styleEl = document.createElement('style');
    styleEl.id = 'ai-generation-cursor';
    styleEl.textContent = `
      #ai-cursor-follower {
        position: fixed;
        pointer-events: none;
        z-index: 999999;
        mix-blend-mode: screen;
      }
      
      .ai-cursor-ring {
        position: absolute;
        width: 40px;
        height: 40px;
        border: 2px solid #a855f7;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: aiRingSpin 2s linear infinite;
        border-top-color: #ec4899;
        border-right-color: transparent;
      }
      
      .ai-cursor-dot {
        position: absolute;
        width: 8px;
        height: 8px;
        background: linear-gradient(135deg, #a855f7, #ec4899);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: aiDotPulse 0.8s ease-in-out infinite;
        box-shadow: 0 0 20px #a855f7, 0 0 40px #ec4899;
      }
      
      .ai-cursor-sparkles {
        position: absolute;
        transform: translate(-50%, -50%);
      }
      
      .ai-cursor-sparkles span {
        position: absolute;
        width: 4px;
        height: 4px;
        background: #fff;
        border-radius: 50%;
        animation: aiSparkle 1.5s ease-in-out infinite;
      }
      
      .ai-cursor-sparkles span:nth-child(1) { animation-delay: 0s; }
      .ai-cursor-sparkles span:nth-child(2) { animation-delay: 0.3s; }
      .ai-cursor-sparkles span:nth-child(3) { animation-delay: 0.6s; }
      .ai-cursor-sparkles span:nth-child(4) { animation-delay: 0.9s; }
      
      @keyframes aiRingSpin {
        0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
        50% { transform: translate(-50%, -50%) rotate(180deg) scale(1.1); }
        100% { transform: translate(-50%, -50%) rotate(360deg) scale(1); }
      }
      
      @keyframes aiDotPulse {
        0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.8; }
      }
      
      @keyframes aiSparkle {
        0%, 100% { 
          opacity: 0;
          transform: translate(0, 0) scale(0);
        }
        50% { 
          opacity: 1;
          transform: translate(var(--x, 20px), var(--y, -20px)) scale(1);
        }
      }
      
      .ai-cursor-sparkles span:nth-child(1) { --x: 25px; --y: -10px; }
      .ai-cursor-sparkles span:nth-child(2) { --x: -25px; --y: -15px; }
      .ai-cursor-sparkles span:nth-child(3) { --x: 20px; --y: 20px; }
      .ai-cursor-sparkles span:nth-child(4) { --x: -20px; --y: 18px; }
    `;
    document.head.appendChild(styleEl);

    // Track mouse position with smooth following
    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animate = () => {
      // Smooth following effect
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      follower.style.left = followerX + 'px';
      follower.style.top = followerY + 'px';
      
      if (document.getElementById('ai-cursor-follower')) {
        requestAnimationFrame(animate);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      const existingFollower = document.getElementById('ai-cursor-follower');
      if (existingFollower) existingFollower.remove();
      const existingStyle = document.getElementById('ai-generation-cursor');
      if (existingStyle) existingStyle.remove();
    };
  }, [isGenerating]);

  // Poll for result
  const pollForResult = useCallback(async () => {
    if (!predictionId || !generationType) return;
    
    try {
      const response = await fetch(`/api/ai/poll?predictionId=${predictionId}`);
      const data = await response.json();

      if (data.status === 'succeeded' && data.output) {
        // Success!
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setResult(data.output);
        setProgress('');
        setIsGenerating(false);
        setPollCount(0);
      } else if (data.status === 'failed' || data.status === 'canceled') {
        // Failed
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setError(data.error || 'Generation failed');
        setProgress('');
        setIsGenerating(false);
        setPollCount(0);
      } else {
        // Still processing
        setPollCount(prev => {
          const newCount = prev + 1;
          const elapsed = Math.round(newCount * 2);
          if (generationType === 'video') {
            setProgress(`Generating video... ${elapsed}s (may take 2-5 min)`);
          } else {
            setProgress(`Generating image... ${elapsed}s`);
          }
          return newCount;
        });
      }
    } catch (err) {
      console.error('Poll error:', err);
      // Don't stop on network errors, keep trying
    }
  }, [predictionId, generationType]);

  // Start polling when predictionId is set
  useEffect(() => {
    if (predictionId && isGenerating && !pollIntervalRef.current) {
      pollIntervalRef.current = setInterval(pollForResult, 2000);
    }
    return () => {
      // Don't clear on unmount - we want it to persist
    };
  }, [predictionId, isGenerating, pollForResult]);

  // Warn before page unload if generating
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isGenerating) {
        e.preventDefault();
        e.returnValue = 'AI generation is in progress. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isGenerating]);

  // Actually execute the generation (called after confirmation)
  const executeGeneration = useCallback(async (imageUrl, promptText, type, modelInfo) => {
    setReferenceImageUrl(imageUrl);
    setPrompt(promptText);
    setGenerationType(type);
    setSourceModelId(modelInfo?.id || null);
    setSourceModelName(modelInfo?.name || null);
    setError(null);
    setResult(null);
    setIsGenerating(true);
    setShowModal(true);
    setProgress(type === 'video' ? 'Starting video generation...' : 'Starting image generation...');

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceImage: imageUrl,
          prompt: promptText,
          mode: type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle insufficient tokens error specifically
        if (response.status === 402) {
          setError(data.message || `Insufficient tokens. You need ${VIDEO_GENERATION_COST} tokens.`);
        } else {
          setError(data.error || 'Generation failed');
        }
        setIsGenerating(false);
        setProgress('');
        return;
      }

      if (data.predictionId) {
        setPredictionId(data.predictionId);
        // Polling will start automatically via useEffect
      } else if (data.output) {
        // Immediate result (shouldn't happen but handle it)
        setResult(data.output);
        setIsGenerating(false);
        setProgress('');
      }
    } catch (err) {
      setError(err.message);
      setIsGenerating(false);
      setProgress('');
    }
  }, []);

  // Handle token confirmation
  const handleTokenConfirm = useCallback(() => {
    setShowTokenConfirm(false);
    if (pendingGeneration) {
      const { imageUrl, promptText, type, modelInfo } = pendingGeneration;
      setPendingGeneration(null);
      executeGeneration(imageUrl, promptText, type, modelInfo);
    }
  }, [pendingGeneration, executeGeneration]);

  const handleTokenCancel = useCallback(() => {
    setShowTokenConfirm(false);
    setPendingGeneration(null);
  }, []);

  // Start a new generation
  // modelInfo: { id, name } - optional info about source model for filtering
  const startGeneration = useCallback(async (imageUrl, promptText, type, modelInfo = null) => {
    // For video generation, check tokens and show confirmation modal
    if (type === 'video') {
      try {
        // Check user's token balance
        const balanceRes = await fetch('/api/auth/me');
        const balanceData = await balanceRes.json();
        
        if (!balanceRes.ok || !balanceData.success) {
          setError('Failed to check token balance. Please try again.');
          setShowModal(true);
          return;
        }
        
        const currentTokens = balanceData.user?.tokens || 0;
        setTokenBalance(currentTokens);
        
        // Store pending generation and show confirmation modal
        setPendingGeneration({ imageUrl, promptText, type, modelInfo });
        setShowTokenConfirm(true);
        return;
      } catch (err) {
        setError('Failed to verify token balance. Please try again.');
        setShowModal(true);
        return;
      }
    }

    // For non-video, execute directly
    executeGeneration(imageUrl, promptText, type, modelInfo);
  }, [executeGeneration]);

  // Cancel generation
  const cancelGeneration = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsGenerating(false);
    setPredictionId(null);
    setProgress('');
    setPollCount(0);
    // Clear localStorage on cancel
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Reset all state (after save/discard)
  const resetGeneration = useCallback(() => {
    cancelGeneration();
    setResult(null);
    setError(null);
    setPrompt('');
    setReferenceImageUrl(null);
    setGenerationType(null);
    setSourceModelId(null);
    setSourceModelName(null);
    setShowModal(false);
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [cancelGeneration]);

  // Close modal but keep result if exists
  const closeModal = useCallback(() => {
    if (isGenerating) {
      // Confirm before closing during generation
      if (!window.confirm('AI generation is in progress. Are you sure you want to close?')) {
        return false;
      }
      cancelGeneration();
    }
    setShowModal(false);
    return true;
  }, [isGenerating, cancelGeneration]);

  // Open modal (to view current result)
  const openModal = useCallback(() => {
    setShowModal(true);
  }, []);

  // Extension state
  const [isExtending, setIsExtending] = useState(false);
  const [parentVideoId, setParentVideoId] = useState(null);
  const [parentVideoUrl, setParentVideoUrl] = useState(null);
  const [existingPlaylist, setExistingPlaylist] = useState([]); // All existing videos in the chain

  // Extract last frame from video and start extension
  // playlist: array of {url, prompt} for existing videos in the chain
  const startExtension = useCallback(async (videoUrl, videoId, promptText = '', playlist = []) => {
    setIsExtending(true);
    setParentVideoId(videoId);
    setParentVideoUrl(videoUrl);
    setExistingPlaylist(playlist);
    setShowModal(true); // Show modal immediately
    setProgress('Extracting last frame from video...');
    setGenerationType('video');
    
    try {
      console.log('[Extension] Starting frame extraction from:', videoUrl);
      
      let lastFrameUrl = null;
      
      // Try client-side extraction first (without CORS to avoid load errors)
      try {
        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        // Don't set crossOrigin - it causes load failures on some S3 configs
        
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('timeout')), 15000);
          
          video.onloadedmetadata = () => {
            video.currentTime = Math.max(0, video.duration - 0.1);
          };
          
          video.onseeked = () => {
            clearTimeout(timeout);
            resolve();
          };
          
          video.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('load failed'));
          };
          
          video.src = videoUrl;
          video.load();
        });

        // Try to extract frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        try {
          lastFrameUrl = canvas.toDataURL('image/jpeg', 0.9);
          console.log('[Extension] Client-side frame extracted');
        } catch (taintedError) {
          console.log('[Extension] Canvas tainted, will use server proxy');
        }
        
        video.remove();
        canvas.remove();
      } catch (clientErr) {
        console.log('[Extension] Client extraction failed:', clientErr.message);
      }
      
      // If client-side failed, try server-side proxy
      if (!lastFrameUrl) {
        setProgress('Fetching video via server...');
        console.log('[Extension] Trying server-side proxy');
        
        const proxyRes = await fetch('/api/ai/extract-frame-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoUrl })
        });
        
        if (proxyRes.ok) {
          const data = await proxyRes.json();
          
          if (data.videoDataUrl) {
            // Load the proxied video and extract frame
            setProgress('Extracting frame...');
            console.log('[Extension] Got proxied video, extracting frame');
            
            const video = document.createElement('video');
            video.muted = true;
            video.playsInline = true;
            
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => reject(new Error('timeout')), 30000);
              
              video.onloadedmetadata = () => {
                video.currentTime = Math.max(0, video.duration - 0.1);
              };
              
              video.onseeked = () => {
                clearTimeout(timeout);
                resolve();
              };
              
              video.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('proxy video load failed'));
              };
              
              video.src = data.videoDataUrl;
            });
            
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 1280;
            canvas.height = video.videoHeight || 720;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            lastFrameUrl = canvas.toDataURL('image/jpeg', 0.9);
            
            video.remove();
            canvas.remove();
            console.log('[Extension] Frame extracted from proxied video');
          }
        }
      }
      
      // If still no frame, just proceed with the prompt only (AI will generate from scratch continuation)
      if (!lastFrameUrl) {
        console.log('[Extension] Could not extract frame, proceeding with prompt only');
        // Use original video URL as reference - AI can sometimes work with video URLs
        lastFrameUrl = videoUrl;
      }
      
      // Start generation
      const finalPrompt = promptText || 'Continue the motion naturally';
      console.log('[Extension] Starting generation');
      
      await startGeneration(lastFrameUrl, finalPrompt, 'video', { 
        id: null, 
        name: 'Extension',
        parentVideoId: videoId 
      });
      
    } catch (err) {
      console.error('[Extension] Error:', err);
      setError('Failed to start extension: ' + err.message);
      setIsExtending(false);
      setProgress('');
      throw err;
    }
  }, [startGeneration, setError, setShowModal, setProgress, setGenerationType]);

  // Reset extension state when generation resets
  const resetGenerationWithExtension = useCallback(() => {
    resetGeneration();
    setIsExtending(false);
    setParentVideoId(null);
    setParentVideoUrl(null);
    setExistingPlaylist([]);
  }, [resetGeneration]);

  const value = {
    // State
    isGenerating,
    predictionId,
    generationType,
    referenceImageUrl,
    prompt,
    progress,
    error,
    result,
    showModal,
    sourceModelId,
    sourceModelName,
    isExtending,
    parentVideoId,
    parentVideoUrl,
    existingPlaylist,
    
    // Actions
    startGeneration,
    startExtension,
    cancelGeneration,
    resetGeneration: resetGenerationWithExtension,
    closeModal,
    openModal,
    setPrompt,
    setError,
  };

  return (
    <AIGenerationContext.Provider value={value}>
      {children}
      <TokenConfirmModal
        isOpen={showTokenConfirm}
        onConfirm={handleTokenConfirm}
        onCancel={handleTokenCancel}
        currentTokens={tokenBalance}
        cost={VIDEO_GENERATION_COST}
      />
    </AIGenerationContext.Provider>
  );
}

export function useAIGeneration() {
  const context = useContext(AIGenerationContext);
  if (!context) {
    throw new Error('useAIGeneration must be used within AIGenerationProvider');
  }
  return context;
}

export default AIGenerationContext;

