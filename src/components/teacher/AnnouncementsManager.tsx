import React, { useState } from "react";
import { 
  Megaphone, 
  Send, 
  MessageSquare, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  User, 
  Search,
  Sparkles,
  Users,
  Bell
} from "lucide-react";
import { 
  TeacherClassroom, 
  ClassroomAnnouncement, 
  StudentTeacherMessage 
} from "../../types";
import { 
  addClassroomAnnouncement, 
  sendStudentTeacherMessage 
} from "../../utils/storage";

interface AnnouncementsManagerProps {
  classrooms: TeacherClassroom[];
  selectedClassroomId: string | null;
  onSelectClassroomId: (id: string) => void;
  onSaveClassrooms: (classrooms: TeacherClassroom[]) => void;
  teacherName?: string;
}

export const AnnouncementsManager: React.FC<AnnouncementsManagerProps> = ({
  classrooms,
  selectedClassroomId,
  onSelectClassroomId,
  onSaveClassrooms,
  teacherName = "Profesor",
}) => {
  const currentClass = classrooms.find((c) => c.id === selectedClassroomId) || classrooms[0] || null;

  const [activeSubTab, setActiveSubTab] = useState<"announcements" | "messages">("announcements");

  // New announcement modal / form state
  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annPriority, setAnnPriority] = useState<"normal" | "important" | "urgent">("normal");

  // Teacher reply state in messages
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [messageSearch, setMessageSearch] = useState("");

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClass || !annTitle.trim() || !annContent.trim()) return;

    const newAnnouncement: ClassroomAnnouncement = {
      id: `ann-${Date.now()}`,
      classroomId: currentClass.id,
      title: annTitle.trim(),
      content: annContent.trim(),
      date: new Date().toISOString().split("T")[0],
      priority: annPriority,
      authorName: teacherName || "Docente",
      createdAt: new Date().toISOString(),
    };

    const updated = classrooms.map((c) =>
      c.id === currentClass.id
        ? {
            ...c,
            announcements: [newAnnouncement, ...(c.announcements || [])],
            updatedAt: new Date().toISOString(),
          }
        : c
    );

    onSaveClassrooms(updated);
    setIsCreatingAnnouncement(false);
    setAnnTitle("");
    setAnnContent("");
    setAnnPriority("normal");
  };

  const handleDeleteAnnouncement = (annId: string) => {
    if (!currentClass) return;
    const updatedAnn = (currentClass.announcements || []).filter((a) => a.id !== annId);
    const updated = classrooms.map((c) =>
      c.id === currentClass.id ? { ...c, announcements: updatedAnn } : c
    );
    onSaveClassrooms(updated);
  };

  const handleSendTeacherReply = (studentId: string) => {
    if (!currentClass || !replyText.trim()) return;

    const newReply: StudentTeacherMessage = {
      id: `msg-${Date.now()}`,
      classroomId: currentClass.id,
      studentId,
      sender: "teacher",
      senderName: teacherName || "Profesor",
      content: replyText.trim(),
      timestamp: new Date().toISOString(),
      read: true,
    };

    const updatedMessages = [...(currentClass.messages || []), newReply];
    const updated = classrooms.map((c) =>
      c.id === currentClass.id ? { ...c, messages: updatedMessages } : c
    );

    onSaveClassrooms(updated);
    setReplyText("");
  };

  // Group messages by student
  const studentMessagesMap = React.useMemo(() => {
    if (!currentClass) return new Map<string, StudentTeacherMessage[]>();
    const map = new Map<string, StudentTeacherMessage[]>();
    (currentClass.messages || []).forEach((msg) => {
      const list = map.get(msg.studentId) || [];
      list.push(msg);
      map.set(msg.studentId, list);
    });
    return map;
  }, [currentClass]);

  const activeStudent = currentClass?.students.find((s) => s.id === selectedStudentId) || null;
  const activeStudentMessages = selectedStudentId ? studentMessagesMap.get(selectedStudentId) || [] : [];

  return (
    <div className="space-y-6">
      {/* Top Header & Classroom Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-indigo-600" />
            <span>Muro de Avisos y Mensajes de Alumnos</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Envía comunicados a tus estudiantes y responde consultas o dudas directamente desde aquí.
          </p>
        </div>

        {classrooms.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500">Salón:</span>
            <select
              value={currentClass?.id || ""}
              onChange={(e) => onSelectClassroomId(e.target.value)}
              aria-label="Seleccionar salón de clases"
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {classrooms.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.grade} "{cls.section}" - {cls.subject}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!currentClass ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Aún no has creado ningún salón</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
            Crea tu salón en la pestaña de Salones y Asistencia para poder publicar avisos a tus alumnos y recibir sus consultas.
          </p>
        </div>
      ) : (
        <>
          {/* Sub Navigation */}
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <button
              type="button"
              onClick={() => setActiveSubTab("announcements")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeSubTab === "announcements"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Avisos del Salón ({(currentClass.announcements || []).length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab("messages")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeSubTab === "messages"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Mensajes & Consultas de Alumnos ({(currentClass.messages || []).length})</span>
            </button>
          </div>

          {/* Sub Tab 1: Avisos Oficiales */}
          {activeSubTab === "announcements" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Avisos en el muro de {currentClass.grade} "{currentClass.section}"
                  </h3>
                  <p className="text-xs text-slate-400">Todos los estudiantes vinculados a este salón verán estos comunicados.</p>
                </div>

                {!isCreatingAnnouncement && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingAnnouncement(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publicar Nuevo Aviso</span>
                  </button>
                )}
              </div>

              {/* Form Crear Aviso */}
              {isCreatingAnnouncement && (
                <form
                  onSubmit={handleCreateAnnouncement}
                  className="p-5 bg-linear-to-br from-indigo-50/50 via-white to-slate-50 rounded-2xl border-2 border-indigo-200 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <Megaphone className="w-4 h-4 text-indigo-600" />
                      Nuevo Comunicado Oficial para los Estudiantes
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingAnnouncement(false)}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Título del Aviso</label>
                      <input
                        type="text"
                        required
                        value={annTitle}
                        onChange={(e) => setAnnTitle(e.target.value)}
                        placeholder="Ej: Recordatorio de Materiales para el Laboratorio"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Prioridad / Etiqueta</label>
                      <select
                        value={annPriority}
                        onChange={(e) => setAnnPriority(e.target.value as any)}
                        aria-label="Prioridad del comunicado"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="normal">Normal (Informativo)</option>
                        <option value="important">Importante (Tarea/Examen)</option>
                        <option value="urgent">Urgente (Requisito)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mensaje o Detalle</label>
                    <textarea
                      required
                      rows={4}
                      value={annContent}
                      onChange={(e) => setAnnContent(e.target.value)}
                      placeholder="Escribe el mensaje completo que leerán los alumnos en su portal..."
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingAnnouncement(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Descartar
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Publicar en el Muro</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Announcements List */}
              {(currentClass.announcements || []).length === 0 ? (
                <div className="p-10 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
                  <Megaphone className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-semibold text-slate-600">Aún no has publicado avisos para este salón</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Usa el botón "Publicar Nuevo Aviso" para compartir noticias con tus estudiantes.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(currentClass.announcements || []).map((ann) => {
                    const isUrgent = ann.priority === "urgent";
                    const isImportant = ann.priority === "important";

                    return (
                      <div
                        key={ann.id}
                        className={`p-4 rounded-2xl border transition-all bg-white shadow-2xs ${
                          isUrgent
                            ? "border-rose-200 bg-rose-50/20"
                            : isImportant
                            ? "border-amber-200 bg-amber-50/20"
                            : "border-slate-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                isUrgent
                                  ? "bg-rose-100 text-rose-700"
                                  : isImportant
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-indigo-100 text-indigo-700"
                              }`}
                            >
                              <Bell className="w-4 h-4" />
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900">{ann.title}</h4>
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
                              <p className="text-xs text-slate-600 mt-1 whitespace-pre-line leading-relaxed">
                                {ann.content}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-2">
                                <span>Publicado: <strong>{ann.date}</strong></span>
                                <span>•</span>
                                <span>Por: {ann.authorName}</span>
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Eliminar aviso"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Sub Tab 2: Mensajes y Consultas de Alumnos */}
          {activeSubTab === "messages" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left sidebar: Students with messages */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-slate-800">Alumnos con Consultas</h4>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                    {studentMessagesMap.size}
                  </span>
                </div>

                {studentMessagesMap.size === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs text-slate-500 font-semibold">Sin mensajes nuevos</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Cuando un alumno te envíe una duda desde su portal, aparecerá aquí.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[420px] overflow-y-auto">
                    {Array.from(studentMessagesMap.entries()).map(([sId, msgs]) => {
                      const student = currentClass.students.find((s) => s.id === sId);
                      const isSelected = selectedStudentId === sId;
                      const lastMsg = msgs[msgs.length - 1];

                      return (
                        <button
                          key={sId}
                          type="button"
                          onClick={() => setSelectedStudentId(sId)}
                          className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-50 border border-indigo-200 text-indigo-950"
                              : "hover:bg-slate-50 border border-transparent text-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold truncate">{student?.fullName || "Alumno"}</p>
                            <span className="text-[10px] text-slate-400">
                              {msgs.length} msg
                            </span>
                          </div>
                          {lastMsg && (
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">
                              {lastMsg.sender === "teacher" ? "Tú: " : ""}{lastMsg.content}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right pane: Chat thread with selected student */}
              <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 flex flex-col h-[520px]">
                {activeStudent ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                          #{activeStudent.orderNumber}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{activeStudent.fullName}</h4>
                          <p className="text-[10px] text-slate-400">
                            Código: {activeStudent.studentCode || "EST-01"} • {currentClass.grade} "{currentClass.section}"
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3">
                      {activeStudentMessages.map((msg) => {
                        const isFromTeacher = msg.sender === "teacher";
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isFromTeacher ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-2xl text-xs ${
                                isFromTeacher
                                  ? "bg-indigo-600 text-white rounded-br-xs"
                                  : "bg-slate-100 text-slate-800 rounded-bl-xs"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold ${isFromTeacher ? "text-indigo-200" : "text-slate-500"}`}>
                                  {isFromTeacher ? "Tú (Profesor)" : msg.senderName}
                                </span>
                                <span className={`text-[9px] ${isFromTeacher ? "text-indigo-300" : "text-slate-400"}`}>
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                              <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Reply Input */}
                    <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex items-center gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendTeacherReply(activeStudent.id);
                          }
                        }}
                        placeholder={`Responder a ${activeStudent.fullName.split(" ")[0]}...`}
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendTeacherReply(activeStudent.id)}
                        disabled={!replyText.trim()}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                    <MessageSquare className="w-12 h-12 mb-3 opacity-30 text-indigo-500" />
                    <p className="text-xs font-bold text-slate-600">Selecciona un estudiante para ver la conversación</p>
                    <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                      Podrás ver sus preguntas y responderle para que lo lea en su portal.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
