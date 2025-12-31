import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaImage, FaVideo, FaTimes, FaMagic, FaSpinner, FaSave, FaTrash, FaDownload } from 'react-icons/fa';

const AIGenerateModal = ({ 
  isOpen, 
  onClose, 
  mode, // 'image' or 'video'
  referenceImageUrl,
  onSaved 
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');
  
  // Generated content state
  const [generatedContent, setGeneratedContent] = useState(null);
  const [generatedType, setGeneratedType] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedContent(null);
    setProgress(mode === 'video' ? 'Generating video... this may take a few minutes' : 'Generating image...');

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referenceImage: referenceImageUrl,
          prompt: prompt.trim(),
          mode: mode,
          saveImmediately: false, // Don't save yet, just generate
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Generation failed');
      }

      // Show the generated content for preview
      setGeneratedContent(data.output);
      setGeneratedType(data.type);
      setProgress('');
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate. Please try again.');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const handleSave = async () => {
    if (!generatedContent) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/ai/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: generatedContent,
          prompt: prompt.trim(),
          type: generatedType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      onSaved?.(data);
      handleClose();
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedContent) return;
    
    setSaving(true);
    try {
      // Fetch the video and trigger download
      const response = await fetch(generatedContent);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      onSaved?.({ type: 'video', downloaded: true });
      handleClose();
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download. Try long-pressing the video to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setGeneratedContent(null);
    setGeneratedType(null);
  };

  const handleClose = () => {
    setPrompt('');
    setGeneratedContent(null);
    setGeneratedType(null);
    setError(null);
    setProgress('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
        onClick={!loading && !saving ? handleClose : undefined}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-white/10 overflow-hidden my-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${mode === 'video' ? 'bg-purple-500/20' : 'bg-pink-500/20'}`}>
                {mode === 'video' ? (
                  <FaVideo className="text-purple-400" />
                ) : (
                  <FaImage className="text-pink-400" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {generatedContent ? 'Preview AI Creation' : `Generate AI ${mode === 'video' ? 'Video' : 'Image'}`}
                </h2>
                <p className="text-white/50 text-xs">
                  {generatedContent 
                    ? (generatedType === 'video' ? 'Download to phone or discard' : 'Save to your AI gallery or discard')
                    : 'Describe what you want to create'
                  }
                </p>
              </div>
            </div>
            {!loading && !saving && (
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <FaTimes className="text-white/60" />
              </button>
            )}
          </div>

          {/* Generated Content Preview */}
          {generatedContent ? (
            <div className="p-4">
              {/* Preview */}
              <div className="relative rounded-xl overflow-hidden bg-black/50 mb-4">
                {generatedType === 'video' ? (
                  <video
                    src={generatedContent}
                    controls
                    autoPlay
                    loop
                    muted
                    className="w-full max-h-[60vh] object-contain"
                  />
                ) : (
                  <img
                    src={generatedContent}
                    alt="AI Generated"
                    className="w-full max-h-[60vh] object-contain"
                  />
                )}
              </div>

              {/* Prompt used */}
              <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Prompt</p>
                <p className="text-white/80 text-sm">{prompt}</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleDiscard}
                  disabled={saving}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-white/10 text-white/70 hover:bg-white/20 transition-all"
                >
                  <FaTrash size={14} />
                  Discard
                </button>
                
                {generatedType === 'video' ? (
                  // Video: Download to phone
                  <button
                    onClick={handleDownload}
                    disabled={saving}
                    className={`
                      flex-1 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2
                      bg-gradient-to-r from-purple-500 to-pink-500 text-white
                      hover:shadow-lg hover:shadow-purple-500/30 transition-all
                      ${saving ? 'opacity-70 cursor-not-allowed' : ''}
                    `}
                  >
                    {saving ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <FaDownload />
                        Save to Phone
                      </>
                    )}
                  </button>
                ) : (
                  // Image: Save to gallery
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`
                      flex-1 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2
                      bg-gradient-to-r from-green-500 to-emerald-500 text-white
                      hover:shadow-lg hover:shadow-green-500/30 transition-all
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
                        <FaSave />
                        Save to Gallery
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Tip for video on mobile */}
              {generatedType === 'video' && (
                <p className="mt-3 text-center text-white/30 text-xs">
                  Tip: You can also long-press the video above to save
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Reference Image Preview */}
              <div className="p-4 border-b border-white/10">
                <p className="text-white/40 text-xs mb-2 uppercase tracking-wide">Reference Image</p>
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-white/5">
                  <img 
                    src={referenceImageUrl} 
                    alt="Reference" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Prompt Input */}
                <div className="mb-4">
                  <label className="block text-white/60 text-sm mb-2">
                    {mode === 'video' ? 'What should happen in the video?' : 'Describe the image you want'}
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={mode === 'video' 
                      ? "e.g., She turns and smiles at the camera, wind blowing through her hair..."
                      : "e.g., Same person in a elegant red dress at a sunset beach..."
                    }
                    className="w-full h-32 p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 resize-none"
                    disabled={loading}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Progress Message */}
                {progress && (
                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <p className="text-blue-400 text-sm flex items-center gap-2">
                      <FaSpinner className="animate-spin" />
                      {progress}
                    </p>
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  className={`
                    w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2
                    transition-all duration-200
                    ${loading || !prompt.trim()
                      ? 'bg-white/10 text-white/30 cursor-not-allowed'
                      : mode === 'video'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30'
                        : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg hover:shadow-pink-500/30'
                    }
                  `}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaMagic />
                      Generate {mode === 'video' ? 'Video' : 'Image'}
                    </>
                  )}
                </button>

                {/* Info */}
                <p className="mt-3 text-center text-white/30 text-xs">
                  {mode === 'video' 
                    ? 'Video generation may take 2-5 minutes'
                    : 'Image generation takes about 30 seconds'
                  }
                </p>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIGenerateModal;
