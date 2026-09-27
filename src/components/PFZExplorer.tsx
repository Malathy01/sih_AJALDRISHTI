import React, { useState } from 'react';
import {
  Fish,
  Waves,
  Thermometer,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Compass,
  AlertCircle,
  MapPin,
  TrendingUp,
  Info
} from 'lucide-react';
import { PFZAdvisory, Language } from '../types/marine';
import { t } from '../i18n/translations';

interface PFZExplorerProps {
  pfzZones: PFZAdvisory[];
  language: Language;
  onSelectZone: (zone: PFZAdvisory) => void;
  onPlanRouteToZone: (zone: PFZAdvisory) => void;
}

export const PFZExplorer: React.FC<PFZExplorerProps> = ({
  pfzZones,
  language,
  onSelectZone,
  onPlanRouteToZone
}) => {
  const [selectedId, setSelectedId] = useState<string>(pfzZones[0]?.id || '');
  const activeZone = pfzZones.find((z) => z.id === selectedId) || pfzZones[0];

  return (
    <div className="space-y-6">
      {/* Header and Scientific Caveat */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-950 border border-emerald-800/80 text-emerald-400">
              <Fish className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{language === 'ta' ? 'சாத்தியமான மீன்பிடி மண்டல வழிகாட்டி (PFZ)' : 'Potential Fishing Zone (PFZ) Explorer'}</span>
                <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800/60">
                  INCOIS ADVISORY
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'ta'
                  ? 'இந்திய தேசிய கடல் தகவல் சேவைகள் மையத்தின் (INCOIS) அதிகாரப்பூர்வ செயற்கைக்கோள் கணிப்புகள்'
                  : 'Official Marine Fishery Advisories derived from Oceansat & INSAT satellite sensors'}
              </p>
            </div>
          </div>

          <a
            href="https://incois.gov.in/portal/pfz/pfz.jsp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold transition-colors"
          >
            <span>INCOIS Official Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Scientific Uncertainty Mandate Notice */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-900/60 flex items-start gap-3">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed space-y-0.5">
            <div className="font-bold text-emerald-300">
              {language === 'ta' ? 'அறிவியல் துல்லிய வழிகாட்டல்:' : 'Scientific Advisory Guidance:'}
            </div>
            <p>
              {language === 'ta'
                ? 'INCOIS PFZ தகவல்கள் செயற்கைக்கோள் கடல் மேற்பரப்பு வெப்பநிலை (SST) மற்றும் குளோரோபில்-ஏ அடிப்படையில் மீன்கள் கூட்டமாக வாழும் சாதகமான மண்டலங்களை மட்டுமே குறிக்கிறது. இது உறுதியான மீன்பிடிப்புக்கான உத்தரவாதம் அல்ல. பாதுகாப்பு வழிகாட்டுதல்கள் எப்போதும் முதன்மையானவை.'
                : 'INCOIS PFZ advisories identify biological oceanographic aggregation fronts using chlorophyll-a and sea surface temperature gradients. This represents high probability of pelagic fish aggregation, not an absolute guarantee of catch. Safety warnings always supersede fishing decisions.'}
            </p>
          </div>
        </div>
      </div>

      {/* Candidate Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pfzZones.map((zone) => {
          const isSelected = zone.id === selectedId;
          return (
            <div
              key={zone.id}
              onClick={() => {
                setSelectedId(zone.id);
                onSelectZone(zone);
              }}
              className={`rounded-xl p-4 border transition-all cursor-pointer relative space-y-3 ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500 ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-950/40'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  {zone.confidence} PROBABILITY
                </span>
                <span className="text-xs font-mono text-cyan-400 font-bold">{zone.distanceKm} km</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white line-clamp-1">{zone.zoneName}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span>
                    {zone.centerLat.toFixed(2)}°N, {zone.centerLng.toFixed(2)}°E · Depth {zone.depthMeters}m
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <div>
                  <span className="text-slate-400 text-[10px] block">SST Temp:</span>
                  <span className="text-amber-300 font-mono font-bold">{zone.sstCelsius}°C</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Chlorophyll-a:</span>
                  <span className="text-emerald-400 font-mono font-bold">{zone.chlorophyllMgM3} mg/m³</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block mb-1">
                  {language === 'ta' ? 'எதிர்பார்க்கப்படும் மீன் வகைகள்:' : 'Likely Pelagic Species:'}
                </span>
                <div className="flex flex-wrap gap-1">
                  {zone.recommendedSpecies.slice(0, 3).map((sp, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 border border-slate-700/60"
                    >
                      {sp}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlanRouteToZone(zone);
                }}
                className="w-full py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'இந்த மண்டலத்திற்கு பாதை காண்க' : 'Plan Route to this PFZ'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
