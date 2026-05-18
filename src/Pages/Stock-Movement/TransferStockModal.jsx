import React, { useState, useEffect, useMemo } from 'react';
import stockApi from '../../api/stock.api';

const TransferStockModal = ({ isOpen, onClose, warehouses, products, onSuccess }) => {
  const [productId, setProductId] = useState('');
  const [sourceWarehouseId, setSourceWarehouseId] = useState('');
  const [destWarehouseId, setDestWarehouseId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  // Local state for stock checks and loading sequences
  const [checkingStock, setCheckingStock] = useState(false);
  const [availableStock, setAvailableStock] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Reset form states on toggle
  useEffect(() => {
    if (isOpen) {
      setProductId('');
      setSourceWarehouseId('');
      setDestWarehouseId('');
      setQuantity('');
      setNotes('');
      setAvailableStock(null);
      setFormError(null);
    }
  }, [isOpen]);

  // Fetch live stock level for selected product at source warehouse
  useEffect(() => {
    const fetchLiveStock = async () => {
      if (!productId || !sourceWarehouseId) {
        setAvailableStock(null);
        return;
      }

      setCheckingStock(true);
      try {
        const response = await stockApi.getByWarehouse(Number(sourceWarehouseId));
        if (response.isSuccess && response.data) {
          // Find active matching product stock level
          const match = response.data.find(s => s.productId === Number(productId));
          setAvailableStock(match ? match.onHand : 0);
        } else {
          setAvailableStock(0);
        }
      } catch (err) {
        console.error('Failed to query live source warehouse stock:', err);
        setAvailableStock(0);
      } finally {
        setCheckingStock(false);
      }
    };

    fetchLiveStock();
  }, [productId, sourceWarehouseId]);

  // Filter destination options to exclude the selected source
  const destinationOptions = useMemo(() => {
    if (!sourceWarehouseId) return warehouses;
    return warehouses.filter(w => w.id !== Number(sourceWarehouseId));
  }, [warehouses, sourceWarehouseId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const qtyNum = Number(quantity);
    if (!productId || !sourceWarehouseId || !destWarehouseId || !quantity) {
      setFormError('Please populate all required transfer parameters.');
      return;
    }

    if (qtyNum <= 0) {
      setFormError('Transfer quantity must be greater than zero.');
      return;
    }

    if (availableStock !== null && qtyNum > availableStock) {
      setFormError(`Insufficient stock level. Maximum available at source is ${availableStock} units.`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        productId: Number(productId),
        sourceWarehouseId: Number(sourceWarehouseId),
        destWarehouseId: Number(destWarehouseId),
        quantity: qtyNum,
        notes: notes.trim() || null
      };

      const response = await stockApi.transfer(payload);
      if (response.isSuccess) {
        onSuccess('Stock transfer logged and executed successfully.', 'success');
        onClose();
      } else {
        setFormError(response.message || 'Failed to complete stock transfer.');
      }
    } catch (err) {
      console.error('Transfer execution error:', err);
      setFormError(
        err.response?.data?.errors?.[0] || 
        err.response?.data?.message || 
        'Network error executing transfer.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Dark backdrop blur */}
      <div 
        className="fixed inset-0 bg-gray-900/65 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-lg overflow-hidden z-10 transform scale-100 transition-all duration-300 animate-in fade-in zoom-in-95">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4.5 text-white flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-100 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Transfer Inventory Stock
            </h3>
            <p className="text-[10px] text-blue-100/80 font-bold mt-0.5 tracking-wide uppercase">
              Relocate items between distribution locations
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg border-none cursor-pointer transition-colors"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Form body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          
          {/* Error Banner */}
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2 animate-shake">
              <span className="text-sm">⚠️</span>
              <p className="leading-normal">{formError}</p>
            </div>
          )}

          {/* Product Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
              Product Definition <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
            >
              <option value="">Select inventory product item...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          {/* Grid Layout for Warehouses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Source Warehouse */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                Source Warehouse <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                value={sourceWarehouseId}
                onChange={(e) => {
                  setSourceWarehouseId(e.target.value);
                  if (destWarehouseId === e.target.value) {
                    setDestWarehouseId('');
                  }
                }}
                required
              >
                <option value="">Select source...</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Warehouse */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                Destination Warehouse <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                value={destWarehouseId}
                onChange={(e) => setDestWarehouseId(e.target.value)}
                required
                disabled={!sourceWarehouseId}
              >
                <option value="">Select destination...</option>
                {destinationOptions.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Quantity & Available Stock */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                Transfer Quantity <span className="text-red-500">*</span>
              </label>
              
              {/* Dynamic Live Stock Label Badge */}
              {productId && sourceWarehouseId && (
                <div className="flex items-center gap-1.5">
                  {checkingStock ? (
                    <span className="text-[10px] font-bold text-gray-400 animate-pulse">Checking stock...</span>
                  ) : (
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                      availableStock > 0 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                        : 'bg-rose-50 border-rose-100 text-rose-600'
                    }`}>
                      Available: {availableStock} units
                    </span>
                  )}
                </div>
              )}
            </div>

            <input
              type="number"
              min="1"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder:text-gray-300"
              placeholder="e.g. 25"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          {/* Notes Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
              Transaction Notes
            </label>
            <textarea
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder:text-gray-300 resize-none h-20"
              placeholder="Enter context, transfer reasons, tracking IDs or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
            />
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs rounded-xl transition-all border-none cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || checkingStock}
              className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-100 hover:shadow-lg hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:shadow-none transition-all flex items-center gap-1.5 border-none cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Executing...
                </>
              ) : (
                'Confirm Transfer'
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default TransferStockModal;
