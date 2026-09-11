import { ForecastDataPoint, RouteRateItem, RouteRecommendation, OperationalAlert, VesselOption } from '../types';

export const KPI_METRICS = {
  predictedFreightRate: 42.35,
  rateChangeVsYesterday: 8.7,
  recommendedSavings: 1.28, // Million USD
  savingsChangeVsLastMonth: 11.4,
  optimalVessel: 'Capesize',
  optimalVesselDwt: '180k DWT',
  vesselEfficiencyTag: 'Best cost efficiency',
  riskLevel: 'Low',
  riskSummary: 'Overall risk is acceptable',
  bunkerVLSFO: 642.50, // $/MT
  bdiIndex: 1845,
  activeFixturesCount: 14,
  monitoredRoutesCount: 8,
};

export const FORECAST_DATA: ForecastDataPoint[] = [
  { date: '2024-05-10', formattedDate: 'May 10', historical: 19.5, bunkerPrice: 620, bdiIndex: 1680 },
  { date: '2024-05-13', formattedDate: 'May 13', historical: 23.2, bunkerPrice: 625, bdiIndex: 1710 },
  { date: '2024-05-17', formattedDate: 'May 17', historical: 14.8, bunkerPrice: 618, bdiIndex: 1650 },
  { date: '2024-05-20', formattedDate: 'May 20', historical: 20.4, bunkerPrice: 630, bdiIndex: 1720 },
  { date: '2024-05-24', formattedDate: 'May 24', historical: 27.6, bunkerPrice: 638, bdiIndex: 1780 },
  { date: '2024-05-27', formattedDate: 'May 27', historical: 24.1, bunkerPrice: 635, bdiIndex: 1750 },
  { date: '2024-05-31', formattedDate: 'May 31', historical: 42.35, predicted7D: 42.35, predicted30D: 42.35, lowerBound: 42.35, upperBound: 42.35, bunkerPrice: 642, bdiIndex: 1845 },
  { date: '2024-06-03', formattedDate: 'Jun 3', predicted7D: 44.8, predicted30D: 43.5, lowerBound: 37.0, upperBound: 45.2, bunkerPrice: 645, bdiIndex: 1870 },
  { date: '2024-06-07', formattedDate: 'Jun 7', predicted7D: 47.5, predicted30D: 44.8, lowerBound: 33.5, upperBound: 48.0, bunkerPrice: 650, bdiIndex: 1895 },
  { date: '2024-06-10', formattedDate: 'Jun 10', predicted7D: 49.8, predicted30D: 46.1, lowerBound: 30.2, upperBound: 51.5, bunkerPrice: 654, bdiIndex: 1920 },
  { date: '2024-06-14', formattedDate: 'Jun 14', predicted7D: 52.0, predicted30D: 47.9, lowerBound: 27.8, upperBound: 54.0, bunkerPrice: 658, bdiIndex: 1940 },
  { date: '2024-06-18', formattedDate: 'Jun 18', predicted7D: 54.2, predicted30D: 49.3, lowerBound: 25.4, upperBound: 56.2, bunkerPrice: 662, bdiIndex: 1965 },
  { date: '2024-06-21', formattedDate: 'Jun 21', predicted7D: 56.4, predicted30D: 51.0, lowerBound: 24.0, upperBound: 58.5, bunkerPrice: 665, bdiIndex: 1980 },
];

export const ROUTE_RATES: RouteRateItem[] = [
  {
    id: 'r1',
    route: 'Hay Point - Vizag',
    origin: 'Hay Point, Australia',
    destination: 'Visakhapatnam (Vizag), India',
    currentRate: 42.35,
    change24h: 3.4,
    distanceNm: 5200,
    avgVoyageDays: 16.5,
    recommendedVessel: 'Capesize',
  },
  {
    id: 'r2',
    route: 'Hay Point - Paradip',
    origin: 'Hay Point, Australia',
    destination: 'Paradip Port, India',
    currentRate: 38.12,
    change24h: -1.2,
    distanceNm: 5050,
    avgVoyageDays: 15.8,
    recommendedVessel: 'Capesize',
  },
  {
    id: 'r3',
    route: 'Newcastle - Vizag',
    origin: 'Newcastle, Australia',
    destination: 'Visakhapatnam (Vizag), India',
    currentRate: 45.67,
    change24h: 4.8,
    distanceNm: 5650,
    avgVoyageDays: 18.0,
    recommendedVessel: 'Panamax',
  },
  {
    id: 'r4',
    route: 'Newcastle - Paradip',
    origin: 'Newcastle, Australia',
    destination: 'Paradip Port, India',
    currentRate: 41.22,
    change24h: 0.9,
    distanceNm: 5500,
    avgVoyageDays: 17.2,
    recommendedVessel: 'Panamax',
  },
  {
    id: 'r5',
    route: 'Gladstone - Qingdao',
    origin: 'Gladstone, Australia',
    destination: 'Qingdao, China',
    currentRate: 29.80,
    change24h: -0.5,
    distanceNm: 4400,
    avgVoyageDays: 14.0,
    recommendedVessel: 'Capesize',
  },
  {
    id: 'r6',
    route: 'Richards Bay - Krishnapatnam',
    origin: 'Richards Bay, South Africa',
    destination: 'Krishnapatnam, India',
    currentRate: 33.45,
    change24h: 2.1,
    distanceNm: 4750,
    avgVoyageDays: 15.2,
    recommendedVessel: 'Capesize',
  },
];

