import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaVideo, FaTimes, FaSpinner, FaTrash, FaDownload, FaCheck, FaBrain } from 'react-icons/fa';
import { useAIGeneration } from '../context/AIGenerationContext';

// Awesome AI Loading Animation Component
function AILoadingAnimation({ generationType, progress }) {
  const [activeNodes, setActiveNodes] = useState([]);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  
  const phrases = useMemo(() => [
    "Analyzing reference frame...",
    "Mapping motion vectors...",
    "Synthesizing temporal coherence...",
    "Rendering neural frames...",
    "Applying diffusion magic...",
    "Weaving pixels together...",
  ], []);

  // Cycle through phrases
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase(prev => (prev + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [phrases.length]);

  // Animate neural network nodes
  useEffect(() => {
    const interval = setInterval(() => {
      const newActive = Array.from({ length: 3 }, () => Math.floor(Math.random() * 12));
      setActiveNodes(newActive);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Generate neural network nodes positions
  const nodes = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 70;
      positions.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        delay: i * 0.1,
      });
    }
    return positions;
  }, []);

  // Generate connections between nodes
  const connections = useMemo(() => {
    const conns = [];
    for (let i = 0; i < 12; i++) {
      for (let j = i + 1; j < 12; j++) {
        if (Math.random() > 0.6) {
          conns.push({ from: i, to: j });
        }
      }
    }
    return conns;
  }, []);

  return (
    <div className="py-8 text-center relative overflow-hidden">
      {/* Ambient glow background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 -translate-x-1/2 -translate-y-1/2"
          animate={{
            background: [
              'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)',
            ],
            scale: [1, 1.2, 1, 1.1, 1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `hsl(${280 + Math.random() * 60}, 100%, 70%)`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Neural network visualization */}
      <div className="relative mx-auto w-48 h-48 mb-6">
        <svg className="absolute inset-0 w-full h-full" viewBox="-100 -100 200 200">
          {/* Connections */}
          {connections.map((conn, idx) => (
            <motion.line
              key={idx}
              x1={nodes[conn.from].x}
              y1={nodes[conn.from].y}
              x2={nodes[conn.to].x}
              y2={nodes[conn.to].y}
              stroke="url(#connectionGradient)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: 1, 
                opacity: activeNodes.includes(conn.from) || activeNodes.includes(conn.to) ? 0.8 : 0.2,
              }}
              transition={{ duration: 0.5 }}
            />
          ))}
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <radialGradient id="nodeGradient">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor="#a855f7" />
            </radialGradient>
          </defs>

          {/* Nodes */}
          {nodes.map((node, idx) => (
            <motion.circle
              key={idx}
              cx={node.x}
              cy={node.y}
              r={activeNodes.includes(idx) ? 6 : 4}
              fill={activeNodes.includes(idx) ? "#ec4899" : "#a855f7"}
              initial={{ scale: 0 }}
              animate={{ 
                scale: [1, activeNodes.includes(idx) ? 1.5 : 1, 1],
                opacity: activeNodes.includes(idx) ? 1 : 0.6,
              }}
              transition={{ 
                duration: 0.5,
                delay: node.delay,
              }}
            />
          ))}

          {/* Pulsing data packets */}
          {connections.slice(0, 5).map((conn, idx) => (
            <motion.circle
              key={`packet-${idx}`}
              r="3"
              fill="#fff"
              filter="drop-shadow(0 0 6px #a855f7)"
              initial={{ opacity: 0 }}
              animate={{
                cx: [nodes[conn.from].x, nodes[conn.to].x],
                cy: [nodes[conn.from].y, nodes[conn.to].y],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: idx * 0.7,
                ease: "easeInOut",
              }}
            />
          ))}
        </svg>

        {/* Center brain icon with glow */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full blur-xl"
              animate={{
                background: [
                  'rgba(168, 85, 247, 0.6)',
                  'rgba(236, 72, 153, 0.6)',
                  'rgba(168, 85, 247, 0.6)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 60, height: 60, transform: 'translate(-10px, -10px)' }}
            />
            <motion.div
              className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-2xl"
              animate={{ 
                rotateY: [0, 360],
                boxShadow: [
                  '0 0 30px rgba(168, 85, 247, 0.5)',
                  '0 0 50px rgba(236, 72, 153, 0.5)',
                  '0 0 30px rgba(168, 85, 247, 0.5)',
                ],
              }}
              transition={{ 
                rotateY: { duration: 8, repeat: Infinity, ease: "linear" },
                boxShadow: { duration: 2, repeat: Infinity },
              }}
            >
              <FaBrain className="text-white text-2xl" />
            </motion.div>
          </div>
        </motion.div>

        {/* Orbiting rings */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-purple-500/30"
          style={{ margin: '10%' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border border-pink-500/20"
          style={{ margin: '5%' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Animated progress text */}
      <div className="relative h-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhrase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 font-medium text-sm">
              {phrases[currentPhrase]}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="relative mt-4 mx-8">
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
            style={{ backgroundSize: '200% 100%' }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            initial={{ width: '0%' }}
            whileInView={{ width: '100%' }}
          />
        </div>
        <motion.div
          className="absolute top-0 left-0 h-1 bg-white/50 rounded-full"
          animate={{ 
            left: ['0%', '100%'],
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: '20%' }}
        />
      </div>

      {/* Timer display */}
      {progress && (
        <motion.p 
          className="text-white/40 text-xs mt-4 font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {progress}
        </motion.p>
      )}

      {/* Decorative corner elements */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-purple-500/30 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-pink-500/30 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-pink-500/30 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-purple-500/30 rounded-br-lg" />
    </div>
  );
}

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
      const filename = `ai-video-${Date.now()}.mp4`;
      
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
              <FaVideo className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">
                AI Video Generator
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
            <AILoadingAnimation generationType={generationType} progress={progress} />
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
                Generated Video
              </p>
              
              <video
                src={result}
                className="w-full rounded-xl shadow-lg border border-purple-500/30"
                controls
                autoPlay
                loop
                muted
                playsInline
              />

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {/* Save to Gallery */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`
                    w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2
                    bg-gradient-to-r from-purple-500 to-pink-500
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
                      <FaVideo />
                      Save Video to Creations
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
      className="fixed bottom-24 right-4 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white hover:scale-105 transition-all overflow-hidden group"
      style={{
        background: 'linear-gradient(135deg, rgba(30,20,40,0.95) 0%, rgba(40,20,50,0.95) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(168,85,247,0.3)',
      }}
    >
      {/* Animated border glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-75"
        animate={{
          boxShadow: [
            '0 0 20px rgba(168,85,247,0.4), inset 0 0 20px rgba(168,85,247,0.1)',
            '0 0 30px rgba(236,72,153,0.4), inset 0 0 30px rgba(236,72,153,0.1)',
            '0 0 20px rgba(168,85,247,0.4), inset 0 0 20px rgba(168,85,247,0.1)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Scanning line effect */}
      {isGenerating && (
        <motion.div
          className="absolute inset-0 overflow-hidden rounded-2xl"
          initial={false}
        >
          <motion.div
            className="absolute h-full w-1/3 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"
            animate={{ x: ['-100%', '400%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      )}

      {isGenerating ? (
        <>
          {/* Animated AI brain icon */}
          <div className="relative w-8 h-8">
            <motion.div
              className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <FaBrain className="text-white text-sm" />
            </motion.div>
            {/* Orbiting dot */}
            <motion.div
              className="absolute w-2 h-2 rounded-full bg-white shadow-lg shadow-white/50"
              animate={{
                rotate: 360,
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              style={{ 
                top: '50%',
                left: '50%',
                marginTop: -4,
                marginLeft: -4,
                transformOrigin: '4px 12px',
              }}
            />
          </div>
          <div className="relative flex flex-col items-start">
            <motion.span 
              className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Creating Video
            </motion.span>
            <span className="text-[10px] text-white/40">Tap to view progress</span>
          </div>
          {/* Pulsing dots */}
          <div className="flex gap-1 ml-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-purple-400"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </>
      ) : result ? (
        <>
          {/* Success state with sparkle effect */}
          <motion.div
            className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center"
            animate={{ 
              scale: [1, 1.1, 1],
              boxShadow: [
                '0 0 0 0 rgba(52,211,153,0.5)',
                '0 0 0 8px rgba(52,211,153,0)',
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <FaCheck className="text-white text-sm" />
          </motion.div>
          <div className="relative flex flex-col items-start">
            <span className="text-sm font-semibold text-emerald-300">
              Ready!
            </span>
            <span className="text-[10px] text-white/40">Tap to view result</span>
          </div>
          {/* Sparkle particles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-emerald-400"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
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
