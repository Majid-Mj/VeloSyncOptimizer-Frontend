import React from 'react';
import { useSelector } from 'react-redux';
import StatCard from '../../Components/Dashboard/StatCard';

const StockMovementsStats = ({ totalCount, currentItems }) => {
  const { user } = useSelector(state => state.auth);
  const isManager = user?.role === 'WarehouseManager';

  // Aggregate from current page's view items
  const inboundCount = currentItems.filter(item => 
    item.quantity > 0 || 
    (item.movementType || '').toLowerCase().includes('in') || 
    (item.movementType || '').toLowerCase().includes('receipt')
  ).length;
  
  const outboundCount = currentItems.filter(item => 
    item.quantity < 0 || 
    (item.movementType || '').toLowerCase().includes('out') || 
    (item.movementType || '').toLowerCase().includes('issue')
  ).length;

  const uniqueWarehouses = new Set(currentItems.map(item => item.warehouseId)).size;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
        label="Audit Ledger Entries"
        value={totalCount.toLocaleString()}
        trend={isManager ? "Your facility transactions" : "Total logged events"}
        trendType="neutral"
        color="indigo"
      />

      <StatCard
        icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
          </svg>
        }
        label="Inbound Receipts"
        value={inboundCount.toLocaleString()}
        trend="Stock entries on page"
        trendType="up"
        color="emerald"
      />

      <StatCard
        icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 11l7-7 7 7M5 19l7-7 7 7" />
          </svg>
        }
        label="Outbound Issues"
        value={outboundCount.toLocaleString()}
        trend="Stock dispatches on page"
        trendType="down"
        color="rose"
      />

      <StatCard
        icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
        label={isManager ? "Assigned Scope" : "Active Warehouses"}
        value={isManager ? "1 Facility" : `${uniqueWarehouses} Nodes`}
        trend={isManager ? "Warehouse lock active" : "Facilities active on page"}
        trendType="neutral"
        color="amber"
      />
    </div>
  );
};

export default StockMovementsStats;
