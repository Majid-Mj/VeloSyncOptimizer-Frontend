import React from 'react';

const ALERTS_DATA = [
  {
    id: 1,
    severity: 'HIGH',
    title: 'Rice Bags 25kg',
    sub: 'WH-KL-01 · Stockout in 2 days'
  },
  {
    id: 2,
    severity: 'MED',
    title: 'Cooking Oil 5L',
    sub: 'WH-PG-02 · Below reorder point'
  },
  {
    id: 3,
    severity: 'HIGH',
    title: 'Sugar 1kg Premium',
    sub: 'WH-JB-03 · 3 days remaining'
  },
  {
    id: 4,
    severity: 'LOW',
    title: 'Flour 5kg',
    sub: 'WH-KK-04 · Monitor recommended'
  }
];

const LiveAlerts = () => {
  const sevClasses = {
    HIGH: 'bg-red-50 text-red-600 border border-red-100/60',
    MED: 'bg-amber-50 text-amber-600 border border-amber-100/60',
    LOW: 'bg-green-50 text-green-600 border border-green-100/60'
  };

  return (
    <div className="w-full lg:w-[400px] bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col p-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-50 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
          <h3 className="text-[14.5px] font-bold text-gray-800 tracking-tight">Live alerts</h3>
        </div>
        <button className="text-[11.5px] font-bold text-blue-600 hover:underline bg-transparent border-none cursor-pointer p-0">
          View all →
        </button>
      </div>

      {/* Alerts List */}
      <div className="flex-1 flex flex-col gap-3.5 mt-4">
        {ALERTS_DATA.map((alert) => (
          <div key={alert.id} className="flex items-center justify-between gap-3.5">
            {/* Severity tag */}
            <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded min-w-[38px] text-center tracking-wide leading-none ${sevClasses[alert.severity]}`}>
              {alert.severity}
            </span>

            {/* Title / Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-bold text-gray-800 truncate leading-tight">
                {alert.title}
              </h4>
              <p className="text-[11px] font-medium text-gray-400 mt-0.5 truncate leading-none">
                {alert.sub}
              </p>
            </div>

            {/* Action */}
            <button className="text-[11px] font-bold text-blue-500 hover:underline bg-transparent border-none cursor-pointer shrink-0">
              Review →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveAlerts;
