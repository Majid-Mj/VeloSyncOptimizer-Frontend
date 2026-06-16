import React from 'react';
import StatCard from '../../Components/Dashboard/StatCard';

const WarehouseStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
      <StatCard
        icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21V9M14 21V3M9 21V9M4 21V12" />
          </svg>
        }
        label="Active Facilities"
        value={`${stats.total} ${stats.total === 1 ? 'Warehouse' : 'Warehouses'}`}
        trend="100% capacity OK"
        trendType="up"
        color="indigo"
      />

      <StatCard
        icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        }
        label="Avg Capacity Used"
        value={`${stats.avgCapacity}%`}
        trend={stats.avgCapacity >= 80 ? "Close to max limit" : "Load balance safe"}
        trendType={stats.avgCapacity >= 80 ? "down" : "up"}
        color={stats.avgCapacity >= 80 ? "rose" : stats.avgCapacity >= 65 ? "amber" : "emerald"}
      />

      <StatCard
        icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
        }
        label="Storage Volume"
        value={`${stats.totalSkus.toLocaleString()} SKUs`}
        trend="Active DB catalog"
        trendType="neutral"
        color="blue"
      />

      <StatCard
        icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
        label="Critical Thresholds"
        value={`${stats.criticalCount} ${stats.criticalCount === 1 ? 'Facility' : 'Facilities'}`}
        trend={stats.criticalCount > 0 ? "High utilization warning" : "Optimal capacity status"}
        trendType={stats.criticalCount > 0 ? "down" : "up"}
        color={stats.criticalCount > 0 ? "rose" : "green"}
      />
    </div>
  );
};

export default WarehouseStats;
