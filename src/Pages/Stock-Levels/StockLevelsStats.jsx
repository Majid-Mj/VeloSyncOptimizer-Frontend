import React from 'react';

const StockLevelsStats = ({ stats }) => {
  const cards = [
    {
      title: 'Total SKU Nodes',
      value: (stats?.totalSkus ?? 0).toLocaleString(),
      subtitle: 'Across all warehouses',
      icon: (
        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      iconBg: 'bg-indigo-50 border-indigo-100/50',
      valueColor: 'text-slate-800',
      glowColor: 'hover:border-indigo-200 hover:shadow-indigo-50',
    },
    {
      title: 'Critical Stockouts',
      value: (stats?.stockouts ?? 0).toLocaleString(),
      subtitle: 'Needs urgent purchase order',
      icon: (
        <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-rose-50 border-rose-100/50',
      valueColor: 'text-rose-600',
      glowColor: 'hover:border-rose-200 hover:shadow-rose-50',
    },
    {
      title: 'Low Stock Warnings',
      value: (stats?.lowStock ?? 0).toLocaleString(),
      subtitle: 'Below safety buffers',
      icon: (
        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z" />
        </svg>
      ),
      iconBg: 'bg-amber-50 border-amber-100/50',
      valueColor: 'text-amber-600',
      glowColor: 'hover:border-amber-200 hover:shadow-amber-50',
    },
    {
      title: 'Healthy Inventory',
      value: (stats?.healthyStock ?? 0).toLocaleString(),
      subtitle: 'Optimal replenishment status',
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
      iconBg: 'bg-emerald-50 border-emerald-100/50',
      valueColor: 'text-emerald-700',
      glowColor: 'hover:border-emerald-200 hover:shadow-emerald-50',
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div 
          key={i} 
          className={`p-5 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4 hover:-translate-y-1 transition-all duration-300 group cursor-pointer ${c.glowColor}`}
        >
          <div className={`w-12 h-12 rounded-xl ${c.iconBg} border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
            {c.icon}
          </div>
          <div className="flex flex-col">
            <h3 className={`text-2xl font-black ${c.valueColor} tracking-tight leading-none`}>
              {c.value}
            </h3>
            <p className="text-xs font-bold text-slate-800 mt-2 leading-none">
              {c.title}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 mt-1 leading-none">
              {c.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StockLevelsStats;
