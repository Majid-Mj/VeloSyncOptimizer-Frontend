import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import StockLevelsStats from './StockLevelsStats';
import StockLevelsToolbar from './StockLevelsToolbar';
import StockLevelsTable from './StockLevelsTable';
import AdjustStockModal from './AdjustStockModal';
import TransferStockModal from './TransferStockModal';
import stockApi from '../../api/stock.api';
import warehouseApi from '../../api/warehouse.api';
import productApi from '../../api/product.api';

const StockLevelsPage = () => {
  const user = useSelector((s) => s.auth.user);
  const userRole = user?.role || 'Guest';

  // Core API loaded states
  const [stockLevels, setStockLevels] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Loading & Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NAME');

  // Modal control states
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  // Toast notifications state
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  const showToast = (msg, type = '') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 4000);
  };

  // Centralized fetching operation
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Parallel fetches for optimum speed
      const [stockRes, whRes, prodRes] = await Promise.all([
        stockApi.getAll(),
        warehouseApi.getAll(),
        productApi.getAll({ pageSize: 100 })
      ]);

      if (stockRes.isSuccess && whRes.isSuccess) {
        setStockLevels(stockRes.data || []);
        setWarehouses(whRes.data || []);
        setProducts(prodRes?.data?.items || prodRes?.data || []);
      } else {
        setError(stockRes.message || whRes.message || 'Failed to load stock data');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to connect to VeloSync Stock APIs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Aggregate stats from live list
  const stats = useMemo(() => {
    const totalSkus = new Set(stockLevels.map(s => s.productId)).size;
    const totalOnHand = stockLevels.reduce((acc, cur) => acc + cur.quantityOnHand, 0);
    const lowStockCount = stockLevels.filter(s => s.stockStatus === 'LOW_STOCK' || (s.quantityOnHand - s.quantityReserved) <= s.reorderPoint).length;
    const outOfStockCount = stockLevels.filter(s => s.quantityOnHand <= 0).length;

    return { totalSkus, totalOnHand, lowStockCount, outOfStockCount };
  }, [stockLevels]);

  // Search, Filter, and Sort logic
  const processedStock = useMemo(() => {
    return stockLevels
      .filter((item) => {
        const matchesSearch = 
          item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.warehouseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.warehouseCode.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesWarehouse = 
          warehouseFilter === 'ALL' || 
          item.warehouseId === Number(warehouseFilter);

        const currentAvailable = item.quantityOnHand - item.quantityReserved;
        const matchesStatus = 
          statusFilter === 'ALL' ||
          (statusFilter === 'OUT_OF_STOCK' && item.quantityOnHand <= 0) ||
          (statusFilter === 'LOW_STOCK' && (item.stockStatus === 'LOW_STOCK' || currentAvailable <= item.reorderPoint)) ||
          (statusFilter === 'IN_STOCK' && item.quantityOnHand > 0 && currentAvailable > item.reorderPoint);

        return matchesSearch && matchesWarehouse && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'NAME') return a.productName.localeCompare(b.productName);
        if (sortBy === 'SKU') return a.sku.localeCompare(b.sku);
        if (sortBy === 'AVAIL_DESC') return b.quantityAvailable - a.quantityAvailable;
        if (sortBy === 'AVAIL_ASC') return a.quantityAvailable - b.quantityAvailable;
        return 0;
      });
  }, [stockLevels, searchQuery, warehouseFilter, statusFilter, sortBy]);

  // Adjust Stock API Handler
  const handleAdjustSubmit = async (payload) => {
    try {
      const response = await stockApi.adjust(payload);
      if (response.isSuccess) {
        showToast('Inventory level adjusted successfully', 'success');
        fetchData(); // Refresh list to get current database stats
      } else {
        showToast(response.message || 'Failed to adjust stock level', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to apply stock adjustment', 'error');
    }
  };

  // Transfer Stock API Handler
  const handleTransferSubmit = async (payload) => {
    try {
      const response = await stockApi.transfer(payload);
      if (response.isSuccess) {
        showToast(`Stock transfer completed! Code: ${response.data?.transferNumber || ''}`, 'success');
        fetchData(); // Refresh list
      } else {
        showToast(response.message || 'Failed to execute transfer', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to transfer stock', 'error');
    }
  };

  const triggerAdjust = (item = null) => {
    setSelectedItem(item);
    setAdjustOpen(true);
  };

  const triggerTransfer = (item) => {
    setSelectedItem(item);
    setTransferOpen(true);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col gap-5">
        {/* Shimmering Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-pulse">
          <div className="space-y-2.5">
            <div className="h-7 w-48 bg-gray-200 rounded-xl"></div>
            <div className="h-3 w-72 bg-gray-100 rounded-lg"></div>
          </div>
          <div className="h-9 w-36 bg-gray-200 rounded-xl"></div>
        </div>
        
        {/* Shimmering Stats Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100/70 border border-gray-100 rounded-2xl h-20"></div>
          ))}
        </div>

        {/* Shimmering Toolbar Skeleton */}
        <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-4 animate-pulse">
          <div className="h-9 w-full md:max-w-md bg-gray-100 rounded-xl"></div>
          <div className="flex gap-3.5">
            <div className="h-9 w-28 bg-gray-100 rounded-lg"></div>
            <div className="h-9 w-36 bg-gray-100 rounded-lg"></div>
          </div>
        </div>

        {/* Shimmering Table Skeleton */}
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
          onClick={fetchData}
          className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all border-none cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col gap-5 relative">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5 tracking-tight">
            Stock Levels
            <span className="text-[12px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full border border-blue-100">
              {processedStock.length} items
            </span>
          </h1>
          <p className="text-[11px] font-bold text-gray-400 mt-0.5 tracking-wide uppercase">
            Real-time Inventory quantities, Allocations & Safety thresholds
          </p>
        </div>
        {(userRole === 'WarehouseManager') && (
          <button
            onClick={() => triggerAdjust(null)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-100 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5 self-start sm:self-auto border-none cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Initialize Stock level
          </button>
        )}
      </div>

      {/* ── KPI Cards ── */}
      <StockLevelsStats stats={stats} />

      {/* ── Toolbar Search & Filters ── */}
      <StockLevelsToolbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        warehouseFilter={warehouseFilter}
        setWarehouseFilter={setWarehouseFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        warehouses={warehouses}
      />

      {/* ── Stock Balance Table ── */}
      <StockLevelsTable 
        stockLevels={processedStock} 
        userRole={userRole}
        onAdjust={triggerAdjust}
        onTransfer={triggerTransfer}
      />

      {/* ── Adjust Stock Modal Overlay ── */}
      <AdjustStockModal 
        isOpen={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        selectedItem={selectedItem}
        products={products}
        warehouses={warehouses}
        onSubmit={handleAdjustSubmit}
      />

      {/* ── Transfer Stock Modal Overlay ── */}
      <TransferStockModal 
        isOpen={transferOpen}
        onClose={() => setTransferOpen(false)}
        selectedItem={selectedItem}
        warehouses={warehouses}
        onSubmit={handleTransferSubmit}
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

export default StockLevelsPage;
