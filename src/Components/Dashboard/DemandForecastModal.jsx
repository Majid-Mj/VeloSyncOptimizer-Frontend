import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import productApi from '../../api/product.api';
import warehouseApi from '../../api/warehouse.api';

const DemandForecastModal = ({ productId, productName, initialWarehouseId, onClose }) => {
  const user = useSelector((s) => s.auth.user);
  const userRole = user?.role || 'Guest';
  const isWarehouseManager = userRole === 'WarehouseManager';
  const managerWarehouseId = user?.warehouseId;

  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [horizonDays, setHorizonDays] = useState(14);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null);

  // Fetch warehouses on mount
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await warehouseApi.getAll();
        if (response && response.isSuccess && response.data) {
          setWarehouses(response.data);
          if (isWarehouseManager && managerWarehouseId) {
            setSelectedWarehouseId(Number(managerWarehouseId));
          } else if (initialWarehouseId) {
            setSelectedWarehouseId(Number(initialWarehouseId));
          } else if (response.data.length > 0) {
            setSelectedWarehouseId(response.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load warehouses:', err);
        setError('Failed to load warehouses.');
      }
    };
    fetchWarehouses();
  }, [initialWarehouseId, isWarehouseManager, managerWarehouseId]);

  // Fetch forecast when warehouse or horizon changes
  useEffect(() => {
    if (!selectedWarehouseId) return;

    const fetchForecast = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await productApi.getForecast(productId, selectedWarehouseId, horizonDays);
        if (response && response.isSuccess && response.data) {
          setForecastData(response.data);
        } else {
          setError('Failed to load forecast data.');
        }
      } catch (err) {
        console.error('Failed to generate forecast:', err);
        setError(err.response?.data?.message || 'Failed to generate demand forecast.');
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [productId, selectedWarehouseId, horizonDays]);

  // SVG Chart rendering dimensions
  const chartWidth = 600;
  const chartHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartAreaWidth = chartWidth - paddingLeft - paddingRight;
  const chartAreaHeight = chartHeight - paddingTop - paddingBottom;

  const chartData = useMemo(() => {
    if (!forecastData || !forecastData.forecastPoints || forecastData.forecastPoints.length === 0) return null;

    const points = forecastData.forecastPoints;
    
    // Find absolute min and max for Y scale
    let maxVal = Math.max(...points.map(p => p.upperBound), 10);
    // Make sure we have a nice round number for max Y
    maxVal = Math.ceil(maxVal / 5) * 5;

    const pointsCount = points.length;

    const renderedPoints = points.map((p, idx) => {
      const x = paddingLeft + (idx / (pointsCount - 1)) * chartAreaWidth;
      
      // Y scaling (0 is at bottom, so subtract from chartAreaHeight + paddingTop)
      const scaleY = (val) => {
        const pct = val / maxVal;
        return paddingTop + chartAreaHeight - pct * chartAreaHeight;
      };

      const dateObj = new Date(p.date);
      const formattedDate = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      return {
        x,
        yPred: scaleY(p.predictedQuantity),
        yLower: scaleY(p.lowerBound),
        yUpper: scaleY(p.upperBound),
        predVal: p.predictedQuantity,
        lowerVal: p.lowerBound,
        upperVal: p.upperBound,
        dateStr: formattedDate,
        dateFull: dateObj.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        original: p
      };
    });

    // Generate path for the central prediction line
    const predPath = renderedPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yPred}`).join(' ');

    // Generate path for the shaded confidence area:
    const upperPoints = renderedPoints.map(p => `${p.x},${p.yUpper}`).join(' ');
    const lowerPoints = [...renderedPoints].reverse().map(p => `${p.x},${p.yLower}`).join(' ');
    const confidenceAreaPoints = `${upperPoints} ${lowerPoints}`;

    // Y-Axis ticks
    const yTicks = [0, maxVal / 2, maxVal].map(v => ({
      val: Math.round(v),
      y: paddingTop + chartAreaHeight - (v / maxVal) * chartAreaHeight
    }));

    return {
      points: renderedPoints,
      predPath,
      confidenceAreaPoints,
      yTicks,
      maxVal
    };
  }, [forecastData, chartAreaWidth, chartAreaHeight]);

  // Stats calculation
  const stats = useMemo(() => {
    if (!forecastData || !forecastData.forecastPoints || forecastData.forecastPoints.length === 0) return null;
    const points = forecastData.forecastPoints;
    const totalPred = points.reduce((sum, p) => sum + p.predictedQuantity, 0);
    const avgPred = totalPred / points.length;
    const maxPred = Math.max(...points.map(p => p.predictedQuantity));
    const maxUpper = Math.max(...points.map(p => p.upperBound));

    return {
      totalPred: Math.round(totalPred),
      avgPred: avgPred.toFixed(1),
      maxPred: maxPred.toFixed(1),
      maxUpper: maxUpper.toFixed(1)
    };
  }, [forecastData]);

  // Handle calculation for percentage coordinates for responsive tooltip
  const tooltipCoords = useMemo(() => {
    if (hoveredPointIndex === null || !chartData || !chartData.points[hoveredPointIndex]) return null;
    const point = chartData.points[hoveredPointIndex];
    return {
      xPercent: (point.x / chartWidth) * 100,
      yPercent: (point.yPred / chartHeight) * 100
    };
  }, [hoveredPointIndex, chartData]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white border border-slate-100/90 rounded-[28px] shadow-[0_24px_48px_-12px_rgba(16,24,40,0.12)] w-full max-w-2xl overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-white to-slate-50/30">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-[13.5px] font-black text-slate-800 tracking-wider uppercase flex items-center gap-2">
                AI Demand Forecasting
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block" title="ML Engine Active"></span>
              </h3>
              <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                ML.NET SSA Time-Series Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center border-none cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Product Info Banner */}
          <div className="bg-gradient-to-r from-[#f7f6ff] to-[#fcfcff] border border-indigo-50/50 rounded-2xl p-4 flex justify-between items-center shadow-3xs">
            <div>
              <div className="text-[9.5px] font-black text-[#704efe] uppercase tracking-wider">Active Product</div>
              <div className="text-[14px] font-black text-slate-800 mt-1 leading-tight">{productName}</div>
            </div>
            <div className="text-right">
              <div className="text-[9.5px] font-black text-[#704efe] uppercase tracking-wider">Model Config</div>
              <div className="inline-flex items-center gap-1.5 bg-[#f0ebff] text-[#704efe] border border-indigo-100 text-[10px] font-black px-2.5 py-0.5 rounded-full mt-1">
                95% Confidence
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                Select Facility {isWarehouseManager && ' (Locked)'}
              </label>
              <select
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                disabled={isWarehouseManager}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-700 bg-white shadow-3xs hover:border-slate-300 focus:outline-none focus:border-[#704efe] focus:ring-4 focus:ring-indigo-100 transition-all disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {warehouses.length === 0 && <option value="">Loading facilities...</option>}
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                Horizon Length
              </label>
              <div className="flex bg-slate-50 border border-slate-200/60 p-0.75 rounded-xl">
                {[7, 14, 21].map(days => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setHorizonDays(days)}
                    className={`flex-1 py-1.5 text-[10.5px] font-black rounded-lg border-0 transition-all cursor-pointer ${
                      horizonDays === days 
                        ? 'bg-white text-[#704efe] shadow-xs font-black' 
                        : 'bg-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Forecast Chart Card */}
          <div className="relative border border-slate-100 rounded-[24px] bg-slate-50/20 p-4 min-h-[250px] flex flex-col justify-center shadow-3xs">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <div className="w-9 h-9 border-3 border-[#704efe] border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Analyzing cycles & generating forecast...
                </span>
              </div>
            ) : error ? (
              <div className="text-center p-6 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col items-center justify-center">
                <span className="text-2xl mb-1.5">⚠️</span>
                <p className="text-rose-700 font-extrabold text-[12px]">{error}</p>
                <p className="text-[9.5px] text-slate-400 font-semibold mt-1">Please ensure sufficient historical movements exist.</p>
              </div>
            ) : chartData ? (
              <div className="flex-1 flex flex-col justify-between relative">
                
                {/* SVG Chart Canvas */}
                <div className="relative w-full h-[220px]">
                  
                  {/* Tooltip Hover Card - Fully responsive via Percentage positioning */}
                  {hoveredPointIndex !== null && tooltipCoords && chartData.points[hoveredPointIndex] && (
                    <div
                      className="absolute bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-xl z-20 pointer-events-none p-3.5 flex flex-col gap-1 text-[10.5px] border border-slate-800 w-[190px] transition-all duration-75"
                      style={{
                        left: `${tooltipCoords.xPercent}%`,
                        top: `${tooltipCoords.yPercent}%`,
                        transform: `translate(${tooltipCoords.xPercent > 70 ? '-110%' : '10%'}, -50%)`
                      }}
                    >
                      <div className="font-extrabold text-[9px] text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1 mb-1">
                        {chartData.points[hoveredPointIndex].dateStr}
                      </div>
                      <div className="flex justify-between gap-4 font-black">
                        <span>Expected Demand:</span>
                        <span className="text-indigo-300 font-black">{chartData.points[hoveredPointIndex].predVal.toFixed(1)} u</span>
                      </div>
                      <div className="flex justify-between gap-4 text-[9.5px] text-slate-400 font-bold mt-0.5">
                        <span>Upper Bound:</span>
                        <span>{chartData.points[hoveredPointIndex].upperVal.toFixed(1)} u</span>
                      </div>
                      <div className="flex justify-between gap-4 text-[9.5px] text-slate-400 font-bold">
                        <span>Lower Bound:</span>
                        <span>{chartData.points[hoveredPointIndex].lowerVal.toFixed(1)} u</span>
                      </div>
                    </div>
                  )}

                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-full select-none overflow-visible"
                  >
                    <defs>
                      <linearGradient id="confidence-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#704efe" stopOpacity="0.16" />
                        <stop offset="100%" stopColor="#704efe" stopOpacity="0.02" />
                      </linearGradient>
                      <linearGradient id="line-glow" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#704efe" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {chartData.yTicks.map((tick, i) => (
                      <g key={i}>
                        <line
                          x1={paddingLeft}
                          y1={tick.y}
                          x2={chartWidth - paddingRight}
                          y2={tick.y}
                          stroke="#eff1f5"
                          strokeWidth="1.2"
                          strokeDasharray={tick.val === 0 ? "0" : "4,4"}
                        />
                        <text
                          x={paddingLeft - 8}
                          y={tick.y + 3.5}
                          textAnchor="end"
                          className="text-[9px] font-black fill-slate-400"
                        >
                          {tick.val}
                        </text>
                      </g>
                    ))}

                    {/* Vertical Tracker Guide Line */}
                    {hoveredPointIndex !== null && chartData.points[hoveredPointIndex] && (
                      <line
                        x1={chartData.points[hoveredPointIndex].x}
                        y1={paddingTop}
                        x2={chartData.points[hoveredPointIndex].x}
                        y2={chartHeight - paddingBottom}
                        stroke="#704efe"
                        strokeWidth="1.2"
                        strokeDasharray="4,4"
                        opacity="0.5"
                      />
                    )}

                    {/* Confidence Band Shading */}
                    <polygon
                      points={chartData.confidenceAreaPoints}
                      fill="url(#confidence-grad)"
                      stroke="#704efe"
                      strokeOpacity="0.15"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />

                    {/* Prediction Line */}
                    <path
                      d={chartData.predPath}
                      fill="none"
                      stroke="url(#line-glow)"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Interactive points & hover regions */}
                    {chartData.points.map((p, i) => (
                      <g key={i}>
                        {/* Interactive hover column */}
                        <rect
                          x={p.x - 12}
                          y={paddingTop}
                          width="24"
                          height={chartAreaHeight}
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredPointIndex(i)}
                          onMouseLeave={() => setHoveredPointIndex(null)}
                        />
                        {/* Pulse glow behind hovered dot */}
                        {hoveredPointIndex === i && (
                          <circle
                            cx={p.x}
                            cy={p.yPred}
                            r="8"
                            fill="#704efe"
                            opacity="0.25"
                            className="animate-ping"
                          />
                        )}
                        {/* Main Dot */}
                        <circle
                          cx={p.x}
                          cy={p.yPred}
                          r={hoveredPointIndex === i ? 5 : 3.5}
                          className={`transition-all duration-100 ${
                            hoveredPointIndex === i 
                              ? 'fill-[#704efe] stroke-white stroke-[2]' 
                              : 'fill-indigo-600'
                          }`}
                        />
                      </g>
                    ))}

                    {/* X-Axis labels */}
                    {chartData.points.filter((_, i) => i === 0 || i === Math.floor(chartData.points.length / 2) || i === chartData.points.length - 1).map((p, idx) => (
                      <text
                        key={idx}
                        x={p.x}
                        y={chartHeight - 12}
                        textAnchor="middle"
                        className="text-[9px] font-black fill-slate-400"
                      >
                        {p.dateStr}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-450 font-bold text-[11.5px] py-12">
                Please select a facility to generate the forecast.
              </div>
            )}
          </div>

          {/* Stats Bar */}
          {stats && !loading && !error && (
            <div className="grid grid-cols-3 gap-3 border-t border-slate-100/80 pt-4">
              <div className="bg-slate-50/80 border border-slate-100/90 p-3 rounded-2xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#704efe]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.015a2.993 2.993 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.5a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
                  </svg>
                </div>
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">Avg Daily</span>
                  <span className="text-[12px] font-black text-slate-700 mt-1 block leading-none">
                    {stats.avgPred} <span className="text-[8.5px] font-bold text-slate-400">units</span>
                  </span>
                </div>
              </div>
              
              <div className="bg-slate-50/80 border border-slate-100/90 p-3 rounded-2xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#704efe]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                </div>
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">Max Expected</span>
                  <span className="text-[12px] font-black text-slate-700 mt-1 block leading-none">
                    {stats.maxPred} <span className="text-[8.5px] font-bold text-slate-400">units</span>
                  </span>
                </div>
              </div>

              <div className="bg-slate-50/80 border border-slate-100/90 p-3 rounded-2xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#704efe]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">Total Horizon</span>
                  <span className="text-[12px] font-black text-[#704efe] mt-1 block leading-none">
                    {stats.totalPred} <span className="text-[8.5px] font-bold text-indigo-400">units</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="text-[9px] text-slate-400 font-extrabold italic text-center select-none pt-1.5 uppercase tracking-wider">
            Note: The shaded area indicates the 95% confidence interval of possible demand variations.
          </div>

        </div>
      </div>
    </div>
  );
};

export default DemandForecastModal;
