import React, { useState } from 'react';

const AuditLogTab = ({ data, loading }) => {
  const [search, setSearch] = useState('');

  if (loading) return <div className="h-40 bg-slate-50 rounded-2xl animate-pulse" />;
  if (!data)   return null;

  const { summary, entries = [] } = data;

  const filtered = entries.filter(e =>
    !search ||
    e.productName?.toLowerCase().includes(search.toLowerCase()) ||
    e.action?.toLowerCase().includes(search.toLowerCase()) ||
    e.warehouseName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Events</p>
            <p className="text-3xl font-black text-slate-900 mt-2">{summary.totalMovements}</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Inbound</p>
            <p className="text-3xl font-black text-emerald-600 mt-2">{summary.inboundCount}</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Outbound</p>
            <p className="text-3xl font-black text-rose-500 mt-2">{summary.outboundCount}</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Unique Users</p>
            <p className="text-3xl font-black text-violet-600 mt-2">{summary.uniqueUsers}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-2xl shadow-3xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Audit Trail</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Last 200 stock movement events</p>
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search product, action..."
            className="border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-slate-700 font-semibold outline-none focus:border-slate-400 w-52"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-black uppercase tracking-wider text-[10px]">
                <th className="px-5 py-3 text-left">Timestamp</th>
                <th className="px-5 py-3 text-left">Product</th>
                <th className="px-5 py-3 text-left">Action</th>
                <th className="px-5 py-3 text-right">Before</th>
                <th className="px-5 py-3 text-right">After</th>
                <th className="px-5 py-3 text-right">Change</th>
                <th className="px-5 py-3 text-left">Warehouse</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, i) => (
                <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50">
                  <td className="px-5 py-2.5 text-slate-400">{new Date(entry.timestamp).toLocaleString()}</td>
                  <td className="px-5 py-2.5 font-semibold text-slate-700">{entry.productName}</td>
                  <td className="px-5 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      entry.action === 'Stock In'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-rose-50 text-rose-500'
                    }`}>{entry.action}</span>
                  </td>
                  <td className="px-5 py-2.5 text-right text-slate-400">{entry.oldQty}</td>
                  <td className="px-5 py-2.5 text-right text-slate-700 font-semibold">{entry.newQty}</td>
                  <td className="px-5 py-2.5 text-right font-black text-slate-900">
                    {entry.action === 'Stock In' ? `+${entry.changeQty}` : `-${entry.changeQty}`}
                  </td>
                  <td className="px-5 py-2.5 text-slate-400">{entry.warehouseName}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-6 text-center text-slate-400">No entries found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogTab;
