import React from 'react';

const ReportsWarehouseTable = ({ performanceData = [], loading }) => {

  // Format currency/stock value dynamically
  const formatStockValue = (val) => {
    if (typeof val === 'number') {
      const inrVal = val * 18.8; // Convert database RM base to INR
      return inrVal >= 1000000
        ? `₹ ${(inrVal / 1000000).toFixed(1)}M`
        : `₹ ${(inrVal / 1000).toFixed(0)}K`;
    }
    return val;
  };

  return (
    <div className="bg-white border border-slate-100 p-6 rounded-2xl flex flex-col gap-4 shadow-3xs min-h-[350px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Warehouse performance
          </h2>
          <p className="text-[10.5px] font-bold text-slate-400 mt-1 select-none leading-none">
            Stock value + capacity utilisation
          </p>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-50 text-[9.5px] font-black text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-1.5">Warehouse</th>
              <th className="py-3 px-1.5 text-center">Skus</th>
              <th className="py-3 px-1.5">Capacity</th>
              <th className="py-3 px-1.5 text-center">Stock Value</th>
              <th className="py-3 px-1.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              /* Skeletal pulsing loader rows */
              [1, 2, 3, 4].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3.5 px-1.5"><div className="h-3.5 w-16 bg-slate-100 rounded" /></td>
                  <td className="py-3.5 px-1.5 text-center"><div className="h-3.5 w-8 bg-slate-100 rounded mx-auto" /></td>
                  <td className="py-3.5 px-1.5"><div className="h-3.5 w-24 bg-slate-100 rounded" /></td>
                  <td className="py-3.5 px-1.5 text-center"><div className="h-3.5 w-12 bg-slate-100 rounded mx-auto" /></td>
                  <td className="py-3.5 px-1.5 text-right"><div className="h-5 w-16 bg-slate-100 rounded-md ml-auto" /></td>
                </tr>
              ))
            ) : (
              /* Live Data Rows */
              performanceData.map((row) => {
                let progressColor = 'bg-emerald-500';
                let statusBg = 'bg-emerald-50 text-emerald-600 border-emerald-100';

                if (row.statusType === 'danger') {
                  progressColor = 'bg-rose-500';
                  statusBg = 'bg-rose-50 text-rose-500 border-rose-100';
                } else if (row.statusType === 'warning') {
                  progressColor = 'bg-amber-500';
                  statusBg = 'bg-amber-50 text-amber-600 border-amber-100';
                }

                return (
                  <tr key={row.name} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3.5 px-1.5 font-black text-slate-800">{row.name}</td>
                    <td className="py-3.5 px-1.5 text-center font-bold text-slate-600">{row.skus}</td>
                    <td className="py-3.5 px-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-black text-slate-700 text-[10px] w-8">{row.capacity}%</span>
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
                          <div
                            style={{ width: `${row.capacity}%` }}
                            className={`h-full ${progressColor} rounded-full`}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-1.5 text-center font-black text-slate-700">{formatStockValue(row.stockValue)}</td>
                    <td className="py-3.5 px-1.5 text-right">
                      <span className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border inline-block ${statusBg}`}>
                        {row.status}
                      </span>
                    </td>
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

export default ReportsWarehouseTable;
