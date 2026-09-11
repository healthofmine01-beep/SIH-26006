import React, { useState } from 'react';
import { FreightForecastChart } from './FreightForecastChart';
import { ROUTE_RATES, FORECAST_DATA } from '../data/mockData';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Compass, ShieldAlert, Cpu, Calendar } from 'lucide-react';

export const ForecastView: React.FC = () => {
  const [selectedRoute, setSelectedRoute] = useState(ROUTE_RATES[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1B1C1A] font-['Hanken_Grotesk'] flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#0072E9]" />
              <span>Intelligent Freight Rate Forecasting Engine</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-['Inter'] mt-1">
              Multi-horizon econometric & machine learning forecasts grounded in Baltic Dry Indices and bunker spot futures.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium font-mono">Route:</span>
            <select
              value={selectedRoute.id}
              onChange={(e) => {
                const found = ROUTE_RATES.find(r => r.id === e.target.value);
                if (found) setSelectedRoute(found);
              }}
              className="text-xs font-semibold bg-[#F4F2EF] border border-[#E5E7EB] rounded px-3 py-1.5 text-[#1B1C1A] focus:outline-hidden"
            >
              {ROUTE_RATES.map(r => (
                <option key={r.id} value={r.id}>{r.route}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="w-full">
        <FreightForecastChart routeId={selectedRoute.id} vesselClass={selectedRoute.vesselClass} />
      </div>

      {/* Econometric Drivers & Correlation Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase font-mono">
              Pacific Basin Tonnage Supply
            </span>
            <span className="text-xs font-mono font-bold text-[#DC2626] bg-red-50 px-2 py-0.5 rounded">
              Tight (92% Util.)
            </span>
          </div>
          <p className="text-sm font-bold text-[#052439] font-['Hanken_Grotesk']">
            Vessel Congestion at Port Hedland
          </p>
          <p className="text-xs text-gray-600 mt-2 leading-relaxed">
            Ballasting delays in East Coast Australia tightening prompt Capesize capacity by 14.2% over next 10 days.
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase font-mono">
              Bunker Price Elasticity
            </span>
            <span className="text-xs font-mono font-bold text-[#009A84] bg-emerald-50 px-2 py-0.5 rounded">
              +0.78 Correlation
            </span>
          </div>
          <p className="text-sm font-bold text-[#052439] font-['Hanken_Grotesk']">
            VLSFO Singapore Spot at $642/MT
          </p>
          <p className="text-xs text-gray-600 mt-2 leading-relaxed">
            Every $10/MT increase in bunker fuel translates to +$0.18/tonne freight rate on Australia-India coal corridor.
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase font-mono">
              Seasonal Monsoon Factor
            </span>
            <span className="text-xs font-mono font-bold text-[#0072E9] bg-blue-50 px-2 py-0.5 rounded">
              Moderate Risk
            </span>
          </div>
          <p className="text-sm font-bold text-[#052439] font-['Hanken_Grotesk']">
            Bay of Bengal Discharge Ports
          </p>
          <p className="text-xs text-gray-600 mt-2 leading-relaxed">
            Pre-monsoon inventory building at Vizag and Paradip steel mills driving steady import fixture volumes.
          </p>
        </div>
      </div>
    </div>
  );
};
