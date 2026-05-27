import React from 'react';

const StockLevelsTable = ({ stockLevels, userRole, onAdjust }) => {
  const canAdjust = userRole === 'WarehouseManager';
  const showActions = canAdjust;

  if (stockLevels.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-md border border-slate-100 rounded-2xl p-16 text-center flex flex-col items-center justify-center min-h-[350px] shadow-xs">
        <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mb-4 animate-bounce">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-slate-800">No Stock Levels Found</h3>
        <p className="text-sm font-medium text-slate-400 max-w-xs mt-1 leading-normal">
          No stock records matched your current query or filters. Try adjusting your warehouse, status, or search term.
        </p>
      </div>
    );
  }

  // Helper gradient generators for avatars based on product name character code
  const getAvatarGradient = (name) => {
    const charCode = name ? name.charCodeAt(0) : 65;
    const index = charCode % 4;
    const gradients = [
      'from-indigo-500 to-purple-600',
      'from-blue-500 to-sky-600',
      'from-emerald-400 to-teal-600',
      'from-rose-500 to-pink-600'
    ];
    return gradients[index];
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100/90 shadow-sm overflow-hidden transition-all duration-300">

      {/* Table Header Section */}
      <div className="px-6 py-5 border-b border-slate-100/60 flex justify-between items-center bg-white/40">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-[15px] font-bold text-slate-800 tracking-tight">Stock Inventory Balance</h2>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Real-time Node Status</p>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1 rounded-xl shadow-2xs">
          📦 {stockLevels.length} Products listed
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/40 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <th className="px-5 py-4 w-12 text-center">
                <input type="checkbox" className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" />
              </th>
              <th className="px-5 py-4 cursor-pointer hover:text-slate-600 transition-colors">
                <div className="flex items-center gap-1">PRODUCT <span className="text-[9px] opacity-60">↕</span></div>
              </th>
              <th className="px-5 py-4">SKU</th>
              <th className="px-5 py-4">WAREHOUSE</th>
              <th className="px-5 py-4 cursor-pointer hover:text-slate-600 transition-colors">
                <div className="flex items-center gap-1">AVAILABLE QTY <span className="text-[9px] opacity-60">↕</span></div>
              </th>
              <th className="px-5 py-4">REORDER POINT</th>
              <th className="px-5 py-4">ON ORDER</th>
              <th className="px-5 py-4 cursor-pointer hover:text-slate-600 transition-colors">
                <div className="flex items-center gap-1">90D VELOCITY <span className="text-[9px] opacity-60">↕</span></div>
              </th>
              <th className="px-5 py-4 text-center">RISK LEVEL</th>
              {showActions && <th className="px-5 py-4 text-center w-48">ACTIONS</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/70 bg-white">
            {stockLevels.map((item) => {
              const qty = item.quantityOnHand;
              const reorder = item.reorderPoint;

              let statusColor = "green";
              let showWarning = false;
              if (qty === 0) {
                statusColor = "red";
                showWarning = true;
              } else if (qty <= reorder) {
                statusColor = "amber";
                showWarning = true;
              }

              const percentage = reorder > 0 ? Math.min(100, (qty / reorder) * 100) : (qty > 0 ? 100 : 0);

              const colorClasses = {
                red: { text: "text-rose-600", dot: "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.4)]", bar: "bg-rose-500" },
                amber: { text: "text-amber-500", dot: "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)]", bar: "bg-amber-500" },
                green: { text: "text-emerald-500", dot: "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]", bar: "bg-emerald-500" }
              };

              const colors = colorClasses[statusColor];
              const firstLetter = item.productName ? item.productName.charAt(0).toUpperCase() : 'P';
              const gradient = getAvatarGradient(item.productName);

              return (
                <tr key={item.id} className="hover:bg-slate-50/40 transition-all duration-150 group">
                  {/* Checkbox */}
                  <td className="px-5 py-4 text-center">
                    <input type="checkbox" className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" />
                  </td>

                  {/* Product Info */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 min-w-[170px]">
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${gradient} text-white flex items-center justify-center font-black text-xs shadow-2xs uppercase shrink-0`}>
                        {firstLetter}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[13px] font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{item.productName}</p>
                        <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{item.categoryName || 'Uncategorized'}</p>
                      </div>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="px-5 py-4">
                    <span className="text-[9px] font-black text-slate-500 bg-slate-100/90 border border-slate-200/50 px-2 py-0.5 rounded-md inline-block tracking-wider uppercase shadow-2xs font-mono">
                      {item.sku}
                    </span>
                  </td>

                  {/* Warehouse Location */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">
                        {item.warehouseCode}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">{item.warehouseName}</p>
                    </div>
                  </td>

                  {/* Available QTY on Hand */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1 w-24">
                      <div className={`flex items-center gap-1.5 ${colors.text} font-bold text-[13px]`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></div>
                        {showWarning && (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        )}
                        <span>{qty.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/20">
                        <div className={`h-full ${colors.bar} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                      </div>
                      <span className="text-[9px] text-slate-400 font-semibold">
                        {qty === 0 ? '❌ Stockout' : `${Math.round(percentage)}% of Safety`}
                      </span>
                    </div>
                  </td>

                  {/* Reorder Point */}
                  <td className="px-5 py-4">
                    <span className="text-[13px] font-bold text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md inline-block">
                      {item.reorderPoint.toLocaleString()}
                    </span>
                  </td>

                  {/* On Order */}
                  <td className="px-5 py-4 text-[13px] font-semibold">
                    {item.quantityOnOrder > 0 ? (
                      <span className="text-indigo-600 font-bold bg-indigo-50 border border-indigo-100/60 px-2 py-0.5 rounded-md inline-block shadow-2xs animate-pulse">
                        +{item.quantityOnOrder.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-slate-300 font-medium px-2">—</span>
                    )}
                  </td>

                  {/* 90D Velocity */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 text-slate-800">
                      <span className="text-[13px] font-black">{Math.round(item.velocity90D || 0)}</span>
                      <span className="text-[10px] font-semibold text-slate-400">/day</span>
                    </div>
                  </td>

                  {/* ML Risk */}
                  <td className="px-5 py-4 text-center">
                    {(() => {
                      const risk = item.mlRisk || 'Low';
                      const badgeClasses = {
                        High: 'bg-rose-50 border-rose-100 text-rose-600 shadow-2xs shadow-rose-50',
                        Medium: 'bg-amber-50 border-amber-100 text-amber-600 shadow-2xs shadow-amber-50',
                        Low: 'bg-emerald-50 border-emerald-100 text-emerald-600 shadow-2xs shadow-emerald-50'
                      };
                      return (
                        <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black border uppercase tracking-wider ${badgeClasses[risk]}`}>
                          {risk}
                        </span>
                      );
                    })()}
                  </td>

                  {/* Actions Column */}
                  {showActions && (
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {canAdjust && (
                          <button
                            onClick={() => onAdjust(item)}
                            title="Adjust quantity on hand"
                            className="text-indigo-600 bg-indigo-50/80 hover:bg-indigo-600 hover:text-white border border-indigo-100 hover:border-indigo-600 transition-all duration-150 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Adjust
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockLevelsTable;
