import React, { useState } from 'react';
import { AVAILABLE_VESSELS, ROUTE_RATES } from '../data/mockData';
import { Ship, Navigation, Anchor, MapPin, Compass, ShieldCheck, Gauge } from 'lucide-react';

export const VesselsRoutesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vessels' | 'routes'>('vessels');
  const [inquiryNotice, setInquiryNotice] = useState<string | null>(null);

  const handleInquiry = (vesselName: string) => {
    setInquiryNotice(`Fixture inquiry request logged for ${vesselName} (Forwarded to Charter Desk)`);
    setTimeout(() => setInquiryNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1B1C1A] font-['Hanken_Grotesk'] flex items-center gap-2">
              <Ship className="w-6 h-6 text-[#0072E9]" />
              <span>Vessels & Shipping Corridors Fleet Manager</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-['Inter'] mt-1">
              Active bulk carrier availability, carbon intensity indicators (CII), and oceanic distance tables.
            </p>
          </div>

          <div className="flex bg-[#F4F2EF] p-1 rounded border border-[#E5E7EB]">
            <button
              onClick={() => setActiveTab('vessels')}
              className={`px-4 py-1.5 text-xs font-semibold rounded transition-colors ${
                activeTab === 'vessels' ? 'bg-[#052439] text-white' : 'text-gray-600 hover:text-[#052439]'
              }`}
            >
              Candidate Vessels ({AVAILABLE_VESSELS.length})
            </button>
            <button
              onClick={() => setActiveTab('routes')}
              className={`px-4 py-1.5 text-xs font-semibold rounded transition-colors ${
                activeTab === 'routes' ? 'bg-[#052439] text-white' : 'text-gray-600 hover:text-[#052439]'
              }`}
            >
              Monitored Corridors ({ROUTE_RATES.length})
            </button>
          </div>
        </div>
      </div>

      {inquiryNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{inquiryNotice}</span>
        </div>
      )}

      {activeTab === 'vessels' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AVAILABLE_VESSELS.map((vessel, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E5E7EB] rounded p-5 hover:border-[#0072E9]/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-[#EBF3FC] text-[#0072E9] flex items-center justify-center">
                      <Ship className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1B1C1A] font-['Hanken_Grotesk']">
                        {vessel.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-mono">
                        {vessel.type} • {vessel.dwt.toLocaleString()} DWT • Built {vessel.builtYear}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold font-mono border ${
                    vessel.carbonIntensityRating === 'A'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : vessel.carbonIntensityRating === 'B'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    CII Rating: {vessel.carbonIntensityRating}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs bg-[#F4F2EF] p-3 rounded border border-[#E5E7EB]">
                  <div>
                    <span className="text-gray-500 block text-[11px]">Current Location:</span>
                    <span className="font-semibold text-[#1B1C1A] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {vessel.currentLocation}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500 block text-[11px]">Earliest Loading Window (Laycan):</span>
                    <span className="font-semibold text-[#1B1C1A] font-mono mt-0.5 block">
                      {vessel.availabilityDate}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500 block text-[11px]">Daily Time-Charter Rate:</span>
                    <span className="font-bold text-[#052439] font-mono mt-0.5 block text-sm">
                      ${vessel.dailyHireCost.toLocaleString()}/day
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500 block text-[11px]">Fuel Efficiency:</span>
                    <span className="font-semibold text-[#009A84] mt-0.5 block">
                      {vessel.fuelEfficiency} Tier
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => handleInquiry(vessel.name)}
                  className="px-4 py-1.5 bg-[#052439] hover:bg-[#001D32] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                >
                  Request Fixture Inquiry
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F9FAFB] text-[#73777D] font-mono uppercase text-[11px] border-b border-[#E5E7EB]">
                  <th className="py-3 px-5 font-medium">Corridor Name</th>
                  <th className="py-3 px-4 font-medium">Origin - Destination</th>
                  <th className="py-3 px-4 font-medium">Distance (NM)</th>
                  <th className="py-3 px-4 font-medium">Avg Voyage Days</th>
                  <th className="py-3 px-4 font-medium">Current Benchmark</th>
                  <th className="py-3 px-4 font-medium">Recommended Class</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ROUTE_RATES.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F4F2EF]/60">
                    <td className="py-3.5 px-5 font-bold text-[#052439]">
                      {r.route}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {r.origin} → {r.destination}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#1B1C1A]">
                      {r.distanceNm.toLocaleString()} NM
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-700">
                      ~{r.avgVoyageDays} days
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0072E9]">
                      ${r.currentRate.toFixed(2)}/t
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-semibold font-mono text-[11px]">
                        {r.recommendedVessel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
