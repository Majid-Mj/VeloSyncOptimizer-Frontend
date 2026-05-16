import React from 'react';
import { useSelector } from 'react-redux';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
      <p className="text-sm text-green-500 mt-1 flex items-center gap-2">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        Real-time overview — connected via SignalR
      </p>
      
      {user && (
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-2xl">
          <h2 className="text-lg font-bold text-gray-800 mb-4">User Information</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Name</span>
              <span className="text-sm font-medium text-gray-800">{user.firstName} {user.lastName}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Email</span>
              <span className="text-sm font-medium text-gray-800">{user.email}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Role</span>
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[11px] uppercase tracking-wider font-black">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-10 border-2 border-dashed border-gray-200 rounded-3xl p-20 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
          </svg>
        </div>
        <h3 className="text-gray-500 font-medium italic">Content area — ready for widgets</h3>
        <p className="text-gray-400 text-xs mt-2 max-w-xs">Sidebar navigation is now active. Click the links on the left to see the route changes.</p>
      </div>
    </div>
  );
};

export default DashboardPage;
