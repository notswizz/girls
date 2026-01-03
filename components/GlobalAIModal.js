import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaImage, FaVideo, FaTimes, FaMagic, FaSpinner, FaSave, FaTrash, FaDownload, FaRobot, FaCheck, FaPhotoVideo, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { useAIGeneration } from '../context/AIGenerationContext';
import { extractFrames } from '../utils/videoFrameExtractor';

export default function GlobalAIModal() {
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Frame extraction states
  const [extractingFrames, setExtractingFrames] = useState(false);
  const [extractedFrames, setExtractedFrames] = useState([]);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
  const [showFrameSelector, setShowFrameSelector] = useState(false);
  
  const {
    isGenerating,
    generationType,
    referenceImageUrl,
    prompt,
    progress,
    error,
    result,
    showModal,
    closeModal,
    resetGeneration,
    setError,
  } = useAIGeneration();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-extract frames when video generation completes
  useEffect(() => {
    if (result && generationType === 'video' && !extractingFrames && extractedFrames.length === 0) {
      handleExtractFrames();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, generationType]);

  const handleExtractFrames = async () => {
    if (!result) return;
    
    setExtractingFrames(true);
    setError(null);
    
    try {
      console.log('Extracting frames from video:', result);
      const frames = await extractFrames(result, 12); // Extract 12 frames
      console.log(`Extracted ${frames.length} frames`);
      
      if (frames.length === 0) {
        throw new Error('No frames could be extracted');
      }
      
      setExtractedFrames(frames);
      setSelectedFrameIndex(0); // Auto-select best frame (already sorted by score)
      setShowFrameSelector(true);
    } catch (err) {
      console.error('Frame extraction error:', err);
      setError('Failed to extract frames: ' + err.message);
    } finally {
      setExtractingFrames(false);
    }
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal]);

  // Check if user selected the video (last item in the selector)
  const isVideoSelected = showFrameSelector && selectedFrameIndex === extractedFrames.length;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      let urlToSave = result;
      let typeToSave = generationType;
      let isFrame = false;
      
      // If we have extracted frames, check what's selected
      if (showFrameSelector && extractedFrames.length > 0) {
        if (isVideoSelected) {
          // User selected the full video (last item)
          urlToSave = result;
          typeToSave = 'video';
        } else {
          // User selected a frame
          const selectedFrame = extractedFrames[selectedFrameIndex];
          urlToSave = selectedFrame.dataUrl; // This is a base64 data URL
          typeToSave = 'image';
          isFrame = true;
        }
      }
      
      if (!urlToSave) {
        throw new Error('No content to save');
      }

      const response = await fetch('/api/ai/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlToSave,
          prompt: prompt,
          type: typeToSave,
          isExtractedFrame: isFrame,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      setSaveSuccess(true);
      setTimeout(() => {
        handleReset();
        setSaveSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    resetGeneration();
    setExtractedFrames([]);
    setSelectedFrameIndex(0);
    setShowFrameSelector(false);
  };

  const handleDownload = async () => {
    try {
      let downloadUrl;
      let filename;
      
      if (showFrameSelector && !isVideoSelected && extractedFrames[selectedFrameIndex]) {
        // Download the selected frame
        downloadUrl = extractedFrames[selectedFrameIndex].dataUrl;
        filename = `ai-frame-${Date.now()}.jpg`;
      } else {
        // Download the video or image result
        if (!result) return;
        const response = await fetch(result);
        const blob = await response.blob();
        downloadUrl = window.URL.createObjectURL(blob);
        filename = `ai-${generationType}-${Date.now()}.${generationType === 'video' ? 'mp4' : 'png'}`;
      }
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Only revoke if it was a blob URL (not a data URL)
      if (!downloadUrl.startsWith('data:')) {
        window.URL.revokeObjectURL(downloadUrl);
      }
    } catch (err) {
      setError('Failed to download');
    }
  };

  const handleDiscard = () => {
    if (isGenerating || extractingFrames) {
      if (!window.confirm('Processing is in progress. Are you sure you want to discard?')) {
        return;
      }
    }
    handleReset();
  };

  // Total items = frames + 1 (for the video at the end)
  const totalItems = extractedFrames.length + 1;

  const handlePrevFrame = () => {
    setSelectedFrameIndex(prev => prev > 0 ? prev - 1 : totalItems - 1);
  };

  const handleNextFrame = () => {
    setSelectedFrameIndex(prev => prev < totalItems - 1 ? prev + 1 : 0);
  };

  const handleClose = () => {
    closeModal();
  };

  if (!mounted || !showModal) return null;

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 99999, backgroundColor: 'rgba(0,0,0,0.9)' }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-lg bg-gradient-to-b from-gray-900 to-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              {generationType === 'video' ? <FaVideo className="text-white" /> : <FaImage className="text-white" />}
            </div>
            <div>
              <h3 className="text-white font-semibold">
                AI {generationType === 'video' ? 'Video' : 'Image'} Generator
              </h3>
              <p className="text-white/40 text-xs">Powered by Replicate</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Reference Image */}
          {referenceImageUrl && (
            <div className="relative">
              <p className="text-white/40 text-xs mb-2">Reference Image</p>
              <img
                src={referenceImageUrl}
                alt="Reference"
                className="w-full max-h-32 object-contain rounded-lg opacity-50"
              />
            </div>
          )}

          {/* Prompt Display */}
          {prompt && (
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-white/40 text-xs mb-1">Prompt</p>
              <p className="text-white/80 text-sm">{prompt}</p>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && !result && (
            <div className="py-8 text-center">
              <div className="relative mx-auto w-20 h-20 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaRobot className="text-purple-400 text-2xl animate-pulse" />
                </div>
              </div>
              <p className="text-white/60 text-sm">{progress || 'Processing...'}</p>
            </div>
          )}

          {/* Frame Extraction Loading */}
          {extractingFrames && (
            <div className="py-8 text-center">
              <div className="relative mx-auto w-20 h-20 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaPhotoVideo className="text-cyan-400 text-2xl animate-pulse" />
                </div>
              </div>
              <p className="text-white/60 text-sm">Extracting best frames...</p>
              <p className="text-white/40 text-xs mt-1">Analyzing video for quality shots</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-xs text-white/40 hover:text-white/60"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Success State */}
          {saveSuccess && (
            <div className="py-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <FaCheck className="text-green-400 text-2xl" />
              </div>
              <p className="text-green-400 font-medium">Saved to AI Gallery!</p>
            </div>
          )}

          {/* Result Display */}
          {result && !saveSuccess && !extractingFrames && (
            <div className="space-y-4">
              
              {/* Frame Selector for Videos */}
              {showFrameSelector && extractedFrames.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-white/40 text-xs">
                      {isVideoSelected ? 'Full Video' : 'Best Frames Extracted'}
                    </p>
                    <span className="text-cyan-400 text-xs font-medium">
                      {selectedFrameIndex + 1} / {totalItems}
                    </span>
                  </div>
                  
                  {/* Main Display - Frame or Video */}
                  <div className="relative">
                    {isVideoSelected ? (
                      <motion.div
                        key="video"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <video
                          src={result}
                          className="w-full rounded-xl shadow-lg border border-purple-500/30"
                          controls
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                        {/* Video Badge */}
                        <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-gradient-to-r from-purple-500/80 to-pink-500/80 backdrop-blur-sm">
                          <span className="text-white text-xs font-medium flex items-center gap-1">
                            <FaVideo size={10} />
                            Full Video
                          </span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.img
                        key={selectedFrameIndex}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        src={extractedFrames[selectedFrameIndex]?.dataUrl}
                        alt={`Frame ${selectedFrameIndex + 1}`}
                        className="w-full rounded-xl shadow-lg border border-white/10"
                      />
                    )}
                    
                    {/* Navigation Arrows */}
                    <button
                      onClick={handlePrevFrame}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white/80 hover:bg-black/80 hover:text-white transition-all backdrop-blur-sm"
                    >
                      <FaArrowLeft size={14} />
                    </button>
                    <button
                      onClick={handleNextFrame}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white/80 hover:bg-black/80 hover:text-white transition-all backdrop-blur-sm"
                    >
                      <FaArrowRight size={14} />
                    </button>

                    {/* Quality Score Badge (only for frames) */}
                    {!isVideoSelected && (
                      <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-gradient-to-r from-cyan-500/80 to-blue-500/80 backdrop-blur-sm">
                        <span className="text-white text-xs font-medium flex items-center gap-1">
                          <HiSparkles size={12} />
                          Score: {extractedFrames[selectedFrameIndex]?.score?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Strip - Frames + Video at end */}
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                    {extractedFrames.slice(0, 8).map((frame, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedFrameIndex(idx)}
                        className={`
                          flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                          ${idx === selectedFrameIndex 
                            ? 'border-cyan-400 ring-2 ring-cyan-400/30' 
                            : 'border-white/10 hover:border-white/30'}
                        `}
                      >
                        <img
                          src={frame.dataUrl}
                          alt={`Thumb ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                    {/* Video thumbnail at the end */}
                    <button
                      onClick={() => setSelectedFrameIndex(extractedFrames.length)}
                      className={`
                        flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all relative
                        ${isVideoSelected 
                          ? 'border-purple-400 ring-2 ring-purple-400/30' 
                          : 'border-white/10 hover:border-white/30'}
                      `}
                    >
                      <video
                        src={result}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <FaVideo className="text-white text-lg" />
                      </div>
                    </button>
                  </div>

                  <p className="text-white/40 text-xs text-center">
                    {isVideoSelected 
                      ? 'Save the full video or swipe to pick a frame' 
                      : 'Frames sorted by quality • Swipe right for full video'}
                  </p>
                </>
              ) : (
                <>
                  {/* Regular image result */}
                  <p className="text-white/40 text-xs">Generated Image</p>
                  <img
                    src={result}
                    alt="Generated"
                    className="w-full rounded-xl shadow-lg"
                  />
                </>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {/* Save to Gallery */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`
                    w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2
                    ${isVideoSelected 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-500'} 
                    text-white hover:shadow-lg transition-all
                    ${saving ? 'opacity-70 cursor-not-allowed' : ''}
                  `}
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {isVideoSelected ? <FaVideo /> : <FaSave />}
                      Save {isVideoSelected ? 'Video' : (showFrameSelector ? 'Frame' : '')} to Gallery
                    </>
                  )}
                </button>

                <div className="flex gap-2">
                  {/* Download (video or frame) */}
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-2.5 px-4 rounded-xl font-medium flex items-center justify-center gap-2 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-all border border-purple-500/30"
                  >
                    <FaDownload size={14} />
                    Download
                  </button>

                  {/* Discard */}
                  <button
                    onClick={handleDiscard}
                    className="flex-1 py-2.5 px-4 rounded-xl font-medium flex items-center justify-center gap-2 bg-white/5 text-white/60 hover:bg-white/10 transition-all"
                  >
                    <FaTrash size={14} />
                    Discard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating indicator when minimized */}
      </motion.div>
    </motion.div>
  );

  return createPortal(
    <AnimatePresence mode="wait">
      {showModal && modalContent}
    </AnimatePresence>,
    document.body
  );
}

// Mini floating indicator component for when modal is closed but generation is in progress
export function AIGenerationIndicator() {
  const { isGenerating, generationType, openModal, result, showModal } = useAIGeneration();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only show when modal is closed AND (generating or has result)
  const shouldShow = mounted && !showModal && (isGenerating || result);

  if (!shouldShow) return null;

  const indicatorContent = (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      onClick={openModal}
      className="fixed bottom-24 right-4 z-[9999] flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all animate-pulse"
    >
      {isGenerating ? (
        <>
          <div className="relative w-6 h-6">
            <div className="absolute inset-0 rounded-full border-2 border-white/30" />
            <div className="absolute inset-0 rounded-full border-2 border-t-white animate-spin" />
          </div>
          <span className="text-sm font-medium">
            AI {generationType === 'video' ? 'Video' : 'Image'}...
          </span>
        </>
      ) : result ? (
        <>
          <FaCheck className="text-green-300" />
          <span className="text-sm font-medium">AI Ready! Tap to view</span>
        </>
      ) : null}
    </motion.button>
  );

  return createPortal(
    <AnimatePresence>
      {indicatorContent}
    </AnimatePresence>,
    document.body
  );
}

