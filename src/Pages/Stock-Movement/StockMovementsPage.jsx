import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import StockMovementsStats from './StockMovementsStats';
import StockMovementsToolbar from './StockMovementsToolbar';
import StockMovementsTable from './StockMovementsTable';
import TransferStockModal from './TransferStockModal';
import stockApi from '../../api/stock.api';
import warehouseApi from '../../api/warehouse.api';
import productApi from '../../api/product.api';

const StockMovementsPage = () => {
  // User context & Auth role guards
  const user = useSelector((s) => s.auth.user);
  const userRole = user?.role || 'Guest';
  const canTransfer = userRole === 'Admin' || userRole === 'WarehouseManager';
  const isManager = userRole === 'WarehouseManager';
  const managerWarehouseId = user?.warehouseId;

  // Live API data state lists
  const [movements, setMovements] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  // Modal and toast notifications state
  const [transferModalOpen, setTransferModalOpen] = useState(false);
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
        productApi.getAll({ pageSize: 100 })
      ]);
      if (whRes.isSuccess) setWarehouses(whRes.data || []);
      setProducts(prodRes?.data?.items || prodRes?.data || []);
    } catch (err) {
      console.error('Metadata load error:', err);
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
  }, [pageNumber, pageSize, warehouseFilter, productFilter]);

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
      <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col gap-5">
        {/* Header Shimmer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-pulse">
          <div className="space-y-2.5">
            <div className="h-7 w-52 bg-gray-200 rounded-xl"></div>
            <div className="h-3 w-80 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
        
        {/* Stats Shimmer */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100/70 border border-gray-100 rounded-2xl h-20"></div>
          ))}
        </div>

        {/* Toolbar Shimmer */}
        <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm h-14 w-full animate-pulse"></div>

        {/* Table Shimmer */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-[380px] w-full animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-lg font-bold">⚠️</div>
        <h3 className="text-base font-bold text-gray-800">Audit Ledger Connection Failed</h3>
        <p className="text-xs font-semibold text-gray-400 max-w-sm leading-normal">{error}</p>
        <button 
          onClick={fetchMovements}
          className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all border-none cursor-pointer"
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
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col gap-5 relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5 tracking-tight">
            Stock Movements
            <span className="text-[12px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full border border-blue-100">
              {totalCount} events logged
            </span>
          </h1>
          <p className="text-[11px] font-bold text-gray-400 mt-0.5 tracking-wide uppercase">
            {assignedWarehouse 
              ? `Live Inventory Ledger Trail for ${assignedWarehouse.name} (${assignedWarehouse.code})`
              : 'Live Inventory Ledger Trail — Receivals, Shipments, Transfers & Adjustments'
            }
          </p>
        </div>
        {canTransfer && (
          <button
            onClick={() => setTransferModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[12px] rounded-xl shadow-md shadow-blue-100 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5 self-start sm:self-auto border-none cursor-pointer"
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

      {/* Movements Table grid */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/95 shadow-md border border-gray-100 rounded-xl text-xs font-bold text-gray-600 animate-pulse">
              🔄 Synchronizing Audit Logs...
            </div>
          </div>
        )}
        <StockMovementsTable movements={movements} />
      </div>

      {/* Pagination Controls Footer */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1.5 border-t border-gray-50 bg-transparent px-2">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
            Showing page <span className="text-gray-700 font-extrabold">{pageNumber}</span> of <span className="text-gray-700 font-extrabold">{totalPages}</span> — {totalCount.toLocaleString()} total entries
          </p>

          <div className="flex items-center gap-1">
            {/* Prev Button */}
            <button
              onClick={() => handlePageChange(pageNumber - 1)}
              disabled={pageNumber === 1}
              className="p-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center"
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
                    className={`px-3 py-1.5 text-xs font-extrabold rounded-lg border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-white border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageIdx}
                  </button>
                );
              }
              
              if (pageIdx === 2 || pageIdx === totalPages - 1) {
                return <span key={pageIdx} className="text-gray-300 text-xs px-1 font-bold">...</span>;
              }
              
              return null;
            })}

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(pageNumber + 1)}
              disabled={pageNumber === totalPages}
              className="p-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Modal Dialogs ── */}
      <TransferStockModal 
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        warehouses={warehouses}
        products={products}
        onSuccess={showToast}
      />

      {/* ── Toast Alerts ── */}
      {toast.show && (
        <div 
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4.5 py-3 rounded-2xl shadow-lg border text-xs font-bold text-white transition-all duration-300 animate-slide-up ${
            toast.type === 'error' ? 'bg-red-500 border-red-400' : 'bg-green-500 border-green-400'
          }`}
        >
          {toast.type === 'error' ? '⚠️' : '✅'} {toast.msg}
        </div>
      )}
    </div>
  );
};

export default StockMovementsPage;
