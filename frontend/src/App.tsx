import React, { useState, useEffect } from 'react';
import { 
  NavTab, 
  RouteRecommendation, 
  OperationalAlert, 
  FreightAnalysisInput, 
  FreightAnalysisResult, 
  AnalysisHistoryItem 
} from './types';
import { 
  RECENT_RECOMMENDATIONS, 
  LIVE_ALERTS, 
  INITIAL_ANALYSES_HISTORY,
  DEFAULT_ANALYSIS_RESULT
} from './data/mockData';
import { 
  analyzeShipment, 
  getAnalysisHistory, 
  getCurrentUser, 
  logoutUser, 
  getDashboardSummary 
} from './api/freightApi';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { NewAnalysisPage } from './components/NewAnalysisPage';
import { PredictionResultPage } from './components/PredictionResultPage';
import { HistoryPage } from './components/HistoryPage';
import { VesselPortView } from './components/VesselPortView';
import { BookingModal } from './components/BookingModal';
import { AlertDetailModal } from './components/AlertDetailModal';
import { WhatIfView } from './components/WhatIfView';
import { ForecastView } from './components/ForecastView';
import { RecommendationsView } from './components/RecommendationsView';
import { VesselsRoutesView } from './components/VesselsRoutesView';
import { ReportsView } from './components/ReportsView';
import { AlertsView } from './components/AlertsView';
import { SettingsView } from './components/SettingsView';
import { TrackingView } from './components/TrackingView';
import { AdminView } from './components/AdminView';
import { LoginModal } from './components/LoginModal';
import { ErrorBoundary } from './components/ErrorBoundary';

const VALID_TABS: Record<string, NavTab> = {
  'dashboard': 'dashboard',
  'new-analysis': 'new-analysis',
  'result': 'result',
  'prediction-result': 'result',
  'forecast': 'forecast',
  'vessel-port': 'vessel-port',
  'vessel': 'vessel-port',
  'what-if': 'what-if',
  'tracking': 'tracking',
  'history': 'history',
  'alerts': 'alerts',
  'reports': 'reports',
  'recommendations': 'recommendations',
  'vessels-routes': 'vessels-routes',
  'settings': 'settings',
  'admin': 'admin'
};

function getTabFromUrl(): NavTab {
  if (typeof window === 'undefined') return 'new-analysis';
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  return VALID_TABS[path] || 'new-analysis';
}

