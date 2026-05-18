import React from 'react';

const WarehouseCard = ({ id, location, skus, capacity, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-[#10b981]',
    green: 'bg-[#10b981]',
    red: 'bg-[#ef4444]',
    amber: 'bg-[#f97316]'
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 min-w-[210px] w-[210px] shrink-0 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center gap-2 mb-0.5">
        {/* Soft light green dot */}
        <div className="w-[7px] h-[7px] rounded-full bg-[#86efac]"></div>
        <div className="text-[13px] font-extrabold text-gray-800 tracking-tight leading-none">{id}</div>
      </div>
      <div className="text-[11px] text-gray-400 font-medium tracking-wide leading-none">{location} · {skus} SKUs</div>
      
      <div className="w-full bg-[#f3f4f6] h-[6px] rounded-full overflow-hidden mt-3">
        <div className={`h-full ${colorMap[color]} transition-all duration-500`} style={{ width: `${capacity}%` }}></div>
      </div>
      <div className="text-[11px] font-bold text-gray-500 mt-1.5 leading-none">{capacity}% capacity</div>
    </div>
  );
};

export default WarehouseCard;
