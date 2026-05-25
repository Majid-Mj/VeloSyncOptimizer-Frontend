import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

const TopBar = ({ onMenuClick }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Dynamic clock state
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setTimeStr(date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getInitials = (u) => {
    const f = u?.firstName?.[0] ?? '';
    const l = u?.lastName?.[0] ?? '';
    return (f + l).toUpperCase() || 'VS';
  };

  const getRoleLabel = (role) => {
    const map = {
      Admin: 'Administrator',
      WarehouseManager: 'Warehouse Manager',
      ProcurementManager: 'Procurement Manager',
    };
    return map[role] ?? 'User';
  };

  // Route mapping to stylized context title
  const getContextTitle = (path) => {
    if (path === '/dashboard') return { title: 'Overview Hub', icon: '📊' };
    if (path === '/dashboard/stock-levels') return { title: 'Stock Levels Monitor', icon: '📦' };
    if (path.includes('/dashboard/stock-movement/transfer')) return { title: 'Cross-Hub Transfer', icon: '🚚' };
    if (path === '/dashboard/stock-movement') return { title: 'Live Audit Ledger', icon: '📥' };
    if (path === '/dashboard/warehouses') return { title: 'Facility Network', icon: '🏢' };
    if (path === '/dashboard/reorder-suggestions') return { title: 'Reorder Suggestions Engine', icon: '⚡' };
    if (path === '/dashboard/purchase-orders') return { title: 'Purchase Orders', icon: '📝' };
    if (path === '/dashboard/suppliers') return { title: 'Suppliers Network', icon: '🤝' };
    if (path === '/dashboard/reports') return { title: 'Analytics & Reports', icon: '📈' };
    if (path === '/dashboard/user-approvals') return { title: 'Pending User Approvals', icon: '👥' };
    return { title: 'VeloSync WMS', icon: '⚡' };
  };

  const currentContext = getContextTitle(location.pathname);

  return (
    <header className="h-16 border-b border-slate-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 shadow-3xs">
      
      {/* Breadcrumb & Context Label */}
      <div className="flex items-center gap-2">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-all border-none bg-transparent cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
        
        {/* Dynamic Context Badge */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-base select-none">{currentContext.icon}</span>
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
            {currentContext.title}
          </span>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4.5">
        
        {/* Live Pulse Digital Clock */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-100/80 px-3 py-1.5 rounded-xl font-mono text-[10px] font-black text-slate-500 uppercase tracking-widest">
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span>Time: {timeStr}</span>
        </div>

        {/* Global Search Input */}
        <div className="relative group hidden lg:block">
          <svg className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search index database..."
            className="pl-9 pr-4 py-2 bg-slate-50/70 border border-slate-200/40 rounded-xl text-xs focus:ring-1 focus:ring-indigo-100 focus:border-indigo-500 focus:bg-white w-48 lg:w-56 transition-all outline-none text-slate-600 placeholder:text-slate-400 font-bold"
          />
        </div>

        {/* Notifications Icon with Glow */}
        <button className="relative p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-all border-none bg-transparent cursor-pointer">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white animate-pulse"></span>
        </button>

        {/* User Node Profile Block */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-black text-slate-800 tracking-tight leading-none uppercase">
              {user?.firstName} {user?.lastName}
            </p>
            <span className="text-[8.5px] font-bold text-indigo-500/80 uppercase tracking-wider block mt-0.5 leading-none">
              {getRoleLabel(user?.role)}
            </span>
          </div>

          <div 
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-black flex items-center justify-center shadow-md shadow-indigo-100 cursor-pointer hover:scale-105 transition-transform shrink-0 select-none"
            title={`${user?.firstName} ${user?.lastName} (${user?.role})`}
          >
            {getInitials(user)}
          </div>
        </div>

      </div>
    </header>
  );
};

export default TopBar;
