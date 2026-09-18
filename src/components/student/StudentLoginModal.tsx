import React, { useState } from "react";
import { 
  X, 
  KeyRound, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  GraduationCap, 
  School,
  AlertCircle,
  Building,
  User,
  ExternalLink
} from "lucide-react";
import { TeacherClassroom, StudentActiveSession } from "../../types";
import { 
  getStoredInstitutions, 
  findStudentInInstitution,
  findInstitutionByCode 
} from "../../utils/storage";

interface StudentLoginModalProps {
  isOpen: boolean;
  classrooms: TeacherClassroom[];
  onClose: () => void;
  onSuccess: (session: StudentActiveSession) => void;
  onOpenInstitutionRegister?: () => void;
}

export const StudentLoginModal: React.FC<StudentLoginModalProps> = ({
  isOpen,
  classrooms,
  onClose,
  onSuccess,
  onOpenInstitutionRegister,
}) => {
  const [institutionCodeInput, setInstitutionCodeInput] = useState("");
  const [studentCodeInput, setStudentCodeInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInstitutionalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanInstCode = institutionCodeInput.trim().toUpperCase();
    const cleanStudentCode = studentCodeInput.trim().toUpperCase();

    if (!cleanInstCode) {
      setError("Por favor ingresa el Código de Institución proporcionado por tu escuela.");
      return;
    }

    if (!cleanStudentCode) {
      setError("Por favor ingresa tu Código de Alumno (ej: EST-101).");
      return;
    }

    // 1. Search in registered institutions
    const match = findStudentInInstitution(cleanInstCode, cleanStudentCode);

    if (match) {
      const { institution, student } = match;
      const session: StudentActiveSession = {
        institutionId: institution.id,
        institutionCode: institution.institutionCode,
        institutionName: institution.name,
        studentId: student.studentId,
        studentName: student.fullName,
        studentCode: student.studentCode,
        grade: student.grade,
        section: student.section,
        className: `${student.grade} "${student.section}"`,
        subject: "Todas las Materias",
        loggedAt: new Date().toISOString(),
      };
      onSuccess(session);
      return;
    }

    // 2. Fallback check: maybe institution exists, but student code wasn't found
    const inst = findInstitutionByCode(cleanInstCode);
    if (inst) {
      // Show available student codes in this institution for convenience
      const availableCodes = inst.students.map((s) => `${s.studentCode} (${s.fullName})`).join(", ");
      setError(
        `Institución "${inst.name}" encontrada, pero el código "${cleanStudentCode}" no coincide. Códigos registrados: ${availableCodes || "Ninguno aún"}`
      );
      return;
    }

    // 3. Fallback check: legacy classroom code
    const matchedClassroom = classrooms.find(
      (c) => (c.classCode || "").toUpperCase() === cleanInstCode || c.id.toUpperCase() === cleanInstCode
    );

    if (matchedClassroom) {
      const foundStudent = matchedClassroom.students.find(
        (s) => (s.studentCode || "").toUpperCase() === cleanStudentCode
      ) || matchedClassroom.students[0];

      if (foundStudent) {
        const session: StudentActiveSession = {
          classroomId: matchedClassroom.id,
          studentId: foundStudent.id,
          studentName: foundStudent.fullName,
          studentCode: foundStudent.studentCode || `EST-${foundStudent.orderNumber}`,
          className: `${matchedClassroom.grade} "${matchedClassroom.section}"`,
          subject: matchedClassroom.subject,
          grade: matchedClassroom.grade,
          section: matchedClassroom.section,
          loggedAt: new Date().toISOString(),
        };
        onSuccess(session);
        return;
      }
    }

    setError(
      "No se encontró una institución o estudiante con esos códigos. Por favor verifica los códigos proporcionados por la dirección de tu colegio."
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
              <School className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200 block">
                Portal Institucional
              </span>
              <h3 className="text-lg font-black tracking-tight">Acceso de Estudiantes</h3>
              <p className="text-xs text-emerald-100">Ingresa directamente a tu colegio o escuela</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Institutional Form */}
          <form onSubmit={handleInstitutionalLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-indigo-600" />
                  1. Código de Institución / Colegio
                </span>
                <span className="text-[10px] text-slate-400 font-mono">ej: COL-SAN-8921</span>
              </label>
              <input
                type="text"
                required
                value={institutionCodeInput}
                onChange={(e) => setInstitutionCodeInput(e.target.value)}
                placeholder="COL-SAN-8921"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-800 uppercase tracking-wider focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Código brindado por la dirección de tu institución educativa.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600" />
                  2. Tu Código de Alumno
                </span>
                <span className="text-[10px] text-slate-400 font-mono">ej: EST-101</span>
              </label>
              <input
                type="text"
                required
                value={studentCodeInput}
                onChange={(e) => setStudentCodeInput(e.target.value)}
                placeholder="EST-101"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-800 uppercase tracking-wider focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Tu código de matrícula individual en el colegio.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              <span>Ingresar al Portal Institucional</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Register / Manage Institution Link */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">¿Eres director o profesor?</span>
            {onOpenInstitutionRegister && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenInstitutionRegister();
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline cursor-pointer"
              >
                Inscribir o Ver Colegios
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
