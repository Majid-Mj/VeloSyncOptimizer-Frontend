import React from 'react';

const RecentTransfersList = ({
  movements,
  parseTransferRoute,
  parseOperator,
  timeAgo,
  onViewAll
}) => {
  // Generate beautiful gradient presets based on letter hashing
  const getAvatarGradient = (name) => {
    const charCode = (name || 'P').charCodeAt(0);
    const presets = [
      'from-blue-500 to-indigo-600 shadow-blue-100',
      'from-emerald-500 to-teal-600 shadow-emerald-100',
      'from-violet-500 to-purple-600 shadow-violet-100',
      'from-amber-500 to-orange-600 shadow-amber-100',
      'from-rose-500 to-pink-600 shadow-rose-100',
      'from-cyan-500 to-blue-600 shadow-cyan-100'
    ];
    return presets[charCode % presets.length];
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-100 shadow-xs rounded-2xl flex flex-col h-full overflow-hidden">
      
      {/* Panel Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200/50 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Recent Transfers
          </h3>
        </div>
        <button 
          onClick={onViewAll}
          className="text-[10px] text-indigo-600 hover:text-indigo-700 bg-transparent border-none cursor-pointer font-black uppercase tracking-wider flex items-center gap-1 transition-colors"
        >
          View all
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Transfers Scroll List */}
      <div className="flex flex-col flex-1 overflow-y-auto min-h-0 divide-y divide-slate-100/60 px-5">
        {movements.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">No transfers found</p>
          </div>
        ) : (
          movements.map((mov) => {
            const avatarLetter = (mov.productName || 'P').charAt(0).toUpperCase();
            const avatarGradient = getAvatarGradient(mov.productName);

            const rawRoute = parseTransferRoute(mov);
            const routeParts = rawRoute.split('➔');
            const styledRoute = routeParts.length === 2 ? (
              <span className="flex items-center gap-1">
                <span className="font-extrabold text-slate-600">{routeParts[0].trim()}</span>
                <span className="text-slate-350">➔</span>
                <span className="font-extrabold text-slate-600">{routeParts[1].trim()}</span>
              </span>
            ) : (
              <span className="font-extrabold text-slate-600">{rawRoute}</span>
            );

            return (
              <div 
                className="flex items-center justify-between py-3 first:pt-4.5 last:pb-4.5 group transition-colors" 
                key={mov.id}
              >
                {/* Product Avatar */}
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-xs font-black shadow-xs shrink-0 select-none group-hover:scale-102 transition-transform mr-3`}>
                  {avatarLetter}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="text-xs font-bold text-slate-800 truncate leading-tight">
                    {mov.productName}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 mt-1.5 leading-none">
                    {styledRoute}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 leading-none">
                    <span className="text-[8.5px] font-mono font-bold text-slate-400 uppercase">
                      {mov.reference || `TRF-${mov.id}`}
                    </span>
                    <span className="text-[8.5px] font-semibold text-slate-400 uppercase">
                      · {parseOperator(mov)}
                    </span>
                  </div>
                </div>

                {/* Quantity */}
                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-slate-700 bg-slate-50 border border-slate-100 rounded-lg px-2 py-0.5 inline-block">
                    {Math.abs(mov.quantity).toLocaleString()} u
                  </div>
                  <div className="text-[9px] font-bold text-slate-450 mt-1.5 uppercase tracking-wide">
                    {timeAgo(mov.createdAt)}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default RecentTransfersList;
