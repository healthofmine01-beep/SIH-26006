import React, { useState } from 'react';
import { 
  ArrowRight, 
  Ship, 
  Calendar, 
  MapPin, 
  Weight, 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { FreightAnalysisInput, AnalysisHistoryItem } from '../types';

interface DashboardViewProps {
  onStartAnalysis: (input: FreightAnalysisInput) => void;
  onNavigateTab: (tab: any) => void;
  recentAnalyses: AnalysisHistoryItem[];
  onViewAnalysisById: (id: string) => void;
  userRole?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onStartAnalysis,
  onNavigateTab,
  recentAnalyses,
  onViewAnalysisById,
  userRole = 'Procurement Officer',
}) => {
  // Form State for Quick Analysis on Dashboard
  const [cargoType, setCargoType] = useState('Coking Coal');
  const [cargoQuantity, setCargoQuantity] = useState<number>(75000);
  const [origin, setOrigin] = useState('Hay Point, Australia');
  const [destinationPort, setDestinationPort] = useState('Visakhapatnam (Vizag)');
  const [requiredDate, setRequiredDate] = useState('2024-11-15');
  const [contractPreference, setContractPreference] = useState<'Spot' | 'Time Charter' | 'Either'>('Spot');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartAnalysis({
      cargoType,
      cargoQuantity: Number(cargoQuantity) || 75000,
      origin,
      destinationPort,
      requiredDate,
      contractPreference,
    });
  };

  return (
    <div className="space-y-8 font-['Inter']">
      {/* 1. Header Banner matching Mockup Screen 3 */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#052439] tracking-tight font-['Hanken_Grotesk']">
              Welcome back, {userRole}!
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Plan your bulk cargo procurement with AI-powered freight insights and vessel optimization.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>East Coast Ports Status: Normal</span>
            </div>
          </div>
        </div>

        {/* 4 Quick Category Cards matching Mockup Screen 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div
            onClick={() => onNavigateTab('new-analysis')}
            className="p-4 rounded-xl border border-gray-200 bg-[#F8FAFC] hover:bg-white hover:border-[#0072E9] hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-[#0072E9] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#052439] flex items-center justify-between">
              <span>New Analysis</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0072E9] transition-colors" />
            </h4>
            <p className="text-[11px] text-gray-500 mt-1">
              Get AI-powered freight forecasts and vessel recommendations.
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('history')}
            className="p-4 rounded-xl border border-gray-200 bg-[#F8FAFC] hover:bg-white hover:border-[#0072E9] hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#052439] flex items-center justify-between">
              <span>My Analyses</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0072E9] transition-colors" />
            </h4>
            <p className="text-[11px] text-gray-500 mt-1">
              View and manage past procurement plans
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('forecast')}
            className="p-4 rounded-xl border border-gray-200 bg-[#F8FAFC] hover:bg-white hover:border-[#0072E9] hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#052439] flex items-center justify-between">
              <span>Market Forecast</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0072E9] transition-colors" />
            </h4>
            <p className="text-[11px] text-gray-500 mt-1">
              Inspect 7 to 30-day forward freight curves
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('vessel-port')}
            className="p-4 rounded-xl border border-gray-200 bg-[#F8FAFC] hover:bg-white hover:border-[#0072E9] hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Ship className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#052439] flex items-center justify-between">
              <span>Vessel & Port</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0072E9] transition-colors" />
            </h4>
            <p className="text-[11px] text-gray-500 mt-1">
              Review draft constraints & vessel suitability
            </p>
          </div>
        </div>
      </div>

      {/* 2. PROMINENT SECTION: Start a New Freight Analysis (Core Mandate from Section 4) */}
      <div className="bg-white border-2 border-[#0072E9]/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[#0072E9] text-white flex items-center justify-center">
                <Ship className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#052439] font-['Hanken_Grotesk']">
                Start a New Freight Analysis
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter your cargo and route details to receive an AI-powered procurement and vessel chartering recommendation.
            </p>
          </div>

          <span className="hidden sm:inline-block text-xs bg-blue-50 text-[#0072E9] font-semibold px-2.5 py-1 rounded">
            SIH 26006 Decision Engine
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Cargo Type */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase font-mono mb-1.5">
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
                <option value="Other Bulk Cargo">Other Dry Bulk Cargo</option>
              </select>
              <p className="text-[11px] text-gray-400 mt-1">
                Defines stowage factor and vessel hold requirements
              </p>
            </div>

            {/* Cargo Quantity */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase font-mono mb-1.5">
                Cargo Quantity (tonnes)
              </label>
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
                  MT
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Common parcel sizes: 55k (Supramax), 75k (Panamax), 170k (Capesize)
              </p>
            </div>

            {/* Origin */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase font-mono mb-1.5">
                Origin (Loading Port / Country)
              </label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium bg-[#F8FAFC] border border-gray-200 rounded-lg p-3 text-[#1B1C1A] focus:outline-hidden focus:border-[#0072E9] focus:bg-white"
              >
                <option value="Hay Point, Australia">Hay Point, Australia (Coal Terminal)</option>
                <option value="Newcastle, Australia">Newcastle, Australia (PWCS)</option>
                <option value="Gladstone, Australia">Gladstone, Australia</option>
                <option value="Richards Bay, South Africa">Richards Bay, South Africa (RBCT)</option>
                <option value="Taboneo, Indonesia">Taboneo Anchorage, Indonesia</option>
                <option value="Port Hedland, Australia">Port Hedland, Australia (Iron Ore)</option>
              </select>
              <p className="text-[11px] text-gray-400 mt-1">
                Source overseas terminal for ocean voyage routing
              </p>
            </div>

            {/* Destination Port (East Coast India) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase font-mono mb-1.5">
                Destination Port (East Coast India)
              </label>
              <select
                value={destinationPort}
                onChange={(e) => setDestinationPort(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold bg-[#F8FAFC] border border-gray-200 rounded-lg p-3 text-[#1B1C1A] focus:outline-hidden focus:border-[#0072E9] focus:bg-white"
              >
                <option value="Visakhapatnam (Vizag)">Visakhapatnam (Vizag) - Outer & Inner Harbor</option>
                <option value="Paradip Port">Paradip Port (Deep Draft Coal & Ore Berths)</option>
                <option value="Haldia">Haldia Dock Complex (Draft Restricted &lt; 9.0m)</option>
                <option value="Dhamra Port">Dhamra Port (Capesize Capable)</option>
                <option value="Krishnapatnam">Krishnapatnam Port</option>
              </select>
              <p className="text-[11px] text-gray-400 mt-1">
                Berth draft constraints will be automatically verified
              </p>
            </div>

            {/* Required Delivery Date / Laycan */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase font-mono mb-1.5">
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
                Target loading window for vessel booking
              </p>
            </div>

            {/* Contract Preference */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase font-mono mb-1.5">
                Contract Preference
              </label>
              <select
                value={contractPreference}
                onChange={(e) => setContractPreference(e.target.value as any)}
                className="w-full text-xs sm:text-sm font-medium bg-[#F8FAFC] border border-gray-200 rounded-lg p-3 text-[#1B1C1A] focus:outline-hidden focus:border-[#0072E9] focus:bg-white"
              >
                <option value="Spot">Spot Voyage Charter (Per Tonne)</option>
                <option value="Time Charter">Time Charter (Daily Hire Rate)</option>
                <option value="Either">Either / Model Optimized</option>
              </select>
              <p className="text-[11px] text-gray-400 mt-1">
                Evaluates spot market volatility vs time charter hire
              </p>
            </div>
          </div>

          {/* Primary Submit Action (Most visually prominent action on Dashboard) */}
          <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle2 className="w-4 h-4 text-[#009A84]" />
              <span>Instant analysis using latest Baltic Dry Index and bunker curves</span>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#0072E9] hover:bg-[#005bbd] text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Analyze Freight & Vessel Options</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* 3. Small Recent Analyses Table (Core Mandate from Section 4) */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#052439] font-['Hanken_Grotesk']">
              Recent Analyses
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Historical procurement recommendations generated for your account.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('history')}
            className="text-xs font-semibold text-[#0072E9] hover:underline flex items-center gap-1"
          >
            <span>View All ({recentAnalyses.length})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] text-gray-500 font-mono uppercase text-[11px] border-b border-gray-200">
                <th className="py-3 px-5 font-semibold">Analysis ID</th>
                <th className="py-3 px-4 font-semibold">Cargo</th>
                <th className="py-3 px-4 font-semibold">Origin</th>
                <th className="py-3 px-4 font-semibold">Destination</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Recommendation</th>
                <th className="py-3 px-4 font-semibold">Risk</th>
                <th className="py-3 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentAnalyses.slice(0, 4).map((item) => (
                <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3.5 px-5 font-mono font-bold text-[#0072E9]">
                    {item.id}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#1B1C1A]">
                    {item.cargoType}
                    <span className="block text-[10px] text-gray-400 font-mono">
                      {item.cargoQuantity.toLocaleString()} tonnes
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    {item.origin}
                  </td>
                  <td className="py-3.5 px-4 text-gray-800 font-medium">
                    {item.destination}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-500">
                    {item.date}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                      item.recommendation === 'BUY NOW' || item.recommendation === 'BOOK NOW'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : item.recommendation === 'WAIT'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {item.recommendation}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                      item.risk === 'LOW'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : item.risk === 'MEDIUM'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {item.risk}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onViewAnalysisById(item.id)}
                      className="px-3 py-1 bg-white border border-gray-200 hover:border-[#0072E9] hover:text-[#0072E9] text-[#052439] text-xs font-semibold rounded transition-colors shadow-2xs cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
