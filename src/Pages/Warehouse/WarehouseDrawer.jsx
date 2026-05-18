import React from 'react';

const WarehouseDrawer = ({ 
  isOpen, 
  onClose, 
  newWh, 
  setNewWh, 
  onSubmit, 
  managers 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dim Overlay Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity duration-300"
      ></div>

      {/* Sliding Panel */}
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-out z-50">
        {/* Panel Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-800 tracking-tight">Create Warehouse</h3>
            <p className="text-[10px] font-bold text-gray-400 mt-0.5 tracking-wide uppercase">Add operational facility details</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all border-none bg-transparent cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Input Fields Form */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            {/* ID Input */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Warehouse Code</label>
              <input
                type="text"
                required
                placeholder="e.g. WH-KL-06"
                value={newWh.id}
                onChange={(e) => setNewWh({...newWh, id: e.target.value})}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl text-xs outline-none font-semibold text-gray-700"
              />
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Warehouse Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Klang Valley Distribution Hub"
                value={newWh.name}
                onChange={(e) => setNewWh({...newWh, name: e.target.value})}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl text-xs outline-none font-semibold text-gray-700"
              />
            </div>

            {/* Location Input */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Location / City</label>
              <input
                type="text"
                required
                placeholder="e.g. Selangor"
                value={newWh.location}
                onChange={(e) => setNewWh({...newWh, location: e.target.value})}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl text-xs outline-none font-semibold text-gray-700"
              />
            </div>

            {/* Size Area Input */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Storage Size</label>
              <input
                type="text"
                placeholder="e.g. 18,500 sq ft"
                value={newWh.size}
                onChange={(e) => setNewWh({...newWh, size: e.target.value})}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl text-xs outline-none font-semibold text-gray-700"
              />
            </div>

            {/* Staff Count Input */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Active Staff Count</label>
              <input
                type="number"
                min="1"
                value={newWh.staff}
                onChange={(e) => setNewWh({...newWh, staff: e.target.value})}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl text-xs outline-none font-semibold text-gray-700"
              />
            </div>

            {/* Capacity Slide Range */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Storage Capacity Utilized</label>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{newWh.capacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={newWh.capacity}
                onChange={(e) => setNewWh({...newWh, capacity: e.target.value})}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Manager Selection */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Assigned Manager</label>
              <div className="relative">
                <select
                  value={newWh.manager}
                  onChange={(e) => setNewWh({...newWh, manager: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl text-xs outline-none font-semibold text-gray-700 appearance-none cursor-pointer"
                >
                  {managers.map(manager => (
                    <option key={manager} value={manager}>{manager}</option>
                  ))}
                </select>
                <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center gap-3.5 border-t border-gray-100 pt-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-600 font-bold text-[12px] rounded-xl transition-all border-none cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-[12px] rounded-xl shadow-md shadow-blue-100 hover:shadow-lg transition-all border-none cursor-pointer text-center"
            >
              Save Warehouse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WarehouseDrawer;
