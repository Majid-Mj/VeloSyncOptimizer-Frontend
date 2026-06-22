import React from 'react';

const ProductsTable = ({
  processedProducts,
  categories,
  isAdmin,
  onForecast,
  onReorderConfig,
  onEdit,
  onDelete
}) => {
  return (
    <div className="premium-card bg-white overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="premium-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Pricing</th>
              <th>Reorder Rules</th>
              <th>Type</th>
              {isAdmin && (
                <th className="text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {processedProducts.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="text-center py-12 text-[13px] font-semibold text-slate-400">
                  No products found matching filters.
                </td>
              </tr>
            ) : (
              processedProducts.map((p) => {
                const categoryName = categories.find((c) => c.id === p.categoryId)?.name || 'Unassigned';
                return (
                  <tr key={p.id}>
                    <td>
                      <span className="font-mono text-[11px] font-black bg-slate-100 text-slate-650 px-2.5 py-1 rounded-xl border border-slate-200/40">
                        {p.sku}
                      </span>
                    </td>
                    <td>
                      <div className="text-[13px] font-extrabold text-slate-800">{p.name}</div>
                      <div className="text-[11px] text-slate-400 font-bold max-w-xs truncate mt-0.5">{p.description}</div>
                    </td>
                    <td className="text-[12.5px] font-extrabold text-slate-600">{categoryName}</td>
                    <td>
                      <div className="text-[12.5px] font-extrabold text-[#11121d]">
                        ₹{p.unitPrice?.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-slate-400 font-bold mt-0.5">
                        Cost: ₹{p.unitCost?.toFixed(2)}
                      </div>
                    </td>
                    <td>
                      <div className="text-[12.5px] font-extrabold text-slate-700">
                        Min Qty: {p.reorderQty} {p.unitOfMeasure}
                      </div>
                      <div className="text-[11px] text-slate-400 font-bold mt-0.5">
                        Safety: {p.safetyStockDays} days | Lead: {p.leadTimeDays} days
                      </div>
                    </td>
                    <td>
                      {p.isPerishable ? (
                        <div>
                          <span className="bg-rose-50 border border-rose-100 text-rose-650 text-[10px] font-black px-2.5 py-1 rounded-xl">
                            Perishable
                          </span>
                          <div className="text-[10px] text-slate-400 font-bold mt-1.5">
                            Shelf: {p.shelfLifeDays || 0} days
                          </div>
                        </div>
                      ) : (
                        <span className="bg-slate-50 border border-[#eff1f5] text-slate-500 text-[10px] font-black px-2.5 py-1 rounded-xl">
                          Standard
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td>
                        <div className="flex gap-2.5 justify-end">
                          <button
                            onClick={() => onForecast(p)}
                            title="AI Demand Forecasting"
                            className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-100/50 rounded-2xl cursor-pointer transition-all duration-150 active:scale-95"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onReorderConfig(p)}
                            title="Update Reorder Engine Configuration"
                            className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-655 border border-indigo-100/50 rounded-2xl cursor-pointer transition-all duration-150 active:scale-95"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onEdit(p)}
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-650 border border-blue-100/50 rounded-2xl cursor-pointer transition-all duration-150 active:scale-95"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onDelete(p.id)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-650 border border-rose-100/50 rounded-2xl cursor-pointer transition-all duration-150 active:scale-95"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsTable;
