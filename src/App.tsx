import React, { useState, useEffect } from 'react';
import {
  Compass,
  Map as MapIcon,
  Sliders,
  Fish,
  ShieldAlert,
  Navigation,
  MessageSquare,
  Clock,
  Eye,
  Radio,
  Sparkles,
  Layers,
  LayoutDashboard
} from 'lucide-react';

import {
  UserRole,
  Language,
  OceanState,
  WeatherWarning,
  PFZAdvisory,
  MarineBoundary,
  MarineRoute,
  RiskBreakdown,
  TripSession,
  UserObservation,
  ConnectorHealth,
  EvidenceItem
} from './types/marine';

import { Header } from './components/Header';
import { MarineMap } from './components/MarineMap';
import { FisherDashboard } from './components/FisherDashboard';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { EvidenceGraphModal } from './components/EvidenceGraphModal';
import { JaldrishtiChat } from './components/JaldrishtiChat';
import { PFZExplorer } from './components/PFZExplorer';
import { SafetyCenter } from './components/SafetyCenter';
import { RoutePlanner } from './components/RoutePlanner';
import { TripTracker } from './components/TripTracker';
import { EmergencyModal } from './components/EmergencyModal';
import { ObservationsModal } from './components/ObservationsModal';
import { CoastalAuthorityView } from './components/CoastalAuthorityView';
import { ResearcherDashboard } from './components/ResearcherDashboard';
import { AdminConsole } from './components/AdminConsole';
import { AboutModal } from './components/AboutModal';
import { t } from './i18n/translations';

