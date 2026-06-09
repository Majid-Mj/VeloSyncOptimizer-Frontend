import React, { useState, useEffect } from 'react';
import { userApi } from '../../api/user.api';
import { warehouseApi } from '../../api/warehouse.api';

const UserApprovalPage = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('2');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Toast notifications state
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  const showToast = (msg, type = '') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 4000);
  };

  // Fetch pending users and warehouses
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, whsRes] = await Promise.all([
        userApi.getPendingUsers(),
        warehouseApi.getAll()
      ]);

      if (usersRes.isSuccess) {
        setPendingUsers(usersRes.data || []);
      } else {
        setError(usersRes.message || 'Failed to fetch pending users.');
      }

      if (whsRes.isSuccess) {
        setWarehouses(whsRes.data || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to connect to the backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openApprovalModal = (user) => {
    setSelectedUser(user);
    const initialRole = user.roleName === 'ProcurementManager' ? '3' : '2';
    setSelectedRole(initialRole);

    // Default to the first available warehouse if exists
    if (warehouses.length > 0) {
      setSelectedWarehouseId(warehouses[0].id.toString());
    } else {
      setSelectedWarehouseId('');
    }

    setModalOpen(true);
  };

  const closeApprovalModal = () => {
    setSelectedUser(null);
    setModalOpen(false);
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    const isWhManager = selectedRole === '2';
    if (isWhManager && !selectedWarehouseId) {
      showToast('Please select a warehouse for the Warehouse Manager.', 'error');
      return;
    }

    const payload = {
      userId: selectedUser.id,
      role: parseInt(selectedRole),
      warehouseId: isWhManager ? Number(selectedWarehouseId) : null
    };

    setSubmitting(true);
    try {
      const response = await userApi.approveUser(payload);
      if (response.isSuccess) {
        showToast(`Approved ${selectedUser.firstName} ${selectedUser.lastName} successfully`, 'success');
        closeApprovalModal();
        fetchData();
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-pulse">
          <div className="space-y-2.5">
            <div className="h-7 w-56 bg-gray-200 rounded-xl"></div>
            <div className="h-3 w-80 bg-gray-100 rounded-lg"></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 h-14"></div>
          <div className="p-5 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 h-12 bg-gray-50 rounded-xl"></div>
            ))}
          </div>
        </div>
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
          className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[12px] rounded-xl transition-all border-none cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col gap-5 relative">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5 tracking-tight" id="user-approvals-title">
          User Approvals
          <span className="text-[12px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full border border-blue-100">
            {pendingUsers.length} pending
          </span>
        </h1>
        <p className="text-[11px] font-bold text-gray-400 mt-0.5 tracking-wide uppercase">
          Administrator Pending Registrations & Warehouse Allocations
        </p>
      </div>

      {/* ── Pending Users Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h2 className="text-xs font-bold text-gray-700 tracking-wide uppercase">Pending Approvals List</h2>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center text-2xl font-bold">✓</div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">All caught up!</h3>
              <p className="text-xs text-gray-400 font-semibold mt-1">There are no pending user registrations requiring approval.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-medium text-gray-500">
              <thead className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Requested Role</th>
                  <th className="px-6 py-4">Submitted Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center shrink-0">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 text-[13px]">{u.firstName} {u.lastName}</div>
                          <span className="text-[10px] bg-amber-50 text-amber-600 font-bold px-1.5 py-0.5 rounded border border-amber-100 mt-1 inline-block">
                            Pending Approval
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 whitespace-nowrap text-gray-600 font-semibold">{u.email}</td>
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">
                        {u.roleName === 'ProcurementManager' ? 'Procurement Manager' : 'Warehouse Manager'}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 whitespace-nowrap text-gray-400 font-bold">{formatDate(u.createdAt)}</td>
                    <td className="px-6 py-4.5 whitespace-nowrap text-right">
                      <button
                        onClick={() => openApprovalModal(u)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-xl shadow-md shadow-blue-100 hover:shadow-lg transition-all border-none cursor-pointer"
                      >
                        Review & Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Glassmorphic Approval Modal ── */}
      {modalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeApprovalModal}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-50 transform transition-all border border-gray-100 flex flex-col">

            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-800 tracking-tight">Approve User Request</h3>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5 tracking-wide uppercase">Assign role and warehouse configurations</p>
              </div>
              <button
                onClick={closeApprovalModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all border-none bg-transparent cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleApprove} className="p-6 space-y-5">

              {/* User Bio Card */}
              <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center shrink-0">
                  {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-[13px]">{selectedUser.firstName} {selectedUser.lastName}</div>
                  <div className="text-[11px] font-semibold text-gray-500 mt-0.5">{selectedUser.email}</div>
                </div>
              </div>

              {/* Role Select Dropdown */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="role-select">
                  Assign Final Role
                </label>
                <div className="relative">
                  <select
                    id="role-select"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl text-xs outline-none font-semibold text-gray-700 appearance-none cursor-pointer"
                  >
                    <option value="2">Warehouse Manager</option>
                    <option value="3">Procurement Manager</option>
                  </select>
                  <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>

              {/* Conditional Warehouse Selection Dropdown */}
              {selectedRole === '2' && (
                <div className="animate-fade-in">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="warehouse-select">
                    Assign Operational Warehouse
                  </label>
                  <div className="relative">
                    <select
                      id="warehouse-select"
                      required
                      value={selectedWarehouseId}
                      onChange={(e) => setSelectedWarehouseId(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl text-xs outline-none font-semibold text-gray-700 appearance-none cursor-pointer"
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
                    <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                  <p className="text-[10px] font-bold text-blue-500/80 mt-1.5 leading-normal">
                    * Mapped as the primary contact and single manager for this facility.
                  </p>
                </div>
              )}

              {/* Form Actions Footer */}
              <div className="flex items-center gap-3 border-t border-gray-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={closeApprovalModal}
                  disabled={submitting}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-600 font-bold text-[12px] rounded-xl transition-all border-none cursor-pointer text-center disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-[12px] rounded-xl shadow-md shadow-blue-100 hover:shadow-lg transition-all border-none cursor-pointer text-center disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submitting ? 'Approving...' : 'Approve User'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

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

export default UserApprovalPage;
