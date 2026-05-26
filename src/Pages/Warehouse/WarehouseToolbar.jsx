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
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-3 border border-slate-150 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">

      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter facilities by code, location, manager..."
          className="w-full pl-9 pr-4 py-2 bg-slate-50/70 border border-slate-200/50 rounded-xl text-xs focus:ring-1 focus:ring-indigo-100 focus:border-indigo-500 focus:bg-white outline-none text-slate-655 placeholder:text-slate-400 font-bold transition-all shadow-3xs h-9"
        />
      </div>

      {/* Filter Pills & Sorting Dropdown */}
      <div className="flex flex-wrap items-center gap-3.5">

        {/* Toggle Pill Group */}
        <div className="flex items-center bg-slate-100/70 border border-slate-200/40 rounded-xl p-0.5 shadow-3xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border-none cursor-pointer transition-all ${statusFilter === 'ALL'
                ? 'bg-white text-indigo-700 shadow-3xs font-extrabold'
                : 'bg-transparent text-slate-400 hover:text-slate-600'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('HIGH_CAPACITY')}
            className={`px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border-none cursor-pointer transition-all ${statusFilter === 'HIGH_CAPACITY'
                ? 'bg-white text-rose-600 shadow-3xs font-extrabold'
                : 'bg-transparent text-slate-400 hover:text-rose-500'
              }`}
          >
            High Cap (&gt;80%)
          </button>
          <button
            onClick={() => setStatusFilter('FULL')}
            className={`px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border-none cursor-pointer transition-all ${statusFilter === 'FULL'
                ? 'bg-white text-slate-800 shadow-3xs font-extrabold'
                : 'bg-transparent text-slate-400 hover:text-slate-600'
              }`}
          >
            Near limit
          </button>
        </div>

        {/* Sort Selection */}
        <div className="relative flex items-center">
          <span className="text-[9px] font-black text-slate-400 uppercase mr-2 tracking-widest">Sort By:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-slate-50/70 border border-slate-200/50 text-slate-600 text-[10.5px] font-black uppercase tracking-wider py-1.5 pl-3 pr-8 rounded-xl outline-none focus:border-indigo-500 focus:bg-white cursor-pointer transition-all shadow-3xs"
            >
              <option value="CODE">Facility Code</option>
              <option value="CAPACITY_DESC">Capacity Peak</option>
              <option value="SKUS_DESC">SKU Volume</option>
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
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
