import React from 'react';

const StatCard = ({ icon, label, value, trend, trendType = 'up', color = 'blue' }) => {
  const isNeutral = trendType === 'neutral';
  const isDown = trendType === 'down';
  const isUp = trendType === 'up';

  const colorClasses = {
    blue: {
      icon: 'bg-blue-100 text-blue-700',
      card: 'from-white to-blue-100/40'
    },
    green: {
      icon: 'bg-green-100 text-green-700',
      card: 'from-white to-green-100/40'
    },
    amber: {
      icon: 'bg-amber-100 text-amber-700',
      card: 'from-white to-amber-100/40'
    },
    red: {
      icon: 'bg-red-100 text-red-700',
      card: 'from-white to-red-100/40'
    },
    gray: {
      icon: 'bg-gray-100 text-gray-700',
      card: 'from-white to-gray-200/30'
    }
  };

  return (
    <div className={`bg-gradient-to-br rounded-2xl p-4 shadow shadow-gray-200/50 border border-gray-200/60 flex flex-col gap-3 hover:shadow-lg transition-all duration-300 cursor-default group relative overflow-hidden ${colorClasses[color].card}`}>
      {/* Decorative subtle background circle */}
      <div className={`absolute -right-2 -top-2 w-16 h-16 rounded-full opacity-[0.12] pointer-events-none transition-transform duration-700 group-hover:scale-150 ${colorClasses[color].icon.split(' ')[0]}`}></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-300 shadow-sm ${colorClasses[color].icon}`}>
          <div className="scale-90">{icon}</div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black shadow-sm ${
            isUp ? 'bg-green-600 text-white' : 
            isDown ? 'bg-red-600 text-white' : 
            'bg-gray-200 text-gray-700'
          }`}>
            <span>{isUp ? '▲' : isDown ? '▼' : '—'}</span>
            <span>{trend}</span>
          </div>
        )}
      </div>
      
      <div className="relative z-10">
        <div className="text-2xl font-black text-gray-900 tracking-tight">{value}</div>
        <div className="text-[11px] font-bold text-gray-500 mt-1 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
};

export default StatCard;
