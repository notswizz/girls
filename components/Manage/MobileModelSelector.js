import { useState, useEffect, useRef } from 'react';
import { FaPlus, FaChevronLeft, FaChevronRight, FaImages } from 'react-icons/fa';

export default function MobileModelSelector({ models, selectedModel, onSelectModel, onAddModel, isLoading }) {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkArrows = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkArrows();
    window.addEventListener('resize', checkArrows);
    return () => window.removeEventListener('resize', checkArrows);
  }, [models]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-24 h-16 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Left arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/80 backdrop-blur-sm rounded-full text-white/70 hover:text-white hidden sm:block"
        >
          <FaChevronLeft size={12} />
        </button>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        onScroll={checkArrows}
        className="flex gap-2 p-3 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Add new button */}
        <button
          onClick={onAddModel}
          className="flex-shrink-0 w-16 h-16 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center hover:border-pink-500/50 hover:bg-white/5 transition-all"
        >
          <FaPlus className="text-white/40" />
        </button>

        {/* Model cards */}
        {models.map((model) => (
          <button
            key={model._id}
            onClick={() => onSelectModel(model)}
            className={`
              flex-shrink-0 min-w-[100px] p-3 rounded-xl transition-all
              ${selectedModel?._id === model._id 
                ? 'bg-gradient-to-br from-pink-500/30 to-purple-600/30 border border-pink-500/50' 
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }
            `}
          >
            <div className="font-medium text-white text-sm truncate text-left">{model.name}</div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-white/40 text-xs">@{model.username}</span>
              <span className="text-white/50 text-xs flex items-center gap-1">
                <FaImages size={8} />
                {model.imageCount || 0}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Right arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/80 backdrop-blur-sm rounded-full text-white/70 hover:text-white hidden sm:block"
        >
          <FaChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

