import React from 'react';

const WarehouseStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
      
      {/* KPI 1: Active Facilities */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-100/90 shadow-3xs flex items-center justify-between group hover:scale-[1.01] transition-transform duration-300">
        <div>
          <p className="text-[10px] font-black text-slate-450 uppercase tracking-widest leading-none">Active Facilities</p>
          <h3 className="text-lg font-black text-slate-800 mt-2 tracking-tight">
            {stats.total} {stats.total === 1 ? 'Warehouse' : 'Warehouses'}
          </h3>
          <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded mt-2.5 inline-block uppercase tracking-wider">
            100% Operational
          </span>
        </div>
        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/60 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform duration-300 shrink-0">
          <svg className="w-5 h-5 stroke-current stroke-[2.2]" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21V9M14 21V3M9 21V9M4 21V12" />
          </svg>
        </div>
      </div>

      {/* KPI 2: Capacity Utilized */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-100/90 shadow-3xs flex items-center justify-between group hover:scale-[1.01] transition-transform duration-300">
        <div>
          <p className="text-[10px] font-black text-slate-455 uppercase tracking-widest leading-none">Avg Capacity Used</p>
          <h3 className="text-lg font-black text-slate-800 mt-2 tracking-tight">{stats.avgCapacity}%</h3>
          
          <div className="w-28 bg-slate-100 h-1.5 rounded-full mt-3 relative overflow-hidden">
            <div 
              className={`absolute h-full rounded-full transition-all duration-500 ${
                stats.avgCapacity >= 80 
                  ? 'bg-rose-500' 
                  : stats.avgCapacity >= 65 
                    ? 'bg-amber-500' 
                    : 'bg-emerald-500'
              }`}
              style={{ width: `${stats.avgCapacity}%` }}
            ></div>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100/60 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300 shrink-0">
          <svg className="w-5 h-5 stroke-current stroke-[2.2]" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </div>
      </div>

      {/* KPI 3: Storage Items */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-100/90 shadow-3xs flex items-center justify-between group hover:scale-[1.01] transition-transform duration-300">
        <div>
          <p className="text-[10px] font-black text-slate-450 uppercase tracking-widest leading-none">Storage Volume</p>
          <h3 className="text-lg font-black text-slate-800 mt-2 tracking-tight">
            {stats.totalSkus.toLocaleString()} SKUs
          </h3>
          <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded mt-2.5 inline-block uppercase tracking-wider">
            Active Catalog
          </span>
        </div>
        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/60 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform duration-300 shrink-0">
          <svg className="w-5 h-5 stroke-current stroke-[2.2]" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
        </div>
      </div>

      {/* KPI 4: Warning Count */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-100/90 shadow-3xs flex items-center justify-between group hover:scale-[1.01] transition-transform duration-300">
        <div>
          <p className="text-[10px] font-black text-slate-450 uppercase tracking-widest leading-none">Critical Thresholds</p>
          <h3 className="text-lg font-black text-slate-800 mt-2 tracking-tight">
            {stats.criticalCount} {stats.criticalCount === 1 ? 'Facility' : 'Facilities'}
          </h3>
          <span className={`text-[9px] font-black px-2 py-0.5 rounded mt-2.5 inline-block uppercase tracking-wider border ${
            stats.criticalCount > 0 
              ? 'text-rose-600 bg-rose-50 border-rose-100/80' 
              : 'text-slate-500 bg-slate-50 border-slate-150'
          }`}>
            {stats.criticalCount > 0 ? '⚠️ High Utilization' : '✓ Load Balance Safe'}
          </span>
        </div>
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0 ${
          stats.criticalCount > 0 
            ? 'bg-rose-50 border-rose-100/60 text-rose-500' 
            : 'bg-slate-50 border-slate-150 text-slate-400'
        }`}>
          <svg className="w-5 h-5 stroke-current stroke-[2.2]" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>

    </div>
  );
};

export default WarehouseStats;
