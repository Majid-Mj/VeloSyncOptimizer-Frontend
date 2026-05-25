import React from 'react';

const ReOrderVelocityAnalytics = ({ suggestions }) => {
  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-100/90 rounded-2xl p-5 hover:shadow-2xs transition-all duration-300">
      
      <div className="pb-3.5 border-b border-slate-100 mb-4 flex items-center justify-between">
        <div>
          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block">Flow Rates</span>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mt-0.5">High Velocity Items</h3>
        </div>
        <span className="px-2 py-0.5 rounded bg-cyan-50 border border-cyan-100 text-cyan-600 text-[8.5px] font-black uppercase">
          Fast Movers
        </span>
      </div>

      {/* Daily flow rates with sparklines */}
      <div className="flex flex-col gap-3.5">
        {suggestions.slice(0, 3).map((item, idx) => {
          const strokeColor = idx === 0 ? '#f43f5e' : idx === 1 ? '#f59e0b' : '#6366f1';
          const strokeBg = idx === 0 ? 'text-rose-500 bg-rose-50' : idx === 1 ? 'text-amber-500 bg-amber-50' : 'text-indigo-500 bg-indigo-50';

          return (
            <div key={item.id} className="flex items-center justify-between gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100/60 hover:bg-slate-50 transition-all">
              <div className="min-w-0 flex-1">
                <span className="text-[12px] font-black text-slate-800 truncate block">{item.name}</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block mt-1">{item.sku}</span>
              </div>

              {/* Sparkline SVG */}
              <div className="w-16 h-8 shrink-0">
                <svg className="w-full h-full" viewBox="0 0 100 40">
                  <path 
                    d={`M 0,${30 - idx * 5} Q 25,${10 + idx * 8} 50,${25 - idx * 4} T 100,${5 + idx * 4}`} 
                    fill="none" 
                    stroke={strokeColor} 
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Volume metrics */}
              <div className="text-right shrink-0">
                <span className="text-xs font-black text-slate-800 block">
                  {item.AvgDailyVelocity.toFixed(1)} <span className="text-[9px] font-bold text-slate-400 font-sans uppercase">u/d</span>
                </span>
                <span className="text-[8.5px] font-black text-emerald-600 mt-1 uppercase block tracking-wider">
                  &uarr; {(24 - idx * 4)}% velocity
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default ReOrderVelocityAnalytics;
