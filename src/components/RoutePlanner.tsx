import React, { useState } from 'react';
import {
  Navigation,
  Fuel,
  Clock,
  ShieldCheck,
  Compass,
  ArrowRight,
  TrendingDown,
  AlertTriangle,
  Check,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { MarineRoute, Language } from '../types/marine';
import { t } from '../i18n/translations';

interface RoutePlannerProps {
  routes: MarineRoute[];
  activeRoute: MarineRoute | null;
  onSelectRoute: (route: MarineRoute) => void;
  language: Language;
}

export const RoutePlanner: React.FC<RoutePlannerProps> = ({
  routes,
  activeRoute,
  onSelectRoute,
  language
}) => {
  const [startPoint, setStartPoint] = useState('Rameswaram Fishing Jetty (9.28°N, 79.31°E)');
  const [destPoint, setDestPoint] = useState('Gulf of Mannar Shelf Deep Edge PFZ (9.12°N, 79.45°E)');
  const [speedKnots, setSpeedKnots] = useState(9);

  return (
    <div className="space-y-6">
      {/* Route Parameters Selection Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-950 border border-blue-800/80 text-blue-400">
              <Navigation className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{language === 'ta' ? 'பாதை மற்றும் எரிபொருள் திட்டமிடல்' : 'Multi-Criteria Marine Route Planner'}</span>
                <span className="text-[10px] font-bold bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800/60">
                  Risk & Current Aware
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'ta'
                  ? 'வேகமான, குறைந்த ஆபத்துள்ள மற்றும் எரிபொருள் சேமிக்கும் 3 மாற்றுப் பாதைகள்'
                  : 'Compare 3 distinct routes: Fastest direct transit, Lower-Risk avoidance, and Fuel-Aware eco path'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'ta' ? 'தொடக்கத் தளம்' : 'Departure Harbour'}
            </label>
            <select
              value={startPoint}
              onChange={(e) => setStartPoint(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-200 outline-none"
            >
              <option value="Rameswaram Fishing Jetty (9.28°N, 79.31°E)">Rameswaram Fishing Jetty</option>
              <option value="Pamban Port (9.27°N, 79.21°E)">Pamban Port</option>
              <option value="Mandapam Marine Centre (9.27°N, 79.13°E)">Mandapam Marine Centre</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'ta' ? 'இலக்கு மீன்பிடி மண்டலம்' : 'Destination Target'}
            </label>
            <select
              value={destPoint}
              onChange={(e) => setDestPoint(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-200 outline-none"
            >
              <option value="Gulf of Mannar Shelf Deep Edge PFZ (9.12°N, 79.45°E)">Gulf of Mannar Shelf Deep Edge (21.4 km)</option>
              <option value="Mandapam South Pelagic Front (9.18°N, 79.24°E)">Mandapam South Pelagic Front (14.8 km)</option>
              <option value="Palk Bay North East Trench (9.42°N, 79.38°E)">Palk Bay North East Trench (18.2 km)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'ta' ? 'படகு வேகம்' : 'Cruising Speed (knots)'}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={6}
                max={14}
                value={speedKnots}
                onChange={(e) => setSpeedKnots(Number(e.target.value))}
                className="w-full accent-blue-400 cursor-pointer h-2"
              />
              <span className="font-mono text-cyan-400 font-bold text-xs shrink-0">{speedKnots} kts</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Distinct Route Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {routes.map((route) => {
          const isSelected = activeRoute?.id === route.id;
          const isEco = route.type === 'FUEL_EFFICIENT';
          const isSafe = route.type === 'LOWER_RISK';

          return (
            <div
              key={route.id}
              onClick={() => onSelectRoute(route)}
              className={`rounded-2xl p-5 border transition-all cursor-pointer relative space-y-4 ${
                isSelected
                  ? 'bg-slate-900 border-blue-500 ring-2 ring-blue-500/40 shadow-xl'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                    isSafe
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                      : isEco
                      ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                  }`}
                >
                  {route.type.replace('_', ' ')}
                </span>

                {isSelected && (
                  <span className="flex items-center gap-1 text-xs text-blue-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Selected</span>
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">{route.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {language === 'ta' ? route.descriptionTa : route.descriptionEn}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] block">Distance:</span>
                  <span className="text-white font-bold">{route.distanceKm} km</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Est. Duration:</span>
                  <span className="text-white font-bold">{route.estimatedDurationHours} hrs</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Est. Diesel:</span>
                  <span className="text-amber-400 font-bold">{route.estimatedFuelLitres} Litres</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">IMBL Buffer:</span>
                  <span className="text-emerald-400 font-bold">{route.closestBoundaryDistanceKm} km</span>
                </div>
              </div>

              {isEco && route.favorableCurrentSavingsLitres > 0 && (
                <div className="text-[11px] text-emerald-300 bg-emerald-950/60 p-2 rounded-lg border border-emerald-800/50 flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saves ~{route.favorableCurrentSavingsLitres}L diesel by aligning with longshore drift!</span>
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRoute(route);
                }}
                className={`w-full py-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{isSelected ? 'Active Route Selected' : 'Select This Route'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
