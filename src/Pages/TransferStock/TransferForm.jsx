import React from 'react';

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
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full min-h-0 overflow-hidden">
      <div className="px-3.5 py-2 border-b border-slate-100 flex items-center gap-1.5 bg-gradient-to-r from-white to-slate-50/50 flex-shrink-0">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#3b82f6" strokeWidth="2">
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
        <div className="text-[10.5px] font-extrabold text-slate-700 uppercase tracking-wider">Transfer details</div>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
        <div className="p-3.5 flex-1 overflow-y-hidden min-h-0">
          {/* Product dropdown */}
          <div className="flex flex-col gap-0.5 mb-1.5">
            <label className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-wider">Product</label>
            <select 
              className="w-full bg-slate-50 text-slate-700 text-[11.5px] font-bold px-2.5 py-1 rounded-md border border-slate-200 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer pr-8 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%2364748b%22 stroke-width=%222.5%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22 /%3E%3C/svg%3E')] bg-no-repeat bg-[position:right_10px_center] bg-[size:12px]"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              required
            >
              {products.map(p => {
                const stock = getProductStockInWarehouse(p.id, sourceWarehouseId);
                return (
                  <option key={p.id} value={p.id}>
                    {p.name} ({sourceWh?.code || 'Source'}: {stock} units)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Source warehouse selection */}
          <div className="flex flex-col gap-0.5 mb-1.5">
            <label className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-wider">
              Source warehouse {isManager && ' (Locked to your assigned warehouse)'}
            </label>
            <select 
              className="w-full bg-slate-50 text-slate-700 text-[11.5px] font-bold px-2.5 py-1 rounded-md border border-slate-200 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer pr-8 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%2364748b%22 stroke-width=%222.5%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22 /%3E%3C/svg%3E')] bg-no-repeat bg-[position:right_10px_center] bg-[size:12px] disabled:opacity-75 disabled:cursor-not-allowed"
              value={sourceWarehouseId}
              onChange={(e) => setSourceWarehouseId(e.target.value)}
              required
              disabled={isManager}
            >
              {warehouses.map(w => {
                const stock = getProductStockInWarehouse(selectedProductId, w.id);
                return (
                  <option key={w.id} value={w.id}>
                    {w.code} — {w.city || w.name} (Stock: {stock})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Swap direction button */}
          {!isManager && (
            <div 
              className="flex items-center justify-center w-5.5 h-5.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-100 hover:scale-105 active:scale-95 transition-all self-center cursor-pointer -my-2.5 z-10 shadow-sm mx-auto font-bold border-none"
              onClick={handleSwap} 
              title="Swap Source/Destination"
            >
              <span className="text-xs font-extrabold">⇄</span>
            </div>
          )}

          {/* Destination warehouse selection */}
          <div className="flex flex-col gap-0.5 mb-1.5">
            <label className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-wider">Destination warehouse</label>
            <select 
              className="w-full bg-slate-50 text-slate-700 text-[11.5px] font-bold px-2.5 py-1 rounded-md border border-slate-200 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer pr-8 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%2364748b%22 stroke-width=%222.5%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22 /%3E%3C/svg%3E')] bg-no-repeat bg-[position:right_10px_center] bg-[size:12px]"
              value={destWarehouseId}
              onChange={(e) => setDestWarehouseId(e.target.value)}
              required
            >
              {warehouses.map(w => {
                const stock = getProductStockInWarehouse(selectedProductId, w.id);
                return (
                  <option key={w.id} value={w.id}>
                    {w.code} — {w.city || w.name} (Stock: {stock})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Quantity to transfer */}
          <div className="flex flex-col gap-0.5 mb-1.5">
            <label className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-wider">Quantity to transfer</label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-md overflow-hidden">
              <button type="button" className="w-7 h-7 flex items-center justify-center text-xs font-extrabold text-slate-500 hover:bg-slate-200 transition-colors border-none bg-transparent cursor-pointer" onClick={() => handleQuantityAdjust(-10)}>−</button>
              <input 
                className="w-full bg-transparent text-center text-[11.5px] font-bold px-2.5 py-1 outline-none border-none" 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)}
                style={{ textAlign: 'center', fontSize: '15px', fontWeight: '700' }}
                required
                min="1"
              />
              <button type="button" className="w-7 h-7 flex items-center justify-center text-xs font-extrabold text-slate-500 hover:bg-slate-200 transition-colors border-none bg-transparent cursor-pointer" onClick={() => handleQuantityAdjust(10)}>+</button>
            </div>
          </div>

          {/* Notes field */}
          <div className="flex flex-col gap-0.5 mb-1.5">
            <label className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-wider">Notes</label>
            <textarea 
              className="w-full bg-slate-50 text-slate-700 text-[11.5px] font-bold px-2.5 py-1 rounded-md border border-slate-200 outline-none focus:border-blue-500 focus:bg-white transition-all resize-none" 
              rows="2" 
              placeholder="e.g. Rebalancing overstocked warehouse..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          {/* TRANSFER PREVIEW SECTION */}
          <div className="grid grid-cols-2 gap-2 mt-1.5">
            <div className="border border-slate-200 rounded-md p-1.5 bg-slate-50/50">
              <div className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">Source after transfer</div>
              <div className="text-xs font-black" style={{ color: '#991b1b' }}>
                -{qtyToMove}
              </div>
              <div className="text-[8.5px] font-extrabold text-slate-500 leading-tight">
                {sourceWh?.code || 'WH-KL-01'} · {sourceStockNow} → {sourceStockAfter} units
              </div>
              <div 
                style={{ 
                  marginTop: '4px', 
                  fontSize: '8px', 
                  color: sourceBelowRP ? '#991b1b' : '#166534', 
                  background: sourceBelowRP ? '#fee2e2' : '#dcfce7', 
                  borderRadius: '4px', 
                  padding: '2px 4px',
                  fontWeight: 800,
                  display: 'inline-block'
                }}
              >
                {sourceBelowRP ? '⚠ Will go below reorder point' : '✓ Safe reorder levels'}
              </div>
            </div>

            <div className="border border-slate-200 rounded-md p-1.5 bg-slate-50/50">
              <div className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">Destination after transfer</div>
              <div className="text-xs font-black" style={{ color: '#166534' }}>
                +{qtyToMove}
              </div>
              <div className="text-[8.5px] font-extrabold text-slate-500 leading-tight">
                {destWh?.code || 'WH-JB-03'} · {destStockNow} → {destStockAfter} units
              </div>
              <div 
                style={{ 
                  marginTop: '4px', 
                  fontSize: '8px', 
                  color: destMeetsRP ? '#166534' : '#991b1b', 
                  background: destMeetsRP ? '#dcfce7' : '#fee2e2', 
                  borderRadius: '4px', 
                  padding: '2px 4px',
                  fontWeight: 800,
                  display: 'inline-block'
                }}
              >
                {destMeetsRP ? '✓ Will meet reorder point' : '⚠ Below safety buffer'}
              </div>
            </div>
          </div>

          {/* SignalR broadcast banner */}
          <div 
            className="border rounded-md p-1.5 text-[9px] mt-1.5 flex items-center gap-1.5 font-bold"
            style={{ 
              background: '#eff6ff', 
              borderColor: '#bfdbfe', 
              color: '#1e40af'
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-600"></span>
            </span>
            Both warehouse dashboards will update live via SignalR after transfer
          </div>
        </div>

        {/* Form Footer */}
        <div className="px-3.5 py-1.5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2 flex-shrink-0">
          <button type="button" className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-600 font-bold text-[11px] rounded-md border border-slate-200 transition-all cursor-pointer" onClick={onCancel}>Cancel</button>
          <button 
            type="submit" 
            className="px-3 py-1 text-white font-bold text-[11px] rounded-md shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
            style={{ background: '#1e40af' }} 
            disabled={submitting}
          >
            {submitting ? 'Confirming...' : 'Confirm transfer →'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransferForm;
