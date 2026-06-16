import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

const GeneratePurchaseOrderModal = ({
  isOpen,
  onClose,
  suppliers,
  warehouses,
  products,
  onSubmit,
  prefillData = null
}) => {
  const [supplierId, setSupplierId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [lines, setLines] = useState([{ productId: '', quantityOrdered: 1, unitCost: 0.00 }]);
  const [submitting, setSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const { user } = useSelector(state => state.auth);
  const isManager = user?.role === 'WarehouseManager';
  const managerWarehouseId = user?.warehouseId?.toString();

  const allowedWarehouses = useMemo(() => {
    return isManager && managerWarehouseId
      ? warehouses.filter(w => w.id.toString() === managerWarehouseId)
      : warehouses;
  }, [warehouses, isManager, managerWarehouseId]);

  useEffect(() => {
    if (!isOpen) {
      setInitialized(false);
      return;
    }

    if (isOpen && !initialized) {
      setSupplierId(prefillData?.supplierId || suppliers[0]?.id || '');
      setWarehouseId(prefillData?.warehouseId || allowedWarehouses[0]?.id || '');

      if (prefillData) {
        if (prefillData.lines && prefillData.lines.length > 0) {
          setLines(prefillData.lines.map(l => ({
            productId: l.productId?.toString() || '',
            quantityOrdered: l.quantityOrdered || 1,
            unitCost: l.unitCost || 0.00
          })));
        } else if (prefillData.productId) {
          setLines([{
            productId: prefillData.productId.toString(),
            quantityOrdered: prefillData.quantityOrdered || 1,
            unitCost: prefillData.unitCost || 0.00
          }]);
        } else {
          setLines([{ productId: '', quantityOrdered: 1, unitCost: 0.00 }]);
        }
      } else {
        setLines([{ productId: '', quantityOrdered: 1, unitCost: 0.00 }]);
      }

      // Default expected date: 7 days from today
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      setExpectedDate(weekFromNow.toISOString().split('T')[0]);

      setInitialized(true);
    }
  }, [isOpen, initialized, prefillData, suppliers, allowedWarehouses]);

  if (!isOpen) return null;

  const handleAddLine = () => {
    setLines([...lines, { productId: '', quantityOrdered: 1, unitCost: 0.00 }]);
  };

  const handleRemoveLine = (idx) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== idx));
    }
  };

  const handleLineChange = (idx, field, value) => {
    const newLines = [...lines];

    if (field === 'productId') {
      newLines[idx].productId = value;
      // Prefill standard product cost if available (from backend product list)
      const selectedProd = products.find(p => p.id === Number(value));
      if (selectedProd) {
        newLines[idx].unitCost = Number(selectedProd.unitCost ?? selectedProd.price ?? 0);
      }
    } else if (field === 'quantityOrdered') {
      newLines[idx].quantityOrdered = Math.max(1, Number(value));
    } else if (field === 'unitCost') {
      newLines[idx].unitCost = Math.max(0, Number(value));
    }

    setLines(newLines);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!supplierId || !warehouseId || !expectedDate) return;

    // Filter out lines that don't have a valid product selected
    const validLines = lines.filter(l => l.productId !== '');
    if (validLines.length === 0) {
      alert('Please add at least one valid product line.');
      return;
    }

    setSubmitting(true);

    const payload = {
      supplierId: Number(supplierId),
      warehouseId: Number(warehouseId),
      expectedDate: new Date(expectedDate).toISOString(),
      suggestionId: prefillData?.suggestionId ? Number(prefillData.suggestionId) : null,
      lines: validLines.map(l => ({
        productId: Number(l.productId),
        quantityOrdered: Number(l.quantityOrdered),
        unitCost: Number(l.unitCost)
      }))
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

  const grandTotal = lines.reduce((acc, cur) => acc + (cur.quantityOrdered * cur.unitCost), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Box */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-xl max-w-2xl w-full mx-4 z-10 overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-white to-[#fcfdfe] shrink-0">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Create New Purchase Order
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleFormSubmit} className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* General Metadata Info Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Supplier select */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Supplier</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full bg-[#f8fafc] text-xs font-bold text-gray-700 px-3 py-2.5 rounded-xl border border-gray-100 outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
                required
              >
                <option value="" disabled>Select supplier...</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Warehouse select */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Deliver To Facility</label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full bg-[#f8fafc] text-xs font-bold text-gray-700 px-3 py-2.5 rounded-xl border border-gray-100 outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
                required
              >
                <option value="" disabled>Select location...</option>
                {allowedWarehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.code || `WH-${w.id}`} — {w.name}</option>
                ))}
              </select>
            </div>

            {/* Expected Delivery Date */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Expected Delivery</label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full bg-[#f8fafc] text-xs font-bold text-gray-700 px-3.5 py-2 rounded-xl border border-gray-100 outline-none focus:border-blue-500 focus:bg-white"
                required
              />
            </div>
          </div>

          {/* Dynamic Item Lines Grid */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Purchase Order Items</h4>
              <button
                type="button"
                onClick={handleAddLine}
                className="px-2.5 py-1.5 text-[10px] font-extrabold text-blue-600 bg-blue-50 hover:bg-blue-100/70 border border-blue-100 rounded-lg transition-all cursor-pointer"
              >
                ➕ Add Line Item
              </button>
            </div>

            <div className="space-y-2.5 max-h-[30vh] overflow-y-auto pr-1">
              {lines.map((line, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-end gap-2 bg-[#fdfdfd] border border-gray-100 p-2.5 rounded-xl relative group">
                  {/* Select Product */}
                  <div className="flex-1 w-full">
                    <label className="block text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">Product</label>
                    <select
                      value={line.productId}
                      onChange={(e) => handleLineChange(idx, 'productId', e.target.value)}
                      className="w-full bg-white text-[11px] font-bold text-gray-700 px-2 py-1.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 cursor-pointer"
                      required
                    >
                      <option value="">Select product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>[{p.sku}] — {p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="w-full sm:w-24">
                    <label className="block text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={line.quantityOrdered}
                      onChange={(e) => handleLineChange(idx, 'quantityOrdered', e.target.value)}
                      className="w-full bg-white text-[11px] font-bold text-gray-700 px-2.5 py-1.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Unit Cost */}
                  <div className="w-full sm:w-28">
                    <label className="block text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">Unit Cost (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.unitCost}
                      onChange={(e) => handleLineChange(idx, 'unitCost', e.target.value)}
                      className="w-full bg-white text-[11px] font-bold text-gray-700 px-2.5 py-1.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Subtotal Display */}
                  <div className="w-full sm:w-24 text-right pr-2 pb-2 text-xs font-extrabold text-gray-500">
                    ₹{(line.quantityOrdered * line.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>

                  {/* Remove line */}
                  {lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent self-end mb-1"
                      title="Remove Line"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Grand Total committed */}
          <div className="border-t border-gray-100 pt-4 flex justify-between items-center shrink-0">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estimated Total Committed Cost:</span>
            <span className="text-lg font-black text-gray-800">
              ₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex gap-3 pt-3 border-t border-gray-100 justify-end shrink-0">
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
              {submitting ? 'Generating...' : 'Raise Purchase Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeneratePurchaseOrderModal;
