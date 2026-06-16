import React from 'react';

const SupplierReportTab = ({ data, loading }) => {
  if (loading) return <div className="h-40 bg-slate-50 rounded-2xl animate-pulse" />;
  if (!data)   return null;

  const { summary, suppliers = [] } = data;

  return (
    <div className="flex flex-col gap-5">
      {summary && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Suppliers</p>
            <p className="text-3xl font-black text-slate-900 mt-2">{summary.totalSuppliers}</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Suppliers</p>
            <p className="text-3xl font-black text-emerald-600 mt-2">{summary.activeSuppliers}</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">On-Time Rate</p>
            <p className="text-3xl font-black text-violet-600 mt-2">{summary.onTimeRate ?? 0}%</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-2xl shadow-3xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50">
          <p className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Supplier Performance</p>
        </div>
        <table className="w-full text-[11px]">
          <thead>
            <tr className="bg-slate-50 text-slate-400 font-black uppercase tracking-wider text-[10px]">
              <th className="px-5 py-3 text-left">Supplier</th>
              <th className="px-5 py-3 text-right">Orders</th>
              <th className="px-5 py-3 text-right">On-Time</th>
              <th className="px-5 py-3 text-right">On-Time %</th>
              <th className="px-5 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s, i) => (
              <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50">
                <td className="px-5 py-2.5 font-semibold text-slate-700">{s.supplierName}</td>
                <td className="px-5 py-2.5 text-right text-slate-600">{s.totalOrders}</td>
                <td className="px-5 py-2.5 text-right text-emerald-600 font-semibold">{s.deliveredOnTime}</td>
                <td className="px-5 py-2.5 text-right font-black text-slate-700">{s.onTimeRatePct ?? 0}%</td>
                <td className="px-5 py-2.5 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    s.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>{s.isActive ? 'Active' : 'Inactive'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupplierReportTab;
