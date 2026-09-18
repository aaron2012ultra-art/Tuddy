import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  GraduationCap, 
  Users, 
  ClipboardCheck, 
  FileSpreadsheet, 
  Sparkles, 
  Wrench, 
  Settings, 
  LogOut, 
  Lock, 
  CheckCircle2, 
  School, 
  Layers, 
  ShieldCheck, 
  KeyRound, 
  Save,
  Copy,
  Check,
  Mail,
  RefreshCw,
  Megaphone,
  Building
} from "lucide-react";
import { 
  TeacherClassroom, 
  TeacherAssignment, 
  TeacherExamRecord, 
  TeacherConfig, 
  TeacherTab 
} from "../../types";
import { 
  getStoredTeacherConfig, 
  saveTeacherConfig, 
  setTeacherAuthenticated,
  getActiveTeacherAccount,
  getStoredTeacherAccounts,
  saveTeacherAccounts,
  generateUniqueTeacherCode
} from "../../utils/storage";
import { ClassroomManager } from "./ClassroomManager";
import { AssignmentsManager } from "./AssignmentsManager";
import { ExamsManager } from "./ExamsManager";
import { AnnouncementsManager } from "./AnnouncementsManager";
import { BetterTaskCreator } from "./BetterTaskCreator";
import { SpecialTeacherTools } from "./SpecialTeacherTools";
import { InstitutionRegistrationModal } from "../institution/InstitutionRegistrationModal";

interface TeacherModuleProps {
  classrooms: TeacherClassroom[];
  onSaveClassrooms: (classrooms: TeacherClassroom[]) => void;
  assignments: TeacherAssignment[];
  onSaveAssignments: (assignments: TeacherAssignment[]) => void;
  exams: TeacherExamRecord[];
  onSaveExams: (exams: TeacherExamRecord[]) => void;
  onLogout: () => void;
}

