import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import StockMovementsStats from './StockMovementsStats';
import StockMovementsToolbar from './StockMovementsToolbar';
import StockMovementsTable from './StockMovementsTable';
import PendingTransfersTable from './PendingTransfersTable';
import ReceiveTransferModal from './ReceiveTransferModal';
import stockApi from '../../api/stock.api';
import warehouseApi from '../../api/warehouse.api';
import productApi from '../../api/product.api';

const StockMovementsPage = () => {
  const navigate = useNavigate();
  // User context & Auth role guards
  const user = useSelector((s) => s.auth.user);
  const userRole = user?.role || 'Guest';
  const canTransfer = userRole === 'Admin' || userRole === 'Administrator' || userRole === 'WarehouseManager';
  const isManager = userRole === 'WarehouseManager';
  const managerWarehouseId = user?.warehouseId;

  // Live API data state lists
  const [movements, setMovements] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [transfersLoading, setTransfersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('LEDGER');
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);

  // Toast notifications state
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 4000);
  };

  // Loaders & Network boundaries
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states (Server-side)
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters state (Server-side parameters)
  const [warehouseFilter, setWarehouseFilter] = useState(
    isManager && managerWarehouseId ? managerWarehouseId.toString() : 'ALL'
  );
  const [productFilter, setProductFilter] = useState('ALL');

  // Synchronize manager's warehouse lock dynamically
  useEffect(() => {
    if (isManager && managerWarehouseId) {
      setWarehouseFilter(managerWarehouseId.toString());
    }
  }, [isManager, managerWarehouseId]);

  // Trigger loading sequences
  const fetchMetadata = async () => {
    try {
      const [whRes, prodRes] = await Promise.all([
        warehouseApi.getAll(),
        productApi.getAll({ pageSize: 250 }) // Larger limit to capture all filter values
      ]);
      if (whRes.isSuccess) setWarehouses(whRes.data || []);
      setProducts(prodRes?.data?.items || prodRes?.data || []);
    } catch (err) {
      console.error('Metadata load error:', err);
    }
  };

  const fetchTransfers = async () => {
    setTransfersLoading(true);
    try {
      const params = { status: 'InTransit' };
      if (warehouseFilter !== 'ALL') {
        params.destWarehouseId = Number(warehouseFilter);
      }
      const response = await stockApi.getTransfers(params);
      if (response.isSuccess) {
        setTransfers(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch transfers:', err);
    } finally {
      setTransfersLoading(false);
    }
  };

  const fetchMovements = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        pageNumber,
        pageSize
      };

      if (warehouseFilter !== 'ALL') payload.warehouseId = Number(warehouseFilter);
      if (productFilter !== 'ALL') payload.productId = Number(productFilter);

      const response = await stockApi.getMovements(payload);

      if (response.isSuccess && response.data) {
        setMovements(response.data.items || []);
        setTotalCount(response.data.totalCount || 0);
      } else {
        setError(response.message || 'Failed to retrieve movements list');
      }
    } catch (err) {
      console.error('Movement fetch error:', err);
      setError(err.response?.data?.message || 'Failed to connect to VeloSync Stock movements API');
    } finally {
      setLoading(false);
    }
  };

  // Run on mount to fetch static dropdown data
  useEffect(() => {
    fetchMetadata();
  }, []);

  // Run on page or filter state alterations
  useEffect(() => {
    fetchMovements();
    fetchTransfers();
  }, [pageNumber, pageSize, warehouseFilter, productFilter]);

  const handleAcceptTransfer = async (transferId) => {
    try {
      const response = await stockApi.acceptTransfer(transferId);
      if (response.isSuccess) {
        showToast('Stock transfer accepted and received successfully!', 'success');
        fetchMovements();
        fetchTransfers();
      } else {
        showToast(response.message || 'Failed to accept stock transfer', 'error');
      }
    } catch (err) {
      console.error('Accept transfer error:', err);
      showToast(err.response?.data?.message || 'Error accepting stock transfer', 'error');
    }
  };

  const handleResetFilters = () => {
    setWarehouseFilter(isManager && managerWarehouseId ? managerWarehouseId.toString() : 'ALL');
    setProductFilter('ALL');
    setPageNumber(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(totalCount / pageSize)) {
      setPageNumber(newPage);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  if (loading && movements.length === 0) {
    return (
      <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col gap-6">
        {/* Header Shimmer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-pulse">
          <div className="space-y-3">
            <div className="h-8 w-64 bg-slate-200/80 rounded-2xl"></div>
            <div className="h-3.5 w-96 bg-slate-100 rounded-xl"></div>
          </div>
        </div>

        {/* Stats Shimmer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-50/70 border border-[#eff1f5] rounded-3xl h-24"></div>
          ))}
        </div>

        {/* Toolbar Shimmer */}
        <div className="bg-white rounded-3xl p-5 border border-[#eff1f5] shadow-xs h-20 w-full animate-pulse"></div>

        {/* Table Shimmer */}
        <div className="bg-white rounded-3xl border border-[#eff1f5] shadow-xs h-[420px] w-full animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center text-xl font-bold animate-bounce shadow-sm">⚠️</div>
        <h3 className="text-base font-black text-slate-805 uppercase tracking-wide">Audit Ledger Connection Failed</h3>
        <p className="text-xs font-semibold text-slate-400 max-w-sm leading-normal">{error}</p>
        <button
          onClick={fetchMovements}
          className="px-5 py-2.5 bg-[#704efe] hover:bg-[#5c3edd] text-white font-black text-xs rounded-2xl shadow-md transition-all border-none cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const assignedWarehouse = isManager && managerWarehouseId
    ? warehouses.find(w => w.id.toString() === managerWarehouseId.toString())
    : null;

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col gap-6 relative">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-805 flex items-center gap-2.5 tracking-tight uppercase">
            Stock Movements
            <span className="text-[10px] font-black bg-[#f0ebff] border border-indigo-150 text-[#704efe] px-2.5 py-1 rounded-full uppercase tracking-wider">
              {totalCount} events logged
            </span>
          </h1>
          <p className="text-[10px] font-bold text-slate-450 mt-1 tracking-wider uppercase leading-none">
            {assignedWarehouse
              ? `Live Stock Ledger Trail for ${assignedWarehouse.name} (${assignedWarehouse.code})`
              : 'Live Stock Ledger Trail — Receivals, Shipments, Transfers & Adjustments'
            }
          </p>
        </div>
        {canTransfer && (
          <button
            onClick={() => navigate('/dashboard/stock-movement/transfer')}
            className="px-4.5 py-2.5 bg-[#704efe] hover:bg-[#5c3edd] text-white font-black text-[11px] uppercase tracking-wider rounded-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto border-none cursor-pointer shadow-md shadow-indigo-100/30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Transfer Stock
          </button>
        )}
      </div>

      {/* Stats Summary Cards */}
      <StockMovementsStats totalCount={totalCount} currentItems={movements} />

      {/* Filter and Settings toolbar */}
      <StockMovementsToolbar
        warehouseFilter={warehouseFilter}
        setWarehouseFilter={(val) => { setWarehouseFilter(val); setPageNumber(1); }}
        productFilter={productFilter}
        setProductFilter={(val) => { setProductFilter(val); setPageNumber(1); }}
        pageSize={pageSize}
        setPageSize={(val) => { setPageSize(val); setPageNumber(1); }}
        warehouses={warehouses}
        products={products}
        onReset={handleResetFilters}
      />

      {/* Tab Switcher */}
      <div className="flex border-b border-[#eff1f5] gap-6 mb-2">
        <button
          onClick={() => setActiveTab('LEDGER')}
          className={`pb-3 text-xs font-black uppercase tracking-wider px-2 transition-all border-b-2 cursor-pointer bg-transparent border-none ${activeTab === 'LEDGER'
              ? 'border-[#704efe] text-[#704efe]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
        >
          Ledger History ({totalCount})
        </button>
        <button
          onClick={() => setActiveTab('PENDING_TRANSFERS')}
          className={`pb-3 text-xs font-black uppercase tracking-wider px-2 transition-all border-b-2 cursor-pointer bg-transparent border-none flex items-center gap-2 ${activeTab === 'PENDING_TRANSFERS'
              ? 'border-[#704efe] text-[#704efe]'
              : 'border-transparent text-slate-400 hover:text-slate-655'
            }`}
        >
          Pending Incoming Transfers
          {transfers.length > 0 && (
            <span className="bg-[#df1c41] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
              {transfers.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'LEDGER' ? (
        <>
          {/* Movements Table grid */}
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-xs z-10 flex items-center justify-center rounded-3xl">
                <div className="flex items-center gap-2.5 px-4.5 py-3.5 bg-white/95 shadow-xl border border-[#eff1f5] rounded-2xl text-xs font-black text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#704efe] animate-pulse"></span>
                  Synchronizing Ledger Trail...
                </div>
              </div>
            )}
            <StockMovementsTable movements={movements} />
          </div>

          {/* Pagination Controls Footer */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#eff1f5] bg-transparent px-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                Showing page <span className="text-slate-805 font-extrabold">{pageNumber}</span> of <span className="text-slate-805 font-extrabold">{totalPages}</span> — {totalCount.toLocaleString()} total logged events
              </p>

              <div className="flex items-center gap-1.5">
                {/* Prev Button */}
                <button
                  onClick={() => handlePageChange(pageNumber - 1)}
                  disabled={pageNumber === 1}
                  className="w-8.5 h-8.5 border border-[#eff1f5] rounded-2xl bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center shadow-3xs"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Pagination numbers range */}
                {[...Array(totalPages)].map((_, i) => {
                  const pageIdx = i + 1;
                  const isCurrent = pageNumber === pageIdx;

                  // Only render adjacent page buttons to avoid overflow
                  if (pageIdx === 1 || pageIdx === totalPages || Math.abs(pageIdx - pageNumber) <= 1) {
                    return (
                      <button
                        key={pageIdx}
                        onClick={() => handlePageChange(pageIdx)}
                        className={`w-8.5 h-8.5 text-xs font-black rounded-2xl border transition-all cursor-pointer flex items-center justify-center shadow-3xs ${isCurrent
                          ? 'bg-[#704efe] border-[#704efe] text-white scale-105'
                          : 'bg-white border-[#eff1f5] text-slate-500 hover:text-slate-805 hover:bg-slate-50'
                          }`}
                      >
                        {pageIdx}
                      </button>
                    );
                  }

                  if (pageIdx === 2 || pageIdx === totalPages - 1) {
                    return <span key={pageIdx} className="text-slate-300 text-xs px-1.5 font-bold">...</span>;
                  }

                  return null;
                })}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(pageNumber + 1)}
                  disabled={pageNumber === totalPages}
                  className="w-8.5 h-8.5 border border-[#eff1f5] rounded-2xl bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center shadow-3xs"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <PendingTransfersTable
          transfers={transfers}
          loading={transfersLoading}
          userRole={userRole}
          managerWarehouseId={managerWarehouseId}
          onIntake={(transfer) => {
            setSelectedTransfer(transfer);
            setIsIntakeModalOpen(true);
          }}
        />
      )}

      <ReceiveTransferModal
        isOpen={isIntakeModalOpen}
        onClose={() => {
          setIsIntakeModalOpen(false);
          setSelectedTransfer(null);
        }}
        transfer={selectedTransfer}
        onSubmit={handleAcceptTransfer}
      />

      {/* ── Toast Alerts ── */}
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

export default StockMovementsPage;
