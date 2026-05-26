import React from 'react';

const ReOrderCriticalAlerts = ({ criticalSuggestions }) => {
  if (criticalSuggestions.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-rose-50/40 via-white/80 to-white/80 backdrop-blur-md border border-slate-100/90 rounded-2xl p-5 shadow-3xs relative overflow-hidden">
      {/* Dynamic Red left active line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500/80 animate-pulse"></div>

      <div className="flex items-center gap-2 mb-4 pl-1">
        <svg className="w-5 h-5 text-rose-500 animate-bounce shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-xs font-black uppercase text-rose-600 tracking-wider">
          Critical Runway Buffer warnings
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {criticalSuggestions.slice(0, 3).map((item) => (
          <div key={item.id} className="bg-slate-50/50 border border-slate-100/80 rounded-xl p-4 flex flex-col justify-between hover:border-rose-200/60 hover:bg-rose-50/10 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9.5px] font-black text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-100/40 tracking-wider uppercase">
                  Depleting runway
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400">{item.sku}</span>
              </div>
              <h4 className="text-[13px] font-black text-slate-800 mt-2.5 leading-tight">{item.name}</h4>
              <p className="text-[10.5px] text-slate-455 mt-2 font-medium italic leading-relaxed">
                "{item.Reason}"
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 mt-4 text-center">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide">Stock / Point</span>
                <span className="text-xs font-black text-rose-500 mt-0.5">{item.CurrentStock} <span className="text-[9px] text-slate-400 font-bold">/ {item.ReorderPoint}</span></span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide">Days Left</span>
                <span className="text-xs font-black text-red-500 mt-0.5 animate-pulse">{item.DaysLeft} Days</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide">Suggested</span>
                <span className="text-xs font-black text-slate-700 mt-0.5">+{item.SuggestedQty}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReOrderCriticalAlerts;
