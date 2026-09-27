import React from 'react';
import {
  ShieldAlert,
  Radio,
  Eye,
  Activity,
  Languages,
  UserCheck,
  AlertTriangle,
  Compass,
  Zap,
  Info
} from 'lucide-react';
import { UserRole, Language } from '../types/marine';
import { t } from '../i18n/translations';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  language: Language;
  onLanguageToggle: () => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  lowBandwidth: boolean;
  onToggleLowBandwidth: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  onOpenSOS: () => void;
  onOpenAbout: () => void;
  activeTrip: any;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  language,
  onLanguageToggle,
  isDemoMode,
  onToggleDemoMode,
  lowBandwidth,
  onToggleLowBandwidth,
  highContrast,
  onToggleHighContrast,
  onOpenSOS,
  onOpenAbout,
  activeTrip
}) => {
  return (
    <header className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors ${
      highContrast 
        ? 'bg-black border-yellow-400 text-yellow-300' 
        : 'bg-slate-950/90 border-slate-800 text-slate-100'
    }`}>
      {/* Top Banner: Emergency & Problem Statement Info */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 px-4 py-1.5 border-b border-cyan-900/40 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-cyan-300">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="font-semibold tracking-wide uppercase">SIH 2026 Problem ID: 26176</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">ORCA Marine Reasoning Twin</span>
          <span className="text-slate-500">·</span>
          <span className="text-cyan-400/90 font-medium">Team: Sona Ignitors</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Trip Indicator */}
          {activeTrip && (
            <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 rounded text-emerald-300 text-[11px] animate-pulse">
              <Compass className="w-3 h-3 text-emerald-400" />
              <span>{language === 'ta' ? 'பயணம் இயங்குகிறது' : 'Trip in Progress'}: {activeTrip.boatName}</span>
            </div>
          )}

          {/* Mode Badges */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleDemoMode}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                isDemoMode
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                  : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
              }`}
              title="Toggle Live vs Deterministic Demo Mode"
            >
              {isDemoMode ? 'DEMO SIMULATION' : 'LIVE CONNECTORS'}
            </button>

            <button
              onClick={onToggleLowBandwidth}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                lowBandwidth
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Low-Bandwidth Mode for 2G/3G sea connectivity"
            >
              {lowBandwidth ? '2G Low-Data ON' : 'Standard Bandwidth'}
            </button>

            <button
              onClick={onToggleHighContrast}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                highContrast
                  ? 'bg-yellow-400 text-black font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="High-Contrast mode for bright daylight on water"
            >
              <Eye className="w-3 h-3 inline mr-1" />
              {highContrast ? 'Sunlight Mode' : 'Normal'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>{language === 'ta' ? 'ஜல்திருஷ்டி' : 'JALDRISHTI'}</span>
                <span className="text-xs font-normal text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/60">
                  v2.6 Marine Twin
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 line-clamp-1">
              {language === 'ta'
                ? 'ஆபத்தை அறி! மீன்வளம் காண்! விவேகமாய் முடிவெடு! பாதுகாப்பாய் திரும்பு!'
                : 'Detect Risk · Discover Fish · Decide Smarter · Return Safely'}
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3">
          {/* Role selector dropdown */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400 ml-1.5" />
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-xs text-slate-200 py-1 pr-2 outline-none cursor-pointer font-medium"
            >
              <option value="FISHER" className="bg-slate-900 text-slate-100">{t('roleFisher', language)}</option>
              <option value="COASTAL_AUTHORITY" className="bg-slate-900 text-slate-100">{t('roleAuthority', language)}</option>
              <option value="RESEARCHER" className="bg-slate-900 text-slate-100">{t('roleResearcher', language)}</option>
              <option value="ADMIN" className="bg-slate-900 text-slate-100">{t('roleAdmin', language)}</option>
            </select>
          </div>

          {/* Language toggle: தமிழ் / English */}
          <button
            onClick={onLanguageToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-xs font-semibold text-cyan-300 transition-all shadow-sm"
            title="Toggle Tamil / English language"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>

          {/* About / Architecture Button */}
          <button
            onClick={onOpenAbout}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'ta' ? 'நோக்கம் & SDG' : 'About & SDG'}</span>
          </button>

          {/* Emergency SOS Button */}
          <button
            onClick={onOpenSOS}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold transition-all shadow-lg shadow-rose-900/40 ring-1 ring-rose-400/50 animate-pulse"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{t('emergencySOS', language)}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
