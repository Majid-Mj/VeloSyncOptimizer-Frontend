import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../Store/authSlice';

const NAV_SECTIONS = [
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
                label: 'Reorder suggestions',
                path: '/dashboard/reorder-suggestions',
                badge: 4,
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
                label: 'Suppliers',
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
                label: 'Reports',
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
    return (f + l).toUpperCase() || 'AM';
};

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const user = useSelector((s) => s.auth.user);

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <aside className="w-[190px] min-w-[190px] h-screen bg-[#16213E] flex flex-col sticky top-0 overflow-y-auto scrollbar-none">

            {/* ── Brand ── */}
            <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/[0.06]">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-[16px] h-[16px]" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.8">
                        <rect x="1" y="7" width="14" height="8" rx="1" />
                        <path d="M4 7V5a4 4 0 018 0v2" />
                        <line x1="8" y1="10" x2="8" y2="13" />
                    </svg>
                </div>
                <div>
                    <div className="text-white text-[14px] font-semibold leading-tight tracking-tight">VeloSync</div>
                    <div className="text-white/40 text-[9px] font-medium mt-0.5">Inventory Optimizer</div>
                </div>
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 py-2 overflow-y-auto">
                {NAV_SECTIONS.map((section) => (
                    <div key={section.label} className="mb-0.5">

                        {/* Section label */}
                        <p className="text-[9px] font-bold tracking-[0.05em] text-white/30 uppercase px-4 pt-2.5 pb-1">
                            {section.label}
                        </p>

                        {/* Nav items */}
                        {section.items.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <button
                                    key={item.key}
                                    onClick={() => navigate(item.path)}
                                    className={`
                    relative w-full flex items-center gap-2 px-4 py-2
                    text-[12px] text-left border-none cursor-pointer
                    transition-all duration-150
                    ${active
                                            ? 'bg-[#4285F4]/20 text-white font-semibold'
                                            : 'bg-transparent text-white/50 font-medium hover:bg-white/[0.06] hover:text-white/85'
                                        }
                  `}
                                >
                                    {/* Active indicator bar */}
                                    {active && (
                                        <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#4285F4] rounded-r-sm" />
                                    )}

                                    {/* Icon */}
                                    <span className="flex items-center shrink-0 scale-90">{item.icon}</span>

                                    {/* Label */}
                                    <span className="flex-1 truncate">{item.label}</span>

                                    {/* Badge */}
                                    {item.badge && (
                                        <span className="bg-red-600 text-white text-[9px] font-semibold px-1 py-px rounded-full min-w-[16px] text-center leading-none">
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* ── User Footer ── */}
            <div className="border-t border-white/[0.06] px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                    {/* Avatar */}
                    <div className="w-[30px] h-[30px] rounded-full bg-[#4285F4] text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
                        {getInitials(user)}
                    </div>
                    {/* Info */}
                    <div className="overflow-hidden">
                        <div className="text-white text-[12px] font-semibold truncate">
                            {user?.firstName} {user?.lastName}
                        </div>
                        <div className="text-white/40 text-[10px] font-medium mt-0.5 truncate">
                            {getRoleLabel(user?.role)}
                        </div>
                    </div>
                </div>

                {/* Sign out */}
                <button
                    onClick={handleLogout}
                    className="text-white/35 text-[11px] bg-transparent border-none cursor-pointer p-0 hover:text-white/70 transition-colors duration-150"
                >
                    Sign out →
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
