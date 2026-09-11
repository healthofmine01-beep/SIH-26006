import React, { useState } from 'react';
import { ROUTE_RATES } from '../data/mockData';
import { RouteRateItem } from '../types';
import { ArrowRight, Navigation, Sparkles } from 'lucide-react';

interface RouteRateBarChartProps {
  onSelectRoute?: (route: RouteRateItem) => void;
}

export const RouteRateBarChart: React.FC<RouteRateBarChartProps> = ({ onSelectRoute }) => {
  const [selectedId, setSelectedId] = useState<string>('r1');
  const maxVal = 50; // max value for 100% width scale

  // Top 4 routes matching the screenshot
  const displayRoutes = ROUTE_RATES.slice(0, 4);

  return (
    <div className="bg-white border border-[#E5E7EB] rounded p-5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <div>
          <h2 className="text-base font-bold text-[#1B1C1A] font-['Hanken_Grotesk']">
            Freight Rate by Route
          </h2>
          <p className="text-xs text-gray-500 font-['Inter'] mt-0.5">
            Real-time benchmark spot rates (USD/tonne)
          </p>
        </div>
      </div>

      {/* Bar List */}
      <div className="space-y-4 my-auto py-2">
        {displayRoutes.map((item) => {
          const widthPercent = Math.min(100, (item.currentRate / maxVal) * 100);
          const isSelected = item.id === selectedId;

          return (
            <div 
              key={item.id}
              onClick={() => {
                setSelectedId(item.id);
                onSelectRoute?.(item);
              }}
              className="group cursor-pointer"
            >
              {/* Route Label & Price */}
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span className="text-[#1B1C1A] group-hover:text-[#0072E9] transition-colors flex items-center gap-1.5 font-['Inter']">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0072E9] opacity-70 group-hover:opacity-100" />
                  {item.route}
                </span>

                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono text-[#1B1C1A] text-sm group-hover:text-[#0072E9] transition-colors">
                    ${item.currentRate.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Progress / Bar track */}
              <div className="relative w-full h-5 bg-[#F4F2EF] rounded-xs overflow-hidden border border-[#E5E7EB]/60">
                <div 
                  className={`h-full transition-all duration-500 ease-out flex items-center justify-end pr-2 ${
                    isSelected 
                      ? 'bg-[#0072E9] shadow-xs' 
                      : 'bg-[#0072E9]/85 group-hover:bg-[#0072E9]'
                  }`}
                  style={{ width: `${widthPercent}%` }}
                >
                  {/* Subtle hatching or glow effect */}
                  <span className="text-[10px] text-white font-mono font-semibold opacity-90 hidden sm:inline">
                    {widthPercent.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Axis markers (0, 10, 20, 30, 40, 50 USD / TONNE) */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex justify-between text-[10px] font-mono text-gray-400 px-0.5">
          <span>0</span>
          <span>10</span>
          <span>20</span>
          <span>30</span>
          <span>40</span>
          <span>50</span>
        </div>
        <div className="text-right mt-1">
          <span className="text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-wider">
            USD / TONNE
          </span>
        </div>
      </div>
    </div>
  );
};
