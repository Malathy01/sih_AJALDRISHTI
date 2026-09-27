/**
 * Marine Audio Utility for JALDRISHTI
 * Provides hands-free audio announcements and emergency siren synthesis
 * Requires zero external audio files or API keys.
 */

import { Language } from '../types/marine';

let audioCtx: AudioContext | null = null;
let sirenOscillator: OscillatorNode | null = null;
let sirenGain: GainNode | null = null;

/**
 * Text-To-Speech announcement for fishermen at sea
 */
export function speakMarineAdvisory(text: string, lang: Language): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip markdown, bullets, or emojis for cleaner speech
  const cleanText = text
    .replace(/[•\*\#\_]/g, '')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 0.95; // Slightly measured rate for open-air clarity
  utterance.pitch = 1.0;

  if (lang === 'ta') {
    utterance.lang = 'ta-IN';
  } else {
    utterance.lang = 'en-IN';
  }

  // Pick best available matching voice
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    if (lang === 'ta') {
      const taVoice = voices.find((v) => v.lang.includes('ta'));
      if (taVoice) utterance.voice = taVoice;
    } else {
      const inVoice = voices.find((v) => v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en-US'));
      if (inVoice) utterance.voice = inVoice;
    }
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Stops any ongoing audio speech
 */
export function stopMarineSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Plays a synthesized maritime emergency alert beacon (800Hz / 1000Hz alternating tone)
 */
export function playDistressSiren(durationSeconds: number = 3): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(750, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(1050, audioCtx.currentTime + 0.3);
    osc.frequency.linearRampToValueAtTime(750, audioCtx.currentTime + 0.6);
    osc.frequency.linearRampToValueAtTime(1050, audioCtx.currentTime + 0.9);
    osc.frequency.linearRampToValueAtTime(750, audioCtx.currentTime + 1.2);

    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durationSeconds);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + durationSeconds);
  } catch (err) {
    // Audio synthesis fallback silently ignored if audio permission is blocked
  }
}
