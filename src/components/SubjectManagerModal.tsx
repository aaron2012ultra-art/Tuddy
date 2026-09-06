import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Plus, 
  Sparkles, 
  Trash2, 
  BookOpen, 
  Brain, 
  Calendar, 
  Check, 
  Tag, 
  Compass, 
  Loader2,
  ArrowRight
} from "lucide-react";
import { CustomSubject, PetCustomization, ScheduleItem } from "../types";
import confetti from "canvas-confetti";

interface SubjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: CustomSubject[];
  onSaveSubjects: (subjects: CustomSubject[]) => void;
  onAddScheduleItem?: (item: ScheduleItem) => void;
  pet: PetCustomization;
  onRewardCarrot: (amount: number) => void;
}

export const SubjectManagerModal: React.FC<SubjectManagerModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onSaveSubjects,
  onAddScheduleItem,
  pet,
  onRewardCarrot,
}) => {
  const [newSubjectInput, setNewSubjectInput] = useState("");
  const [contextInput, setContextInput] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedResult, setDetectedResult] = useState<any | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  if (!isOpen) return null;

  const handleDetectSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectInput.trim() || isDetecting) return;

    setIsDetecting(true);
    setDetectedResult(null);

    try {
      const res = await fetch("/api/ai/detect-subject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectName: newSubjectInput.trim(),
          context: contextInput.trim(),
        }),
      });

      if (!res.ok) throw new Error("Detection error");
      const data = await res.json();
      setDetectedResult(data);
    } catch (err) {
      console.error("Subject detection error:", err);
      // Fallback
      setDetectedResult({
        normalizedName: newSubjectInput.trim(),
        category: "Academia General",
        color: "#FFB7B2",
        recommendedTechnique: "Repaso Espaciado y Práctica Distribuida",
        keyConcepts: ["Fundamentos teóricos", "Resolución de ejercicios", "Repaso activo"],
        welcomeMessage: `¡Materia añadida! ${pet.name} preparará consejos especiales para dominarla. 🐰✨`,
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const handleConfirmAddSubject = () => {
    if (!detectedResult && !newSubjectInput.trim()) return;

    const nameToAdd = detectedResult?.normalizedName || newSubjectInput.trim();
    const alreadyExists = subjects.some((s) => s.name.toLowerCase() === nameToAdd.toLowerCase());

    if (alreadyExists) {
      alert("Esta materia ya está registrada en tu catálogo.");
      return;
    }

    const newSubject: CustomSubject = {
      id: "subj-" + Date.now(),
      name: nameToAdd,
      category: detectedResult?.category || "General",
      color: detectedResult?.color || "#FFB7B2",
      recommendedTechnique: detectedResult?.recommendedTechnique || "Active Recall",
      keyConcepts: detectedResult?.keyConcepts || [],
      createdAt: new Date().toISOString(),
    };

    onSaveSubjects([...subjects, newSubject]);
    onRewardCarrot(3);
    confetti({ particleCount: 35, spread: 55 });

    // Reset inputs
    setNewSubjectInput("");
    setContextInput("");
    setDetectedResult(null);
  };

  const handleDeleteSubject = (id: string) => {
    if (subjects.length <= 1) {
      alert("Debes conservar al menos una materia en tu catálogo.");
      return;
    }
    onSaveSubjects(subjects.filter((s) => s.id !== id));
  };

  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl rounded-3xl bg-[#FDF9F3] p-5 sm:p-7 shadow-2xl border-2 border-[#E8E2D9] relative my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#E8E2D9] pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#B2E2F2] flex items-center justify-center text-xl shadow-xs">
              📚
            </div>
            <div>
              <h3 className="text-xl font-black text-[#4A4A4A] font-heading flex items-center gap-2">
                Materias Infinitas & Detección IA
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded-full border border-[#E8E2D9] text-[#7A7A7A]">
                  Sin Límites
                </span>
              </h3>
              <p className="text-xs text-[#7A7A7A]">
                Escribe cualquier materia o carrera; la IA de {pet.name} la clasificará, recomendará técnicas y asignará colores.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#7A7A7A] hover:text-[#4A4A4A] hover:bg-white/80 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 overflow-y-auto pr-1">
          {/* LEFT: Add any subject with AI Detection (5 cols) */}
          <div className="md:col-span-6 space-y-4">
            <form onSubmit={handleDetectSubject} className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-[#E8E2D9] shadow-xs space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#4A4A4A] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Escribir Nueva Materia</span>
              </h4>

              <div>
                <label className="block text-[11px] font-bold text-[#4A4A4A] mb-1">
                  Nombre de la Materia *
                </label>
                <input
                  type="text"
                  required
                  value={newSubjectInput}
                  onChange={(e) => setNewSubjectInput(e.target.value)}
                  placeholder="Ej: Bioquímica Clínica, Neuroanatomía, Python..."
                  className="w-full rounded-xl border-2 border-[#E8E2D9] bg-[#FDF9F3] p-2.5 text-xs font-bold text-[#4A4A4A] focus:outline-hidden focus:border-[#FFB7B2] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#7A7A7A] mb-1">
                  Contexto o Nivel (opcional)
                </label>
                <input
                  type="text"
                  value={contextInput}
                  onChange={(e) => setContextInput(e.target.value)}
                  placeholder="Ej: Universidad 2do año, Examen final, B2..."
                  className="w-full rounded-xl border-2 border-[#E8E2D9] bg-[#FDF9F3] p-2 text-xs text-[#4A4A4A] focus:outline-hidden focus:border-[#FFB7B2]"
                />
              </div>

              <button
                type="submit"
                disabled={isDetecting || !newSubjectInput.trim()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FFB7B2] px-4 py-2.5 text-xs font-black text-white hover:bg-[#ffa5a0] disabled:opacity-50 transition-all shadow-xs"
              >
                {isDetecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Clasificando con IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Detectar & Analizar con IA</span>
                  </>
                )}
              </button>
            </form>

            {/* AI DETECTION RESULT PREVIEW */}
            <AnimatePresence>
              {detectedResult && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white p-4 rounded-3xl border-2 border-[#FFB7B2] shadow-sm space-y-2.5"
                >
                  <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-2">
                    <span className="text-[10px] font-black uppercase text-[#FFB7B2] bg-rose-50 px-2 py-0.5 rounded-full">
                      Clasificación IA Lista
                    </span>
                    <span 
                      className="w-4 h-4 rounded-full border border-[#CBD5E1]" 
                      style={{ backgroundColor: detectedResult.color }} 
                    />
                  </div>

                  <div>
                    <h5 className="text-sm font-black text-[#4A4A4A] font-heading">
                      {detectedResult.normalizedName}
                    </h5>
                    <p className="text-[11px] text-[#7A7A7A]">
                      Área: <strong>{detectedResult.category}</strong>
                    </p>
                  </div>

                  <div className="bg-[#FFF8E6] p-2.5 rounded-xl border border-[#FDE68A] text-xs">
                    <span className="font-bold text-[#B45309] block text-[10px] uppercase">
                      💡 Técnica de estudio sugerida:
                    </span>
                    <p className="text-[#4A4A4A] text-[11px] mt-0.5">
                      {detectedResult.recommendedTechnique}
                    </p>
                  </div>

                  {detectedResult.keyConcepts && detectedResult.keyConcepts.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {detectedResult.keyConcepts.map((c: string, idx: number) => (
                        <span key={idx} className="text-[9px] font-bold bg-[#F1F5F9] text-[#4A4A4A] px-2 py-0.5 rounded-md">
                          #{c}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-[11px] text-[#4A4A4A] italic bg-[#FDF9F3] p-2 rounded-xl border border-[#E8E2D9]">
                    "{detectedResult.welcomeMessage}"
                  </p>

                  <button
                    type="button"
                    onClick={handleConfirmAddSubject}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                  >
                    <Check className="h-4 w-4" />
                    <span>Guardar Materia en Mi Plan</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Current Infinite Subject Catalogue (6 cols) */}
          <div className="md:col-span-6 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#4A4A4A]">
                Tus Materias Registradas ({subjects.length})
              </h4>
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Buscar materia..."
                className="rounded-xl border border-[#E8E2D9] bg-white px-2.5 py-1 text-[11px] text-[#4A4A4A] focus:outline-hidden focus:border-[#FFB7B2] w-36"
              />
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[380px] pr-1">
              {filteredSubjects.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-white p-3.5 rounded-2xl border-2 border-[#E8E2D9] flex items-start justify-between gap-3 hover:border-[#FFB7B2]/60 transition-all shadow-2xs"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 mt-1 shadow-2xs"
                      style={{ backgroundColor: sub.color || "#FFB7B2" }}
                    />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-[#4A4A4A] truncate font-heading">
                        {sub.name}
                      </h5>
                      <span className="text-[10px] text-[#7A7A7A] block">
                        {sub.category || "General"}
                      </span>
                      {sub.recommendedTechnique && (
                        <p className="text-[10px] text-[#4A4A4A] mt-1 line-clamp-1 bg-[#FDF9F3] px-2 py-0.5 rounded-md border border-[#E8E2D9]">
                          🎯 {sub.recommendedTechnique}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteSubject(sub.id)}
                    title="Eliminar materia"
                    className="text-[#CBD5E1] hover:text-rose-500 p-1 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {filteredSubjects.length === 0 && (
                <div className="text-center py-8 text-[#7A7A7A] text-xs">
                  No se encontraron materias con ese nombre.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-[#E8E2D9] pt-3 mt-4 flex items-center justify-between shrink-0">
          <span className="text-xs text-[#7A7A7A]">
            💡 Las materias que registres aquí se sincronizan al instante en tu horario, notas y exámenes.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-[#FFB7B2] px-5 py-2 text-xs font-bold text-white hover:bg-[#ffa5a0] transition-all shadow-xs"
          >
            Listo
          </button>
        </div>
      </motion.div>
    </div>
  );
};
