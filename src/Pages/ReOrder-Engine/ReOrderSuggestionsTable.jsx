import React from 'react';

const ReOrderSuggestionsTable = ({
  loading,
  paginatedList,
  severityFilter,
  setSeverityFilter,
  currentPage,
  setCurrentPage,
  totalPages,
  actioningId,
  handleActionSuggestion,
  user,
  searchQuery,
  setSearchQuery
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-100/90 rounded-2xl p-5 flex flex-col justify-between shadow-3xs">
      
      <div>
        {/* Table Header controls */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              Replenishment Suggestions
            </h3>
            <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider block mt-0.5">
              Real-time stock threshold recommendations
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Embedded Search Box */}
            <div className="relative">
              <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search SKU, name, reason..."
                className="bg-slate-50 border border-slate-150 rounded-xl pl-9 pr-4 py-1.8 text-[11px] text-slate-700 placeholder:text-slate-400 font-bold outline-none focus:border-indigo-500 w-[200px] transition-all"
              />
            </div>

            {/* Severity Quick Filters */}
            <div className="flex items-center gap-1 p-1 bg-slate-50 border border-slate-100/70 rounded-xl flex-wrap">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => {
                    setSeverityFilter(sev);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 text-[9px] font-black rounded-lg uppercase tracking-wider transition-all border-none cursor-pointer ${
                    severityFilter === sev
                      ? 'bg-indigo-600 text-white shadow-3xs'
                      : 'bg-transparent text-slate-450 hover:text-slate-700'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0 bg-white/80 z-10">
                <th className="pb-3.5 pt-1 pl-2">Product Details</th>
                <th className="pb-3.5 pt-1 text-center">Stock / buffer</th>
                <th className="pb-3.5 pt-1 text-center">Daily Velocity</th>
                <th className="pb-3.5 pt-1 text-center">Runway</th>
                <th className="pb-3.5 pt-1 text-center">Suggested Qty</th>
                <th className="pb-3.5 pt-1 text-center">Risk Level</th>
                {user?.role !== 'WarehouseManager' && <th className="pb-3.5 pt-1 text-right pr-2">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs font-bold text-slate-400 uppercase">
                    Querying ERP stock index...
                  </td>
                </tr>
              ) : paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs font-bold text-slate-400 uppercase">
                    No active stock suggestions under selection
                  </td>
                </tr>
              ) : (
                paginatedList.map((item) => {
                  const sev = item.Severity;
                  const badgeBg = sev === 'Critical' || sev === 'High'
                    ? 'bg-rose-50 border-rose-100/70 text-rose-600'
                    : sev === 'Medium'
                    ? 'bg-amber-50 border-amber-100/70 text-amber-600'
                    : 'bg-emerald-50 border-emerald-100/70 text-emerald-600';

                  return (
                    <tr key={item.id} className="text-[12px] hover:bg-slate-50/40 transition-all font-bold group/row">
                      
                      {/* Product details */}
                      <td className="py-3.5 pl-2 max-w-[240px]">
                        <div className="flex flex-col min-w-0">
                          <span className="text-slate-800 text-[12.5px] font-black truncate leading-none">{item.name}</span>
                          <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                            <span className="text-slate-500">{item.sku}</span>
                            <span>•</span>
                            <span className="text-slate-400 truncate max-w-[150px]">{item.Reason}</span>
                          </span>
                        </div>
                      </td>

                      {/* Stock vs Point */}
                      <td className="py-3.5 text-center">
                        <span className="text-slate-800 text-[12.5px] font-black">{item.CurrentStock}</span>
                        <span className="text-slate-400 text-[10px] font-bold"> / {item.ReorderPoint}</span>
                      </td>

                      {/* Avg Daily Speed */}
                      <td className="py-3.5 text-center font-mono text-indigo-600 font-bold">
                        {item.AvgDailyVelocity.toFixed(1)} <span className="text-[9px] text-slate-400 font-bold font-sans uppercase">u/d</span>
                      </td>

                      {/* Runway Days */}
                      <td className="py-3.5 text-center">
                        <span className={`text-[12.5px] font-black ${item.DaysLeft <= 3 ? 'text-rose-500 animate-pulse' : 'text-slate-600'}`}>
                          {item.DaysLeft}d
                        </span>
                      </td>

                      {/* Suggested Volume */}
                      <td className="py-3.5 text-center text-slate-800 text-[12.5px] font-black">
                        +{item.SuggestedQty}
                      </td>

                      {/* Severity Badge */}
                      <td className="py-3.5 text-center">
                        <span className={`px-2.5 py-0.5 border border-solid text-[9.5px] font-black rounded-lg uppercase tracking-wide ${badgeBg}`}>
                          {item.Severity} ({item.RiskScore}%)
                        </span>
                      </td>

                      {/* Actions */}
                      {user?.role !== 'WarehouseManager' && (
                        <td className="py-3.5 text-right pr-2">
                          <button
                            onClick={() => handleActionSuggestion(item.id)}
                            disabled={actioningId === item.id}
                            className="px-3 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-250 text-emerald-600 rounded-lg text-[9.5px] font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-100 disabled:cursor-not-allowed"
                          >
                            {actioningId === item.id ? 'Saving...' : 'Dispatch'}
                          </button>
                        </td>
                      )}

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4 select-none">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
          Showing page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 hover:text-slate-800 hover:border-slate-350 cursor-pointer flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed border-none outline-none"
          >
            &larr;
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 hover:text-slate-800 hover:border-slate-350 cursor-pointer flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed border-none outline-none"
          >
            &rarr;
          </button>
        </div>
      </div>

    </div>
  );
};

export default ReOrderSuggestionsTable;
