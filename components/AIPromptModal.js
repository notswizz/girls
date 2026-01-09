import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaVideo, FaTimes, FaMagic, FaSpinner } from 'react-icons/fa';

export default function AIPromptModal({ 
  isOpen, 
  onClose, 
  mode = 'video', // Now only 'video' is supported
  referenceImageUrl,
  onSubmit,
  isGenerating 
}) {
  const [mounted, setMounted] = useState(false);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setPrompt('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!prompt.trim() || isGenerating) return;
    onSubmit(prompt.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 99998, backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-gradient-to-b from-gray-900 to-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
              <FaVideo className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">
                Generate AI Video
              </h3>
              <p className="text-white/40 text-xs">
                Bring this image to life with AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Reference Image Preview */}
          {referenceImageUrl && (
            <div className="relative">
              <img
                src={referenceImageUrl}
                alt="Reference"
                className="w-full max-h-40 object-contain rounded-lg opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />
            </div>
          )}

          {/* Prompt Input */}
          <div>
            <label className="block text-white/60 text-sm mb-2">
              Describe the motion you want
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Make her wave at the camera and smile..."
              className="w-full h-24 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 resize-none focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
              autoFocus
            />
          </div>

          {/* Tips */}
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-white/40 text-xs">
              💡 Tip: Describe the motion and action you want to see. Videos take 2-5 minutes to generate.
            </p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isGenerating}
            className={`
              w-full py-3.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2
              transition-all
              ${!prompt.trim() || isGenerating
                ? 'bg-white/10 text-white/30 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30'
              }
            `}
          >
            {isGenerating ? (
              <>
                <FaSpinner className="animate-spin" />
                Already Generating...
              </>
            ) : (
              <>
                <FaMagic />
                Generate Video
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && modalContent}
    </AnimatePresence>,
    document.body
  );
}

