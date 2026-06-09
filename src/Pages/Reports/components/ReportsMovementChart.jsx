import React from 'react';

const ReportsMovementChart = ({ movementData = [], loading, onExportCSV }) => {
  // Find maximum value to normalize chart heights
  const maxVal = movementData.length > 0
    ? Math.max(...movementData.map(d => Math.max(d.inbound, d.outbound, 1)))
    : 120;

  return (
    <div className="bg-white border border-slate-100 p-6 rounded-2xl flex flex-col gap-5 shadow-3xs min-h-[350px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Inbound vs Outbound
          </h2>
          <p className="text-[10.5px] font-bold text-slate-400 mt-1 select-none leading-none">
            Monthly movement comparison — all warehouses
          </p>
        </div>

        <button
          onClick={onExportCSV}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-black text-[9px] uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer border-none"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          CSV
        </button>
      </div>

      {loading ? (
        /* Loading Skeleton Chart */
        <div className="flex-1 min-h-[220px] flex items-end justify-between px-6 pb-2 pt-6 border-b border-slate-50">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-3 w-1/4 animate-pulse">
              <div className="h-[180px] w-full flex items-end justify-center gap-2.5">
                <div className="w-5 bg-slate-100 h-28 rounded-t-sm" />
                <div className="w-5 bg-slate-100 h-20 rounded-t-sm" />
              </div>
              <div className="h-3.5 w-8 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        /* Dynamic CSS Bar Chart */
        <div className="flex-1 min-h-[220px] flex items-end justify-between px-6 pb-2 pt-6 border-b border-slate-50">
          {movementData.map((d) => {
            const inboundHeight = `${(d.inbound / maxVal) * 100}%`;
            const outboundHeight = `${(d.outbound / maxVal) * 100}%`;

            return (
              <div key={d.month} className="flex flex-col items-center gap-3 w-1/4 group/bar">
                <div className="h-[180px] w-full flex items-end justify-center gap-2.5 relative">

                  {/* Tooltip on group hover */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8.5px] font-black px-2 py-0.5 rounded shadow opacity-0 pointer-events-none group-hover/bar:opacity-100 transition-opacity z-10 whitespace-nowrap">
                    In: {d.inbound.toLocaleString()} / Out: {d.outbound.toLocaleString()}
                  </div>

                  {/* Inbound blue bar */}
                  <div
                    style={{ height: inboundHeight }}
                    className="w-5 bg-blue-400 hover:bg-blue-500 rounded-t-sm transition-all shadow-xs duration-300 relative"
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-blue-600 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                      {d.inbound}
                    </div>
                  </div>

                  {/* Outbound red bar */}
                  <div
                    style={{ height: outboundHeight }}
                    className="w-5 bg-rose-400 hover:bg-rose-500 rounded-t-sm transition-all shadow-xs duration-300 relative"
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-rose-500 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                      {d.outbound}
                    </div>
                  </div>

                </div>

                {/* Label Month */}
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                  {d.month}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Chart Legend */}
      <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-wider select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block"></span>
          Inbound
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span>
          Outbound
        </div>
      </div>
    </div>
  );
};

export default ReportsMovementChart;
