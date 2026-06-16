import React from 'react';

const ReOrderCriticalAlerts = ({ criticalSuggestions }) => {
  if (criticalSuggestions.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-rose-50/25 via-white/80 to-white/80 backdrop-blur-md border border-white/60 rounded-3xl p-4.5 shadow-[0_4px_24px_-4px_rgba(244,63,94,0.05)] relative overflow-hidden">
      {/* Dynamic Red left active line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500/80"></div>

      <div className="flex items-center gap-2 mb-3.5 pl-1.5">
        <span className="flex h-2 w-2 relative shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
        <h3 className="text-[10px] font-black uppercase text-rose-600 tracking-wider leading-none">
          Critical Runway Warnings
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {criticalSuggestions.slice(0, 3).map((item) => (
          <div key={item.id} className="bg-slate-50/40 border border-slate-100 hover:border-rose-200/60 hover:bg-rose-50/5/10 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 shadow-3xs">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[8.5px] font-black text-rose-600 bg-rose-50 border border-rose-100/50 px-2 py-0.5 rounded-lg tracking-wider uppercase">
                  Depleting
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400">{item.sku}</span>
              </div>
              <h4 className="text-[12.5px] font-black text-slate-800 mt-2.5 leading-tight truncate">{item.name}</h4>
              <p className="text-[10px] text-slate-450 mt-1.5 font-medium italic leading-relaxed truncate">
                "{item.Reason}"
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-slate-100/70 pt-3 mt-3.5 text-center">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide">Stock / Pt</span>
                <span className="text-[12px] font-black text-rose-500 mt-0.5">{item.CurrentStock} <span className="text-[9px] text-slate-400 font-bold">/ {item.ReorderPoint}</span></span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide">Runway</span>
                <span className="text-[12px] font-black text-red-500 mt-0.5">{item.DaysLeft} Days</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide">Refill</span>
                <span className="text-[12px] font-black text-slate-800 mt-0.5">+{item.SuggestedQty}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReOrderCriticalAlerts;
