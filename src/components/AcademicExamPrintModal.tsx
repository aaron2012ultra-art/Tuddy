import React, { useState, useRef } from "react";
import { 
  Printer, 
  Download, 
  X, 
  FileText, 
  CheckCircle2, 
  Sliders, 
  BookOpen, 
  Award, 
  GraduationCap,
  Sparkles,
  RotateCw
} from "lucide-react";
import { ExamQuestion } from "../types";
import { exportAcademicDocumentToPdf, printAcademicDocument } from "../utils/academicPdfExporter";

interface AcademicExamPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  examTitle: string;
  topic: string;
  questions: ExamQuestion[];
  timeLimitMinutes?: number;
  // Optional pre-existing user answers for grading sheet
  userAnswers?: Record<string, string>;
  finalScore?: number;
  maxScore?: number;
}

export const AcademicExamPrintModal: React.FC<AcademicExamPrintModalProps> = ({
  isOpen,
  onClose,
  examTitle,
  topic,
  questions,
  timeLimitMinutes = 60,
  userAnswers = {},
  finalScore,
  maxScore,
}) => {
  const documentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState("");

  // Printable mode
  const [printMode, setPrintMode] = useState<"student_blank" | "solution_key" | "graded_review">("student_blank");

  // Editable academic metadata
  const [institutionName, setInstitutionName] = useState("INSTITUTO DE FORMACIÓN Y EVALUACIÓN ACADÉMICA");
  const [departmentName, setDepartmentName] = useState("DEPARTAMENTO DE EVALUACIÓN Y DESARROLLO CURRICULAR");
  const [subjectName, setSubjectName] = useState(topic || "EVALUACIÓN DE CONOCIMIENTOS");
  const [professorName, setProfessorName] = useState("Cuerpo Académico Docente");
  const [examDate, setExamDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
  });
  const [academicPeriod, setAcademicPeriod] = useState("Período Lectivo 2026 - Ordinario");
  const [includeAnswerSheet, setIncludeAnswerSheet] = useState(true);
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  if (!isOpen) return null;

  const totalPoints = questions.reduce((acc, q) => acc + (q.points || 10), 0);

  // PDF Export
  const handleDownloadPdf = async () => {
    if (!documentRef.current) return;
    setIsExporting(true);
    setExportProgress("Preparando documento...");

    try {
      const cleanTitle = (subjectName || "Examen")
        .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]/g, "_")
        .slice(0, 35);
      const modeSuffix = printMode === "student_blank" ? "Examen_Oficial" : printMode === "solution_key" ? "Solucionario" : "Examen_Calificado";
      const filename = `${cleanTitle}_${modeSuffix}.pdf`;

      await exportAcademicDocumentToPdf(documentRef.current, {
        filename,
        title: `${subjectName} - Formato Académico`,
        onProgress: (status) => setExportProgress(status),
      });
    } catch (err) {
      console.error("Error al exportar PDF:", err);
      alert("Hubo un detalle al generar el archivo PDF. Puedes utilizar el botón 'Imprimir' y seleccionar 'Guardar como PDF' en tu navegador.");
    } finally {
      setIsExporting(false);
      setExportProgress("");
    }
  };

  const handlePrint = () => {
    printAcademicDocument();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative flex flex-col w-full max-w-5xl h-[94vh] bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">
        
        {/* TOP TOOLBAR (No se imprime) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-800/90 border-b border-slate-700 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <span>Generador de Examen Académico en PDF</span>
                <span className="text-[10px] uppercase font-black tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md">
                  Formato Oficial
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Diseño sobrio institucional listo para imprimir en papel o guardar en PDF
              </p>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-2xl border border-slate-700/80">
            <button
              type="button"
              onClick={() => setPrintMode("student_blank")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                printMode === "student_blank"
                  ? "bg-amber-500 text-slate-950 shadow-xs font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Hoja de Examen (Alumno)
            </button>
            <button
              type="button"
              onClick={() => setPrintMode("solution_key")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                printMode === "solution_key"
                  ? "bg-amber-500 text-slate-950 shadow-xs font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Solucionario (Docente)
            </button>
            {finalScore !== undefined && (
              <button
                type="button"
                onClick={() => setPrintMode("graded_review")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  printMode === "graded_review"
                    ? "bg-amber-500 text-slate-950 shadow-xs font-bold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Examen Calificado
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowConfigPanel(!showConfigPanel)}
              className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Personalizar datos institucionales (Docente, Universidad, etc.)"
            >
              <Sliders className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>{exportProgress || "Generando..."}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Descargar PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-white text-slate-900 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* OPTIONAL CONFIGURATION DRAWER (No se imprime) */}
        {showConfigPanel && (
          <div className="no-print bg-slate-850 p-4 border-b border-slate-700 text-xs text-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in duration-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Institución / Universidad</label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Materia / Asignatura</label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Catedrático / Profesor</label>
              <input
                type="text"
                value={professorName}
                onChange={(e) => setProfessorName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Fecha de Examen</label>
              <input
                type="text"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>
        )}

        {/* DOCUMENT PREVIEW CONTAINER */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-8 flex justify-center">
          
          {/* THE ACADEMIC PRINTABLE SHEET */}
          <div
            id="academic-printable-document"
            ref={documentRef}
            className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 sm:p-12 shadow-2xl rounded-sm border border-slate-300 font-serif leading-relaxed text-sm box-border"
            style={{ fontFamily: "'Times New Roman', Times, Georgia, serif" }}
          >
            
            {/* 1. INSTITUTIONAL HEADER (Double border formal style) */}
            <div className="border-b-2 border-slate-900 pb-4 mb-5">
              <div className="flex items-center justify-between gap-4 border-b border-slate-400 pb-3 mb-3">
                
                {/* Formal Crest / Emblem */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full border-2 border-slate-900 flex flex-col items-center justify-center text-slate-900 shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-tighter">VERITAS</span>
                    <span className="text-base font-black">⚜</span>
                    <span className="text-[8px] font-semibold">2026</span>
                  </div>
                  <div>
                    <h1 className="text-base font-bold uppercase tracking-wider text-slate-900">
                      {institutionName}
                    </h1>
                    <p className="text-xs text-slate-700 uppercase tracking-wide">
                      {departmentName}
                    </p>
                    <p className="text-[11px] text-slate-600 italic">
                      {academicPeriod}
                    </p>
                  </div>
                </div>

                {/* Score & Evaluation Stamp Box */}
                <div className="border border-slate-900 p-2 rounded-xs text-center w-36 shrink-0 bg-slate-50/50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700 border-b border-slate-300 pb-1">
                    Calificación
                  </div>
                  <div className="text-xl font-bold py-1 text-slate-900">
                    {printMode === "graded_review" && finalScore !== undefined
                      ? `${finalScore} / ${maxScore || totalPoints}`
                      : `____ / ${totalPoints}`}
                  </div>
                  <div className="text-[9px] text-slate-500 uppercase">
                    Puntuación Final
                  </div>
                </div>
              </div>

              {/* Document Title */}
              <div className="text-center py-2">
                <h2 className="text-lg font-bold uppercase tracking-widest text-slate-900 underline decoration-1 underline-offset-4">
                  {printMode === "solution_key"
                    ? "SOLUCIONARIO Y CRITERIOS DE CORRECCIÓN — DOCUMENTO DOCENTE"
                    : printMode === "graded_review"
                    ? "EVALUACIÓN ACADÉMICA CALIFICADA — REVISIÓN DE RESULTADOS"
                    : "EVALUACIÓN SUMATIVA DE CONOCIMIENTOS GENERALES"}
                </h2>
                <div className="text-xs font-semibold text-slate-800 mt-1">
                  ASIGNATURA: <span className="uppercase font-bold">{subjectName}</span> | TEMA: <span className="italic">{examTitle || topic}</span>
                </div>
              </div>

              {/* Student Identification Grid */}
              <div className="border border-slate-800 p-3 mt-3 bg-slate-50/30 text-xs space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2 flex items-center">
                    <span className="font-bold shrink-0 mr-2">Nombre del Estudiante:</span>
                    <span className="flex-1 border-b border-dotted border-slate-600 pb-0.5 min-h-[1.2rem]"></span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold shrink-0 mr-2">Matrícula / ID:</span>
                    <span className="flex-1 border-b border-dotted border-slate-600 pb-0.5 min-h-[1.2rem]"></span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="flex items-center">
                    <span className="font-bold shrink-0 mr-2">Grupo / Aula:</span>
                    <span className="flex-1 border-b border-dotted border-slate-600 pb-0.5 min-h-[1.2rem]"></span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold shrink-0 mr-2">Fecha:</span>
                    <span className="flex-1 border-b border-dotted border-slate-600 pb-0.5 text-slate-700">{examDate}</span>
                  </div>
                  <div className="sm:col-span-2 flex items-center">
                    <span className="font-bold shrink-0 mr-2">Docente Evaluador:</span>
                    <span className="flex-1 border-b border-dotted border-slate-600 pb-0.5 text-slate-800">{professorName}</span>
                  </div>
                </div>
              </div>

              {/* General Instructions Box */}
              <div className="mt-3 p-2.5 bg-slate-100/70 border-l-4 border-slate-900 text-[11px] text-slate-800 leading-normal">
                <span className="font-bold uppercase block mb-1">Instrucciones Generales y Código de Honor:</span>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>Lea detenidamente cada una de las interrogantes antes de asentar su respuesta definitiva.</li>
                  <li>Utilice exclusivamente tinta negra o azul indeleble. Respuestas escritas con lápiz o con enmendaduras no serán acreedoras a reclamo.</li>
                  <li>Para preguntas de opción múltiple, rellene o marque claramente el círculo o casilla correspondiente a la única alternativa válida.</li>
                  <li>Tiempo máximo asignado: <strong>{timeLimitMinutes} minutos</strong>. Ponderación total: <strong>{totalPoints} puntos</strong>.</li>
                  <li>Queda prohibida la tenencia o consulta de material no autorizado, teléfonos inteligentes u otros dispositivos electrónicos.</li>
                </ol>
              </div>
            </div>

            {/* 2. QUESTIONS BODY */}
            <div className="space-y-6">
              {questions.map((q, index) => {
                const questionPoints = q.points || 10;
                const studentAnswer = userAnswers[q.id];
                const isSolutionMode = printMode === "solution_key";
                const isGradedMode = printMode === "graded_review";

                return (
                  <div
                    key={q.id || index}
                    className="academic-question border-b border-slate-300 pb-5 last:border-none break-inside-avoid"
                  >
                    {/* Item Header */}
                    <div className="flex items-baseline justify-between mb-1.5">
                      <div className="font-bold text-slate-950 text-sm flex items-center gap-1.5">
                        <span className="uppercase tracking-wide">Ítem {index + 1}.</span>
                        <span className="text-xs font-semibold text-slate-700">
                          [{q.type === "multiple_choice"
                            ? "Opción Múltiple"
                            : q.type === "true_false"
                            ? "Verdadero o Falso"
                            : q.type === "fill_blank"
                            ? "Completación Conceptual"
                            : q.type === "open_short"
                            ? "Desarrollo / Pregunta Abierta"
                            : q.type === "concept_match"
                            ? "Correspondencia Conceptual"
                            : "Ejercicio de Razonamiento"}]
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-800 shrink-0 bg-slate-100 px-2 py-0.5 border border-slate-300 rounded-xs">
                        Valor: {questionPoints} ptos.
                      </div>
                    </div>

                    {/* Question Context / Scenario if exists */}
                    {q.scenarioOrVisual && (
                      <div className="my-2 p-2.5 bg-slate-50 border border-slate-300 text-xs italic text-slate-700 leading-relaxed">
                        <strong className="not-italic text-slate-900 font-bold block mb-0.5">
                          Contexto del Problema:
                        </strong>
                        {q.scenarioOrVisual}
                      </div>
                    )}

                    {/* Question Prompt */}
                    <p className="text-slate-900 font-semibold mb-3 leading-snug">
                      {q.question}
                    </p>

                    {/* RENDER ACCORDING TO QUESTION TYPE */}
                    {/* A) MULTIPLE CHOICE */}
                    {q.type === "multiple_choice" && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2 text-xs">
                        {q.options.map((opt, optIdx) => {
                          const letter = String.fromCharCode(65 + optIdx);
                          const isCorrect = isSolutionMode && opt.trim() === q.correctAnswer.trim();
                          const isStudentPicked = isGradedMode && studentAnswer?.trim() === opt.trim();
                          
                          return (
                            <div
                              key={optIdx}
                              className={`flex items-start gap-2 p-2 border rounded-xs transition-colors ${
                                isCorrect
                                  ? "border-slate-900 bg-slate-100 font-bold"
                                  : isStudentPicked
                                  ? "border-slate-600 bg-slate-50"
                                  : "border-slate-300"
                              }`}
                            >
                              <span className="font-bold shrink-0 w-6 h-6 border border-slate-800 rounded-full flex items-center justify-center text-xs">
                                {isCorrect ? "✓" : isStudentPicked ? "X" : letter}
                              </span>
                              <span className="leading-snug pt-0.5 flex-1">{opt}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* B) TRUE OR FALSE */}
                    {q.type === "true_false" && (
                      <div className="my-2 text-xs space-y-2">
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 border border-slate-400 px-4 py-1.5 rounded-xs cursor-default">
                            <span className="w-4 h-4 border border-slate-800 rounded-xs flex items-center justify-center font-bold">
                              {isSolutionMode && q.correctAnswer.toLowerCase().includes("verdadero") ? "X" : ""}
                            </span>
                            <span className="font-bold text-slate-900">( V ) VERDADERO</span>
                          </label>

                          <label className="flex items-center gap-2 border border-slate-400 px-4 py-1.5 rounded-xs cursor-default">
                            <span className="w-4 h-4 border border-slate-800 rounded-xs flex items-center justify-center font-bold">
                              {isSolutionMode && q.correctAnswer.toLowerCase().includes("falso") ? "X" : ""}
                            </span>
                            <span className="font-bold text-slate-900">( F ) FALSO</span>
                          </label>
                        </div>

                        <div className="pt-1 text-[11px] text-slate-600">
                          <span>Justificación teórica (en caso de ser falso): </span>
                          <div className="border-b border-dotted border-slate-500 min-h-[1.2rem] mt-1"></div>
                        </div>
                      </div>
                    )}

                    {/* C) FILL IN THE BLANK */}
                    {q.type === "fill_blank" && (
                      <div className="my-3 text-xs">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-slate-900">Respuesta Oficial:</span>
                          <span className="flex-1 border-b-2 border-slate-900 font-mono text-slate-900 font-bold px-2 py-0.5">
                            {isSolutionMode ? q.correctAnswer : isGradedMode ? studentAnswer || "(Sin responder)" : ""}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* D) OPEN DEVELOPMENT QUESTION */}
                    {q.type === "open_short" && (
                      <div className="my-3 text-xs space-y-2">
                        {isSolutionMode ? (
                          <div className="p-3 bg-slate-50 border border-slate-400 rounded-xs">
                            <span className="font-bold block text-slate-900 uppercase text-[10px] mb-1">
                              Rúbrica de Respuesta Esperada:
                            </span>
                            <p className="text-slate-800 leading-relaxed font-serif">
                              {q.correctAnswer}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3 pt-1">
                            <div className="border-b border-slate-400 h-5"></div>
                            <div className="border-b border-slate-400 h-5"></div>
                            <div className="border-b border-slate-400 h-5"></div>
                            <div className="border-b border-slate-400 h-5"></div>
                            <div className="border-b border-slate-400 h-5"></div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* E) CONCEPT MATCH */}
                    {q.type === "concept_match" && q.pairs && (
                      <div className="my-3 text-xs grid grid-cols-2 gap-4 border border-slate-300 p-3 bg-slate-50/50">
                        <div className="space-y-2">
                          <span className="font-bold uppercase text-[10px] block border-b border-slate-300 pb-1">Columna A (Concepto)</span>
                          {q.pairs.map((p, pIdx) => (
                            <div key={pIdx} className="flex items-center gap-2">
                              <span className="font-bold w-5">({pIdx + 1})</span>
                              <span>{p.left}</span>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <span className="font-bold uppercase text-[10px] block border-b border-slate-300 pb-1">Columna B (Definición)</span>
                          {q.pairs.map((p, pIdx) => (
                            <div key={pIdx} className="flex items-center gap-2">
                              <span className="font-mono font-bold w-7 text-center border-b border-slate-600">
                                {isSolutionMode ? `(${pIdx + 1})` : "(   )"}
                              </span>
                              <span>{p.right}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SOLUTION EXPLANATION (Only shown in solution key mode or graded review mode) */}
                    {(isSolutionMode || isGradedMode) && q.explanation && (
                      <div className="mt-2.5 p-2 bg-slate-100 border-l-2 border-slate-800 text-xs text-slate-700 italic">
                        <strong className="not-italic text-slate-900 font-bold block text-[10px] uppercase">
                          Fundamento y Justificación Pedagógica:
                        </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 3. ANSWER SHEET / PLANTILLA OMR (Optional quick bubble grid at the end) */}
            {includeAnswerSheet && printMode !== "solution_key" && (
              <div className="mt-8 pt-6 border-t-2 border-slate-900 break-inside-avoid">
                <div className="text-center mb-3">
                  <h3 className="font-bold uppercase text-xs tracking-wider text-slate-900">
                    Hoja de Respuestas Rápida — Plantilla de Corrección
                  </h3>
                  <p className="text-[10px] text-slate-600">
                    Rellene completamente con tinta la alternativa seleccionada para cada ítem de opción múltiple.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border border-slate-400 p-3 bg-slate-50 text-xs">
                  {questions.slice(0, 15).map((q, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="font-bold text-[11px] w-6">#{idx + 1}</span>
                      <div className="flex items-center gap-1">
                        {["A", "B", "C", "D"].map((l) => (
                          <span
                            key={l}
                            className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-700"
                          >
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. FORMAL SIGNATURES & OFFICIAL SEALS */}
            <div className="mt-12 pt-8 border-t border-slate-400 grid grid-cols-2 gap-8 text-center text-xs break-inside-avoid">
              <div>
                <div className="border-b border-slate-800 w-3/4 mx-auto mb-1.5 h-12"></div>
                <p className="font-bold uppercase text-slate-900">Firma y Sello del Evaluador</p>
                <p className="text-[10px] text-slate-600">{professorName}</p>
              </div>

              <div>
                <div className="border-b border-slate-800 w-3/4 mx-auto mb-1.5 h-12"></div>
                <p className="font-bold uppercase text-slate-900">Firma de Conformidad del Alumno</p>
                <p className="text-[10px] text-slate-600">Aceptación de Criterios y Normativa</p>
              </div>
            </div>

            {/* Footnote */}
            <div className="mt-8 pt-3 border-t border-slate-200 text-center text-[9px] text-slate-500 uppercase tracking-widest">
              Documento Académico Oficial — Sistema de Simulación y Evaluación Tuddy • Página 1 de 1
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
