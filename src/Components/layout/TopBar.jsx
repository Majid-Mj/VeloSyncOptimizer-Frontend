import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSignalR } from '../../context/SignalRContext';
import { logout } from '../../Store/authSlice';
import warehouseApi from '../../api/warehouse.api';
import { authApi } from '../../api/auth.api';
import alertsApi from '../../api/alerts.api';

const TopBar = ({ onMenuClick }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const connection = useSignalR();

  // References
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Dynamic states
  const [timeStr, setTimeStr] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [warehouseName, setWarehouseName] = useState('Loading facility...');
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // LocalStorage helper for read alerts persistence
  const getReadAlertIds = () => {
    try {
      return JSON.parse(localStorage.getItem('read_alert_ids') || '[]');
    } catch {
      return [];
    }
  };

  const markAlertAsRead = (id) => {
    try {
      const current = getReadAlertIds();
      if (!current.includes(id)) {
        const updated = [...current, id];
        localStorage.setItem('read_alert_ids', JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Failed to save read alert:', err);
    }
  };

  const handleMarkAllRead = () => {
    alerts.forEach(a => markAlertAsRead(a.id));
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
    setUnreadCount(0);
  };

  const fetchAlerts = async () => {
    try {
      const response = await alertsApi.getAlerts({
        warehouseId: user?.warehouseId || null,
        unreadOnly: false
      });
      if (response && response.isSuccess && response.data) {
        const readIds = getReadAlertIds();
        const mapped = response.data.map(alert => {
          let sev = alert.severity?.toUpperCase() || 'LOW';
          if (sev === 'MEDIUM') sev = 'MED';
          if (sev === 'CRITICAL') sev = 'HIGH';

          return {
            id: alert.id,
            productId: alert.productId,
            warehouseId: alert.warehouseId,
            severity: sev,
            title: alert.quantityOnHand === 0 ? 'Stockout' : (alert.quantityOnHand < (alert.reorderPoint ?? 0) ? 'Low Stock Warning' : 'Stock Restored'),
            sub: alert.message || 'Product quantity below safety levels.',
            createdAt: new Date(alert.createdAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            isRead: readIds.includes(alert.id)
          };
        });
        setAlerts(mapped);
        setUnreadCount(mapped.filter(a => !a.isRead).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  // Clock updating loop
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

  // Facility name fetching
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

  // Notifications loader & SignalR sync
  useEffect(() => {
    fetchAlerts();

    if (!connection) return;

    const handleStockAlert = (newAlert) => {
      console.log('TopBar received StockAlert SignalR event:', newAlert);

      const readIds = getReadAlertIds();
      let sev = newAlert.severityId === 1 ? 'HIGH' : newAlert.severityId === 2 ? 'MED' : 'LOW';

      const mappedAlert = {
        id: newAlert.id || Date.now(),
        productId: newAlert.productId,
        warehouseId: newAlert.warehouseId,
        severity: sev,
        title: newAlert.quantityOnHand === 0 ? 'Stockout' : (newAlert.quantityOnHand < (newAlert.reorderPoint ?? 0) ? 'Low Stock Warning' : 'Stock Restored'),
        sub: newAlert.message || 'Product quantity below safety levels.',
        createdAt: new Date(newAlert.timestamp || new Date()).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        isRead: readIds.includes(newAlert.id)
      };

      setAlerts(prev => {
        const exists = prev.some(a => a.id === mappedAlert.id || (a.productId === mappedAlert.productId && a.warehouseId === mappedAlert.warehouseId));
        let updated;
        if (exists) {
          updated = prev.map(a => (a.id === mappedAlert.id || (a.productId === mappedAlert.productId && a.warehouseId === mappedAlert.warehouseId)) ? mappedAlert : a);
        } else {
          updated = [mappedAlert, ...prev];
        }
        setUnreadCount(updated.filter(a => !a.isRead).length);
        return updated;
      });
    };

    connection.on('StockAlert', handleStockAlert);

    return () => {
      connection.off('StockAlert', handleStockAlert);
    };
  }, [user, connection]);

  // Click outside listener for multiple popovers
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
    };

    if (isDropdownOpen || isNotificationsOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isDropdownOpen, isNotificationsOpen]);

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
      ProcurementOfficer: 'Procurement Manager',
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
    <header className="h-20 bg-[#f4f5f9]/85 backdrop-blur-md flex items-center justify-between px-6 md:px-10 sticky top-0 z-40">

      {/* Breadcrumb & Context Label */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-all border-none bg-transparent cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>

      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-5">

        {/* Live Pulse Digital Clock */}
        <div className="hidden md:flex items-center gap-2 bg-white border border-[#eff1f5] px-3.5 py-2 rounded-2xl font-mono text-[10.5px] font-bold text-slate-500 uppercase tracking-wider shadow-sm shadow-black/[0.01]">
          <span>Time: {timeStr}</span>
        </div>

        {/* Notifications Icon with Interactive Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`relative p-2.5 rounded-2xl border transition-all bg-transparent cursor-pointer shadow-sm ${isNotificationsOpen
                ? 'text-[#704efe] bg-white border-[#eff1f5]'
                : 'text-slate-400 hover:bg-white hover:text-slate-800 border-transparent hover:border-[#eff1f5]'
              }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#704efe] rounded-full border border-white animate-pulse"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-md border border-[#eff1f5] shadow-2xl rounded-3xl p-4 z-50 flex flex-col gap-3.5 animate-slide-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <h4 className="text-[12.5px] font-black text-[#11121d] uppercase tracking-wider">
                    Notifications
                  </h4>
                  {unreadCount > 0 && (
                    <span className="text-[9px] font-bold text-[#704efe] uppercase tracking-wider mt-0.5 block">
                      {unreadCount} unread alert{unreadCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[9.5px] font-black text-[#704efe] hover:underline bg-transparent border-none cursor-pointer uppercase tracking-wider"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Scrollable list */}
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                {alerts.length === 0 ? (
                  <div className="py-8 text-center text-slate-450 font-bold text-[10.5px]">
                    No notifications yet.
                  </div>
                ) : (
                  alerts.slice(0, 5).map(alert => {
                    const alertColors = {
                      HIGH: 'bg-rose-50 text-rose-700 border-rose-100',
                      CRITICAL: 'bg-rose-50 text-rose-700 border-rose-100',
                      MED: 'bg-amber-50 text-amber-700 border-amber-100',
                      LOW: 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    };
                    const colorClass = alertColors[alert.severity] || 'bg-slate-50 text-slate-700';

                    return (
                      <div
                        key={alert.id}
                        onClick={() => {
                          markAlertAsRead(alert.id);
                          setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, isRead: true } : a));
                          setUnreadCount(prev => Math.max(0, prev - (alert.isRead ? 0 : 1)));
                          navigate('/dashboard');
                        }}
                        className={`p-3 rounded-2xl border text-[11px] cursor-pointer transition-all hover:scale-[1.01] flex flex-col gap-1 ${alert.isRead
                            ? 'bg-slate-50/50 border-slate-100 text-slate-600 opacity-75'
                            : `${colorClass} font-bold`
                          }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[9.5px] font-black uppercase tracking-wider">
                            {alert.title}
                          </span>
                          <span className="text-[8.5px] text-slate-400 font-semibold">
                            {alert.createdAt}
                          </span>
                        </div>
                        <p className="text-[10px] leading-tight mt-0.5">{alert.sub}</p>
                      </div>
                    );
                  })
                )}
              </div>

              {alerts.length > 5 && (
                <div className="text-center pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      navigate('/dashboard');
                    }}
                    className="text-[10px] font-black text-[#704efe] hover:underline bg-transparent border-none cursor-pointer uppercase tracking-wider"
                  >
                    View all alerts
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Node Profile Block */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 pl-4 border-l border-slate-200/80 cursor-pointer select-none hover:opacity-90 transition-opacity"
          >
            <div className="text-right hidden sm:block">
              <p className="text-[12px] font-extrabold text-[#11121d] tracking-tight leading-none uppercase">
                {user?.firstName} {user?.lastName}
              </p>
              <span className="text-[9px] font-bold text-[#704efe] uppercase tracking-wider block mt-1 leading-none">
                {getRoleLabel(user?.role)}
              </span>
            </div>

            <div
              className="w-10 h-10 rounded-2xl bg-[#e5f3ff] text-[#0066ff] text-[12px] font-black flex items-center justify-center hover:scale-105 transition-transform shrink-0 border border-[#b2daff]/40 shadow-sm"
            >
              {getInitials(user)}
            </div>
          </div>

          {/* Dynamic Profile Dropdown Popover */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-md border border-[#eff1f5] shadow-2xl rounded-3xl p-5 z-50 flex flex-col gap-4 animate-slide-in">
              {/* Header detail block */}
              <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100">
                <div className="w-11 h-11 rounded-2xl bg-[#e5f3ff] text-[#0066ff] text-[12px] font-black flex items-center justify-center shrink-0 border border-[#b2daff]/40 shadow-sm">
                  {getInitials(user)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13px] font-black text-[#11121d] uppercase tracking-tight truncate leading-none">
                    {user?.firstName} {user?.lastName}
                  </h4>
                  <span className="text-[9.5px] font-bold text-[#704efe] uppercase tracking-wider block mt-1.5 leading-none">
                    {getRoleLabel(user?.role)}
                  </span>
                </div>
              </div>

              {/* Profile Fields section */}
              <div className="flex flex-col gap-3 text-[11px] font-bold text-slate-500">
                {user?.email && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[8.5px] uppercase tracking-wider text-slate-400 font-extrabold">Email Address</span>
                    <span className="text-slate-700 truncate font-semibold">{user.email}</span>
                  </div>
                )}
                {user?.warehouseId && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[8.5px] uppercase tracking-wider text-slate-400 font-extrabold">Assigned Facility</span>
                    <span className="text-slate-700 font-semibold">{warehouseName}</span>
                  </div>
                )}
              </div>

              {/* Action logout button */}
              <button
                onClick={handleLogout}
                className="mt-1 w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-650 border border-rose-100 hover:border-rose-200 font-black text-[10.5px] uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-rose-500/[0.02]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
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
