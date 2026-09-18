import React, { useState } from "react";
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  QrCode, 
  KeyRound, 
  GraduationCap, 
  Sparkles, 
  Users, 
  ExternalLink,
  ShieldCheck,
  BookOpen
} from "lucide-react";
import { TeacherClassroom, TeacherStudent } from "../../types";

interface StudentAccessCardsModalProps {
  classroom: TeacherClassroom;
  teacherName?: string;
  onClose: () => void;
}

export const StudentAccessCardsModal: React.FC<StudentAccessCardsModalProps> = ({
  classroom,
  teacherName = "Profesor",
  onClose,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header (No print) */}
        <div className="p-6 bg-linear-to-r from-indigo-700 via-indigo-800 to-indigo-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
              <Users className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">Fichas de Acceso para Estudiantes</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold">
                  {classroom.grade} {classroom.section}
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Entrega a cada alumno su código individual para que ingrese a su Portal del Estudiante.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-900 text-xs font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Fichas</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Instructions banner */}
        <div className="px-6 py-3.5 bg-amber-50 border-b border-amber-200 flex items-start gap-3 shrink-0 print:hidden">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <p className="font-bold">¿Cómo ingresan los estudiantes a su portal?</p>
            <p className="mt-0.5 text-amber-800">
              El alumno solo debe presionar <span className="font-bold underline">"Mi Salón / Estudiante"</span> en Tuddy, ingresar el <strong>Código de Salón ({classroom.classCode || "MAT-3B"})</strong> y su <strong>Código de Alumno</strong>. Podrá ver sus tareas, su récord de asistencia, calificaciones y enviar consultas.
            </p>
          </div>
        </div>

        {/* Printable Cards Grid */}
        <div className="p-6 overflow-y-auto space-y-6">
          {classroom.students.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-semibold text-slate-600">Aún no hay estudiantes registrados en este salón</p>
              <p className="text-xs text-slate-400 mt-1">Agrega estudiantes en la pestaña de Salones para generar sus fichas de acceso.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
              {classroom.students.map((student, idx) => {
                const sCode = student.studentCode || `EST-${(idx + 1).toString().padStart(2, "0")}`;
                return (
                  <div
                    key={student.id}
                    className="p-4 rounded-2xl border-2 border-dashed border-indigo-200 bg-linear-to-br from-indigo-50/50 via-white to-slate-50 relative group transition-all hover:border-indigo-400 print:break-inside-avoid print:border-slate-400"
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                          #{student.orderNumber || idx + 1}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800 line-clamp-1">{student.fullName}</p>
                          <p className="text-[10px] text-slate-400">{classroom.grade} "{classroom.section}" • {classroom.subject}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                        Tuddy
                      </span>
                    </div>

                    {/* Codes Section */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Código de Salón</p>
                        <p className="font-mono font-black text-xs text-indigo-900 mt-0.5 tracking-wider">
                          {classroom.classCode || "MAT-3B"}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-2xs">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-200">Código de Alumno</p>
                        <p className="font-mono font-black text-xs text-amber-300 mt-0.5 tracking-wider">
                          {sCode}
                        </p>
                      </div>
                    </div>

                    {/* Teacher & instructions footer */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Docente: <strong>{teacherName}</strong></span>
                      <button
                        type="button"
                        onClick={() => handleCopy(`Salón: ${classroom.classCode}\nCódigo Alumno (${student.fullName}): ${sCode}`, student.id)}
                        className="flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 print:hidden cursor-pointer"
                      >
                        {copiedCode === student.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer (No print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 print:hidden">
          <p className="text-xs text-slate-500">
            Total: <strong>{classroom.students.length}</strong> estudiantes listos para vincularse.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
