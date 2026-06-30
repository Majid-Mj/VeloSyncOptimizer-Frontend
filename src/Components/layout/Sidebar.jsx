import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../Store/authSlice';
import reorderApi from '../../api/reorder.api';
import { authApi } from '../../api/auth.api';
import { userApi } from '../../api/user.api';
import purchaseOrderApi from '../../api/purchaseOrder.api';

const PROCUREMENT_MANAGER_NAV_SECTIONS = [
    {
        label: 'OVERVIEW',
        items: [
            {
                key: 'dashboard',
                label: 'Dashboard',
                path: '/dashboard',
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                ),
            },
        ],
    },
    {
        label: 'PROCUREMENT',
        items: [
            {
                key: 'purchase-orders',
                label: 'Purchase orders',
                path: '/dashboard/purchase-orders',
                badgeType: 'purchase-orders-count',
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                        <rect x="9" y="3" width="6" height="4" rx="1" />
                        <path d="M9 12h6M9 16h4" />
                    </svg>
                ),
            },
            {
                key: 'reorder-suggestions',
                label: 'Reorder queue',
                path: '/dashboard/reorder-suggestions',
                badgeType: 'reorder',
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                ),
            },
            {
                key: 'suppliers',
                label: 'Suppliers',
                path: '/dashboard/suppliers',
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="3" width="15" height="13" />
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                ),
            },
        ],
    },
    {
        label: 'READ-ONLY',
        items: [
            {
                key: 'stock-levels',
                label: 'Stock levels',
                path: '/dashboard/stock-levels',
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 2 7 12 12 22 7 12 2" />
                        <polyline points="2 17 12 22 22 17" />
                        <polyline points="2 12 12 17 22 12" />
                    </svg>
                ),
            }
        ],
    },
];


const NAV_SECTIONS = [
    {
        label: 'OVERVIEW',
        items: [
            {
                key: 'dashboard',
                label: 'Dashboard Hub',
                path: '/dashboard',
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                ),
            },
        ],
    },
    {
        label: 'STOCK',
        items: [
            {
                key: 'stock-levels',
                label: 'Stock levels',
                path: '/dashboard/stock-levels',
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    </svg>
                ),
            },
            {
                key: 'stock-movement',
                label: 'Stock movement',
                path: '/dashboard/stock-movement',
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                ),
            },
            {
                key: 'warehouses',
                label: 'Warehouses',
                path: '/dashboard/warehouses',
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                ),
            },
            {
                key: 'products',
                label: 'Products',
                path: '/dashboard/products',
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                        <line x1="2" y1="8.5" x2="12" y2="15" />
                        <line x1="22" y1="8.5" x2="12" y2="15" />
                        <line x1="12" y1="22" x2="12" y2="15" />
                    </svg>
                ),
            },
        ],
    },
    {
        label: 'PROCUREMENT',
        items: [
            {
                key: 'reorder-suggestions',
                label: 'Reorder Engine',
                path: '/dashboard/reorder-suggestions',
                badgeType: 'reorder',
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                ),
            },
            {
                key: 'purchase-orders',
                label: 'Purchase orders',
                path: '/dashboard/purchase-orders',
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                        <rect x="9" y="3" width="6" height="4" rx="1" />
                        <path d="M9 12h6M9 16h4" />
                    </svg>
                ),
            },
            {
                key: 'suppliers',
                label: 'Suppliers list',
                path: '/dashboard/suppliers',
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                ),
            },
        ],
    },
    {
        label: 'ADMINISTRATION',
        items: [
            {
                key: 'user-management',
                label: 'User Management',
                path: '/dashboard/user-management',
                badgeType: 'pending-users',
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                ),
            },
        ],
    },
    {
        label: 'ANALYTICS',
        items: [
            {
                key: 'reports',
                label: 'Reports & Logs',
                path: '/dashboard/reports',
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                ),
            },
        ],
    },
];

const getRoleLabel = (role) => {
    const map = {
        Admin: 'Administrator',
        WarehouseManager: 'Warehouse Manager',
        ProcurementManager: 'Procurement Manager',
        ProcurementOfficer: 'Procurement Manager',
    };
    return map[role] ?? '';
};

const getDisplayName = (user) => {
    if (!user) return '';
    const first = user.firstName || '';
    const last = user.lastName || '';
    if (last.toLowerCase() === 'user') {
        return first;
    }
    return `${first} ${last}`.trim();
};

