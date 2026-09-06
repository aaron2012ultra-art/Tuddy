import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Bell, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Volume2, 
  AlertCircle,
  BookOpen,
  Loader2
} from "lucide-react";
import { ScheduleItem, PetCustomization, CustomSubject } from "../types";
import { PetAvatar } from "./AnthropomorphicBunny";
import { DEFAULT_PET, DEFAULT_SUBJECTS } from "../utils/storage";
import confetti from "canvas-confetti";
import { useTranslation } from "../utils/translations";

interface ScheduleModuleProps {
  schedule: ScheduleItem[];
  onSaveSchedule: (items: ScheduleItem[]) => void;
  onRewardCarrot: (amount: number) => void;
  onTuddyCheer?: (message: string) => void;
  pet?: PetCustomization;
  subjects?: CustomSubject[];
  onOpenSubjectManager?: () => void;
  onAddCustomSubject?: (newSubj: CustomSubject) => void;
}

export const ScheduleModule: React.FC<ScheduleModuleProps> = ({
  schedule,
  onSaveSchedule,
  onRewardCarrot,
  onTuddyCheer,
  pet = DEFAULT_PET,
  subjects = DEFAULT_SUBJECTS,
  onOpenSubjectManager,
  onAddCustomSubject,
}) => {
  const { t } = useTranslation();
  const DAYS = [t.daySun, t.dayMon, t.dayTue, t.dayWed, t.dayThu, t.dayFri, t.daySat];
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New item form
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("General");
  const [dayOfWeek, setDayOfWeek] = useState(selectedDay);
  const [startTime, setStartTime] = useState("16:00");
  const [endTime, setEndTime] = useState("17:00");
  const [color, setColor] = useState("#10b981");
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [notes, setNotes] = useState("");
  const [isDetectingSubject, setIsDetectingSubject] = useState(false);
  const [aiDetectionFeedback, setAiDetectionFeedback] = useState<string | null>(null);

  const handleDetectSubjectAI = async () => {
    if (!subject.trim() || isDetectingSubject) return;
    setIsDetectingSubject(true);
    setAiDetectionFeedback(null);
    try {
      const res = await fetch("/api/ai/detect-subject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectName: subject.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.normalizedName) setSubject(data.normalizedName);
        if (data.color) setColor(data.color);
        setAiDetectionFeedback(`✨ IA: ${data.category} · Técnica: ${data.recommendedTechnique}`);

        if (onAddCustomSubject && !subjects.some((s) => s.name.toLowerCase() === data.normalizedName.toLowerCase())) {
          onAddCustomSubject({
            id: "subj-" + Date.now(),
            name: data.normalizedName,
            category: data.category,
            color: data.color,
            recommendedTechnique: data.recommendedTechnique,
            keyConcepts: data.keyConcepts || [],
            createdAt: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDetectingSubject(false);
    }
  };

  // Notification state
  const [notificationsGranted, setNotificationsGranted] = useState(
    typeof Notification !== "undefined" && Notification.permission === "granted"
  );

  // Pomodoro Focus Timer
  const [pomodoroMode, setPomodoroMode] = useState<"study" | "break">("study");
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);

  useEffect(() => {
    let timer: any = null;
    if (pomodoroRunning && pomodoroSeconds > 0) {
      timer = setInterval(() => {
        setPomodoroSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handlePomodoroFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [pomodoroRunning, pomodoroSeconds]);

  const handlePomodoroFinish = () => {
    setPomodoroRunning(false);
    if (pomodoroMode === "study") {
      confetti({ particleCount: 50, spread: 60 });
      onRewardCarrot(5);
      if (onTuddyCheer) onTuddyCheer(`¡Excelente bloque Pomodoro de 25 min! ${pet.name} te sugiere 5 minutos de descanso 🐰🥕`);
      triggerNotification(`🐰 ${pet.name} Pomodoro`, "¡Terminaste tu bloque de estudio de 25 minutos! Hora de estirar las patitas 5 min.");
      setPomodoroMode("break");
      setPomodoroSeconds(5 * 60);
    } else {
      if (onTuddyCheer) onTuddyCheer(`¡Descanso terminado! ${pet.name} está listo para otra ronda con orejitas atentas 🐰✨`);
      triggerNotification(`🐰 ${pet.name} Pomodoro`, "¡Descanso terminado! Hora de volver al estudio.");
      setPomodoroMode("study");
      setPomodoroSeconds(25 * 60);
    }
  };

  const requestNotifications = async () => {
    if (typeof Notification === "undefined") {
      alert("Tu navegador no soporta notificaciones de escritorio.");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      setNotificationsGranted(true);
      triggerNotification(`🐰 ${pet.name} Activado`, "¡Recordatorios de estudio configurados con éxito!");
    }
  };

  const triggerNotification = (title: string, body: string) => {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
      });
    }
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: ScheduleItem = {
      id: "sch-" + Date.now(),
      title,
      subject,
      dayOfWeek,
      startTime,
      endTime,
      color,
      reminderMinutesBefore: reminderMinutes,
      notes,
      isCompleted: false,
    };

    onSaveSchedule([...schedule, newItem]);
    setIsModalOpen(false);
    setTitle("");
    setNotes("");
    setAiDetectionFeedback(null);
    onRewardCarrot(2);
    if (onTuddyCheer) onTuddyCheer(`¡Nuevo horario programado para el ${DAYS[dayOfWeek]}! 🐰📅`);
  };

  const handleToggleComplete = (id: string) => {
    const updated = schedule.map((s) => {
      if (s.id === id) {
        const next = !s.isCompleted;
        if (next) {
          confetti({ particleCount: 30, spread: 50 });
          onRewardCarrot(3);
          if (onTuddyCheer) onTuddyCheer("¡Bloque de estudio completado! ¡Eres imparable! 🥕");
        }
        return { ...s, isCompleted: next };
      }
      return s;
    });
    onSaveSchedule(updated);
  };

  const handleDeleteItem = (id: string) => {
    onSaveSchedule(schedule.filter((s) => s.id !== id));
  };

  // Filter items for selected day
  const dayItems = schedule
    .filter((s) => s.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-indigo-500" />
            {t.scheduleTitle}
          </h2>
          <p className="text-sm text-slate-500">
            {t.scheduleSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenSubjectManager && (
            <button
              type="button"
              onClick={onOpenSubjectManager}
              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-100 transition-colors shadow-xs"
            >
              <BookOpen className="h-4 w-4 text-sky-600" />
              <span>{t.manageSubjects} ({subjects.length})</span>
            </button>
          )}

          {!notificationsGranted ? (
            <button
              type="button"
              onClick={requestNotifications}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors shadow-xs"
            >
              <Bell className="h-4 w-4 text-amber-600" />
              <span>Activar Notificaciones</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => triggerNotification(`🐰 ${pet.name} Recordatorio`, "¡Es momento de repasar tus fichas!")}
              className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-2 text-xs font-semibold hover:bg-emerald-100"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Notificaciones activas</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setDayOfWeek(selectedDay);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>{t.addBlock}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Schedule & Days (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Day of Week Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {DAYS.map((dayName, idx) => {
              const isToday = new Date().getDay() === idx;
              const isSelected = selectedDay === idx;
              const count = schedule.filter((s) => s.dayOfWeek === idx).length;
              return (
                <button
                  key={dayName}
                  type="button"
                  onClick={() => setSelectedDay(idx)}
                  className={`flex flex-col items-center justify-center py-2.5 px-4 rounded-2xl transition-all shrink-0 min-w-[76px] ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-xs font-bold">{dayName.slice(0, 3)}</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    {isToday && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    )}
                    <span className="text-[10px] opacity-75">{count} sesiones</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Schedule list for selected day */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Horario del {DAYS[selectedDay]}</span>
                <span className="text-xs text-slate-400 font-normal">
                  ({dayItems.length} bloques planificados)
                </span>
              </h3>
            </div>

            {dayItems.length === 0 ? (
              <div className="text-center py-12 p-4">
                <div className="flex justify-center mb-2">
                  <PetAvatar pet={pet} size="md" />
                </div>
                <p className="text-sm font-semibold text-slate-700">Sin sesiones para este día</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Agrega un bloque de estudio para no dejar nada a la improvisación.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDayOfWeek(selectedDay);
                    setIsModalOpen(true);
                  }}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3.5 py-1.5 rounded-xl border border-amber-200 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Programar sesión</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {dayItems.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      item.isCompleted
                        ? "bg-slate-50 border-slate-200 opacity-60"
                        : "bg-white border-slate-200 hover:border-amber-300 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleComplete(item.id)}
                        className={`h-6 w-6 rounded-full border flex items-center justify-center transition-colors ${
                          item.isCompleted
                            ? "bg-emerald-500 border-emerald-600 text-white"
                            : "border-slate-300 hover:border-emerald-500"
                        }`}
                      >
                        {item.isCompleted && <CheckCircle2 className="h-4 w-4" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            {item.subject}
                          </span>
                        </div>
                        <h4
                          className={`text-sm font-bold text-slate-900 ${
                            item.isCompleted ? "line-through text-slate-400" : ""
                          }`}
                        >
                          {item.title}
                        </h4>
                        {item.notes && (
                          <p className="text-xs text-slate-500 mt-0.5">{item.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-amber-500" />
                          <span>
                            {item.startTime} - {item.endTime}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Aviso {item.reminderMinutesBefore}m antes
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pomodoro Focus Timer with Tuddy (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl border border-amber-200/90 bg-gradient-to-b from-amber-50/80 via-white to-amber-100/40 p-6 shadow-xs text-center space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
              <span className="flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-amber-500" />
                {t.pomodoroTitle}
              </span>
              <span className="bg-amber-200/70 text-amber-900 px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                {pomodoroMode === "study" ? `📖 ${t.pomodoroFocus}` : `☕ ${t.pomodoroBreak}`}
              </span>
            </div>

            {/* Timer Display */}
            <div className="py-4">
              <div className="text-5xl font-extrabold text-slate-900 tracking-tight font-mono">
                {formatTimer(pomodoroSeconds)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {pomodoroMode === "study"
                  ? "25 " + t.minutes + " - " + t.pomodoroFocus
                  : "5 " + t.minutes + " - " + t.pomodoroBreak}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPomodoroRunning(!pomodoroRunning)}
                className={`inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-bold text-white shadow-xs transition-all active:scale-95 ${
                  pomodoroRunning
                    ? "bg-rose-500 hover:bg-rose-600"
                    : "bg-amber-500 hover:bg-amber-600"
                }`}
              >
                {pomodoroRunning ? (
                  <>
                    <Pause className="h-4 w-4" /> {t.pauseTimer}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> {t.startTimer}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setPomodoroRunning(false);
                  setPomodoroSeconds(pomodoroMode === "study" ? 25 * 60 : 5 * 60);
                }}
                className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-white transition-colors"
                title={t.resetTimer}
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* Mode switch */}
            <div className="pt-2 border-t border-amber-200/60 flex items-center justify-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setPomodoroMode("study");
                  setPomodoroSeconds(25 * 60);
                  setPomodoroRunning(false);
                }}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  pomodoroMode === "study"
                    ? "bg-amber-500 text-white font-bold"
                    : "text-slate-600 hover:bg-amber-100"
                }`}
              >
                25m Estudio
              </button>
              <button
                type="button"
                onClick={() => {
                  setPomodoroMode("break");
                  setPomodoroSeconds(5 * 60);
                  setPomodoroRunning(false);
                }}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  pomodoroMode === "break"
                    ? "bg-amber-500 text-white font-bold"
                    : "text-slate-600 hover:bg-amber-100"
                }`}
              >
                5m Descanso
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ADD SCHEDULE ITEM */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-lg font-bold text-slate-900">Programar Bloque de Estudio</h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Título de la Sesión *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Repasar fórmulas de Física"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Día de la Semana</label>
                    <select
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                    >
                      {DAYS.map((d, idx) => (
                        <option key={d} value={idx}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">Materia (Infinita)</label>
                      <button
                        type="button"
                        onClick={handleDetectSubjectAI}
                        disabled={!subject.trim() || isDetectingSubject}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 disabled:opacity-40"
                      >
                        {isDetectingSubject ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        <span>IA Auto-Detectar</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Escribe cualquier materia (ej: Astrofísica, Francés, Derecho)..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      onBlur={() => {
                        if (subject.trim() && subject.trim().length > 2 && !aiDetectionFeedback) {
                          handleDetectSubjectAI();
                        }
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                    />

                    {aiDetectionFeedback && (
                      <p className="mt-1 text-[11px] text-indigo-600 font-medium bg-indigo-50/70 rounded-lg px-2 py-1 border border-indigo-100">
                        {aiDetectionFeedback}
                      </p>
                    )}

                    {/* Quick chips for registered subjects */}
                    <div className="mt-1.5 flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                      {subjects.slice(0, 8).map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSubject(s.name);
                            setColor(s.color);
                          }}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all ${
                            subject.toLowerCase() === s.name.toLowerCase()
                              ? "bg-slate-800 text-white border-slate-800"
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Hora Inicio</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Hora Fin</label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Aviso / Recordatorio</label>
                    <select
                      value={reminderMinutes}
                      onChange={(e) => setReminderMinutes(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                    >
                      <option value={5}>5 min antes</option>
                      <option value={10}>10 min antes</option>
                      <option value={15}>15 min antes</option>
                      <option value={30}>30 min antes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Color</label>
                    <div className="flex items-center gap-1.5 pt-1">
                      {["#10b981", "#f59e0b", "#6366f1", "#ec4899", "#3b82f6"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={`h-7 w-7 rounded-full border-2 transition-transform ${
                            color === c ? "scale-110 border-slate-900" : "border-transparent"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Notas u Objetivos (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: Completar 20 flashcards"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800"
                  >
                    Guardar Sesión
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
