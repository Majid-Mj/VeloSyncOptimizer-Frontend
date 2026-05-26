import React from 'react';

const PurchaseOrdersStats = ({ orders }) => {
  const totalCount = orders.length;
  const draftCount = orders.filter(o => o.status === 'Draft').length;
  const activeCount = orders.filter(o => o.status === 'Approved').length;
  const completedCount = orders.filter(o => o.status === 'Received').length;

  const totalSpend = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((acc, cur) => acc + Number(cur.totalAmount), 0);

  const cards = [
    {
      title: 'Total Procurement Committed',
      value: `$${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      desc: 'Active financial commitments',
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-emerald-50/60 border-emerald-100',
      iconBg: 'bg-emerald-100/80',
    },
    {
      title: 'Draft Requisitions',
      value: draftCount.toLocaleString(),
      desc: 'Awaiting procurement approval',
      icon: (
        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      bg: 'bg-amber-50/60 border-amber-100',
      iconBg: 'bg-amber-100/80',
    },
    {
      title: 'Approved (Pending Arrival)',
      value: activeCount.toLocaleString(),
      desc: 'In transit / Awaiting warehouse intake',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      bg: 'bg-blue-50/60 border-blue-100',
      iconBg: 'bg-blue-100/80',
    },
    {
      title: 'Intake Completed',
      value: completedCount.toLocaleString(),
      desc: 'Fully received into stock',
      icon: (
        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      bg: 'bg-purple-50/60 border-purple-100',
      iconBg: 'bg-purple-100/80',
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

export default PurchaseOrdersStats;
