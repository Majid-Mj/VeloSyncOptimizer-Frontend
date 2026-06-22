import React from 'react';

const ProcurementQuickActions = ({ onNavigate }) => {
  return (
    <div className="bg-gradient-to-br from-white to-slate-50/60 rounded-3xl border border-slate-100/90 p-5 shadow-[0_4px_16px_-4px_rgba(148,163,184,0.06)] flex flex-col justify-between hover:shadow-xl transition-all duration-300">
      <div className="pb-3.5 border-b border-slate-50 flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
        <h3 className="text-[13px] font-extrabold text-slate-800 tracking-tight leading-none uppercase">
          Procurement Actions
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-2.5 mt-4">
        <button
          onClick={() => onNavigate('/dashboard/reorder-suggestions')}
          className="w-full bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 rounded-xl p-3 flex items-center justify-between transition-all text-left cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">⚡</span>
            <div>
              <div className="text-[12px] font-extrabold text-slate-800">Reorder Suggestions</div>
              <div className="text-[9.5px] font-bold text-slate-400 uppercase">Risk-sorted replenishment</div>
            </div>
          </div>
          <span className="text-slate-400 font-bold">→</span>
        </button>

        <button
          onClick={() => onNavigate('/dashboard/purchase-orders')}
          className="w-full bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-xl p-3 flex items-center justify-between transition-all text-left cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">➕</span>
            <div>
              <div className="text-[12px] font-extrabold text-slate-800">Create Manual PO</div>
              <div className="text-[9.5px] font-bold text-slate-400 uppercase">Draft new order requisition</div>
            </div>
          </div>
          <span className="text-slate-400 font-bold">→</span>
        </button>

        <button
          onClick={() => onNavigate('/dashboard/suppliers')}
          className="w-full bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-100 rounded-xl p-3 flex items-center justify-between transition-all text-left cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">🤝</span>
            <div>
              <div className="text-[12px] font-extrabold text-slate-800">Manage Suppliers</div>
              <div className="text-[9.5px] font-bold text-slate-400 uppercase">Contacts & performance metrics</div>
            </div>
          </div>
          <span className="text-slate-400 font-bold">→</span>
        </button>
      </div>

      <p className="text-[9px] font-extrabold text-slate-400 mt-4 leading-normal select-none italic text-center uppercase tracking-wide">
        🔒 VeloSync Procurement Channel
      </p>
    </div>
  );
};

export default ProcurementQuickActions;
