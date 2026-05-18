import React from 'react';

const StockMovementsTable = ({ movements }) => {
  const getBadgeStyle = (item) => {
    const type = item.movementType?.toLowerCase() || '';
    const typeId = item.movementTypeId;

    if (typeId === 3 || type.includes('adjust')) {
      return 'bg-purple-50 text-purple-600 border-purple-100'; // Adjustment
    }
    if (type.includes('receipt') || type.includes('in') || item.quantity > 0) {
      return 'bg-emerald-50 text-emerald-600 border-emerald-100'; // Inbound receipt
    }
    return 'bg-red-50 text-red-500 border-red-100'; // Outbound issue
  };

  const getFriendlyType = (item) => {
    const type = item.movementType || 'Adjustment';
    const typeId = item.movementTypeId;

    if (typeId === 3) return '🛠️ Adjustment';
    if (type.toLowerCase().includes('receipt')) return '📥 Stock Receipt';
    if (type.toLowerCase().includes('transfer in')) return '🚚 Transfer (In)';
    if (type.toLowerCase().includes('transfer out')) return '🚚 Transfer (Out)';
    if (type.toLowerCase().includes('issue')) return '📤 Stock Issue';
    
    return type;
  };

  if (movements.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-800">No Stock Movements Logged</h3>
        <p className="text-xs font-semibold text-gray-400 max-w-xs mt-1 leading-normal">
          We couldn't find any inventory ledger transactions matching your current warehouse and product filter parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100">
              <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Timestamp</th>
              <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Product Info</th>
              <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Location</th>
              <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider text-center">Movement Type</th>
              <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider text-right">Qty Delta</th>
              <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider text-center">Ledger Balance</th>
              <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Reference ID</th>
              <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Reason / Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {movements.map((item) => {
              const formattedDate = new Date(item.createdAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short'
              });

              const isPositive = item.quantity > 0;
              const sign = isPositive ? '＋' : '－';
              const absQty = Math.abs(item.quantity);

              return (
                <tr key={item.id} className="hover:bg-gray-50/40 transition-colors">
                  {/* Timestamp */}
                  <td className="px-5 py-4">
                    <span className="text-[11px] font-bold text-gray-500 whitespace-nowrap">
                      {formattedDate}
                    </span>
                  </td>
                  {/* Product Details */}
                  <td className="px-5 py-4">
                    <div className="min-w-[160px]">
                      <p className="text-xs font-bold text-gray-800 tracking-tight">{item.productName}</p>
                      <span className="text-[10px] font-mono font-extrabold text-blue-500 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                        {item.sku}
                      </span>
                    </div>
                  </td>
                  {/* Location Warehouse */}
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold text-gray-700 whitespace-nowrap">
                      🏢 {item.warehouseName}
                    </span>
                  </td>
                  {/* Movement Type Badges */}
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${getBadgeStyle(item)}`}>
                      {getFriendlyType(item)}
                    </span>
                  </td>
                  {/* Qty Change */}
                  <td className={`px-5 py-4 text-right text-xs font-extrabold whitespace-nowrap ${
                    isPositive ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {sign}{absQty.toLocaleString()}
                  </td>
                  {/* Before ➔ After Balance Diagram */}
                  <td className="px-5 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 bg-gray-50 border border-gray-100/50 px-2 py-0.5 rounded-lg whitespace-nowrap">
                      <span className="text-gray-500 font-bold">{item.quantityBefore}</span>
                      <span>➔</span>
                      <span className="text-gray-800 font-extrabold">{item.quantityAfter}</span>
                    </div>
                  </td>
                  {/* Reference ID */}
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-mono font-extrabold text-gray-500 whitespace-nowrap bg-gray-50 px-1.5 py-0.5 border border-gray-100 rounded">
                      {item.reference || 'REF-SYSTEM'}
                    </span>
                  </td>
                  {/* Notes / Reason */}
                  <td className="px-5 py-4">
                    <p className="text-xs font-semibold text-gray-500 max-w-xs truncate" title={item.notes}>
                      {item.notes || <span className="text-gray-300 italic">No notes provided</span>}
                    </p>
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

export default StockMovementsTable;
