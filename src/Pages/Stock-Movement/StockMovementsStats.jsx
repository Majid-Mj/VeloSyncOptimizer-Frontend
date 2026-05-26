import React from 'react';
import { useSelector } from 'react-redux';

const StockMovementsStats = ({ totalCount, currentItems }) => {
  const { user } = useSelector(state => state.auth);
  const isManager = user?.role === 'WarehouseManager';

  // Aggregate from current page's view items
  const inboundCount = currentItems.filter(item => 
    item.quantity > 0 || 
    (item.movementType || '').toLowerCase().includes('in') || 
    (item.movementType || '').toLowerCase().includes('receipt')
  ).length;
  
  const outboundCount = currentItems.filter(item => 
    item.quantity < 0 || 
    (item.movementType || '').toLowerCase().includes('out') || 
    (item.movementType || '').toLowerCase().includes('issue')
  ).length;

  const uniqueWarehouses = new Set(currentItems.map(item => item.warehouseId)).size;

  const cards = [
    {
      title: 'Audit Ledger Entries',
      value: totalCount.toLocaleString(),
      desc: isManager ? 'Your facility transactions' : 'Total logged events',
      icon: (
        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      iconBg: 'bg-indigo-50 border-indigo-100/50',
      glowColor: 'hover:border-indigo-200 hover:shadow-indigo-50',
      valueColor: 'text-slate-800'
    },
    {
      title: 'Inbound Receipts',
      value: inboundCount.toLocaleString(),
      desc: 'Stock entries on this page',
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
        </svg>
      ),
      iconBg: 'bg-emerald-50 border-emerald-100/50',
      glowColor: 'hover:border-emerald-200 hover:shadow-emerald-50',
      valueColor: 'text-emerald-600'
    },
    {
      title: 'Outbound Issues',
      value: outboundCount.toLocaleString(),
      desc: 'Stock dispatches on this page',
      icon: (
        <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 11l7-7 7 7M5 19l7-7 7 7" />
        </svg>
      ),
      iconBg: 'bg-rose-50 border-rose-100/50',
      glowColor: 'hover:border-rose-200 hover:shadow-rose-50',
      valueColor: 'text-rose-600'
    },
    {
      title: isManager ? 'Assigned Scope' : 'Active Warehouses',
      value: isManager ? '1 Facility' : `${uniqueWarehouses} Nodes`,
      desc: isManager ? 'Warehouse lock active' : 'Facilities shown on this page',
      icon: (
        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      iconBg: 'bg-amber-50 border-amber-100/50',
      glowColor: 'hover:border-amber-200 hover:shadow-amber-50',
      valueColor: 'text-amber-700'
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
            <p className="text-[10px] font-semibold text-slate-400 mt-1 leading-none uppercase tracking-wide">
              {c.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StockMovementsStats;