export const RECENT_RECOMMENDATIONS: RouteRecommendation[] = [
  {
    id: 'rec-1',
    route: 'Hay Point - Vizag',
    originPort: 'Hay Point',
    destPort: 'Vizag',
    originCountry: 'Australia',
    destCountry: 'India',
    vesselType: 'Capesize',
    dwt: '180k DWT',
    optimalAction: 'Book Now (Spot)',
    actionIcon: 'lightning',
    expectedCost: 1245000,
    savingsAmount: 186000,
    savingsPercentage: 13.0,
    confidence: 'High',
    cargoType: 'Coking Coal',
    cargoVolume: 170000,
    currentRate: 42.35,
    forecastRate7D: 47.50,
    forecastRate30D: 51.00,
    laycanWindow: 'Nov 04 - Nov 10, 2024',
    bunkerConsumption: 42.5,
    etaDays: 16,
    status: 'Ready',
  },
  {
    id: 'rec-2',
    route: 'Newcastle - Paradip',
    originPort: 'Newcastle',
    destPort: 'Paradip',
    originCountry: 'Australia',
    destCountry: 'India',
    vesselType: 'Panamax',
    dwt: '75k DWT',
    optimalAction: 'Wait 7 Days',
    actionIcon: 'clock',
    expectedCost: 872000,
    savingsAmount: 82000,
    savingsPercentage: 9.5,
    confidence: 'Medium',
    cargoType: 'Thermal Coal',
    cargoVolume: 72000,
    currentRate: 41.22,
    forecastRate7D: 37.40,
    forecastRate30D: 36.10,
    laycanWindow: 'Nov 12 - Nov 18, 2024',
    bunkerConsumption: 28.0,
    etaDays: 17,
    status: 'Ready',
  },
  {
    id: 'rec-3',
    route: 'Gladstone - Qingdao',
    originPort: 'Gladstone',
    destPort: 'Qingdao',
    originCountry: 'Australia',
    destCountry: 'China',
    vesselType: 'Capesize',
    dwt: '180k DWT',
    optimalAction: 'Book Now (Spot)',
    actionIcon: 'lightning',
    expectedCost: 1480000,
    savingsAmount: 215000,
    savingsPercentage: 14.5,
    confidence: 'High',
    cargoType: 'Iron Ore',
    cargoVolume: 175000,
    currentRate: 29.80,
    forecastRate7D: 34.20,
    forecastRate30D: 37.50,
    laycanWindow: 'Nov 02 - Nov 08, 2024',
    bunkerConsumption: 41.0,
    etaDays: 14,
    status: 'Ready',
  },
  {
    id: 'rec-4',
    route: 'Richards Bay - Krishnapatnam',
    originPort: 'Richards Bay',
    destPort: 'Krishnapatnam',
    originCountry: 'South Africa',
    destCountry: 'India',
    vesselType: 'Capesize',
    dwt: '175k DWT',
    optimalAction: 'Wait 7 Days',
    actionIcon: 'clock',
    expectedCost: 1120000,
    savingsAmount: 94000,
    savingsPercentage: 8.4,
    confidence: 'Medium',
    cargoType: 'Steam Coal',
    cargoVolume: 160000,
    currentRate: 33.45,
    forecastRate7D: 30.60,
    forecastRate30D: 29.80,
    laycanWindow: 'Nov 15 - Nov 21, 2024',
    bunkerConsumption: 39.5,
    etaDays: 15,
    status: 'Ready',
  },
];

