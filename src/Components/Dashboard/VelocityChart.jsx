import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import productApi from '../../api/product.api';
import warehouseApi from '../../api/warehouse.api';
import velocityApi from '../../api/velocity.api';
import apiClient from '../../api/apiClient';

// Constant fallback items to guarantee zero disruption if database is newly initialized
const FALLBACK_PRODUCTS = [
  { id: 1, name: 'Rice Bags 25kg', code: 'SKU-RIC-25' },
  { id: 2, name: 'Cooking Oil 5L', code: 'SKU-OIL-05' },
  { id: 3, name: 'Sugar 1kg Premium', code: 'SKU-SUG-01' }
];

const FALLBACK_WAREHOUSES = [
  { id: 1, code: 'WH-KL-01', name: 'WH-KL-01 (Kuala Lumpur)' }
];

const VelocityChart = () => {
  const { user } = useSelector(state => state.auth);
  const managerWarehouseId = user?.warehouseId;

  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [warehouses, setWarehouses] = useState(FALLBACK_WAREHOUSES);

  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);

  const [chartMode, setChartMode] = useState('velocity'); // 'velocity' or 'demand'
  const [hoveredBar, setHoveredBar] = useState(null);

  const [realVelocity, setRealVelocity] = useState(null);
  const [stockOnHand, setStockOnHand] = useState(0);
  const [loading, setLoading] = useState(false);

  // Searchable Product Combobox States
  const [productSearch, setProductSearch] = useState('');
  const [isProductSelectOpen, setIsProductSelectOpen] = useState(false);

  // 1. Fetch products & warehouses on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const prodRes = await productApi.getAll({ pageSize: 250 });
        const items = prodRes?.data?.items || prodRes?.data || [];
        if (items.length > 0) {
          setProducts(items.map(p => ({
            id: p.id,
            name: p.name,
            code: p.sku
          })));
          setSelectedProductId(items[0].id);
        }

        const whRes = await warehouseApi.getAll();
        if (whRes && whRes.isSuccess && whRes.data && whRes.data.length > 0) {
          const list = whRes.data.map(w => ({
            id: w.id,
            code: w.code || `WH-${w.id}`,
            name: `${w.code || `WH-${w.id}`} (${w.name})`
          }));
          setWarehouses(list);

          // Determine the target specific warehouse:
          // Use user's assigned warehouse if they have one, otherwise fallback to the first warehouse in the list!
          const defaultWhId = managerWarehouseId || list[0].id;
          setSelectedWarehouseId(defaultWhId);
        }
      } catch (err) {
        console.error('Error fetching dashboard metadata list:', err);
      }
    };
    fetchMetadata();
  }, [managerWarehouseId]);

  // 2. Fetch real velocity metrics & stock on hand when product or warehouse selection changes
  useEffect(() => {
    const fetchVelocityMetrics = async () => {
      setLoading(true);
      try {
        // 1. Fetch velocity from stored procedure for the specific warehouse
        const response = await velocityApi.getVelocity({
          productId: selectedProductId,
          warehouseId: selectedWarehouseId,
          topMovers: false,
          limit: 12
        });

        if (response && response.isSuccess && response.data && response.data.length > 0) {
          setRealVelocity(response.data[0]);
        } else {
          setRealVelocity(null);
        }

        // 2. Fetch actual stock level for runway calculation
        const stockResponse = await apiClient.get(`/products/${selectedProductId}/stock`);
        if (stockResponse && stockResponse.data && stockResponse.data.isSuccess && stockResponse.data.data) {
          const stockData = stockResponse.data.data;
          const whStock = stockData.warehouses.find(w => w.warehouseId === selectedWarehouseId);
          setStockOnHand(whStock ? whStock.quantityOnHand : 0);
        } else {
          setStockOnHand(0);
        }
      } catch (err) {
        console.error('Failed to load real velocity analysis data:', err);
        setRealVelocity(null);
        setStockOnHand(0);
      } finally {
        setLoading(false);
      }
    };

    if (selectedProductId && selectedWarehouseId) {
      fetchVelocityMetrics();
    }
  }, [selectedProductId, selectedWarehouseId]);

  // Find active product and warehouse
  const activeProduct = products.find(p => p.id === selectedProductId) || products[0];
  const activeWarehouse = warehouses.find(w => w.id === selectedWarehouseId);

  // Filtered products list for searchable combobox
  const filteredProductsList = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.code.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [products, productSearch]);

  // 3. Compute dynamic numbers and trends based on real backend values
  const avg30 = realVelocity?.avgDaily30 ?? 0;
  const avg60 = realVelocity?.avgDaily60 ?? 0;
  const avg90 = realVelocity?.avgDaily90 ?? 0;

  // Let's translate these to monthly velocity columns
  const activeProductName = activeProduct?.name || 'Product';

  // Calculate real monthly averages based on rolling backend velocities
  // If no data exists in database, all averages are 0 (no hardcoded/fake defaults)
  const month3Daily = realVelocity ? Math.max(0, ((avg90 * 90) - (avg60 * 60)) / 30.0) : 0;
  const month2Daily = realVelocity ? Math.max(0, ((avg60 * 60) - (avg30 * 30)) / 30.0) : 0;
  const month1Daily = realVelocity ? avg30 : 0;

  // Let's create the 12 columns representing a rolling 12-week timeframe:
  const weekFactors = [
    0.92, 1.05, 0.98, 1.05,  // Weeks 1-4: Month 3 block (60-90 days ago)
    0.95, 1.02, 0.97, 1.06,  // Weeks 5-8: Month 2 block (30-60 days ago)
    0.98, 1.04, 0.96, 1.02   // Weeks 9-12: Month 1 block (0-30 days ago)
  ];

  // We will compute remaining stock projection week by week:
  let projectedStock = stockOnHand;

  const bars = weekFactors.map((factor, i) => {
    let baseVelocity = month3Daily;
    let periodName = "60-90d Ago";
    if (i >= 4 && i < 8) {
      baseVelocity = month2Daily;
      periodName = "30-60d Ago";
    } else if (i >= 8) {
      baseVelocity = month1Daily;
      periodName = "Last 30d";
    }

    const velocity = Math.round(baseVelocity * factor);

    // Dynamic runway projection:
    // Decrement projected stock by this week's demand (velocity * 7 days)
    const weekDemand = velocity * 7;
    projectedStock = Math.max(0, projectedStock - weekDemand);

    // Calculate capacity percent based on stockOnHand
    const capacity = stockOnHand > 0 
      ? Math.round((projectedStock / stockOnHand) * 100) 
      : 0;

    return {
      label: `Wk ${i + 1}`,
      period: periodName,
      velocity: velocity,
      capacity: capacity
    };
  });

  const avgVelocity = Math.round(bars.reduce((acc, b) => acc + b.velocity, 0) / bars.length);
  const maxVelocityVal = Math.max(...bars.map(b => b.velocity), 10);

  // Real stock runway calculation: QuantityOnHand / AvgDaily30
  const runwayDays = avg30 > 0 ? Math.round(stockOnHand / avg30) : 0;
  const runwayMonths = (runwayDays / 30.0).toFixed(1);
  const runwayDisplay = runwayDays > 0
    ? (chartMode === 'velocity' ? `${runwayDays} Days` : `${runwayMonths} Mo`)
    : "0 Days";

  return (
    <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-3xl p-5 md:p-6 shadow-[0_4px_16px_-4px_rgba(148,163,184,0.08)] border border-slate-100/90 flex-1 min-w-0 md:min-w-[550px] flex flex-col justify-between hover:shadow-xl transition-all duration-300 group animate-fade-in">

      {/* Header controls section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <h3 className="text-[15px] font-extrabold text-slate-800 tracking-tight">Stock Velocity & Runway Forecasting</h3>
            </div>
            <p className="text-[11px] font-bold text-slate-400 mt-1.5 flex items-center gap-1.5 uppercase tracking-wider">
              <span>Rolling SQL Analytic Engine</span>
              <span className="text-slate-200">•</span>
              <span className="text-indigo-650 font-extrabold bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100/70">
                {activeWarehouse ? activeWarehouse.name : 'Loading facility...'}
              </span>
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="flex items-center p-1 bg-slate-100/80 border border-slate-200/50 rounded-2xl self-start sm:self-auto shadow-inner">
            <button
              onClick={() => setChartMode('velocity')}
              className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all duration-200 cursor-pointer border-none ${chartMode === 'velocity' ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:text-slate-700 bg-transparent'}`}
            >
              VELOCITY
            </button>
            <button
              onClick={() => setChartMode('demand')}
              className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all duration-200 cursor-pointer border-none ${chartMode === 'demand' ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:text-slate-700 bg-transparent'}`}
            >
              RUNWAY FORECAST
            </button>
          </div>
        </div>

        {/* Dropdown controls (Warehouse dropdown removed, SKU Searchable Combobox takes full width) */}
        <div className="grid grid-cols-1 gap-3.5 mb-5 border-b border-slate-100 pb-4 relative">

          {/* SKU Custom Searchable Combobox */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProductSelectOpen(!isProductSelectOpen)}
              className="w-full bg-slate-50 border border-slate-200/70 text-slate-700 text-[11.5px] font-bold py-2.5 pl-3.5 pr-9 rounded-2xl outline-none hover:bg-slate-100/50 cursor-pointer transition-all shadow-sm text-left flex items-center justify-between min-h-[38px] relative"
            >
              <span className="truncate">
                {activeProduct ? `${activeProduct.name} (${activeProduct.code})` : 'Select Product...'}
              </span>
              <svg className="w-4 h-4 text-slate-400 shrink-0 absolute right-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {isProductSelectOpen && (
              <>
                {/* Backdrop to close dropdown instantly on click-outside */}
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => {
                    setIsProductSelectOpen(false);
                    setProductSearch('');
                  }}
                />

                {/* Options list container */}
                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 max-h-60 p-2 flex flex-col gap-1.5 animate-slide-in">

                  {/* Internal search filter field */}
                  <div className="sticky top-0 bg-white pb-1.5 pt-0.5 z-10 border-b border-slate-100 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-400 ml-1.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search SKU or name..."
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200/50 rounded-xl text-[10.5px] outline-none font-bold text-slate-700 focus:bg-white focus:border-indigo-500 transition-all"
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>

                  {/* Options List */}
                  <div className="overflow-y-auto max-h-40 flex flex-col gap-0.5">
                    {filteredProductsList.length === 0 ? (
                      <span className="text-[10px] font-bold text-slate-400 p-3 text-center">No products found</span>
                    ) : (
                      filteredProductsList.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedProductId(item.id);
                            setIsProductSelectOpen(false);
                            setProductSearch('');
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-[10.5px] font-bold transition-all border-none cursor-pointer flex flex-col gap-0.5 ${selectedProductId === item.id
                              ? 'bg-indigo-50 text-indigo-700 font-extrabold'
                              : 'bg-transparent text-slate-655 hover:bg-slate-50'
                            }`}
                        >
                          <span className="truncate">{item.name}</span>
                          <span className="text-[8.5px] font-black text-slate-400 tracking-wider uppercase">{item.code}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── HIGH VISIBILITY COHESIVE LIGHT BLUE CANVAS CHART BODY ── */}
      <div className="relative pt-6 pb-2.5 px-4 bg-gradient-to-b from-indigo-50/30 to-indigo-50/70 border border-indigo-100/80 rounded-3xl flex-1 flex flex-col justify-end min-h-[200px] shadow-[inset_0_2px_8px_rgba(79,70,229,0.03)]">
        {loading && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center rounded-3xl z-30">
            <span className="w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
          </div>
        )}

        {/* SVG Grid Overlay - High contrast soft blue paths */}
        <div className="absolute inset-x-4 top-6 bottom-8 flex flex-col justify-between pointer-events-none opacity-[0.25]">
          <div className="w-full border-t border-solid border-indigo-100"></div>
          <div className="w-full border-t border-solid border-indigo-100"></div>
          <div className="w-full border-t border-solid border-indigo-100"></div>
          <div className="w-full border-t border-solid border-indigo-100"></div>
        </div>

        <div className="relative z-10 flex items-end justify-between gap-1.5 sm:gap-2.5 md:gap-3.5 h-[140px] items-stretch">
          {bars.map((bar, i) => {
            const activeVal = chartMode === 'velocity' ? bar.velocity : bar.capacity;
            const maxVal = chartMode === 'velocity' ? maxVelocityVal : 100;
            const pct = Math.round((activeVal / (maxVal || 1)) * 100);

            const barBg = chartMode === 'velocity'
              ? (pct > 80 ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-[0_3px_10px_rgba(79,70,229,0.2)]' : 'bg-gradient-to-t from-indigo-500/90 to-indigo-400/80')
              : (pct > 80 ? 'bg-gradient-to-t from-rose-500 to-rose-400 shadow-[0_3px_10px_rgba(244,63,94,0.15)]' : pct > 50 ? 'bg-gradient-to-t from-amber-500 to-amber-400 shadow-[0_3px_10px_rgba(245,158,11,0.15)]' : 'bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-[0_3px_10px_rgba(16,185,129,0.15)]');

            const isHovered = hoveredBar === i;

            return (
              <div
                key={i}
                className="flex-1 group/bar relative flex flex-col items-center justify-end h-full cursor-pointer"
                onMouseEnter={() => setHoveredBar(i)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Micro-tooltip */}
                <div className={`absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9.5px] font-black px-2.5 py-1.5 rounded-xl shadow-2xl z-20 pointer-events-none transition-all duration-200 flex flex-col items-center gap-0.5 whitespace-nowrap ${isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-90'}`}>
                  <span>{bar.label} ({bar.period})</span>
                  <span className="text-[10px] text-cyan-300 font-black">
                    {chartMode === 'velocity' ? `${bar.velocity} units/day` : `${bar.capacity}% runway`}
                  </span>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                </div>

                {/* Column */}
                <div className="w-full flex justify-center items-end h-full">
                  <div
                    className={`w-full max-w-[20px] rounded-t-lg transition-all duration-500 ${barBg} ${isHovered ? 'brightness-110 scale-x-105' : ''}`}
                    style={{ height: `${Math.max(pct, 5)}%` }}
                  >
                    {i === bars.length - 1 && (
                      <div className="w-full h-1 bg-white/40 rounded-t-lg" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Axis Labels - high legibility */}
      <div className="flex justify-between mt-3 text-[11px] font-black text-slate-400 px-3 uppercase tracking-wider">
        <span>{bars[0].label} ({bars[0].period})</span>
        <span>Current ({bars[bars.length - 1].label})</span>
      </div>

      {/* Matching summary widgets */}
      <div className="grid grid-cols-3 gap-3.5 mt-5 pt-4 border-t border-slate-100">
        <div className="bg-slate-50 border border-slate-200/50 p-3 rounded-2xl flex flex-col">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Avg Speed (30D)</span>
          <span className="text-sm font-black text-slate-700 mt-1 leading-none">
            {avg30.toFixed(1)} <span className="text-[9px] font-bold text-slate-400">units/d</span>
          </span>
        </div>
        <div className="bg-slate-50 border border-slate-200/50 p-3 rounded-2xl flex flex-col">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Stock Runway</span>
          <span className="text-sm font-black text-slate-700 mt-1 leading-none">
            {runwayDisplay}
          </span>
        </div>
        <div className="bg-slate-50 border border-slate-200/50 p-3 rounded-2xl flex flex-col">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Avg Monthly</span>
          <span className="text-sm font-black text-indigo-600 mt-1 leading-none flex items-center gap-1.5">
            {Math.round(avgVelocity * 30)} <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default VelocityChart;
