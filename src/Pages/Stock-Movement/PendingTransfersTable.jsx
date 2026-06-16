import React, { useState } from 'react';

const PendingTransfersTable = ({
  transfers,
  loading,
  userRole,
  managerWarehouseId,
  onIntake
}) => {
  const isAdmin = userRole === 'Admin' || userRole === 'Administrator';

  const canAccept = (transfer) => {
    if (isAdmin) return true;
    if (userRole === 'WarehouseManager' && managerWarehouseId) {
      return transfer.destWarehouseId === managerWarehouseId;
    }
    return false;
  };

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

  if (loading && transfers.length === 0) {
    return (
      <div className="premium-card bg-white p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 rounded-full border-4 border-[#704efe] border-t-transparent animate-spin mb-4"></div>
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Loading pending transfers...</p>
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="premium-card bg-white p-12 text-center flex flex-col items-center justify-center min-h-[340px]">
        <div className="w-16 h-16 rounded-full bg-slate-50 border border-[#eff1f5] flex items-center justify-center text-slate-400 mb-4">
          <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xs font-black text-slate-805 uppercase tracking-wider">All Transfers Received</h3>
        <p className="text-[11px] font-semibold text-slate-400 max-w-xs mt-1.5 leading-normal">
          There are no pending inbound shipments in transit that require receipt confirmation at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="premium-card bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="premium-table w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#eff1f5]">
              <th className="px-5 py-4 text-[9px] font-black text-[#8a8b9d] uppercase tracking-widest">Transfer Ref</th>
              <th className="px-5 py-4 text-[9px] font-black text-[#8a8b9d] uppercase tracking-widest">Product Details</th>
              <th className="px-5 py-4 text-[9px] font-black text-[#8a8b9d] uppercase tracking-widest">Source Warehouse</th>
              <th className="px-5 py-4 text-[9px] font-black text-[#8a8b9d] uppercase tracking-widest">Destination Warehouse</th>
              <th className="px-5 py-4 text-[9px] font-black text-[#8a8b9d] uppercase tracking-widest text-center">Status</th>
              <th className="px-5 py-4 text-[9px] font-black text-[#8a8b9d] uppercase tracking-widest text-right">Quantity</th>
              <th className="px-5 py-4 text-[9px] font-black text-[#8a8b9d] uppercase tracking-widest">Date Dispatched</th>
              <th className="px-5 py-4 text-[9px] font-black text-[#8a8b9d] uppercase tracking-widest text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eff1f5]">
            {transfers.map((item) => {
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

              const avatarLetter = (item.productName || 'P').charAt(0).toUpperCase();
              const avatarGradient = getAvatarGradient(item.productName);
              const isEligible = canAccept(item);

              return (
                <tr key={item.id} className="hover:bg-slate-50/40 transition-colors group">
                  {/* Transfer Number */}
                  <td className="px-5 py-4">
                    <span className="text-xs font-black text-[#704efe] font-mono bg-[#f0ebff] border border-indigo-150 px-2.5 py-1 rounded-lg">
                      {item.transferNumber}
                    </span>
                  </td>
                  {/* Product Details */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3.5 min-w-[200px]">
                      <div className={`w-9 h-9 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-[13px] font-black shadow-xs shrink-0 select-none group-hover:scale-105 transition-transform`}>
                        {avatarLetter}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-slate-805 tracking-tight truncate leading-tight">
                          {item.productName}
                        </p>
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase mt-0.5 inline-block">
                          SKU: {item.productSKU || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </td>
                  {/* Source Warehouse */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-805">
                        🏢 {item.sourceWarehouseName}
                      </span>
                      <span className="text-[9.5px] font-bold text-slate-400 mt-0.5">
                        {item.sourceWarehouseName ? '' : `WH-${item.sourceWarehouseId}`}
                      </span>
                    </div>
                  </td>
                  {/* Dest Warehouse */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-805">
                        🏢 {item.destWarehouseName}
                      </span>
                      <span className="text-[9.5px] font-bold text-slate-400 mt-0.5">
                        {item.destWarehouseName ? '' : `WH-${item.destWarehouseId}`}
                      </span>
                    </div>
                  </td>
                  {/* Status Badge */}
                  <td className="px-5 py-4 text-center">
                    <span className="inline-block text-[10px] font-black px-2.5 py-0.5 rounded-2xl border bg-[#fff8eb] text-[#b25e00] border-[#ffe9cc] animate-pulse">
                      🚚 In Transit
                    </span>
                  </td>
                  {/* Qty */}
                  <td className="px-5 py-4 text-right">
                    <span className="inline-block text-xs font-black font-mono px-2 py-0.5 rounded-lg border bg-slate-50 border-[#eff1f5]">
                      {item.quantity.toLocaleString()} units
                    </span>
                  </td>
                  {/* Date Dispatched */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-0.5 whitespace-nowrap">
                      <span className="text-xs font-black text-slate-805">
                        {formattedDate}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                        {formattedTime}
                      </span>
                    </div>
                  </td>
                  {/* Action */}
                  <td className="px-5 py-4 text-center">
                    {isEligible ? (
                      <button
                        onClick={() => onIntake(item)}
                        className="px-4 py-2 bg-[#704efe] hover:bg-[#5c3edd] text-white font-black text-[10px] uppercase tracking-wider rounded-2xl transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 mx-auto shadow-sm text-center"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                        </svg>
                        Intake Stock
                      </button>
                    ) : (
                      <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide italic">
                        Awaiting Dest Hub
                      </span>
                    )}
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

export default PendingTransfersTable;
