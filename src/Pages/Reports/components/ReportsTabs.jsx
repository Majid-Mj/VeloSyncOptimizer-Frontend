import React from 'react';

const ReportsTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'Overview', name: 'Overview' },
    { id: 'Velocity Report', name: 'Velocity Report' },
    { id: 'Movement Report', name: 'Movement Report' },
    { id: 'Stockout History', name: 'Stockout History' },
    { id: 'Supplier Report', name: 'Supplier Report' },
    { id: 'Audit Log', name: 'Audit Log' }
  ];

  return (
    <div className="bg-white border border-slate-100 p-1.5 rounded-2xl flex flex-wrap gap-1 shadow-3xs">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4.5 py-2.5 font-black text-[11px] uppercase tracking-wider rounded-xl transition-all border-none cursor-pointer ${isActive
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
          >
            {tab.name}
          </button>
        );
      })}
    </div>
  );
};

export default ReportsTabs;
