import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HubConnectionBuilder } from '@microsoft/signalr';

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
import productApi from '../../api/product.api';

const ReOrderDashboardPage = () => {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  // Core API states
  const [suggestions, setSuggestions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Interaction controls
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(user?.role === 'WarehouseManager' ? user?.warehouseId : 'all');
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
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const warehouseId = user?.role === 'WarehouseManager'
        ? user?.warehouseId
        : (selectedWarehouseId === 'all' ? null : Number(selectedWarehouseId));

      // 1. Fetch suggestions, alerts, warehouses, and products in parallel
      const [sugRes, alertRes, whRes, prodRes] = await Promise.all([
        reorderApi.getSuggestions({ isCriticalOnly: false, warehouseId }),
        alertsApi.getAlerts({ unreadOnly: false, warehouseId }),
        warehouseApi.getAll(),
        productApi.getAll({ pageSize: 100 })
      ]);

      if (sugRes && sugRes.isSuccess && sugRes.data) {
        const mapped = sugRes.data.map(s => ({
          id: s.id,
          ProductId: s.productId,
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
        // Notify sidebar badge without causing infinite loop
        window.dispatchEvent(new CustomEvent('reorder-badge-update'));
      } else {
        setSuggestions([]);
      }

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

      if (whRes && whRes.isSuccess && whRes.data) {
        setWarehouses(whRes.data);
      }

      if (prodRes && prodRes.data) {
        setProducts(prodRes.data.items || prodRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load ERP Reorder Dashboard context:', err);
      setSuggestions([]);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [user, selectedWarehouseId]);

  // Run on mount and whenever user/warehouse filter changes
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Listen for the event fired by PurchaseOrdersPage after a PO is created
  // from a suggestion — immediately re-fetches so the actioned item disappears
  useEffect(() => {
    const handleSuggestionActioned = () => {
      loadDashboardData();
    };
    window.addEventListener('reorder-suggestions-updated', handleSuggestionActioned);
    return () => window.removeEventListener('reorder-suggestions-updated', handleSuggestionActioned);
  }, [loadDashboardData]);

  // Live ref to avoid restarting SignalR on warehouse change
  const selectedWarehouseIdRef = React.useRef(selectedWarehouseId);
  useEffect(() => {
    selectedWarehouseIdRef.current = selectedWarehouseId;
  }, [selectedWarehouseId]);

  // Real-time stock alerts via SignalR
  useEffect(() => {
    const hubConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:5009/hubs/stock', {
        withCredentials: true
      })
      .withAutomaticReconnect()
      .build();

    hubConnection.on('StockAlert', (newAlert) => {
      console.log('ReOrderDashboardPage received real-time StockAlert:', newAlert);

      // Filter real-time alert by active warehouse filter
      const currentWhFilter = user?.role === 'WarehouseManager'
        ? user?.warehouseId
        : (selectedWarehouseIdRef.current === 'all' ? null : Number(selectedWarehouseIdRef.current));

      if (currentWhFilter && newAlert.warehouseId !== currentWhFilter) {
        return; // ignore alerts from other warehouses
      }

      if (newAlert.isRead) {
        // Remove the alert from state if it was cleared/read
        setAlerts(prev => prev.filter(a => !(a.productId === newAlert.productId && a.warehouseId === newAlert.warehouseId)));
        return;
      }

      let sev = newAlert.severityId === 1 ? 'HIGH' : newAlert.severityId === 2 ? 'MED' : 'LOW';

      const mappedAlert = {
        id: newAlert.id || Date.now(),
        productId: newAlert.productId,
        warehouseId: newAlert.warehouseId,
        severity: sev,
        title: newAlert.alertType || 'Stock Alert',
        sub: newAlert.message || 'Safety buffer exceeded.',
        location: newAlert.warehouseName || 'Warehouse',
        createdAt: new Date(newAlert.timestamp || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setAlerts(prev => {
        const exists = prev.some(a => a.productId === mappedAlert.productId && a.warehouseId === mappedAlert.warehouseId);
        if (exists) {
          return prev.map(a => (a.productId === mappedAlert.productId && a.warehouseId === mappedAlert.warehouseId) ? mappedAlert : a);
        }
        return [mappedAlert, ...prev];
      });
    });

    hubConnection.start()
      .then(() => console.log('Successfully connected ReOrderDashboardPage to StockHub.'))
      .catch(err => console.error('Error establishing SignalR connection in ReOrderDashboardPage:', err));

    return () => {
      hubConnection.stop()
        .then(() => console.log('Successfully disconnected ReOrderDashboardPage from StockHub.'))
        .catch(err => console.error('Error disconnecting ReOrderDashboardPage from StockHub:', err));
    };
  }, [user]);

  // Find user's assigned warehouse
  const activeWarehouse = useMemo(() => {
    if (user?.warehouseId && warehouses.length > 0) {
      return warehouses.find(w => w.id === user.warehouseId);
    }
    if (selectedWarehouseId !== 'all' && warehouses.length > 0) {
      return warehouses.find(w => w.id === Number(selectedWarehouseId));
    }
    return null;
  }, [user, warehouses, selectedWarehouseId]);

  // Handle Mark Actioned (Dispatch button)
  const handleActionSuggestion = async (id) => {
    setActioningId(id);
    try {
      const res = await reorderApi.markActioned(id);
      // Optimistically remove regardless of API response
      setSuggestions(prev => prev.filter(s => s.id !== id));
      window.dispatchEvent(new CustomEvent('reorder-badge-update'));
    } catch (err) {
      console.error(err);
      setSuggestions(prev => prev.filter(s => s.id !== id));
      window.dispatchEvent(new CustomEvent('reorder-badge-update'));
    } finally {
      setActioningId(null);
    }
  };

  const handleGeneratePO = async (suggestion) => {
    let matchedProd = products.find(p => p.id === suggestion.ProductId);
    if (!matchedProd) {
      try {
        const prodRes = await productApi.getById(suggestion.ProductId);
        if (prodRes && prodRes.data) {
          matchedProd = prodRes.data;
        }
      } catch (err) {
        console.error('Failed to fetch product details for suggestion PO prefill:', err);
      }
    }

    const prefill = {
      suggestionId: suggestion.id,
      supplierId: matchedProd?.supplierId || '',
      warehouseId: suggestion.WarehouseId,
      productId: suggestion.ProductId,
      quantityOrdered: suggestion.SuggestedQty,
      unitCost: matchedProd?.unitCost || matchedProd?.price || 0.00
    };

    // Optimistically remove suggestion from local state immediately
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    window.dispatchEvent(new CustomEvent('reorder-badge-update'));

    navigate('/dashboard/purchase-orders', { state: { prefill } });
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
            FACILITY CONTROL: <span className="text-[#704efe] font-extrabold">{activeWarehouse ? `${activeWarehouse.name.toUpperCase()} (${activeWarehouse.code})` : 'ALL FACILITIES (GLOBAL VIEW)'}</span>
          </p>
        </div>

        {user?.role !== 'WarehouseManager' && (
          <div className="flex items-center gap-2.5 bg-white border border-slate-100 px-3 py-1.5 rounded-xl shadow-2xs">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Facility:</span>
            <select
              value={selectedWarehouseId}
              onChange={(e) => {
                setSelectedWarehouseId(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-none text-[11px] font-black text-[#704efe] uppercase tracking-wider outline-none cursor-pointer pr-4"
            >
              <option value="all">ALL WAREHOUSES</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </div>
        )}
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
            handleGeneratePO={handleGeneratePO}
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
