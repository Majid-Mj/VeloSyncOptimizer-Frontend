import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import PurchaseOrdersStats from './PurchaseOrdersStats';
import PurchaseOrdersToolbar from './PurchaseOrdersToolbar';
import PurchaseOrdersTable from './PurchaseOrdersTable';
import GeneratePurchaseOrderModal from './GeneratePurchaseOrderModal';
import ReceivePurchaseOrderModal from './ReceivePurchaseOrderModal';
import PurchaseOrderDetailModal from './PurchaseOrderDetailModal';
import purchaseOrderApi from '../../api/purchaseOrder.api';
import supplierApi from '../../api/supplier.api';
import warehouseApi from '../../api/warehouse.api';
import productApi from '../../api/product.api';

const PurchaseOrdersPage = () => {
  const user = useSelector((s) => s.auth.user);
  const userRole = user?.role || 'Guest';

  // Core API lists state
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  // Loaders & Network boundaries
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal active states
  const [createOpen, setCreateOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [detailPoId, setDetailPoId] = useState(null);

  // Toast notifications state
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  const showToast = (msg, type = '') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 4000);
  };

  // Fetch core purchase orders ledger list
  const fetchOrders = async () => {
    try {
      const response = await purchaseOrderApi.getAll();
      const list = Array.isArray(response) ? response : (response?.data || []);
      setOrders(list);
    } catch (err) {
      console.error('PO list fetch error:', err);
      setError(err.response?.data?.message || 'Failed to retrieve purchase orders ledger trail');
    }
  };

  // Fetch static dropdown models
  const fetchMetadata = async () => {
    try {
      const [supRes, whRes, prodRes] = await Promise.all([
        supplierApi.getAll(),
        warehouseApi.getAll(),
        productApi.getAll({ pageSize: 100 })
      ]);
      setSuppliers(supRes?.data || supRes || []);
      setWarehouses(whRes?.data || whRes || []);
      setProducts(prodRes?.data?.items || prodRes?.data || []);
    } catch (err) {
      console.error('Metadata load error:', err);
    }
  };

  // central parallel fetch operations on mount
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchOrders(), fetchMetadata()]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Scope orders by role
  const scopedOrders = useMemo(() => {
    if (userRole === 'WarehouseManager') {
      return orders.filter(po =>
        po.warehouseId &&
        user?.warehouseId &&
        String(po.warehouseId) === String(user.warehouseId)
      );
    }
    return orders;
  }, [orders, userRole, user?.warehouseId]);

  // Filter & Search logic
  const filteredOrders = useMemo(() => {
    return scopedOrders
      .filter(po => {
        const matchesSearch =
          po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          po.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          po.warehouseName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === 'ALL' ||
          po.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [scopedOrders, searchQuery, statusFilter]);

  // Approve Requisition Handler
  const handleApprove = async (id) => {
    try {
      const response = await purchaseOrderApi.approve(id);
      if (response.isSuccess) {
        showToast('Purchase order approved and status updated to active!', 'success');
        fetchOrders();
      } else {
        showToast(response.message || 'Failed to approve purchase order', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to approve purchase order', 'error');
    }
  };

  // Cancel Requisition Handler
  const handleCancel = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to cancel this purchase order?')) return;
    try {
      const response = await purchaseOrderApi.cancel(id);
      if (response.isSuccess) {
        showToast('Purchase order cancelled successfully', 'success');
        fetchOrders();
      } else {
        showToast(response.message || 'Failed to cancel purchase order', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to cancel purchase order', 'error');
    }
  };

  // Raise / Generate PO Handler
  const handleCreateSubmit = async (payload) => {
    try {
      const response = await purchaseOrderApi.generate(payload);
      if (response.isSuccess) {
        showToast(`Purchase order generated successfully: ${response.data?.poNumber || ''}`, 'success');
        fetchOrders();
      } else {
        showToast(response.message || 'Failed to generate purchase order', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to raise purchase order', 'error');
      throw err; // bubble error to modal loader
    }
  };

  // Receive Deliveries Handler
  const handleReceiveSubmit = async (id, payload) => {
    try {
      const response = await purchaseOrderApi.receive(id, payload);
      if (response.isSuccess) {
        showToast('Intake registered successfully! Warehouse quantities incremented.', 'success');
        fetchOrders();
      } else {
        showToast(response.message || 'Failed to record intake delivery', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to receive stock delivery', 'error');
      throw err; // bubble error to modal loader
    }
  };

  const triggerReceive = (po) => {
    setSelectedPO(po);
    setReceiveOpen(true);
  };

  const triggerViewDetails = (id) => {
    setDetailPoId(id);
    setDetailOpen(true);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col gap-5">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-pulse">
          <div className="space-y-2.5">
            <div className="h-7 w-52 bg-gray-200 rounded-xl"></div>
            <div className="h-3 w-80 bg-gray-100 rounded-lg"></div>
          </div>
          <div className="h-9 w-36 bg-gray-200 rounded-xl"></div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100/70 border border-gray-100 rounded-2xl h-20"></div>
          ))}
        </div>

        {/* Toolbar skeleton */}
        <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm h-14 w-full animate-pulse"></div>

        {/* Table skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-[380px] w-full animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-lg font-bold">⚠️</div>
        <h3 className="text-base font-bold text-gray-800">Connection Failed</h3>
        <p className="text-xs font-semibold text-gray-400 max-w-sm leading-normal">{error}</p>
        <button
          onClick={fetchAllData}
          className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all border-none cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col gap-5 relative">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5 tracking-tight">
            Purchase Orders
            <span className="text-[12px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full border border-blue-100">
              {filteredOrders.length} records
            </span>
            {userRole === 'WarehouseManager' && (
              <span className="text-[10px] bg-emerald-50 text-emerald-600 font-black px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Warehouse Intake Mode
              </span>
            )}
          </h1>
          <p className="text-[11px] font-bold text-gray-400 mt-0.5 tracking-wide uppercase">
            Procurement Requisitions, Approvals, Status tracking & Warehouse Delivery Receipts
          </p>
        </div>
      </div>

      {/* KPI Stats Panel */}
      <PurchaseOrdersStats orders={scopedOrders} userRole={userRole} />

      {/* Toolbar Search & Status Pills */}
      <PurchaseOrdersToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        userRole={userRole}
        onOpenCreate={() => setCreateOpen(true)}
      />

      {/* Data Table */}
      <PurchaseOrdersTable
        orders={filteredOrders}
        userRole={userRole}
        onApprove={handleApprove}
        onCancel={handleCancel}
        onReceive={triggerReceive}
        onViewDetails={triggerViewDetails}
      />

      {/* Create / Generate Requisition Modal */}
      <GeneratePurchaseOrderModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        suppliers={suppliers}
        warehouses={warehouses}
        products={products}
        onSubmit={handleCreateSubmit}
      />

      {/* Intake Receive Modal */}
      <ReceivePurchaseOrderModal
        isOpen={receiveOpen}
        onClose={() => setReceiveOpen(false)}
        selectedPO={selectedPO}
        onSubmit={handleReceiveSubmit}
      />

      {/* Detailed PO Requisition File Modal */}
      <PurchaseOrderDetailModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        purchaseOrderId={detailPoId}
        userRole={userRole}
        onReceive={(po) => {
          setDetailOpen(false);
          triggerReceive(po);
        }}
      />

      {/* Toast Alert overlay */}
      <div className={`toast-card ${toast.type} ${toast.show ? 'show' : ''}`}>
        <div className="toast-icon-wrapper">
          {toast.type === 'error' ? (
            <svg className="toast-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="toast-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="toast-content">
          <div className="toast-title">{toast.type === 'error' ? 'Error' : 'Success'}</div>
          <div className="toast-message">{toast.msg}</div>
        </div>
        <div className="toast-progress" />
      </div>

    </div>
  );
};

export default PurchaseOrdersPage;
