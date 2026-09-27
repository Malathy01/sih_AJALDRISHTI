import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Waves,
  Wind,
  Compass,
  AlertOctagon,
  Clock,
  ExternalLink,
  CheckCircle,
  HelpCircle,
  Activity
} from 'lucide-react';
import { OceanState, WeatherWarning, RiskBreakdown, Language } from '../types/marine';
import { t } from '../i18n/translations';

interface SafetyCenterProps {
  oceanState: OceanState;
  warnings: WeatherWarning[];
  risk: RiskBreakdown;
  language: Language;
  onOpenSOS: () => void;
  onOpenEvidence: () => void;
}

export const SafetyCenter: React.FC<SafetyCenterProps> = ({
  oceanState,
  warnings,
  risk,
  language,
  onOpenSOS,
  onOpenEvidence
}) => {
  const isSevere = warnings.some((w) => w.affectsVenturing) || risk.overallLevel === 'CRITICAL';

  return (
    <div className="space-y-6">
      {/* Primary Fishermen Warning Advisory Card */}
      <div
        className={`rounded-2xl p-6 border shadow-2xl space-y-4 ${
          isSevere
            ? 'bg-rose-950/90 border-rose-500 ring-2 ring-rose-500/40'
            : risk.overallLevel === 'HIGH'
            ? 'bg-orange-950/80 border-orange-500'
            : risk.overallLevel === 'MODERATE'
            ? 'bg-amber-950/70 border-amber-500'
            : 'bg-emerald-950/70 border-emerald-500/60'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-lg ${
                isSevere ? 'bg-rose-600 animate-pulse' : 'bg-slate-900 border border-slate-700'
              }`}
            >
              {isSevere ? <AlertOctagon className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6 text-emerald-400" />}
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider font-bold text-slate-300">
                {t('fishermenWarning', language)}
              </div>
              <h2 className="text-xl font-extrabold text-white">
                {isSevere
                  ? language === 'ta'
                    ? 'கடலுக்குள் செல்ல வேண்டாம் - அரசு எச்சரிக்கை'
                    : 'DO NOT VENTURE — Official Advisory Active'
                  : language === 'ta'
                  ? 'கடல் நிலை சீராக உள்ளது'
                  : 'Favorable Marine Sea State'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenEvidence}
              className="px-4 py-2 bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-cyan-300 rounded-xl text-xs font-bold transition-all shadow"
            >
              {language === 'ta' ? 'காரண ஆதாரம்' : 'View Safety Evidence'}
            </button>

            <button
              onClick={onOpenSOS}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-900/40 animate-pulse"
            >
              {t('emergencySOS', language)}
            </button>
          </div>
        </div>

        {/* Warning Bulletins List */}
        <div className="space-y-3 pt-2">
          {warnings.map((w) => (
            <div
              key={w.id}
              className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 text-xs space-y-2 text-slate-200"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                <span className="font-bold text-amber-300 text-sm">
                  {language === 'ta' ? w.titleTa : w.titleEn}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                  {w.source} Bulletin · Valid until: {new Date(w.validUntil).toLocaleString()}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {language === 'ta' ? w.descriptionTa : w.descriptionEn}
              </p>
              <div className="text-[11px] text-slate-400 flex flex-wrap gap-4 pt-1">
                <span>
                  Wind Gusts: <strong className="text-white font-mono">{w.windSpeedGustsKmph} km/h</strong>
                </span>
                <span>
                  Expected Waves: <strong className="text-white font-mono">{w.waveHeightMeters}m</strong>
                </span>
                <span>
                  Affected Sectors: <strong className="text-cyan-300">{w.affectedAreas.join(', ')}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Marine Hazard Gauges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wave Height Gauge */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-300">
              <Waves className="w-4 h-4 text-cyan-400" />
              <span>{language === 'ta' ? 'அலை உயரம்' : 'Wave Height'}</span>
            </span>
            <span className="font-mono text-cyan-400 text-xs">Threshold: 2.0m</span>
          </div>

          <div className="text-2xl font-bold font-mono text-white">
            {oceanState.significantWaveHeightM} <span className="text-xs font-normal text-slate-400">m</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${
                oceanState.significantWaveHeightM > 2.0
                  ? 'bg-rose-500'
                  : oceanState.significantWaveHeightM > 1.3
                  ? 'bg-amber-400'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (oceanState.significantWaveHeightM / 3.0) * 100)}%` }}
            ></div>
          </div>

          <div className="text-[11px] text-slate-400 flex justify-between">
            <span>Swell: {oceanState.swellHeightM}m</span>
            <span>Peak Period: {oceanState.peakWavePeriodSec}s</span>
          </div>
        </div>

        {/* Wind Speed Gauge */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-300">
              <Wind className="w-4 h-4 text-teal-400" />
              <span>{language === 'ta' ? 'காற்றின் வேகம்' : 'Wind Speed'}</span>
            </span>
            <span className="font-mono text-teal-400 text-xs">Threshold: 25 kts</span>
          </div>

          <div className="text-2xl font-bold font-mono text-white">
            {oceanState.windSpeedKts} <span className="text-xs font-normal text-slate-400">knots</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${
                oceanState.windSpeedKts > 25 ? 'bg-rose-500' : oceanState.windSpeedKts > 18 ? 'bg-amber-400' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (oceanState.windSpeedKts / 35) * 100)}%` }}
            ></div>
          </div>

          <div className="text-[11px] text-slate-400 flex justify-between">
            <span>Dir: {oceanState.windDirectionText}</span>
            <span>Angle: {oceanState.windDirectionDeg}°</span>
          </div>
        </div>

        {/* Surface Current */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-300">
              <Compass className="w-4 h-4 text-blue-400" />
              <span>{language === 'ta' ? 'நீரோட்டம்' : 'Surface Current'}</span>
            </span>
            <span className="font-mono text-blue-400 text-xs">0.42 m/s</span>
          </div>

          <div className="text-2xl font-bold font-mono text-white">
            {oceanState.currentSpeedMps} <span className="text-xs font-normal text-slate-400">m/s</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${Math.min(100, (oceanState.currentSpeedMps / 1.5) * 100)}%` }}
            ></div>
          </div>

          <div className="text-[11px] text-slate-400 flex justify-between">
            <span>Drift Dir: {oceanState.currentDirectionDeg}° SW</span>
            <span className="text-emerald-400">Eco-favorable</span>
          </div>
        </div>

        {/* IMBL Boundary Proximity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-rose-400">
              <ShieldAlert className="w-4 h-4" />
              <span>{language === 'ta' ? 'IMBL எல்லை இடைவெளி' : 'IMBL Buffer'}</span>
            </span>
            <span className="font-mono text-emerald-400 text-xs font-bold">Clear (8.5 km)</span>
          </div>

          <div className="text-2xl font-bold font-mono text-white">
            8.5 <span className="text-xs font-normal text-slate-400">km from line</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: '85%' }}></div>
          </div>

          <div className="text-[11px] text-slate-400 flex justify-between">
            <span>Buffer limit: 5.0 km</span>
            <span className="text-emerald-400 font-semibold">SAFE ZONE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
