import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ClipboardCheck, 
  Plus, 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  HelpCircle, 
  FileText, 
  Edit3, 
  Trash2, 
  Download, 
  ChevronRight, 
  Award,
  Layers
} from "lucide-react";
import { TeacherAssignment, TeacherClassroom, TeacherStudentRecord } from "../../types";

interface AssignmentsManagerProps {
  assignments: TeacherAssignment[];
  onSaveAssignments: (assignments: TeacherAssignment[]) => void;
  classrooms: TeacherClassroom[];
  selectedClassroomId: string;
  onOpenBetterTaskCreator: () => void;
}

export const AssignmentsManager: React.FC<AssignmentsManagerProps> = ({
  assignments,
  onSaveAssignments,
  classrooms,
  selectedClassroomId,
  onOpenBetterTaskCreator,
}) => {
  const currentClass = classrooms.find((c) => c.id === selectedClassroomId) || classrooms[0];

  // Filter assignments for selected classroom
  const classAssignments = assignments.filter((a) => a.classroomId === currentClass?.id);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(
    classAssignments[0]?.id || ""
  );

  // Active assignment
  const activeAssignment = assignments.find((a) => a.id === selectedAssignmentId) || classAssignments[0];

  // Modal: Quick new manual assignment
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newMaxScore, setNewMaxScore] = useState(20);
  const [newInstructions, setNewInstructions] = useState("");

  // Modal: Grading individual student
  const [gradingStudentId, setGradingStudentId] = useState<string | null>(null);
  const [inputScore, setInputScore] = useState<number | "">("");
  const [inputStatus, setInputStatus] = useState<"pending" | "submitted" | "graded" | "late" | "missing">("graded");
  const [inputFeedback, setInputFeedback] = useState("");

  const handleCreateManualAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClass || !newTitle.trim()) return;

    const initialRecords: Record<string, TeacherStudentRecord> = {};
    currentClass.students.forEach((stu) => {
      initialRecords[stu.id] = {
        studentId: stu.id,
        status: "pending",
      };
    });

    const newAssignment: TeacherAssignment = {
      id: `assign-${Date.now()}`,
      classroomId: currentClass.id,
      title: newTitle.trim(),
      subject: currentClass.subject,
      topic: newTopic.trim() || currentClass.subject,
      dueDate: newDueDate || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      maxScore: newMaxScore || 20,
      instructions: newInstructions.trim() || undefined,
      studentRecords: initialRecords,
      createdAt: new Date().toISOString(),
    };

    const updated = [newAssignment, ...assignments];
    onSaveAssignments(updated);
    setSelectedAssignmentId(newAssignment.id);
    setIsManualModalOpen(false);
    setNewTitle("");
    setNewTopic("");
    setNewInstructions("");
  };

  const handleDeleteAssignment = (assignId: string) => {
    if (confirm("¿Estás seguro de eliminar esta tarea y su registro de notas?")) {
      const updated = assignments.filter((a) => a.id !== assignId);
      onSaveAssignments(updated);
      if (selectedAssignmentId === assignId) {
        setSelectedAssignmentId(updated.find((a) => a.classroomId === currentClass?.id)?.id || "");
      }
    }
  };

  const handleOpenGrading = (studentId: string) => {
    if (!activeAssignment) return;
    const record = activeAssignment.studentRecords[studentId];
    setGradingStudentId(studentId);
    setInputScore(record?.score !== undefined ? record.score : "");
    setInputStatus(record?.status || "submitted");
    setInputFeedback(record?.feedback || "");
  };

  const handleSaveStudentGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignment || !gradingStudentId) return;

    const updatedRecords = {
      ...activeAssignment.studentRecords,
      [gradingStudentId]: {
        studentId: gradingStudentId,
        score: inputScore === "" ? undefined : Number(inputScore),
        status: inputStatus,
        feedback: inputFeedback.trim() || undefined,
        checkedByTeacher: true,
      },
    };

    const updatedAssignments = assignments.map((a) =>
      a.id === activeAssignment.id ? { ...a, studentRecords: updatedRecords } : a
    );

    onSaveAssignments(updatedAssignments);
    setGradingStudentId(null);
  };

  const handleMarkAllSubmitted = () => {
    if (!activeAssignment || !currentClass) return;
    const updatedRecords = { ...activeAssignment.studentRecords };
    currentClass.students.forEach((s) => {
      const current = updatedRecords[s.id];
      if (!current || current.status === "pending") {
        updatedRecords[s.id] = {
          studentId: s.id,
          status: "submitted",
        };
      }
    });

    const updated = assignments.map((a) =>
      a.id === activeAssignment.id ? { ...a, studentRecords: updatedRecords } : a
    );
    onSaveAssignments(updated);
  };

  // Calculate statistics for active assignment
  const totalStudents = currentClass?.students.length || 0;
  const records = activeAssignment?.studentRecords || {};
  let deliveredCount = 0;
  let gradedCount = 0;
  let totalScoreSum = 0;
  let scoreCount = 0;

  currentClass?.students.forEach((stu) => {
    const rec = records[stu.id];
    if (rec?.status === "submitted" || rec?.status === "graded") deliveredCount++;
    if (rec?.status === "graded") gradedCount++;
    if (rec?.score !== undefined) {
      totalScoreSum += rec.score;
      scoreCount++;
    }
  });

  const averageScore = scoreCount > 0 ? (totalScoreSum / scoreCount).toFixed(1) : "—";
  const studentBeingGraded = currentClass?.students.find((s) => s.id === gradingStudentId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-indigo-600" />
            Registro y Control de Tareas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitorea el cumplimiento de tareas escolares por estudiante, califica con retroalimentación y gestiona rúbricas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenBetterTaskCreator}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Crear Mejor Tarea con IA</span>
          </button>

          <button
            type="button"
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registro Rápido</span>
          </button>
        </div>
      </div>

      {/* Classroom Context */}
      {currentClass && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Salón activo:</span>
          <span className="font-bold text-slate-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
            {currentClass.grade} — Sección {currentClass.section} ({currentClass.subject})
          </span>
          <span className="text-slate-400">({classAssignments.length} tareas registradas)</span>
        </div>
      )}

      {!currentClass ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center">
          <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Aún no has creado ningún salón</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
            Para asignar tareas y calificar a tus alumnos, primero crea tu grado y sección en la pestaña de Salones y Asistencia. También puedes usar el generador pedagógico con IA para diseñar tu material didáctico.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenBetterTaskCreator}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Diseñar Tarea Pedagógica con IA</span>
            </button>
          </div>
        </div>
      ) : classAssignments.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center">
          <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No hay tareas registradas en este salón</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
            Crea una tarea pedagógica enriquecida con la IA de Tuddy o añade un registro manual rápido para controlar notas.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenBetterTaskCreator}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Diseñar Tarea con IA</span>
            </button>
            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Registro manual
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: List of assignments */}
          <div className="lg:col-span-1 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Tareas Asignadas
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {classAssignments.map((assign) => {
                const isSelected = assign.id === activeAssignment?.id;
                return (
                  <button
                    key={assign.id}
                    onClick={() => setSelectedAssignmentId(assign.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-300 shadow-2xs"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-xs font-bold line-clamp-2 ${isSelected ? "text-indigo-900" : "text-slate-800"}`}>
                        {assign.title}
                      </h4>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isSelected ? "text-indigo-600" : "text-slate-300"}`} />
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Vence: {assign.dueDate}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-slate-700">{assign.maxScore} pts</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Grade & Delivery Tracker */}
          {activeAssignment && (
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Assignment Top Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/70">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {activeAssignment.topic || "Tema de Clase"}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">
                      {activeAssignment.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Fecha límite: <strong>{activeAssignment.dueDate}</strong> • Puntaje máx: <strong>{activeAssignment.maxScore} pts</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleMarkAllSubmitted}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      title="Marcar todos los estudiantes como entregados"
                    >
                      ✓ Todos entregaron
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAssignment(activeAssignment.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar tarea"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Metrics ribbon */}
                <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-200/60">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Entregadas</div>
                    <div className="text-base font-black text-slate-800 mt-0.5">
                      {deliveredCount} / {totalStudents}
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Calificadas</div>
                    <div className="text-base font-black text-indigo-600 mt-0.5">
                      {gradedCount} / {totalStudents}
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Promedio</div>
                    <div className="text-base font-black text-emerald-600 mt-0.5">
                      {averageScore} <span className="text-[10px] text-slate-400">/ {activeAssignment.maxScore}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions preview if available */}
              {activeAssignment.instructions && (
                <div className="p-4 bg-indigo-50/40 border-b border-indigo-100/60 text-xs text-slate-700">
                  <span className="font-bold text-indigo-900 block mb-0.5">📋 Consigna de la Tarea:</span>
                  <div className="line-clamp-2 text-slate-600">{activeAssignment.instructions}</div>
                </div>
              )}

              {/* Students Ledger Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">Estudiante</th>
                      <th className="py-3 px-4 text-center">Estado de Entrega</th>
                      <th className="py-3 px-4 text-center">Calificación</th>
                      <th className="py-3 px-4">Retroalimentación Docente</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentClass?.students.map((student) => {
                      const record = activeAssignment.studentRecords[student.id];
                      const status = record?.status || "pending";
                      const score = record?.score;

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-400">
                            {String(student.orderNumber).padStart(2, "0")}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-800">{student.fullName}</span>
                            {student.specialNeeds && (
                              <span className="block text-[10px] text-purple-600 font-medium">
                                DUA: {student.specialNeeds}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              status === "graded"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : status === "submitted"
                                ? "bg-sky-50 text-sky-700 border border-sky-200"
                                : status === "late"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : status === "missing"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-slate-100 text-slate-600"
                            }`}>
                              {status === "graded" && "✓ Calificado"}
                              {status === "submitted" && "Entregado"}
                              {status === "pending" && "Pendiente"}
                              {status === "late" && "Entregado Tarde"}
                              {status === "missing" && "No Entregó"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-bold">
                            {score !== undefined ? (
                              <span className={`text-sm ${
                                score >= activeAssignment.maxScore * 0.6
                                  ? "text-indigo-700 font-black"
                                  : "text-rose-600 font-black"
                              }`}>
                                {score} <span className="text-[10px] text-slate-400 font-normal">/{activeAssignment.maxScore}</span>
                              </span>
                            ) : (
                              <span className="text-slate-300 font-mono">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {record?.feedback ? (
                              <span className="line-clamp-1 italic text-[11px] text-slate-600">
                                "{record.feedback}"
                              </span>
                            ) : (
                              <span className="text-slate-300 text-[11px] italic">Sin comentarios</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenGrading(student.id)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                            >
                              {score !== undefined ? "Editar Nota" : "Calificar"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Calificar a un estudiante */}
      {gradingStudentId && studentBeingGraded && activeAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 overflow-hidden"
          >
            <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              Calificar Tarea: {studentBeingGraded.fullName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Tarea: {activeAssignment.title} (Máx: {activeAssignment.maxScore} pts)
            </p>

            <form onSubmit={handleSaveStudentGrade} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nota / Puntaje (0 - {activeAssignment.maxScore})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={activeAssignment.maxScore}
                    step="0.5"
                    required
                    autoFocus
                    placeholder="Ej: 18"
                    value={inputScore}
                    onChange={(e) => setInputScore(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-indigo-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estado de Entrega</label>
                  <select
                    value={inputStatus}
                    onChange={(e: any) => setInputStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="graded">Calificado</option>
                    <option value="submitted">Entregado a tiempo</option>
                    <option value="late">Entregado tarde</option>
                    <option value="missing">No entregó</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Retroalimentación Pedagógica para el Alumno
                </label>
                <textarea
                  rows={3}
                  placeholder="Ej: Excelente planteamiento del ejercicio 2. Te recomiendo revisar el cálculo final de unidades."
                  value={inputFeedback}
                  onChange={(e) => setInputFeedback(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingStudentId(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Guardar Calificación
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal: Crear Tarea Manual Rápida */}
      {isManualModalOpen && currentClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 overflow-hidden"
          >
            <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-indigo-600" />
              Nueva Tarea para {currentClass.grade} - Sec. "{currentClass.section}"
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Crea una columna en el registro para calificar la tarea de todos tus estudiantes.
            </p>

            <form onSubmit={handleCreateManualAssignment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título de la Tarea *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ej: Práctica Calificada: Leyes de Newton"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tema / Unidad</label>
                  <input
                    type="text"
                    placeholder="Ej: Dinámica"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Puntaje Máximo</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newMaxScore}
                    onChange={(e) => setNewMaxScore(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fecha de Entrega</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instrucciones o Consigna (Opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre páginas del libro o formato de entrega..."
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Crear y Asignar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
