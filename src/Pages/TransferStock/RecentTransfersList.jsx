import React from 'react';

const RecentTransfersList = ({
  movements,
  parseTransferRoute,
  parseOperator,
  timeAgo,
  onViewAll
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full min-h-0 overflow-hidden">
      <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/50 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#64748b" strokeWidth="2">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
          <div className="text-[10.5px] font-extrabold text-slate-700 uppercase tracking-wider">Recent transfers</div>
        </div>
        <span 
          className="text-[9.5px] text-blue-600 hover:underline cursor-pointer font-extrabold"
          onClick={onViewAll}
        >
          View all →
        </span>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto min-h-0 px-3.5">
        {movements.length === 0 ? (
          <div className="py-5 text-center text-[10px] text-slate-400 font-bold">
            No recent stock transfers found in ledger
          </div>
        ) : (
          movements.map((mov) => (
            <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0" key={mov.id}>
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0 mr-2.5">
                <svg className="w-3.5 h-3.5 stroke-current stroke-[2] fill-none" viewBox="0 0 16 16">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-extrabold text-slate-800 truncate">{mov.productName}</div>
                <div className="text-[9.5px] text-slate-500 font-bold truncate mt-0.5">
                  {parseTransferRoute(mov)} · {parseOperator(mov)}
                </div>
                <div className="text-[8.5px] font-mono font-bold text-slate-400">{mov.reference || `TRF-${mov.id}`}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-black text-slate-900">{Math.abs(mov.quantity)} units</div>
                <div className="text-[9px] font-bold text-slate-400 mt-0.5">{timeAgo(mov.createdAt)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentTransfersList;
