import React from 'react';

const StatCard = ({ icon, label, value, trend, trendType = 'up', color = 'blue' }) => {
  const isNeutral = trendType === 'neutral';
  const isDown = trendType === 'down';
  const isUp = trendType === 'up';

  // Soft, color-coded shaded backgrounds for each card's icon pill
  const iconClasses = {
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
    <div className="bg-gradient-to-br from-white to-[#f8fafc] hover:to-[#f1f5f9] rounded-2xl p-4 shadow-sm border border-gray-100/90 flex flex-col gap-3.5 hover:shadow-md transition-all duration-300 cursor-default group">
      <div className="flex items-center justify-between">
        {/* Color-coded shaded background icon pill */}
        <div className={`w-9.5 h-9.5 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-300 ${iconClasses[color]}`}>
          <div className="scale-105">{icon}</div>
        </div>

        {/* Trend tag with light background and colored text */}
        {trend && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${trendClasses[trendType]}`}>
            <span className="text-[9px]">{isUp ? '▲' : isDown ? '▼' : '—'}</span>
            <span>{trend}</span>
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl font-bold text-gray-900 tracking-tight leading-none">{value}</div>
        <div className="text-[11px] font-bold text-gray-400 mt-1.5 uppercase tracking-wide">{label}</div>
      </div>
    </div>
  );
};

export default StatCard;
