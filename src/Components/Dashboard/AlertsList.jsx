import React from 'react';

const DUMMY_ALERTS = [
  {
    id: 1,
    priority: 'HIGH',
    title: 'Rice Bags 25kg',
    subtitle: 'WH-KL-01 · Stockout in 2 days',
    type: 'red'
  },
  {
    id: 2,
    priority: 'MED',
    title: 'Cooking Oil 5L',
    subtitle: 'WH-PG-02 · Below reorder point',
    type: 'amber'
  },
  {
    id: 3,
    priority: 'HIGH',
    title: 'Sugar 1kg Premium',
    subtitle: 'WH-JB-03 · 3 days remaining',
    type: 'red'
  },
  {
    id: 4,
    priority: 'LOW',
    title: 'Flour 5kg',
    subtitle: 'WH-KK-04 · Monitor recommended',
    type: 'green'
  }
];

const AlertsList = () => {
  const getTagStyles = (type) => {
    switch (type) {
      case 'red': return 'bg-red-50 text-red-600 border-red-100';
      case 'amber': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'green': return 'bg-green-50 text-green-600 border-green-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 w-full lg:w-[420px] flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <h3 className="text-[15px] font-bold text-gray-800 tracking-tight">Live alerts</h3>
        </div>
        <button className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
          View all <span className="text-[14px]">→</span>
        </button>
      </div>

      {/* Alerts Items */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {DUMMY_ALERTS.map((alert, index) => (
          <div 
            key={alert.id} 
            className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-all cursor-default ${
              index !== DUMMY_ALERTS.length - 1 ? 'border-b border-gray-50' : ''
            }`}
          >
            {/* Priority Tag */}
            <div className={`w-[52px] py-1 rounded-full text-[9px] font-black flex items-center justify-center border ${getTagStyles(alert.type)}`}>
              {alert.priority}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-gray-800 truncate leading-tight">
                {alert.title}
              </div>
              <div className="text-[11px] font-medium text-gray-400 mt-0.5 truncate tracking-tight">
                {alert.subtitle}
              </div>
            </div>

            {/* Action Link */}
            <button className="text-[11px] font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors shrink-0">
              Review <span className="text-[14px]">→</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsList;
