import React from 'react';

const WarehouseCard = ({ id, location, skus, capacity, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-blue-600',
    green: 'bg-green-500',
    red: 'bg-red-500',
    amber: 'bg-amber-500'
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 min-w-[180px] flex-1">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-1.5 h-1.5 rounded-full ${colorMap[color]}`}></div>
        <div className="text-[11px] font-bold text-gray-800">{id}</div>
      </div>
      <div className="text-[10px] text-gray-400 mb-4">{location} · {skus} SKUs</div>
      
      <div className="w-full bg-gray-50 h-1 rounded-full overflow-hidden mb-1.5">
        <div className={`h-full ${colorMap[color]} transition-all duration-500`} style={{ width: `${capacity}%` }}></div>
      </div>
      <div className="text-[9px] font-bold text-gray-500">{capacity}% capacity</div>
    </div>
  );
};

export default WarehouseCard;