export const LIVE_ALERTS: OperationalAlert[] = [
  {
    id: 'alert-1',
    type: 'fuel',
    title: 'Fuel Prices Increased',
    summary: 'Brent crude up 4.2% today, impacting upcoming voyage bunker costs.',
    impactLevel: 'risk',
    timestamp: '2024-10-24T11:42:00Z',
    timeAgo: '2m ago',
    affectedRoutes: ['Hay Point - Vizag', 'Newcastle - Paradip'],
    suggestedAction: 'Lock in bunker hedging contracts at Singapore hub or adjust cruising speed to eco-speed 11.5 knots.',
    read: false,
  },
  {
    id: 'alert-2',
    type: 'congestion',
    title: 'Port Congestion',
    summary: 'Vizag port congestion high. Expect 2-3 day berthing delays.',
    impactLevel: 'warning',
    timestamp: '2024-10-24T11:29:00Z',
    timeAgo: '15m ago',
    affectedRoutes: ['Hay Point - Vizag', 'Newcastle - Vizag'],
    suggestedAction: 'Evaluate divert to Gangavaram or request slow steaming from day 10.',
    read: false,
  },
  {
    id: 'alert-3',
    type: 'weather',
    title: 'Weather Update',
    summary: 'Monsoon activity in Bay of Bengal tracking normally. No severe cyclone risk.',
    impactLevel: 'info',
    timestamp: '2024-10-24T10:44:00Z',
    timeAgo: '1h ago',
    affectedRoutes: ['Bay of Bengal Transit Lanes'],
    suggestedAction: 'Maintain scheduled voyage course; monitor 48-hr radar updates.',
    read: true,
  },
  {
    id: 'alert-4',
    type: 'regulation',
    title: 'EU ETS Compliance Check',
    summary: 'Carbon credit allowance quota updated for Q4 European discharge routes.',
    impactLevel: 'info',
    timestamp: '2024-10-24T08:15:00Z',
    timeAgo: '3h ago',
    affectedRoutes: ['Tubarao - Rotterdam'],
    suggestedAction: 'Review CII efficiency rating of chartered bulk carrier.',
    read: true,
  },
];

export const AVAILABLE_VESSELS: VesselOption[] = [
  {
    name: 'MV Pacific Pioneer',
    type: 'Capesize',
    dwt: 181200,
    builtYear: 2021,
    dailyHireCost: 28500,
    fuelEfficiency: 'High',
    currentLocation: 'Off Singapore',
    availabilityDate: 'Nov 02, 2024',
    carbonIntensityRating: 'A',
  },
  {
    name: 'MV Oceanic Fortune',
    type: 'Capesize',
    dwt: 178500,
    builtYear: 2018,
    dailyHireCost: 26200,
    fuelEfficiency: 'Medium',
    currentLocation: 'Port Hedland',
    availabilityDate: 'Nov 05, 2024',
    carbonIntensityRating: 'B',
  },
  {
    name: 'MV Southern Cross',
    type: 'Panamax',
    dwt: 75400,
    builtYear: 2020,
    dailyHireCost: 16800,
    fuelEfficiency: 'High',
    currentLocation: 'Newcastle Anch.',
    availabilityDate: 'Nov 03, 2024',
    carbonIntensityRating: 'A',
  },
  {
    name: 'MV Orient Glory',
    type: 'Panamax',
    dwt: 73200,
    builtYear: 2016,
    dailyHireCost: 14500,
    fuelEfficiency: 'Standard',
    currentLocation: 'Manila Bay',
    availabilityDate: 'Nov 08, 2024',
    carbonIntensityRating: 'C',
  },
];

export const INITIAL_ANALYSES_HISTORY: import('../types').AnalysisHistoryItem[] = [
  {
    id: 'CP-1042',
    date: '15 Nov 2024',
    cargoType: 'Coking Coal',
    cargoQuantity: 170000,
    origin: 'Hay Point, Australia',
    destination: 'Visakhapatnam (Vizag)',
    recommendation: 'BOOK NOW',
    vessel: 'Capesize',
    costPerTonne: 42.35,
    risk: 'LOW',
  },
  {
    id: 'CP-1041',
    date: '12 Nov 2024',
    cargoType: 'Thermal Coal',
    cargoQuantity: 75000,
    origin: 'Newcastle, Australia',
    destination: 'Paradip Port',
    recommendation: 'WAIT',
    vessel: 'Panamax',
    costPerTonne: 41.22,
    risk: 'LOW',
  },
  {
    id: 'CP-1040',
    date: '09 Nov 2024',
    cargoType: 'Iron Ore',
    cargoQuantity: 160000,
    origin: 'Richards Bay, South Africa',
    destination: 'Visakhapatnam (Vizag)',
    recommendation: 'BOOK NOW',
    vessel: 'Capesize',
    costPerTonne: 33.45,
    risk: 'MEDIUM',
  },
  {
    id: 'CP-1039',
    date: '05 Nov 2024',
    cargoType: 'Coking Coal',
    cargoQuantity: 55000,
    origin: 'Taboneo, Indonesia',
    destination: 'Haldia',
    recommendation: 'CONSIDER ALTERNATIVE',
    vessel: 'Supramax',
    costPerTonne: 28.60,
    risk: 'LOW',
  },
];

