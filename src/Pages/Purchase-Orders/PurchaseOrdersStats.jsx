import React from 'react';

const PurchaseOrdersStats = ({ orders, userRole }) => {
  const totalCount = orders.length;
  const draftCount = orders.filter(o => o.status === 'Draft').length;
  const activeCount = orders.filter(o => o.status === 'Approved').length;
  const completedCount = orders.filter(o => o.status === 'Received').length;

  const totalSpend = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((acc, cur) => acc + Number(cur.totalAmount), 0);

  const cards = userRole === 'WarehouseManager'
    ? [
        {
          title: 'Total Scoped Spend',
          value: `₹${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          desc: 'Financial committed value for this facility',
          icon: (
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bg: 'bg-emerald-50/40 border-emerald-100/70',
          iconBg: 'bg-emerald-500/10 border border-emerald-500/20',
        },
        {
          title: 'Incoming POs',
          value: activeCount.toLocaleString(),
          desc: 'Approved orders en route to warehouse',
          icon: (
            <svg className="w-5 h-5 text-blue-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
          bg: 'bg-blue-50/40 border-blue-100/70',
          iconBg: 'bg-blue-500/10 border border-blue-500/20',
        },
        {
          title: 'Stock Intake Logged',
          value: completedCount.toLocaleString(),
          desc: 'POs fully received and added to inventory',
          icon: (
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          ),
          bg: 'bg-indigo-50/40 border-indigo-100/70',
          iconBg: 'bg-indigo-500/10 border border-indigo-500/20',
        }
      ]
    : [
        {
          title: 'Total Committed Capital',
          value: `₹${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          desc: 'Total active procurement spend',
          icon: (
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bg: 'bg-emerald-50/40 border-emerald-100/70',
          iconBg: 'bg-emerald-500/10 border border-emerald-500/20',
        },
        {
          title: 'Draft Requisitions',
          value: draftCount.toLocaleString(),
          desc: 'Awaiting review and approval action',
          icon: (
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ),
          bg: 'bg-amber-50/40 border-amber-100/70',
          iconBg: 'bg-amber-500/10 border border-amber-500/20',
        },
        {
          title: 'Approved / In-Transit',
          value: activeCount.toLocaleString(),
          desc: 'Freight shipped & pending warehouse intake',
          icon: (
            <svg className="w-5 h-5 text-blue-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
          bg: 'bg-blue-50/40 border-blue-100/70',
          iconBg: 'bg-blue-500/10 border border-blue-500/20',
        },
        {
          title: 'Completed Intakes',
          value: completedCount.toLocaleString(),
          desc: 'Inventory securely received and stocked',
          icon: (
            <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          ),
          bg: 'bg-violet-50/40 border-violet-100/70',
          iconBg: 'bg-violet-500/10 border border-violet-500/20',
        }
      ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${userRole === 'WarehouseManager' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-5`}>
      {cards.map((c, i) => (
        <div key={i} className={`p-5 bg-white rounded-3xl border ${c.bg} shadow-xs flex items-center gap-4 transition-all hover:scale-[1.015] hover:shadow-sm duration-200`}>
          <div className={`w-11 h-11 rounded-2xl ${c.iconBg} flex items-center justify-center shrink-0 shadow-3xs`}>
            {c.icon}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{c.title}</p>
            <h3 className="text-xl font-black text-slate-800 mt-2 tracking-tight leading-none">{c.value}</h3>
            <p className="text-[9.5px] font-bold text-slate-400 mt-2 truncate leading-none">{c.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PurchaseOrdersStats;
