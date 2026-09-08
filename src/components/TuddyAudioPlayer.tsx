import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Headphones, 
  Zap, 
  Sparkles, 
  Check, 
  Copy, 
  X,
  FastForward,
  Rewind,
  BookOpen
} from "lucide-react";
import { PetCustomization } from "../types";
import { AnthropomorphicBunny } from "./AnthropomorphicBunny";
import { DEFAULT_PET } from "../utils/storage";

export interface AudioSection {
  title: string;
  text: string;
}

export interface TuddyAudioData {
  audioTitle: string;
  mode: "study" | "review";
  durationEstimate?: string;
  spokenScript: string;
  sections?: AudioSection[];
  keyTakeaways?: string[];
  tuddyMascotTip?: string;
}

interface TuddyAudioPlayerProps {
  audioData: TuddyAudioData;
  pet?: PetCustomization;
  onClose?: () => void;
  onSwitchMode?: (newMode: "study" | "review") => void;
  isLoadingNewMode?: boolean;
}

export const TuddyAudioPlayer: React.FC<TuddyAudioPlayerProps> = ({
  audioData,
  pet = DEFAULT_PET,
  onClose,
  onSwitchMode,
  isLoadingNewMode = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [speed, setSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<any>(null);

  // Sections or fallback to paragraphs
  const sections: AudioSection[] = 
    audioData.sections && audioData.sections.length > 0
      ? audioData.sections
      : audioData.spokenScript
          .split("\n\n")
          .filter((p) => p.trim().length > 0)
          .map((p, idx) => ({
            title: idx === 0 ? "Introducción didáctica" : `Punto clave ${idx}`,
            text: p.trim(),
          }));

  // Clean markdown or emoji for crisp voice synthesis
  const cleanVoiceText = (text: string) => {
    return text
      .replace(/[#*_`~]/g, "")
      .replace(/[🐰✨🥕💡🎧⚡🎯📌🧠]/g, "")
      .replace(/\[\w+\]/g, "")
      .trim();
  };

  const stopAudio = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  const playSection = (index: number) => {
    if (!("speechSynthesis" in window) || sections.length === 0) return;

    window.speechSynthesis.cancel();
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    const safeIndex = Math.max(0, Math.min(index, sections.length - 1));
    setCurrentSectionIndex(safeIndex);

    const fullRemainingScript = sections
      .slice(safeIndex)
      .map((s) => `${s.title}. ${s.text}`)
      .join(" ... ");

    const cleanText = cleanVoiceText(fullRemainingScript);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    utterance.lang = "es-ES";
    utterance.rate = speed;
    utterance.volume = isMuted ? 0 : 1;

    // Try finding an expressive Spanish voice if available
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(
      (v) => v.lang.startsWith("es") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Monica") || v.name.includes("Jorge"))
    ) || voices.find((v) => v.lang.startsWith("es"));

    if (esVoice) {
      utterance.voice = esVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgressPercent(100);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };

    utterance.onerror = (e) => {
      console.warn("TTS Event error:", e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    // Simulated progress tracker based on text length and speed
    const estimatedSeconds = Math.max(5, (cleanText.length / 15) / speed);
    let elapsed = 0;
    progressIntervalRef.current = setInterval(() => {
      elapsed += 0.5;
      const pct = Math.min(98, Math.round((elapsed / estimatedSeconds) * 100));
      setProgressPercent(pct);
    }, 500);

    window.speechSynthesis.speak(utterance);
  };

  const togglePlayPause = () => {
    if (!("speechSynthesis" in window)) {
      alert("Tu navegador no soporta síntesis de voz.");
      return;
    }

    if (isPlaying) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } else {
      playSection(currentSectionIndex);
    }
  };

  const handleRestart = () => {
    stopAudio();
    setProgressPercent(0);
    setCurrentSectionIndex(0);
    setTimeout(() => {
      playSection(0);
    }, 100);
  };

  const handleNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      playSection(currentSectionIndex + 1);
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      playSection(currentSectionIndex - 1);
    } else {
      handleRestart();
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (isPlaying) {
      // Re-trigger from current section at new speed
      playSection(currentSectionIndex);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(audioData.spokenScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    // Stop speaking when unmounted
    return () => {
      stopAudio();
    };
  }, []);

  // Update voice volume if mute toggled
  useEffect(() => {
    if (utteranceRef.current) {
      utteranceRef.current.volume = isMuted ? 0 : 1;
    }
  }, [isMuted]);

  return (
    <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-amber-50/60 p-5 sm:p-6 shadow-md space-y-5 transition-all">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Headphones className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wide uppercase text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                Tuddy Audio IA
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                {audioData.durationEstimate || "~2 min"}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
              {audioData.audioTitle}
            </h4>
          </div>
        </div>

        {/* Mode Switcher & Close */}
        <div className="flex items-center gap-1.5">
          {onSwitchMode && (
            <div className="flex items-center bg-white border border-indigo-200 rounded-xl p-0.5 text-xs shadow-2xs">
              <button
                type="button"
                disabled={isLoadingNewMode}
                onClick={() => onSwitchMode("study")}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  audioData.mode === "study"
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-indigo-600"
                }`}
              >
                <BookOpen className="h-3 w-3" />
                <span>Estudiar</span>
              </button>
              <button
                type="button"
                disabled={isLoadingNewMode}
                onClick={() => onSwitchMode("review")}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  audioData.mode === "review"
                    ? "bg-amber-500 text-white shadow-2xs"
                    : "text-slate-600 hover:text-amber-700"
                }`}
              >
                <Zap className="h-3 w-3" />
                <span>Repasar</span>
              </button>
            </div>
          )}

          {onClose && (
            <button
              type="button"
              onClick={() => {
                stopAudio();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="Cerrar reproductor"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Stage: Chibi Mascot + Waveform Bars */}
      <div className="bg-slate-900 rounded-2xl p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="shrink-0 scale-90 sm:scale-100">
            <AnthropomorphicBunny
              pet={pet}
              mood={isPlaying && !isPaused ? "cheering" : "studying"}
              size="xs"
              isBouncing={isPlaying && !isPaused}
              showShadow={false}
            />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>{isPlaying && !isPaused ? "Voz didáctica de Tuddy activa" : "Listo para reproducir"}</span>
            </div>
            <div className="text-xs font-bold text-slate-100 truncate">
              {sections[currentSectionIndex]?.title || "Audio Guía Pedagógica"}
            </div>
          </div>
        </div>

        {/* Dynamic Waveform Visualizer */}
        <div className="flex items-center gap-1 h-8 px-2 shrink-0">
          {[16, 28, 12, 32, 22, 14, 26, 30, 18, 24, 10, 20].map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-300 ${
                isPlaying && !isPaused
                  ? "bg-amber-400 animate-pulse"
                  : "bg-slate-700"
              }`}
              style={{
                height: isPlaying && !isPaused ? `${Math.max(6, (h * ((i % 3) + 1.2)) % 32)}px` : "6px",
                animationDelay: `${i * 80}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-amber-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-semibold text-slate-400">
          <span>Sección {currentSectionIndex + 1} de {sections.length}</span>
          <span>{progressPercent}% escuchado</span>
        </div>
      </div>

      {/* Main Playback Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Play/Pause & Skipping */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevSection}
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-xl border border-slate-200/70 transition-colors shadow-2xs cursor-pointer"
            title="Sección anterior"
          >
            <Rewind className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={togglePlayPause}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer ${
              isPlaying && !isPaused
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            }`}
          >
            {isPlaying && !isPaused ? (
              <>
                <Pause className="h-4 w-4 fill-current" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>{isPaused ? "Reanudar" : "Escuchar con Tuddy"}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleNextSection}
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-xl border border-slate-200/70 transition-colors shadow-2xs cursor-pointer"
            title="Siguiente sección"
          >
            <FastForward className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleRestart}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl border border-slate-200/70 transition-colors shadow-2xs cursor-pointer"
            title="Reiniciar desde el principio"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Speed Controls & Voice Settings */}
        <div className="flex items-center gap-2">
          {/* Speed Pills */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 text-[11px] font-bold shadow-2xs">
            {[0.8, 1.0, 1.25, 1.5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSpeedChange(s)}
                className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                  speed === s
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-xl border transition-colors shadow-2xs cursor-pointer ${
              isMuted
                ? "bg-rose-50 border-rose-200 text-rose-600"
                : "bg-white border-slate-200 text-slate-600 hover:text-slate-900"
            }`}
            title={isMuted ? "Activar audio" : "Silenciar"}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={handleCopyScript}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
            title="Copiar guión escrito"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Script & Key Takeaways Accordion / Content Box */}
      <div className="bg-white/85 rounded-2xl p-4 border border-indigo-100/90 text-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-indigo-950 flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
            Transcripción del Audio de {audioData.mode === "study" ? "Estudio Profundo" : "Repaso Rápido"}:
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            Pulsa en cualquier sección para escucharla
          </span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {sections.map((sec, idx) => {
            const isCurrent = idx === currentSectionIndex;
            return (
              <div
                key={idx}
                onClick={() => playSection(idx)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-indigo-50/90 border-indigo-300 ring-1 ring-indigo-200 text-indigo-950 font-medium"
                    : "bg-slate-50/70 border-slate-100 hover:bg-slate-100/80 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold mb-0.5">
                  <span className={isCurrent ? "text-indigo-700" : "text-slate-600"}>
                    {sec.title}
                  </span>
                  {isCurrent && isPlaying && (
                    <span className="text-[10px] text-indigo-600 font-black animate-pulse flex items-center gap-1">
                      <Volume2 className="h-3 w-3" /> Reproduciendo
                    </span>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed line-clamp-3">
                  {sec.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* Key Takeaways Pills */}
        {audioData.keyTakeaways && audioData.keyTakeaways.length > 0 && (
          <div className="pt-2 border-t border-indigo-100/80">
            <span className="text-[11px] font-bold text-amber-900 block mb-1">
              🎯 Claves para memorizar:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {audioData.keyTakeaways.map((tip, idx) => (
                <span
                  key={idx}
                  className="bg-amber-100/80 border border-amber-200 text-amber-900 font-semibold px-2 py-0.5 rounded-lg text-[10px]"
                >
                  ✓ {tip}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
