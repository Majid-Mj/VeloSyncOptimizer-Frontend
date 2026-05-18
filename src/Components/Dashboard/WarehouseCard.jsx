import React from 'react';

const WarehouseCard = ({ id, location, skus, capacity, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-emerald-500',
    green: 'bg-emerald-500',
    red: 'bg-red-500',
    amber: 'bg-amber-500'
  };

  return (
    <div className="bg-white rounded-2xl p-4.5 border border-gray-100 min-w-[210px] w-[210px] shrink-0 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center gap-2">
        {/* Light green status dot indicating active/online state */}
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]"></div>
        <div className="text-[12.5px] font-bold text-gray-800 leading-none">{id}</div>
      </div>
      <div className="text-[10.5px] text-gray-400 font-semibold tracking-wide leading-none">{location} · {skus} SKUs</div>
      
      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-1.5">
        <div className={`h-full ${colorMap[color]} transition-all duration-500`} style={{ width: `${capacity}%` }}></div>
      </div>
      <div className="text-[9.5px] font-bold text-gray-400 mt-0.5 leading-none">{capacity}% capacity</div>
    </div>
  );
};

export default WarehouseCard;
