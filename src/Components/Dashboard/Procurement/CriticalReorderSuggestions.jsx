import React from 'react';

const CriticalReorderSuggestions = ({ topCriticalSuggestions, handleGeneratePO }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_16px_-4px_rgba(148,163,184,0.06)] p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between pb-4 border-b border-slate-50 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <h3 className="text-[14px] font-extrabold text-slate-800 tracking-tight leading-none">
            Top 3 Critical Reorder Suggestions
          </h3>
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        {topCriticalSuggestions.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No critical suggestions.
          </div>
        ) : (
          topCriticalSuggestions.map(s => {
            const skuVal = s.sku || s.SKU || '';
            const nameVal = s.name || s.Name || 'Unknown SKU';
            const score = s.riskScore || s.RiskScore || 0;
            const reasonVal = s.reason || s.Reason || 'Stock levels running low';
            return (
              <div key={s.id} className="p-3.5 border border-rose-100/60 rounded-2xl flex items-center justify-between gap-4 bg-rose-50/20 hover:bg-rose-50/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                      Risk: {Number(score).toFixed(1)}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">{skuVal}</span>
                  </div>
                  <h4 className="text-[12px] font-black text-slate-800 mt-1 truncate">{nameVal}</h4>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5 truncate">{reasonVal}</p>
                </div>

                <button
                  onClick={() => handleGeneratePO(s)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black py-1.5 px-3 rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-all border-none cursor-pointer shrink-0"
                >
                  Reorder
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CriticalReorderSuggestions;
