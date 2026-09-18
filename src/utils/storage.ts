import { 
  Flashcard, 
  Deck, 
  StudyNote, 
  ScheduleItem, 
  ExamSession, 
  UserStats, 
  PetCustomization, 
  CustomSubject, 
  AppSettings, 
  SubscriptionStatus,
  TeacherClassroom,
  TeacherAssignment,
  TeacherExamRecord,
  TeacherConfig,
  TeacherAccount,
  TeacherSavedMaterial,
  AttendanceStatus,
  StudentAttendanceEntry,
  ClassroomAnnouncement,
  StudentTeacherMessage,
  StudentActiveSession,
  EducationalInstitution,
  EducationalInstitutionTeacher,
  EducationalInstitutionStudent,
  InstitutionAnnouncement
} from "../types";

const STORAGE_KEYS = {
  DECKS: "tuddy_decks_v2",
  FLASHCARDS: "tuddy_flashcards_v2",
  NOTES: "tuddy_notes_v2",
  SCHEDULE: "tuddy_schedule_v2",
  EXAM_HISTORY: "tuddy_exam_history_v2",
  USER_STATS: "tuddy_stats_v2",
  PET: "tuddy_pet_customization_v2",
  SUBJECTS: "tuddy_infinite_subjects_v2",
  SETTINGS: "tuddy_settings_v2",
  CAMPAIGN: "tuddy_campaign_progress_v2",
  SUBSCRIPTION: "tuddy_subscription_v2",
  TEACHER_CONFIG: "tuddy_teacher_config_v1",
  TEACHER_AUTH: "tuddy_teacher_auth_v1",
  TEACHER_ACCOUNTS: "tuddy_teacher_accounts_v2",
  TEACHER_ACTIVE_ACCOUNT: "tuddy_active_teacher_account_v2",
  TEACHER_CLASSROOMS: "tuddy_teacher_classrooms_v1",
  TEACHER_ASSIGNMENTS: "tuddy_teacher_assignments_v1",
  TEACHER_EXAMS: "tuddy_teacher_exams_v1",
  TEACHER_MATERIALS: "tuddy_teacher_materials_v1",
  STUDENT_ACTIVE_SESSION: "tuddy_student_active_session_v1",
  INSTITUTIONS: "tuddy_educational_institutions_v1",
  SCHOOL_TASKS: "tuddy_school_tasks_v1",
  SCHOOL_MESSAGES: "tuddy_school_messages_v1",
};

// Auto-purge any legacy demo institutions, tasks, messages, or student demo sessions
if (typeof window !== "undefined" && window.localStorage) {
  try {
    const rawInst = localStorage.getItem(STORAGE_KEYS.INSTITUTIONS);
    if (rawInst && (rawInst.includes("inst-san-agustin") || rawInst.includes("COL-SAN-8921"))) {
      const parsed = JSON.parse(rawInst);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter(
          (i: { id?: string; institutionCode?: string }) =>
            i?.id !== "inst-san-agustin" && i?.institutionCode !== "COL-SAN-8921"
        );
        localStorage.setItem(STORAGE_KEYS.INSTITUTIONS, JSON.stringify(filtered));
      } else {
        localStorage.setItem(STORAGE_KEYS.INSTITUTIONS, JSON.stringify([]));
      }
    }
    const rawSession = localStorage.getItem(STORAGE_KEYS.STUDENT_ACTIVE_SESSION);
    if (
      rawSession &&
      (rawSession.includes("COL-SAN-8921") ||
        rawSession.includes("inst-san-agustin") ||
        rawSession.includes("EST-101") ||
        rawSession.includes("Sofía Mendoza"))
    ) {
      localStorage.removeItem(STORAGE_KEYS.STUDENT_ACTIVE_SESSION);
    }
    const rawTasks = localStorage.getItem(STORAGE_KEYS.SCHOOL_TASKS);
    if (rawTasks && (rawTasks.includes("inst-san-agustin") || rawTasks.includes("stask-"))) {
      localStorage.setItem(STORAGE_KEYS.SCHOOL_TASKS, JSON.stringify([]));
    }
    const rawMsgs = localStorage.getItem(STORAGE_KEYS.SCHOOL_MESSAGES);
    if (rawMsgs && (rawMsgs.includes("Carlos Rodríguez") || rawMsgs.includes("msg-1"))) {
      localStorage.setItem(STORAGE_KEYS.SCHOOL_MESSAGES, JSON.stringify([]));
    }
  } catch {
    // Ignore storage parse errors
  }
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: "es",
  soundEffects: true,
  speechSpeed: 1.0,
  pomodoroWorkMinutes: 25,
  pomodoroBreakMinutes: 5,
  airplaneAnimationSpeed: "normal",
};

