import React, { useState, useEffect } from 'react';
import reorderApi from '../../api/reorder.api';

const EditReorderPointModal = ({
  isOpen,
  onClose,
  selectedItem,
  onSubmit
}) => {
  const [reorderPoint, setReorderPoint] = useState(10);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedItem) {
      setReorderPoint(selectedItem.reorderPoint || 0);
    }
  }, [selectedItem, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSubmitting(true);
    try {
      await onSubmit(selectedItem.id, Number(reorderPoint));
      onClose();
    } catch (err) {
      console.error('Failed to submit reorder point adjustment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const incrementPoint = (e) => {
    e.preventDefault();
    setReorderPoint(prev => Math.max(0, (Number(prev) || 0) + 5));
  };

  const decrementPoint = (e) => {
    e.preventDefault();
    setReorderPoint(prev => Math.max(0, (Number(prev) || 0) - 5));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-[480px] w-full z-10 overflow-hidden flex flex-col transition-all duration-300 transform scale-100 animate-fade-in">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200/60 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Configure Reorder Point
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-0.5 flex items-center justify-center transition-colors"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleFormSubmit} className="p-5 flex flex-col gap-4">
          
          {/* Active Context Card */}
          {selectedItem && (
            <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 shadow-3xs">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Product Context</span>
              <div className="text-[13px] font-black text-slate-800 leading-snug mt-0.5">
                {selectedItem.productName}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[9px] font-bold font-mono bg-slate-100 border border-slate-200/50 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {selectedItem.sku}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  · {selectedItem.warehouseCode} ({selectedItem.warehouseName})
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-slate-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Current Stock</span>
                  <span className="text-[13px] font-black text-slate-800">
                    {(selectedItem.quantityOnHand || 0).toLocaleString()} units
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 border-l border-slate-100 pl-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Current Target</span>
                  <span className="text-[13px] font-black text-slate-600">
                    {(selectedItem.reorderPoint || 0).toLocaleString()} units
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Reorder Point Input */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
              New Reorder Point (Safety Threshold)
            </label>
            <div className="flex gap-2 items-center">
              <button
                type="button"
                onClick={decrementPoint}
                className="w-9 h-9 border border-slate-200 rounded-xl bg-white cursor-pointer font-black text-sm flex items-center justify-center text-slate-500 hover:bg-slate-50 active:scale-95 transition-all shadow-3xs"
              >
                −5
              </button>
              <input
                type="number"
                min="0"
                value={reorderPoint}
                onChange={(e) => setReorderPoint(Math.max(0, Number(e.target.value) || 0))}
                className="flex-1 border border-slate-200 rounded-xl py-2 text-sm font-black outline-none text-slate-800 text-center focus:border-indigo-500 shadow-3xs"
                required
              />
              <button
                type="button"
                onClick={incrementPoint}
                className="w-9 h-9 border border-slate-200 rounded-xl bg-white cursor-pointer font-black text-sm flex items-center justify-center text-slate-500 hover:bg-slate-50 active:scale-95 transition-all shadow-3xs"
              >
                +5
              </button>
            </div>
            <p className="text-[9.5px] text-slate-400 font-medium mt-1.5 leading-normal">
              When the available quantity drops to or below this number, the reorder engine triggers a low-stock alert and suggests replenishment.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2.5 mt-2 pt-4 border-t border-slate-100">
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
              className="flex-1 bg-[#704efe] hover:bg-[#5c3edd] text-white border-none rounded-xl py-2.5 text-xs font-black tracking-wide uppercase shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditReorderPointModal;
