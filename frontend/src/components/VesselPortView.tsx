import React, { useState } from 'react';
import { 
  Ship, 
  Anchor, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Info, 
  ArrowRight,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { AVAILABLE_VESSELS } from '../data/mockData';

interface VesselPortViewProps {
  onSelectForAnalysis?: (vesselClass: string, port: string) => void;
}

export const VesselPortView: React.FC<VesselPortViewProps> = ({
  onSelectForAnalysis,
}) => {
  const [selectedPort, setSelectedPort] = useState<'all' | 'vizag' | 'paradip' | 'haldia' | 'dhamra'>('all');

  const vesselClasses = [
    {
      className: 'Capesize',
      dwtRange: '120,000 – 200,000 DWT',
      typicalCargo: '150,000 – 180,000 MT (Coal, Iron Ore)',
      ladenDraft: '17.5m – 18.5m',
      beam: '45.0m',
      economyFactor: 'Lowest cost per ton-mile for mega shipments. Requires deepwater outer berths.',
      suitabilityNote: 'Excellent for Vizag Outer & Dhamra. Incompatible with Haldia without lightering.',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      className: 'Panamax / Kamsarmax',
      dwtRange: '65,000 – 85,000 DWT',
      typicalCargo: '70,000 – 80,000 MT (Coking Coal, Thermal Coal)',
      ladenDraft: '13.0m – 14.5m',
      beam: '32.2m',
      economyFactor: 'Global workhorse for standard Indian metallurgical coal procurement contracts.',
      suitabilityNote: 'Universally accepted at Vizag, Paradip, and Dhamra. Restricted at Haldia.',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      className: 'Supramax / Ultramax',
      dwtRange: '50,000 – 64,000 DWT',
      typicalCargo: '50,000 – 58,000 MT (Bulk Minerals, Coal Parcels)',
      ladenDraft: '11.0m – 12.2m (often geared with cranes)',
      beam: '32.2m',
      economyFactor: 'High flexibility, can berth at shallow draft river ports with self-unloading gear.',
      suitabilityNote: 'The only reliable class capable of approaching Haldia Dock Complex directly.',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  ];

  const portsData = [
    {
      id: 'vizag',
      name: 'Visakhapatnam (Vizag) Port',
      state: 'Andhra Pradesh',
      outerHarborDraft: '18.1m (Capesize capable)',
      innerHarborDraft: '14.5m (Panamax / Supramax)',
      tideRange: '0.8m – 1.8m',
      avgBerthWaiting: '0.8 days',
      features: ['Outer deepwater coal berth', 'Mechanized iron ore terminal', 'Zero demurrage backlog'],
      restrictionWarning: 'Inner harbor has beam restriction of 32.5m; vessels >85k DWT directed to Outer Harbor.',
      compatibleClasses: ['Capesize (Outer)', 'Panamax', 'Supramax'],
    },
    {
      id: 'paradip',
      name: 'Paradip Port',
      state: 'Odisha',
      outerHarborDraft: '16.0m (Deep Draught Coal Berth)',
      innerHarborDraft: '14.5m',
      tideRange: '1.2m – 2.8m',
      avgBerthWaiting: '1.2 days',
      features: ['Dedicated coal import mechanization', 'All-weather port', 'Direct railway evacuation'],
      restrictionWarning: 'Capesize vessels >150k MT require daylight berthing & favorable tidal window.',
      compatibleClasses: ['Capesize (Selective)', 'Panamax', 'Supramax'],
    },
    {
      id: 'haldia',
      name: 'Haldia Dock Complex (HDC)',
      state: 'West Bengal',
      outerHarborDraft: 'N/A (Riverine port)',
      innerHarborDraft: '8.5m – 9.0m (Hooghly river draft)',
      tideRange: '2.5m – 4.5m (Tidal lock)',
      avgBerthWaiting: '2.4 days',
      features: ['Proximity to Durgapur/Jamshedpur steel plants', 'Tidal lock entrance gate'],
      restrictionWarning: 'STRICT CONSTRAINT: Maximum draft strictly capped at 8.8m. Capesize and Panamax cannot berth fully laden. Parcels >55,000 MT require lightering at Sandheads anchorage.',
      compatibleClasses: ['Supramax (Light laden)', 'Handymax'],
    },
    {
      id: 'dhamra',
      name: 'Dhamra Port',
      state: 'Odisha',
      outerHarborDraft: '18.0m (Capesize capable in all tides)',
      innerHarborDraft: '18.0m',
      tideRange: '1.0m – 3.2m',
      avgBerthWaiting: '0.6 days',
      features: ['Deepest draft private port on East Coast', 'Rapid discharge rate (60,000 MT/day)', 'Modern conveyor systems'],
      restrictionWarning: 'Higher terminal handling tariff relative to major trust ports; balance freight savings vs port charges.',
      compatibleClasses: ['Capesize', 'Panamax', 'Supramax'],
    },
  ];

  return (
    <div className="space-y-8 font-['Inter']">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#052439] font-['Hanken_Grotesk']">
          Vessel Classes & East Coast Port Constraints
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Review vessel capacities, draft limitations, and navigational restrictions governing bulk procurement to East Coast Indian ports.
        </p>
      </div>

      {/* 1. Vessel Classes Comparison Cards */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Ship className="w-5 h-5 text-[#0072E9]" />
          <h2 className="text-base font-bold text-[#052439]">
            Bulk Vessel Classes Overview
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {vesselClasses.map((vc) => (
            <div key={vc.className} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-[#0072E9] transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-[#052439] font-['Hanken_Grotesk']">
                    {vc.className}
                  </h3>
                  <span className={`text-[11px] font-bold font-mono px-2.5 py-0.5 rounded border ${vc.badgeColor}`}>
                    {vc.dwtRange}
                  </span>
                </div>

                <div className="space-y-3 text-xs mt-4">
                  <div>
                    <span className="text-gray-400 font-mono block text-[10px] uppercase">Typical Cargo Intake:</span>
                    <span className="font-semibold text-gray-800">{vc.typicalCargo}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-mono block text-[10px] uppercase">Laden Draft:</span>
                    <span className="font-mono font-bold text-[#0072E9]">{vc.ladenDraft}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-mono block text-[10px] uppercase">Economic Advantage:</span>
                    <span className="text-gray-600 leading-relaxed">{vc.economyFactor}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 text-xs bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                <span className="font-bold text-[#0072E9] block text-[11px] mb-1">Port Compatibility:</span>
                <p className="text-gray-700 text-[11px] leading-relaxed">{vc.suitabilityNote}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. East Coast Ports Constraint Matrix */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Anchor className="w-5 h-5 text-[#0072E9]" />
            <h2 className="text-base font-bold text-[#052439]">
              East Coast India Port Navigational Matrix
            </h2>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-gray-500 mr-2">Filter Port:</span>
            {['all', 'vizag', 'paradip', 'haldia', 'dhamra'].map((pid) => (
              <button
                key={pid}
                onClick={() => setSelectedPort(pid as any)}
                className={`px-3 py-1 rounded-md capitalize font-medium transition-all ${
                  selectedPort === pid
                    ? 'bg-[#0072E9] text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:text-[#052439]'
                }`}
              >
                {pid === 'all' ? 'All Ports' : pid}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {portsData
            .filter((p) => selectedPort === 'all' || p.id === selectedPort)
            .map((port) => (
              <div
                key={port.id}
                className={`bg-white border rounded-2xl p-6 shadow-xs space-y-4 ${
                  port.id === 'haldia' ? 'border-amber-300' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#052439] font-['Hanken_Grotesk']">
                      {port.name}
                    </h3>
                    <span className="text-xs text-gray-500 font-medium">
                      {port.state} • Bay of Bengal
                    </span>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <span className="text-gray-400 block text-[10px]">Avg Anchorage Wait</span>
                    <span className="font-bold text-emerald-700">{port.avgBerthWaiting}</span>
                  </div>
                </div>

                {/* Draft Specs */}
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#F8FAFC] rounded-xl border border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] font-mono uppercase">Outer Draft Limit:</span>
                    <span className="font-bold text-[#052439]">{port.outerHarborDraft}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] font-mono uppercase">Inner Berth Draft:</span>
                    <span className="font-bold text-[#052439]">{port.innerHarborDraft}</span>
                  </div>
                </div>

                {/* Compatible Vessels Pills */}
                <div>
                  <span className="text-[11px] font-bold text-gray-500 font-mono uppercase block mb-1.5">
                    Permitted Vessel Classes:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {port.compatibleClasses.map((cls) => (
                      <span
                        key={cls}
                        className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-[#0072E9] border border-blue-200"
                      >
                        {cls}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Restriction Warning Banner */}
                <div className={`p-3 rounded-xl text-xs leading-relaxed flex items-start gap-2.5 ${
                  port.id === 'haldia'
                    ? 'bg-amber-50 text-amber-900 border border-amber-200'
                    : 'bg-gray-50 text-gray-700 border border-gray-200'
                }`}>
                  {port.id === 'haldia' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-4 h-4 text-[#0072E9] shrink-0 mt-0.5" />
                  )}
                  <span>{port.restrictionWarning}</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 3. Live Active Market Vessels List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#052439] font-['Hanken_Grotesk']">
              Live Available Bulk Fleet Fixtures
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Indicative spot and period bulk carriers open for charter in the Indo-Pacific basin.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
            Broker Tonnage List
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] text-gray-500 font-mono uppercase text-[11px] border-b border-gray-200">
                <th className="py-3 px-5 font-semibold">Vessel Name</th>
                <th className="py-3 px-4 font-semibold">Class</th>
                <th className="py-3 px-4 font-semibold">DWT</th>
                <th className="py-3 px-4 font-semibold">Built Year</th>
                <th className="py-3 px-4 font-semibold">Daily Hire</th>
                <th className="py-3 px-4 font-semibold">Current Position</th>
                <th className="py-3 px-4 font-semibold">Loading Window (Laycan)</th>
                <th className="py-3 px-5 text-right font-semibold">CII Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {AVAILABLE_VESSELS.map((v) => (
                <tr key={v.name} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3.5 px-5 font-bold text-[#052439] flex items-center gap-2">
                    <Ship className="w-3.5 h-3.5 text-[#0072E9]" />
                    <span>{v.name}</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-700">
                    {v.type}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-600">
                    {v.dwt.toLocaleString()} MT
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-500">
                    {v.builtYear}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#052439]">
                    ${v.dailyHireCost.toLocaleString()}/day
                  </td>
                  <td className="py-3.5 px-4 text-gray-700">
                    {v.currentLocation}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-700 font-medium">
                    {v.availabilityDate}
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono font-bold">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0072E9] border border-blue-200 text-[10px]">
                      Grade {v.carbonIntensityRating}
                    </span>
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
