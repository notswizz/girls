import { useCallback, useRef } from 'react';

// Sound files in /public/sounds/
const SOUNDS = {
  click: '/click.wav',
};

export function useSound() {
  const audioRef = useRef(null);

  const play = useCallback((soundName = 'click') => {
    try {
      // Create new audio instance for overlapping sounds
      const audio = new Audio(SOUNDS[soundName] || SOUNDS.click);
      audio.volume = 0.3; // Keep it subtle
      audio.play().catch(() => {}); // Ignore autoplay errors
    } catch (e) {
      // Silently fail if audio not supported
    }
  }, []);

  return { play };
}

// Simple click handler wrapper
export function playClick() {
  try {
    const audio = new Audio('/click.wav');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  } catch (e) {}
}

export default useSound;

