import React, { useState } from 'react';
import { Settings, Save, Bell, Shield, Database, RefreshCw, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [autoHedge, setAutoHedge] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState('5.0');
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [fuelIndex, setFuelIndex] = useState('Singapore VLSFO 0.5%');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1B1C1A] font-['Hanken_Grotesk'] flex items-center gap-2">
              <Settings className="w-6 h-6 text-[#0072E9]" />
              <span>Platform & Algorithm Settings</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-['Inter'] mt-1">
              Configure freight forecasting weights, risk tolerance bounds, and bunker benchmark indices.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#052439] hover:bg-[#001D32] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            {saved ? <Check className="w-4 h-4 text-[#45DABE]" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Preferences Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Freight Model Configuration */}
        <div className="bg-white border border-[#E5E7EB] rounded p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#052439] font-mono uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
            <Database className="w-4 h-4 text-[#0072E9]" />
            <span>Forecasting Algorithm Weights</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase font-mono mb-1">
              Default Bunker Benchmark Index
            </label>
            <select
              value={fuelIndex}
              onChange={(e) => setFuelIndex(e.target.value)}
              className="w-full text-xs font-semibold bg-[#F4F2EF] border border-[#E5E7EB] rounded p-2.5 text-[#1B1C1A]"
            >
              <option value="Singapore VLSFO 0.5%">Singapore VLSFO 0.5% (Platt's)</option>
              <option value="Rotterdam VLSFO">Rotterdam VLSFO</option>
              <option value="Fujairah MGO">Fujairah MGO</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase font-mono mb-1">
              Rate Volatility Alert Trigger Threshold (%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(e.target.value)}
                className="w-24 text-xs font-mono font-bold bg-[#F4F2EF] border border-[#E5E7EB] rounded p-2 text-[#1B1C1A]"
              />
              <span className="text-xs text-gray-500 font-mono">% shift in 24 hours</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase font-mono mb-1">
              Reporting Currency
            </label>
            <select
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
              className="w-full text-xs font-semibold bg-[#F4F2EF] border border-[#E5E7EB] rounded p-2.5 text-[#1B1C1A]"
            >
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="INR">INR (₹) - Indian Rupee</option>
            </select>
          </div>
        </div>

        {/* Operational Automations */}
        <div className="bg-white border border-[#E5E7EB] rounded p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#052439] font-mono uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#0072E9]" />
            <span>Risk Tolerance & Policy</span>
          </h3>

          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoHedge}
                onChange={(e) => setAutoHedge(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-[#0072E9] border-gray-300"
              />
              <div className="text-xs">
                <span className="font-bold text-gray-900">
                  Automated Bunker Hedging Recommendations
                </span>
                <p className="text-gray-500 text-[11px] leading-relaxed">
                  Trigger automatic paper swaps advice when crude spread volatility exceeds 4.0%.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                defaultChecked={true}
                className="w-4 h-4 mt-0.5 rounded text-[#0072E9] border-gray-300"
              />
              <div className="text-xs">
                <span className="font-bold text-gray-900">
                  Port Congestion Berthing Risk Filter
                </span>
                <p className="text-gray-500 text-[11px] leading-relaxed">
                  Automatically recalculate laycan savings if port anchorage exceeds 48 hours.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                defaultChecked={true}
                className="w-4 h-4 mt-0.5 rounded text-[#0072E9] border-gray-300"
              />
              <div className="text-xs">
                <span className="font-bold text-gray-900">
                  Daily Baltic Dry Index Auto-Sync
                </span>
                <p className="text-gray-500 text-[11px] leading-relaxed">
                  Update model weights at 17:00 UTC daily upon Baltic Exchange market close.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
