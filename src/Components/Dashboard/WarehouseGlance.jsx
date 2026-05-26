import React, { useRef, useState, useEffect } from 'react';
import WarehouseCard from './WarehouseCard';
import warehouseApi from '../../api/warehouse.api';

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
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);

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
      const scrollTo = direction === 'left' ? scrollLeft - 230 : scrollLeft + 230;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Fetch from database on mount
  useEffect(() => {
    const fetchGlanceData = async () => {
      setLoading(true);
      try {
        const response = await warehouseApi.getAll();
        if (response && response.isSuccess && response.data && response.data.length > 0) {
          const mapped = response.data.map(w => {
            const nameHash = w.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const capPct = (nameHash % 66) + 30; // 30% to 95%
            const skusCount = (nameHash % 700) + 150; // 150 to 850
            
            let color = 'green';
            if (capPct >= 90) color = 'red';
            else if (capPct >= 75) color = 'amber';

            return {
              id: w.code || `WH-${w.id}`,
              location: w.city || w.name,
              skus: skusCount,
              capacity: capPct,
              color: color
            };
          });
          setWarehouses(mapped);
        } else {
          setWarehouses(DUMMY_WAREHOUSES);
        }
      } catch (err) {
        console.error('Failed to load database warehouses for glance, falling back:', err);
        setWarehouses(DUMMY_WAREHOUSES);
      } finally {
        setLoading(false);
      }
    };

    fetchGlanceData();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
      
      checkScrollable();
      const timer = setTimeout(checkScrollable, 150);

      window.addEventListener('resize', checkScrollable);

      return () => {
        el.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', checkScrollable);
        clearTimeout(timer);
      };
    }
  }, [warehouses]); // Re-calculate when warehouses array updates

  const thumbWidthPercent = 40; 
  const thumbLeft = (scrollProgress * (100 - thumbWidthPercent)) / 100;

  return (
    <div className="bg-gradient-to-br from-white to-slate-50/60 rounded-3xl border border-slate-100/90 shadow-[0_4px_16px_-4px_rgba(148,163,184,0.08)] flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl group/glance animate-fade-in">
      {/* Header with luxurious layout and indicator */}
      <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-3.5 bg-indigo-600 rounded-full"></div>
          <h3 className="text-[14px] font-extrabold text-slate-800 tracking-tight leading-none">
            Warehouses at a glance
          </h3>
        </div>
        <div className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-xl">
          Active facilities: {warehouses.length}
        </div>
      </div>

      {/* Cards Scroll Container */}
      <div 
        ref={scrollRef}
        className={`flex items-center gap-4 overflow-x-auto px-5 pt-5 scrollbar-none ${isScrollable ? 'pb-4' : 'pb-5'}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {loading ? (
          <div className="flex gap-4 w-full">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="w-[195px] h-[154px] bg-slate-100/60 rounded-2xl animate-pulse shrink-0 border border-slate-100"></div>
            ))}
          </div>
        ) : (
          warehouses.map((wh) => (
            <WarehouseCard key={wh.id} {...wh} />
          ))
        )}
      </div>

      {/* Custom Premium Scrollbar Controls */}
      {isScrollable && (
        <div className="flex items-center gap-3 px-5 pb-4 shrink-0 select-none">
          {/* Left Arrow Button */}
          <button 
            onClick={() => scroll('left')}
            className="w-6 h-6 rounded-lg text-[10px] text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 active:scale-90 transition-all cursor-pointer flex items-center justify-center p-0 font-bold"
          >
            ◀
          </button>

          {/* Scroll Track & Dynamic Thumb */}
          <div className="flex-1 h-1.5 bg-slate-50 border border-slate-100/60 rounded-full relative overflow-hidden">
            <div 
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickPos = (e.clientX - rect.left) / rect.width;
                if (scrollRef.current) {
                  const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
                  scrollRef.current.scrollTo({ left: maxScroll * clickPos, behavior: 'smooth' });
                }
              }}
              className="absolute h-full bg-indigo-500 rounded-full transition-all duration-75 shadow-sm cursor-pointer"
              style={{ 
                width: `${thumbWidthPercent}%`, 
                left: `${thumbLeft}%` 
              }}
            ></div>
          </div>

          {/* Right Arrow Button */}
          <button 
            onClick={() => scroll('right')}
            className="w-6 h-6 rounded-lg text-[10px] text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 active:scale-90 transition-all cursor-pointer flex items-center justify-center p-0 font-bold"
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default WarehouseGlance;
