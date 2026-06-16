import React from 'react';

// Modern SVG icon map for status pills
const StatusIcon = ({ statusKey, className = 'w-3.5 h-3.5' }) => {
  const icons = {
    ALL: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>
    ),
    Draft: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
      </svg>
    ),
    Approved: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    Received: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
    Cancelled: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };
  return icons[statusKey] ?? null;
};

const PurchaseOrdersToolbar = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  warehouseFilter,
  setWarehouseFilter,
  warehouses,
  userRole,
  onOpenCreate
}) => {
  const statusTabs = userRole === 'WarehouseManager'
    ? [
      { key: 'ALL', label: 'All Orders' },
      { key: 'Received', label: 'Received' }
    ]
    : [
      { key: 'ALL', label: 'All Orders' },
      { key: 'Draft', label: 'Drafts' },
      { key: 'Approved', label: 'Approved' },
      { key: 'Received', label: 'Received' },
      { key: 'Cancelled', label: 'Cancelled' }
    ];

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-4">
      {/* Top Section: Search and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row flex-1 gap-3 items-center max-w-2xl w-full">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PO number, supplier, or location..."
              className="w-full bg-[#f8fafc] text-xs font-bold text-gray-700 pl-9.5 pr-4 py-2.5 rounded-xl border border-gray-100 outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
            <svg className="w-4.5 h-4.5 text-gray-400 absolute left-3 bottom-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Warehouse Dropdown (shown if not WarehouseManager) */}
          {userRole !== 'WarehouseManager' && (
            <div className="relative w-full sm:w-56">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
              </div>
              <select
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
                className="w-full bg-[#f8fafc] text-xs font-bold text-gray-700 pl-9 pr-9 py-2.5 rounded-xl border border-gray-100 outline-none appearance-none cursor-pointer focus:border-blue-500 focus:bg-white transition-all"
              >
                <option value="ALL">All Warehouses</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id.toString()}>{wh.name}</option>
                ))}
              </select>
              <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          )}
        </div>

        {/* Generate / Action Button */}
        {(userRole === 'ProcurementOfficer' || userRole === 'Administrator' || userRole === 'Admin' || userRole === 'ProcurementManager') && (
          <button
            onClick={onOpenCreate}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-100 hover:shadow-lg transition-all flex items-center gap-1.5 self-end md:self-auto border-none cursor-pointer whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Purchase Order
          </button>
        )}
      </div>

      {/* Bottom Section: Quick Status Filter Pills */}
      <div className="flex flex-wrap gap-2 border-t border-gray-50 pt-3">
        {statusTabs.map((tab) => {
          const isSelected = statusFilter === tab.key;
          const iconAccent = {
            ALL: 'text-blue-500',
            Draft: 'text-amber-500',
            Approved: 'text-emerald-500',
            Received: 'text-indigo-500',
            Cancelled: 'text-rose-500',
          }[tab.key] || 'text-gray-400';
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white border-gray-150 text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-200'
              }`}
            >
              <span className={isSelected ? 'text-white/90' : iconAccent}>
                <StatusIcon statusKey={tab.key} className="w-3.5 h-3.5" />
              </span>
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PurchaseOrdersToolbar;
