import React, { useState } from 'react';
import { FileText, Download, TrendingUp, DollarSign, Award, Calendar, CheckCircle2 } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleDownload = (name: string) => {
    setDownloadNotice(`Generated ${name} — Ready in procurement downloads.`);
    setTimeout(() => setDownloadNotice(null), 3500);
  };
  const reports = [
    {
      title: 'October 2024 Freight Fixture & Optimization Audit',
      date: 'Generated Oct 24, 2024',
      size: '2.4 MB',
      type: 'PDF / Audit Report',
      savings: '$1.28M Achieved',
    },
    {
      title: 'Pacific Capesize vs Panamax Corridors Benchmarking',
      date: 'Generated Oct 20, 2024',
      size: '1.8 MB',
      type: 'Excel Dataset',
      savings: '13.4% Cost Reduction',
    },
    {
      title: 'IMO 2024 / EU ETS Carbon Intensity Compliance Ledger',
      date: 'Generated Oct 15, 2024',
      size: '940 KB',
      type: 'Compliance Record',
      savings: 'Grade A Maintained',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1B1C1A] font-['Hanken_Grotesk'] flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#0072E9]" />
              <span>Operational Analytics & Fixture Reports</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-['Inter'] mt-1">
              Export comprehensive fixture summaries, bunker hedge accounting, and voyage charter agreements.
            </p>
          </div>

          <button
            onClick={() => handleDownload('Q4 Executive Summary Report')}
            className="px-4 py-2 bg-[#052439] hover:bg-[#001D32] text-white text-xs font-semibold rounded flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Generate Executive Summary</span>
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded p-5">
          <span className="text-xs font-bold text-gray-500 uppercase font-mono">
            YTD Cumulative Savings
          </span>
          <div className="text-2xl font-bold text-[#009A84] font-['Hanken_Grotesk'] mt-1">
            $8.45 Million
          </div>
          <p className="text-xs text-gray-500 mt-1">Across 42 optimized voyages</p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded p-5">
          <span className="text-xs font-bold text-gray-500 uppercase font-mono">
            Model Forecast Accuracy
          </span>
          <div className="text-2xl font-bold text-[#0072E9] font-['Hanken_Grotesk'] mt-1">
            94.6%
          </div>
          <p className="text-xs text-gray-500 mt-1">7-day spot rate prediction MAPE</p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded p-5">
          <span className="text-xs font-bold text-gray-500 uppercase font-mono">
            Avg Bunker Consumption
          </span>
          <div className="text-2xl font-bold text-[#052439] font-['Hanken_Grotesk'] mt-1">
            34.2 MT/Day
          </div>
          <p className="text-xs text-gray-500 mt-1">Eco-speed optimization compliance</p>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white border border-[#E5E7EB] rounded p-6">
        <h3 className="text-sm font-bold text-[#052439] font-mono uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
          Available Fixture Documentation & Audit Logs
        </h3>

        <div className="space-y-3">
          {reports.map((r, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded bg-[#F4F2EF] border border-[#E5E7EB] hover:bg-[#EAE8E5] transition-colors gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded bg-white text-[#052439] flex items-center justify-center shrink-0 border border-gray-200">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1B1C1A]">
                    {r.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500 font-mono mt-0.5">
                    <span>{r.date}</span>
                    <span>•</span>
                    <span>{r.type}</span>
                    <span>•</span>
                    <span>{r.size}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <span className="text-xs font-bold font-mono text-[#009A84] bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  {r.savings}
                </span>

                <button
                  onClick={() => handleDownload(r.title)}
                  className="p-2 bg-white hover:bg-gray-100 text-[#052439] rounded border border-gray-200 transition-colors cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
