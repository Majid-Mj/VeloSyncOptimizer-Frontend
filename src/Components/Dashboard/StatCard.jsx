import React from 'react';

const StatCard = ({ icon, label, value, trend, trendType = 'up' }) => {
  const isNeutral = trendType === 'neutral';
  const isDown = trendType === 'down';
  const isUp = trendType === 'up';

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow cursor-default">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${
            isUp ? 'bg-green-50 text-green-600' : 
            isDown ? 'bg-red-50 text-red-600' : 
            'bg-gray-50 text-gray-400'
          }`}>
            <span>{isUp ? '▲' : isDown ? '▼' : '—'}</span>
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-800 tracking-tight">{value}</div>
        <div className="text-[11px] font-semibold text-gray-400 mt-0.5 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
};

export default StatCard;
