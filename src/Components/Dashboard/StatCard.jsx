import React from 'react';

const StatCard = ({ icon, label, value, trend, trendType = 'up', color = 'blue' }) => {
  const isUp = trendType === 'up';
  const isDown = trendType === 'down';

  // HSL tailored color palette based on mockup
  const colorConfigs = {
    indigo: {
      iconBg: 'bg-[#f0ebff]',
      iconText: 'text-[#704efe]'
    },
    blue: {
      iconBg: 'bg-[#e5f3ff]',
      iconText: 'text-[#0066ff]'
    },
    green: {
      iconBg: 'bg-[#ebf8f2]',
      iconText: 'text-[#10b981]'
    },
    emerald: {
      iconBg: 'bg-[#ebf8f2]',
      iconText: 'text-[#10b981]'
    },
    amber: {
      iconBg: 'bg-[#fff8eb]',
      iconText: 'text-[#f59e0b]'
    },
    rose: {
      iconBg: 'bg-[#fff5f5]',
      iconText: 'text-[#fa5252]'
    },
    red: {
      iconBg: 'bg-[#fff5f5]',
      iconText: 'text-[#fa5252]'
    }
  };

  const currentColors = colorConfigs[color] || colorConfigs.blue;

  const trendClasses = {
    up: 'bg-[#e8fbf0] text-[#10b981]',
    down: 'bg-[#fff5f5] text-[#fa5252]',
    neutral: 'bg-slate-100 text-slate-600'
  };

  return (
    <div className="bg-white border border-[#eff1f5] rounded-3xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.012)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(16,24,40,0.03)] hover:-translate-y-0.5 group flex flex-col justify-between min-h-[142px]">
      
      {/* 1. Top row: Icon Badge */}
      <div className="flex items-center">
        <div className={`w-9.5 h-9.5 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1 ${currentColors.iconBg} ${currentColors.iconText}`}>
          {React.cloneElement(icon, { className: 'w-4.5 h-4.5' })}
        </div>
      </div>

      {/* 2. Middle section: Label & Value */}
      <div className="mt-3 flex-1 flex flex-col justify-center">
        <span className="text-[9.5px] font-black text-[#8a8b9d] uppercase tracking-wider leading-none">
          {label}
        </span>
        <span className="text-[22px] font-black text-[#11121d] tracking-tight mt-1.5 leading-none">
          {value}
        </span>
      </div>

      {/* 3. Bottom row: Trend Pill & Description */}
      {trend && (
        <div className="mt-3.5 flex items-center gap-2 border-t border-slate-50 pt-2.5">
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black tracking-wide ${trendClasses[trendType] || trendClasses.neutral}`}>
            <span className="text-[7.5px]">{isUp ? '▲' : isDown ? '▼' : '■'}</span>
            <span>{trend.replace(' vs last mo', '').replace('Awaiting admin approval', 'Pending').replace('Needs supplier follow-up', 'Urgent').replace('Personal activity summary', 'Personal').replace('Budget awareness metric', 'Budget').replace('Live DB Sync', 'Sync OK').replace('Live DB Valuation', 'Value OK').replace('100% capacity OK', 'Optimal').replace('critical stockouts', 'Critical').replace('new warnings', 'Warning')}</span>
          </span>
          <span className="text-[9.5px] font-bold text-[#8a8b9d]">
            {trend.toLowerCase().includes('approval') || trend.toLowerCase().includes('follow-up') 
              ? 'Status' 
              : trend.toLowerCase().includes('db')
              ? 'Database State'
              : 'Than Last Month'}
          </span>
        </div>
      )}

    </div>
  );
};

export default StatCard;
