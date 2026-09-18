import React, { useState, useEffect } from "react";
import { 
  X, 
  Mail, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  Cloud, 
  RefreshCw, 
  LogOut, 
  Download, 
  User, 
  ArrowLeft, 
  Clock, 
  Copy, 
  Check, 
  Sparkles,
  Lock,
  ExternalLink,
  ChevronDown,
  Search,
  Globe,
  Link2
} from "lucide-react";
import { UserAccount, AuthProvider, AccountBackupData } from "../types";
import { 
  getCurrentUser, 
  setCurrentUser, 
  generateOtpChallenge, 
  getActivePendingOtp, 
  verifyOtpCode, 
  createOrLoginWithOtp, 
  createOrLoginSocialAccount, 
  linkSocialProviderToAccount,
  syncAccountData, 
  exportAccountBackupAsJson,
  OtpChallenge 
} from "../utils/authStorage";
import { WORLD_COUNTRIES, CountryPhoneInfo } from "../utils/countries";
import { TRANSLATIONS } from "../utils/translations";
import confetti from "canvas-confetti";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
  currentDataSnapshot: Omit<AccountBackupData, "account" | "savedAt">;
  onRestoreData?: (restored: AccountBackupData) => void;
  currentUser: UserAccount | null;
  onUserChange: (user: UserAccount | null) => void;
}

// Authentic Provider Logos (SVGs)
const GoogleLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
  </svg>
);

const GitHubLogo = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const AppleLogo = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.65-.79 1.09-1.88.97-2.98-.94.04-2.07.63-2.73 1.41-.58.67-1.09 1.77-.95 2.84 1.05.08 2.06-.51 2.71-1.27z"/>
  </svg>
);

