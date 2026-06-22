import React, { useState, useEffect } from 'react';
import SearchableDropdown from '../../../Components/ui/SearchableDropdown';

const ProductFormModal = ({
  editingProduct,
  categories,
  suppliers,
  onClose,
  onSubmit
}) => {
  // Local form states initialized with editingProduct values or defaults
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [unitCost, setUnitCost] = useState('0');
  const [unitPrice, setUnitPrice] = useState('0');
  const [unitOfMeasure, setUnitOfMeasure] = useState('PCS');
  const [reorderQty, setReorderQty] = useState('0');
  const [safetyStockDays, setSafetyStockDays] = useState('0');
  const [leadTimeDays, setLeadTimeDays] = useState('0');
  const [isPerishable, setIsPerishable] = useState(false);
  const [shelfLifeDays, setShelfLifeDays] = useState('');

  useEffect(() => {
    if (editingProduct) {
      setSku(editingProduct.sku || '');
      setName(editingProduct.name || '');
      setDescription(editingProduct.description || '');
      setCategoryId(editingProduct.categoryId || '');
      setSupplierId(editingProduct.supplierId || '');
      setUnitCost(editingProduct.unitCost?.toString() || '0');
      setUnitPrice(editingProduct.unitPrice?.toString() || '0');
      setUnitOfMeasure(editingProduct.unitOfMeasure || 'PCS');
      setReorderQty(editingProduct.reorderQty?.toString() || '0');
      setSafetyStockDays(editingProduct.safetyStockDays?.toString() || '0');
      setLeadTimeDays(editingProduct.leadTimeDays?.toString() || '0');
      setIsPerishable(editingProduct.isPerishable || false);
      setShelfLifeDays(editingProduct.shelfLifeDays?.toString() || '');
    } else {
      setSku('');
      setName('');
      setDescription('');
      setCategoryId(categories[0]?.id || '');
      setSupplierId(suppliers[0]?.id || '');
      setUnitCost('0');
      setUnitPrice('0');
      setUnitOfMeasure('PCS');
      setReorderQty('0');
      setSafetyStockDays('0');
      setLeadTimeDays('0');
      setIsPerishable(false);
      setShelfLifeDays('');
    }
  }, [editingProduct, categories, suppliers]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      sku,
      name,
      description,
      categoryId: categoryId ? Number(categoryId) : null,
      supplierId: supplierId ? Number(supplierId) : null,
      unitCost: Number(unitCost),
      unitPrice: Number(unitPrice),
      unitOfMeasure,
      reorderQty: Number(reorderQty),
      safetyStockDays: Number(safetyStockDays),
      leadTimeDays: Number(leadTimeDays),
      isPerishable,
      shelfLifeDays: shelfLifeDays ? Number(shelfLifeDays) : null
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-100 rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden animate-scale-in">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            {editingProduct ? 'Edit Product Details' : 'Add New Product'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-650 cursor-pointer text-lg font-bold"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">SKU Code *</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
                placeholder="e.g. BIKE-001"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Product Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. VeloSync Cruiser Frame"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details about dimensions, materials, or features..."
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SearchableDropdown
              label="Category"
              options={categories}
              value={categoryId}
              onChange={setCategoryId}
              placeholder="Select or search category..."
              required
            />
            <SearchableDropdown
              label="Supplier"
              options={suppliers}
              value={supplierId}
              onChange={setSupplierId}
              placeholder="Select or search supplier..."
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Unit Cost (₹)</label>
              <input
                type="number"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Unit Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Unit of Measure</label>
              <input
                type="text"
                value={unitOfMeasure}
                onChange={(e) => setUnitOfMeasure(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Reorder Qty</label>
              <input
                type="number"
                value={reorderQty}
                onChange={(e) => setReorderQty(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Safety Stock Days</label>
              <input
                type="number"
                value={safetyStockDays}
                onChange={(e) => setSafetyStockDays(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Lead Time Days</label>
              <input
                type="number"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPerishable"
                checked={isPerishable}
                onChange={(e) => setIsPerishable(e.target.checked)}
                className="w-4 h-4 rounded text-[#704efe] border-slate-300 focus:ring-indigo-500"
              />
              <label htmlFor="isPerishable" className="text-[12px] font-bold text-slate-650 select-none">
                Perishable Product
              </label>
            </div>

            {isPerishable && (
              <div className="flex items-center gap-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Shelf Life (Days)</label>
                <input
                  type="number"
                  value={shelfLifeDays}
                  onChange={(e) => setShelfLifeDays(e.target.value)}
                  placeholder="e.g. 30"
                  className="w-24 px-3 py-1.5 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4.5 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-[12px] font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4.5 py-2 bg-black hover:bg-zinc-900 text-white rounded-xl text-[12px] font-bold cursor-pointer transition-all duration-150 active:scale-95"
            >
              {editingProduct ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
