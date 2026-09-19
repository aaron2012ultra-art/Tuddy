import React, { useState, useEffect, useRef } from "react";
import { 
  Headphones, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Volume2, 
  Sliders, 
  Sparkles, 
  BookOpen, 
  FileText 
} from "lucide-react";
import { PetCustomization, StudyNote } from "../../types";
import { AnthropomorphicBunny } from "../AnthropomorphicBunny";
import { DEFAULT_PET } from "../../utils/storage";

interface AudioStudyReaderProps {
  pet?: PetCustomization;
  notes?: StudyNote[];
}

export const AudioStudyReader: React.FC<AudioStudyReaderProps> = ({
  pet = DEFAULT_PET,
  notes = [],
}) => {
  const [textToRead, setTextToRead] = useState(
    "¡Hola! Soy Tuddy, tu compañero de estudio. La memoria auditiva es un superpoder: escuchar tus apuntes mientras descansas la vista ayuda a consolidar conceptos clave en tu memoria a largo plazo. Puedes pegar cualquier resumen, tema o fórmula aquí para que te lo lea a tu propio ritmo."
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available system speech voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const updateVoices = () => {
      const avail = window.speechSynthesis.getVoices();
      setVoices(avail);
      // Prefer Spanish voice if available
      const esVoice = avail.find((v) => v.lang.startsWith("es"));
      if (esVoice) {
        setSelectedVoice(esVoice.name);
      } else if (avail[0]) {
        setSelectedVoice(avail[0].name);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlay = () => {
    if (!("speechSynthesis" in window)) {
      alert("Tu navegador no soporta síntesis de voz.");
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    if (!textToRead.trim()) return;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = rate;
    utterance.pitch = pitch;

    if (selectedVoice) {
      const v = voices.find((item) => item.name === selectedVoice);
      if (v) utterance.voice = v;
    }

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if ("speechSynthesis" in window && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
            <Headphones className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
              Lector de Apuntes a Audio (Modo Escucha)
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full font-semibold border border-indigo-400/20">
                Auditivo
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Convierte cualquier apunte, resumen o lección en audio narrado para repasar con las manos libres.
            </p>
          </div>
        </div>

        {/* Existing Note Selector */}
        {notes.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 hidden sm:inline">Cargar apunte:</span>
            <select
              onChange={(e) => {
                const note = notes.find((n) => n.id === e.target.value);
                if (note) {
                  const content = note.aiSummary || note.rawContent;
                  setTextToRead(`${note.title}. ${content}`);
                  handleStop();
                }
              }}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs font-bold outline-none"
            >
              <option value="">Seleccionar apunte...</option>
              {notes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Text Area and Controls */}
        <div className="lg:col-span-8 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Texto o Resumen a Reproducir:</span>
              <span className="text-[11px] text-slate-400 font-mono">{textToRead.length} caracteres</span>
            </label>
            <textarea
              rows={6}
              value={textToRead}
              onChange={(e) => {
                setTextToRead(e.target.value);
                if (isPlaying) handleStop();
              }}
              placeholder="Pega aquí el texto que quieres escuchar..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 leading-relaxed outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Player controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            {/* Play/Pause/Stop */}
            <div className="flex items-center gap-2">
              {!isPlaying ? (
                <button
                  onClick={handlePlay}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isPaused ? "Reanudar" : "Escuchar"}</span>
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pausar</span>
                </button>
              )}

              <button
                onClick={handleStop}
                disabled={!isPlaying && !isPaused}
                className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-600 rounded-xl transition-colors cursor-pointer"
                title="Detener lectura"
              >
                <Square className="w-4 h-4" />
              </button>
            </div>

            {/* Wave animation while playing */}
            {isPlaying && (
              <div className="flex items-center gap-1">
                {[40, 75, 100, 60, 90, 45, 80, 50].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-indigo-600 rounded-full animate-pulse"
                    style={{
                      height: `${h * 0.25}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
                <span className="text-[10px] font-bold text-indigo-600 ml-2">Narrando...</span>
              </div>
            )}

            {/* Speed selection */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-semibold text-[11px]">Velocidad:</span>
              {[0.8, 1.0, 1.25, 1.5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRate(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    rate === s
                      ? "bg-indigo-600 text-white"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Voice settings & Tuddy */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ajustes de Voz</span>
            </h3>

            {voices.length > 0 && (
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-semibold">Voz del sintetizador:</label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                >
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                <span>Tono (Pitch):</span>
                <span>{pitch.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>

          {/* Tuddy visual card */}
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 flex items-center gap-3">
            <div className="w-14 h-14 shrink-0">
              <AnthropomorphicBunny pet={pet} mood={isPlaying ? "cheering" : "studying"} size="md" />
            </div>
            <div className="text-xs text-indigo-950 space-y-0.5">
              <span className="font-bold block">Tuddy Modo Escucha</span>
              <p className="text-[11px] text-indigo-700 leading-tight">
                Cierra los ojos mientras escuchas para estimular la visualización mental de los conceptos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
