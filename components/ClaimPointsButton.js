import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import ClaimPointsModal from './ClaimPointsModal';

export default function ClaimPointsButton() {
  const { data: session, status } = useSession();
  const [unclaimedPoints, setUnclaimedPoints] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPulse, setShowPulse] = useState(false);

  // Fetch unclaimed points
  const fetchUnclaimedPoints = async () => {
    if (!session) return;
    
    try {
      const response = await fetch('/api/user/claim-points');
      const data = await response.json();
      
      if (data.success) {
        const newPoints = data.unclaimedPoints || 0;
        
        // Show pulse animation if points increased
        if (newPoints > unclaimedPoints && unclaimedPoints > 0) {
          setShowPulse(true);
          setTimeout(() => setShowPulse(false), 1000);
        }
        
        setUnclaimedPoints(newPoints);
      }
    } catch (error) {
      console.error('Failed to fetch unclaimed points:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (status === 'authenticated') {
      fetchUnclaimedPoints();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [status]);

  // Poll for updates every 30 seconds
  useEffect(() => {
    if (!session) return;
    
    const interval = setInterval(fetchUnclaimedPoints, 30000);
    return () => clearInterval(interval);
  }, [session]);

  // Also refresh after modal closes
  const handleClaim = (claimed, newBalance) => {
    setUnclaimedPoints(0);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    // Refresh points after closing
    setTimeout(fetchUnclaimedPoints, 500);
  };

  // Don't show if not logged in or no unclaimed points
  if (status !== 'authenticated' || isLoading) return null;
  if (unclaimedPoints === 0) return null;

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-lg opacity-60 animate-pulse" />
          
          {/* Button */}
          <div className="relative flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-full shadow-lg shadow-purple-500/30">
            {/* Gift icon with bounce */}
            <motion.span
              animate={{ 
                y: [0, -3, 0],
                rotate: [-5, 5, -5]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-xl"
            >
              🎁
            </motion.span>
            
            {/* Points count */}
            <span className="font-bold text-white text-sm">
              +{unclaimedPoints}
            </span>
            
            {/* Pulse ring when points increase */}
            {showPulse && (
              <motion.div
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 border-2 border-white rounded-full"
              />
            )}
          </div>
          
          {/* "Claim" label */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <span className="text-xs text-white/70 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
              Tap to claim!
            </span>
          </motion.div>
        </motion.button>
      </AnimatePresence>

      {/* Claim modal */}
      <ClaimPointsModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        unclaimedPoints={unclaimedPoints}
        onClaim={handleClaim}
      />
    </>
  );
}

