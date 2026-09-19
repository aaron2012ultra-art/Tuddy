import React, { useState, useEffect, useRef } from "react";
import { 
  GraduationCap, 
  ClipboardCheck, 
  CalendarCheck2, 
  Award, 
  Megaphone, 
  LogOut, 
  KeyRound, 
  Sparkles, 
  School, 
  User, 
  ArrowRight,
  BookOpen,
  MessageSquare,
  Clock,
  HelpCircle,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Building,
  Send,
  ExternalLink,
  ChevronRight,
  FileText,
  Filter,
  Check,
  Star,
  Users,
  LogIn,
  Paperclip,
  RotateCw
} from "lucide-react";
import { 
  TeacherClassroom, 
  StudentActiveSession,
  EducationalInstitution,
  AttachedFile
} from "../../types";
import { AttachmentPreviewList, readFileAsAttachedFile } from "../../utils/fileAttachmentUtils";
import { 
  getStoredStudentSession, 
  saveStudentSession, 
  getStoredTeacherClassrooms,
  getStoredInstitutions,
  findInstitutionByCode,
  getStoredSchoolTasks,
  submitSchoolStudentTask,
  SchoolStudentTask,
  getSchoolSubjectGrades,
  getSchoolAttendanceRecord,
  getStoredSchoolMessages,
  sendSchoolDirectMessage,
  SchoolDirectMessage,
} from "../../utils/storage";
import { StudentLoginModal } from "./StudentLoginModal";
import { InstitutionRegistrationModal } from "../institution/InstitutionRegistrationModal";

const EMPTY_INSTITUTION: EducationalInstitution = {
  id: "inst-empty",
  institutionCode: "SIN-REGISTRO",
  name: "Portal Institucional",
  shortName: "Colegio",
  country: "",
  city: "",
  educationLevels: [],
  directorName: "Dirección",
  contactEmail: "",
  phone: "",
  slogan: "Plataforma de Gestión Escolar Oficial",
  registeredAt: new Date().toISOString(),
  subjects: [],
  teachers: [],
  students: [],
  announcements: [],
};

