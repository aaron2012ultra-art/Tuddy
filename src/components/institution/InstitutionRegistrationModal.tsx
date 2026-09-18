import React, { useState, useEffect } from "react";
import {
  School,
  X,
  Sparkles,
  Check,
  Copy,
  Users,
  BookOpen,
  Plus,
  Building,
  GraduationCap,
  ShieldCheck,
  Share2,
  Trash2,
  Lock,
  KeyRound,
  AlertTriangle,
  FileCheck,
  Eye,
  EyeOff,
  Megaphone,
  Settings,
  ArrowRight,
  ShieldAlert,
  Save,
  CheckCircle2
} from "lucide-react";
import { EducationalInstitution, EducationalInstitutionStudent } from "../../types";
import {
  getStoredInstitutions,
  registerNewInstitution,
  saveInstitutions,
  updateInstitution,
  verifyInstitutionMasterKey,
  findInstitutionByCode,
} from "../../utils/storage";

interface InstitutionRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectInstitution?: (code: string) => void;
  initialInstCode?: string;
}

export const InstitutionRegistrationModal: React.FC<InstitutionRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSelectInstitution,
  initialInstCode,
}) => {
  const [activeTab, setActiveTab] = useState<"register" | "masterControl">("register");

  // --- REGISTRATION STATE (REAL INSTITUTIONS ONLY) ---
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [country, setCountry] = useState("Perú");
  const [city, setCity] = useState("Lima");
  const [directorName, setDirectorName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [slogan, setSlogan] = useState("");
  const [levels, setLevels] = useState<string[]>(["Secundaria"]);
  
  // Official Registry & Verification
  const [officialRegistryType, setOfficialRegistryType] = useState<"modular" | "cct" | "ruc" | "ministerial">("modular");
  const [officialRegistryCode, setOfficialRegistryCode] = useState("");
  const [officialResolutionNumber, setOfficialResolutionNumber] = useState("");
  const [masterAdminKey, setMasterAdminKey] = useState("");
  const [confirmMasterKey, setConfirmMasterKey] = useState("");
  const [isCertifiedRepresentative, setIsCertifiedRepresentative] = useState(false);
  const [showRegisterKey, setShowRegisterKey] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Success screen
  const [createdInstitution, setCreatedInstitution] = useState<EducationalInstitution | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // --- MASTER CONTROL LOGIN STATE ---
  const [loginInstCode, setLoginInstCode] = useState(initialInstCode || "");
  const [loginMasterKey, setLoginMasterKey] = useState("");
  const [showLoginKey, setShowLoginKey] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // --- MASTER CONTROL ACTIVE SESSION ---
  const [unlockedInstitution, setUnlockedInstitution] = useState<EducationalInstitution | null>(null);
  const [masterSubTab, setMasterSubTab] = useState<"students" | "teachers" | "announcements" | "settings">("students");

  // Master Control: Student Management
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentCode, setNewStudentCode] = useState("");
  const [newStudentGrade, setNewStudentGrade] = useState("3° Secundaria");
  const [newStudentSection, setNewStudentSection] = useState("A");

  // Master Control: Teacher / Subject
  const [newTeacherName, setNewTeacherName] = useState("");
  const [newTeacherSubject, setNewTeacherSubject] = useState("");
  const [newTeacherEmail, setNewTeacherEmail] = useState("");

  // Master Control: Announcement
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);

  // Master Control: Settings
  const [editName, setEditName] = useState("");
  const [editDirector, setEditDirector] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editSlogan, setEditSlogan] = useState("");
  const [editNewMasterKey, setEditNewMasterKey] = useState("");
  const [settingsSavedFeedback, setSettingsSavedFeedback] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRegError(null);
      setLoginError(null);
      setCreatedInstitution(null);
      if (initialInstCode) {
        setLoginInstCode(initialInstCode);
      }
    }
  }, [isOpen, initialInstCode]);

  useEffect(() => {
    if (unlockedInstitution) {
      setEditName(unlockedInstitution.name);
      setEditDirector(unlockedInstitution.directorName);
      setEditEmail(unlockedInstitution.contactEmail);
      setEditPhone(unlockedInstitution.phone);
      setEditSlogan(unlockedInstitution.slogan);
      setEditNewMasterKey(unlockedInstitution.masterAdminKey || "");
    }
  }, [unlockedInstitution]);

  if (!isOpen) return null;

  // Validate Real Institution
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!name.trim()) {
      setRegError("Ingresa el nombre oficial de la institución.");
      return;
    }

    if (!officialRegistryCode.trim() || officialRegistryCode.trim().length < 5) {
      setRegError("Ingresa un Código de Registro Oficial válido (ej. Código Modular, CCT o RUC). Solo instituciones reales acreditadas pueden inscribirse.");
      return;
    }

    if (!officialResolutionNumber.trim()) {
      setRegError("Ingresa el número de Resolución Directoral, Licencia de Funcionamiento o Acuerdo Oficial del Ministerio/Secretaría.");
      return;
    }

    if (!directorName.trim()) {
      setRegError("Ingresa el nombre completo del Director(a) o representante autorizado.");
      return;
    }

    if (!contactEmail.trim() || !contactEmail.includes("@")) {
      setRegError("Ingresa un correo institucional de contacto válido.");
      return;
    }

    if (!masterAdminKey.trim() || masterAdminKey.length < 4) {
      setRegError("La Clave Maestra de Seguridad debe tener al menos 4 caracteres. Esta clave otorgará control maestro a la dirección.");
      return;
    }

    if (masterAdminKey !== confirmMasterKey) {
      setRegError("Las Claves Maestras no coinciden. Por favor confirma la clave correctamente.");
      return;
    }

    if (!isCertifiedRepresentative) {
      setRegError("Debes marcar la declaración jurada de representación acreditada de la institución.");
      return;
    }

    const newInst = registerNewInstitution({
      name: name.trim(),
      shortName: shortName.trim() || undefined,
      country: country.trim() || "Perú",
      city: city.trim() || "Lima",
      directorName: directorName.trim(),
      contactEmail: contactEmail.trim(),
      phone: phone.trim() || "",
      slogan: slogan.trim() || "Excelencia Educativa y Formación Integral",
      educationLevels: levels.length > 0 ? levels : ["Primaria", "Secundaria"],
      masterAdminKey: masterAdminKey.trim(),
      officialRegistryType,
      officialRegistryCode: officialRegistryCode.trim().toUpperCase(),
      officialResolutionNumber: officialResolutionNumber.trim().toUpperCase(),
      isVerified: true,
    });

    setCreatedInstitution(newInst);
  };

  // Master Control Login
  const handleUnlockMasterControl = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const code = loginInstCode.trim().toUpperCase();
    const key = loginMasterKey.trim();

    if (!code || !key) {
      setLoginError("Ingresa el Código de la Institución y la Clave Maestra.");
      return;
    }

    const inst = findInstitutionByCode(code);
    if (!inst) {
      setLoginError("No se encontró ninguna institución con el código ingresado. Verifica el código de tu escuela.");
      return;
    }

    const isAuthorized = verifyInstitutionMasterKey(code, key);
    if (!isAuthorized) {
      setLoginError("Clave Maestra incorrecta. Solo el director o administrativo acreditado de la institución tiene acceso al Control Maestro.");
      return;
    }

    setUnlockedInstitution(inst);
  };

  const handleLockMasterControl = () => {
    setUnlockedInstitution(null);
    setLoginMasterKey("");
    setLoginError(null);
  };

  // Student addition in Master Control
  const handleAddStudentMaster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockedInstitution || !newStudentName.trim()) return;

    const generatedCode = newStudentCode.trim()
      ? newStudentCode.trim().toUpperCase()
      : `EST-${Math.floor(100 + Math.random() * 900)}`;

    const newStudent: EducationalInstitutionStudent = {
      studentId: `alu-${Date.now()}`,
      studentCode: generatedCode,
      fullName: newStudentName.trim(),
      grade: newStudentGrade,
      section: newStudentSection.trim().toUpperCase() || "A",
      enrolledSubjects: unlockedInstitution.subjects,
    };

    const updated = updateInstitution(unlockedInstitution.id, {
      students: [...unlockedInstitution.students, newStudent],
    });

    if (updated) {
      setUnlockedInstitution(updated);
      setNewStudentName("");
      setNewStudentCode("");
    }
  };

  // Student deletion in Master Control
  const handleDeleteStudentMaster = (studentId: string) => {
    if (!unlockedInstitution) return;
    if (confirm("¿Confirmas dar de baja a este estudiante del padrón oficial?")) {
      const updatedStudents = unlockedInstitution.students.filter((s) => s.studentId !== studentId);
      const updated = updateInstitution(unlockedInstitution.id, { students: updatedStudents });
      if (updated) setUnlockedInstitution(updated);
    }
  };

  // Teacher addition in Master Control
  const handleAddTeacherMaster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockedInstitution || !newTeacherName.trim() || !newTeacherSubject.trim()) return;

    const newTeacher = {
      id: `doc-${Date.now()}`,
      fullName: newTeacherName.trim(),
      subject: newTeacherSubject.trim(),
      email: newTeacherEmail.trim() || `profesor_${Date.now().toString().slice(-4)}@escuela.edu`,
      phone: "+51 900 000 000",
      photoUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(newTeacherName)}`,
    };

    const updatedSubjects = unlockedInstitution.subjects.includes(newTeacherSubject.trim())
      ? unlockedInstitution.subjects
      : [...unlockedInstitution.subjects, newTeacherSubject.trim()];

    const updated = updateInstitution(unlockedInstitution.id, {
      teachers: [...unlockedInstitution.teachers, newTeacher],
      subjects: updatedSubjects,
    });

    if (updated) {
      setUnlockedInstitution(updated);
      setNewTeacherName("");
      setNewTeacherSubject("");
      setNewTeacherEmail("");
    }
  };

  // Settings Save in Master Control
  const handleSaveSettingsMaster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockedInstitution) return;

    const updated = updateInstitution(unlockedInstitution.id, {
      name: editName.trim() || unlockedInstitution.name,
      directorName: editDirector.trim() || unlockedInstitution.directorName,
      contactEmail: editEmail.trim() || unlockedInstitution.contactEmail,
      phone: editPhone.trim() || unlockedInstitution.phone,
      slogan: editSlogan.trim() || unlockedInstitution.slogan,
      masterAdminKey: editNewMasterKey.trim() || unlockedInstitution.masterAdminKey,
    });

    if (updated) {
      setUnlockedInstitution(updated);
      setSettingsSavedFeedback(true);
      setTimeout(() => setSettingsSavedFeedback(false), 3000);
    }
  };

  const handleCopy = (text: string, isKey = false) => {
    navigator.clipboard.writeText(text);
    if (isKey) {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2200);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2200);
    }
  };

  const handleShareWhatsApp = (inst: EducationalInstitution) => {
    const text = `🏫 *${inst.name}* en Tuddy\n\nEstimada comunidad educativa:\nYa contamos con nuestro portal escolar oficial.\n\n🔑 *Código de Institución:* ${inst.institutionCode}\n\nLos alumnos deben ingresar a Tuddy, abrir el "Portal de Estudiantes", ingresar este Código de Institución y su Código Personal de Alumno para ver asistencia, notas, tareas y comunicarse con sus profesores.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-800 text-white flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <School className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-200">
                  Tuddy Red Educativa
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-100 text-[10px] font-bold border border-emerald-300/30">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  Instituciones Oficiales
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight">
                {activeTab === "register" ? "Inscripción de Escuela Real" : "Control Maestro de Institución"}
              </h2>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                {activeTab === "register"
                  ? "Solo instituciones acreditadas con código oficial pueden registrarse."
                  : "Acceso confidencial exclusivo para directores y administrativos."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector - Strictly Confidential: NEVER lists other institutions */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3">
          <button
            onClick={() => {
              setActiveTab("register");
              setCreatedInstitution(null);
            }}
            className={`pb-3 px-3 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "register"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Plus className="w-4 h-4" />
            Inscribir Escuela Real
          </button>

          <button
            onClick={() => setActiveTab("masterControl")}
            className={`pb-3 px-3 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "masterControl"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Lock className="w-4 h-4" />
            Control Maestro (Director / Admin)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* ============================================================ */}
          {/* TAB 1: REGISTRATION (STRICTLY FOR REAL INSTITUTIONS) */}
          {/* ============================================================ */}
          {activeTab === "register" && !createdInstitution && (
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Security & Verification Banner */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Protocolo de Validación Oficial de Institución Educativa</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Para garantizar que solo colegios y escuelas reales puedan gestionar alumnos y materias, solicitamos la acreditación oficial ministerial. Además, se configurará una <strong>Clave Maestra de Seguridad</strong> para que solo la Dirección o administración pueda realizar cambios.
                </p>
              </div>

              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              {/* 1. School Basic Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  1. Identidad Institucional
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre Oficial de la Escuela o Colegio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Colegio San Agustín / I.E. República de Chile"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Siglas o Nombre Corto
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: CSA / I.E. 1089"
                      value={shortName}
                      onChange={(e) => setShortName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Director(a) o Representante Titular *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Lic. Roberto Carlos Valdivia"
                      value={directorName}
                      onChange={(e) => setDirectorName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      País *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Perú, México, Colombia, etc."
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ciudad / Región *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Lima, CDMX, Bogotá, etc."
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Correo Institucional de Contacto *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="direccion@colegio.edu"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Teléfono / WhatsApp Institucional
                    </label>
                    <input
                      type="text"
                      placeholder="+51 987 654 321"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Official Verification (Validación Real) */}
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4" />
                  2. Acreditación de Escuela Real (Obligatorio)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tipo de Registro Educativo Oficial *
                    </label>
                    <select
                      value={officialRegistryType}
                      onChange={(e) => setOfficialRegistryType(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 text-xs bg-white outline-none font-medium"
                    >
                      <option value="modular">Código Modular (MINEDU - Perú)</option>
                      <option value="cct">Clave Centro de Trabajo CCT (SEP - México)</option>
                      <option value="ruc">RUC Institucional / NIF Educativo</option>
                      <option value="ministerial">Registro Secretaría / Ministerio Educación</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Código Oficial Acreditado *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: 0482910 o 09DPR1420Z"
                      value={officialRegistryCode}
                      onChange={(e) => setOfficialRegistryCode(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm font-mono outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Número de Resolución Directoral / Licencia de Funcionamiento *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: R.D. 0842-DRELM / Acuerdo de Incorporación Oficial"
                    value={officialResolutionNumber}
                    onChange={(e) => setOfficialResolutionNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* 3. Master Control Key Setup */}
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4" />
                    3. Clave Maestra de Seguridad (Control de Dirección)
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowRegisterKey(!showRegisterKey)}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    {showRegisterKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showRegisterKey ? "Ocultar" : "Mostrar"}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500">
                  Esta clave maestra será privada. Solo quien posea esta clave podrá ingresar al <strong>Control Maestro</strong> para agregar o modificar alumnos, materias y notas.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Crear Clave Maestra *
                    </label>
                    <input
                      type={showRegisterKey ? "text" : "password"}
                      required
                      placeholder="Mínimo 4 caracteres"
                      value={masterAdminKey}
                      onChange={(e) => setMasterAdminKey(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirmar Clave Maestra *
                    </label>
                    <input
                      type={showRegisterKey ? "text" : "password"}
                      required
                      placeholder="Repite la clave maestra"
                      value={confirmMasterKey}
                      onChange={(e) => setConfirmMasterKey(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Declaración Jurada */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={isCertifiedRepresentative}
                    onChange={(e) => setIsCertifiedRepresentative(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>
                    Declaro formalmente ser directivo(a) o representante acreditado de esta institución educativa oficial y que los datos ingresados son verídicos.
                  </span>
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  Validar Acreditación e Inscribir Institución
                </button>
              </div>
            </form>
          )}

          {/* SUCCESS SCREEN AFTER REGISTRATION */}
          {activeTab === "register" && createdInstitution && (
            <div className="space-y-6 text-center py-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-600">
                  ¡Institución Educativa Registrada y Verificada!
                </span>
                <h3 className="text-2xl font-black text-slate-800 mt-1">
                  {createdInstitution.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {createdInstitution.city}, {createdInstitution.country} • Director(a): {createdInstitution.directorName}
                </p>
                <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Registro Oficial: {createdInstitution.officialRegistryCode} ({createdInstitution.officialResolutionNumber})</span>
                </div>
              </div>

              {/* 1. Public Code for Students */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-300 rounded-3xl p-5 relative text-left">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block mb-1">
                  Código de Institución (Público para Alumnos y Profesores)
                </span>
                <div className="flex items-center justify-between gap-3 my-2">
                  <div className="text-3xl sm:text-4xl font-black text-emerald-900 tracking-wider font-mono select-all">
                    {createdInstitution.institutionCode}
                  </div>
                  <button
                    onClick={() => handleCopy(createdInstitution.institutionCode, false)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedCode ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Comparte este código con tus alumnos. Ellos lo ingresarán en el Portal de Estudiantes junto a su código personal.
                </p>
              </div>

              {/* 2. Master Key for Director / Admin */}
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-3xl p-5 text-left space-y-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-indigo-700" />
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                    Clave Maestra de Seguridad (Privada para Dirección)
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Guarda esta clave en un lugar seguro. Solo con ella podrás acceder al <strong>Control Maestro</strong> para agregar estudiantes, profesores o modificar ajustes.
                </p>
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-indigo-200 font-mono text-sm font-bold text-indigo-900">
                  <span>{createdInstitution.masterAdminKey}</span>
                  <button
                    onClick={() => handleCopy(createdInstitution.masterAdminKey || "", true)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-sans font-bold cursor-pointer"
                  >
                    {copiedKey ? "¡Copiada!" : "Copiar Clave"}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => handleShareWhatsApp(createdInstitution)}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  Compartir Código por WhatsApp
                </button>

                <button
                  onClick={() => {
                    setUnlockedInstitution(createdInstitution);
                    setActiveTab("masterControl");
                  }}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  Entrar a Control Maestro
                </button>

                {onSelectInstitution && (
                  <button
                    onClick={() => {
                      onSelectInstitution(createdInstitution.institutionCode);
                      onClose();
                    }}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Ir al Portal Estudiantil
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: MASTER CONTROL (LOCKED VS UNLOCKED) */}
          {/* ============================================================ */}
          {activeTab === "masterControl" && !unlockedInstitution && (
            <div className="space-y-6 py-2">
              <div className="text-center max-w-md mx-auto space-y-2">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-slate-800">
                  Acceso al Control Maestro de la Institución
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Para resguardar la estricta privacidad de los alumnos y docentes, solo quienes posean la <strong>Clave Maestra</strong> establecida por la Dirección pueden acceder a su padrón y realizar ajustes.
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 max-w-md mx-auto">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleUnlockMasterControl} className="max-w-md mx-auto space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Código de Institución (ej: COL-SAN-8921)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="COL-SAN-8921"
                    value={loginInstCode}
                    onChange={(e) => setLoginInstCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm font-mono tracking-wider uppercase outline-none transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Clave Maestra de Director / Administrador
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowLoginKey(!showLoginKey)}
                      className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      {showLoginKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showLoginKey ? "Ocultar" : "Mostrar"}</span>
                    </button>
                  </div>
                  <input
                    type={showLoginKey ? "text" : "password"}
                    required
                    placeholder="Ingresa la clave maestra..."
                    value={loginMasterKey}
                    onChange={(e) => setLoginMasterKey(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  Desbloquear Panel de Control Maestro
                </button>
              </form>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">
                  ¿Aún no has registrado tu escuela?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    Inscribirla aquí
                  </button>
                </span>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: UNLOCKED MASTER CONTROL DASHBOARD */}
          {/* ============================================================ */}
          {activeTab === "masterControl" && unlockedInstitution && (
            <div className="space-y-5">
              
              {/* Top Banner with Active School Identity & Lock Action */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-base">
                      {unlockedInstitution.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Verificada
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cód. Institución: <strong className="font-mono text-indigo-700">{unlockedInstitution.institutionCode}</strong> • Director: {unlockedInstitution.directorName}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(unlockedInstitution.institutionCode)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1 transition-all cursor-pointer"
                    title="Copiar código de institución"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copiar Cód.</span>
                  </button>

                  <button
                    onClick={handleLockMasterControl}
                    className="px-3 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Cerrar Control</span>
                  </button>
                </div>
              </div>

              {/* Sub-navigation inside Master Control */}
              <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setMasterSubTab("students")}
                  className={`py-2 px-3 rounded-xl font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    masterSubTab === "students"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Padrón Estudiantes ({unlockedInstitution.students.length})</span>
                </button>

                <button
                  onClick={() => setMasterSubTab("teachers")}
                  className={`py-2 px-3 rounded-xl font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    masterSubTab === "teachers"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Materias y Profesores ({unlockedInstitution.teachers.length})</span>
                </button>

                <button
                  onClick={() => setMasterSubTab("settings")}
                  className={`py-2 px-3 rounded-xl font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    masterSubTab === "settings"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Ajustes y Clave Maestra</span>
                </button>
              </div>

              {/* SUBTAB 1: STUDENTS PADRÓN */}
              {masterSubTab === "students" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Padrón oficial de alumnos con su código personal para ingresar al portal:
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      {unlockedInstitution.students.length} alumnos inscritos
                    </span>
                  </div>

                  {/* Form to add student */}
                  <form onSubmit={handleAddStudentMaster} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-800 block">
                      Inscribir Nuevo Estudiante al Padrón Oficial
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Nombre completo del alumno..."
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        className="px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 outline-none focus:border-indigo-500 sm:col-span-2"
                      />
                      <input
                        type="text"
                        placeholder="Grado (ej: 3° Sec)..."
                        value={newStudentGrade}
                        onChange={(e) => setNewStudentGrade(e.target.value)}
                        className="px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Código (opcional)..."
                        value={newStudentCode}
                        onChange={(e) => setNewStudentCode(e.target.value)}
                        className="px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Guardar Alumno y Generar Código
                      </button>
                    </div>
                  </form>

                  {/* Students List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {unlockedInstitution.students.map((st) => (
                      <div
                        key={st.studentId}
                        className="p-3 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{st.fullName}</p>
                          <p className="text-[11px] text-slate-500">{st.grade} - Sec. {st.section}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg text-xs">
                            {st.studentCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteStudentMaster(st.studentId)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Dar de baja estudiante"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBTAB 2: TEACHERS & SUBJECTS */}
              {masterSubTab === "teachers" && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-500">
                    Plana docente y materias activas ligadas a la institución:
                  </div>

                  {/* Add Teacher */}
                  <form onSubmit={handleAddTeacherMaster} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-800 block">
                      Asignar Nuevo Profesor a Materia
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Nombre del docente..."
                        value={newTeacherName}
                        onChange={(e) => setNewTeacherName(e.target.value)}
                        className="px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 outline-none"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Materia (ej: Química Orgánica)..."
                        value={newTeacherSubject}
                        onChange={(e) => setNewTeacherSubject(e.target.value)}
                        className="px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 outline-none"
                      />
                      <input
                        type="email"
                        placeholder="Correo institucional..."
                        value={newTeacherEmail}
                        onChange={(e) => setNewTeacherEmail(e.target.value)}
                        className="px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 outline-none"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Registrar Docente y Materia
                      </button>
                    </div>
                  </form>

                  {/* List of Teachers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {unlockedInstitution.teachers.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-2xl border border-slate-200 bg-white flex items-center gap-3 text-xs"
                      >
                        <img
                          src={t.photoUrl}
                          alt={t.fullName}
                          className="w-10 h-10 rounded-xl bg-slate-100 object-cover border border-slate-200"
                        />
                        <div className="flex-1">
                          <p className="font-bold text-slate-800">{t.fullName}</p>
                          <p className="text-[11px] text-emerald-700 font-medium">{t.subject}</p>
                          <p className="text-[10px] text-slate-400">{t.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBTAB 3: SETTINGS & MASTER KEY */}
              {masterSubTab === "settings" && (
                <form onSubmit={handleSaveSettingsMaster} className="space-y-4">
                  {settingsSavedFeedback && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>¡Ajustes institucionales y Clave Maestra actualizados correctamente!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nombre de la Institución
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Director(a)
                      </label>
                      <input
                        type="text"
                        value={editDirector}
                        onChange={(e) => setEditDirector(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Correo de Contacto
                      </label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Lema Institucional
                    </label>
                    <input
                      type="text"
                      value={editSlogan}
                      onChange={(e) => setEditSlogan(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>

                  <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
                    <label className="block text-xs font-bold text-indigo-950">
                      Actualizar Clave Maestra de Seguridad
                    </label>
                    <input
                      type="text"
                      value={editNewMasterKey}
                      onChange={(e) => setEditNewMasterKey(e.target.value)}
                      placeholder="Nueva clave maestra..."
                      className="w-full px-3 py-2 text-xs bg-white border border-indigo-300 rounded-xl outline-none font-mono"
                    />
                    <p className="text-[10px] text-indigo-800">
                      Cualquier cambio a la clave maestra tomará efecto de inmediato para los futuros accesos de la dirección.
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      Guardar Ajustes de Institución
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>Tuddy Red de Instituciones Educativas Acreditadas</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 font-bold transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
