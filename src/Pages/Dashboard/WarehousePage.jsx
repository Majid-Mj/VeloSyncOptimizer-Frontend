import React, { useState, useMemo } from 'react';

const INITIAL_WAREHOUSES = [
  { id: 'WH-KL-01', name: 'Kuala Lumpur Main Hub', location: 'Kuala Lumpur', skus: 847, capacity: 82, color: 'amber', manager: 'Majid Mj', status: 'ACTIVE', staff: 14, size: '25,000 sq ft' },
  { id: 'WH-PG-02', name: 'Penang Logistics Center', location: 'Penang', skus: 612, capacity: 45, color: 'green', manager: 'Sarah Lee', status: 'ACTIVE', staff: 8, size: '15,000 sq ft' },
  { id: 'WH-JB-03', name: 'Johor Bahru Gateway', location: 'Johor Bahru', skus: 934, capacity: 93, color: 'red', manager: 'Alex Tan', status: 'FULL', staff: 19, size: '30,000 sq ft' },
  { id: 'WH-KK-04', name: 'East Malaysia Depot', location: 'Kota Kinabalu', skus: 341, capacity: 31, color: 'green', manager: 'Farhan Ali', status: 'ACTIVE', staff: 5, size: '10,000 sq ft' },
  { id: 'WH-SB-05', name: 'Sabah Storage Annex', location: 'Sabah', skus: 220, capacity: 58, color: 'green', manager: 'Wong Siew', status: 'ACTIVE', staff: 6, size: '8,500 sq ft' }
];

const MANAGERS = ['Majid Mj', 'Sarah Lee', 'Alex Tan', 'Farhan Ali', 'Wong Siew', 'Jane Doe', 'John Smith'];

