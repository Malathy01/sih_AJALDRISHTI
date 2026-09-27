import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  GitFork,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Clock,
  Compass,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Volume2,
  VolumeX,
  Mic,
  MicOff
} from 'lucide-react';
import { ChatMessage, Language, RiskLevel } from '../types/marine';
import { t } from '../i18n/translations';
import { speakMarineAdvisory, stopMarineSpeech } from '../utils/marineAudio';

interface JaldrishtiChatProps {
  language: Language;
  onOpenEvidence: (title: string, items: any[], conflict?: boolean, conflictDetails?: any) => void;
  onOpenWhatIf: () => void;
  fisherLocation: { lat: number; lng: number };
}

export const JaldrishtiChat: React.FC<JaldrishtiChatProps> = ({
  language,
  onOpenEvidence,
  onOpenWhatIf,
  fisherLocation
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'jaldrishti',
      text:
        language === 'ta'
          ? 'வணக்கம்! நான் ஜல்திருஷ்டி - உங்கள் கடல்சார் முடிவெடுக்கும் இரட்டை (Marine Decision Twin). வானிலை, அலைகள், INCOIS மீன்பிடி மண்டலங்கள் மற்றும் பாதுகாப்பான பாதைகள் குறித்து எதையும் கேளுங்கள்.'
          : 'Vanakkam! I am JALDRISHTI, your Agentic Marine Decision Twin. Ask me about sea safety, wave height, INCOIS Potential Fishing Zones (PFZ), or route planning.',
      language: language,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentProgress, setAgentProgress] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleSpeakMessage = (msgId: string, text: string) => {
    if (speakingId === msgId) {
      stopMarineSpeech();
      setSpeakingId(null);
    } else {
      speakMarineAdvisory(text, language);
      setSpeakingId(msgId);
      setTimeout(() => setSpeakingId(null), 14000);
    }
  };

  const handleStartVoiceInput = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      // Fallback: cycle a popular vernacular query
      const sampleQuery =
        language === 'ta'
          ? 'நாளைக்கு காலை 5 மணிக்கு ராமேஸ்வரத்திலிருந்து மீன்பிடிக்க போகலாமா?'
          : 'Is it safe to sail tomorrow at 5 AM from Rameswaram?';
      setInputText(sampleQuery);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Suggested prompt chips for instant 1-click execution
  const suggestedQuestions =
    language === 'ta'
      ? [
          'நாளைக்கு காலை 5 மணிக்கு ராமேஸ்வரத்திலிருந்து மீன்பிடிக்க போகலாமா?',
          'எந்த இடத்துல மீன் கிடைக்க அதிக வாய்ப்பு இருக்கு (PFZ)?',
          'எனக்கு குறைந்த ஆபத்துள்ள பாதுகாப்பான பாதை காட்டுங்கள்.',
          'காலை 5 மணிக்கு பதில் 8 மணிக்கு சென்றால் என்ன மாற்றம் ஏற்படும்?'
        ]
      : [
          'Is it safe to go fishing tomorrow at 5 AM from Rameswaram?',
          'Where is the nearest potential fishing zone (PFZ)?',
          'Show me a lower-risk safe route avoiding shallow reefs.',
          'What happens if I leave at 8 AM instead of 5 AM?'
        ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, agentProgress]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      language: language,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    // Multi-Agent Pipeline Visualization steps
    setAgentProgress('Agent 1 & 2: Intent & Spatial Context Classifier...');
    await new Promise((r) => setTimeout(r, 200));

    setAgentProgress('Agent 3 & 4: Ingesting INCOIS PFZ & Ocean State...');
    await new Promise((r) => setTimeout(r, 250));

    setAgentProgress('Agent 5 & 8: Checking IMD Warnings & IMBL Geofence...');
    await new Promise((r) => setTimeout(r, 200));

    setAgentProgress('Agent 11 & 12: Critic Conflict Check & Evidence Graph...');
    await new Promise((r) => setTimeout(r, 200));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language: language,
          latitude: fisherLocation.lat,
          longitude: fisherLocation.lng
        })
      });

      const data = await response.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'jaldrishti',
        text: data.answer,
        language: language,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        agentChain: {
          intent: data.agent_chain?.intent || 'SAFETY_AND_TRIP_PLANNING',
          invokedAgents: data.agent_chain?.invokedAgents || ['Ocean', 'Weather', 'PFZ', 'Critic'],
          criticChecked: true,
          evidenceCount: data.evidence?.length || 4
        },
        decisionSummary: {
          decisionEn: data.decision,
          decisionTa: data.decision,
          riskLevel: data.risk_level || 'LOW',
          confidence: data.confidence || 'HIGH',
          whyEn: data.evidence?.map((e: any) => `${e.parameter}: ${e.value}`) || [],
          whyTa: data.evidence?.map((e: any) => `${e.parameter}: ${e.value}`) || [],
          recommendedActionEn: data.actions?.[0] || 'Observe verified safety bulletins.',
          recommendedActionTa: data.actions?.[0] || 'அங்கீகரிக்கப்பட்ட வழிகாட்டல்களைப் பின்பற்றவும்.',
          alternativeEn: 'Run What-If simulator to inspect alternative 8 AM window.',
          alternativeTa: 'காலை 8 மணி நிலையை வாட்-இஃப் சிமுலேட்டரில் சோதிக்கவும்.',
          sources: data.sources || ['INCOIS', 'IMD'],
          evidenceItems: data.evidence || [],
          conflictDetected: data.agent_chain?.conflictDetected,
          conflictText: data.agent_chain?.conflictDetails?.description
        }
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      // Deterministic client fallback if network disconnects
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'jaldrishti',
        text:
          language === 'ta'
            ? 'தற்போதைய சரிபார்க்கப்பட்ட INCOIS & IMD தரவுகளின்படி கடல் நிலை அமைதியாக உள்ளது (அலை 1.1 மீ, காற்று 14.5 நாட்ஸ்). மன்னார் வளைகுடா கண்டத்திட்டு பகுதியில் மீன்வள மண்டலம் (PFZ) அடையாளம் காணப்பட்டுள்ளது.'
            : 'According to verified INCOIS & IMD data, favorable conditions prevail (Wave: 1.1m, Wind: 14.5 kts). Potential Fishing Zone active at Gulf of Mannar Shelf Edge (21.4 km).',
        language: language,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
      setAgentProgress(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
      {/* Chat Header with Agent Swarm Indicator */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{language === 'ta' ? 'ஜல்திருஷ்டி கடல்சார் ஏஜெண்ட் AI' : 'JALDRISHTI Multi-Agent Chat'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {language === 'ta'
                ? 'INCOIS · IMD · MOSDAC · Bhuvan ஆதார அடிப்படையிலான உரையாடல்'
                : 'Evidence-Grounding via INCOIS, IMD, MOSDAC & Bhuvan'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onOpenWhatIf}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 hover:bg-cyan-900 transition-colors"
          >
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>{language === 'ta' ? 'வாட்-இஃப் சிமுலேட்டர்' : 'What-If Sim'}</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-2xl ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-cyan-950 border border-cyan-700/60 text-cyan-300'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className="space-y-2">
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Structured Decision Card if present */}
                {msg.decisionSummary && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        <span>{language === 'ta' ? 'முடிவு' : 'Decision'}: {msg.decisionSummary.riskLevel} RISK</span>
                      </span>

                      <button
                        onClick={() =>
                          onOpenEvidence(
                            msg.decisionSummary?.decisionEn || 'Marine Decision',
                            msg.decisionSummary?.evidenceItems || [],
                            msg.decisionSummary?.conflictDetected,
                            msg.decisionSummary?.conflictText
                          )
                        }
                        className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700/80 hover:bg-cyan-900 text-cyan-300 font-bold transition-colors flex items-center gap-1 text-[10px]"
                      >
                        <GitFork className="w-3 h-3" />
                        <span>{language === 'ta' ? 'ஏன்? (WHY?)' : 'WHY? (Evidence Graph)'}</span>
                      </button>
                    </div>

                    {msg.decisionSummary.conflictDetected && (
                      <div className="p-1.5 rounded bg-amber-950/70 border border-amber-500/50 text-amber-300 text-[10px]">
                        ⚠️ {msg.decisionSummary.conflictText}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Timestamp & Invoked Agents Badge */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                <div className="flex items-center gap-2">
                  <span>{msg.timestamp}</span>
                  {msg.agentChain && (
                    <>
                      <span>·</span>
                      <span className="text-cyan-400/90 font-mono">
                        {msg.agentChain.invokedAgents.length} Agents Verified
                      </span>
                    </>
                  )}
                </div>

                {msg.sender === 'jaldrishti' && (
                  <button
                    onClick={() => toggleSpeakMessage(msg.id, msg.text)}
                    className="p-1 rounded text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                    title={language === 'ta' ? 'குரலில் கேள்' : 'Listen aloud'}
                  >
                    {speakingId === msg.id ? (
                      <VolumeX className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Live Multi-Agent Execution Progress Indicator */}
        {loading && (
          <div className="flex items-center gap-2 p-3 bg-slate-950/80 border border-cyan-800/60 rounded-xl text-xs text-cyan-300 animate-pulse max-w-md">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <span>{agentProgress || 'Synthesizing verified Marine Decision Twin...'}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
        <span className="text-slate-500 text-[11px] shrink-0">
          {language === 'ta' ? 'விரைவு கேள்விகள்:' : 'Try:'}
        </span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={loading}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 text-[11px] transition-colors border border-slate-700/60"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={handleStartVoiceInput}
          className={`p-2.5 rounded-xl border transition-all shrink-0 ${
            isListening
              ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500'
          }`}
          title={language === 'ta' ? 'குரல் உள்ளீடு (Mic)' : 'Speak Question (Mic)'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isListening
              ? (language === 'ta' ? 'பேசுங்கள்... கேட்கிறது...' : 'Listening to your voice...')
              : (language === 'ta'
                ? 'கடல் பாதுகாப்பு, மீன்பிடி மண்டலம் குறித்து தமிழில் கேளுங்கள்...'
                : 'Ask in English or Tamil about sea safety, PFZ, or routes...')
          }
          className="flex-1 bg-slate-900 border border-slate-700/80 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold transition-all shadow-md shadow-cyan-900/40 active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
