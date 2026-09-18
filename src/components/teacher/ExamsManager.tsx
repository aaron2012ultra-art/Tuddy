import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileSpreadsheet, 
  Plus, 
  Sparkles, 
  Calendar, 
  Award, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Users, 
  Printer, 
  Trash2, 
  ChevronRight, 
  Clock, 
  GraduationCap 
} from "lucide-react";
import { TeacherExamRecord, TeacherClassroom } from "../../types";

interface ExamsManagerProps {
  exams: TeacherExamRecord[];
  onSaveExams: (exams: TeacherExamRecord[]) => void;
  classrooms: TeacherClassroom[];
  selectedClassroomId: string;
  onOpenExamBuilder: () => void;
}

export const ExamsManager: React.FC<ExamsManagerProps> = ({
  exams,
  onSaveExams,
  classrooms,
  selectedClassroomId,
  onOpenExamBuilder,
}) => {
  const currentClass = classrooms.find((c) => c.id === selectedClassroomId) || classrooms[0];

  // Filter exams for current class
  const classExams = exams.filter((e) => e.classroomId === currentClass?.id);
  const [selectedExamId, setSelectedExamId] = useState<string>(classExams[0]?.id || "");

  const activeExam = exams.find((e) => e.id === selectedExamId) || classExams[0];

  // Quick manual exam modal
  const [isNewExamModalOpen, setIsNewExamModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newMaxScore, setNewMaxScore] = useState(20);
  const [newPassingScore, setNewPassingScore] = useState(11);
  const [newWeight, setNewWeight] = useState(25);

  // Edit individual grade modal
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState<number | "">("");
  const [attendanceInput, setAttendanceInput] = useState(true);
  const [commentInput, setCommentInput] = useState("");

  const handleCreateManualExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClass || !newTitle.trim()) return;

    const initialGrades: Record<string, { studentId: string; score: number; attended: boolean; comments?: string }> = {};
    currentClass.students.forEach((stu) => {
      initialGrades[stu.id] = {
        studentId: stu.id,
        score: 0,
        attended: true,
      };
    });

    const newExam: TeacherExamRecord = {
      id: `exam-${Date.now()}`,
      classroomId: currentClass.id,
      title: newTitle.trim(),
      subject: currentClass.subject,
      topic: newTopic.trim() || currentClass.subject,
      date: newDate,
      maxScore: newMaxScore || 20,
      passingScore: newPassingScore || 11,
      weightPercentage: newWeight || 20,
      grades: initialGrades,
      createdAt: new Date().toISOString(),
    };

    const updated = [newExam, ...exams];
    onSaveExams(updated);
    setSelectedExamId(newExam.id);
    setIsNewExamModalOpen(false);
    setNewTitle("");
    setNewTopic("");
  };

  const handleDeleteExam = (examId: string) => {
    if (confirm("¿Estás seguro de eliminar este registro de examen y sus notas?")) {
      const updated = exams.filter((e) => e.id !== examId);
      onSaveExams(updated);
      if (selectedExamId === examId) {
        setSelectedExamId(updated.find((e) => e.classroomId === currentClass?.id)?.id || "");
      }
    }
  };

  const handleOpenGradeModal = (studentId: string) => {
    if (!activeExam) return;
    const existing = activeExam.grades[studentId];
    setEditingStudentId(studentId);
    setGradeInput(existing ? existing.score : "");
    setAttendanceInput(existing ? existing.attended : true);
    setCommentInput(existing?.comments || "");
  };

  const handleSaveStudentGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExam || !editingStudentId) return;

    const updatedGrades = {
      ...activeExam.grades,
      [editingStudentId]: {
        studentId: editingStudentId,
        score: gradeInput === "" ? 0 : Number(gradeInput),
        attended: attendanceInput,
        comments: commentInput.trim() || undefined,
      },
    };

    const updatedExams = exams.map((ex) =>
      ex.id === activeExam.id ? { ...ex, grades: updatedGrades } : ex
    );

    onSaveExams(updatedExams);
    setEditingStudentId(null);
  };

  // Exam Statistics
  const totalStudents = currentClass?.students.length || 0;
  const examGrades = activeExam?.grades || {};
  let totalScore = 0;
  let gradedStudentsCount = 0;
  let passedCount = 0;
  let failedCount = 0;
  let absentCount = 0;

  currentClass?.students.forEach((stu) => {
    const g = examGrades[stu.id];
    if (g) {
      if (!g.attended) {
        absentCount++;
      } else {
        gradedStudentsCount++;
        totalScore += g.score;
        if (g.score >= (activeExam?.passingScore || 11)) {
          passedCount++;
        } else {
          failedCount++;
        }
      }
    }
  });

  const classAverage = gradedStudentsCount > 0 ? (totalScore / gradedStudentsCount).toFixed(1) : "—";
  const passRate = gradedStudentsCount > 0 ? Math.round((passedCount / gradedStudentsCount) * 100) : 0;
  const studentBeingEdited = currentClass?.students.find((s) => s.id === editingStudentId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
            Registro y Calificaciones de Exámenes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lleva el libro de notas de evaluaciones periódicas, bimestrales y mensuales con cálculo automático de promedios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenExamBuilder}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generar Examen Imprimible (IA)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewExamModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Examen</span>
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
          <span className="text-slate-400">({classExams.length} exámenes registrados)</span>
        </div>
      )}

      {!currentClass ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center">
          <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Aún no has creado ningún salón</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
            Para registrar calificaciones y ponderaciones por alumno, primero crea tu grado y sección en la pestaña de Salones y Asistencia. Puedes generar exámenes listos para imprimir con IA en cualquier momento.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenExamBuilder}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Crear Examen Imprimible con IA</span>
            </button>
          </div>
        </div>
      ) : classExams.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center">
          <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No hay exámenes registrados para este salón</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
            Diseña un examen listo para imprimir con clave de corrección usando IA o registra una evaluación ya tomada.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenExamBuilder}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Crear Examen con IA</span>
            </button>
            <button
              type="button"
              onClick={() => setIsNewExamModalOpen(true)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Registrar evaluación manual
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Exams List */}
          <div className="lg:col-span-1 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Exámenes del Periodo
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {classExams.map((exam) => {
                const isSelected = exam.id === activeExam?.id;
                return (
                  <button
                    key={exam.id}
                    onClick={() => setSelectedExamId(exam.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-300 shadow-2xs"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-xs font-bold line-clamp-2 ${isSelected ? "text-indigo-900" : "text-slate-800"}`}>
                        {exam.title}
                      </h4>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isSelected ? "text-indigo-600" : "text-slate-300"}`} />
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {exam.date}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-slate-700">Máx: {exam.maxScore}</span>
                      {exam.weightPercentage && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-600 font-bold">{exam.weightPercentage}%</span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Grades Table & Analysis */}
          {activeExam && (
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Header Info */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/70">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {activeExam.topic || "Evaluación"}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">
                      {activeExam.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Fecha: <strong>{activeExam.date}</strong> • Nota mínima aprobatoria: <strong>{activeExam.passingScore}</strong> / {activeExam.maxScore}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteExam(activeExam.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar este examen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Performance stats banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-200/60">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Promedio Grupal</div>
                    <div className="text-base font-black text-indigo-700 mt-0.5">
                      {classAverage} <span className="text-[10px] text-slate-400">/{activeExam.maxScore}</span>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Aprobados</div>
                    <div className="text-base font-black text-emerald-600 mt-0.5">
                      {passedCount} <span className="text-[10px] text-slate-400">({passRate}%)</span>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">En Recuperación</div>
                    <div className="text-base font-black text-rose-600 mt-0.5">
                      {failedCount}
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Ausentes</div>
                    <div className="text-base font-black text-amber-600 mt-0.5">
                      {absentCount}
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Exam Records Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">Estudiante</th>
                      <th className="py-3 px-4 text-center">Asistencia al Examen</th>
                      <th className="py-3 px-4 text-center">Nota Obtenida</th>
                      <th className="py-3 px-4 text-center">Resultado</th>
                      <th className="py-3 px-4">Observaciones del Docente</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentClass?.students.map((student) => {
                      const gradeRecord = activeExam.grades[student.id];
                      const score = gradeRecord?.score;
                      const attended = gradeRecord ? gradeRecord.attended : true;
                      const isPassing = score !== undefined && score >= activeExam.passingScore;

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-400">
                            {String(student.orderNumber).padStart(2, "0")}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800">
                            {student.fullName}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {attended ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                ✓ Rindió
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                                ✗ No asistió
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center font-bold">
                            {!attended ? (
                              <span className="text-slate-400 text-xs italic">NSP</span>
                            ) : score !== undefined ? (
                              <span className={`text-base font-black ${isPassing ? "text-indigo-900" : "text-rose-600"}`}>
                                {score} <span className="text-[10px] text-slate-400 font-normal">/{activeExam.maxScore}</span>
                              </span>
                            ) : (
                              <span className="text-slate-300 font-mono">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {!attended ? (
                              <span className="text-[10px] text-slate-400 font-medium">Falta justif./injustif.</span>
                            ) : isPassing ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                Aprobado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                                Refuerzo
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {gradeRecord?.comments ? (
                              <span className="line-clamp-1 italic text-[11px] text-slate-600">
                                {gradeRecord.comments}
                              </span>
                            ) : (
                              <span className="text-slate-300 text-[11px] italic">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenGradeModal(student.id)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                            >
                              Modificar Nota
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

      {/* Modal: Editar Nota de Examen */}
      {editingStudentId && studentBeingEdited && activeExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 overflow-hidden"
          >
            <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              Calificación de Examen: {studentBeingEdited.fullName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Examen: {activeExam.title} (Escala: 0 a {activeExam.maxScore} pts)
            </p>

            <form onSubmit={handleSaveStudentGrade} className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attendanceInput}
                    onChange={(e) => setAttendanceInput(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded-md focus:ring-0"
                  />
                  <span>¿El estudiante se presentó a rendir el examen?</span>
                </label>
              </div>

              {attendanceInput && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nota Obtenida (0 - {activeExam.maxScore}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={activeExam.maxScore}
                    step="0.5"
                    required
                    autoFocus
                    placeholder="Ej: 17"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-indigo-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observaciones / Recomendaciones
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Excelente razonamiento deductivo. Programar recuperación si faltó..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStudentId(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Guardar Nota
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal: Registrar Nuevo Examen */}
      {isNewExamModalOpen && currentClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 overflow-hidden"
          >
            <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              Nuevo Registro de Examen
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Salón: {currentClass.grade} - Sección "{currentClass.section}" ({currentClass.subject})
            </p>

            <form onSubmit={handleCreateManualExam} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de la Evaluación *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ej: Examen Mensual 1 / Evaluación Parcial"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Temas Evaluados</label>
                <input
                  type="text"
                  placeholder="Ej: Ecuaciones cuadráticas y funciones"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Puntaje Máx.</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newMaxScore}
                    onChange={(e) => setNewMaxScore(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Nota Mínima</label>
                  <input
                    type="number"
                    min="0"
                    max={newMaxScore}
                    value={newPassingScore}
                    onChange={(e) => setNewPassingScore(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Peso (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fecha de Aplicación</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewExamModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Crear Registro
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
