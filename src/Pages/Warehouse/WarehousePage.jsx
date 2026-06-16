import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import WarehouseStats from './WarehouseStats';
import WarehouseToolbar from './WarehouseToolbar';
import WarehouseGrid from './WarehouseGrid';
import WarehouseDrawer from './WarehouseDrawer';
import warehouseApi from '../../api/warehouse.api';
import { userApi } from '../../api/user.api';

const WarehousePage = () => {
  const user = useSelector((s) => s.auth.user);
  const isAdmin = user?.role === 'Admin';

  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('CODE');

  // Toast notifications state
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  // Creation Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newWh, setNewWh] = useState({
    code: '',
    name: '',
    city: '',
    state: '',
    country: 'Malaysia',
    totalCapacity: 20000,
    managerId: ''
  });

  // Modal / Operations states
  const [managersList, setManagersList] = useState([]);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [detailWarehouse, setDetailWarehouse] = useState(null);
  const [deleteWarehouseId, setDeleteWarehouseId] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 4000);
  };

  // Map backend DTO to responsive UI visual presentation
  const mapWarehouseDtoToClient = (w) => {
    const calculatedOccupancy = w.totalCapacity > 0
      ? Math.min(100, Math.round((w.totalStockOnHand / (w.totalCapacity * 0.1 || 1)) * 100))
      : 0;
    const capacity = calculatedOccupancy > 0 ? calculatedOccupancy : (w.totalStockOnHand > 0 ? Math.min(95, Math.round(w.totalStockOnHand / 15)) : 0);

    let color = 'green';
    let status = 'ACTIVE';
    if (capacity >= 90) {
      color = 'red';
      status = 'FULL';
    } else if (capacity >= 75) {
      color = 'amber';
    }

    const locationFormatted = [w.city, w.state, w.country]
      .filter(Boolean)
      .join(', ') || 'No location set';

    return {
      id: w.code || `WH-${w.id}`,
      dbId: w.id,
      name: w.name,
      city: w.city || '',
      state: w.state || '',
      country: w.country || 'Malaysia',
      location: locationFormatted,
      skus: w.totalProductCount,
      stockOnHand: w.totalStockOnHand,
      capacity: capacity,
      color: color,
      manager: w.managerName || 'Unassigned',
      managerId: w.managerId,
      status: w.isActive ? status : 'INACTIVE',
      isActive: w.isActive,
      totalCapacity: w.totalCapacity,
      size: w.totalCapacity ? `${w.totalCapacity.toLocaleString()} sq ft` : '15,000 sq ft'
    };
  };

  // Fetch from database on mount
  const fetchWarehouses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await warehouseApi.getAll();
      if (response.isSuccess) {
        const mapped = response.data.map(mapWarehouseDtoToClient);
        setWarehouses(mapped);
      } else {
        setError(response.message || 'Failed to retrieve warehouses');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to connect to the backend server');
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await userApi.getManagers();
      if (response.isSuccess) {
        setManagersList(response.data);
      }
    } catch (err) {
      console.error('Failed to load managers', err);
    }
  };

  useEffect(() => {
    fetchWarehouses();
    fetchManagers();
  }, []);

  // Calculate high-level KPIs based on state
  const stats = useMemo(() => {
    const total = warehouses.length;
    const activeWh = warehouses.filter(w => w.isActive);
    const avgCapacity = activeWh.length ? Math.round(activeWh.reduce((acc, cur) => acc + cur.capacity, 0) / activeWh.length) : 0;
    const totalSkus = warehouses.reduce((acc, cur) => acc + cur.skus, 0);
    const criticalCount = activeWh.filter(w => w.capacity >= 80).length;

    return { total, avgCapacity, totalSkus, criticalCount };
  }, [warehouses]);

  // Filter and sort warehouses
  const filteredWarehouses = useMemo(() => {
    return warehouses
      .filter(w => {
        const matchesSearch =
          w.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.manager.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === 'ALL' ||
          (statusFilter === 'HIGH_CAPACITY' && w.capacity >= 80 && w.isActive) ||
          (statusFilter === 'ACTIVE' && w.isActive) ||
          (statusFilter === 'FULL' && w.status === 'FULL' && w.isActive);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'CODE') return a.id.localeCompare(b.id);
        if (sortBy === 'CAPACITY_DESC') return b.capacity - a.capacity;
        if (sortBy === 'SKUS_DESC') return b.skus - a.skus;
        return 0;
      });
  }, [warehouses, searchQuery, statusFilter, sortBy]);

  // Handle Form Submission - Create
  const handleAddWarehouse = async (e) => {
    e.preventDefault();
    if (!newWh.code || !newWh.name) return;

    const payload = {
      code: newWh.code.toUpperCase(),
      name: newWh.name,
      addressLine1: newWh.city,
      city: newWh.city,
      state: newWh.state,
      country: newWh.country,
      postalCode: '',
      latitude: null,
      longitude: null,
      totalCapacity: parseInt(newWh.totalCapacity) || 0,
      managerId: newWh.managerId ? parseInt(newWh.managerId) : null
    };

    try {
      const response = await warehouseApi.create(payload);
      if (response.isSuccess) {
        showToast('Warehouse created successfully', 'success');

        // Reset Form & Close Drawer
        setNewWh({
          code: '',
          name: '',
          city: '',
          state: '',
          country: 'Malaysia',
          totalCapacity: 20000,
          managerId: ''
        });
        setDrawerOpen(false);

        // Re-fetch list
        fetchWarehouses();
      } else {
        showToast(response.message || 'Failed to create warehouse', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.errors?.[0] || err.response?.data?.message || 'Failed to create warehouse', 'error');
    }
  };

  // Handle Edit/Update Form Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingWarehouse.code || !editingWarehouse.name) return;

    const payload = {
      code: editingWarehouse.code.toUpperCase(),
      name: editingWarehouse.name,
      city: editingWarehouse.city,
      state: editingWarehouse.state,
      country: editingWarehouse.country,
      totalCapacity: parseInt(editingWarehouse.totalCapacity) || 0,
      managerId: editingWarehouse.managerId ? parseInt(editingWarehouse.managerId) : null,
      isActive: editingWarehouse.isActive
    };

    try {
      const response = await warehouseApi.update(editingWarehouse.dbId, payload);
      if (response.isSuccess) {
        showToast('Warehouse updated successfully', 'success');
        setEditingWarehouse(null);
        fetchWarehouses();
      } else {
        showToast(response.message || 'Failed to update warehouse', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.errors?.[0] || err.response?.data?.message || 'Failed to update warehouse', 'error');
    }
  };

  // Handle soft deletion trigger
  const handleDeleteWarehouse = (dbId) => {
    setDeleteWarehouseId(dbId);
  };

  const confirmDeleteWarehouse = async () => {
    if (!deleteWarehouseId) return;
    try {
      const response = await warehouseApi.delete(deleteWarehouseId);
      if (response.isSuccess) {
        showToast('Warehouse deleted successfully', 'success');
        setDeleteWarehouseId(null);
        fetchWarehouses();
      } else {
        showToast(response.message || 'Failed to delete warehouse', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to delete warehouse', 'error');
    }
  };

  // Handle active status toggle directly from the card
  const handleToggleActive = async (wh) => {
    try {
      const response = await warehouseApi.update(wh.dbId, { isActive: !wh.isActive });
      if (response.isSuccess) {
        showToast(`Warehouse ${wh.isActive ? 'deactivated' : 'activated'} successfully`, 'success');
        fetchWarehouses();
      } else {
        showToast(response.message || 'Failed to update warehouse status', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update warehouse status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-[1200px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-pulse">
          <div className="space-y-2.5">
            <div className="h-7 w-48 bg-slate-200 rounded-xl"></div>
            <div className="h-3 w-72 bg-slate-100 rounded-lg"></div>
          </div>
          <div className="h-9.5 w-36 bg-slate-200 rounded-xl"></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-100/70 border border-slate-100 rounded-2xl h-24"></div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-100 shadow-3xs flex flex-col md:flex-row justify-between gap-4 animate-pulse">
          <div className="h-9 w-full md:max-w-md bg-slate-100 rounded-xl"></div>
          <div className="flex gap-3.5">
            <div className="h-9 w-28 bg-slate-100 rounded-lg"></div>
            <div className="h-9 w-36 bg-slate-100 rounded-lg"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-50/70 border border-slate-100 rounded-2xl h-[280px]"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 max-w-[1200px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-lg font-bold">⚠️</div>
        <h3 className="text-base font-bold text-slate-800">Connection Failed</h3>
        <p className="text-xs font-semibold text-slate-400 max-w-sm leading-normal">{error}</p>
        <button
          onClick={fetchWarehouses}
          className="px-4.5 py-2.5 bg-[#704efe] hover:bg-[#5c3edd] text-white font-bold text-[12px] rounded-xl transition-all border-none cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col gap-5 relative">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2.5 tracking-tight uppercase">
            Facility Network
            <span className="text-[10px] font-black bg-indigo-50 border border-indigo-100/60 text-indigo-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {warehouses.filter(w => w.isActive).length} Active
            </span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 mt-1 tracking-wider uppercase leading-none">
            Facility Capacity & Stock Allocation Management
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setDrawerOpen(true)}
            className="px-4.5 py-2.5 bg-black hover:bg-zinc-900 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto border-none cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Warehouse
          </button>
        )}
      </div>

      {/* ── Overview Stats Row ── */}
      <WarehouseStats stats={stats} />

      {/* ── Search & Pill Filters Toolbar ── */}
      <WarehouseToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* ── Grid List ── */}
      <WarehouseGrid
        filteredWarehouses={filteredWarehouses}
        isAdmin={isAdmin}
        onDelete={handleDeleteWarehouse}
        onEdit={(wh) => {
          setEditingWarehouse({
            dbId: wh.dbId,
            code: wh.id,
            name: wh.name,
            city: wh.city,
            state: wh.state,
            country: wh.country,
            totalCapacity: wh.totalCapacity,
            managerId: wh.managerId ? wh.managerId.toString() : '',
            isActive: wh.isActive
          });
        }}
        onViewDetails={(wh) => setDetailWarehouse(wh)}
        onToggleActive={handleToggleActive}
      />

      {/* ── Slide-Over Form Drawer ── */}
      <WarehouseDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        newWh={newWh}
        setNewWh={setNewWh}
        onSubmit={handleAddWarehouse}
        managers={managersList}
      />

      {/* ── View Detail Modal ── */}
      {detailWarehouse && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center">
          <div
            onClick={() => setDetailWarehouse(null)}
            className="absolute inset-0 bg-[#11121d]/40 backdrop-blur-sm transition-opacity duration-300"
          ></div>

          <div className="relative bg-white rounded-3xl border border-[#eff1f5] p-6.5 shadow-2xl w-full max-w-lg mx-4 z-50 transform scale-100 transition-all duration-300">
            <div className="flex items-center justify-between border-b border-[#eff1f5] pb-4 mb-4">
              <div>
                <h3 className="text-xs font-black text-slate-805 uppercase tracking-wider">Warehouse Detail Analysis</h3>
                <p className="text-[10px] font-black text-slate-400 mt-0.5 tracking-wider uppercase">
                  {detailWarehouse.name} ({detailWarehouse.id})
                </p>
              </div>
              <button
                onClick={() => setDetailWarehouse(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-2xl transition-all border-none bg-transparent cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Capacity meter */}
              <div className="bg-slate-50/50 rounded-2xl p-4.5 border border-[#eff1f5]">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Storage Capacity Occupied</span>
                  <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-xl border ${!detailWarehouse.isActive
                      ? 'bg-slate-50 text-slate-500 border-slate-200'
                      : detailWarehouse.capacity >= 90
                        ? 'bg-rose-50 text-rose-650 border-rose-100'
                        : 'bg-emerald-50 text-emerald-650 border-emerald-100'
                    }`}>
                    {detailWarehouse.isActive ? `${detailWarehouse.capacity}%` : 'Offline'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative">
                  {detailWarehouse.isActive && (
                    <div
                      className={`absolute h-full rounded-full transition-all duration-700 ${detailWarehouse.color === 'red'
                          ? 'bg-gradient-to-r from-rose-500 to-red-650'
                          : detailWarehouse.color === 'amber'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                            : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                        }`}
                      style={{ width: `${detailWarehouse.capacity}%` }}
                    ></div>
                  )}
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50/20 rounded-2xl p-3 border border-[#eff1f5] flex flex-col justify-center">
                  <span className="text-[8px] font-black text-[#8a8b9d] uppercase tracking-widest leading-none">Code</span>
                  <span className="text-xs font-black text-slate-800 mt-1">{detailWarehouse.id}</span>
                </div>
                <div className="bg-slate-50/20 rounded-2xl p-3 border border-[#eff1f5] flex flex-col justify-center">
                  <span className="text-[8px] font-black text-[#8a8b9d] uppercase tracking-widest leading-none">Status</span>
                  <span className="text-xs font-black text-slate-800 mt-1">
                    {detailWarehouse.isActive ? 'Active / Operational' : 'Inactive / Offline'}
                  </span>
                </div>
                <div className="bg-slate-50/20 rounded-2xl p-3 border border-[#eff1f5] flex flex-col justify-center">
                  <span className="text-[8px] font-black text-[#8a8b9d] uppercase tracking-widest leading-none">Stock Categories (SKUs)</span>
                  <span className="text-xs font-black text-slate-800 mt-1">{detailWarehouse.skus} Categories</span>
                </div>
                <div className="bg-slate-50/20 rounded-2xl p-3 border border-[#eff1f5] flex flex-col justify-center">
                  <span className="text-[8px] font-black text-[#8a8b9d] uppercase tracking-widest leading-none">Total Stock Count</span>
                  <span className="text-xs font-black text-slate-800 mt-1">{detailWarehouse.stockOnHand?.toLocaleString() || 0} Units</span>
                </div>
                <div className="bg-slate-50/20 rounded-2xl p-3 border border-[#eff1f5] flex flex-col justify-center">
                  <span className="text-[8px] font-black text-[#8a8b9d] uppercase tracking-widest leading-none">Total Area Capacity</span>
                  <span className="text-xs font-black text-slate-800 mt-1">{detailWarehouse.size}</span>
                </div>
                <div className="bg-slate-50/20 rounded-2xl p-3 border border-[#eff1f5] flex flex-col justify-center">
                  <span className="text-[8px] font-black text-[#8a8b9d] uppercase tracking-widest leading-none">Assigned Manager</span>
                  <span className="text-xs font-black text-slate-800 mt-1">{detailWarehouse.manager}</span>
                </div>
              </div>

              {/* Location details */}
              <div className="bg-slate-50/20 rounded-2xl p-3 border border-[#eff1f5] flex flex-col justify-center">
                <span className="text-[8px] font-black text-[#8a8b9d] uppercase tracking-widest leading-none">Facility Address Location</span>
                <span className="text-xs font-black text-slate-800 mt-1">{detailWarehouse.location}</span>
                <span className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-wider">
                  City: {detailWarehouse.city || 'N/A'} | State: {detailWarehouse.state || 'N/A'} | Country: {detailWarehouse.country || 'N/A'}
                </span>
              </div>
            </div>

            <div className="border-t border-[#eff1f5] pt-4 mt-6 flex justify-end">
              <button
                onClick={() => setDetailWarehouse(null)}
                className="px-5 py-2.5 bg-[#202231] hover:bg-[#313346] text-white font-black text-[10px] uppercase tracking-wider rounded-2xl transition-all border-none cursor-pointer"
              >
                Close details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Warehouse Modal ── */}
      {editingWarehouse && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center">
          <div
            onClick={() => setEditingWarehouse(null)}
            className="absolute inset-0 bg-[#11121d]/40 backdrop-blur-sm transition-opacity duration-300"
          ></div>

          <div className="relative bg-white rounded-3xl border border-[#eff1f5] p-6.5 shadow-2xl w-full max-w-md mx-4 z-50 transform scale-100 transition-all duration-300">
            <div className="flex items-center justify-between border-b border-[#eff1f5] pb-4 mb-4">
              <div>
                <h3 className="text-xs font-black text-slate-805 uppercase tracking-wider">Update Warehouse Info</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider uppercase">
                  Modify operational details
                </p>
              </div>
              <button
                onClick={() => setEditingWarehouse(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-2xl transition-all border-none bg-transparent cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Warehouse Code</label>
                <input
                  type="text"
                  required
                  value={editingWarehouse.code || ''}
                  onChange={(e) => setEditingWarehouse({ ...editingWarehouse, code: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-[#eff1f5] focus:border-indigo-500 focus:bg-white rounded-2xl text-[12.5px] outline-none font-bold text-slate-700 transition-all shadow-3xs"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Warehouse Name</label>
                <input
                  type="text"
                  required
                  value={editingWarehouse.name || ''}
                  onChange={(e) => setEditingWarehouse({ ...editingWarehouse, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-[#eff1f5] focus:border-indigo-500 focus:bg-white rounded-2xl text-[12.5px] outline-none font-bold text-slate-700 transition-all shadow-3xs"
                />
              </div>

              {/* Location Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">City</label>
                  <input
                    type="text"
                    required
                    value={editingWarehouse.city || ''}
                    onChange={(e) => setEditingWarehouse({ ...editingWarehouse, city: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-[#eff1f5] focus:border-indigo-500 focus:bg-white rounded-2xl text-[12.5px] outline-none font-bold text-slate-700 transition-all shadow-3xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">State</label>
                  <input
                    type="text"
                    required
                    value={editingWarehouse.state || ''}
                    onChange={(e) => setEditingWarehouse({ ...editingWarehouse, state: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-[#eff1f5] focus:border-indigo-500 focus:bg-white rounded-2xl text-[12.5px] outline-none font-bold text-slate-700 transition-all shadow-3xs"
                  />
                </div>
              </div>

              {/* Country & Capacity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Country</label>
                  <input
                    type="text"
                    required
                    value={editingWarehouse.country || ''}
                    onChange={(e) => setEditingWarehouse({ ...editingWarehouse, country: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-[#eff1f5] focus:border-indigo-500 focus:bg-white rounded-2xl text-[12.5px] outline-none font-bold text-slate-700 transition-all shadow-3xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Capacity (sq ft)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingWarehouse.totalCapacity || ''}
                    onChange={(e) => setEditingWarehouse({ ...editingWarehouse, totalCapacity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-[#eff1f5] focus:border-indigo-500 focus:bg-white rounded-2xl text-[12.5px] outline-none font-bold text-slate-700 transition-all shadow-3xs"
                  />
                </div>
              </div>

              {/* Manager */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Manager Selection</label>
                <div className="relative">
                  <select
                    value={editingWarehouse.managerId || ''}
                    onChange={(e) => setEditingWarehouse({ ...editingWarehouse, managerId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-[#eff1f5] focus:border-indigo-500 rounded-2xl text-[12.5px] outline-none font-bold text-slate-700 appearance-none cursor-pointer transition-all shadow-3xs"
                  >
                    <option value="">-- Choose manager --</option>
                    {managersList.map((m) => (
                      <option key={m.id} value={m.id.toString()}>
                        {m.fullName} ({m.email})
                      </option>
                    ))}
                  </select>
                  <svg className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>

              {/* Active Toggle Option */}
              <div className="flex items-center gap-3 py-1 bg-slate-50 px-3.5 rounded-2xl border border-[#eff1f5]">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={editingWarehouse.isActive}
                  onChange={(e) => setEditingWarehouse({ ...editingWarehouse, isActive: e.target.checked })}
                  className="w-4 h-4 accent-[#704efe] rounded border-slate-350 focus:ring-[#704efe] cursor-pointer"
                />
                <label htmlFor="isActiveToggle" className="text-[11px] font-black text-[#202231] uppercase tracking-wider cursor-pointer select-none">
                  Facility is Active & Operational
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center gap-3 border-t border-[#eff1f5] pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingWarehouse(null)}
                  className="flex-1 py-3 bg-white hover:bg-slate-50 border border-[#eff1f5] text-slate-500 font-black text-[10px] uppercase tracking-wider rounded-2xl transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-white font-black text-[10px] uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer text-center bg-[#704efe] hover:bg-[#5c3edd] shadow-indigo-100/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteWarehouseId && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center">
          <div
            onClick={() => setDeleteWarehouseId(null)}
            className="absolute inset-0 bg-[#11121d]/40 backdrop-blur-sm transition-opacity duration-300"
          ></div>

          <div className="relative bg-white rounded-3xl border border-[#eff1f5] p-6.5 shadow-2xl w-full max-w-sm mx-4 z-50 transform scale-100 transition-all duration-300">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-lg mx-auto font-black">
                ⚠️
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-805 uppercase tracking-wider">Confirm Delete Facility</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-2 leading-relaxed uppercase">
                  Are you sure you want to delete this warehouse? This is a soft delete operation and will deactivate the facility from active operations.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-[#eff1f5] pt-4 mt-6">
              <button
                type="button"
                onClick={() => setDeleteWarehouseId(null)}
                className="flex-1 py-3 bg-white hover:bg-slate-50 border border-[#eff1f5] text-slate-500 font-black text-[10px] uppercase tracking-wider rounded-2xl transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteWarehouse}
                className="flex-1 py-3 text-white font-black text-[10px] uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer text-center bg-rose-600 hover:bg-rose-700 shadow-rose-100"
              >
                Confirm Delete
              </button>
            </div>
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

export default WarehousePage;
