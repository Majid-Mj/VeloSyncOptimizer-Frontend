import React from 'react';

const ReportsHeader = ({ onExportCSV }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight" id="reports-logs-title">
          Reports & Logs
        </h1>
        <p className="text-[12px] font-bold text-slate-400 mt-0.5 tracking-wide leading-none">
          Analytics, velocity trends, movement history and full audit trail
        </p>
      </div>

      {/* Top Right Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onExportCSV}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10.5px] uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5 border-none"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export all CSV
        </button>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10.5px] uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default ReportsHeader;
