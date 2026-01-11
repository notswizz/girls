import "../styles/globals.css";
import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SessionProvider } from "next-auth/react";
import { AIGenerationProvider } from "../context/AIGenerationContext";
import GlobalAIModal, { AIGenerationIndicator } from "../components/GlobalAIModal";
import ReferralTracker from "../components/ReferralTracker";
import ClaimPointsButton from "../components/ClaimPointsButton";

// Global click sound - skip when win sound was just played
let lastWinSoundTime = 0;
export function markWinSound() {
  lastWinSoundTime = Date.now();
}

function useGlobalClickSound() {
  useEffect(() => {
    let audioPool = [];
    const poolSize = 5;
    
    // Pre-create audio pool for better performance
    for (let i = 0; i < poolSize; i++) {
      const audio = new Audio('/click.wav');
      audio.volume = 0.25;
      audioPool.push(audio);
    }
    
    let poolIndex = 0;
    
    const playClick = () => {
      try {
        const audio = audioPool[poolIndex];
        audio.currentTime = 0;
        audio.play().catch(() => {});
        poolIndex = (poolIndex + 1) % poolSize;
      } catch (e) {}
    };

    const handleClick = (e) => {
      // Skip if win sound was played in last 200ms
      if (Date.now() - lastWinSoundTime < 200) return;
      
      const target = e.target;
      // Skip if it's a rating card (has its own win sound)
      const isRatingCard = target.closest('[data-rating-card], .rating-card');
      if (isRatingCard) return;
      
      const interactive = target.closest('button, a, [role="button"], input[type="submit"], input[type="checkbox"], input[type="radio"], .cursor-pointer, [onclick]');
      if (interactive) {
        playClick();
      }
    };

    document.addEventListener('click', handleClick, false);
    return () => document.removeEventListener('click', handleClick, false);
  }, []);
}

export default function App({ Component, pageProps }) {
  useGlobalClickSound();
  
  return (
    <SessionProvider session={pageProps.session}>
      <AIGenerationProvider>
        <ReferralTracker />
        <Component {...pageProps} />
        <GlobalAIModal />
        <AIGenerationIndicator />
        <ClaimPointsButton />
        <Analytics />
      </AIGenerationProvider>
    </SessionProvider>
  );
}
