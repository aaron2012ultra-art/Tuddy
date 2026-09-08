import React, { useState, useEffect } from "react";
import { 
  Gamepad2, 
  Sparkles, 
  Crown, 
  Zap, 
  Binary, 
  CheckCheck, 
  Layers, 
  HeartPulse, 
  ArrowDownUp, 
  Target, 
  FileText, 
  SplitSquareVertical, 
  Key, 
  Scale, 
  SearchCheck, 
  Swords, 
  GitFork, 
  Compass, 
  GraduationCap, 
  Timer, 
  Terminal, 
  Trophy, 
  Play, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Flame, 
  Carrot, 
  HelpCircle, 
  BookOpen, 
  Search,
  Filter,
  Check,
  AlertTriangle,
  Lightbulb,
  Award
} from "lucide-react";
import confetti from "canvas-confetti";
import { 
  StudyGameId, 
  GameModelMeta, 
  GeneratedGameContent, 
  CustomSubject, 
  SubscriptionStatus, 
  UserStats,
  PetCustomization
} from "../types";
import { GAME_MODELS } from "../data/gameModelsData";
import { AngryTuddyGame } from "./games/AngryTuddyGame";
import { FlappyTuddyGame } from "./games/FlappyTuddyGame";
import { TuddyInvadersGame } from "./games/TuddyInvadersGame";
import { TuddyBrickBreakerGame } from "./games/TuddyBrickBreakerGame";
import { PacTuddyGame } from "./games/PacTuddyGame";
import { FruitNinjaGame } from "./games/FruitNinjaGame";
import { SubwayRunnerGame } from "./games/SubwayRunnerGame";
import { DoodleTuddyGame } from "./games/DoodleTuddyGame";
import { GenericArcadeEngine } from "./games/GenericArcadeEngine";

interface GameModelsSectionProps {
  subjects: CustomSubject[];
  subscription: SubscriptionStatus;
  userStats: UserStats;
  pet?: PetCustomization;
  onUpdateStats: (newStats: UserStats) => void;
  onOpenUpgradeModal?: () => void;
  initialTopic?: string;
  initialSubject?: string;
}

// Icon helper
const renderGameIcon = (name: string, className = "w-6 h-6") => {
  switch (name) {
    case "Zap": return <Zap className={className} />;
    case "Binary": return <Binary className={className} />;
    case "CheckCheck": return <CheckCheck className={className} />;
    case "Layers": return <Layers className={className} />;
    case "HeartPulse": return <HeartPulse className={className} />;
    case "ArrowDownUp": return <ArrowDownUp className={className} />;
    case "Target": return <Target className={className} />;
    case "FileText": return <FileText className={className} />;
    case "SplitSquareVertical": return <SplitSquareVertical className={className} />;
    case "Sparkles": return <Sparkles className={className} />;
    case "Key": return <Key className={className} />;
    case "Scale": return <Scale className={className} />;
    case "SearchCheck": return <SearchCheck className={className} />;
    case "Swords": return <Swords className={className} />;
    case "GitFork": return <GitFork className={className} />;
    case "Compass": return <Compass className={className} />;
    case "GraduationCap": return <GraduationCap className={className} />;
    case "Timer": return <Timer className={className} />;
    case "Terminal": return <Terminal className={className} />;
    case "Trophy": return <Trophy className={className} />;
    default: return <Gamepad2 className={className} />;
  }
};

const SAMPLE_TOPICS_BY_SUBJECT: Record<string, string[]> = {
  "Matemáticas": ["Teorema de Pitágoras", "Ecuaciones Cuadráticas", "Cálculo de Derivadas", "Trigonometría Básica"],
  "Historia": ["Revolución Francesa", "Guerra Fría", "Imperio Romano", "Descubrimiento de América"],
  "Biología": ["Fotosíntesis & Respiración", "Mitosis vs Meiosis", "Estructura del ADN", "Sistema Nervioso"],
  "Física": ["Leyes de Newton", "Termodinámica & Calor", "Electromagnetismo", "Óptica y Refracción"],
  "Química": ["Tabla Periódica & Enlaces", "Estequiometría", "Ácidos y Bases (pH)", "Química Orgánica"],
  "Inglés": ["Tiempos Verbales Pasados", "Phrasal Verbs Comunes", "Condicionales (If/Would)", "Vocabulario Académico C1"],
  "Filosofía": ["Mito de la Caverna de Platón", "Imperativo Categórico de Kant", "Existencialismo", "Lógica Proposicional"],
};

