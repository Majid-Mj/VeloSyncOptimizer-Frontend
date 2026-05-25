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
      bg: 'bg-rose-50/15',
      badge: 'text-rose-600 bg-rose-50 border-rose-100/50',
      bar: 'bg-rose-500',
      status: 'Near Limit'
    };
    if (pct >= 50) return {
      border: 'border-amber-100',
      bg: 'bg-amber-50/15',
      badge: 'text-amber-600 bg-amber-50 border-amber-100/50',
      bar: 'bg-amber-500',
      status: 'Moderate'
    };
    return {
      border: 'border-emerald-100',
      bg: 'bg-emerald-50/15',
      badge: 'text-emerald-600 bg-emerald-50 border-emerald-100/50',
      bar: 'bg-emerald-500',
      status: 'Healthy Storage'
    };
  };

  const srcTheme = getMiniTheme(sourceCapacity);
  const dstTheme = getMiniTheme(destCapacity);

  return (
    <div className="flex flex-col md:flex-row items-center gap-3 w-full mb-3 flex-shrink-0">
      
      {/* Source Warehouse Info */}
      <div className={`flex-1 w-full border rounded-2xl py-2.5 px-4 transition-all bg-white/75 backdrop-blur-md shadow-3xs flex items-center justify-between gap-4 ${srcTheme.border} ${srcTheme.bg}`}>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-black text-slate-800 uppercase tracking-wider">Source: {sourceWh?.code || 'SRC'}</span>
            <span className={`text-[8px] font-bold px-1 py-0.2 rounded border uppercase tracking-wider ${srcTheme.badge}`}>
              {srcTheme.status}
            </span>
          </div>
          <p className="text-[9.5px] font-semibold text-slate-400 mt-0.5 truncate">
            {activeProductName} Available: <span className="font-extrabold text-slate-700">{sourceStockNow}</span> u
          </p>
        </div>
        
        {/* Compact Right Side Capacity progress */}
        <div className="w-28 shrink-0">
          <div className="flex justify-between text-[8px] font-bold text-slate-400 mb-0.5">
            <span>Utilization</span>
            <span>{sourceCapacity}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${srcTheme.bar}`} style={{ width: `${sourceCapacity}%` }}></div>
          </div>
        </div>
      </div>

      {/* Mini Transfer Arrow */}
      <div className="flex items-center justify-center shrink-0">
        <div className="w-6.5 h-6.5 rounded-lg bg-indigo-50 border border-indigo-150 text-indigo-500 flex items-center justify-center shadow-3xs">
          <svg className="w-3.5 h-3.5 stroke-current stroke-[2.5] fill-none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>

      {/* Destination Warehouse Info */}
      <div className={`flex-1 w-full border rounded-2xl py-2.5 px-4 transition-all bg-white/75 backdrop-blur-md shadow-3xs flex items-center justify-between gap-4 ${dstTheme.border} ${dstTheme.bg}`}>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-black text-slate-800 uppercase tracking-wider">Destination: {destWh?.code || 'DST'}</span>
            <span className={`text-[8px] font-bold px-1 py-0.2 rounded border uppercase tracking-wider ${dstTheme.badge}`}>
              {dstTheme.status}
            </span>
          </div>
          <p className="text-[9.5px] font-semibold text-slate-400 mt-0.5 truncate">
            {activeProductName} Available: <span className="font-extrabold text-slate-700">{destStockNow}</span> u
          </p>
        </div>

        {/* Compact Right Side Capacity progress */}
        <div className="w-28 shrink-0">
          <div className="flex justify-between text-[8px] font-bold text-slate-400 mb-0.5">
            <span>Utilization</span>
            <span>{destCapacity}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${dstTheme.bar}`} style={{ width: `${destCapacity}%` }}></div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default WarehouseComparison;
