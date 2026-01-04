import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaImage, FaVideo, FaTimes, FaSpinner, FaSave, FaTrash, FaDownload, FaRobot, FaCheck } from 'react-icons/fa';
import { useAIGeneration } from '../context/AIGenerationContext';

export default function GlobalAIModal() {
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
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
    sourceModelId,
    sourceModelName,
  } = useAIGeneration();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      if (!result) {
        throw new Error('No content to save');
      }

      const response = await fetch('/api/ai/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: result,
          prompt: prompt,
          type: generationType,
          sourceModelId: sourceModelId,
          sourceModelName: sourceModelName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      setSaveSuccess(true);
      setTimeout(() => {
        resetGeneration();
        setSaveSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    
    try {
      const response = await fetch(result);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const filename = `ai-${generationType}-${Date.now()}.${generationType === 'video' ? 'mp4' : 'png'}`;
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError('Failed to download');
    }
  };

  const handleDiscard = () => {
    if (isGenerating) {
      if (!window.confirm('Processing is in progress. Are you sure you want to discard?')) {
        return;
      }
    }
    resetGeneration();
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
              <p className="text-green-400 font-medium">Saved to Creations!</p>
            </div>
          )}

          {/* Result Display */}
          {result && !saveSuccess && (
            <div className="space-y-4">
              <p className="text-white/40 text-xs">
                Generated {generationType === 'video' ? 'Video' : 'Image'}
              </p>
              
              {generationType === 'video' ? (
                <video
                  src={result}
                  className="w-full rounded-xl shadow-lg border border-purple-500/30"
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={result}
                  alt="Generated"
                  className="w-full rounded-xl shadow-lg"
                />
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {/* Save to Gallery */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`
                    w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2
                    ${generationType === 'video' 
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
                      {generationType === 'video' ? <FaVideo /> : <FaSave />}
                      Save {generationType === 'video' ? 'Video' : 'Image'} to Creations
                    </>
                  )}
                </button>

                <div className="flex gap-2">
                  {/* Download */}
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
