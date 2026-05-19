import React from 'react';

const StockLevelsStats = ({ stats }) => {
  const cards = [
    {
      title: 'Total SKUs',
      value: (stats?.totalSkus ?? 0).toLocaleString(),
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      iconBg: 'bg-blue-50',
      valueColor: 'text-gray-800',
    },
    {
      title: 'Stockouts',
      value: (stats?.stockouts ?? 0).toLocaleString(),
      icon: (
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-red-50',
      valueColor: 'text-red-600',
    },
    {
      title: 'Low stock',
      value: (stats?.lowStock ?? 0).toLocaleString(),
      icon: (
        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z" />
        </svg>
      ),
      iconBg: 'bg-amber-50',
      valueColor: 'text-amber-600',
    },
    {
      title: 'Healthy stock',
      value: (stats?.healthyStock ?? 0).toLocaleString(),
      icon: (
        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
      iconBg: 'bg-green-50',
      valueColor: 'text-emerald-700',
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div 
          key={i} 
          className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4"
        >
          <div className={`w-12 h-12 rounded-2xl ${c.iconBg} flex items-center justify-center shrink-0`}>
            {c.icon}
          </div>
          <div className="flex flex-col">
            <h3 className={`text-2xl font-bold ${c.valueColor} tracking-tight leading-none`}>
              {c.value}
            </h3>
            <p className="text-[13px] font-semibold text-gray-400 mt-1.5 leading-none">
              {c.title}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StockLevelsStats;
