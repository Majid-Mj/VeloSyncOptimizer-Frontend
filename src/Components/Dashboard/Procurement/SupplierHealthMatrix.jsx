import React from 'react';

const SupplierHealthMatrix = ({ procurementSuppliers, onViewAll }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_16px_-4px_rgba(148,163,184,0.06)] p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between pb-4 border-b border-slate-50 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤝</span>
          <h3 className="text-[14px] font-extrabold text-slate-800 tracking-tight leading-none">
            Supplier Health Matrix
          </h3>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors border-none bg-transparent cursor-pointer"
        >
          All Suppliers →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {procurementSuppliers.filter(s => s.isActive).slice(0, 4).map(s => {
          const score = s.reliabilityScore || 90;
          const rate = s.onTimeDeliveryRate || 90;
          const scoreColor = score >= 90 ? 'text-emerald-500' : score >= 75 ? 'text-amber-500' : 'text-rose-500';
          const rateColor = rate >= 90 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : rate >= 75 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100';

          return (
            <div key={s.id} className="p-3.5 border border-slate-100 rounded-2xl flex flex-col gap-2.5 bg-slate-50/40 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[12.5px] font-extrabold text-slate-800 leading-tight">{s.name}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{s.email || 'No Email'}</div>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-wider ${rateColor}`}>
                  On-Time: {rate}%
                </span>
              </div>
              <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-100/60 text-[11px] font-bold">
                <span className="text-slate-400 uppercase tracking-wide">Reliability:</span>
                <span className={`font-black ${scoreColor}`}>{score} / 100</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SupplierHealthMatrix;
