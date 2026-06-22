import React from 'react';
import StatCard from './StatCard';
import VelocityChart from './VelocityChart';
import LiveAlerts from '../alerts/LiveAlerts';
import WarehouseGlance from './WarehouseGlance';
import OperationsQuickActions from './Operations/OperationsQuickActions';

const OperationsDashboardView = ({
  summary,
  warehousesCount,
  onNavigate,
  onPrint
}) => {
  // Compute stats or safe fallbacks
  const totalSkusVal = summary ? summary.totalSkus.toLocaleString() : '2,847';
  const valuationVal = summary && summary.totalValuation !== undefined && summary.totalValuation !== null
    ? Number(summary.totalValuation) >= 1000000
      ? `₹ ${(Number(summary.totalValuation) / 1000000).toFixed(2)}M`
      : `₹ ${(Number(summary.totalValuation) / 1000).toFixed(2)}K`
    : '₹ 80.46M';
  const depletedCount = summary
    ? `${summary.lowStock + summary.stockouts} Depleted`
    : '14 Depleted';
  const depletedTrend = summary
    ? `${summary.stockouts} critical stockouts`
    : '3 new warnings';

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6 select-none animate-fade-in">

      {/* ── KPI Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            </svg>
          }
          label="Total active SKUs"
          value={totalSkusVal}
          trend={summary ? "Live DB Sync" : "+12% vs last mo"}
          trendType="up"
          color="blue"
        />
        <StatCard
          icon={
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          }
          label="Stock valuation"
          value={valuationVal}
          trend={summary ? "Live DB Valuation" : "+8.4% growth"}
          trendType="up"
          color="green"
        />
        <StatCard
          icon={
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          }
          label="Operational hubs"
          value={`${warehousesCount} Active`}
          trend="100% capacity OK"
          trendType="neutral"
          color="amber"
        />
        <StatCard
          icon={
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m21.73 18-8-14a2 2 0 00-3.48 0l-8 14A2 2 0 004 21h16a2 2 0 001.73-3z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          }
          label="Urgent reorder items"
          value={depletedCount}
          trend={depletedTrend}
          trendType="down"
          color="red"
        />
      </div>

      {/* ── Charts & Alerts Section ── */}
      <div className="flex flex-col lg:flex-row gap-5 items-stretch">
        <VelocityChart />
        <LiveAlerts />
      </div>

      {/* ── Bottom Operational Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Warehouses Glance Carousel */}
        <div className="lg:col-span-2">
          <WarehouseGlance />
        </div>

        {/* Manager Quick Actions Deck */}
        <OperationsQuickActions
          onNavigate={onNavigate}
          onPrint={onPrint}
        />
      </div>
    </div>
  );
};

export default OperationsDashboardView;
