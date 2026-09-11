import React from 'react';
import { RouteRecommendation } from '../types';
import { Zap, Clock, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';

interface RecommendationsTableProps {
  recommendations: RouteRecommendation[];
  onSelectRecommendation: (rec: RouteRecommendation) => void;
  onViewAll: () => void;
}

export const RecommendationsTable: React.FC<RecommendationsTableProps> = ({
  recommendations,
  onSelectRecommendation,
  onViewAll,
}) => {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded flex flex-col justify-between h-full">
      {/* Header */}
      <div className="p-5 pb-3 flex items-center justify-between border-b border-gray-100">
        <div>
          <h2 className="text-base font-bold text-[#1B1C1A] font-['Hanken_Grotesk']">
            Recent Recommendations
          </h2>
          <p className="text-xs text-gray-500 font-['Inter'] mt-0.5">
            Real-time algorithmic fixture optimizer & bunker hedging signals
          </p>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-[#0072E9] hover:text-[#052439] flex items-center gap-1 group transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#F9FAFB] text-[#73777D] font-mono uppercase text-[11px] border-b border-[#E5E7EB]">
              <th className="py-3 px-5 font-medium">Route</th>
              <th className="py-3 px-4 font-medium">Vessel Type</th>
              <th className="py-3 px-4 font-medium">Optimal Action</th>
              <th className="py-3 px-4 font-medium">Expected Cost</th>
              <th className="py-3 px-4 font-medium">Savings</th>
              <th className="py-3 px-5 font-medium text-right sm:text-left">Confidence</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {recommendations.slice(0, 4).map((rec) => {
              const isBookNow = rec.optimalAction.includes('Book Now');
              const isWait = rec.optimalAction.includes('Wait');

              return (
                <tr
                  key={rec.id}
                  onClick={() => onSelectRecommendation(rec)}
                  className="hover:bg-[#F4F2EF]/60 transition-colors cursor-pointer group"
                >
                  {/* Route */}
                  <td className="py-3.5 px-5 font-semibold text-[#1B1C1A] group-hover:text-[#0072E9] transition-colors whitespace-nowrap">
                    {rec.route}
                  </td>

                  {/* Vessel Type */}
                  <td className="py-3.5 px-4 text-gray-700 whitespace-nowrap font-medium">
                    {rec.vesselType}
                  </td>

                  {/* Optimal Action */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {isBookNow && (
                      <div className="inline-flex items-center gap-1.5 font-bold text-[#0072E9]">
                        <Zap className="w-3.5 h-3.5 fill-[#0072E9]" />
                        <span>Book Now (Spot)</span>
                      </div>
                    )}
                    {isWait && (
                      <div className="inline-flex items-center gap-1.5 font-bold text-[#D97706]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Wait 7 Days</span>
                      </div>
                    )}
                    {!isBookNow && !isWait && (
                      <span className="font-semibold text-gray-700">
                        {rec.optimalAction}
                      </span>
                    )}
                  </td>

                  {/* Expected Cost */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#1B1C1A] whitespace-nowrap">
                    ${rec.expectedCost.toLocaleString()}
                  </td>

                  {/* Savings */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-[#009A84] font-mono">
                      ${rec.savingsAmount.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-gray-500 font-mono">
                      ({rec.savingsPercentage.toFixed(1)}%)
                    </div>
                  </td>

                  {/* Confidence */}
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                        rec.confidence === 'High'
                          ? 'bg-[#E6F9F5] text-[#007060] border-[#45DABE]/40'
                          : rec.confidence === 'Medium'
                          ? 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/30'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {rec.confidence}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer link */}
      <div className="p-3 bg-[#F9FAFB] border-t border-[#E5E7EB] text-center">
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-[#0072E9] hover:text-[#052439] inline-flex items-center gap-1.5 group transition-colors py-1 px-3 rounded hover:bg-white"
        >
          <span>View all recommendations</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
