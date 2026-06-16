import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import stockApi from '../../api/stock.api';

const AdjustStockModal = ({
  isOpen,
  onClose,
  selectedItem,
  products = [],
  warehouses = [],
  stockLevels = [],
  onSubmit
}) => {
  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [adjustType, setAdjustType] = useState('ADD'); // 'ADD' or 'SUBTRACT'
  const [quantity, setQuantity] = useState(50);
  const [reason, setReason] = useState('Stock count discrepancy');
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Search states for searchable product dropdown
  const [productSearch, setProductSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [recentAdjustments, setRecentAdjustments] = useState([]);

  const { user } = useSelector(state => state.auth);
  const isManager = user?.role === 'WarehouseManager';
  const managerWarehouseId = user?.warehouseId?.toString();

  const allowedWarehouses = isManager && managerWarehouseId
    ? warehouses.filter(w => w.id.toString() === managerWarehouseId)
    : warehouses;

  // Load adjustments
  useEffect(() => {
    if (isOpen) {
      const loadRecent = async () => {
        try {
          const res = await stockApi.getMovements({ pageSize: 40 });
          if (res?.isSuccess && res.data?.items) {
            const adjustments = res.data.items
              .filter(m => m.movementTypeId === 3 || m.movementType?.toLowerCase().includes('adjust'))
              .map(m => ({
                id: m.id,
                productName: m.productName,
                warehouseCode: m.warehouseCode || `WH-${m.warehouseId}`,
                reason: m.notes || m.reason || 'Manual Correction',
                qty: m.quantity
              }));

            setRecentAdjustments(adjustments.slice(0, 5));
          }
        } catch (err) {
          console.error('Failed to load real-time adjustments:', err);
        }
      };
      loadRecent();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedItem) {
      setProductId(selectedItem.productId);
      setWarehouseId(selectedItem.warehouseId);
      setProductSearch(selectedItem.productName || '');
      setAdjustType('ADD');
      setQuantity(50);
      setReason('Stock count discrepancy');
      setCustomReason('');
    } else {
      const initialProduct = products[0];
      setProductId(initialProduct?.id || '');
      setProductSearch(initialProduct?.name || '');
      setWarehouseId(allowedWarehouses[0]?.id || '');
      setAdjustType('ADD');
      setQuantity(50);
      setReason('Stock count discrepancy');
      setCustomReason('');
    }
  }, [selectedItem, isOpen, products, warehouses, managerWarehouseId, isManager]);

  if (!isOpen) return null;

  // Resolve current quantities and metadata
  const currentProduct = selectedItem
    ? { name: selectedItem.productName, sku: selectedItem.sku }
    : products.find(p => p.id?.toString() === productId?.toString()) || { name: 'Unknown Product', sku: 'N/A' };

  const currentWarehouse = selectedItem
    ? { name: selectedItem.warehouseName, code: selectedItem.warehouseCode || `WH-${selectedItem.warehouseId}` }
    : warehouses.find(w => w.id?.toString() === warehouseId?.toString()) || { name: 'Unknown Warehouse', code: 'N/A' };

  // Look up actual stock level from database
  const matchedStockLevel = selectedItem || stockLevels.find(
    s => s.productId?.toString() === productId?.toString() &&
      s.warehouseId?.toString() === warehouseId?.toString()
  );

  const currentQty = matchedStockLevel ? matchedStockLevel.quantityOnHand : 0;
  const reorderPoint = matchedStockLevel?.reorderPoint || 10;

  // Calculate preview variables
  const qtyChange = Number(quantity) || 0;
  const delta = adjustType === 'ADD' ? qtyChange : -qtyChange;
  const newQty = Math.max(0, currentQty + delta);
  const isHealthy = newQty > reorderPoint;

  // Search product helpers
  const selectedProduct = products.find(p => p.id.toString() === productId.toString());
  const filteredProducts = products.filter(p => {
    const term = (productSearch || '').toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(term) ||
      (p.sku || '').toLowerCase().includes(term)
    );
  });

  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
    if (selectedProduct) {
      setProductSearch(selectedProduct.name);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !warehouseId || qtyChange <= 0) return;

    setSubmitting(true);
    const finalReason = reason === 'Other' ? customReason : reason;
    const payload = {
      productId: Number(productId),
      warehouseId: Number(warehouseId),
      quantity: delta,
      reason: finalReason || `Manual Stock Correction (${adjustType})`
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const incrementQty = (e) => {
    e.preventDefault();
    setQuantity(prev => Math.max(1, (Number(prev) || 0) + 1));
  };

  const decrementQty = (e) => {
    e.preventDefault();
    setQuantity(prev => Math.max(1, (Number(prev) || 0) - 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Split Box Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-[820px] w-full z-10 overflow-hidden flex flex-col md:flex-row transition-all duration-300 transform scale-100">

        {/* Left Column: Form Details */}
        <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col bg-white">

          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Adjust Stock Levels
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-0.5 flex items-center justify-center transition-colors md:hidden"
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="p-5 flex-1 overflow-y-auto max-h-[580px] scrollbar-hide">

            {/* PRODUCT CARD BOX */}
            <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 mb-4 shadow-3xs">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Active SKU Context</span>
              <div className="text-[13.5px] font-black text-slate-800 leading-snug mt-1">
                {currentProduct.name}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[9px] font-bold font-mono bg-slate-100 border border-slate-200/50 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {currentProduct.sku}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  · {currentWarehouse.code}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-slate-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Current stock</span>
                  <span className={`text-[14px] font-black ${currentQty <= reorderPoint ? 'text-rose-600' : 'text-slate-800'}`}>
                    {currentQty.toLocaleString()} units
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 border-l border-slate-100 pl-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Safety Runway</span>
                  <span className="text-[14px] font-black text-slate-700">
                    {reorderPoint.toLocaleString()} units
                  </span>
                </div>
              </div>
            </div>

            {/* ADJUSTMENT DIRECTION */}
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Adjustment Action</span>
            <div className="grid grid-cols-2 gap-3 mb-4">

              {/* Increase Option */}
              <div
                onClick={() => setAdjustType('ADD')}
                className={`rounded-2xl p-3.5 text-center cursor-pointer border-2 transition-all duration-200 flex flex-col items-center gap-1 hover:border-emerald-300 hover:bg-emerald-50/20 ${adjustType === 'ADD'
                  ? 'border-emerald-500 bg-emerald-50/40 shadow-sm shadow-emerald-50'
                  : 'border-slate-100 bg-white'
                  }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all ${adjustType === 'ADD' ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                  }`}>
                  ↑
                </div>
                <span className={`text-[11px] font-black tracking-wide ${adjustType === 'ADD' ? 'text-emerald-700' : 'text-slate-500'}`}>
                  Increase stock
                </span>
                <span className="text-[9px] font-semibold text-slate-400 leading-none">
                  Add positive audit quantity
                </span>
              </div>

              {/* Decrease Option */}
              <div
                onClick={() => setAdjustType('SUBTRACT')}
                className={`rounded-2xl p-3.5 text-center cursor-pointer border-2 transition-all duration-200 flex flex-col items-center gap-1 hover:border-rose-300 hover:bg-rose-50/20 ${adjustType === 'SUBTRACT'
                  ? 'border-rose-500 bg-rose-50/40 shadow-sm shadow-rose-50'
                  : 'border-slate-100 bg-white'
                  }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all ${adjustType === 'SUBTRACT' ? 'bg-rose-500 text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                  }`}>
                  ↓
                </div>
                <span className={`text-[11px] font-black tracking-wide ${adjustType === 'SUBTRACT' ? 'text-rose-700' : 'text-slate-500'}`}>
                  Decrease stock
                </span>
                <span className="text-[9px] font-semibold text-slate-400 leading-none">
                  Remove damaged/expired units
                </span>
              </div>

            </div>

            {/* Dynamic Product/Warehouse Selectors (if initialized empty) */}
            {!selectedItem && (
              <div className="flex flex-col gap-3 mb-4">

                {/* Searchable Product Combobox */}
                <div className="relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                    Product <span className="text-[9px] font-medium text-slate-400 font-mono">(Type to search)</span>
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search product name or SKU..."
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-bold outline-none text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all shadow-3xs"
                    />
                    <div className="absolute right-3 top-2.5 text-slate-400 pointer-events-none">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  {isDropdownOpen && (
                    <>
                      {/* Click outside backdrop */}
                      <div className="fixed inset-0 z-40 bg-transparent" onClick={handleDropdownClose} />

                      <div className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-100 rounded-xl shadow-lg divide-y divide-slate-50/60 scrollbar-thin">
                        {filteredProducts.length === 0 ? (
                          <div className="px-3.5 py-3 text-[11px] font-semibold text-slate-400 text-center">
                            No products match search term
                          </div>
                        ) : (
                          filteredProducts.map(p => (
                            <div
                              key={p.id}
                              onClick={() => {
                                setProductId(p.id);
                                setProductSearch(p.name);
                                setIsDropdownOpen(false);
                              }}
                              className={`px-3.5 py-2.5 cursor-pointer flex justify-between items-center transition-colors text-xs ${productId.toString() === p.id.toString()
                                ? 'bg-indigo-50/70 text-indigo-700 font-bold'
                                : 'text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                              <span className="truncate max-w-[220px]">{p.name}</span>
                              <span className="text-[9px] font-mono font-bold bg-slate-100 border border-slate-200/50 text-slate-500 px-1.5 py-0.5 rounded tracking-wide uppercase">
                                {p.sku}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Warehouse Node</label>
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-slate-700 cursor-pointer focus:border-indigo-500 shadow-3xs"
                  >
                    {allowedWarehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.code || `WH-${w.id}`} — {w.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* QUANTITY INPUT */}
            <div className="mb-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Quantity to Adjust</label>
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={decrementQty}
                  className="w-9 h-9 border border-slate-200 rounded-xl bg-white cursor-pointer font-black text-sm flex items-center justify-center text-slate-500 hover:bg-slate-50 active:scale-95 transition-all shadow-3xs"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 0))}
                  className="flex-1 border border-slate-200 rounded-xl py-2 text-sm font-black outline-none text-slate-800 text-center focus:border-indigo-500 shadow-3xs"
                />
                <button
                  type="button"
                  onClick={incrementQty}
                  className="w-9 h-9 border border-slate-200 rounded-xl bg-white cursor-pointer font-black text-sm flex items-center justify-center text-slate-500 hover:bg-slate-50 active:scale-95 transition-all shadow-3xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* REASON DROP-DOWN */}
            <div className="mb-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Adjustment Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-slate-700 cursor-pointer focus:border-indigo-500 shadow-3xs"
              >
                <option value="Stock count discrepancy">Stock discrepancy</option>
                <option value="Damaged goods">Damaged goods</option>
                <option value="Expired stock">Expired stock</option>
                <option value="System correction">System correction</option>
                <option value="Manual correction">Manual correction</option>
                <option value="Other">Other (Specify details)</option>
              </select>
            </div>

            {reason === 'Other' && (
              <div className="mb-4 animate-slide-in">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Specify Custom Details</label>
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Specify notes or transaction details..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-700 focus:border-indigo-500 shadow-3xs"
                  required
                />
              </div>
            )}

            {/* TRANSACTION PREVIEW IMPACT */}
            <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-100 border-dashed mt-5 shadow-3xs">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Adjustment Impact Preview</span>
              <div className="flex justify-between items-center mt-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-slate-400 font-semibold">Ledger Stockout Buffer</span>
                  <span className={`text-xl font-black ${isHealthy ? 'text-emerald-600' : 'text-rose-600 animate-pulse'}`}>
                    {newQty.toLocaleString()} units
                  </span>
                </div>
                <div className="text-right flex flex-col gap-0.5">
                  <span className="text-[9px] font-mono text-slate-400 tracking-wider">
                    {currentQty} {adjustType === 'ADD' ? '+' : '−'} {qtyChange}
                  </span>
                  <span className={`text-[10px] font-bold ${adjustType === 'ADD' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {adjustType === 'ADD' ? 'Stock Added' : 'Stock Removed'}
                  </span>
                </div>
              </div>
            </div>

            {/* SAFETY BANNER WARNING */}
            {!isHealthy ? (
              <div className="flex items-start gap-2 bg-rose-50 border border-rose-100 rounded-xl p-3 text-[10px] text-rose-700 font-semibold mt-3 shadow-2xs shadow-rose-50">
                <span className="text-[12px] shrink-0 mt-0.5">⚠️</span>
                <span>
                  <strong>Safety Threshold Alert:</strong> Balance will fall below the safety target ({reorderPoint} units). An automated reorder suggestion will be raised.
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[10px] text-emerald-700 font-semibold mt-3 shadow-2xs shadow-emerald-50">
                <span className="text-[12px] shrink-0 mt-0.5">✓</span>
                <span>
                  <strong>Healthy Stock Buffer:</strong> Proposed balance meets or exceeds the warehouse safety target.
                </span>
              </div>
            )}

            {/* FORM BUTTONS */}
            <div className="flex gap-2.5 mt-5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 rounded-xl py-2.5 text-xs font-black tracking-wide uppercase transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-black hover:bg-zinc-900 text-white border-none rounded-xl py-2.5 text-xs font-black tracking-wide uppercase transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Applying...' : 'Apply adjustment →'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Audit Ledger Feed */}
        <div className="w-full md:w-1/2 p-5 bg-slate-50/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
              <div className="flex flex-col gap-0.5">
                <h3 className="font-black text-xs text-slate-800 uppercase tracking-wider">
                  Live Audit Ledger
                </h3>
                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Real-time Stock logs</p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-650 bg-transparent border-none cursor-pointer p-0.5 hidden md:flex items-center justify-center transition-colors"
              >
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col flex-1 divide-y divide-slate-100 overflow-y-auto max-h-[460px] scrollbar-hide pr-1">
              {recentAdjustments.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                    📊
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    No recent adjustments
                  </span>
                </div>
              ) : (
                recentAdjustments.map((item) => {
                  const isPositive = item.qty > 0;
                  return (
                    <div key={item.id} className="flex justify-between items-center py-3.5 hover:bg-slate-50/60 px-2.5 -mx-2.5 rounded-xl transition-all duration-150 group">
                      <div className="flex flex-col gap-0.5">
                        <div className="font-bold text-[12.5px] text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
                          {item.productName}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                          {item.warehouseCode} · {item.reason}
                        </div>
                      </div>

                      <span className={`font-mono text-xs font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider whitespace-nowrap shadow-2xs ${isPositive
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                        : 'bg-rose-50 border-rose-100 text-rose-600'
                        }`}>
                        {isPositive ? `+${item.qty}` : item.qty}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Ledger bottom footer info */}
          <div className="mt-4 pt-3.5 border-t border-slate-200/80 flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
            <span>VeloSync Audit Ledger</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Synced
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdjustStockModal;
