export type DataSourceStatus = 'LIVE' | 'RECENT' | 'STALE' | 'UNAVAILABLE' | 'DEMO' | 'FRESH';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type UserRole = 'FISHER' | 'COASTAL_AUTHORITY' | 'RESEARCHER' | 'ADMIN';

export type Language = 'en' | 'ta';

export interface MarineCoordinate {
  lat: number;
  lng: number;
  name?: string;
}

export interface MarineObservation {
  id: string;
  source: 'INCOIS' | 'IMD' | 'MOSDAC' | 'BHUVAN' | 'USER_REPORT';
  sourceUrl: string;
  parameter: string;
  value: number | string;
  unit: string;
  lat: number;
  lng: number;
  retrievedAt: string;
  observationTime: string;
  forecastTime?: string;
  qualityStatus: 'VERIFIED' | 'PROVISIONAL' | 'SIMULATED';
  freshnessStatus: DataSourceStatus;
}

export interface PFZAdvisory {
  id: string;
  zoneName: string;
  coordinates: [number, number][]; // Polygon or points
  centerLat: number;
  centerLng: number;
  distanceKm: number;
  depthMeters: number;
  sstCelsius: number;
  chlorophyllMgM3: number;
  validFrom: string;
  validUntil: string;
  advisoryDate: string;
  source: 'INCOIS';
  sourceUrl: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedSpecies: string[];
  freshnessStatus: DataSourceStatus;
}

export interface WeatherWarning {
  id: string;
  severity: 'WARNING' | 'ALERT' | 'ADVISORY' | 'NORMAL';
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  source: 'IMD' | 'INCOIS';
  issuedAt: string;
  validUntil: string;
  affectsVenturing: boolean; // "Fishermen advised NOT to venture into sea"
  affectedAreas: string[];
  windSpeedGustsKmph: number;
  waveHeightMeters: number;
  freshnessStatus: DataSourceStatus;
}

export interface OceanState {
  lat: number;
  lng: number;
  locationName: string;
  windSpeedKts: number;
  windDirectionDeg: number;
  windDirectionText: string;
  significantWaveHeightM: number;
  peakWavePeriodSec: number;
  swellHeightM: number;
  swellPeriodSec: number;
  currentSpeedMps: number;
  currentDirectionDeg: number;
  seaSurfaceTempC: number;
  mixedLayerDepthM: number;
  tideLevelM: number;
  timestamp: string;
  forecastTimestamp: string;
  source: 'INCOIS';
  freshnessStatus: DataSourceStatus;
}

export interface EcosystemAlert {
  id: string;
  type: 'ALGAL_BLOOM' | 'HEAT_STRESS' | 'CORAL_BLEACHING' | 'SST_ANOMALY' | 'POLLUTION_REPORT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  lat: number;
  lng: number;
  source: 'MOSDAC' | 'INCOIS' | 'BHUVAN' | 'USER_REPORT';
  timestamp: string;
  evidence: string;
  freshnessStatus: DataSourceStatus;
}

export interface MarineBoundary {
  id: string;
  name: string;
  type: 'IMBL' | 'MPA_SANCTUARY' | 'RESTRICTED_DEFENSE' | 'PORT_APPROACH';
  coordinates: [number, number][];
  warningBufferKm: number;
  descriptionEn: string;
  descriptionTa: string;
  authority: string;
}

export interface RiskBreakdown {
  overallLevel: RiskLevel;
  overallScore: number; // 0 - 100
  weatherRisk: number; // 0 - 100
  waveRisk: number;
  windRisk: number;
  currentRisk: number;
  boundaryRisk: number;
  ecosystemRisk: number;
  routeRisk: number;
  dataQualityRisk: number;
  explanationsEn: string[];
  explanationsTa: string[];
  advisoryAdviceEn: string;
  advisoryAdviceTa: string;
  conflictDetected: boolean;
  conflictDetails?: {
    sourceA: string;
    sourceB: string;
    description: string;
    higherAuthority: string;
  };
}