const getInitials = (user) => {
    if (!user) return 'VS';
    const first = user.firstName || '';
    const last = user.lastName || '';
    if (last.toLowerCase() === 'user') {
        return first.slice(0, 2).toUpperCase() || 'VS';
    }
    const f = first[0] ?? '';
    const l = last[0] ?? '';
    return (f + l).toUpperCase() || 'VS';
};

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const user = useSelector((s) => s.auth.user);
    const [reorderCount, setReorderCount] = useState(0);
    const [pendingUsersCount, setPendingUsersCount] = useState(0);
    const [pendingPOCount, setPendingPOCount] = useState(0);

    const isActive = (path) => location.pathname === path;

    const isProcurement = user?.role === 'ProcurementOfficer' || user?.role === 'ProcurementManager';
    const isWarehouseManager = user?.role === 'WarehouseManager';

    // Build the nav sections for the current role
    const activeNavSections = isProcurement
        ? PROCUREMENT_MANAGER_NAV_SECTIONS
        : isWarehouseManager
            ? NAV_SECTIONS.map(section => ({
                ...section,
                items: section.items.filter(item => item.key !== 'products'),
              })).filter(section => section.items.length > 0)
            : NAV_SECTIONS;

    const fetchReorderCount = async () => {
        try {
            const warehouseId = user?.role === 'WarehouseManager' ? user?.warehouseId : null;
            const sugRes = await reorderApi.getSuggestions({ isCriticalOnly: false, warehouseId });
            if (sugRes && sugRes.isSuccess && Array.isArray(sugRes.data)) {
                setReorderCount(sugRes.data.length);
            }
        } catch (err) {
            console.error('Failed to fetch reorder suggestions count for sidebar:', err);
        }
    };

    const fetchPendingCount = async () => {
        try {
            if (user?.role === 'Admin') {
                const pendingRes = await userApi.getPendingUsers();
                if (pendingRes && pendingRes.isSuccess && Array.isArray(pendingRes.data)) {
                    setPendingUsersCount(pendingRes.data.length);
                }
            }
        } catch (err) {
            console.error('Failed to fetch pending users count for sidebar:', err);
        }
    };

    const fetchPOCount = async () => {
        try {
            if (isProcurement) {
                const res = await purchaseOrderApi.getAll();
                const orders = Array.isArray(res) ? res : (res?.data || []);
                const pending = orders.filter(o => o.status === 'Draft' || o.status === 'PendingApproval').length;
                setPendingPOCount(pending);
            }
        } catch (err) {
            console.error('Failed to fetch pending PO count for sidebar:', err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchReorderCount();
            fetchPendingCount();
            fetchPOCount();
        }

        const handleSuggestionsUpdate = () => {
            if (user) {
                fetchReorderCount();
            }
        };

        const handlePendingUsersUpdate = () => {
            if (user) {
                fetchPendingCount();
            }
        };

        const handlePOUpdate = () => {
            if (user) {
                fetchPOCount();
            }
        };

        window.addEventListener('reorder-suggestions-updated', handleSuggestionsUpdate);
        window.addEventListener('reorder-badge-update', handleSuggestionsUpdate);
        window.addEventListener('pending-users-updated', handlePendingUsersUpdate);
        window.addEventListener('purchase-orders-updated', handlePOUpdate);
        return () => {
            window.removeEventListener('reorder-suggestions-updated', handleSuggestionsUpdate);
            window.removeEventListener('reorder-badge-update', handleSuggestionsUpdate);
            window.removeEventListener('pending-users-updated', handlePendingUsersUpdate);
            window.removeEventListener('purchase-orders-updated', handlePOUpdate);
        };
    }, [user]);

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } catch (err) {
            console.error("API logout call failed:", err);
        }
        dispatch(logout());
        navigate('/login');
        if (onClose) onClose();
    };

    return (
        <aside className={`
          fixed inset-y-0 left-0 z-50 lg:static lg:z-auto
          w-[250px] min-w-[250px] h-screen bg-[#11121d] border-r border-[#1a1b2d]/60 flex flex-col 
          transition-transform duration-300 ease-in-out overflow-hidden shadow-2xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>

            {/* ── Brand / Header ── */}
            <div className="flex flex-col px-6 py-5 border-b border-[#1c1d30]/50 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="VeloSync"
                            className="w-9 h-9 object-contain shrink-0"
                        />
                        <div>
                            <div className="text-white text-[14px] font-black tracking-wider uppercase leading-none">VeloSync</div>
                            {isProcurement ? (
                                <div className="mt-1.5">
                                    <span className="text-[9px] bg-blue-500/10 border border-blue-500/30 text-blue-400 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        Procurement
                                    </span>
                                </div>
                            ) : (
                                getRoleLabel(user?.role) && (
                                    <div className="text-[#8a8b9d] text-[9.5px] font-bold mt-1.5 uppercase tracking-widest leading-none">{getRoleLabel(user?.role)}</div>
                                )
                            )}
                        </div>
                    </div>
                    {/* Mobile dismiss button */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1 bg-transparent border-none text-slate-400 hover:text-white cursor-pointer active:scale-95 transition-all text-xl leading-none"
                    >
                        &times;
                    </button>
                </div>
            </div>

            {/* ── Navigation List ── */}
            <nav className="flex-1 py-4 overflow-y-auto scrollbar-none flex flex-col gap-1.5">
                {activeNavSections.map((section) => {
                    const filteredItems = section.items.filter(item => {
                        if (isProcurement) return true;
                        if (isWarehouseManager && (item.key === 'suppliers' || item.key === 'products')) {
                            return false;
                        }
                        if (item.key === 'user-management' && user?.role !== 'Admin') {
                            return false;
                        }
                        return true;
                    });

                    if (filteredItems.length === 0) return null;

                    return (
                        <div key={section.label} className="mb-2">

                            {/* Section label */}
                            <p className="text-[9.5px] font-black tracking-wider text-[#8a8b9d]/60 uppercase px-6 pt-3.5 pb-2">
                                {section.label}
                            </p>

                            {/* Nav items */}
                            <div className="flex flex-col gap-1">
                                {filteredItems.map((item) => {
                                    const active = isActive(item.path);
                                    return (
                                        <button
                                            key={item.key}
                                            onClick={() => {
                                                navigate(item.path);
                                                if (onClose) onClose();
                                            }}
                                            className={`
                                            w-[calc(100%-24px)] mx-3 px-4 py-3 text-[13px] rounded-2xl text-left flex items-center gap-3 transition-all duration-150 group border-none cursor-pointer
                                            ${active
                                                ? 'bg-[#202231] text-white font-extrabold shadow-sm shadow-[#202231]/10'
                                                : 'bg-transparent text-[#8a8b9d] font-bold hover:bg-white/[0.03] hover:text-white hover:translate-x-0.5'
                                            }
                                            `}
                                        >
                                            {/* Icon */}
                                            <span className={`flex items-center shrink-0 scale-95 transition-colors ${
                                                active 
                                                    ? 'text-white' 
                                                    : 'text-[#8a8b9d] group-hover:text-slate-300'
                                            }`}>{item.icon}</span>

                                            {/* Label */}
                                            <span className="flex-1 truncate">{item.label}</span>

                                            {/* Badge or Chevron */}
                                            {item.badgeType === 'reorder' ? (
                                                reorderCount > 0 && (
                                                    <span className="bg-rose-500 text-white text-[9.5px] font-black px-1.5 py-0.5 rounded-full min-w-[17px] text-center leading-none animate-fade-in shadow-sm shadow-rose-500/25">
                                                        {reorderCount}
                                                    </span>
                                                )
                                            ) : item.badgeType === 'pending-users' ? (
                                                pendingUsersCount > 0 && (
                                                    <span className="bg-emerald-500 text-white text-[9.5px] font-black px-1.5 py-0.5 rounded-full min-w-[17px] text-center leading-none animate-fade-in shadow-sm shadow-emerald-500/25">
                                                        {pendingUsersCount}
                                                    </span>
                                                )
                                            ) : item.badgeType === 'purchase-orders-count' ? (
                                                pendingPOCount > 0 && (
                                                    <span className="bg-amber-500 text-white text-[9.5px] font-black px-1.5 py-0.5 rounded-full min-w-[17px] text-center leading-none animate-fade-in shadow-sm shadow-amber-500/25 border border-amber-400/20">
                                                        {pendingPOCount}
                                                    </span>
                                                )
                                            ) : (
                                                !active && (
                                                    <span className="text-[10px] text-[#8a8b9d]/30 font-bold ml-auto select-none group-hover:text-[#8a8b9d]/80 transition-all font-mono leading-none">▶</span>
                                                )
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* ── User Footer ── */}
            <div className="border-t border-[#1c1d30]/50 px-6 py-4.5 bg-transparent flex-shrink-0">
                <div className="flex items-center gap-3 mb-3">
                    {/* Avatar with gradient */}
                    <div className="w-[36px] h-[36px] rounded-2xl bg-[#202231] text-white text-[12px] font-black flex items-center justify-center shrink-0 border border-[#2c2e43] select-none">
                        {getInitials(user)}
                    </div>
                    {/* Info */}
                    <div className="overflow-hidden">
                        <div className="text-white text-[12.5px] font-black truncate uppercase leading-none">
                            {getDisplayName(user)}
                        </div>
                        {getRoleLabel(user?.role) && (
                            <div className="text-[#8a8b9d] text-[9.5px] font-bold mt-1.5 truncate uppercase tracking-wider leading-none">
                                {getRoleLabel(user?.role)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sign out */}
                <button
                    onClick={handleLogout}
                    className="text-[#8a8b9d] text-[10.5px] font-black uppercase tracking-wider bg-transparent border-none cursor-pointer p-0 hover:text-white transition-colors duration-150 flex items-center gap-1"
                >
                    Sign out ➔
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
