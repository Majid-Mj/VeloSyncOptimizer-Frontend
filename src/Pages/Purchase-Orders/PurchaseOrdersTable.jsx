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
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Approved':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Received':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Cancelled':
        return 'bg-red-50 text-red-500 border-red-100';
      default:
        return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-800">No Purchase Orders Found</h3>
        <p className="text-xs font-semibold text-gray-400 max-w-xs mt-1 leading-normal">
          We couldn't find any procurement requisitions matching your current filters and search text.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100">
              <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">PO Number</th>
              <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Date Raised</th>
              <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Supplier</th>
              <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Deliver To</th>
              <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider text-center">Items Count</th>
              <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider text-right">Total Amount</th>
              <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider text-center">Status</th>
              <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((po) => {
              const formattedDate = new Date(po.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              const isDraft = po.status === 'Draft';
              const isApproved = po.status === 'Approved';

              const canApproveCancel = 
                isDraft && 
                (userRole === 'ProcurementOfficer' || userRole === 'Admin');

              const canCancelApproved = 
                isApproved && 
                (userRole === 'ProcurementOfficer' || userRole === 'Admin');

              const canReceive = 
                isApproved && 
                (userRole === 'WarehouseManager');

              return (
                <tr key={po.id} className="hover:bg-gray-50/40 transition-colors">
                  {/* PO Number */}
                  <td className="px-5 py-4">
                    <span 
                      onClick={() => onViewDetails(po.id)}
                      className="text-xs font-mono font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg cursor-pointer hover:bg-blue-100/70 transition-all"
                    >
                      {po.poNumber}
                    </span>
                  </td>
                  {/* Date Raised */}
                  <td className="px-5 py-4">
                    <span className="text-[11px] font-bold text-gray-500 whitespace-nowrap">
                      {formattedDate}
                    </span>
                  </td>
                  {/* Supplier */}
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold text-gray-800 whitespace-nowrap">
                      🏭 {po.supplierName}
                    </span>
                  </td>
                  {/* Warehouse Location */}
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold text-gray-700 whitespace-nowrap">
                      🏢 {po.warehouseName}
                    </span>
                  </td>
                  {/* Lines Count */}
                  <td className="px-5 py-4 text-center text-xs font-bold text-gray-600">
                    {po.lines?.length || 0}
                  </td>
                  {/* Total Amount */}
                  <td className="px-5 py-4 text-right text-xs font-extrabold text-gray-800">
                    ${Number(po.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  {/* Status Badge */}
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${getStatusStyle(po.status)}`}>
                      {po.status}
                    </span>
                  </td>
                  {/* Row Actions */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                      {/* View Details always available */}
                      <button
                        onClick={() => onViewDetails(po.id)}
                        className="px-2 py-1 text-[10px] font-extrabold text-gray-500 bg-gray-50 border border-gray-150 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                        title="View Purchase Order Details"
                      >
                        👁️ View
                      </button>

                      {/* Approve (Procurement / Admin for Drafts) */}
                      {canApproveCancel && (
                        <button
                          onClick={() => onApprove(po.id)}
                          className="px-2.5 py-1 text-[10px] font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-100 transition-all border-none cursor-pointer"
                        >
                          Approve
                        </button>
                      )}

                      {/* Receive (Warehouse Manager for Approved POs) */}
                      {canReceive && (
                        <button
                          onClick={() => onReceive(po)}
                          className="px-2.5 py-1 text-[10px] font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-100 transition-all border-none cursor-pointer"
                        >
                          📥 Receive Stock
                        </button>
                      )}

                      {/* Cancel (Drafts & Approved POs) */}
                      {(canApproveCancel || canCancelApproved) && (
                        <button
                          onClick={() => onCancel(po.id)}
                          className="px-2 py-1 text-[10px] font-extrabold text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 rounded-lg transition-all cursor-pointer"
                        >
                          Cancel
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
