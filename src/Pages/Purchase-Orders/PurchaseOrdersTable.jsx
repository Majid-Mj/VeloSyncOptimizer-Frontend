import React from 'react';

const PurchaseOrdersTable = ({
  orders,
  userRole,
  onApprove,
  onCancel,
  onReceive,
  onViewDetails
}) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Draft':
        return 'bg-amber-50/60 text-amber-700 border-amber-200/80';
      case 'Approved':
        return 'bg-blue-50/60 text-blue-700 border-blue-200/80';
      case 'Received':
        return 'bg-emerald-50/60 text-emerald-700 border-emerald-200/80';
      case 'Cancelled':
        return 'bg-rose-50/60 text-rose-700 border-rose-200/80';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getRelativeTime = (dateStr) => {
    const created = new Date(dateStr);
    const now = new Date();
    // Zero out hours/minutes/seconds for date comparison
    created.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffTime = now - created;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 0) return 'Scheduled';
    return `${diffDays}d ago`;
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[350px] shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100/60">
          <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">No Purchase Orders Scoped</h3>
        <p className="text-xs font-semibold text-slate-400 max-w-xs mt-1.5 leading-normal">
          We couldn't locate any active, draft, or completed requisitions matching your current view criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/60 border-b border-slate-100/70">
              <th className="px-6 py-4.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">PO Identifier</th>
              <th className="px-6 py-4.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timeline</th>
              <th className="px-6 py-4.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier Source</th>
              <th className="px-6 py-4.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Receiving Facility</th>
              <th className="px-6 py-4.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">SKUs</th>
              <th className="px-6 py-4.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Commitment</th>
              <th className="px-6 py-4.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((po) => {
              const formattedDate = new Date(po.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              const isDraft = po.status === 'Draft';
              const isApproved = po.status === 'Approved';

              const canApprove =
                isDraft &&
                (userRole === 'Administrator' || userRole === 'Admin');

              const canCancel =
                (isDraft || isApproved) &&
                (userRole === 'ProcurementOfficer' || userRole === 'Administrator' || userRole === 'Admin' || userRole === 'ProcurementManager');

              const canReceive =
                isApproved &&
                (userRole === 'WarehouseManager' || userRole === 'Administrator' || userRole === 'Admin');

              return (
                <tr key={po.id} className="hover:bg-slate-50/40 transition-colors duration-150 group">
                  {/* PO Number */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        onClick={() => onViewDetails(po.id)}
                        className="text-xs font-mono font-black text-indigo-600 bg-indigo-50 border border-indigo-100/70 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-indigo-600 hover:text-white transition-all shadow-3xs"
                      >
                        {po.poNumber}
                      </span>
                    </div>
                  </td>

                  {/* Date Raised / Timeline */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-extrabold text-slate-700 whitespace-nowrap">
                        {formattedDate}
                      </span>
                      <span className="text-[9px] font-black text-slate-400 mt-0.5 uppercase tracking-wide">
                        ⏳ {getRelativeTime(po.createdAt)}
                      </span>
                    </div>
                  </td>

                  {/* Supplier */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-[10px]">🏢</span>
                      <span className="text-xs font-bold text-slate-800 whitespace-nowrap truncate max-w-[150px]" title={po.supplierName}>
                        {po.supplierName}
                      </span>
                    </div>
                  </td>

                  {/* Warehouse Location */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center text-[10px]">🏬</span>
                      <span className="text-xs font-bold text-slate-700 whitespace-nowrap truncate max-w-[150px]" title={po.warehouseName}>
                        {po.warehouseName}
                      </span>
                    </div>
                  </td>

                  {/* Lines Count */}
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200/50">
                      {po.lines?.length || 0}
                    </span>
                  </td>

                  {/* Total Amount */}
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-black text-slate-900 tracking-tight">
                      ₹{Number(po.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-0.5 rounded-full border whitespace-nowrap shadow-3xs ${getStatusStyle(po.status)}`}>
                      {po.status === 'Approved' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                      )}
                      {po.status === 'Draft' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      )}
                      {po.status === 'Received' && (
                        <span className="text-[8px]">✓</span>
                      )}
                      {po.status}
                    </span>
                  </td>

                  {/* Row Operations */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                      {/* View Details */}
                      <button
                        onClick={() => onViewDetails(po.id)}
                        className="px-2.5 py-1.5 text-[10px] font-black text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl transition-all cursor-pointer flex items-center gap-1 hover:scale-102"
                        title="View Purchase Order Details"
                      >
                        👁️ View
                      </button>

                      {/* Approve (Admin for Drafts) */}
                      {canApprove && (
                        <button
                          onClick={() => onApprove(po.id)}
                          className="px-3 py-1.5 text-[10px] font-black text-white bg-black hover:bg-zinc-900 rounded-xl transition-all border-none cursor-pointer flex items-center gap-1 hover:scale-102 active:scale-98"
                        >
                          ✓ Approve
                        </button>
                      )}

                      {/* Receive (Warehouse Manager for Approved POs) */}
                      {canReceive && (
                        <button
                          onClick={() => onReceive(po)}
                          className="px-3.5 py-1.5 text-[10px] font-black text-white bg-black hover:bg-zinc-900 rounded-xl transition-all border-none cursor-pointer flex items-center gap-1 hover:scale-102 active:scale-98"
                        >
                          📥 Intake Stock
                        </button>
                      )}

                      {/* Cancel (Drafts & Approved POs) */}
                      {canCancel && (
                        <button
                          onClick={() => onCancel(po.id)}
                          className="px-2.5 py-1.5 text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-xl transition-all cursor-pointer flex items-center gap-1 hover:scale-102"
                        >
                          ✕ Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseOrdersTable;
