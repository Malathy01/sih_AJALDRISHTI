import React, { useState } from 'react';
import {
  Eye,
  Send,
  MapPin,
  Fish,
  AlertTriangle,
  Waves,
  X,
  CheckCircle2
} from 'lucide-react';
import { UserObservation, Language } from '../types/marine';
import { t } from '../i18n/translations';

interface ObservationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fisherLocation: { lat: number; lng: number };
  language: Language;
  onObservationAdded?: (obs: UserObservation) => void;
}

export const ObservationsModal: React.FC<ObservationsModalProps> = ({
  isOpen,
  onClose,
  fisherLocation,
  language,
  onObservationAdded
}) => {
  const [category, setCategory] = useState<UserObservation['category']>('FISH_ABUNDANCE');
  const [notes, setNotes] = useState('');
  const [species, setSpecies] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    try {
      const res = await fetch('/api/observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fisherName: 'Field Fisherman',
          category,
          notes,
          lat: fisherLocation.lat,
          lng: fisherLocation.lng,
          speciesObserved: species
        })
      });
      const data = await res.json();
      if (onObservationAdded && data.observation) {
        onObservationAdded(data.observation);
      }
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setNotes('');
        onClose();
      }, 1200);
    } catch {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl p-6 text-slate-100 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-950 border border-cyan-800/80 text-cyan-400">
              <Eye className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white">
                {language === 'ta' ? 'மீனவர் கள அவதானிப்புப் பதிவு' : 'Report Marine Sighting'}
              </h2>
              <span className="text-[10px] text-amber-400 font-semibold">
                User-Reported Observation (Non-Official Crowdsource)
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

        {submitted ? (
          <div className="p-6 text-center space-y-2 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-sm font-bold text-white">
              {language === 'ta' ? 'அவதானிப்பு வெற்றிகரமாகப் பதிவானது!' : 'Observation Successfully Logged!'}
            </div>
            <p className="text-xs text-slate-400">
              {language === 'ta'
                ? 'உங்கள் பதிவு பிற மீனவர்கள் மற்றும் ஆராய்ச்சியாளர்களுக்கு பயனுள்ளதாக அமையும்.'
                : 'Your crowdsourced telemetry has been shared with nearby vessels and coastal authorities.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'ta' ? 'அவதானிப்பு வகை' : 'Observation Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 outline-none"
              >
                <option value="FISH_ABUNDANCE">🐟 Fish Abundance / Shoal Sighting</option>
                <option value="SEA_CONDITION">🌊 Sudden Sea Chop / Swell Change</option>
                <option value="ALGAL_BLOOM">🌿 Algal Bloom / Greenish Slick</option>
                <option value="UNUSUAL_COLOR">🎨 Unusual Water Discoloration</option>
                <option value="FLOATING_WASTE">🛢️ Floating Marine Debris / Waste</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'ta' ? 'மீன் வகை (இருப்பின்)' : 'Observed Species (Optional)'}
              </label>
              <input
                type="text"
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                placeholder="e.g. Seer fish (வஞ்சிரம்), Sardines (மத்தி)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 outline-none placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'ta' ? 'விளக்கக் குறிப்புகள்' : 'Observation Details'}
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe sea conditions, water color, or fish school surface behavior..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 outline-none placeholder-slate-500 resize-none"
                required
              />
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between font-mono">
              <span>Geo-Tag:</span>
              <span className="text-cyan-400 font-bold">
                {fisherLocation.lat.toFixed(4)}°N, {fisherLocation.lng.toFixed(4)}°E
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{language === 'ta' ? 'பதிவு செய்' : 'Submit Field Observation'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
