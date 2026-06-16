import React from 'react';

const WarehouseComparison = ({
  sourceWh,
  destWh,
  activeProductName,
  sourceStockNow,
  destStockNow,
  sourceCapacity,
  destCapacity,
  sourceTotalStock,
  sourceMaxCapacity,
  destTotalStock,
  destMaxCapacity
}) => {
  // Mini HSL style configurations
  const getMiniTheme = (pct) => {
    if (pct > 80) return {
      border: 'border-rose-100',
      bg: 'bg-rose-50/10',
      badge: 'text-rose-600 bg-rose-50 border-rose-100',
      bar: 'bg-rose-500',
      status: 'Near Limit'
    };
    if (pct >= 50) return {
      border: 'border-amber-100',
      bg: 'bg-amber-50/10',
      badge: 'text-amber-600 bg-amber-50 border-amber-100',
      bar: 'bg-amber-500',
      status: 'Moderate'
    };
    return {
      border: 'border-[#baf3e0]',
      bg: 'bg-[#e6fbf3]/30',
      badge: 'text-[#039855] bg-[#e6fbf3] border-[#baf3e0]',
      bar: 'bg-[#039855]',
      status: 'Healthy Storage'
    };
  };

  const srcTheme = getMiniTheme(sourceCapacity);
  const dstTheme = getMiniTheme(destCapacity);

  return (
    <div className="flex flex-col md:flex-row items-center gap-3 w-full mb-3 flex-shrink-0">
      
      {/* Source Warehouse Info */}
      <div className={`flex-1 w-full border rounded-3xl py-3.5 px-5 transition-all bg-white shadow-3xs flex items-center justify-between gap-4 ${srcTheme.border} ${srcTheme.bg}`}>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-black text-slate-805 uppercase tracking-wider">Source: {sourceWh?.code || 'SRC'}</span>
            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider ${srcTheme.badge}`}>
              {srcTheme.status}
            </span>
          </div>
          <p className="text-[9.5px] font-semibold text-slate-450 mt-1 truncate">
            {activeProductName} Available: <span className="font-black text-slate-700">{sourceStockNow}</span> u
          </p>
        </div>
        
        {/* Compact Right Side Capacity progress */}
        <div className="w-28 shrink-0">
          <div className="flex justify-between text-[8px] font-black text-slate-400 mb-1">
            <span>Utilization</span>
            <span>{sourceCapacity}%</span>
          </div>
          <div className="h-1.5 bg-slate-100/70 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${srcTheme.bar}`} style={{ width: `${sourceCapacity}%` }}></div>
          </div>
        </div>
      </div>

      {/* Mini Transfer Arrow */}
      <div className="flex items-center justify-center shrink-0">
        <div className="w-8 h-8 rounded-xl bg-[#f0ebff] border border-indigo-150 text-[#704efe] flex items-center justify-center shadow-3xs">
          <svg className="w-4 h-4 stroke-current stroke-[2.5] fill-none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>

      {/* Destination Warehouse Info */}
      <div className={`flex-1 w-full border rounded-3xl py-3.5 px-5 transition-all bg-white shadow-3xs flex items-center justify-between gap-4 ${dstTheme.border} ${dstTheme.bg}`}>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-black text-slate-805 uppercase tracking-wider">Destination: {destWh?.code || 'DST'}</span>
            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider ${dstTheme.badge}`}>
              {dstTheme.status}
            </span>
          </div>
          <p className="text-[9.5px] font-semibold text-slate-450 mt-1 truncate">
            {activeProductName} Available: <span className="font-black text-slate-700">{destStockNow}</span> u
          </p>
        </div>

        {/* Compact Right Side Capacity progress */}
        <div className="w-28 shrink-0">
          <div className="flex justify-between text-[8px] font-black text-slate-400 mb-1">
            <span>Utilization</span>
            <span>{destCapacity}%</span>
          </div>
          <div className="h-1.5 bg-slate-100/70 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${dstTheme.bar}`} style={{ width: `${destCapacity}%` }}></div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default WarehouseComparison;
