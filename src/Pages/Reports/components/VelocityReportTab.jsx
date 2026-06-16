import React from 'react';

const VelocityReportTab = ({ data, loading }) => {
  if (loading) return <div className="h-40 bg-slate-50 rounded-2xl animate-pulse" />;
  if (!data)   return null;

  const { topMovers = [], slowMovers = [] } = data;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Top Moving */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-3xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50">
          <p className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Top Moving Products</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Highest quantity moved in period</p>
        </div>
        <table className="w-full text-[11px]">
          <thead>
            <tr className="bg-slate-50 text-slate-400 font-black uppercase tracking-wider text-[10px]">
              <th className="px-5 py-3 text-left">Product</th>
              <th className="px-5 py-3 text-left">SKU</th>
              <th className="px-5 py-3 text-left">Category</th>
              <th className="px-5 py-3 text-right">Units Moved</th>
            </tr>
          </thead>
          <tbody>
            {topMovers.map((p, i) => (
              <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3 font-semibold text-slate-700">{p.productName}</td>
                <td className="px-5 py-3 text-slate-400">{p.sKU}</td>
                <td className="px-5 py-3 text-slate-400">{p.category}</td>
                <td className="px-5 py-3 text-right font-black text-emerald-600">{p.totalMoved.toLocaleString()}</td>
              </tr>
            ))}
            {topMovers.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-slate-400 text-[11px]">No data for selected period</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Slow Moving */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-3xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50">
          <p className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Slow / Dead Stock</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Products with no movement in 30+ days</p>
        </div>
        <table className="w-full text-[11px]">
          <thead>
            <tr className="bg-slate-50 text-slate-400 font-black uppercase tracking-wider text-[10px]">
              <th className="px-5 py-3 text-left">Product</th>
              <th className="px-5 py-3 text-left">SKU</th>
              <th className="px-5 py-3 text-right">Days Idle</th>
              <th className="px-5 py-3 text-right">Stock</th>
            </tr>
          </thead>
          <tbody>
            {slowMovers.map((p, i) => (
              <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3 font-semibold text-slate-700">{p.productName}</td>
                <td className="px-5 py-3 text-slate-400">{p.sKU}</td>
                <td className="px-5 py-3 text-right font-black text-amber-600">{p.daysSinceLastMovement ?? '—'}</td>
                <td className="px-5 py-3 text-right text-slate-600 font-semibold">{p.stockLevel}</td>
              </tr>
            ))}
            {slowMovers.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-slate-400 text-[11px]">No slow moving products found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VelocityReportTab;
