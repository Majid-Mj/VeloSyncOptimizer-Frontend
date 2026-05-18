import React from 'react';

const StockMovementsToolbar = ({
  warehouseFilter,
  setWarehouseFilter,
  productFilter,
  setProductFilter,
  pageSize,
  setPageSize,
  warehouses,
  products,
  onReset
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
      {/* Filters Section */}
      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Warehouse Filter */}
        <div className="relative">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Warehouse Location</label>
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
          <svg className="w-4 h-4 text-gray-400 absolute right-3 bottom-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Product Filter */}
        <div className="relative">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Filter by Product</label>
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="w-full bg-[#f8fafc] text-xs font-bold text-gray-700 pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-100 focus:border-blue-500 focus:bg-white outline-none appearance-none cursor-pointer"
          >
            <option value="ALL">All Products</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                [{p.sku}] — {p.name}
              </option>
            ))}
          </select>
          <svg className="w-4 h-4 text-gray-400 absolute right-3 bottom-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Items Per Page Select */}
        <div className="relative">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Items per Page</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="w-full bg-[#f8fafc] text-xs font-bold text-gray-700 pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-100 focus:border-blue-500 focus:bg-white outline-none appearance-none cursor-pointer"
          >
            <option value={10}>10 records</option>
            <option value={25}>25 records</option>
            <option value={50}>50 records</option>
            <option value={100}>100 records</option>
          </select>
          <svg className="w-4 h-4 text-gray-400 absolute right-3 bottom-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Reset Action */}
      <button
        onClick={onReset}
        className="px-4 py-2.5 text-xs font-extrabold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 hover:text-blue-700 rounded-xl transition-all cursor-pointer w-full md:w-auto text-center shrink-0"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default StockMovementsToolbar;
