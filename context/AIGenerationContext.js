import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

const AIGenerationContext = createContext(null);

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

  // Start a new generation
  // modelInfo: { id, name } - optional info about source model for filtering
  const startGeneration = useCallback(async (imageUrl, promptText, type, modelInfo = null) => {
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
        throw new Error(data.error || 'Generation failed');
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
    
    // Actions
    startGeneration,
    cancelGeneration,
    resetGeneration,
    closeModal,
    openModal,
    setPrompt,
    setError,
  };

  return (
    <AIGenerationContext.Provider value={value}>
      {children}
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

