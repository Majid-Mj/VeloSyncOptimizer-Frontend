import React from 'react';

const ReOrderStats = ({ suggestions, criticalCount, mediumCount, lowCount, fastMoversCount }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5 flex-shrink-0">
      
      {/* KPI 1: Critical SKUs */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4.5 border border-slate-100/90 shadow-3xs flex items-center justify-between group hover:scale-[1.01] transition-all duration-300 hover:shadow-2xs">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Critical Depletion</p>
          <h3 className="text-xl font-black text-slate-800 mt-2.5 tracking-tight">
            {criticalCount} {criticalCount === 1 ? 'Product' : 'Products'}
          </h3>
          <span className={`text-[9px] font-black px-2 py-0.5 rounded mt-2.5 inline-block uppercase tracking-wider ${
            criticalCount > 0
              ? 'text-rose-600 bg-rose-50 border border-rose-100/50'
              : 'text-emerald-600 bg-emerald-50 border border-emerald-100/50'
          }`}>
            {criticalCount > 0 ? 'Immediate Replenish' : 'Buffers Secure'}
          </span>
        </div>
        <div className={`w-9.5 h-9.5 rounded-xl border flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0 ${
          criticalCount > 0
            ? 'bg-rose-50 border-rose-100/60 text-rose-500'
            : 'bg-emerald-50 border-emerald-100/60 text-emerald-500'
        }`}>
          <svg className="w-5 h-5 stroke-current stroke-[2.2]" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>

      {/* KPI 2: Medium Risk Buffers */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4.5 border border-slate-100/90 shadow-3xs flex items-center justify-between group hover:scale-[1.01] transition-all duration-300 hover:shadow-2xs">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Medium Alert</p>
          <h3 className="text-xl font-black text-slate-800 mt-2.5 tracking-tight">{mediumCount} SKUs</h3>
          <span className="text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-100/50 px-2 py-0.5 rounded mt-2.5 inline-block uppercase tracking-wider">
            Reorder point crossed
          </span>
        </div>
        <div className="w-9.5 h-9.5 rounded-xl bg-amber-50 border border-amber-100/60 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-300 shrink-0">
          <svg className="w-5 h-5 stroke-current stroke-[2.2]" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {/* KPI 3: Total Suggested Quantity */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4.5 border border-slate-100/90 shadow-3xs flex items-center justify-between group hover:scale-[1.01] transition-all duration-300 hover:shadow-2xs">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Suggestions</p>
          <h3 className="text-xl font-black text-slate-800 mt-2.5 tracking-tight">{suggestions.length} Lines</h3>
          <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded mt-2.5 inline-block uppercase tracking-wider">
            Procurement Pipeline
          </span>
        </div>
        <div className="w-9.5 h-9.5 rounded-xl bg-indigo-50 border border-indigo-100/60 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform duration-300 shrink-0">
          <svg className="w-5 h-5 stroke-current stroke-[2.2]" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
      </div>

      {/* KPI 4: High Velocity SKUs */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4.5 border border-slate-100/90 shadow-3xs flex items-center justify-between group hover:scale-[1.01] transition-all duration-300 hover:shadow-2xs">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Fast Movers</p>
          <h3 className="text-xl font-black text-slate-800 mt-2.5 tracking-tight">{fastMoversCount} Products</h3>
          <span className="text-[9px] font-black text-cyan-600 bg-cyan-50 border border-cyan-100/50 px-2 py-0.5 rounded mt-2.5 inline-block uppercase tracking-wider">
            High Turnover Flow
          </span>
        </div>
        <div className="w-9.5 h-9.5 rounded-xl bg-cyan-50 border border-cyan-100/60 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform duration-300 shrink-0">
          <svg className="w-5 h-5 stroke-current stroke-[2.2]" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>

    </div>
  );
};

export default ReOrderStats;
