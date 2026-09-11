import React from 'react';
import { OperationalAlert } from '../types';
import { X, AlertTriangle, Anchor, Info, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';

interface AlertDetailModalProps {
  alert: OperationalAlert | null;
  onClose: () => void;
  onMarkRead: (id: string) => void;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alert,
  onClose,
  onMarkRead,
}) => {
  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-[#E5E7EB] rounded w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#052439] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded flex items-center justify-center ${
              alert.impactLevel === 'risk' ? 'bg-[#DC2626]' : alert.impactLevel === 'warning' ? 'bg-[#F59E0B]' : 'bg-[#0072E9]'
            }`}>
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold font-['Hanken_Grotesk']">
                {alert.title}
              </h3>
              <p className="text-xs text-[#728CA5] font-mono">
                Triggered {alert.timeAgo} • Impact Level: {alert.impactLevel.toUpperCase()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div>
            <h4 className="font-mono text-gray-400 uppercase text-[11px] font-semibold mb-1">
              Operational Impact Description
            </h4>
            <p className="text-sm text-[#1B1C1A] leading-relaxed bg-[#F4F2EF] p-3 rounded border border-[#E5E7EB]">
              {alert.summary}
            </p>
          </div>

          <div>
            <h4 className="font-mono text-gray-400 uppercase text-[11px] font-semibold mb-1">
              Affected Transit Routes & Ports
            </h4>
            <div className="flex flex-wrap gap-2">
              {alert.affectedRoutes.map((r, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded bg-[#0072E9]/10 text-[#0072E9] font-medium border border-[#0072E9]/20"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-mono text-gray-400 uppercase text-[11px] font-semibold mb-1">
              Recommended Mitigation Strategy
            </h4>
            <div className="bg-[#E6F9F5] text-[#007060] p-3 rounded border border-[#45DABE]/40 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{alert.suggestedAction}</span>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-[11px] text-gray-400 font-mono">
              Status: {alert.read ? 'Acknowledged' : 'Active Alert'}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                Dismiss
              </button>

              <button
                type="button"
                onClick={() => {
                  onMarkRead(alert.id);
                  onClose();
                }}
                className="px-5 py-2 bg-[#052439] hover:bg-[#001D32] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Acknowledge & Resolve</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
