import React from 'react';

const WarehouseComparison = ({
  sourceWh,
  destWh,
  activeProductName,
  sourceStockNow,
  destStockNow,
  sourceCapacity,
  destCapacity,
  srcCapStyle,
  dstCapStyle
}) => {
  return (
    <div className="flex items-center gap-3 w-[916px] mb-3 flex-shrink-0">
      {/* Source Warehouse Info */}
      <div 
        className="flex-1 border rounded-[10px] py-1.5 px-3 transition-all duration-300"
        style={{ 
          borderColor: srcCapStyle.borderHex || '#fca5a5', 
          background: srcCapStyle.bgHex || '#fef2f2' 
        }}
      >
        <div className="text-[8.5px] font-extrabold uppercase tracking-wider mb-0.5 flex justify-between items-center">
          <span style={{ color: srcCapStyle.labelHex || '#991b1b' }}>Source warehouse</span>
          <span className="text-slate-500">{sourceCapacity}% capacity · {srcCapStyle.status || 'Status'}</span>
        </div>
        <div className="text-sm font-extrabold text-slate-900">{sourceWh?.code || 'WH-KL-01'}</div>
        <div className="text-[10px] font-semibold text-slate-500 mb-1">
          {sourceWh?.city || 'Facility'} · {activeProductName}: <span className="font-extrabold text-slate-700">{sourceStockNow}</span> units
        </div>
        <div className="h-1 bg-slate-200/70 rounded-full overflow-hidden mb-0.5">
          <div 
            className="h-full rounded-full transition-all duration-500" 
            style={{ 
              width: `${sourceCapacity}%`, 
              backgroundColor: srcCapStyle.barHex || '#ef4444' 
            }}
          ></div>
        </div>
      </div>

      {/* Transfer Arrow */}
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-400 flex-shrink-0 shadow-sm">
        <svg className="w-3.5 h-3.5 stroke-current stroke-[2.5] fill-none" viewBox="0 0 16 16">
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </div>

      {/* Destination Warehouse Info */}
      <div 
        className="flex-1 border rounded-[10px] py-1.5 px-3 transition-all duration-300"
        style={{ 
          borderColor: dstCapStyle.borderHex || '#86efac', 
          background: dstCapStyle.bgHex || '#f0fdf4' 
        }}
      >
        <div className="text-[8.5px] font-extrabold uppercase tracking-wider mb-0.5 flex justify-between items-center">
          <span style={{ color: dstCapStyle.labelHex || '#166534' }}>Destination warehouse</span>
          <span className="text-slate-500">{destCapacity}% capacity · {dstCapStyle.status || 'Status'}</span>
        </div>
        <div className="text-sm font-extrabold text-slate-900">{destWh?.code || 'WH-JB-03'}</div>
        <div className="text-[10px] font-semibold text-slate-500 mb-1">
          {destWh?.city || 'Facility'} · {activeProductName}: <span className="font-extrabold text-slate-700">{destStockNow}</span> units
        </div>
        <div className="h-1 bg-slate-200/70 rounded-full overflow-hidden mb-0.5">
          <div 
            className="h-full rounded-full transition-all duration-500" 
            style={{ 
              width: `${destCapacity}%`, 
              backgroundColor: dstCapStyle.barHex || '#22c55e' 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseComparison;
