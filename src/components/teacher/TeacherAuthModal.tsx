import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  X, 
  GraduationCap, 
  Mail, 
  UserPlus, 
  LogIn, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  School, 
  User, 
  HelpCircle 
} from "lucide-react";
import { 
  registerTeacherAccount, 
  verifyTeacherCredentials, 
  setTeacherAuthenticated, 
  getStoredTeacherAccounts
} from "../../utils/storage";
import { TeacherAccount } from "../../types";

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AuthViewMode = "login" | "register" | "code_generated" | "recover";

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [viewMode, setViewMode] = useState<AuthViewMode>("login");

  // Login form state (Correo, Contraseña, Código Único)
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state (Correo, Contraseña, Nombre, Escuela)
  const [regName, setRegName] = useState("");
  const [regSchool, setRegSchool] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Code recovery state
  const [recoverEmail, setRecoverEmail] = useState("");
  const [recoverPassword, setRecoverPassword] = useState("");
  const [recoveredCode, setRecoveredCode] = useState<string | null>(null);

  // Newly generated account state
  const [generatedAccount, setGeneratedAccount] = useState<TeacherAccount | null>(null);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  // Status & Feedback
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // Handle Login: Must supply Email + Password + Unique Code
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = verifyTeacherCredentials(loginEmail, loginPassword, loginCode);

    if (!result.success) {
      setError(result.error || "No se pudo verificar el acceso.");
      return;
    }

    setIsSuccess(true);
    setTeacherAuthenticated(true);
    setTimeout(() => {
      setIsSuccess(false);
      onSuccess();
    }, 700);
  };

  // Handle Register: User creates password & provides email -> gets unique code
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = regEmail.trim();
    const cleanPassword = regPassword.trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Ingresa un correo electrónico válido (ej. docente@escuela.edu).");
      return;
    }

    if (cleanPassword.length < 5) {
      setError("La contraseña debe tener al menos 5 caracteres.");
      return;
    }

    if (cleanPassword !== regConfirmPassword.trim()) {
      setError("Las contraseñas no coinciden. Verifícalas cuidadosamente.");
      return;
    }

    const { account } = registerTeacherAccount({
      email: cleanEmail,
      password: cleanPassword,
      teacherName: regName.trim() || "Profesor(a)",
      schoolName: regSchool.trim() || "Institución Educativa",
    });

    setGeneratedAccount(account);
    setViewMode("code_generated");
  };

  // Copy code helper
  const handleCopyGeneratedCode = () => {
    if (!generatedAccount?.uniqueCode) return;
    navigator.clipboard.writeText(generatedAccount.uniqueCode);
    setHasCopiedCode(true);
    setTimeout(() => setHasCopiedCode(false), 2500);
  };

  // Continue to portal right after code generation
  const handleProceedAfterGeneration = () => {
    setTeacherAuthenticated(true);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onSuccess();
    }, 600);
  };

  // Fill preloaded demo credentials
  const handleUseDemoCredentials = () => {
    const accounts = getStoredTeacherAccounts();
    const demo = accounts[0];
    if (demo) {
      setLoginEmail(demo.email);
      setLoginPassword(demo.password);
      setLoginCode(demo.uniqueCode);
      setError(null);
    }
  };

  // Handle Recover Code
  const handleRecoverCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const accounts = getStoredTeacherAccounts();
    const found = accounts.find(
      (a) =>
        a.email.toLowerCase() === recoverEmail.trim().toLowerCase() &&
        a.password === recoverPassword.trim()
    );

    if (!found) {
      setError("No se encontró una cuenta con ese correo y contraseña.");
      return;
    }

    setRecoveredCode(found.uniqueCode);
  };

  const handleUseRecoveredCode = () => {
    if (recoveredCode) {
      setLoginEmail(recoverEmail);
      setLoginPassword(recoverPassword);
      setLoginCode(recoveredCode);
      setViewMode("login");
      setRecoveredCode(null);
      setError(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden my-auto"
        >
          {/* Top Header Banner */}
          <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-800 p-6 text-white text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-13 h-13 mx-auto mb-2.5 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-xs ring-4 ring-white/10">
              <GraduationCap className="w-7 h-7 text-amber-300" />
            </div>
            <h3 className="text-xl font-black tracking-tight">Tuddy para Profesores</h3>
            <p className="text-xs text-indigo-100 mt-1 max-w-sm mx-auto">
              Acceso docente protegido: listas de grado/sección, control de tareas, exámenes y herramientas pedagógicas.
            </p>

            {/* View Switcher Tabs (Login vs Register) */}
            {viewMode !== "code_generated" && (
              <div className="flex items-center justify-center p-1 bg-black/20 backdrop-blur-xs rounded-xl mt-4 max-w-xs mx-auto border border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("login");
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    viewMode === "login"
                      ? "bg-white text-indigo-900 shadow-xs"
                      : "text-indigo-100 hover:text-white"
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Iniciar Sesión</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("register");
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    viewMode === "register"
                      ? "bg-white text-indigo-900 shadow-xs"
                      : "text-indigo-100 hover:text-white"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Crear Cuenta</span>
                </button>
              </div>
            )}
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {/* ============================================================== */}
            {/* VIEW 1: INICIAR SESIÓN (Correo + Contraseña + Código Único) */}
            {/* ============================================================== */}
            {viewMode === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 text-[11px] text-indigo-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    Ingresa tus <strong>3 credenciales docentes</strong>: Correo, Contraseña y el Código Único generado al registrarte.
                  </span>
                </div>

                {/* Field 1: Correo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-600" /> 1. Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="docente@tuddy.edu o tu correo..."
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      setError(null);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all"
                  />
                </div>

                {/* Field 2: Contraseña */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-indigo-600" /> 2. Contraseña
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer flex items-center gap-1"
                    >
                      {showLoginPassword ? (
                        <>
                          <EyeOff className="w-3 h-3" /> Ocultar
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" /> Ver
                        </>
                      )}
                    </button>
                  </label>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    placeholder="Tu contraseña secreta..."
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setError(null);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all"
                  />
                </div>

                {/* Field 3: Código Único */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-indigo-600" /> 3. Código Único de Profesor
                    </span>
                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      PROF-XXXX-YY
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Ej: PROF-2025-TD..."
                      value={loginCode}
                      onChange={(e) => {
                        setLoginCode(e.target.value.toUpperCase());
                        setError(null);
                      }}
                      className="w-full pl-3.5 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-mono font-black tracking-widest text-indigo-950 placeholder:text-slate-400 placeholder:font-sans placeholder:tracking-normal focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all uppercase"
                    />
                  </div>
                </div>

                {/* Error feedback */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl leading-relaxed"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Success feedback */}
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>¡Credenciales verificadas! Accediendo a Tuddy Profesores...</span>
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSuccess}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-black text-sm shadow-md shadow-indigo-200 transition-all cursor-pointer"
                >
                  <span>Ingresar al Área Docente</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Helpers: Demo credentials & recovery */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={handleUseDemoCredentials}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Cargar demo inicial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("recover");
                      setError(null);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>¿Olvidaste tu código?</span>
                  </button>
                </div>
              </form>
            )}

            {/* ============================================================== */}
            {/* VIEW 2: REGISTRARSE Y GENERAR CÓDIGO ÚNICO */}
            {/* ============================================================== */}
            {viewMode === "register" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-950 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Registro Docente:</strong> Al crear tu contraseña y poner tu correo se te generará y brindará un <strong>Código Único</strong> exclusivo para ti.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <User className="w-3 h-3 text-indigo-600" /> Nombre del Docente
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Prof. María Castro"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <School className="w-3 h-3 text-indigo-600" /> Colegio / Institución
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: I.E. Bicentenario"
                      value={regSchool}
                      onChange={(e) => setRegSchool(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden font-medium"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-600" /> Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="profesor@ejemplo.com"
                    value={regEmail}
                    onChange={(e) => {
                      setRegEmail(e.target.value);
                      setError(null);
                    }}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all"
                  />
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-indigo-600" /> Contraseña *
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="text-[10px] text-indigo-600 font-semibold cursor-pointer"
                      >
                        {showRegPassword ? "Ocultar" : "Ver"}
                      </button>
                    </label>
                    <input
                      type={showRegPassword ? "text" : "password"}
                      required
                      placeholder="Mínimo 5 caracteres..."
                      value={regPassword}
                      onChange={(e) => {
                        setRegPassword(e.target.value);
                        setError(null);
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-indigo-600" /> Confirmar Contraseña *
                    </label>
                    <input
                      type={showRegPassword ? "text" : "password"}
                      required
                      placeholder="Repite la contraseña..."
                      value={regConfirmPassword}
                      onChange={(e) => {
                        setRegConfirmPassword(e.target.value);
                        setError(null);
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all"
                    />
                  </div>
                </div>

                {/* Error feedback */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-black text-xs sm:text-sm shadow-md shadow-indigo-200 transition-all cursor-pointer mt-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Crear Contraseña y Generar Código Único</span>
                </button>
              </form>
            )}

            {/* ============================================================== */}
            {/* VIEW 3: CÓDIGO GENERADO EXITOSAMENTE (REVEAL CARD) */}
            {/* ============================================================== */}
            {viewMode === "code_generated" && generatedAccount && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <div className="w-14 h-14 mx-auto bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center ring-4 ring-emerald-50">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>

                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    ¡Cuenta Creada y Código Generado!
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Este es tu <strong>Código Único</strong> personal. Lo necesitarás siempre junto con tu correo y tu contraseña para acceder a tu área de profesor.
                  </p>
                </div>

                {/* Big Code Showcase Card */}
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl relative shadow-inner">
                  <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 block mb-1">
                    Tu Código Único de Profesor
                  </span>
                  <div className="text-2xl sm:text-3xl font-mono font-black text-indigo-950 tracking-widest my-2 select-all">
                    {generatedAccount.uniqueCode}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyGeneratedCode}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer mt-1"
                  >
                    {hasCopiedCode ? (
                      <>
                        <Check className="w-4 h-4 text-amber-300" />
                        <span>¡Código Copiado al Portapapeles!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar Código Único</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Important reminder badge */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-700">Tus 3 credenciales para iniciar sesión:</div>
                  <div className="text-xs text-slate-600 flex items-center justify-between">
                    <span>1. Correo:</span>
                    <strong className="text-indigo-900 font-mono">{generatedAccount.email}</strong>
                  </div>
                  <div className="text-xs text-slate-600 flex items-center justify-between">
                    <span>2. Contraseña:</span>
                    <strong className="text-indigo-900">•••••••• (la que creaste)</strong>
                  </div>
                  <div className="text-xs text-slate-600 flex items-center justify-between">
                    <span>3. Código Único:</span>
                    <strong className="text-indigo-900 font-mono font-black">{generatedAccount.uniqueCode}</strong>
                  </div>
                </div>

                {/* Action button */}
                <button
                  type="button"
                  onClick={handleProceedAfterGeneration}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-black text-sm shadow-md shadow-indigo-200 transition-all cursor-pointer"
                >
                  <span>Acceder a mi Área de Profesor Ahora</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* ============================================================== */}
            {/* VIEW 4: RECUPERAR CÓDIGO ÚNICO */}
            {/* ============================================================== */}
            {viewMode === "recover" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-indigo-600" /> Recuperar mi Código Único
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Ingresa el correo y la contraseña que creaste para consultar tu código único registrado.
                  </p>
                </div>

                {!recoveredCode ? (
                  <form onSubmit={handleRecoverCode} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Correo Registrado
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="docente@ejemplo.com"
                        value={recoverEmail}
                        onChange={(e) => setRecoverEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tu Contraseña
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Tu contraseña creada..."
                        value={recoverPassword}
                        onChange={(e) => setRecoverPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    {error && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
                        {error}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setViewMode("login");
                          setError(null);
                        }}
                        className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Volver
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        Consultar mi Código
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-center space-y-3">
                    <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                      Tu Código Único Encontrado
                    </span>
                    <div className="text-2xl font-mono font-black text-indigo-950 tracking-widest">
                      {recoveredCode}
                    </div>
                    <button
                      type="button"
                      onClick={handleUseRecoveredCode}
                      className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Usar este código e Iniciar Sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
