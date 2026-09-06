import React from "react";
import { 
  Calendar as CalendarIcon, 
  Sparkles, 
  Upload, 
  ArrowRight, 
  Award, 
  BookOpen, 
  FileText, 
  Languages as LanguagesIcon,
  Flame,
  CheckCircle2,
  Palette
} from "lucide-react";
import { ScheduleItem, StudyNote, ExamSession, UserStats, Flashcard, PetCustomization, CustomSubject } from "../types";
import { AnthropomorphicBunny } from "./AnthropomorphicBunny";
import { DEFAULT_PET, DEFAULT_SUBJECTS } from "../utils/storage";
import { useTranslation } from "../utils/translations";

interface BentoDashboardProps {
  schedule: ScheduleItem[];
  notes: StudyNote[];
  examHistory: ExamSession[];
  stats: UserStats;
  flashcards: Flashcard[];
  onNavigate: (
    tab: "flashcards" | "notes" | "tutor" | "exams" | "schedule" | "languages" | "analytics" | "games",
    title?: string,
    extraData?: Record<string, any>
  ) => void;
  onLaunchExam: (topic: string, notes: string) => void;
  onRewardCarrot: (amount: number) => void;
  onTuddyCheer: (msg: string) => void;
  onOpenMascotModal: () => void;
  pet?: PetCustomization;
  subjects?: CustomSubject[];
  onOpenPetCustomizer?: () => void;
  onOpenSubjectManager?: () => void;
}