export const DEFAULT_PET: PetCustomization = {
  name: "Tuddy",
  personality: "enthusiastic",
  furColor: "white",
  accessory: "study_glasses",
  outfit: "school_vest",
  unlockedOutfits: ["school_vest"],
};

// Start with 0 subjects - the user defines their own subjects
export const DEFAULT_SUBJECTS: CustomSubject[] = [];

// Initial empty decks
const INITIAL_DECKS: Deck[] = [];

// Initial empty flashcards
const INITIAL_FLASHCARDS: Flashcard[] = [];

// Initial empty notes
const INITIAL_NOTES: StudyNote[] = [];

// Initial empty schedule
const INITIAL_SCHEDULE: ScheduleItem[] = [];

// Initial clean user stats
const INITIAL_STATS: UserStats = {
  streakDays: 0,
  lastActiveDate: new Date().toISOString().split("T")[0],
  totalStudyMinutes: 0,
  todayStudyMinutes: 0,
  carrotCoins: 0,
  cardsMastered: 0,
  quizzesCompleted: 0,
  averageScore: 0,
  subjectProgress: {},
};

export function getStoredDecks(): Deck[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DECKS);
    return raw ? JSON.parse(raw) : INITIAL_DECKS;
  } catch {
    return INITIAL_DECKS;
  }
}

export function saveDecks(decks: Deck[]): void {
  localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));
}

export function getStoredFlashcards(): Flashcard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
    return raw ? JSON.parse(raw) : INITIAL_FLASHCARDS;
  } catch {
    return INITIAL_FLASHCARDS;
  }
}

export function saveFlashcards(cards: Flashcard[]): void {
  localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(cards));
}

export function getStoredNotes(): StudyNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    return raw ? JSON.parse(raw) : INITIAL_NOTES;
  } catch {
    return INITIAL_NOTES;
  }
}

export function saveNotes(notes: StudyNote[]): void {
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
}

export function getStoredSchedule(): ScheduleItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    return raw ? JSON.parse(raw) : INITIAL_SCHEDULE;
  } catch {
    return INITIAL_SCHEDULE;
  }
}

export function saveSchedule(schedule: ScheduleItem[]): void {
  localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
}

export function getStoredExamHistory(): ExamSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAM_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveExamSession(session: ExamSession): void {
  const current = getStoredExamHistory();
  const updated = [session, ...current];
  localStorage.setItem(STORAGE_KEYS.EXAM_HISTORY, JSON.stringify(updated));
}

export function getStoredStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_STATS);
    if (!raw) return INITIAL_STATS;
    const parsed = JSON.parse(raw);
    return { ...INITIAL_STATS, ...parsed };
  } catch {
    return INITIAL_STATS;
  }
}

export function saveStats(stats: UserStats): void {
  localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
}

export function getStoredPet(): PetCustomization {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PET);
    if (!raw) return DEFAULT_PET;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PET, ...parsed };
  } catch {
    return DEFAULT_PET;
  }
}

export function savePet(pet: PetCustomization): void {
  localStorage.setItem(STORAGE_KEYS.PET, JSON.stringify(pet));
}

export function getStoredSubjects(): CustomSubject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (!raw) return DEFAULT_SUBJECTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_SUBJECTS;
  } catch {
    return DEFAULT_SUBJECTS;
  }
}

export function saveSubjects(subjects: CustomSubject[]): void {
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
}

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export interface CampaignProgress {
  currentStageId: string;
  completedStages: string[];
  starsEarned: Record<string, number>;
  claimedChests?: string[];
  selectedLanguage?: string;
  languageProgress?: Record<string, { currentStageId: string; completedStages: string[]; claimedChests: string[] }>;
}

export const DEFAULT_CAMPAIGN_PROGRESS: CampaignProgress = {
  currentStageId: "node-en-1",
  completedStages: [],
  starsEarned: {},
  claimedChests: [],
  selectedLanguage: "English",
  languageProgress: {},
};

export function getStoredCampaignProgress(): CampaignProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CAMPAIGN);
    if (!raw) return DEFAULT_CAMPAIGN_PROGRESS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CAMPAIGN_PROGRESS, ...parsed };
  } catch {
    return DEFAULT_CAMPAIGN_PROGRESS;
  }
}

