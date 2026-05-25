import React from 'react';
import { useSelector } from 'react-redux';

const StockLevelsToolbar = ({
  searchQuery,
  setSearchQuery,
  warehouseFilter,
  setWarehouseFilter,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  categories,
  sortBy,
  setSortBy,
  warehouses
}) => {
  const { user } = useSelector(state => state.auth);
  const isManager = user?.role === 'WarehouseManager';
  const managerWarehouseId = user?.warehouseId?.toString();

  const renderWarehouses = () => {
    if (isManager && managerWarehouseId) {
      const w = warehouses?.find(x => x.id.toString() === managerWarehouseId) || { id: managerWarehouseId, code: `WH-${managerWarehouseId}` };
      
      return (
        <button 
          className="px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 bg-indigo-600 text-white shadow-sm shadow-indigo-200 border border-indigo-600 flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
          {w.code || `WH-${w.id}`} (My Warehouse)
        </button>
      );
    }

    if (warehouses && warehouses.length > 0) {
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={() => setWarehouseFilter('ALL')}
            className={`px-4 py-2 text-xs font-black tracking-wide uppercase rounded-xl transition-all duration-200 border cursor-pointer ${
              warehouseFilter === 'ALL' 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-100 scale-102' 
                : 'bg-white border-slate-200/80 text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            All warehouses
          </button>
          {warehouses.map(w => (
            <button 
              key={w.id}
              onClick={() => setWarehouseFilter(w.id.toString())}
              className={`px-4 py-2 text-xs font-black tracking-wide uppercase rounded-xl transition-all duration-200 border cursor-pointer ${
                warehouseFilter === w.id.toString() 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-100 scale-102' 
                  : 'bg-white border-slate-200/80 text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {w.code || `WH-${w.id}`}
            </button>
          ))}
        </div>
      );
    }
    
    // Fallback static pills just in case data isn't loaded yet
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <button className="px-4 py-2 bg-indigo-600 text-white border border-indigo-600 text-xs font-black tracking-wide uppercase rounded-xl shadow-sm">All warehouses</button>
        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-500 text-xs font-black tracking-wide uppercase rounded-xl">WH-KL-01</button>
        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-500 text-xs font-black tracking-wide uppercase rounded-xl">WH-PG-02</button>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 w-full bg-white/70 backdrop-blur-md border border-slate-100 shadow-sm p-5 rounded-2xl transition-all duration-300">
      
      {/* Top Row: Warehouses Selector */}
      <div className="flex flex-col gap-2 w-full">
        <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Warehouse Node</span>
        <div className="overflow-x-auto pb-1 scrollbar-hide">
          {renderWarehouses()}
        </div>
      </div>

      <div className="w-full h-px bg-slate-100"></div>

      {/* Bottom Layout: Filters & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-center w-full">
        
        {/* Search Input - 4 Cols */}
        <div className="lg:col-span-4 relative w-full">
          <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search product name or SKU..."
            className="w-full bg-white border border-slate-200/90 text-slate-700 placeholder-slate-400 text-xs font-bold rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all shadow-xs"
          />
        </div>

        {/* Dropdowns Filters - 8 Cols */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
          
          {/* Status Filter */}
          <div className="relative w-full">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-slate-200/95 text-slate-600 text-xs font-bold rounded-xl pl-3.5 pr-9 py-2.5 outline-none appearance-none cursor-pointer hover:border-slate-300 focus:border-indigo-500 transition-colors shadow-xs"
            >
              <option value="ALL">🌐 All Statuses</option>
              <option value="IN_STOCK">🟢 In Stock (Healthy)</option>
              <option value="LOW_STOCK">🟡 Low Stock (Warning)</option>
              <option value="OUT_OF_STOCK">🔴 Out of Stock (Critical)</option>
            </select>
            <svg className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Categories Filter */}
          <div className="relative w-full">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-white border border-slate-200/95 text-slate-600 text-xs font-bold rounded-xl pl-3.5 pr-9 py-2.5 outline-none appearance-none cursor-pointer hover:border-slate-300 focus:border-indigo-500 transition-colors shadow-xs"
            >
              <option value="ALL">🏷️ All Categories</option>
              {categories && categories.filter(c => c !== 'ALL').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <svg className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Sort Dropdown */}
          <div className="relative w-full">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-white border border-slate-200/95 text-slate-600 text-xs font-bold rounded-xl pl-3.5 pr-9 py-2.5 outline-none appearance-none cursor-pointer hover:border-slate-300 focus:border-indigo-500 transition-colors shadow-xs"
            >
              <option value="NAME">🔤 Product Name (A-Z)</option>
              <option value="SKU">🏷️ Product SKU (A-Z)</option>
              <option value="QTY_ASC">📉 Quantity: Low to High</option>
              <option value="QTY_DESC">📈 Quantity: High to Low</option>
            </select>
            <svg className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

        </div>

      </div>

    </div>
  );
};

export default StockLevelsToolbar;