export const BentoDashboard: React.FC<BentoDashboardProps> = ({
  schedule,
  notes,
  examHistory,
  stats,
  flashcards,
  onNavigate,
  onLaunchExam,
  onRewardCarrot,
  onTuddyCheer,
  onOpenMascotModal,
  pet = DEFAULT_PET,
  subjects = DEFAULT_SUBJECTS,
  onOpenPetCustomizer,
  onOpenSubjectManager,
}) => {
  const { t } = useTranslation();

  // Pending items today
  const pendingItems = schedule.filter((item) => !item.isCompleted);
  const displaySchedule = schedule.slice(0, 3);

  // Level calculation
  const level = Math.max(1, Math.floor((stats.cardsMastered * 5 + stats.quizzesCompleted * 10 + stats.carrotCoins * 2) / 20) + 1);

  // Language stats or default
  const englishLevel = Math.min(95, 45 + (stats.cardsMastered % 40));
  const japaneseLevel = Math.min(90, 20 + ((stats.quizzesCompleted * 8) % 60));

  // Weekly activity mockup with real weights
  const days = [
    { day: t.dayMon || "LUN", height: 60, val: "60%" },
    { day: t.dayTue || "MAR", height: 80, val: "80%" },
    { day: t.dayWed || "MIE", height: 40, val: "40%" },
    { day: t.dayThu || "JUE", height: 95, val: "95%" },
    { day: t.dayFri || "VIE", height: 70, val: "70%" },
    { day: t.daySat || "SAB", height: 20, val: "20%" },
    { day: t.daySun || "DOM", height: 35, val: "35%" },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-[#4A4A4A]">
      {/* Quick Greeting & Bento Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[#4A4A4A] font-heading">
            {t.bentoGreeting || "Mi Panel Bento de Estudio"}
          </h2>
          <p className="text-xs text-[#7A7A7A] mt-0.5">
            {t.bentoSubtitle || "Organización modular y visual para potenciar tu retención diaria con Tuddy"}
          </p>
        </div>

        {/* Level pill */}
        <div className="flex items-center gap-2">
          <div className="bg-white px-4 py-2 rounded-full border-2 border-[#E8E2D9] text-xs font-bold text-[#4A4A4A] shadow-xs flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#FFB7B2]" />
            <span>{t.level || "Nivel"} {level}: {t.levelMastery || "Maestro del Repaso"}</span>
          </div>
        </div>
      </div>

      {/* FEATURED: MODELOS DE JUEGO ADAPTATIVOS DE TUDDY AI */}
      <div 
        onClick={() => onNavigate("games")}
        className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-5 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all group border-2 border-white"
      >
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white text-2xl group-hover:scale-105 transition-transform shrink-0">
            🎮
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/25 px-2.5 py-0.5 rounded-full text-white">
                ¡Novedad de Tuddy AI!
              </span>
              <span className="text-xs font-black text-amber-100">
                20 Modelos de Juego
              </span>
              <span className="text-[10px] font-bold bg-amber-900/40 text-amber-200 px-2 py-0.5 rounded-full">
                10 Gratis + 10 Plus 👑
              </span>
            </div>
            <h3 className="text-base font-black tracking-tight leading-snug">
              Juegos Adaptativos a tu Materia y Tema
            </h3>
            <p className="text-xs text-white/90 leading-relaxed">
              Tú eliges la materia y el tema en específico, y Tuddy AI adapta cualquiera de los 20 modelos de juego en tiempo real.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate("games");
          }}
          className="px-5 py-2.5 rounded-2xl bg-white text-slate-900 hover:bg-amber-50 font-black text-xs shadow-xs transition-transform group-hover:scale-105 cursor-pointer shrink-0"
        >
          Ver los 20 Juegos →
        </button>
      </div>

      {/* Bento Grid layout matching Design HTML */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* CARD 1: MI HORARIO DE HOY (col-span-8) */}
        <div className="md:col-span-8 bg-white rounded-3xl p-6 border-2 border-[#E8E2D9] shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-xl font-bold text-[#4A4A4A] flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-[#FFB7B2]" />
                  {t.todaySchedule || "Mi Horario de Hoy"}
                </h3>
                <p className="text-xs text-[#7A7A7A] mt-0.5">{t.todayScheduleSub || "Sesiones planificadas y repaso activo"}</p>
              </div>
              <span className="text-xs bg-[#B2E2F2] text-[#4A8A9E] px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider">
                {pendingItems.length} {t.pending || "Pendientes"}
              </span>
            </div>

            <div className="space-y-3">
              {displaySchedule.length > 0 ? (
                displaySchedule.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => onNavigate("schedule")}
                    className={`flex items-center gap-4 bg-[#F8F9FA] p-3.5 rounded-2xl border-l-4 cursor-pointer hover:bg-slate-100 transition-colors ${
                      idx % 2 === 0 ? "border-[#FFB7B2]" : "border-[#B2E2F2]"
                    }`}
                  >
                    <div className="text-xs font-bold w-12 text-[#4A4A4A]">{item.startTime}</div>
                    <div className="flex-grow min-w-0">
                      <div className="text-sm font-bold text-[#4A4A4A] truncate">{item.subject}</div>
                      <div className="text-xs text-[#7A7A7A] truncate">{item.title || item.notes || "Repaso y consolidación"}</div>
                    </div>
                    <div className="bg-white px-3 py-1 rounded-xl text-xs font-bold text-[#4A4A4A] border border-[#E8E2D9] shadow-xs shrink-0">
                      {item.subject.slice(0, 8) || "Estudio"}
                    </div>
                  </div>
                ))
              ) : (
                <div 
                  onClick={() => onNavigate("schedule")}
                  className="flex flex-col items-center justify-center p-6 bg-[#F8F9FA] rounded-2xl border-2 border-dashed border-[#E8E2D9] text-center cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <CalendarIcon className="w-8 h-8 text-[#FFB7B2] mb-1.5 opacity-80" />
                  <div className="text-xs font-bold text-[#4A4A4A]">{t.noPendingSchedule || "No tienes sesiones programadas para hoy"}</div>
                  <div className="text-[11px] text-[#7A7A7A] mt-0.5">{t.planSession || "Haz clic para agendar tu primer bloque de estudio en el horario"}</div>
                </div>
              )}

              {schedule.length > 0 && (
                <div 
                  onClick={() => onNavigate("schedule")}
                  className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-dashed border-[#E8E2D9] text-[#7A7A7A] hover:text-[#4A4A4A] cursor-pointer transition-colors"
                >
                  <div className="text-xs text-[#4A8A9E] font-bold w-full text-center">{t.navSchedule || "Ver calendario completo y Pomodoro"} →</div>
                </div>
              )}
            </div>
          </div>

          {/* AI Notice badge inside schedule */}
          <div className="mt-5 flex items-center justify-between gap-3 bg-[#E8F8EE] p-3.5 rounded-2xl border border-[#B2F2BB]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#B2F2BB] rounded-xl flex items-center justify-center text-lg shadow-xs">
                ✨
              </div>
              <div className="text-xs">
                <div className="font-bold text-[#3E7D46]">{t.aiTutorCard || "IA: Resumen y análisis listos"}</div>
                <div className="text-[#3E7D46]/80 text-[11px]">
                  {notes.length > 0 ? `${t.notesTitle}: ${notes.length}` : t.notesSubtitle}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("notes")}
              className="bg-white text-[#3E7D46] hover:bg-[#B2F2BB]/30 font-bold px-3 py-1 rounded-xl text-xs border border-[#B2F2BB] transition-colors shadow-2xs cursor-pointer"
            >
              {t.navNotes || "Ver Notas"}
            </button>
          </div>
        </div>

        {/* CARD 2: TUDDY MASCOT HERO BENTO CARD (col-span-4) */}
        <div className="md:col-span-4 bg-[#FFB7B2] rounded-3xl p-6 flex flex-col items-center justify-center text-center text-white relative shadow-md overflow-hidden min-h-[340px]">
          {/* Subtle dotted pattern overlay matching Design HTML */}
          <div 
            className="absolute top-0 left-0 w-full h-full opacity-15 pointer-events-none" 
            style={{ backgroundImage: "radial-gradient(#fff 2px, transparent 2px)", backgroundSize: "20px 20px" }}
          />

          <div 
            onClick={onOpenMascotModal}
            className="w-36 h-36 bg-white/95 rounded-full flex items-center justify-center mb-4 shadow-inner relative cursor-pointer hover:scale-105 transition-transform group p-2 border-2 border-white"
            title={`Hablar con ${pet.name}`}
          >
            <AnthropomorphicBunny
              pet={pet}
              mood="cheering"
              size="md"
              isBouncing={false}
              showShadow={false}
            />
            <div className="absolute -top-1 -right-1 bg-yellow-300 text-[#4A4A4A] px-2 py-0.5 rounded-xl rotate-12 text-[10px] font-black border-2 border-white shadow-xs group-hover:rotate-6 transition-transform">
              TUDDY!
            </div>
          </div>

          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="text-2xl font-black tracking-tight font-heading">{pet.name}</h3>
            {onOpenPetCustomizer && (
              <button
                type="button"
                onClick={onOpenPetCustomizer}
                title={t.customizePet || "Personalizar mascota"}
                className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1 transition-colors cursor-pointer"
              >
                <Palette className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="inline-block bg-white/25 backdrop-blur-xs text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider mb-2">
            {t.petMascot || "Compañero"} {pet.personality === "enthusiastic" ? "🔥" : pet.personality === "calm_wise" ? "🍃" : "⚡"}
          </div>

          <p className="text-xs font-medium opacity-95 leading-relaxed mb-4 px-2">
            {pet.personality === "enthusiastic"
              ? `${stats.quizzesCompleted} ${t.examsTitle.toLowerCase()} • ${stats.cardsMastered} ${t.masteredCards.toLowerCase()}`
              : pet.personality === "calm_wise"
              ? `${t.tagline}`
              : `🥕 ${stats.carrotCoins} ${t.carrots}`}
          </p>
          
          <div className="flex flex-col w-full gap-2 z-10">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onNavigate("flashcards")}
                className="bg-white text-[#FFB7B2] hover:bg-[#FAF6F0] font-black py-2.5 px-3 rounded-2xl shadow-sm active:scale-95 transition-all text-xs cursor-pointer"
              >
                {t.studyMode || "Estudiar Fichas"}
              </button>

              {onOpenPetCustomizer && (
                <button
                  type="button"
                  onClick={onOpenPetCustomizer}
                  className="bg-white/25 hover:bg-white/35 text-white font-bold py-2.5 px-3 rounded-2xl border border-white/40 active:scale-95 transition-all text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>{t.customizePet || "Personalizar"}</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenMascotModal}
              className="text-xs text-white/90 hover:text-white font-bold underline decoration-white/40 pt-1 cursor-pointer"
            >
              🥕 {stats.carrotCoins} {t.carrots}
            </button>
          </div>
        </div>

        {/* CARD 3: EXÁMENES SIMULADOS BENTO CARD (col-span-4) */}
        <div className="md:col-span-4 bg-white rounded-3xl p-6 border-2 border-[#E8E2D9] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#4A4A4A] mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-[#B2E2F2] rounded-xl flex items-center justify-center text-sm shadow-2xs">
                📝
              </span>
              {t.examSimulatorCard || "Exámenes Simulados"}
            </h3>

            <div className="space-y-3">
              {examHistory.length > 0 ? (
                examHistory.slice(0, 2).map((ex) => (
                  <div 
                    key={ex.id}
                    onClick={() => onNavigate("exams")}
                    className="p-3.5 bg-[#F8F9FA] rounded-2xl border border-[#E8E2D9] hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <div className="text-[10px] font-bold text-[#4A8A9E] tracking-wider uppercase mb-1">
                      {ex.topic || t.navExams}
                    </div>
                    <div className="text-sm font-bold text-[#4A4A4A] truncate">{ex.title}</div>
                    <div className="flex justify-between mt-2.5 items-center">
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded-lg border border-[#E8E2D9] font-medium text-[#4A4A4A]">
                        {ex.totalQuestions} {t.question}s
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-lg border border-emerald-200">
                        {ex.percentage}% {t.yourScore}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div 
                  onClick={() => onNavigate("exams")}
                  className="p-6 bg-[#F8F9FA] rounded-2xl border-2 border-dashed border-[#E8E2D9] text-center cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="text-2xl mb-1.5">📝</div>
                  <div className="text-xs font-bold text-[#4A4A4A]">{t.examSimulatorCardSub || "Sin exámenes realizados"}</div>
                  <div className="text-[11px] text-[#7A7A7A] mt-0.5">
                    {t.examsSubtitle}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("exams")}
            className="mt-4 w-full bg-[#B2E2F2] hover:bg-[#a2d8e9] text-[#4A8A9E] font-bold py-2 rounded-2xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{t.createExam || "Crear Simulacro Nuevo"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CARD 4: IDIOMAS BENTO CARD (col-span-4) */}
        <div className="md:col-span-4 bg-white rounded-3xl p-6 border-2 border-[#E8E2D9] shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <h3 className="text-lg font-bold text-[#4A4A4A] mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-[#D6B2F2] rounded-xl flex items-center justify-center text-sm shadow-2xs">
                🌐
              </span>
              {t.navLanguages || "Idiomas"}
            </h3>

            <div className="flex flex-col gap-4">
              <div 
                onClick={() => onNavigate("languages")}
                className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity"
              >
                <div className="w-11 h-11 bg-[#F0E6FA] rounded-2xl flex items-center justify-center font-bold text-xl border border-[#D6B2F2]/40 shadow-2xs">
                  🇬🇧
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center text-xs font-bold text-[#4A4A4A]">
                    <span>English</span>
                    <span className="text-[11px] text-[#7A7A7A]">{stats.quizzesCompleted > 0 ? `${englishLevel}%` : t.pending}</span>
                  </div>
                  <div className="w-full bg-[#F0E6FA] h-2.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-[#D6B2F2] h-full rounded-full transition-all duration-500" style={{ width: `${stats.quizzesCompleted > 0 ? englishLevel : 10}%` }}></div>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => onNavigate("languages")}
                className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity"
              >
                <div className="w-11 h-11 bg-[#FFF8E6] rounded-2xl flex items-center justify-center font-bold text-xl border border-[#F2D6B2]/50 shadow-2xs">
                  🇫🇷
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center text-xs font-bold text-[#4A4A4A]">
                    <span>Français</span>
                    <span className="text-[11px] text-[#7A7A7A]">{stats.quizzesCompleted > 0 ? `${japaneseLevel}%` : t.pending}</span>
                  </div>
                  <div className="w-full bg-[#FFF8E6] h-2.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-[#F2D6B2] h-full rounded-full transition-all duration-500" style={{ width: `${stats.quizzesCompleted > 0 ? japaneseLevel : 10}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("languages")}
            className="mt-4 w-full bg-[#F0E6FA] hover:bg-[#e4d3f5] text-[#74459d] font-bold py-2 rounded-2xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{t.languageCardSub || "Practicar Pronunciación & Diálogos"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CARD 5: MIS ARCHIVOS BENTO CARD (col-span-4) */}
        <div className="md:col-span-4 bg-white rounded-3xl p-6 border-2 border-[#E8E2D9] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-[#4A4A4A] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#FFB7B2]" />
              {t.notesTitle || "Mis Archivos & Apuntes"}
            </h3>
            <button
              type="button"
              onClick={() => onNavigate("notes")}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider cursor-pointer"
            >
              {t.newNote || "+ SUBIR PDF"}
            </button>
          </div>

          {notes.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 mt-1">
              {notes.slice(0, 3).map((n) => {
                const isPdf = n.fileAttachmentName?.endsWith(".pdf") || false;
                return (
                  <div 
                    key={n.id}
                    onClick={() => onNavigate("notes")}
                    className="h-20 bg-[#F8F9FA] border border-[#E8E2D9] rounded-2xl flex flex-col items-center justify-center p-1.5 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className={`text-base font-black leading-none ${isPdf ? "text-red-400" : "text-amber-500"}`}>
                      {isPdf ? "PDF" : "DOC"}
                    </div>
                    <div className="text-[9px] mt-1.5 font-bold truncate w-full text-center text-[#4A4A4A]">
                      {n.title}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div 
              onClick={() => onNavigate("notes")}
              className="h-24 bg-[#F8F9FA] border-2 border-dashed border-[#E8E2D9] rounded-2xl flex flex-col items-center justify-center p-2 text-center cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <FileText className="w-6 h-6 text-[#CBD5E1] mb-1" />
              <div className="text-xs font-bold text-[#4A4A4A]">{t.noNotes || "No tienes notas aún"}</div>
              <div className="text-[10px] text-[#7A7A7A] mt-0.5">{t.uploadImage || "Sube un archivo o escribe apuntes"}</div>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-[11px] text-[#7A7A7A]">
            <span>{notes.length} {t.notesTitle.toLowerCase()}</span>
            <span 
              onClick={() => onNavigate("tutor")}
              className="text-[#4A8A9E] font-bold cursor-pointer hover:underline"
            >
              {t.navTutor} →
            </span>
          </div>
        </div>

        {/* CARD 6: EVALUACIÓN A LARGO PLAZO BENTO CARD (col-span-8) */}
        <div className="md:col-span-8 bg-white rounded-3xl p-6 border-2 border-[#E8E2D9] shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-lg font-bold text-[#4A4A4A]">{t.analyticsTitle || "Evaluación a Largo Plazo"}</h3>
              <p className="text-xs text-[#7A7A7A]">{t.analyticsSubtitle || "Curva de retención y frecuencia de repaso semanal"}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs flex items-center gap-1.5 font-medium text-[#4A4A4A]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B2F2BB]"></span> 
                {t.mastery}
              </span>
              <span className="text-xs flex items-center gap-1.5 font-medium text-[#4A4A4A]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B2E2F2]"></span> 
                {t.navExams}
              </span>
            </div>
          </div>

          {/* Weekly vertical bars from Design HTML */}
          <div className="flex items-end justify-between h-28 gap-2.5 px-2 pt-2 border-b border-[#E8E2D9]/70 pb-2">
            {days.map((item) => (
              <div key={item.day} className="flex flex-col items-center gap-2 flex-grow h-full justify-end group">
                <div 
                  className="w-full max-w-[42px] bg-[#F8F9FA] rounded-t-xl relative overflow-hidden flex flex-col justify-end transition-all group-hover:brightness-95"
                  style={{ height: `${item.height}px` }}
                >
                  <div 
                    className="w-full bg-[#B2F2BB] rounded-t-xl transition-all duration-500" 
                    style={{ height: item.val }}
                  />
                </div>
                <div className="text-[10px] font-bold text-[#7A7A7A] group-hover:text-[#4A4A4A]">
                  {item.day}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-[#7A7A7A]">
              {t.weeklyRetention || "Tasa de retención global"}: <strong className="text-[#3E7D46]">{stats.cardsMastered > 0 ? "84%" : "72%"}</strong>
            </span>
            <button
              type="button"
              onClick={() => onNavigate("analytics")}
              className="font-bold text-[#4A8A9E] hover:underline cursor-pointer"
            >
              {t.navAnalytics} →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
