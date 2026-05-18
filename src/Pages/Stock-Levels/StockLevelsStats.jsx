import React from 'react';

const StockLevelsStats = ({ stats }) => {
  const cards = [
    {
      title: 'Total Monitored SKUs',
      value: stats.totalSkus.toLocaleString(),
      desc: 'Distinct product definitions',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      bg: 'bg-blue-50/60 border-blue-100',
      iconBg: 'bg-blue-100/80',
    },
    {
      title: 'Total Stock On Hand',
      value: stats.totalOnHand.toLocaleString(),
      desc: 'Units across all locations',
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      bg: 'bg-emerald-50/60 border-emerald-100',
      iconBg: 'bg-emerald-100/80',
    },
    {
      title: 'Critical Low Stock',
      value: stats.lowStockCount.toLocaleString(),
      desc: 'Item count below reorder point',
      icon: (
        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      bg: 'bg-amber-50/60 border-amber-100',
      iconBg: 'bg-amber-100/80',
      highlight: stats.lowStockCount > 0
    },
    {
      title: 'Out of Stock Items',
      value: stats.outOfStockCount.toLocaleString(),
      desc: 'Immediate replenishment required',
      icon: (
        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-red-50/60 border-red-100',
      iconBg: 'bg-red-100/80',
      highlight: stats.outOfStockCount > 0
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div 
          key={i} 
          className={`p-4 bg-white rounded-2xl border ${c.bg} shadow-sm transition-all duration-300 flex items-center gap-4 ${
            c.highlight ? 'ring-2 ring-offset-1 ring-red-200/50 animate-pulse' : ''
          }`}
        >
          <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0`}>
            {c.icon}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{c.title}</p>
            <h3 className="text-xl font-extrabold text-gray-800 mt-0.5 tracking-tight leading-none">{c.value}</h3>
            <p className="text-[10px] font-semibold text-gray-400 mt-1 truncate leading-none">{c.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StockLevelsStats;
