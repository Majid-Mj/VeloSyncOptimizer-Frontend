import React from 'react';

const WarehouseCard = ({ id, location, skus, capacity, color = 'blue' }) => {
  // Shaded parameters matching the capacity color
  const styleConfig = {
    blue: {
      cardBg: 'bg-gradient-to-br from-white to-indigo-50/20 hover:to-indigo-50/50',
      accent: 'text-indigo-600',
      track: '#E2E8F0',
      fill: '#4F46E5',
      status: 'bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]',
      border: 'border-slate-100 hover:border-indigo-200',
      label: 'Optimal Utilization'
    },
    green: {
      cardBg: 'bg-gradient-to-br from-white to-emerald-50/25 hover:to-emerald-50/50',
      accent: 'text-emerald-600',
      track: '#E2E8F0',
      fill: '#10B981',
      status: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
      border: 'border-slate-100 hover:border-emerald-200',
      label: 'Healthy Space'
    },
    red: {
      cardBg: 'bg-gradient-to-br from-white to-rose-50/20 hover:to-rose-50/50',
      accent: 'text-rose-600',
      track: '#FEE2E2',
      fill: '#EF4444',
      status: 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
      border: 'border-slate-100 hover:border-rose-300',
      label: 'Critical Overflow Risk'
    },
    amber: {
      cardBg: 'bg-gradient-to-br from-white to-amber-50/25 hover:to-amber-50/50',
      accent: 'text-amber-600',
      track: '#FEF3C7',
      fill: '#F59E0B',
      status: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
      border: 'border-slate-100 hover:border-amber-300',
      label: 'Near Capacity Warning'
    }
  };

  const currentStyle = styleConfig[color] || styleConfig.blue;

  // SVG Circle stroke computations
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (capacity / 100) * circumference;

  return (
    <div className={`rounded-3xl p-4 border shrink-0 flex flex-col gap-3.5 shadow-[0_4px_12px_-4px_rgba(148,163,184,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group cursor-pointer relative overflow-hidden ${currentStyle.cardBg} ${currentStyle.border}`}>
      
      {/* Visual background deck gloss */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-500/5 to-transparent rounded-full pointer-events-none" />

      {/* Header telemetry and connection indicator */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-[12.5px] font-black text-slate-800 tracking-tight leading-none">
            {id}
          </span>
        </div>
        
        {/* Sensor network indicator */}
        <span className="text-[9px] font-extrabold text-slate-400 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-lg">
          Telemetry Link
        </span>
      </div>

      {/* Main layout with values & beautiful radial SVG indicator */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">LOCATION</span>
          <h5 className="text-[13px] font-extrabold text-slate-700 truncate mt-0.5 leading-tight">{location}</h5>
          
          <div className="mt-2.5 flex flex-col gap-0.5">
            <span className="text-[10.5px] font-black text-slate-800 leading-none">{skus} SKUs</span>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide mt-1">Stocked Items</span>
          </div>
        </div>

        {/* Circular Progress Gauge */}
        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            {/* Background Track */}
            <circle
              cx="28"
              cy="28"
              r={radius}
              fill="transparent"
              stroke={currentStyle.track}
              strokeWidth="4.5"
            />
            {/* Filled Arc */}
            <circle
              cx="28"
              cy="28"
              r={radius}
              fill="transparent"
              stroke={currentStyle.fill}
              strokeWidth="4.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          {/* Center text count */}
          <div className="absolute text-[10.5px] font-black text-slate-800">
            {capacity}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseCard;
