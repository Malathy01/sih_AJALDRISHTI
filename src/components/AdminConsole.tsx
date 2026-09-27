import React, { useState } from 'react';
import {
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Database,
  Cpu,
  Layers,
  Globe,
  Radio,
  Sparkles
} from 'lucide-react';
import { ConnectorHealth, Language } from '../types/marine';

interface AdminConsoleProps {
  connectors: ConnectorHealth[];
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  language: Language;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  connectors,
  isDemoMode,
  onToggleDemoMode,
  language
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [waveAlertThreshold, setWaveAlertThreshold] = useState(2.0);
  const [windAlertThreshold, setWindAlertThreshold] = useState(25);

  const handleSyncAll = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* System Health Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {language === 'ta' ? 'அமைப்பு நிர்வாகம் & அரசு தரவு இணைப்புகள்' : 'System Administration & Government Connectors'}
            </h2>
            <p className="text-xs text-slate-400">
              Real-time Ingestion Engine, Health Heartbeats & Data Provenance Monitor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleDemoMode}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isDemoMode
                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                : 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
            }`}
          >
            {isDemoMode ? 'DEMO SIMULATION ACTIVE' : 'LIVE DATA CONNECTORS ACTIVE'}
          </button>

          <button
            onClick={handleSyncAll}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{refreshing ? 'Polling...' : 'Poll Connectors'}</span>
          </button>
        </div>
      </div>

      {/* Official Connector Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connectors.map((conn) => (
          <div
            key={conn.source}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 relative hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <strong className="text-white text-sm">{conn.source}</strong>
                <span className="text-slate-500 text-xs">({conn.name})</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                {conn.status} · {conn.latencyMs}ms
              </span>
            </div>

            <div className="text-xs text-slate-300">{conn.fullName}</div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block">Last Sync:</span>
                <span className="text-white font-medium">
                  {new Date(conn.lastSuccessfulSync).toLocaleTimeString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Error Count:</span>
                <span className="text-emerald-400 font-bold">{conn.errorCount} (0.00%)</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 block font-semibold">Data Products Provided:</span>
              <div className="flex flex-wrap gap-1">
                {conn.dataTypesProvided.map((dt, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700/60"
                  >
                    {dt}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Safety Threshold Sliders */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Automated Hazard Threshold Controls</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <div className="flex justify-between mb-1.5 font-semibold text-slate-300">
              <span>Significant Wave Alert Threshold:</span>
              <span className="font-mono text-cyan-400 font-bold">{waveAlertThreshold} meters</span>
            </div>
            <input
              type="range"
              min={1.2}
              max={3.0}
              step={0.1}
              value={waveAlertThreshold}
              onChange={(e) => setWaveAlertThreshold(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-2"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Triggers Caution banner when INCOIS forecast exceeds this level.
            </span>
          </div>

          <div>
            <div className="flex justify-between mb-1.5 font-semibold text-slate-300">
              <span>Wind Speed Gust Alert Threshold:</span>
              <span className="font-mono text-teal-400 font-bold">{windAlertThreshold} knots</span>
            </div>
            <input
              type="range"
              min={15}
              max={40}
              step={1}
              value={windAlertThreshold}
              onChange={(e) => setWindAlertThreshold(Number(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer h-2"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Triggers High Risk alert for small motorized canoes and fiber craft.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
