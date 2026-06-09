import React from 'react';

const ReportsMetrics = ({ analytics, loading }) => {
  const metrics = [
    {
      id: 'inbound',
      title: 'Total units received (30d)',
      value: analytics ? analytics.totalUnitsReceived.toLocaleString() : '0',
      trend: '▲ 14%',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      ),
      iconBg: 'bg-blue-50 text-blue-600',
      trendBg: 'bg-emerald-50 text-emerald-600'
    },
    {
      id: 'outbound',
      title: 'Total units dispatched (30d)',
      value: analytics ? analytics.totalUnitsDispatched.toLocaleString() : '0',
      trend: '▼ 3%',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      ),
      iconBg: 'bg-rose-50 text-rose-500',
      trendBg: 'bg-rose-50 text-rose-600'
    },
    {
      id: 'stockout',
      title: 'Stockout events (30d)',
      value: analytics ? analytics.stockoutEvents.toString() : '0',
      trend: '▲ 2',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      iconBg: 'bg-amber-50 text-amber-500',
      trendBg: 'bg-amber-50 text-amber-600'
    },
    {
      id: 'supplier',
      title: 'Supplier on-time rate',
      value: analytics ? `${Math.round(analytics.supplierOnTimeRate)}%` : '0%',
      trend: '▲ 8%',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      iconBg: 'bg-violet-50 text-violet-600',
      trendBg: 'bg-emerald-50 text-emerald-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {metrics.map((card) => (
        <div key={card.id} className="bg-white border border-slate-100 p-5.5 rounded-2xl flex flex-col gap-4 shadow-3xs relative overflow-hidden group hover:border-slate-200 transition-all">
          <div className="flex items-center justify-between">
            {/* Icon Container */}
            <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center`}>
              {card.icon}
            </div>

            {/* Trend Pill */}
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full select-none ${card.trendBg}`}>
              {card.trend}
            </span>
          </div>

          <div>
            {loading ? (
              <div className="h-7 w-28 bg-slate-100 rounded-lg animate-pulse my-0.5" />
            ) : (
              <div className="text-[25px] font-black text-slate-900 leading-none">
                {card.value}
              </div>
            )}
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mt-2 select-none">
              {card.title}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportsMetrics;
