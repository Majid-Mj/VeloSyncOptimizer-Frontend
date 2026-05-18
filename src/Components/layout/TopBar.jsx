import React from 'react';
import { useSelector } from 'react-redux';

const TopBar = () => {
  const { user } = useSelector((state) => state.auth);

  const getInitials = (user) => {
    const f = user?.firstName?.[0] ?? '';
    const l = user?.lastName?.[0] ?? '';
    return (f + l).toUpperCase() || 'AM';
  };

  return (
    <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-8 sticky top-0 z-10">
      {/* Breadcrumb / Title */}
      <div className="text-sm font-semibold text-gray-500">Dashboard</div>

      {/* Right side actions */}
      <div className="flex items-center gap-5">
        {/* Search */}
        <div className="relative group hidden md:block">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-1.5 bg-gray-50 border-none rounded-full text-xs focus:ring-1 focus:ring-blue-500 w-40 lg:w-60 transition-all outline-none text-gray-600 placeholder:text-gray-400 font-medium"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded-xl transition-all border border-transparent hover:border-gray-100">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-3 pl-2 border-l border-gray-100">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shadow-sm shadow-blue-200 cursor-pointer hover:scale-105 transition-transform">
            {getInitials(user)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
