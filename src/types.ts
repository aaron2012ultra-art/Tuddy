export type AppTab = 
  | "overview"
  | "notes_summarizer"
  | "flashcards"
  | "ai_tutor"
  | "exam_simulator"
  | "schedule"
  | "language_learning"
  | "games"
  | "analytics";

export interface WorkspaceTab {
  id: string;
  type: "bento" | "flashcards" | "notes" | "tutor" | "exams" | "schedule" | "languages" | "analytics" | "games";
  title: string;
  subtitle?: string;
  closable: boolean;
  deckId?: string;
  subject?: string;
  noteId?: string;
  customTopic?: string;
  gameId?: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  hint?: string;
  imageUrl?: string;
  imageCaption?: string;
  tags: string[];
  masteryLevel: 0 | 1 | 2 | 3; // 0: Nuevo, 1: Aprendiendo, 2: Bueno, 3: Dominado
  lastReviewed?: string;
  nextReview?: string;
  reviewCount: number;
}

export interface Deck {
  id: string;
  name: string;
  subject: string;
  color: string;
  description: string;
  createdAt: string;
}

export interface ImageAnalysisData {
  ocrText?: string;
  visualDescription?: string;
  relatedConcepts?: string[];
  suggestedNoteTitle?: string;
}

export interface StudyNote {
  id: string;
  title: string;
  subject: string;
  rawContent: string;
  aiSummary?: string;
  fileAttachmentName?: string;
  imageUrl?: string;
  imageAnalysis?: ImageAnalysisData;
  savedAudio?: {
    audioTitle: string;
    mode: "study" | "review";
    durationEstimate?: string;
    spokenScript: string;
    sections?: Array<{ title: string; text: string }>;
    keyTakeaways?: string[];
    tuddyMascotTip?: string;
    createdAt: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  subject: string;
  dayOfWeek: number; // 0 = Domingo, 1 = Lunes, etc.
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  color: string;
  reminderMinutesBefore: number;
  isCompleted?: boolean;
  notes?: string;
}

export interface ExamQuestion {
  id: string;
  type: "multiple_choice" | "true_false" | "open_short" | "fill_blank" | "audio_dictation" | "sentence_scramble" | "concept_match";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
  scenarioOrVisual?: string;
  points: number;
  audioPrompt?: string;
  scrambledWords?: string[];
  pairs?: Array<{ left: string; right: string }>;
}

export interface ExamConfig {
  topic: string;
  notes?: string;
  questionCount: number;
  questionTypes: Array<"multiple_choice" | "true_false" | "open_short" | "fill_blank" | "audio_dictation" | "sentence_scramble" | "concept_match">;
  difficulty: "easy" | "intermediate" | "hard" | "simulated_exam";
  includeVisualPrompts: boolean;
  timeLimitMinutes: number;
}

export interface ExamSession {
  id: string;
  title: string;
  topic?: string;
  date: string;
  totalQuestions: number;
  score: number;
  maxScore: number;
  percentage: number;
  durationSeconds: number;
  answers: Record<string, string>; // questionId -> student answer
  questions: ExamQuestion[];
}

export interface UserStats {
  streakDays: number;
  lastActiveDate: string;
  totalStudyMinutes: number;
  todayStudyMinutes: number;
  carrotCoins: number;
  cardsMastered: number;
  quizzesCompleted: number;
  averageScore: number;
  subjectProgress: Record<string, { totalHours: number; scoreAvg: number; cardsReviewed: number }>;
}

export interface TuddyMood {
  expression: "happy" | "studying" | "cheering" | "relaxed" | "proud" | "thinking";
  quote: string;
  advice: string;
  actionSuggestion: string;
}

export interface LanguageLesson {
  topicTitle: string;
  targetLanguage: string;
  level: string;
  vocabulary: Array<{
    word: string;
    translation: string;
    phoneticOrPronunciationGuide?: string;
    exampleSentence: string;
    exampleTranslation: string;
  }>;
  dialogue: Array<{
    speaker: string;
    text: string;
    translation: string;
  }>;
  listeningExercise?: {
    audioText: string;
    question: string;
    options: string[];
    correctOptionIndex: number;
    tip?: string;
  };
  readingExercise?: {
    passageTitle: string;
    passageText: string;
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation?: string;
  };
  writingExercise?: {
    prompt: string;
    expectedAnswer: string;
    alternativeAcceptable?: string[];
    hint?: string;
  };
  interactiveChallenge: {
    promptText: string;
    sentenceToCompleteOrTranslate: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
  };
  pronunciationTip?: string;
  tuddyEncouragement?: string;
}

export interface AppSettings {
  language: "es" | "en" | "fr" | "de" | "ja" | "pt" | "it";
  soundEffects: boolean;
  speechSpeed: number; // 0.8, 1.0, 1.2
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
  airplaneAnimationSpeed: "normal" | "fast";
}

export interface ClothingItem {
  id: string;
  name: string;
  category: "academico" | "aventura" | "urbano" | "elegante" | "profesiones" | "festivo" | "fantasia";
  priceInCarrots: number;
  description: string;
  iconEmoji: string;
  isProOnly?: boolean;
  colors: {
    vest: string;
    shirt: string;
    trim: string;
    buttons: string;
    collar?: string;
    tieOrScarf?: string;
    accent?: string;
  };
}

export type PathNodeType = "lesson" | "story" | "chest" | "checkpoint";

export interface CampaignPathNode {
  id: string;
  nodeIndex: number;
  type: PathNodeType;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | string;
  levelBadge: string;
  unitNumber: number;
  unitTitle: string;
  title: string;
  subtitle: string;
  targetLanguage: string;
  langCode: string;
  xOffsetPercent: number; // Sinusoidal curve offset -35% to +35%
  carrotsReward: number;
  crownNumber?: number; // 1 to 5 for checkpoint crown badges
  lesson?: LanguageLesson;
  chestRewardCarrots?: number;
}

export interface CampaignCityLevel {
  id: string;
  stageNumber: number;
  city: string;
  country: string;
  flag: string;
  levelBadge: string;
  title: string;
  subtitle: string;
  targetLanguage: string;
  langCode: string;
  carrotsReward: number;
  coordinates: { x: number; y: number }; // Percentage 0-100 on flight map
  lesson: LanguageLesson;
}

export type RabbitPersonality = "enthusiastic" | "calm_wise" | "fun_energetic";

export type RabbitFurColor = 
  | "white"           // Blanco Nieve
  | "cinnamon"        // Canela Suave
  | "lavender"        // Lavanda Pastel
  | "ash_gray"        // Gris Ceniza
  | "mint"            // Menta Suave
  | "golden"          // Dorado Miel
  // Nuevos Colores Exclusivos de Suscripción (Tuddy Plus 👑)
  | "golden_royal"    // 🌟 Oro Imperial 24K
  | "cosmic_galaxy"   // 🌌 Galaxia Cósmica
  | "rose_gold"       // 🌸 Oro Rosa Perlado
  | "obsidian_glow"   // 🖤 Obsidiana Mística
  | "rainbow_crystal" // 🌈 Prisma Iridiscente
  | "cyber_cyan";     // 💎 Diamante Celeste

export type RabbitAccessory = 
  | "none"
  | "study_glasses"   // Gafas de estudio redondas
  | "cozy_scarf"      // Bufanda académica
  | "student_cap"     // Birrete / Gorra de estudiante
  | "bowtie"          // Corbatín elegante
  | "carrot_crown"    // Corona de zanahoria dorada
  | "backpack";       // Mochila de explorador

export type RabbitOutfit = string;

export interface PetCustomization {
  name: string;
  personality: RabbitPersonality;
  furColor: RabbitFurColor;
  accessory: RabbitAccessory;
  outfit: RabbitOutfit;
  glasses?: string;
  unlockedOutfits?: string[];
}

export interface CustomSubject {
  id: string;
  name: string;
  category: string;
  color: string;
  recommendedTechnique?: string;
  keyConcepts?: string[];
  createdAt: string;
}

export type SubscriptionPlan = "free" | "plus_monthly" | "plus_annual" | "pro_monthly";

export interface PaymentDetails {
  method: "credit_card" | "paypal" | "google_pay" | "apple_pay" | "carrot_coins";
  cardBrand?: "visa" | "mastercard" | "amex" | "card";
  last4?: string;
  cardholderName?: string;
  billingEmail?: string;
  country?: string;
  postalCode?: string;
  transactionId?: string;
  amountPaid: string;
  paidAt: string;
}

export interface SubscriptionStatus {
  isPro: boolean;
  plan: SubscriptionPlan;
  planName?: string;
  price: string; // "$3.50 / mes" o "$29.99 / año"
  startDate?: string;
  renewsAt?: string;
  revivesLeft: number; // 3 por mes
  revivesMax: number;  // 3
  lastReviveMonth?: string;
  paymentDetails?: PaymentDetails;
}

export type AuthProvider = "email" | "phone" | "google" | "github" | "apple" | "facebook";

export interface UserAccount {
  id: string;
  displayName: string;
  email?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  provider: AuthProvider;
  createdAt: string;
  lastSyncedAt: string;
  isVerified: boolean;
}

export interface AccountBackupData {
  account: UserAccount;
  decks: Deck[];
  flashcards: Flashcard[];
  notes: StudyNote[];
  schedule: ScheduleItem[];
  examHistory: ExamSession[];
  stats: UserStats;
  pet: PetCustomization;
  subjects: CustomSubject[];
  settings: AppSettings;
  campaign: any;
  subscription: SubscriptionStatus;
  savedAt: string;
}

// -------------------------------------------------------------
// STUDY GAME MODELS - VIDEOJUEGOS CLÁSICOS CON TUDDY EL CONEJITO
// -------------------------------------------------------------
export type BaseGameType =
  | "angry_tuddy"        // 1. Angry Tuddy (Estilo Angry Birds: Tirachinas con física parabólica)
  | "flappy_tuddy"       // 2. Flappy Tuddy (Estilo Flappy Bird: Vuela entre tuberías y puertas del saber)
  | "tuddy_invaders"     // 3. Tuddy Invaders (Estilo Space Invaders / Galaga: Dispara semillas espaciales)
  | "brick_breaker"      // 4. Tuddy Rompebloques (Estilo Arkanoid / Breakout: Rebota la esfera de zanahoria)
  | "pac_tuddy"          // 5. Pac-Tuddy (Estilo Pac-Man: Laberinto de zanahorias y fantasmas de la duda)
  | "doodle_jump"        // 6. Doodle Tuddy Jump (Estilo Doodle Jump: Salto infinito en plataformas y resortes)
  | "subway_runner"      // 7. Tuddy Subway Dash (Estilo Subway Surfers: 3 carriles con saltos y esquives)
  | "fruit_ninja"        // 8. Tuddy Ninja Slicer (Estilo Fruit Ninja: Corta conceptos verdaderos y esquiva bombas)
  | "frogger_cross"      // 9. Frogger Tuddy (Estilo Frogger: Cruza carreteras y ríos sobre troncos)
  | "bubble_shooter"     // 10. Tuddy Bubble Shooter (Estilo Puzzle Bobble: Apunta y revienta burbujas del saber)
  | "tuddy_brick_breaker" // Alias for brick_breaker
  | "tuddy_ninja"         // Alias for fruit_ninja
  | "subway_tuddy"        // Alias for subway_runner
  | "doodle_tuddy"        // Alias for doodle_jump
  // Aliases legacy
  | "trivia_speed"
  | "word_scramble"
  | "true_false"
  | "concept_match"
  | "hangman_tuddy"
  | "order_sequence"
  | "definition_duel"
  | "fill_blank"
  | "rapid_sorter"
  | "catch_the_carrot";

export type PlusGameType =
  | "super_tuddy_bros"   // 11. Super Tuddy Bros (Estilo Super Mario Bros: Plataformas, bloques ? y bandera)
  | "tuddy_kart"         // 12. Tuddy Kart GP (Estilo Mario Kart: Carreras arcade con derrapes y turbos)
  | "tuddy_asteroids"    // 13. Tuddy Asteroids (Estilo Asteroids Clásico: Nave espacial 360° con inercia)
  | "tuddy_kong"         // 14. Tuddy Kong (Estilo Donkey Kong 1981: Sube escaleras esquivando barriles)
  | "tuddy_bomberman"    // 15. Tuddy Bomberman (Estilo Bomberman: Bombas de zanahoria en laberinto)
  | "pong_duel"          // 16. Tuddy Pong Duel (Estilo Pong / Air Hockey: Duelo arcade de reflejos)
  | "whack_a_tuddy"      // 17. Tuddy Topo Loco (Estilo Whack-A-Mole: Golpea las trampas con el mazo)
  | "rhythm_hero"        // 18. Tuddy Rhythm Hero (Estilo Guitar Hero: Notas rítmicas al compás de la música)
  | "snake_classic"      // 19. Tuddy Snake Clásico (Estilo Nokia Snake: Crece devorando la secuencia)
  | "boss_titan_brawler" // 20. Tuddy Titan Brawler (Estilo Street Fighter / Punch-Out: Combate arcade 1v1)
  // Aliases legacy
  | "escape_room"
  | "debate_simulator"
  | "fallacy_detector"
  | "boss_battle"
  | "concept_mindmap"
  | "spin_wheel"
  | "reverse_tutor"
  | "frenzy_60s"
  | "cipher_decoder"
  | "mastery_tournament";

export type StudyGameId = BaseGameType | PlusGameType;

export interface GameModelMeta {
  id: StudyGameId;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  isPlus: boolean;
  category: "Memoria" | "Velocidad" | "Estrategia" | "Razonamiento" | "Vocabulario";
  estimatedMinutes: number;
  carrotReward: number;
  badge: string;
  accentColor: string;
}

export interface GeneratedGameContent {
  gameId: StudyGameId;
  subject: string;
  topic: string;
  difficulty: "facil" | "medio" | "dificil";
  title: string;
  instructions: string;
  rounds: any[];
  extraData?: Record<string, any>;
}

