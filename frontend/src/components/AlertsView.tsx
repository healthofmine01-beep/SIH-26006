import React, { useState } from 'react';
import { OperationalAlert } from '../types';
import { Bell, AlertTriangle, Anchor, Info, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AlertsViewProps {
  alerts: OperationalAlert[];
  onSelectAlert: (alert: OperationalAlert) => void;
  onMarkRead: (id: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onSelectAlert,
  onMarkRead,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'risk'>('all');

  const filtered = alerts.filter((a) => {
    if (filter === 'unread') return !a.read;
    if (filter === 'risk') return a.impactLevel === 'risk';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1B1C1A] font-['Hanken_Grotesk'] flex items-center gap-2">
              <Bell className="w-6 h-6 text-[#DC2626]" />
              <span>Operations & Risk Alerts Center</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-['Inter'] mt-1">
              Real-time notices on fuel price volatility, port congestion, weather patterns, and maritime canal chokepoints.
            </p>
          </div>

          <div className="flex gap-2">
            {(['all', 'unread', 'risk'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded capitalize transition-colors ${
                  filter === f ? 'bg-[#052439] text-white' : 'bg-[#F4F2EF] text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f} Alerts
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((alert) => {
          const isRisk = alert.impactLevel === 'risk';
          const isWarning = alert.impactLevel === 'warning';

          return (
            <div
              key={alert.id}
              className={`bg-white border rounded p-5 flex flex-col justify-between transition-all ${
                !alert.read ? 'border-[#0072E9]/40 shadow-xs' : 'border-[#E5E7EB]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${
                      isRisk ? 'bg-red-100 text-[#DC2626]' : isWarning ? 'bg-amber-100 text-[#D97706]' : 'bg-blue-100 text-[#0072E9]'
                    }`}>
                      {isRisk ? <AlertTriangle className="w-4 h-4" /> : isWarning ? <Anchor className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1B1C1A] font-['Hanken_Grotesk']">
                        {alert.title}
                      </h3>
                      <p className="text-[11px] text-gray-500 font-mono">
                        {alert.timeAgo} • {alert.type.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                    isRisk ? 'bg-red-50 text-red-700 border border-red-200' : isWarning ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {alert.impactLevel}
                  </span>
                </div>

                <p className="text-xs text-gray-700 mt-3 leading-relaxed">
                  {alert.summary}
                </p>

                <div className="mt-3 bg-[#F4F2EF] p-2.5 rounded text-xs text-gray-700 border border-[#E5E7EB]">
                  <strong className="text-[#052439] block text-[11px] font-mono uppercase mb-0.5">Mitigation Action:</strong>
                  {alert.suggestedAction}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-gray-400">
                  {alert.read ? 'Resolved' : 'Active Attention'}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => onSelectAlert(alert)}
                    className="px-3 py-1 bg-[#F4F2EF] hover:bg-gray-200 text-xs font-semibold text-gray-700 rounded transition-colors"
                  >
                    View Details
                  </button>
                  {!alert.read && (
                    <button
                      onClick={() => onMarkRead(alert.id)}
                      className="px-3 py-1 bg-[#052439] hover:bg-[#001D32] text-white text-xs font-semibold rounded flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Acknowledge</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