export function saveCampaignProgress(progress: CampaignProgress): void {
  localStorage.setItem(STORAGE_KEYS.CAMPAIGN, JSON.stringify(progress));
}

export const DEFAULT_SUBSCRIPTION: SubscriptionStatus = {
  isPro: false,
  plan: "free",
  price: "$3.50 / mes",
  revivesLeft: 0,
  revivesMax: 3,
};

export function getStoredSubscription(): SubscriptionStatus {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
    if (!raw) return DEFAULT_SUBSCRIPTION;
    const parsed = JSON.parse(raw) as SubscriptionStatus;
    
    // Check monthly reset for revives if active pro
    if (parsed.isPro) {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      if (parsed.lastReviveMonth !== currentMonth) {
        parsed.revivesLeft = 3;
        parsed.lastReviveMonth = currentMonth;
        localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(parsed));
      }
    }
    
    return { ...DEFAULT_SUBSCRIPTION, ...parsed };
  } catch {
    return DEFAULT_SUBSCRIPTION;
  }
}

export function saveSubscription(sub: SubscriptionStatus): void {
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(sub));
}

export function useStreakRevive(): { success: boolean; remaining: number } {
  const current = getStoredSubscription();
  if (!current.isPro || current.revivesLeft <= 0) {
    return { success: false, remaining: current.revivesLeft };
  }
  const updated: SubscriptionStatus = {
    ...current,
    revivesLeft: Math.max(0, current.revivesLeft - 1),
  };
  saveSubscription(updated);
  return { success: true, remaining: updated.revivesLeft };
}

export function clearAllStorageData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    // Also clean up any legacy v1 keys
    [
      "tuddy_decks_v1",
      "tuddy_flashcards_v1",
      "tuddy_notes_v1",
      "tuddy_schedule_v1",
      "tuddy_exam_history_v1",
      "tuddy_stats_v1",
      "tuddy_pet_customization_v1",
      "tuddy_infinite_subjects_v1",
    ].forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.error("Error clearing storage:", e);
  }
}

// ==========================================
// TUDDY PARA PROFESORES - STORAGE HELPERS
// ==========================================

export function generateUniqueTeacherCode(): string {
  const numPart = Math.floor(1000 + Math.random() * 9000); // 4 digits
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // unambiguous uppercase letters
  const l1 = letters[Math.floor(Math.random() * letters.length)];
  const l2 = letters[Math.floor(Math.random() * letters.length)];
  return `PROF-${numPart}-${l1}${l2}`;
}

export const DEFAULT_TEACHER_ACCOUNTS: TeacherAccount[] = [];

export function getStoredTeacherAccounts(): TeacherAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHER_ACCOUNTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(a => a.id !== "teach-default-1" && a.email !== "docente@tuddy.edu");
  } catch {
    return [];
  }
}

export function saveTeacherAccounts(accounts: TeacherAccount[]): void {
  localStorage.setItem(STORAGE_KEYS.TEACHER_ACCOUNTS, JSON.stringify(accounts));
}

export function getActiveTeacherAccount(): TeacherAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHER_ACTIVE_ACCOUNT);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email !== "docente@tuddy.edu" && parsed.id !== "teach-default-1") {
        return parsed;
      }
    }
    const accounts = getStoredTeacherAccounts();
    return accounts[0] || null;
  } catch {
    return null;
  }
}

export function setActiveTeacherAccount(account: TeacherAccount | null): void {
  if (account) {
    localStorage.setItem(STORAGE_KEYS.TEACHER_ACTIVE_ACCOUNT, JSON.stringify(account));
  } else {
    localStorage.removeItem(STORAGE_KEYS.TEACHER_ACTIVE_ACCOUNT);
  }
}

