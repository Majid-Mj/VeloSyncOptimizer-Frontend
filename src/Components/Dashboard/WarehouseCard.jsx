import React from 'react';

const WarehouseCard = ({ id, location, skus, capacity, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-[#10b981]',
    green: 'bg-[#10b981]',
    red: 'bg-[#ef4444]',
    amber: 'bg-[#f97316]'
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 min-w-[200px] w-[200px] shrink-0 flex flex-col gap-1.5 shadow-sm">
      <div className="flex items-center gap-2 mb-0.5">
        {/* Soft light green dot */}
        <div className="w-[6px] h-[6px] rounded-full bg-[#86efac]"></div>
        <div className="text-[12.5px] font-extrabold text-gray-800 tracking-tight leading-none">{id}</div>
      </div>
      <div className="text-[10.5px] text-gray-400 font-medium tracking-wide leading-none">{location} · {skus} SKUs</div>
      
      <div className="w-full bg-[#f3f4f6] h-[5px] rounded-full overflow-hidden mt-2.5">
        <div className={`h-full ${colorMap[color]} transition-all duration-500`} style={{ width: `${capacity}%` }}></div>
      </div>
      <div className="text-[10px] font-bold text-gray-500 mt-1 leading-none">{capacity}% capacity</div>
    </div>
  );
};

export default WarehouseCard;
