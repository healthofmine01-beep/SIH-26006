import React, { useState } from 'react';
import { 
  Ship, 
  Navigation, 
  Anchor, 
  MapPin, 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  SlidersHorizontal,
  Info,
  Layers,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { TrackingVoyage, VesselClass } from '../types';
import { DEMO_TRACKING_VOYAGES } from '../data/mockData';

interface TrackingViewProps {
  onNavigateWhatIf?: () => void;
  onNavigateVesselPort?: () => void;
}

export const TrackingView: React.FC<TrackingViewProps> = ({
  onNavigateWhatIf,
  onNavigateVesselPort,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedVoyageId, setSelectedVoyageId] = useState<string>(DEMO_TRACKING_VOYAGES[0].id);

  const filteredVoyages = DEMO_TRACKING_VOYAGES.filter((v) => {
    const matchesSearch = 
      v.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.cargoType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.originPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.destinationPort.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = selectedClass === 'All' || v.vesselClass === selectedClass;
    const matchesStatus = selectedStatus === 'All' || v.voyageStatus === selectedStatus;

    return matchesSearch && matchesClass && matchesStatus;
  });

  const selectedVoyage = DEMO_TRACKING_VOYAGES.find(v => v.id === selectedVoyageId) || DEMO_TRACKING_VOYAGES[0];

  const inTransitCount = DEMO_TRACKING_VOYAGES.filter(v => v.voyageStatus === 'In Transit').length;
  const anchorageCount = DEMO_TRACKING_VOYAGES.filter(v => v.voyageStatus === 'Approaching Anchorage').length;
  const berthedCount = DEMO_TRACKING_VOYAGES.filter(v => v.voyageStatus === 'Discharging' || v.voyageStatus === 'At Berth').length;

  return (
    <div className="space-y-6 font-['Inter'] max-w-6xl mx-auto">
      {/* 1. Header & Demo Data Disclosure */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0072E9]" />
              <span className="text-xs font-bold text-gray-500 font-mono tracking-wider uppercase">
                Voyage & Fleet Tracking
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-mono font-bold border border-blue-200">
                Prototype Fleet
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#052439] tracking-tight font-['Hanken_Grotesk']">
              Voyage & Fleet Tracking
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Monitor active overseas voyages bound for East Coast India discharge terminals.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="p-3 bg-[#F8FAFC] border border-gray-200 rounded-xl">
              <span className="text-[10px] font-mono uppercase text-gray-400 block">Active Vessels</span>
              <span className="text-lg font-bold text-[#052439] font-mono">{DEMO_TRACKING_VOYAGES.length} Vessels</span>
            </div>
          </div>
        </div>

        {/* Operations Telemetry Notice */}
        <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-700">
          <Info className="w-4 h-4 text-[#0072E9] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-[#052439]">Fleet Operations Telemetry</p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Voyage waypoints, transit progress, and port arrival windows calculated from standard maritime speed corridors and vessel fixture schedules.
            </p>
          </div>
        </div>

        {/* Summary Status Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-100">
          <div className="p-3 rounded-lg bg-[#F8FAFC] border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase font-mono block">In Transit (Laden)</span>
            <span className="text-base font-extrabold text-[#0072E9] font-mono">{inTransitCount} Ships</span>
          </div>
          <div className="p-3 rounded-lg bg-[#F8FAFC] border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase font-mono block">Anchorage / Lightering</span>
            <span className="text-base font-extrabold text-amber-700 font-mono">{anchorageCount} Ships</span>
          </div>
          <div className="p-3 rounded-lg bg-[#F8FAFC] border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase font-mono block">Berthed & Discharging</span>
            <span className="text-base font-extrabold text-emerald-700 font-mono">{berthedCount} Ships</span>
          </div>
          <div className="p-3 rounded-lg bg-[#F8FAFC] border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase font-mono block">Avg Fleet Speed</span>
            <span className="text-base font-extrabold text-[#052439] font-mono">12.1 kts (Eco)</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Search & Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vessel name, cargo, origin, or destination port..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-gray-200 rounded-lg text-xs font-medium text-[#1B1C1A] placeholder:text-gray-400 focus:outline-hidden focus:border-[#0072E9] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span>Class:</span>
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="py-2 px-2.5 bg-[#F8FAFC] border border-gray-200 rounded-lg text-xs font-semibold text-[#052439] focus:outline-hidden focus:border-[#0072E9]"
          >
            <option value="All">All Classes</option>
            <option value="Capesize">Capesize</option>
            <option value="Panamax">Panamax</option>
            <option value="Supramax">Supramax</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono ml-2">
            <span>Status:</span>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-2 px-2.5 bg-[#F8FAFC] border border-gray-200 rounded-lg text-xs font-semibold text-[#052439] focus:outline-hidden focus:border-[#0072E9]"
          >
            <option value="All">All Statuses</option>
            <option value="In Transit">In Transit</option>
            <option value="Approaching Anchorage">Approaching Anchorage</option>
            <option value="Discharging">Discharging</option>
          </select>
        </div>
      </div>

      {/* 3. Main Split View: Voyage List & Selected Voyage Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Voyage List (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          {filteredVoyages.length === 0 ? (
            <div className="p-8 text-center bg-white border border-gray-200 rounded-2xl text-xs text-gray-500">
              No vessels match the search criteria.
            </div>
          ) : (
            filteredVoyages.map((voyage) => {
              const isSelected = voyage.id === selectedVoyage.id;
              const isDischarging = voyage.voyageStatus === 'Discharging';
              const isAnchorage = voyage.voyageStatus === 'Approaching Anchorage';

              return (
                <div
                  key={voyage.id}
                  onClick={() => setSelectedVoyageId(voyage.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-white border-[#0072E9] shadow-sm ring-1 ring-[#0072E9]' 
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-blue-100 text-[#0072E9]' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Ship className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#052439]">
                            {voyage.vesselName}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400">
                            {voyage.imoNumber}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-mono">
                          {voyage.vesselClass} • {voyage.dwt.toLocaleString()} DWT • Flag: {voyage.flag}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                      isDischarging
                        ? 'bg-emerald-100 text-emerald-800'
                        : isAnchorage
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-[#0072E9]'
                    }`}>
                      {voyage.voyageStatus}
                    </span>
                  </div>

                  {/* Route & Cargo Summary */}
                  <div className="grid grid-cols-2 gap-2 text-xs py-2 my-1 border-y border-gray-100">
                    <div>
                      <span className="text-[10px] text-gray-400 font-mono uppercase block">Voyage Route</span>
                      <span className="font-semibold text-gray-800 truncate block">
                        {voyage.originPort} → <strong>{voyage.destinationPort}</strong>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-mono uppercase block">Cargo & Arrival Window</span>
                      <span className="font-mono text-gray-800 truncate block">
                        {voyage.cargoQuantity.toLocaleString()} MT {voyage.cargoType} (ETA {voyage.estimatedArrival})
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-gray-500">
                      <span>Progress: {voyage.progressPercent}%</span>
                      <span>{voyage.distanceCoveredNm.toLocaleString()} / {voyage.totalDistanceNm.toLocaleString()} NM</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          isDischarging ? 'bg-emerald-500' : 'bg-[#0072E9]'
                        }`}
                        style={{ width: `${voyage.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Vessel Detail Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xs sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#0072E9]" />
                <span className="text-xs font-bold font-mono uppercase text-[#052439] tracking-wider">
                  Voyage Dossier
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-bold">
                {selectedVoyage.id}
              </span>
            </div>

            {/* Header info */}
            <div className="mt-4">
              <h3 className="text-xl font-bold text-[#052439] font-['Hanken_Grotesk']">
                {selectedVoyage.vesselName}
              </h3>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                {selectedVoyage.vesselClass} • {selectedVoyage.dwt.toLocaleString()} MT DWT
              </p>
            </div>

            {/* Operational Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase font-mono block">Current Speed</span>
                <span className="text-base font-extrabold text-[#052439] font-mono">{selectedVoyage.speedKnots} knots</span>
                <span className="text-[10px] text-gray-500 font-mono block">Heading: {selectedVoyage.courseDeg}°</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase font-mono block">Demurrage Risk</span>
                <span className={`text-base font-extrabold font-mono ${
                  selectedVoyage.demurrageRisk === 'Low' ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {selectedVoyage.demurrageRisk}
                </span>
                <span className="text-[10px] text-gray-500 font-mono block">Loading window (laycan) verified</span>
              </div>
            </div>

            {/* Geographical Position & Milestones */}
            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                <div className="flex items-center gap-1.5 text-[#0072E9] font-bold font-mono text-[11px] mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Current Sea Area:</span>
                </div>
                <p className="font-semibold text-[#052439]">{selectedVoyage.currentRegion}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div>
                  <span className="text-[10px] text-gray-400 font-mono uppercase block">Active Milestone</span>
                  <p className="font-semibold text-gray-800">{selectedVoyage.currentMilestone}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-mono uppercase block">Next Waypoint / Pilot Station</span>
                  <p className="font-medium text-gray-600">{selectedVoyage.nextMilestone}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-mono uppercase block">Scheduled Berth Window</span>
                  <p className="font-mono text-gray-800">{selectedVoyage.berthWindow}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-mono uppercase block">Berth Draft Clearance</span>
                  <p className="font-mono text-gray-800">
                    Laden draft: {selectedVoyage.berthDraftRequirementM}m
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions linking to What-If & Vessel/Port */}
            <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
              {onNavigateWhatIf && (
                <button
                  onClick={onNavigateWhatIf}
                  className="w-full py-2.5 px-3 bg-[#052439] hover:bg-[#001D32] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Simulate Delay Impact in What-If</span>
                </button>
              )}
              {onNavigateVesselPort && (
                <button
                  onClick={onNavigateVesselPort}
                  className="w-full py-2 px-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Anchor className="w-3.5 h-3.5 text-gray-500" />
                  <span>Inspect Destination Port Draft Constraints</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