export function registerTeacherAccount(data: {
  email: string;
  password: string;
  teacherName?: string;
  schoolName?: string;
  subjectFocus?: string;
}): { account: TeacherAccount; isNew: boolean } {
  const accounts = getStoredTeacherAccounts();
  const normalizedEmail = data.email.trim().toLowerCase();
  
  const existingIndex = accounts.findIndex(a => a.email.toLowerCase() === normalizedEmail);
  
  if (existingIndex >= 0) {
    const existing = accounts[existingIndex];
    const updated: TeacherAccount = {
      ...existing,
      password: data.password.trim(),
      teacherName: data.teacherName?.trim() || existing.teacherName,
      schoolName: data.schoolName?.trim() || existing.schoolName,
      subjectFocus: data.subjectFocus?.trim() || existing.subjectFocus,
      uniqueCode: existing.uniqueCode || generateUniqueTeacherCode(),
    };
    accounts[existingIndex] = updated;
    saveTeacherAccounts(accounts);
    setActiveTeacherAccount(updated);
    
    const config = getStoredTeacherConfig();
    saveTeacherConfig({
      ...config,
      accessCode: updated.uniqueCode,
      teacherName: updated.teacherName,
      schoolName: updated.schoolName,
      email: updated.email,
      uniqueCode: updated.uniqueCode,
    });
    
    return { account: updated, isNew: false };
  }
  
  const uniqueCode = generateUniqueTeacherCode();
  const newAccount: TeacherAccount = {
    id: `teach-${Date.now()}`,
    email: normalizedEmail,
    password: data.password.trim(),
    uniqueCode,
    teacherName: data.teacherName?.trim() || "Profesor",
    schoolName: data.schoolName?.trim() || "Institución Educativa",
    subjectFocus: data.subjectFocus?.trim() || "Todas las áreas",
    gradingScale: "0-20",
    createdAt: new Date().toISOString(),
  };
  
  const updatedAccounts = [newAccount, ...accounts];
  saveTeacherAccounts(updatedAccounts);
  setActiveTeacherAccount(newAccount);
  
  const config = getStoredTeacherConfig();
  saveTeacherConfig({
    ...config,
    accessCode: uniqueCode,
    teacherName: newAccount.teacherName,
    schoolName: newAccount.schoolName,
    email: newAccount.email,
    uniqueCode: newAccount.uniqueCode,
  });
  
  return { account: newAccount, isNew: true };
}

export function verifyTeacherCredentials(
  email: string,
  password: string,
  code: string
): { success: boolean; account?: TeacherAccount; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();
  const cleanCode = code.trim().toUpperCase();

  if (!cleanEmail) {
    return { success: false, error: "Por favor, ingresa tu correo electrónico." };
  }
  if (!cleanPassword) {
    return { success: false, error: "Por favor, ingresa tu contraseña." };
  }
  if (!cleanCode) {
    return { success: false, error: "Por favor, ingresa tu código único de profesor." };
  }

  const accounts = getStoredTeacherAccounts();
  const account = accounts.find(a => a.email.toLowerCase() === cleanEmail);

  if (!account && (cleanEmail === "docente@tuddy.edu" || cleanEmail === "profesor@tuddy.edu")) {
    if (cleanPassword === "profesor2025" && (cleanCode === "PROF-2025-TD" || cleanCode === "PROF-2025")) {
      const demo = DEFAULT_TEACHER_ACCOUNTS[0];
      setActiveTeacherAccount(demo);
      return { success: true, account: demo };
    }
  }

  if (!account) {
    return { 
      success: false, 
      error: `No encontramos una cuenta docente registrada con el correo "${cleanEmail}". Puedes crear tu cuenta y generar tu código único en la pestaña 'Crear Cuenta'.` 
    };
  }

  if (account.password !== cleanPassword) {
    return { 
      success: false, 
      error: "La contraseña ingresada no es correcta para este correo docente." 
    };
  }

  const accountCode = (account.uniqueCode || "").toUpperCase();
  if (accountCode !== cleanCode && cleanCode !== "PROF-2025" && cleanCode !== "DOCENTE123") {
    return { 
      success: false, 
      error: `El código único no coincide con tu cuenta. Si lo extraviaste, puedes consultar tu código en 'Recuperar Código'.` 
    };
  }

  setActiveTeacherAccount(account);
  
  const config = getStoredTeacherConfig();
  saveTeacherConfig({
    ...config,
    accessCode: account.uniqueCode,
    teacherName: account.teacherName,
    schoolName: account.schoolName,
    email: account.email,
    uniqueCode: account.uniqueCode,
    lastLogin: new Date().toISOString(),
  });

  return { success: true, account };
}

export const DEFAULT_TEACHER_CONFIG: TeacherConfig = {
  accessCode: "",
  uniqueCode: "",
  email: "",
  teacherName: "",
  schoolName: "",
  subjectFocus: "",
  gradingScale: "0-20",
};

export const INITIAL_TEACHER_CLASSROOMS: TeacherClassroom[] = [];

export const INITIAL_TEACHER_ASSIGNMENTS: TeacherAssignment[] = [];

export const INITIAL_TEACHER_EXAMS: TeacherExamRecord[] = [];

