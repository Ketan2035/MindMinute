import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic2, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  Copy, 
  Check, 
  Zap, 
  Lightbulb, 
  ArrowRight, 
  RefreshCw, 
  Columns, 
  FileText
} from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProSpeakerStudio = ({ 
  proRewrite: initialProRewrite, 
  originalTranscript, 
  topicTitle, 
  videoId,
  onProRewriteGenerated 
}) => {
  const { user } = useAuthStore();
  const [proRewrite, setProRewrite] = useState(initialProRewrite);
  const [generating, setGenerating] = useState(false);
  const [viewMode, setViewMode] = useState('pro'); // 'pro' | 'compare'
  
  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [copied, setCopied] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);

  const utteranceRef = useRef(null);

  // Sync state when props change
  useEffect(() => {
    if (initialProRewrite) {
      setProRewrite(initialProRewrite);
    }
  }, [initialProRewrite]);

  // Load available speech synthesis voices
  useEffect(() => {
    const updateVoices = () => {
      if ('speechSynthesis' in window) {
        const availableVoices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
        setVoices(availableVoices);
        // Default to a premium-sounding voice if available
        const preferredIndex = availableVoices.findIndex(v => 
          v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Samantha')
        );
        if (preferredIndex !== -1) {
          setSelectedVoiceIndex(preferredIndex);
        }
      }
    };

    updateVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle on-demand generation for older sessions
  const handleGenerateProRewrite = async () => {
    if (!videoId || !originalTranscript) {
      toast.error('Cannot generate rewrite without a transcript.');
      return;
    }

    setGenerating(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/videos/${videoId}/pro-rewrite`,
        { forceRefresh: true },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setProRewrite(res.data);
      if (onProRewriteGenerated) {
        onProRewriteGenerated(res.data);
      }
      toast.success('Pro Speaker Rewrite generated!');
    } catch (err) {
      console.error('Failed to generate Pro Rewrite:', err);
      toast.error('Failed to generate Pro Rewrite. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Text-To-Speech Playback
  const handleTogglePlay = () => {
    if (!('speechSynthesis' in window)) {
      toast.error('Speech synthesis is not supported on this browser.');
      return;
    }

    const textToSpeak = proRewrite?.speechText || '';
    if (!textToSpeak) return;

    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = playbackRate;
    utterance.pitch = 1.0;

    if (voices.length > 0 && voices[selectedVoiceIndex]) {
      utterance.voice = voices[selectedVoiceIndex];
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handleRateChange = (newRate) => {
    setPlaybackRate(newRate);
    if (isPlaying) {
      handleStop();
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(proRewrite?.speechText || '');
        utterance.rate = newRate;
        if (voices[selectedVoiceIndex]) utterance.voice = voices[selectedVoiceIndex];
        utterance.onstart = () => { setIsPlaying(true); setIsPaused(false); };
        utterance.onend = () => { setIsPlaying(false); setIsPaused(false); };
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }, 100);
    }
  };

  const handleCopy = () => {
    if (!proRewrite?.speechText) return;
    navigator.clipboard.writeText(proRewrite.speechText);
    setCopied(true);
    toast.success('Pro script copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // If no proRewrite yet (older video), render CTA to generate
  if (!proRewrite && !generating) {
    return (
      <div className="mt-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50/50 rounded-3xl p-6 sm:p-8 text-slate-900 border border-indigo-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-indigo-100/80 border border-indigo-200 px-3 py-1 rounded-full text-xs font-bold text-indigo-800">
              <Mic2 size={14} className="text-indigo-600" />
              <span>Executive Speech Coach</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              See "How a Pro Would Say It" (TED-Style Rewrite)
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Let Gemini AI elevate your thoughts into a 45–60s masterclass delivery with advanced rhetoric, power vocabulary, and voice audio playback.
            </p>
          </div>

          <button
            onClick={handleGenerateProRewrite}
            disabled={generating}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all transform active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Mic2 size={18} />
            Generate Pro Version
          </button>
        </div>
      </div>
    );
  }

  if (generating) {
    return (
      <div className="mt-8 bg-white rounded-3xl p-8 text-slate-900 text-center border border-indigo-100 shadow-sm flex flex-col items-center justify-center min-h-[220px]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h4 className="text-lg font-bold text-slate-900">Crafting Your TED-Style Master Delivery...</h4>
        <p className="text-xs text-slate-500 mt-1">Refining arguments, applying rhetoric, and calibrating vocal cadence.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-3xl p-6 sm:p-8 text-slate-900 border border-slate-200/90 shadow-sm relative overflow-hidden">
      
      {/* Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-xs font-bold text-indigo-700 mb-2">
            <Mic2 size={13} className="text-indigo-600" />
            <span>EXECUTIVE COACH REWRITE</span>
          </div>
          <h3 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            How a Pro Would Say It
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {proRewrite?.title ? `"${proRewrite.title}"` : `TED-Style delivery for: "${topicTitle || 'Your Topic'}"`}
          </p>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode('pro')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'pro' 
                  ? 'bg-white text-indigo-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText size={13} />
              Pro Delivery
            </button>
            <button
              onClick={() => setViewMode('compare')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'compare' 
                  ? 'bg-white text-indigo-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns size={13} />
              Side-by-Side
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            title="Copy Pro Script"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleGenerateProRewrite}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="Regenerate another angle"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Audio Voice Player Bar */}
      <div className="relative z-10 mt-6 bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-indigo-50/80 rounded-2xl p-4 border border-indigo-100/90 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {/* Main Play / Pause Button */}
          <button
            onClick={handleTogglePlay}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md transform active:scale-95 cursor-pointer ${
              isPlaying && !isPaused
                ? 'bg-indigo-700 text-white shadow-indigo-300'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isPlaying && !isPaused ? (
              <Pause size={20} className="fill-current" />
            ) : (
              <Play size={20} className="fill-current ml-0.5" />
            )}
          </button>

          {isPlaying && (
            <button
              onClick={handleStop}
              className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer shadow-xs"
              title="Stop playback"
            >
              <RotateCcw size={16} />
            </button>
          )}

          <div className="flex flex-col">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <Volume2 size={14} className="text-indigo-600" />
              {isPlaying ? (isPaused ? 'Voice Paused' : 'Voice Coach Playing...') : 'Listen to TED Delivery'}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Real-time AI voice playback with natural cadence & pauses
            </span>
          </div>
        </div>

        {/* Live Soundwave Animation & Speed Controls */}
        <div className="flex items-center gap-4">
          {/* Animated Waveform */}
          <div className="flex items-center gap-1 h-6 px-2">
            {[0.4, 0.9, 0.6, 1.0, 0.5, 0.8, 0.3, 0.7].map((height, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${
                  isPlaying && !isPaused 
                    ? 'bg-indigo-600 animate-pulse' 
                    : 'bg-indigo-200'
                }`}
                style={{
                  height: isPlaying && !isPaused ? `${Math.max(6, height * 24)}px` : '6px',
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>

          {/* Speed Selector */}
          <div className="flex items-center bg-white rounded-lg p-0.5 border border-indigo-200 text-[11px] font-bold shadow-xs">
            {[1.0, 1.2, 1.5].map(rate => (
              <button
                key={rate}
                onClick={() => handleRateChange(rate)}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  playbackRate === rate 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 mt-6">
        {viewMode === 'pro' ? (
          /* Single Pro View */
          <div className="space-y-6">
            <div className="bg-slate-50/90 rounded-2xl p-6 border border-slate-200/80 shadow-inner">
              <p className="text-base sm:text-lg text-slate-800 font-normal leading-relaxed italic select-text">
                "{proRewrite?.speechText}"
              </p>
            </div>

            {/* Key Rhetorical Upgrades */}
            {proRewrite?.keyUpgrades?.length > 0 && (
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
                  <Zap size={14} className="text-indigo-600" />
                  Key Rhetorical Upgrades Applied
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {proRewrite.keyUpgrades.map((upgrade, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white border border-slate-200/80 hover:border-indigo-300 p-4 rounded-2xl shadow-xs transition-all"
                    >
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-700 uppercase tracking-wider mb-2">
                        {upgrade.technique}
                      </span>
                      <p className="text-xs text-slate-600 leading-normal">
                        {upgrade.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vocal Delivery Tips */}
            {proRewrite?.deliveryTips?.length > 0 && (
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5">
                <h4 className="text-xs font-black uppercase tracking-widest text-amber-800 mb-2.5 flex items-center gap-1.5">
                  <Lightbulb size={14} className="text-amber-600" />
                  Vocal Coach Delivery Notes
                </h4>
                <ul className="space-y-1.5">
                  {proRewrite.deliveryTips.map((tip, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-amber-950 flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          /* Side-by-Side Comparison View */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Original Transcript */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Your Original Speech
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">Raw Delivery</span>
              </div>
              <div className="flex-1 text-sm text-slate-700 leading-relaxed italic p-2 select-text">
                "{originalTranscript || 'No transcript available.'}"
              </div>
            </div>

            {/* Pro Version */}
            <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-200/80 flex flex-col shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-indigo-100">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1">
                  <Zap size={12} className="text-indigo-600" /> Pro Executive Rewrite
                </span>
                <span className="text-[10px] text-indigo-600 font-bold">TED-Style Refinement</span>
              </div>
              <div className="flex-1 text-sm text-indigo-950 leading-relaxed italic p-2 font-medium select-text">
                "{proRewrite?.speechText}"
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ProSpeakerStudio;