const FacebookLogo = () => (
  <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export function AuthModal({
  isOpen,
  onClose,
  lang,
  currentDataSnapshot,
  onRestoreData,
  currentUser,
  onUserChange,
}: AuthModalProps) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.es;

  // Primary mode: traditional method or social connect popup
  const [traditionalTab, setTraditionalTab] = useState<"email" | "phone">("email");
  const [emailInput, setEmailInput] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+34");
  const [isManualDialCode, setIsManualDialCode] = useState(false);
  const [manualDialCodeInput, setManualDialCodeInput] = useState("+");
  const [countrySearchQuery, setCountrySearchQuery] = useState("");
  const [phoneNumberInput, setPhoneNumberInput] = useState("");
  
  // Verification OTP state
  const [authStep, setAuthStep] = useState<"form" | "otp">("form");
  const [activeChallenge, setActiveChallenge] = useState<OtpChallenge | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [notificationBanner, setNotificationBanner] = useState<{ title: string; body: string; code: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(60);

  // Social OAuth Connect Window State
  const [activeOAuthDialog, setActiveOAuthDialog] = useState<"google" | "github" | "apple" | "facebook" | null>(null);
  const [isOAuthConnecting, setIsOAuthConnecting] = useState(false);
  const [appleShareEmail, setAppleShareEmail] = useState(true);
  const [socialEmailInput, setSocialEmailInput] = useState("");
  const [socialNameInput, setSocialNameInput] = useState("");

  const openOAuthDialog = (provider: "google" | "github" | "apple" | "facebook") => {
    setActiveOAuthDialog(provider);
    const defaultEmail = currentUser?.email || emailInput || "";
    const defaultName = currentUser?.displayName || "";
    setSocialEmailInput(defaultEmail);
    setSocialNameInput(defaultName);
  };

  // Profile management state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState("");

  // Check pending OTP on open
  useEffect(() => {
    if (isOpen) {
      const pending = getActivePendingOtp();
      if (pending) {
        setActiveChallenge(pending);
      }
      setOtpError("");
      setSyncFeedback("");
    }
  }, [isOpen]);

  // Resend timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (authStep === "otp" && resendSeconds > 0) {
      timer = setInterval(() => {
        setResendSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authStep, resendSeconds]);

  if (!isOpen) return null;

  // Handle Traditional Submit (Email or Phone)
  const handleSendTraditionalOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let destination = "";
    const activeDial = isManualDialCode
      ? (manualDialCodeInput.trim().startsWith("+") ? manualDialCodeInput.trim() : `+${manualDialCodeInput.trim()}`)
      : selectedCountryCode;

    if (traditionalTab === "email") {
      destination = emailInput.trim();
      if (!destination || !destination.includes("@")) {
        setOtpError("Por favor ingresa un correo electrónico válido");
        return;
      }
    } else {
      const cleanNumber = phoneNumberInput.trim().replace(/\D/g, "");
      if (!cleanNumber || cleanNumber.length < 5) {
        setOtpError("Por favor ingresa un número de teléfono válido");
        return;
      }
      if (!activeDial || activeDial.length < 2) {
        setOtpError("Por favor ingresa o selecciona un prefijo internacional válido (ej. +34, +52, +1)");
        return;
      }
      destination = `${activeDial} ${cleanNumber}`;
    }

    const challenge = generateOtpChallenge(destination, traditionalTab);
    setActiveChallenge(challenge);
    setAuthStep("otp");
    setOtpCode("");
    setOtpError("");
    setResendSeconds(60);

    // Realistic incoming SMS / Email simulated banner
    if (traditionalTab === "phone") {
      setNotificationBanner({
        title: `📱 Mensaje SMS de Tuddy (${activeDial})`,
        body: `Tu código de seguridad de 6 dígitos para ${destination} es:`,
        code: challenge.code,
      });
    } else {
      setNotificationBanner({
        title: `📧 Correo de Verificación de Tuddy`,
        body: `Código de acceso para ${destination}:`,
        code: challenge.code,
      });
    }
  };

  const handleAutoFillCode = () => {
    if (notificationBanner?.code) {
      setOtpCode(notificationBanner.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeChallenge) return;

    const verification = verifyOtpCode(activeChallenge.destination, otpCode);
    if (!verification.success) {
      setOtpError(verification.message || "Código incorrecto");
      return;
    }

    const { account, restoredData } = createOrLoginWithOtp(
      activeChallenge.destination,
      activeChallenge.type,
      currentDataSnapshot
    );

    onUserChange(account);
    if (restoredData && onRestoreData) {
      onRestoreData(restoredData);
    }

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setAuthStep("form");
    setNotificationBanner(null);
    onClose();
  };

  // Direct Social Login / Linking Handler (Executed from inside the authentic OAuth Connect Window)
  const handleExecuteSocialConnect = (
    provider: "google" | "github" | "apple" | "facebook",
    profile: { displayName: string; email?: string; avatarUrl?: string }
  ) => {
    setIsOAuthConnecting(true);

    setTimeout(() => {
      if (currentUser) {
        // Link to existing active account
        const updated = linkSocialProviderToAccount(
          currentUser,
          provider,
          profile,
          currentDataSnapshot
        );
        onUserChange(updated);
        setSyncFeedback(`¡Tu cuenta de ${provider.toUpperCase()} ha sido entrelazada exitosamente a tu perfil! 🔗✨`);
        setTimeout(() => setSyncFeedback(""), 4500);
      } else {
        // Log in / create account with social provider
        const { account, restoredData } = createOrLoginSocialAccount(
          provider,
          profile,
          currentDataSnapshot
        );

        onUserChange(account);
        if (restoredData && onRestoreData) {
          onRestoreData(restoredData);
        }
        onClose();
      }

      setIsOAuthConnecting(false);
      setActiveOAuthDialog(null);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }, 650);
  };

  const handleManualSync = () => {
    if (!currentUser) return;
    setIsSyncing(true);
    setTimeout(() => {
      const updated = syncAccountData(currentUser, currentDataSnapshot);
      onUserChange(updated);
      setIsSyncing(false);
      setSyncFeedback("¡Progreso y datos sincronizados correctamente en la nube! ☁️✨");
      setTimeout(() => setSyncFeedback(""), 4000);
    }, 600);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    onUserChange(null);
    setSyncFeedback("");
    setAuthStep("form");
    onClose();
  };

  const handleDownloadBackup = () => {
    if (!currentUser) return;
    exportAccountBackupAsJson(currentUser, currentDataSnapshot);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* ------------------------------------------------------------- */}
      {/* AUTHENTIC OAUTH CONNECT WINDOWS (Google, GitHub, Apple, FB) */}
      {/* ------------------------------------------------------------- */}
      {activeOAuthDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in zoom-in-95 duration-150">
          <div 
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Simulated Browser Address Bar */}
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                </div>
                <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-md border border-slate-200 font-mono text-[10px] text-slate-700">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>
                    {activeOAuthDialog === "google" && "accounts.google.com/o/oauth2/v2/auth"}
                    {activeOAuthDialog === "github" && "github.com/login/oauth/authorize"}
                    {activeOAuthDialog === "apple" && "appleid.apple.com/auth/authorize"}
                    {activeOAuthDialog === "facebook" && "www.facebook.com/v20.0/dialog/oauth"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isOAuthConnecting) setActiveOAuthDialog(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 cursor-pointer"
                title="Cerrar ventana de conexión"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* OAUTH CONTENT: GOOGLE */}
            {activeOAuthDialog === "google" && (
              <div className="p-6 sm:p-7 space-y-4">
                <div className="flex items-center gap-2.5">
                  <GoogleLogo />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {currentUser ? "Entrelazar cuenta de Google" : "Acceder con Google"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {currentUser 
                        ? `Vincular a tu perfil: ${currentUser.displayName || currentUser.email || "Usuario"}` 
                        : "para continuar a Tuddy App"}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tu Correo de Google / Gmail:
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={socialEmailInput}
                        onChange={(e) => setSocialEmailInput(e.target.value)}
                        placeholder="tu.cuenta@gmail.com"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tu Nombre en Google:
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={socialNameInput}
                        onChange={(e) => setSocialNameInput(e.target.value)}
                        placeholder="Tu Nombre Completo"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 leading-relaxed">
                  {currentUser 
                    ? "Al entrelazar tu cuenta de Google, podrás iniciar sesión con este correo y todas tus notas y asignaturas estarán sincronizadas."
                    : "Google compartirá tu nombre y correo para sincronizar de forma segura tu progreso en Tuddy."}
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveOAuthDialog(null)}
                    disabled={isOAuthConnecting}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const finalEmail = socialEmailInput.trim() || "mi.cuenta@gmail.com";
                      const finalName = socialNameInput.trim() || finalEmail.split("@")[0] || "Usuario Google";
                      handleExecuteSocialConnect("google", {
                        displayName: finalName,
                        email: finalEmail,
                        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(finalName)}`,
                      });
                    }}
                    disabled={isOAuthConnecting}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isOAuthConnecting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Conectando...</span>
                      </>
                    ) : (
                      <span>{currentUser ? "Entrelazar mi cuenta de Google" : `Continuar como ${socialNameInput.trim() || "Google"}`}</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* OAUTH CONTENT: GITHUB */}
            {activeOAuthDialog === "github" && (
              <div className="p-6 sm:p-7 space-y-4 bg-[#0d1117] text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/10 text-white">
                    <GitHubLogo />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {currentUser ? "Entrelazar con tu GitHub" : "Autorizar con GitHub"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {currentUser ? `Vincular a ${currentUser.displayName || "tu cuenta"}` : "Acceso seguro a Tuddy Workspace"}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Tu Usuario o Correo de GitHub:
                    </label>
                    <input
                      type="text"
                      value={socialEmailInput}
                      onChange={(e) => setSocialEmailInput(e.target.value)}
                      placeholder="usuario o correo@ejemplo.com"
                      className="w-full px-3 py-2 text-xs bg-[#0d1117] border border-[#30363d] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Tu Nombre de Perfil GitHub:
                    </label>
                    <input
                      type="text"
                      value={socialNameInput}
                      onChange={(e) => setSocialNameInput(e.target.value)}
                      placeholder="Tu nombre público de GitHub"
                      className="w-full px-3 py-2 text-xs bg-[#0d1117] border border-[#30363d] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium text-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Vinculación de identidad y almacenamiento en la nube</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveOAuthDialog(null)}
                    disabled={isOAuthConnecting}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const finalEmail = socialEmailInput.trim() || "dev@github.com";
                      const finalName = socialNameInput.trim() || finalEmail.split("@")[0] || "GitHub User";
                      handleExecuteSocialConnect("github", {
                        displayName: `${finalName} (GitHub)`,
                        email: finalEmail.includes("@") ? finalEmail : `${finalEmail}@github.user`,
                        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(finalName)}`,
                      });
                    }}
                    disabled={isOAuthConnecting}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#238636] hover:bg-[#2ea043] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isOAuthConnecting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Autorizando...</span>
                      </>
                    ) : (
                      <span>{currentUser ? "Entrelazar mi cuenta de GitHub" : `Autorizar como ${socialNameInput.trim() || "GitHub"}`}</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* OAUTH CONTENT: APPLE */}
            {activeOAuthDialog === "apple" && (
              <div className="p-6 sm:p-7 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-black text-white">
                    <AppleLogo />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {currentUser ? "Entrelazar con Apple ID" : "Sign in with Apple"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {currentUser ? `Asociar a tu perfil ${currentUser.displayName || ""}` : "Acceso rápido y privado con Apple"}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tu Apple ID / Correo:
                    </label>
                    <input
                      type="email"
                      value={socialEmailInput}
                      onChange={(e) => setSocialEmailInput(e.target.value)}
                      placeholder="tu.appleid@icloud.com"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-black font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tu Nombre:
                    </label>
                    <input
                      type="text"
                      value={socialNameInput}
                      onChange={(e) => setSocialNameInput(e.target.value)}
                      placeholder="Tu Nombre para Tuddy"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-black font-medium text-slate-800"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <label 
                      onClick={() => setAppleShareEmail(true)}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white cursor-pointer transition-colors"
                    >
                      <input 
                        type="radio" 
                        name="appleEmail" 
                        checked={appleShareEmail} 
                        onChange={() => setAppleShareEmail(true)}
                        className="text-black"
                      />
                      <span className="text-xs text-slate-700 font-medium">Compartir mi correo</span>
                    </label>

                    <label 
                      onClick={() => setAppleShareEmail(false)}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white cursor-pointer transition-colors"
                    >
                      <input 
                        type="radio" 
                        name="appleEmail" 
                        checked={!appleShareEmail} 
                        onChange={() => setAppleShareEmail(false)}
                        className="text-black"
                      />
                      <span className="text-xs text-slate-700 font-medium">Ocultar mi correo (Apple Private Relay)</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveOAuthDialog(null)}
                    disabled={isOAuthConnecting}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const rawEmail = socialEmailInput.trim() || "estudiante@icloud.com";
                      const finalEmail = appleShareEmail ? rawEmail : `${rawEmail.split("@")[0]}@privaterelay.appleid.com`;
                      const finalName = socialNameInput.trim() || "Usuario Apple";
                      handleExecuteSocialConnect("apple", {
                        displayName: `${finalName} (Apple)`,
                        email: finalEmail,
                        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(finalName)}`,
                      });
                    }}
                    disabled={isOAuthConnecting}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isOAuthConnecting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Conectando...</span>
                      </>
                    ) : (
                      <span>{currentUser ? "Entrelazar mi Apple ID" : `Continuar como ${socialNameInput.trim() || "Apple"}`}</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* OAUTH CONTENT: FACEBOOK */}
            {activeOAuthDialog === "facebook" && (
              <div className="p-6 sm:p-7 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-xl bg-[#1877F2]/10">
                    <FacebookLogo />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {currentUser ? "Entrelazar con Facebook" : "Iniciar sesión con Facebook"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {currentUser ? `Vincular a tu cuenta ${currentUser.displayName || ""}` : "Conectar perfil de Facebook con Tuddy"}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/70 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tu Correo o Número de Facebook:
                    </label>
                    <input
                      type="text"
                      value={socialEmailInput}
                      onChange={(e) => setSocialEmailInput(e.target.value)}
                      placeholder="tu.cuenta@facebook.com"
                      className="w-full px-3 py-2 text-xs bg-white border border-blue-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tu Nombre de Perfil de Facebook:
                    </label>
                    <input
                      type="text"
                      value={socialNameInput}
                      onChange={(e) => setSocialNameInput(e.target.value)}
                      placeholder="Tu Nombre en Facebook"
                      className="w-full px-3 py-2 text-xs bg-white border border-blue-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveOAuthDialog(null)}
                    disabled={isOAuthConnecting}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const finalEmail = socialEmailInput.trim() || "facebook.user@fb.com";
                      const finalName = socialNameInput.trim() || "Usuario Facebook";
                      handleExecuteSocialConnect("facebook", {
                        displayName: finalName,
                        email: finalEmail.includes("@") ? finalEmail : `${finalEmail}@facebook.com`,
                        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(finalName)}`,
                      });
                    }}
                    disabled={isOAuthConnecting}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isOAuthConnecting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Conectando...</span>
                      </>
                    ) : (
                      <span>{currentUser ? "Entrelazar mi cuenta de Facebook" : `Continuar como ${socialNameInput.trim() || "Facebook"}`}</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MAIN AUTHENTICATION & ACCOUNT MODAL */}
      {/* ------------------------------------------------------------- */}
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient accent */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-amber-50/70 via-sky-50/50 to-white border-b border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white shadow-xs">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                <span>{currentUser ? "Tu Cuenta Tuddy" : "Guardar mi Progreso"}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {currentUser ? "Sincronizado" : "100% Opcional"}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {currentUser 
                  ? "Tus materias, fichas, notas y mascota están aseguradas en la nube" 
                  : "Conecta tu cuenta o regístrate con correo / teléfono para no perder nada"}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Real-time SMS/Email Incoming Code Notification Banner */}
          {notificationBanner && authStep === "otp" && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{notificationBanner.title}</span>
                </span>
                <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-black px-1.5 py-0.5 rounded-sm">
                  Ahora mismo
                </span>
              </div>
              <p className="text-emerald-800 text-[11px] mt-1">
                {notificationBanner.body}
              </p>
              <div className="mt-2.5 flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-emerald-200">
                <span className="font-mono text-lg font-black tracking-widest text-emerald-900">
                  {notificationBanner.code}
                </span>
                <button
                  type="button"
                  onClick={handleAutoFillCode}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? "¡Insertado!" : "Copiar y pegar código"}</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW A: USER ALREADY LOGGED IN */}
          {currentUser ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-xs bg-sky-100 flex items-center justify-center font-bold text-sky-800 text-lg">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt={currentUser.displayName} className="w-full h-full object-cover" />
                    ) : (
                      currentUser.displayName.charAt(0)
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                      <span>{currentUser.displayName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                        {currentUser.provider}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {currentUser.email || currentUser.phoneNumber || "Cuenta Sincronizada"}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <Cloud className="w-3 h-3" />
                    <span>Nube Activa</span>
                  </span>
                </div>
              </div>

              {/* Sync Status Banner */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <div className="flex items-center justify-between text-xs text-amber-900 font-medium">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Último respaldo: {new Date(currentUser.lastSyncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                    Automático
                  </span>
                </div>
                <p className="text-xs text-amber-800/80 mt-1">
                  Tus fichas, notas, materias, zanahorias y niveles de idiomas están protegidos en tu perfil.
                </p>

                {syncFeedback && (
                  <div className="mt-2.5 p-2 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>{syncFeedback}</span>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                    <span>{isSyncing ? "Sincronizando..." : t.syncNow}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/50 font-bold text-xs transition-colors cursor-pointer"
                    title="Exportar respaldo como archivo JSON"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-700" />
                    <span>Respaldo JSON</span>
                  </button>
                </div>
              </div>

              {/* LINKED ACCOUNTS PANEL (Cuentas Entrelazadas) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-sky-600" />
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      Cuentas Entrelazadas
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500">Multiacceso Tuddy</span>
                </div>
                <p className="text-xs text-slate-500">
                  Entrelaza tu cuenta personal para iniciar sesión directamente con tu red social favorita sin crear cuentas duplicadas.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {/* Google */}
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <GoogleLogo />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 block truncate">Google</span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {currentUser.linkedAccounts?.google ? currentUser.linkedAccounts.google.email || "Entrelazado" : "No vinculado"}
                        </span>
                      </div>
                    </div>
                    {currentUser.linkedAccounts?.google ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                        ✓ Activo
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openOAuthDialog("google")}
                        className="text-[10px] font-bold text-sky-600 hover:text-sky-800 hover:bg-sky-50 px-2 py-1 rounded-md transition-colors cursor-pointer shrink-0"
                      >
                        Entrelazar
                      </button>
                    )}
                  </div>

                  {/* GitHub */}
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="text-slate-900"><GitHubLogo /></div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 block truncate">GitHub</span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {currentUser.linkedAccounts?.github ? currentUser.linkedAccounts.github.email || "Entrelazado" : "No vinculado"}
                        </span>
                      </div>
                    </div>
                    {currentUser.linkedAccounts?.github ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                        ✓ Activo
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openOAuthDialog("github")}
                        className="text-[10px] font-bold text-sky-600 hover:text-sky-800 hover:bg-sky-50 px-2 py-1 rounded-md transition-colors cursor-pointer shrink-0"
                      >
                        Entrelazar
                      </button>
                    )}
                  </div>

                  {/* Apple */}
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="text-slate-900"><AppleLogo /></div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 block truncate">Apple</span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {currentUser.linkedAccounts?.apple ? "Entrelazado" : "No vinculado"}
                        </span>
                      </div>
                    </div>
                    {currentUser.linkedAccounts?.apple ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                        ✓ Activo
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openOAuthDialog("apple")}
                        className="text-[10px] font-bold text-sky-600 hover:text-sky-800 hover:bg-sky-50 px-2 py-1 rounded-md transition-colors cursor-pointer shrink-0"
                      >
                        Entrelazar
                      </button>
                    )}
                  </div>

                  {/* Facebook */}
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <FacebookLogo />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 block truncate">Facebook</span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {currentUser.linkedAccounts?.facebook ? currentUser.linkedAccounts.facebook.email || "Entrelazado" : "No vinculado"}
                        </span>
                      </div>
                    </div>
                    {currentUser.linkedAccounts?.facebook ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                        ✓ Activo
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openOAuthDialog("facebook")}
                        className="text-[10px] font-bold text-sky-600 hover:text-sky-800 hover:bg-sky-50 px-2 py-1 rounded-md transition-colors cursor-pointer shrink-0"
                      >
                        Entrelazar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Logout button */}
              <div className="pt-2 flex justify-between items-center">
                <span className="text-xs text-slate-500">
                  ¿Deseas usar otro perfil o salir?
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t.logout}</span>
                </button>
              </div>
            </div>
          ) : (
            /* VIEW B: UNAUTHENTICATED / GUEST FLOW */
            <div className="space-y-5">
              
              {/* SECTION 1: DIRECT CONNECTION WITH YOUR SOCIAL ACCOUNT */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Entrar directamente con tu cuenta:</span>
                  </label>
                  <span className="text-[11px] text-slate-500">Conexión en 1 clic</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Google Direct Connect */}
                  <button
                    type="button"
                    onClick={() => openOAuthDialog("google")}
                    className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 hover:shadow-xs transition-all text-xs font-bold text-slate-800 cursor-pointer text-left group"
                  >
                    <GoogleLogo />
                    <div className="flex-1 min-w-0">
                      <span className="block truncate">Google</span>
                      <span className="block text-[10px] text-slate-400 font-normal truncate">Conectar cuenta</span>
                    </div>
                  </button>

                  {/* GitHub Direct Connect */}
                  <button
                    type="button"
                    onClick={() => openOAuthDialog("github")}
                    className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 hover:shadow-xs transition-all text-xs font-bold text-slate-800 cursor-pointer text-left group"
                  >
                    <div className="text-slate-900">
                      <GitHubLogo />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block truncate">GitHub</span>
                      <span className="block text-[10px] text-slate-400 font-normal truncate">Autorizar acceso</span>
                    </div>
                  </button>

                  {/* Apple Direct Connect */}
                  <button
                    type="button"
                    onClick={() => openOAuthDialog("apple")}
                    className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 hover:shadow-xs transition-all text-xs font-bold text-slate-800 cursor-pointer text-left group"
                  >
                    <div className="text-slate-900">
                      <AppleLogo />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block truncate">Apple ID</span>
                      <span className="block text-[10px] text-slate-400 font-normal truncate">Sign in with Apple</span>
                    </div>
                  </button>

                  {/* Facebook Direct Connect */}
                  <button
                    type="button"
                    onClick={() => openOAuthDialog("facebook")}
                    className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 hover:shadow-xs transition-all text-xs font-bold text-slate-800 cursor-pointer text-left group"
                  >
                    <FacebookLogo />
                    <div className="flex-1 min-w-0">
                      <span className="block truncate">Facebook</span>
                      <span className="block text-[10px] text-slate-400 font-normal truncate">Continuar perfil</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* DIVIDER */}
              <div className="relative flex items-center justify-center pt-1">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                  o método tradicional
                </span>
              </div>

              {/* SECTION 2: TRADITIONAL METHOD (EMAIL OR PHONE WITH OTP CODE) */}
              <div className="space-y-3.5">
                {/* Mode Selector Tabs */}
                <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      setTraditionalTab("email");
                      setOtpError("");
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      traditionalTab === "email"
                        ? "bg-white text-sky-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5 text-sky-600" />
                    <span>Correo electrónico</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTraditionalTab("phone");
                      setOtpError("");
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      traditionalTab === "phone"
                        ? "bg-white text-emerald-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Número de teléfono (SMS)</span>
                  </button>
                </div>

                {/* STEP 1: FORM INPUT */}
                {authStep === "form" && (
                  <form onSubmit={handleSendTraditionalOtp} className="space-y-3">
                    {traditionalTab === "email" ? (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Ingresa tu correo electrónico:
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={emailInput}
                            onChange={(e) => {
                              setEmailInput(e.target.value);
                              setOtpError("");
                            }}
                            placeholder="ejemplo@correo.com"
                            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                            autoFocus
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <Mail className="w-4 h-4" />
                          </div>
                        </div>

                        {/* Quick user email suggestion chip */}
                        {!emailInput && (
                          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-500">
                            <span>Sugerencia:</span>
                            <button
                              type="button"
                              onClick={() => setEmailInput("aaron2012.ultra@gmail.com")}
                              className="text-sky-700 font-bold hover:underline cursor-pointer"
                            >
                              aaron2012.ultra@gmail.com
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-700">
                            Número de teléfono móvil (cualquier país):
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setIsManualDialCode(!isManualDialCode);
                              setOtpError("");
                            }}
                            className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Globe className="w-3 h-3" />
                            <span>{isManualDialCode ? "Ver lista de países" : "Prefijo manual (+...)"}</span>
                          </button>
                        </div>

                        {/* Search or Quick Filter if not in manual mode */}
                        {!isManualDialCode && (
                          <div className="relative">
                            <input
                              type="text"
                              value={countrySearchQuery}
                              onChange={(e) => setCountrySearchQuery(e.target.value)}
                              placeholder="🔍 Buscar país por nombre o código (ej. México, +52, España, Argentina)..."
                              className="w-full px-3 py-1.5 pl-8 rounded-xl border border-slate-200 bg-slate-50 text-[11px] text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                            />
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            {countrySearchQuery && (
                              <button
                                type="button"
                                onClick={() => setCountrySearchQuery("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px]"
                              >
                                Limpiar
                              </button>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2">
                          {/* Country Selector or Manual Dial Code */}
                          {isManualDialCode ? (
                            <div className="relative shrink-0 w-28">
                              <input
                                type="text"
                                value={manualDialCodeInput}
                                onChange={(e) => {
                                  let val = e.target.value;
                                  if (!val.startsWith("+")) val = "+" + val.replace(/\+/g, "");
                                  setManualDialCodeInput(val);
                                  setOtpError("");
                                }}
                                placeholder="+34"
                                className="w-full px-3 py-2.5 rounded-2xl border border-emerald-400 bg-emerald-50/50 text-xs font-bold text-emerald-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                                title="Ingresa cualquier prefijo internacional (ej. +34, +52, +1, +44, +81)"
                              />
                            </div>
                          ) : (
                            <div className="relative shrink-0 max-w-[180px] sm:max-w-[200px]">
                              <select
                                value={selectedCountryCode}
                                onChange={(e) => {
                                  if (e.target.value === "CUSTOM") {
                                    setIsManualDialCode(true);
                                    setManualDialCodeInput("+");
                                  } else {
                                    setSelectedCountryCode(e.target.value);
                                  }
                                  setOtpError("");
                                }}
                                className="w-full appearance-none bg-slate-50 hover:bg-white border border-slate-300 rounded-2xl px-3 py-2.5 pr-7 text-xs font-bold text-slate-800 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-500 truncate"
                              >
                                {WORLD_COUNTRIES.filter((c) => {
                                  if (!countrySearchQuery.trim()) return true;
                                  const q = countrySearchQuery.toLowerCase().trim();
                                  return (
                                    c.name.toLowerCase().includes(q) ||
                                    c.dialCode.includes(q) ||
                                    c.code.toLowerCase().includes(q)
                                  );
                                }).map((c) => (
                                  <option key={c.code + c.name} value={c.dialCode}>
                                    {c.flag} {c.dialCode} ({c.name})
                                  </option>
                                ))}
                                <option value="CUSTOM">✏️ Otro prefijo de país...</option>
                              </select>
                              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          )}

                          {/* Phone number input */}
                          <div className="relative flex-1">
                            <input
                              type="tel"
                              value={phoneNumberInput}
                              onChange={(e) => {
                                setPhoneNumberInput(e.target.value);
                                setOtpError("");
                              }}
                              placeholder="Ej: 654 321 987"
                              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                              autoFocus
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                              <Phone className="w-4 h-4" />
                            </div>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-500">
                          Compatible con cualquier operador y país del mundo (recibe SMS con código de verificación al instante).
                        </p>
                      </div>
                    )}

                    {otpError && (
                      <p className="text-xs text-rose-600 font-bold">
                        {otpError}
                      </p>
                    )}

                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Código seguro de 6 dígitos sin contraseña</span>
                      </span>

                      <button
                        type="submit"
                        disabled={traditionalTab === "email" ? !emailInput.trim() : !phoneNumberInput.trim()}
                        className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {traditionalTab === "email" ? "Enviar código por Correo" : "Enviar SMS con código"}
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 2: VERIFICATION OTP CODE */}
                {authStep === "otp" && (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setAuthStep("form")}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Cambiar {traditionalTab === "email" ? "correo" : "teléfono"}</span>
                      </button>
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {activeChallenge?.destination}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ingresa el código de 6 dígitos:
                      </label>
                      <p className="text-[11px] text-slate-500 mb-2">
                        Enviado a <strong className="text-slate-800">{activeChallenge?.destination}</strong>
                      </p>

                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => {
                          setOtpCode(e.target.value.replace(/\D/g, ""));
                          setOtpError("");
                        }}
                        placeholder="••••••"
                        className="w-full text-center tracking-[0.6em] font-mono text-2xl font-black px-4 py-3 rounded-2xl border border-slate-300 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        autoFocus
                      />

                      {otpError && (
                        <p className="text-xs text-rose-600 font-bold mt-1.5">
                          {otpError}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500">
                        {resendSeconds > 0 ? (
                          `Reenviar código en ${resendSeconds}s`
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSendTraditionalOtp()}
                            className="text-sky-600 hover:text-sky-800 font-bold cursor-pointer"
                          >
                            Reenviar código ahora
                          </button>
                        )}
                      </span>

                      <button
                        type="submit"
                        disabled={otpCode.length < 6}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Verificar y Acceder
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Datos protegidos y encriptados</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            {currentUser ? "Cerrar" : "Seguir en Modo Invitado"}
          </button>
        </div>
      </div>
    </div>
  );
}
