import React from 'react';

const StatCard = ({ icon, label, value, trend, trendType = 'up', color = 'blue' }) => {
  const isNeutral = trendType === 'neutral';
  const isDown = trendType === 'down';
  const isUp = trendType === 'up';

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-gray-50 text-gray-500'
  };

  const trendClasses = {
    up: 'bg-green-50 text-green-600',
    down: 'bg-red-50 text-red-600',
    neutral: 'bg-gray-50 text-gray-400'
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-5 hover:shadow-md transition-all duration-300 cursor-default group">
      <div className="flex items-center justify-between">
        {/* Icon with light shaded background */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 duration-300 ${colorClasses[color]}`}>
          <div className="scale-110">{icon}</div>
        </div>
        
        {/* Trend tag with light background and colored text */}
        {trend && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold ${trendClasses[trendType]}`}>
            <span className="text-[10px]">{isUp ? '▲' : isDown ? '▼' : '—'}</span>
            <span>{trend}</span>
          </div>
        )}
      </div>
      
      <div>
        <div className="text-3xl font-black text-gray-900 tracking-tight leading-none">{value}</div>
        <div className="text-[12px] font-bold text-gray-400 mt-2 uppercase tracking-wide">{label}</div>
      </div>
    </div>
  );
};

export default StatCard;
