import React from 'react';
import { useSelector } from 'react-redux';
import StatCard from '../../Components/Dashboard/StatCard';
import VelocityChart from '../../Components/Dashboard/VelocityChart';
import LiveAlerts from '../../Components/alerts/LiveAlerts';
import WarehouseGlance from '../../Components/Dashboard/WarehouseGlance';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="p-4 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2.5 tracking-tight">
            Dashboard
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
          </h1>
          <p className="text-[12px] text-gray-400 mt-0.5 font-bold italic tracking-wide">
            Real-time overview — connected via SignalR
          </p>
        </div>
        <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest pb-0.5 border-b-2 border-gray-100">
          Last sync: 2 mins ago
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          icon={<svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>}
          label="Total SKUs"
          value="2,847"
          trend="12%"
          trendType="up"
          color="blue"
        />
        <StatCard
          icon={<svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>}
          label="Total stock value"
          value="RM 4.2M"
          trend="8%"
          trendType="up"
          color="green"
        />
        <StatCard
          icon={<svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>}
          label="Active warehouses"
          value="6"
          trend="0%"
          trendType="neutral"
          color="amber"
        />
        <StatCard
          icon={<svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m21.73 18-8-14a2 2 0 00-3.48 0l-8 14A2 2 0 004 21h16a2 2 0 001.73-3z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>}
          label="Pending reorders"
          value="14"
          trend="3"
          trendType="up"
          color="red"
        />
      </div>

      {/* Charts & Alerts Section */}
      <div className="mt-4 flex flex-col lg:flex-row gap-3.5">
        <VelocityChart />
        <LiveAlerts />
      </div>

      {/* Warehouses Glance Carousel */}
      <WarehouseGlance />
    </div>
  );
};

export default DashboardPage;
