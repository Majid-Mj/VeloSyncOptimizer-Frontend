import React from 'react';

const ReOrderStats = ({ suggestions, criticalCount, mediumCount, lowCount, fastMoversCount }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
      
      {/* KPI 1: Critical SKUs */}
      <div className="bg-gradient-to-br from-white/90 to-[#fcfdff]/90 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-[0_4px_20px_-4px_rgba(148,163,184,0.08)] flex items-center justify-between group hover:translate-y-[-2px] transition-all duration-300 hover:shadow-[0_8px_24px_-4px_rgba(112,78,254,0.12)]">
        <div className="min-w-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Critical Depletion</p>
          <h3 className="text-lg font-black text-slate-800 mt-2 tracking-tight truncate">
            {criticalCount} {criticalCount === 1 ? 'Product' : 'Products'}
          </h3>
          <span className={`text-[8.5px] font-black px-2 py-0.5 rounded-lg mt-2 inline-block uppercase tracking-wider border ${
            criticalCount > 0
              ? 'text-rose-600 bg-rose-50/70 border-rose-100'
              : 'text-emerald-600 bg-emerald-50/70 border-emerald-100'
          }`}>
            {criticalCount > 0 ? 'Immediate Replenish' : 'Buffers Secure'}
          </span>
        </div>
        <div className={`w-9.5 h-9.5 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-all duration-350 shrink-0 shadow-sm ${
          criticalCount > 0
            ? 'bg-rose-50/80 border-rose-100 text-rose-500 shadow-rose-100/30'
            : 'bg-emerald-50/80 border-emerald-100 text-emerald-500 shadow-emerald-100/30'
        }`}>
          <svg className="w-5 h-5 stroke-current stroke-[2.2]" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>

      {/* KPI 2: Medium Risk Buffers */}
      <div className="bg-gradient-to-br from-white/90 to-[#fcfdff]/90 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-[0_4px_20px_-4px_rgba(148,163,184,0.08)] flex items-center justify-between group hover:translate-y-[-2px] transition-all duration-300 hover:shadow-[0_8px_24px_-4px_rgba(245,158,11,0.12)]">
        <div className="min-w-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Medium Alert</p>
          <h3 className="text-lg font-black text-slate-800 mt-2 tracking-tight truncate">{mediumCount} SKUs</h3>
          <span className="text-[8.5px] font-black text-amber-600 bg-amber-50/70 border border-amber-100 px-2 py-0.5 rounded-lg mt-2 inline-block uppercase tracking-wider">
            Reorder point crossed
          </span>
        </div>
        <div className="w-9.5 h-9.5 rounded-xl bg-amber-50/80 border border-amber-100 flex items-center justify-center text-amber-500 shadow-sm shadow-amber-100/30 group-hover:scale-105 transition-all duration-350 shrink-0">
          <svg className="w-5 h-5 stroke-current stroke-[2.2]" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {/* KPI 3: Total Suggestions */}
      <div className="bg-gradient-to-br from-white/90 to-[#fcfdff]/90 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-[0_4px_20px_-4px_rgba(148,163,184,0.08)] flex items-center justify-between group hover:translate-y-[-2px] transition-all duration-300 hover:shadow-[0_8px_24px_-4px_rgba(112,78,254,0.15)]">
        <div className="min-w-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Suggestions</p>
          <h3 className="text-lg font-black text-slate-800 mt-2 tracking-tight truncate">{suggestions.length} Lines</h3>
          <span className="text-[8.5px] font-black text-[#704efe] bg-[#f0ebff]/70 border border-indigo-100 px-2 py-0.5 rounded-lg mt-2 inline-block uppercase tracking-wider">
            Procurement Pipeline
          </span>
        </div>
        <div className="w-9.5 h-9.5 rounded-xl bg-[#f0ebff]/80 border border-indigo-100 flex items-center justify-center text-[#704efe] shadow-sm shadow-indigo-100/40 group-hover:scale-105 transition-all duration-350 shrink-0">
          <svg className="w-5 h-5 stroke-current stroke-[2.2]" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
      </div>

      {/* KPI 4: High Velocity SKUs */}
      <div className="bg-gradient-to-br from-white/90 to-[#fcfdff]/90 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-[0_4px_20px_-4px_rgba(148,163,184,0.08)] flex items-center justify-between group hover:translate-y-[-2px] transition-all duration-300 hover:shadow-[0_8px_24px_-4px_rgba(6,182,212,0.12)]">
        <div className="min-w-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Fast Movers</p>
          <h3 className="text-lg font-black text-slate-800 mt-2 tracking-tight truncate">{fastMoversCount} Products</h3>
          <span className="text-[8.5px] font-black text-cyan-600 bg-cyan-50/70 border border-cyan-100 px-2 py-0.5 rounded-lg mt-2 inline-block uppercase tracking-wider">
            High Turnover Flow
          </span>
        </div>
        <div className="w-9.5 h-9.5 rounded-xl bg-cyan-50/80 border border-cyan-100 flex items-center justify-center text-cyan-500 shadow-sm shadow-cyan-100/30 group-hover:scale-105 transition-all duration-350 shrink-0">
          <svg className="w-5 h-5 stroke-current stroke-[2.2]" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>

    </div>
  );
};

export default ReOrderStats;
