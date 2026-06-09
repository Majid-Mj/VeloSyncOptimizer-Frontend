import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ReportsHeader from './components/ReportsHeader';
import ReportsTabs from './components/ReportsTabs';
import ReportsFilterBar from './components/ReportsFilterBar';
import ReportsMetrics from './components/ReportsMetrics';
import ReportsMovementChart from './components/ReportsMovementChart';
import ReportsWarehouseTable from './components/ReportsWarehouseTable';
import reportsApi from '../../api/reports.api';
import warehouseApi from '../../api/warehouse.api';

const ReportsPage = () => {
  const { user } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [timeRange, setTimeRange] = useState('30 days');
  const [dateRange, setDateRange] = useState({ from: '01-04-2024', to: '27-04-2024' });
  
  // Warehouse selection state
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  
  // Reports API data state
  const [analytics, setAnalytics] = useState(null);
  const [movementChart, setMovementChart] = useState([]);
  const [warehousePerformance, setWarehousePerformance] = useState([]);
  
  const [loading, setLoading] = useState(true);

  // Parse days from timeRange pill
  const getDaysCount = (range) => {
    switch (range) {
      case '7 days': return 7;
      case '30 days': return 30;
      case '90 days': return 90;
      default: return 30;
    }
  };

  // 1. Fetch available warehouses on mount if Admin or ProcurementOfficer
  useEffect(() => {
    const loadWarehouses = async () => {
      if (user?.role === 'WarehouseManager') {
        // Warehouse Manager is locked to their own warehouse
        setSelectedWarehouseId(user.warehouseId ? user.warehouseId.toString() : '');
        return;
      }
      
      try {
        const response = await warehouseApi.getAll();
        if (response && response.isSuccess && response.data) {
          setWarehouses(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch warehouses list:', err);
      }
    };

    loadWarehouses();
  }, [user]);

  // 2. Fetch reports data dynamically when filters change
  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const days = getDaysCount(timeRange);
      const whId = selectedWarehouseId ? Number(selectedWarehouseId) : null;
      
      const response = await reportsApi.getReportsData({ warehouseId: whId, days });
      
      if (response && response.isSuccess && response.data) {
        const { analytics, movementChart, warehousePerformance } = response.data;
        setAnalytics(analytics);
        setMovementChart(movementChart);
        setWarehousePerformance(warehousePerformance);
      }
    } catch (err) {
      console.error('Failed to load reports analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, [selectedWarehouseId, timeRange]);

  const handleExportCSV = () => {
    alert('Exporting current report data to CSV format...');
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col gap-6 relative select-none animate-fade-in">
      
      {/* ── Header Section ── */}
      <ReportsHeader onExportCSV={handleExportCSV} />

      {/* ── Segment Tabs Bar ── */}
      <ReportsTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* ── Sub-Filters Bar (with Loading indicators) ── */}
      <ReportsFilterBar 
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        warehouses={warehouses}
        selectedWarehouseId={selectedWarehouseId}
        onWarehouseChange={setSelectedWarehouseId}
        showWarehousePicker={user?.role !== 'WarehouseManager'}
      />

      {/* ── Metric Cards Grid ── */}
      <ReportsMetrics 
        analytics={analytics} 
        loading={loading} 
      />

      {/* ── Double Column Grid (Charts & Table) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ReportsMovementChart 
          movementData={movementChart} 
          loading={loading}
          onExportCSV={handleExportCSV} 
        />
        <ReportsWarehouseTable 
          performanceData={warehousePerformance} 
          loading={loading}
          onExportCSV={handleExportCSV} 
        />
      </div>

    </div>
  );
};

export default ReportsPage;
