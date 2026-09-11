import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Bell, 
  ChevronDown, 
  Menu, 
  CheckCircle2,
  RefreshCw,
  Search
} from 'lucide-react';
import { OperationalAlert } from '../types';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  alerts: OperationalAlert[];
  onSelectAlert: (alert: OperationalAlert) => void;
  selectedDate: string;
  onChangeDate: (date: string) => void;
  onNewAnalysis?: () => void;
  onLogout?: () => void;
  userRole?: string;
  user?: { username: string; role: string; full_name: string } | null;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  alerts,
  onSelectAlert,
  selectedDate,
  onChangeDate,
  onNewAnalysis,
  onLogout,
  userRole = 'Procurement Officer',
  user,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const unreadAlerts = alerts.filter(a => !a.read);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const dates = [
    'AUG 31, 2026',
    'AUG 30, 2026',
    'AUG 29, 2026',
    'AUG 28, 2026',
    'AUG 25, 2026',
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-[#E5E7EB] px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Left section: mobile hamburger + status indicators */}
      <div className="flex items-center gap-2.5">
        <button
          id="btn-mobile-sidebar-toggle"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded text-[#1B1C1A] hover:bg-[#F4F2EF] transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Enterprise Data Status Indicator */}
        <div 
          title="Data synchronized with Supabase PostgreSQL enterprise pipeline."
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[11px] font-semibold text-[#0072E9]"
        >
          <span className="w-2 h-2 rounded-full bg-[#0072E9]" />
          <span>Pipeline Data</span>
        </div>

        {/* Live Market indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-[#052439]/5 border border-[#052439]/10 text-[11px] font-medium text-[#052439]">
          <span>Baltic Dry Index: 1,845 (+1.4%)</span>
        </div>

        {/* Visually secondary Date Selector */}
        <div className="hidden lg:flex items-center gap-1 px-2 py-1 text-[11px] text-gray-500 hover:text-[#052439] transition-colors">
          <CalendarIcon className="w-3 h-3 text-gray-400 shrink-0" />
          <span className="text-[10px] text-gray-400">Date:</span>
          <select
            value={selectedDate}
            onChange={(e) => onChangeDate(e.target.value)}
            className="bg-transparent text-[11px] font-medium text-gray-600 hover:text-[#052439] focus:outline-hidden cursor-pointer"
          >
            {dates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right section: sync button, notification bell & User profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick Refresh Button */}
        <button
          id="btn-refresh-rates"
          onClick={handleRefresh}
          title="Refresh Rates Feed"
          className="p-1.5 text-gray-500 hover:text-[#052439] hover:bg-[#F4F2EF] rounded transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#0072E9]' : ''}`} />
        </button>

        {/* Notification Bell with Badge and Popover */}
        <div className="relative">
          <button
            id="btn-notification-bell"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded hover:bg-[#F4F2EF] text-[#1B1C1A] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#DC2626] text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E5E7EB] rounded shadow-lg p-3 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-xs font-bold text-[#052439] uppercase tracking-wider font-['Hanken_Grotesk']">
                  Operations Alerts ({alerts.length})
                </span>
                <span className="text-[11px] text-gray-500 font-medium">Active Telemetry</span>
              </div>

              <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => {
                      onSelectAlert(alert);
                      setShowNotifications(false);
                    }}
                    className={`p-2.5 rounded text-left text-xs cursor-pointer transition-colors border ${
                      !alert.read 
                        ? 'bg-[#F4F2EF] border-[#E5E7EB] hover:bg-[#EAE8E5]' 
                        : 'bg-white border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[#052439]">{alert.title}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{alert.timeAgo}</span>
                    </div>
                    <p className="text-gray-600 line-clamp-2 text-[11px]">{alert.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick New Analysis Action in Header */}
        {onNewAnalysis && (
          <button
            onClick={onNewAnalysis}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#0072E9] hover:bg-[#005bbd] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <span>+ New Analysis</span>
          </button>
        )}

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200" />

        {/* Clean User Badge */}
        <div className="flex items-center gap-2.5 px-2.5 py-1 bg-[#F4F2EF] border border-[#E5E7EB] rounded-lg">
          <div className="w-6 h-6 rounded-md bg-[#052439] text-white flex items-center justify-center font-bold text-[11px] font-mono">
            {user?.username ? user.username.substring(0, 2).toUpperCase() : 'CP'}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-[#052439] leading-tight">
              {user?.full_name || 'Procurement Desk'}
            </p>
            <p className="text-[9px] text-gray-500 font-mono">
              {user?.role ? user.role.toUpperCase() : 'CUSTOMER'}
            </p>
          </div>

          {onLogout && (
            <button
              id="btn-header-logout"
              onClick={onLogout}
              title="Sign Out"
              className="ml-1 text-gray-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
            >
              <span className="text-[10px] font-bold">LOGOUT</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