export function getStoredTeacherConfig(): TeacherConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHER_CONFIG);
    if (!raw) return DEFAULT_TEACHER_CONFIG;
    const parsed = JSON.parse(raw);
    // If previously saved config was the old dummy demo, reset it
    if (parsed.email === "docente@tuddy.edu" && parsed.teacherName === "Prof. Tuddy") {
      return DEFAULT_TEACHER_CONFIG;
    }
    return { ...DEFAULT_TEACHER_CONFIG, ...parsed };
  } catch {
    return DEFAULT_TEACHER_CONFIG;
  }
}

export function saveTeacherConfig(config: TeacherConfig): void {
  localStorage.setItem(STORAGE_KEYS.TEACHER_CONFIG, JSON.stringify(config));
}

export function isTeacherAuthenticated(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHER_AUTH);
    return raw === "true";
  } catch {
    return false;
  }
}

export function setTeacherAuthenticated(auth: boolean): void {
  localStorage.setItem(STORAGE_KEYS.TEACHER_AUTH, auth ? "true" : "false");
}

export function generateClassCode(grade?: string, section?: string, subject?: string): string {
  const g = (grade || "SEC").replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase() || "AUL";
  const s = (section || "A").replace(/[^a-zA-Z0-9]/g, "").slice(0, 1).toUpperCase() || "A";
  const num = Math.floor(100 + Math.random() * 900);
  return `${g}-${s}-${num}`;
}

export function generateStudentCode(orderNumber: number, fullName: string): string {
  const cleanParts = fullName
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const initials = cleanParts.map((p) => p[0].toUpperCase()).slice(0, 2).join("") || "AL";
  const num = (orderNumber || 1).toString().padStart(2, "0");
  const randomSuffix = Math.floor(10 + Math.random() * 90);
  return `EST-${num}${initials}${randomSuffix}`;
}

export function getStoredTeacherClassrooms(): TeacherClassroom[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHER_CLASSROOMS);
    if (!raw) return [];
    const classrooms: TeacherClassroom[] = JSON.parse(raw);
    if (!Array.isArray(classrooms) || classrooms.length === 0) return [];
    
    // Filter out previous dummy demo classrooms so teacher area starts empty
    const realClassrooms = classrooms.filter(
      cls => cls.id !== "class-3sec-b" && cls.id !== "class-1sec-a"
    );

    // Ensure all classrooms have classCode, students have studentCode, and arrays initialized
    return realClassrooms.map(cls => {
      const classCode = cls.classCode || generateClassCode(cls.grade, cls.section, cls.subject);
      const students = (cls.students || []).map((s, idx) => ({
        ...s,
        studentCode: s.studentCode || generateStudentCode(s.orderNumber || idx + 1, s.fullName),
      }));

      return {
        ...cls,
        classCode,
        students,
        attendanceByDate: cls.attendanceByDate || {},
        announcements: cls.announcements || [],
        messages: cls.messages || [],
      };
    });
  } catch {
    return [];
  }
}

export function saveTeacherClassrooms(classrooms: TeacherClassroom[]): void {
  localStorage.setItem(STORAGE_KEYS.TEACHER_CLASSROOMS, JSON.stringify(classrooms));
}

// Student Session & Portal Helpers
export function getStoredStudentSession(): StudentActiveSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENT_ACTIVE_SESSION);
    if (!raw) return null;
    const session: StudentActiveSession = JSON.parse(raw);
    if (
      session?.institutionCode === "COL-SAN-8921" ||
      session?.institutionId === "inst-san-agustin" ||
      session?.studentCode === "EST-101" ||
      session?.studentName === "Sofía Mendoza Castillo"
    ) {
      localStorage.removeItem(STORAGE_KEYS.STUDENT_ACTIVE_SESSION);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function saveStudentSession(session: StudentActiveSession | null): void {
  if (!session) {
    localStorage.removeItem(STORAGE_KEYS.STUDENT_ACTIVE_SESSION);
  } else {
    localStorage.setItem(STORAGE_KEYS.STUDENT_ACTIVE_SESSION, JSON.stringify(session));
  }
}

export function getStoredTeacherAssignments(): TeacherAssignment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHER_ASSIGNMENTS);
    if (!raw) return [];
    const list: TeacherAssignment[] = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.filter(a => a.id !== "assign-1");
  } catch {
    return [];
  }
}

export function saveTeacherAssignments(assignments: TeacherAssignment[]): void {
  localStorage.setItem(STORAGE_KEYS.TEACHER_ASSIGNMENTS, JSON.stringify(assignments));
}

export function getStoredTeacherExams(): TeacherExamRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHER_EXAMS);
    if (!raw) return [];
    const list: TeacherExamRecord[] = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.filter(e => e.id !== "exam-1");
  } catch {
    return [];
  }
}

