import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Ship, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  BarChart3, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft, 
  Anchor, 
  Printer, 
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  Gauge
} from 'lucide-react';
import { FreightAnalysisResult, RecommendationAction } from '../types';
import { FreightForecastChart } from './FreightForecastChart';
import { AVAILABLE_VESSELS } from '../data/mockData';

interface PredictionResultPageProps {
  result: FreightAnalysisResult;
  onModifyDetails: () => void;
  onBookCharter?: () => void;
  onExploreWhatIf?: () => void;
  onViewForecast?: () => void;
}

export const PredictionResultPage: React.FC<PredictionResultPageProps> = ({
  result,
  onModifyDetails,
  onBookCharter,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'forecast' | 'vessel' | 'whatif'>('forecast');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [printStatus, setPrintStatus] = useState<string | null>(null);

  const handlePrintReport = () => {
    try {
      window.print();
    } catch {
      setPrintStatus('Print dialog generated. For full multi-page PDF, use browser Print shortcut (Ctrl/Cmd + P).');
      setTimeout(() => setPrintStatus(null), 4000);
    }
  };

  // What-If interactive state for inline testing
  const [bunkerShiftPercent, setBunkerShiftPercent] = useState<number>(0);
  const [portDelayDays, setPortDelayDays] = useState<number>(0);

  // Calculated What-If effects
  const baseRate = result.estimatedRatePerTonne;
  const simulatedRate = +(baseRate * (1 + (bunkerShiftPercent * 0.45) / 100)).toFixed(2);
  const demurrageDailyRate = 22500; // USD per day
  const simulatedDemurrage = portDelayDays * demurrageDailyRate;
  const simulatedTotalCost = Math.round((simulatedRate * result.input.cargoQuantity) + simulatedDemurrage);
  const costDiff = simulatedTotalCost - result.totalFreightCost;

  // Normalized action
  const action: RecommendationAction = result.recommendedAction;
  const isBookNow = action === 'BOOK NOW' || action === 'BUY NOW';
  const isWait = action === 'WAIT' || action === 'WAIT 7 DAYS';
  const isAlt = action === 'CONSIDER ALTERNATIVE';

  const actionDisplay = isBookNow ? 'BOOK NOW' : isWait ? 'WAIT' : 'CONSIDER ALTERNATIVE';

  // Badge Styling based on recommendation
  const badgeConfig = isBookNow 
    ? {
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
        text: 'text-emerald-800',
        pill: 'bg-emerald-100 text-emerald-800',
        icon: CheckCircle2,
        subtitle: 'Fix spot fixture within immediate window to lock in favorable rates.',
      }
    : isWait
    ? {
        bg: 'bg-amber-50',
        border: 'border-amber-300',
        text: 'text-amber-800',
        pill: 'bg-amber-100 text-amber-800',
        icon: Clock,
        subtitle: 'Tonnage availability is accumulating; delay fixture by 5–7 days for cost savings.',
      }
    : {
        bg: 'bg-blue-50',
        border: 'border-blue-300',
        text: 'text-blue-800',
        pill: 'bg-blue-100 text-blue-800',
        icon: AlertTriangle,
        subtitle: 'Harbor draft or cargo volume requires parcel splitting or deepwater transshipment.',
      };

  const ActionIcon = badgeConfig.icon;

  return (
    <div className="space-y-6 font-['Inter'] max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Top Header & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onModifyDetails}
            className="text-xs font-semibold text-gray-500 hover:text-[#052439] flex items-center gap-1.5 mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Modify Shipment Details</span>
          </button>

          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#052439] tracking-tight font-['Hanken_Grotesk']">
              Freight Recommendation
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-50 text-[#0072E9] border border-blue-200">
              ML Forecast Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Optimized analysis for bulk procurement to East Coast India terminals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintReport}
            className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-[#052439] rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={onModifyDetails}
            className="px-4 py-2 bg-[#0072E9] hover:bg-[#005bbd] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <span>+ New Analysis</span>
          </button>
        </div>
      </div>

      {printStatus && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{printStatus}</span>
        </div>
      )}

      {/* Shipment Route Ribbon */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="font-bold text-[#052439]">{result.input.cargoType}</span>
          <span className="text-gray-300">•</span>
          <span className="font-mono font-semibold text-gray-800">
            {result.input.cargoQuantity.toLocaleString()} MT
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-700 font-medium">
            {result.input.origin} → <strong className="text-[#052439]">{result.input.destinationPort}</strong>
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-500 font-mono">Contract: {result.input.contractPreference}</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-gray-500">
          <span>Preferred Loading Window (Laycan): {result.input.requiredDate}</span>
          <span>•</span>
          <span className="text-[#0072E9] font-bold">ID: {result.id}</span>
        </div>
      </div>

      {/* PROMINENT RECOMMENDATION HERO & METRICS */}
      <div className={`p-6 sm:p-8 rounded-2xl border ${badgeConfig.border} ${badgeConfig.bg} shadow-sm transition-all`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200/70">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-xs flex items-center justify-center shrink-0 border border-gray-100">
              <ActionIcon className={`w-8 h-8 ${badgeConfig.text}`} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-gray-600">
                  Primary Recommendation
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono ${badgeConfig.pill}`}>
                  {actionDisplay}
                </span>
              </div>

              <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-['Hanken_Grotesk'] mt-1 ${badgeConfig.text}`}>
                {actionDisplay}
              </div>

              <p className="text-xs sm:text-sm text-gray-700 font-medium mt-1">
                {badgeConfig.subtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="bg-white/80 backdrop-blur-xs px-4 py-3 rounded-xl border border-gray-200/80">
              <span className="text-[10px] font-bold text-gray-500 uppercase font-mono block">
                Model Confidence
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-lg font-bold text-[#052439] font-mono">
                  {result.confidenceScore}%
                </span>
                <span className="text-xs text-gray-500 font-medium">High</span>
              </div>
            </div>

            {onBookCharter && (
              <button
                onClick={onBookCharter}
                className="px-6 py-3.5 bg-[#0072E9] hover:bg-[#005bbd] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
              >
                <span>Proceed to Charter</span>
                <Ship className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 4 Core Quantitative Metrics strictly matching user hierarchy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* 1. Recommended Vessel */}
          <div className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-[11px] font-bold font-mono uppercase text-gray-500 block mb-1">
              Recommended Vessel
            </span>
            <div className="text-2xl font-extrabold text-[#052439] font-['Hanken_Grotesk']">
              {result.recommendedVessel}
            </div>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              Class: {result.vesselDwt}
            </p>
          </div>

          {/* 2. Estimated Freight */}
          <div className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-[11px] font-bold font-mono uppercase text-gray-500 block mb-1">
              Estimated Freight
            </span>
            <div className="text-2xl font-extrabold text-[#052439] font-['Hanken_Grotesk']">
              ${result.estimatedRatePerTonne.toFixed(2)}
              <span className="text-xs font-normal text-gray-500"> / tonne</span>
            </div>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              Total: ${(result.totalFreightCost / 1000000).toFixed(2)}M USD
            </p>
          </div>

          {/* 3. Risk */}
          <div className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-[11px] font-bold font-mono uppercase text-gray-500 block mb-1">
              Risk
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-extrabold font-['Hanken_Grotesk'] ${
                result.riskLevel === 'LOW' ? 'text-emerald-700' : result.riskLevel === 'MEDIUM' ? 'text-amber-700' : 'text-red-700'
              }`}>
                {result.riskLevel}
              </span>
              <ShieldCheck className={`w-5 h-5 ${result.riskLevel === 'LOW' ? 'text-emerald-600' : 'text-amber-600'}`} />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Berth draft & congestion normal
            </p>
          </div>

          {/* 4. Recommended Booking Window */}
          <div className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-[11px] font-bold font-mono uppercase text-gray-500 block mb-1">
              Recommended Booking Window
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-[#052439] font-['Hanken_Grotesk'] leading-tight">
              {result.action === 'BOOK_NOW' 
                ? `Prompt (${result.input.requiredDate})`
                : result.action === 'WAIT'
                ? `Wait 7–10 Days (${result.input.requiredDate})`
                : `Review Alternative Window`}
            </div>
            <p className="text-xs text-emerald-700 font-medium mt-1">
              {result.action === 'BOOK_NOW' ? 'Lock forward rate curve' : 'Anticipated lower rate window'}
            </p>
          </div>
        </div>
      </div>

      {/* WHY THIS RECOMMENDATION? (Simple Business Language) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-[#0072E9]" />
          <h2 className="text-lg font-bold text-[#052439] font-['Hanken_Grotesk']">
            Why this recommendation?
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mb-6">
          Key business factors driving this freight decision:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bullet 1: Freight Rates */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-gray-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0072E9] flex items-center justify-center shrink-0 mt-0.5">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#052439]">Freight Rates Trend</h4>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {result.action === 'BOOK_NOW'
                  ? 'Freight rates are expected to rise over the forward window based on Baltic forward momentum.'
                  : result.action === 'WAIT'
                  ? 'Freight rates are projected to soften over the next 7 to 10 days, presenting more favorable fixture terms.'
                  : 'Freight rates remain volatile; alternative timing or parcel split recommended.'}
              </p>
            </div>
          </div>

          {/* Bullet 2: Vessel Suitability */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-gray-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-[#009A84] flex items-center justify-center shrink-0 mt-0.5">
              <Ship className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#052439]">Vessel Suitability</h4>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                The selected {result.recommendedVessel} is suitable for the cargo quantity ({result.input.cargoQuantity.toLocaleString()} MT) with high hold efficiency.
              </p>
            </div>
          </div>

          {/* Bullet 3: Port Constraints & Draft */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-gray-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
              <Anchor className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#052439]">Port Constraints & Draft</h4>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                The vessel satisfies destination-port constraints at {result.input.destinationPort} with safe under-keel clearance.
              </p>
            </div>
          </div>

          {/* Bullet 4: Demurrage Exposure */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-gray-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#052439]">Demurrage & Anchorage Exposure</h4>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Estimated demurrage exposure is acceptable; terminal queue times and berth availability are currently within standard ranges.
              </p>
            </div>
          </div>
        </div>

        {/* Collapsible Technical Details (For Model Audits) */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="flex items-center justify-between w-full py-2 text-xs font-semibold text-gray-600 hover:text-[#052439] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#0072E9]" />
              <span>View Technical Details</span>
            </span>
            {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showTechnicalDetails && result.technicalDetails && (
            <div className="mt-3 p-4 bg-[#F4F7FA] rounded-xl border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs animate-in fade-in">
              <div>
                <span className="text-gray-500 block text-[11px]">Forecasting Engine:</span>
                <span className="font-bold text-[#052439]">{result.technicalDetails.forecastModel}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Ensemble MAPE:</span>
                <span className="font-mono font-bold text-emerald-700">{result.technicalDetails.forecastMape}%</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Baltic Dry Index:</span>
                <span className="font-mono font-bold text-[#052439]">{result.technicalDetails.bdiIndexCurrent}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Bunker VLSFO:</span>
                <span className="font-mono font-bold text-[#052439]">${result.technicalDetails.bunkerVLSFO}/MT</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Port Max Draft:</span>
                <span className="font-mono font-bold text-[#052439]">{result.technicalDetails.portMaxDraftMeters}m</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Laden Vessel Draft:</span>
                <span className="font-mono font-bold text-[#052439]">{result.technicalDetails.vesselLadenDraftMeters}m</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Under-Keel Clearance:</span>
                <span className="font-mono font-bold text-emerald-700">
                  +{(Number(result.technicalDetails?.portMaxDraftMeters || 0) - Number(result.technicalDetails?.vesselLadenDraftMeters || 0)).toFixed(1)}m
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Est. Voyage CO2:</span>
                <span className="font-mono font-bold text-[#052439]">{result.technicalDetails.co2EmissionsTonnes} MT</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DETAILED SUB-SECTIONS / TABS: Freight Forecast | Vessel Match | What-If */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Sub-tab Navigation Header */}
        <div className="border-b border-gray-200 bg-[#F8FAFC] px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#052439] font-['Hanken_Grotesk'] uppercase tracking-wider">
              Detailed Exploration:
            </span>
          </div>

          <div className="flex items-center gap-1 bg-gray-200/60 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab('forecast')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'forecast'
                  ? 'bg-white text-[#052439] shadow-xs'
                  : 'text-gray-600 hover:text-[#052439]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Freight Forecast</span>
            </button>

            <button
              onClick={() => setActiveSubTab('vessel')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'vessel'
                  ? 'bg-white text-[#052439] shadow-xs'
                  : 'text-gray-600 hover:text-[#052439]'
              }`}
            >
              <Ship className="w-3.5 h-3.5" />
              <span>Vessel Match</span>
            </button>

            <button
              onClick={() => setActiveSubTab('whatif')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'whatif'
                  ? 'bg-white text-[#052439] shadow-xs'
                  : 'text-gray-600 hover:text-[#052439]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>What-If Simulator</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Freight Forecast */}
        {activeSubTab === 'forecast' && (
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-base font-bold text-[#052439] font-['Hanken_Grotesk']">
                Rate Trajectory: {result.input.origin} → {result.input.destinationPort}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Historic rate evolution vs. forward 7-day and 30-day predicted confidence intervals.
              </p>
            </div>
            <div className="h-96">
              <FreightForecastChart />
            </div>
          </div>
        )}

        {/* Tab 2: Vessel Match */}
        {activeSubTab === 'vessel' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#052439] font-['Hanken_Grotesk']">
                Recommended Vessel Class: {result.recommendedVessel} ({result.vesselDwt})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Comparison of optimal vessel dimensional parameters against discharge port infrastructure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-gray-200">
                <span className="text-xs font-bold text-gray-700 block mb-1">DWT & Hold Capacity</span>
                <p className="text-xl font-bold text-[#052439] font-mono">{result.vesselDwt}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Optimal for {result.input.cargoQuantity.toLocaleString()} MT parcels with minimal deadfreight.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-gray-200">
                <span className="text-xs font-bold text-gray-700 block mb-1">Vessel Draft vs Port</span>
                <p className="text-xl font-bold text-emerald-700 font-mono">
                  {result.technicalDetails?.vesselLadenDraftMeters}m / {result.technicalDetails?.portMaxDraftMeters}m
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Safe Under-Keel Clearance: +{(Number(result.technicalDetails?.portMaxDraftMeters) - Number(result.technicalDetails?.vesselLadenDraftMeters)).toFixed(1)}m.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-gray-200">
                <span className="text-xs font-bold text-gray-700 block mb-1">Contract Fit</span>
                <p className="text-xl font-bold text-[#0072E9] font-mono">
                  {result.input.contractPreference} Charter
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  High prompt fixture availability in Indian Ocean / Bay of Bengal basin.
                </p>
              </div>
            </div>

            {/* Prompt Available Tonnage Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-[#052439] uppercase font-mono tracking-wider">
                  Available Prompt Tonnage in Basin
                </h4>
                <span className="text-[11px] text-gray-500 font-mono">
                  {AVAILABLE_VESSELS.length} Vessels Verified
                </span>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] text-gray-600 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="p-3">Vessel Name</th>
                      <th className="p-3">Class</th>
                      <th className="p-3">DWT</th>
                      <th className="p-3">Current Location</th>
                      <th className="p-3">Loading Window (Laycan)</th>
                      <th className="p-3">Indicated Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {AVAILABLE_VESSELS.slice(0, 4).map((v) => (
                      <tr key={v.name} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-bold text-[#052439]">{v.name}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#0072E9]">
                            {v.type}
                          </span>
                        </td>
                        <td className="p-3 font-mono">{v.dwt.toLocaleString()} MT</td>
                        <td className="p-3 text-gray-600">{v.currentLocation}</td>
                        <td className="p-3 font-mono text-gray-700">{v.availabilityDate}</td>
                        <td className="p-3 font-mono font-bold text-emerald-700">${v.dailyHireCost.toLocaleString()}/day</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: What-If Simulator */}
        {activeSubTab === 'whatif' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#052439] font-['Hanken_Grotesk']">
                Scenario Stress-Testing: Sensitivities for This Shipment
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Adjust key market variables to simulate potential cost risks before committing to charter.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-[#F8FAFC] rounded-xl border border-gray-200">
              {/* Slider 1: Bunker Price */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                  <span>Bunker Fuel Price Shift (VLSFO)</span>
                  <span className={`font-mono ${bunkerShiftPercent > 0 ? 'text-red-600' : bunkerShiftPercent < 0 ? 'text-emerald-600' : 'text-gray-700'}`}>
                    {bunkerShiftPercent > 0 ? `+${bunkerShiftPercent}%` : `${bunkerShiftPercent}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="30"
                  step="5"
                  value={bunkerShiftPercent}
                  onChange={(e) => setBunkerShiftPercent(Number(e.target.value))}
                  className="w-full accent-[#0072E9] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>-20% (Softening)</span>
                  <span>Baseline ($642/MT)</span>
                  <span>+30% (Spike)</span>
                </div>
              </div>

              {/* Slider 2: Port Congestion */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                  <span>Anchorage Congestion Delay at {result.input.destinationPort}</span>
                  <span className={`font-mono ${portDelayDays > 0 ? 'text-amber-600' : 'text-gray-700'}`}>
                    +{portDelayDays} Days Wait
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={portDelayDays}
                  onChange={(e) => setPortDelayDays(Number(e.target.value))}
                  className="w-full accent-[#0072E9] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>0 Days (Normal)</span>
                  <span>+5 Days</span>
                  <span>+10 Days (Severe Monsoon)</span>
                </div>
              </div>
            </div>

            {/* Dynamic Simulated Impact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-gray-200">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Simulated Freight Rate</span>
                <p className="text-xl font-bold text-[#052439] font-mono mt-1">
                  ${simulatedRate.toFixed(2)} <span className="text-xs text-gray-400 font-normal">/ MT</span>
                </p>
                <span className="text-[11px] text-gray-500">
                  Baseline: ${result.estimatedRatePerTonne.toFixed(2)}/MT
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-gray-200">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Demurrage Liability</span>
                <p className={`text-xl font-bold font-mono mt-1 ${simulatedDemurrage > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  ${simulatedDemurrage.toLocaleString()}
                </p>
                <span className="text-[11px] text-gray-500">
                  At $22,500/day charterparty rate
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-gray-200">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Total Simulated Cost</span>
                <p className="text-xl font-bold text-[#052439] font-mono mt-1">
                  ${simulatedTotalCost.toLocaleString()}
                </p>
                <span className={`text-[11px] font-semibold ${costDiff > 0 ? 'text-red-600' : costDiff < 0 ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {costDiff > 0 ? `+$${costDiff.toLocaleString()} variance` : costDiff < 0 ? `-$${Math.abs(costDiff).toLocaleString()} variance` : 'Matches baseline'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Return & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-200">
        <button
          onClick={onModifyDetails}
          className="text-xs font-semibold text-gray-600 hover:text-[#052439] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Modify Shipment Requirements</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onModifyDetails}
            className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-[#052439] text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Run Another Analysis
          </button>
          {onBookCharter && (
            <button
              onClick={onBookCharter}
              className="px-6 py-2.5 bg-[#0072E9] hover:bg-[#005bbd] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <span>Execute Charter Fixture</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
