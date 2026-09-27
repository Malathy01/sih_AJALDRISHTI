import React from 'react';
import {
  ShieldAlert,
  Radio,
  MapPin,
  Compass,
  AlertTriangle,
  Users,
  Eye,
  CheckCircle2,
  BellRing
} from 'lucide-react';
import { TripSession, UserObservation, Language, MarineBoundary } from '../types/marine';
import { t } from '../i18n/translations';

interface CoastalAuthorityViewProps {
  trips: TripSession[];
  observations: UserObservation[];
  boundaries: MarineBoundary[];
  language: Language;
}

export const CoastalAuthorityView: React.FC<CoastalAuthorityViewProps> = ({
  trips,
  observations,
  boundaries,
  language
}) => {
  return (
    <div className="space-y-6">
      {/* Authority Command Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {language === 'ta' ? 'கடலோரக் காவல் & மீன்வளத்துறை கண்காணிப்பு மையம்' : 'Coastal Authority Maritime Operations Console'}
            </h2>
            <p className="text-xs text-slate-400">
              Department of Fisheries, Government of Tamil Nadu & Indian Coast Guard Liaison
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800/80 text-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-pulse">
            <Radio className="w-3.5 h-3.5" />
            <span>RADAR & VHF Live Feed</span>
          </span>
        </div>
      </div>

      {/* Fleet Telemetry & Incident Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-slate-400 text-[11px] block">Active Fleet Vessels</span>
          <span className="text-2xl font-bold font-mono text-white mt-1 block">18 Craft</span>
          <span className="text-emerald-400 text-[10px]">All in verified sectors</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-slate-400 text-[11px] block">IMBL Buffer Violations</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">0 Active</span>
          <span className="text-slate-400 text-[10px]">Safe &gt; 5km clearance</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-slate-400 text-[11px] block">Active Safety Advisories</span>
          <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">1 Advisory</span>
          <span className="text-amber-400/90 text-[10px]">Squall in afternoon</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-slate-400 text-[11px] block">Crowdsourced Sighting Reports</span>
          <span className="text-2xl font-bold font-mono text-cyan-400 mt-1 block">{observations.length} Logged</span>
          <span className="text-cyan-400 text-[10px]">Fish & sea conditions</span>
        </div>
      </div>

      {/* Vessel Tracking List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Users className="w-4 h-4 text-blue-400" />
          <span>Active Vessel Manifest & Telemetry</span>
        </h3>

        <div className="space-y-3">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <strong className="text-white text-sm">{trip.boatName}</strong>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Skipper: {trip.fisherName} · Registered Harbour: {trip.homeHarbour}
                </div>
              </div>

              <div className="flex items-center gap-4 font-mono text-[11px]">
                <div>
                  Lat/Lng: <span className="text-cyan-400">9.28°N, 79.31°E</span>
                </div>
                <div>
                  IMBL Dist: <span className="text-emerald-400 font-bold">8.5 km</span>
                </div>
                <div>
                  Status: <span className="text-white font-bold">{trip.status}</span>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-semibold text-[11px]">
                VHF Ch 16 Connected
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
