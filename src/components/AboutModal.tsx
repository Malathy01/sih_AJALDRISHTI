import React from 'react';
import {
  Award,
  Globe,
  Shield,
  Layers,
  Sparkles,
  GitFork,
  X,
  CheckCircle2,
  Anchor,
  Compass
} from 'lucide-react';
import { Language } from '../types/marine';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-cyan-500/50 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-100 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>JALDRISHTI — Marine Decision Twin</span>
              </h2>
              <span className="text-[11px] font-bold text-cyan-400">
                SIH 2026 Problem ID: 26176 · Team: Sona Ignitors
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SIH Context & Novelty Points */}
        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Core Innovation & Problem Context</span>
            </h3>
            <p>
              Traditional marine apps display raw disconnected maps and bulletins. Fishermen must mentally fuse weather forecasts, INCOIS PFZ zones, international borders (IMBL), fuel burn, and wave dynamics under immense cognitive strain at sea.
            </p>
            <p className="text-cyan-300 font-semibold">
              JALDRISHTI transforms passive data into an active, collaborative Agentic Decision Twin that synthesizes, critiques, and explains marine actions in Tamil and English.
            </p>
          </div>

          {/* Key Differentiators Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-emerald-400 flex items-center gap-1.5">
                <GitFork className="w-4 h-4" />
                <span>Multi-Agent Swarm + Critic</span>
              </strong>
              <p className="text-[11px] text-slate-400">
                9 specialized agents (Ocean, Weather, PFZ, Boundary, Route, etc.) reconciled by a Critic Agent that flags conflicting inputs before delivering advice.
              </p>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-cyan-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                <span>What-If Temporal Twin</span>
              </strong>
              <p className="text-[11px] text-slate-400">
                Simulates alternative departure times (05:00 vs 08:00 AM) to forecast wave resistance, thermal gusts, and fuel burn differential.
              </p>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-amber-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>Zero-Hallucination Evidence Graph</span>
              </strong>
              <p className="text-[11px] text-slate-400">
                Every claim is anchored to official government data (INCOIS, IMD, MOSDAC, Bhuvan) with explicit timestamps and provenance links.
              </p>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-blue-400 flex items-center gap-1.5">
                <Anchor className="w-4 h-4" />
                <span>Tamil-First High-Contrast Sea Cockpit</span>
              </strong>
              <p className="text-[11px] text-slate-400">
                Designed for direct sunlight on open fiber boats with 2G/low-bandwidth caching and instant 1-tap SOS Coast Guard dispatch.
              </p>
            </div>
          </div>

          {/* United Nations Sustainable Development Goals (SDGs) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>United Nations Sustainable Development Goals (SDG) Alignment</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] font-bold">
              <div className="p-2 rounded bg-blue-950 text-blue-300 border border-blue-800">
                SDG 14
                <span className="block font-normal text-slate-400 text-[9px] mt-0.5">Life Below Water</span>
              </div>
              <div className="p-2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                SDG 13
                <span className="block font-normal text-slate-400 text-[9px] mt-0.5">Climate Action</span>
              </div>
              <div className="p-2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                SDG 9
                <span className="block font-normal text-slate-400 text-[9px] mt-0.5">Industry & Innovation</span>
              </div>
              <div className="p-2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                SDG 1
                <span className="block font-normal text-slate-400 text-[9px] mt-0.5">No Poverty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-400">
          <span>Smart India Hackathon 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
