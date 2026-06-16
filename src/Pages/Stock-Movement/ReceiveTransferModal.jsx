import React, { useState, useEffect } from 'react';

const ReceiveTransferModal = ({
  isOpen,
  onClose,
  transfer,
  onSubmit
}) => {
  const [isStockConfirmed, setIsStockConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsStockConfirmed(false);
    }
  }, [isOpen]);

  if (!isOpen || !transfer) return null;

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!isStockConfirmed) {
      alert('You must confirm and check the intake verification box before proceeding.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(transfer.id);
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
      <div className="fixed inset-0 bg-[#11121d]/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative bg-white rounded-3xl border border-[#eff1f5] shadow-2xl max-w-lg w-full mx-4 z-50 overflow-hidden animate-scale-up max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#eff1f5] flex items-center justify-between shrink-0">
          <h3 className="text-xs font-black text-slate-805 uppercase tracking-wider flex items-center gap-2">
            <svg className="w-5 h-5 text-[#704efe]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
            </svg>
            Warehouse Intake: {transfer.transferNumber}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer rounded-2xl hover:bg-slate-50 transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Info panel */}
        <div className="bg-slate-50 border-b border-[#eff1f5] px-6 py-3.5 shrink-0 text-[11px] flex flex-wrap justify-between gap-3 font-bold text-slate-500 uppercase">
          <p>Source: <span className="text-slate-800 font-black">{transfer.sourceWarehouseName || `WH-${transfer.sourceWarehouseId}`}</span></p>
          <p>Destination: <span className="text-[#704efe] font-black">{transfer.destWarehouseName || `WH-${transfer.destWarehouseId}`}</span></p>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 flex-1 overflow-y-auto space-y-4">
          {/* Transfer Item details */}
          <div className="border border-[#eff1f5] p-4.5 rounded-2xl bg-white shadow-3xs">
            <p className="text-[10px] font-black text-[#8a8b9d] uppercase tracking-widest leading-none mb-3">Transfer Stock Details</p>
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-xs font-black text-slate-805">📦 {transfer.productName}</p>
                <span className="text-[9px] font-mono font-black text-[#704efe] bg-[#f0ebff] border border-indigo-150 px-2 py-0.5 rounded-lg uppercase tracking-wider mt-1.5 inline-block">
                  SKU: {transfer.productSKU}
                </span>
              </div>
              <div className="text-right">
                <span className="inline-block text-xs font-black font-mono px-3 py-1.5 rounded-xl border border-[#eff1f5] bg-slate-50 text-slate-750">
                  {transfer.quantity.toLocaleString()} units
                </span>
              </div>
            </div>
          </div>

          {/* Notes and Dispatched Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50/50 border border-[#eff1f5] p-3.5 rounded-2xl flex flex-col justify-center">
              <span className="text-[8.5px] font-black text-[#8a8b9d] uppercase tracking-wider">Dispatched Date</span>
              <span className="text-xs font-extrabold text-slate-805 mt-1">
                {new Date(transfer.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="bg-slate-50/50 border border-[#eff1f5] p-3.5 rounded-2xl flex flex-col justify-center">
              <span className="text-[8.5px] font-black text-[#8a8b9d] uppercase tracking-wider">Transfer Notes</span>
              <span className="text-xs font-bold text-slate-500 mt-1 truncate">
                {transfer.notes || 'No notes provided'}
              </span>
            </div>
          </div>

          {/* Guidance Note */}
          <div className="bg-slate-50 border border-[#eff1f5] p-4 rounded-2xl text-[10px] text-slate-400 leading-relaxed font-semibold">
            💡 <strong>Intake Guidance:</strong> Confirming this stock intake will close the transfer, register a Transfer In event at the destination facility, and update the live stock count.
          </div>

          {/* Stock Confirmation Checkbox */}
          <div className="bg-[#f0ebff]/20 border border-indigo-100 p-4.5 rounded-2xl flex items-start gap-3 mt-2">
            <input
              type="checkbox"
              id="confirm-intake-transfer-stocks"
              checked={isStockConfirmed}
              onChange={(e) => setIsStockConfirmed(e.target.checked)}
              className="mt-0.5 cursor-pointer accent-[#704efe] w-4.5 h-4.5 rounded border-slate-300"
            />
            <label htmlFor="confirm-intake-transfer-stocks" className="text-[11px] font-extrabold text-slate-600 select-none cursor-pointer leading-normal">
              I confirm that I have inspected and verified that the above stock items have safely arrived at the destination warehouse and all details are correct.
            </label>
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t border-[#eff1f5] justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 border border-[#eff1f5] text-slate-500 hover:bg-slate-50 text-[10px] uppercase font-black tracking-wider rounded-2xl transition-all cursor-pointer bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !isStockConfirmed}
              className="px-5 py-3 bg-[#704efe] hover:bg-[#5c3edd] text-white text-[10px] uppercase font-black tracking-wider rounded-2xl shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border-none shadow-indigo-100/30"
            >
              {submitting ? 'Confirming Intake...' : 'Confirm Intake'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceiveTransferModal;
