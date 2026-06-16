import React, { useState, useEffect } from 'react';
import purchaseOrderApi from '../../api/purchaseOrder.api';

const PurchaseOrderDetailModal = ({
  isOpen,
  onClose,
  purchaseOrderId,
  userRole,
  onReceive
}) => {
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!isOpen || !purchaseOrderId) return;

      setLoading(true);
      setError(null);
      setPo(null);

      try {
        const response = await purchaseOrderApi.getById(purchaseOrderId);
        setPo(response);
      } catch (err) {
        console.error(err);
        setError('Failed to retrieve purchase order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [isOpen, purchaseOrderId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Box */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-xl max-w-2xl w-full mx-4 z-10 overflow-hidden animate-scale-up max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-white to-[#fcfdfe] shrink-0">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Purchase Order Requisition File
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <span className="text-xl animate-spin">🔄</span>
              <p className="text-xs font-bold text-gray-400">Loading order file details...</p>
            </div>
          )}

          {error && (
            <div className="py-8 text-center text-xs font-bold text-red-500">
              ⚠️ {error}
            </div>
          )}

          {po && (
            <div className="space-y-5 animate-fade-in">
              {/* Top Details Panel */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#f8fafc] border border-gray-100 p-4 rounded-xl text-xs">
                <div>
                  <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">PO Number</span>
                  <span className="font-mono font-extrabold text-blue-600 bg-blue-50/70 border border-blue-100 px-1.5 py-0.5 rounded text-[11px]">{po.poNumber}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Date Created</span>
                  <span className="font-bold text-gray-700">{new Date(po.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Status</span>
                  <span className="font-extrabold text-gray-700 uppercase tracking-wide">{po.status}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Grand Total</span>
                  <span className="font-extrabold text-gray-800">₹{Number(po.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* relational cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Supplier detail */}
                <div className="border border-gray-100 p-3.5 rounded-xl space-y-1 bg-white">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">🏭 Supplier Supplier</p>
                  <h4 className="text-xs font-black text-gray-800">{po.supplierName}</h4>
                  <p className="text-[10px] text-gray-400">Index: Supplier ID #{po.supplierId}</p>
                </div>

                {/* Warehouse Location detail */}
                <div className="border border-gray-100 p-3.5 rounded-xl space-y-1 bg-white">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">🏢 Destination Warehouse</p>
                  <h4 className="text-xs font-black text-gray-800">{po.warehouseName}</h4>
                  <p className="text-[10px] text-gray-400">Index: Warehouse ID #{po.warehouseId}</p>
                </div>
              </div>

              {/* Items Grid List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Material Line Items</h4>
                <div className="space-y-2">
                  {po.lines?.map((line) => {
                    const progress = line.quantityOrdered > 0
                      ? Math.min(100, Math.round((line.quantityReceived / line.quantityOrdered) * 100))
                      : 0;

                    return (
                      <div key={line.id} className="border border-gray-100 p-3.5 rounded-xl bg-white shadow-sm">
                        <div className="flex justify-between items-start gap-2.5">
                          <div>
                            <p className="text-xs font-bold text-gray-800">📦 {line.productName}</p>
                            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Line Reference: #{line.id}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-extrabold text-gray-800">₹{Number(line.lineTotal).toLocaleString()}</p>
                            <p className="text-[10px] text-gray-400 font-bold mt-0.5">{line.quantityOrdered} × ₹{Number(line.unitCost).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gradient-to-r from-white to-[#fcfdfe] shrink-0">
          {po && po.status === 'Approved' && (userRole === 'WarehouseManager' || userRole === 'Administrator' || userRole === 'Admin') && (
            <button
              onClick={() => onReceive(po)}
              className="px-4.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-100 transition-all border-none cursor-pointer"
            >
              📥 Receive Stock
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-extrabold rounded-xl transition-all cursor-pointer border-none"
          >
            Close Document
          </button>
        </div>

      </div>
    </div>
  );
};

export default PurchaseOrderDetailModal;