export const DEFAULT_ANALYSIS_RESULT: import('../types').FreightAnalysisResult = {
  id: 'CP-1043',
  input: {
    cargoType: 'Coking Coal',
    cargoQuantity: 75000,
    origin: 'Newcastle, Australia',
    destinationPort: 'Visakhapatnam (Vizag)',
    requiredDate: '2024-11-20',
    contractPreference: 'Spot',
  },
  recommendedAction: 'BOOK NOW',
  recommendedVessel: 'Panamax',
  vesselDwt: '75k DWT',
  estimatedRatePerTonne: 42.35,
  totalFreightCost: 3176250,
  riskLevel: 'LOW',
  confidenceScore: 92,
  aiRecommendationSummary:
    'Current market conditions indicate that booking within the recommended window is more favorable than waiting. Forward freight indices predict a +8.7% rate hike across the Pacific-Indian Ocean corridor within 7 days.',
  reasons: {
    freightRateTrend:
      'Freight rates on this route are trending upwards (+8.7% predicted over 7 days). Securing a vessel now shields procurement from impending spot rate surges.',
    vesselSuitability:
      'A standard Panamax vessel (75k DWT) matches your 75,000 tonne parcel size with 98.6% hold utilization and near-zero deadfreight penalty.',
    portCompatibility:
      'Destination port Visakhapatnam Inner/Outer harbor offers 14.5m draft clearance, fully compatible with laden Panamax draft (13.8m).',
    fuelCostImpact:
      'Singapore VLSFO 0.5% prices rose 4.2% this week ($642.50/MT). Fixing charter now transfers impending bunker escalation risk to carrier spot margin.',
    demurrageRisk:
      'Average pre-berthing wait time at Visakhapatnam is currently 0.8 days (below the 3-day laytime allowance). Low demurrage risk.',
  },
  technicalDetails: {
    forecastModel: 'Ensemble (Temporal Fusion Transformer + XGBoost)',
    forecastMape: 4.2,
    bdiIndexCurrent: 1845,
    bunkerVLSFO: 642.5,
    portMaxDraftMeters: 14.5,
    vesselLadenDraftMeters: 13.8,
    co2EmissionsTonnes: 1420,
  },
  timestamp: 'Just now (Baseline)',
};

