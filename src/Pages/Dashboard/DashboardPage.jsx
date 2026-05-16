import React from 'react';
import { useSelector } from 'react-redux';
import StatCard from '../../Components/Dashboard/StatCard';
import VelocityChart from '../../Components/Dashboard/VelocityChart';
import AlertsList from '../../Components/Dashboard/AlertsList';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="p-10 max-w-[1600px] mx-auto pb-20">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        <StatCard 
          icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>}
          label="Total SKUs"
          value="2,847"
          trend="12%"
          trendType="up"
          color="blue"
        />
        <StatCard 
          icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
          label="Total stock value"
          value="RM 4.2M"
          trend="8%"
          trendType="up"
          color="green"
        />
        <StatCard 
          icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>}
          label="Active warehouses"
          value="6"
          trend="0%"
          trendType="neutral"
          color="amber"
        />
        <StatCard 
          icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
          label="Pending reorders"
          value="14"
          trend="3"
          trendType="up"
          color="red"
        />
      </div>

      {/* Charts & Alerts Section */}
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        <VelocityChart />
        <AlertsList />
      </div>
    </div>
  );
};

export default DashboardPage;
