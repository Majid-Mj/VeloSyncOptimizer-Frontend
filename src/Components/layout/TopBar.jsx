import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../../Store/authSlice';
import warehouseApi from '../../api/warehouse.api';
import { authApi } from '../../api/auth.api';

const TopBar = ({ onMenuClick }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // References
  const dropdownRef = useRef(null);

  // Dynamic states
  const [timeStr, setTimeStr] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [warehouseName, setWarehouseName] = useState('Loading facility...');

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

  useEffect(() => {
    if (user?.warehouseId) {
      warehouseApi.getAll().then((res) => {
        if (res && res.isSuccess && res.data) {
          const matched = res.data.find(w => Number(w.id) === Number(user.warehouseId));
          if (matched) {
            setWarehouseName(`${matched.name} (${matched.code})`);
          } else {
            setWarehouseName(`Warehouse ID: ${user.warehouseId}`);
          }
        }
      }).catch((err) => {
        console.error("Failed to load warehouse name:", err);
        setWarehouseName(`Warehouse ID: ${user.warehouseId}`);
      });
    }
  }, [user?.warehouseId]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isDropdownOpen]);

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

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("API logout call failed:", err);
    }
    dispatch(logout());
    navigate('/login');
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

        {/* Dynamic Context Title */}
        <div className="hidden sm:flex items-center">
          <span className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
            {currentContext.title}
          </span>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4.5">

        {/* Live Pulse Digital Clock */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-100/80 px-3 py-1.5 rounded-xl font-mono text-[10px] font-black text-slate-500 uppercase tracking-widest">
          <span>Time: {timeStr}</span>
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
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 pl-3 border-l border-slate-100 cursor-pointer select-none hover:opacity-85 transition-opacity"
          >
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-black text-slate-800 tracking-tight leading-none uppercase">
                {user?.firstName} {user?.lastName}
              </p>
              <span className="text-[8.5px] font-bold text-indigo-500/80 uppercase tracking-wider block mt-0.5 leading-none">
                {getRoleLabel(user?.role)}
              </span>
            </div>

            <div
              className="w-9 h-9 rounded-xl bg-black text-white text-xs font-black flex items-center justify-center hover:scale-105 transition-transform shrink-0 border border-slate-100"
            >
              {getInitials(user)}
            </div>
          </div>

          {/* Dynamic Profile Dropdown Popover */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-md border border-slate-100 shadow-xl rounded-2xl p-4.5 z-50 flex flex-col gap-3.5 animate-slide-in">
              {/* Header detail block */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-50">
                <div className="w-10 h-10 rounded-xl bg-black text-white text-xs font-black flex items-center justify-center shrink-0 border border-slate-100">
                  {getInitials(user)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-tight truncate leading-none">
                    {user?.firstName} {user?.lastName}
                  </h4>
                  <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider block mt-1.5 leading-none">
                    {getRoleLabel(user?.role)}
                  </span>
                </div>
              </div>

              {/* Profile Fields section */}
              <div className="flex flex-col gap-2.5 text-[10px] font-bold text-slate-500">
                {user?.email && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[8px] uppercase tracking-wider text-slate-400">Email Address</span>
                    <span className="text-slate-700 truncate">{user.email}</span>
                  </div>
                )}
                {user?.warehouseId && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[8px] uppercase tracking-wider text-slate-400">Assigned Facility</span>
                    <span className="text-slate-700">{warehouseName}</span>
                  </div>
                )}
              </div>

              {/* Action logout button */}
              <button
                onClick={handleLogout}
                className="mt-1 w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 hover:border-rose-200 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-3xs"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default TopBar;
