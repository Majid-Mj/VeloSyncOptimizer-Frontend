import React from 'react';

const OperationsQuickActions = ({ onNavigate, onPrint }) => {
  return (
    <div className="bg-gradient-to-br from-white to-slate-50/60 rounded-3xl border border-slate-100/90 p-5 shadow-[0_4px_16px_-4px_rgba(148,163,184,0.06)] flex flex-col justify-between hover:shadow-xl transition-all duration-300 group/actions">
      {/* Header */}
      <div className="pb-3.5 border-b border-slate-50 flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
        <h3 className="text-[14px] font-extrabold text-slate-800 tracking-tight leading-none">
          Operations Control Panel
        </h3>
      </div>

      {/* Quick Buttons Grid */}
      <div className="grid grid-cols-2 gap-3 mt-4 flex-1">
        {/* Action 1 */}
        <button
          onClick={() => onNavigate('/dashboard/stock-movement/transfer')}
          className="bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-2xl p-3 flex flex-col items-start gap-1.5 transition-all text-left group/btn cursor-pointer active:scale-95"
        >
          <span className="text-[18px]">⇅</span>
          <div>
            <div className="text-[11.5px] font-extrabold text-slate-800 leading-none group-hover/btn:text-indigo-600">Stock Transfer</div>
            <div className="text-[9px] font-bold text-slate-400 mt-1 leading-none uppercase">WH relocation</div>
          </div>
        </button>

        {/* Action 2 */}
        <button
          onClick={() => onNavigate('/dashboard/purchase-orders')}
          className="bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-100 rounded-2xl p-3 flex flex-col items-start gap-1.5 transition-all text-left group/btn cursor-pointer active:scale-95"
        >
          <span className="text-[18px]">📋</span>
          <div>
            <div className="text-[11.5px] font-extrabold text-slate-800 leading-none group-hover/btn:text-emerald-600">Purchase Orders</div>
            <div className="text-[9px] font-bold text-slate-400 mt-1 leading-none uppercase">Manage PO & approvals</div>
          </div>
        </button>

        {/* Action 3 */}
        <button
          onClick={() => onNavigate('/dashboard/stock-levels')}
          className="bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-100 rounded-2xl p-3 flex flex-col items-start gap-1.5 transition-all text-left group/btn cursor-pointer active:scale-95"
        >
          <span className="text-[18px]">📦</span>
          <div>
            <div className="text-[11.5px] font-extrabold text-slate-800 leading-none group-hover/btn:text-amber-600">Stock Audits</div>
            <div className="text-[9px] font-bold text-slate-400 mt-1 leading-none uppercase">Stock levels</div>
          </div>
        </button>

        {/* Action 4 */}
        <button
          onClick={onPrint}
          className="bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 rounded-2xl p-3 flex flex-col items-start gap-1.5 transition-all text-left group/btn cursor-pointer active:scale-95"
        >
          <span className="text-[18px]">⤓</span>
          <div>
            <div className="text-[11.5px] font-extrabold text-slate-800 leading-none group-hover/btn:text-rose-600">Print Report</div>
            <div className="text-[9px] font-bold text-slate-400 mt-1 leading-none uppercase">System PDF print</div>
          </div>
        </button>
      </div>

      <p className="text-[9px] font-extrabold text-slate-400 mt-4 leading-normal select-none italic text-center">
        🔒 Secure transaction channel verified by VeloSync Auth services
      </p>
    </div>
  );
};

export default OperationsQuickActions;