export default function App() {
  // App Global State
  const [role, setRole] = useState<UserRole>('FISHER');
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [lowBandwidth, setLowBandwidth] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);

  // Fisher GPS Position (Centered around Rameswaram, Tamil Nadu)
  const [fisherLocation, setFisherLocation] = useState({
    lat: 9.2876,
    lng: 79.3129,
    name: 'Rameswaram Fishing Jetty'
  });

  // Marine Data State
  const [oceanState, setOceanState] = useState<OceanState>({
    lat: 9.2876,
    lng: 79.3129,
    locationName: 'Rameswaram South Coast (Gulf of Mannar)',
    timestamp: new Date().toISOString(),
    forecastTimestamp: new Date().toISOString(),
    significantWaveHeightM: 1.1,
    swellHeightM: 0.7,
    swellPeriodSec: 7.8,
    peakWavePeriodSec: 7.2,
    windSpeedKts: 14.5,
    windDirectionDeg: 75,
    windDirectionText: 'ENE',
    currentSpeedMps: 0.42,
    currentDirectionDeg: 210,
    seaSurfaceTempC: 28.4,
    mixedLayerDepthM: 25,
    tideLevelM: 0.48,
    source: 'INCOIS',
    freshnessStatus: 'FRESH'
  });

  const [warnings, setWarnings] = useState<WeatherWarning[]>([]);
  const [pfzZones, setPfzZones] = useState<PFZAdvisory[]>([]);
  const [boundaries, setBoundaries] = useState<MarineBoundary[]>([]);
  const [routes, setRoutes] = useState<MarineRoute[]>([]);
  const [activeRoute, setActiveRoute] = useState<MarineRoute | null>(null);
  const [risk, setRisk] = useState<RiskBreakdown>({
    overallLevel: 'LOW',
    overallScore: 24,
    weatherRisk: 22,
    waveRisk: 18,
    windRisk: 20,
    currentRisk: 12,
    boundaryRisk: 10,
    ecosystemRisk: 5,
    routeRisk: 15,
    dataQualityRisk: 8,
    conflictDetected: false,
    advisoryAdviceEn: 'Favorable sea conditions. Safe for standard fishing operations.',
    advisoryAdviceTa: 'கடல் நிலை சாதகமாக உள்ளது. பாதுகாப்பு வழிகாட்டல்களுடன் மீன்பிடிக்கலாம்.',
    explanationsEn: ['Wave height is 1.1m, below the 2.0m caution threshold.'],
    explanationsTa: ['அலை உயரம் 1.1 மீ, எச்சரிக்கை வரம்பான 2.0 மீட்டருக்கு கீழ் உள்ளது.']
  });

  const [activeTrip, setActiveTrip] = useState<TripSession | null>(null);
  const [tripsHistory, setTripsHistory] = useState<TripSession[]>([]);
  const [observations, setObservations] = useState<UserObservation[]>([]);
  const [connectors, setConnectors] = useState<ConnectorHealth[]>([]);

  // Modals state
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isObservationsOpen, setIsObservationsOpen] = useState(false);
  const [evidenceModal, setEvidenceModal] = useState<{
    isOpen: boolean;
    title: string;
    items: EvidenceItem[];
    conflictDetected?: boolean;
    conflictDetails?: any;
  }>({
    isOpen: false,
    title: '',
    items: []
  });

  // Fetch initial marine state on mount
  useEffect(() => {
    const fetchMarineState = async () => {
      try {
        const res = await fetch(`/api/marine-state?lat=${fisherLocation.lat}&lng=${fisherLocation.lng}`);
        if (res.ok) {
          const data = await res.json();
          if (data.oceanState) setOceanState(data.oceanState);
          if (data.warnings) setWarnings(data.warnings);
          if (data.pfzZones) setPfzZones(data.pfzZones);
          if (data.boundaries) setBoundaries(data.boundaries);
          if (data.routes) {
            setRoutes(data.routes);
            setActiveRoute(data.routes[0]);
          }
          if (data.risk) setRisk(data.risk);
          if (data.activeTrip) setActiveTrip(data.activeTrip);
          if (data.tripsHistory) setTripsHistory(data.tripsHistory);
          if (data.observations) setObservations(data.observations);
          if (data.connectors) setConnectors(data.connectors);
        }
      } catch (err) {
        console.error('Failed to load initial marine data:', err);
      }
    };

    fetchMarineState();
  }, []);

  // Listen to Server-Sent Events (SSE) for real-time marine alerts
  useEffect(() => {
    let evtSource: EventSource | null = null;
    try {
      evtSource = new EventSource('/api/stream/events');
      evtSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'WEATHER_TICK' && payload.oceanState) {
            setOceanState((prev) => ({ ...prev, ...payload.oceanState }));
          }
        } catch {
          // ignore parsing error
        }
      };
    } catch {
      // ignore sse errors
    }

    return () => {
      if (evtSource) evtSource.close();
    };
  }, []);

  // Handlers
  const handleStartTrip = async () => {
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boatName: 'Annai Velankanni (IND-TN-10-MM-442)',
          fisherName: 'Murugan K.',
          targetZone: 'Gulf of Mannar Shelf Edge',
          homeHarbour: 'Rameswaram Fishing Jetty',
          estimatedFuelLitres: 5.2
        })
      });
      const data = await res.json();
      if (data.trip) {
        setActiveTrip(data.trip);
      }
    } catch {
      const mockTrip: TripSession = {
        id: `trip-${Date.now()}`,
        boatName: 'Annai Velankanni (IND-TN-10-MM-442)',
        boatType: 'FIBER_BOAT',
        fisherName: 'Murugan K.',
        homeHarbour: 'Rameswaram Fishing Jetty',
        startLocation: { lat: 9.2876, lng: 79.3129, name: 'Rameswaram Harbour' },
        targetZone: 'Gulf of Mannar Shelf Edge',
        startTime: new Date().toISOString(),
        durationMinutes: 0,
        fuelConsumedLitres: 0,
        distanceTraveledKm: 0,
        currentLat: 9.2876,
        currentLng: 79.3129,
        routeWaypoints: [[9.2876, 79.3129]],
        recordedObservations: 0,
        status: 'ACTIVE',
        alertsEncountered: [],
        maxRiskEncountered: 'LOW'
      };
      setActiveTrip(mockTrip);
    }
  };

  const handleEndTrip = async () => {
    if (!activeTrip) return;
    try {
      await fetch(`/api/trips/${activeTrip.id}/complete`, { method: 'POST' });
    } catch {
      // completed
    }
    const completedTrip: TripSession = {
      ...activeTrip,
      status: 'COMPLETED',
      endTime: new Date().toISOString(),
      distanceTraveledKm: 21.4,
      fuelConsumedLitres: 5.2
    };
    setTripsHistory((prev) => [completedTrip, ...prev]);
    setActiveTrip(null);
  };

  const handleOpenEvidence = (title?: string, items?: EvidenceItem[], conflict?: boolean, conflictDetails?: any) => {
    setEvidenceModal({
      isOpen: true,
      title: title || (language === 'ta' ? 'காரண ஆதார வரைபடம்' : 'Marine Decision Twin Evidence Graph'),
      items: items && items.length > 0 ? items : [
        {
          id: 'ev-1',
          parameter: 'Significant Wave Height',
          value: `${oceanState.significantWaveHeightM} meters`,
          source: 'INCOIS Coastal Ocean Forecast System',
          sourceUrl: 'https://incois.gov.in/portal/osf/osf.jsp',
          retrievedAt: oceanState.timestamp,
          observationTime: oceanState.timestamp,
          freshness: 'FRESH',
          confidence: 'HIGH',
          agent: 'INCOIS Ocean State Agent',
          relevance: 'Primary determinant of small-craft seaworthiness.'
        },
        {
          id: 'ev-2',
          parameter: 'Wind Speed & Direction',
          value: `${oceanState.windSpeedKts} kts (${oceanState.windDirectionText})`,
          source: 'IMD Marine & Coastal Weather Bulletin',
          sourceUrl: 'https://mausam.imd.gov.in',
          retrievedAt: oceanState.timestamp,
          observationTime: oceanState.timestamp,
          freshness: 'FRESH',
          confidence: 'HIGH',
          agent: 'IMD Coastal Weather Agent',
          relevance: 'Assesses squall and thermal gust risks.'
        },
        {
          id: 'ev-3',
          parameter: 'Potential Fishing Zone Front',
          value: 'Gulf of Mannar Shelf Edge (21.4 km)',
          source: 'INCOIS Oceansat-3 Marine Fishery Advisory',
          sourceUrl: 'https://incois.gov.in/portal/pfz/pfz.jsp',
          retrievedAt: oceanState.timestamp,
          observationTime: oceanState.timestamp,
          freshness: 'FRESH',
          confidence: 'HIGH',
          agent: 'PFZ Fishery Intelligence Agent',
          relevance: 'High pelagic chlorophyll-a and SST thermal gradient.'
        },
        {
          id: 'ev-4',
          parameter: 'IMBL Boundary Clearance',
          value: '8.5 km buffer to Indo-Sri Lanka maritime demarcation',
          source: 'Bhuvan ISRO Coastal Maritime Geofence',
          sourceUrl: 'https://bhuvan.nrsc.gov.in',
          retrievedAt: oceanState.timestamp,
          observationTime: oceanState.timestamp,
          freshness: 'FRESH',
          confidence: 'HIGH',
          agent: 'Regulation & Boundary Safety Agent',
          relevance: 'Exceeds mandatory 5km safety standoff line.'
        }
      ],
      conflictDetected: conflict,
      conflictDetails
    });
  };

  return (
    <div className={`min-h-screen font-sans antialiased selection:bg-cyan-500 selection:text-black ${
      highContrast ? 'bg-black text-yellow-300' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* 1. Universal Top Navigation Header */}
      <Header
        currentRole={role}
        onRoleChange={setRole}
        language={language}
        onLanguageToggle={() => setLanguage((prev) => (prev === 'en' ? 'ta' : 'en'))}
        isDemoMode={isDemoMode}
        onToggleDemoMode={() => setIsDemoMode((prev) => !prev)}
        lowBandwidth={lowBandwidth}
        onToggleLowBandwidth={() => setLowBandwidth((prev) => !prev)}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast((prev) => !prev)}
        onOpenSOS={() => setIsSOSOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        activeTrip={activeTrip}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Role View Switcher & Sub-Tab Navigation Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2 flex flex-wrap items-center justify-between gap-2 shadow-xl backdrop-blur-md">
          {/* Tabs for Fisher Role */}
          {role === 'FISHER' && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{language === 'ta' ? 'முதன்மை கட்டுப்பாட்டகம்' : 'Safety Cockpit'}</span>
              </button>

              <button
                onClick={() => setActiveTab('map')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'map'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <MapIcon className="w-4 h-4" />
                <span>{language === 'ta' ? 'கடல் வரைபடம்' : 'Marine Map'}</span>
              </button>

              <button
                onClick={() => setActiveTab('whatif')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'whatif'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>{language === 'ta' ? 'வாட்-இஃப் சோதனை' : 'What-If Sim'}</span>
              </button>

              <button
                onClick={() => setActiveTab('pfz')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'pfz'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Fish className="w-4 h-4" />
                <span>{language === 'ta' ? 'மீன்பிடி மண்டலங்கள்' : 'PFZ Zones'}</span>
              </button>

              <button
                onClick={() => setActiveTab('safety')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'safety'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{language === 'ta' ? 'பாதுகாப்பு மையம்' : 'Safety Center'}</span>
              </button>

              <button
                onClick={() => setActiveTab('route')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'route'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Navigation className="w-4 h-4" />
                <span>{language === 'ta' ? 'பாதை & எரிபொருள்' : 'Route & Fuel'}</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'chat'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>{language === 'ta' ? 'ஜல்திருஷ்டி AI' : 'Jaldrishti AI Chat'}</span>
              </button>

              <button
                onClick={() => setActiveTab('trip')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'trip'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>{language === 'ta' ? 'பயணக் கண்காணிப்பு' : 'Trip Tracker'}</span>
              </button>
            </div>
          )}

          {/* Sighting Crowdsource Quick Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsObservationsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold transition-colors"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>{language === 'ta' ? 'கள அவதானிப்புப் பதிவு' : 'Report Sea Sighting'}</span>
            </button>
          </div>
        </div>

        {/* ROLE BASED ROUTING */}
        {role === 'COASTAL_AUTHORITY' ? (
          <CoastalAuthorityView
            trips={tripsHistory.concat(activeTrip ? [activeTrip] : [])}
            observations={observations}
            boundaries={boundaries}
            language={language}
          />
        ) : role === 'RESEARCHER' ? (
          <ResearcherDashboard
            oceanState={oceanState}
            pfzZones={pfzZones}
            observations={observations}
            language={language}
          />
        ) : role === 'ADMIN' ? (
          <AdminConsole
            connectors={connectors}
            isDemoMode={isDemoMode}
            onToggleDemoMode={() => setIsDemoMode((prev) => !prev)}
            language={language}
          />
        ) : (
          /* FISHER ROLE INTERFACES */
          <div className="space-y-6">
            {/* Always visible interactive map on Map tab or as companion */}
            {activeTab === 'map' && (
              <div className="space-y-4">
                <MarineMap
                  oceanState={oceanState}
                  pfzZones={pfzZones}
                  boundaries={boundaries}
                  activeRoute={activeRoute}
                  routes={routes}
                  fisherLocation={fisherLocation}
                  language={language}
                  lowBandwidth={lowBandwidth}
                />
              </div>
            )}

            {/* Dashboard / Cockpit tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <FisherDashboard
                  oceanState={oceanState}
                  warnings={warnings}
                  pfzZones={pfzZones}
                  risk={risk}
                  activeTrip={activeTrip}
                  language={language}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onStartTrip={handleStartTrip}
                  onOpenSOS={() => setIsSOSOpen(true)}
                  onOpenEvidence={() => handleOpenEvidence()}
                />

                {/* Quick Map Preview below dashboard */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span className="font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                      <MapIcon className="w-4 h-4 text-cyan-400" />
                      <span>{language === 'ta' ? 'நேரடி கடல் வரைபடக் கண்ணோட்டம்' : 'Live Marine Map Radar'}</span>
                    </span>
                    <button
                      onClick={() => setActiveTab('map')}
                      className="text-cyan-400 hover:underline font-medium text-xs"
                    >
                      {language === 'ta' ? 'முழு வரைபடத்தைத் திறக்க' : 'Expand Full Map →'}
                    </button>
                  </div>
                  <MarineMap
                    oceanState={oceanState}
                    pfzZones={pfzZones}
                    boundaries={boundaries}
                    activeRoute={activeRoute}
                    routes={routes}
                    fisherLocation={fisherLocation}
                    language={language}
                    lowBandwidth={lowBandwidth}
                  />
                </div>
              </div>
            )}

            {/* What-If Simulator Tab */}
            {activeTab === 'whatif' && (
              <WhatIfSimulator
                language={language}
                onApplyScenario={(scenario) => {
                  // user applied scenario
                }}
              />
            )}

            {/* PFZ Explorer Tab */}
            {activeTab === 'pfz' && (
              <PFZExplorer
                pfzZones={pfzZones}
                language={language}
                onSelectZone={(zone) => {
                  // selected zone
                }}
                onPlanRouteToZone={(zone) => {
                  setActiveTab('route');
                }}
              />
            )}

            {/* Safety Center Tab */}
            {activeTab === 'safety' && (
              <SafetyCenter
                oceanState={oceanState}
                warnings={warnings}
                risk={risk}
                language={language}
                onOpenSOS={() => setIsSOSOpen(true)}
                onOpenEvidence={() => handleOpenEvidence()}
              />
            )}

            {/* Route Planner Tab */}
            {activeTab === 'route' && (
              <div className="space-y-6">
                <RoutePlanner
                  routes={routes}
                  activeRoute={activeRoute}
                  onSelectRoute={(r) => setActiveRoute(r)}
                  language={language}
                />
                <MarineMap
                  oceanState={oceanState}
                  pfzZones={pfzZones}
                  boundaries={boundaries}
                  activeRoute={activeRoute}
                  routes={routes}
                  fisherLocation={fisherLocation}
                  language={language}
                  lowBandwidth={lowBandwidth}
                />
              </div>
            )}

            {/* Chat Assistant Tab */}
            {activeTab === 'chat' && (
              <JaldrishtiChat
                language={language}
                fisherLocation={fisherLocation}
                onOpenEvidence={(title, items, conflict, conflictDetails) =>
                  handleOpenEvidence(title, items, conflict, conflictDetails)
                }
                onOpenWhatIf={() => setActiveTab('whatif')}
              />
            )}

            {/* Trip Tracker Tab */}
            {activeTab === 'trip' && (
              <TripTracker
                activeTrip={activeTrip}
                tripsHistory={tripsHistory}
                onStartTrip={handleStartTrip}
                onEndTrip={handleEndTrip}
                language={language}
              />
            )}
          </div>
        )}
      </main>

      {/* MODALS */}
      {/* 1. Evidence Graph Modal */}
      <EvidenceGraphModal
        isOpen={evidenceModal.isOpen}
        onClose={() => setEvidenceModal((prev) => ({ ...prev, isOpen: false }))}
        decisionTitle={evidenceModal.title}
        evidenceItems={evidenceModal.items}
        conflictDetected={evidenceModal.conflictDetected}
        conflictDetails={evidenceModal.conflictDetails}
        language={language}
      />

      {/* 2. Emergency SOS Modal */}
      <EmergencyModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        fisherLocation={fisherLocation}
        language={language}
      />

      {/* 3. Observations Modal */}
      <ObservationsModal
        isOpen={isObservationsOpen}
        onClose={() => setIsObservationsOpen(false)}
        fisherLocation={fisherLocation}
        language={language}
        onObservationAdded={(obs) => setObservations((prev) => [obs, ...prev])}
      />

      {/* 4. About SIH Problem Statement Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        language={language}
      />
    </div>
  );
}
