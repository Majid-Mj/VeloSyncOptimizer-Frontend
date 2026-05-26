import React from 'react';

const ReOrderLiveAlertsFeed = ({ alerts }) => {
  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-100/90 rounded-2xl p-5 hover:shadow-2xs transition-all duration-300">
      
      <div className="pb-3.5 border-b border-slate-100 mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
            Operational warnings Feed
          </h3>
          <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider block mt-0.5">
            Real-time buffer telemetry monitoring log
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-600 text-[8.5px] font-black uppercase">
          {alerts.length} Warnings
        </span>
      </div>

      <div className="flex flex-col gap-3.5 max-h-[340px] overflow-y-auto pr-1">
        {alerts.map((alert) => {
          const isHigh = alert.severity === 'HIGH' || alert.severity === 'CRITICAL';
          const alertColor = isHigh
            ? 'border-rose-100/70 bg-rose-50/20 hover:border-rose-200/80 hover:bg-rose-50/40 text-rose-600'
            : 'border-slate-100 bg-slate-50/30 hover:border-slate-200 hover:bg-slate-50/70 text-amber-600';

          return (
            <div 
              key={alert.id} 
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all duration-300 ${alertColor}`}
            >
              <div>
                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider">
                  <span className={isHigh ? 'text-rose-600' : 'text-amber-600'}>
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

              <div className="flex items-center justify-between border-t border-slate-100/70 pt-2.5 mt-3 text-[9px] font-black uppercase tracking-wider text-slate-400">
                <span>Location: <span className="text-slate-800 font-extrabold">{alert.location}</span></span>
                <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-black ${
                  isHigh ? 'bg-rose-50 text-rose-600 border border-rose-100/30' : 'bg-amber-50 text-amber-600 border border-amber-100/30'
                }`}>
                  {alert.severity}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default ReOrderLiveAlertsFeed;