export function GameModelsSection({
  subjects,
  subscription,
  userStats,
  pet,
  onUpdateStats,
  onOpenUpgradeModal,
  initialTopic = "",
  initialSubject = "",
}: GameModelsSectionProps) {
  const handleArcadeFinish = (score: number, carrotsEarned: number) => {
    setUserScore(score);
    const newCoins = (userStats.carrotCoins || 0) + carrotsEarned;
    onUpdateStats({
      ...userStats,
      carrotCoins: newCoins,
      totalStudyMinutes: (userStats.totalStudyMinutes || 0) + 15,
    });
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#F59E0B", "#10B981", "#3B82F6", "#EC4899", "#8B5CF6"],
    });
  };
  // Topic & Subject selection state
  const defaultSubj = initialSubject || (subjects.length > 0 ? subjects[0].name : "Matemáticas");
  const [selectedSubject, setSelectedSubject] = useState(defaultSubj);
  const [customSubjectInput, setCustomSubjectInput] = useState("");
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [topicInput, setTopicInput] = useState(initialTopic || "Leyes Fundamentales");
  const [difficulty, setDifficulty] = useState<"facil" | "medio" | "dificil">("medio");

  // Filtering tabs: "all", "base", "plus"
  const [activeCatalogTab, setActiveCatalogTab] = useState<"all" | "base" | "plus">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Game execution state
  const [activeGameMeta, setActiveGameMeta] = useState<GameModelMeta | null>(null);
  const [isLoadingGame, setIsLoadingGame] = useState(false);
  const [activeGameContent, setActiveGameContent] = useState<GeneratedGameContent | null>(null);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | boolean | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [roundFeedback, setRoundFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // Special Game Mode states:
  // Boss Battle state
  const [bossCurrentHp, setBossCurrentHp] = useState(100);
  // Word Scramble state
  const [scrambleLetters, setScrambleLetters] = useState<string[]>([]);
  const [scrambleAnswer, setScrambleAnswer] = useState<string[]>([]);
  // Concept Match state
  const [selectedMatchConcept, setSelectedMatchConcept] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  // Plus Trial Unlock state (allows user to preview Plus games if desired)
  const [plusTrialUnlocked, setPlusTrialUnlocked] = useState(false);

  const effectiveSubject = isCustomSubject ? (customSubjectInput.trim() || "General") : selectedSubject;

  // Filtered games
  const filteredGames = GAME_MODELS.filter((game) => {
    if (activeCatalogTab === "base" && game.isPlus) return false;
    if (activeCatalogTab === "plus" && !game.isPlus) return false;
    if (categoryFilter !== "all" && game.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        game.title.toLowerCase().includes(q) ||
        game.subtitle.toLowerCase().includes(q) ||
        game.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Launch and adapt game with Tuddy AI
  const handleLaunchGame = async (game: GameModelMeta) => {
    // Check Tuddy Plus permission
    const hasPlusAccess = subscription.isPro || plusTrialUnlocked;
    if (game.isPlus && !hasPlusAccess) {
      if (onOpenUpgradeModal) {
        onOpenUpgradeModal();
      } else {
        const wantsTrial = window.confirm(
          `👑 "${game.title}" es un modelo exclusivo de Tuddy Plus.\n\n¿Deseas activar una prueba de cortesía para probar este juego ahora mismo?`
        );
        if (wantsTrial) {
          setPlusTrialUnlocked(true);
        } else {
          return;
        }
      }
      return;
    }

    const currentTopic = topicInput.trim() || "Fundamentos Generales";
    setActiveGameMeta(game);
    setIsLoadingGame(true);
    setActiveGameContent(null);
    setCurrentRoundIndex(0);
    setUserScore(0);
    setStreak(0);
    setGameFinished(false);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setRoundFeedback(null);
    setBossCurrentHp(100);
    setMatchedPairs([]);
    setSelectedMatchConcept(null);

    try {
      const res = await fetch("/api/ai/generate-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: game.id,
          subject: effectiveSubject,
          topic: currentTopic,
          difficulty,
        }),
      });

      if (!res.ok) throw new Error("Error conectando con Tuddy AI");
      const data: GeneratedGameContent = await res.json();
      setActiveGameContent(data);

      // Initialize game-specific round setups
      setupRound(game.id, data.rounds[0]);
    } catch (err) {
      console.error("Game load error:", err);
      alert("Hubo un detalle al adaptar el juego. Tuddy usará un modelo adaptativo local.");
    } finally {
      setIsLoadingGame(false);
    }
  };

  // Helper to initialize interactive state for specific round
  const setupRound = (gameId: StudyGameId, roundData: any) => {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setRoundFeedback(null);

    if (gameId === "word_scramble" && roundData?.term) {
      const letters = roundData.term.toUpperCase().split("");
      // Shuffle letters
      const shuffled = [...letters].sort(() => Math.random() - 0.5);
      setScrambleLetters(shuffled);
      setScrambleAnswer([]);
    }
  };

  // Handle User Answer Submission
  const handleCheckAnswer = (answer: any) => {
    if (isAnswerSubmitted || !activeGameContent || !activeGameMeta) return;

    const currentRound = activeGameContent.rounds[currentRoundIndex];
    let isCorrect = false;
    let feedbackText = "";

    // Validation logic per game model
    switch (activeGameMeta.id) {
      case "trivia_speed":
      case "definition_duel":
      case "catch_the_carrot":
      case "spin_wheel":
      case "frenzy_60s":
      case "mastery_tournament":
        isCorrect = answer === currentRound.correctAnswer;
        feedbackText = isCorrect 
          ? (currentRound.explanation || "¡Exacto! Respuesta correcta.") 
          : `Incorrecto. La respuesta correcta era: "${currentRound.correctAnswer}". ${currentRound.explanation || ""}`;
        break;

      case "true_false":
        isCorrect = answer === currentRound.isTrue;
        feedbackText = isCorrect
          ? `¡Bien analizado! ${currentRound.explanation || ""}`
          : `Respuesta incorrecta. ${currentRound.explanation || ""}`;
        break;

      case "boss_battle":
        isCorrect = answer === currentRound.correctAnswer;
        if (isCorrect) {
          const dmg = currentRound.damage || 25;
          setBossCurrentHp((prev) => Math.max(0, prev - dmg));
          feedbackText = `¡Golpe Crítico! Le has quitado ${dmg} HP al Jefe con tu conocimiento.`;
        } else {
          feedbackText = `¡El Titán se defendió! La respuesta era: "${currentRound.correctAnswer}".`;
        }
        break;

      case "reverse_tutor":
        isCorrect = answer === currentRound.correctIndex;
        feedbackText = isCorrect
          ? `🐰 Tuddy: "¡Increíble! Ahora lo entiendo perfectamente gracias a tu explicación. ¡Eres un gran tutor!"`
          : `🐰 Tuddy: "Hmm, aún tengo dudas con esa explicación. La mejor corrección era la opción ${Number(currentRound.correctIndex) + 1}."`;
        break;

      case "fallacy_detector":
        isCorrect = answer === currentRound.correctIndex;
        feedbackText = isCorrect
          ? `¡Excelente ojo crítico! ${currentRound.scientificCorrection || "Has desarmado la trampa conceptual."}`
          : `No era ese el error principal. ${currentRound.scientificCorrection || ""}`;
        break;

      case "word_scramble":
        const formed = scrambleAnswer.join("");
        isCorrect = formed.toUpperCase() === currentRound.term.toUpperCase();
        feedbackText = isCorrect
          ? `¡Palabra descifrada: ${currentRound.term}! ${currentRound.clue}`
          : `Casi. La palabra correcta era: ${currentRound.term}.`;
        break;

      default:
        isCorrect = true;
        feedbackText = "¡Ronda completada con éxito!";
        break;
    }

    setSelectedAnswer(answer);
    setIsAnswerSubmitted(true);
    setRoundFeedback({ isCorrect, text: feedbackText });

    if (isCorrect) {
      setUserScore((prev) => prev + 10 + streak * 2);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  // Next round or finish game
  const handleNextRound = () => {
    if (!activeGameContent || !activeGameMeta) return;

    if (currentRoundIndex + 1 < activeGameContent.rounds.length) {
      const nextIdx = currentRoundIndex + 1;
      setCurrentRoundIndex(nextIdx);
      setupRound(activeGameMeta.id, activeGameContent.rounds[nextIdx]);
    } else {
      // Game completed!
      setGameFinished(true);
      const earnedCarrots = activeGameMeta.carrotReward;
      const updatedStats: UserStats = {
        ...userStats,
        carrotCoins: userStats.carrotCoins + earnedCarrots,
        quizzesCompleted: userStats.quizzesCompleted + 1,
      };
      onUpdateStats(updatedStats);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER & ADAPTATION CONTROLLER */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center shadow-sm">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <span>Modelos de Juego de Tuddy AI</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                    20 Juegos Adaptativos
                  </span>
                </h1>
                <p className="text-xs text-slate-500">
                  Dile a Tuddy de qué materia y qué tema específico es tu lección, y los 20 juegos se adaptarán en tiempo real.
                </p>
              </div>
            </div>
          </div>

          {/* Plus Subscription Banner Status */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 via-indigo-50 to-sky-50 p-3 rounded-2xl border border-purple-200">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-purple-950">
                  {subscription.isPro || plusTrialUnlocked ? "Tuddy Plus Activado 👑" : "Tuddy Plus Disponible"}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-200 text-purple-900">
                  10 Juegos VIP
                </span>
              </div>
              <p className="text-[11px] text-purple-700">
                {subscription.isPro || plusTrialUnlocked
                  ? "Acceso ilimitado a los 20 modelos de juego"
                  : "10 juegos base gratis + 10 juegos VIP con suscripción"}
              </p>
            </div>
            {!subscription.isPro && !plusTrialUnlocked && onOpenUpgradeModal && (
              <button
                type="button"
                onClick={onOpenUpgradeModal}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
              >
                Ver Plus
              </button>
            )}
          </div>
        </div>

        {/* CONTROLS: SUBJECT, TOPIC & DIFFICULTY */}
        <div className="pt-5 grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* 1. Materia Selector */}
          <div className="md:col-span-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                <span>1. Materia:</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomSubject(!isCustomSubject)}
                className="text-[11px] text-sky-700 hover:text-sky-900 font-bold hover:underline cursor-pointer"
              >
                {isCustomSubject ? "Elegir de mi lista" : "+ Escribir otra materia"}
              </button>
            </div>

            {isCustomSubject ? (
              <input
                type="text"
                value={customSubjectInput}
                onChange={(e) => setCustomSubjectInput(e.target.value)}
                placeholder="Ej. Medicina, Psicología, Programación..."
                className="w-full px-3.5 py-2 rounded-2xl border border-slate-300 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            ) : (
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl border border-slate-300 bg-slate-50 hover:bg-white text-xs font-bold text-slate-800 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.color})
                  </option>
                ))}
                {!subjects.some((s) => s.name === "Matemáticas") && <option value="Matemáticas">Matemáticas</option>}
                {!subjects.some((s) => s.name === "Historia") && <option value="Historia">Historia</option>}
                {!subjects.some((s) => s.name === "Biología") && <option value="Biología">Biología</option>}
                {!subjects.some((s) => s.name === "Física") && <option value="Física">Física</option>}
                {!subjects.some((s) => s.name === "Química") && <option value="Química">Química</option>}
                {!subjects.some((s) => s.name === "Inglés") && <option value="Inglés">Inglés</option>}
              </select>
            )}
          </div>

          {/* 2. Tema Específico Input */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>2. Tema Específico que quieres estudiar:</span>
            </label>
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="Ej: Leyes de Newton, Fotosíntesis, Segunda Guerra Mundial..."
              className="w-full px-3.5 py-2 rounded-2xl border border-slate-300 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* 3. Dificultad */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-rose-500" />
              <span>3. Dificultad:</span>
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              {(["facil", "medio", "dificil"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`py-1 rounded-xl text-[11px] font-bold capitalize transition-all cursor-pointer ${
                    difficulty === lvl
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick topic inspiration pills */}
        <div className="mt-3.5 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-slate-500">
          <span className="shrink-0 text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span>Sugerencias para {effectiveSubject}:</span>
          </span>
          {(SAMPLE_TOPICS_BY_SUBJECT[effectiveSubject] || [
            "Conceptos Fundamentales",
            "Fórmulas Principales",
            "Causas y Consecuencias",
            "Preguntas de Examen Típicas"
          ]).map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => setTopicInput(topic)}
              className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-all cursor-pointer ${
                topicInput.toLowerCase() === topic.toLowerCase()
                  ? "bg-amber-100 border-amber-300 text-amber-900 font-bold"
                  : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ACTIVE GAME PLAYGROUND MODAL / OVERLAY */}
      {/* ------------------------------------------------------------- */}
      {(isLoadingGame || activeGameContent) && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col my-auto min-h-[560px] max-h-[96vh]">
            {/* Loading Screen */}
            {isLoadingGame && (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto animate-bounce shadow-md">
                  <Gamepad2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-800">
                  Tuddy AI está adaptando "{activeGameMeta?.title}"
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Generando mecánicas y contenido exclusivo para: <br />
                  <strong className="text-slate-700">{effectiveSubject}</strong> — <em>{topicInput}</em> ({difficulty})
                </p>
                <div className="w-36 h-2 bg-slate-100 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 w-2/3 animate-pulse rounded-full" />
                </div>
              </div>
            )}

            {/* Active Arcade Game Interface */}
            {activeGameContent && activeGameMeta && !isLoadingGame && (
              <div className="w-full h-full flex-1 flex flex-col">
                {activeGameMeta.id === "angry_tuddy" && (
                  <AngryTuddyGame
                    rounds={activeGameContent.rounds}
                    topic={activeGameContent.topic}
                    subject={activeGameContent.subject}
                    pet={pet}
                    onFinish={handleArcadeFinish}
                    onBack={() => {
                      setActiveGameContent(null);
                      setActiveGameMeta(null);
                    }}
                  />
                )}
                {activeGameMeta.id === "flappy_tuddy" && (
                  <FlappyTuddyGame
                    rounds={activeGameContent.rounds}
                    topic={activeGameContent.topic}
                    subject={activeGameContent.subject}
                    pet={pet}
                    onFinish={handleArcadeFinish}
                    onBack={() => {
                      setActiveGameContent(null);
                      setActiveGameMeta(null);
                    }}
                  />
                )}
                {activeGameMeta.id === "tuddy_invaders" && (
                  <TuddyInvadersGame
                    rounds={activeGameContent.rounds}
                    topic={activeGameContent.topic}
                    subject={activeGameContent.subject}
                    pet={pet}
                    onFinish={handleArcadeFinish}
                    onBack={() => {
                      setActiveGameContent(null);
                      setActiveGameMeta(null);
                    }}
                  />
                )}
                {(activeGameMeta.id === "tuddy_brick_breaker" || activeGameMeta.id === "brick_breaker") && (
                  <TuddyBrickBreakerGame
                    rounds={activeGameContent.rounds}
                    topic={activeGameContent.topic}
                    subject={activeGameContent.subject}
                    pet={pet}
                    onFinish={handleArcadeFinish}
                    onBack={() => {
                      setActiveGameContent(null);
                      setActiveGameMeta(null);
                    }}
                  />
                )}
                {activeGameMeta.id === "pac_tuddy" && (
                  <PacTuddyGame
                    rounds={activeGameContent.rounds}
                    topic={activeGameContent.topic}
                    subject={activeGameContent.subject}
                    pet={pet}
                    onFinish={handleArcadeFinish}
                    onBack={() => {
                      setActiveGameContent(null);
                      setActiveGameMeta(null);
                    }}
                  />
                )}
                {(activeGameMeta.id === "tuddy_ninja" || activeGameMeta.id === "fruit_ninja") && (
                  <FruitNinjaGame
                    rounds={activeGameContent.rounds}
                    topic={activeGameContent.topic}
                    subject={activeGameContent.subject}
                    pet={pet}
                    onFinish={handleArcadeFinish}
                    onBack={() => {
                      setActiveGameContent(null);
                      setActiveGameMeta(null);
                    }}
                  />
                )}
                {(activeGameMeta.id === "subway_tuddy" || activeGameMeta.id === "subway_runner") && (
                  <SubwayRunnerGame
                    rounds={activeGameContent.rounds}
                    topic={activeGameContent.topic}
                    subject={activeGameContent.subject}
                    pet={pet}
                    onFinish={handleArcadeFinish}
                    onBack={() => {
                      setActiveGameContent(null);
                      setActiveGameMeta(null);
                    }}
                  />
                )}
                {(activeGameMeta.id === "doodle_tuddy" || activeGameMeta.id === "doodle_jump") && (
                  <DoodleTuddyGame
                    rounds={activeGameContent.rounds}
                    topic={activeGameContent.topic}
                    subject={activeGameContent.subject}
                    pet={pet}
                    onFinish={handleArcadeFinish}
                    onBack={() => {
                      setActiveGameContent(null);
                      setActiveGameMeta(null);
                    }}
                  />
                )}
                {![
                  "angry_tuddy",
                  "flappy_tuddy",
                  "tuddy_invaders",
                  "tuddy_brick_breaker",
                  "brick_breaker",
                  "pac_tuddy",
                  "tuddy_ninja",
                  "fruit_ninja",
                  "subway_tuddy",
                  "subway_runner",
                  "doodle_tuddy",
                  "doodle_jump",
                ].includes(activeGameMeta.id) && (
                  <GenericArcadeEngine
                    gameId={activeGameMeta.id}
                    gameTitle={activeGameMeta.title}
                    gameCategory={activeGameMeta.category}
                    rounds={activeGameContent.rounds}
                    topic={activeGameContent.topic}
                    subject={activeGameContent.subject}
                    pet={pet}
                    onFinish={handleArcadeFinish}
                    onBack={() => {
                      setActiveGameContent(null);
                      setActiveGameMeta(null);
                    }}
                  />
                )}
              </div>
            )}
            {/* Removed quiz fallback */}
            {false && (
              <div className="hidden">
                  {/* VICTORY / SUMMARY SCREEN */}
                  {gameFinished ? (
                    <div className="text-center py-6 space-y-5">
                      <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-md">
                        <Trophy className="w-10 h-10" />
                      </div>

                      <div>
                        <h3 className="text-xl font-black text-slate-800">
                          ¡Desafío Completado con Éxito!
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Has dominado la adaptación de <strong>{activeGameMeta.title}</strong> para:
                          <br />
                          <span className="font-bold text-slate-700">{activeGameContent.topic}</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center">
                          <span className="block text-lg font-black text-amber-900">+{activeGameMeta.carrotReward}</span>
                          <span className="text-[10px] font-bold text-amber-700 flex items-center justify-center gap-1">
                            <Carrot className="w-3 h-3 text-amber-600" /> Zanahorias
                          </span>
                        </div>
                        <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 text-center">
                          <span className="block text-lg font-black text-sky-900">{userScore}</span>
                          <span className="text-[10px] font-bold text-sky-700">Puntuación</span>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                          <span className="block text-lg font-black text-emerald-900">100%</span>
                          <span className="text-[10px] font-bold text-emerald-700">Completado</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => handleLaunchGame(activeGameMeta)}
                          className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Jugar otra vez este tema</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveGameContent(null);
                            setActiveGameMeta(null);
                          }}
                          className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          Elegir otro juego o tema
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ACTIVE ROUND INTERACTION */
                    <div>
                      {/* Boss Battle HP Bar if applicable */}
                      {activeGameMeta.id === "boss_battle" && (
                        <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                          <div className="flex items-center justify-between text-xs font-black text-rose-950">
                            <span className="flex items-center gap-1.5">
                              <Swords className="w-4 h-4 text-rose-600" />
                              <span>{activeGameContent.extraData?.bossName || "Titán de la Materia"}</span>
                            </span>
                            <span>{bossCurrentHp} / 100 HP</span>
                          </div>
                          <div className="w-full h-3 bg-rose-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-rose-600 transition-all duration-500 rounded-full"
                              style={{ width: `${bossCurrentHp}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* ROUND CONTENT SWITCHER */}
                      {(() => {
                        const round = activeGameContent.rounds[currentRoundIndex];
                        if (!round) return null;

                        // 1. Multiple Choice Games (trivia_speed, definition_duel, catch_the_carrot, boss_battle, spin_wheel, frenzy_60s, mastery_tournament)
                        if (round.options && Array.isArray(round.options)) {
                          return (
                            <div className="space-y-4">
                              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
                                  Pregunta de Estudio:
                                </span>
                                <h3 className="text-base font-bold text-slate-800 leading-snug">
                                  {round.question || round.statement || round.sentenceWithBlank}
                                </h3>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {round.options.map((opt: string, idx: number) => {
                                  const isSelected = selectedAnswer === opt;
                                  let btnClass = "border-slate-200 bg-white hover:bg-slate-50 text-slate-800";

                                  if (isAnswerSubmitted) {
                                    if (opt === round.correctAnswer) {
                                      btnClass = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold";
                                    } else if (isSelected) {
                                      btnClass = "border-rose-500 bg-rose-50 text-rose-950 font-bold";
                                    } else {
                                      btnClass = "border-slate-200 bg-slate-50 text-slate-400 opacity-60";
                                    }
                                  }

                                  return (
                                    <button
                                      key={idx}
                                      type="button"
                                      disabled={isAnswerSubmitted}
                                      onClick={() => handleCheckAnswer(opt)}
                                      className={`p-3.5 rounded-2xl border text-xs text-left font-medium transition-all cursor-pointer flex items-start gap-2.5 ${btnClass}`}
                                    >
                                      <span className="w-5 h-5 rounded-lg bg-slate-100 font-bold text-[10px] text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                                        {String.fromCharCode(65 + idx)}
                                      </span>
                                      <span className="flex-1 leading-relaxed">{opt}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }

                        // 2. True / False Game
                        if (typeof round.isTrue === "boolean") {
                          return (
                            <div className="space-y-5">
                              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                                  Afirmación Científica:
                                </span>
                                <h3 className="text-base font-bold text-slate-800 leading-snug">
                                  "{round.statement}"
                                </h3>
                              </div>

                              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                                <button
                                  type="button"
                                  disabled={isAnswerSubmitted}
                                  onClick={() => handleCheckAnswer(true)}
                                  className={`py-4 px-6 rounded-2xl border-2 font-bold text-sm transition-all cursor-pointer flex flex-col items-center gap-2 ${
                                    isAnswerSubmitted
                                      ? round.isTrue === true
                                        ? "border-emerald-500 bg-emerald-50 text-emerald-950"
                                        : selectedAnswer === true
                                        ? "border-rose-500 bg-rose-50 text-rose-950"
                                        : "border-slate-200 bg-white text-slate-400 opacity-50"
                                      : "border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-900"
                                  }`}
                                >
                                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                  <span>VERDADERO</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={isAnswerSubmitted}
                                  onClick={() => handleCheckAnswer(false)}
                                  className={`py-4 px-6 rounded-2xl border-2 font-bold text-sm transition-all cursor-pointer flex flex-col items-center gap-2 ${
                                    isAnswerSubmitted
                                      ? round.isTrue === false
                                        ? "border-emerald-500 bg-emerald-50 text-emerald-950"
                                        : selectedAnswer === false
                                        ? "border-rose-500 bg-rose-50 text-rose-950"
                                        : "border-slate-200 bg-white text-slate-400 opacity-50"
                                      : "border-rose-300 bg-rose-50/50 hover:bg-rose-100 text-rose-900"
                                  }`}
                                >
                                  <XCircle className="w-6 h-6 text-rose-600" />
                                  <span>FALSO</span>
                                </button>
                              </div>
                            </div>
                          );
                        }

                        // 3. Word Scramble Game
                        if (round.term) {
                          return (
                            <div className="space-y-4 text-center">
                              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
                                <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block mb-1">
                                  Pista de Estudio:
                                </span>
                                <p className="text-xs text-sky-950 font-medium">{round.clue}</p>
                                {round.hint && (
                                  <p className="text-[11px] text-sky-700 italic mt-1">💡 Pista: {round.hint}</p>
                                )}
                              </div>

                              {/* Assembled Word Slot */}
                              <div className="flex items-center justify-center gap-1.5 min-h-[48px] p-2 bg-slate-100 rounded-2xl border border-slate-200">
                                {scrambleAnswer.length === 0 ? (
                                  <span className="text-xs text-slate-400 font-medium">
                                    Toca las letras en orden para descifrar el concepto
                                  </span>
                                ) : (
                                  scrambleAnswer.map((char, i) => (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => {
                                        if (isAnswerSubmitted) return;
                                        setScrambleLetters((prev) => [...prev, char]);
                                        setScrambleAnswer((prev) => prev.filter((_, idx) => idx !== i));
                                      }}
                                      className="w-9 h-9 rounded-xl bg-sky-600 text-white font-black text-sm shadow-xs flex items-center justify-center cursor-pointer hover:bg-sky-700 transition-colors"
                                    >
                                      {char}
                                    </button>
                                  ))
                                )}
                              </div>

                              {/* Available Letters Pool */}
                              <div className="flex flex-wrap items-center justify-center gap-1.5">
                                {scrambleLetters.map((char, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    disabled={isAnswerSubmitted}
                                    onClick={() => {
                                      setScrambleAnswer((prev) => [...prev, char]);
                                      setScrambleLetters((prev) => prev.filter((_, idx) => idx !== i));
                                    }}
                                    className="w-10 h-10 rounded-xl bg-white border border-slate-300 hover:border-sky-500 text-slate-800 font-black text-sm shadow-2xs flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                                  >
                                    {char}
                                  </button>
                                ))}
                              </div>

                              {!isAnswerSubmitted && scrambleAnswer.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleCheckAnswer(scrambleAnswer.join(""))}
                                  className="mt-3 px-6 py-2 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                                >
                                  Verificar Palabra
                                </button>
                              )}
                            </div>
                          );
                        }

                        // Fallback generic round render
                        return (
                          <div className="p-4 rounded-2xl bg-slate-50 text-center space-y-3">
                            <p className="text-xs text-slate-700 font-medium">
                              {round.question || round.text || round.step || "Ronda de estudio interactiva"}
                            </p>
                            {!isAnswerSubmitted && (
                              <button
                                type="button"
                                onClick={() => handleCheckAnswer("OK")}
                                className="px-5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
                              >
                                Continuar
                              </button>
                            )}
                          </div>
                        );
                      })()}

                      {/* ROUND FEEDBACK BANNER */}
                      {isAnswerSubmitted && roundFeedback && (
                        <div
                          className={`mt-5 p-4 rounded-2xl border text-xs shadow-xs animate-in fade-in slide-in-from-bottom-2 ${
                            roundFeedback.isCorrect
                              ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                              : "bg-rose-50 border-rose-300 text-rose-950"
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {roundFeedback.isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <span className="font-bold block mb-0.5">
                                {roundFeedback.isCorrect ? "¡Excelente razonamiento!" : "Explicación Pedagógica:"}
                              </span>
                              <p className="leading-relaxed">{roundFeedback.text}</p>
                            </div>
                          </div>

                          <div className="mt-3 flex justify-end">
                            <button
                              type="button"
                              onClick={handleNextRound}
                              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <span>Siguiente Ronda</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* GAMES CATALOG BAR & TAB SWITCHER */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tab switcher: Base vs Plus vs All */}
        <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveCatalogTab("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCatalogTab === "all"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Todos (20 Modelos)
          </button>
          <button
            type="button"
            onClick={() => setActiveCatalogTab("base")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCatalogTab === "base"
                ? "bg-white text-amber-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🎮 10 Juegos Base</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-emerald-100 text-emerald-800 font-bold">
              Gratis
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCatalogTab("plus")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCatalogTab === "plus"
                ? "bg-white text-purple-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>👑 10 Tuddy Plus</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-purple-100 text-purple-800 font-bold">
              VIP
            </span>
          </button>
        </div>

        {/* Search Input in games */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar modelo de juego..."
            className="w-full pl-8 pr-3 py-1.5 rounded-2xl border border-slate-200 bg-white text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 20 GAMES GRID */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredGames.map((game) => {
          const isPlusLocked = game.isPlus && !subscription.isPro && !plusTrialUnlocked;

          return (
            <div
              key={game.id}
              className={`relative bg-white rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between group ${
                game.isPlus
                  ? "border-purple-200 hover:border-purple-400 hover:shadow-md"
                  : "border-slate-200 hover:border-amber-300 hover:shadow-md"
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${game.accentColor} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}
                  >
                    {renderGameIcon(game.iconName, "w-5 h-5")}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {game.isPlus ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                        <Crown className="w-3 h-3 text-purple-600" />
                        <span>Plus 👑</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Base (Gratis)
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-black text-slate-800 tracking-tight leading-snug group-hover:text-amber-600 transition-colors">
                  {game.title}
                </h3>
                <p className="text-[11px] font-bold text-slate-400 mb-1.5">{game.subtitle}</p>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {game.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{game.estimatedMinutes}m</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-700 font-bold">
                    <Carrot className="w-3 h-3 text-amber-500" />
                    <span>+{game.carrotReward}</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleLaunchGame(game)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                    game.isPlus
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isPlusLocked ? "Probar Plus" : "Jugar"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
