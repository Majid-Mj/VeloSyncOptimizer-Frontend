import React, { useRef } from 'react';

const ReportsFilterBar = ({
  timeRange,
  onTimeRangeChange,
  dateRange,
  onDateRangeChange,
  warehouses = [],
  selectedWarehouseId = '',
  onWarehouseChange,
  showWarehousePicker = true
}) => {
  const timePills = ['7 days', '30 days', '90 days', 'Custom'];
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

      {/* Left side filters (Time Pills & Warehouse Dropdown) */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Time Pills */}
        <div className="flex items-center gap-2">
          {timePills.map((pill) => {
            const isActive = timeRange === pill;
            return (
              <button
                key={pill}
                onClick={() => onTimeRangeChange(pill)}
                className={`px-4 py-1.5 font-black text-[10px] uppercase tracking-wider rounded-full transition-all cursor-pointer border ${isActive
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200 hover:text-slate-800'
                  }`}
              >
                {pill}
              </button>
            );
          })}
        </div>

        {/* Warehouse Dropdown Picker for Admins & Procurement Officers */}
        {showWarehousePicker && (
          <div className="relative">
            <select
              value={selectedWarehouseId}
              onChange={(e) => onWarehouseChange(e.target.value)}
              className="appearance-none bg-white border border-slate-100 rounded-xl px-4 py-1.5 pr-8 text-[11px] font-black text-slate-700 outline-none cursor-pointer hover:border-slate-200 shadow-3xs transition-all"
            >
              <option value="">All Warehouses</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Date Inputs Range */}
      <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-3 py-1.5 shadow-3xs text-[11px] font-bold text-slate-600 max-w-sm">
        <div className="flex items-center gap-1.5">
          <input
            ref={fromInputRef}
            type="date"
            value={dateRange.from || ''}
            onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
            onClick={(e) => e.target.showPicker?.()}
            className="bg-transparent border-none text-slate-700 outline-none text-[11px] font-black w-[110px] cursor-pointer"
          />
          <svg 
            onClick={() => fromInputRef.current?.showPicker?.()}
            className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        <span className="text-slate-400 font-semibold mx-0.5">to</span>

        <div className="flex items-center gap-1.5">
          <input
            ref={toInputRef}
            type="date"
            value={dateRange.to || ''}
            onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
            onClick={(e) => e.target.showPicker?.()}
            className="bg-transparent border-none text-slate-700 outline-none text-[11px] font-black w-[110px] cursor-pointer"
          />
          <svg 
            onClick={() => toInputRef.current?.showPicker?.()}
            className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ReportsFilterBar;
