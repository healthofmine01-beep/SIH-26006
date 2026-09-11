import React from 'react';
import { OperationalAlert } from '../types';
import { 
  AlertTriangle, 
  Clock, 
  Info, 
  ArrowRight, 
  Fuel, 
  Anchor, 
  CloudRain, 
  CheckCheck 
} from 'lucide-react';

interface LiveAlertsCardProps {
  alerts: OperationalAlert[];
  onSelectAlert: (alert: OperationalAlert) => void;
  onViewAllAlerts: () => void;
}

export const LiveAlertsCard: React.FC<LiveAlertsCardProps> = ({
  alerts,
  onSelectAlert,
  onViewAllAlerts,
}) => {
  const getAlertIcon = (type: OperationalAlert['type'], impact: OperationalAlert['impactLevel']) => {
    if (type === 'fuel' || impact === 'risk') {
      return (
        <div className="w-8 h-8 rounded bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
      );
    }
    if (type === 'congestion' || impact === 'warning') {
      return (
        <div className="w-8 h-8 rounded bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
          <Anchor className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded bg-[#DBEAFE] text-[#0072E9] flex items-center justify-center shrink-0">
        <Info className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded flex flex-col justify-between h-full">
      {/* Header */}
      <div className="p-5 pb-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] animate-pulse" />
          <h2 className="text-base font-bold text-[#1B1C1A] font-['Hanken_Grotesk']">
            Live Alerts
          </h2>
        </div>

        <span className="text-[11px] font-mono text-gray-500">
          Updated 1m ago
        </span>
      </div>

      {/* Alerts list */}
      <div className="p-5 space-y-4 my-auto">
        {alerts.slice(0, 3).map((alert) => (
          <div
            key={alert.id}
            onClick={() => onSelectAlert(alert)}
            className="flex items-start gap-3 p-2 rounded hover:bg-[#F4F2EF] cursor-pointer transition-colors group"
          >
            {getAlertIcon(alert.type, alert.impactLevel)}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-xs font-bold text-[#1B1C1A] group-hover:text-[#0072E9] transition-colors font-['Hanken_Grotesk']">
                  {alert.title}
                </h4>
                <span className={`text-[10px] font-mono shrink-0 ${
                  alert.impactLevel === 'risk' ? 'text-[#DC2626] font-semibold' : 'text-gray-400'
                }`}>
                  {alert.timeAgo}
                </span>
              </div>

              <p className="text-xs text-gray-600 line-clamp-2 mt-0.5 font-['Inter'] leading-relaxed">
                {alert.summary}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 bg-[#F9FAFB] border-t border-[#E5E7EB] text-center">
        <button
          onClick={onViewAllAlerts}
          className="text-xs font-semibold text-[#0072E9] hover:text-[#052439] inline-flex items-center gap-1.5 group transition-colors py-1 px-3 rounded hover:bg-white"
        >
          <span>View all alerts</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
