import React from 'react';

const ReOrderHealthCore = ({ inventoryHealthPercent, suggestions, criticalSuggestions, mediumSuggestions }) => {
  return (
    <div className="bg-gradient-to-br from-white to-[#fcfdff]/90 backdrop-blur-md border border-white/60 rounded-3xl p-5 hover:shadow-[0_8px_24px_-4px_rgba(148,163,184,0.08)] transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(148,163,184,0.06)]">
      
      <div className="pb-3.5 border-b border-slate-100/80 mb-4">
        <span className="text-[9px] font-black text-[#704efe] uppercase tracking-widest block">System Integrity</span>
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mt-0.5">Stock Health Core</h3>
      </div>

      {/* Circular Gauge semi circle */}
      <div className="flex flex-col items-center py-3 relative">
        <div className="w-32 h-20 relative flex items-center justify-center">
          <svg className="w-32 h-32 absolute bottom-0 transform -rotate-180" viewBox="0 0 100 50">
            <path 
              d="M 10,50 A 40,40 0 0,1 90,50" 
              fill="none" 
              stroke="#f1f5f9" 
              strokeWidth="8" 
              strokeLinecap="round"
            />
            <path 
              d="M 10,50 A 40,40 0 0,1 90,50" 
              fill="none" 
              stroke="url(#healthGradient)" 
              strokeWidth="8" 
              strokeLinecap="round"
              strokeDasharray="126"
              strokeDashoffset={126 - (126 * inventoryHealthPercent) / 100}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          
          <div className="text-center absolute bottom-0">
            <span className="text-2.5xl font-black tracking-tighter text-slate-800">{inventoryHealthPercent}%</span>
            <span className="text-[8px] font-extrabold uppercase text-slate-400 tracking-wider block mt-0.5">HEALTH SCORE</span>
          </div>
        </div>

        {/* Health quality text descriptor */}
        <div className={`mt-5 px-3 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
          inventoryHealthPercent > 80 
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
            : inventoryHealthPercent > 50
            ? 'bg-amber-50 text-amber-600 border-amber-100'
            : 'bg-rose-50 text-rose-600 border-rose-100'
        }`}>
          {inventoryHealthPercent > 80 ? 'Optimal buffer secure' : inventoryHealthPercent > 50 ? 'Moderate buffer risks' : 'Critical warehouse depletion'}
        </div>
      </div>

      {/* Secondary progress bars */}
      <div className="flex flex-col gap-3 mt-4 border-t border-slate-100/80 pt-4">
        {/* Critical Risk Bar */}
        <div>
          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wide">
            <span>Critical Runway (&lt; 3D)</span>
            <span className="text-rose-600 font-black">{Math.round((criticalSuggestions.length / Math.max(1, suggestions.length)) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
            <div 
              className="h-full bg-rose-500 transition-all duration-700" 
              style={{ width: `${(criticalSuggestions.length / Math.max(1, suggestions.length)) * 100}%` }}
            />
          </div>
        </div>

        {/* Medium Risk Bar */}
        <div>
          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wide">
            <span>Medium Runway (&lt; 7D)</span>
            <span className="text-amber-600 font-black">{Math.round((mediumSuggestions.length / Math.max(1, suggestions.length)) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
            <div 
              className="h-full bg-amber-500 transition-all duration-700" 
              style={{ width: `${(mediumSuggestions.length / Math.max(1, suggestions.length)) * 100}%` }}
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default ReOrderHealthCore;
