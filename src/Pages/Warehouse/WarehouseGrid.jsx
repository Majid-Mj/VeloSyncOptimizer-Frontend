import React from 'react';
import WarehouseCard from './WarehouseCard';

const WarehouseGrid = ({ filteredWarehouses, isAdmin, onDelete, onEdit, onViewDetails, onToggleActive }) => {
  if (filteredWarehouses.length === 0) {
    return (
      <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-800">No Warehouses Found</h3>
        <p className="text-xs font-semibold text-gray-400 max-w-xs mt-1 leading-normal">
          No warehouses matched your search query or filters. Clear your filters or create a new warehouse.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {filteredWarehouses.map((wh) => (
        <WarehouseCard
          key={wh.id}
          wh={wh}
          isAdmin={isAdmin}
          onDelete={onDelete}
          onEdit={onEdit}
          onViewDetails={onViewDetails}
          onToggleActive={onToggleActive}
        />
      ))}
    </div>
  );
};

export default WarehouseGrid;
