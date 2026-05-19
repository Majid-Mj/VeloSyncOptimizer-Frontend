import React from 'react';

const WarehouseCard = ({ wh, isAdmin, onDelete }) => {
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 flex flex-col overflow-hidden">
      {/* Header Info */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-white to-[#fcfdfe]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-lg tracking-wider">
            {wh.id}
          </span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#86efac] animate-pulse"></span>
            <span className="text-[10px] font-bold text-gray-400 tracking-tight uppercase">{wh.status}</span>
          </div>
        </div>

        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${wh.capacity >= 90 ? 'bg-red-50 text-red-500 border border-red-100' : wh.capacity >= 75 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
          {wh.capacity}% Full
        </span>
      </div>

      {/* Main Body */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-bold text-gray-800 tracking-tight">{wh.name}</h3>
          <p className="text-[11px] font-medium text-gray-400 mt-0.5">{wh.location}</p>
        </div>

        {/* Capacity utilization meter bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold text-gray-500">
            <span>Storage Utilization</span>
            <span>{wh.capacity}%</span>
          </div>
          <div className="w-full bg-[#f3f4f6] h-2.5 rounded-full overflow-hidden relative">
            <div
              className={`absolute h-full rounded-full transition-all duration-700 ${wh.color === 'red' ? 'bg-[#ef4444]' : wh.color === 'amber' ? 'bg-[#f97316]' : 'bg-[#10b981]'}`}
              style={{ width: `${wh.capacity}%` }}
            ></div>
          </div>
        </div>

        {/* Dynamic spec indicators grid */}
        <div className="grid grid-cols-2 gap-3 py-1.5 border-t border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-[9.5px] font-bold flex items-center justify-center shrink-0">
              {getInitials(wh.manager)}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight leading-none">Manager</p>
              <p className="text-[11.5px] font-bold text-gray-700 truncate mt-0.5 leading-none">{wh.manager}</p>
            </div>
          </div>

          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight leading-none">Storage size</p>
            <p className="text-[11.5px] font-bold text-gray-700 mt-0.5 leading-none">{wh.size}</p>
          </div>

          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight leading-none">SKU items</p>
            <p className="text-[11.5px] font-bold text-gray-700 mt-0.5 leading-none">{wh.skus} Categories</p>
          </div>

          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight leading-none">Active Staff</p>
            <p className="text-[11.5px] font-bold text-gray-700 mt-0.5 leading-none">{wh.staff} Operators</p>
          </div>
        </div>
      </div>

      {/* Footer controls */}
      <div className="px-5 py-3.5 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
        <button className="text-[11.5px] font-bold text-blue-600 hover:text-blue-700 hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1 transition-all">
          Manage Stock
          <span>→</span>
        </button>
        <div className="flex items-center gap-1">
          {isAdmin && (
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${wh.name}?`)) {
                  onDelete(wh.dbId);
                }
              }}
              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border-none bg-transparent cursor-pointer"
              title="Delete Warehouse"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all border-none bg-transparent cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarehouseCard;
