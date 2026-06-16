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
  handleGeneratePO,
  user,
  searchQuery,
  setSearchQuery
}) => {
  return (
    <div className="bg-gradient-to-br from-white to-[#fcfdff]/90 backdrop-blur-md border border-white/60 rounded-3xl p-5 flex flex-col justify-between shadow-[0_4px_24px_-4px_rgba(148,163,184,0.06)] min-h-[460px]">

      <div>
        {/* Table Header controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100/70 mb-5">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#704efe] shadow-sm shadow-[#704efe]/50"></span>
              Replenishment Engine
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
              Real-time stock threshold recommendations
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Box */}
            <div className="relative">
              <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Filter items, SKU..."
                className="bg-slate-50 border border-slate-200 focus:border-[#704efe] focus:bg-white rounded-xl pl-9 pr-4 py-1.5 text-[11.5px] text-slate-700 placeholder:text-slate-400 font-semibold outline-none w-full sm:w-[180px] transition-all"
              />
            </div>

            {/* Severity Filters */}
            <div className="flex items-center gap-1 p-1 bg-slate-100/60 border border-slate-200/50 rounded-xl overflow-x-auto">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => {
                const isActive = severityFilter === sev;
                return (
                  <button
                    key={sev}
                    onClick={() => {
                      setSeverityFilter(sev);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 text-[9px] font-black rounded-lg uppercase tracking-wider transition-all border-none cursor-pointer select-none shrink-0 ${
                      isActive
                        ? 'bg-[#704efe] text-white shadow-sm shadow-indigo-100'
                        : 'bg-transparent text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {sev}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/40 backdrop-blur-xs sticky top-0 z-10">
                <th className="pb-3 pl-1 font-bold">Product Details</th>
                <th className="pb-3 text-center font-bold">Stock / Buffer</th>
                <th className="pb-3 text-center font-bold">Daily Speed</th>
                <th className="pb-3 text-center font-bold">Runway</th>
                <th className="pb-3 text-center font-bold">Refill Qty</th>
                <th className="pb-3 text-center font-bold">Risk Level</th>
                {user?.role !== 'WarehouseManager' && <th className="pb-3 text-right pr-1 font-bold">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-3 border-[#704efe] border-t-transparent rounded-full animate-spin" />
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Syncing global ERP cache...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto p-4 select-none">
                      {/* Premium empty state illustration */}
                      <div className="w-16 h-16 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-center text-emerald-500 mb-4 shadow-sm shadow-emerald-100/20">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-wide">All Facility Buffers Optimized</h4>
                      <p className="text-[11px] text-slate-400 font-semibold mt-1.5 leading-relaxed">
                        No active stock suggest lines match the selected filters. All warehouse inventory levels are currently secure.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedList.map((item) => {
                  const sev = item.Severity;
                  const isCritical = sev === 'Critical' || sev === 'High';
                  const badgeBg = isCritical
                    ? 'bg-rose-50 border-rose-100 text-rose-600'
                    : sev === 'Medium'
                      ? 'bg-amber-50 border-amber-100 text-amber-600'
                      : 'bg-emerald-50 border-emerald-100 text-emerald-600';

                  return (
                    <tr key={item.id} className="text-[12px] hover:bg-slate-50/40 transition-all font-bold group/row">

                      {/* Product details */}
                      <td className="py-3.5 pl-1 max-w-[240px]">
                        <div className="flex flex-col min-w-0">
                          <span className="text-slate-800 text-[12.5px] font-black truncate leading-none">{item.name}</span>
                          <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider mt-1.5 flex flex-wrap items-center gap-1.5">
                            {user?.role !== 'WarehouseManager' && (
                              <>
                                <span className="text-[8.5px] font-black bg-indigo-50 border border-indigo-100 text-[#704efe] px-1.5 py-0.2 rounded font-sans">{item.Code}</span>
                                <span>•</span>
                              </>
                            )}
                            <span className="text-slate-500">{item.sku}</span>
                            <span>•</span>
                            <span className="text-slate-400 truncate max-w-[150px] font-medium">{item.Reason}</span>
                          </span>
                        </div>
                      </td>

                      {/* Stock vs Point */}
                      <td className="py-3.5 text-center">
                        <span className="text-slate-800 text-[12.5px] font-black">{item.CurrentStock}</span>
                        <span className="text-slate-400 text-[10px] font-bold"> / {item.ReorderPoint}</span>
                      </td>

                      {/* Avg Daily Speed */}
                      <td className="py-3.5 text-center font-mono text-[#704efe] font-bold">
                        {item.AvgDailyVelocity.toFixed(1)} <span className="text-[9px] text-slate-400 font-bold font-sans uppercase">u/d</span>
                      </td>

                      {/* Runway Days */}
                      <td className="py-3.5 text-center">
                        <span className={`text-[12.5px] font-black px-2 py-0.5 rounded-lg border ${
                          item.DaysLeft <= 3 
                            ? 'text-rose-600 bg-rose-50 border-rose-100 animate-pulse' 
                            : 'text-slate-600 bg-slate-50 border-slate-100'
                        }`}>
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
                        <td className="py-3.5 text-right pr-1">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleGeneratePO(item)}
                              className="px-2.5 py-1 bg-[#f0ebff] hover:bg-[#704efe] hover:text-white border border-indigo-100 text-[#704efe] rounded-xl text-[9.5px] font-black uppercase tracking-wider cursor-pointer transition-all duration-150 active:scale-95 flex items-center gap-1 shrink-0"
                              title="Generate Purchase Order"
                            >
                              🛒 Generate PO
                            </button>
                            <button
                              onClick={() => handleActionSuggestion(item.id)}
                              disabled={actioningId === item.id}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-100 text-emerald-600 rounded-xl text-[9.5px] font-black uppercase tracking-wider cursor-pointer transition-all duration-150 active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-100 disabled:cursor-not-allowed shrink-0"
                            >
                              {actioningId === item.id ? 'Saving...' : 'Dispatch'}
                            </button>
                          </div>
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
      <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-5 select-none">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
          Showing page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-350 cursor-pointer flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed outline-none"
          >
            &larr;
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-350 cursor-pointer flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed outline-none"
          >
            &rarr;
          </button>
        </div>
      </div>

    </div>
  );
};

export default ReOrderSuggestionsTable;