export const TeacherModule: React.FC<TeacherModuleProps> = ({
  classrooms,
  onSaveClassrooms,
  assignments,
  onSaveAssignments,
  exams,
  onSaveExams,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<TeacherTab>("classrooms");
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>(
    classrooms[0]?.id || ""
  );
  const [isInstitutionModalOpen, setIsInstitutionModalOpen] = useState(false);

  // Teacher configuration state
  const [teacherConfig, setTeacherConfig] = useState<TeacherConfig>(() => {
    const cfg = getStoredTeacherConfig();
    const activeAcc = getActiveTeacherAccount();
    if (activeAcc && (!cfg.teacherName || !cfg.email)) {
      return {
        ...cfg,
        teacherName: cfg.teacherName || activeAcc.teacherName,
        schoolName: cfg.schoolName || activeAcc.schoolName,
        email: cfg.email || activeAcc.email,
        uniqueCode: cfg.uniqueCode || activeAcc.uniqueCode,
        accessCode: cfg.accessCode || activeAcc.uniqueCode,
      };
    }
    return cfg;
  });
  const [configSavedToast, setConfigSavedToast] = useState(false);
  const [copiedCodeToast, setCopiedCodeToast] = useState(false);
  const [copiedHeader, setCopiedHeader] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState("");

  const handleCopyHeaderCode = () => {
    const code = teacherConfig.uniqueCode || teacherConfig.accessCode || "DOCENTE";
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedHeader(true);
      setTimeout(() => setCopiedHeader(false), 2000);
    }
  };

  const handleRegenerateCode = () => {
    const newCode = generateUniqueTeacherCode();
    setTeacherConfig({
      ...teacherConfig,
      accessCode: newCode,
      uniqueCode: newCode,
    });
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveTeacherConfig(teacherConfig);

    // Also sync with teacher accounts list if email is present
    const accounts = getStoredTeacherAccounts();
    const activeEmail = (teacherConfig.email || "").toLowerCase();
    const existingIndex = accounts.findIndex(a => a.email.toLowerCase() === activeEmail);
    if (existingIndex >= 0) {
      accounts[existingIndex] = {
        ...accounts[existingIndex],
        teacherName: teacherConfig.teacherName,
        schoolName: teacherConfig.schoolName,
        uniqueCode: teacherConfig.uniqueCode || teacherConfig.accessCode,
        password: newPasswordInput.trim() ? newPasswordInput.trim() : accounts[existingIndex].password,
      };
      saveTeacherAccounts(accounts);
    }

    setConfigSavedToast(true);
    setTimeout(() => setConfigSavedToast(false), 2500);
  };

  const handleAssignTaskToClass = (newAssignment: TeacherAssignment) => {
    const updated = [newAssignment, ...assignments];
    onSaveAssignments(updated);
  };

  const currentClass = classrooms.find((c) => c.id === selectedClassroomId) || classrooms[0];

  return (
    <div className="min-h-screen bg-slate-100/60 pb-16">
      {/* Top Professional Teacher Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Teacher Branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex items-center justify-center shadow-xs">
                <GraduationCap className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-black text-slate-900 tracking-tight">
                    Tuddy para Profesores
                  </h1>
                  <span className="text-[10px] uppercase font-black tracking-wider bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full">
                    Docente
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {teacherConfig.teacherName || "Espacio Docente"}
                  {teacherConfig.schoolName ? ` • ${teacherConfig.schoolName}` : ""}
                </p>
              </div>
            </div>

            {/* Quick Actions & Logout */}
            <div className="flex items-center gap-2">
              {/* Unique Code Pill in Header */}
              <div className="hidden md:flex items-center gap-2 bg-indigo-50 border border-indigo-200/80 rounded-xl px-3 py-1.5 text-xs shadow-2xs">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[11px] text-indigo-900 font-semibold">Tu Código:</span>
                <span className="font-mono font-black text-indigo-950 bg-white px-2 py-0.5 rounded-lg border border-indigo-100 select-all">
                  {teacherConfig.uniqueCode || teacherConfig.accessCode || "DOCENTE"}
                </span>
                <button
                  type="button"
                  onClick={handleCopyHeaderCode}
                  className="p-1 text-indigo-600 hover:text-indigo-900 cursor-pointer rounded hover:bg-white/80 transition-colors"
                  title="Copiar código único de profesor"
                >
                  {copiedHeader ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsInstitutionModalOpen(true)}
                className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Inscribir o gestionar colegios y generar código"
              >
                <Building className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Inscribir Colegio</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "settings"
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
                title="Configuración de acceso y escuela"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Configuración</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="p-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-bold border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Salir del modo profesor y volver al estudiante"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir a Tuddy Estudiante</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none">
            {[
              { id: "classrooms", label: "Aulas & Estudiantes", icon: Users },
              { id: "assignments", label: "Registro de Tareas", icon: ClipboardCheck },
              { id: "exams", label: "Registro de Exámenes", icon: FileSpreadsheet },
              { id: "announcements", label: "Avisos & Mensajes a Alumnos", icon: Megaphone },
              { id: "better_tasks", label: "Creador de Mejores Tareas (IA)", icon: Sparkles, highlight: true },
              { id: "special_tools", label: "6 Herramientas Especiales", icon: Wrench },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TeacherTab)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs"
                      : tab.highlight
                      ? "bg-purple-50 text-purple-700 hover:bg-purple-100"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : tab.highlight ? "text-purple-600" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AnimatePresence mode="wait">
          {activeTab === "classrooms" && (
            <motion.div
              key="classrooms"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <ClassroomManager
                classrooms={classrooms}
                onSaveClassrooms={onSaveClassrooms}
                selectedClassroomId={selectedClassroomId}
                onSelectClassroomId={setSelectedClassroomId}
                onOpenCreateAssignmentForClass={(cId) => {
                  setSelectedClassroomId(cId);
                  setActiveTab("better_tasks");
                }}
              />
            </motion.div>
          )}

          {activeTab === "assignments" && (
            <motion.div
              key="assignments"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <AssignmentsManager
                assignments={assignments}
                onSaveAssignments={onSaveAssignments}
                classrooms={classrooms}
                selectedClassroomId={selectedClassroomId}
                onOpenBetterTaskCreator={() => setActiveTab("better_tasks")}
              />
            </motion.div>
          )}

          {activeTab === "exams" && (
            <motion.div
              key="exams"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <ExamsManager
                exams={exams}
                onSaveExams={onSaveExams}
                classrooms={classrooms}
                selectedClassroomId={selectedClassroomId}
                onOpenExamBuilder={() => setActiveTab("special_tools")}
              />
            </motion.div>
          )}

          {activeTab === "announcements" && (
            <motion.div
              key="announcements"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <AnnouncementsManager
                classrooms={classrooms}
                onSaveClassrooms={onSaveClassrooms}
                selectedClassroomId={selectedClassroomId}
                onSelectClassroomId={setSelectedClassroomId}
                teacherName={teacherConfig.teacherName || "Profesor"}
              />
            </motion.div>
          )}

          {activeTab === "better_tasks" && (
            <motion.div
              key="better_tasks"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <BetterTaskCreator
                classrooms={classrooms}
                selectedClassroomId={selectedClassroomId}
                onAssignTaskToClass={handleAssignTaskToClass}
                onNavigateToTasksTab={() => setActiveTab("assignments")}
              />
            </motion.div>
          )}

          {activeTab === "special_tools" && (
            <motion.div
              key="special_tools"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <SpecialTeacherTools
                classrooms={classrooms}
                selectedClassroomId={selectedClassroomId}
              />
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-600" />
                    Configuración de Tuddy Profesores
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Modifica tu código privado de acceso docente, tu institución educativa y preferencias de calificación.
                  </p>
                </div>

                <form onSubmit={handleSaveConfig} className="space-y-5">
                  {/* Teacher Access Credentials Box */}
                  <div className="p-4 bg-gradient-to-br from-indigo-50/80 to-purple-50/50 border border-indigo-200 rounded-2xl space-y-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                            Tus 3 Credenciales de Acceso Docente
                          </h4>
                          <p className="text-[11px] text-indigo-700">
                            Para ingresar a tu área docente siempre usarás estos 3 datos:
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-indigo-700 font-bold bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                        Autenticación 3 Factores
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* 1. Correo Registrado */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-indigo-600" /> 1. Correo Registrado
                        </label>
                        <input
                          type="email"
                          value={teacherConfig.email || "docente@tuddy.edu"}
                          onChange={(e) =>
                            setTeacherConfig({ ...teacherConfig, email: e.target.value.toLowerCase() })
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>

                      {/* 2. Contraseña (cambiar) */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-indigo-600" /> 2. Cambiar Contraseña (opcional)
                        </label>
                        <input
                          type="password"
                          placeholder="Dejar vacío para no cambiar"
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* 3. Unique Code with copy and regenerate buttons */}
                    <div className="bg-white p-3 rounded-xl border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] uppercase font-black tracking-wider text-indigo-600 flex items-center gap-1">
                          <KeyRound className="w-3 h-3" /> 3. Tu Código Único de Profesor
                        </div>
                        <div className="text-xl font-mono font-black text-indigo-950 tracking-widest mt-0.5 select-all">
                          {teacherConfig.uniqueCode || teacherConfig.accessCode || "PROF-2025-TD"}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => {
                            const code = teacherConfig.uniqueCode || teacherConfig.accessCode || "PROF-2025-TD";
                            navigator.clipboard.writeText(code);
                            setCopiedCodeToast(true);
                            setTimeout(() => setCopiedCodeToast(false), 2000);
                          }}
                          className="flex-1 sm:flex-none px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {copiedCodeToast ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>¡Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar Código</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleRegenerateCode}
                          className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Generar un nuevo código único para tu cuenta"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Generar Nuevo</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Teacher & School Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nombre del Docente
                      </label>
                      <input
                        type="text"
                        required
                        value={teacherConfig.teacherName}
                        onChange={(e) =>
                          setTeacherConfig({ ...teacherConfig, teacherName: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Institución Educativa / Colegio
                      </label>
                      <input
                        type="text"
                        required
                        value={teacherConfig.schoolName}
                        onChange={(e) =>
                          setTeacherConfig({ ...teacherConfig, schoolName: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Especialidad / Áreas de Enfoque
                      </label>
                      <input
                        type="text"
                        value={teacherConfig.subjectFocus || ""}
                        onChange={(e) =>
                          setTeacherConfig({ ...teacherConfig, subjectFocus: e.target.value })
                        }
                        placeholder="Ej: Matemáticas y Ciencias"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Escala de Calificación Preferida
                      </label>
                      <select
                        value={teacherConfig.gradingScale}
                        onChange={(e) =>
                          setTeacherConfig({ ...teacherConfig, gradingScale: e.target.value as any })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                      >
                        <option value="0-20">Vigesimal (0 a 20 pts)</option>
                        <option value="0-100">Centesimal (0 a 100 pts)</option>
                        <option value="letter">Cualitativa (AD, A, B, C)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={onLogout}
                      className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer flex items-center gap-1"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Bloquear sesión docente ahora
                    </button>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar Configuración</span>
                    </button>
                  </div>
                </form>

                {configSavedToast && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>¡Configuración y código de acceso guardados exitosamente!</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Institution Registration Modal */}
      <InstitutionRegistrationModal
        isOpen={isInstitutionModalOpen}
        onClose={() => setIsInstitutionModalOpen(false)}
      />
    </div>
  );
};
