import React from 'react';

const WarehouseToolbar = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy
}) => {
  return (
    <div className="premium-card bg-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">

      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-405 pointer-events-none">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter facilities by code, location, manager..."
          className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-[#eff1f5] rounded-2xl text-[12.5px] focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none text-slate-700 placeholder:text-slate-400 font-semibold transition-all shadow-3xs"
        />
      </div>

      {/* Filter Pills & Sorting Dropdown */}
      <div className="flex flex-wrap items-center gap-4.5">

        {/* Toggle Pill Group */}
        <div className="flex items-center bg-slate-50 border border-[#eff1f5] rounded-2xl p-1 shadow-3xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 text-[10.5px] font-black uppercase tracking-wider rounded-xl border-none cursor-pointer transition-all ${statusFilter === 'ALL'
              ? 'bg-[#202231] text-white shadow-sm'
              : 'bg-transparent text-[#8a8b9d] hover:text-[#11121d]'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('HIGH_CAPACITY')}
            className={`px-4 py-2 text-[10.5px] font-black uppercase tracking-wider rounded-xl border-none cursor-pointer transition-all ${statusFilter === 'HIGH_CAPACITY'
              ? 'bg-[#202231] text-white shadow-sm'
              : 'bg-transparent text-[#8a8b9d] hover:text-rose-500'
              }`}
          >
            High Cap (&gt;80%)
          </button>
          <button
            onClick={() => setStatusFilter('FULL')}
            className={`px-4 py-2 text-[10.5px] font-black uppercase tracking-wider rounded-xl border-none cursor-pointer transition-all ${statusFilter === 'FULL'
              ? 'bg-[#202231] text-white shadow-sm'
              : 'bg-transparent text-[#8a8b9d] hover:text-[#11121d]'
              }`}
          >
            Near limit
          </button>
        </div>

        {/* Sort Selection */}
        <div className="relative flex items-center gap-2">
          <span className="text-[10px] font-black text-[#8a8b9d] uppercase tracking-wider">Sort By:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-[#eff1f5] text-slate-650 text-[11px] font-black uppercase tracking-wider py-2 pl-4 pr-10 rounded-2xl outline-none focus:border-indigo-500 cursor-pointer transition-all shadow-3xs"
            >
              <option value="CODE">Facility Code</option>
              <option value="CAPACITY_DESC">Capacity Peak</option>
              <option value="SKUS_DESC">SKU Volume</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WarehouseToolbar;
