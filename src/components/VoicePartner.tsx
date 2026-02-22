import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, MessageSquare, Sparkles, Settings2, Sliders } from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

export const VoicePartner: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active'>('idle');
  const [showControls, setShowControls] = useState(false);
  
  // Voice Settings
  const [volume, setVolume] = useState(80);
  const [pitch, setPitch] = useState(1.0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);

  const startSession = async () => {
    setStatus('connecting');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { 
              prebuiltVoiceConfig: { 
                voiceName: "Zephyr"
              } 
            },
          },
          systemInstruction: "You are a friendly language learning partner. Help the user practice their target language. Be encouraging, correct mistakes gently, and keep the conversation flowing naturally.",
        },
        callbacks: {
          onopen: () => {
            setStatus('active');
            setIsActive(true);
          },
          onmessage: async (message: any) => {
            if (message.serverContent?.modelTurn?.parts[0]?.text) {
              setTranscription(prev => [...prev.slice(-10), `AI: ${message.serverContent.modelTurn.parts[0].text}`]);
            }
          },
          onclose: () => stopSession(),
          onerror: () => stopSession()
        }
      });
      
      sessionRef.current = session;
    } catch (error) {
      console.error("Failed to start session:", error);
      setStatus('idle');
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
    setStatus('idle');
  };

  return (
    <div className="h-full bg-zinc-950 flex flex-col items-center justify-center p-4 sm:p-8 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-emerald-500/10 blur-[80px] sm:blur-[120px] rounded-full" />
      </div>

      <div className="max-w-2xl w-full flex flex-col items-center z-10">
        <div className="mb-8 sm:mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <Sparkles className="w-3 h-3 sm:w-4 h-4" />
            AI Language Partner
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-2 sm:mb-4">
            {status === 'active' ? 'Listening...' : status === 'connecting' ? 'Connecting...' : 'Ready to talk?'}
          </h2>
          <p className="text-zinc-400 text-sm sm:text-lg px-4">
            Practice your speaking skills with our advanced AI partner.
          </p>
        </div>

        {/* Visualizer Circle */}
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 mb-10 sm:mb-16">
          <AnimatePresence>
            {isActive && (
              <>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 0.2 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute inset-0 bg-emerald-500 rounded-full"
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1.4, opacity: 0.1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
                  className="absolute inset-0 bg-emerald-500 rounded-full"
                />
              </>
            )}
          </AnimatePresence>
          
          <div className={cn(
            "absolute inset-0 rounded-full border-4 flex items-center justify-center transition-all duration-500",
            isActive ? "border-emerald-500 bg-emerald-500/5 shadow-[0_0_50px_rgba(16,185,129,0.2)]" : "border-zinc-800 bg-zinc-900"
          )}>
            <div className="flex flex-col items-center">
              <Mic className={cn("w-12 h-12 sm:w-16 sm:h-16 mb-2 transition-colors", isActive ? "text-emerald-500" : "text-zinc-600")} />
              {isActive && (
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <motion.div
                      key={i}
                      animate={{ height: [6, 18, 6] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                      className="w-0.5 sm:w-1 bg-emerald-500 rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Voice Settings Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="w-full max-w-xs bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6 space-y-4 shadow-xl"
            >
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  <span>Volume</span>
                  <span>{volume}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={volume} 
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  <span>Pitch</span>
                  <span>{pitch.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2.0" 
                  step="0.1"
                  value={pitch} 
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            onClick={() => setShowControls(!showControls)}
            className={cn(
              "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border transition-all",
              showControls ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
            )}
          >
            <Sliders className="w-5 h-5 sm:w-6 h-6" />
          </button>

          {!isActive ? (
            <button 
              onClick={startSession}
              disabled={status === 'connecting'}
              className="px-6 py-3 sm:px-10 sm:py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl text-base sm:text-lg transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              Start Practice
            </button>
          ) : (
            <button 
              onClick={stopSession}
              className="px-6 py-3 sm:px-10 sm:py-4 bg-red-500 hover:bg-red-400 text-white font-bold rounded-2xl text-base sm:text-lg transition-all shadow-lg shadow-red-500/20"
            >
              End Session
            </button>
          )}

          <button 
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={cn(
              "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border transition-all",
              !isSpeakerOn ? "bg-zinc-800 border-zinc-700 text-zinc-500" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
            )}
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5 sm:w-6 h-6" /> : <VolumeX className="w-5 h-5 sm:w-6 h-6" />}
          </button>
        </div>

        {/* Transcription Preview */}
        <div className="mt-8 sm:mt-12 w-full max-w-md bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4">
            <MessageSquare className="w-3 h-3" />
            Live Transcription
          </div>
          <div className="h-20 sm:h-24 overflow-y-auto space-y-2 text-xs sm:text-sm">
            {transcription.length === 0 ? (
              <p className="text-zinc-600 italic">No conversation yet...</p>
            ) : (
              transcription.map((line, i) => (
                <p key={i} className={line.startsWith('AI') ? 'text-emerald-400' : 'text-white'}>
                  {line}
                </p>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
