import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Crown, 
  Sparkles, 
  Check, 
  Flame, 
  Layers, 
  Globe, 
  Palette, 
  Shirt, 
  ShieldCheck, 
  Zap,
  Star,
  CheckCircle2,
  Lock,
  ArrowLeft,
  CreditCard,
  Receipt,
  Printer,
  AlertCircle,
  RefreshCw,
  Calendar,
  FileText,
  Clock,
  ExternalLink
} from "lucide-react";
import { SubscriptionStatus, SubscriptionPlan, PaymentDetails, PetCustomization } from "../types";
import confetti from "canvas-confetti";
import { ConfirmModal } from "./ConfirmModal";
import { useTranslation } from "../utils/translations";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionStatus;
  onUpdateSubscription: (updated: SubscriptionStatus) => void;
  pet?: PetCustomization;
  initialFocusPerk?: "flashcards" | "exams" | "languages" | "colors" | "outfits" | "streak" | "general";
  carrotCoins?: number;
  onDeductCarrots?: (amount: number) => void;
}

type ModalView = "overview" | "checkout" | "processing" | "receipt";
type PaymentMethod = "credit_card" | "paypal" | "google_pay";

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onUpdateSubscription,
  pet,
  initialFocusPerk = "general",
  carrotCoins = 0,
  onDeductCarrots,
}) => {
  const { t } = useTranslation();
  // Modal internal navigation
  const [currentView, setCurrentView] = useState<ModalView>("overview");
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("monthly");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card");

  // Credit card form state
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [billingEmail, setBillingEmail] = useState("estudiante@tuddy.app");
  const [billingCountry, setBillingCountry] = useState("España / Latinoamérica");
  const [postalCode, setPostalCode] = useState("28001");
  const [savePaymentMethod, setSavePaymentMethod] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Processing steps animation
  const [processingStep, setProcessingStep] = useState(0);

  // Active receipt data
  const [completedReceipt, setCompletedReceipt] = useState<PaymentDetails | null>(
    subscription.paymentDetails || null
  );

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (subscription.isPro) {
        setCurrentView("overview");
      } else {
        setCurrentView("overview");
      }
      setFormError(null);
    }
  }, [isOpen, subscription.isPro]);

  if (!isOpen) return null;

  const planPriceMonthly = 3.50;
  const planPriceAnnual = 29.99;
  const activePrice = selectedPlan === "monthly" ? planPriceMonthly : planPriceAnnual;
  const activePriceLabel = selectedPlan === "monthly" ? "$3.50 USD / mes" : "$29.99 USD / año";

  // Card formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    setCardNumber(formatted);
    if (formError) setFormError(null);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = raw.slice(0, 2) + "/" + raw.slice(2);
    }
    setCardExpiry(raw);
    if (formError) setFormError(null);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCardCvv(raw);
    if (formError) setFormError(null);
  };

  const detectCardBrand = (num: string): "visa" | "mastercard" | "amex" | "card" => {
    const clean = num.replace(/\s+/g, "");
    if (clean.startsWith("4")) return "visa";
    if (clean.startsWith("5") || clean.startsWith("2")) return "mastercard";
    if (clean.startsWith("3")) return "amex";
    return "card";
  };

  // Payment submission & validation
  const handleProceedToPayment = () => {
    setFormError(null);

    if (paymentMethod === "credit_card") {
      if (!cardholderName.trim() || cardholderName.trim().length < 3) {
        setFormError("Por favor ingresa el nombre completo del titular de la tarjeta.");
        return;
      }
      const cleanNum = cardNumber.replace(/\s+/g, "");
      if (cleanNum.length < 15) {
        setFormError("El número de tarjeta debe contener entre 15 y 16 dígitos numéricos.");
        return;
      }
      if (cardExpiry.length < 5 || !cardExpiry.includes("/")) {
        setFormError("Ingresa una fecha de expiración válida en formato MM/AA (ej. 08/28).");
        return;
      }
      if (cardCvv.length < 3) {
        setFormError("Ingresa el código de seguridad CVV (3 o 4 dígitos al reverso).");
        return;
      }
      if (!billingEmail.includes("@")) {
        setFormError("Ingresa un correo electrónico válido para enviar tu factura.");
        return;
      }
    }

    // Begin authentic payment processing flow
    setCurrentView("processing");
    setProcessingStep(1);

    setTimeout(() => {
      setProcessingStep(2);
    }, 650);

    setTimeout(() => {
      setProcessingStep(3);
    }, 1350);

    setTimeout(() => {
      // Payment finalized!
      const randomTxn = "TXN-TUDDY-" + Math.floor(100000 + Math.random() * 900000);
      const cleanNum = cardNumber.replace(/\s+/g, "");
      const last4 = cleanNum.length >= 4 ? cleanNum.slice(-4) : "8842";
      const brand = detectCardBrand(cardNumber);

      let methodLabel: PaymentMethod = paymentMethod;
      let amountString = `$${activePrice.toFixed(2)} USD`;

      const paymentRecord: PaymentDetails = {
        method: methodLabel,
        cardBrand: brand,
        last4: paymentMethod === "credit_card" ? last4 : undefined,
        cardholderName: cardholderName.trim() || (paymentMethod === "paypal" ? "Cuenta PayPal Verificada" : "Estudiante Tuddy"),
        billingEmail: billingEmail.trim(),
        country: billingCountry,
        postalCode: postalCode,
        transactionId: randomTxn,
        amountPaid: amountString,
        paidAt: new Date().toLocaleString("es-ES", { dateStyle: "long", timeStyle: "short" }),
      };

      const renewDays = selectedPlan === "monthly" ? 30 : 365;
      const updatedSubscription: SubscriptionStatus = {
        isPro: true,
        plan: selectedPlan === "monthly" ? "plus_monthly" : "plus_annual",
        planName: selectedPlan === "monthly" ? "Tuddy Plus Mensual" : "Tuddy Plus Anual",
        price: activePriceLabel,
        startDate: new Date().toISOString(),
        renewsAt: new Date(Date.now() + renewDays * 24 * 60 * 60 * 1000).toISOString(),
        revivesLeft: 3,
        revivesMax: 3,
        lastReviveMonth: new Date().toISOString().slice(0, 7),
        paymentDetails: paymentRecord,
      };

      onUpdateSubscription(updatedSubscription);
      setCompletedReceipt(paymentRecord);
      setCurrentView("receipt");

      // Grand celebration
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#F59E0B", "#FBBF24", "#10B981", "#3B82F6", "#EC4899"],
      });
    }, 2200);
  };

  const handleCancelSubscription = () => {
    setShowCancelConfirm(true);
  };

  const executeCancelSubscription = () => {
    const updated: SubscriptionStatus = {
      isPro: false,
      plan: "free",
      price: "$3.50 / mes",
      revivesLeft: 0,
      revivesMax: 3,
    };
    onUpdateSubscription(updated);
    setShowCancelConfirm(false);
    onClose();
  };

  const perks = [
    {
      id: "golden_profile",
      icon: Crown,
      color: "text-amber-500 bg-amber-50 border-amber-200",
      title: "Aro Dorado VIP & Nombre en Oro Real",
      desc: "Tu avatar resplandecerá con un aura dorada luminosa y el nombre de Tuddy relucirá en oro con corona imperial.",
      badge: "Insignia Legendaria",
    },
    {
      id: "streak_revives",
      icon: Flame,
      color: "text-orange-500 bg-orange-50 border-orange-200",
      title: "3 Revivir de Racha Cada Mes",
      desc: "Protege o restaura tu racha si un día no pudiste estudiar. ¡3 escudos garantizados recargables mensualmente!",
      badge: "3 Vidas / Mes",
    },
    {
      id: "unlimited_cards",
      icon: Layers,
      color: "text-emerald-500 bg-emerald-50 border-emerald-200",
      title: "Fichas de Estudio Ilimitadas (+15)",
      desc: "Supera el tope de 15 fichas de la cuenta gratuita. Crea miles de tarjetas, múltiples mazos y genera contenido con IA sin límite.",
      badge: "Ilimitado Total",
    },
    {
      id: "advanced_exams",
      icon: Zap,
      color: "text-sky-500 bg-sky-50 border-sky-200",
      title: "Exámenes con +50 Preguntas & 4 Modos Nuevos",
      desc: "Simulacros extensos (+50 a 100 reactivos), con Dictado por Audio, Ensayos con IA, Ordenar Frases y Emparejar Términos.",
      badge: "4 Modos Nuevos",
    },
    {
      id: "new_languages",
      icon: Globe,
      color: "text-indigo-500 bg-indigo-50 border-indigo-200",
      title: "Desbloquea 10 Idiomas Pro Exclusivos",
      desc: "Aprende Coreano 🇰🇷, Chino 🇨🇳, Ruso 🇷🇺, Árabe 🇸🇦, Holandés 🇳🇱, Sueco 🇸🇪, Griego 🇬🇷, Turco 🇹🇷, Polaco 🇵🇱 e Hindi 🇮🇳.",
      badge: "10 Idiomas Nuevos",
    },
    {
      id: "exclusive_colors",
      icon: Palette,
      color: "text-pink-500 bg-pink-50 border-pink-200",
      title: "6 Pelajes Exclusivos de Conejo",
      desc: "Personaliza a Tuddy con Oro 24K, Galaxia Cósmica, Oro Rosa Aperlado, Obsidiana Neón, Prisma y Diamante Celeste.",
      badge: "6 Pelajes VIP",
    },
    {
      id: "exclusive_outfits",
      icon: Shirt,
      color: "text-purple-500 bg-purple-50 border-purple-200",
      title: "Ropa y Atuendos Exclusivos VIP",
      desc: "Viste a Tuddy con la Toga Imperial de Oro, Smoking Platino, Traje Cyberpunk y Armadura Cósmica de Explorador.",
      badge: "Colección Alta Costura",
    },
    {
      id: "early_access",
      icon: Sparkles,
      color: "text-blue-500 bg-blue-50 border-blue-200",
      title: "Acceso Anticipado a Nuevas Funciones",
      desc: "Sé el primero en probar nuevas herramientas antes que nadie, como el Laboratorio Fonético y Desafíos Relámpago.",
      badge: "Acceso VIP",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl rounded-3xl bg-white border-2 border-amber-200 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
      >
        {/* =================================================================== */}
        {/* VIEW 1: OVERVIEW (PLANES Y BENEFICIOS) */}
        {/* =================================================================== */}
        {currentView === "overview" && (
          <>
            {/* GOLD GRADIENT HEADER */}
            <div className="relative bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 p-6 sm:p-7 text-white shrink-0 overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/15 blur-xl pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-amber-700/20 blur-lg pointer-events-none" />

              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-colors cursor-pointer z-10"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 relative z-10">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center shadow-lg">
                    <Crown className="w-9 h-9 text-yellow-100 drop-shadow-sm" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-slate-900 text-[10px] font-black tracking-wider text-amber-300 border border-amber-400">
                    PLUS
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/25 text-white text-[11px] font-black uppercase tracking-widest">
                      Membresía Oficial
                    </span>
                    {subscription.isPro && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Activo y Pagado
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-xs mt-1 flex items-center gap-2">
                    <span>Tuddy Plus</span>
                    <span className="text-yellow-200 text-xl font-normal">👑</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-yellow-50 font-medium">
                    Impulsa tu estudio sin límites ni barreras. Elige tu plan y realiza tu pago seguro.
                  </p>
                </div>
              </div>
            </div>

            {/* BODY CONTENT */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 grow">
              {/* PLAN SELECTOR CARDS */}
              {!subscription.isPro ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Selecciona tu opción de pago:
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      🔒 Pasarela 100% segura
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Monthly Option */}
                    <button
                      type="button"
                      onClick={() => setSelectedPlan("monthly")}
                      className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                        selectedPlan === "monthly"
                          ? "border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-400/20"
                          : "border-slate-200 hover:border-amber-300 bg-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                            Plan Mensual
                          </span>
                          {selectedPlan === "monthly" && (
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="text-3xl font-black text-slate-900">$3.50</span>
                          <span className="text-xs font-bold text-slate-500">USD / mes</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          Facturación mensual flexible. Cancela cuando quieras con 1 clic.
                        </p>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        <span>Renovación cada 30 días</span>
                      </div>
                    </button>

                    {/* Annual Option (Great Value) */}
                    <button
                      type="button"
                      onClick={() => setSelectedPlan("annual")}
                      className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                        selectedPlan === "annual"
                          ? "border-amber-500 bg-gradient-to-br from-amber-50 to-yellow-50/60 shadow-md ring-2 ring-amber-400/20"
                          : "border-slate-200 hover:border-amber-300 bg-white"
                      }`}
                    >
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                        Ahorra 28% • 2 Meses Gratis
                      </span>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                            Plan Anual (Mejor Valor)
                          </span>
                          {selectedPlan === "annual" && (
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="text-3xl font-black text-amber-600">$29.99</span>
                          <span className="text-xs font-bold text-slate-500">USD / año</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          Equivale a <strong>$2.49/mes</strong>. Acceso ininterrumpido durante 365 días.
                        </p>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] font-bold text-emerald-800">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Recomendado para todo el curso escolar</span>
                      </div>
                    </button>
                  </div>

                  {/* CALL TO ACTION BUTTON -> CHECKOUT */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentView("checkout")}
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-amber-300 group"
                    >
                      <Lock className="w-4 h-4 text-slate-950" />
                      <span>Proceder al Pago Seguro ({selectedPlan === "monthly" ? "$3.50 USD" : "$29.99 USD"})</span>
                      <span className="text-xs opacity-75 font-normal">→</span>
                    </button>
                    <p className="text-center text-[11px] text-slate-500 mt-2 flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Pagos cifrados de 256 bits mediante pasarela bancaria oficial.</span>
                    </p>
                  </div>
                </div>
              ) : (
                /* ACTIVE SUBSCRIPTION STATUS CARD */
                <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border-2 border-emerald-300 p-5 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                        <Crown className="w-7 h-7 text-yellow-200" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-emerald-950">
                            {subscription.planName || "Tuddy Plus"} Activo
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-[10px] font-black uppercase">
                            Al día
                          </span>
                        </div>
                        <p className="text-xs text-emerald-800">
                          {subscription.price} • Próxima renovación:{" "}
                          {subscription.renewsAt
                            ? new Date(subscription.renewsAt).toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "En 30 días"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentView("receipt")}
                        className="px-3 py-2 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Ver Factura</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCancelSubscription}
                        className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-500 hover:text-red-700 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Cancelar renovación
                      </button>
                    </div>
                  </div>

                  {/* STREAK REVIVES STATUS */}
                  <div className="p-3 rounded-xl bg-white border border-emerald-200/80 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span>
                        Vidas de racha disponibles este mes:{" "}
                        <strong className="text-orange-600">{subscription.revivesLeft} de 3</strong>
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Se recargan el primer día de cada mes
                    </span>
                  </div>
                </div>
              )}

              {/* PERKS LIST */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Beneficios incluidos en tu membresía Tuddy Plus:</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {perks.map((perk) => {
                    const Icon = perk.icon;
                    return (
                      <div
                        key={perk.id}
                        className="p-3 rounded-2xl border border-slate-200 bg-[#FDFCFB] hover:bg-white hover:border-amber-300 transition-all flex items-start gap-3"
                      >
                        <div className={`p-2 rounded-xl border ${perk.color} shrink-0 mt-0.5`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-black text-slate-800 leading-tight">
                              {perk.title}
                            </h4>
                          </div>
                          <span className="inline-block text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-amber-100/70 text-amber-800">
                            {perk.badge}
                          </span>
                          <p className="text-[11px] text-slate-600 leading-snug">
                            {perk.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Garantía de satisfacción. Cancela tu membresía cuando quieras sin preguntas.</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              >
                Cerrar
              </button>
            </div>
          </>
        )}

        {/* =================================================================== */}
        {/* VIEW 2: CHECKOUT (PASARELA DE PAGO INTERACTIVA Y SEGURA) */}
        {/* =================================================================== */}
        {currentView === "checkout" && (
          <>
            {/* CHECKOUT HEADER */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white shrink-0 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentView("overview")}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                  title="Regresar a opciones"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                      Tuddy Plus
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-400" /> Pasarela SSL 256-Bit
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    Finalizar Pago de Suscripción
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* CHECKOUT BODY */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 grow">
              {/* ORDER SUMMARY BANNER */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-800">
                    Resumen de tu pedido:
                  </span>
                  <h4 className="text-sm font-black text-slate-900 mt-0.5">
                    {selectedPlan === "monthly" ? "Tuddy Plus Mensual" : "Tuddy Plus Anual (2 meses gratis)"}
                  </h4>
                  <p className="text-xs text-slate-600">
                    Acceso total a los 10 idiomas Pro, exámenes ilimitados, ropa VIP y fichas sin límites.
                  </p>
                </div>

                <div className="text-right shrink-0 bg-white px-4 py-2 rounded-xl border border-amber-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Total a pagar hoy</span>
                  <span className="text-xl sm:text-2xl font-black text-amber-600">
                    ${activePrice.toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* PAYMENT METHOD SELECTOR */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Método de Pago:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("credit_card")}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                      paymentMethod === "credit_card"
                        ? "border-amber-500 bg-amber-50 text-amber-950 font-black shadow-xs"
                        : "border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-amber-600" />
                    <span className="text-xs font-bold">Tarjeta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("paypal")}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                      paymentMethod === "paypal"
                        ? "border-blue-500 bg-blue-50 text-blue-950 font-black shadow-xs"
                        : "border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <span className="text-lg font-black italic text-blue-600 leading-none">P</span>
                    <span className="text-xs font-bold">PayPal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("google_pay")}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                      paymentMethod === "google_pay"
                        ? "border-slate-900 bg-slate-100 text-slate-950 font-black shadow-xs"
                        : "border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <span className="text-sm font-black text-slate-800">G Pay / </span>
                    <span className="text-xs font-bold">Wallet</span>
                  </button>
                </div>
              </div>

              {/* PAYMENT FORMS ACCORDING TO METHOD */}
              {paymentMethod === "credit_card" && (
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Datos de la Tarjeta Bancaria:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-sm">VISA</span>
                      <span className="text-[10px] font-black bg-orange-100 text-orange-800 px-2 py-0.5 rounded-sm">Mastercard</span>
                      <span className="text-[10px] font-black bg-teal-100 text-teal-800 px-2 py-0.5 rounded-sm">AMEX</span>
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nombre del Titular:</label>
                    <input
                      type="text"
                      placeholder="Ej. Juan Pérez García"
                      value={cardholderName}
                      onChange={(e) => {
                        setCardholderName(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  {/* Card Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Número de Tarjeta:</span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        {detectCardBrand(cardNumber).toUpperCase()}
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="4532 0000 0000 0000"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-400 pl-10"
                      />
                      <CreditCard className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  {/* Expiry and CVV */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Vencimiento (MM/AA):</label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>CVV / CVC:</span>
                        <span className="text-[10px] text-slate-400">3-4 dígitos</span>
                      </label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        value={cardCvv}
                        onChange={handleCvvChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  {/* Billing Email & Country */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Correo para Factura:</label>
                      <input
                        type="email"
                        value={billingEmail}
                        onChange={(e) => setBillingEmail(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Código Postal / Región:</label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  {/* Checkbox Save */}
                  <label className="flex items-center gap-2 pt-1 text-xs text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={savePaymentMethod}
                      onChange={(e) => setSavePaymentMethod(e.target.checked)}
                      className="rounded-sm text-amber-600 focus:ring-amber-400"
                    />
                    <span>Guardar método de pago de forma segura para renovaciones mensuales automáticas.</span>
                  </label>
                </div>
              )}

              {paymentMethod === "paypal" && (
                <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/50 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black text-xl italic mx-auto flex items-center justify-center shadow-md">
                    P
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      Pagar con PayPal Express Checkout
                    </h4>
                    <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                      Serás conectado de forma segura con tu cuenta de PayPal para autorizar el cobro de ${activePrice.toFixed(2)} USD.
                    </p>
                  </div>
                  <div className="max-w-xs mx-auto">
                    <input
                      type="email"
                      value={billingEmail}
                      onChange={(e) => setBillingEmail(e.target.value)}
                      placeholder="correo@paypal.com"
                      className="w-full px-3.5 py-2 rounded-xl border border-blue-300 bg-white text-slate-800 text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "google_pay" && (
                <div className="p-5 rounded-2xl border border-slate-300 bg-slate-50 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-bold text-sm mx-auto flex items-center justify-center shadow-md">
                     / G
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      Google Pay o Apple Pay Express
                    </h4>
                    <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                      Paga al instante con la tarjeta configurada en tu dispositivo utilizando biometría (Face ID / Huella).
                    </p>
                  </div>
                </div>
              )}

              {/* FORM ERROR MESSAGE */}
              {formError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* PAY BUTTON */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {`Pagar $${activePrice.toFixed(2)} USD y Activar Tuddy Plus`}
                  </span>
                </button>
              </div>
            </div>

            {/* CHECKOUT FOOTER */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <button
                type="button"
                onClick={() => setCurrentView("overview")}
                className="text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
              >
                ← Cancelar y volver
              </button>
              <div className="flex items-center gap-1 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cifrado bancario AES-256</span>
              </div>
            </div>
          </>
        )}

        {/* =================================================================== */}
        {/* VIEW 3: PROCESSING SCREEN (SIMULACIÓN DE AUTORIZACIÓN BANCARIA) */}
        {/* =================================================================== */}
        {currentView === "processing" && (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 my-auto">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="w-20 h-20 rounded-full border-4 border-amber-200 border-t-amber-500"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Crown className="w-8 h-8 text-amber-500" />
              </div>
            </div>

            <div className="space-y-2 max-w-sm">
              <h3 className="text-xl font-black text-slate-900">
                Procesando Pago Seguro...
              </h3>
              <p className="text-xs text-slate-500">
                Por favor no cierres ni recargues esta ventana mientras confirmamos la transacción con la entidad bancaria.
              </p>
            </div>

            {/* Progress indicators */}
            <div className="w-full max-w-xs space-y-2 text-left text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  processingStep >= 1 ? "bg-emerald-500 text-white" : "bg-slate-200"
                }`}>
                  {processingStep > 1 ? "✓" : "1"}
                </span>
                <span>Cifrando credenciales SSL 256 bits</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  processingStep >= 2 ? "bg-emerald-500 text-white" : "bg-slate-200"
                }`}>
                  {processingStep > 2 ? "✓" : "2"}
                </span>
                <span>Contactando con pasarela bancaria</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  processingStep >= 3 ? "bg-emerald-500 text-white" : "bg-slate-200"
                }`}>
                  {processingStep >= 3 ? "✓" : "3"}
                </span>
                <span>Autorizando fondos y generando factura</span>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW 4: RECEIPT (FACTURA DIGITAL OFICIAL Y COMPROBANTE) */}
        {/* =================================================================== */}
        {currentView === "receipt" && completedReceipt && (
          <>
            {/* RECEIPT HEADER */}
            <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white shrink-0 text-center relative overflow-hidden">
              <div className="w-14 h-14 rounded-full bg-white text-emerald-600 mx-auto flex items-center justify-center shadow-lg mb-2">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
                Pago Aprobado y Confirmado
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                ¡Bienvenido a Tuddy Plus 👑!
              </h3>
              <p className="text-xs text-emerald-100">
                Tu transacción se completó con éxito y tu factura digital ha sido generada.
              </p>
            </div>

            {/* RECEIPT DETAILS (INVOICE SLIP) */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 grow">
              <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-3 font-mono text-xs text-slate-700">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 font-sans">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-500" />
                    <span className="font-black text-slate-900 text-sm">TUDDY PLUS OFFICIAL</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    PAGADO
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">N.° TRANSACCIÓN / FACTURA:</span>
                    <strong className="text-slate-800">{completedReceipt.transactionId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">FECHA Y HORA:</span>
                    <strong className="text-slate-800">{completedReceipt.paidAt}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">TITULAR:</span>
                    <strong className="text-slate-800">{completedReceipt.cardholderName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">MÉTODO UTILIZADO:</span>
                    <strong className="text-slate-800">
                      {completedReceipt.method === "credit_card"
                        ? `Tarjeta ${completedReceipt.cardBrand?.toUpperCase()} •••• ${completedReceipt.last4}`
                        : completedReceipt.method === "paypal"
                        ? "PayPal Express"
                        : "Digital Wallet"}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-sans">
                  <span className="text-xs font-bold text-slate-600">Importe Total Facturado:</span>
                  <span className="text-lg font-black text-emerald-600">{completedReceipt.amountPaid}</span>
                </div>
              </div>

              {/* UNLOCKED PERKS ALERT */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-black text-sm">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Tus beneficios ya están habilitados:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1 text-[11px]">
                  <li><strong>Aro dorado</strong> brillante en tu perfil y avatar de Tuddy.</li>
                  <li><strong>3 Vidas de Racha</strong> listas para protegerte este mes.</li>
                  <li><strong>10 Nuevos Idiomas</strong> (Coreano, Chino, Ruso, Árabe, etc.).</li>
                  <li><strong>6 Colores Exclusivos</strong> de pelaje y <strong>Ropa VIP</strong> en la tienda.</li>
                  <li><strong>Fichas Ilimitadas</strong> y simulacros de examen de más de 50 preguntas.</li>
                </ul>
              </div>
            </div>

            {/* RECEIPT FOOTER */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Imprimir Recibo</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm shadow-md cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>¡Empezar a Usar Tuddy Plus!</span>
              </button>
            </div>
          </>
        )}
      </motion.div>

      {/* Confirmation modal for cancellation */}
      <ConfirmModal
        isOpen={showCancelConfirm}
        title="¿Cancelar renovación de Tuddy Plus?"
        message="Mantendrás el acceso hasta el fin de tu ciclo actual, pero perderás luego los 10 idiomas nuevos, ropa exclusiva y el límite ilimitado de fichas."
        confirmText="Confirmar Cancelación"
        cancelText="Volver y Conservar"
        isDanger={true}
        onConfirm={executeCancelSubscription}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </div>
  );
};
