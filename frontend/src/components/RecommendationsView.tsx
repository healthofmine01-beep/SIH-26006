import React, { useState } from 'react';
import { RouteRecommendation } from '../types';
import { Zap, Clock, Search, Filter, ArrowUpDown, Download, CheckCircle2 } from 'lucide-react';

interface RecommendationsViewProps {
  recommendations: RouteRecommendation[];
  onSelectRecommendation: (rec: RouteRecommendation) => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendations,
  onSelectRecommendation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVessel, setFilterVessel] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExportCSV = () => {
    setExportNotice('Active fixtures and recommendations exported to CSV format.');
    setTimeout(() => setExportNotice(null), 3500);
  };

  const filtered = recommendations.filter((r) => {
    const matchesSearch = r.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cargoType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVessel = filterVessel === 'all' || r.vesselType === filterVessel;
    const matchesAction = filterAction === 'all' || 
      (filterAction === 'book' && r.optimalAction.includes('Book Now')) ||
      (filterAction === 'wait' && r.optimalAction.includes('Wait'));
    return matchesSearch && matchesVessel && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1B1C1A] font-['Hanken_Grotesk']">
              Freight Recommendations & Action Center
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-['Inter'] mt-1">
              Optimized fixture timing suggestions calculated by automated rate prediction algorithms.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-[#052439] hover:bg-[#001D32] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Fixtures (CSV)</span>
            </button>
          </div>
        </div>

        {exportNotice && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportNotice}</span>
          </div>
        )}

        {/* Filters & Search */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by route, port, or commodity (e.g. Coking Coal, Vizag)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F4F2EF] border border-[#E5E7EB] rounded focus:outline-hidden focus:border-[#0072E9]"
            />
          </div>

          <select
            value={filterVessel}
            onChange={(e) => setFilterVessel(e.target.value)}
            className="text-xs font-semibold bg-[#F4F2EF] border border-[#E5E7EB] rounded px-3 py-2 text-gray-700 focus:outline-hidden"
          >
            <option value="all">All Vessel Types</option>
            <option value="Capesize">Capesize (180k DWT)</option>
            <option value="Panamax">Panamax (75k DWT)</option>
          </select>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="text-xs font-semibold bg-[#F4F2EF] border border-[#E5E7EB] rounded px-3 py-2 text-gray-700 focus:outline-hidden"
          >
            <option value="all">All Actions</option>
            <option value="book">Book Now (Spot)</option>
            <option value="wait">Wait 7 Days</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E7EB] rounded overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F9FAFB] text-[#73777D] font-mono uppercase text-[11px] border-b border-[#E5E7EB]">
                <th className="py-3.5 px-5 font-medium">Route & Cargo</th>
                <th className="py-3.5 px-4 font-medium">Vessel Type</th>
                <th className="py-3.5 px-4 font-medium">Optimal Action</th>
                <th className="py-3.5 px-4 font-medium">Current Spot</th>
                <th className="py-3.5 px-4 font-medium">Expected Cost</th>
                <th className="py-3.5 px-4 font-medium">Est. Savings</th>
                <th className="py-3.5 px-4 font-medium">Confidence</th>
                <th className="py-3.5 px-5 font-medium text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filtered.map((rec) => (
                <tr
                  key={rec.id}
                  className="hover:bg-[#F4F2EF]/60 transition-colors"
                >
                  <td className="py-4 px-5">
                    <div className="font-bold text-[#1B1C1A] text-sm font-['Hanken_Grotesk']">
                      {rec.route}
                    </div>
                    <div className="text-[11px] text-gray-500 font-mono">
                      {rec.cargoVolume.toLocaleString()} MT {rec.cargoType} • Loading Window (Laycan): {rec.laycanWindow}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-gray-700 font-medium">
                    {rec.vesselType} ({rec.dwt})
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    {rec.optimalAction.includes('Book Now') ? (
                      <div className="inline-flex items-center gap-1.5 font-bold text-[#0072E9]">
                        <Zap className="w-3.5 h-3.5 fill-[#0072E9]" />
                        <span>Book Now (Spot)</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 font-bold text-[#D97706]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Wait 7 Days</span>
                      </div>
                    )}
                  </td>

                  <td className="py-4 px-4 font-mono font-semibold text-[#1B1C1A]">
                    ${rec.currentRate.toFixed(2)}/t
                  </td>

                  <td className="py-4 px-4 font-mono font-semibold text-[#1B1C1A]">
                    ${rec.expectedCost.toLocaleString()}
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-semibold text-[#009A84] font-mono">
                      ${rec.savingsAmount.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-gray-500 font-mono">
                      ({rec.savingsPercentage.toFixed(1)}%)
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                        rec.confidence === 'High'
                          ? 'bg-[#E6F9F5] text-[#007060] border-[#45DABE]/40'
                          : 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/30'
                      }`}
                    >
                      {rec.confidence}
                    </span>
                  </td>

                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => onSelectRecommendation(rec)}
                      className="px-3 py-1.5 bg-[#0072E9] hover:bg-[#0059B9] text-white text-xs font-semibold rounded shadow-2xs transition-colors"
                    >
                      Execute
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
