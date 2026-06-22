import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ProcurementDashboardView from '../../Components/Dashboard/ProcurementDashboardView';
import OperationsDashboardView from '../../Components/Dashboard/OperationsDashboardView';
import dashboardApi from '../../api/dashboard.api';

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

  // Fetch live metrics from single composite API endpoint
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const payloadRes = await dashboardApi.getPayload();
        
        // Extract inner data using robust optional chaining (handles .data wrapping from both axios and ResponseFactory)
        const payload = payloadRes?.data?.data || payloadRes?.data || payloadRes;

        setSummary(payload?.summary || payload?.Summary);
        setWarehousesCount(payload?.warehouses?.length || payload?.Warehouses?.length || 6);

        const proc = payload?.procurement || payload?.Procurement;
        if (proc) {
          const poRes = proc.orders || proc.Orders;
          const supRes = proc.suppliers || proc.Suppliers;
          const alertsRes = proc.alerts || proc.Alerts;
          const sugRes = proc.suggestions || proc.Suggestions;

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

  const isProcurement = user?.role === 'ProcurementOfficer' || user?.role === 'ProcurementManager';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Metrics...</p>
        </div>
      </div>
    );
  }

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
      <ProcurementDashboardView
        draftPendingOrders={draftPendingOrders}
        overdueDeliveries={overdueDeliveries}
        procurementSuppliers={procurementSuppliers}
        topCriticalSuggestions={topCriticalSuggestions}
        poCreatedThisMonthCount={poCreatedThisMonthCount}
        totalPoValueThisMonth={totalPoValueThisMonth}
        onNavigate={navigate}
        handleGeneratePOFromSuggestion={handleGeneratePOFromSuggestion}
      />
    );
  }

  // Operations Dashboard
  return (
    <OperationsDashboardView
      summary={summary}
      warehousesCount={warehousesCount}
      onNavigate={navigate}
      onPrint={() => window.print()}
    />
  );
};

export default DashboardPage;
