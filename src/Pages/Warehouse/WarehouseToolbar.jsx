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
    <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by code, manager, location..."
          className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none text-gray-600 placeholder:text-gray-400 font-medium"
        />
      </div>

      {/* Filter Pills & Sorting Dropdown */}
      <div className="flex flex-wrap items-center gap-3.5">
        <div className="flex items-center bg-gray-50 rounded-lg p-0.5">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-md border-none cursor-pointer transition-all ${statusFilter === 'ALL' ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-400 hover:text-gray-600'}`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('HIGH_CAPACITY')}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-md border-none cursor-pointer transition-all ${statusFilter === 'HIGH_CAPACITY' ? 'bg-white text-red-500 shadow-sm' : 'bg-transparent text-gray-400 hover:text-red-500/80'}`}
          >
            High Cap
          </button>
          <button
            onClick={() => setStatusFilter('FULL')}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-md border-none cursor-pointer transition-all ${statusFilter === 'FULL' ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-400 hover:text-gray-600'}`}
          >
            Full
          </button>
        </div>

        {/* Sort Selection */}
        <div className="relative flex items-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase mr-2 tracking-wider">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none bg-gray-50 border border-gray-200 text-gray-600 text-[11px] font-bold py-1.5 pl-3 pr-8 rounded-lg outline-none focus:ring-1 focus:ring-blue-100 cursor-pointer transition-all shadow-sm"
          >
            <option value="CODE">Warehouse Code</option>
            <option value="CAPACITY_DESC">Capacity (Highest)</option>
            <option value="SKUS_DESC">SKU Volume</option>
          </select>
          <svg className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default WarehouseToolbar;
