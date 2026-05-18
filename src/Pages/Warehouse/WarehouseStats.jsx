import React from 'react';

const WarehouseStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* KPI 1: Active Facilities */}
      <div className="bg-gradient-to-br from-white to-[#f8fafc] rounded-xl p-4 border border-gray-100/90 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Facilities</p>
          <h3 className="text-xl font-bold text-gray-800 mt-1.5">{stats.total} Warehouses</h3>
          <span className="text-[9.5px] font-bold text-blue-600 bg-blue-50/70 border border-blue-100 px-1.5 py-0.5 rounded mt-1.5 inline-block">
            100% Operational
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21V9M14 21V3M9 21V9M4 21V12" />
          </svg>
        </div>
      </div>

      {/* KPI 2: Capacity Utilized */}
      <div className="bg-gradient-to-br from-white to-[#f8fafc] rounded-xl p-4 border border-gray-100/90 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Avg Capacity Used</p>
          <h3 className="text-xl font-bold text-gray-800 mt-1.5">{stats.avgCapacity}%</h3>
          <div className="w-24 bg-gray-200 h-1.5 rounded-full mt-2 relative overflow-hidden">
            <div 
              className={`absolute h-full rounded-full ${stats.avgCapacity >= 80 ? 'bg-red-500' : stats.avgCapacity >= 65 ? 'bg-amber-500' : 'bg-green-500'}`}
              style={{ width: `${stats.avgCapacity}%` }}
            ></div>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </div>
      </div>

      {/* KPI 3: Storage Items */}
      <div className="bg-gradient-to-br from-white to-[#f8fafc] rounded-xl p-4 border border-gray-100/90 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Storage Items</p>
          <h3 className="text-xl font-bold text-gray-800 mt-1.5">{stats.totalSkus.toLocaleString()} SKUs</h3>
          <span className="text-[9.5px] font-bold text-amber-600 bg-amber-50/70 border border-amber-100 px-1.5 py-0.5 rounded mt-1.5 inline-block">
            Across all categories
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
        </div>
      </div>

      {/* KPI 4: Warning Count */}
      <div className="bg-gradient-to-br from-white to-[#f8fafc] rounded-xl p-4 border border-gray-100/90 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Critical Capacity</p>
          <h3 className="text-xl font-bold text-gray-800 mt-1.5">{stats.criticalCount} Facilities</h3>
          <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded mt-1.5 inline-block ${stats.criticalCount > 0 ? 'text-red-600 bg-red-50 border border-red-100' : 'text-gray-500 bg-gray-50'}`}>
            {stats.criticalCount > 0 ? 'Requires attention (>80%)' : 'All spaces clear'}
          </span>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stats.criticalCount > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default WarehouseStats;
