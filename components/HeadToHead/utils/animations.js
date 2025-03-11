import confetti from 'canvas-confetti';

/**
 * Fire confetti and celebration effects
 */
export const fireCelebrationEffects = () => {
  // Multiple confetti bursts
  const duration = 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
  
  const randomInRange = (min, max) => Math.random() * (max - min) + min;
  
  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    
    const particleCount = 50 * (timeLeft / duration);
    
    // Left side confetti
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: randomInRange(0.3, 0.7) },
      colors: ['#FF00A0', '#9b30ff', '#4CC9F0']
    });
    
    // Right side confetti
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: randomInRange(0.3, 0.7) },
      colors: ['#F038FF', '#6EE7B7', '#3CFFE6']
    });
    
    // Top center explosion
    confetti({
      ...defaults,
      particleCount: particleCount * 0.5,
      origin: { x: 0.5, y: 0.2 },
      gravity: 1.2,
      scalar: 1.2
    });
  }, 150);
};
