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
    }
    return () => {
      if (el) el.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const thumbWidthPercent = 40; // Simulated scrollbar thumb width
  const thumbLeft = (scrollProgress * (100 - thumbWidthPercent)) / 100;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col mt-6">
      {/* Header */}
      <div className="pb-4 border-b border-gray-100 mb-5">
        <h3 className="text-[14.5px] font-black text-gray-800 tracking-tight leading-none">
          Warehouses at a glance
        </h3>
      </div>

      {/* Cards Scroll Container */}
      <div 
        ref={scrollRef}
        className="flex items-center gap-4 overflow-x-auto pb-5 scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {DUMMY_WAREHOUSES.map((wh) => (
          <WarehouseCard key={wh.id} {...wh} />
        ))}
      </div>

      {/* Custom Premium Scrollbar Controls */}
      <div className="flex items-center gap-3 justify-center mt-1 shrink-0">
        {/* Left Arrow Button */}
        <button 
          onClick={() => scroll('left')}
          className="text-gray-400 hover:text-gray-600 active:scale-95 transition-all text-[11px] bg-transparent border-none cursor-pointer p-1.5 flex items-center justify-center leading-none"
        >
          ◀
        </button>

        {/* Scroll Track & Dynamic Thumb */}
        <div className="relative w-full max-w-[600px] h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="absolute h-full bg-gray-400 rounded-full transition-all duration-75"
            style={{ 
              width: `${thumbWidthPercent}%`, 
              left: `${thumbLeft}%` 
            }}
          ></div>
        </div>

        {/* Right Arrow Button */}
        <button 
          onClick={() => scroll('right')}
          className="text-gray-400 hover:text-gray-600 active:scale-95 transition-all text-[11px] bg-transparent border-none cursor-pointer p-1.5 flex items-center justify-center leading-none"
        >
          ▶
        </button>
      </div>
    </div>
  );
};

export default WarehouseGlance;
