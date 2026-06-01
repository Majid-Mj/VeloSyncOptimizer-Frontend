import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../Store/authSlice';
import reorderApi from '../../api/reorder.api';

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
        label: 'INVENTORY',
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
        ],
    },
    {
        label: 'PROCUREMENT',
        items: [
            {
                key: 'reorder-suggestions',
                label: 'Reorder Engine',
                path: '/dashboard/reorder-suggestions',
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
    };
    return map[role] ?? 'User';
};

const getInitials = (user) => {
    const f = user?.firstName?.[0] ?? '';
    const l = user?.lastName?.[0] ?? '';
    return (f + l).toUpperCase() || 'VS';
};

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const user = useSelector((s) => s.auth.user);
    const [reorderCount, setReorderCount] = useState(0);

    const isActive = (path) => location.pathname === path;

    useEffect(() => {
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

        if (user) {
            fetchReorderCount();
        }

        const handleSuggestionsUpdate = () => {
            if (user) {
                fetchReorderCount();
            }
        };

        window.addEventListener('reorder-suggestions-updated', handleSuggestionsUpdate);
        return () => {
            window.removeEventListener('reorder-suggestions-updated', handleSuggestionsUpdate);
        };
    }, [user]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
        if (onClose) onClose();
    };

    return (
        <aside className={`
          fixed inset-y-0 left-0 z-50 lg:static lg:z-auto
          w-[240px] min-w-[240px] h-screen bg-[#0f172a] border-r border-slate-800/80 flex flex-col 
          transition-transform duration-300 ease-in-out scrollbar-none overflow-y-auto shadow-xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>

            {/* ── Brand / Header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                    <img 
                        src="/logo.png" 
                        alt="VeloSync" 
                        className="w-8.5 h-8.5 object-contain shrink-0" 
                    />
                    <div>
                        <div className="text-white text-[13px] font-black leading-tight tracking-wider uppercase">VeloSync</div>
                        <div className="text-indigo-400/60 text-[9px] font-bold mt-0.5 uppercase tracking-widest">Inventory Opt</div>
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

            {/* ── Navigation List ── */}
            <nav className="flex-1 py-3 overflow-y-auto">
                {NAV_SECTIONS.map((section) => {
                    const filteredItems = section.items.filter(item => {
                        if (item.key === 'suppliers' && user?.role === 'WarehouseManager') {
                            return false;
                        }
                        return true;
                    });

                    if (filteredItems.length === 0) return null;

                    return (
                        <div key={section.label} className="mb-2">

                            {/* Section label */}
                            <p className="text-[9px] font-black tracking-widest text-slate-500 uppercase px-5 pt-3 pb-1">
                                {section.label}
                            </p>

                            {/* Nav items */}
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
                                        relative w-full flex items-center gap-3 px-5 py-2.5
                                        text-[12px] text-left border-none cursor-pointer
                                        transition-all duration-150 group
                                        ${active
                                                ? 'bg-indigo-600/15 text-white font-black'
                                                : 'bg-transparent text-slate-400 font-bold hover:bg-slate-800/40 hover:text-slate-100 hover:translate-x-0.5'
                                            }
                                    `}
                                    >
                                        {/* Active indicator bar */}
                                        {active && (
                                            <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-500 rounded-r-md" />
                                        )}

                                        {/* Icon */}
                                        <span className={`flex items-center shrink-0 scale-90 ${active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                                            }`}>{item.icon}</span>

                                        {/* Label */}
                                        <span className="flex-1 truncate">{item.label}</span>

                                        {/* Badge */}
                                        {item.key === 'reorder-suggestions' ? (
                                            reorderCount > 0 && (
                                                <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[15px] text-center leading-none animate-fade-in">
                                                    {reorderCount}
                                                </span>
                                            )
                                        ) : (
                                            item.badge && (
                                                <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[15px] text-center leading-none">
                                                    {item.badge}
                                                </span>
                                            )
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    );
                })}

                {/* ── Admin Specific Navigation ── */}
                {user?.role === 'Admin' && (
                    <div className="mb-2 animate-fade-in">
                        <p className="text-[9px] font-black tracking-widest text-slate-500 uppercase px-5 pt-3 pb-1">
                            ADMINISTRATION
                        </p>
                        <button
                            onClick={() => {
                                navigate('/dashboard/user-approvals');
                                if (onClose) onClose();
                            }}
                            className={`
                                relative w-full flex items-center gap-3 px-5 py-2.5
                                text-[12px] text-left border-none cursor-pointer
                                transition-all duration-150 group
                                ${isActive('/dashboard/user-approvals')
                                    ? 'bg-indigo-600/15 text-white font-black'
                                    : 'bg-transparent text-slate-400 font-bold hover:bg-slate-800/40 hover:text-slate-100 hover:translate-x-0.5'
                                }
                            `}
                        >
                            {isActive('/dashboard/user-approvals') && (
                                <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-500 rounded-r-md" />
                            )}
                            <span className={`flex items-center shrink-0 scale-90 ${isActive('/dashboard/user-approvals') ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                                }`}>
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </span>
                            <span className="flex-1 truncate">User Approvals</span>
                        </button>
                    </div>
                )}
            </nav>

            {/* ── User Footer ── */}
            <div className="border-t border-slate-800/60 px-5 py-4 bg-slate-950/20 flex-shrink-0">
                <div className="flex items-center gap-2.5 mb-2.5">
                    {/* Avatar with gradient */}
                    <div className="w-[32px] h-[32px] rounded-xl bg-black text-white text-[11px] font-black flex items-center justify-center shrink-0 border border-slate-800 select-none">
                        {getInitials(user)}
                    </div>
                    {/* Info */}
                    <div className="overflow-hidden">
                        <div className="text-white text-[11.5px] font-black truncate uppercase leading-none">
                            {user?.firstName} {user?.lastName}
                        </div>
                        <div className="text-slate-400 text-[9.5px] font-bold mt-1.5 truncate uppercase tracking-wider leading-none">
                            {getRoleLabel(user?.role)}
                        </div>
                    </div>
                </div>

                {/* Sign out */}
                <button
                    onClick={handleLogout}
                    className="text-slate-500 text-[10px] font-black uppercase tracking-wider bg-transparent border-none cursor-pointer p-0 hover:text-indigo-400 transition-colors duration-150"
                >
                    Sign out →
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
