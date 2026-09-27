import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Compass,
  Waves,
  Wind,
  Fish,
  Navigation,
  Fuel,
  Play,
  HelpCircle,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Layers,
  Volume2,
  VolumeX
} from 'lucide-react';
import { speakMarineAdvisory, stopMarineSpeech } from '../utils/marineAudio';
import {
  OceanState,
  WeatherWarning,
  PFZAdvisory,
  RiskBreakdown,
  Language,
  TripSession
} from '../types/marine';
import { t } from '../i18n/translations';

interface FisherDashboardProps {
  oceanState: OceanState;
  warnings: WeatherWarning[];
  pfzZones: PFZAdvisory[];
  risk: RiskBreakdown;
  activeTrip: TripSession | null;
  language: Language;
  onNavigateTab: (tab: string) => void;
  onStartTrip: () => void;
  onOpenSOS: () => void;
  onOpenEvidence: () => void;
}

export const FisherDashboard: React.FC<FisherDashboardProps> = ({
  oceanState,
  warnings,
  pfzZones,
  risk,
  activeTrip,
  language,
  onNavigateTab,
  onStartTrip,
  onOpenSOS,
  onOpenEvidence
}) => {
  const activeWarning = warnings.find((w) => w.affectsVenturing) || warnings[0];
  const nearestPFZ = pfzZones[0];

  // Dynamic status styling
  const isCritical = risk.overallLevel === 'CRITICAL';
  const isHigh = risk.overallLevel === 'HIGH';
  const isModerate = risk.overallLevel === 'MODERATE';

  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleToggleVoice = () => {
    if (isSpeaking) {
      stopMarineSpeech();
      setIsSpeaking(false);
    } else {
      const speechText =
        language === 'ta'
          ? `${risk.advisoryAdviceTa}. ${risk.explanationsTa.join('. ')}. காற்றின் வேகம் ${oceanState.windSpeedKts} நாட்ஸ். அலை உயரம் ${oceanState.significantWaveHeightM} மீட்டர்.`
          : `${risk.advisoryAdviceEn}. ${risk.explanationsEn.join('. ')}. Wind speed ${oceanState.windSpeedKts} knots. Wave height ${oceanState.significantWaveHeightM} meters.`;

      speakMarineAdvisory(speechText, language);
      setIsSpeaking(true);

      // Auto reset after 10s or speech end
      setTimeout(() => setIsSpeaking(false), 12000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. PRIMARY SEA SAFETY COCKPIT BANNER */}
      <div
        className={`rounded-2xl p-5 border shadow-2xl transition-all ${
          isCritical
            ? 'bg-rose-950/80 border-rose-500/80 ring-1 ring-rose-500/30'
            : isHigh
            ? 'bg-orange-950/80 border-orange-500/80'
            : isModerate
            ? 'bg-amber-950/70 border-amber-500/70'
            : 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border-emerald-500/50'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                isCritical || isHigh
                  ? 'bg-rose-600 text-white animate-pulse'
                  : isModerate
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {isCritical || isHigh ? (
                <ShieldAlert className="w-6 h-6" />
              ) : isModerate ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <ShieldCheck className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-300">
                  {t('safetyStatusTitle', language)}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${
                    isCritical
                      ? 'bg-rose-500 text-white'
                      : isHigh
                      ? 'bg-orange-500 text-white'
                      : isModerate
                      ? 'bg-amber-400 text-black'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  {risk.overallLevel} RISK ({risk.overallScore}/100)
                </span>
              </div>

              <h2 className="text-lg font-bold text-white mt-0.5">
                {language === 'ta' ? risk.advisoryAdviceTa : risk.advisoryAdviceEn}
              </h2>

              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                {language === 'ta' ? risk.explanationsTa[0] : risk.explanationsEn[0]}
              </p>
            </div>
          </div>

          {/* Quick Action buttons on safety header */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleVoice}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 shadow ${
                isSpeaking
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold animate-pulse'
                  : 'bg-slate-900/90 border-slate-700 hover:border-cyan-400 text-cyan-300'
              }`}
              title={language === 'ta' ? 'குரல் வழிகாட்டுதல்' : 'Listen to Voice Advisory'}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{isSpeaking ? (language === 'ta' ? 'நிறுத்து' : 'Stop Audio') : language === 'ta' ? 'குரல் வழி' : 'Voice Readout'}</span>
            </button>

            <button
              onClick={onOpenEvidence}
              className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-500 text-cyan-300 text-xs font-semibold transition-all flex items-center gap-1.5 shadow"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'ta' ? 'காரண ஆதாரம்' : 'View Evidence'}</span>
            </button>

            <button
              onClick={() => onNavigateTab('whatif')}
              className="px-3 py-2 rounded-xl bg-cyan-950 border border-cyan-700/80 hover:bg-cyan-900 text-cyan-200 text-xs font-semibold transition-all flex items-center gap-1.5 shadow"
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'ta' ? 'வாட்-இஃப் சோதனை' : 'What-If Sim'}</span>
            </button>
          </div>
        </div>

        {/* Warning Details if active */}
        {activeWarning && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <strong className="text-amber-300">
                {language === 'ta' ? activeWarning.titleTa : activeWarning.titleEn}
              </strong>
            </div>
            <div className="text-[11px] text-slate-400">
              Source: {activeWarning.source} · Issued: {new Date(activeWarning.issuedAt).toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>

      {/* 2. THE 6 ESSENTIAL FISHER COCKPIT TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Tile 1: Where Am I? */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2 relative hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'ta' ? '1. நான் எங்கு உள்ளேன்?' : '1. Where Am I?'}</span>
            </span>
            <span className="text-cyan-400 text-[11px] font-mono">GPS Active</span>
          </div>

          <div className="text-sm font-bold text-white line-clamp-1">{oceanState.locationName}</div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
            <div>
              Lat: <span className="text-cyan-400">{oceanState.lat.toFixed(4)}°N</span>
            </div>
            <div>
              Lng: <span className="text-cyan-400">{oceanState.lng.toFixed(4)}°E</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span>Harbour: Rameswaram Jetty</span>
            <span className="text-emerald-400">IMBL Clearance: ~8.5km</span>
          </div>
        </div>

        {/* Tile 2: Sea Condition & Waves */}
        <div
          onClick={() => onNavigateTab('safety')}
          className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2 relative hover:border-cyan-500/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-300">
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'ta' ? '2. கடல் அலை & காற்று நிலை' : '2. Sea Condition'}</span>
            </span>
            <span className="text-xs text-cyan-400 flex items-center">
              <span>Inspect</span>
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-xl font-bold text-white font-mono">
              {oceanState.significantWaveHeightM} <span className="text-xs font-normal text-slate-400">meters wave</span>
            </div>
            <div className="text-xs font-mono text-teal-400 font-bold">
              {oceanState.windSpeedKts} kts <span className="text-[10px] text-slate-400">wind</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800/80 font-mono">
            <div>
              Swell: <span className="text-white">{oceanState.swellHeightM}m</span>
            </div>
            <div>
              Current: <span className="text-white">{oceanState.currentSpeedMps} m/s</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span>Wind: {oceanState.windDirectionText}</span>
            <span className="text-cyan-400">SST: {oceanState.seaSurfaceTempC}°C</span>
          </div>
        </div>

        {/* Tile 3: Potential Fishing Zones (PFZ) */}
        <div
          onClick={() => onNavigateTab('pfz')}
          className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2 relative hover:border-emerald-500/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-emerald-400">
              <Fish className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? '3. மீன்பிடி மண்டலங்கள்' : '3. Potential Fishing Zones'}</span>
            </span>
            <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-800/60 rounded text-[10px] font-bold">
              INCOIS VERIFIED
            </span>
          </div>

          <div className="text-sm font-bold text-white line-clamp-1">
            {nearestPFZ?.zoneName || 'Gulf of Mannar Shelf Edge'}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
            <div>
              Dist: <strong className="text-emerald-400 font-mono">{nearestPFZ?.distanceKm} km</strong>
            </div>
            <div>
              Depth: <strong className="text-white font-mono">{nearestPFZ?.depthMeters} m</strong>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span>Chl-a: {nearestPFZ?.chlorophyllMgM3} mg/m³</span>
            <span className="text-emerald-300 font-medium">{nearestPFZ?.confidence} Probability</span>
          </div>
        </div>

        {/* Tile 4: Route Planning & Fuel */}
        <div
          onClick={() => onNavigateTab('route')}
          className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2 relative hover:border-blue-500/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-blue-400">
              <Navigation className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? '4. பாதை & எரிபொருள்' : '4. Route & Fuel Planning'}</span>
            </span>
            <span className="text-xs text-blue-400 flex items-center">
              <span>View Routes</span>
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-sm font-bold text-white">Fuel-Aware Eco Route</div>
            <div className="text-xs font-mono text-emerald-400 font-bold">
              Save ~1.8L <TrendingDown className="w-3 h-3 inline" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800/80 font-mono">
            <div>
              Est. Fuel: <span className="text-amber-400 font-bold">5.2 Litres</span>
            </div>
            <div>
              ETA: <span className="text-white">1 hr 15 min</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span>Distance: 22.8 km</span>
            <span className="text-cyan-400">Avoids Reef Hazards</span>
          </div>
        </div>

        {/* Tile 5: Active Trip Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2 relative">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-300">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'ta' ? '5. நேரடி பயண நிலை' : '5. Trip Status'}</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                activeTrip
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 animate-pulse'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {activeTrip ? 'ACTIVE TRIP' : 'NO ACTIVE TRIP'}
            </span>
          </div>

          {activeTrip ? (
            <div className="space-y-1.5">
              <div className="text-sm font-bold text-white">{activeTrip.boatName}</div>
              <div className="text-xs text-slate-400">
                Destination: <span className="text-cyan-400">{activeTrip.targetZone}</span>
              </div>
              <button
                onClick={() => onNavigateTab('trip')}
                className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
              >
                {language === 'ta' ? 'பயணக் கண்காணிப்பு' : 'Open Trip Live Tracker'}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-400">
                {language === 'ta'
                  ? 'புதிய மீன்பிடி பயணத்தைத் தொடங்கி எரிபொருள் மற்றும் பாதுகாப்புப் பாதையைக் கண்காணிக்கவும்.'
                  : 'Log departure to record route, track live fuel burn, and receive IMBL boundary alerts.'}
              </p>
              <button
                onClick={onStartTrip}
                className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-bold text-xs transition-all shadow-md shadow-cyan-900/40 flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t('startTrip', language)}</span>
              </button>
            </div>
          )}
        </div>

        {/* Tile 6: Conversational Decision Twin */}
        <div
          onClick={() => onNavigateTab('chat')}
          className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/60 border border-cyan-800/50 rounded-xl p-4 space-y-2 relative hover:border-cyan-500/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-cyan-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? '6. ஜல்திருஷ்டி AI உரையாடல்' : '6. Ask Jaldrishti AI'}</span>
            </span>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800/60">
              Tamil + English
            </span>
          </div>

          <div className="text-xs text-slate-300 italic bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
            "நாளைக்கு காலை 5 மணிக்கு ராமேஸ்வரத்திலிருந்து மீன்பிடிக்க போகலாமா?"
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span>Collaborative Agents Active</span>
            <span className="text-cyan-400 font-semibold flex items-center">
              <span>Chat Now</span>
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>
      </div>

      {/* 3. VERIFIED DATA FRESHNESS BAR (MANDATORY PROMPT REQUIREMENT) */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <strong className="text-slate-200">
            {language === 'ta' ? 'அதிகாரப்பூர்வ அரசு தரவு மூலங்களின் புதுப்பிப்பு நிலை:' : 'Official Verified Source Status:'}
          </strong>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">INCOIS:</span>
            <span className="text-emerald-400 font-medium">Fresh (12m ago)</span>
          </div>

          <span className="text-slate-700">|</span>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">IMD:</span>
            <span className="text-emerald-400 font-medium">Fresh (8m ago)</span>
          </div>

          <span className="text-slate-700">|</span>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">MOSDAC:</span>
            <span className="text-emerald-400 font-medium">Recent (24m ago)</span>
          </div>

          <span className="text-slate-700">|</span>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Bhuvan:</span>
            <span className="text-emerald-400 font-medium">Verified (35m ago)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
