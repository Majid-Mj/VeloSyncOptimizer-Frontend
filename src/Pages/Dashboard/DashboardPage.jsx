import React from 'react';
import { useSelector } from 'react-redux';
import StatCard from '../../Components/Dashboard/StatCard';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          Dashboard
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        </h1>
        <p className="text-[13px] text-gray-400 mt-1 font-medium">
          Real-time overview — connected via SignalR
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>}
          label="Total SKUs"
          value="2,847"
          trend="12%"
          trendType="up"
        />
        <StatCard 
          icon={<svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
          label="Total stock value"
          value="RM 4.2M"
          trend="8%"
          trendType="up"
        />
        <StatCard 
          icon={<svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>}
          label="Active warehouses"
          value="6"
          trend="0%"
          trendType="neutral"
        />
        <StatCard 
          icon={<svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 00-3.48 0l-8 14A2 2 0 004 21h16a2 2 0 001.73-3z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>}
          label="Pending reorders"
          value="14"
          trend="3"
          trendType="up"
        />
      </div>

      {/* Placeholders for next sections */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-white rounded-3xl border-2 border-dashed border-gray-100 flex items-center justify-center text-gray-300 font-medium">
          Stock velocity chart coming soon...
        </div>
        <div className="h-80 bg-white rounded-3xl border-2 border-dashed border-gray-100 flex items-center justify-center text-gray-300 font-medium">
          Live alerts coming soon...
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
