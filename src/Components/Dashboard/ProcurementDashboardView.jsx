import React from 'react';
import StatCard from './StatCard';
import LiveAlerts from '../alerts/LiveAlerts';
import DraftPOsTable from './Procurement/DraftPOsTable';
import OverdueDeliveriesTable from './Procurement/OverdueDeliveriesTable';
import SupplierHealthMatrix from './Procurement/SupplierHealthMatrix';
import CriticalReorderSuggestions from './Procurement/CriticalReorderSuggestions';
import ProcurementQuickActions from './Procurement/ProcurementQuickActions';

const ProcurementDashboardView = ({
  draftPendingOrders,
  overdueDeliveries,
  procurementSuppliers,
  topCriticalSuggestions,
  poCreatedThisMonthCount,
  totalPoValueThisMonth,
  onNavigate,
  handleGeneratePOFromSuggestion
}) => {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6 select-none animate-fade-in">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Procurement Command Center
            <span className="text-[10px] bg-indigo-50 text-indigo-600 font-black px-2.5 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              Procurement Mode
            </span>
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">
            Overview of purchase requisitions, automated replenishment suggestions & supplier compliance metrics
          </p>
        </div>
      </div>

      {/* ── KPI Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h4" />
            </svg>
          }
          label="Draft POs Pending Approval"
          value={draftPendingOrders.length.toString()}
          trend="Awaiting admin approval"
          trendType="neutral"
          color="indigo"
        />
        <StatCard
          icon={
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          label="Overdue Deliveries"
          value={overdueDeliveries.length.toString()}
          trend="Needs supplier follow-up"
          trendType={overdueDeliveries.length > 0 ? "down" : "up"}
          color="rose"
        />
        <StatCard
          icon={
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
          label="POs Created This Month"
          value={poCreatedThisMonthCount.toString()}
          trend="Personal activity summary"
          trendType="neutral"
          color="blue"
        />
        <StatCard
          icon={
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Total PO Value (Month)"
          value={`₹${totalPoValueThisMonth.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          trend="Budget awareness metric"
          trendType="up"
          color="emerald"
        />
      </div>

      {/* ── Main Panel Split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (2 spans): POs & Suppliers */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <DraftPOsTable
            draftPendingOrders={draftPendingOrders}
            onManage={() => onNavigate('/dashboard/purchase-orders')}
          />

          <OverdueDeliveriesTable
            overdueDeliveries={overdueDeliveries}
          />

          <SupplierHealthMatrix
            procurementSuppliers={procurementSuppliers}
            onViewAll={() => onNavigate('/dashboard/suppliers')}
          />
        </div>

        {/* Right Column (1 span): Alerts & Suggestions */}
        <div className="flex flex-col gap-6">
          <CriticalReorderSuggestions
            topCriticalSuggestions={topCriticalSuggestions}
            handleGeneratePO={handleGeneratePOFromSuggestion}
          />

          <div className="flex-1 min-h-[300px] flex flex-col">
            <LiveAlerts />
          </div>

          <ProcurementQuickActions
            onNavigate={onNavigate}
          />
        </div>

      </div>

    </div>
  );
};

export default ProcurementDashboardView;
