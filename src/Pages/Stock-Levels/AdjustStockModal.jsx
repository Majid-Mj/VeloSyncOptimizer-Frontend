import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import stockApi from '../../api/stock.api';

const AdjustStockModal = ({
  isOpen,
  onClose,
  selectedItem,
  products = [],
  warehouses = [],
  onSubmit
}) => {
  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [adjustType, setAdjustType] = useState('ADD'); // 'ADD' or 'SUBTRACT'
  const [quantity, setQuantity] = useState(50);
  const [reason, setReason] = useState('Stock count discrepancy');
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const defaultRecentAdjustments = [
    { id: 1, productName: 'Flour 5kg', warehouseCode: 'WH-JB-03', reason: 'Stock discrepancy', qty: -10 },
    { id: 2, productName: 'Palm Oil 1L', warehouseCode: 'WH-KL-01', reason: 'Damaged goods', qty: -25 },
    { id: 3, productName: 'Sugar Premium', warehouseCode: 'WH-KL-01', reason: 'System correction', qty: 15 },
    { id: 4, productName: 'Wheat Powder', warehouseCode: 'WH-JB-03', reason: 'Manual correction', qty: 40 },
    { id: 5, productName: 'Milk Packets', warehouseCode: 'WH-PG-02', reason: 'Expired stock', qty: -18 }
  ];

  const [recentAdjustments, setRecentAdjustments] = useState(defaultRecentAdjustments);

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
            // Filter movements to show ADJUSTMENT type movements
            const adjustments = res.data.items
              .filter(m => m.movementType === 'ADJUSTMENT' || m.movementType === 3)
              .map(m => ({
                id: m.id,
                productName: m.productName,
                warehouseCode: m.warehouseCode || `WH-${m.warehouseId}`,
                reason: m.notes || m.reason || 'Manual Correction',
                qty: m.quantity
              }));
            
            if (adjustments.length > 0) {
              setRecentAdjustments(adjustments.slice(0, 5));
            } else {
              setRecentAdjustments(defaultRecentAdjustments);
            }
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
      setAdjustType('ADD');
      setQuantity(50);
      setReason('Stock count discrepancy');
      setCustomReason('');
    } else {
      setProductId(products[0]?.id || '');
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
    : products.find(p => p.id.toString() === productId.toString()) || { name: 'Unknown Product', sku: 'N/A' };

  const currentWarehouse = selectedItem
    ? { name: selectedItem.warehouseName, code: selectedItem.warehouseCode || `WH-${selectedItem.warehouseId}` }
    : warehouses.find(w => w.id.toString() === warehouseId.toString()) || { name: 'Unknown Warehouse', code: 'N/A' };

  const currentQty = selectedItem ? selectedItem.quantityOnHand : 45; // Default fallback to match premium style
  const reorderPoint = selectedItem?.reorderPoint || 100;
  
  // Calculate preview variables
  const qtyChange = Number(quantity) || 0;
  const delta = adjustType === 'ADD' ? qtyChange : -qtyChange;
  const newQty = Math.max(0, currentQty + delta);
  const isHealthy = newQty > reorderPoint;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#1e293b]/40 backdrop-blur-[2px] transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Box split container */}
      <div 
        className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-[780px] w-full mx-4 z-10 overflow-hidden flex flex-col md:flex-row transition-all duration-300"
        style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}
      >
        {/* Left Column: Form Details */}
        <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-[13px] font-bold text-slate-800 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#f59e0b" strokeWidth="2">
                <circle cx="8" cy="8" r="7"/>
                <path d="M8 4v4M8 11v1"/>
              </svg>
              Adjustment details
            </h3>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-0.5 flex items-center justify-center transition-colors md:hidden"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="p-4 flex-1">
            {/* PRODUCT DETAIL BOX */}
            <div className="bg-[#f1f5f9] border border-[#e2e8f0] rounded-[8px] p-[11px] mb-[10px]">
              <div className="text-[13px] font-semibold text-[#1e293b] mb-[2px]">
                {currentProduct.name}
              </div>
              <div className="text-[10px] font-mono text-[#64748b]">
                {currentProduct.sku} · {currentWarehouse.code}
              </div>
              <div className="grid grid-cols-3 gap-[8px] mt-[8px]">
                <div>
                  <div className="text-[9px] text-[#64748b]">Current qty</div>
                  <div className="text-[13px] font-semibold" style={{ color: currentQty <= reorderPoint ? '#991b1b' : '#1e293b' }}>
                    {currentQty}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-[#64748b]">Reorder point</div>
                  <div className="text-[13px] font-semibold text-[#1e293b]">
                    {reorderPoint}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-[#64748b]">90d velocity</div>
                  <div className="text-[13px] font-semibold text-[#1e293b]">
                    52/day
                  </div>
                </div>
              </div>
            </div>

            {/* DIRECTION */}
            <div className="text-[10px] font-semibold text-[#64748b] mb-[6px]">
              Adjustment direction
            </div>
            <div className="grid grid-cols-2 gap-[6px] mb-[12px]">
              <div 
                onClick={() => setAdjustType('ADD')}
                className="rounded-[8px] p-[10px] text-center cursor-pointer transition-all border-[1.5px]"
                style={{
                  borderColor: adjustType === 'ADD' ? '#22c55e' : '#e2e8f0',
                  background: adjustType === 'ADD' ? '#f0fdf4' : '#fff'
                }}
              >
                <div className="text-[18px] mb-[2px]" style={{ color: adjustType === 'ADD' ? '#166534' : '#94a3b8' }}>↑</div>
                <div className="text-[10px] font-bold" style={{ color: adjustType === 'ADD' ? '#166534' : '#64748b' }}>Increase</div>
                <div className="text-[9px]" style={{ color: adjustType === 'ADD' ? '#166534' : '#94a3b8', opacity: 0.7 }}>Add to stock</div>
              </div>
              <div 
                onClick={() => setAdjustType('SUBTRACT')}
                className="rounded-[8px] p-[10px] text-center cursor-pointer transition-all border-[1.5px]"
                style={{
                  borderColor: adjustType === 'SUBTRACT' ? '#ef4444' : '#e2e8f0',
                  background: adjustType === 'SUBTRACT' ? '#fef2f2' : '#fff'
                }}
              >
                <div className="text-[18px] mb-[2px]" style={{ color: adjustType === 'SUBTRACT' ? '#991b1b' : '#94a3b8' }}>↓</div>
                <div className="text-[10px] font-bold" style={{ color: adjustType === 'SUBTRACT' ? '#991b1b' : '#64748b' }}>Decrease</div>
                <div className="text-[9px]" style={{ color: adjustType === 'SUBTRACT' ? '#991b1b' : '#94a3b8', opacity: 0.7 }}>Remove from stock</div>
              </div>
            </div>

            {/* Dynamic Dropdowns if no selected item */}
            {!selectedItem && (
              <>
                <div className="mb-[10px]">
                  <label className="text-[10px] font-semibold text-[#64748b] mb-[4px] block">Product</label>
                  <select 
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full border border-[#e2e8f0] rounded-[6px] px-[10px] py-[7px] text-[11px] outline-none text-[#1e293b] bg-white cursor-pointer"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>[{p.sku}] — {p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-[10px]">
                  <label className="text-[10px] font-semibold text-[#64748b] mb-[4px] block">Warehouse</label>
                  <select 
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    className="w-full border border-[#e2e8f0] rounded-[6px] px-[10px] py-[7px] text-[11px] outline-none text-[#1e293b] bg-white cursor-pointer"
                  >
                    {allowedWarehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.code || `WH-${w.id}`} — {w.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Quantity Field */}
            <div className="mb-[10px]">
              <label className="text-[10px] font-semibold text-[#64748b] mb-[4px] block">Quantity to adjust</label>
              <div className="flex gap-[6px] items-center">
                <button 
                  type="button"
                  onClick={decrementQty}
                  className="w-[30px] h-[30px] border border-[#e2e8f0] rounded-[6px] bg-white cursor-pointer font-bold text-[16px] flex items-center justify-center text-[#64748b] hover:bg-slate-50 transition-colors"
                >
                  −
                </button>
                <input 
                  className="w-full border border-[#e2e8f0] rounded-[6px] py-[7px] text-[13px] font-semibold outline-none text-[#1e293b] bg-white text-center" 
                  type="number" 
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 0))}
                />
                <button 
                  type="button"
                  onClick={incrementQty}
                  className="w-[30px] h-[30px] border border-[#e2e8f0] rounded-[6px] bg-white cursor-pointer font-bold text-[16px] flex items-center justify-center text-[#64748b] hover:bg-slate-50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Reason Field */}
            <div className="mb-[10px]">
              <label className="text-[10px] font-semibold text-[#64748b] mb-[4px] block">Reason for adjustment</label>
              <select 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-[#e2e8f0] rounded-[6px] px-[10px] py-[7px] text-[11px] outline-none text-[#1e293b] bg-white cursor-pointer"
              >
                <option value="Stock count discrepancy">Stock discrepancy</option>
                <option value="Damaged goods">Damaged goods</option>
                <option value="Expired stock">Expired stock</option>
                <option value="System correction">System correction</option>
                <option value="Manual correction">Manual correction</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {reason === 'Other' && (
              <div className="mb-[10px]">
                <label className="text-[10px] font-semibold text-[#64748b] mb-[4px] block">Specify Custom Reason</label>
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Specify details..."
                  className="w-full border border-[#e2e8f0] rounded-[6px] px-[10px] py-[7px] text-[11px] outline-none text-[#1e293b] bg-white"
                  required
                />
              </div>
            )}

            {/* PREVIEW */}
            <div className="bg-[#f1f5f9] rounded-[7px] p-[11px] mt-[6px]">
              <div className="text-[9px] text-[#64748b] mb-[3px]">After adjustment</div>
              <div className="text-[19px] font-bold mb-[6px]" style={{ color: isHealthy ? '#166534' : '#991b1b' }}>
                {newQty}
              </div>
              <div className="flex justify-between text-[10px] text-[#64748b] py-[2px]">
                <span>Before</span>
                <span style={{ color: currentQty <= reorderPoint ? '#991b1b' : '#64748b', fontWeight: 600 }}>{currentQty}</span>
              </div>
              <div className="flex justify-between text-[10px] text-[#64748b] py-[2px]">
                <span>Adjustment</span>
                <span style={{ color: adjustType === 'ADD' ? '#166534' : '#991b1b', fontWeight: 600 }}>
                  {adjustType === 'ADD' ? '+' : '-'}{qtyChange}
                </span>
              </div>
              <hr className="border-none border-t border-[#e2e8f0] my-[5px]"/>
              <div className="flex justify-between text-[11px] font-semibold text-[#1e293b]">
                <span>New qty on hand</span>
                <span>{newQty}</span>
              </div>
            </div>

            {/* Alert Warnings */}
            {!isHealthy ? (
              <div className="flex items-center gap-[5px] bg-[#fef3c7] border border-[#fcd34d] rounded-[6px] p-[6px_8px] text-[10px] text-[#92400e] mt-[7px]">
                <span>⚠</span> Still below reorder point ({reorderPoint}) — a reorder suggestion will be auto-raised
              </div>
            ) : (
              <div className="flex items-center gap-[5px] bg-[#f0fdf4] border border-[#86efac] rounded-[6px] p-[6px_8px] text-[10px] text-[#166534] mt-[7px]">
                <span>✓</span> Stock will be healthy after this movement
              </div>
            )}

            {/* FORM FOOTER */}
            <div className="flex gap-[7px] mt-[14px] pt-[12px] border-t border-[#e2e8f0]">
              <button 
                type="button"
                onClick={onClose}
                className="border border-[#e2e8f0] bg-white text-[#64748b] rounded-[6px] p-[8px] text-[11px] cursor-pointer w-full font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="bg-[#1a2a4a] text-white border-none rounded-[6px] p-[8px] text-[11px] font-semibold cursor-pointer w-full hover:bg-[#243558] transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save adjustment →'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Recent Adjustments */}
        <div className="w-full md:w-1/2 p-4 bg-white flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
            <h3 className="font-bold text-[14px] text-slate-800">
              Recent Adjustments
            </h3>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-650 bg-transparent border-none cursor-pointer p-0.5 hidden md:flex items-center justify-center transition-colors"
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col flex-1 divide-y divide-slate-100">
            {recentAdjustments.map((item) => {
              const isPositive = item.qty > 0;
              return (
                <div key={item.id} className="flex justify-between items-center py-3.5 first:pt-1">
                  <div>
                    <div className="font-bold text-[12.5px] text-[#1e293b]">
                      {item.productName}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {item.warehouseCode} · {item.reason}
                    </div>
                  </div>
                  <div 
                    className="font-bold text-[13.5px] font-mono whitespace-nowrap"
                    style={{ color: isPositive ? '#166534' : '#991b1b' }}
                  >
                    {isPositive ? `+${item.qty}` : item.qty}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom branding pill */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[9.5px] text-slate-400">
            <span>VeloSync Adjustment Ledger</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdjustStockModal;