const WarehousePage = () => {
  const [warehouses, setWarehouses] = useState(INITIAL_WAREHOUSES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('CODE');
  
  // Slide-over drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newWh, setNewWh] = useState({
    id: '',
    name: '',
    location: '',
    capacity: 50,
    manager: MANAGERS[0],
    staff: 5,
    size: ''
  });

  // Calculate high-level KPIs based on state
  const stats = useMemo(() => {
    const total = warehouses.length;
    const avgCapacity = total ? Math.round(warehouses.reduce((acc, cur) => acc + cur.capacity, 0) / total) : 0;
    const totalSkus = warehouses.reduce((acc, cur) => acc + cur.skus, 0);
    const criticalCount = warehouses.filter(w => w.capacity >= 80).length;

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
          (statusFilter === 'HIGH_CAPACITY' && w.capacity >= 80) ||
          (statusFilter === 'ACTIVE' && w.status === 'ACTIVE') ||
          (statusFilter === 'FULL' && w.status === 'FULL');

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'CODE') return a.id.localeCompare(b.id);
        if (sortBy === 'CAPACITY_DESC') return b.capacity - a.capacity;
        if (sortBy === 'SKUS_DESC') return b.skus - a.skus;
        return 0;
      });
  }, [warehouses, searchQuery, statusFilter, sortBy]);

  // Handle Form Submission
  const handleAddWarehouse = (e) => {
    e.preventDefault();
    if (!newWh.id || !newWh.name || !newWh.location) return;

    const capacityNum = Number(newWh.capacity);
    let color = 'green';
    let status = 'ACTIVE';

    if (capacityNum >= 90) {
      color = 'red';
      status = 'FULL';
    } else if (capacityNum >= 75) {
      color = 'amber';
    }

    const createdWh = {
      id: newWh.id.toUpperCase(),
      name: newWh.name,
      location: newWh.location,
      skus: 0,
      capacity: capacityNum,
      color,
      manager: newWh.manager,
      status,
      staff: Number(newWh.staff) || 2,
      size: newWh.size || '10,000 sq ft'
    };

    setWarehouses([createdWh, ...warehouses]);
    
    // Reset Form & Close Drawer
    setNewWh({
      id: '',
      name: '',
      location: '',
      capacity: 50,
      manager: MANAGERS[0],
      staff: 5,
      size: ''
    });
    setDrawerOpen(false);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col gap-5">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5 tracking-tight">
            Warehouses
            <span className="text-[12px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full border border-blue-100">
              {warehouses.length} total
            </span>
          </h1>
          <p className="text-[11px] font-bold text-gray-400 mt-0.5 tracking-wide uppercase">
            Facility Capacity & Stock Allocation Management
          </p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[12px] rounded-xl shadow-md shadow-blue-100 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5 self-start sm:self-auto border-none cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Warehouse
        </button>
      </div>

      {/* ── High-Level Overview KPIs Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1 */}
        <div className="bg-gradient-to-br from-white to-[#f8fafc] rounded-xl p-4 border border-gray-100/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Facilities</p>
            <h3 className="text-xl font-bold text-gray-800 mt-1.5">{stats.total} Warehouses</h3>
            <span className="text-[9.5px] font-bold text-blue-600 bg-blue-50/70 border border-blue-100 px-1.5 py-0.5 rounded mt-1.5 inline-block">
              100% Operational
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21V9M14 21V3M9 21V9M4 21V12" />
            </svg>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-gradient-to-br from-white to-[#f8fafc] rounded-xl p-4 border border-gray-100/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Avg Capacity Used</p>
            <h3 className="text-xl font-bold text-gray-800 mt-1.5">{stats.avgCapacity}%</h3>
            <div className="w-24 bg-gray-200 h-1.5 rounded-full mt-2 relative overflow-hidden">
              <div 
                className={`absolute h-full rounded-full ${stats.avgCapacity >= 80 ? 'bg-red-500' : stats.avgCapacity >= 65 ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: `${stats.avgCapacity}%` }}
              ></div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-gradient-to-br from-white to-[#f8fafc] rounded-xl p-4 border border-gray-100/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Storage Items</p>
            <h3 className="text-xl font-bold text-gray-800 mt-1.5">{stats.totalSkus.toLocaleString()} SKUs</h3>
            <span className="text-[9.5px] font-bold text-amber-600 bg-amber-50/70 border border-amber-100 px-1.5 py-0.5 rounded mt-1.5 inline-block">
              Across all categories
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-gradient-to-br from-white to-[#f8fafc] rounded-xl p-4 border border-gray-100/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Critical Capacity</p>
            <h3 className="text-xl font-bold text-gray-800 mt-1.5">{stats.criticalCount} Facilities</h3>
            <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded mt-1.5 inline-block ${stats.criticalCount > 0 ? 'text-red-600 bg-red-50 border border-red-100' : 'text-gray-500 bg-gray-50'}`}>
              {stats.criticalCount > 0 ? 'Requires attention (>80%)' : 'All spaces clear'}
            </span>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stats.criticalCount > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Search & Pill Filters Toolbar ── */}
      <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code, manager, location..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none text-gray-600 placeholder:text-gray-400 font-medium"
          />
        </div>

        {/* Filter Pills & Dropdown */}
        <div className="flex flex-wrap items-center gap-3.5">
          <div className="flex items-center bg-gray-50 rounded-lg p-0.5">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-md border-none cursor-pointer transition-all ${statusFilter === 'ALL' ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-400 hover:text-gray-600'}`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('HIGH_CAPACITY')}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-md border-none cursor-pointer transition-all ${statusFilter === 'HIGH_CAPACITY' ? 'bg-white text-red-500 shadow-sm' : 'bg-transparent text-gray-400 hover:text-red-500/80'}`}
            >
              High Cap
            </button>
            <button
              onClick={() => setStatusFilter('FULL')}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-md border-none cursor-pointer transition-all ${statusFilter === 'FULL' ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-400 hover:text-gray-600'}`}
            >
              Full
            </button>
          </div>

          {/* Sort */}
          <div className="relative flex items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase mr-2 tracking-wider">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-600 text-[11px] font-bold py-1.5 pl-3 pr-8 rounded-lg outline-none focus:ring-1 focus:ring-blue-100 cursor-pointer transition-all shadow-sm"
            >
              <option value="CODE">Warehouse Code</option>
              <option value="CAPACITY_DESC">Capacity (Highest)</option>
              <option value="SKUS_DESC">SKU Volume</option>
            </select>
            <svg className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Warehouse Cards Interactive Grid ── */}
      {filteredWarehouses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredWarehouses.map((wh) => (
            <div 
              key={wh.id} 
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Header Box */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-white to-[#fcfdfe]">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-lg tracking-wider">
                    {wh.id}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#86efac] animate-pulse"></span>
                    <span className="text-[10px] font-bold text-gray-400 tracking-tight uppercase">{wh.status}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${wh.capacity >= 90 ? 'bg-red-50 text-red-500 border border-red-100' : wh.capacity >= 75 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                  {wh.capacity}% Full
                </span>
              </div>

              {/* Card Contents */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <h3 className="text-[15px] font-bold text-gray-800 tracking-tight">{wh.name}</h3>
                  <p className="text-[11px] font-medium text-gray-400 mt-0.5">{wh.location}</p>
                </div>

                {/* Progress capacity gauge line */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold text-gray-500">
                    <span>Storage Utilization</span>
                    <span>{wh.capacity}%</span>
                  </div>
                  <div className="w-full bg-[#f3f4f6] h-2.5 rounded-full overflow-hidden relative">
                    <div 
                      className={`absolute h-full rounded-full transition-all duration-700 ${wh.color === 'red' ? 'bg-[#ef4444]' : wh.color === 'amber' ? 'bg-[#f97316]' : 'bg-[#10b981]'}`}
                      style={{ width: `${wh.capacity}%` }}
                    ></div>
                  </div>
                </div>

                {/* Detail Attributes List */}
                <div className="grid grid-cols-2 gap-3 py-1.5 border-t border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-[9.5px] font-bold flex items-center justify-center shrink-0">
                      {getInitials(wh.manager)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight leading-none">Manager</p>
                      <p className="text-[11.5px] font-bold text-gray-700 truncate mt-0.5 leading-none">{wh.manager}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight leading-none">Storage size</p>
                    <p className="text-[11.5px] font-bold text-gray-700 mt-0.5 leading-none">{wh.size}</p>
                  </div>

                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight leading-none">SKU items</p>
                    <p className="text-[11.5px] font-bold text-gray-700 mt-0.5 leading-none">{wh.skus} Categories</p>
                  </div>

                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight leading-none">Active Staff</p>
                    <p className="text-[11.5px] font-bold text-gray-700 mt-0.5 leading-none">{wh.staff} Operators</p>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3.5 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
                <button className="text-[11.5px] font-bold text-blue-600 hover:text-blue-700 hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1 transition-all">
                  Manage Stock
                  <span>→</span>
                </button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all border-none bg-transparent cursor-pointer">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-800">No Warehouses Found</h3>
          <p className="text-xs font-semibold text-gray-400 max-w-xs mt-1 leading-normal">
            No warehouses matched your search query or filters. Clear your filters or create a new warehouse.
          </p>
        </div>
      )}

      {/* ── Slide-Over "Add Warehouse" Drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay Dim Backdrop */}
          <div 
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity duration-300"
          ></div>

          {/* Drawer container panel */}
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-out z-50">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-800 tracking-tight">Create Warehouse</h3>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5 tracking-wide uppercase">Add operational facility details</p>
              </div>
              <button 
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all border-none bg-transparent cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleAddWarehouse} className="flex-1 overflow-y-auto p-6 flex flex-col justify-between gap-5">
              <div className="space-y-4">
                {/* ID Input */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Warehouse Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WH-KL-06"
                    value={newWh.id}
                    onChange={(e) => setNewWh({...newWh, id: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl text-xs outline-none font-semibold text-gray-700"
                  />
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Warehouse Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Klang Valley Distribution Hub"
                    value={newWh.name}
                    onChange={(e) => setNewWh({...newWh, name: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl text-xs outline-none font-semibold text-gray-700"
                  />
                </div>

                {/* Location Input */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Location / City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Selangor"
                    value={newWh.location}
                    onChange={(e) => setNewWh({...newWh, location: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl text-xs outline-none font-semibold text-gray-700"
                  />
                </div>

                {/* Size Area Input */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Storage Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 18,500 sq ft"
                    value={newWh.size}
                    onChange={(e) => setNewWh({...newWh, size: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl text-xs outline-none font-semibold text-gray-700"
                  />
                </div>

                {/* Staff Count Input */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Active Staff Count</label>
                  <input
                    type="number"
                    min="1"
                    value={newWh.staff}
                    onChange={(e) => setNewWh({...newWh, staff: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl text-xs outline-none font-semibold text-gray-700"
                  />
                </div>

                {/* Capacity Slide Range */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Storage Capacity Utilized</label>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{newWh.capacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newWh.capacity}
                    onChange={(e) => setNewWh({...newWh, capacity: e.target.value})}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Manager Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Assigned Manager</label>
                  <div className="relative">
                    <select
                      value={newWh.manager}
                      onChange={(e) => setNewWh({...newWh, manager: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl text-xs outline-none font-semibold text-gray-700 appearance-none cursor-pointer"
                    >
                      {MANAGERS.map(manager => (
                        <option key={manager} value={manager}>{manager}</option>
                      ))}
                    </select>
                    <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center gap-3.5 border-t border-gray-100 pt-4 mt-8">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-600 font-bold text-[12px] rounded-xl transition-all border-none cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-[12px] rounded-xl shadow-md shadow-blue-100 hover:shadow-lg transition-all border-none cursor-pointer text-center"
                >
                  Save Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehousePage;
