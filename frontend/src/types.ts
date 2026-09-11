export type NavTab = 
  | 'dashboard'
  | 'new-analysis'
  | 'result'
  | 'forecast'
  | 'vessel-port'
  | 'what-if'
  | 'tracking'
  | 'history'
  | 'alerts'
  | 'reports'
  | 'recommendations'
  | 'vessels-routes'
  | 'settings'
  | 'admin';

export type VesselClass = 'Capesize' | 'Panamax' | 'Supramax' | 'Handysize' | 'VLOC';

export type ActionType = 'Book Now (Spot)' | 'Wait 7 Days' | 'Fix 3-Mo TC' | 'Hedge Paper (FFA)';

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export type RecommendationAction = 'BOOK NOW' | 'WAIT' | 'CONSIDER ALTERNATIVE' | 'BUY NOW' | 'WAIT 7 DAYS';

export interface FreightAnalysisInput {
  cargoType: string;
  cargoQuantity: number; // in tonnes
  origin: string;
  destinationPort: string;
  requiredDate: string;
  contractPreference: 'Spot' | 'Time Charter' | 'Either';
}

export interface FreightAnalysisResult {
  id: string;
  input: FreightAnalysisInput;
  recommendedAction: RecommendationAction;
  recommendedVessel: VesselClass;
  vesselDwt: string;
  estimatedRatePerTonne: number;
  totalFreightCost: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  confidenceScore: number;
  aiRecommendationSummary: string;
  reasons: {
    freightRateTrend: string;
    vesselSuitability: string;
    portCompatibility: string;
    fuelCostImpact: string;
    demurrageRisk: string;
  };
  technicalDetails?: {
    forecastModel: string;
    forecastMape: number;
    bdiIndexCurrent: number;
    bunkerVLSFO: number;
    portMaxDraftMeters: number;
    vesselLadenDraftMeters: number;
    co2EmissionsTonnes: number;
  };
  timestamp: string;
}

export interface AnalysisHistoryItem {
  id: string;
  date: string;
  cargoType: string;
  cargoQuantity: number;
  origin: string;
  destination: string;
  recommendation: RecommendationAction;
  vessel: string;
  costPerTonne: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface RouteRecommendation {
  id: string;
  route: string;
  originPort: string;
  destPort: string;
  originCountry: string;
  destCountry: string;
  vesselType: VesselClass;
  dwt: string;
  optimalAction: ActionType;
  actionIcon: 'lightning' | 'clock' | 'contract' | 'shield';
  expectedCost: number;
  savingsAmount: number;
  savingsPercentage: number;
  confidence: ConfidenceLevel;
  cargoType: string;
  cargoVolume: number; // in tonnes
  currentRate: number; // $/tonne
  forecastRate7D: number;
  forecastRate30D: number;
  laycanWindow: string;
  bunkerConsumption: number; // MT/day
  etaDays: number;
  status: 'Ready' | 'Under Review' | 'Actioned';
}

export interface ForecastDataPoint {
  date: string;
  formattedDate: string;
  historical?: number;
  predicted7D?: number;
  predicted30D?: number;
  lowerBound?: number;
  upperBound?: number;
  bunkerPrice?: number;
  bdiIndex?: number;
}

export interface RouteRateItem {
  id: string;
  route: string;
  origin: string;
  destination: string;
  currentRate: number;
  change24h: number;
  distanceNm: number;
  avgVoyageDays: number;
  recommendedVessel: VesselClass;
}

export interface OperationalAlert {
  id: string;
  type: 'fuel' | 'congestion' | 'weather' | 'regulation' | 'geopolitical';
  title: string;
  summary: string;
  impactLevel: 'risk' | 'warning' | 'info';
  timestamp: string;
  timeAgo: string;
  affectedRoutes: string[];
  suggestedAction: string;
  read: boolean;
}

export interface VesselOption {
  name: string;
  type: VesselClass;
  dwt: number;
  builtYear: number;
  dailyHireCost: number;
  fuelEfficiency: 'High' | 'Medium' | 'Standard';
  currentLocation: string;
  availabilityDate: string;
  carbonIntensityRating: 'A' | 'B' | 'C';
}

export interface TrackingVoyage {
  id: string;
  vesselName: string;
  imoNumber: string;
  vesselClass: VesselClass;
  dwt: number;
  flag: string;
  cargoType: string;
  cargoQuantity: number;
  originPort: string;
  originCountry: string;
  destinationPort: string;
  departureDate: string;
  estimatedArrival: string;
  voyageStatus: 'In Transit' | 'Approaching Anchorage' | 'At Berth' | 'Discharging' | 'Under Inspection';
  currentRegion: string;
  speedKnots: number;
  courseDeg: number;
  progressPercent: number;
  distanceCoveredNm: number;
  totalDistanceNm: number;
  berthWindow: string;
  berthDraftRequirementM: number;
  demurrageRisk: 'Low' | 'Moderate' | 'High';
  currentMilestone: string;
  nextMilestone: string;
}
