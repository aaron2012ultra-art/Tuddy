import React, { useState } from "react";
import { 
  Megaphone, 
  Send, 
  MessageSquare, 
  Bell, 
  Sparkles, 
  Clock, 
  User, 
  CheckCircle2, 
  HelpCircle,
  AlertCircle
} from "lucide-react";
import { 
  TeacherClassroom, 
  StudentActiveSession, 
  ClassroomAnnouncement, 
  StudentTeacherMessage 
} from "../../types";
import { sendStudentTeacherMessage } from "../../utils/storage";

interface StudentAnnouncementsViewProps {
  session: StudentActiveSession;
  classroom: TeacherClassroom;
  onClassroomUpdated: () => void;
}

export const StudentAnnouncementsView: React.FC<StudentAnnouncementsViewProps> = ({
  session,
  classroom,
  onClassroomUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<"announcements" | "messages">("announcements");
  const [questionText, setQuestionText] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Filter messages for this specific student
  const studentMessages = (classroom.messages || []).filter(
    (m) => m.studentId === session.studentId
  );

  const announcements = classroom.announcements || [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    setIsSending(true);
    const ok = sendStudentTeacherMessage(classroom.id, {
      classroomId: classroom.id,
      studentId: session.studentId,
      sender: "student",
      senderName: session.studentName,
      content: questionText.trim(),
    });
    setIsSending(false);

    if (ok) {
      setQuestionText("");
      onClassroomUpdated();
    }
  };

  const handleQuickQuestion = (text: string) => {
    setQuestionText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-emerald-600" />
            <span>Comunicación con el Profesor</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Revisa los anuncios oficiales del salón y conversa en privado con tu profesor si tienes dudas.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("announcements")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "announcements"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Avisos del Salón ({announcements.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("messages")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "messages"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Preguntar al Profesor ({studentMessages.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Avisos Oficiales */}
      {activeTab === "announcements" && (
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center text-slate-400">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-700">No hay avisos publicados en el muro</h3>
              <p className="text-xs text-slate-400 mt-1">
                Cuando tu profesor comparta recordatorios de exámenes, materiales o fechas importantes, aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => {
                const isUrgent = ann.priority === "urgent";
                const isImportant = ann.priority === "important";

                return (
                  <div
                    key={ann.id}
                    className={`p-5 rounded-3xl border transition-all bg-white shadow-2xs ${
                      isUrgent
                        ? "border-rose-200 bg-rose-50/20"
                        : isImportant
                        ? "border-amber-200 bg-amber-50/20"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isUrgent
                            ? "bg-rose-100 text-rose-700"
                            : isImportant
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        <Bell className="w-5 h-5" />
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-slate-900">{ann.title}</h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isUrgent
                                ? "bg-rose-100 text-rose-700"
                                : isImportant
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {isUrgent ? "Urgente" : isImportant ? "Importante" : "Informativo"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                          {ann.content}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-2">
                          <span>Publicado el: <strong>{ann.date}</strong></span>
                          <span>•</span>
                          <span>Por tu profesor: <strong>{ann.authorName}</strong></span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Preguntar al Profesor */}
      {activeTab === "messages" && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col h-[560px]">
          {/* Messages Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Mensajería Privada con el Profesor</h3>
                <p className="text-[10px] text-slate-400">
                  {classroom.grade} "{classroom.section}" • {classroom.subject}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
              Canal Oficial
            </span>
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 p-5 overflow-y-auto space-y-3">
            {studentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <HelpCircle className="w-12 h-12 mb-3 text-emerald-500 opacity-40" />
                <h4 className="text-xs font-bold text-slate-700">¿Tienes dudas sobre una tarea o examen?</h4>
                <p className="text-[11px] text-slate-400 max-w-sm mt-1">
                  Escribe tu consulta abajo. Tu profesor la verá en su módulo docente y podrá responderte directamente.
                </p>
              </div>
            ) : (
              studentMessages.map((msg) => {
                const isStudent = msg.sender === "student";

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isStudent ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3.5 rounded-2xl text-xs ${
                        isStudent
                          ? "bg-emerald-600 text-white rounded-br-xs"
                          : "bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold ${
                            isStudent ? "text-emerald-200" : "text-slate-500"
                          }`}
                        >
                          {isStudent ? "Tú" : `Profesor (${msg.senderName})`}
                        </span>
                        <span
                          className={`text-[9px] ${
                            isStudent ? "text-emerald-300" : "text-slate-400"
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Suggestions */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-bold shrink-0">Sugerencias rápidas:</span>
            <button
              type="button"
              onClick={() => handleQuickQuestion("Profesor, tengo una consulta sobre el ejercicio de la tarea.")}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-emerald-300 hover:text-emerald-700 shrink-0 cursor-pointer transition-colors"
            >
              Duda sobre la tarea
            </button>
            <button
              type="button"
              onClick={() => handleQuickQuestion("Profesor, quisiera consultar la fecha límite del trabajo.")}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-emerald-300 hover:text-emerald-700 shrink-0 cursor-pointer transition-colors"
            >
              Fecha límite
            </button>
            <button
              type="button"
              onClick={() => handleQuickQuestion("Profesor, adjunto justificativo de mi inasistencia médica.")}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-emerald-300 hover:text-emerald-700 shrink-0 cursor-pointer transition-colors"
            >
              Justificar inasistencia
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              required
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Escribe tu mensaje o consulta al profesor..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={isSending || !questionText.trim()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
