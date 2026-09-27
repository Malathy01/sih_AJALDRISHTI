import React, { useState } from 'react';
import {
  Sliders,
  Clock,
  Waves,
  Wind,
  Fuel,
  Compass,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import { Language, RiskLevel } from '../types/marine';
import { t } from '../i18n/translations';

interface WhatIfSimulatorProps {
  language: Language;
  onApplyScenario?: (scenario: any) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  language,
  onApplyScenario
}) => {
  const [baseTime, setBaseTime] = useState('05:00');
  const [simulatedTime, setSimulatedTime] = useState('08:00');
  const [boatSpeed, setBoatSpeed] = useState(9);
  const [destination, setDestination] = useState('Gulf of Mannar Shelf Deep Edge (21.4 km)');
  const [simulating, setSimulating] = useState(false);

  // Compute dynamic scenario based on simulated time and speed
  const isLateMorning = simulatedTime >= '08:00' && simulatedTime < '13:00';
  const isAfternoon = simulatedTime >= '13:00';

  // Base 05:00 AM Scenario (Early Morning Calm)
  const baseScenario = {
    time: baseTime,
    waveM: 1.0,
    windKts: 12.0,
    swellM: 0.7,
    durationHours: Math.round((21.4 / (boatSpeed * 1.852)) * 10) / 10,
    fuelLitres: Math.round((21.4 / (boatSpeed * 1.852)) * 5.2 * 10) / 10,
    riskLevel: 'LOW' as RiskLevel,
    riskScore: 24,
    statusTextEn: 'Optimal calm sea conditions. Favorable thermal stability and low wind drag.',
    statusTextTa: 'அமைதியான கடல் சூழல். சாதகமான வெப்பநிலை மற்றும் குறைந்த காற்று உராய்வு.'
  };

  // Alternative Scenario calculation
  let altWaveM = 1.0;
  let altWindKts = 12.0;
  let altSwellM = 0.7;
  let altRiskScore = 24;
  let altRiskLevel: RiskLevel = 'LOW';
  let altWarningActive = false;

  if (isAfternoon) {
    altWaveM = 1.8;
    altWindKts = 22.5;
    altSwellM = 1.3;
    altRiskScore = 68;
    altRiskLevel = 'HIGH';
    altWarningActive = true;
  } else if (isLateMorning) {
    altWaveM = 1.45;
    altWindKts = 17.5;
    altSwellM = 1.0;
    altRiskScore = 48;
    altRiskLevel = 'MODERATE';
  }

  const waveResistanceFactor = 1 + (altWaveM - 1.0) * 0.35;
  const altDurationHours = Math.round((21.4 / (boatSpeed * 1.852)) * waveResistanceFactor * 10) / 10;
  const altFuelLitres = Math.round(altDurationHours * 5.2 * waveResistanceFactor * 10) / 10;

  const simulatedScenario = {
    time: simulatedTime,
    waveM: altWaveM,
    windKts: altWindKts,
    swellM: altSwellM,
    durationHours: altDurationHours,
    fuelLitres: altFuelLitres,
    riskLevel: altRiskLevel,
    riskScore: altRiskScore,
    warningActive: altWarningActive,
    statusTextEn: isAfternoon
      ? 'Strong onshore afternoon thermal gusts. Squally swell causes high chop and hazardous roll for small craft.'
      : isLateMorning
      ? 'Thermal sea-breeze develops. Choppy wave conditions with ~1.4L increased diesel consumption.'
      : 'Calm morning conditions prevail.'
  };

  // Delta calculations
  const waveDelta = Math.round((simulatedScenario.waveM - baseScenario.waveM) * 10) / 10;
  const windDelta = Math.round((simulatedScenario.windKts - baseScenario.windKts) * 10) / 10;
  const fuelDelta = Math.round((simulatedScenario.fuelLitres - baseScenario.fuelLitres) * 10) / 10;
  const riskDelta = simulatedScenario.riskScore - baseScenario.riskScore;

  const handleSimulateClick = () => {
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      if (onApplyScenario) {
        onApplyScenario({ baseScenario, simulatedScenario });
      }
    }, 400);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800/80 text-cyan-400">
              <Sliders className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-100">
              {language === 'ta' ? 'நேர மாற்றப் பரிசோதனை (What-If Twin Simulator)' : 'What-If Trip Simulator'}
            </h2>
            <span className="text-xs bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/60 font-semibold">
              SIH Novelty Feature
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'ta'
              ? 'புறப்படும் நேரம் அல்லது படகு வேகத்தை மாற்றி கடல் அலை, ஆபத்து மற்றும் எரிபொருள் மாற்றங்களை முன்கூட்டியே கணிக்கவும்.'
              : 'Simulate departure time and boat speed to compare sea conditions, risk evolution, and fuel consumption.'}
          </p>
        </div>

        <button
          onClick={handleSimulateClick}
          disabled={simulating}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-900/30 transition-all active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
          <span>{simulating ? 'Recomputing Twin...' : language === 'ta' ? 'மீண்டும் கணக்கிடு' : 'Recompute Twin Model'}</span>
        </button>
      </div>

      {/* Simulator Interactive Parameter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
        {/* Base Time vs Simulated Time */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'ta' ? 'மாற்று புறப்படும் நேரம்' : 'Simulated Departure Time'}</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {['04:00', '05:00', '08:00', '14:00'].map((timeStr) => (
              <button
                key={timeStr}
                onClick={() => setSimulatedTime(timeStr)}
                className={`py-1.5 px-2 rounded text-xs font-mono font-medium transition-all ${
                  simulatedTime === timeStr
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {timeStr}
              </button>
            ))}
          </div>
        </div>

        {/* Boat Speed Slider */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              <span>{language === 'ta' ? 'படகு வேகம்' : 'Boat Speed'}</span>
            </label>
            <span className="text-xs font-mono text-cyan-400 font-bold">{boatSpeed} knots</span>
          </div>
          <input
            type="range"
            min={6}
            max={14}
            step={1}
            value={boatSpeed}
            onChange={(e) => setBoatSpeed(Number(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-2"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>6 kts (Slow)</span>
            <span>9 kts (Standard)</span>
            <span>14 kts (Fast)</span>
          </div>
        </div>

        {/* Target Fishing Zone */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'ta' ? 'இலக்கு மீன்பிடி மண்டலம்' : 'Target Destination Zone'}</span>
          </label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 p-2 outline-none cursor-pointer"
          >
            <option value="Gulf of Mannar Shelf Deep Edge (21.4 km)">Gulf of Mannar Shelf Edge (21.4 km)</option>
            <option value="Mandapam South Pelagic Front (14.8 km)">Mandapam South Pelagic Front (14.8 km)</option>
            <option value="Palk Bay North East Trench (18.2 km)">Palk Bay North East Trench (18.2 km)</option>
          </select>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scenario A: 05:00 AM (Base) */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {language === 'ta' ? 'அசல் திட்டம் (காலை 05:00)' : 'Base Scenario (05:00 AM)'}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
              LOW RISK
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
              <div className="text-slate-400 text-[11px] flex items-center gap-1">
                <Waves className="w-3 h-3 text-cyan-400" />
                <span>{language === 'ta' ? 'அலை உயரம்' : 'Wave Height'}</span>
              </div>
              <div className="text-base font-bold text-white font-mono mt-0.5">{baseScenario.waveM} m</div>
              <div className="text-[10px] text-slate-500">Swell: {baseScenario.swellM}m</div>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
              <div className="text-slate-400 text-[11px] flex items-center gap-1">
                <Wind className="w-3 h-3 text-teal-400" />
                <span>{language === 'ta' ? 'காற்றின் வேகம்' : 'Wind Speed'}</span>
              </div>
              <div className="text-base font-bold text-white font-mono mt-0.5">{baseScenario.windKts} kts</div>
              <div className="text-[10px] text-slate-500">Gentle Breeze (ENE)</div>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
              <div className="text-slate-400 text-[11px] flex items-center gap-1">
                <Fuel className="w-3 h-3 text-amber-400" />
                <span>{language === 'ta' ? 'எரிபொருள்' : 'Est. Diesel'}</span>
              </div>
              <div className="text-base font-bold text-white font-mono mt-0.5">{baseScenario.fuelLitres} L</div>
              <div className="text-[10px] text-slate-500">Duration: {baseScenario.durationHours} hrs</div>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
              <div className="text-slate-400 text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{language === 'ta' ? 'ஆபத்து மதிப்பீடு' : 'Risk Index'}</span>
              </div>
              <div className="text-base font-bold text-emerald-300 font-mono mt-0.5">{baseScenario.riskScore}/100</div>
              <div className="text-[10px] text-emerald-400">Clear Sea Clearance</div>
            </div>
          </div>

          <p className="text-xs text-slate-400 italic bg-slate-900/40 p-2 rounded border border-slate-800/40">
            {language === 'ta' ? baseScenario.statusTextTa : baseScenario.statusTextEn}
          </p>
        </div>

        {/* Scenario B: Simulated Time (Alternative) */}
        <div className={`bg-slate-950 border rounded-xl p-4 space-y-3 relative overflow-hidden transition-colors ${
          simulatedScenario.riskLevel === 'HIGH'
            ? 'border-rose-500/50 ring-1 ring-rose-500/20'
            : simulatedScenario.riskLevel === 'MODERATE'
            ? 'border-amber-500/50'
            : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                simulatedScenario.riskLevel === 'HIGH'
                  ? 'bg-rose-500 animate-pulse'
                  : simulatedScenario.riskLevel === 'MODERATE'
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {language === 'ta' ? `மாற்று நேரம் (${simulatedScenario.time})` : `Alternative (${simulatedScenario.time})`}
              </h3>
            </div>

            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              simulatedScenario.riskLevel === 'HIGH'
                ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                : simulatedScenario.riskLevel === 'MODERATE'
                ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
            }`}>
              {simulatedScenario.riskLevel} RISK
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
              <div className="text-slate-400 text-[11px] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Waves className="w-3 h-3 text-cyan-400" />
                  <span>{language === 'ta' ? 'அலை உயரம்' : 'Wave Height'}</span>
                </span>
                {waveDelta > 0 && (
                  <span className="text-rose-400 font-mono text-[10px] flex items-center">
                    <TrendingUp className="w-2.5 h-2.5" /> +{waveDelta}m
                  </span>
                )}
              </div>
              <div className="text-base font-bold text-white font-mono mt-0.5">{simulatedScenario.waveM} m</div>
              <div className="text-[10px] text-slate-500">Swell: {simulatedScenario.swellM}m</div>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
              <div className="text-slate-400 text-[11px] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Wind className="w-3 h-3 text-teal-400" />
                  <span>{language === 'ta' ? 'காற்றின் வேகம்' : 'Wind Speed'}</span>
                </span>
                {windDelta > 0 && (
                  <span className="text-amber-400 font-mono text-[10px] flex items-center">
                    <TrendingUp className="w-2.5 h-2.5" /> +{windDelta} kts
                  </span>
                )}
              </div>
              <div className="text-base font-bold text-white font-mono mt-0.5">{simulatedScenario.windKts} kts</div>
              <div className="text-[10px] text-slate-500">Choppy afternoon wind</div>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
              <div className="text-slate-400 text-[11px] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Fuel className="w-3 h-3 text-amber-400" />
                  <span>{language === 'ta' ? 'எரிபொருள்' : 'Est. Diesel'}</span>
                </span>
                {fuelDelta > 0 && (
                  <span className="text-rose-400 font-mono text-[10px] flex items-center font-bold">
                    +{fuelDelta} L (+{Math.round((fuelDelta / baseScenario.fuelLitres) * 100)}%)
                  </span>
                )}
              </div>
              <div className="text-base font-bold text-white font-mono mt-0.5">{simulatedScenario.fuelLitres} L</div>
              <div className="text-[10px] text-slate-500">Duration: {simulatedScenario.durationHours} hrs</div>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
              <div className="text-slate-400 text-[11px] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>{language === 'ta' ? 'ஆபத்து மதிப்பீடு' : 'Risk Index'}</span>
                </span>
                {riskDelta > 0 && (
                  <span className="text-rose-400 font-mono text-[10px] font-bold">
                    +{riskDelta} pts
                  </span>
                )}
              </div>
              <div className={`text-base font-bold font-mono mt-0.5 ${
                simulatedScenario.riskScore > 60 ? 'text-rose-400' : 'text-amber-300'
              }`}>
                {simulatedScenario.riskScore}/100
              </div>
              <div className="text-[10px] text-slate-400">Diurnal Sea-Breeze Active</div>
            </div>
          </div>

          <p className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800/60">
            {simulatedScenario.statusTextEn}
          </p>
        </div>
      </div>

      {/* Decision Intelligence Synthesis Banner */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-blue-950/70 border border-cyan-500/30 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold text-cyan-200">
            {language === 'ta' ? 'ஜல்திருஷ்டி முடிவெடுக்கும் இரட்டை பரிந்துரை' : 'Jaldrishti Marine Twin Recommendation'}
          </div>
          <p className="text-slate-300">
            {language === 'ta'
              ? `காலை ${baseScenario.time} மணிக்கு புறப்படுவது ${simulatedScenario.time} மணியை விட ${Math.abs(riskDelta)} புள்ளிகள் குறைவான ஆபத்தைக் கொண்டுள்ளது. மேலும் அலை எதிர்ப்பு குறைவு காரணமாக ~${fuelDelta} லிட்டர் டீசலைச் சேமிக்க முடியும்.`
              : `Departing at ${baseScenario.time} AM presents a ${Math.abs(riskDelta)} point lower risk index and avoids wave impedance, saving approximately ~${fuelDelta}L of diesel compared to ${simulatedScenario.time}.`}
          </p>
        </div>
      </div>
    </div>
  );
};
