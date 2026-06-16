import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
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
import reorderApi from '../../api/reorder.api';

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
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');

  // Modal active states
  const [createOpen, setCreateOpen] = useState(false);
  const [prefillData, setPrefillData] = useState(null);
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

  // Custom Confirmation Modal
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', confirmLabel: 'Confirm', onConfirm: null });

  const requestConfirm = (title, message, onConfirm, confirmLabel = 'Confirm') => {
    setConfirmModal({ isOpen: true, title, message, confirmLabel, onConfirm: () => { onConfirm(); setConfirmModal(s => ({ ...s, isOpen: false })); } });
  };

  const closeConfirmModal = () => setConfirmModal(s => ({ ...s, isOpen: false }));

  const location = useLocation();

  useEffect(() => {
    if (location.state?.prefill) {
      const prefill = location.state.prefill;
      setPrefillData(prefill);
      setCreateOpen(true);

      // Fetch the product dynamically if it's not present in the loaded list
      if (prefill.productId) {
        productApi.getById(prefill.productId).then(res => {
          if (res && res.data) {
            setProducts(prev => {
              if (prev.some(p => p.id === res.data.id)) return prev;
              return [...prev, res.data];
            });
          }
        }).catch(err => console.error(err));
      }

      // Clean up the router state to avoid reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

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

        const matchesWarehouse =
          warehouseFilter === 'ALL' ||
          String(po.warehouseId) === String(warehouseFilter);

        return matchesSearch && matchesStatus && matchesWarehouse;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [scopedOrders, searchQuery, statusFilter, warehouseFilter]);

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
  const handleCancel = (id) => {
    requestConfirm(
      'Cancel Purchase Order',
      'Are you absolutely sure you want to cancel this purchase order? This action is permanent and cannot be undone.',
      async () => {
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
      },
      'Yes, Cancel PO'
    );
  };

  // Raise / Generate PO Handler
  const handleCreateSubmit = async (payload) => {
    try {
      const response = await purchaseOrderApi.generate(payload);
      if (response.isSuccess) {
        showToast(`Purchase order generated successfully: ${response.data?.poNumber || ''}`, 'success');

        // If generated from a suggestion, mark it actioned on the backend!
        if (prefillData?.suggestionId) {
          try {
            await reorderApi.markActioned(prefillData.suggestionId);
          } catch (err) {
            console.error('Error marking suggestion actioned:', err);
          }
          window.dispatchEvent(new CustomEvent('reorder-suggestions-updated'));
        }
        window.dispatchEvent(new CustomEvent('purchase-orders-updated'));

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
  const handleReceiveSubmit = async (id, payload, deliveryData) => {
    try {
      const response = await purchaseOrderApi.receive(id, payload);
      if (response.isSuccess) {
        if (deliveryData) {
          try {
            await supplierApi.recordDelivery({
              purchaseOrderId: id,
              supplierId: deliveryData.supplierId,
              actualDate: deliveryData.actualDate,
              notes: deliveryData.notes
            });
          } catch (delErr) {
            console.error('Error recording supplier delivery score metrics:', delErr);
          }
        }
        showToast('Intake registered successfully! Warehouse quantities incremented and Supplier KPIs recalculated.', 'success');
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
        warehouseFilter={warehouseFilter}
        setWarehouseFilter={setWarehouseFilter}
        warehouses={warehouses}
        userRole={userRole}
        onOpenCreate={() => {
          setPrefillData(null);
          setCreateOpen(true);
        }}
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
        prefillData={prefillData}
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

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-5 flex items-center gap-3 border-b border-slate-50 bg-slate-50/50">
              <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <svg className="w-4.5 h-4.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-800 uppercase tracking-wider">{confirmModal.title}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Please confirm this action</p>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-slate-600 text-[12px] font-medium leading-relaxed">{confirmModal.message}</p>
            </div>
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2.5">
              <button type="button" onClick={closeConfirmModal} className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-xl text-[11px] font-black uppercase tracking-wider cursor-pointer transition-all duration-150 active:scale-95">Cancel</button>
              <button type="button" onClick={confirmModal.onConfirm} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[11px] font-black uppercase tracking-wider cursor-pointer transition-all duration-150 active:scale-95">{confirmModal.confirmLabel}</button>
            </div>
          </div>
        </div>
      )}

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
