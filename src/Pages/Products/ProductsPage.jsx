import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import StatCard from '../../Components/Dashboard/StatCard';
import productApi from '../../api/product.api';
import supplierApi from '../../api/supplier.api';
import apiClient from '../../api/apiClient';
import SearchableDropdown from '../../Components/ui/SearchableDropdown';
import DemandForecastModal from '../../Components/Dashboard/DemandForecastModal';

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

  // Form inputs state
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [unitCost, setUnitCost] = useState('0');
  const [unitPrice, setUnitPrice] = useState('0');
  const [unitOfMeasure, setUnitOfMeasure] = useState('PCS');
  const [reorderQty, setReorderQty] = useState('0');
  const [safetyStockDays, setSafetyStockDays] = useState('0');
  const [leadTimeDays, setLeadTimeDays] = useState('0');
  const [isPerishable, setIsPerishable] = useState(false);
  const [shelfLifeDays, setShelfLifeDays] = useState('');

  // Toast notification
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 4000);
  };

  // Custom Confirmation Modal
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', confirmLabel: 'Confirm', onConfirm: null });

  const requestConfirm = (title, message, onConfirm, confirmLabel = 'Confirm') => {
    setConfirmModal({ isOpen: true, title, message, confirmLabel, onConfirm: () => { onConfirm(); setConfirmModal(s => ({ ...s, isOpen: false })); } });
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
    setSku('');
    setName('');
    setDescription('');
    setCategoryId(categories[0]?.id || '');
    setSupplierId(suppliers[0]?.id || '');
    setUnitCost('0');
    setUnitPrice('0');
    setUnitOfMeasure('PCS');
    setReorderQty('0');
    setSafetyStockDays('0');
    setLeadTimeDays('0');
    setIsPerishable(false);
    setShelfLifeDays('');
    setIsFormOpen(true);
  };

  const openEditForm = async (p) => {
    try {
      const response = await productApi.getById(p.id);
      const detail = response?.data || p;
      setEditingProduct(detail);
      setSku(detail.sku || '');
      setName(detail.name || '');
      setDescription(detail.description || '');
      setCategoryId(detail.categoryId || '');
      setSupplierId(detail.supplierId || '');
      setUnitCost(detail.unitCost?.toString() || '0');
      setUnitPrice(detail.unitPrice?.toString() || '0');
      setUnitOfMeasure(detail.unitOfMeasure || 'PCS');
      setReorderQty(detail.reorderQty?.toString() || '0');
      setSafetyStockDays(detail.safetyStockDays?.toString() || '0');
      setLeadTimeDays(detail.leadTimeDays?.toString() || '0');
      setIsPerishable(detail.isPerishable || false);
      setShelfLifeDays(detail.shelfLifeDays?.toString() || '');
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
      setReorderQty(detail.reorderQty?.toString() || '0');
      setSafetyStockDays(detail.safetyStockDays?.toString() || '0');
      setLeadTimeDays(detail.leadTimeDays?.toString() || '0');
      setIsReorderOpen(true);
    } catch (err) {
      console.error("Failed to load product details for reorder config:", err);
      showToast("Failed to load product details.", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sku || !name) {
      showToast('SKU and Name are required.', 'error');
      return;
    }

    const payload = {
      sku,
      name,
      description,
      categoryId: categoryId ? Number(categoryId) : null,
      supplierId: supplierId ? Number(supplierId) : null,
      unitCost: Number(unitCost),
      unitPrice: Number(unitPrice),
      unitOfMeasure,
      reorderQty: Number(reorderQty),
      safetyStockDays: Number(safetyStockDays),
      leadTimeDays: Number(leadTimeDays),
      isPerishable,
      shelfLifeDays: shelfLifeDays ? Number(shelfLifeDays) : null
    };

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

  const handleReorderSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      reorderQty: Number(reorderQty),
      safetyStockDays: Number(safetyStockDays),
      leadTimeDays: Number(leadTimeDays)
    };

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
      <div className="premium-card bg-white p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by SKU or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-[#eff1f5] rounded-2xl text-[12.5px] font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400 shadow-3xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-[#eff1f5] rounded-2xl px-4 py-2.5 text-[12.5px] font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-3xs cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

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
        <div className="premium-card bg-white overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Pricing</th>
                  <th>Reorder Rules</th>
                  <th>Type</th>
                  {isAdmin && (
                    <th className="text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {processedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="text-center py-12 text-[13px] font-semibold text-slate-400">
                      No products found matching filters.
                    </td>
                  </tr>
                ) : (
                  processedProducts.map((p) => {
                    const categoryName = categories.find((c) => c.id === p.categoryId)?.name || 'Unassigned';
                    return (
                      <tr key={p.id}>
                        <td>
                          <span className="font-mono text-[11px] font-black bg-slate-100 text-slate-650 px-2.5 py-1 rounded-xl border border-slate-200/40">
                            {p.sku}
                          </span>
                        </td>
                        <td>
                          <div className="text-[13px] font-extrabold text-slate-800">{p.name}</div>
                          <div className="text-[11px] text-slate-400 font-bold max-w-xs truncate mt-0.5">{p.description}</div>
                        </td>
                        <td className="text-[12.5px] font-extrabold text-slate-600">{categoryName}</td>
                        <td>
                          <div className="text-[12.5px] font-extrabold text-[#11121d]">
                            ₹{p.unitPrice?.toFixed(2)}
                          </div>
                          <div className="text-[11px] text-slate-400 font-bold mt-0.5">
                            Cost: ₹{p.unitCost?.toFixed(2)}
                          </div>
                        </td>
                        <td>
                          <div className="text-[12.5px] font-extrabold text-slate-700">
                            Min Qty: {p.reorderQty} {p.unitOfMeasure}
                          </div>
                          <div className="text-[11px] text-slate-400 font-bold mt-0.5">
                            Safety: {p.safetyStockDays} days | Lead: {p.leadTimeDays} days
                          </div>
                        </td>
                        <td>
                          {p.isPerishable ? (
                            <div>
                              <span className="bg-rose-50 border border-rose-100 text-rose-650 text-[10px] font-black px-2.5 py-1 rounded-xl">
                                Perishable
                              </span>
                              <div className="text-[10px] text-slate-400 font-bold mt-1.5">
                                Shelf: {p.shelfLifeDays || 0} days
                              </div>
                            </div>
                          ) : (
                            <span className="bg-slate-50 border border-[#eff1f5] text-slate-500 text-[10px] font-black px-2.5 py-1 rounded-xl">
                              Standard
                            </span>
                          )}
                        </td>
                        {isAdmin && (
                          <td>
                            <div className="flex gap-2.5 justify-end">
                              <button
                                onClick={() => {
                                  setForecastingProduct(p);
                                  setIsForecastOpen(true);
                                }}
                                title="AI Demand Forecasting"
                                className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-100/50 rounded-2xl cursor-pointer transition-all duration-150 active:scale-95"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                                </svg>
                              </button>
                              <button
                                onClick={() => openReorderForm(p)}
                                title="Update Reorder Engine Configuration"
                                className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-655 border border-indigo-100/50 rounded-2xl cursor-pointer transition-all duration-150 active:scale-95"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                              </button>
                              <button
                                onClick={() => openEditForm(p)}
                                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-650 border border-blue-100/50 rounded-2xl cursor-pointer transition-all duration-150 active:scale-95"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-650 border border-rose-100/50 rounded-2xl cursor-pointer transition-all duration-150 active:scale-95"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                {editingProduct ? 'Edit Product Details' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-650 cursor-pointer text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">SKU Code *</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    required
                    placeholder="e.g. BIKE-001"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. VeloSync Cruiser Frame"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details about dimensions, materials, or features..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SearchableDropdown
                  label="Category"
                  options={categories}
                  value={categoryId}
                  onChange={setCategoryId}
                  placeholder="Select or search category..."
                  required
                />
                <SearchableDropdown
                  label="Supplier"
                  options={suppliers}
                  value={supplierId}
                  onChange={setSupplierId}
                  placeholder="Select or search supplier..."
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Unit Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Unit Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Unit of Measure</label>
                  <input
                    type="text"
                    value={unitOfMeasure}
                    onChange={(e) => setUnitOfMeasure(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Reorder Qty</label>
                  <input
                    type="number"
                    value={reorderQty}
                    onChange={(e) => setReorderQty(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Safety Stock Days</label>
                  <input
                    type="number"
                    value={safetyStockDays}
                    onChange={(e) => setSafetyStockDays(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Lead Time Days</label>
                  <input
                    type="number"
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPerishable"
                    checked={isPerishable}
                    onChange={(e) => setIsPerishable(e.target.checked)}
                    className="w-4 h-4 rounded text-[#704efe] border-slate-300 focus:ring-indigo-500"
                  />
                  <label htmlFor="isPerishable" className="text-[12px] font-bold text-slate-650 select-none">
                    Perishable Product
                  </label>
                </div>

                {isPerishable && (
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Shelf Life (Days)</label>
                    <input
                      type="number"
                      value={shelfLifeDays}
                      onChange={(e) => setShelfLifeDays(e.target.value)}
                      placeholder="e.g. 30"
                      className="w-24 px-3 py-1.5 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4.5 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-[12px] font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 bg-black hover:bg-zinc-900 text-white rounded-xl text-[12px] font-bold cursor-pointer transition-all duration-150 active:scale-95"
                >
                  {editingProduct ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reorder Config Modal */}
      {isReorderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Reorder Engine Configuration
              </h3>
              <button
                onClick={() => setIsReorderOpen(false)}
                className="text-slate-400 hover:text-slate-650 cursor-pointer text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleReorderSubmit} className="p-6 space-y-4">
              <p className="text-[12px] font-semibold text-slate-500 leading-normal">
                Adjust replenishment configurations for <span className="text-slate-800 font-bold">{editingProduct?.name}</span>.
              </p>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  Reorder Quantity ({editingProduct?.unitOfMeasure || 'PCS'})
                </label>
                <input
                  type="number"
                  value={reorderQty}
                  onChange={(e) => setReorderQty(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Safety Stock Days</label>
                <input
                  type="number"
                  value={safetyStockDays}
                  onChange={(e) => setSafetyStockDays(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Lead Time Days</label>
                <input
                  type="number"
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReorderOpen(false)}
                  className="px-4.5 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-[12px] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 bg-black hover:bg-zinc-900 text-white rounded-xl text-[12px] font-bold cursor-pointer transition-all duration-150 active:scale-95"
                >
                  Update Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
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

    </div>
  );
};

export default ProductsPage;
