import React from 'react';
import { 
  BarChart2, 
  Banknote, 
  Ship, 
  ShieldCheck, 
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { KPI_METRICS } from '../data/mockData';

interface KpiCardProps {
  onCardClick?: (metricType: string) => void;
}

export const KpiCardsGrid: React.FC<KpiCardProps> = ({ onCardClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Predicted Freight Rate */}
      <div 
        onClick={() => onCardClick?.('rate')}
        className="bg-white border border-[#E5E7EB] rounded p-4 hover:border-[#0072E9]/40 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded bg-[#EBF3FC] text-[#0072E9] flex items-center justify-center shrink-0">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-[#43474C] font-['Inter']">
              Predicted Freight Rate
            </h3>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl lg:text-[28px] font-bold text-[#1B1C1A] tracking-tight font-['Hanken_Grotesk']">
                ${KPI_METRICS.predictedFreightRate.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500 font-medium font-mono">
                /tonne
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center text-xs text-[#009A84] font-medium font-['Inter']">
          <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 text-[#009A84]" />
          <span>{KPI_METRICS.rateChangeVsYesterday}% vs yesterday</span>
        </div>
      </div>

      {/* 2. Recommended Savings */}
      <div 
        onClick={() => onCardClick?.('savings')}
        className="bg-white border border-[#E5E7EB] rounded p-4 hover:border-[#009A84]/40 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded bg-[#E6F9F5] text-[#009A84] flex items-center justify-center shrink-0">
            <Banknote className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-[#43474C] font-['Inter']">
              Recommended Savings
            </h3>
            <div className="mt-2 flex items-baseline">
              <span className="text-2xl lg:text-[28px] font-bold text-[#1B1C1A] tracking-tight font-['Hanken_Grotesk']">
                ${KPI_METRICS.recommendedSavings.toFixed(2)}M
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center text-xs text-[#009A84] font-medium font-['Inter']">
          <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 text-[#009A84]" />
          <span>{KPI_METRICS.savingsChangeVsLastMonth}% vs last month</span>
        </div>
      </div>

      {/* 3. Optimal Vessel */}
      <div 
        onClick={() => onCardClick?.('vessel')}
        className="bg-white border border-[#E5E7EB] rounded p-4 hover:border-[#0072E9]/40 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded bg-[#EBF3FC] text-[#0072E9] flex items-center justify-center shrink-0">
            <Ship className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-[#43474C] font-['Inter']">
              Optimal Vessel
            </h3>
            <div className="mt-2">
              <span className="text-xl lg:text-2xl font-bold text-[#1B1C1A] font-['Hanken_Grotesk']">
                {KPI_METRICS.optimalVessel}
              </span>
              <p className="text-xs text-gray-500 font-mono">
                ({KPI_METRICS.optimalVesselDwt})
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center text-xs text-[#009A84] font-medium font-['Inter']">
          <span>{KPI_METRICS.vesselEfficiencyTag}</span>
        </div>
      </div>

      {/* 4. Risk Level */}
      <div 
        onClick={() => onCardClick?.('risk')}
        className="bg-white border border-[#E5E7EB] rounded p-4 hover:border-amber-400/40 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded bg-[#FFF7ED] text-[#F59E0B] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-[#43474C] font-['Inter']">
              Risk Level
            </h3>
            <div className="mt-2">
              <span className="text-2xl lg:text-[28px] font-bold text-[#1B1C1A] tracking-tight font-['Hanken_Grotesk']">
                {KPI_METRICS.riskLevel}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center text-xs text-[#009A84] font-medium font-['Inter']">
          <span>{KPI_METRICS.riskSummary}</span>
        </div>
      </div>
    </div>
  );
};
