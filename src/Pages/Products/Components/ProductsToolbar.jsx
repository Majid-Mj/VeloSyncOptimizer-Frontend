import React from 'react';

const ProductsToolbar = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories
}) => {
  return (
    <div className="premium-card bg-white p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative w-full md:w-80">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search by SKU or Name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 border border-[#eff1f5] rounded-2xl text-[12.5px] font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400 shadow-3xs"
        />
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category:</span>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-[#eff1f5] rounded-2xl px-4 py-2.5 text-[12.5px] font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-3xs cursor-pointer"
        >
          <option value="ALL">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ProductsToolbar;
