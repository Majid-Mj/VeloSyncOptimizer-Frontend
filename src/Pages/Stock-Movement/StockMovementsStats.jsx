import React from 'react';

const StockMovementsStats = ({ totalCount, currentItems }) => {
  // Aggregate from current page's view items
  const inboundCount = currentItems.filter(item => item.quantity > 0 || item.movementType?.toLowerCase().includes('in') || item.movementType?.toLowerCase().includes('receipt')).length;
  const outboundCount = currentItems.filter(item => item.quantity < 0 || item.movementType?.toLowerCase().includes('out') || item.movementType?.toLowerCase().includes('issue')).length;
  const uniqueWarehouses = new Set(currentItems.map(item => item.warehouseId)).size;

  const cards = [
    {
      title: 'Audit Ledger Entries',
      value: totalCount.toLocaleString(),
      desc: 'Total logged transactions',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bg: 'bg-blue-50/60 border-blue-100',
      iconBg: 'bg-blue-100/80',
    },
    {
      title: 'Inbound Transactions',
      value: inboundCount.toLocaleString(),
      desc: 'Receipts & Transfers-In (this page)',
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
        </svg>
      ),
      bg: 'bg-emerald-50/60 border-emerald-100',
      iconBg: 'bg-emerald-100/80',
    },
    {
      title: 'Outbound Transactions',
      value: outboundCount.toLocaleString(),
      desc: 'Issues & Transfers-Out (this page)',
      icon: (
        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 11l7-7 7 7M5 19l7-7 7 7" />
        </svg>
      ),
      bg: 'bg-red-50/60 border-red-100',
      iconBg: 'bg-red-100/80',
    },
    {
      title: 'Active Warehouses',
      value: uniqueWarehouses.toLocaleString(),
      desc: 'Facilities logging movements (this page)',
      icon: (
        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      bg: 'bg-amber-50/60 border-amber-100',
      iconBg: 'bg-amber-100/80',
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div key={i} className={`p-4 bg-white rounded-2xl border ${c.bg} shadow-sm flex items-center gap-4 transition-all hover:scale-[1.01]`}>
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

export default StockMovementsStats;