interface StudentPortalProps {
  onBackToApp?: () => void;
  onOpenAITutor?: (subject: string, topic?: string) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  onBackToApp,
  onOpenAITutor,
}) => {
  const [session, setSession] = useState<StudentActiveSession | null>(() => getStoredStudentSession());
  const [classrooms, setClassrooms] = useState<TeacherClassroom[]>(() => getStoredTeacherClassrooms());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(() => !getStoredStudentSession());
  const [isInstitutionModalOpen, setIsInstitutionModalOpen] = useState(false);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<
    "overview" | "tasks" | "grades" | "attendance" | "messages" | "announcements"
  >("overview");

  // Multi-subject tasks state
  const [schoolTasks, setSchoolTasks] = useState<SchoolStudentTask[]>(() => getStoredSchoolTasks());
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"all" | "pending" | "submitted" | "graded">("all");
  const [deliveringTask, setDeliveringTask] = useState<SchoolStudentTask | null>(null);
  const [deliveryContent, setDeliveryContent] = useState("");
  const [deliveryLink, setDeliveryLink] = useState("");

  // Messaging state
  const [messages, setMessages] = useState<SchoolDirectMessage[]>(() => getStoredSchoolMessages());
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [chatInput, setChatInput] = useState("");
  const [studentChatFiles, setStudentChatFiles] = useState<AttachedFile[]>([]);
  const [isUploadingChatFiles, setIsUploadingChatFiles] = useState(false);
  const studentChatFileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessStudentChatFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;
    setIsUploadingChatFiles(true);
    try {
      const processed: AttachedFile[] = [];
      for (const file of files) {
        if (file.size > 15 * 1024 * 1024) {
          alert(`El archivo "${file.name}" supera el límite de 15MB.`);
          continue;
        }
        const attached = await readFileAsAttachedFile(file);
        processed.push(attached);
      }
      setStudentChatFiles((prev) => [...prev, ...processed]);
    } catch (err) {
      console.error("Error al procesar archivos de consulta:", err);
    } finally {
      setIsUploadingChatFiles(false);
    }
  };

  // Institutional info
  const institutions = getStoredInstitutions();
  const currentInstitution: EducationalInstitution = session?.institutionCode
    ? findInstitutionByCode(session.institutionCode) || institutions[0] || EMPTY_INSTITUTION
    : institutions[0] || EMPTY_INSTITUTION;

  const refreshData = () => {
    setSchoolTasks(getStoredSchoolTasks());
    setMessages(getStoredSchoolMessages());
    setClassrooms(getStoredTeacherClassrooms());
  };

  const handleLoginSuccess = (newSession: StudentActiveSession) => {
    setSession(newSession);
    saveStudentSession(newSession);
    setIsLoginModalOpen(false);
    refreshData();
  };

  const handleLogout = () => {
    setSession(null);
    saveStudentSession(null);
    setIsLoginModalOpen(true);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveringTask || !deliveryContent.trim()) return;

    submitSchoolStudentTask(deliveringTask.id, deliveryContent.trim(), deliveryLink.trim() || undefined);
    setSchoolTasks(getStoredSchoolTasks());
    setDeliveringTask(null);
    setDeliveryContent("");
    setDeliveryLink("");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && studentChatFiles.length === 0) return;

    const teacher = currentInstitution.teachers.find((t) => t.id === selectedTeacherId) || currentInstitution.teachers[0];
    if (!teacher) return;
    const messageText = chatInput.trim() || (studentChatFiles.length > 0 ? `He adjuntado ${studentChatFiles.length} archivo(s): ${studentChatFiles.map(f => f.name).join(", ")}` : "");
    sendSchoolDirectMessage(teacher.id, teacher.fullName, teacher.subject, messageText, studentChatFiles.length > 0 ? studentChatFiles : undefined);
    setChatInput("");
    setStudentChatFiles([]);
    setTimeout(() => {
      setMessages(getStoredSchoolMessages());
    }, 1400);
    setMessages(getStoredSchoolMessages());
  };

  // Calculations
  const pendingTasksCount = schoolTasks.filter((t) => t.status === "pending").length;
  const gradesList = getSchoolSubjectGrades();
  const overallAverage = gradesList.length > 0
    ? (gradesList.reduce((acc, curr) => acc + curr.finalGrade, 0) / gradesList.length).toFixed(1)
    : "—";
  const attendanceDays = getSchoolAttendanceRecord();
  const presentDays = attendanceDays.filter((d) => d.status === "present").length;
  const attendanceRate = attendanceDays.length > 0
    ? Math.round((presentDays / attendanceDays.length) * 100)
    : 100;

  const selectedTeacher = currentInstitution.teachers.find((t) => t.id === selectedTeacherId) || currentInstitution.teachers[0];
  const teacherMessages = selectedTeacher ? messages.filter((m) => m.teacherId === selectedTeacher.id) : [];

  // Filter tasks
  const filteredSchoolTasks = schoolTasks.filter((t) => {
    const matchSubject = selectedSubjectFilter === "all" || t.subject === selectedSubjectFilter;
    const matchStatus = selectedStatusFilter === "all" || t.status === selectedStatusFilter;
    return matchSubject && matchStatus;
  });

  return (
    <div className="min-h-screen bg-[#FDF9F3] text-slate-800 flex flex-col font-sans">
      
      {/* 🏫 TOP INSTITUTIONAL BAR */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            
            {/* Left: School Identity & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-xs">
                <School className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900">
                    {currentInstitution.name}
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Portal Oficial
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-mono font-bold text-emerald-700">
                    Cód. Institución: {currentInstitution.institutionCode}
                  </span>
                  <span>•</span>
                  <span>{currentInstitution.city}, {currentInstitution.country}</span>
                </div>
              </div>
            </div>

            {/* Right: Student Profile & Switcher */}
            <div className="flex items-center gap-3">
              {session && (
                <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                    {session.studentName.slice(0, 1)}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {session.studentName}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {session.grade || '3° Secundaria'} "{session.section || 'A'}" • Cód. Alumno: <strong className="font-mono text-emerald-700">{session.studentCode}</strong>
                    </span>
                  </div>
                </div>
              )}

              {session ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsLoginModalOpen(true)}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    title="Cambiar de estudiante o ingresar código"
                  >
                    Cambiar Alumno
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    title="Cerrar sesión de alumno"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Ingresar Código</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsInstitutionModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Inscribir o gestionar colegios en Tuddy"
              >
                <Building className="w-3.5 h-3.5 text-emerald-600" />
                <span>Inscribir Escuela</span>
              </button>

              {onBackToApp && (
                <button
                  type="button"
                  onClick={onBackToApp}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Volver a Tuddy
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 📚 INSTITUTIONAL NAVIGATION MENU (Only visible with active session) */}
        {session && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 flex overflow-x-auto no-scrollbar gap-1 py-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "overview"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <School className="w-4 h-4" />
              <span>Inicio Institucional</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("tasks")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "tasks"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Mis Tareas ({schoolTasks.length})</span>
              {pendingTasksCount > 0 && (
                <span className="bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                  {pendingTasksCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("grades")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "grades"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Mis Calificaciones</span>
              <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold">
                {overallAverage}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("attendance")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "attendance"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>Récord de Asistencia</span>
              <span className="text-[10px] opacity-80">{attendanceRate}%</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("messages")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "messages"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Mensajes con Profesores</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("announcements")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "announcements"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Comunicados Oficiales</span>
            </button>
          </div>
        )}
      </header>

      {/* 🚀 MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {!session ? (
          <div className="max-w-xl mx-auto my-8 bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <School className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Portal Estudiantil Institucional
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Ingresa con tu Código de Institución y tu Código de Alumno para ver tus calificaciones, asistencias, tareas de cada materia y comunicados oficiales.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-left space-y-2 text-xs text-emerald-950">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>¿Cómo funciona el acceso?</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700 leading-relaxed">
                <li>Tu colegio o escuela se registra en Tuddy y obtiene su <strong>Código de Institución</strong>.</li>
                <li>La institución te entrega tu <strong>Código de Alumno</strong>.</li>
                <li>Con ambos códigos, todo tu historial académico queda entrelazado de forma confidencial.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="flex-1 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Ingresar con mis Códigos</span>
              </button>
              <button
                type="button"
                onClick={() => setIsInstitutionModalOpen(true)}
                className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Building className="w-4 h-4 text-slate-500" />
                <span>Inscribir Escuela</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 1. OVERVIEW / INSTITUTION DASHBOARD */}
            {activeTab === "overview" && (
          <div className="space-y-6">
            
            {/* Welcoming Banner with School Slogan */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <span className="text-xs uppercase font-bold tracking-widest text-emerald-200">
                  {currentInstitution.name}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                  ¡Hola, {session?.studentName || "Estudiante"}!
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                  {currentInstitution.slogan}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-semibold">
                  <div className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                    🏛️ Código de Escuela: <strong className="font-mono">{currentInstitution.institutionCode}</strong>
                  </div>
                  <div className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                    👤 Tu Código: <strong className="font-mono">{session?.studentCode || 'EST-101'}</strong>
                  </div>
                  <div className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                    🎓 Grado: <strong>{session?.grade || '3° Secundaria'} "{session?.section || 'A'}"</strong>
                  </div>
                </div>
              </div>

              {/* Decorative graphic */}
              <div className="absolute right-4 bottom-4 opacity-15 pointer-events-none hidden sm:block">
                <School className="w-48 h-48 text-white" />
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div 
                onClick={() => setActiveTab("grades")}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold">Promedio General</span>
                  <Award className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {overallAverage !== "—" ? overallAverage : "—"}
                  {overallAverage !== "—" && <span className="text-xs text-slate-400 font-normal"> / 20</span>}
                </div>
                <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
                  {gradesList.length > 0 ? "Calificaciones del ciclo" : "Sin notas registradas"}
                </p>
              </div>

              <div 
                onClick={() => setActiveTab("attendance")}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold">Asistencia Escolar</span>
                  <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {attendanceDays.length > 0 ? `${attendanceRate}%` : "—"}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {attendanceDays.length > 0 ? "Regular y puntual" : "Sin registros de asistencia"}
                </p>
              </div>

              <div 
                onClick={() => setActiveTab("tasks")}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold">Tareas Pendientes</span>
                  <ClipboardCheck className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1">{pendingTasksCount}</div>
                <p className="text-[11px] text-indigo-600 font-bold mt-0.5">
                  {schoolTasks.length > 0 ? `${schoolTasks.length} en total` : "Al día"}
                </p>
              </div>

              <div 
                onClick={() => setActiveTab("messages")}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold">Profesores</span>
                  <Users className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1">{currentInstitution.teachers.length}</div>
                <p className="text-[11px] text-teal-600 font-bold mt-0.5">Docentes registrados</p>
              </div>
            </div>

            {/* Materias y Profesores Asignados de la Escuela */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    Materias del Ciclo y Tus Profesores
                  </h3>
                  <p className="text-xs text-slate-500">
                    Todas las materias están vinculadas a la institución educativa con sus profesores respectivos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("tasks")}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  Ver Tareas por Materia
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {currentInstitution.teachers.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">Aún no hay profesores registrados para esta institución.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentInstitution.teachers.map((teacher) => {
                    const teacherTasks = schoolTasks.filter((t) => t.subject === teacher.subject);
                    const pending = teacherTasks.filter((t) => t.status === "pending").length;

                    return (
                      <div
                        key={teacher.id}
                        className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg">
                              {teacher.subject}
                            </span>
                            {pending > 0 && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                                {pending} tarea pendiente
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-black text-slate-800">{teacher.fullName}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{teacher.email}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTeacherId(teacher.id);
                              setActiveTab("messages");
                            }}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Enviar Mensaje
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSubjectFilter(teacher.subject);
                              setActiveTab("tasks");
                            }}
                            className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                          >
                            Ver Tareas →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Últimos Comunicados de la Escuela */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-indigo-600" />
                  Circulares y Comunicados de la Dirección
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab("announcements")}
                  className="text-xs font-bold text-indigo-700 hover:underline cursor-pointer"
                >
                  Ver Todos
                </button>
              </div>

              {currentInstitution.announcements.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No hay comunicados oficiales publicados aún.
                </div>
              ) : (
                <div className="space-y-3">
                  {currentInstitution.announcements.slice(0, 2).map((ann) => (
                    <div
                      key={ann.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        ann.important
                          ? "bg-amber-50/50 border-amber-200"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900">{ann.title}</h4>
                        <span className="text-[11px] text-slate-500">{ann.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ann.content}</p>
                      <span className="text-[11px] font-semibold text-slate-500 mt-2 block">
                        Emitido por: {ann.author} ({ann.role})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* 2. MIS TAREAS ESCOLARES (TODAS LAS MATERIAS) */}
        {activeTab === "tasks" && (
          <div className="space-y-6">
            
            {/* Header & Filters */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                    Tareas Escolares de Todas las Materias
                  </h2>
                  <p className="text-xs text-slate-500">
                    Revisa las tareas asignadas por tus profesores de la institución, entrega tus avances y consulta tus notas.
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                  {(["all", "pending", "submitted", "graded"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSelectedStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg transition-all capitalize cursor-pointer ${
                        selectedStatusFilter === st
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {st === "all" ? "Todas" : st === "pending" ? "Pendientes" : st === "submitted" ? "Entregadas" : "Calificadas"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filtrar Materia:</span>
                <button
                  type="button"
                  onClick={() => setSelectedSubjectFilter("all")}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSubjectFilter === "all"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Todas las Materias ({schoolTasks.length})
                </button>
                {currentInstitution.subjects.map((subj) => {
                  const count = schoolTasks.filter((t) => t.subject === subj).length;
                  const active = selectedSubjectFilter === subj;
                  return (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => setSelectedSubjectFilter(subj)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        active
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {subj} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tasks Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSchoolTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
                        {task.subject}
                      </span>
                      
                      {task.status === "pending" && (
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pendiente • Vence {task.dueDate}
                        </span>
                      )}
                      {task.status === "submitted" && (
                        <span className="text-[11px] font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                          Entregada
                        </span>
                      )}
                      {task.status === "graded" && (
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Award className="w-3 h-3 text-emerald-600" />
                          Nota: {task.score} / {task.maxScore}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-black text-slate-900 leading-tight">
                      {task.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Profesor: <strong>{task.teacherName}</strong>
                    </p>
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {task.description}
                    </p>

                    {/* Graded feedback */}
                    {task.status === "graded" && task.feedback && (
                      <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                        <strong className="block font-bold mb-0.5">Comentario del Profesor:</strong>
                        "{task.feedback}"
                      </div>
                    )}

                    {/* Submission text if delivered */}
                    {task.status === "submitted" && task.submissionText && (
                      <div className="mt-3 p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs text-indigo-900">
                        <span className="block font-bold text-[11px] text-indigo-700">Tu entrega ({task.submittedAt}):</span>
                        <p className="mt-1 text-slate-700 italic">"{task.submissionText}"</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Puntaje Máximo: {task.maxScore} pts
                    </span>

                    {task.status === "pending" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setDeliveringTask(task);
                          setDeliveryContent(task.submissionText || "");
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Entregar Tarea
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setDeliveringTask(task);
                          setDeliveryContent(task.submissionText || "");
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Ver o Editar Entrega
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredSchoolTasks.length === 0 && (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
                <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-700">No hay tareas con los filtros seleccionados</h3>
                <p className="text-xs text-slate-400 mt-1">Prueba cambiando la materia o el estado de entrega.</p>
              </div>
            )}

            {/* Delivery Modal */}
            {deliveringTask && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
                        {deliveringTask.subject}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-1">
                        Entregar: {deliveringTask.title}
                      </h3>
                      <p className="text-xs text-slate-500">Docente: {deliveringTask.teacherName}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeliveringTask(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleTaskSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tu Respuesta o Desarrollo de la Tarea *
                      </label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Escribe aquí tu desarrollo, respuestas a los ejercicios o resumen para tu profesor..."
                        value={deliveryContent}
                        onChange={(e) => setDeliveryContent(e.target.value)}
                        className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Enlace a Documento o Drive (Opcional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://docs.google.com/... o enlace de tu trabajo"
                        value={deliveryLink}
                        onChange={(e) => setDeliveryLink(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setDeliveringTask(null)}
                        className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                        Confirmar Entrega
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* 3. MIS CALIFICACIONES / LIBRETA OFICIAL */}
        {activeTab === "grades" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Libreta Escolar de Calificaciones Oficiales
                  </h2>
                  <p className="text-xs text-slate-500">
                    Notas bimestrales registradas por cada docente en el sistema central de {currentInstitution.name}.
                  </p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl flex items-center gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">Promedio Ponderado</span>
                    <span className="text-2xl font-black text-emerald-900">{overallAverage} {overallAverage !== "—" && <span className="text-xs text-slate-400 font-normal">/ 20</span>}</span>
                  </div>
                  {overallAverage !== "—" && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-200/70 px-2 py-1 rounded-lg">
                      Aprobado
                    </span>
                  )}
                </div>
              </div>

              {/* Table of Grades */}
              {gradesList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Aún no hay calificaciones oficiales registradas en el sistema para este periodo.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-50/50">
                        <th className="py-3 px-4">Materia</th>
                        <th className="py-3 px-4">Profesor(a)</th>
                        <th className="py-3 px-3 text-center">Exámenes</th>
                        <th className="py-3 px-3 text-center">Tareas</th>
                        <th className="py-3 px-3 text-center">Participación</th>
                        <th className="py-3 px-3 text-center font-bold text-slate-800">Nota Final</th>
                        <th className="py-3 px-4">Apreciación del Docente</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {gradesList.map((g, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {g.subject}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {g.teacherName}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono text-slate-700">
                            {g.examAverage}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono text-slate-700">
                            {g.tasksAverage}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono text-slate-700">
                            {g.participationScore}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono font-black text-emerald-700 text-sm">
                            {g.finalGrade}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 italic max-w-xs">
                            "{g.teacherObservation}"
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. ASISTENCIA ESCOLAR */}
        {activeTab === "attendance" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <CalendarCheck2 className="w-5 h-5 text-emerald-600" />
                    Récord Institucional de Asistencia y Puntualidad
                  </h2>
                  <p className="text-xs text-slate-500">
                    Control de asistencia diario de {session?.studentName} en {currentInstitution.name}.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold">
                    {attendanceDays.length > 0 ? `${attendanceRate}% Asistencia Acumulada` : "Sin Asistencia Registrada"}
                  </div>
                </div>
              </div>

              {/* Day-by-Day List */}
              {attendanceDays.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Aún no hay registros diarios de asistencia para este alumno en la plataforma escolar.
                </div>
              ) : (
                <div className="space-y-2">
                  {attendanceDays.map((day, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/70 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-800 w-24">
                          {day.date}
                        </span>
                        <span className="text-slate-500 w-20">
                          {day.dayName}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Hora de ingreso: {day.timeRecorded}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {day.notes && (
                          <span className="text-[11px] text-slate-500 italic hidden sm:inline">
                            Nota: {day.notes}
                          </span>
                        )}

                        {day.status === "present" && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Presente
                          </span>
                        )}
                        {day.status === "late" && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                            Tardanza
                          </span>
                        )}
                        {day.status === "excused" && (
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                            Justificada
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. MENSAJES CON PROFESORES */}
        {activeTab === "messages" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col md:flex-row min-h-[500px]">
            
            {/* Left: Teachers Directory */}
            <div className="w-full md:w-80 border-r border-slate-200 bg-slate-50/70 p-4 flex flex-col">
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-3 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                Profesores de tu Institución
              </h3>

              <div className="space-y-1.5 flex-1 overflow-y-auto">
                {currentInstitution.teachers.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Sin profesores registrados
                  </div>
                ) : (
                  currentInstitution.teachers.map((teacher) => {
                    const active = teacher.id === selectedTeacherId;
                    return (
                      <button
                        key={teacher.id}
                        type="button"
                        onClick={() => setSelectedTeacherId(teacher.id)}
                        className={`w-full text-left p-3 rounded-2xl transition-all flex items-center gap-3 cursor-pointer ${
                          active
                            ? "bg-white text-slate-900 shadow-xs border border-emerald-200"
                            : "hover:bg-slate-100 text-slate-600"
                        }`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {teacher.fullName.split(" ")[1]?.slice(0, 1) || "P"}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold truncate">{teacher.fullName}</h4>
                          <p className="text-[11px] text-emerald-700 truncate font-semibold">{teacher.subject}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Active Chat View */}
            {selectedTeacher ? (
              <div className="flex-1 flex flex-col p-6 bg-white justify-between">
                
                {/* Chat Header */}
                <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{selectedTeacher.fullName}</h3>
                    <p className="text-xs text-emerald-700 font-semibold">{selectedTeacher.subject} • {selectedTeacher.email}</p>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Profesor Activo
                  </span>
                </div>

                {/* Chat Messages Log */}
                <div className="flex-1 py-4 space-y-3 overflow-y-auto max-h-[380px]">
                  {teacherMessages.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No hay mensajes aún con este profesor. ¡Escríbele para consultar dudas de clase o tareas!
                    </div>
                  )}

                  {teacherMessages.map((msg) => {
                    const isStudent = msg.sender === "student";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isStudent ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                            isStudent
                              ? "bg-emerald-600 text-white rounded-br-xs shadow-xs"
                              : "bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/80"
                          }`}
                        >
                          <span className="block text-[10px] font-bold opacity-75 mb-0.5">
                            {isStudent ? "Tú" : msg.teacherName}
                          </span>
                          <p className="whitespace-pre-line">{msg.text}</p>
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-white/20">
                              <AttachmentPreviewList files={msg.attachments} readOnly={true} />
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Attached Files Preview in Student Chat */}
                {studentChatFiles.length > 0 && (
                  <div className="pt-2 pb-1 border-t border-slate-100">
                    <div className="text-[10px] font-bold text-slate-500 mb-1 flex items-center justify-between">
                      <span>📎 Archivos a enviar ({studentChatFiles.length}):</span>
                      <button
                        type="button"
                        onClick={() => setStudentChatFiles([])}
                        className="text-[10px] text-rose-500 hover:underline cursor-pointer"
                      >
                        Quitar
                      </button>
                    </div>
                    <AttachmentPreviewList
                      files={studentChatFiles}
                      onRemove={(id) => setStudentChatFiles((prev) => prev.filter((f) => f.id !== id))}
                    />
                  </div>
                )}

                {/* Chat Input */}
                <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <input
                    ref={studentChatFileInputRef}
                    type="file"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        handleProcessStudentChatFiles(e.target.files);
                        e.target.value = "";
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => studentChatFileInputRef.current?.click()}
                    disabled={isUploadingChatFiles}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer shrink-0"
                    title="Adjuntar archivos para tu profesor (PDF, fotos, ejercicios, guías)"
                  >
                    {isUploadingChatFiles ? (
                      <RotateCw className="w-4 h-4 animate-spin text-emerald-600" />
                    ) : (
                      <Paperclip className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="text"
                    placeholder={`Escribe un mensaje o duda para ${selectedTeacher.fullName}...`}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() && studentChatFiles.length === 0}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Enviar
                  </button>
                </form>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
                <Users className="w-12 h-12 text-slate-300 mb-3" />
                <h4 className="text-sm font-bold text-slate-700">Sin profesor seleccionado</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  {currentInstitution.teachers.length === 0
                    ? "Tu institución aún no tiene profesores registrados en el portal escolar."
                    : "Selecciona un profesor en la columna izquierda para iniciar la conversación."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 6. COMUNICADOS DE LA INSTITUCIÓN Y PROFESORES */}
        {activeTab === "announcements" && (() => {
          const studentClassroom = classrooms.find(
            (c) => c.id === session?.classroomId || 
                   (c.grade === session?.grade && c.section === session?.section) ||
                   c.students?.some((s) => s.id === session?.studentId || s.studentCode === session?.studentCode)
          );
          const classAnnouncements = studentClassroom?.announcements || [];

          return (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Classroom Announcements from Teacher */}
              {classAnnouncements.length > 0 && (
                <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-indigo-50 pb-3">
                    <h2 className="text-base font-black text-indigo-950 flex items-center gap-2">
                      <Megaphone className="w-5 h-5 text-indigo-600" />
                      Avisos de tu Salón de Clases ({studentClassroom?.grade} "{studentClassroom?.section}")
                    </h2>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                      {classAnnouncements.length} aviso(s)
                    </span>
                  </div>

                  <div className="space-y-4 pt-1">
                    {classAnnouncements.map((ann) => (
                      <div
                        key={ann.id}
                        className="p-5 rounded-2xl border border-indigo-100 bg-indigo-50/30 space-y-2.5 transition-all hover:border-indigo-300"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ann.priority === "urgent"
                              ? "bg-rose-100 text-rose-700"
                              : ann.priority === "important"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-indigo-100 text-indigo-700"
                          }`}>
                            {ann.priority === "urgent" ? "Urgente" : ann.priority === "important" ? "Importante" : "Aviso de Clase"}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">{ann.date}</span>
                        </div>

                        <h3 className="text-base font-black text-slate-900">{ann.title}</h3>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{ann.content}</p>

                        {/* Attachments from Teacher */}
                        {ann.attachments && ann.attachments.length > 0 && (
                          <div className="pt-2 border-t border-indigo-100/70">
                            <span className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                              📎 Documentos y recursos adjuntos ({ann.attachments.length}):
                            </span>
                            <AttachmentPreviewList files={ann.attachments} readOnly={true} />
                          </div>
                        )}

                        <div className="pt-2 text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                          <span>Publicado por:</span>
                          <strong className="text-slate-700">{ann.authorName || "Profesor"}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Institutional Announcements */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-emerald-600" />
                  Tablón de Anuncios y Circulares Institucionales
                </h2>
                <p className="text-xs text-slate-500">
                  Comunicación oficial directa desde la Dirección de {currentInstitution.name}.
                </p>

                <div className="space-y-4 pt-2">
                  {currentInstitution.announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 hover:border-emerald-300 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          {ann.role}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{ann.date}</span>
                      </div>

                      <h3 className="text-base font-black text-slate-900">{ann.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>

                      {ann.attachments && ann.attachments.length > 0 && (
                        <div className="pt-2 border-t border-slate-200">
                          <span className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                            📎 Documentos adjuntos ({ann.attachments.length}):
                          </span>
                          <AttachmentPreviewList files={ann.attachments} readOnly={true} />
                        </div>
                      )}

                      <div className="pt-2 text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <span>Firmado por:</span>
                        <strong className="text-slate-700">{ann.author}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

          </>
        )}

      </main>

      {/* Student Login Modal */}
      <StudentLoginModal
        isOpen={isLoginModalOpen}
        classrooms={classrooms}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
        onOpenInstitutionRegister={() => setIsInstitutionModalOpen(true)}
      />

      {/* Institution Registration & Management Modal */}
      <InstitutionRegistrationModal
        isOpen={isInstitutionModalOpen}
        onClose={() => setIsInstitutionModalOpen(false)}
        onSelectInstitution={(code) => {
          setIsInstitutionModalOpen(false);
          // Auto switch to that institution
          const found = findInstitutionByCode(code);
          if (found && session) {
            const updatedSession: StudentActiveSession = {
              ...session,
              institutionId: found.id,
              institutionCode: found.institutionCode,
              institutionName: found.name,
            };
            setSession(updatedSession);
            saveStudentSession(updatedSession);
          }
        }}
      />

    </div>
  );
};
