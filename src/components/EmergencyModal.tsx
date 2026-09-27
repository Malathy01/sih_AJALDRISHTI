import React, { useState } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  MapPin,
  Radio,
  Send,
  Navigation,
  CheckCircle2,
  X,
  AlertTriangle,
  Volume2,
  Share2,
  Copy
} from 'lucide-react';
import { Language } from '../types/marine';
import { t } from '../i18n/translations';
import { playDistressSiren } from '../utils/marineAudio';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  fisherLocation: { lat: number; lng: number };
  language: Language;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  fisherLocation,
  language
}) => {
  const [sosSent, setSosSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const distressMessage = `MAYDAY MAYDAY! Indian Fishing Vessel IND-TN-10-MM-442 in distress at GPS: ${fisherLocation.lat.toFixed(4)}°N, ${fisherLocation.lng.toFixed(4)}°E (Gulf of Mannar). Requesting immediate Coast Guard / Marine Police coordination.`;

  const handleSendSOS = async () => {
    setLoading(true);
    // Play real audio alert siren
    playDistressSiren(4);

    try {
      await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fisherName: 'Fisher in Distress (Demo)',
          boatName: 'Annai Velankanni (IND-TN-10-MM-442)',
          lat: fisherLocation.lat,
          lng: fisherLocation.lng,
          emergencyType: 'DISTRESS_BEACON_TRIGGERED',
          message: distressMessage
        })
      });
      setSosSent(true);
    } catch {
      setSosSent(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyDistress = () => {
    navigator.clipboard.writeText(distressMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border-2 border-rose-600 rounded-3xl w-full max-w-lg shadow-2xl p-6 text-slate-100 space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-rose-900/60 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-950 border border-rose-700/80 text-rose-400 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                {language === 'ta' ? 'அவசர கடல்சார் மீட்பு மையம்' : 'Marine Emergency SOS Dispatch'}
              </h2>
              <span className="text-[10px] font-bold text-rose-400">
                Indian Coast Guard & Coastal Security Group
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

        {/* Live GPS Coordinates */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
          <div className="text-slate-400 text-[11px] font-semibold flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'ta' ? 'உங்களின் தற்போதைய GPS இருப்பிடம்:' : 'Your Locked GPS Coordinates:'}</span>
          </div>
          <div className="text-base font-mono font-bold text-white">
            {fisherLocation.lat.toFixed(4)}°N, {fisherLocation.lng.toFixed(4)}°E
          </div>
          <div className="text-[11px] text-slate-400">
            Sector: Rameswaram South Coast / Gulf of Mannar
          </div>
        </div>

        {/* SOS Action Trigger */}
        {!sosSent ? (
          <div className="space-y-3">
            <button
              onClick={handleSendSOS}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-extrabold text-base transition-all shadow-xl shadow-rose-900/60 flex items-center justify-center gap-2 animate-pulse"
            >
              <Radio className="w-5 h-5" />
              <span>{loading ? 'Transmitting Distress Beacon...' : language === 'ta' ? 'SOS அவசர சமிக்ஞை அனுப்பு' : 'BROADCAST SOS DISTRESS BEACON'}</span>
            </button>

            <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-500/50 text-[11px] text-amber-300 text-center font-medium">
              ⚠️ {language === 'ta' ? 'செயல்முறை மாதிரி: இது ஒரு மாதிரி அவசர எச்சரிக்கை ஆகும் (DEMO SIMULATION).' : 'DEMO MODE: Transmission is safely simulated for demonstration purposes.'}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/70 text-xs space-y-2 text-emerald-200">
            <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>{language === 'ta' ? 'SOS சமிக்ஞை பதிவு செய்யப்பட்டது!' : 'Distress Beacon Successfully Dispatched!'}</span>
            </div>
            <p>
              Alert dispatched to <strong>Mandapam Coast Guard Station (18.4 km)</strong> and Tamil Nadu Marine Police network with your locked GPS telemetry.
            </p>
          </div>
        )}

        {/* Quick Dispatch Copy / WhatsApp Beacon */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="font-semibold">{language === 'ta' ? 'அவசர SOS குறுஞ்செய்தி விவரம்:' : 'Pre-Formatted Distress Telegram:'}</span>
            <button
              onClick={handleCopyDistress}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-[11px]"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? (language === 'ta' ? 'நகலெடுக்கப்பட்டது!' : 'Copied!') : (language === 'ta' ? 'நகலெடு' : 'Copy Text')}</span>
            </button>
          </div>
          <div className="bg-slate-900 p-2 rounded text-[11px] font-mono text-slate-300 border border-slate-800 line-clamp-2 select-all">
            {distressMessage}
          </div>
        </div>

        {/* Official Emergency Contact Helplines */}
        <div className="space-y-2 text-xs">
          <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
            {language === 'ta' ? 'அதிகாரப்பூர்வ அவசர உதவி எண்கள்:' : 'Direct Government Helplines:'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">Coast Guard Toll Free:</span>
                <strong className="text-white text-sm">1554</strong>
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">TN Fisheries Toll Free:</span>
                <strong className="text-white text-sm">1800-425-2953</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Return to Safety Route Option */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
        >
          <Navigation className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === 'ta' ? 'பாதுகாப்பான கரைக்குத் திரும்பு' : 'Return to Safe Route & Close'}</span>
        </button>
      </div>
    </div>
  );
};
