import React from 'react';

const MovementReportTab = ({ data, loading }) => {
  if (loading) return <div className="h-40 bg-slate-50 rounded-2xl animate-pulse" />;
  if (!data)   return null;

  const { summary = [], log = [] } = data;

  return (
    <div className="flex flex-col gap-5">
      {/* Warehouse Summary */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-3xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50">
          <p className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Movement by Warehouse</p>
        </div>
        <table className="w-full text-[11px]">
          <thead>
            <tr className="bg-slate-50 text-slate-400 font-black uppercase tracking-wider text-[10px]">
              <th className="px-5 py-3 text-left">Warehouse</th>
              <th className="px-5 py-3 text-right">Inbound</th>
              <th className="px-5 py-3 text-right">Outbound</th>
              <th className="px-5 py-3 text-right">Net</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((row, i) => (
              <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50">
                <td className="px-5 py-3 font-semibold text-slate-700">{row.warehouseName}</td>
                <td className="px-5 py-3 text-right text-emerald-600 font-black">+{row.totalInbound.toLocaleString()}</td>
                <td className="px-5 py-3 text-right text-rose-500 font-black">-{row.totalOutbound.toLocaleString()}</td>
                <td className="px-5 py-3 text-right font-black text-slate-700">
                  {(row.totalInbound - row.totalOutbound).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detailed Log */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-3xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50">
          <p className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Movement Log</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Most recent 200 entries</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-black uppercase tracking-wider text-[10px]">
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-left">Product</th>
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-right">Qty</th>
                <th className="px-5 py-3 text-left">Warehouse</th>
              </tr>
            </thead>
            <tbody>
              {log.map((entry, i) => (
                <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50">
                  <td className="px-5 py-2.5 text-slate-400">{new Date(entry.movedAt).toLocaleDateString()}</td>
                  <td className="px-5 py-2.5 font-semibold text-slate-700">{entry.productName}</td>
                  <td className="px-5 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      entry.movementType === 'Inbound'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-rose-50 text-rose-500'
                    }`}>{entry.movementType}</span>
                  </td>
                  <td className="px-5 py-2.5 text-right font-black text-slate-700">{entry.quantity}</td>
                  <td className="px-5 py-2.5 text-slate-400">{entry.warehouseName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MovementReportTab;
