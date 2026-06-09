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
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">

      {/* Dim Overlay Backdrop with Frosted Blur */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
      ></div>

      {/* Sliding Panel */}
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-md shadow-2xl border-l border-slate-100 flex flex-col h-full z-50 animate-slide-in-right">

        {/* Panel Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Create Warehouse</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider uppercase">Add operational facility details</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Input Fields Form */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col justify-between gap-6">
          <div className="space-y-4.5">

            {/* ID Input */}
            <div>
              <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1.5">Warehouse Code</label>
              <input
                type="text"
                required
                placeholder="e.g. WH-KL-06"
                value={newWh.id}
                onChange={(e) => setNewWh({ ...newWh, id: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/50 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-100 rounded-xl text-xs outline-none font-bold text-slate-700 transition-all shadow-3xs"
              />
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1.5">Warehouse Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Klang Valley Distribution Hub"
                value={newWh.name}
                onChange={(e) => setNewWh({ ...newWh, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/50 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-100 rounded-xl text-xs outline-none font-bold text-slate-700 transition-all shadow-3xs"
              />
            </div>

            {/* Location Input */}
            <div>
              <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1.5">Location / City</label>
              <input
                type="text"
                required
                placeholder="e.g. Selangor"
                value={newWh.location}
                onChange={(e) => setNewWh({ ...newWh, location: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/50 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-100 rounded-xl text-xs outline-none font-bold text-slate-700 transition-all shadow-3xs"
              />
            </div>

            {/* Size Area Input */}
            <div>
              <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1.5">Storage Size</label>
              <input
                type="text"
                placeholder="e.g. 18,500 sq ft"
                value={newWh.size}
                onChange={(e) => setNewWh({ ...newWh, size: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/50 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-100 rounded-xl text-xs outline-none font-bold text-slate-700 transition-all shadow-3xs"
              />
            </div>

            {/* Staff Count Input */}
            <div>
              <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1.5">Active Staff Count</label>
              <input
                type="number"
                min="1"
                value={newWh.staff}
                onChange={(e) => setNewWh({ ...newWh, staff: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/50 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-100 rounded-xl text-xs outline-none font-bold text-slate-700 transition-all shadow-3xs"
              />
            </div>

            {/* Capacity Slide Range */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Storage Capacity Utilized</label>
                <span className="text-[9.5px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-lg">{newWh.capacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={newWh.capacity}
                onChange={(e) => setNewWh({ ...newWh, capacity: e.target.value })}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 outline-none"
              />
            </div>

            {/* Manager Selection */}
            <div>
              <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1.5">Assigned Manager</label>
              <div className="relative">
                <select
                  value={newWh.manager}
                  onChange={(e) => setNewWh({ ...newWh, manager: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/50 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-100 rounded-xl text-xs outline-none font-bold text-slate-700 appearance-none cursor-pointer transition-all shadow-3xs"
                >
                  {managers.map(manager => (
                    <option key={manager} value={manager}>{manager}</option>
                  ))}
                </select>
                <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center gap-3.5 border-t border-slate-100 pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-500 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-white font-black text-[10px] uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer text-center bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
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