export interface EvidenceItem {
  id: string;
  agent: string;
  parameter: string;
  value: string;
  unit?: string;
  source: string;
  sourceUrl: string;
  retrievedAt: string;
  observationTime: string;
  relevance: string;
  freshness: DataSourceStatus;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface MarineRoute {
  id: string;
  name: string;
  type: 'FASTEST' | 'LOWER_RISK' | 'FUEL_EFFICIENT';
  waypoints: [number, number][];
  distanceKm: number;
  estimatedDurationHours: number;
  estimatedFuelLitres: number;
  averageRisk: RiskLevel;
  hazardCount: number;
  closestBoundaryDistanceKm: number;
  favorableCurrentSavingsLitres: number;
  descriptionEn: string;
  descriptionTa: string;
}

export interface TripSession {
  id: string;
  fisherName: string;
  boatName: string;
  boatType: 'FIBER_BOAT' | 'TRAWLER' | 'COUNTRY_CRAFT' | 'MOTORIZED_CANOE';
  homeHarbour: string;
  startLocation: MarineCoordinate;
  targetZone?: string;
  status: 'PLANNED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'EMERGENCY';
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  distanceTraveledKm: number;
  fuelConsumedLitres: number;
  currentLat: number;
  currentLng: number;
  routeWaypoints: [number, number][];
  recordedObservations: number;
  alertsEncountered: string[];
  maxRiskEncountered: RiskLevel;
}

export interface FisherProfile {
  name: string;
  language: Language;
  homeHarbour: string;
  boatName: string;
  boatType: 'FIBER_BOAT' | 'TRAWLER' | 'COUNTRY_CRAFT' | 'MOTORIZED_CANOE';
  boatSpeedKnots: number;
  fuelCapacityLitres: number;
  fuelConsumptionRateLph: number; // Litres per hour
  emergencyContact: string;
  preferredFishingDistanceKm: number;
}

export interface UserObservation {
  id: string;
  fisherName: string;
  category: 'FISH_ABUNDANCE' | 'SEA_CONDITION' | 'WEATHER' | 'ALGAL_BLOOM' | 'DEAD_FISH' | 'FLOATING_WASTE' | 'UNUSUAL_COLOR';
  notes: string;
  lat: number;
  lng: number;
  timestamp: string;
  speciesObserved?: string;
  severityLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ConnectorHealth {
  source: 'INCOIS' | 'IMD' | 'MOSDAC' | 'BHUVAN';
  name: string;
  fullName: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  lastSuccessfulSync: string;
  lastAttempt: string;
  latencyMs: number;
  errorCount: number;
  dataTypesProvided: string[];
  officialUrl: string;
  isDemoFallback: boolean;
}

export interface WhatIfScenario {
  departureTime: string; // e.g. "05:00"
  departureLocation: MarineCoordinate;
  destinationZone: string;
  boatSpeedKnots: number;
  tripDurationHours: number;
  // Computed outputs
  weatherScore: number;
  significantWaveM: number;
  windSpeedKts: number;
  riskLevel: RiskLevel;
  fuelCostLitres: number;
  pfzAccessConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  warningActive: boolean;
  notesEn: string;
  notesTa: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'jaldrishti';
  text: string;
  language: Language;
  timestamp: string;
  agentChain?: {
    intent: string;
    invokedAgents: string[];
    criticChecked: boolean;
    evidenceCount: number;
  };
  decisionSummary?: {
    decisionEn: string;
    decisionTa: string;
    riskLevel: RiskLevel;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    whyEn: string[];
    whyTa: string[];
    recommendedActionEn: string;
    recommendedActionTa: string;
    alternativeEn: string;
    alternativeTa: string;
    sources: string[];
    evidenceItems: EvidenceItem[];
    conflictDetected?: boolean;
    conflictText?: string;
  };
}
