import React, { useState, useRef } from "react";
import { 
  Award, 
  Printer, 
  Sparkles, 
  GraduationCap, 
  Building, 
  Download, 
  FileText, 
  UserCheck 
} from "lucide-react";
import { TeacherClassroom } from "../../types";
import confetti from "canvas-confetti";

interface HonorDiplomaGeneratorProps {
  classrooms?: TeacherClassroom[];
  defaultInstitutionName?: string;
  defaultTeacherName?: string;
}

export const HonorDiplomaGenerator: React.FC<HonorDiplomaGeneratorProps> = ({
  classrooms = [],
  defaultInstitutionName = "Colegio Nacional de Excelencia",
  defaultTeacherName = "Prof. Alejandro Valdivia",
}) => {
  const [institution, setInstitution] = useState(defaultInstitutionName);
  const [studentName, setStudentName] = useState("Mateo Benítez");
  const [reason, setReason] = useState(
    "Por su sobresaliente desempeño académico, dedicación y compromiso ejemplar en la materia de Ciencias Naturales durante el periodo escolar."
  );
  const [diplomaTitle, setDiplomaTitle] = useState("DIPLOMA DE MÉRITO Y EXCELENCIA");
  const [teacherName, setTeacherName] = useState(defaultTeacherName);
  const [directorName, setDirectorName] = useState("Dra. Carmen Soto (Directora)");
  const [dateStr, setDateStr] = useState("19 de Septiembre de 2026");

  const handlePrint = () => {
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    window.print();
  };

  // Quick preset reasons
  const presetReasons = [
    {
      label: "Primer Puesto Académico",
      title: "DIPLOMA DE EXCELENCIA ACADÉMICA",
      text: "Por haber obtenido el Primer Puesto en aprovechamiento académico y conducta intachable durante el presente ciclo escolar.",
    },
    {
      label: "Esfuerzo y Superación",
      title: "RECONOCIMIENTO AL MÉRITO Y ESFUERZO",
      text: "Por demostrar una admirable constancia, espíritu de superación y mejora continua en sus actividades y proyectos escolares.",
    },
    {
      label: "Feria de Ciencias & Robótica",
      title: "DIPLOMA DE HONOR CIENTÍFICO",
      text: "Por su destacada participación e innovación en la Feria Científica y Tecnológica Escolar 2026.",
    },
    {
      label: "Compañerismo y Valores",
      title: "DIPLOMA DE VALORES Y CONVIVENCIA",
      text: "Por su empatía, solidaridad y espíritu de colaboración con todos los miembros de la comunidad educativa.",
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
              Exportador de Diplomas de Honor y Mérito Escolar
              <span className="text-[10px] bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full font-semibold border border-amber-400/20">
                Imprimible / PDF
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Genera diplomas oficiales y elegantes para premiar a tus estudiantes con un solo clic.
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Imprimir / Guardar en PDF
        </button>
      </div>

      {/* Editor Controls (hidden in print) */}
      <div className="p-6 border-b border-slate-100 bg-slate-50 print:hidden space-y-4">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-slate-500 font-bold self-center text-[11px]">Plantillas Rápidas:</span>
          {presetReasons.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDiplomaTitle(p.title);
                setReason(p.text);
              }}
              className="px-3 py-1 bg-white border border-slate-200 hover:border-amber-400 rounded-lg text-slate-700 font-semibold text-[11px] cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Nombre del Estudiante:</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Institución Educativa:</label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 text-slate-800"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Fecha de Emisión:</label>
            <input
              type="text"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1 text-xs">Motivo o Texto del Reconocimiento:</label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 text-xs text-slate-800 leading-relaxed"
          />
        </div>
      </div>

      {/* Diploma Certificate Preview Stage */}
      <div className="p-6 sm:p-10 flex justify-center bg-slate-100">
        <div 
          className="w-full max-w-[850px] bg-white p-8 sm:p-12 rounded-2xl shadow-xl border-8 border-double border-amber-600/70 relative text-center space-y-6 print:shadow-none print:border-amber-600 print:w-full print:max-w-none"
          style={{
            backgroundImage: "radial-gradient(circle at center, rgba(254, 243, 199, 0.25) 0%, rgba(255, 255, 255, 1) 75%)",
          }}
        >
          {/* Ornamental corner accents */}
          <div className="absolute top-2 left-2 text-amber-600 text-xl font-serif">✦</div>
          <div className="absolute top-2 right-2 text-amber-600 text-xl font-serif">✦</div>
          <div className="absolute bottom-2 left-2 text-amber-600 text-xl font-serif">✦</div>
          <div className="absolute bottom-2 right-2 text-amber-600 text-xl font-serif">✦</div>

          {/* School Header */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 text-amber-800 font-bold uppercase tracking-widest text-xs">
              <Building className="w-4 h-4" />
              <span>{institution}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 tracking-wide uppercase pt-2">
              {diplomaTitle}
            </h1>
            <p className="text-xs text-slate-500 font-serif italic">
              Confiere el presente reconocimiento a:
            </p>
          </div>

          {/* Student Name */}
          <div className="py-2">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-amber-900 border-b-2 border-amber-400/80 inline-block px-8 pb-1 tracking-tight">
              {studentName}
            </h2>
          </div>

          {/* Reason / Citation */}
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-slate-700 font-serif leading-relaxed px-4">
            {reason}
          </p>

          <div className="pt-2 text-xs text-slate-500 font-serif">
            Dado y firmado en la sede institucional a los <strong>{dateStr}</strong>.
          </div>

          {/* Signatures & Golden Seal */}
          <div className="pt-6 grid grid-cols-3 items-end gap-4 border-t border-slate-200">
            {/* Teacher Signature */}
            <div className="space-y-1">
              <div className="h-8 flex items-center justify-center font-serif italic text-sm text-slate-600 border-b border-slate-400 w-36 mx-auto">
                {teacherName.split(" ")[0]} Valdivia
              </div>
              <p className="text-[10px] font-bold text-slate-600 uppercase">{teacherName}</p>
              <p className="text-[9px] text-slate-400">Profesor Titular</p>
            </div>

            {/* Golden Wax Seal */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-600 shadow-md flex items-center justify-center border-2 border-amber-300">
                <Award className="w-8 h-8 text-amber-950" />
              </div>
              <span className="text-[9px] uppercase tracking-wider font-bold text-amber-800 mt-1">Sello Oficial</span>
            </div>

            {/* Principal Signature */}
            <div className="space-y-1">
              <div className="h-8 flex items-center justify-center font-serif italic text-sm text-slate-600 border-b border-slate-400 w-36 mx-auto">
                C. Soto
              </div>
              <p className="text-[10px] font-bold text-slate-600 uppercase">{directorName}</p>
              <p className="text-[9px] text-slate-400">Dirección General</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
