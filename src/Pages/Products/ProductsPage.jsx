import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import StatCard from '../../Components/Dashboard/StatCard';
import productApi from '../../api/product.api';
import supplierApi from '../../api/supplier.api';
import apiClient from '../../api/apiClient';
import DemandForecastModal from '../../Components/Dashboard/DemandForecastModal';
import ProductsToolbar from './Components/ProductsToolbar';
import ProductsTable from './Components/ProductsTable';
import ProductFormModal from './Components/ProductFormModal';
import ReorderConfigModal from './Components/ReorderConfigModal';

const ProductsPage = () => {
  const user = useSelector((s) => s.auth.user);
  const isAdmin = user?.role === 'Admin';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [isForecastOpen, setIsForecastOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [forecastingProduct, setForecastingProduct] = useState(null);

  // Toast notification
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 4000);
  };

  // Custom Confirmation Modal
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', confirmLabel: 'Confirm', onConfirm: null });

  const requestConfirm = (title, message, onConfirm, confirmLabel = 'Confirm') => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmLabel,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(s => ({ ...s, isOpen: false }));
      }
    });
  };

  const closeConfirmModal = () => setConfirmModal(s => ({ ...s, isOpen: false }));

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, suppliersRes, catRes] = await Promise.all([
        productApi.getAll(),
        supplierApi.getAll(),
        apiClient.get('/Categories/all')
      ]);

      setProducts(prodRes?.data?.items || prodRes?.data || []);
      setSuppliers(suppliersRes?.data || suppliersRes || []);
      const rawCategories = catRes?.data?.data || catRes?.data || [];

      const flattenCategories = (cats) => {
        const result = [];
        const traverse = (items) => {
          if (!Array.isArray(items)) return;
          items.forEach((item) => {
            result.push(item);
            if (item.children && item.children.length > 0) {
              traverse(item.children);
            }
          });
        };
        traverse(cats);
        return result;
      };

      setCategories(flattenCategories(rawCategories));
    } catch (err) {
      console.error('Fetch products data error:', err);
      setError(err.response?.data?.message || 'Failed to fetch products data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddForm = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const openEditForm = async (p) => {
    try {
      const response = await productApi.getById(p.id);
      const detail = response?.data || p;
      setEditingProduct(detail);
      setIsFormOpen(true);
    } catch (err) {
      console.error("Failed to load product details for edit:", err);
      showToast("Failed to load product details.", "error");
    }
  };

  const openReorderForm = async (p) => {
    try {
      const response = await productApi.getById(p.id);
      const detail = response?.data || p;
      setEditingProduct(detail);
      setIsReorderOpen(true);
    } catch (err) {
      console.error("Failed to load product details for reorder config:", err);
      showToast("Failed to load product details.", "error");
    }
  };

  const handleProductFormSubmit = async (payload) => {
    try {
      if (editingProduct) {
        await productApi.update(editingProduct.id, payload);
        showToast('Product updated successfully!', 'success');
      } else {
        await productApi.create(payload);
        showToast('Product created successfully!', 'success');
      }
      setIsFormOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to save product.', 'error');
    }
  };

  const handleReorderFormSubmit = async (payload) => {
    try {
      await productApi.updateReorder(editingProduct.id, payload);
      showToast('Reorder rule updated successfully!', 'success');
      setIsReorderOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update reorder rule.', 'error');
    }
  };

  const handleDelete = (id) => {
    requestConfirm(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.',
      async () => {
        try {
          await productApi.delete(id);
          showToast('Product deleted successfully!', 'success');
          fetchData();
        } catch (err) {
          console.error(err);
          showToast(err.response?.data?.message || 'Failed to delete product.', 'error');
        }
      },
      'Yes, Delete'
    );
  };

  const processedProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === 'ALL' ||
        p.categoryId === Number(selectedCategory);

      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6 select-none animate-fade-in overflow-y-auto min-h-[calc(100vh-4rem)] relative">
      {/* Toast */}
      {toast.show && (
        <div className={`toast-card show ${toast.type}`}>
          <div className="toast-icon-wrapper">
            <svg className="toast-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="toast-content">
            <div className="toast-title">{toast.type === 'error' ? 'System Error' : 'Success'}</div>
            <div className="toast-message">{toast.msg}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Products Management</h1>
          <p className="text-[11px] font-bold text-slate-400 mt-0.5 tracking-wide uppercase">
            Configure catalogs, safety thresholds, and replenishment parameters
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openAddForm}
            className="px-4.5 py-2.5 bg-black hover:bg-zinc-900 text-white font-bold text-xs rounded-xl transition-all duration-200 flex items-center gap-2 border-none cursor-pointer active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Product
          </button>
        )}
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" /></svg>}
          label="Total Products"
          value={products.length.toString()}
          trend="Live DB Sync"
          trendType="neutral"
          color="blue"
        />
        <StatCard
          icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /></svg>}
          label="Categories"
          value={categories.length.toString()}
          trend="System catalog"
          trendType="neutral"
          color="green"
        />
        <StatCard
          icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>}
          label="Active Suppliers"
          value={suppliers.length.toString()}
          trend="Verified channels"
          trendType="neutral"
          color="amber"
        />
        <StatCard
          icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}
          label="Perishable Goods"
          value={products.filter(p => p.isPerishable).length.toString()}
          trend="Requires tracking"
          trendType="neutral"
          color="red"
        />
      </div>

      {/* Toolbar */}
      <ProductsToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
      />

      {/* Main Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200/85 p-6 rounded-2xl text-center">
          <p className="text-red-700 font-bold text-[14px]">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4.5 py-2 bg-red-600 text-white rounded-xl text-[12.5px] font-bold shadow-sm"
          >
            Retry
          </button>
        </div>
      ) : (
        <ProductsTable
          processedProducts={processedProducts}
          categories={categories}
          isAdmin={isAdmin}
          onForecast={(p) => {
            setForecastingProduct(p);
            setIsForecastOpen(true);
          }}
          onReorderConfig={openReorderForm}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />
      )}

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <ProductFormModal
          editingProduct={editingProduct}
          categories={categories}
          suppliers={suppliers}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleProductFormSubmit}
        />
      )}

      {/* Reorder Config Modal */}
      {isReorderOpen && (
        <ReorderConfigModal
          editingProduct={editingProduct}
          onClose={() => setIsReorderOpen(false)}
          onSubmit={handleReorderFormSubmit}
        />
      )}

      {/* AI Demand Forecast Modal */}
      {isForecastOpen && forecastingProduct && (
        <DemandForecastModal
          productId={forecastingProduct.id}
          productName={forecastingProduct.name}
          onClose={() => {
            setIsForecastOpen(false);
            setForecastingProduct(null);
          }}
        />
      )}

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
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
              <p className="text-slate-650 text-[12.5px] font-semibold leading-relaxed">{confirmModal.message}</p>
            </div>
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2.5">
              <button type="button" onClick={closeConfirmModal} className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-xl text-[11px] font-black uppercase tracking-wider cursor-pointer transition-all duration-150 active:scale-95">Cancel</button>
              <button type="button" onClick={confirmModal.onConfirm} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[11px] font-black uppercase tracking-wider cursor-pointer transition-all duration-150 active:scale-95">{confirmModal.confirmLabel}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductsPage;
