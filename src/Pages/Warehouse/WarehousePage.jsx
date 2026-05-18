import React, { useState, useMemo } from 'react';
import WarehouseStats from './WarehouseStats';
import WarehouseToolbar from './WarehouseToolbar';
import WarehouseGrid from './WarehouseGrid';
import WarehouseDrawer from './WarehouseDrawer';

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
      <WarehouseGrid filteredWarehouses={filteredWarehouses} />

      {/* ── Slide-Over Form Drawer ── */}
      <WarehouseDrawer 
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        newWh={newWh}
        setNewWh={setNewWh}
        onSubmit={handleAddWarehouse}
        managers={MANAGERS}
      />
    </div>
  );
};

export default WarehousePage;
