import React, { useState, useEffect } from 'react';

const TransferForm = ({
  isManager,
  products,
  warehouses,
  selectedProductId,
  setSelectedProductId,
  sourceWarehouseId,
  setSourceWarehouseId,
  destWarehouseId,
  setDestWarehouseId,
  quantity,
  setQuantity,
  notes,
  setNotes,
  submitting,
  handleSubmit,
  handleSwap,
  handleQuantityAdjust,
  getProductStockInWarehouse,
  qtyToMove,
  sourceWh,
  destWh,
  sourceStockNow,
  destStockNow,
  sourceStockAfter,
  destStockAfter,
  sourceReorderPoint,
  destReorderPoint,
  sourceBelowRP,
  destMeetsRP,
  onCancel
}) => {
  // Searchable Product states
  const [productSearch, setProductSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeProduct = products.find(p => p.id.toString() === selectedProductId.toString());

  // Synchronize search input on mount and changes
  useEffect(() => {
    if (activeProduct) {
      setProductSearch(activeProduct.name);
    }
  }, [selectedProductId, products]);

  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
    if (activeProduct) {
      setProductSearch(activeProduct.name);
    }
  };

  const filteredProducts = products.filter(p => {
    const term = (productSearch || '').toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(term) ||
      (p.sku || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-100 shadow-xs rounded-2xl flex flex-col h-full overflow-hidden">

      {/* Form Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/40 flex-shrink-0">
        <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200/50 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
          Stock Transfer Details
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-[10px] overflow-hidden">
        <div className="p-4.5 flex-1 flex flex-col gap-3.5 overflow-y-auto">

          {/* Searchable Product Selector */}
          <div className="relative">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
              Product <span className="text-[8.5px] font-medium text-slate-400 font-mono">(Type to search)</span>
            </label>

            <div className="relative">
              <input
                type="text"
                placeholder="Search product..."
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => {
                  setIsDropdownOpen(true);
                }}
                className="w-full bg-slate-50/70 text-xs font-bold text-slate-700 pl-3 pr-8.5 py-2.5 rounded-xl border border-slate-200/60 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none transition-all shadow-3xs h-9.5"
              />
              <div className="absolute right-3 top-2.5 text-slate-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40 bg-transparent" onClick={handleDropdownClose} />
                <div className="absolute z-50 left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white border border-slate-100 rounded-xl shadow-lg divide-y divide-slate-50/60 scrollbar-thin">
                  {filteredProducts.length === 0 ? (
                    <div className="px-3.5 py-2 text-[10px] font-semibold text-slate-400 text-center">
                      No products found
                    </div>
                  ) : (
                    filteredProducts.map(p => {
                      const stock = getProductStockInWarehouse(p.id, sourceWarehouseId);
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedProductId(p.id.toString());
                            setProductSearch(p.name);
                            setIsDropdownOpen(false);
                          }}
                          className={`px-3.5 py-2.5 cursor-pointer flex justify-between items-center transition-colors text-xs ${selectedProductId.toString() === p.id.toString()
                              ? 'bg-indigo-50/70 text-indigo-700 font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                          <div className="truncate max-w-[190px]">
                            <span className="block truncate font-bold">{p.name}</span>
                            <span className="text-[8.5px] font-semibold text-slate-400">SKU: {p.sku}</span>
                          </div>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${stock === 0
                              ? 'bg-rose-50 border-rose-100 text-rose-600'
                              : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                            }`}>
                            {stock} in source
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>

          {/* COMPACT SIDE-BY-SIDE WAREHOUSE FLOW */}
          <div className="flex items-center gap-2">

            {/* Source Select */}
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Source
              </label>
              <div className="relative">
                <select
                  className="w-full bg-slate-50/70 text-xs font-bold text-slate-700 pl-3 pr-7 py-2 rounded-xl border border-slate-200/60 focus:border-indigo-500 focus:bg-white outline-none appearance-none cursor-pointer transition-all shadow-3xs h-9.5 disabled:opacity-70"
                  value={sourceWarehouseId}
                  onChange={(e) => setSourceWarehouseId(e.target.value)}
                  required
                  disabled={isManager}
                >
                  {warehouses.map(w => {
                    const stock = getProductStockInWarehouse(selectedProductId, w.id);
                    return (
                      <option key={w.id} value={w.id}>
                        {w.code} ({stock} u)
                      </option>
                    );
                  })}
                </select>
                <div className="absolute right-2.5 top-3 text-slate-400 pointer-events-none">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Compact Swap Button */}
            {!isManager && (
              <div className="pt-5 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-150 text-indigo-500 hover:bg-slate-50 active:scale-95 transition-all shadow-3xs flex items-center justify-center font-bold border-none cursor-pointer"
                  title="Swap Warehouses"
                >
                  ⇄
                </button>
              </div>
            )}

            {/* Destination Select */}
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Destination
              </label>
              <div className="relative">
                <select
                  className="w-full bg-slate-50/70 text-xs font-bold text-slate-700 pl-3 pr-7 py-2 rounded-xl border border-slate-200/60 focus:border-indigo-500 focus:bg-white outline-none appearance-none cursor-pointer transition-all shadow-3xs h-9.5"
                  value={destWarehouseId}
                  onChange={(e) => setDestWarehouseId(e.target.value)}
                  required
                >
                  {warehouses.map(w => {
                    const stock = getProductStockInWarehouse(selectedProductId, w.id);
                    return (
                      <option key={w.id} value={w.id}>
                        {w.code} ({stock} u)
                      </option>
                    );
                  })}
                </select>
                <div className="absolute right-2.5 top-3 text-slate-400 pointer-events-none">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

          </div>

          {/* COMPACT SIDE-BY-SIDE QUANTITY & NOTES */}
          <div className="grid grid-cols-3 gap-3">

            {/* Quantity */}
            <div className="col-span-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Qty</label>
              <div className="flex items-center bg-slate-50/70 border border-slate-200/60 rounded-xl overflow-hidden shadow-3xs h-9.5">
                <button
                  type="button"
                  className="w-8 h-full flex items-center justify-center text-sm font-black text-slate-500 hover:bg-slate-200/40 transition-colors border-none bg-transparent cursor-pointer"
                  onClick={() => handleQuantityAdjust(-10)}
                >
                  −
                </button>
                <input
                  className="w-full bg-transparent text-center text-xs font-black outline-none border-none text-slate-800"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  min="1"
                />
                <button
                  type="button"
                  className="w-8 h-full flex items-center justify-center text-sm font-black text-slate-500 hover:bg-slate-200/40 transition-colors border-none bg-transparent cursor-pointer"
                  onClick={() => handleQuantityAdjust(10)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Notes</label>
              <input
                type="text"
                placeholder="Reference context..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50/70 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl border border-slate-200/60 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-3xs h-9.5"
              />
            </div>

          </div>

          {/* COMPACT TRANSFER IMPACT BADGES */}
          <div className="grid grid-cols-2 gap-3 mt-0.5">
            <div className={`border rounded-xl p-3 transition-colors ${sourceBelowRP ? 'border-rose-100 bg-rose-50/10' : 'border-slate-100'
              }`}>
              <div className="text-[8.5px] font-black text-slate-400 uppercase mb-0.5">Source Impact</div>
              <div className="text-xs font-black text-rose-600 flex items-center justify-between">
                <span>-{qtyToMove} units</span>
                <span className={`text-[8px] font-black px-1.5 rounded ${sourceBelowRP ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'
                  }`}>
                  {sourceBelowRP ? '⚠️ Below Safety' : '✓ Safe'}
                </span>
              </div>
              <div className="text-[9.5px] font-bold text-slate-400 mt-1">
                {sourceWh?.code || 'SRC'} : {sourceStockNow} ➔ {sourceStockAfter}
              </div>
            </div>

            <div className={`border rounded-xl p-3 transition-colors ${destMeetsRP ? 'border-emerald-100 bg-emerald-50/10' : 'border-slate-100'
              }`}>
              <div className="text-[8.5px] font-black text-slate-400 uppercase mb-0.5">Dest Impact</div>
              <div className="text-xs font-black text-emerald-600 flex items-center justify-between">
                <span>+{qtyToMove} units</span>
                <span className={`text-[8px] font-black px-1.5 rounded ${destMeetsRP ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-500'
                  }`}>
                  {destMeetsRP ? '✓ Meets Buffer' : '⚠️ Low'}
                </span>
              </div>
              <div className="text-[9.5px] font-bold text-slate-400 mt-1">
                {destWh?.code || 'DST'} : {destStockNow} ➔ {destStockAfter}
              </div>
            </div>
          </div>

          {/* Broadcast Banner */}
          <div className="border border-indigo-50/60 rounded-xl px-3 py-2 bg-indigo-50/30 text-[9.5px] font-bold text-indigo-700 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
            <span>Warehouse boards synchronize live via SignalR.</span>
          </div>

        </div>

        {/* Form Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/40 flex gap-3 flex-shrink-0">
          <button
            type="button"
            className="flex-1 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-500 border border-slate-200/80 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2.5 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
            disabled={submitting}
          >
            {submitting ? 'Confirming...' : 'Confirm Transfer →'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransferForm;
