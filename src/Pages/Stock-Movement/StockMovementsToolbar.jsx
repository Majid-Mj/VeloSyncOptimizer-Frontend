import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

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
  const { user } = useSelector(state => state.auth);
  const isManager = user?.role === 'WarehouseManager';
  const managerWarehouseId = user?.warehouseId?.toString();

  // Search states for Product Dropdown
  const [productSearch, setProductSearch] = useState('All Products');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Synchronize input string with product filter changes
  useEffect(() => {
    if (productFilter === 'ALL') {
      setProductSearch('All Products');
    } else {
      const match = products.find(p => p.id.toString() === productFilter.toString());
      if (match) {
        setProductSearch(match.name);
      }
    }
  }, [productFilter, products]);

  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
    if (productFilter === 'ALL') {
      setProductSearch('All Products');
    } else {
      const match = products.find(p => p.id.toString() === productFilter.toString());
      if (match) {
        setProductSearch(match.name);
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const term = (productSearch === 'All Products' ? '' : productSearch || '').toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(term) ||
      (p.sku || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-100/90 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
      {/* Filters Section */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Warehouse Filter */}
        <div className="relative">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Warehouse Location</label>
          {isManager ? (
            <div className="w-full bg-slate-50 text-xs font-bold text-slate-700 pl-3.5 pr-4 py-2.5 rounded-xl border border-slate-100 flex items-center gap-2 select-none h-10 shadow-3xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="truncate">
                {(() => {
                  const w = warehouses.find(x => x.id.toString() === managerWarehouseId);
                  return w ? `${w.code || `WH-${w.id}`} — ${w.name}` : `WH-${managerWarehouseId} — Loading...`;
                })()}
              </span>
            </div>
          ) : (
            <div className="relative">
              <select
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
                className="w-full bg-slate-50 text-xs font-bold text-slate-700 pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-200/60 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none appearance-none cursor-pointer transition-all shadow-3xs h-10"
              >
                <option value="ALL">All Warehouses</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.code || `WH-${w.id}`} — {w.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-3 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Searchable Product Filter */}
        <div className="relative">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
            Filter by Product <span className="text-[9px] font-medium text-slate-400 font-mono">(Type to search)</span>
          </label>
          
          <div className="relative">
            <input
              type="text"
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => {
                if (productSearch === 'All Products') {
                  setProductSearch('');
                }
                setIsDropdownOpen(true);
              }}
              className="w-full bg-slate-50 text-xs font-bold text-slate-700 pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-200/60 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none transition-all shadow-3xs h-10"
              placeholder="Search SKU or Name..."
            />
            <div className="absolute right-3.5 top-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {isDropdownOpen && (
            <>
              {/* Click-outside backdrop */}
              <div className="fixed inset-0 z-40 bg-transparent" onClick={handleDropdownClose} />
              
              <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-56 overflow-y-auto bg-white border border-slate-100 rounded-xl shadow-lg divide-y divide-slate-50/60 scrollbar-thin">
                {/* Default All Option */}
                <div
                  onClick={() => {
                    setProductFilter('ALL');
                    setProductSearch('All Products');
                    setIsDropdownOpen(false);
                  }}
                  className={`px-3.5 py-2.5 cursor-pointer flex justify-between items-center transition-colors text-xs font-bold ${
                    productFilter === 'ALL'
                      ? 'bg-indigo-50/70 text-indigo-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>✨ Show All Products</span>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="px-3.5 py-3 text-[11px] font-semibold text-slate-400 text-center">
                    No products match query
                  </div>
                ) : (
                  filteredProducts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setProductFilter(p.id.toString());
                        setProductSearch(p.name);
                        setIsDropdownOpen(false);
                      }}
                      className={`px-3.5 py-2.5 cursor-pointer flex justify-between items-center transition-colors text-xs ${
                        productFilter.toString() === p.id.toString()
                          ? 'bg-indigo-50/70 text-indigo-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate max-w-[190px]">{p.name}</span>
                      <span className="text-[9px] font-mono font-bold bg-slate-100 border border-slate-200/50 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wider scale-95 shrink-0">
                        {p.sku}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Items Per Page Select */}
        <div className="relative">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Page Dimension</label>
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="w-full bg-slate-50 text-xs font-bold text-slate-700 pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-200/60 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none appearance-none cursor-pointer transition-all shadow-3xs h-10"
            >
              <option value={10}>10 Records</option>
              <option value={25}>25 Records</option>
              <option value={50}>50 Records</option>
              <option value={100}>100 Records</option>
            </select>
            <div className="absolute right-3.5 top-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Action */}
      <button
        onClick={onReset}
        className="px-5 py-2.5 text-xs font-black text-rose-500 bg-rose-50/50 border border-rose-100 hover:bg-rose-100/60 hover:text-rose-700 rounded-xl transition-all duration-200 cursor-pointer text-center shrink-0 h-10 flex items-center justify-center gap-1.5 lg:self-end"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Reset Filters
      </button>
    </div>
  );
};

export default StockMovementsToolbar;