export function runFreightOptimization(
  input: import('../types').FreightAnalysisInput
): import('../types').FreightAnalysisResult {
  const isHaldia = input.destinationPort.toLowerCase().includes('haldia');
  const isLarge = input.cargoQuantity >= 110000;
  const isMedium = input.cargoQuantity >= 55000 && input.cargoQuantity < 110000;

  let recommendedVessel: import('../types').VesselClass = 'Panamax';
  let vesselDwt = '75k DWT';
  let draftMeters = 13.8;
  let portMaxDraft = 14.5;
  let ratePerTonne = 42.35;

  if (isHaldia) {
    portMaxDraft = 8.8;
    recommendedVessel = 'Supramax';
    vesselDwt = '55k DWT';
    draftMeters = 8.5;
    ratePerTonne = 36.80;
  } else if (isLarge) {
    recommendedVessel = 'Capesize';
    vesselDwt = '180k DWT';
    draftMeters = 17.8;
    portMaxDraft = 18.2;
    ratePerTonne = 38.50;
  } else if (isMedium) {
    recommendedVessel = 'Panamax';
    vesselDwt = '75k DWT';
    draftMeters = 13.8;
    portMaxDraft = 14.5;
    ratePerTonne = 43.10;
  } else {
    recommendedVessel = 'Supramax';
    vesselDwt = '55k DWT';
    draftMeters = 10.2;
    portMaxDraft = 14.0;
    ratePerTonne = 46.20;
  }

  // Determine action: BOOK NOW / WAIT / CONSIDER ALTERNATIVE
  let action: import('../types').RecommendationAction = 'BOOK NOW';
  if (isHaldia && isLarge) {
    action = 'CONSIDER ALTERNATIVE';
  } else if (input.origin.toLowerCase().includes('richards') || input.origin.toLowerCase().includes('taboneo')) {
    action = 'WAIT';
  } else {
    action = 'BOOK NOW';
  }

  const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = isHaldia && isLarge ? 'HIGH' : isHaldia ? 'MEDIUM' : 'LOW';
  const totalCost = Math.round(ratePerTonne * input.cargoQuantity);
  const randomId = 'CP-' + Math.floor(1000 + Math.random() * 9000);

  return {
    id: randomId,
    input,
    recommendedAction: action,
    recommendedVessel,
    vesselDwt,
    estimatedRatePerTonne: ratePerTonne,
    totalFreightCost: totalCost,
    riskLevel,
    confidenceScore: 91,
    aiRecommendationSummary: action === 'BOOK NOW'
      ? `Current market conditions indicate that booking within the recommended window is more favorable than waiting. Forward freight indices project a +7.4% rate escalation across the corridor.`
      : action === 'WAIT'
      ? `Market momentum indicates easing tonnage availability. Waiting 5–7 days before fixing the charter is projected to reduce freight costs by ~$2.10/tonne.`
      : `Harbor draft constraints at destination (${portMaxDraft}m) require splitting the ${input.cargoQuantity.toLocaleString()} tonne parcel into shallow-draft Supramax vessels or scheduling Sandheads lightering.`,
    reasons: {
      freightRateTrend: action === 'BOOK NOW'
        ? `Spot rates for ${input.cargoType} along ${input.origin} to ${input.destinationPort} are projected to rise over the next 7-14 days.`
        : action === 'WAIT'
        ? `Tonnage supply at loading ports is accumulating, creating soft downward pressure on spot quotes over the next week.`
        : `Freight curves for direct large bulkers are unfavorable due to double-handling lighterage fees at destination.`,
      vesselSuitability: `${recommendedVessel} (${vesselDwt}) provides the optimal cargo stowage factor for ${input.cargoQuantity.toLocaleString()} tonnes with minimal deadfreight.`,
      portCompatibility: isHaldia && isLarge
        ? `Warning: Haldia permissible draft (8.8m) requires parcel lightering or splitting into Supramax vessels.`
        : `${input.destinationPort} navigational channel (max draft ${portMaxDraft}m) safely accommodates ${recommendedVessel} design draft (${draftMeters}m).`,
      fuelCostImpact: `Singapore VLSFO 0.5% benchmark is at $642.50/MT with moderate volatility (+3.2% 7-day spread).`,
      demurrageRisk: `Berth congestion at ${input.destinationPort} currently averages 1.1 days, well within the customary charterparty laytime allowance.`,
    },
    technicalDetails: {
      forecastModel: 'Ensemble (Temporal Fusion Transformer + XGBoost)',
      forecastMape: 4.2,
      bdiIndexCurrent: 1845,
      bunkerVLSFO: 642.5,
      portMaxDraftMeters: portMaxDraft,
      vesselLadenDraftMeters: draftMeters,
      co2EmissionsTonnes: Math.round(input.cargoQuantity * 0.018),
    },
    timestamp: 'Just now',
  };
}

