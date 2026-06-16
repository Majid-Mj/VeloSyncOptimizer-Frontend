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
        className="absolute inset-0 bg-[#11121d]/40 backdrop-blur-sm transition-opacity duration-300"
      ></div>

      {/* Sliding Panel */}
      <div className="relative w-full max-w-md bg-white border-l border-[#eff1f5] flex flex-col h-full z-50 animate-slide-in-right shadow-2xl">

        {/* Panel Header */}
        <div className="px-6 py-5 border-b border-[#eff1f5] flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-sm font-black text-slate-805 uppercase tracking-wider">Create Warehouse</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider uppercase">Add operational facility details</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-2xl transition-all border-none bg-transparent cursor-pointer"
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
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Warehouse Code</label>
              <input
                type="text"
                required
                placeholder="e.g. WH-KL-06"
                value={newWh.code}
                onChange={(e) => setNewWh({ ...newWh, code: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-[#eff1f5] focus:border-indigo-500 focus:bg-white rounded-2xl text-[12.5px] outline-none font-semibold text-slate-700 transition-all shadow-3xs"
              />
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Warehouse Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Klang Valley Distribution Hub"
                value={newWh.name}
                onChange={(e) => setNewWh({ ...newWh, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-[#eff1f5] focus:border-indigo-500 focus:bg-white rounded-2xl text-[12.5px] outline-none font-semibold text-slate-700 transition-all shadow-3xs"
              />
            </div>

            {/* City Input */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">City</label>
              <input
                type="text"
                required
                placeholder="e.g. Shah Alam"
                value={newWh.city}
                onChange={(e) => setNewWh({ ...newWh, city: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-[#eff1f5] focus:border-indigo-500 focus:bg-white rounded-2xl text-[12.5px] outline-none font-semibold text-slate-700 transition-all shadow-3xs"
              />
            </div>

            {/* State Input */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">State</label>
              <input
                type="text"
                required
                placeholder="e.g. Selangor"
                value={newWh.state}
                onChange={(e) => setNewWh({ ...newWh, state: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-[#eff1f5] focus:border-indigo-500 focus:bg-white rounded-2xl text-[12.5px] outline-none font-semibold text-slate-700 transition-all shadow-3xs"
              />
            </div>

            {/* Country Input */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Country</label>
              <input
                type="text"
                required
                placeholder="e.g. Malaysia"
                value={newWh.country}
                onChange={(e) => setNewWh({ ...newWh, country: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-[#eff1f5] focus:border-indigo-500 focus:bg-white rounded-2xl text-[12.5px] outline-none font-semibold text-slate-700 transition-all shadow-3xs"
              />
            </div>

            {/* Capacity Input */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Total Capacity (sq ft)</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 25000"
                value={newWh.totalCapacity}
                onChange={(e) => setNewWh({ ...newWh, totalCapacity: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-[#eff1f5] focus:border-indigo-500 focus:bg-white rounded-2xl text-[12.5px] outline-none font-semibold text-slate-700 transition-all shadow-3xs"
              />
            </div>

            {/* Manager Selection */}
            <div>
              <label className="block text-[10px] font-black text-[#202231] uppercase tracking-widest mb-1.5">Assigned Manager</label>
              <div className="relative">
                <select
                  value={newWh.managerId}
                  onChange={(e) => setNewWh({ ...newWh, managerId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-[#eff1f5] focus:border-indigo-500 rounded-2xl text-[12.5px] outline-none font-semibold text-slate-700 appearance-none cursor-pointer transition-all shadow-3xs"
                >
                  <option value="">-- Select active manager --</option>
                  {managers.map(m => (
                    <option key={m.id} value={m.id}>{m.fullName} ({m.email})</option>
                  ))}
                </select>
                <svg className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center gap-3.5 border-t border-[#eff1f5] pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white hover:bg-slate-50 border border-[#eff1f5] text-slate-500 font-black text-[10px] uppercase tracking-wider rounded-2xl transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 text-white font-black text-[10px] uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer text-center bg-[#704efe] hover:bg-[#5c3edd] shadow-indigo-100/30"
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
