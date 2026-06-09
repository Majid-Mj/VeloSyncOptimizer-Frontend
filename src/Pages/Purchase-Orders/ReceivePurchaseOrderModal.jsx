import React, { useState, useEffect } from 'react';
import purchaseOrderApi from '../../api/purchaseOrder.api';

const ReceivePurchaseOrderModal = ({
  isOpen,
  onClose,
  selectedPO,
  onSubmit
}) => {
  const [poDetails, setPoDetails] = useState(null);
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isStockConfirmed, setIsStockConfirmed] = useState(false);

  useEffect(() => {
    if (isOpen && selectedPO?.id) {
      const fetchPO = async () => {
        setLoading(true);
        try {
          const data = await purchaseOrderApi.getById(selectedPO.id);
          setPoDetails(data);

          // Map hydrated PO Lines to receive intake model
          const initialLines = data.lines.map(line => ({
            lineId: line.id,
            productId: line.productId,
            productName: line.productName,
            quantityOrdered: line.quantityOrdered,
            quantityReceivedPrev: line.quantityReceived,
            unitCost: line.unitCost,
            lineTotal: line.lineTotal
          }));
          setLines(initialLines);
        } catch (err) {
          console.error('Failed to fetch detailed PO for receiving:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchPO();
      setIsStockConfirmed(false); // Reset confirmation state on PO change
    }
  }, [isOpen, selectedPO]);

  if (!isOpen || !selectedPO) return null;

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Safety guard
    if (!isStockConfirmed) {
      alert('You must confirm and check the stock intake verification box before proceeding.');
      return;
    }

    setSubmitting(true);

    const payload = {
      lines: lines.map(l => ({
        lineId: l.lineId,
        quantityReceived: l.quantityOrdered - l.quantityReceivedPrev // Receive the full remaining balance
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
          <p className="font-bold text-gray-400">Total committed: <span className="text-gray-700 font-extrabold">₹{Number(selectedPO.totalAmount).toLocaleString()}</span></p>
        </div>

        {loading ? (
          <div className="p-10 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
            <p className="text-xs font-bold text-gray-400">Hydrating materials details list...</p>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="p-5 flex-1 overflow-y-auto space-y-4">
            <div className="space-y-3">
              {lines.map((line) => (
                <div key={line.lineId} className="border border-gray-100 p-3.5 rounded-xl bg-white shadow-sm">
                  <div className="flex justify-between items-start gap-2.5">
                    <div>
                      <p className="text-xs font-bold text-gray-800">📦 {line.productName}</p>
                      <div className="flex flex-wrap gap-2.5 mt-1 items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Line Reference: #{line.lineId}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-200" />
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                          📥 Intake Stock: {line.quantityOrdered - line.quantityReceivedPrev}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-gray-800">₹{Number(line.lineTotal).toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">{line.quantityOrdered} × ₹{Number(line.unitCost).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Intake warning note */}
            <div className="bg-[#f8fafc] border border-gray-100 p-3 rounded-xl text-[10px] text-gray-400 leading-normal font-medium">
              💡 <strong>Process Guidance:</strong> Clicking "Submit Delivery Intake" records this intake session and increments warehouse inventory stock count levels automatically.
            </div>

            {/* Stock Confirmation Checkbox */}
            <div className="bg-emerald-50/20 border border-emerald-100/50 p-3.5 rounded-xl flex items-start gap-3 mt-4">
              <input
                type="checkbox"
                id="confirm-intake-stocks"
                checked={isStockConfirmed}
                onChange={(e) => setIsStockConfirmed(e.target.checked)}
                className="mt-0.5 cursor-pointer accent-emerald-600 w-4.5 h-4.5 rounded border-gray-300"
              />
              <label htmlFor="confirm-intake-stocks" className="text-[11px] font-bold text-slate-600 select-none cursor-pointer leading-normal">
                I hereby confirm and certify that all of the physical stock items checked above have arrived and reached the destination warehouse successfully.
              </label>
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
                disabled={submitting || !isStockConfirmed}
                className="px-4.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-100 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Recording Intake...' : 'Submit Delivery Intake'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReceivePurchaseOrderModal;
