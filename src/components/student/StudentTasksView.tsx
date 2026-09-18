import React, { useState } from "react";
import { 
  ClipboardCheck, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Send, 
  Sparkles, 
  Award,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from "lucide-react";
import { 
  TeacherAssignment, 
  StudentActiveSession, 
  StudentAssignmentRecord 
} from "../../types";
import { submitStudentWork } from "../../utils/storage";

interface StudentTasksViewProps {
  session: StudentActiveSession;
  assignments: TeacherAssignment[];
  onAssignmentsUpdated: () => void;
}

export const StudentTasksView: React.FC<StudentTasksViewProps> = ({
  session,
  assignments,
  onAssignmentsUpdated,
}) => {
  const [filter, setFilter] = useState<"all" | "pending" | "submitted" | "graded">("all");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Delivery modal / form state
  const [deliveringTaskId, setDeliveringTaskId] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter assignments for this student's classroom
  const classAssignments = assignments.filter((a) => a.classroomId === session.classroomId);

  const getStudentRecord = (task: TeacherAssignment): StudentAssignmentRecord => {
    return task.studentRecords?.[session.studentId] || { studentId: session.studentId, status: "pending" };
  };

  const filteredTasks = classAssignments.filter((task) => {
    const rec = getStudentRecord(task);
    if (filter === "all") return true;
    if (filter === "pending") return rec.status === "pending" || rec.status === "missing";
    if (filter === "submitted") return rec.status === "submitted";
    if (filter === "graded") return rec.status === "graded";
    return true;
  });

  const handleOpenDelivery = (task: TeacherAssignment) => {
    const rec = getStudentRecord(task);
    setSubmissionText(rec.submissionContent || "");
    setDeliveringTaskId(task.id);
  };

  const handleDeliver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveringTaskId || !submissionText.trim()) return;

    setIsSubmitting(true);
    const ok = submitStudentWork(deliveringTaskId, session.studentId, submissionText.trim());
    setIsSubmitting(false);

    if (ok) {
      onAssignmentsUpdated();
      setDeliveringTaskId(null);
      setSubmissionText("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-600" />
            <span>Mis Tareas y Entregas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Revisa las actividades encargadas por tu profesor, consulta las rúbricas y entrega tus respuestas.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Todas ({classAssignments.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === "pending" ? "bg-white text-amber-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pendientes
          </button>
          <button
            type="button"
            onClick={() => setFilter("submitted")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === "submitted" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Entregadas
          </button>
          <button
            type="button"
            onClick={() => setFilter("graded")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === "graded" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Calificadas
          </button>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center">
          <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No hay tareas en esta categoría</h3>
          <p className="text-xs text-slate-400 mt-1">
            {filter === "pending"
              ? "¡Genial! Estás al día con todas tus actividades escolares."
              : "Tu profesor aún no ha publicado tareas para esta sección."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const record = getStudentRecord(task);
            const isPending = record.status === "pending" || record.status === "missing";
            const isSubmitted = record.status === "submitted";
            const isGraded = record.status === "graded";
            const isExpanded = expandedTaskId === task.id;

            return (
              <div
                key={task.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:border-slate-300 transition-all"
              >
                {/* Task Card Header */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isGraded
                          ? "bg-emerald-100 text-emerald-700"
                          : isSubmitted
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {isGraded ? (
                        <Award className="w-5 h-5" />
                      ) : isSubmitted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {task.topic || task.subject}
                        </span>
                        {task.bloomLevel && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                            Nivel: {task.bloomLevel}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{task.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Fecha límite: <strong>{task.dueDate || "Sin fecha fija"}</strong>
                        </span>
                        <span>•</span>
                        <span>Puntaje máx: <strong>{task.maxScore || 20} pts</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right Status Badge & Action */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {isGraded && (
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase text-slate-400">Tu Calificación</p>
                        <p className="text-lg font-black text-emerald-600">
                          {record.score} <span className="text-xs text-slate-400">/ {task.maxScore || 20}</span>
                        </p>
                      </div>
                    )}

                    {isSubmitted && (
                      <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs rounded-xl flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Entregada</span>
                      </span>
                    )}

                    {isPending && (
                      <button
                        type="button"
                        onClick={() => handleOpenDelivery(task)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Entregar Tarea</span>
                      </button>
                    )}

                    {isSubmitted && !isGraded && (
                      <button
                        type="button"
                        onClick={() => handleOpenDelivery(task)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Modificar entrega
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details: Instructions, Rubric & Feedback */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4 bg-slate-50/50 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Instrucciones del Docente</span>
                      </h4>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-line bg-white p-3 rounded-xl border border-slate-200">
                        {task.instructions || "Sin instrucciones específicas adicionales."}
                      </p>
                    </div>

                    {/* Rubric Criteria if any */}
                    {task.rubricCriteria && task.rubricCriteria.length > 0 && (
                      <div>
                        <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          <span>Criterios de Evaluación y Rúbrica</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {task.rubricCriteria.map((crit, cIdx) => (
                            <div key={cIdx} className="p-2.5 bg-white rounded-xl border border-slate-200">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800">{crit.criterion}</span>
                                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md text-[10px]">
                                  {crit.points} pts
                                </span>
                              </div>
                              {crit.description && (
                                <p className="text-[11px] text-slate-500 mt-0.5">{crit.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* If submitted: view what student submitted */}
                    {record.submissionContent && (
                      <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                            Tu respuesta entregada
                          </span>
                          {record.submittedAt && (
                            <span className="text-[10px] text-indigo-600">
                              {new Date(record.submittedAt).toLocaleDateString()} a las{" "}
                              {new Date(record.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                          {record.submissionContent}
                        </p>
                      </div>
                    )}

                    {/* If graded: teacher feedback */}
                    {isGraded && record.feedback && (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                        <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          Retroalimentación de tu Profesor
                        </span>
                        <p className="text-emerald-800 leading-relaxed">
                          {record.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal / Form: Entregar Tarea */}
      {deliveringTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-linear-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Send className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="text-sm font-bold">Entregar Tarea Escolar</h3>
                  <p className="text-[11px] text-emerald-100">
                    Tu respuesta será registrada y enviada directamente a tu profesor
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeliveringTaskId(null)}
                className="text-white/80 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleDeliver} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tu Respuesta, Resumen o Enlace al Trabajo
                </label>
                <textarea
                  required
                  rows={6}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Escribe la solución de tus ejercicios, tus conclusiones o pega el enlace a tu presentación / Google Drive..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Puedes incluir texto libre, fórmulas, explicaciones y enlaces a documentos externos.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeliveringTaskId(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !submissionText.trim()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar y Enviar Entrega</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
