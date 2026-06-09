import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const WarehouseCard = ({ wh, isAdmin, onDelete, onEditManager }) => {
  const { user } = useSelector(state => state.auth);
  const userRole = user?.role;
  const managerWarehouseId = user?.warehouseId;
  const navigate = useNavigate();

  // A user can manage stock if:
  // 1. They are an Administrator (Admin).
  // 2. They are a WarehouseManager AND this warehouse matches their assigned warehouseId.
  const isOwnWarehouse = userRole === 'WarehouseManager' && managerWarehouseId === wh.dbId;
  const canManageStock = userRole === 'Admin' || isOwnWarehouse;

  const handleManageStock = () => {
    if (!canManageStock) return;
    navigate('/dashboard/stock-levels', { state: { preselectedWarehouseId: wh.dbId } });
  };

  const getInitials = (name) => {
    if (!name || name === 'Unassigned') return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Automated gradient for the manager avatar tag
  const getManagerGradient = (name) => {
    if (!name || name === 'Unassigned') return 'from-slate-400 to-slate-500';
    const charCode = name.charCodeAt(0);
    const presets = [
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-violet-500 to-purple-600',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-pink-600'
    ];
    return presets[charCode % presets.length];
  };

  const managerGradient = getManagerGradient(wh.manager);

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100/90 shadow-3xs hover:shadow-md hover:scale-[1.015] active:scale-[0.995] transition-all duration-300 flex flex-col overflow-hidden group">

      {/* Header Info */}
      <div className="px-5 py-3.5 border-b border-slate-100/60 flex items-center justify-between bg-slate-55/30">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded-lg tracking-wider">
            {wh.id}
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${wh.status === 'FULL' ? 'bg-rose-500' : 'bg-emerald-500'
              }`}></span>
            <span className="text-[9.5px] font-black text-slate-400 tracking-wider uppercase">{wh.status}</span>
          </div>
        </div>

        <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-full border ${wh.capacity >= 90
            ? 'bg-rose-50 text-rose-600 border-rose-100'
            : wh.capacity >= 75
              ? 'bg-amber-50 text-amber-600 border-amber-100'
              : 'bg-emerald-50 text-emerald-600 border-emerald-100'
          }`}>
          {wh.capacity}% Occupied
        </span>
      </div>

      {/* Main Body */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">

        {/* Title Details */}
        <div>
          <h3 className="text-[14px] font-black text-slate-800 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
            {wh.name}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[10px] text-slate-400">📍</span>
            <span className="text-[10px] font-bold text-slate-400 truncate">{wh.location}</span>
          </div>
        </div>

        {/* Capacity utilization meter bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-wider">
            <span>Storage Utilization</span>
            <span className={wh.capacity >= 90 ? 'text-rose-600' : 'text-slate-655'}>{wh.capacity}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative border border-slate-200/20 shadow-3xs">
            <div
              className={`absolute h-full rounded-full transition-all duration-700 ${wh.color === 'red'
                  ? 'bg-gradient-to-r from-rose-500 to-red-600'
                  : wh.color === 'amber'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                    : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                }`}
              style={{ width: `${wh.capacity}%` }}
            ></div>
          </div>
        </div>

        {/* Dynamic spec indicators grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 py-3 border-t border-b border-slate-100/80">

          {/* Manager Block */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${managerGradient} text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-3xs select-none`}>
              {getInitials(wh.manager)}
            </div>
            <div className="min-w-0">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Manager</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10.5px] font-extrabold text-slate-700 truncate leading-none">
                  {wh.manager || 'Unassigned'}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => onEditManager(wh)}
                    className="p-0.5 text-indigo-500 hover:text-indigo-700 bg-transparent border-none cursor-pointer leading-none"
                    title="Change Manager"
                  >
                    ✎
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Dimension Area */}
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Storage size</p>
            <p className="text-[11px] font-black text-slate-700 mt-1 leading-none">{wh.size}</p>
          </div>

          {/* SKU Count */}
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Stock SKUs</p>
            <p className="text-[11px] font-black text-slate-700 mt-1 leading-none">{wh.skus} Categories</p>
          </div>

          {/* Operators */}
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Active Staff</p>
            <p className="text-[11px] font-black text-slate-700 mt-1 leading-none">{wh.staff} Operators</p>
          </div>

        </div>
      </div>

      {/* Footer controls */}
      <div className="px-5 py-3 bg-slate-55/40 border-t border-slate-100/60 flex items-center justify-between">
        {canManageStock ? (
          <button
            onClick={handleManageStock}
            className="text-[11px] font-black text-indigo-600 hover:text-indigo-700 bg-transparent border-none cursor-pointer flex items-center gap-1 transition-all uppercase tracking-wider"
          >
            Manage Stock →
          </button>
        ) : (
          <button
            disabled
            className="text-[10px] font-black text-slate-350 bg-transparent border-none cursor-not-allowed flex items-center gap-1 select-none uppercase tracking-wider"
            title="Manage stock restricted to assigned manager"
          >
            🔒 Restricted View
          </button>
        )}

        <div className="flex items-center gap-1">
          {isAdmin && (
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${wh.name}? This will permanently remove the warehouse.`)) {
                  onDelete(wh.dbId);
                }
              }}
              className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border-none bg-transparent cursor-pointer"
              title="Delete Facility"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarehouseCard;