export const DEMO_TRACKING_VOYAGES: import('../types').TrackingVoyage[] = [
  {
    id: 'TRK-201',
    vesselName: 'MV Eastern Pioneer',
    imoNumber: 'IMO 9842301',
    vesselClass: 'Panamax',
    dwt: 75200,
    flag: 'Singapore',
    cargoType: 'Coking Coal',
    cargoQuantity: 74000,
    originPort: 'Newcastle, Australia',
    originCountry: 'Australia',
    destinationPort: 'Visakhapatnam (Vizag)',
    departureDate: 'Nov 02, 2024',
    estimatedArrival: 'Nov 16, 2024',
    voyageStatus: 'In Transit',
    currentRegion: 'Bay of Bengal (480 NM off East Coast)',
    speedKnots: 12.4,
    courseDeg: 295,
    progressPercent: 84,
    distanceCoveredNm: 4120,
    totalDistanceNm: 4900,
    berthWindow: 'Nov 17 - Nov 19, 2024',
    berthDraftRequirementM: 13.8,
    demurrageRisk: 'Low',
    currentMilestone: 'Traversing Central Bay of Bengal',
    nextMilestone: 'Vizag Outer Anchorage Pilot Station',
  },
  {
    id: 'TRK-202',
    vesselName: 'MV Pacific Enterprise',
    imoNumber: 'IMO 9718402',
    vesselClass: 'Capesize',
    dwt: 176500,
    flag: 'Liberia',
    cargoType: 'Iron Ore',
    cargoQuantity: 165000,
    originPort: 'Port Hedland, Australia',
    originCountry: 'Australia',
    destinationPort: 'Paradip Port',
    departureDate: 'Nov 05, 2024',
    estimatedArrival: 'Nov 18, 2024',
    voyageStatus: 'In Transit',
    currentRegion: 'Andaman Sea / Malacca Strait Exit',
    speedKnots: 11.8,
    courseDeg: 310,
    progressPercent: 68,
    distanceCoveredNm: 2780,
    totalDistanceNm: 4100,
    berthWindow: 'Nov 19 - Nov 22, 2024',
    berthDraftRequirementM: 17.5,
    demurrageRisk: 'Low',
    currentMilestone: 'Exited Malacca Strait Chokepoint',
    nextMilestone: 'Entering Northern Bay of Bengal Corridor',
  },
  {
    id: 'TRK-203',
    vesselName: 'MV Bengal Trader',
    imoNumber: 'IMO 9631109',
    vesselClass: 'Supramax',
    dwt: 56800,
    flag: 'Panama',
    cargoType: 'Thermal Coal',
    cargoQuantity: 52000,
    originPort: 'Taboneo, Indonesia',
    originCountry: 'Indonesia',
    destinationPort: 'Haldia',
    departureDate: 'Nov 01, 2024',
    estimatedArrival: 'Nov 15, 2024',
    voyageStatus: 'Approaching Anchorage',
    currentRegion: 'Sandheads Anchorage, Hooghly Estuary',
    speedKnots: 2.1,
    courseDeg: 340,
    progressPercent: 96,
    distanceCoveredNm: 2010,
    totalDistanceNm: 2100,
    berthWindow: 'Nov 16 - Nov 18, 2024',
    berthDraftRequirementM: 8.5,
    demurrageRisk: 'Moderate',
    currentMilestone: 'Sandheads Lightering Checkpoint',
    nextMilestone: 'Pilot Boarding for River Transit to Haldia Dock',
  },
  {
    id: 'TRK-204',
    vesselName: 'MV Southern Cross',
    imoNumber: 'IMO 9825441',
    vesselClass: 'Capesize',
    dwt: 181000,
    flag: 'Marshall Islands',
    cargoType: 'Coking Coal',
    cargoQuantity: 170000,
    originPort: 'Richards Bay, South Africa',
    originCountry: 'South Africa',
    destinationPort: 'Dhamra Port',
    departureDate: 'Nov 06, 2024',
    estimatedArrival: 'Nov 22, 2024',
    voyageStatus: 'In Transit',
    currentRegion: 'Equatorial Indian Ocean Basin',
    speedKnots: 12.1,
    courseDeg: 45,
    progressPercent: 48,
    distanceCoveredNm: 2450,
    totalDistanceNm: 5100,
    berthWindow: 'Nov 23 - Nov 26, 2024',
    berthDraftRequirementM: 17.8,
    demurrageRisk: 'Low',
    currentMilestone: 'Open Ocean Deepwater Passage',
    nextMilestone: 'Southern Bay of Bengal Ingress',
  },
  {
    id: 'TRK-205',
    vesselName: 'MV Ocean Splendor',
    imoNumber: 'IMO 9794013',
    vesselClass: 'Panamax',
    dwt: 82000,
    flag: 'Cyprus',
    cargoType: 'Coking Coal',
    cargoQuantity: 76000,
    originPort: 'Gladstone, Australia',
    originCountry: 'Australia',
    destinationPort: 'Krishnapatnam',
    departureDate: 'Oct 28, 2024',
    estimatedArrival: 'Nov 14, 2024',
    voyageStatus: 'Discharging',
    currentRegion: 'Krishnapatnam Coal Berth 2',
    speedKnots: 0.0,
    courseDeg: 0,
    progressPercent: 100,
    distanceCoveredNm: 4820,
    totalDistanceNm: 4820,
    berthWindow: 'Nov 14 - Nov 17, 2024',
    berthDraftRequirementM: 14.2,
    demurrageRisk: 'Low',
    currentMilestone: 'Berthed & Discharging (38k MT Discharged)',
    nextMilestone: 'Completion & Departure in Ballast',
  },
];

