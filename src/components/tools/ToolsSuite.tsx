import React, { useState } from "react";
import { 
  Wrench, 
  Calculator, 
  Coffee, 
  RotateCw, 
  Network, 
  Award, 
  Headphones, 
  Sparkles,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { PetCustomization, TeacherClassroom, StudyNote } from "../../types";
import { ScientificGraphingCalculator } from "./ScientificGraphingCalculator";
import { PomodoroFocusTimer } from "./PomodoroFocusTimer";
import { ClassroomParticipationWheel } from "./ClassroomParticipationWheel";
import { MindMapGenerator } from "./MindMapGenerator";
import { HonorDiplomaGenerator } from "./HonorDiplomaGenerator";
import { AudioStudyReader } from "./AudioStudyReader";
import { DEFAULT_PET } from "../../utils/storage";

export type ToolSubtab = 
  | "calculator" 
  | "pomodoro" 
  | "wheel" 
  | "mindmap" 
  | "diploma" 
  | "audio";

interface ToolsSuiteProps {
  initialTool?: ToolSubtab;
  pet?: PetCustomization;
  classrooms?: TeacherClassroom[];
  notes?: StudyNote[];
  onRewardCarrot?: (amount: number) => void;
  onTuddyCheer?: (msg: string) => void;
}

export const ToolsSuite: React.FC<ToolsSuiteProps> = ({
  initialTool = "calculator",
  pet = DEFAULT_PET,
  classrooms = [],
  notes = [],
  onRewardCarrot,
  onTuddyCheer,
}) => {
  const [activeTool, setActiveTool] = useState<ToolSubtab>(initialTool);

  const toolsList: Array<{
    id: ToolSubtab;
    title: string;
    badge: string;
    desc: string;
    icon: any;
    color: string;
    audience: "Estudiantes" | "Docentes" | "Todos";
  }> = [
    {
      id: "calculator",
      title: "Calculadora & Graficadora",
      badge: "Matemáticas",
      desc: "Trigonometría, álgebra, constantes y trazador de funciones f(x) en 2D.",
      icon: Calculator,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      audience: "Estudiantes",
    },
    {
      id: "pomodoro",
      title: "Pomodoro & Sonidos",
      badge: "Enfoque",
      desc: "Temporizador de 25m con lluvia, olas, cuencos zen y guía de respiración.",
      icon: Coffee,
      color: "text-rose-600 bg-rose-50 border-rose-200",
      audience: "Estudiantes",
    },
    {
      id: "wheel",
      title: "Ruleta de Participación",
      badge: "Aula Activa",
      desc: "Sorteador aleatorio de alumnos con física de giro, ticks y celebración.",
      icon: RotateCw,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      audience: "Docentes",
    },
    {
      id: "mindmap",
      title: "Mapas Mentales",
      badge: "Visual",
      desc: "Generador interactivo de diagramas conceptuales ramificados y exportables.",
      icon: Network,
      color: "text-teal-600 bg-teal-50 border-teal-200",
      audience: "Todos",
    },
    {
      id: "diploma",
      title: "Diplomas de Honor",
      badge: "Reconocimiento",
      desc: "Creador de diplomas escolares con sello dorado, listo para imprimir.",
      icon: Award,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      audience: "Docentes",
    },
    {
      id: "audio",
      title: "Lector a Audio",
      badge: "Auditivo",
      desc: "Narrador de voz con velocidad ajustable para repasar apuntes sin vista.",
      icon: Headphones,
      color: "text-purple-600 bg-purple-50 border-purple-200",
      audience: "Todos",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Tool Switcher */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                Centro de Herramientas de Estudio & Aula
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full font-bold border border-indigo-400/20">
                  Suite 6 en 1
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Herramientas interactivas especializadas para potenciar el aprendizaje del estudiante y facilitar la labor del docente.
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal Navigation Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
          {toolsList.map((t) => {
            const Icon = t.icon;
            const isSelected = activeTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTool(t.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-white text-slate-900 border-white shadow-md scale-102"
                    : "bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${t.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    isSelected ? "bg-slate-100 text-slate-700" : "bg-slate-700 text-slate-300"
                  }`}>
                    {t.badge}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-black truncate">{t.title}</div>
                  <div className="text-[10px] opacity-70 truncate">{t.audience}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tool View */}
      <div>
        {activeTool === "calculator" && (
          <ScientificGraphingCalculator pet={pet} />
        )}

        {activeTool === "pomodoro" && (
          <PomodoroFocusTimer 
            pet={pet} 
            onRewardCarrot={onRewardCarrot} 
            onTuddyCheer={onTuddyCheer} 
          />
        )}

        {activeTool === "wheel" && (
          <ClassroomParticipationWheel classrooms={classrooms} />
        )}

        {activeTool === "mindmap" && (
          <MindMapGenerator />
        )}

        {activeTool === "diploma" && (
          <HonorDiplomaGenerator classrooms={classrooms} />
        )}

        {activeTool === "audio" && (
          <AudioStudyReader pet={pet} notes={notes} />
        )}
      </div>
    </div>
  );
};
