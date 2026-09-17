import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Layers, 
  BookOpen, 
  CheckCircle2, 
  ClipboardCheck, 
  Send, 
  Copy, 
  Printer, 
  Award, 
  Lightbulb, 
  ArrowRight, 
  RotateCcw,
  Check
} from "lucide-react";
import { TeacherClassroom, TeacherAssignment, TeacherStudentRecord } from "../../types";

interface BetterTaskCreatorProps {
  classrooms: TeacherClassroom[];
  selectedClassroomId: string;
  onAssignTaskToClass: (assignment: TeacherAssignment) => void;
  onNavigateToTasksTab: () => void;
}

export const BetterTaskCreator: React.FC<BetterTaskCreatorProps> = ({
  classrooms,
  selectedClassroomId,
  onAssignTaskToClass,
  onNavigateToTasksTab,
}) => {
  const currentClass = classrooms.find((c) => c.id === selectedClassroomId) || classrooms[0];

  const [targetClassId, setTargetClassId] = useState(currentClass?.id || "");
  const [topic, setTopic] = useState("");
  const [bloomLevel, setBloomLevel] = useState<"recordar" | "comprender" | "aplicar" | "analizar" | "evaluar" | "crear">("aplicar");
  const [taskType, setTaskType] = useState("Resolución de casos y desafíos de la vida real");
  const [maxScore, setMaxScore] = useState(20);
  const [customInstructions, setCustomInstructions] = useState("");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0]
  );

  const [isLoading, setIsLoading] = useState(false);
  const [generatedTask, setGeneratedTask] = useState<any | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [assignedSuccess, setAssignedSuccess] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setGeneratedTask(null);
    setAssignedSuccess(false);

    const targetClass = classrooms.find((c) => c.id === targetClassId) || currentClass;

    try {
      const response = await fetch("/api/ai/teacher/generate-assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: targetClass?.grade || "3° Secundaria",
          subject: targetClass?.subject || "Materia",
          topic: topic.trim(),
          bloomLevel,
          assignmentType: taskType,
          maxScore,
          customInstructions: customInstructions.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Error en servidor al generar la tarea");
      }

      const data = await response.json();
      setGeneratedTask(data);
    } catch (err) {
      console.error("Error generating assignment:", err);
      // Fallback preview
      setGeneratedTask({
        title: `Desafío Práctico: ${topic.trim()} en el Mundo Real`,
        topic: topic.trim(),
        learningGoal: `El estudiante aplica principios clave de ${topic.trim()} para modelar y resolver una problemática auténtica.`,
        realWorldContext: `En el ámbito cotidiano y laboral, dominar ${topic.trim()} permite optimizar recursos y tomar decisiones fundamentadas.`,
        instructionsMarkdown: `### 📋 Pasos para el Estudiante:\n\n1. **Fase 1: Diagnóstico e Investigación**: Revisa los conceptos esenciales de ${topic.trim()} en tu libreta.\n2. **Fase 2: Aplicación Metódica**: Plantea las variables y desarrolla paso a paso la solución justificando cada fórmula o argumento.\n3. **Fase 3: Transferencia**: Escribe un párrafo de reflexión indicando cómo impacta este resultado en la vida real.`,
        deliverablesGuide: "Entrega física en hoja cuadriculada con marco o documento digital PDF ordenado con procedimientos completos.",
        bloomLevel,
        rubricCriteria: [
          {
            criterion: "Comprensión conceptual y planteamiento",
            points: Math.round(maxScore * 0.4),
            description: "Identifica los datos clave y plantea el modelo adecuado sin errores.",
            excellentDescriptor: "Planteamiento impecable y riguroso.",
            needsImprovementDescriptor: "Omite variables esenciales.",
          },
          {
            criterion: "Procedimiento y resolución",
            points: Math.round(maxScore * 0.4),
            description: "Desarrolla paso a paso con coherencia lógica y comprobación.",
            excellentDescriptor: "Cálculos exactos y ordenados.",
            needsImprovementDescriptor: "Saltos lógicos o errores de procedimiento.",
          },
          {
            criterion: "Conclusión y presentación",
            points: Math.max(1, maxScore - Math.round(maxScore * 0.4) * 2),
            description: "Sintetiza la respuesta en el contexto pedido y entrega con pulcritud.",
            excellentDescriptor: "Respuesta clara y bien fundamentada.",
            needsImprovementDescriptor: "Presentación desordenada o sin conclusión.",
          },
        ],
        estimatedTimeMinutes: 45,
        teacherPedagogicalTips: "Al momento de revisar, resalta el razonamiento del estudiante en lugar de evaluar únicamente el resultado final.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignToClassroom = () => {
    if (!generatedTask) return;
    const targetClass = classrooms.find((c) => c.id === targetClassId) || currentClass;
    if (!targetClass) return;

    const studentRecords: Record<string, TeacherStudentRecord> = {};
    targetClass.students.forEach((stu) => {
      studentRecords[stu.id] = {
        studentId: stu.id,
        status: "pending",
      };
    });

    const newAssignment: TeacherAssignment = {
      id: `assign-${Date.now()}`,
      classroomId: targetClass.id,
      title: generatedTask.title,
      subject: targetClass.subject,
      topic: generatedTask.topic || topic,
      dueDate: dueDate || new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
      maxScore: maxScore || 20,
      bloomLevel: generatedTask.bloomLevel || bloomLevel,
      instructions: generatedTask.instructionsMarkdown,
      rubricCriteria: generatedTask.rubricCriteria?.map((r: any) => ({
        criterion: r.criterion,
        points: r.points,
        description: r.description,
      })),
      studentRecords,
      createdAt: new Date().toISOString(),
    };

    onAssignTaskToClass(newAssignment);
    setAssignedSuccess(true);
  };

  const handleCopyText = () => {
    if (!generatedTask) return;
    const fullText = `TITULO: ${generatedTask.title}
META DE APRENDIZAJE: ${generatedTask.learningGoal}
CONTEXTO REAL: ${generatedTask.realWorldContext}

INSTRUCCIONES:
${generatedTask.instructionsMarkdown}

ENTREGABLES:
${generatedTask.deliverablesGuide}

RUBRICA DE CALIFICACION (${maxScore} pts):
${generatedTask.rubricCriteria?.map((c: any) => `- ${c.criterion} (${c.points} pts): ${c.description}`).join("\n") || ""}`;

    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          Diseñador de Mejores Tareas con IA Pedagógica
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Crea tareas auténticas y motivadoras que van más allá de la simple repetición: conectadas a la vida real,
          alineadas a la Taxonomía de Bloom y con rúbricas de evaluación listas para calificar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Parameters (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Target Classroom */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Asignar al Salón
              </label>
              <select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
              >
                {classrooms.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.grade} - Sección "{cls.section}" ({cls.subject})
                  </option>
                ))}
              </select>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tema de la Clase / Unidad *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Ecuaciones Cuadráticas, La Revolución Francesa, Fotosíntesis..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden font-medium"
              />
            </div>

            {/* Bloom Taxonomy Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Nivel Cognitivo (Taxonomía de Bloom)</span>
                <span className="text-[10px] text-purple-600 font-semibold uppercase">
                  {bloomLevel}
                </span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                {[
                  { id: "comprender", label: "Comprender", desc: "Explicar y relacionar" },
                  { id: "aplicar", label: "Aplicar", desc: "Resolver casos reales" },
                  { id: "analizar", label: "Analizar", desc: "Comparar y desglosar" },
                  { id: "evaluar", label: "Evaluar", desc: "Emitir juicios críticos" },
                  { id: "crear", label: "Crear", desc: "Diseñar propuestas nuevas" },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setBloomLevel(lvl.id as any)}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                      bloomLevel === lvl.id
                        ? "bg-purple-50 text-purple-700 border-purple-300 ring-2 ring-purple-100"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div>{lvl.label}</div>
                    <div className="text-[9px] text-slate-400 font-normal mt-0.5">{lvl.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Format Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tipo de Enfoque Pedagógico
              </label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="Resolución de casos y desafíos de la vida real">
                  Desafío práctico con conexión a la vida real
                </option>
                <option value="Mini-proyecto de indagación y propuesta creativa">
                  Mini-proyecto de investigación / propuesta creativa
                </option>
                <option value="Análisis crítico comparativo y debate guiado">
                  Análisis crítico y argumentación
                </option>
                <option value="Práctica progresiva de ejercitación con justificación">
                  Práctica escalonada (básico a avanzado)
                </option>
              </select>
            </div>

            {/* Score & Due date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Puntaje Máximo</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={maxScore}
                  onChange={(e) => setMaxScore(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fecha de Entrega</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Special notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Instrucciones Adicionales del Docente (Opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Ej: Incluir trabajo con material reciclado o que cite el libro de texto pág 45..."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:from-purple-800 active:to-indigo-800 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isLoading ? "Diseñando tarea pedagógica con IA..." : "Generar Mejor Tarea"}</span>
            </button>
          </form>
        </div>

        {/* Right Output: Generated Task Preview (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center my-auto">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h4 className="text-sm font-black text-slate-800">
                Diseñando tarea con rigor pedagógico...
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Estructurando consigna clara, situaciones del mundo real y rúbrica de {maxScore} puntos.
              </p>
            </div>
          ) : generatedTask ? (
            <div className="flex flex-col h-full">
              {/* Task Header & Action Buttons */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                    Taxonomía: {generatedTask.bloomLevel || bloomLevel}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    {generatedTask.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tiempo estimado para el alumno: ~{generatedTask.estimatedTimeMinutes || 45} minutos
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="p-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Copiar texto de la tarea"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? "¡Copiado!" : "Copiar"}</span>
                  </button>

                  <button
                    type="button"
                    disabled={assignedSuccess}
                    onClick={handleAssignToClassroom}
                    className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                      assignedSuccess
                        ? "bg-emerald-600 text-white"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                    }`}
                  >
                    {assignedSuccess ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>¡Asignada al Salón!</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Asignar a este Salón</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {assignedSuccess && (
                <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
                  <span>
                    La tarea ya está registrada en el panel de notas de este grado y sección.
                  </span>
                  <button
                    type="button"
                    onClick={onNavigateToTasksTab}
                    className="font-black underline hover:text-emerald-950 cursor-pointer"
                  >
                    Ir al registro de notas →
                  </button>
                </div>
              )}

              {/* Task Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1 max-h-[620px]">
                {/* Learning Goal Banner */}
                <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-slate-800 space-y-1">
                  <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-600" />
                    Propósito de Aprendizaje:
                  </div>
                  <p className="text-slate-600">{generatedTask.learningGoal}</p>
                </div>

                {/* Real world context */}
                {generatedTask.realWorldContext && (
                  <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs text-slate-800 space-y-1">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      Conexión con el Mundo Real:
                    </div>
                    <p className="text-slate-700">{generatedTask.realWorldContext}</p>
                  </div>
                )}

                {/* Instructions */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Consigna e Instrucciones para el Estudiante
                  </h4>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                    {generatedTask.instructionsMarkdown}
                  </div>
                </div>

                {/* Deliverables */}
                {generatedTask.deliverablesGuide && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Guía de Entregable
                    </h4>
                    <p className="text-xs text-slate-700 bg-white p-3 border border-slate-200 rounded-xl">
                      {generatedTask.deliverablesGuide}
                    </p>
                  </div>
                )}

                {/* Rubric Criteria */}
                {generatedTask.rubricCriteria && generatedTask.rubricCriteria.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Rúbrica de Calificación ({maxScore} Puntos)
                    </h4>
                    <div className="space-y-2">
                      {generatedTask.rubricCriteria.map((c: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{c.criterion}</span>
                            <span className="font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                              {c.points} pts
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px]">{c.description}</p>
                          {c.excellentDescriptor && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[10px]">
                              <div className="bg-emerald-50 text-emerald-800 p-1.5 rounded-lg border border-emerald-200">
                                <strong>Sobresaliente:</strong> {c.excellentDescriptor}
                              </div>
                              <div className="bg-rose-50 text-rose-800 p-1.5 rounded-lg border border-rose-200">
                                <strong>En inicio:</strong> {c.needsImprovementDescriptor}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pedagogical Tips for the Teacher */}
                {generatedTask.teacherPedagogicalTips && (
                  <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl text-xs text-purple-900">
                    <span className="font-bold block mb-1">💡 Consejo de Retroalimentación para el Docente:</span>
                    <span className="text-slate-600">{generatedTask.teacherPedagogicalTips}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center my-auto">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-700">Configura los parámetros de tu tarea</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Selecciona el grado escolar, tema y nivel cognitivo a la izquierda. Tuddy redactará la tarea completa con rúbrica lista para compartir o asignar.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
