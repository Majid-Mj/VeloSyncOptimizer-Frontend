import React from 'react';

const ReOrderLiveAlertsFeed = ({ alerts }) => {
  return (
    <div className="bg-gradient-to-br from-white to-[#fcfdff]/90 backdrop-blur-md border border-white/60 rounded-3xl p-5 hover:shadow-[0_8px_24px_-4px_rgba(148,163,184,0.08)] transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(148,163,184,0.06)]">
      
      <div className="pb-3.5 border-b border-slate-100/80 mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#704efe] shadow-sm shadow-[#704efe]/40 animate-pulse"></span>
            Operational Warnings Feed
          </h3>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
            Real-time buffer telemetry monitoring log
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-lg bg-[#f0ebff] border border-indigo-150 text-[#704efe] text-[8.5px] font-black uppercase tracking-wider">
          {alerts.length} Warnings
        </span>
      </div>

      <div className="flex flex-col gap-3 max-h-[340px] overflow-y-auto pr-1">
        {alerts.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-semibold uppercase tracking-wider select-none">
            No active operational warnings
          </div>
        ) : (
          alerts.map((alert) => {
            const isHigh = alert.severity === 'HIGH' || alert.severity === 'CRITICAL';
            const alertColor = isHigh
              ? 'border-rose-100 bg-rose-50/20 hover:border-rose-200 hover:bg-rose-50/35 text-rose-750'
              : 'border-amber-100 bg-amber-50/15 hover:border-amber-200 hover:bg-amber-50/30 text-amber-800';

            return (
              <div 
                key={alert.id} 
                className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all duration-300 shadow-3xs ${alertColor}`}
              >
                <div>
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isHigh ? 'bg-rose-500' : 'bg-amber-500'}`} />
                      {alert.title}
                    </span>
                    <span className="text-slate-400 font-mono font-bold">
                      {alert.createdAt}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-700 mt-2 font-semibold leading-normal">
                    {alert.sub}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100/60 pt-2.5 mt-3 text-[9px] font-black uppercase tracking-wider text-slate-400">
                  <span>Location: <span className="text-slate-800 font-extrabold">{alert.location}</span></span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black tracking-wider ${
                    isHigh ? 'bg-rose-50 text-rose-600 border border-rose-100/35' : 'bg-amber-50 text-amber-600 border border-amber-100/35'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default ReOrderLiveAlertsFeed;
