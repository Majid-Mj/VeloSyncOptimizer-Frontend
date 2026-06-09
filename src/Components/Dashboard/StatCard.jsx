import React from 'react';

const StatCard = ({ icon, label, value, trend, trendType = 'up', color = 'blue' }) => {
  const isUp = trendType === 'up';
  const isDown = trendType === 'down';

  // Beautiful background matching shades, glowing shadows, and thematic borders
  const styleConfigs = {
    blue: {
      cardBg: 'bg-gradient-to-br from-white to-indigo-50/40 hover:to-indigo-50/80',
      border: 'border-slate-100 hover:border-indigo-300/60',
      iconBg: 'bg-indigo-500 text-white shadow-sm shadow-indigo-200',
      glow: 'hover:shadow-[0_10px_20px_-8px_rgba(79,70,229,0.15)]',
      sparkColor: '#4F46E5',
      sparkGradient: 'url(#blueGrad)',
      bgGrad: 'from-indigo-500/5 to-transparent',
    },
    green: {
      cardBg: 'bg-gradient-to-br from-white to-emerald-50/40 hover:to-emerald-50/80',
      border: 'border-slate-100 hover:border-emerald-300/60',
      iconBg: 'bg-emerald-500 text-white shadow-sm shadow-emerald-200',
      glow: 'hover:shadow-[0_10px_20px_-8px_rgba(16,185,129,0.15)]',
      sparkColor: '#0D9488',
      sparkGradient: 'url(#greenGrad)',
      bgGrad: 'from-teal-500/5 to-transparent',
    },
    amber: {
      cardBg: 'bg-gradient-to-br from-white to-amber-50/45 hover:to-amber-50/80',
      border: 'border-slate-100 hover:border-amber-300/60',
      iconBg: 'bg-amber-500 text-white shadow-sm shadow-amber-200',
      glow: 'hover:shadow-[0_10px_20px_-8px_rgba(245,158,11,0.15)]',
      sparkColor: '#D97706',
      sparkGradient: 'url(#amberGrad)',
      bgGrad: 'from-amber-500/5 to-transparent',
    },
    red: {
      cardBg: 'bg-gradient-to-br from-white to-rose-50/40 hover:to-rose-50/80',
      border: 'border-slate-100 hover:border-rose-300/60',
      iconBg: 'bg-rose-500 text-white shadow-sm shadow-rose-200',
      glow: 'hover:shadow-[0_10px_20px_-8px_rgba(225,29,72,0.15)]',
      sparkColor: '#E11D48',
      sparkGradient: 'url(#redGrad)',
      bgGrad: 'from-rose-500/5 to-transparent',
    }
  };

  const currentStyle = styleConfigs[color] || styleConfigs.blue;

  const trendClasses = {
    up: 'bg-emerald-100/80 text-emerald-800 border-emerald-200',
    down: 'bg-rose-100/80 text-rose-800 border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <div className={`relative rounded-3xl p-4 border shadow-[0_4px_16px_-4px_rgba(148,163,184,0.06)] flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1 ${currentStyle.cardBg} ${currentStyle.border} ${currentStyle.glow} group cursor-pointer`}>
      
      {/* Decorative colored background gradient pulse */}
      <div className={`absolute inset-0 bg-gradient-to-tr ${currentStyle.bgGrad} pointer-events-none opacity-40`} />

      {/* Concise header block - smaller padding and heights */}
      <div className="relative z-10 flex items-center justify-between">
        {/* Compact Thematic Icon Container */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${currentStyle.iconBg}`}>
          {React.cloneElement(icon, { className: 'w-4 h-4' })}
        </div>

        {/* Compact Trend Tag */}
        {trend && (
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9.5px] font-black border leading-none shadow-sm transition-all duration-300 ${trendClasses[trendType]}`}>
            <span className="text-[7.5px]">{isUp ? '▲' : isDown ? '▼' : '■'}</span>
            <span>{trend}</span>
          </div>
        )}
      </div>

      {/* Concise metrics block - height reduced from mt-6 to mt-3.5 */}
      <div className="relative z-10 mt-3.5 flex items-end justify-between">
        <div>
          <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
            {value}
          </span>
          <h4 className="text-[10px] font-extrabold text-slate-400 mt-2 uppercase tracking-wider leading-none">
            {label}
          </h4>
        </div>


      </div>
    </div>
  );
};

export default StatCard;
