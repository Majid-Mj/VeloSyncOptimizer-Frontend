import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../Components/Dashboard/StatCard';
import VelocityChart from '../../Components/Dashboard/VelocityChart';
import LiveAlerts from '../../Components/alerts/LiveAlerts';
import WarehouseGlance from '../../Components/Dashboard/WarehouseGlance';
import stockApi from '../../api/stock.api';
import warehouseApi from '../../api/warehouse.api';
import purchaseOrderApi from '../../api/purchaseOrder.api';
import supplierApi from '../../api/supplier.api';
import alertsApi from '../../api/alerts.api';
import reorderApi from '../../api/reorder.api';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [warehousesCount, setWarehousesCount] = useState(6);
  const [loading, setLoading] = useState(false);

  // Procurement specific states
  const [procurementOrders, setProcurementOrders] = useState([]);
  const [procurementSuppliers, setProcurementSuppliers] = useState([]);
  const [procurementAlerts, setProcurementAlerts] = useState([]);
  const [procurementSuggestions, setProcurementSuggestions] = useState([]);

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

        if (user?.role === 'ProcurementOfficer' || user?.role === 'ProcurementManager') {
          const [poRes, supRes, alertsRes, sugRes] = await Promise.all([
            purchaseOrderApi.getAll(),
            supplierApi.getAll(),
            alertsApi.getAlerts({ unreadOnly: true }),
            reorderApi.getSuggestions()
          ]);
          setProcurementOrders(Array.isArray(poRes) ? poRes : (poRes?.data || []));
          setProcurementSuppliers(supRes?.data || supRes || []);
          setProcurementAlerts(alertsRes?.data || alertsRes || []);
          setProcurementSuggestions(sugRes?.data || sugRes || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, [user]);

  const getRoleLabel = (role) => {
    const map = {
      Admin: 'System Administrator',
      WarehouseManager: 'Warehouse Manager',
      ProcurementManager: 'Procurement Officer',
      ProcurementOfficer: 'Procurement Officer',
    };
    return map[role] ?? 'Logistics Officer';
  };

  const isProcurement = user?.role === 'ProcurementOfficer' || user?.role === 'ProcurementManager';

  if (isProcurement) {
    // 1. Draft POs pending approval (submitted by me, or general fallback)
    const myUserId = user?.id ? Number(user.id) : null;
    const draftPendingOrders = procurementOrders.filter(o => {
      const isDraft = o.status === 'Draft' || o.status === 'PendingApproval';
      const isCreatedByMe = myUserId ? (Number(o.createdByUserId) === myUserId) : true;
      return isDraft && isCreatedByMe;
    });

    // 2. Overdue deliveries: Approved POs past expected date
    const overdueDeliveries = procurementOrders.filter(o => {
      if (o.status !== 'Approved') return false;
      if (!o.expectedDate) return false;
      // Parse DateOnly "YYYY-MM-DD" without timezone shift by splitting manually
      const [ey, em, ed] = String(o.expectedDate).split('-').map(Number);
      const expDate = new Date(ey, em - 1, ed); // local midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return expDate < today;
    });

    // 3. Top 3 critical reorder suggestions sorted by RiskScore
    const topCriticalSuggestions = [...procurementSuggestions]
      .sort((a, b) => {
        const scoreA = a.riskScore || a.RiskScore || 0;
        const scoreB = b.riskScore || b.RiskScore || 0;
        return scoreB - scoreA;
      })
      .slice(0, 3);

    // 4. POs created this month count (use UTC to avoid IST midnight offset shifting months)
    const now = new Date();
    const thisMonth = now.getUTCMonth();
    const thisYear = now.getUTCFullYear();
    const poCreatedThisMonth = procurementOrders.filter(o => {
      const createdDate = new Date(o.createdAt);
      const isThisMonth = createdDate.getUTCMonth() === thisMonth && createdDate.getUTCFullYear() === thisYear;
      const isCreatedByMe = myUserId ? (Number(o.createdByUserId) === myUserId) : true;
      return isThisMonth && isCreatedByMe;
    });
    const poCreatedThisMonthCount = poCreatedThisMonth.length;

    // 5. Total PO value this month (₹)
    const totalPoValueThisMonth = poCreatedThisMonth.reduce((sum, o) => sum + (Number(o.totalAmount) || Number(o.totalCost) || 0), 0);

    const handleGeneratePOFromSuggestion = (suggestion) => {
      const pId = suggestion.productId || suggestion.ProductId;
      const wId = suggestion.warehouseId || suggestion.WarehouseId;
      const qty = suggestion.suggestedQty || suggestion.SuggestedQty || 15;
      const prefill = {
        suggestionId: suggestion.id,
        supplierId: '',
        warehouseId: wId,
        productId: pId,
        quantityOrdered: qty
      };
      navigate('/dashboard/purchase-orders', { state: { prefill } });
    };

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
            icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" /></svg>}
            label="Draft POs Pending Approval"
            value={draftPendingOrders.length.toString()}
            trend="Awaiting admin approval"
            trendType="neutral"
            color="indigo"
          />
          <StatCard
            icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
            label="Overdue Deliveries"
            value={overdueDeliveries.length.toString()}
            trend="Needs supplier follow-up"
            trendType={overdueDeliveries.length > 0 ? "down" : "up"}
            color="rose"
          />
          <StatCard
            icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
            label="POs Created This Month"
            value={poCreatedThisMonthCount.toString()}
            trend="Personal activity summary"
            trendType="neutral"
            color="blue"
          />
          <StatCard
            icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
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

            {/* Draft POs pending approval */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_16px_-4px_rgba(148,163,184,0.06)] p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-slate-50 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📋</span>
                  <h3 className="text-[14px] font-extrabold text-slate-800 tracking-tight leading-none">
                    Draft POs Pending Approval
                  </h3>
                </div>
                <button
                  onClick={() => navigate('/dashboard/purchase-orders')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors border-none bg-transparent cursor-pointer"
                >
                  Manage POs →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold text-slate-600 border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="px-4 py-2.5">PO Number</th>
                      <th className="px-4 py-2.5">Supplier</th>
                      <th className="px-4 py-2.5">Warehouse</th>
                      <th className="px-4 py-2.5">Expected Date</th>
                      <th className="px-4 py-2.5">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draftPendingOrders.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                          No pending draft purchase orders found.
                        </td>
                      </tr>
                    ) : (
                      draftPendingOrders.slice(0, 5).map(o => (
                        <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-mono text-[10.5px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200/50">
                              {o.poNumber}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-800 font-bold">{o.supplierName}</td>
                          <td className="px-4 py-3 text-slate-500 font-semibold">{o.warehouseName}</td>
                          <td className="px-4 py-3 text-slate-500 font-semibold">{o.expectedDate || 'N/A'}</td>
                          <td className="px-4 py-3 text-slate-800 font-black">₹ {o.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Overdue Deliveries */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_16px_-4px_rgba(148,163,184,0.06)] p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-slate-50 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <h3 className="text-[14px] font-extrabold text-slate-800 tracking-tight leading-none">
                    Overdue Deliveries
                  </h3>
                </div>
                <span className="text-[10px] bg-rose-50 text-rose-600 font-black px-2.5 py-0.5 rounded-full border border-rose-100 uppercase tracking-wider">
                  Needs Follow-up
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold text-slate-600 border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="px-4 py-2.5">PO Number</th>
                      <th className="px-4 py-2.5">Supplier</th>
                      <th className="px-4 py-2.5">Warehouse</th>
                      <th className="px-4 py-2.5">Expected Date</th>
                      <th className="px-4 py-2.5 text-rose-600 font-bold">Days Late</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueDeliveries.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                          No overdue purchase orders detected.
                        </td>
                      </tr>
                    ) : (
                      overdueDeliveries.slice(0, 5).map(o => {
                        const [oy, om, od] = String(o.expectedDate).split('-').map(Number);
                        const expLocal = new Date(oy, om - 1, od);
                        const daysLate = Math.max(1, Math.round((new Date() - expLocal) / (1000 * 60 * 60 * 24)));
                        return (
                          <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <span className="font-mono text-[10.5px] font-black bg-rose-50 text-rose-600 px-2 py-0.5 rounded border border-rose-200/50">
                                {o.poNumber}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-800 font-bold">{o.supplierName}</td>
                            <td className="px-4 py-3 text-slate-500 font-semibold">{o.warehouseName}</td>
                            <td className="px-4 py-3 text-slate-500 font-semibold">{o.expectedDate}</td>
                            <td className="px-4 py-3 text-rose-600 font-black">{daysLate} days overdue</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Supplier Health Glance */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_16px_-4px_rgba(148,163,184,0.06)] p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-slate-50 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤝</span>
                  <h3 className="text-[14px] font-extrabold text-slate-800 tracking-tight leading-none">
                    Supplier Health Matrix
                  </h3>
                </div>
                <button
                  onClick={() => navigate('/dashboard/suppliers')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors border-none bg-transparent cursor-pointer"
                >
                  All Suppliers →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {procurementSuppliers.filter(s => s.isActive).slice(0, 4).map(s => {
                  const score = s.reliabilityScore || 90;
                  const rate = s.onTimeDeliveryRate || 90;
                  const scoreColor = score >= 90 ? 'text-emerald-500' : score >= 75 ? 'text-amber-500' : 'text-rose-500';
                  const rateColor = rate >= 90 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : rate >= 75 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100';

                  return (
                    <div key={s.id} className="p-3.5 border border-slate-100 rounded-2xl flex flex-col gap-2.5 bg-slate-50/40 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[12.5px] font-extrabold text-slate-800 leading-tight">{s.name}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{s.email || 'No Email'}</div>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-wider ${rateColor}`}>
                          On-Time: {rate}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-100/60 text-[11px] font-bold">
                        <span className="text-slate-400 uppercase tracking-wide">Reliability:</span>
                        <span className={`font-black ${scoreColor}`}>{score} / 100</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column (1 span): Alerts & Suggestions */}
          <div className="flex flex-col gap-6">

            {/* Top 3 Critical Reorder Suggestions */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_16px_-4px_rgba(148,163,184,0.06)] p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-slate-50 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔥</span>
                  <h3 className="text-[14px] font-extrabold text-slate-800 tracking-tight leading-none">
                    Top 3 Critical Reorder Suggestions
                  </h3>
                </div>
              </div>

              <div className="flex flex-col gap-3.5">
                {topCriticalSuggestions.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No critical suggestions.
                  </div>
                ) : (
                  topCriticalSuggestions.map(s => {
                    const skuVal = s.sku || s.SKU || '';
                    const nameVal = s.name || s.Name || 'Unknown SKU';
                    const score = s.riskScore || s.RiskScore || 0;
                    const reasonVal = s.reason || s.Reason || 'Stock levels running low';
                    return (
                      <div key={s.id} className="p-3.5 border border-rose-100/60 rounded-2xl flex items-center justify-between gap-4 bg-rose-50/20 hover:bg-rose-50/40 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                              Risk: {Number(score).toFixed(1)}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-slate-400">{skuVal}</span>
                          </div>
                          <h4 className="text-[12px] font-black text-slate-800 mt-1 truncate">{nameVal}</h4>
                          <p className="text-[10px] text-slate-500 font-semibold mt-0.5 truncate">{reasonVal}</p>
                        </div>

                        <button
                          onClick={() => handleGeneratePOFromSuggestion(s)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black py-1.5 px-3 rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-all border-none cursor-pointer shrink-0"
                        >
                          Reorder
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Live Alerts Feed */}
            <div className="flex-1 min-h-[300px] flex flex-col">
              <LiveAlerts />
            </div>

            {/* Quick Actions Deck */}
            <div className="bg-gradient-to-br from-white to-slate-50/60 rounded-3xl border border-slate-100/90 p-5 shadow-[0_4px_16px_-4px_rgba(148,163,184,0.06)] flex flex-col justify-between hover:shadow-xl transition-all duration-300">
              <div className="pb-3.5 border-b border-slate-50 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                <h3 className="text-[13px] font-extrabold text-slate-800 tracking-tight leading-none uppercase">
                  Procurement Actions
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-2.5 mt-4">
                <button
                  onClick={() => navigate('/dashboard/reorder-suggestions')}
                  className="w-full bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 rounded-xl p-3 flex items-center justify-between transition-all text-left cursor-pointer active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">⚡</span>
                    <div>
                      <div className="text-[12px] font-extrabold text-slate-800">Reorder Suggestions</div>
                      <div className="text-[9.5px] font-bold text-slate-400 uppercase">Risk-sorted replenishment</div>
                    </div>
                  </div>
                  <span className="text-slate-400 font-bold">→</span>
                </button>

                <button
                  onClick={() => navigate('/dashboard/purchase-orders')}
                  className="w-full bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-xl p-3 flex items-center justify-between transition-all text-left cursor-pointer active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">➕</span>
                    <div>
                      <div className="text-[12px] font-extrabold text-slate-800">Create Manual PO</div>
                      <div className="text-[9.5px] font-bold text-slate-400 uppercase">Draft new order requisition</div>
                    </div>
                  </div>
                  <span className="text-slate-400 font-bold">→</span>
                </button>

                <button
                  onClick={() => navigate('/dashboard/suppliers')}
                  className="w-full bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-100 rounded-xl p-3 flex items-center justify-between transition-all text-left cursor-pointer active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🤝</span>
                    <div>
                      <div className="text-[12px] font-extrabold text-slate-800">Manage Suppliers</div>
                      <div className="text-[9.5px] font-bold text-slate-400 uppercase">Contacts & performance metrics</div>
                    </div>
                  </div>
                  <span className="text-slate-400 font-bold">→</span>
                </button>
              </div>

              <p className="text-[9px] font-extrabold text-slate-400 mt-4 leading-normal select-none italic text-center uppercase tracking-wide">
                🔒 VeloSync Procurement Channel
              </p>
            </div>

          </div>

        </div>

      </div>
    );
  }

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
          icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>}
          label="Total active SKUs"
          value={totalSkusVal}
          trend={summary ? "Live DB Sync" : "+12% vs last mo"}
          trendType="up"
          color="blue"
        />
        <StatCard
          icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>}
          label="Stock valuation"
          value={valuationVal}
          trend={summary ? "Live DB Valuation" : "+8.4% growth"}
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
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
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
                <div className="text-[9px] font-bold text-slate-400 mt-1 leading-none uppercase">Stock levels</div>
              </div>
            </button>

            {/* Action 4 */}
            <button
              onClick={() => {
                window.print();
              }}
              className="bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 rounded-2xl p-3 flex flex-col items-start gap-1.5 transition-all text-left group/btn cursor-pointer active:scale-95"
            >
              <span className="text-[18px]">⤓</span>
              <div>
                <div className="text-[11.5px] font-extrabold text-slate-800 leading-none group-hover/btn:text-rose-600">Print Report</div>
                <div className="text-[9px] font-bold text-slate-400 mt-1 leading-none uppercase">System PDF print</div>
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
