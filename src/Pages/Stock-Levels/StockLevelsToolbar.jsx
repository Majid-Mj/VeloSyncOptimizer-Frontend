import React from 'react';

const StockLevelsToolbar = ({
  searchQuery,
  setSearchQuery,
  warehouseFilter,
  setWarehouseFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  warehouses
}) => {
  const filterPills = [
    { key: 'ALL', label: 'All Stock' },
    { key: 'IN_STOCK', label: 'In Stock' },
    { key: 'LOW_STOCK', label: 'Low Stock Alerts' },
    { key: 'OUT_OF_STOCK', label: 'Out of Stock' },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-4">
      {/* Search & Select Grid */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Product Name, SKU, or Code..."
            className="w-full bg-[#f8fafc] text-xs font-bold text-gray-700 placeholder-gray-400 pl-9.5 pr-4 py-2.5 rounded-xl border border-gray-100 focus:border-blue-500 focus:bg-white outline-none transition-all"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Warehouse Dropdown */}
        <div className="w-full md:w-60 relative">
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="w-full bg-[#f8fafc] text-xs font-bold text-gray-700 pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-100 focus:border-blue-500 focus:bg-white outline-none appearance-none cursor-pointer"
          >
            <option value="ALL">All Warehouses</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>
                {w.code || `WH-${w.id}`} — {w.name}
              </option>
            ))}
          </select>
          <svg className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Sort Select */}
        <div className="w-full md:w-56 relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-[#f8fafc] text-xs font-bold text-gray-700 pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-100 focus:border-blue-500 focus:bg-white outline-none appearance-none cursor-pointer"
          >
            <option value="NAME">Sort by: Product Name</option>
            <option value="SKU">Sort by: SKU Code</option>
            <option value="AVAIL_DESC">Available Stock: High to Low</option>
            <option value="AVAIL_ASC">Available Stock: Low to High</option>
          </select>
          <svg className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Pill Buttons Filter Row */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-gray-50">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-2">Quick Filters:</span>
        {filterPills.map((pill) => {
          const isActive = statusFilter === pill.key;
          return (
            <button
              key={pill.key}
              onClick={() => setStatusFilter(pill.key)}
              className={`px-3 py-1.5 text-[11px] font-extrabold rounded-lg transition-all border cursor-pointer ${
                isActive
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white border-gray-150 text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StockLevelsToolbar;
