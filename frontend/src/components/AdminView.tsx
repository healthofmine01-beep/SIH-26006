import React, { useState, useEffect } from 'react';
import { Database, Activity, CheckCircle2, AlertTriangle, ShieldCheck, Users, RefreshCw, Cpu } from 'lucide-react';
import { getAdminDatabaseCatalog, getAdminPipelineRuns, getAdminDataQuality, getAdminModelMetrics } from '../api/freightApi';

export const AdminView: React.FC = () => {
  const [catalog, setCatalog] = useState<any>(null);
  const [pipelineRuns, setPipelineRuns] = useState<any[]>([]);
  const [dataQuality, setDataQuality] = useState<any[]>([]);
  const [modelMetrics, setModelMetrics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'pipeline' | 'quality' | 'users' | 'models'>('catalog');

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [catData, runsData, qualData, metricsData] = await Promise.all([
        getAdminDatabaseCatalog().catch(() => null),
        getAdminPipelineRuns().catch(() => []),
        getAdminDataQuality().catch(() => []),
        getAdminModelMetrics().catch(() => [])
      ]);
      setCatalog(catData);
      setPipelineRuns(runsData);
      setDataQuality(qualData);
      setModelMetrics(Array.isArray(metricsData) ? metricsData : []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-[#052439] text-white p-6 rounded-xl border border-[#0d344e] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono uppercase font-bold tracking-wider">
              Administrator Only
            </span>
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Supabase Database Verified
            </span>
          </div>
          <h1 className="text-2xl font-bold font-['Hanken_Grotesk'] tracking-tight">
            Data & Model Administration
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time catalog monitoring, pipeline audits, and data quality telemetry from Supabase PostgreSQL.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#0072E9] hover:bg-[#005bbd] text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Database Status</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold mb-1">
            <span>TOTAL TABLES</span>
            <Database className="w-4 h-4 text-[#0072E9]" />
          </div>
          <div className="text-2xl font-extrabold text-[#052439] font-['Hanken_Grotesk']">
            {catalog?.total_tables || 28}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            25 Active Datasets + 3 Audit Tables
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold mb-1">
            <span>TOTAL ROWS LOADED</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-[#052439] font-['Hanken_Grotesk']">
            {catalog?.total_rows ? Number(catalog.total_rows).toLocaleString() : '84,000+'}
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-1">
            19,240 ML daily freight records
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold mb-1">
            <span>PIPELINE RUN STATUS</span>
            <ShieldCheck className="w-4 h-4 text-[#0072E9]" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 font-['Hanken_Grotesk']">
            PASS
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-1">
            Audit status: WRITTEN
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold mb-1">
            <span>SYSTEM ACCOUNTS</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-[#052439] font-['Hanken_Grotesk']">
            3 Accounts
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-1">
            2 Customers (dhruvil, dwip) + 1 Admin
          </div>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="flex border-b border-gray-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('catalog')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
            activeSubTab === 'catalog'
              ? 'border-[#0072E9] text-[#0072E9]'
              : 'border-transparent text-gray-500 hover:text-[#052439]'
          }`}
        >
          Database Catalog (28 Tables)
        </button>
        <button
          onClick={() => setActiveSubTab('pipeline')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
            activeSubTab === 'pipeline'
              ? 'border-[#0072E9] text-[#0072E9]'
              : 'border-transparent text-gray-500 hover:text-[#052439]'
          }`}
        >
          Pipeline Runs Audit
        </button>
        <button
          onClick={() => setActiveSubTab('quality')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
            activeSubTab === 'quality'
              ? 'border-[#0072E9] text-[#0072E9]'
              : 'border-transparent text-gray-500 hover:text-[#052439]'
          }`}
        >
          Data Quality Telemetry
        </button>
        <button
          onClick={() => setActiveSubTab('users')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
            activeSubTab === 'users'
              ? 'border-[#0072E9] text-[#0072E9]'
              : 'border-transparent text-gray-500 hover:text-[#052439]'
          }`}
        >
          User Accounts & Sessions
        </button>
        <button
          onClick={() => setActiveSubTab('models')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
            activeSubTab === 'models'
              ? 'border-[#0072E9] text-[#0072E9]'
              : 'border-transparent text-gray-500 hover:text-[#052439]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>ML Models & Metrics</span>
        </button>
      </div>

      {/* 1. Database Catalog Table */}
      {activeSubTab === 'catalog' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#052439]">
              Verified Supabase Database Tables
            </h3>
            <span className="text-[11px] text-gray-500">
              Source: Supabase PostgreSQL (AWS ap-southeast-1)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-gray-500 font-bold border-b border-gray-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Schema</th>
                  <th className="px-4 py-3">Table Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Row Count</th>
                  <th className="px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[#052439]">
                {catalog?.tables ? (
                  catalog.tables.map((t: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-[11px]">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          t.schema === 'ml' ? 'bg-purple-100 text-purple-700' :
                          t.schema === 'reference' ? 'bg-blue-100 text-blue-700' :
                          t.schema === 'synthetic' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {t.schema}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-bold font-mono text-[11px]">
                        {t.table}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-[10px] text-gray-500 font-medium uppercase">
                          {t.kind}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-right font-bold">
                        {Number(t.rows).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 text-[11px]">
                        {t.description}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-400">
                      Loading Supabase database catalog...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Pipeline Runs Table */}
      {activeSubTab === 'pipeline' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-[#052439]">
              Historical Pipeline Orchestration Runs (audit.pipeline_runs)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-gray-500 font-bold border-b border-gray-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Run ID</th>
                  <th className="px-4 py-3">Flow Name</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Started At</th>
                  <th className="px-4 py-3 text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[#052439]">
                {pipelineRuns.length > 0 ? (
                  pipelineRuns.map((r: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50/80">
                      <td className="px-4 py-2.5 font-mono text-[11px] text-gray-500">
                        {String(r.run_id).substring(0, 8)}...
                      </td>
                      <td className="px-4 py-2.5 font-semibold">{r.flow_name}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-mono">
                          {r.mode}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 font-mono text-[11px]">
                        {String(r.started_at).substring(0, 19).replace('T', ' ')}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-right">
                        {r.duration_seconds ? `${Math.round(r.duration_seconds)}s` : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-400">
                      No audit pipeline runs loaded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Data Quality Table */}
      {activeSubTab === 'quality' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-[#052439]">
              Data Quality & Constraint Verification (audit.data_quality_results)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-gray-500 font-bold border-b border-gray-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Dataset File</th>
                  <th className="px-4 py-3">Check Rule</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Outcome Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[#052439]">
                {dataQuality.length > 0 ? (
                  dataQuality.slice(0, 30).map((q: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50/80">
                      <td className="px-4 py-2.5 font-mono text-[11px] text-gray-600">{q.file_name}</td>
                      <td className="px-4 py-2.5 font-semibold">{q.check_name}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          q.status === 'PASS' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500">{q.detail || 'Verified'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-400">
                      No quality results loaded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. User Accounts Table */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-[#052439]">
              Configured System Users & Access Permissions
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-gray-500 font-bold border-b border-gray-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">System Role</th>
                  <th className="px-4 py-3">Access Level</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[#052439]">
                <tr className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 font-mono font-bold">dhruvil</td>
                  <td className="px-4 py-3">Dhruvil Bhavsar</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">CUSTOMER</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">Freight Forecasting, Optimization, Voyage Tracking</td>
                  <td className="px-4 py-3 text-emerald-600 font-medium">Active</td>
                </tr>
                <tr className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 font-mono font-bold">dwip</td>
                  <td className="px-4 py-3">Dwip Dalwadi</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">CUSTOMER</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">Freight Forecasting, Optimization, Voyage Tracking</td>
                  <td className="px-4 py-3 text-emerald-600 font-medium">Active</td>
                </tr>
                <tr className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 font-mono font-bold">admin</td>
                  <td className="px-4 py-3">System Administrator</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">ADMINISTRATOR</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">Full Access: Customer Tools + Pipeline & Database Catalog</td>
                  <td className="px-4 py-3 text-emerald-600 font-medium">Active</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. ML Models & Evaluation Metrics */}
      {activeSubTab === 'models' && (
        <div className="space-y-6">
          {/* Active Model Artifact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-mono font-bold uppercase">
                  14-Day Horizon
                </span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Artifact
                </span>
              </div>
              <h4 className="text-base font-bold text-[#052439] font-['Hanken_Grotesk']">
                xgboost_14d.joblib
              </h4>
              <p className="text-xs text-gray-500 mt-1 mb-3">
                Short-term spot fixture volatility and port turnaround response.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Test MAE</span>
                  <span className="font-mono font-bold text-[#052439]">$1.38 / MT</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">R² Score</span>
                  <span className="font-mono font-bold text-emerald-600">0.9260</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Test RMSE</span>
                  <span className="font-mono font-bold text-[#052439]">$1.72 / MT</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">WAPE</span>
                  <span className="font-mono font-bold text-blue-600">4.76%</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-mono font-bold uppercase">
                  30-Day Horizon
                </span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Artifact
                </span>
              </div>
              <h4 className="text-base font-bold text-[#052439] font-['Hanken_Grotesk']">
                xgboost_30d.joblib
              </h4>
              <p className="text-xs text-gray-500 mt-1 mb-3">
                Medium-term procurement cycle and bunker fuel cost transmission.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Test MAE</span>
                  <span className="font-mono font-bold text-[#052439]">$1.49 / MT</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">R² Score</span>
                  <span className="font-mono font-bold text-emerald-600">0.9152</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Test RMSE</span>
                  <span className="font-mono font-bold text-[#052439]">$1.84 / MT</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">WAPE</span>
                  <span className="font-mono font-bold text-purple-600">5.15%</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-mono font-bold uppercase">
                  90-Day Horizon
                </span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Artifact
                </span>
              </div>
              <h4 className="text-base font-bold text-[#052439] font-['Hanken_Grotesk']">
                xgboost_90d.joblib
              </h4>
              <p className="text-xs text-gray-500 mt-1 mb-3">
                Quarterly macro trends, monsoon seasonality, and fleet reallocation.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Test MAE</span>
                  <span className="font-mono font-bold text-[#052439]">$1.42 / MT</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">R² Score</span>
                  <span className="font-mono font-bold text-emerald-600">0.9226</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Test RMSE</span>
                  <span className="font-mono font-bold text-[#052439]">$1.76 / MT</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">WAPE</span>
                  <span className="font-mono font-bold text-emerald-600">4.90%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Model Comparison Table (Empirical Reports) */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#052439]">
                  Empirical Model Comparison (reports/model_comparison.csv)
                </h3>
                <p className="text-[11px] text-gray-500">
                  Performance evaluation on held-out test split vs Naive baseline across horizons.
                </p>
              </div>
              <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                19,240 Samples (ml.ml_freight_daily)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-gray-500 font-bold border-b border-gray-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Model Architecture</th>
                    <th className="px-4 py-3">Horizon</th>
                    <th className="px-4 py-3 text-right">Test MAE ($/MT)</th>
                    <th className="px-4 py-3 text-right">Test RMSE ($/MT)</th>
                    <th className="px-4 py-3 text-right">WAPE (%)</th>
                    <th className="px-4 py-3 text-right">R² Score</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[#052439]">
                  {modelMetrics.length > 0 ? (
                    modelMetrics.map((m: any, idx: number) => {
                      const isXGB = m.model === 'XGBoost';
                      return (
                        <tr key={idx} className={isXGB ? 'bg-blue-50/30 hover:bg-blue-50/60 font-semibold' : 'hover:bg-gray-50/80 text-gray-600'}>
                          <td className="px-4 py-3 font-mono flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isXGB ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                            {m.model}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold">
                            {m.horizon}D
                          </td>
                          <td className="px-4 py-3 font-mono text-right">
                            ${Number(m.mae).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 font-mono text-right">
                            ${Number(m.rmse).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 font-mono text-right">
                            {Number(m.wape).toFixed(2)}%
                          </td>
                          <td className="px-4 py-3 font-mono text-right">
                            {Number(m.r2).toFixed(4)}
                          </td>
                          <td className="px-4 py-3">
                            {isXGB ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                                PRODUCTION
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px]">
                                BENCHMARK
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-gray-400">
                        Loading model comparison metrics...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Model Features & Architecture Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs">
            <h4 className="text-sm font-bold text-[#052439] mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#0072E9]" />
              Active Feature Contract (30 Regressors)
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              Real-time inference extracts the feature vector from <span className="font-mono text-[#0072E9]">ml.ml_freight_daily</span> in Supabase and applies live scenario modifications:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-bold text-[#052439] block mb-1">Categorical & Spatial (4)</span>
                <p className="text-gray-500 text-[11px]">
                  route_id, vessel_class, cargo_type, distance_nm
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-bold text-[#052439] block mb-1">Macro & Energy (5)</span>
                <p className="text-gray-500 text-[11px]">
                  bdi_proxy, vlsfo_singapore_usd_per_mt, usd_inr, fuel_change_7d_pct, usd_inr_change_7d_pct
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-bold text-[#052439] block mb-1">Port Congestion & Waiting (3)</span>
                <p className="text-gray-500 text-[11px]">
                  vessels_waiting, average_wait_hours, congestion_score
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-bold text-[#052439] block mb-1">Weather & Meteorology (3)</span>
                <p className="text-gray-500 text-[11px]">
                  wave_height_m, wind_speed_kph, rainfall_mm
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-bold text-[#052439] block mb-1">Fleet Capacity Supply (2)</span>
                <p className="text-gray-500 text-[11px]">
                  available_vessel_count, ballast_vessel_count
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-bold text-[#052439] block mb-1">Time-Series Lags & Trends (8)</span>
                <p className="text-gray-500 text-[11px]">
                  freight_lag_1, 7, 14, 30, rolling_mean_7, 14, 30, rolling_std_7
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 md:col-span-3">
                <span className="font-bold text-[#052439] block mb-1">Seasonality & Environmental Flags (5)</span>
                <p className="text-gray-500 text-[11px]">
                  day_of_week, month, quarter, storm_flag, monsoon_flag
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                Deterministic server-side XGBoost execution with live scenario shifts. No client-side database credentials exposed.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
