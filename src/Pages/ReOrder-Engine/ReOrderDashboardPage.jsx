import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Import modular reorder engine widgets
import ReOrderStats from './ReOrderStats';
import ReOrderCriticalAlerts from './ReOrderCriticalAlerts';
import ReOrderSuggestionsTable from './ReOrderSuggestionsTable';
import ReOrderHealthCore from './ReOrderHealthCore';
import ReOrderVelocityAnalytics from './ReOrderVelocityAnalytics';
import ReOrderLiveAlertsFeed from './ReOrderLiveAlertsFeed';

// Import secure api clients
import reorderApi from '../../api/reorder.api';
import alertsApi from '../../api/alerts.api';
import warehouseApi from '../../api/warehouse.api';

const ReOrderDashboardPage = () => {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  // Core API states
  const [suggestions, setSuggestions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Interaction controls
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('RISK'); // RISK, SKU, SUG_QTY, DAYS
  const [sortDir, setSortDir] = useState('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [actioningId, setActioningId] = useState(null);

  // Live clock tick
  const [liveTime, setLiveTime] = useState(new Date().toLocaleTimeString());
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch warehouse manager scoped metrics from API
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const warehouseId = user?.role === 'WarehouseManager' ? user?.warehouseId : null;

        // 1. Fetch suggestions
        const sugRes = await reorderApi.getSuggestions({ isCriticalOnly: false, warehouseId });
        if (sugRes && sugRes.isSuccess && sugRes.data) {
          const mapped = sugRes.data.map(s => ({
            id: s.id,
            name: s.name,
            sku: s.sku,
            SuggestedQty: s.suggestedQty,
            RiskScore: Math.round(s.riskScore),
            Reason: s.reason || 'Calculated stock limit safety replenishment required',
            Severity: s.severity || 'Medium',
            WarehouseId: s.warehouseId,
            Code: s.code || 'WH-01',
            CurrentStock: s.currentStock,
            ReorderPoint: s.reorderPoint,
            AvgDailyVelocity: s.avgDailyVelocity,
            DaysLeft: Math.round(s.daysLeft),
            CreatedAt: s.createdAt || new Date().toISOString()
          }));
          setSuggestions(mapped);
          window.dispatchEvent(new CustomEvent('reorder-suggestions-updated'));
        } else {
          setSuggestions([]);
        }

        // 2. Fetch active warnings
        const alertRes = await alertsApi.getAlerts({ unreadOnly: false, warehouseId });
        if (alertRes && alertRes.isSuccess && alertRes.data) {
          const mappedAlerts = alertRes.data.map(a => {
            let sev = a.severity?.toUpperCase() || 'LOW';
            if (sev === 'MEDIUM') sev = 'MED';
            if (sev === 'CRITICAL') sev = 'HIGH';
            return {
              id: a.id,
              severity: sev,
              title: a.alertType || 'Stock Alert',
              sub: a.message || 'Safety buffer exceeded.',
              location: a.warehouseName || 'Warehouse',
              createdAt: new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          });
          setAlerts(mappedAlerts);
        } else {
          setAlerts([]);
        }

        // 3. Fetch warehouses reference
        const whRes = await warehouseApi.getAll();
        if (whRes && whRes.isSuccess && whRes.data) {
          setWarehouses(whRes.data);
        }
      } catch (err) {
        console.error('Failed to load ERP Reorder Dashboard context:', err);
        setSuggestions([]);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Find user's assigned warehouse
  const activeWarehouse = useMemo(() => {
    if (user?.warehouseId && warehouses.length > 0) {
      return warehouses.find(w => w.id === user.warehouseId);
    }
    return warehouses[0] || { code: 'WH-KL-01', name: 'Central Depot' };
  }, [user, warehouses]);

  // Handle Mark Actioned
  const handleActionSuggestion = async (id) => {
    setActioningId(id);
    try {
      const res = await reorderApi.markActioned(id);
      if (res && res.isSuccess) {
        setSuggestions(prev => prev.filter(s => s.id !== id));
        window.dispatchEvent(new CustomEvent('reorder-suggestions-updated'));
      } else {
        setSuggestions(prev => prev.filter(s => s.id !== id));
        window.dispatchEvent(new CustomEvent('reorder-suggestions-updated'));
      }
    } catch (err) {
      console.error(err);
      setSuggestions(prev => prev.filter(s => s.id !== id));
      window.dispatchEvent(new CustomEvent('reorder-suggestions-updated'));
    } finally {
      setActioningId(null);
    }
  };

  // Calculations
  const criticalSuggestions = useMemo(() => suggestions.filter(s => s.Severity === 'Critical' || s.Severity === 'High'), [suggestions]);
  const mediumSuggestions = useMemo(() => suggestions.filter(s => s.Severity === 'Medium'), [suggestions]);
  const lowSuggestions = useMemo(() => suggestions.filter(s => s.Severity === 'Low'), [suggestions]);

  // Velocity indicators count
  const fastMoversCount = useMemo(() => suggestions.filter(s => s.AvgDailyVelocity > 10).length, [suggestions]);

  // Health Score Gauge
  const inventoryHealthPercent = useMemo(() => {
    if (suggestions.length === 0) return 98;
    const totalRisk = suggestions.reduce((sum, s) => sum + s.RiskScore, 0);
    const avgRisk = totalRisk / suggestions.length;
    return Math.max(5, Math.round(100 - avgRisk));
  }, [suggestions]);

  // Client-side Filtering and Sorting
  const filteredSuggestionsList = useMemo(() => {
    let result = suggestions.filter(item => {
      const matchesSearch = (item.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                            (item.sku?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                            (item.Code?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
      const matchesSeverity = severityFilter === 'ALL' || item.Severity.toUpperCase() === severityFilter.toUpperCase();
      
      return matchesSearch && matchesSeverity;
    });

    // Sorting
    result.sort((a, b) => {
      let valA, valB;
      if (sortBy === 'RISK') {
        valA = a.RiskScore;
        valB = b.RiskScore;
      } else if (sortBy === 'SKU') {
        valA = a.sku;
        valB = b.sku;
      } else if (sortBy === 'SUG_QTY') {
        valA = a.SuggestedQty;
        valB = b.SuggestedQty;
      } else if (sortBy === 'DAYS') {
        valA = a.DaysLeft;
        valB = b.DaysLeft;
      } else {
        valA = a.id;
        valB = b.id;
      }

      if (typeof valA === 'string') {
        return sortDir === 'ASC' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDir === 'ASC' ? valA - valB : valB - valA;
    });

    return result;
  }, [suggestions, searchQuery, severityFilter, sortBy, sortDir]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredSuggestionsList.length / pageSize));
  const paginatedList = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredSuggestionsList.slice(startIdx, startIdx + pageSize);
  }, [filteredSuggestionsList, currentPage]);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#f8fafc]/50 p-6 gap-6 font-sans antialiased overflow-y-auto">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2.5 tracking-tight uppercase">
            Reorder suggestions Engine
            <span className="text-[10px] font-black bg-emerald-50 border border-emerald-100/60 text-emerald-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
              Active Control Node
            </span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 mt-1.5 tracking-wider uppercase leading-none">
            FACILITY CONTROL: <span className="text-indigo-600 font-extrabold">{activeWarehouse?.name || 'CENTRAL DEPOSITORY'} ({activeWarehouse?.code || 'WH-01'})</span>
          </p>
        </div>
      </div>

      {/* ── SECTION 1: KPI STATS CARDS ── */}
      <ReOrderStats 
        suggestions={suggestions}
        criticalCount={criticalSuggestions.length}
        mediumCount={mediumSuggestions.length}
        lowCount={lowSuggestions.length}
        fastMoversCount={fastMoversCount}
      />

      {/* ── SECTION 2: CRITICAL STOCK ALERT CARDS ── */}
      <ReOrderCriticalAlerts criticalSuggestions={criticalSuggestions} />

      {/* ── SECTION 3: TWO-COLUMN MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Suggesion Logs Table */}
        <div className="lg:col-span-2 flex flex-col min-w-0">
          <ReOrderSuggestionsTable 
            loading={loading}
            paginatedList={paginatedList}
            severityFilter={severityFilter}
            setSeverityFilter={setSeverityFilter}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            actioningId={actioningId}
            handleActionSuggestion={handleActionSuggestion}
            user={user}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        {/* Right sidebars */}
        <div className="flex flex-col gap-6">
          {/* Integrity health gauge */}
          <ReOrderHealthCore 
            inventoryHealthPercent={inventoryHealthPercent}
            suggestions={suggestions}
            criticalSuggestions={criticalSuggestions}
            mediumSuggestions={mediumSuggestions}
          />

          {/* Velocity Movers Widget */}
          <ReOrderVelocityAnalytics suggestions={suggestions} />
        </div>

      </div>

      {/* ── SECTION 4: LIVE WARNINGS TELEMETRY HUB ── */}
      <ReOrderLiveAlertsFeed alerts={alerts} />

    </div>
  );
};

export default ReOrderDashboardPage;
