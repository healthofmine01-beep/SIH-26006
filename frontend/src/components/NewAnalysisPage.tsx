import React, { useState } from 'react';
import { 
  Ship, 
  ArrowRight, 
  Anchor, 
  Info, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Layers,
  Sparkles,
  MapPin,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { FreightAnalysisInput } from '../types';
import { JourneyStepBar } from './JourneyStepBar';

interface NewAnalysisPageProps {
  onAnalyze: (input: FreightAnalysisInput) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const NewAnalysisPage: React.FC<NewAnalysisPageProps> = ({
  onAnalyze,
  onCancel,
  isLoading = false,
}) => {
  const [cargoType, setCargoType] = useState('Coking Coal');
  const [cargoQuantity, setCargoQuantity] = useState<number>(75000);
  const [origin, setOrigin] = useState('Newcastle, Australia');
  const [destinationPort, setDestinationPort] = useState('Visakhapatnam (Vizag)');
  const [requiredDate, setRequiredDate] = useState('2024-11-20');
  const [contractPreference, setContractPreference] = useState<'Spot' | 'Time Charter' | 'Either'>('Spot');

  // Single Compact Demo Scenario
  const handleApplyDemoScenario = () => {
    setCargoType('Coking Coal');
    setCargoQuantity(75000);
    setOrigin('Newcastle, Australia');
    setDestinationPort('Visakhapatnam (Vizag)');
    setRequiredDate('2024-11-20');
    setContractPreference('Spot');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze({
      cargoType,
      cargoQuantity: Number(cargoQuantity) || 75000,
      origin,
      destinationPort,
      requiredDate,
      contractPreference,
    });
  };

  const isHaldia = destinationPort.toLowerCase().includes('haldia');

  return (
    <div className="space-y-6 font-['Inter'] max-w-5xl mx-auto">
      {/* 1. Header & Demo Data Disclosure */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0072E9]" />
            <span className="text-xs font-bold text-gray-500 font-mono tracking-wider uppercase">
              Freight Procurement Decision Engine
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[#0072E9] text-[11px] font-mono font-semibold border border-blue-200">
            <span>Active ML Engine</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#052439] tracking-tight font-['Hanken_Grotesk']">
          New Freight Analysis
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Enter your cargo requirements, corridor, and preferred loading window to generate AI-powered freight forecasts and vessel recommendations.
        </p>
      </div>

      {/* 2. Structured 5-Step Journey Progression Bar */}
      <JourneyStepBar currentStage="cargo" isAnalyzing={isLoading} />

      {/* 3. Compact 1-Click Baseline Scenario */}
      <div className="bg-[#F8FAFC] border border-gray-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Sparkles className="w-4 h-4 text-[#0072E9] shrink-0" />
          <span>
            Need a baseline test parcel? <strong>Newcastle → Vizag (75k MT Coking Coal)</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={handleApplyDemoScenario}
          className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0"
        >
          Load Sample Parcel
        </button>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* SECTION 1: CARGO */}
        <div>
          <div className="flex items-center gap-2 pb-2 mb-4 border-b border-gray-100">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0072E9] text-xs font-bold flex items-center justify-center">1</span>
            <h3 className="text-sm font-bold text-[#052439] uppercase font-mono tracking-wider">
              Cargo Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Cargo Type */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Cargo Type
              </label>
              <select
                value={cargoType}
                onChange={(e) => setCargoType(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium bg-[#F8FAFC] border border-gray-200 rounded-lg p-3 text-[#1B1C1A] focus:outline-hidden focus:border-[#0072E9] focus:bg-white"
              >
                <option value="Coking Coal">Coking Coal (Metallurgical)</option>
                <option value="Iron Ore">Iron Ore (Fines / Pellets)</option>
                <option value="Thermal Coal">Thermal Coal (Steam Coal)</option>
                <option value="Bauxite / Limestone">Bauxite / Limestone</option>
                <option value="Other Bulk Cargo">Other Dry Bulk Commodity</option>
              </select>
              <p className="text-[11px] text-gray-400 mt-1">
                Classifies stowage factor and hold cleaning considerations.
              </p>
            </div>

            {/* Cargo Quantity */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-700">
                  Cargo Quantity (Tonnes)
                </label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setCargoQuantity(55000)}
                    className="text-[10px] px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 font-mono text-gray-700 cursor-pointer"
                  >
                    55k (Supramax)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCargoQuantity(75000)}
                    className="text-[10px] px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 font-mono text-gray-700 cursor-pointer"
                  >
                    75k (Panamax)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCargoQuantity(160000)}
                    className="text-[10px] px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 font-mono text-gray-700 cursor-pointer"
                  >
                    160k (Capesize)
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="10000"
                  step="5000"
                  required
                  value={cargoQuantity}
                  onChange={(e) => setCargoQuantity(Number(e.target.value))}
                  placeholder="e.g. 75000"
                  className="w-full text-xs sm:text-sm font-mono font-semibold bg-[#F8FAFC] border border-gray-200 rounded-lg p-3 pr-16 text-[#1B1C1A] focus:outline-hidden focus:border-[#0072E9] focus:bg-white"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 font-mono pointer-events-none">
                  Metric Tonnes
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Parcel weight dictates vessel deadweight tonnage (DWT) matching.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: ROUTE */}
        <div>
          <div className="flex items-center gap-2 pb-2 mb-4 border-b border-gray-100">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0072E9] text-xs font-bold flex items-center justify-center">2</span>
            <h3 className="text-sm font-bold text-[#052439] uppercase font-mono tracking-wider">
              Route & Ports
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Origin Port */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Origin Loading Port
              </label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium bg-[#F8FAFC] border border-gray-200 rounded-lg p-3 text-[#1B1C1A] focus:outline-hidden focus:border-[#0072E9] focus:bg-white"
              >
                <option value="Newcastle, Australia">Newcastle, Australia (East Coast)</option>
                <option value="Hay Point, Australia">Hay Point, Australia (Queensland)</option>
                <option value="Gladstone, Australia">Gladstone, Australia</option>
                <option value="Port Hedland, Australia">Port Hedland, Australia (Pilbara)</option>
                <option value="Richards Bay, South Africa">Richards Bay, South Africa</option>
                <option value="Taboneo, Indonesia">Taboneo Anchorage, Indonesia</option>
              </select>
              <p className="text-[11px] text-gray-400 mt-1">
                Loading terminal and export route.
              </p>
            </div>

            {/* Destination Port */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Destination Discharge Port (East Coast India)
              </label>
              <select
                value={destinationPort}
                onChange={(e) => setDestinationPort(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold bg-[#F8FAFC] border border-gray-200 rounded-lg p-3 text-[#1B1C1A] focus:outline-hidden focus:border-[#0072E9] focus:bg-white"
              >
                <option value="Visakhapatnam (Vizag)">Visakhapatnam (Vizag) — 14.5m Draft</option>
                <option value="Paradip Port">Paradip Port — 18.2m Deepwater Draft</option>
                <option value="Haldia">Haldia — 8.8m River Draft Restricted</option>
                <option value="Dhamra Port">Dhamra Port — 18.0m Deepwater Draft</option>
                <option value="Krishnapatnam">Krishnapatnam — 16.0m Draft</option>
              </select>

              {isHaldia ? (
                <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    <strong>Draft Notice:</strong> Haldia maximum permissible draft is ~8.8m. Capesize or laden Panamax will require lightering at Sandheads or parcel split.
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-gray-400 mt-1">
                  Harbor draft limits dictate whether Capesize can berth directly.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: SCHEDULE & CHARTER PREFERENCE */}
        <div>
          <div className="flex items-center gap-2 pb-2 mb-4 border-b border-gray-100">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0072E9] text-xs font-bold flex items-center justify-center">3</span>
            <h3 className="text-sm font-bold text-[#052439] uppercase font-mono tracking-wider">
              Schedule & Charter Terms
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Required Date / Laycan */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Preferred Loading Window (Laycan)
              </label>
              <input
                type="date"
                required
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium bg-[#F8FAFC] border border-gray-200 rounded-lg p-3 text-[#1B1C1A] focus:outline-hidden focus:border-[#0072E9] focus:bg-white"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Target date window for vessel readiness or laycan cancel date.
              </p>
            </div>

            {/* Charter Preference */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Charter Preference
              </label>
              <select
                value={contractPreference}
                onChange={(e) => setContractPreference(e.target.value as any)}
                className="w-full text-xs sm:text-sm font-medium bg-[#F8FAFC] border border-gray-200 rounded-lg p-3 text-[#1B1C1A] focus:outline-hidden focus:border-[#0072E9] focus:bg-white"
              >
                <option value="Spot">Spot Fixture (Single Voyage)</option>
                <option value="Time Charter">Short Period Time Charter (1–3 Months)</option>
                <option value="Either">Either (Let Model Decide)</option>
              </select>
              <p className="text-[11px] text-gray-400 mt-1">
                Spot fixture fixes immediate $/MT; Time charter hedges against volatility.
              </p>
            </div>
          </div>
        </div>

        {/* PRIMARY ACTION: TRIGGER AI ANALYSIS */}
        <div className="pt-5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-gray-500 max-w-md">
            <span className="font-semibold text-gray-700 block">AI Analysis:</span>
            Evaluates forward freight rate projections, port draft clearance limits, bunker hedging spreads, and demurrage congestion risk.
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-4 bg-[#0072E9] hover:bg-[#005bbd] text-white text-sm sm:text-base font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Running AI Analysis...</span>
              </>
            ) : (
              <>
                <span>Run Freight Analysis →</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
