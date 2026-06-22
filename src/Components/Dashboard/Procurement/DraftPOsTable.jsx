import React from 'react';

const DraftPOsTable = ({ draftPendingOrders, onManage }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_16px_-4px_rgba(148,163,184,0.06)] p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between pb-4 border-b border-slate-50 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <h3 className="text-[14px] font-extrabold text-slate-800 tracking-tight leading-none">
            Draft POs Pending Approval
          </h3>
        </div>
        <button
          onClick={onManage}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors border-none bg-transparent cursor-pointer"
        >
          Manage POs →
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-semibold text-slate-600 border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
              <th className="px-4 py-2.5">PO Number</th>
              <th className="px-4 py-2.5">Supplier</th>
              <th className="px-4 py-2.5">Warehouse</th>
              <th className="px-4 py-2.5">Expected Date</th>
              <th className="px-4 py-2.5">Cost</th>
            </tr>
          </thead>
          <tbody>
            {draftPendingOrders.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                  No pending draft purchase orders found.
                </td>
              </tr>
            ) : (
              draftPendingOrders.slice(0, 5).map(o => (
                <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-[10.5px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200/50">
                      {o.poNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-800 font-bold">{o.supplierName}</td>
                  <td className="px-4 py-3 text-slate-500 font-semibold">{o.warehouseName}</td>
                  <td className="px-4 py-3 text-slate-500 font-semibold">{o.expectedDate || 'N/A'}</td>
                  <td className="px-4 py-3 text-slate-800 font-black">
                    ₹ {o.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DraftPOsTable;
