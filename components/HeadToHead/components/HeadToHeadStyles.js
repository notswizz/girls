import React from 'react';

/**
 * Component containing the CSS styles for the HeadToHead component
 */
const HeadToHeadStyles = () => (
  <style jsx global>{`
    .celebration-glow {
      box-shadow: 0 0 15px 5px rgba(255, 0, 160, 0.5), 0 0 30px 15px rgba(76, 201, 240, 0.3);
      animation: pulse-glow 1s infinite alternate;
    }
    
    @keyframes pulse-glow {
      from {
        box-shadow: 0 0 15px 5px rgba(255, 0, 160, 0.5), 0 0 30px 15px rgba(76, 201, 240, 0.3);
      }
      to {
        box-shadow: 0 0 25px 10px rgba(255, 0, 160, 0.6), 0 0 50px 25px rgba(76, 201, 240, 0.4);
      }
    }
    
    @keyframes float-outward {
      0% {
        transform: scale(0.5) translate(0, 0);
        opacity: 0.8;
      }
      100% {
        transform: scale(2) translate(var(--x, 50px), var(--y, 50px));
        opacity: 0;
      }
    }
    
    .animate-float-outward {
      --x: ${Math.random() * 100 - 50}px;
      --y: ${Math.random() * 100 - 50}px;
      animation: float-outward 1.5s ease-out forwards;
    }
  `}</style>
);

export default HeadToHeadStyles;
