import React, { useMemo } from "react";
import { 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  FileText, 
  Printer, 
  Calendar,
  Sparkles,
  BookOpen
} from "lucide-react";
import { 
  TeacherAssignment, 
  TeacherExamRecord, 
  StudentActiveSession 
} from "../../types";

interface StudentGradesViewProps {
  session: StudentActiveSession;
  assignments: TeacherAssignment[];
  exams: TeacherExamRecord[];
}

export const StudentGradesView: React.FC<StudentGradesViewProps> = ({
  session,
  assignments,
  exams,
}) => {
  // Filter assignments for this classroom
  const classAssignments = assignments.filter((a) => a.classroomId === session.classroomId);
  const classExams = exams.filter((e) => e.classroomId === session.classroomId);

  // Compile student scores
  const gradedAssignments = useMemo(() => {
    return classAssignments
      .map((a) => {
        const record = a.studentRecords?.[session.studentId];
        return {
          id: a.id,
          title: a.title,
          topic: a.topic || a.subject,
          dueDate: a.dueDate,
          maxScore: a.maxScore || 20,
          score: record?.score,
          feedback: record?.feedback,
          status: record?.status || "pending",
        };
      })
      .filter((item) => item.score !== undefined);
  }, [classAssignments, session.studentId]);

  const gradedExams = useMemo(() => {
    return classExams
      .map((e) => {
        const gradeEntry = e.grades?.[session.studentId];
        return {
          id: e.id,
          title: e.title,
          topic: e.topic || e.subject,
          date: e.date,
          maxScore: e.maxScore || 20,
          passingScore: e.passingScore || 11,
          weightPercentage: e.weightPercentage,
          score: gradeEntry?.score,
          attended: gradeEntry?.attended ?? true,
          comments: gradeEntry?.comments,
        };
      })
      .filter((item) => item.score !== undefined);
  }, [classExams, session.studentId]);

  // Overall Average
  const summary = useMemo(() => {
    let totalScoreWeighted = 0;
    let totalMaxScoreWeighted = 0;
    let count = 0;

    gradedAssignments.forEach((a) => {
      if (a.score !== undefined) {
        totalScoreWeighted += (a.score / a.maxScore) * 20; // normalize to 20
        totalMaxScoreWeighted += 20;
        count++;
      }
    });

    gradedExams.forEach((e) => {
      if (e.score !== undefined) {
        totalScoreWeighted += (e.score / e.maxScore) * 20; // normalize to 20
        totalMaxScoreWeighted += 20;
        count++;
      }
    });

    const averageOn20 = count > 0 ? (totalScoreWeighted / count) : 0;
    const isPassing = averageOn20 >= 11;

    return {
      averageOn20: averageOn20.toFixed(1),
      count,
      isPassing,
      gradedAssignmentsCount: gradedAssignments.length,
      gradedExamsCount: gradedExams.length,
    };
  }, [gradedAssignments, gradedExams]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Promedio General */}
        <div className="p-5 rounded-3xl bg-linear-to-br from-emerald-600 via-teal-700 to-teal-800 text-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Promedio General</span>
            <Award className="w-5 h-5 text-amber-300" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-black">{summary.count > 0 ? summary.averageOn20 : "--"}</span>
            <span className="text-sm font-semibold text-emerald-200">/ 20</span>
          </div>
          <p className="text-xs text-emerald-100 mt-2 font-medium">
            {summary.count === 0
              ? "Aún no hay calificaciones registradas"
              : summary.isPassing
              ? "Aprobado satisfactoriamente 🎉"
              : "Por debajo del puntaje de aprobación (11)"}
          </p>
        </div>

        {/* Tareas Evaluadas */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tareas Calificadas</span>
          <p className="text-3xl font-black text-slate-900 mt-2">{summary.gradedAssignmentsCount}</p>
          <p className="text-xs text-slate-500 mt-1">
            de {classAssignments.length} tareas totales en el curso
          </p>
        </div>

        {/* Exámenes Evaluados */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exámenes y Pruebas</span>
            <button
              type="button"
              onClick={handlePrint}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 cursor-pointer print:hidden"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Boleta</span>
            </button>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{summary.gradedExamsCount}</p>
          <p className="text-xs text-slate-500 mt-1">
            de {classExams.length} evaluaciones programadas
          </p>
        </div>
      </div>

      {/* Graded Assignments Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Calificaciones de Tareas y Trabajos</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Notas asignadas y comentarios pedagógicos de tu profesor.
            </p>
          </div>
          <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-xl">
            {gradedAssignments.length} registradas
          </span>
        </div>

        {gradedAssignments.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-semibold text-slate-600">No hay tareas calificadas todavía</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Cuando tu profesor revise tus entregas, tus notas aparecerán aquí con sus comentarios.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {gradedAssignments.map((a) => {
              const score = a.score || 0;
              const isPassing = score >= (a.maxScore * 0.55);

              return (
                <div key={a.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {a.topic}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{a.title}</h4>
                    {a.feedback && (
                      <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <p>{a.feedback}</p>
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Nota Obtenida</p>
                    <p
                      className={`text-2xl font-black ${
                        isPassing ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {score} <span className="text-xs text-slate-400">/ {a.maxScore}</span>
                    </p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                        isPassing ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {isPassing ? "Aprobado" : "Desaprobado"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Graded Exams Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Calificaciones de Evaluaciones y Exámenes</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Pruebas parciales, exámenes de unidad y quizes presenciales.
            </p>
          </div>
          <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-xl">
            {gradedExams.length} registradas
          </span>
        </div>

        {gradedExams.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-semibold text-slate-600">No hay exámenes calificados aún</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Las calificaciones de tus exámenes aparecerán aquí cuando el profesor las registre.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {gradedExams.map((e) => {
              const score = e.score || 0;
              const isPassing = score >= e.passingScore;

              return (
                <div key={e.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {e.topic}
                      </span>
                      {e.weightPercentage && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">
                          Peso: {e.weightPercentage}%
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{e.title}</h4>
                    <p className="text-xs text-slate-400">Fecha del examen: {e.date}</p>
                    {e.comments && (
                      <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                        <span className="font-semibold text-slate-900">Observaciones: </span>
                        {e.comments}
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Puntaje</p>
                    <p
                      className={`text-2xl font-black ${
                        isPassing ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {score} <span className="text-xs text-slate-400">/ {e.maxScore}</span>
                    </p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                        isPassing ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {isPassing ? "Aprobado" : "Desaprobado"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
