import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Lightbulb, 
  SlidersHorizontal, 
  Ship, 
  FileText, 
  Bell, 
  Settings, 
  Anchor,
  HelpCircle,
  X,
  PlusCircle,
  History,
  Navigation,
  Compass,
  Database,
  LogOut
} from 'lucide-react';
import { NavTab } from '../types';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  unreadAlertsCount: number;
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
  userRole?: string;
  user?: { username: string; role: string; full_name: string } | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  unreadAlertsCount,
  isOpen,
  onClose,
  onLogout,
  userRole = 'Procurement Officer',
  user,
}) => {
  const isAdmin = user?.role?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'admin';

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-analysis' as NavTab, label: 'New Freight Analysis', icon: PlusCircle },
    { id: 'result' as NavTab, label: 'Recommendation', icon: Lightbulb },
    { id: 'tracking' as NavTab, label: 'Voyage Tracking', icon: Navigation },
    { id: 'forecast' as NavTab, label: 'Freight Forecast', icon: TrendingUp },
    { id: 'vessel-port' as NavTab, label: 'Vessel & Port', icon: Ship },
    { id: 'what-if' as NavTab, label: 'What-If Simulator', icon: SlidersHorizontal },
    { id: 'history' as NavTab, label: 'History & Reports', icon: History },
    { id: 'alerts' as NavTab, label: 'Alerts & Market', icon: Bell, badge: unreadAlertsCount },
    ...(isAdmin ? [{ id: 'admin' as NavTab, label: 'Admin Console', icon: Database }] : []),
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#052439] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-[#0d344e] select-none`}
      >
        {/* Header / Brand Logo matching Mockup */}
        <div className="px-5 py-4 border-b border-[#0d344e]/60 flex items-center justify-between">
          <div 
            onClick={() => {
              setActiveTab('dashboard');
              onClose();
            }}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-[#0072E9] flex items-center justify-center text-white shadow-sm">
              <Anchor className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base font-['Hanken_Grotesk'] text-white tracking-tight">
                  Cargo<span className="text-[#0072E9]">Predict</span>
                </span>
              </div>
              <p className="text-[10px] text-[#6BF9DC] font-mono tracking-wider uppercase">
                {isAdmin ? 'SYSTEM ADMIN' : 'ENTERPRISE DESK'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 rounded text-gray-400 hover:text-white hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0072E9] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 stroke-[2] ${isActive ? 'text-white' : 'text-[#728CA5]'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-[#DC2626] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Navigation Exit Actions */}
        <div className="p-3 border-t border-[#0d344e]/60 space-y-2">
          <div className="bg-[#001D32] p-2.5 rounded-lg border border-[#0d344e] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[#0072E9] text-white font-bold text-xs flex items-center justify-center font-mono">
                {user?.username ? user.username.substring(0, 2).toUpperCase() : 'CP'}
              </div>
              <div className="text-xs truncate">
                <p className="font-semibold text-white truncate max-w-[110px]">
                  {user?.full_name || 'Procurement Desk'}
                </p>
                <p className={`text-[10px] font-mono ${isAdmin ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {user?.role ? user.role.toUpperCase() : 'CUSTOMER'}
                </p>
              </div>
            </div>

            {onLogout && (
              <button
                id="btn-sidebar-logout"
                onClick={onLogout}
                title="Sign Out"
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