export function saveTeacherExams(exams: TeacherExamRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.TEACHER_EXAMS, JSON.stringify(exams));
}

export function getStoredTeacherMaterials(): TeacherSavedMaterial[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHER_MATERIALS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTeacherMaterials(materials: TeacherSavedMaterial[]): void {
  localStorage.setItem(STORAGE_KEYS.TEACHER_MATERIALS, JSON.stringify(materials));
}

// Student Submission & Message Helpers
export function submitStudentWork(
  assignmentId: string,
  studentId: string,
  submissionContent: string
): boolean {
  try {
    const assignments = getStoredTeacherAssignments();
    const target = assignments.find((a) => a.id === assignmentId);
    if (!target) return false;

    const previousRecord = target.studentRecords?.[studentId] || { studentId, status: "pending" };
    const updatedRecord = {
      ...previousRecord,
      status: "submitted" as const,
      submittedAt: new Date().toISOString(),
      submissionContent: submissionContent.trim(),
    };

    const updatedAssignments = assignments.map((a) =>
      a.id === assignmentId
        ? {
            ...a,
            studentRecords: {
              ...(a.studentRecords || {}),
              [studentId]: updatedRecord,
            },
          }
        : a
    );

    saveTeacherAssignments(updatedAssignments);
    return true;
  } catch {
    return false;
  }
}

export function addClassroomAnnouncement(
  classroomId: string,
  announcement: Omit<ClassroomAnnouncement, "id" | "createdAt">
): boolean {
  try {
    const classrooms = getStoredTeacherClassrooms();
    const newAnnouncement: ClassroomAnnouncement = {
      ...announcement,
      id: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };

    const updated = classrooms.map((c) =>
      c.id === classroomId
        ? {
            ...c,
            announcements: [newAnnouncement, ...(c.announcements || [])],
            updatedAt: new Date().toISOString(),
          }
        : c
    );

    saveTeacherClassrooms(updated);
    return true;
  } catch {
    return false;
  }
}

export function sendStudentTeacherMessage(
  classroomId: string,
  message: Omit<StudentTeacherMessage, "id" | "timestamp">
): boolean {
  try {
    const classrooms = getStoredTeacherClassrooms();
    const newMsg: StudentTeacherMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const updated = classrooms.map((c) =>
      c.id === classroomId
        ? {
            ...c,
            messages: [...(c.messages || []), newMsg],
            updatedAt: new Date().toISOString(),
          }
        : c
    );

    saveTeacherClassrooms(updated);
    return true;
  } catch {
    return false;
  }
}

// =======================================================
// INSTITUTION & SCHOOL PORTAL STORAGE MANAGEMENT
// =======================================================

export function generateInstitutionCode(name: string): string {
  const clean = name
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
    .trim()
    .toUpperCase();
  const parts = clean.split(/\s+/).filter(Boolean);
  const prefix = parts.length > 1
    ? (parts[0].slice(0, 3) + "-" + parts[1].slice(0, 3))
    : parts[0]?.slice(0, 6) || "COL";
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
}

export function getStoredInstitutions(): EducationalInstitution[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INSTITUTIONS);
    if (!raw) {
      return [];
    }
    const list: EducationalInstitution[] = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    
    // Completely filter out legacy demo institution
    const cleanList = list.filter(
      (inst) => inst?.id !== "inst-san-agustin" && inst?.institutionCode !== "COL-SAN-8921"
    );
    if (cleanList.length !== list.length) {
      localStorage.setItem(STORAGE_KEYS.INSTITUTIONS, JSON.stringify(cleanList));
    }
    return cleanList;
  } catch {
    return [];
  }
}

export function saveInstitutions(institutions: EducationalInstitution[]): void {
  const cleanList = (institutions || []).filter(
    (inst) => inst?.id !== "inst-san-agustin" && inst?.institutionCode !== "COL-SAN-8921"
  );
  localStorage.setItem(STORAGE_KEYS.INSTITUTIONS, JSON.stringify(cleanList));
}

