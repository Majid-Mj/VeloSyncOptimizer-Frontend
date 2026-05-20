import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import stockApi from '../../api/stock.api';
import warehouseApi from '../../api/warehouse.api';
import productApi from '../../api/product.api';

import WarehouseComparison from './WarehouseComparison';
import TransferForm from './TransferForm';
import RecentTransfersList from './RecentTransfersList';

const TransferStockPage = () => {
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  // Lists from API
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [stockLevels, setStockLevels] = useState([]);
  const [movements, setMovements] = useState([]);

  // Loading/Operation states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  // Form selections
  const [selectedProductId, setSelectedProductId] = useState('');
  const [sourceWarehouseId, setSourceWarehouseId] = useState('');
  const [destWarehouseId, setDestWarehouseId] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [notes, setNotes] = useState('');

  // Show dynamic toast helper
  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 4000);
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [whRes, prodRes, stockRes, movRes] = await Promise.all([
        warehouseApi.getAll(),
        productApi.getAll({ pageSize: 100 }),
        stockApi.getAll(),
        stockApi.getMovements({ pageSize: 20 })
      ]);

      if (whRes.isSuccess) setWarehouses(whRes.data || []);
      if (prodRes.isSuccess) setProducts(prodRes.data?.items || []);
      if (stockRes.isSuccess) setStockLevels(stockRes.data || []);
      if (movRes.isSuccess) {
        const transferMovs = (movRes.data?.items || []).filter(item => 
          item.movementType?.toLowerCase().includes('transfer') || 
          item.notes?.toLowerCase().includes('transfer')
        );
        setMovements(transferMovs.slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching stock transfer page data:', err);
      showToast('Failed to load warehouses or products.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Set default selections once data is loaded
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id.toString());
    }
  }, [products]);

  useEffect(() => {
    if (warehouses.length > 0) {
      const isManager = user?.role === 'WarehouseManager';
      const managerWhId = user?.warehouseId;

      if (!sourceWarehouseId) {
        if (isManager && managerWhId) {
          setSourceWarehouseId(managerWhId.toString());
        } else {
          setSourceWarehouseId(warehouses[0].id.toString());
        }
      }
      if (!destWarehouseId && warehouses.length > 1) {
        const defaultSourceId = isManager && managerWhId ? managerWhId : warehouses[0].id;
        const availableDest = warehouses.find(w => w.id !== Number(defaultSourceId));
        if (availableDest) {
          setDestWarehouseId(availableDest.id.toString());
        } else {
          setDestWarehouseId(warehouses[1].id.toString());
        }
      }
    }
  }, [warehouses, user]);

  // Helper selectors
  const getProductStockInWarehouse = (pId, wId) => {
    const level = stockLevels.find(
      s => s.productId === Number(pId) && s.warehouseId === Number(wId)
    );
    return level ? level.quantityOnHand : 0;
  };

  const getProductAvailableInWarehouse = (pId, wId) => {
    const level = stockLevels.find(
      s => s.productId === Number(pId) && s.warehouseId === Number(wId)
    );
    return level ? (level.quantityOnHand - level.quantityReserved) : 0;
  };

  const getProductReorderPointInWarehouse = (pId, wId) => {
    const level = stockLevels.find(
      s => s.productId === Number(pId) && s.warehouseId === Number(wId)
    );
    return level ? level.reorderPoint : 0;
  };

  const getWarehouseCapacityPercentage = (wId) => {
    const wh = warehouses.find(w => w.id === Number(wId));
    if (!wh) return 0;
    const totalStock = stockLevels
      .filter(s => s.warehouseId === Number(wId))
      .reduce((sum, s) => sum + (s.quantityOnHand || 0), 0);
    const capacity = wh.totalCapacity || 1000;
    return Math.min(100, Math.round((totalStock / capacity) * 100));
  };

  // Swap source & dest warehouses
  const handleSwap = () => {
    const temp = sourceWarehouseId;
    setSourceWarehouseId(destWarehouseId);
    setDestWarehouseId(temp);
  };

  // Adjust quantity
  const handleQuantityAdjust = (amount) => {
    setQuantity(prev => {
      const current = Number(prev) || 0;
      return Math.max(1, current + amount).toString();
    });
  };

  // Form Submit Execution
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProductId || !sourceWarehouseId || !destWarehouseId) {
      showToast('Please select all required fields.', 'error');
      return;
    }

    if (sourceWarehouseId === destWarehouseId) {
      showToast('Source and Destination warehouse cannot be the same.', 'error');
      return;
    }

    const qtyNum = Number(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      showToast('Transfer quantity must be greater than zero.', 'error');
      return;
    }

    const available = getProductAvailableInWarehouse(selectedProductId, sourceWarehouseId);
    if (qtyNum > available) {
      showToast(`Transfer quantity exceeds available stock (${available} units).`, 'error');
      return;
    }

    setSubmitting(true);

    const sourceWh = warehouses.find(w => w.id === Number(sourceWarehouseId));
    const destWh = warehouses.find(w => w.id === Number(destWarehouseId));

    const payload = {
      productId: Number(selectedProductId),
      sourceWarehouseId: Number(sourceWarehouseId),
      destWarehouseId: Number(destWarehouseId),
      quantity: qtyNum,
      notes: notes || `Internal Warehouse Transfer from ${sourceWh?.code || 'Source'} to ${destWh?.code || 'Destination'} by ${user?.fullName || 'Manager'}`
    };

    try {
      const res = await stockApi.transfer(payload);
      if (res.isSuccess) {
        showToast(`Stock transfer completed! Code: ${res.data?.transferNumber || 'TRF-SUCCESS'}`, 'success');
        setQuantity('100');
        setNotes('');
        // Reload all stock levels and recent list
        const [stockRes, movRes] = await Promise.all([
          stockApi.getAll(),
          stockApi.getMovements({ pageSize: 20 })
        ]);
        if (stockRes.isSuccess) setStockLevels(stockRes.data || []);
        if (movRes.isSuccess) {
          const transferMovs = (movRes.data?.items || []).filter(item => 
            item.movementType?.toLowerCase().includes('transfer') || 
            item.notes?.toLowerCase().includes('transfer')
          );
          setMovements(transferMovs.slice(0, 5));
        }
      } else {
        throw new Error(res.message || 'Failed to transfer stock');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || err.message || 'Failed to dispatch stock transfer.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500 font-semibold animate-pulse">
        🔄 Loading transfer workspace configuration...
      </div>
    );
  }

  // Active product details
  const activeProduct = products.find(p => p.id === Number(selectedProductId));
  const activeProductName = activeProduct?.name || 'Selected Product';

  // Capacity classes & metrics
  const sourceWh = warehouses.find(w => w.id === Number(sourceWarehouseId));
  const destWh = warehouses.find(w => w.id === Number(destWarehouseId));

  const sourceCapacity = getWarehouseCapacityPercentage(sourceWarehouseId);
  const destCapacity = getWarehouseCapacityPercentage(destWarehouseId);

  const getCapacityStyle = (pct) => {
    if (pct > 80) {
      return { 
        border: 'border-red-200', 
        bg: 'bg-red-50/50', 
        labelColor: 'text-red-800', 
        barColor: 'bg-red-500', 
        status: 'Overstocked' 
      };
    }
    if (pct >= 50) {
      return { 
        border: 'border-amber-200', 
        bg: 'bg-amber-50/50', 
        labelColor: 'text-amber-800', 
        barColor: 'bg-amber-500', 
        status: 'Moderate capacity' 
      };
    }
    return { 
      border: 'border-emerald-200', 
      bg: 'bg-emerald-50/50', 
      labelColor: 'text-emerald-800', 
      barColor: 'bg-emerald-500', 
      status: 'Available space' 
    };
  };

  const srcCapStyle = getCapacityStyle(sourceCapacity);
  const dstCapStyle = getCapacityStyle(destCapacity);

  // Preview Quantities
  const sourceStockNow = getProductStockInWarehouse(selectedProductId, sourceWarehouseId);
  const destStockNow = getProductStockInWarehouse(selectedProductId, destWarehouseId);
  const qtyToMove = Number(quantity) || 0;

  const sourceStockAfter = sourceStockNow - qtyToMove;
  const destStockAfter = destStockNow + qtyToMove;

  const sourceReorderPoint = getProductReorderPointInWarehouse(selectedProductId, sourceWarehouseId);
  const destReorderPoint = getProductReorderPointInWarehouse(selectedProductId, destWarehouseId);

  const sourceBelowRP = sourceStockAfter <= sourceReorderPoint;
  const destMeetsRP = destStockAfter > destReorderPoint;

  // Render recent transfers route parsing
  const parseTransferRoute = (item) => {
    if (item.notes) {
      const match = item.notes.match(/Transfer from (.*?) to (.*?)(?: by|$)/i);
      if (match) {
        return `${match[1]} ➔ ${match[2]}`;
      }
    }
    return item.warehouseName || 'Warehouse';
  };

  const parseOperator = (item) => {
    if (item.notes && item.notes.includes('by ')) {
      const parts = item.notes.split('by ');
      return `by ${parts[parts.length - 1]}`;
    }
    return 'by System';
  };

  const timeAgo = (dateStr) => {
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval}y ago`;
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval}mo ago`;
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval}d ago`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval}h ago`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval}m ago`;
    return 'Just now';
  };

  return (
    <div className="p-4 flex flex-col h-[calc(100vh-4.1rem)] overflow-hidden box-border">

      {/* Page Header */}
      <div className="mb-2 flex-shrink-0">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 flex items-center gap-1.5 tracking-tight">
            Transfer stock
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
            </span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider uppercase">
            Move stock between warehouses — both dashboards update live via SignalR
          </p>
        </div>
      </div>

      {/* WAREHOUSE COMPARISON WIDGET */}
      <WarehouseComparison
        sourceWh={sourceWh}
        destWh={destWh}
        activeProductName={activeProductName}
        sourceStockNow={sourceStockNow}
        destStockNow={destStockNow}
        sourceCapacity={sourceCapacity}
        destCapacity={destCapacity}
        srcCapStyle={srcCapStyle}
        dstCapStyle={dstCapStyle}
      />

      <div className="flex gap-4 flex-1 items-start min-h-0 justify-start">
        {/* CARD 1: TRANSFER FORM */}
        <div className="w-[450px] h-[500px] flex-shrink-0">
          <TransferForm
            isManager={user?.role === 'WarehouseManager'}
            products={products}
            warehouses={warehouses}
            selectedProductId={selectedProductId}
            setSelectedProductId={setSelectedProductId}
            sourceWarehouseId={sourceWarehouseId}
            setSourceWarehouseId={setSourceWarehouseId}
            destWarehouseId={destWarehouseId}
            setDestWarehouseId={setDestWarehouseId}
            quantity={quantity}
            setQuantity={setQuantity}
            notes={notes}
            setNotes={setNotes}
            submitting={submitting}
            handleSubmit={handleSubmit}
            handleSwap={handleSwap}
            handleQuantityAdjust={handleQuantityAdjust}
            getProductStockInWarehouse={getProductStockInWarehouse}
            qtyToMove={qtyToMove}
            sourceWh={sourceWh}
            destWh={destWh}
            sourceStockNow={sourceStockNow}
            destStockNow={destStockNow}
            sourceStockAfter={sourceStockAfter}
            destStockAfter={destStockAfter}
            sourceReorderPoint={sourceReorderPoint}
            destReorderPoint={destReorderPoint}
            sourceBelowRP={sourceBelowRP}
            destMeetsRP={destMeetsRP}
            onCancel={() => navigate('/dashboard/stock-movement')}
          />
        </div>

        {/* CARD 2: RECENT TRANSFERS */}
        <div className="w-[450px] h-[500px] flex-shrink-0">
          <RecentTransfersList
            movements={movements}
            parseTransferRoute={parseTransferRoute}
            parseOperator={parseOperator}
            timeAgo={timeAgo}
            onViewAll={() => navigate('/dashboard/stock-movement')}
          />
        </div>
      </div>

      {/* Toast Alert */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4.5 py-3.5 rounded-xl shadow-lg border animate-slide-in text-xs font-bold ${
          toast.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
            : 'bg-red-50 text-red-700 border-red-100'
        }`}>
          <span>{toast.type === 'success' ? '✓' : '⚠'}</span>
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
};

export default TransferStockPage;
