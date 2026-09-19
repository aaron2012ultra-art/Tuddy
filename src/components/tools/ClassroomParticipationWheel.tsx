import React, { useState, useEffect, useRef } from "react";
import { 
  Users, 
  RotateCw, 
  Sparkles, 
  Trash2, 
  Plus, 
  Check, 
  Award, 
  ListChecks, 
  Volume2, 
  History, 
  GraduationCap 
} from "lucide-react";
import { TeacherClassroom } from "../../types";
import { audioSynth } from "../../utils/audioSynth";
import confetti from "canvas-confetti";

interface ClassroomParticipationWheelProps {
  classrooms?: TeacherClassroom[];
  defaultClassroomId?: string;
}

const PALETTE = [
  "#4f46e5", "#059669", "#d97706", "#dc2626", 
  "#7c3aed", "#0891b2", "#db2777", "#2563eb",
  "#16a34a", "#ea580c"
];

export const ClassroomParticipationWheel: React.FC<ClassroomParticipationWheelProps> = ({
  classrooms = [],
  defaultClassroomId,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(
    defaultClassroomId || (classrooms[0]?.id || "")
  );

  const currentClass = classrooms.find((c) => c.id === selectedClassId);

  // List of participants
  const [participants, setParticipants] = useState<string[]>([
    "Mateo Benítez",
    "Sofía Morales",
    "Lucas Herrera",
    "Valeria Castro",
    "Joaquín Romero",
    "Camila Vargas",
    "Nicolás Rivas",
    "Emilia Paredes"
  ]);

  const [newName, setNewName] = useState("");
  const [removeOnSelect, setRemoveOnSelect] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [history, setHistory] = useState<Array<{ name: string; time: string }>>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentAngleRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // Load students from classroom if selected
  const handleLoadClassroomStudents = () => {
    if (currentClass && currentClass.students && currentClass.students.length > 0) {
      setParticipants(currentClass.students.map((s) => s.fullName));
      setWinner(null);
    }
  };

  // Draw wheel on canvas
  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 15;
    const count = participants.length;

    ctx.clearRect(0, 0, size, size);

    if (count === 0) {
      ctx.fillStyle = "#f1f5f9";
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Agrega participantes", center, center);
      return;
    }

    const arc = (2 * Math.PI) / count;

    // Draw wedges
    for (let i = 0; i < count; i++) {
      const startAngle = angle + i * arc;
      const endAngle = startAngle + arc;

      ctx.beginPath();
      ctx.fillStyle = PALETTE[i % PALETTE.length];
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";

      const textAngle = startAngle + arc / 2;
      ctx.translate(
        center + Math.cos(textAngle) * (radius - 18),
        center + Math.sin(textAngle) * (radius - 18)
      );
      ctx.rotate(textAngle);

      const name = participants[i];
      const truncated = name.length > 15 ? name.substring(0, 14) + "…" : name;
      ctx.fillText(truncated, 0, 0);
      ctx.restore();
    }

    // Outer rim shadow
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Center hub
    ctx.beginPath();
    ctx.fillStyle = "#0f172a";
    ctx.arc(center, center, 24, 0, 2 * Math.PI);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎯", center, center);
  };

  useEffect(() => {
    drawWheel(currentAngleRef.current);
  }, [participants]);

  // Spin wheel logic
  const handleSpin = () => {
    if (isSpinning || participants.length < 2) return;

    setIsSpinning(true);
    setWinner(null);

    // Random target spins (between 5 and 9 full rotations + offset)
    const extraRounds = 5 + Math.random() * 4;
    const targetAngle = currentAngleRef.current + extraRounds * 2 * Math.PI + Math.random() * 2 * Math.PI;
    const startAngle = currentAngleRef.current;
    const duration = 4000; // 4 seconds
    const startTime = performance.now();

    let lastTickIndex = -1;
    const arc = (2 * Math.PI) / participants.length;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const cur = startAngle + (targetAngle - startAngle) * easeOut;
      currentAngleRef.current = cur;

      drawWheel(cur);

      // Sound tick on passing wedges
      const normalized = (cur % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const currentWedge = Math.floor(normalized / arc);
      if (currentWedge !== lastTickIndex) {
        audioSynth.playTick();
        lastTickIndex = currentWedge;
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Finished! Calculate who is at the top pointer (angle = 3*PI/2)
        const finalNormalized = (currentAngleRef.current % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        // Pointer is at the right (0 rad) or top (1.5*PI rad). Let's use right (0 radians)
        const winningIndex = Math.floor(
          ((2 * Math.PI - (finalNormalized % (2 * Math.PI))) % (2 * Math.PI)) / arc
        ) % participants.length;

        const chosen = participants[winningIndex] || participants[0];
        setWinner(chosen);
        setIsSpinning(false);
        audioSynth.playFanfare();
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });

        // Add to history
        const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setHistory((prev) => [{ name: chosen, time: nowStr }, ...prev.slice(0, 14)]);

        // Remove if set
        if (removeOnSelect) {
          setParticipants((prev) => prev.filter((_, idx) => idx !== winningIndex));
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setParticipants((prev) => [...prev, newName.trim()]);
    setNewName("");
  };

  const handleRemoveParticipant = (idx: number) => {
    setParticipants((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
            <RotateCw className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
              Ruleta de Participación en Aula
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full font-semibold border border-indigo-400/20">
                Interacción Docente
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Sortea alumnos de forma aleatoria, transparente y divertida para responder preguntas o salir a la pizarra.
            </p>
          </div>
        </div>

        {/* Load classroom button */}
        {classrooms.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 font-bold outline-none"
            >
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.grade} "{c.section}" ({c.students?.length || 0} alumnos)
                </option>
              ))}
            </select>
            <button
              onClick={handleLoadClassroomStudents}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Cargar Alumnos
            </button>
          </div>
        )}
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left / Center: The Wheel Canvas and Pointer */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
          {/* Top Pointer */}
          <div className="relative">
            {/* The Pointer arrow pointing to the right edge */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-0 h-0 border-y-12 border-y-transparent border-r-24 border-r-amber-400 drop-shadow-md" />

            <canvas
              ref={canvasRef}
              width={380}
              height={380}
              className="w-full max-w-[340px] sm:max-w-[380px] aspect-square rounded-full shadow-lg"
            />
          </div>

          {/* Spin Trigger Button */}
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handleSpin}
              disabled={isSpinning || participants.length < 2}
              className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white text-base font-black rounded-2xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {isSpinning ? "¡Girando ruleta...!" : "¡GIRAR RULETA!"}
            </button>
          </div>

          {/* Winner Announcement Banner */}
          {winner && (
            <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-center animate-bounce shadow-sm">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                🎉 ¡Estudiante Seleccionado!
              </span>
              <span className="text-xl font-black text-amber-950 block mt-0.5">
                {winner}
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Participant List & Settings */}
        <div className="lg:col-span-5 space-y-4">
          {/* Options */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={removeOnSelect}
                onChange={(e) => setRemoveOnSelect(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
              />
              <span>Eliminar al salir (modo sin repetir)</span>
            </label>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              {participants.length} en la ruleta
            </span>
          </div>

          {/* Add participant input */}
          <form onSubmit={handleAddParticipant} className="flex gap-2">
            <input
              type="text"
              placeholder="Nombre del estudiante..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Añadir
            </button>
          </form>

          {/* Participants Chips */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Lista de Participantes ({participants.length})</span>
              {participants.length > 0 && (
                <button
                  onClick={() => setParticipants([])}
                  className="text-[10px] text-rose-500 hover:underline cursor-pointer"
                >
                  Vaciar lista
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto pt-1">
              {participants.map((name, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-medium"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PALETTE[idx % PALETTE.length] }} />
                  {name}
                  <button
                    onClick={() => handleRemoveParticipant(idx)}
                    className="text-slate-400 hover:text-rose-600 text-xs ml-0.5 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Recent History */}
          {history.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Historial de Participaciones</span>
              </h4>
              <div className="space-y-1 max-h-[100px] overflow-y-auto text-xs">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-slate-600 py-0.5">
                    <span className="font-semibold">{h.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
