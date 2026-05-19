import React from 'react';

const StockLevelsTable = ({ stockLevels, userRole, onAdjust, onTransfer }) => {
  const canAdjust = userRole === 'WarehouseManager';
  const canTransfer = userRole === 'Admin' || userRole === 'WarehouseManager';

  if (stockLevels.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-slate-800">No Stock Levels Found</h3>
        <p className="text-sm font-medium text-slate-400 max-w-xs mt-1 leading-normal">
          No stock records matched your current query or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header Section */}
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
        <h2 className="text-[15px] font-bold text-slate-800">Stock inventory</h2>
        <span className="text-[13px] font-medium text-slate-500">
          Showing {stockLevels.length} products
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-white">
              <th className="px-5 py-4 w-12 text-center">
                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
              </th>
              <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer">
                <div className="flex items-center gap-1">PRODUCT <span className="text-[10px] opacity-50">↕</span></div>
              </th>
              <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">SKU</th>
              <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">WAREHOUSE</th>
              <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer">
                <div className="flex items-center gap-1">QTY ON HAND <span className="text-[10px] opacity-50">↕</span></div>
              </th>
              <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">REORDER PT</th>
              <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">ON ORDER</th>
              <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer">
                <div className="flex items-center gap-1">90D VELOCITY <span className="text-[10px] opacity-50">↕</span></div>
              </th>
              <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">ML RISK</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {stockLevels.map((item) => {
              const qty = item.quantityOnHand;
              const reorder = item.reorderPoint;
              
              let statusColor = "green";
              let showWarning = false;
              if (qty === 0) {
                statusColor = "red";
                showWarning = true;
              } else if (qty < reorder) {
                statusColor = "amber";
                showWarning = true;
              }
              
              const percentage = reorder > 0 ? Math.min(100, (qty / reorder) * 100) : (qty > 0 ? 100 : 0);
              
              const colorClasses = {
                red: { text: "text-red-600", dot: "bg-red-600", bar: "bg-red-600" },
                amber: { text: "text-amber-500", dot: "bg-amber-500", bar: "bg-amber-500" },
                green: { text: "text-emerald-500", dot: "bg-emerald-500", bar: "bg-emerald-500" }
              };
              
              const colors = colorClasses[statusColor];

              return (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Checkbox */}
                  <td className="px-5 py-4 text-center">
                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
                  </td>

                  {/* Product Info */}
                  <td className="px-5 py-4">
                    <div className="min-w-[140px]">
                      <p className="text-[13px] font-bold text-slate-800">{item.productName}</p>
                      <p className="text-[11px] font-medium text-slate-400 mt-0.5">{item.categoryName || 'Uncategorized'}</p>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-1 rounded-md inline-block max-w-[70px] break-words uppercase">
                      {item.sku}
                    </span>
                  </td>

                  {/* Warehouse Location */}
                  <td className="px-5 py-4">
                    <p className="text-[12px] font-semibold text-slate-600 uppercase tracking-wide">
                      {item.warehouseCode}
                    </p>
                  </td>

                  {/* QTY On Hand */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1.5 w-20">
                      <div className={`flex items-center gap-1.5 ${colors.text} font-bold text-[13px]`}>
                        <div className={`w-2 h-2 rounded-full ${colors.dot}`}></div>
                        {showWarning && (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        )}
                        <span>{qty.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full ${colors.bar} rounded-full`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  </td>

                  {/* Reorder Point */}
                  <td className="px-5 py-4 text-[13px] font-medium text-slate-500">
                    {item.reorderPoint.toLocaleString()}
                  </td>

                  {/* On Order */}
                  <td className="px-5 py-4 text-[13px] font-medium">
                    {item.quantityOnOrder > 0 ? (
                      <span className="text-blue-500">{item.quantityOnOrder.toLocaleString()}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* 90D Velocity */}
                  <td className="px-5 py-4">
                    <span className="text-[13px] font-bold text-slate-800">{Math.round(item.velocity90D || 0)}</span>
                    <span className="text-[12px] font-medium text-slate-400">/day</span>
                  </td>

                  {/* ML Risk */}
                  <td className="px-5 py-4 text-center">
                    {(() => {
                      const risk = item.mlRisk || 'Low';
                      const badgeClasses = {
                        High: 'bg-red-100/60 text-red-600',
                        Medium: 'bg-amber-100/60 text-amber-700',
                        Low: 'bg-emerald-50 text-emerald-600'
                      };
                      return (
                        <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${badgeClasses[risk]}`}>
                          {risk}
                        </span>
                      );
                    })()}
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

export default StockLevelsTable;
