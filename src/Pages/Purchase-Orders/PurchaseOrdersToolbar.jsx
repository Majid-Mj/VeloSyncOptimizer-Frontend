import React from 'react';

const PurchaseOrdersToolbar = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  userRole,
  onOpenCreate
}) => {
  const statusTabs = userRole === 'WarehouseManager'
    ? [
        { key: 'ALL', label: 'All Orders' },
        { key: 'Received', label: '✅ Received' }
      ]
    : [
        { key: 'ALL', label: 'All Orders' },
        { key: 'Draft', label: '🛠️ Drafts' },
        { key: 'Approved', label: '📦 Approved' },
        { key: 'Received', label: '✅ Received' },
        { key: 'Cancelled', label: '❌ Cancelled' }
      ];

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-4">
      {/* Top Section: Search and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md w-full">
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

        {/* Generate / Action Button */}
        {userRole === 'ProcurementOfficer' && (
          <button
            onClick={onOpenCreate}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-100 hover:shadow-lg transition-all flex items-center gap-1.5 self-end md:self-auto border-none cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Requisition PO
          </button>
        )}
      </div>

      {/* Bottom Section: Quick Status Filter Pills */}
      <div className="flex flex-wrap gap-2 border-t border-gray-50 pt-3">
        {statusTabs.map((tab) => {
          const isSelected = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white border-gray-150 text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PurchaseOrdersToolbar;
