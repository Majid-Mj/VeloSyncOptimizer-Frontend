import React from 'react';

const StatCard = ({ icon, label, value, trend, trendType = 'up', color = 'blue' }) => {
  const isNeutral = trendType === 'neutral';
  const isDown = trendType === 'down';
  const isUp = trendType === 'up';

  // Beautiful tinted card backgrounds and matching border strokes
  const cardBgClasses = {
    blue: 'bg-[#eff6ff]/60 border-[#dbeafe]/80 hover:bg-[#eff6ff]/80 transition-all',
    green: 'bg-[#f0fdf4]/60 border-[#dcfce7]/80 hover:bg-[#f0fdf4]/80 transition-all',
    amber: 'bg-[#fffbeb]/60 border-[#fef3c7]/80 hover:bg-[#fffbeb]/80 transition-all',
    red: 'bg-[#fef2f2]/60 border-[#fee2e2]/80 hover:bg-[#fef2f2]/80 transition-all',
    gray: 'bg-gray-50/60 border-gray-200/80 hover:bg-gray-50/80 transition-all'
  };

  // Vivid matching text/icon stroke colors
  const textClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
    gray: 'text-gray-500'
  };

  const trendClasses = {
    up: 'bg-green-100/60 text-green-700 border border-green-200/40',
    down: 'bg-red-100/60 text-red-700 border border-red-200/40',
    neutral: 'bg-gray-100/60 text-gray-500 border border-gray-200/40'
  };

  return (
    <div className={`rounded-2xl p-4 shadow-sm border flex flex-col gap-3.5 hover:shadow-md transition-all duration-300 cursor-default group ${cardBgClasses[color]}`}>
      <div className="flex items-center justify-between">
        {/* Elevated white icon card floating inside the tinted background */}
        <div className={`w-9.5 h-9.5 bg-white border border-white/50 rounded-xl flex items-center justify-center shadow-sm shrink-0 transition-transform group-hover:scale-105 duration-300 ${textClasses[color]}`}>
          <div className="scale-105">{icon}</div>
        </div>

        {/* Trend tag with light background and colored text */}
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${trendClasses[trendType]}`}>
            <span className="text-[9px]">{isUp ? '▲' : isDown ? '▼' : '—'}</span>
            <span>{trend}</span>
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl font-black text-gray-900 tracking-tight leading-none">{value}</div>
        <div className="text-[10.5px] font-bold text-gray-400 mt-1.5 uppercase tracking-wide">{label}</div>
      </div>
    </div>
  );
};

export default StatCard;
