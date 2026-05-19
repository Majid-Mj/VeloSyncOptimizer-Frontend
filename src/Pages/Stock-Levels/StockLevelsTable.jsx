import React from 'react';

const StockLevelsTable = ({ stockLevels, userRole, onAdjust, onTransfer }) => {
  const canAdjust = userRole === 'WarehouseManager';
  const canTransfer = userRole === 'Admin' || userRole === 'WarehouseManager';

  if (stockLevels.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-800">No Stock Levels Found</h3>
        <p className="text-xs font-semibold text-gray-400 max-w-xs mt-1 leading-normal">
          No stock records matched your current query or filters. Select different filter settings.
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
              <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Product Info</th>
              <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Warehouse Facility</th>
              <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider text-right">On Hand</th>
              <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider text-right">Reserved</th>
              <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider text-right">Available</th>
              <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider text-right">Reorder Point</th>
              <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider text-center">Status</th>
              <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stockLevels.map((item) => {
              const status = item.stockStatus || 'IN_STOCK';
              
              return (
                <tr key={item.id} className="hover:bg-gray-50/40 transition-colors">
                  {/* Product Info */}
                  <td className="px-5 py-4">
                    <div className="min-w-[160px]">
                      <p className="text-xs font-bold text-gray-800 tracking-tight">{item.productName}</p>
                      <span className="text-[10px] font-mono font-extrabold text-blue-500 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                        {item.sku}
                      </span>
                    </div>
                  </td>
                  {/* Warehouse Location */}
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-xs font-bold text-gray-700">{item.warehouseName}</p>
                      <p className="text-[10px] font-semibold text-gray-400 mt-0.5 uppercase tracking-wide">
                        {item.warehouseCode} — {item.warehouseCity}
                      </p>
                    </div>
                  </td>
                  {/* On Hand */}
                  <td className="px-5 py-4 text-right text-xs font-extrabold text-gray-800">
                    {item.quantityOnHand.toLocaleString()}
                  </td>
                  {/* Reserved */}
                  <td className="px-5 py-4 text-right text-xs font-semibold text-gray-500">
                    {item.quantityReserved.toLocaleString()}
                  </td>
                  {/* Available */}
                  <td className="px-5 py-4 text-right text-xs font-extrabold text-gray-800">
                    <span className={item.quantityAvailable <= 0 ? 'text-red-600' : 'text-gray-800'}>
                      {item.quantityAvailable.toLocaleString()}
                    </span>
                  </td>
                  {/* Reorder Point */}
                  <td className="px-5 py-4 text-right text-xs font-semibold text-gray-500">
                    {item.reorderPoint.toLocaleString()}
                  </td>
                  {/* Status Badge */}
                  <td className="px-5 py-4 text-center">
                    {(() => {
                      const isOutOfStock = status === 'OUT_OF_STOCK' || status === 'Stockout' || item.quantityOnHand <= 0;
                      const isLowStock = status === 'LOW_STOCK' || status === 'LowStock' || (item.quantityOnHand - item.quantityReserved) <= item.reorderPoint;
                      
                      return (
                        <span 
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isOutOfStock
                              ? 'bg-red-50 text-red-500 border-red-100'
                              : isLowStock
                              ? 'bg-amber-50 text-amber-600 border-amber-100'
                              : 'bg-green-50 text-green-600 border-green-100'
                          }`}
                        >
                          {isOutOfStock
                            ? 'OUT OF STOCK'
                            : isLowStock
                            ? 'LOW STOCK'
                            : 'IN STOCK'}
                        </span>
                      );
                    })()}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {/* Adjust Stock Trigger */}
                      {canAdjust && (
                        <button
                          onClick={() => onAdjust(item)}
                          className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all border-none bg-transparent cursor-pointer"
                          title="Adjust Stock Level"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      {/* Transfer Stock Trigger */}
                      {canTransfer && (
                        <button
                          onClick={() => onTransfer(item)}
                          className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all border-none bg-transparent cursor-pointer"
                          title="Transfer to Facility"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </button>
                      )}
                      {!canAdjust && !canTransfer && (
                        <span className="text-[10px] text-gray-400 italic">Read-only</span>
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

export default StockLevelsTable;
