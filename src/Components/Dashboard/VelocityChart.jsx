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

const VelocityChart = () => {
  const [selectedItem, setSelectedItem] = useState('Rice Bags 25kg');
  const bars = DUMMY_DATA[selectedItem];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex-1 min-w-[500px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <h3 className="text-[15px] font-bold text-gray-800 tracking-tight">Stock velocity</h3>
          </div>
          <p className="text-[11px] font-medium text-gray-400 mt-0.5">Rolling 90-day SQL window function · per warehouse</p>
        </div>
        
        <div className="relative">
          <select 
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-500 text-[12px] font-medium py-2 pl-4 pr-10 rounded-xl outline-none focus:ring-1 focus:ring-blue-100 cursor-pointer transition-all shadow-sm"
          >
            {Object.keys(DUMMY_DATA).map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-50 w-full"></div>

      {/* Chart Body */}
      <div className="flex-1 p-6 flex flex-col">
        <div className="flex-1 relative pt-8 pb-4 px-6 bg-blue-50/30 rounded-2xl border border-blue-50/50 min-h-[220px]">
          <div className="flex items-end justify-between gap-6 h-full">
            {bars.map((bar, i) => (
              <div key={i} className="flex-1 group relative flex flex-col items-center h-full justify-end">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-10 shadow-xl translate-y-2 group-hover:translate-y-0">
                  {bar.h} Stock
                </div>
                <div 
                  className={`w-full max-w-[32px] rounded-t-md transition-all duration-700 cursor-pointer ${bar.color} hover:brightness-95 shadow-sm shadow-blue-900/5`}
                  style={{ height: bar.h }}
                ></div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-4 text-[12px] font-medium text-gray-400 px-1">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default VelocityChart;
