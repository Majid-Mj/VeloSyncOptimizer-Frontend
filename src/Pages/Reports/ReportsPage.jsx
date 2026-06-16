import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ReportsHeader from './components/ReportsHeader';
import ReportsTabs from './components/ReportsTabs';
import ReportsFilterBar from './components/ReportsFilterBar';
import ReportsMetrics from './components/ReportsMetrics';
import ReportsMovementChart from './components/ReportsMovementChart';
import ReportsWarehouseTable from './components/ReportsWarehouseTable';
import VelocityReportTab from './components/VelocityReportTab';
import MovementReportTab from './components/MovementReportTab';
import StockoutHistoryTab from './components/StockoutHistoryTab';
import SupplierReportTab from './components/SupplierReportTab';
import AuditLogTab from './components/AuditLogTab';
import reportsApi from '../../api/reports.api';
import warehouseApi from '../../api/warehouse.api';

// Tab id → SP @ReportType value
const TAB_TYPE_MAP = {
  'Overview': 'Overview',
  'Velocity Report': 'VelocityReport',
  'Movement Report': 'MovementReport',
  'Stockout History': 'StockoutHistory',
  'Supplier Report': 'SupplierReport',
  'Audit Log': 'AuditLog',
};

const ReportsPage = () => {
  const { user } = useSelector((state) => state.auth);

  const getThirtyDaysAgo = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  };

  const getToday = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [activeTab, setActiveTab] = useState('Overview');
  const [timeRange, setTimeRange] = useState('30 days');
  const [dateRange, setDateRange] = useState({
    from: getThirtyDaysAgo(),
    to: getToday()
  });
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getDays = (r, dates) => {
    if (r === 'Custom') {
      if (!dates?.from) return 30;
      const fromDate = new Date(dates.from);
      const toDate = dates.to ? new Date(dates.to) : new Date();
      const diffTime = toDate - fromDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 30;
    }
    return r === '7 days' ? 7 : r === '90 days' ? 90 : 30;
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    const today = getToday();
    if (range === '7 days') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setDateRange({ from: d.toISOString().split('T')[0], to: today });
    } else if (range === '30 days') {
      setDateRange({ from: getThirtyDaysAgo(), to: today });
    } else if (range === '90 days') {
      const d = new Date();
      d.setDate(d.getDate() - 90);
      setDateRange({ from: d.toISOString().split('T')[0], to: today });
    }
  };

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
    setTimeRange('Custom');
  };

  // Load warehouse list once
  useEffect(() => {
    if (user?.role === 'WarehouseManager') {
      setSelectedWarehouseId(user.warehouseId?.toString() ?? '');
      return;
    }
    warehouseApi.getAll().then((res) => {
      if (res?.isSuccess) setWarehouses(res.data);
    }).catch(console.error);
  }, [user]);

  // Fetch report whenever tab or filters change
  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setReportData(null);
      try {
        const reportType = TAB_TYPE_MAP[activeTab] ?? 'Overview';
        const days = getDays(timeRange, dateRange);
        const whId = selectedWarehouseId ? Number(selectedWarehouseId) : null;
        const res = await reportsApi.getTabReport({ reportType, days, warehouseId: whId });
        if (res?.isSuccess) setReportData(res.data);
      } catch (err) {
        console.error('Report fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [activeTab, timeRange, dateRange.from, dateRange.to, selectedWarehouseId]);

  const company = reportData?.company;

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col gap-6 select-none animate-fade-in">

      {/* Dynamic Corporate Print-Only Letterhead */}
      {company && (
        <div className="hidden print:flex flex-col gap-4 border-b border-slate-300 pb-6 mb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{company.companyName}</h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  Corporate Inventory Report Ledger
                </p>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-500 font-semibold leading-relaxed">
              <div>{company.companyAddress}</div>
              <div>{company.companyPhone}</div>
              <div>{company.companyEmail}</div>
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-200 pt-4 font-bold uppercase tracking-wider">
            <span>Report Category: <strong className="text-slate-900">{activeTab}</strong></span>
            <span>Period: <strong className="text-slate-900">{timeRange === 'Custom' ? `${dateRange.from} to ${dateRange.to}` : timeRange}</strong></span>
            <span>Generated: <strong className="text-slate-900">{new Date(company.reportGeneratedAt).toLocaleString()}</strong></span>
          </div>
        </div>
      )}

      <div className="no-print">
        <ReportsHeader company={company} />
      </div>

      {/* Company detail bar — shown when data loaded */}
      {company && (
        <div className="no-print bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-1">
          <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{company.companyName}</span>
          <span className="text-[11px] text-slate-400 font-semibold">{company.companyAddress}</span>
          <span className="text-[11px] text-slate-400 font-semibold">{company.companyPhone}</span>
          <span className="text-[11px] text-slate-400 font-semibold">{company.companyEmail}</span>
          <span className="ml-auto text-[10px] text-slate-400 font-semibold">
            Generated: {new Date(company.reportGeneratedAt).toLocaleString()}
          </span>
        </div>
      )}

      <div className="no-print">
        <ReportsTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="no-print">
        <ReportsFilterBar
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          warehouses={warehouses}
          selectedWarehouseId={selectedWarehouseId}
          onWarehouseChange={setSelectedWarehouseId}
          showWarehousePicker={user?.role !== 'WarehouseManager'}
        />
      </div>

      {/* ── Tab Content ── */}
      {activeTab === 'Overview' && (
        <>
          <ReportsMetrics analytics={reportData?.analytics} loading={loading} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ReportsMovementChart movementData={reportData?.movementChart ?? []} loading={loading} />
            <ReportsWarehouseTable performanceData={reportData?.warehousePerformance ?? []} loading={loading} />
          </div>
        </>
      )}

      {activeTab === 'Velocity Report' && <VelocityReportTab data={reportData} loading={loading} />}
      {activeTab === 'Movement Report' && <MovementReportTab data={reportData} loading={loading} />}
      {activeTab === 'Stockout History' && <StockoutHistoryTab data={reportData} loading={loading} />}
      {activeTab === 'Supplier Report' && <SupplierReportTab data={reportData} loading={loading} />}
      {activeTab === 'Audit Log' && <AuditLogTab data={reportData} loading={loading} />}

    </div>
  );
};

export default ReportsPage;
