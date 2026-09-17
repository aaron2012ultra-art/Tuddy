import React, { useState, useRef } from "react";
import { 
  Printer, 
  Download, 
  X, 
  Layers, 
  Scissors, 
  BookOpen, 
  FileText, 
  Sliders, 
  GraduationCap, 
  RotateCw,
  CheckSquare
} from "lucide-react";
import { Flashcard, Deck } from "../types";
import { exportAcademicDocumentToPdf, printAcademicDocument } from "../utils/academicPdfExporter";

interface AcademicFlashcardsPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  decks: Deck[];
  flashcards: Flashcard[];
  selectedDeckId?: string;
}

export const AcademicFlashcardsPrintModal: React.FC<AcademicFlashcardsPrintModalProps> = ({
  isOpen,
  onClose,
  decks,
  flashcards,
  selectedDeckId = "all",
}) => {
  const documentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState("");

  // Layout presentation mode
  const [layoutMode, setLayoutMode] = useState<"cutout_cards" | "academic_table" | "foldable_cards">("cutout_cards");

  // Selected deck
  const [currentDeckId, setCurrentDeckId] = useState<string>(selectedDeckId);

  // Academic metadata
  const [institutionName, setInstitutionName] = useState("INSTITUTO DE FORMACIÓN Y EVALUACIÓN ACADÉMICA");
  const [facultyName, setFacultyName] = useState("GUÍA Y FICHAS DE ESTUDIO ACADÉMICO PARA REPASO");
  const [studentName, setStudentName] = useState("");
  const [studyDate, setStudyDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
  });
  const [showConfig, setShowConfig] = useState(false);

  if (!isOpen) return null;

  // Filter flashcards by deck
  const cardsToPrint = flashcards.filter(
    (c) => currentDeckId === "all" || c.deckId === currentDeckId
  );

  const currentDeckObj = decks.find((d) => d.id === currentDeckId);
  const subjectTitle = currentDeckObj ? `${currentDeckObj.name} (${currentDeckObj.subject})` : "Todas las Materias";

  // PDF Export
  const handleDownloadPdf = async () => {
    if (!documentRef.current) return;
    setIsExporting(true);
    setExportProgress("Preparando fichas académicas...");

    try {
      const cleanSubject = (currentDeckObj?.name || "Fichas_Academicas")
        .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]/g, "_")
        .slice(0, 30);
      const filename = `Fichas_Repaso_${cleanSubject}_${layoutMode}.pdf`;

      await exportAcademicDocumentToPdf(documentRef.current, {
        filename,
        title: `${subjectTitle} - Fichas Académicas`,
        onProgress: (status) => setExportProgress(status),
      });
    } catch (err) {
      console.error("Error al exportar PDF de fichas:", err);
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
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <span>Fichas de Estudio en PDF para Imprimir</span>
                <span className="text-[10px] uppercase font-black tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md">
                  Formato Académico
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Formato formal serio: tarjetas recortables, compendio de cátedra o fichas de doble cara
              </p>
            </div>
          </div>

          {/* Format Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-2xl border border-slate-700/80">
            <button
              type="button"
              onClick={() => setLayoutMode("cutout_cards")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                layoutMode === "cutout_cards"
                  ? "bg-emerald-500 text-slate-950 shadow-xs font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Fichas Recortables</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("academic_table")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                layoutMode === "academic_table"
                  ? "bg-emerald-500 text-slate-950 shadow-xs font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Glosario de Cátedra</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("foldable_cards")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                layoutMode === "foldable_cards"
                  ? "bg-emerald-500 text-slate-950 shadow-xs font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Plegables Doble Cara</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Personalizar datos institucionales y selección de mazo"
            >
              <Sliders className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={isExporting || cardsToPrint.length === 0}
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
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
              disabled={cardsToPrint.length === 0}
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-white text-slate-900 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
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

        {/* CONFIGURATION BAR (No se imprime) */}
        {showConfig && (
          <div className="no-print bg-slate-850 p-4 border-b border-slate-700 text-xs text-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in duration-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Mazo de Fichas a Imprimir</label>
              <select
                value={currentDeckId}
                onChange={(e) => setCurrentDeckId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-emerald-400"
              >
                <option value="all">Todos los Mazos ({flashcards.length} fichas)</option>
                {decks.map((d) => {
                  const count = flashcards.filter((c) => c.deckId === d.id).length;
                  return (
                    <option key={d.id} value={d.id}>
                      {d.name} ({count} fichas)
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Institución / Centro Educativo</label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Nombre del Estudiante (Opcional)</label>
              <input
                type="text"
                value={studentName}
                placeholder="Nombre y Apellidos"
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Fecha de Registro</label>
              <input
                type="text"
                value={studyDate}
                onChange={(e) => setStudyDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-emerald-400"
              />
            </div>
          </div>
        )}

        {/* DOCUMENT PREVIEW CONTAINER */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-8 flex justify-center">
          
          {/* THE PRINTABLE SHEET CONTAINER */}
          <div
            id="academic-printable-document"
            ref={documentRef}
            className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 sm:p-12 shadow-2xl rounded-sm border border-slate-300 font-serif leading-relaxed text-sm box-border"
            style={{ fontFamily: "'Times New Roman', Times, Georgia, serif" }}
          >
            
            {/* 1. OFFICIAL ACADEMIC HEADER */}
            <div className="border-b-2 border-slate-900 pb-4 mb-6">
              <div className="flex items-center justify-between border-b border-slate-400 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-slate-900 flex flex-col items-center justify-center text-slate-900 shrink-0">
                    <span className="text-base font-black">🎓</span>
                    <span className="text-[7px] font-bold uppercase tracking-tighter">STUDIUM</span>
                  </div>
                  <div>
                    <h1 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      {institutionName}
                    </h1>
                    <p className="text-xs text-slate-700 uppercase tracking-wide">
                      {facultyName}
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <div className="font-bold text-slate-900">
                    Total: {cardsToPrint.length} Fichas Normalizadas
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Fecha: {studyDate}
                  </div>
                </div>
              </div>

              {/* Title & Subject Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs pt-1">
                <div>
                  <span className="font-bold text-slate-900 uppercase">Materia / Temario: </span>
                  <span className="font-semibold text-slate-800">{subjectTitle}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 uppercase">Estudiante: </span>
                  <span className="border-b border-slate-600 pb-0.5 inline-block min-w-[140px] text-slate-800">
                    {studentName || "______________________________"}
                  </span>
                </div>
              </div>

              {/* Notice / Guide */}
              <div className="mt-3 p-2 bg-slate-50 border-l-3 border-slate-900 text-[10px] text-slate-700">
                <strong>Instrucciones de Uso Académico:</strong> Recorte a lo largo de las guías punteadas o encuaderne según el formato. Utilice el registro de dominio al dorso o al pie para asentar la técnica de repetición espaciada y fijación nemotécnica.
              </div>
            </div>

            {/* IF NO CARDS */}
            {cardsToPrint.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <p className="text-base font-serif">No hay fichas creadas en este mazo para imprimir.</p>
                <p className="text-xs mt-1">Crea algunas fichas o selecciona "Todos los Mazos".</p>
              </div>
            )}

            {/* FORMAT 1: CUT-OUT STUDY CARDS (Tarjetas con guías de corte ✂) */}
            {layoutMode === "cutout_cards" && cardsToPrint.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cardsToPrint.map((card, idx) => {
                  const cardDeck = decks.find((d) => d.id === card.deckId);
                  
                  return (
                    <div
                      key={card.id || idx}
                      className="academic-card-cutout border border-dashed border-slate-500 p-4 bg-white relative rounded-xs break-inside-avoid flex flex-col justify-between min-h-[220px]"
                    >
                      {/* Scissor cut mark on top right */}
                      <div className="absolute -top-2.5 -right-2 bg-white px-1 text-[10px] text-slate-600 font-sans flex items-center gap-0.5">
                        <Scissors className="w-3 h-3 text-slate-500" />
                        <span>recortar</span>
                      </div>

                      <div>
                        {/* Card Header */}
                        <div className="flex items-center justify-between border-b border-slate-300 pb-1.5 mb-2">
                          <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">
                            Ficha #{String(idx + 1).padStart(2, "0")} • {cardDeck?.name || "Cátedra"}
                          </span>
                          <span className="text-[9px] text-slate-500 uppercase">
                            Nivel {card.masteryLevel}/3
                          </span>
                        </div>

                        {/* Front: Concept / Term */}
                        <div className="mb-2.5">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                            Concepto / Pregunta:
                          </span>
                          <h4 className="text-sm font-bold text-slate-950 leading-snug">
                            {card.front}
                          </h4>
                        </div>

                        {/* Back: Academic Definition / Rigorous Answer */}
                        <div className="mb-2 text-xs text-slate-800 leading-relaxed border-t border-slate-200 pt-2">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">
                            Definición y Fundamento Teórico:
                          </span>
                          <p className="whitespace-pre-line">
                            {card.back}
                          </p>
                        </div>

                        {/* Optional Hint / Keyword */}
                        {card.hint && (
                          <div className="text-[10px] italic text-slate-600 bg-slate-50 p-1.5 border border-slate-200 rounded-xs mb-2">
                            <strong>Clave de asociación:</strong> {card.hint}
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Mastery Tracking Checkboxes */}
                      <div className="border-t border-slate-300 pt-2 mt-2 text-[9px] text-slate-600 flex items-center justify-between font-sans">
                        <div className="flex items-center gap-2">
                          <span>Registro:</span>
                          <span className="flex items-center gap-0.5">
                            <span className="w-2.5 h-2.5 border border-slate-600 inline-block"></span> Repaso 1
                          </span>
                          <span className="flex items-center gap-0.5">
                            <span className="w-2.5 h-2.5 border border-slate-600 inline-block"></span> Repaso 2
                          </span>
                          <span className="flex items-center gap-0.5">
                            <span className="w-2.5 h-2.5 border border-slate-600 inline-block"></span> Dominado
                          </span>
                        </div>
                        {card.tags && card.tags.length > 0 && (
                          <span className="text-[8px] text-slate-500 italic">
                            #{card.tags.slice(0, 2).join(" #")}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* FORMAT 2: ACADEMIC TABLE / COMPENDIO DE CÁTEDRA */}
            {layoutMode === "academic_table" && cardsToPrint.length > 0 && (
              <div className="border border-slate-900">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-slate-900 font-bold uppercase text-[10px] text-slate-900 tracking-wider">
                      <th className="p-2.5 border-r border-slate-400 w-12 text-center">N°</th>
                      <th className="p-2.5 border-r border-slate-400 w-1/3">Concepto o Término Central</th>
                      <th className="p-2.5 border-r border-slate-400">Definición y Marco Teórico</th>
                      <th className="p-2.5 w-28 text-center">Control de Repaso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cardsToPrint.map((card, idx) => (
                      <tr
                        key={card.id || idx}
                        className="border-b border-slate-300 last:border-none break-inside-avoid"
                      >
                        <td className="p-2.5 border-r border-slate-300 font-bold text-center text-slate-900 align-top">
                          #{idx + 1}
                        </td>
                        <td className="p-2.5 border-r border-slate-300 font-bold text-slate-950 align-top leading-snug">
                          {card.front}
                          {card.hint && (
                            <span className="block mt-1 text-[10px] font-normal italic text-slate-600">
                              Pista: {card.hint}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 border-r border-slate-300 text-slate-800 align-top leading-relaxed whitespace-pre-line">
                          {card.back}
                        </td>
                        <td className="p-2 text-center align-top text-[9px] text-slate-600 font-sans space-y-1">
                          <div className="flex items-center justify-center gap-1">
                            <span className="w-3 h-3 border border-slate-700 inline-block"></span>
                            <span>R1: __/__</span>
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <span className="w-3 h-3 border border-slate-700 inline-block"></span>
                            <span>R2: __/__</span>
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <span className="w-3 h-3 border border-slate-700 inline-block"></span>
                            <span>Dominado</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* FORMAT 3: FOLDABLE DOUBLE-SIDED FLASHCARDS (Plegables por la mitad) */}
            {layoutMode === "foldable_cards" && cardsToPrint.length > 0 && (
              <div className="space-y-4">
                {cardsToPrint.map((card, idx) => (
                  <div
                    key={card.id || idx}
                    className="academic-card-cutout border-2 border-slate-800 rounded-xs grid grid-cols-2 divide-x-2 divide-slate-800 break-inside-avoid bg-white"
                  >
                    {/* Left: Front side */}
                    <div className="p-4 flex flex-col justify-between bg-slate-50/50">
                      <div>
                        <div className="text-[9px] font-bold uppercase text-slate-500 mb-1">
                          Anverso • Ficha #{idx + 1}
                        </div>
                        <h4 className="text-sm font-bold text-slate-950 leading-snug">
                          {card.front}
                        </h4>
                      </div>
                      <div className="pt-4 text-[9px] text-slate-500 italic">
                        Pliegue por la línea central para auto-evaluación
                      </div>
                    </div>

                    {/* Right: Back side */}
                    <div className="p-4 flex flex-col justify-between">
                      <div>
                        <div className="text-[9px] font-bold uppercase text-slate-500 mb-1">
                          Reverso • Respuesta y Fundamento
                        </div>
                        <p className="text-xs text-slate-900 leading-relaxed whitespace-pre-line">
                          {card.back}
                        </p>
                      </div>
                      {card.hint && (
                        <div className="pt-2 text-[9px] text-slate-600 italic">
                          Pista de memoria: {card.hint}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FOOTER */}
            <div className="mt-12 pt-4 border-t border-slate-300 flex items-center justify-between text-[9px] text-slate-500 uppercase tracking-widest break-inside-avoid">
              <span>Compendio Académico Tuddy • Sistema de Fichas Formales</span>
              <span>Página 1 de 1</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
