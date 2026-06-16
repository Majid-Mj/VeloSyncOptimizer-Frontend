import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import StatCard from '../../Components/Dashboard/StatCard';
import { userApi } from '../../api/user.api';
import { warehouseApi } from '../../api/warehouse.api';

const UserManagementPage = () => {
  const location = useLocation();

  const [users, setUsers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tabs state
  const [activeTab, setActiveTab] = useState('all');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Approval Modal state
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedUserForApproval, setSelectedUserForApproval] = useState(null);
  const [selectedRoleForApproval, setSelectedRoleForApproval] = useState('2'); // default Warehouse Manager
  const [selectedWarehouseIdForApproval, setSelectedWarehouseIdForApproval] = useState('');

  // Reassignment Modal State
  const [reassignOpen, setReassignOpen] = useState(false);
  const [selectedUserForReassign, setSelectedUserForReassign] = useState(null);
  const [selectedWarehouseIdForReassign, setSelectedWarehouseIdForReassign] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Toast notifications state
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, warehousesRes] = await Promise.all([
        userApi.getAll(),
        warehouseApi.getAll()
      ]);

      if (usersRes.isSuccess) {
        const nonAdminUsers = (usersRes.data || []).filter(
          u => u.roleName !== 'Administrator' && u.roleName !== 'Admin'
        );
        setUsers(nonAdminUsers);
      } else {
        setError(usersRes.message || 'Failed to fetch users list');
      }

      if (warehousesRes.isSuccess) {
        setWarehouses(warehousesRes.data || []);
      }
    } catch (err) {
      console.error('Fetch users/warehouses error:', err);
      setError(err.response?.data?.message || 'Failed to connect to VeloSync Admin APIs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync activeTab with URL path
  useEffect(() => {
    if (location.pathname.includes('user-approvals')) {
      setActiveTab('pending');
    } else {
      setActiveTab('all');
    }
  }, [location.pathname]);

  // Handle active/inactive toggle
  const handleToggleActive = async (user) => {
    try {
      const newStatus = !user.isActive;
      const response = await userApi.toggleStatus(user.id, newStatus);
      if (response.isSuccess) {
        showToast(`User ${user.firstName} ${user.lastName} has been ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
        fetchData();
      } else {
        showToast(response.message || 'Failed to update status', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  // Open Approval Modal
  const openApprovalModal = (user) => {
    setSelectedUserForApproval(user);
    const initialRole = user.roleName === 'ProcurementManager' ? '3' : '2';
    setSelectedRoleForApproval(initialRole);

    if (warehouses.length > 0) {
      setSelectedWarehouseIdForApproval(warehouses[0].id.toString());
    } else {
      setSelectedWarehouseIdForApproval('');
    }
    setApproveModalOpen(true);
  };

  // Close Approval Modal
  const closeApprovalModal = () => {
    setSelectedUserForApproval(null);
    setApproveModalOpen(false);
  };

  // Handle Approval Submit
  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserForApproval) return;

    const isWhManager = selectedRoleForApproval === '2';
    if (isWhManager && !selectedWarehouseIdForApproval) {
      showToast('Please select a warehouse for the Warehouse Manager.', 'error');
      return;
    }

    const payload = {
      userId: selectedUserForApproval.id,
      role: parseInt(selectedRoleForApproval),
      warehouseId: isWhManager ? Number(selectedWarehouseIdForApproval) : null
    };

    setSubmitting(true);
    try {
      const response = await userApi.approveUser(payload);
      if (response.isSuccess) {
        showToast(`Approved ${selectedUserForApproval.firstName} ${selectedUserForApproval.lastName} successfully`, 'success');
        closeApprovalModal();
        fetchData();
        window.dispatchEvent(new Event('pending-users-updated'));
      } else {
        showToast(response.message || 'Approval failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to approve user.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Reassignment Modal
  const openReassignModal = (user) => {
    const currentWh = warehouses.find(w => w.managerId === user.id);
    setSelectedUserForReassign(user);
    setSelectedWarehouseIdForReassign(currentWh ? currentWh.id.toString() : (warehouses[0]?.id.toString() || ''));
    setReassignOpen(true);
  };

  // Handle Reassignment Submit
  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserForReassign) return;

    setSubmitting(true);
    try {
      const response = await userApi.reassignManager(Number(selectedWarehouseIdForReassign), selectedUserForReassign.id);
      if (response.isSuccess) {
        showToast('Warehouse manager assigned successfully!', 'success');
        setReassignOpen(false);
        fetchData();
      } else {
        showToast(response.message || 'Failed to assign warehouse manager', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to assign warehouse manager', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = users.length;
    const pending = users.filter(u => !u.isApproved).length;
    const active = users.filter(u => u.isApproved && u.isActive).length;
    const inactive = users.filter(u => u.isApproved && !u.isActive).length;
    return { total, pending, active, inactive };
  }, [users]);

  // Tab Filtering and Searching
  const processedUsers = useMemo(() => {
    let list = users;
    if (activeTab === 'pending') {
      list = users.filter(u => !u.isApproved);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(u =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, activeTab, searchQuery]);

  const tabs = [
    { id: 'all', label: 'All Users' },
    { id: 'pending', label: 'Pending', count: stats.pending }
  ];

  const getRoleBadgeColor = (roleName) => {
    switch (roleName) {
      case 'Administrator':
      case 'Admin':
        return 'bg-purple-50 border-purple-100 text-purple-750';
      case 'WarehouseManager':
        return 'bg-blue-50 border-blue-100 text-blue-700';
      case 'ProcurementManager':
        return 'bg-cyan-50 border-cyan-100 text-cyan-700';
      default:
        return 'bg-slate-50 border-slate-100 text-slate-700';
    }
  };

  const getRoleLabel = (roleName) => {
    switch (roleName) {
      case 'Administrator':
      case 'Admin':
        return 'Administrator';
      case 'WarehouseManager':
        return 'Warehouse Manager';
      case 'ProcurementManager':
        return 'Procurement Manager';
      default:
        return roleName;
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6 select-none animate-fade-in overflow-y-auto min-h-[calc(100vh-4rem)] relative">
      {/* Toast */}
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
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Management Directory</h1>
        <p className="text-[11px] font-bold text-slate-400 mt-0.5 tracking-wide uppercase">
          Review credentials, allocate warehouse staff roles and approve pending registrations
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          label="Total Users"
          value={stats.total.toString()}
          trend="All registered accounts"
          trendType="neutral"
          color="indigo"
        />
        <StatCard
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          label="Pending Approvals"
          value={stats.pending.toString()}
          trend="Action required"
          trendType={stats.pending > 0 ? "down" : "neutral"}
          color="amber"
        />
        <StatCard
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          label="Active Users"
          value={stats.active.toString()}
          trend="Operational staff"
          trendType="positive"
          color="emerald"
        />
        <StatCard
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>}
          label="Inactive Users"
          value={stats.inactive.toString()}
          trend="Deactivated / Disabled"
          trendType="negative"
          color="rose"
        />
      </div>

      {/* Toolbar / Search + Tabs */}
      <div className="bg-gradient-to-br from-white to-slate-50/60 rounded-3xl border border-slate-100 shadow-[0_4px_16px_-4px_rgba(148,163,184,0.06)] p-5">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
          {/* Tabs Container */}
          <div className="flex border-b border-slate-100 w-full sm:w-auto gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all duration-150 cursor-pointer ${activeTab === tab.id
                    ? 'border-indigo-600 text-slate-800 bg-slate-50/50'
                    : 'border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50/30'
                  }`}
              >
                <span className="flex items-center gap-1.5">
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="bg-amber-500 text-white text-[9.5px] font-black px-1.5 py-0.5 rounded-full ml-1">
                      {tab.count}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#704efe] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200/80 p-6 rounded-2xl text-center">
          <p className="text-red-700 font-bold text-[14px]">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4.5 py-2 bg-red-650 text-white rounded-xl text-[12.5px] font-bold shadow-sm"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_16px_-4px_rgba(148,163,184,0.06)] hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-medium text-slate-500">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Assigned Role</th>
                  <th className="px-6 py-4">Operational Warehouse</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-[13px] font-semibold text-slate-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  processedUsers.map((u) => {
                    const assignedWh = warehouses.find(w => w.managerId === u.id);
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/40 transition-colors">
                        {/* User Details */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-50 text-[#704efe] font-bold flex items-center justify-center shrink-0 border border-indigo-100/50">
                              {u.firstName ? u.firstName[0].toUpperCase() : ''}
                              {u.lastName ? u.lastName[0].toUpperCase() : ''}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-[13px]">{u.firstName} {u.lastName}</div>
                              <div className="text-[11px] text-slate-400 font-semibold mt-0.5">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <span className={`border text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wide ${getRoleBadgeColor(u.roleName)}`}>
                            {getRoleLabel(u.roleName)}
                          </span>
                        </td>

                        {/* Operational Warehouse */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          {u.roleName === 'WarehouseManager' ? (
                            assignedWh ? (
                              <div className="flex flex-col">
                                <span className="font-bold text-[#704efe] text-[12.5px]">{assignedWh.name}</span>
                                <span className="font-mono text-[10px] text-slate-400 mt-0.5">Code: {assignedWh.code}</span>
                              </div>
                            ) : (
                              <span className="bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wide">
                                Unassigned
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400 font-bold text-[12.5px]">N/A</span>
                          )}
                        </td>

                        {/* Joined Date */}
                        <td className="px-6 py-4.5 whitespace-nowrap text-[12px] font-semibold text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4.5 whitespace-nowrap text-right">
                          <div className="flex gap-2.5 items-center justify-end">
                            {/* Toggle active status buttons for approved users */}
                            {u.isApproved && (
                              <button
                                onClick={() => handleToggleActive(u)}
                                title={u.isActive ? "Deactivate User" : "Activate User"}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-black border transition-all duration-150 active:scale-95 cursor-pointer shadow-sm ${u.isActive
                                    ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200/60"
                                    : "bg-rose-50 hover:bg-rose-100 text-rose-750 border-rose-200/60"
                                  }`}
                              >
                                {u.isActive ? "Active" : "Inactive"}
                              </button>
                            )}

                            {/* Review & Approve for pending users */}
                            {!u.isApproved && (
                              <button
                                onClick={() => openApprovalModal(u)}
                                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-xl shadow-md shadow-blue-100 hover:shadow-lg transition-all border-none cursor-pointer"
                              >
                                Review & Approve
                              </button>
                            )}

                            {/* Reassign Warehouse Manager assignment */}
                            {u.isApproved && u.isActive && u.roleName === 'WarehouseManager' && (
                              <button
                                onClick={() => openReassignModal(u)}
                                title="Assign Warehouse"
                                className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-650 border border-blue-100/50 rounded-xl cursor-pointer transition-all duration-150 active:scale-95 flex items-center justify-center"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Glassmorphic Approval Modal */}
      {approveModalOpen && selectedUserForApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={closeApprovalModal}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-50 transform transition-all border border-slate-100 flex flex-col animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Approve User Request</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wide uppercase">Assign role and warehouse configurations</p>
              </div>
              <button
                onClick={closeApprovalModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all border-none bg-transparent cursor-pointer font-bold text-lg"
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleApproveSubmit} className="p-6 space-y-5">
              {/* User Bio Card */}
              <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                  {selectedUserForApproval.firstName ? selectedUserForApproval.firstName[0].toUpperCase() : ''}
                  {selectedUserForApproval.lastName ? selectedUserForApproval.lastName[0].toUpperCase() : ''}
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-[13px]">{selectedUserForApproval.firstName} {selectedUserForApproval.lastName}</div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-0.5">{selectedUserForApproval.email}</div>
                </div>
              </div>

              {/* Role Select Dropdown */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5" htmlFor="role-select">
                  Assign Final Role
                </label>
                <div className="relative">
                  <select
                    id="role-select"
                    value={selectedRoleForApproval}
                    onChange={(e) => setSelectedRoleForApproval(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 rounded-xl text-xs outline-none font-semibold text-slate-700 appearance-none cursor-pointer"
                  >
                    <option value="2">Warehouse Manager</option>
                    <option value="3">Procurement Manager</option>
                  </select>
                  <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>

              {/* Conditional Warehouse Selection Dropdown */}
              {selectedRoleForApproval === '2' && (
                <div className="animate-fade-in">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5" htmlFor="warehouse-select">
                    Assign Operational Warehouse
                  </label>
                  <div className="relative">
                    <select
                      id="warehouse-select"
                      required
                      value={selectedWarehouseIdForApproval}
                      onChange={(e) => setSelectedWarehouseIdForApproval(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 rounded-xl text-xs outline-none font-semibold text-slate-700 appearance-none cursor-pointer"
                    >
                      {warehouses.length === 0 ? (
                        <option value="">No Warehouses Available</option>
                      ) : (
                        warehouses.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name} ({w.code})
                          </option>
                        ))
                      )}
                    </select>
                    <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                  <p className="text-[10px] font-bold text-indigo-500/80 mt-1.5 leading-normal">
                    * Mapped as the primary contact and single manager for this facility.
                  </p>
                </div>
              )}

              {/* Form Actions Footer */}
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={closeApprovalModal}
                  disabled={submitting}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 font-bold text-[12px] rounded-xl transition-all border-none cursor-pointer text-center disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-black hover:bg-zinc-900 active:scale-95 text-white font-bold text-[12px] rounded-xl transition-all border-none cursor-pointer text-center disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submitting ? 'Approving...' : 'Approve User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reassign Manager Modal */}
      {reassignOpen && selectedUserForReassign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="absolute inset-0" onClick={() => setReassignOpen(false)}></div>
          <div className="bg-white border border-slate-100 rounded-3xl shadow-xl w-full max-w-md overflow-hidden z-50 transform transition-all flex flex-col animate-scale-in">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Assign Warehouse Responsibility
              </h3>
              <button
                onClick={() => setReassignOpen(false)}
                className="text-slate-400 hover:text-slate-650 cursor-pointer text-lg font-bold border-none bg-transparent"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleReassignSubmit} className="p-6 space-y-4">
              <p className="text-[12px] font-semibold text-slate-500 leading-normal">
                Select an operational warehouse for manager <span className="text-slate-800 font-bold">{selectedUserForReassign.firstName} {selectedUserForReassign.lastName}</span>.
              </p>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Target Warehouse</label>
                <div className="relative">
                  <select
                    value={selectedWarehouseIdForReassign}
                    onChange={(e) => setSelectedWarehouseIdForReassign(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-bold text-slate-700 bg-white focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                  <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReassignOpen(false)}
                  disabled={submitting}
                  className="px-4.5 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-[12px] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4.5 py-2 bg-black hover:bg-zinc-900 text-white rounded-xl text-[12px] font-bold cursor-pointer transition-all duration-150 active:scale-95"
                >
                  {submitting ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
