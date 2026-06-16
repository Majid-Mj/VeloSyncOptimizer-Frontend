import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import supplierApi from '../../api/supplier.api';
import StatCard from '../../Components/Dashboard/StatCard';

const SuppliersPage = () => {
  const user = useSelector((s) => s.auth.user);
  const isAdmin = user?.role === 'Admin';

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Detail Modal state
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

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

  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await supplierApi.getAll();
      setSuppliers(res?.data || res || []);
    } catch (err) {
      console.error('Fetch suppliers error:', err);
      setError(err.response?.data?.message || 'Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (supplier) => {
    setSelectedSupplier(supplier);
    setIsDetailOpen(true);
    setLoadingDeliveries(true);
    try {
      const res = await supplierApi.getDeliveries(supplier.id);
      setDeliveries(res?.data || res || []);
    } catch (err) {
      console.error('Failed to fetch deliveries:', err);
      setDeliveries([]);
    } finally {
      setLoadingDeliveries(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const openAddForm = () => {
    setEditingSupplier(null);
    setName('');
    setContactEmail('');
    setContactPhone('');
    setIsActive(true);
    setIsFormOpen(true);
  };

  const openEditForm = (supplier) => {
    setEditingSupplier(supplier);
    setName(supplier.name || '');
    setContactEmail(supplier.email || '');
    setContactPhone(supplier.phone || '');
    setIsActive(supplier.isActive !== undefined ? supplier.isActive : true);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    requestConfirm(
      'Delete Supplier',
      'Are you sure you want to delete this supplier? This action cannot be undone.',
      async () => {
        try {
          await supplierApi.delete(id);
          showToast('Supplier deleted successfully', 'success');
          fetchSuppliers();
        } catch (err) {
          showToast(err.response?.data?.errors?.[0] || err.response?.data?.message || err.message, 'error');
        }
      },
      'Yes, Delete'
    );
  };

  const handleToggleActive = async (supplier) => {
    try {
      const payload = {
        name: supplier.name,
        contactEmail: supplier.email,
        contactPhone: supplier.phone,
        isActive: !supplier.isActive
      };
      await supplierApi.update(supplier.id, payload);
      showToast(`Supplier ${supplier.isActive ? 'deactivated' : 'activated'} successfully`, 'success');
      fetchSuppliers();
    } catch (err) {
      showToast(err.response?.data?.errors?.[0] || err.response?.data?.message || err.message, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        contactEmail,
        contactPhone,
        isActive
      };

      if (editingSupplier) {
        await supplierApi.update(editingSupplier.id, payload);
        showToast('Supplier updated successfully', 'success');
      } else {
        await supplierApi.create(payload);
        showToast('Supplier created successfully', 'success');
      }
      setIsFormOpen(false);
      fetchSuppliers();
    } catch (err) {
      showToast(err.response?.data?.errors?.[0] || err.response?.data?.message || err.message, 'error');
    }
  };

  // Filter suppliers
  const processedSuppliers = suppliers.filter((s) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = s.name ? s.name.toLowerCase().includes(q) : false;
    const emailMatch = s.email ? s.email.toLowerCase().includes(q) : false;
    const phoneMatch = s.phone ? s.phone.includes(q) : false;
    return nameMatch || emailMatch || phoneMatch;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6 select-none animate-fade-in overflow-y-auto min-h-[calc(100vh-4rem)] relative">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Suppliers Management</h1>
          <p className="text-[11px] font-bold text-slate-400 mt-0.5 tracking-wide uppercase">
            Manage vendor contacts and performance metrics
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
            Add Supplier
          </button>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
          label="Total Suppliers"
          value={suppliers.length.toString()}
          trend="Registered vendors"
          trendType="neutral"
          color="indigo"
        />
        <StatCard
          icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}
          label="Active Suppliers"
          value={suppliers.filter(s => s.isActive).length.toString()}
          trend="Operational"
          trendType="up"
          color="emerald"
        />
        <StatCard
          icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>}
          label="Inactive Suppliers"
          value={suppliers.filter(s => !s.isActive).length.toString()}
          trend="Deactivated"
          trendType="down"
          color="rose"
        />
        <StatCard
          icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          label="Avg Reliability"
          value={suppliers.length > 0 ? `${Math.round(suppliers.filter(s => s.reliabilityScore != null).reduce((sum, s) => sum + s.reliabilityScore, 0) / Math.max(1, suppliers.filter(s => s.reliabilityScore != null).length))}%` : 'N/A'}
          trend="Weighted average"
          trendType="neutral"
          color="amber"
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
            placeholder="Search by Name, Email or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-[#eff1f5] rounded-2xl text-[12.5px] font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400 shadow-3xs"
          />
        </div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{processedSuppliers.length} vendors found</span>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#704efe] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200/85 p-6 rounded-2xl text-center">
          <p className="text-red-700 font-bold text-[14px]">{error}</p>
          <button
            onClick={fetchSuppliers}
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
                  <th>ID</th>
                  <th>Supplier Name</th>
                  <th>Contact Detail</th>
                  <th>Reliability Score</th>
                  <th>On-Time Rate</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {processedSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-[13px] font-semibold text-slate-400">
                      No suppliers found.
                    </td>
                  </tr>
                ) : (
                  processedSuppliers.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <span className="font-mono text-[11px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg border border-slate-200/50">
                          SUP-{s.id.toString().padStart(4, '0')}
                        </span>
                      </td>
                      <td>
                        <div className="text-[13px] font-bold text-slate-800">{s.name}</div>
                      </td>
                      <td>
                        <div className="text-[12.5px] font-bold text-slate-800">{s.email || '-'}</div>
                        <div className="text-[11px] text-slate-400 font-semibold mt-0.5">{s.phone || '-'}</div>
                      </td>
                      <td>
                        {s.reliabilityScore != null ? (
                          <div className="flex items-center gap-2">
                            <span className={`text-[12.5px] font-black ${s.reliabilityScore >= 90 ? 'text-emerald-600' : s.reliabilityScore >= 75 ? 'text-amber-600' : 'text-rose-600'
                              }`}>
                              {s.reliabilityScore} / 100
                            </span>
                            <div className="w-12 bg-slate-100 rounded-full h-1.5 hidden sm:block">
                              <div
                                className={`h-1.5 rounded-full ${s.reliabilityScore >= 90 ? 'bg-emerald-500' : s.reliabilityScore >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                                  }`}
                                style={{ width: `${s.reliabilityScore}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic font-bold">No data</span>
                        )}
                      </td>
                      <td>
                        {s.onTimeDeliveryRate != null ? (
                          <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg border ${s.onTimeDeliveryRate >= 90 ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : s.onTimeDeliveryRate >= 75 ? 'bg-amber-50 text-amber-600 border-amber-100'
                                : 'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                            {s.onTimeDeliveryRate}%
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic font-bold">No data</span>
                        )}
                      </td>
                      <td>
                        {s.isActive ? (
                          <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-lg">Active</span>
                        ) : (
                          <span className="bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black px-2 py-0.5 rounded-lg">Inactive</span>
                        )}
                      </td>
                      <td className="text-[12px] font-semibold text-slate-500">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                      <td className="text-right">
                        <div className="flex gap-2.5 items-center justify-end">
                          <button
                            onClick={() => handleViewDetail(s)}
                            title="View Supplier Performance"
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl cursor-pointer transition-all duration-150 active:scale-95 flex items-center gap-1.5 text-[11px] font-extrabold"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Detail
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleToggleActive(s)}
                                title={s.isActive ? "Deactivate Supplier" : "Activate Supplier"}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-black border transition-all duration-150 active:scale-95 cursor-pointer shadow-sm ${s.isActive
                                  ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200/60"
                                  : "bg-rose-50 hover:bg-rose-100 text-rose-750 border-rose-200/60"
                                  }`}
                              >
                                {s.isActive ? "Active" : "Inactive"}
                              </button>
                              <button
                                onClick={() => openEditForm(s)}
                                title="Edit Supplier"
                                className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100/50 rounded-xl cursor-pointer transition-all duration-150 active:scale-95"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(s.id)}
                                title="Delete Supplier"
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-650 border border-red-100/50 rounded-xl cursor-pointer transition-all duration-150 active:scale-95"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-650 cursor-pointer text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Supplier Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Acme Corp"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@acme.com"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Contact Phone</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              {editingSupplier && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500 focus:ring-2"
                  />
                  <label htmlFor="isActive" className="text-[12px] font-bold text-slate-700 select-none">
                    Is Active
                  </label>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
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
                  {editingSupplier ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Performance Detail Modal */}
      {isDetailOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-xl w-full max-w-4xl overflow-hidden animate-scale-in my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Supplier Performance Profile
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    SUP-{selectedSupplier.id.toString().padStart(4, '0')} — {selectedSupplier.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedSupplier(null);
                  setDeliveries([]);
                }}
                className="text-slate-400 hover:text-slate-650 cursor-pointer text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-slate-100 bg-slate-50/30 rounded-2xl space-y-2">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Vendor Details</div>
                  <div className="text-[13px] font-black text-slate-800">{selectedSupplier.name}</div>
                  <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {selectedSupplier.email || 'No Email'}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    {selectedSupplier.phone || 'No Phone'}
                  </div>
                  <div className="pt-1">
                    {selectedSupplier.isActive ? (
                      <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black px-2.5 py-0.5 rounded-full">Active</span>
                    ) : (
                      <span className="bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black px-2.5 py-0.5 rounded-full">Inactive</span>
                    )}
                  </div>
                </div>

                <div className="p-4 border border-slate-100 bg-slate-50/30 rounded-2xl flex flex-col justify-between">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Reliability Score</div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className={`text-3xl font-black ${(selectedSupplier.reliabilityScore || 0) >= 90 ? 'text-emerald-500' : (selectedSupplier.reliabilityScore || 0) >= 75 ? 'text-amber-500' : 'text-rose-500'
                      }`}>
                      {selectedSupplier.reliabilityScore ?? 'N/A'}
                    </span>
                    {selectedSupplier.reliabilityScore != null && <span className="text-xs font-bold text-slate-400">/ 100</span>}
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${(selectedSupplier.reliabilityScore || 0) >= 90 ? 'bg-emerald-500' : (selectedSupplier.reliabilityScore || 0) >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                      style={{ width: `${selectedSupplier.reliabilityScore || 0}%` }}
                    />
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 mt-2">Calculated deduction of late days from 100</p>
                </div>

                <div className="p-4 border border-slate-100 bg-slate-50/30 rounded-2xl flex flex-col justify-between">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">On-Time Delivery Rate</div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className={`text-3xl font-black ${(selectedSupplier.onTimeDeliveryRate || 0) >= 90 ? 'text-emerald-500' : (selectedSupplier.onTimeDeliveryRate || 0) >= 75 ? 'text-amber-500' : 'text-rose-500'
                      }`}>
                      {selectedSupplier.onTimeDeliveryRate != null ? `${selectedSupplier.onTimeDeliveryRate}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${(selectedSupplier.onTimeDeliveryRate || 0) >= 90 ? 'bg-emerald-500' : (selectedSupplier.onTimeDeliveryRate || 0) >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                      style={{ width: `${selectedSupplier.onTimeDeliveryRate || 0}%` }}
                    />
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 mt-2">Percentage of deliveries arrived by promised date</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Fulfillment History</h4>
                  <span className="text-[10px] font-bold text-slate-400">{deliveries.length} items total</span>
                </div>

                {loadingDeliveries ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : deliveries.length === 0 ? (
                  <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-xs font-semibold text-slate-400">
                    No delivery records found for this supplier.
                  </div>
                ) : (
                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs font-semibold text-slate-600 border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[9.5px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                          <th className="px-4 py-2.5">PO Number</th>
                          <th className="px-4 py-2.5">Warehouse</th>
                          <th className="px-4 py-2.5">Product</th>
                          <th className="px-4 py-2.5">Fulfillment</th>
                          <th className="px-4 py-2.5">Received At</th>
                          <th className="px-4 py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deliveries.map((d, index) => (
                          <tr key={index} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <span className="font-mono text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200/50">
                                {d.poNumber}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-800 font-bold">{d.warehouseName}</td>
                            <td className="px-4 py-3 text-slate-500 font-semibold">{d.productName}</td>
                            <td className="px-4 py-3 font-mono text-slate-800">
                              {d.quantityReceived} / {d.quantityOrdered}
                            </td>
                            <td className="px-4 py-3 text-slate-500">
                              {d.receivedAt ? new Date(d.receivedAt).toLocaleDateString() : 'Pending'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-lg ${d.status === 'Received'
                                ? 'bg-emerald-50 border border-emerald-100 text-emerald-600'
                                : d.status === 'Cancelled'
                                  ? 'bg-rose-50 border border-rose-100 text-rose-600'
                                  : 'bg-amber-50 border border-amber-100 text-amber-600'
                                }`}>
                                {d.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedSupplier(null);
                  setDeliveries([]);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-wider cursor-pointer transition-all duration-150 active:scale-95"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" style={{ animation: 'scale-in 0.2s cubic-bezier(0.16,1,0.3,1) forwards' }}>
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

export default SuppliersPage;
