import React, { useState, useEffect } from 'react';

const ReorderConfigModal = ({
  editingProduct,
  onClose,
  onSubmit
}) => {
  const [reorderQty, setReorderQty] = useState('0');
  const [safetyStockDays, setSafetyStockDays] = useState('0');
  const [leadTimeDays, setLeadTimeDays] = useState('0');

  useEffect(() => {
    if (editingProduct) {
      setReorderQty(editingProduct.reorderQty?.toString() || '0');
      setSafetyStockDays(editingProduct.safetyStockDays?.toString() || '0');
      setLeadTimeDays(editingProduct.leadTimeDays?.toString() || '0');
    }
  }, [editingProduct]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      reorderQty: Number(reorderQty),
      safetyStockDays: Number(safetyStockDays),
      leadTimeDays: Number(leadTimeDays)
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-100 rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Reorder Engine Configuration
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-655 cursor-pointer text-lg font-bold"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-[12px] font-semibold text-slate-500 leading-normal">
            Adjust replenishment configurations for <span className="text-slate-800 font-bold">{editingProduct?.name}</span>.
          </p>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
              Reorder Quantity ({editingProduct?.unitOfMeasure || 'PCS'})
            </label>
            <input
              type="number"
              value={reorderQty}
              onChange={(e) => setReorderQty(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Safety Stock Days</label>
            <input
              type="number"
              value={safetyStockDays}
              onChange={(e) => setSafetyStockDays(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Lead Time Days</label>
            <input
              type="number"
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4.5 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-[12px] font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4.5 py-2 bg-black hover:bg-zinc-900 text-white rounded-xl text-[12px] font-bold cursor-pointer transition-all duration-150 active:scale-95"
            >
              Update Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReorderConfigModal;
