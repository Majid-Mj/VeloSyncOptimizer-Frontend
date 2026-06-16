import React from 'react';
import StatCard from '../../Components/Dashboard/StatCard';

const StockLevelsStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
        label="Total SKU Nodes"
        value={(stats?.totalSkus ?? 0).toLocaleString()}
        trend="Live DB Sync"
        trendType="neutral"
        color="blue"
      />
      <StatCard
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        label="Critical Stockouts"
        value={(stats?.stockouts ?? 0).toLocaleString()}
        trend={stats?.stockouts > 0 ? "Needs PO replenishment" : "All clear"}
        trendType={stats?.stockouts > 0 ? "down" : "up"}
        color="rose"
      />
      <StatCard
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z" /></svg>}
        label="Low Stock Warnings"
        value={(stats?.lowStock ?? 0).toLocaleString()}
        trend="Below safety buffers"
        trendType={stats?.lowStock > 0 ? "neutral" : "up"}
        color="amber"
      />
      <StatCard
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" /></svg>}
        label="Healthy Stock"
        value={(stats?.healthyStock ?? 0).toLocaleString()}
        trend="Optimal replenishment status"
        trendType="up"
        color="green"
      />
    </div>
  );
};

export default StockLevelsStats;
