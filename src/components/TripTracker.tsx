import React, { useState, useEffect } from 'react';
import {
  Compass,
  Play,
  Square,
  Pause,
  Clock,
  Fuel,
  Navigation,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Layers,
  Fish,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Plus,
  Radio,
  RotateCcw
} from 'lucide-react';
import { TripSession, Language } from '../types/marine';
import { t } from '../i18n/translations';

interface TripTrackerProps {
  activeTrip: TripSession | null;
  tripsHistory: TripSession[];
  onStartTrip: () => void;
  onEndTrip: () => void;
  language: Language;
}

interface CatchLogEntry {
  id: string;
  speciesEn: string;
  speciesTa: string;
  weightKg: number;
  ratePerKg: number;
  gearUsed: string;
  timestamp: string;
}

export const TripTracker: React.FC<TripTrackerProps> = ({
  activeTrip,
  tripsHistory,
  onStartTrip,
  onEndTrip,
  language
}) => {
  // Live Voyage Simulation State
  const [simRunning, setSimRunning] = useState(false);
  const [simProgressPct, setSimProgressPct] = useState(25); // percentage along route
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 5x, 10x

  // Catch Logs
  const [catchLogs, setCatchLogs] = useState<CatchLogEntry[]>([
    {
      id: 'catch-01',
      speciesEn: 'Seer Fish (King Mackerel)',
      speciesTa: 'வஞ்சிரம் (King Mackerel)',
      weightKg: 65,
      ratePerKg: 650,
      gearUsed: 'Drift Gillnet',
      timestamp: '06:45 AM'
    },
    {
      id: 'catch-02',
      speciesEn: 'Yellowfin Tuna',
      speciesTa: 'சூரை மீன் (Yellowfin Tuna)',
      weightKg: 40,
      ratePerKg: 280,
      gearUsed: 'Troll Line',
      timestamp: '07:20 AM'
    }
  ]);

  // Form for adding catch
  const [showAddCatch, setShowAddCatch] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState('Seer Fish');
  const [catchKg, setCatchKg] = useState(30);

  // Market wholesale price reference (Mandapam & Rameswaram Harbor)
  const speciesPriceMap: Record<string, { en: string; ta: string; rate: number }> = {
    'Seer Fish': { en: 'Seer Fish (King Mackerel)', ta: 'வஞ்சிரம்', rate: 650 },
    'Yellowfin Tuna': { en: 'Yellowfin Tuna', ta: 'சூரை', rate: 280 },
    'Indian Mackerel': { en: 'Indian Mackerel', ta: 'அயலை', rate: 160 },
    'Blue Crab': { en: 'Blue Swimmer Crab', ta: 'நீல நண்டு', rate: 380 },
    'Squid': { en: 'Cuttlefish / Squid', ta: 'கணவாய்', rate: 320 }
  };

  // Automated Simulation Loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (simRunning) {
      timer = setInterval(() => {
        setSimProgressPct((prev) => {
          if (prev >= 100) {
            setSimRunning(false);
            return 100;
          }
          return Math.min(100, prev + 1 * simSpeed);
        });
      }, 600);
    }
    return () => clearInterval(timer);
  }, [simRunning, simSpeed]);

  // Dynamic calculations based on simulation progress
  const totalDistanceKm = 22.8;
  const currentDistanceKm = Math.round((totalDistanceKm * (simProgressPct / 100)) * 10) / 10;
  const fuelBurnLitres = Math.round((5.2 * (simProgressPct / 100)) * 10) / 10;
  const fuelCostInr = Math.round(fuelBurnLitres * 94.5); // ₹94.5 / litre diesel

  // Proximity to IMBL buffer decreases as boat approaches the eastern shelf edge
  const imblDistanceKm = Math.max(3.8, Math.round((14.0 - (simProgressPct / 100) * 8.5) * 10) / 10);
  const isNearIMBL = imblDistanceKm < 5.0;

  // Economic tally
  const totalCatchKg = catchLogs.reduce((sum, item) => sum + item.weightKg, 0);
  const grossCatchRevenueInr = catchLogs.reduce((sum, item) => sum + item.weightKg * item.ratePerKg, 0);
  const netTripProfitInr = grossCatchRevenueInr - fuelCostInr;

  const handleAddCatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const info = speciesPriceMap[selectedSpecies] || { en: selectedSpecies, ta: selectedSpecies, rate: 250 };
    const newEntry: CatchLogEntry = {
      id: `catch-${Date.now()}`,
      speciesEn: info.en,
      speciesTa: info.ta,
      weightKg: Number(catchKg),
      ratePerKg: info.rate,
      gearUsed: 'Eco Longline',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setCatchLogs([newEntry, ...catchLogs]);
    setShowAddCatch(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. ACTIVE VOYAGE COCKPIT & LIVE DIGITAL TWIN CONTROLS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                activeTrip ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  {language === 'ta' ? 'நேரலை பயண இரட்டை (Voyage Digital Twin)' : 'Active Voyage Digital Twin'}
                </h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                  simRunning ? 'bg-cyan-500 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-300'
                }`}>
                  {simRunning ? 'LIVE NAVIGATION' : 'STANDBY'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeTrip
                  ? `Vessel: ${activeTrip.boatName} (IND-TN-10-MM-442) · Target: Mandapam South Pelagic Front`
                  : 'Annai Velankanni (IND-TN-10-MM-442) · Rameswaram Fishing Jetty'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Voyage Simulation controls */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center gap-1 text-xs">
              <button
                onClick={() => setSimRunning(!simRunning)}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  simRunning
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-900/40'
                }`}
              >
                {simRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{simRunning ? 'Pause Sim' : 'Simulate Run'}</span>
              </button>

              <button
                onClick={() => {
                  setSimProgressPct(0);
                  setSimRunning(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Reset Simulation to Port"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-0.5 pl-1 font-mono text-[11px] text-slate-400">
                {[1, 5, 10].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSimSpeed(s)}
                    className={`px-1.5 py-0.5 rounded ${
                      simSpeed === s ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Trip Start / End Button */}
            {activeTrip ? (
              <button
                onClick={onEndTrip}
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-900/40 transition-all active:scale-95"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>{language === 'ta' ? 'பயணத்தை நிறைவு செய்' : 'End Voyage'}</span>
              </button>
            ) : (
              <button
                onClick={onStartTrip}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/40 transition-all active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{language === 'ta' ? 'பயணம் தொடங்கு' : 'Start Voyage'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Simulation Progress & Dynamic Gauges */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span>Route Progress: <strong>{currentDistanceKm} km</strong> / {totalDistanceKm} km ({simProgressPct}%)</span>
            </span>
            <span className="font-mono text-cyan-400">ETA: {simProgressPct === 100 ? 'At PFZ Zone' : '45 mins remaining'}</span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-lg shadow-cyan-500/20"
              style={{ width: `${simProgressPct}%` }}
            />
          </div>

          {/* 4 Live Digital Twin Status Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">GPS Latitude / Longitude:</span>
              <span className="text-white font-mono font-bold text-xs">
                {(9.2876 - (simProgressPct / 100) * 0.163).toFixed(4)}°N, {(79.3129 + (simProgressPct / 100) * 0.145).toFixed(4)}°E
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Live Fuel Consumed:</span>
              <span className="text-amber-400 font-mono font-bold text-sm">
                {fuelBurnLitres} Litres <span className="text-[10px] text-slate-400">(₹{fuelCostInr})</span>
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Current Wave & Drift:</span>
              <span className="text-cyan-400 font-mono font-bold text-sm">
                1.1m <span className="text-[10px] text-slate-400">| +0.4m/s SW</span>
              </span>
            </div>

            <div className={`p-3 rounded-xl border transition-all ${
              isNearIMBL
                ? 'bg-red-950/80 border-red-500/80 text-red-200 animate-pulse'
                : 'bg-slate-950 border-slate-800 text-emerald-400'
            }`}>
              <span className="text-slate-400 text-[10px] block">IMBL Border Buffer:</span>
              <span className="font-mono font-bold text-sm">
                {imblDistanceKm} km {isNearIMBL ? '(⚠️ CLOSE BUFFER)' : '(SAFE)'}
              </span>
            </div>
          </div>

          {/* Proximity warning if near border */}
          {isNearIMBL && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-600/80 text-xs text-red-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>
                  {language === 'ta'
                    ? 'எச்சரிக்கை: நீங்கள் சர்வதேச கடல் எல்லைக்கு (IMBL) 5 கி.மீ எல்லைக்குள் உள்ளீர்கள்! உடனடியாக மேற்கு நோக்கி திருப்பவும்.'
                    : 'PROXIMITY RADAR: Vessel inside 5km buffer from Sri Lanka IMBL. Turn West immediately to avoid border transgression.'}
                </span>
              </div>
              <button
                onClick={() => setSimProgressPct(Math.max(0, simProgressPct - 15))}
                className="px-2.5 py-1 bg-red-800 hover:bg-red-700 text-white rounded font-bold text-[11px] shrink-0"
              >
                Steer Clear 2km
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. CATCH LOGBOOK & FISH MANDI ECONOMIC YIELD CALCULATOR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
              <Fish className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">
                {language === 'ta' ? 'பிடிபட்ட மீன் பதிவு & பொருளாதார மதிப்பீடு' : 'Catch Logbook & Wholesale Mandi Economics'}
              </h3>
              <p className="text-xs text-slate-400">
                Ground-truth PFZ validation & live auction revenue based on Mandapam / Rameswaram market rates
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddCatch(!showAddCatch)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-900/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddCatch ? 'Cancel' : language === 'ta' ? 'மீன் வரவைச் சேர்' : 'Log New Catch'}</span>
          </button>
        </div>

        {/* Catch Log Input Form */}
        {showAddCatch && (
          <form onSubmit={handleAddCatchSubmit} className="bg-slate-950 p-4 rounded-xl border border-emerald-800/60 space-y-3 text-xs animate-in fade-in duration-150">
            <div className="font-bold text-emerald-300">
              {language === 'ta' ? 'புதிய மீன் பிடிப்பு விவரம்:' : 'Record GPS Catch Observation:'}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Target Species:</label>
                <select
                  value={selectedSpecies}
                  onChange={(e) => setSelectedSpecies(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium outline-none"
                >
                  {Object.keys(speciesPriceMap).map((k) => (
                    <option key={k} value={k}>
                      {speciesPriceMap[k].en} ({speciesPriceMap[k].ta}) - ₹{speciesPriceMap[k].rate}/kg
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Quantity Caught (kg):</label>
                <input
                  type="number"
                  min={5}
                  max={800}
                  value={catchKg}
                  onChange={(e) => setCatchKg(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors shadow"
                >
                  Save to Logbook
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Mandi Financial Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px] block">Total Harvest Logged:</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{totalCatchKg} kg</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px] block">Gross Auction Value (INR):</span>
            <span className="text-xl font-bold font-mono text-cyan-300">₹{grossCatchRevenueInr.toLocaleString()}</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-900/60 text-xs">
            <span className="text-slate-400 text-[11px] block">Estimated Net Profit (Minus Fuel):</span>
            <span className="text-xl font-bold font-mono text-emerald-300">₹{netTripProfitInr.toLocaleString()}</span>
          </div>
        </div>

        {/* Catch Log Entries Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Species</th>
                <th className="py-2.5 px-3">Quantity</th>
                <th className="py-2.5 px-3">Mandi Rate</th>
                <th className="py-2.5 px-3">Est. Value</th>
                <th className="py-2.5 px-3">Gear</th>
                <th className="py-2.5 px-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
              {catchLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-sans font-medium text-white">
                    {language === 'ta' ? log.speciesTa : log.speciesEn}
                  </td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">{log.weightKg} kg</td>
                  <td className="py-2.5 px-3 text-slate-300">₹{log.ratePerKg}/kg</td>
                  <td className="py-2.5 px-3 text-cyan-300 font-bold">₹{(log.weightKg * log.ratePerKg).toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px]">{log.gearUsed}</td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. COMPLETED VOYAGES AUDIT TRAIL */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>{language === 'ta' ? 'முந்தைய பயணங்களின் பதிவு வரலாறு' : 'Historical Trips & Compliance Log'}</span>
        </h3>

        <div className="space-y-3">
          {tripsHistory.map((trip) => (
            <div
              key={trip.id}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2 font-bold text-slate-100">
                  <span>{trip.boatName}</span>
                  <span className="px-2 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-800/60 rounded text-[10px]">
                    100% COMPLIANT
                  </span>
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Route: {trip.homeHarbour} ➔ {trip.targetZone}
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-300 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[9px]">Distance:</span>
                  <strong>{trip.distanceTraveledKm} km</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">Diesel:</span>
                  <strong className="text-amber-400">{trip.fuelConsumedLitres} L</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">Duration:</span>
                  <strong>{Math.round((trip.durationMinutes || 420) / 60)} hrs</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