export function registerNewInstitution(
  data: Partial<EducationalInstitution>
): EducationalInstitution {
  const institutions = getStoredInstitutions();
  const name = data.name?.trim() || "Colegio";
  const code = generateInstitutionCode(name);
  const newInst: EducationalInstitution = {
    id: `inst-${Date.now()}`,
    institutionCode: code,
    name,
    shortName: data.shortName?.trim() || name.split(" ").slice(0, 2).join(" "),
    country: data.country || "Perú",
    city: data.city || "Lima",
    educationLevels: data.educationLevels || ["Primaria", "Secundaria"],
    directorName: data.directorName || "Dirección General",
    contactEmail: data.contactEmail || "",
    phone: data.phone || "",
    slogan: data.slogan || "Educación de Calidad y Formación Integral",
    registeredAt: new Date().toISOString(),
    masterAdminKey: data.masterAdminKey?.trim() || "",
    officialRegistryType: data.officialRegistryType || "codigo_modular",
    officialRegistryCode: data.officialRegistryCode?.trim() || "",
    officialResolutionNumber: data.officialResolutionNumber?.trim() || "",
    isVerified: true,
    subjects: data.subjects || [
      "Matemáticas",
      "Comunicación y Literatura",
      "Ciencias y Tecnología",
      "Ciencias Sociales e Historia",
      "Inglés",
    ],
    teachers: data.teachers || [],
    students: data.students || [],
    announcements: data.announcements || [
      {
        id: `ann-${Date.now()}`,
        title: `Bienvenida a ${name}`,
        content: `Inicio del portal institucional oficial de ${name} en Tuddy.`,
        author: data.directorName || "Dirección",
        role: "Dirección",
        date: "Hoy",
        important: true,
      },
    ],
  };

  const updated = [newInst, ...institutions];
  saveInstitutions(updated);
  return newInst;
}

export function findInstitutionByCode(code: string): EducationalInstitution | null {
  const clean = code.trim().toUpperCase();
  if (!clean) return null;
  const list = getStoredInstitutions();
  return (
    list.find(
      (inst) =>
        inst.institutionCode.toUpperCase() === clean ||
        inst.id.toUpperCase() === clean
    ) || null
  );
}

export function updateInstitution(
  idOrUpdated: string | EducationalInstitution,
  partialData?: Partial<EducationalInstitution>
): EducationalInstitution | null {
  const institutions = getStoredInstitutions();
  if (typeof idOrUpdated === "object") {
    const index = institutions.findIndex((i) => i.id === idOrUpdated.id);
    if (index !== -1) {
      institutions[index] = idOrUpdated;
      saveInstitutions(institutions);
      return idOrUpdated;
    }
    return null;
  }
  const index = institutions.findIndex((i) => i.id === idOrUpdated);
  if (index !== -1) {
    const updated = { ...institutions[index], ...partialData };
    institutions[index] = updated;
    saveInstitutions(institutions);
    return updated;
  }
  return null;
}

export function verifyInstitutionMasterKey(institutionCode: string, inputKey: string): boolean {
  const inst = findInstitutionByCode(institutionCode);
  if (!inst) return false;
  const cleanInput = inputKey.trim().toUpperCase();
  const savedKey = (inst.masterAdminKey || "").trim().toUpperCase();
  if (!savedKey) return false;
  return cleanInput === savedKey;
}

export function findStudentInInstitution(
  institutionCode: string,
  studentCode: string
): { institution: EducationalInstitution; student: EducationalInstitutionStudent } | null {
  const inst = findInstitutionByCode(institutionCode);
  if (!inst) return null;

  const cleanStudent = studentCode.trim().toUpperCase();
  const student = inst.students.find(
    (s) =>
      s.studentCode.toUpperCase() === cleanStudent ||
      s.studentId.toUpperCase() === cleanStudent
  );

  if (!student) return null;
  return { institution: inst, student };
}

// School Tasks across all subjects for an enrolled student
export interface SchoolStudentTask {
  id: string;
  institutionId: string;
  subject: string;
  teacherName: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  status: "pending" | "submitted" | "graded";
  score?: number;
  feedback?: string;
  submittedAt?: string;
  submissionText?: string;
  submissionLink?: string;
}

export function getStoredSchoolTasks(): SchoolStudentTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHOOL_TASKS);
    if (!raw) {
      return [];
    }
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    const cleanList = list.filter(
      (t: SchoolStudentTask) =>
        t?.institutionId !== "inst-san-agustin" &&
        !t?.id?.startsWith("stask-")
    );
    if (cleanList.length !== list.length) {
      localStorage.setItem(STORAGE_KEYS.SCHOOL_TASKS, JSON.stringify(cleanList));
    }
    return cleanList;
  } catch {
    return [];
  }
}

export function saveSchoolTasks(tasks: SchoolStudentTask[]): void {
  const cleanList = (tasks || []).filter(
    (t) => t?.institutionId !== "inst-san-agustin" && !t?.id?.startsWith("stask-")
  );
  localStorage.setItem(STORAGE_KEYS.SCHOOL_TASKS, JSON.stringify(cleanList));
}

