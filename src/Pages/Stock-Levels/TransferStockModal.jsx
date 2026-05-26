import React, { useState, useEffect } from 'react';
import stockApi from '../../api/stock.api';

const TransferStockModal = ({
  isOpen,
  onClose,
  selectedItem,
  warehouses,
  products = [],
  onSubmit,
  onSuccess
}) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedSourceWarehouseId, setSelectedSourceWarehouseId] = useState('');
  const [destWarehouseId, setDestWarehouseId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [allStockLevels, setAllStockLevels] = useState([]);
  const [loadingStock, setLoadingStock] = useState(false);

  const isModeSelectable = !selectedItem;

  const currentProductId = isModeSelectable ? Number(selectedProductId) : Number(selectedItem?.productId);
  const currentSourceWarehouseId = isModeSelectable ? Number(selectedSourceWarehouseId) : Number(selectedItem?.warehouseId);

  const matchedStock = isModeSelectable
    ? allStockLevels.find(
      s => s.productId === Number(selectedProductId) && s.warehouseId === Number(selectedSourceWarehouseId)
    )
    : null;

  const availableStock = isModeSelectable
    ? (matchedStock ? (matchedStock.quantityOnHand - matchedStock.quantityReserved) : 0)
    : (selectedItem ? (selectedItem.quantityOnHand - selectedItem.quantityReserved) : 0);

  // Filter out the source warehouse from destination options
  const targetWarehouses = warehouses.filter(
    w => currentSourceWarehouseId && w.id !== currentSourceWarehouseId
  );

  // Fetch all stock levels when open in selectable mode
  useEffect(() => {
    if (isOpen && isModeSelectable) {
      const loadStock = async () => {
        setLoadingStock(true);
        try {
          const res = await stockApi.getAll();
          if (res.isSuccess) {
            setAllStockLevels(res.data || []);
          }
        } catch (err) {
          console.error('Failed to load stock levels in TransferStockModal:', err);
        } finally {
          setLoadingStock(false);
        }
      };
      loadStock();
    }
  }, [isOpen, isModeSelectable]);

  // Set default form values on open
  useEffect(() => {
    if (isOpen) {
      if (isModeSelectable) {
        if (products.length > 0) setSelectedProductId(products[0].id.toString());
        if (warehouses.length > 0) setSelectedSourceWarehouseId(warehouses[0].id.toString());
        setQuantity('');
        setNotes('');
      } else {
        setQuantity('');
        setNotes('');
      }
    }
  }, [isOpen, isModeSelectable, products, warehouses, selectedItem]);

  // Dynamically set destination warehouse when source changes
  useEffect(() => {
    if (targetWarehouses.length > 0) {
      setDestWarehouseId(targetWarehouses[0]?.id.toString() || '');
    } else {
      setDestWarehouseId('');
    }
  }, [currentSourceWarehouseId, warehouses]);

  if (!isOpen) return null;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!currentSourceWarehouseId || !destWarehouseId || !currentProductId || !quantity || Number(quantity) <= 0) return;

    if (Number(quantity) > availableStock) {
      alert(`Transfer amount exceeds available stock. Current available is ${availableStock} units.`);
      return;
    }

    setSubmitting(true);

    const sourceName = isModeSelectable
      ? (warehouses.find(w => w.id === Number(currentSourceWarehouseId))?.name || 'Source')
      : (selectedItem.warehouseName || 'Source');

    const destName = warehouses.find(w => w.id === Number(destWarehouseId))?.name || 'Destination';

    const payload = {
      productId: Number(currentProductId),
      sourceWarehouseId: Number(currentSourceWarehouseId),
      destWarehouseId: Number(destWarehouseId),
      quantity: Number(quantity),
      notes: notes || `Internal Warehouse Transfer from ${sourceName} to ${destName}`
    };

    try {
      if (onSubmit) {
        await onSubmit(payload);
      } else {
        const res = await stockApi.transfer(payload);
        if (res.isSuccess) {
          if (onSuccess) {
            onSuccess(`Stock transfer completed! Code: ${res.data?.transferNumber || ''}`, 'success');
          }
        } else {
          throw new Error(res.message || 'Failed to execute transfer');
        }
      }
      onClose();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to execute stock transfer';
      if (onSuccess) {
        onSuccess(errMsg, 'error');
      } else {
        alert(errMsg);
      }
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
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Transfer Stock Between Facilities
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
          {/* Transfer Context Overview */}
          {selectedItem ? (
            <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-xl space-y-1 text-xs">
              <p className="font-bold text-gray-700">Product Model: <span className="text-emerald-700 font-extrabold">{selectedItem.productName}</span></p>
              <p className="font-bold text-gray-400">SKU Code: <span className="text-gray-600 font-mono font-bold">{selectedItem.sku}</span></p>
              <p className="font-bold text-gray-500 mt-1">Source Facility: <span className="text-gray-700 font-extrabold">{selectedItem.warehouseName} ({selectedItem.warehouseCode})</span></p>
              <p className="font-bold text-gray-500 mt-1">Available to Move: <span className="text-emerald-600 font-extrabold">{availableStock.toLocaleString()} units</span> <span className="text-gray-400 font-semibold">(On Hand: {selectedItem.quantityOnHand} | Reserved: {selectedItem.quantityReserved})</span></p>
            </div>
          ) : (
            <>
              {/* Product Selector */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Select Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-[#f8fafc] text-xs font-bold text-gray-700 px-3.5 py-2.5 rounded-xl border border-gray-100 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                  required
                >
                  {products.length === 0 ? (
                    <option value="" disabled>No products available</option>
                  ) : (
                    products.map(p => (
                      <option key={p.id} value={p.id}>
                        [{p.sku}] — {p.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Source Facility Selector */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Select Source Warehouse</label>
                <select
                  value={selectedSourceWarehouseId}
                  onChange={(e) => setSelectedSourceWarehouseId(e.target.value)}
                  className="w-full bg-[#f8fafc] text-xs font-bold text-gray-700 px-3.5 py-2.5 rounded-xl border border-gray-100 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                  required
                >
                  {warehouses.length === 0 ? (
                    <option value="" disabled>No warehouses available</option>
                  ) : (
                    warehouses.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.code || `WH-${w.id}`} — {w.name} ({w.city})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Available Stock Indicator */}
              <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-xl space-y-1 text-xs">
                {loadingStock ? (
                  <p className="font-bold text-gray-500 animate-pulse">🔄 Fetching current available stock levels...</p>
                ) : (
                  <p className="font-bold text-gray-500">
                    Available to Move: <span className="text-emerald-600 font-extrabold">{availableStock.toLocaleString()} units</span>
                    {matchedStock && (
                      <span className="text-gray-400 font-semibold"> (On Hand: {matchedStock.quantityOnHand} | Reserved: {matchedStock.quantityReserved})</span>
                    )}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Destination Facility Dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Select Destination Warehouse</label>
            <select
              value={destWarehouseId}
              onChange={(e) => setDestWarehouseId(e.target.value)}
              className="w-full bg-[#f8fafc] text-xs font-bold text-gray-700 px-3.5 py-2.5 rounded-xl border border-gray-100 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
              required
            >
              {targetWarehouses.length === 0 ? (
                <option value="" disabled>No other warehouses available</option>
              ) : (
                targetWarehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.code || `WH-${w.id}`} — {w.name} ({w.city})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Transfer Quantity Field */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Transfer Quantity</label>
            <input
              type="number"
              min="1"
              max={availableStock}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={`Max: ${availableStock}`}
              className="w-full bg-[#f8fafc] text-xs font-bold text-gray-700 px-3.5 py-2.5 rounded-xl border border-gray-100 outline-none focus:border-blue-500 focus:bg-white transition-all"
              required
            />
          </div>

          {/* Notes Field */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Transfer Notes / Reason</label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide tracking notes for the inventory transfer ledger..."
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
              disabled={submitting || targetWarehouses.length === 0}
              className="px-4.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Transferring...' : 'Execute Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferStockModal;
