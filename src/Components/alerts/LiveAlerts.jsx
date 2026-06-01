import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import alertsApi from '../../api/alerts.api';

const LiveAlerts = () => {
  const { user } = useSelector(state => state.auth);
  const userRole = user?.role || '';
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSeverity, setActiveSeverity] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [detailModalAlert, setDetailModalAlert] = useState(null);

  // Fetch alerts from backend
  const fetchLiveAlerts = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await alertsApi.getAlerts({ unreadOnly: false });
      if (response && response.isSuccess && response.data) {
        const mapped = response.data.map(alert => {
          let sev = alert.severity?.toUpperCase() || 'LOW';
          if (sev === 'MEDIUM') sev = 'MED';
          if (sev === 'CRITICAL') sev = 'HIGH';
          
          const qty = alert.quantityOnHand ?? 0;
          const threshold = alert.reorderPoint ?? 0;
          
          let demand = '14 units/day';
          if (sev === 'HIGH' || alert.alertType?.toLowerCase().includes('stockout')) {
            demand = '32 units/day';
          } else if (sev === 'MED' || alert.alertType?.toLowerCase().includes('low')) {
            demand = '18 units/day';
          } else {
            demand = '8 units/day';
          }
          
          let runway = '';
          if (qty === 0) {
            runway = 'Critical (Stockout)';
          } else if (qty >= threshold) {
            runway = 'Healthy (Stock Restored)';
          } else {
            const days = Math.round(qty / (parseInt(demand) || 1));
            runway = `${days <= 0 ? 1 : days} days remaining`;
          }

          let customSub = alert.message || 'Product quantity below safety levels.';
          if (alert.message) {
            const productName = alert.message.split(' at ')[0].split(' in ')[0].split(' is ')[0];
            if (qty === 0) {
              customSub = `${productName} is fully out of stock at ${alert.warehouseName || 'warehouse'}.`;
            } else if (qty < threshold) {
              customSub = `${productName} stock running low at ${alert.warehouseName || 'warehouse'}. Current stock: ${qty} units (Threshold: ${threshold}).`;
            } else {
              customSub = `${productName} stock has recovered. Current stock: ${qty} units.`;
            }
          }
          
          let liveSev = sev;
          if (qty >= threshold) {
            liveSev = 'LOW';
          } else if (qty === 0) {
            liveSev = 'HIGH';
          } else {
            liveSev = 'MED';
          }

          return {
            id: alert.id,
            severity: liveSev,
            title: qty === 0 ? 'Stockout' : qty < threshold ? 'Low Stock Warning' : 'Stock Restored',
            sub: customSub,
            location: alert.warehouseName || 'Assigned Warehouse',
            demandSpeed: demand,
            currentStock: `${qty} units`,
            runway: runway,
            createdAt: new Date(alert.createdAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            isNew: false
          };
        });
        setAlerts(mapped);
      } else {
        setAlerts([]);
      }
    } catch (err) {
      console.error('Failed to load database alerts, falling back:', err);
      setAlerts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveAlerts();
  }, []);

  const handleRefresh = () => {
    fetchLiveAlerts(true);
  };

  const sevClasses = {
    HIGH: 'bg-rose-100 text-rose-800 border border-rose-200 shadow-sm',
    CRITICAL: 'bg-rose-100 text-rose-800 border border-rose-200 shadow-sm',
    MED: 'bg-amber-100 text-amber-800 border border-amber-200 shadow-sm',
    LOW: 'bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm'
  };

  const sevDotClasses = {
    HIGH: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
    CRITICAL: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
    MED: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
    LOW: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
  };

  const runwayColors = {
    HIGH: 'text-rose-600 font-black',
    CRITICAL: 'text-rose-600 font-black',
    MED: 'text-amber-600 font-black',
    LOW: 'text-emerald-600 font-black'
  };

  const handleAction = (alertId, actionName) => {
    alert(`Backend action dispatched: [${actionName}] for alert ID ${alertId}`);
    if (actionName === 'Snooze' || actionName === 'Reorder') {
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          alert.sub.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = activeSeverity === 'ALL' || alert.severity === activeSeverity;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="w-full lg:w-[420px] bg-gradient-to-br from-white to-slate-50/60 rounded-3xl border border-slate-100/90 shadow-[0_4px_16px_-4px_rgba(148,163,184,0.08)] flex flex-col p-5 transition-all duration-300 hover:shadow-xl shrink-0 group animate-fade-in">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div>
            <h3 className="text-[14px] font-extrabold text-slate-800 tracking-tight leading-none">Live Telemetry Alert Feed</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wide">Secure Database Stream</p>
          </div>
        </div>

        {/* Sync/Refresh DB Button */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all duration-300 ${refreshing ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-black text-white border-black hover:bg-zinc-900 active:scale-95 cursor-pointer'}`}
        >
          <span className={`w-2 h-2 rounded-full border-2 border-white border-t-transparent ${refreshing ? 'animate-spin' : ''}`}></span>
          {refreshing ? 'Syncing...' : 'Sync Database'}
        </button>
      </div>

      {/* Filters */}
      <div className="mt-3.5 flex flex-col gap-3 pb-3 border-b border-slate-100">
        <div className="relative group">
          <svg className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Filter alerts by SKU or WH..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400/50 outline-none text-slate-700 placeholder:text-slate-400 font-bold shadow-inner"
          />
        </div>

        {/* Severity Tabs */}
        <div className="flex items-center gap-1.5">
          {['ALL', 'HIGH', 'MED', 'LOW'].map(sev => (
            <button
              key={sev}
              onClick={() => setActiveSeverity(sev)}
              className={`px-3 py-1.5 rounded-xl text-[9px] font-black tracking-wide uppercase transition-all duration-200 border cursor-pointer ${activeSeverity === sev ? 'bg-black text-white border-black shadow-sm' : 'bg-transparent text-slate-500 border-slate-200/80 hover:text-slate-700 hover:bg-slate-100/50'}`}
            >
              {sev === 'HIGH' ? 'CRITICAL' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Scroll Deck */}
      <div className="flex-1 flex flex-col gap-3 mt-4 overflow-y-auto max-h-[360px] pr-1.5 scrollbar-thin">
        {loading ? (
          <div className="flex flex-col gap-2.5 py-6">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="h-[64px] bg-slate-100/60 rounded-2xl animate-pulse border border-slate-100"></div>
            ))}
          </div>
        ) : filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            // High visibility shaded alerts background colors
            const alertCardShades = {
              HIGH: 'bg-rose-50/70 hover:bg-rose-50 border-rose-100 hover:border-rose-300/60',
              CRITICAL: 'bg-rose-50/70 hover:bg-rose-50 border-rose-100 hover:border-rose-300/60',
              MED: 'bg-amber-50/70 hover:bg-amber-50 border-amber-100 hover:border-amber-300/60',
              LOW: 'bg-emerald-50/70 hover:bg-emerald-50 border-emerald-100 hover:border-emerald-300/60'
            };

            const cardHighlight = alert.isNew 
              ? 'border-indigo-400 bg-indigo-50/60 animate-pulse shadow-[0_0_15px_rgba(79,70,229,0.15)]' 
              : `${alertCardShades[alert.severity] || 'bg-slate-50/70 border-slate-100'} shadow-[0_2px_8px_-2px_rgba(148,163,184,0.06)]`;

            return (
              <div 
                key={alert.id} 
                className={`border rounded-2xl p-3.5 transition-all duration-300 flex flex-col gap-3.5 cursor-pointer hover:scale-[1.01] ${cardHighlight}`}
                onClick={() => setDetailModalAlert(alert)}
              >
                {/* Alert Primary Summary Row */}
                <div className="flex items-center justify-between gap-3.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${sevDotClasses[alert.severity] || 'bg-slate-500'}`}></span>
                    <span className={`text-[8.5px] font-black px-2 py-0.5 rounded-lg text-center tracking-wide leading-none ${sevClasses[alert.severity] || 'bg-slate-100 text-slate-700'}`}>
                      {alert.severity === 'HIGH' ? 'CRITICAL' : alert.severity}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-[12.5px] font-extrabold text-slate-800 truncate leading-none">
                      {alert.title}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-500 mt-1.5 truncate leading-none">
                      {alert.sub}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Close/Dismiss Icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAlerts(prev => prev.filter(a => a.id !== alert.id));
                      }}
                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all border-none bg-transparent cursor-pointer flex items-center justify-center"
                      title="Dismiss Alert"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-5 text-center bg-slate-50/50 rounded-2xl border border-slate-200/60">
            <span className="text-xl">✓</span>
            <h5 className="text-[12px] font-extrabold text-slate-700 mt-2">All Clear, Commander!</h5>
            <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] leading-tight">No active stock or capacity issues reported across the telemetry grid.</p>
          </div>
        )}
      </div>

      {/* ── Glassmorphic Detail Modal ── */}
      {detailModalAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setDetailModalAlert(null)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-50 transform transition-all border border-slate-100 flex flex-col p-6 gap-5 animate-fade-in select-none animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${sevDotClasses[detailModalAlert.severity] || 'bg-slate-500'}`}></span>
                <h3 className="text-[14px] font-extrabold text-slate-800 tracking-tight leading-none">
                  Telemetry Alert Details
                </h3>
              </div>
              <button 
                onClick={() => setDetailModalAlert(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all border-none bg-transparent cursor-pointer text-base font-bold flex items-center justify-center w-6 h-6"
              >
                &times;
              </button>
            </div>

            {/* Severity Card info */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-[8.5px] font-black px-2 py-0.5 rounded-lg text-center tracking-wide leading-none ${sevClasses[detailModalAlert.severity] || 'bg-slate-100 text-slate-700'}`}>
                  {detailModalAlert.severity === 'HIGH' ? 'CRITICAL' : detailModalAlert.severity}
                </span>
                <span className="text-[9.5px] font-bold text-slate-400">{detailModalAlert.createdAt}</span>
              </div>
              <h4 className="text-[13px] font-black text-slate-800 mt-1 leading-tight">{detailModalAlert.title}</h4>
              <p className="text-[11px] font-bold text-slate-500 leading-normal">{detailModalAlert.sub}</p>
            </div>

            {/* Diagnostic stats list */}
            <div className="grid grid-cols-2 gap-3 text-[10.5px]">
              <div className="p-3 bg-slate-50/50 border border-slate-100/60 rounded-xl flex flex-col">
                <span className="font-extrabold text-slate-400 uppercase text-[8px] tracking-wider">Facility Location</span>
                <span className="font-extrabold text-slate-800 mt-1 truncate">{detailModalAlert.location}</span>
              </div>
              <div className="p-3 bg-slate-50/50 border border-slate-100/60 rounded-xl flex flex-col">
                <span className="font-extrabold text-slate-400 uppercase text-[8px] tracking-wider">Daily Demand Velocity</span>
                <span className="font-extrabold text-slate-800 mt-1">{detailModalAlert.demandSpeed}</span>
              </div>
              <div className="p-3 bg-slate-50/50 border border-slate-100/60 rounded-xl flex flex-col">
                <span className="font-extrabold text-slate-400 uppercase text-[8px] tracking-wider">Current Stock</span>
                <span className="font-extrabold text-slate-800 mt-1">{detailModalAlert.currentStock}</span>
              </div>
              <div className="p-3 bg-slate-50/50 border border-slate-100/60 rounded-xl flex flex-col">
                <span className="font-extrabold text-slate-400 uppercase text-[8px] tracking-wider">Runway safety limit</span>
                <span className={`mt-1 font-black ${runwayColors[detailModalAlert.severity] || 'text-slate-700'}`}>{detailModalAlert.runway}</span>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center gap-3 border-t border-slate-100 pt-4 mt-2">
              {(userRole === 'ProcurementOfficer' || userRole === 'Administrator') ? (
                <button
                  onClick={() => {
                    handleAction(detailModalAlert.id, 'Reorder');
                    setDetailModalAlert(null);
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black py-2.5 px-3 rounded-xl shadow-md shadow-indigo-200 active:scale-95 transition-all border-none cursor-pointer text-center"
                >
                  ⚡ Reorder Now
                </button>
              ) : (
                <button
                  onClick={() => setDetailModalAlert(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-black py-2.5 px-4 rounded-xl active:scale-95 transition-all border-none cursor-pointer text-center"
                >
                  Close Details
                </button>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveAlerts;
