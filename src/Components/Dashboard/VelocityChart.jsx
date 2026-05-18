import React, { useState } from 'react';

const DUMMY_DATA = {
  'Rice Bags 25kg': [
    { h: '42%', color: 'bg-blue-200' }, { h: '55%', color: 'bg-blue-200' }, { h: '38%', color: 'bg-blue-200' },
    { h: '62%', color: 'bg-blue-300' }, { h: '52%', color: 'bg-blue-300' }, { h: '72%', color: 'bg-blue-400' },
    { h: '58%', color: 'bg-blue-400' }, { h: '82%', color: 'bg-blue-500' }, { h: '68%', color: 'bg-blue-500' },
    { h: '88%', color: 'bg-blue-600' }, { h: '94%', color: 'bg-blue-600' }, { h: '78%', color: 'bg-blue-700' }
  ],
  'Cooking Oil 5L': [
    { h: '55%', color: 'bg-blue-200' }, { h: '62%', color: 'bg-blue-200' }, { h: '58%', color: 'bg-blue-300' },
    { h: '70%', color: 'bg-blue-300' }, { h: '65%', color: 'bg-blue-400' }, { h: '88%', color: 'bg-blue-400' },
    { h: '72%', color: 'bg-blue-500' }, { h: '95%', color: 'bg-blue-500' }, { h: '82%', color: 'bg-blue-600' },
    { h: '90%', color: 'bg-blue-600' }, { h: '85%', color: 'bg-blue-700' }, { h: '98%', color: 'bg-blue-700' }
  ],
  'Sugar 1kg Premium': [
    { h: '20%', color: 'bg-blue-200' }, { h: '35%', color: 'bg-blue-200' }, { h: '28%', color: 'bg-blue-300' },
    { h: '42%', color: 'bg-blue-300' }, { h: '38%', color: 'bg-blue-400' }, { h: '55%', color: 'bg-blue-400' },
    { h: '48%', color: 'bg-blue-500' }, { h: '62%', color: 'bg-blue-500' }, { h: '58%', color: 'bg-blue-600' },
    { h: '68%', color: 'bg-blue-600' }, { h: '62%', color: 'bg-blue-700' }, { h: '75%', color: 'bg-blue-700' }
  ]
};

const BAR_COLORS = [
  'bg-[#dbeafe]', // 0: ice blue
  'bg-[#dbeafe]', // 1
  'bg-[#bfdbfe]', // 2: soft light blue
  'bg-[#93c5fd]', // 3: sky blue
  'bg-[#93c5fd]', // 4
  'bg-[#60a5fa]', // 5: medium blue
  'bg-[#60a5fa]', // 6
  'bg-[#3b82f6]', // 7: vivid blue
  'bg-[#3b82f6]', // 8
  'bg-[#2563eb]', // 9: royal blue
  'bg-[#1d4ed8]', // 10: deep blue
  'bg-[#1d4ed8]'  // 11
];

const VelocityChart = () => {
  const [selectedItem, setSelectedItem] = useState('Rice Bags 25kg');
  const bars = DUMMY_DATA[selectedItem];

  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 flex-1 min-w-[500px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <h3 className="text-[14px] font-bold text-gray-800 tracking-tight">Stock velocity</h3>
          </div>
          <p className="text-[10px] font-medium text-gray-400 mt-0.5">Rolling 90-day SQL window function · per warehouse</p>
        </div>

        <div className="relative">
          <select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-500 text-[11px] font-semibold py-1.5 pl-3 pr-8 rounded-lg outline-none focus:ring-1 focus:ring-blue-100 cursor-pointer transition-all shadow-sm"
          >
            {Object.keys(DUMMY_DATA).map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <svg className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* Chart Body with Background Container */}
      <div className="relative pt-6 pb-3 px-4 bg-gradient-to-b from-[#e0f2fe]/60 to-[#bae6fd]/20 rounded-2xl">
        <div className="flex items-end justify-between gap-3 h-[140px]">
          {bars.map((bar, i) => (
            <div key={i} className="flex-1 group relative flex flex-col items-center h-full justify-end">
              {/* Tooltip */}
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-10 shadow-xl translate-y-1.5 group-hover:translate-y-0">
                {bar.h} Stock
              </div>

              <div
                className={`w-full max-w-[28px] rounded-t-[6px] transition-all duration-700 cursor-pointer ${BAR_COLORS[i] || 'bg-blue-500'} hover:brightness-95 shadow-sm shadow-blue-900/5`}
                style={{ height: bar.h }}
              ></div>
            </div>
          ))}
        </div>
      </div>

      {/* X-Axis Labels */}
      <div className="flex justify-between mt-2.5 text-[11px] font-medium text-gray-400 px-1">
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
};

export default VelocityChart;
