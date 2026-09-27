import React from 'react';
import {
  Database,
  Download,
  TrendingUp,
  Activity,
  Layers,
  Thermometer,
  Waves,
  Fish,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { OceanState, PFZAdvisory, UserObservation, Language } from '../types/marine';

interface ResearcherDashboardProps {
  oceanState: OceanState;
  pfzZones: PFZAdvisory[];
  observations: UserObservation[];
  language: Language;
}

export const ResearcherDashboard: React.FC<ResearcherDashboardProps> = ({
  oceanState,
  pfzZones,
  observations,
  language
}) => {
  const handleExportJSON = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      oceanState,
      pfzZones,
      observations,
      metadata: {
        system: 'JALDRISHTI Marine Decision Twin',
        problemStatement: 'SIH 2026 Problem ID: 26176',
        team: 'Sona Ignitors'
      }
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jaldrishti_marine_research_data_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header with Export Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {language === 'ta' ? 'கடல்சார் ஆராய்ச்சி & சுற்றுச்சூழல் தரவு மையம்' : 'Marine Science & Ecosystem Research Console'}
            </h2>
            <p className="text-xs text-slate-400">
              INCOIS Ocean State Timeseries, Chlorophyll-a Satellites & Biodiversity Correlator
            </p>
          </div>
        </div>

        <button
          onClick={handleExportJSON}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-900/40"
        >
          <Download className="w-4 h-4" />
          <span>Export Research JSON</span>
        </button>
      </div>

      {/* Oceanographic Trends Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-amber-400" />
              <span>SST Front Dynamics</span>
            </span>
            <span className="font-mono text-emerald-400">28.4°C Mean</span>
          </div>
          <div className="h-24 bg-slate-950 rounded-lg border border-slate-800 p-2 flex items-end justify-between gap-1 text-[10px] text-slate-500 font-mono">
            {[27.8, 28.0, 28.1, 28.4, 28.5, 28.4, 28.2].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-amber-500/70 rounded-t"
                  style={{ height: `${(v - 27) * 45}px` }}
                ></div>
                <span>D{i + 1}</span>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-slate-400">
            INSAT-3DR thermal gradient: +0.8°C oceanic thermal front active.
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Fish className="w-4 h-4 text-emerald-400" />
              <span>Chlorophyll-a Plankton Index</span>
            </span>
            <span className="font-mono text-emerald-400">0.85 mg/m³</span>
          </div>
          <div className="h-24 bg-slate-950 rounded-lg border border-slate-800 p-2 flex items-end justify-between gap-1 text-[10px] text-slate-500 font-mono">
            {[0.62, 0.71, 0.79, 0.85, 0.82, 0.86, 0.85].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-emerald-500/70 rounded-t"
                  style={{ height: `${v * 80}px` }}
                ></div>
                <span>D{i + 1}</span>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-slate-400">
            Oceansat-3 Ocean Color Monitor shows favorable pelagic aggregation.
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Waves className="w-4 h-4 text-cyan-400" />
              <span>Wave Energy Spectrum</span>
            </span>
            <span className="font-mono text-cyan-400">1.1m (7.2s)</span>
          </div>
          <div className="h-24 bg-slate-950 rounded-lg border border-slate-800 p-2 flex items-end justify-between gap-1 text-[10px] text-slate-500 font-mono">
            {[0.9, 1.0, 1.1, 1.1, 1.2, 1.1, 1.0].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-cyan-500/70 rounded-t"
                  style={{ height: `${v * 50}px` }}
                ></div>
                <span>D{i + 1}</span>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-slate-400">
            INCOIS SWAN wave model predicts low swell surge in Gulf of Mannar trench.
          </div>
        </div>
      </div>
    </div>
  );
};
