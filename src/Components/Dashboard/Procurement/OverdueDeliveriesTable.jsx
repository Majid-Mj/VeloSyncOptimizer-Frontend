import React from 'react';

const OverdueDeliveriesTable = ({ overdueDeliveries }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_16px_-4px_rgba(148,163,184,0.06)] p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between pb-4 border-b border-slate-50 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <h3 className="text-[14px] font-extrabold text-slate-800 tracking-tight leading-none">
            Overdue Deliveries
          </h3>
        </div>
        <span className="text-[10px] bg-rose-50 text-rose-600 font-black px-2.5 py-0.5 rounded-full border border-rose-100 uppercase tracking-wider">
          Needs Follow-up
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-semibold text-slate-600 border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
              <th className="px-4 py-2.5">PO Number</th>
              <th className="px-4 py-2.5">Supplier</th>
              <th className="px-4 py-2.5">Warehouse</th>
              <th className="px-4 py-2.5">Expected Date</th>
              <th className="px-4 py-2.5 text-rose-600 font-bold">Days Late</th>
            </tr>
          </thead>
          <tbody>
            {overdueDeliveries.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                  No overdue purchase orders detected.
                </td>
              </tr>
            ) : (
              overdueDeliveries.slice(0, 5).map(o => {
                const [oy, om, od] = String(o.expectedDate).split('-').map(Number);
                const expLocal = new Date(oy, om - 1, od);
                const daysLate = Math.max(1, Math.round((new Date() - expLocal) / (1000 * 60 * 60 * 24)));
                return (
                  <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10.5px] font-black bg-rose-50 text-rose-600 px-2 py-0.5 rounded border border-rose-200/50">
                        {o.poNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-800 font-bold">{o.supplierName}</td>
                    <td className="px-4 py-3 text-slate-500 font-semibold">{o.warehouseName}</td>
                    <td className="px-4 py-3 text-slate-500 font-semibold">{o.expectedDate}</td>
                    <td className="px-4 py-3 text-rose-600 font-black">{daysLate} days overdue</td>
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

export default OverdueDeliveriesTable;
