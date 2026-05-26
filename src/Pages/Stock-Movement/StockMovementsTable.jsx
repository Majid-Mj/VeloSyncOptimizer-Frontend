import React from 'react';

const StockMovementsTable = ({ movements }) => {
  const getBadgeStyle = (item) => {
    const type = item.movementType?.toLowerCase() || '';
    const typeId = item.movementTypeId;

    if (typeId === 3 || type.includes('adjust')) {
      return 'bg-purple-50 text-purple-600 border-purple-100/60'; // Adjustment
    }
    if (type.includes('receipt') || type.includes('in') || item.quantity > 0) {
      return 'bg-emerald-50 text-emerald-600 border-emerald-100/60'; // Inbound receipt
    }
    return 'bg-rose-50 text-rose-600 border-rose-100/60'; // Outbound issue
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

  // Generate beautiful gradient presets based on letter hashing
  const getAvatarGradient = (name) => {
    const charCode = (name || 'P').charCodeAt(0);
    const presets = [
      'from-blue-500 to-indigo-600 shadow-blue-100',
      'from-emerald-500 to-teal-600 shadow-emerald-100',
      'from-violet-500 to-purple-600 shadow-violet-100',
      'from-amber-500 to-orange-600 shadow-amber-100',
      'from-rose-500 to-pink-600 shadow-rose-100',
      'from-cyan-500 to-blue-600 shadow-cyan-100'
    ];
    return presets[charCode % presets.length];
  };

  if (movements.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[340px] shadow-xs">
        <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4 animate-bounce">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">No Movements Found</h3>
        <p className="text-xs font-semibold text-slate-400 max-w-xs mt-1.5 leading-normal">
          We couldn't find any inventory ledger transactions matching your current warehouse and product filter parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100/90 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-5 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
              <th className="px-5 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Product Details</th>
              <th className="px-5 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Location Node</th>
              <th className="px-5 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Movement Type</th>
              <th className="px-5 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Quantity Delta</th>
              <th className="px-5 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Ledger Runway</th>
              <th className="px-5 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Reference Node</th>
              <th className="px-5 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Notes & Reasons</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {movements.map((item) => {
              const dateObj = new Date(item.createdAt);
              const formattedDate = dateObj.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
              const formattedTime = dateObj.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit'
              });

              const isPositive = item.quantity > 0;
              const absQty = Math.abs(item.quantity);
              const avatarLetter = (item.productName || 'P').charAt(0).toUpperCase();
              const avatarGradient = getAvatarGradient(item.productName);

              return (
                <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                  {/* Timestamp */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-0.5 whitespace-nowrap">
                      <span className="text-xs font-black text-slate-700">
                        {formattedDate}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                        {formattedTime}
                      </span>
                    </div>
                  </td>
                  {/* Product Details */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 min-w-[200px]">
                      {/* Avatar */}
                      <div className={`w-8.5 h-8.5 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-[13px] font-black shadow-xs shrink-0 select-none group-hover:scale-105 transition-transform`}>
                        {avatarLetter}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-slate-800 tracking-tight truncate leading-tight">
                          {item.productName}
                        </p>
                        <span className="text-[9px] font-mono font-bold text-indigo-500 bg-indigo-50 border border-indigo-100/50 px-1.5 py-0.5 rounded uppercase tracking-wider mt-1 inline-block">
                          {item.sku}
                        </span>
                      </div>
                    </div>
                  </td>
                  {/* Location Warehouse */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col whitespace-nowrap">
                      <span className="text-xs font-black text-slate-700 flex items-center gap-1">
                        🏢 {item.warehouseName}
                      </span>
                      <span className="text-[9.5px] font-bold text-slate-400 uppercase mt-0.5 pl-4.5">
                        {item.warehouseCode || `WH-${item.warehouseId}`}
                      </span>
                    </div>
                  </td>
                  {/* Movement Type Badges */}
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full border whitespace-nowrap ${getBadgeStyle(item)}`}>
                      {getFriendlyType(item)}
                    </span>
                  </td>
                  {/* Qty Change */}
                  <td className="px-5 py-4 text-right">
                    <span className={`inline-block text-xs font-black font-mono px-2 py-0.5 rounded-lg border whitespace-nowrap ${
                      isPositive 
                        ? 'text-emerald-700 bg-emerald-50/40 border-emerald-100 shadow-sm shadow-emerald-50' 
                        : 'text-rose-600 bg-rose-50/40 border-rose-100 shadow-sm shadow-rose-50'
                    }`}>
                      {isPositive ? '+' : '-'}{absQty.toLocaleString()}
                    </span>
                  </td>
                  {/* Before ➔ After Balance Diagram */}
                  <td className="px-5 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50/70 border border-slate-100/80 px-2.5 py-1 rounded-xl whitespace-nowrap">
                      <span className="text-slate-500 font-extrabold">{item.quantityBefore.toLocaleString()}</span>
                      <span className="text-slate-300">➔</span>
                      <span className="text-slate-800 font-black">{item.quantityAfter.toLocaleString()}</span>
                    </div>
                  </td>
                  {/* Reference ID */}
                  <td className="px-5 py-4">
                    <span className="text-[9.5px] font-mono font-bold text-slate-500 whitespace-nowrap bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">
                      {item.reference || 'REF-SYSTEM'}
                    </span>
                  </td>
                  {/* Notes / Reason */}
                  <td className="px-5 py-4">
                    <p className="text-xs font-semibold text-slate-500 max-w-[200px] truncate" title={item.notes}>
                      {item.notes || <span className="text-slate-300 italic">No notes provided</span>}
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
