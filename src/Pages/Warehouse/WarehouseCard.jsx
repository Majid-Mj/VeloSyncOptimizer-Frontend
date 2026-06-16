import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const WarehouseCard = ({ wh, isAdmin, onDelete, onEdit, onViewDetails, onToggleActive }) => {
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
    const presets = [
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-violet-500 to-purple-600',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-pink-600'
    ];
    const charCode = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return presets[charCode % presets.length];
  };

  const managerGradient = getManagerGradient(wh.manager);

  return (
    <div className={`premium-card bg-white hover:shadow-[0_20px_40px_rgba(16,24,40,0.035)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group ${
      !wh.isActive ? 'border-[#eff1f5] opacity-70' : 'border-[#eff1f5]'
    }`}>

      {/* Header Info */}
      <div className="px-5 py-4 border-b border-[#eff1f5] flex items-center justify-between bg-slate-50/20">
        <div className="flex items-center gap-2.5">
          <span className={`text-[10.5px] font-black px-2.5 py-1 rounded-xl tracking-wider border ${
            wh.isActive 
              ? 'bg-[#f0ebff] border-indigo-100 text-[#704efe]' 
              : 'bg-slate-100 border-slate-200 text-slate-500'
          }`}>
            {wh.id}
          </span>
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              !wh.isActive
                ? 'bg-slate-400'
                : wh.status === 'FULL'
                  ? 'bg-rose-500'
                  : 'bg-emerald-500'
            }`}></span>
            <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">
              {wh.isActive ? wh.status : 'INACTIVE'}
            </span>
          </div>
        </div>

        <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-full border ${
          !wh.isActive
            ? 'bg-slate-50 text-slate-500 border-slate-200'
            : wh.capacity >= 90
              ? 'bg-rose-50 text-rose-600 border-rose-100'
              : wh.capacity >= 75
                ? 'bg-amber-50 text-amber-600 border-amber-100'
                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
        }`}>
          {wh.isActive ? `${wh.capacity}% Occupied` : 'Offline'}
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
            <span className={!wh.isActive ? 'text-slate-400' : wh.capacity >= 90 ? 'text-rose-600' : 'text-slate-660'}>
              {wh.isActive ? `${wh.capacity}%` : '0%'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative border border-slate-200/20 shadow-3xs">
            {wh.isActive && (
              <div
                className={`absolute h-full rounded-full transition-all duration-700 ${
                  wh.color === 'red'
                    ? 'bg-gradient-to-r from-rose-500 to-red-600'
                    : wh.color === 'amber'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                      : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                }`}
                style={{ width: `${wh.capacity}%` }}
              ></div>
            )}
          </div>
        </div>

        {/* Spec indicators grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 py-3 border-t border-b border-slate-100/80">

          {/* Manager Block */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${managerGradient} text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-3xs select-none`}>
              {getInitials(wh.manager)}
            </div>
            <div className="min-w-0">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Manager</p>
              <p className="text-[10.5px] font-extrabold text-slate-700 truncate leading-none mt-1">
                {wh.manager || 'Unassigned'}
              </p>
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

          {/* Stock Volume */}
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Stock On Hand</p>
            <p className="text-[11px] font-black text-slate-700 mt-1 leading-none">{wh.stockOnHand?.toLocaleString() || 0} Units</p>
          </div>

        </div>
      </div>
      {/* Footer controls */}
      <div className="px-5 py-4 bg-slate-50/20 border-t border-[#eff1f5] flex items-center justify-between">
        {canManageStock ? (
          <button
            onClick={handleManageStock}
            className="text-[11.5px] font-black text-[#704efe] hover:text-[#5c3edd] bg-transparent border-none cursor-pointer flex items-center gap-1 transition-all uppercase tracking-wider"
          >
            Manage Stock →
          </button>
        ) : (
          <button
            disabled
            className="text-[10px] font-black text-slate-400 bg-transparent border-none cursor-not-allowed flex items-center gap-1 select-none uppercase tracking-wider"
            title="Manage stock restricted to assigned manager"
          >
            🔒 Restricted View
          </button>
        )}

        {/* Admin actions block */}
        <div className="flex items-center gap-1">
          {/* View Details */}
          <button
            onClick={() => onViewDetails(wh)}
            title="View Facility Details"
            className="p-2 hover:bg-slate-100/60 text-slate-455 hover:text-indigo-600 rounded-2xl transition-all border-none bg-transparent cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {isAdmin && (
            <>
              {/* Edit Warehouse */}
              <button
                onClick={() => onEdit(wh)}
                title="Edit Warehouse Details"
                className="p-2 hover:bg-slate-100/60 text-slate-455 hover:text-indigo-600 rounded-2xl transition-all border-none bg-transparent cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </button>

              {/* Toggle Active Status */}
              <button
                onClick={() => onToggleActive(wh)}
                title={wh.isActive ? "Deactivate Warehouse" : "Activate Warehouse"}
                className={`p-2 hover:bg-slate-100/60 rounded-2xl transition-all border-none bg-transparent cursor-pointer ${
                  wh.isActive ? 'text-slate-455 hover:text-rose-500' : 'text-emerald-500 hover:text-emerald-600'
                }`}
              >
                {wh.isActive ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </button>

              {/* Delete Warehouse */}
              <button
                onClick={() => onDelete(wh.dbId)}
                title="Delete Warehouse (Soft Delete)"
                className="p-2 hover:bg-rose-50 text-slate-455 hover:text-rose-600 rounded-2xl transition-all border-none bg-transparent cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarehouseCard;
