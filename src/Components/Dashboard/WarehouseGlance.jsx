import React, { useRef, useState, useEffect } from 'react';
import WarehouseCard from './WarehouseCard';

const DUMMY_WAREHOUSES = [
  { id: 'WH-KL-01', location: 'Kuala Lumpur', skus: 847, capacity: 82, color: 'amber' },
  { id: 'WH-PG-02', location: 'Penang', skus: 612, capacity: 45, color: 'green' },
  { id: 'WH-JB-03', location: 'Johor Bahru', skus: 934, capacity: 93, color: 'red' },
  { id: 'WH-KK-04', location: 'Kota Kinabalu', skus: 341, capacity: 31, color: 'green' },
  { id: 'WH-SB-05', location: 'Sabah', skus: 220, capacity: 58, color: 'green' }
];

const WarehouseGlance = () => {
  const scrollRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        const percentage = (scrollLeft / maxScroll) * 100;
        setScrollProgress(percentage);
      }
    }
  };

  const checkScrollable = () => {
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current;
      setIsScrollable(scrollWidth > clientWidth);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 220 : scrollLeft + 220;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
      
      // Perform checks
      checkScrollable();
      const timer = setTimeout(checkScrollable, 150);

      window.addEventListener('resize', checkScrollable);

      return () => {
        el.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', checkScrollable);
        clearTimeout(timer);
      };
    }
  }, []);

  const thumbWidthPercent = 40; // Simulated scrollbar thumb width
  const thumbLeft = (scrollProgress * (100 - thumbWidthPercent)) / 100;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col mt-4 overflow-hidden">
      {/* Header with edge-to-edge border */}
      <div className="px-5 py-3.5 border-b border-gray-100">
        <h3 className="text-[14px] font-black text-gray-800 tracking-tight leading-none">
          Warehouses at a glance
        </h3>
      </div>

      {/* Cards Scroll Container */}
      <div 
        ref={scrollRef}
        className={`flex items-center gap-3.5 overflow-x-auto px-5 pt-4 scrollbar-none ${isScrollable ? 'pb-4' : 'pb-5'}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {DUMMY_WAREHOUSES.map((wh) => (
          <WarehouseCard key={wh.id} {...wh} />
        ))}
      </div>

      {/* Custom Premium Scrollbar Controls (only rendered if needed) */}
      {isScrollable && (
        <div className="flex items-center gap-3 px-5 pb-4 shrink-0 select-none">
          {/* Left Arrow Button */}
          <button 
            onClick={() => scroll('left')}
            className="text-[#9ca3af] hover:text-[#6b7280] active:scale-95 transition-all text-xs bg-transparent border-none cursor-pointer flex items-center justify-center p-1 leading-none"
          >
            ◀
          </button>

          {/* Scroll Track & Dynamic Thumb */}
          <div className="flex-1 h-1 bg-[#f3f4f6] rounded-full relative overflow-hidden">
            <div 
              className="absolute h-full bg-[#8e939d] rounded-full transition-all duration-75"
              style={{ 
                width: `${thumbWidthPercent}%`, 
                left: `${thumbLeft}%` 
              }}
            ></div>
          </div>

          {/* Right Arrow Button */}
          <button 
            onClick={() => scroll('right')}
            className="text-[#9ca3af] hover:text-[#6b7280] active:scale-95 transition-all text-xs bg-transparent border-none cursor-pointer flex items-center justify-center p-1 leading-none"
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default WarehouseGlance;