export default function App() {
  // Authentication & Session State
  const [user, setUser] = useState<{ username: string; role: string; full_name: string } | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Active navigation tab with browser URL synchronization
  const [activeTab, setActiveTabState] = useState<NavTab>(getTabFromUrl);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('AUG 31, 2026');

  // State for alerts & recommendations
  const [alerts, setAlerts] = useState<OperationalAlert[]>(LIVE_ALERTS);
  const [recommendations, setRecommendations] = useState<RouteRecommendation[]>(RECENT_RECOMMENDATIONS);

  // Freight Analysis State via API client layer
  const [currentAnalysis, setCurrentAnalysis] = useState<FreightAnalysisResult>(DEFAULT_ANALYSIS_RESULT);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryItem[]>(INITIAL_ANALYSES_HISTORY);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Active Modals state
  const [selectedRecommendation, setSelectedRecommendation] = useState<RouteRecommendation | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<OperationalAlert | null>(null);

  const setActiveTab = (tab: NavTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
      if (currentPath !== tab) {
        window.history.pushState(null, '', `/${tab}`);
      }
    }
  };

  // Synchronize browser back/forward buttons with activeTab
  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(getTabFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initial user session verification & loading states
  useEffect(() => {
    let isMounted = true;
    getCurrentUser()
      .then((u) => {
        if (!isMounted) return;
        const resolvedUser = u?.username ? u : (u?.user || null);
        if (resolvedUser && resolvedUser.username) {
          setUser(resolvedUser);
          setIsLoginModalOpen(false);
          getAnalysisHistory()
            .then((h) => {
              if (isMounted && Array.isArray(h)) setAnalysisHistory(h);
            })
            .catch(() => {});
        } else {
          setUser(null);
          setIsLoginModalOpen(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
          setIsLoginModalOpen(true);
        }
      });

    getDashboardSummary()
      .then((summary) => {
        if (summary && summary.route_rates && summary.route_rates.length > 0) {
          // Live data connection established
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLoginSuccess = async (loggedInUser: { username: string; role: string; full_name: string }) => {
    setUser(loggedInUser);
    setIsLoginModalOpen(false);
    try {
      const history = await getAnalysisHistory();
      if (Array.isArray(history)) setAnalysisHistory(history);
    } catch (e) {}
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setIsLoginModalOpen(true);
    setActiveTab('new-analysis');
  };

  const handleMarkAlertRead = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, read: true } : a))
    );
  };

  const handleConfirmBooking = (recId: string) => {
    setRecommendations((prev) =>
      prev.map((r) =>
        r.id === recId
          ? {
              ...r,
              status: 'Actioned',
              optimalAction: 'Booked (Spot)',
            }
          : r
      )
    );
    setSelectedRecommendation(null);
  };

  // Run new Freight Analysis using the backend-ready API service
  const handleRunAnalysis = async (input: FreightAnalysisInput) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeShipment(input);
      setCurrentAnalysis(result);

      // Refresh history from API layer
      const updatedHistory = await getAnalysisHistory();
      if (Array.isArray(updatedHistory)) setAnalysisHistory(updatedHistory);

      // Transition immediately to the Recommendation / Result page
      setActiveTab('result');
    } catch (error) {
      console.error('Failed to analyze shipment:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleViewAnalysisById = async (id: string) => {
    const found = analysisHistory.find((item) => item.id === id);
    if (found) {
      setIsAnalyzing(true);
      try {
        const result = await analyzeShipment({
          cargoType: found.cargoType,
          cargoQuantity: found.cargoQuantity,
          origin: found.origin,
          destinationPort: found.destination,
          requiredDate: '2024-11-20',
          contractPreference: 'Spot',
        });
        result.id = found.id;
        result.recommendedAction = found.recommendation;
        result.estimatedRatePerTonne = found.costPerTonne;
        result.riskLevel = found.risk;
        setCurrentAnalysis(result);
        setActiveTab('result');
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      setActiveTab('result');
    }
  };

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-[#1B1C1A] flex flex-col antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadAlertsCount={unreadCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        userRole={user?.role}
        user={user}
      />

      {/* Main Layout Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Top Header */}
        <Header
          onOpenMobileSidebar={() => setSidebarOpen(true)}
          alerts={alerts}
          onSelectAlert={setSelectedAlert}
          selectedDate={selectedDate}
          onChangeDate={setSelectedDate}
          onNewAnalysis={() => setActiveTab('new-analysis')}
          onLogout={handleLogout}
          userRole={user?.role}
          user={user}
        />

        {/* Dynamic Page Content protected by ErrorBoundary */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
          <ErrorBoundary>
            {/* 1. Primary Analysis Input View: Enter Shipment Details */}
            {activeTab === 'new-analysis' && (
              <NewAnalysisPage
                onAnalyze={handleRunAnalysis}
                onCancel={() => setActiveTab('result')}
                isLoading={isAnalyzing}
              />
            )}

            {/* 2. Most Important View: Recommendation Screen */}
            {activeTab === 'result' && (
              <PredictionResultPage
                result={currentAnalysis}
                onModifyDetails={() => setActiveTab('new-analysis')}
                onBookCharter={() => setSelectedRecommendation(recommendations[0])}
                onExploreWhatIf={() => setActiveTab('what-if')}
                onViewForecast={() => setActiveTab('forecast')}
              />
            )}

            {/* 3. Analysis History */}
            {activeTab === 'history' && (
              <HistoryPage
                history={analysisHistory}
                onViewItem={handleViewAnalysisById}
                onNewAnalysis={() => setActiveTab('new-analysis')}
              />
            )}

            {/* 4. Freight Forecast Center */}
            {activeTab === 'forecast' && <ForecastView />}

            {/* 5. Vessel & Port Infrastructure */}
            {activeTab === 'vessel-port' && <VesselPortView />}

            {/* 6. What-If Scenario Simulator */}
            {activeTab === 'what-if' && <WhatIfView />}

            {/* 7. Voyage & Fleet Tracking */}
            {activeTab === 'tracking' && (
              <TrackingView
                onNavigateWhatIf={() => setActiveTab('what-if')}
                onNavigateVesselPort={() => setActiveTab('vessel-port')}
              />
            )}

            {/* 8. Overview Dashboard */}
            {activeTab === 'dashboard' && (
              <DashboardView
                onStartAnalysis={handleRunAnalysis}
                onNavigateTab={setActiveTab}
                recentAnalyses={analysisHistory}
                onViewAnalysisById={handleViewAnalysisById}
                userRole={user?.role || 'customer'}
              />
            )}

            {/* 9. Admin Console (Admin Only with clean fallback notice) */}
            {activeTab === 'admin' && (user?.role?.toLowerCase() === 'admin') && (
              <AdminView />
            )}
            {activeTab === 'admin' && (user?.role?.toLowerCase() !== 'admin') && (
              <div className="bg-white border border-amber-200 rounded-xl p-8 text-center space-y-3 shadow-xs">
                <h3 className="text-base font-bold text-gray-900 font-['Hanken_Grotesk']">
                  Administrator Access Required
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                  The CargoPredict Data & Model Admin Console requires administrative privileges. Please sign in with the admin account to access data pipelines, database catalogs, and model verification.
                </p>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-4 py-2 bg-[#0072E9] text-white text-xs font-semibold rounded-lg hover:bg-[#005bbd] transition-colors cursor-pointer"
                >
                  Sign In as Admin
                </button>
              </div>
            )}

            {/* Operational Secondary Views */}
            {activeTab === 'recommendations' && (
              <RecommendationsView
                recommendations={recommendations}
                onSelectRecommendation={setSelectedRecommendation}
              />
            )}
            {activeTab === 'vessels-routes' && <VesselsRoutesView />}
            {activeTab === 'reports' && <ReportsView />}
            {activeTab === 'alerts' && (
              <AlertsView
                alerts={alerts}
                onSelectAlert={setSelectedAlert}
                onMarkRead={handleMarkAlertRead}
              />
            )}
            {activeTab === 'settings' && <SettingsView />}
          </ErrorBoundary>
        </main>
      </div>

      {/* Booking / Action Modal */}
      <BookingModal
        recommendation={selectedRecommendation}
        onClose={() => setSelectedRecommendation(null)}
        onConfirmBooking={handleConfirmBooking}
      />

      {/* Alert Detail & Resolution Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onMarkRead={handleMarkAlertRead}
      />

      {/* Full-Screen Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
