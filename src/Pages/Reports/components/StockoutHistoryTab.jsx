import React from 'react';

const StockoutHistoryTab = ({ data, loading }) => {
  if (loading) return <div className="h-40 bg-slate-50 rounded-2xl animate-pulse" />;
  if (!data)   return null;

  const { summary, events = [] } = data;

  return (
    <div className="flex flex-col gap-5">
      {summary && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Stockout Events</p>
            <p className="text-3xl font-black text-slate-900 mt-2">{summary.totalEvents}</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Avg Days Out of Stock</p>
            <p className="text-3xl font-black text-amber-600 mt-2">{summary.avgDaysOutOfStock ?? 0}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-2xl shadow-3xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50">
          <p className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Stockout Events</p>
        </div>
        <table className="w-full text-[11px]">
          <thead>
            <tr className="bg-slate-50 text-slate-400 font-black uppercase tracking-wider text-[10px]">
              <th className="px-5 py-3 text-left">Product</th>
              <th className="px-5 py-3 text-left">SKU</th>
              <th className="px-5 py-3 text-left">Warehouse</th>
              <th className="px-5 py-3 text-left">Stockout Date</th>
              <th className="px-5 py-3 text-left">Resolved</th>
              <th className="px-5 py-3 text-right">Days Out</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e, i) => (
              <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50">
                <td className="px-5 py-2.5 font-semibold text-slate-700">{e.productName}</td>
                <td className="px-5 py-2.5 text-slate-400">{e.sKU}</td>
                <td className="px-5 py-2.5 text-slate-500">{e.warehouseName}</td>
                <td className="px-5 py-2.5 text-slate-400">{new Date(e.stockoutDate).toLocaleDateString()}</td>
                <td className="px-5 py-2.5">
                  {e.resolvedAt
                    ? <span className="text-emerald-600 font-semibold">{new Date(e.resolvedAt).toLocaleDateString()}</span>
                    : <span className="text-rose-500 font-semibold">Ongoing</span>}
                </td>
                <td className="px-5 py-2.5 text-right font-black text-rose-500">{e.daysOutOfStock}</td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-6 text-center text-slate-400">No stockout events in selected period</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockoutHistoryTab;