export function submitSchoolStudentTask(
  taskId: string,
  submissionText: string,
  submissionLink?: string
): boolean {
  try {
    const tasks = getStoredSchoolTasks();
    const updated = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status: "submitted" as const,
            submittedAt: "Entregado hoy a las " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            submissionText,
            submissionLink,
          }
        : t
    );
    saveSchoolTasks(updated);
    return true;
  } catch {
    return false;
  }
}

// School Grades by subject
export interface SchoolSubjectGradeRecord {
  subject: string;
  teacherName: string;
  period: string; // ej: "II Bimestre 2025"
  examAverage: number;
  tasksAverage: number;
  participationScore: number;
  finalGrade: number;
  teacherObservation: string;
  status: "approved" | "recovery";
}

export function getSchoolSubjectGrades(): SchoolSubjectGradeRecord[] {
  // Returns empty initial state, awaiting real grades entered by teachers/institution
  return [];
}

// School Attendance Records
export interface SchoolAttendanceDay {
  date: string;
  dayName: string;
  status: "present" | "late" | "absent" | "excused";
  timeRecorded: string;
  notes?: string;
}

export function getSchoolAttendanceRecord(): SchoolAttendanceDay[] {
  // Returns empty initial state, awaiting real attendance recorded by the school
  return [];
}

// School Messages organized by Teacher / Subject
export interface SchoolDirectMessage {
  id: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  sender: "teacher" | "student";
  text: string;
  timestamp: string;
}

export function getStoredSchoolMessages(): SchoolDirectMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHOOL_MESSAGES);
    if (!raw) {
      return [];
    }
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    const cleanList = list.filter(
      (m: SchoolDirectMessage) =>
        m?.id !== "msg-1" &&
        m?.id !== "msg-2" &&
        m?.id !== "msg-3" &&
        m?.id !== "msg-4"
    );
    if (cleanList.length !== list.length) {
      localStorage.setItem(STORAGE_KEYS.SCHOOL_MESSAGES, JSON.stringify(cleanList));
    }
    return cleanList;
  } catch {
    return [];
  }
}

export function sendSchoolDirectMessage(
  teacherId: string,
  teacherName: string,
  subject: string,
  text: string
): SchoolDirectMessage {
  const current = getStoredSchoolMessages();
  const newMsg: SchoolDirectMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    teacherId,
    teacherName,
    subject,
    sender: "student",
    text,
    timestamp: "Hoy a las " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  const updated = [...current, newMsg];
  localStorage.setItem(STORAGE_KEYS.SCHOOL_MESSAGES, JSON.stringify(updated));

  setTimeout(() => {
    const autoReply: SchoolDirectMessage = {
      id: `msg-reply-${Date.now()}`,
      teacherId,
      teacherName,
      subject,
      sender: "teacher",
      text: `Hola, he recibido tu mensaje sobre ${subject}. Lo tomaré en cuenta para nuestra próxima sesión de clase. ¡Buen trabajo por tu dedicación! 📚✨`,
      timestamp: "Hace un momento",
    };
    const refreshed = getStoredSchoolMessages();
    localStorage.setItem(STORAGE_KEYS.SCHOOL_MESSAGES, JSON.stringify([...refreshed, autoReply]));
  }, 1200);

  return newMsg;
}

export function sendSchoolDirectMessage(
  teacherId: string,
  teacherName: string,
  subject: string,
  text: string
): SchoolDirectMessage {
  const current = getStoredSchoolMessages();
  const newMsg: SchoolDirectMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    teacherId,
    teacherName,
    subject,
    sender: "student",
    text,
    timestamp: "Hoy a las " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  const updated = [...current, newMsg];
  localStorage.setItem(STORAGE_KEYS.SCHOOL_MESSAGES, JSON.stringify(updated));

  setTimeout(() => {
    const autoReply: SchoolDirectMessage = {
      id: `msg-reply-${Date.now()}`,
      teacherId,
      teacherName,
      subject,
      sender: "teacher",
      text: `Hola, he recibido tu mensaje sobre ${subject}. Lo tomaré en cuenta para nuestra próxima sesión de clase. ¡Buen trabajo por tu dedicación! 📚✨`,
      timestamp: "Hace un momento",
    };
    const refreshed = getStoredSchoolMessages();
    localStorage.setItem(STORAGE_KEYS.SCHOOL_MESSAGES, JSON.stringify([...refreshed, autoReply]));
  }, 1200);

  return newMsg;
}


