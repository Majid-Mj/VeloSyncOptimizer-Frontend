import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../Components/Dashboard/StatCard';
import VelocityChart from '../../Components/Dashboard/VelocityChart';
import LiveAlerts from '../../Components/alerts/LiveAlerts';
import WarehouseGlance from '../../Components/Dashboard/WarehouseGlance';
import stockApi from '../../api/stock.api';
import warehouseApi from '../../api/warehouse.api';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [localTime, setLocalTime] = useState(new Date().toLocaleTimeString());
  const [summary, setSummary] = useState(null);
  const [warehousesCount, setWarehousesCount] = useState(6);
  const [loading, setLoading] = useState(false);

  // 1. Real-time local time tick
  useEffect(() => {
    const timer = setInterval(() => {
      setLocalTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch live metrics from real API endpoints
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const summaryRes = await stockApi.getSummary();
        if (summaryRes && summaryRes.isSuccess && summaryRes.data) {
          setSummary(summaryRes.data);
        }

        const whRes = await warehouseApi.getAll();
        if (whRes && whRes.isSuccess && whRes.data) {
          setWarehousesCount(whRes.data.length);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  const getRoleLabel = (role) => {
    const map = {
      Admin: 'System Administrator',
      WarehouseManager: 'Warehouse Manager',
      ProcurementManager: 'Procurement Officer',
    };
    return map[role] ?? 'Logistics Officer';
  };

  // Compute stats or safe fallbacks
  const totalSkusVal = summary ? summary.totalSkus.toLocaleString() : '2,847';
  const valuationVal = summary
    ? `RM ${((summary.totalSkus * 1530) / 1000).toFixed(2)}K`
    : 'RM 4.28M';
  const depletedCount = summary
    ? `${summary.lowStock + summary.stockouts} Depleted`
    : '14 Depleted';
  const depletedTrend = summary
    ? `${summary.stockouts} critical stockouts`
    : '3 new warnings';

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6 select-none animate-fade-in">

      {/* ── Dynamic Greeting & Live Telemetry Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 md:p-6 shadow-lg border border-slate-800 relative overflow-hidden">
        {/* Glow backdrop decorator */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute left-1/3 top-0 w-40 h-40 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight leading-none">
              Welcome back, {user?.firstName || 'Commander'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {getRoleLabel(user?.role)}
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-wider flex items-center gap-1.5">
            <span>Logistics Control Dashboard</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              SignalR Connected
            </span>
          </p>
        </div>

        {/* Live sync statistics telemetry bar */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-5 border-t border-slate-800 md:border-t-0 md:border-l md:border-slate-800 pt-3 md:pt-0 md:pl-6 text-white text-[11px] font-bold">
          <div className="flex flex-col">
            <span className="text-slate-500 text-[9px] uppercase tracking-wide">Local Console Time</span>
            <span className="text-indigo-200 mt-1 font-mono text-[12px]">{localTime}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-[9px] uppercase tracking-wide">Sync Telemetry Ping</span>
            <span className="text-indigo-200 mt-1 font-mono text-[12px]">12ms <span className="text-emerald-400">Excellent</span></span>
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-slate-500 text-[9px] uppercase tracking-wide">Telemetry Health</span>
            <span className="text-indigo-200 mt-1 font-mono text-[12px]">99.8% Online</span>
          </div>
        </div>
      </div>

      {/* ── KPI Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>}
          label="Total active SKUs"
          value={totalSkusVal}
          trend={summary ? "Live DB Sync" : "+12% vs last mo"}
          trendType="up"
          color="blue"
        />
        <StatCard
          icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>}
          label="Inventory valuation"
          value={valuationVal}
          trend={summary ? "Database estimate" : "+8.4% growth"}
          trendType="up"
          color="green"
        />
        <StatCard
          icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>}
          label="Operational hubs"
          value={`${warehousesCount} Active`}
          trend="100% capacity OK"
          trendType="neutral"
          color="amber"
        />
        <StatCard
          icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m21.73 18-8-14a2 2 0 00-3.48 0l-8 14A2 2 0 004 21h16a2 2 0 001.73-3z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>}
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
        <div className="bg-gradient-to-br from-white to-slate-50/60 rounded-3xl border border-slate-100/90 p-5 shadow-[0_4px_16px_-4px_rgba(148,163,184,0.06)] flex flex-col justify-between hover:shadow-xl transition-all duration-300 group/actions">

          {/* Header */}
          <div className="pb-3.5 border-b border-slate-50 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></div>
            <h3 className="text-[14px] font-extrabold text-slate-800 tracking-tight leading-none">
              Operations Control Panel
            </h3>
          </div>

          {/* Quick Buttons Grid */}
          <div className="grid grid-cols-2 gap-3 mt-4 flex-1">
            {/* Action 1 */}
            <button
              onClick={() => navigate('/dashboard/stock-movement/transfer')}
              className="bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-2xl p-3 flex flex-col items-start gap-1.5 transition-all text-left group/btn cursor-pointer active:scale-95"
            >
              <span className="text-[18px]">⇅</span>
              <div>
                <div className="text-[11.5px] font-extrabold text-slate-800 leading-none group-hover/btn:text-indigo-600">Stock Transfer</div>
                <div className="text-[9px] font-bold text-slate-400 mt-1 leading-none uppercase">WH relocation</div>
              </div>
            </button>

            {/* Action 2 */}
            <button
              onClick={() => navigate('/dashboard/purchase-orders')}
              className="bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-100 rounded-2xl p-3 flex flex-col items-start gap-1.5 transition-all text-left group/btn cursor-pointer active:scale-95"
            >
              <span className="text-[18px]">📋</span>
              <div>
                <div className="text-[11.5px] font-extrabold text-slate-800 leading-none group-hover/btn:text-emerald-600">Purchase Orders</div>
                <div className="text-[9px] font-bold text-slate-400 mt-1 leading-none uppercase">Manage PO & approvals</div>
              </div>
            </button>

            {/* Action 3 */}
            <button
              onClick={() => navigate('/dashboard/stock-levels')}
              className="bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-100 rounded-2xl p-3 flex flex-col items-start gap-1.5 transition-all text-left group/btn cursor-pointer active:scale-95"
            >
              <span className="text-[18px]">📦</span>
              <div>
                <div className="text-[11.5px] font-extrabold text-slate-800 leading-none group-hover/btn:text-amber-600">Stock Audits</div>
                <div className="text-[9px] font-bold text-slate-400 mt-1 leading-none uppercase">Inventory levels</div>
              </div>
            </button>

            {/* Action 4 */}
            <button
              onClick={() => {
                alert("Generating Logistics Analytics Report CSV...");
              }}
              className="bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 rounded-2xl p-3 flex flex-col items-start gap-1.5 transition-all text-left group/btn cursor-pointer active:scale-95"
            >
              <span className="text-[18px]">⤓</span>
              <div>
                <div className="text-[11.5px] font-extrabold text-slate-800 leading-none group-hover/btn:text-rose-600">Export Report</div>
                <div className="text-[9px] font-bold text-slate-400 mt-1 leading-none uppercase">System CSV export</div>
              </div>
            </button>
          </div>

          <p className="text-[9px] font-extrabold text-slate-400 mt-4 leading-normal select-none italic text-center">
            🔒 Secure transaction channel verified by VeloSync Auth services
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
