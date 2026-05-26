import React, { useState, useEffect } from 'react';

const ReceivePurchaseOrderModal = ({
  isOpen,
  onClose,
  selectedPO,
  onSubmit
}) => {
  const [lines, setLines] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && selectedPO) {
      // Map PO Lines to receive intake model
      const initialLines = selectedPO.lines.map(line => ({
        lineId: line.id,
        productId: line.productId,
        productName: line.productName,
        quantityOrdered: line.quantityOrdered,
        quantityReceivedPrev: line.quantityReceived,
        quantityReceivedCurrent: line.quantityOrdered - line.quantityReceived // default to the remaining balance
      }));
      setLines(initialLines);
    }
  }, [isOpen, selectedPO]);

  if (!isOpen || !selectedPO) return null;

  const handleQtyChange = (idx, val) => {
    const newLines = [...lines];
    // Must be greater than or equal to 0
    newLines[idx].quantityReceivedCurrent = Math.max(0, Number(val));
    setLines(newLines);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Check if at least one item is being received
    const totalCurrentIntake = lines.reduce((acc, cur) => acc + cur.quantityReceivedCurrent, 0);
    if (totalCurrentIntake <= 0) {
      alert('Intake must log at least 1 received unit across items.');
      return;
    }

    setSubmitting(true);

    const payload = {
      lines: lines.map(l => ({
        lineId: l.lineId,
        quantityReceived: l.quantityReceivedCurrent
      }))
    };

    try {
      await onSubmit(selectedPO.id, payload);
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
      <div className="bg-white rounded-2xl border border-gray-150 shadow-xl max-w-xl w-full mx-4 z-10 overflow-hidden animate-scale-up max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-white to-[#fcfdfe] shrink-0">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
            </svg>
            Warehouse Intake: {selectedPO.poNumber}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* PO Info Panel */}
        <div className="bg-emerald-50/50 border-b border-emerald-100 p-4 shrink-0 text-xs flex flex-wrap justify-between gap-2.5">
          <p className="font-bold text-gray-700">Supplier: <span className="text-gray-800 font-extrabold">{selectedPO.supplierName}</span></p>
          <p className="font-bold text-gray-500">Destination: <span className="text-emerald-700 font-extrabold">{selectedPO.warehouseName}</span></p>
          <p className="font-bold text-gray-400">Total committed: <span className="text-gray-700 font-extrabold">${Number(selectedPO.totalAmount).toLocaleString()}</span></p>
        </div>

        {/* Form Lines Scrollable */}
        <form onSubmit={handleFormSubmit} className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="space-y-3">
            {lines.map((line, idx) => {
              const remaining = line.quantityOrdered - line.quantityReceivedPrev;
              const hasOverflow = line.quantityReceivedCurrent > remaining;

              return (
                <div key={line.lineId} className="border border-gray-100 p-3 rounded-xl bg-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Item Description */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-800 truncate">📦 {line.productName}</p>
                    <div className="flex gap-2.5 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <span>Ordered: <strong className="text-gray-600">{line.quantityOrdered}</strong></span>
                      <span>Received: <strong className="text-emerald-600">{line.quantityReceivedPrev}</strong></span>
                      <span>Pending: <strong className="text-blue-500">{remaining}</strong></span>
                    </div>
                  </div>

                  {/* Qty Intake Input */}
                  <div className="w-full sm:w-32 shrink-0">
                    <label className="block text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">Received Intake</label>
                    <input
                      type="number"
                      min="0"
                      value={line.quantityReceivedCurrent}
                      onChange={(e) => handleQtyChange(idx, e.target.value)}
                      className={`w-full text-xs font-extrabold text-gray-700 px-3 py-1.5 rounded-lg border outline-none focus:bg-white transition-all ${
                        hasOverflow
                          ? 'border-amber-400 bg-amber-50 focus:border-amber-500'
                          : 'border-gray-200 bg-[#f8fafc] focus:border-emerald-500'
                      }`}
                    />
                    {hasOverflow && (
                      <span className="block text-[8px] font-bold text-amber-600 mt-0.5">
                        ⚠️ Exceeds ordered balance
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Intake warning note */}
          <div className="bg-[#f8fafc] border border-gray-100 p-3 rounded-xl text-[10px] text-gray-400 leading-normal font-medium">
            💡 <strong>Process Guidance:</strong> Clicking "Submit Delivery" records this intake session and increments warehouse inventory stock count levels automatically. Backorders can be resolved during a future intake session.
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
              className="px-4.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Recording Intake...' : 'Submit Delivery Intake'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceivePurchaseOrderModal;
