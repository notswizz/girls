import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';

const COIN_EMOJIS = ['💎', '✨', '🌟', '💫', '⭐', '🔥', '💖'];

// Floating coin component
const FloatingCoin = ({ delay, emoji }) => (
  <motion.div
    className="absolute text-2xl pointer-events-none"
    initial={{ 
      y: 100, 
      x: Math.random() * 200 - 100,
      opacity: 0,
      scale: 0
    }}
    animate={{ 
      y: -150,
      opacity: [0, 1, 1, 0],
      scale: [0, 1.2, 1, 0.8],
      rotate: [0, 10, -10, 0]
    }}
    transition={{ 
      duration: 2,
      delay,
      ease: "easeOut"
    }}
  >
    {emoji}
  </motion.div>
);

// Counter animation component
const AnimatedCounter = ({ value, duration = 1.5 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    if (value === 0) return;
    
    const startTime = Date.now();
    const startValue = 0;
    
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      
      // Easing function for smooth count-up
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (value - startValue) * eased);
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration]);
  
  return <span>{displayValue}</span>;
};

export default function ClaimPointsModal({ isOpen, onClose, unclaimedPoints, onClaim }) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState(0);
  const [newBalance, setNewBalance] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setClaimed(false);
      setIsClaiming(false);
    }
  }, [isOpen]);

  const handleClaim = async () => {
    if (isClaiming || unclaimedPoints === 0) return;
    
    setIsClaiming(true);
    
    try {
      const response = await fetch('/api/user/claim-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setClaimedAmount(data.claimed);
        setNewBalance(data.newTokenBalance);
        setClaimed(true);
        
        // Fire confetti!
        const duration = 2000;
        const end = Date.now() + duration;
        
        const frame = () => {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors: ['#ff6b9d', '#c44ce1', '#7b5cff', '#00d4ff']
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors: ['#ff6b9d', '#c44ce1', '#7b5cff', '#00d4ff']
          });
          
          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
        
        // Play success sound
        try {
          const audio = new Audio('/win.wav');
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch (e) {}
        
        // Notify parent
        if (onClaim) {
          onClaim(data.claimed, data.newTokenBalance);
        }
      }
    } catch (error) {
      console.error('Failed to claim:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  if (!mounted) return null;
  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-3xl blur-lg opacity-50 animate-pulse" />
            
            {/* Card */}
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-6 border border-white/10 overflow-hidden">
              {/* Sparkle background */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      delay: Math.random() * 2,
                      repeat: Infinity,
                    }}
                  />
                ))}
              </div>
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <span className="text-white/60 text-lg">×</span>
              </button>

              {!claimed ? (
                /* Pre-claim state */
                <div className="text-center relative z-10">
                  {/* Icon */}
                  <motion.div
                    animate={{ 
                      y: [0, -8, 0],
                      rotate: [-5, 5, -5]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-6xl mb-4"
                  >
                    🎁
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Points Ready!
                  </h2>
                  
                  <p className="text-white/60 mb-6">
                    You have points waiting to be claimed
                  </p>
                  
                  {/* Points display */}
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="relative mb-6"
                  >
                    <div className="text-6xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      +{unclaimedPoints}
                    </div>
                    <div className="text-white/50 text-sm mt-1">unclaimed points</div>
                    
                    {/* Floating coins animation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {[...Array(5)].map((_, i) => (
                        <FloatingCoin 
                          key={i} 
                          delay={i * 0.3} 
                          emoji={COIN_EMOJIS[i % COIN_EMOJIS.length]}
                        />
                      ))}
                    </div>
                  </motion.div>
                  
                  {/* Claim button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClaim}
                    disabled={isClaiming || unclaimedPoints === 0}
                    className="w-full py-4 px-8 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-2xl font-bold text-white text-lg shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isClaiming ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            ✨
                          </motion.span>
                          Claiming...
                        </>
                      ) : (
                        <>
                          <span>Claim Now</span>
                          <span className="text-xl">💎</span>
                        </>
                      )}
                    </span>
                    
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                    />
                  </motion.button>
                </div>
              ) : (
                /* Post-claim celebration state */
                <div className="text-center relative z-10">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 10, stiffness: 200 }}
                    className="text-7xl mb-4"
                  >
                    🎉
                  </motion.div>
                  
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-white mb-2"
                  >
                    Claimed!
                  </motion.h2>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2"
                  >
                    +<AnimatedCounter value={claimedAmount} />
                  </motion.div>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-white/60 mb-6"
                  >
                    points added to your wallet
                  </motion.p>
                  
                  {/* New balance */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white/5 rounded-2xl p-4 mb-6"
                  >
                    <div className="text-white/50 text-sm">New Balance</div>
                    <div className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                      <span>💎</span>
                      <AnimatedCounter value={newBalance} duration={1} />
                    </div>
                  </motion.div>
                  
                  {/* Continue button */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="w-full py-3 px-8 bg-white/10 hover:bg-white/20 rounded-xl font-medium text-white transition-colors"
                  >
                    Continue Rating ✨
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

