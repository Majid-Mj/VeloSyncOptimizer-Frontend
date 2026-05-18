import React, { useState, useEffect } from 'react';

const AdjustStockModal = ({
  isOpen,
  onClose,
  selectedItem,
  products,
  warehouses,
  onSubmit
}) => {
  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [adjustType, setAdjustType] = useState('ADD'); // 'ADD' or 'SUBTRACT'
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedItem) {
      setProductId(selectedItem.productId);
      setWarehouseId(selectedItem.warehouseId);
      setAdjustType('ADD');
      setQuantity('');
      setReason('');
    } else {
      setProductId(products[0]?.id || '');
      setWarehouseId(warehouses[0]?.id || '');
      setAdjustType('ADD');
      setQuantity('');
      setReason('');
    }
  }, [selectedItem, isOpen, products, warehouses]);

  if (!isOpen) return null;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !warehouseId || !quantity || Number(quantity) <= 0) return;

    setSubmitting(true);
    // Transform absolute input into delta quantity
    const deltaQuantity = adjustType === 'ADD' ? Number(quantity) : -Number(quantity);

    const payload = {
      productId: Number(productId),
      warehouseId: Number(warehouseId),
      quantity: deltaQuantity,
      reason: reason || `Manual Stock Adjustment (${adjustType})`
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Box */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-xl max-w-md w-full mx-4 z-10 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-white to-[#fcfdfe]">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Adjust Stock Level
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
          {selectedItem ? (
            // Read-only info if editing existing
            <div className="bg-blue-50/50 border border-blue-100 p-3.5 rounded-xl space-y-1 text-xs">
              <p className="font-bold text-gray-700">Product: <span className="text-blue-600 font-extrabold">{selectedItem.productName}</span></p>
              <p className="font-bold text-gray-400">SKU: <span className="text-gray-600 font-mono font-bold">{selectedItem.sku}</span></p>
              <p className="font-bold text-gray-500 mt-1">Warehouse: <span className="text-gray-700 font-extrabold">{selectedItem.warehouseName}</span></p>
              <p className="font-bold text-gray-400 mt-1">Current On Hand: <span className="text-gray-800 font-extrabold">{selectedItem.quantityOnHand.toLocaleString()} units</span></p>
            </div>
          ) : (
            // Dropdowns if adjusting fresh/new item
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Select Product</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full bg-[#f8fafc] text-xs font-bold text-gray-700 px-3.5 py-2.5 rounded-xl border border-gray-100 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>Choose a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.sku}] — {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Select Location</label>
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="w-full bg-[#f8fafc] text-xs font-bold text-gray-700 px-3.5 py-2.5 rounded-xl border border-gray-100 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>Choose a facility...</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.code || `WH-${w.id}`} — {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Action Type */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Adjustment Action</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustType('ADD')}
                className={`py-2 px-3 text-xs font-extrabold rounded-xl border cursor-pointer transition-all flex items-center justify-center gap-1 ${
                  adjustType === 'ADD'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-100'
                    : 'bg-white border-gray-150 text-gray-500 hover:bg-gray-50'
                }`}
              >
                ➕ Add Stock (Receive)
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('SUBTRACT')}
                className={`py-2 px-3 text-xs font-extrabold rounded-xl border cursor-pointer transition-all flex items-center justify-center gap-1 ${
                  adjustType === 'SUBTRACT'
                    ? 'bg-red-50 border-red-500 text-red-700 ring-2 ring-red-100'
                    : 'bg-white border-gray-150 text-gray-500 hover:bg-gray-50'
                }`}
              >
                ➖ Deduct Stock (Issue)
              </button>
            </div>
          </div>

          {/* Quantity Field */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Adjustment Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 50"
              className="w-full bg-[#f8fafc] text-xs font-bold text-gray-700 px-3.5 py-2.5 rounded-xl border border-gray-100 outline-none focus:border-blue-500 focus:bg-white transition-all"
              required
            />
          </div>

          {/* Reason Field */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Adjustment Reason / Notes</label>
            <textarea
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a reason (e.g., cycle count correction, damage write-off, receipt)..."
              className="w-full bg-[#f8fafc] text-xs font-bold text-gray-700 px-3.5 py-2.5 rounded-xl border border-gray-100 outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
              required
            />
          </div>

          {/* Modal Footer */}
          <div className="flex gap-3 pt-3 border-t border-gray-100 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-extrabold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-blue-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Processing...' : 'Apply Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustStockModal;
