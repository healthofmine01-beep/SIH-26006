import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceDot 
} from 'recharts';
import { predictFreightRate } from '../api/freightApi';
import { Sparkles, Maximize2, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';

interface ForecastChartProps {
  routeId?: string;
  vesselClass?: string;
  onOpenDetails?: () => void;
}

export const FreightForecastChart: React.FC<ForecastChartProps> = ({ 
  routeId = 'R001', 
  vesselClass = 'Capesize',
  onOpenDetails 
}) => {
  const [activeHorizon, setActiveHorizon] = useState<14 | 30 | 90>(14);
  const [forecastResult, setForecastResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadForecast = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await predictFreightRate(routeId, vesselClass, activeHorizon);
        if (isMounted) {
          setForecastResult(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to execute ML inference');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadForecast();
    return () => { isMounted = false; };
  }, [routeId, vesselClass, activeHorizon]);

  // Format chart data combining recent history and ML future trajectory
  const recentHistory = (forecastResult?.recent_history || []).slice(-14).map((h: any) => {
    const dStr = String(h.date || '');
    return {
      date: dStr.substring(0, 10),
      formattedDate: dStr.length >= 10 ? `${dStr.substring(5, 7)}/${dStr.substring(8, 10)}` : dStr,
      historical: parseFloat(h.freight_rate_usd_per_mt || 0),
      isHistorical: true
    };
  });

  const rawTrajectory = forecastResult?.trajectory || forecastResult?.forecast || [];
  const trajectory = rawTrajectory.map((t: any) => {
    const dStr = String(t.date || '');
    return {
      date: t.date,
      formattedDate: t.formatted_date || (dStr.length >= 10 ? `${dStr.substring(5, 7)}/${dStr.substring(8, 10)}` : dStr),
      predictedRate: t.predicted_rate ?? t.predicted_rate_usd_per_mt ?? 0,
      lowerBound: t.lower_bound ?? t.ci_80_lower ?? t.ci_lower ?? 0,
      upperBound: t.upper_bound ?? t.ci_80_upper ?? t.ci_upper ?? 0,
      isHistorical: false
    };
  });

  const chartData = [...recentHistory, ...trajectory];

  const currentRate = forecastResult?.current_spot_rate ?? forecastResult?.current_rate_usd_per_mt ?? 28.0;
  const predictedRate = forecastResult?.predicted_rate ?? forecastResult?.predicted_rate_usd_per_mt ?? currentRate;
  const deltaPct = forecastResult?.kpis?.projected_change_pct ?? forecastResult?.projected_change_pct ?? 0.0;
  const p10 = forecastResult?.p10 ?? forecastResult?.ci_80_lower ?? forecastResult?.ci_lower;
  const p90 = forecastResult?.p90 ?? forecastResult?.ci_80_upper ?? forecastResult?.ci_upper;

  return (
    <div className="bg-white border border-[#E5E7EB] rounded p-5 flex flex-col justify-between h-full shadow-2xs">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#1B1C1A] font-['Hanken_Grotesk'] flex items-center gap-2">
              <span>Freight Rate Forecast (USD/MT)</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-[#0072E9] border border-blue-200">
              XGBoost ML Engine
            </span>
          </div>
          <p className="text-xs text-gray-500 font-['Inter'] mt-0.5">
            Model: {forecastResult?.model_name || `XGBoost (${activeHorizon}D)`} • Observation: {forecastResult?.observation_date || 'AUG 31, 2026'}
          </p>
        </div>

        {/* Horizon Switcher (14D, 30D, 90D) */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-400 font-semibold">HORIZON:</span>
          <div className="flex bg-[#F4F2EF] p-0.5 rounded border border-[#E5E7EB]">
            {([14, 30, 90] as const).map((h) => (
              <button
                key={h}
                onClick={() => setActiveHorizon(h)}
                className={`px-3 py-1 text-xs font-mono font-bold rounded transition-all cursor-pointer ${
                  activeHorizon === h
                    ? 'bg-[#0072E9] text-white shadow-xs'
                    : 'text-gray-600 hover:text-[#052439]'
                }`}
              >
                {h}D
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 text-xs">
        <div className="p-2.5 bg-gray-50 rounded border border-gray-100">
          <span className="text-[10px] font-mono text-gray-400 block uppercase">Spot Baseline</span>
          <span className="text-sm font-bold text-[#052439] font-mono">${Number(currentRate || 0).toFixed(2)}/MT</span>
        </div>
        <div className="p-2.5 bg-blue-50/60 rounded border border-blue-100">
          <span className="text-[10px] font-mono text-[#0072E9] block uppercase">ML {activeHorizon}D Forecast</span>
          <span className="text-sm font-bold text-[#0072E9] font-mono">${Number(predictedRate || 0).toFixed(2)}/MT</span>
        </div>
        <div className="p-2.5 bg-gray-50 rounded border border-gray-100">
          <span className="text-[10px] font-mono text-gray-400 block uppercase">Projected Shift</span>
          <span className={`text-sm font-bold font-mono ${Number(deltaPct || 0) >= 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
            {Number(deltaPct || 0) >= 0 ? '+' : ''}{Number(deltaPct || 0).toFixed(1)}%
          </span>
        </div>
        <div className="p-2.5 bg-gray-50 rounded border border-gray-100">
          <span className="text-[10px] font-mono text-gray-400 block uppercase">80% Interval (P10–P90)</span>
          <span className="text-sm font-bold text-gray-700 font-mono">
            {p10 != null && p90 != null ? `$${Number(p10).toFixed(1)} – $${Number(p90).toFixed(1)}` : 'Calculated'}
          </span>
        </div>
      </div>

      {/* Chart container */}
      <div className="w-full h-72 sm:h-80 my-2 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0072E9]">
              <Cpu className="w-4 h-4 animate-spin" />
              <span>Executing XGBoost {activeHorizon}D Model...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-10 text-xs text-red-600 gap-1 p-4">
            <AlertCircle className="w-5 h-5" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
            onMouseMove={(state: any) => {
              if (state && state.activePayload && state.activePayload.length) {
                setHoveredPoint(state.activePayload[0].payload);
              }
            }}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="predictionShading" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0072E9" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#0072E9" stopOpacity={0.03} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false} />

            <XAxis 
              dataKey="formattedDate" 
              tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'Inter' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={{ stroke: '#E5E7EB' }}
            />

            <YAxis 
              domain={['dataMin - 3', 'dataMax + 3']} 
              tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={{ stroke: '#E5E7EB' }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Shaded confidence fan for forecast */}
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="transparent"
              fill="url(#predictionShading)"
              baseValue="dataMin"
              isAnimationActive={true}
            />

            {/* Upper bound projection line */}
            <Line
              type="monotone"
              dataKey="upperBound"
              stroke="#0072E9"
              strokeWidth={1.2}
              strokeDasharray="3 3"
              dot={false}
              isAnimationActive={true}
            />

            {/* Lower bound projection line */}
            <Line
              type="monotone"
              dataKey="lowerBound"
              stroke="#0072E9"
              strokeWidth={1.2}
              strokeDasharray="3 3"
              dot={false}
              isAnimationActive={true}
            />

            {/* Historical actual curve */}
            <Line
              type="monotone"
              dataKey="historical"
              stroke="#0072E9"
              strokeWidth={2.5}
              dot={{ r: 2.5, fill: '#0072E9' }}
              activeDot={{ r: 5, fill: '#0072E9', stroke: '#fff', strokeWidth: 2 }}
              isAnimationActive={true}
            />

            {/* Predicted trajectory */}
            <Line
              type="monotone"
              dataKey="predictedRate"
              stroke="#0072E9"
              strokeWidth={2.5}
              strokeDasharray="5 3"
              dot={{ r: 3, fill: '#FFFFFF', stroke: '#0072E9', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#0072E9' }}
              isAnimationActive={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer with Key Insight */}
      <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-gray-600">
          <Sparkles className="w-3.5 h-3.5 text-[#0072E9] shrink-0" />
          <span>
            <strong>XGBoost Model Signal:</strong> {deltaPct >= 2.0 
              ? `Rates firming (+${deltaPct.toFixed(1)}%). Optimal to fix commitments in prompt window.`
              : deltaPct <= -2.0 
                ? `Rates softening (${deltaPct.toFixed(1)}%). Consider waiting for freight concessions.`
                : `Corridor rates projected steady (${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(1)}%). Normal procurement schedule.`
            }
          </span>
        </div>

        {onOpenDetails && (
          <button
            onClick={onOpenDetails}
            className="text-[#0072E9] hover:text-[#052439] font-medium flex items-center gap-1 self-end sm:self-auto cursor-pointer"
          >
            <span>Deep Dive Analysis</span>
            <Maximize2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isHistorical = data.isHistorical;
    const rateValue = isHistorical ? data.historical : data.predictedRate;

    return (
      <div className="bg-white border border-[#E5E7EB] rounded shadow-md p-3 text-xs min-w-[190px]">
        <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 mb-2">
          <span className="font-bold text-[#052439] font-['Hanken_Grotesk']">{data.formattedDate}</span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-medium ${
            isHistorical ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
          }`}>
            {isHistorical ? 'Observed Rate' : 'XGBoost Predicted'}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-baseline">
            <span className="text-gray-500">Freight Rate:</span>
            <span className="font-bold text-[#1B1C1A] font-mono text-sm">
              ${rateValue ? Number(rateValue).toFixed(2) : '--'}/MT
            </span>
          </div>

          {data.upperBound !== undefined && data.lowerBound !== undefined && (
            <div className="flex justify-between items-baseline text-[11px]">
              <span className="text-gray-500">80% CI:</span>
              <span className="text-gray-700 font-mono">
                ${data.lowerBound.toFixed(2)} – ${data.upperBound.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};
