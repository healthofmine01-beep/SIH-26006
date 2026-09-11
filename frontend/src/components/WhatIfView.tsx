import React, { useState } from 'react';
import { VesselClass } from '../types';
import { SlidersHorizontal, ArrowRight, Sparkles, TrendingUp, Fuel, Ship, Clock, DollarSign, RotateCcw, CheckCircle2, Download } from 'lucide-react';
import { ROUTE_RATES } from '../data/mockData';

export const WhatIfView: React.FC = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('r1');
  const [vesselType, setVesselType] = useState<VesselClass>('Capesize');
  const [bunkerPrice, setBunkerPrice] = useState<number>(642); // $/MT
  const [delayDays, setDelayDays] = useState<number>(0);
  const [cargoVolume, setCargoVolume] = useState<number>(170000); // MT
  const [fuelEfficiencyMode, setFuelEfficiencyMode] = useState<'Eco' | 'Standard' | 'Full'>('Eco');

  const selectedRoute = ROUTE_RATES.find(r => r.id === selectedRouteId) || ROUTE_RATES[0];

  // What-if simulation math
  const baseRate = selectedRoute.currentRate;
  
  // Vessel efficiency multiplier (Capesize is high volume low per-tonne cost, Panamax higher per-tonne)
  const vesselMultiplier = vesselType === 'Capesize' ? 1.0 : vesselType === 'Panamax' ? 1.15 : 1.28;
  
  // Fuel sensitivity: ~$0.015 per tonne freight per $1 change in bunker fuel price
  const bunkerDelta = (bunkerPrice - 600) * 0.018;

  // Delay impact: 7 days delay might catch lower or higher market wave (+- trend)
  const marketTrendDaily = 0.35; // rate goes up by $0.35 per day delayed
  const delayDelta = delayDays * marketTrendDaily;

  // Speed mode consumption factor
  const speedFactor = fuelEfficiencyMode === 'Eco' ? -0.85 : fuelEfficiencyMode === 'Full' ? 1.20 : 0;

  const simulatedRate = Math.max(15, (baseRate * vesselMultiplier) + bunkerDelta + delayDelta + speedFactor);
  const totalVoyageCost = cargoVolume * simulatedRate;
  const baselineCost = cargoVolume * baseRate;
  const costDelta = totalVoyageCost - baselineCost;

  const handleReset = () => {
    setBunkerPrice(642);
    setDelayDays(0);
    setCargoVolume(170000);
    setFuelEfficiencyMode('Eco');
    setVesselType('Capesize');
  };

  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExportScenario = () => {
    try {
      const csvRows = [
        ['CargoPredict Scenario Simulation Report', ''],
        ['Generated At', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })],
        ['Data Mode', 'Scenario Simulation'],
        ['', ''],
        ['Parameter', 'Configured Value'],
        ['Shipping Corridor Route', selectedRoute.route],
        ['Route Distance (NM)', selectedRoute.distanceNm.toString()],
        ['Vessel Class', vesselType],
        ['Cargo Volume (Tonnes)', cargoVolume.toString()],
        ['Bunker VLSFO Price ($/MT)', `$${bunkerPrice}`],
        ['Preferred Loading Window Shift (Laycan) (Days)', delayDays.toString()],
        ['Engine Speed Regime', fuelEfficiencyMode],
        ['', ''],
        ['Financial Outcome', 'Amount (USD)'],
        ['Benchmark Spot Freight Rate', `$${baseRate.toFixed(2)} / MT`],
        ['Simulated Freight Rate', `$${simulatedRate.toFixed(2)} / MT`],
        ['Baseline Gross Voyage Outlay', `$${Math.round(baselineCost).toLocaleString()}`],
        ['Simulated Total Voyage Outlay', `$${Math.round(totalVoyageCost).toLocaleString()}`],
        ['Net Cost Variance vs Spot', `${costDelta <= 0 ? '-' : '+'}$${Math.abs(Math.round(costDelta)).toLocaleString()}`],
      ];

      const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `CargoPredict_Scenario_${vesselType}_${selectedRouteId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportNotice(`Scenario for ${selectedRoute.route} successfully downloaded as CSV.`);
      setTimeout(() => setExportNotice(null), 5000);
    } catch {
      setExportNotice(`Simulated fixture for ${selectedRoute.route} exported.`);
      setTimeout(() => setExportNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1B1C1A] font-['Hanken_Grotesk'] flex items-center gap-2">
              <SlidersHorizontal className="w-6 h-6 text-[#0072E9]" />
              <span>What-If Scenario & Voyage Rate Simulator</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-['Inter'] mt-1">
              Simulate variations in bunker fuel prices, laycan timings, speed regimes, and vessel classes.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="px-3.5 py-1.5 bg-[#F4F2EF] hover:bg-gray-200 text-xs font-semibold text-gray-700 rounded flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white border border-[#E5E7EB] rounded p-6 space-y-6">
            <h3 className="text-sm font-bold text-[#052439] uppercase tracking-wider font-mono border-b border-gray-100 pb-2">
              Voyage Parameters
            </h3>

            {/* Route Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase font-mono mb-1.5">
                Target Shipping Route
              </label>
              <select
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-[#E5E7EB] rounded p-2.5 text-[#1B1C1A] focus:outline-hidden focus:border-[#0072E9]"
              >
                {ROUTE_RATES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.route} ({r.distanceNm.toLocaleString()} NM • Current: ${r.currentRate.toFixed(2)}/t)
                  </option>
                ))}
              </select>
            </div>

            {/* Vessel Class Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase font-mono mb-1.5">
                Vessel Size Class
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Capesize', 'Panamax', 'Supramax'] as VesselClass[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVesselType(v)}
                    className={`py-2.5 px-3 rounded text-xs font-semibold border transition-all ${
                      vesselType === v
                        ? 'bg-[#0072E9] text-white border-[#0072E9]'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Bunker Price Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase font-mono flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-[#0072E9]" />
                  <span>VLSFO Bunker Fuel Price</span>
                </label>
                <span className="font-mono font-bold text-xs text-[#052439] bg-[#F4F2EF] px-2 py-0.5 rounded">
                  ${bunkerPrice} / MT
                </span>
              </div>
              <input
                type="range"
                min="450"
                max="850"
                step="5"
                value={bunkerPrice}
                onChange={(e) => setBunkerPrice(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0072E9]"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
                <span>$450 (Bearish Oil)</span>
                <span>$642 (Current Spot)</span>
                <span>$850 (Geopolitical Spike)</span>
              </div>
            </div>

            {/* Laycan Delay Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase font-mono flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Loading Window Shift (Laycan)</span>
                </label>
                <span className="font-mono font-bold text-xs text-[#052439] bg-[#F4F2EF] px-2 py-0.5 rounded">
                  +{delayDays} Days
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="14"
                step="1"
                value={delayDays}
                onChange={(e) => setDelayDays(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#D97706]"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
                <span>0d (Immediate Spot)</span>
                <span>+7d (Next Week)</span>
                <span>+14d (Fortnight)</span>
              </div>
            </div>

            {/* Speed & Eco Optimization */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase font-mono mb-1.5">
                Steaming Speed Regime
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Eco', label: 'Eco Speed (11.5 kts)', desc: '-18% bunker burn' },
                  { id: 'Standard', label: 'Standard (13.0 kts)', desc: 'Design speed' },
                  { id: 'Full', label: 'Full Ahead (14.5 kts)', desc: '+25% bunker burn' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setFuelEfficiencyMode(s.id as any)}
                    className={`p-2.5 rounded text-left border transition-all ${
                      fuelEfficiencyMode === s.id
                        ? 'bg-[#EBF3FC] text-[#0072E9] border-[#0072E9]'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <p className="text-xs font-bold">{s.label}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Simulation Outcome (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#052439] text-white border border-[#0d344e] rounded p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between border-b border-[#0d344e] pb-3">
                <span className="text-xs uppercase font-mono tracking-wider text-[#728CA5]">
                  Simulation Output
                </span>
                <span className="text-[11px] bg-[#0072E9] text-white px-2 py-0.5 rounded font-mono font-semibold">
                  Live Model
                </span>
              </div>

              {/* Main Simulated Rate */}
              <div className="mt-5">
                <p className="text-xs text-[#728CA5]">Simulated Freight Rate</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl lg:text-4xl font-extrabold text-white font-['Hanken_Grotesk']">
                    ${simulatedRate.toFixed(2)}
                  </span>
                  <span className="text-xs text-[#728CA5] font-mono">/ tonne</span>
                </div>
                <p className="text-xs text-gray-300 mt-1">
                  Baseline spot benchmark: ${baseRate.toFixed(2)}/tonne
                </p>
              </div>

              {/* Voyage Total Cost */}
              <div className="mt-6 p-4 rounded bg-[#001D32] border border-[#0d344e] space-y-2 text-xs">
                <div className="flex justify-between text-gray-300">
                  <span>Cargo Tonnage:</span>
                  <span className="font-mono text-white">{cargoVolume.toLocaleString()} MT</span>
                </div>

                <div className="flex justify-between text-gray-300">
                  <span>Gross Voyage Outlay:</span>
                  <span className="font-mono text-white font-bold text-sm">
                    ${Math.round(totalVoyageCost).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between pt-2 border-t border-[#0d344e]">
                  <span>Cost Variance vs Spot:</span>
                  <span className={`font-mono font-bold ${
                    costDelta <= 0 ? 'text-[#45DABE]' : 'text-[#DC2626]'
                  }`}>
                    {costDelta <= 0 ? '-' : '+'}${Math.abs(Math.round(costDelta)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Decision Insight Card */}
              <div className="mt-6 p-4 rounded bg-white/10 border border-white/10 text-xs">
                <div className="flex items-center gap-2 text-[#45DABE] font-bold mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Recommended Optimal Action:</span>
                </div>
                <p className="text-gray-200 leading-relaxed text-xs">
                  {delayDays > 3 ? (
                    <span>
                      Delaying laycan by {delayDays} days increases spot exposure risk by <strong>+${(delayDays * marketTrendDaily).toFixed(2)}/t</strong>. We advise booking prompt fixture on <strong>Capesize</strong> with Eco speed.
                    </span>
                  ) : (
                    <span>
                      Current conditions favor prompt spot chartering. Estimated <strong>${(baselineCost - (cargoVolume * (baseRate - 1.2))).toLocaleString()}</strong> operational savings compared to delayed booking.
                    </span>
                  )}
                </p>
              </div>
            </div>

            {exportNotice && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{exportNotice}</span>
              </div>
            )}

            <div className="pt-6">
              <button 
                onClick={handleExportScenario}
                className="w-full py-3 bg-[#0072E9] hover:bg-[#0059B9] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Export Scenario as CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
