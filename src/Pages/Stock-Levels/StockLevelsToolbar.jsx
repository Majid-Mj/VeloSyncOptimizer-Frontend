import React from 'react';
import { useSelector } from 'react-redux';

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
  const { user } = useSelector(state => state.auth);
  const isManager = user?.role === 'WarehouseManager';
  const managerWarehouseId = user?.warehouseId?.toString();

  const renderWarehouses = () => {
    if (isManager && managerWarehouseId) {
      // Find the specific warehouse for the manager
      const w = warehouses?.find(x => x.id.toString() === managerWarehouseId) || { id: managerWarehouseId, code: `WH-${managerWarehouseId}` };
      
      return (
        <button 
          className="px-4 py-1.5 text-[13px] font-medium rounded-full transition-colors whitespace-nowrap bg-[#1e293b] text-white border border-[#1e293b]"
        >
          {w.code || `WH-${w.id}`}
        </button>
      );
    }

    if (warehouses && warehouses.length > 0) {
      return (
        <>
          <button 
            onClick={() => setWarehouseFilter('ALL')}
            className={`px-4 py-1.5 text-[13px] font-medium rounded-full transition-colors whitespace-nowrap ${
              warehouseFilter === 'ALL' 
                ? 'bg-[#1e293b] text-white border border-[#1e293b]' 
                : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            All warehouses
          </button>
          {warehouses.map(w => (
            <button 
              key={w.id}
              onClick={() => setWarehouseFilter(w.id.toString())}
              className={`px-4 py-1.5 text-[13px] font-medium rounded-full transition-colors whitespace-nowrap ${
                warehouseFilter === w.id.toString() 
                  ? 'bg-[#1e293b] text-white border border-[#1e293b]' 
                  : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {w.code || `WH-${w.id}`}
            </button>
          ))}
        </>
      );
    }
    
    // Fallback static pills just in case data isn't loaded yet
    return (
      <>
        <button className="px-4 py-1.5 bg-[#1e293b] text-white border border-[#1e293b] text-[13px] font-medium rounded-full">All warehouses</button>
        <button className="px-4 py-1.5 bg-white border border-slate-200 text-slate-500 text-[13px] font-medium rounded-full">WH-KL-01</button>
        <button className="px-4 py-1.5 bg-white border border-slate-200 text-slate-500 text-[13px] font-medium rounded-full">WH-PG-02</button>
        <button className="px-4 py-1.5 bg-white border border-slate-200 text-slate-500 text-[13px] font-medium rounded-full">WH-JB-03</button>
        <button className="px-4 py-1.5 bg-white border border-slate-200 text-slate-500 text-[13px] font-medium rounded-full">WH-KK-04</button>
        <button className="px-4 py-1.5 bg-white border border-slate-200 text-slate-500 text-[13px] font-medium rounded-full">WH-SB-05</button>
      </>
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full bg-transparent">
      {/* Top Row: Warehouses and Risk Levels */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
        {/* Warehouses Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide">
          {renderWarehouses()}
        </div>

        {/* Risk Levels Dropdown */}
        <div className="relative shrink-0">
          <select 
            className="bg-white border border-slate-200 text-slate-500 text-[13px] font-medium rounded-lg pl-3.5 pr-9 py-2 outline-none appearance-none cursor-pointer hover:border-slate-300 transition-colors"
            defaultValue="ALL"
          >
            <option value="ALL">All risk levels</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <svg className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Bottom Row: Categories and Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
        {/* Categories Dropdown */}
        <div className="relative shrink-0">
          <select 
            className="bg-white border border-slate-200 text-slate-500 text-[13px] font-medium rounded-lg pl-3.5 pr-9 py-2 outline-none appearance-none cursor-pointer hover:border-slate-300 transition-colors w-full sm:w-40"
            defaultValue="ALL"
          >
            <option value="ALL">All categories</option>
            <option value="FOOD">Food & Beverage</option>
            <option value="COMMODITIES">Commodities</option>
            <option value="ELECTRONICS">Electronics</option>
          </select>
          <svg className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 w-full sm:max-w-[420px]">
          <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search product or SKU..."
            className="w-full bg-white border border-slate-200 text-slate-700 placeholder-slate-400 text-[13px] font-medium rounded-lg pl-9 pr-4 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>
    </div>
  );
};

export default StockLevelsToolbar;
