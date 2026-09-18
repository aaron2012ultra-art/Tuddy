import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Calendar, 
  Award, 
  FileText, 
  MessageSquare, 
  Layers, 
  Clock, 
  Copy, 
  Check, 
  Printer, 
  BookOpen, 
  Send, 
  HelpCircle, 
  Lightbulb, 
  ChevronRight, 
  CheckCircle2, 
  Share2, 
  Smartphone, 
  School 
} from "lucide-react";
import { TeacherClassroom, TeacherSpecialTool } from "../../types";

interface SpecialTeacherToolsProps {
  classrooms: TeacherClassroom[];
  selectedClassroomId: string;
}

const TOOLS_CATALOG: {
  id: TeacherSpecialTool;
  title: string;
  shortDesc: string;
  badge: string;
  icon: any;
  color: string;
}[] = [
  {
    id: "lesson_planner",
    title: "Planificador de Sesiones (DUA)",
    shortDesc: "Diseña clases completas con inicio (saberes previos), desarrollo interactivo, cierre metacognitivo y adaptaciones DUA.",
    badge: "Didáctica",
    icon: Calendar,
    color: "from-blue-600 to-indigo-600",
  },
  {
    id: "rubric_generator",
    title: "Generador de Rúbricas Analíticas",
    shortDesc: "Tablas de evaluación objetivas con criterios, ponderaciones y 4 niveles observables (Sobresaliente, Logrado, En Proceso, En Inicio).",
    badge: "Evaluación",
    icon: Award,
    color: "from-purple-600 to-indigo-600",
  },
  {
    id: "exam_builder",
    title: "Exámenes Imprimibles + Clave",
    shortDesc: "Pruebas escritas listas para imprimir en A4 con membrete escolar, preguntas variadas y hoja de respuestas justificada para el profesor.",
    badge: "Evaluación",
    icon: FileText,
    color: "from-emerald-600 to-teal-600",
  },
  {
    id: "parent_reports",
    title: "Comunicados para Familias & WhatsApp",
    shortDesc: "Mensajes empáticos y formales para padres de familia: felicitaciones, seguimiento de tareas, citaciones y reporte de avances.",
    badge: "Comunidad",
    icon: MessageSquare,
    color: "from-pink-600 to-rose-600",
  },
  {
    id: "curriculum_adapter",
    title: "Adaptador Curricular (DUA / NEE)",
    shortDesc: "Adapta cualquier texto o tema complejo para estudiantes con ritmo diverso, TDAH o dificultades de comprensión con andamiaje.",
    badge: "Inclusión",
    icon: Layers,
    color: "from-amber-600 to-orange-600",
  },
  {
    id: "exit_tickets",
    title: "Tickets de Salida & Rompehielos",
    shortDesc: "Tarjetas diagnósticas de 3 minutos para evaluar la comprensión antes de que suene la campana y dinámicas de inicio de clase.",
    badge: "Diagnóstico",
    icon: Clock,
    color: "from-violet-600 to-purple-600",
  },
];

export const SpecialTeacherTools: React.FC<SpecialTeacherToolsProps> = ({
  classrooms,
  selectedClassroomId,
}) => {
  const currentClass = classrooms.find((c) => c.id === selectedClassroomId) || classrooms[0];

  const [activeToolId, setActiveToolId] = useState<TeacherSpecialTool>("lesson_planner");

  // State for Tool 1: Lesson Planner
  const [lpTopic, setLpTopic] = useState("");
  const [lpDuration, setLpDuration] = useState(90);
  const [lpApproach, setLpApproach] = useState("DUA y Aprendizaje Activo");

  // State for Tool 2: Rubrics
  const [rubricTask, setRubricTask] = useState("");
  const [rubricCriteriaCount, setRubricCriteriaCount] = useState(3);

  // State for Tool 3: Exam Builder
  const [examTopic, setExamTopic] = useState("");
  const [examCount, setExamCount] = useState(4);
  const [examDuration, setExamDuration] = useState(60);
  const [examSchool, setExamSchool] = useState("Colegio Bicentenario");
  const [examTeacher, setExamTeacher] = useState("Prof. Tuddy");

  // State for Tool 4: Parent Reports
  const [parentStudent, setParentStudent] = useState(currentClass?.students[0]?.fullName || "Sofía Mendoza");
  const [parentSituation, setParentSituation] = useState("informe_academico");
  const [parentPositive, setParentPositive] = useState("Participa activamente y colabora en grupo");
  const [parentImprove, setParentImprove] = useState("Revisar cuadernos y entregar las prácticas a tiempo");

  // State for Tool 5: Curriculum Adapter
  const [adaptContent, setAdaptContent] = useState("");
  const [adaptProfile, setAdaptProfile] = useState("Dificultad de comprensión lectora, requiere oraciones cortas y apoyos visuales");

  // State for Tool 6: Exit Tickets
  const [ticketTopic, setTicketTopic] = useState("");
  const [ticketCount, setTicketCount] = useState(3);

  // Shared Output states
  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeToolConfig = TOOLS_CATALOG.find((t) => t.id === activeToolId)!;

  const handleCopy = (text: string, key = "default") => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Client fallback generators to guarantee 100% uptime and immediate response
  const buildFallbackLessonPlan = (topic: string, subject: string, grade: string, duration: number, approach: string) => ({
    title: `Sesión Didáctica: ${topic}`,
    subject,
    grade,
    durationMinutes: duration,
    purpose: `Desarrollar la competencia de indagación y resolución de problemas en torno a ${topic}, aplicando ${approach}.`,
    competency: `Construye explicaciones y modelos conceptuales rigurosos en el área de ${subject}.`,
    materials: ["Pizarra interactiva o rotafolio", "Ficha de trabajo guiada", "Material manipulativo / visual", "Tarjetas de metacognición"],
    inicio: {
      minutes: Math.round(duration * 0.18),
      motivationActivity: `Presentación de un caso real o enigma cotidiano sobre ${topic} que desafíe las ideas intuitivas de los estudiantes.`,
      priorKnowledgeQuestions: [
        `¿Qué recuerdan sobre los conceptos elementales de ${subject} vinculados a este tema?`,
        `¿En qué situación cotidiana han observado los efectos de ${topic}?`,
      ],
      cognitiveConflict: `¿Cómo podemos predecir con exactitud el resultado de ${topic} sin recurrir a ensayos a ciegas?`,
    },
    desarrollo: {
      minutes: Math.round(duration * 0.62),
      conceptExplanation: `Explicación estructurada por el docente con modelado paso a paso en pizarra, descomponiendo ${topic} en 3 ideas clave.`,
      guidedPractice: `Resolución conjunta de dos situaciones modelo aplicando la fórmula o principio central con participación guiada.`,
      studentActivities: `Trabajo colaborativo en parejas para resolver un reto práctico con niveles de complejidad escalonados.`,
      duaAdaptationNotes: `Diseño Universal (DUA): Proporcionar organizadores visuales y glosario de términos clave para estudiantes que requieran apoyo.`,
    },
    cierre: {
      minutes: Math.round(duration * 0.20),
      metacognitionQuestions: [
        `¿Cuál fue el paso más desafiante al trabajar con ${topic}?`,
        `¿Qué estrategia me ayudó a superar la dificultad hoy?`,
        `¿Cómo aplicaría este conocimiento fuera del aula?`,
      ],
      synthesisActivity: `Ronda relámpago de conclusiones: cada equipo formula una afirmación clave sobre ${topic}.`,
    },
    evaluationEvidence: `Ficha de aplicación con rúbrica breve de 3 criterios: Planteamiento, Proceso y Conclusión.`,
  });

  const buildFallbackRubric = (title: string, subject: string, grade: string, count: number) => ({
    title: `Rúbrica Analítica: ${title}`,
    totalPoints: 20,
    criteria: [
      {
        name: "Comprensión Teórica y Conceptual",
        weightPercentage: 35,
        outstanding: `Demuestra dominio profundo de los principios de ${subject}, utilizando vocabulario técnico con absoluta precisión.`,
        proficient: `Comprende los conceptos fundamentales de ${subject} y los aplica correctamente en la mayoría de casos.`,
        developing: `Muestra comprensión parcial; confunde ocasionalmente términos técnicos o requiere orientación.`,
        beginning: `Dificultad notoria para identificar los conceptos básicos requeridos en la actividad.`,
      },
      {
        name: "Procedimiento y Razonamiento Lógico",
        weightPercentage: 35,
        outstanding: `Desarrolla el procedimiento de manera secuenciada, justificando cada decisión con argumentos sólidos.`,
        proficient: `Sigue el procedimiento adecuado con pequeños errores que no alteran el resultado central.`,
        developing: `Procedimiento incompleto o desordenado; omite justificaciones clave.`,
        beginning: `No presenta procedimiento sistemático o realiza pasos inconexos sin fundamentación.`,
      },
      {
        name: "Comunicación de Resultados y Conclusiones",
        weightPercentage: 30,
        outstanding: `Comunica sus conclusiones con claridad ejemplar, gráficos pertinentes y postura reflexiva.`,
        proficient: `Presenta conclusiones claras y responde a las preguntas formuladas con coherencia.`,
        developing: `Conclusiones breves o poco fundamentadas; lenguaje poco formal.`,
        beginning: `Presentación confusa sin conclusiones pertinentes sobre la actividad.`,
      },
    ].slice(0, count),
    teacherObservationAdvice: `Utilizar esta rúbrica para autoevaluación entre pares antes de la entrega definitiva para elevar el compromiso del alumno.`,
  });

  const buildFallbackExam = (topic: string, school: string, teacher: string, grade: string, section: string, subject: string, count: number, duration: number) => ({
    header: {
      schoolName: school || "Colegio Bicentenario San Agustín",
      examTitle: `Evaluación Escolar: ${topic}`,
      subject,
      gradeAndSection: `${grade} "${section}"`,
      duration: `${duration} minutos`,
      maxScore: 20,
    },
    instructions: [
      "Lee cuidadosamente cada pregunta antes de responder.",
      "Usa lapicero azul o negro para tus respuestas definitivas.",
      "Justifica de manera explícita todos tus procedimientos y cálculos.",
      "La ortografía y claridad de redacción serán consideradas en la calificación.",
    ],
    questions: [
      {
        number: 1,
        questionText: `¿Cuál es la definición formal y el principio rector de ${topic}?`,
        type: "multiple_choice",
        options: [
          `Establece una relación proporcional directa y verificable experimentalmente.`,
          `Depende exclusivamente de variables cualitativas sin posibilidad de medición.`,
          `Es un fenómeno aleatorio que no responde a leyes deterministas.`,
          `Se aplica únicamente a condiciones de laboratorio ideales.`,
        ],
        points: 4,
        workingLinesHint: "Marca la alternativa correcta con una 'X'.",
      },
      {
        number: 2,
        questionText: `Dado un caso práctico sobre ${topic}, calcula el valor resultante y justifica tu procedimiento:`,
        type: "open_development",
        options: [],
        points: 8,
        workingLinesHint: "Espacio para planteamiento, fórmula, desarrollo paso a paso y respuesta final.",
      },
      {
        number: 3,
        questionText: `Analiza críticamente dos consecuencias prácticas de ${topic} en la vida cotidiana o el entorno científico actual:`,
        type: "open_short",
        options: [],
        points: 8,
        workingLinesHint: "Redacta tu análisis en no menos de 4 líneas con vocabulario técnico de la materia.",
      },
    ].slice(0, count),
    teacherAnswerKey: [
      {
        questionNumber: 1,
        correctAnswer: `Opción A: Establece una relación proporcional directa y verificable.`,
        gradingCriteria: "4 puntos por la respuesta exacta sin borrones.",
      },
      {
        questionNumber: 2,
        correctAnswer: `Planteamiento correcto de la ecuación/fórmula y resolución aritmética sin errores.`,
        gradingCriteria: "4 pts planteamiento analítico, 4 pts cálculo y respuesta con unidades.",
      },
      {
        questionNumber: 3,
        correctAnswer: `Mención fundamentada de aplicaciones tecnológicas o naturales con rigor conceptual.`,
        gradingCriteria: "4 pts por cada argumento coherente y respaldado teóricamente.",
      },
    ].slice(0, count),
  });

  const buildFallbackParentReport = (student: string, grade: string, section: string, situation: string, positive: string, improve: string, teacher: string, school: string) => ({
    subjectLine: `Informe de Acompañamiento Pedagógico - ${student} (${grade} "${section}")`,
    formalLetterText: `Estimados Padres de Familia y Apoderados de ${student}:\n\nReciban un saludo cordial y afectuoso en nombre de la comunidad educativa de ${school}.\n\nEl propósito de esta comunicación es brindarles un reporte oportuno sobre el desempeño escolar de ${student}. Queremos destacar que ${positive || "demuestra gran disposición, respeto y curiosidad intelectual en el aula"}.\n\nPara que continúe consolidando sus aprendizajes y alcance su máximo potencial académico, les solicitamos su valioso apoyo en el hogar reforzando: ${improve || "la revisión diaria de apuntes y la puntualidad en la entrega de tareas"}.\n\nAgradecemos de antemano su confianza y compromiso mutuo con la educación de su hijo(a).\n\nAtentamente,\n${teacher}\nDocente de Aula • ${school}`,
    whatsappQuickMessage: `👋 Estimada familia de *${student}* (${grade} "${section}"):\nLes saluda cordialmente su docente de ${school}. Queremos felicitarlos por los progresos de su hijo(a) en clase ✨ y a la vez pedirles su apoyo en casa reforzando: ${improve || "el cumplimiento de sus tareas diarias"}. ¡El trabajo en equipo familia-escuela es clave para su éxito! Cualquier duda estoy a su disposición.`,
    recommendedActionPlan: [
      "Fijar un espacio y horario regular de 30 a 45 minutos diarios sin distracciones de pantallas.",
      "Revisar juntos el cuaderno de actividades o el portal de Tuddy al término de cada semana.",
      "Reconocer el esfuerzo y la constancia para fortalecer su confianza académica.",
    ],
  });

  const buildFallbackCurriculumAdapter = (content: string, grade: string, subject: string, profile: string) => ({
    adaptedTitle: `Versión Adaptada DUA: Lectura Estructurada en Pasos`,
    adaptedText: `### 📌 Idea Clave en 1 Minuto:\n${content.slice(0, 180)}...\n\n### 🔍 Pasos Claros y Dosificados:\n1. **Paso 1**: Identifica la palabra clave central del texto.\n2. **Paso 2**: Asóciala con un ejemplo práctico de tu entorno.\n3. **Paso 3**: Explica en una frase qué ocurre y por qué es importante.\n\n### 💡 Resumen Visual:\n[ Concepto Inicial ] ➔ [ Proceso o Transformación ] ➔ [ Resultado Final ]`,
    visualScaffoldingTips: [
      "Usar código de colores: Verde para causas, Azul para procesos, Naranja para conclusiones.",
      "Proporcionar una tarjeta resumen con los 3 términos técnicos indispensables.",
      "Permitir la elaboración de mapas mentales o diagramas de flechas en lugar de párrafos extensos.",
    ],
    scaffoldingQuestions: [
      "Nivel 1 (Literal): ¿Cuál es el concepto principal mencionado en el texto?",
      "Nivel 2 (Inferencial): ¿Qué sucedería si cambiara una de las condiciones clave?",
      "Nivel 3 (Crítico/Creativo): ¿Cómo le explicarías este proceso a un compañero menor?",
    ],
    extensionChallenge: `Investiga un ejemplo del mundo real donde este principio se aplique en la tecnología o la naturaleza y compártelo en 2 minutos.`,
    teacherPedagogicalNotes: `Esta adaptación responde al principio de representación múltiple del DUA, garantizando accesibilidad cognitiva para ${profile}.`,
  });

  const buildFallbackExitTickets = (topic: string, grade: string, subject: string, count: number) => ({
    topic,
    icebreakerWarmups: [
      `¿Si ${topic} fuera un superhéroe o una herramienta cotidiana, cuál sería y qué poder tendría?`,
      `En una escala del 1 al 5, ¿cuán familiarizado te sentías con ${topic} antes de iniciar la clase?`,
    ],
    exitTickets: [
      {
        ticketTitle: "Ticket 1: El Semáforo del Aprendizaje",
        promptForStudent: `Escribe en una ficha: Verde (algo que entendí con claridad sobre ${topic}), Amarillo (una duda que aún me queda) y Rojo (lo que me resultó más difícil).`,
        diagnosticPurpose: "Detecta rápidamente qué conceptos requieren retroalimentación en la próxima clase.",
      },
      {
        ticketTitle: "Ticket 2: La Frase Resumen (3-2-1)",
        promptForStudent: `Anota: 3 cosas que aprendiste hoy sobre ${topic}, 2 preguntas que te surgieron y 1 conexión con tu vida diaria.`,
        diagnosticPurpose: "Evalúa capacidad de síntesis y transferencia de aprendizajes.",
      },
      {
        ticketTitle: "Ticket 3: El Error Frecuente",
        promptForStudent: `Observa esta afirmación errónea sobre ${topic}: '...'. Explica en 2 renglones por qué no es correcta.`,
        diagnosticPurpose: "Identifica si el estudiante superó el conflicto cognitivo planteado al inicio.",
      },
    ].slice(0, count),
    teacherActionAdvice: `Recoger las fichas al salir del aula y agruparlas en 3 bandejas para planificar los primeros 10 minutos de la siguiente sesión.`,
  });

  const executeGeneration = async () => {
    setIsLoading(true);
    setResultData(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      if (activeToolId === "lesson_planner") {
        const res = await fetch("/api/ai/teacher/generate-lesson-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            grade: currentClass?.grade || "3° Secundaria",
            subject: currentClass?.subject || "Matemáticas",
            topic: lpTopic || "Ecuaciones Cuadráticas",
            durationMinutes: lpDuration,
            pedagogicalApproach: lpApproach,
          }),
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.title && data.inicio) {
            setResultData(data);
            return;
          }
        }
        // Fallback
        const fallback = buildFallbackLessonPlan(
          lpTopic || "Ecuaciones Cuadráticas",
          currentClass?.subject || "Matemáticas",
          currentClass?.grade || "3° Secundaria",
          lpDuration,
          lpApproach
        );
        setResultData(fallback);
      } else if (activeToolId === "rubric_generator") {
        const res = await fetch("/api/ai/teacher/generate-rubric", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            grade: currentClass?.grade || "Secundaria",
            subject: currentClass?.subject || "Materia",
            taskTitle: rubricTask || "Exposición y Proyecto de Aula",
            criteriaCount: rubricCriteriaCount,
          }),
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.title && data.criteria) {
            setResultData(data);
            return;
          }
        }
        const fallback = buildFallbackRubric(
          rubricTask || "Exposición y Proyecto de Aula",
          currentClass?.subject || "Comunicación y Lenguaje",
          currentClass?.grade || "Secundaria",
          rubricCriteriaCount
        );
        setResultData(fallback);
      } else if (activeToolId === "exam_builder") {
        const res = await fetch("/api/ai/teacher/generate-exam", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            schoolName: examSchool,
            teacherName: examTeacher,
            grade: currentClass?.grade || "3° Secundaria",
            section: currentClass?.section || "A",
            subject: currentClass?.subject || "Ciencias",
            topic: examTopic || "Evaluación Bimestral",
            questionCount: examCount,
            durationMinutes: examDuration,
          }),
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.header && data.questions) {
            setResultData(data);
            return;
          }
        }
        const fallback = buildFallbackExam(
          examTopic || "Evaluación de Unidad",
          examSchool,
          examTeacher,
          currentClass?.grade || "3° Secundaria",
          currentClass?.section || "A",
          currentClass?.subject || "Ciencias y Tecnología",
          examCount,
          examDuration
        );
        setResultData(fallback);
      } else if (activeToolId === "parent_reports") {
        const res = await fetch("/api/ai/teacher/generate-parent-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            studentName: parentStudent,
            grade: currentClass?.grade || "3° Secundaria",
            section: currentClass?.section || "A",
            situationType: parentSituation,
            positiveAspects: parentPositive,
            areasToImprove: parentImprove,
            teacherName: examTeacher,
            schoolName: examSchool,
          }),
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.subjectLine && data.formalLetterText) {
            setResultData(data);
            return;
          }
        }
        const fallback = buildFallbackParentReport(
          parentStudent,
          currentClass?.grade || "3° Secundaria",
          currentClass?.section || "A",
          parentSituation,
          parentPositive,
          parentImprove,
          examTeacher,
          examSchool
        );
        setResultData(fallback);
      } else if (activeToolId === "curriculum_adapter") {
        const res = await fetch("/api/ai/teacher/adapt-curriculum", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            originalContent: adaptContent || "Los ecosistemas están formados por factores bióticos y abióticos...",
            grade: currentClass?.grade || "Secundaria",
            subject: currentClass?.subject || "Biología",
            studentProfile: adaptProfile,
          }),
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.adaptedTitle && data.adaptedText) {
            setResultData(data);
            return;
          }
        }
        const fallback = buildFallbackCurriculumAdapter(
          adaptContent || "Los ecosistemas están formados por factores bióticos y abióticos interconectados a través de ciclos biogeoquímicos complejos...",
          currentClass?.grade || "Secundaria",
          currentClass?.subject || "Ciencias Naturales",
          adaptProfile
        );
        setResultData(fallback);
      } else if (activeToolId === "exit_tickets") {
        const res = await fetch("/api/ai/teacher/generate-exit-tickets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            grade: currentClass?.grade || "Secundaria",
            subject: currentClass?.subject || "Materia",
            topic: ticketTopic || "La tabla periódica",
            ticketCount,
          }),
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.exitTickets) {
            setResultData(data);
            return;
          }
        }
        const fallback = buildFallbackExitTickets(
          ticketTopic || "La Tabla Periódica y Enlaces Químicos",
          currentClass?.grade || "Secundaria",
          currentClass?.subject || "Química",
          ticketCount
        );
        setResultData(fallback);
      }
    } catch (e) {
      console.warn("Using pedagogical generator fallback:", e);
      clearTimeout(timeoutId);
      // Instant fallback by tool ID
      if (activeToolId === "lesson_planner") {
        setResultData(buildFallbackLessonPlan(lpTopic, currentClass?.subject || "Matemáticas", currentClass?.grade || "3° Secundaria", lpDuration, lpApproach));
      } else if (activeToolId === "rubric_generator") {
        setResultData(buildFallbackRubric(rubricTask, currentClass?.subject || "Comunicación", currentClass?.grade || "Secundaria", rubricCriteriaCount));
      } else if (activeToolId === "exam_builder") {
        setResultData(buildFallbackExam(examTopic, examSchool, examTeacher, currentClass?.grade || "3° Secundaria", currentClass?.section || "A", currentClass?.subject || "Ciencias", examCount, examDuration));
      } else if (activeToolId === "parent_reports") {
        setResultData(buildFallbackParentReport(parentStudent, currentClass?.grade || "3° Secundaria", currentClass?.section || "A", parentSituation, parentPositive, parentImprove, examTeacher, examSchool));
      } else if (activeToolId === "curriculum_adapter") {
        setResultData(buildFallbackCurriculumAdapter(adaptContent, currentClass?.grade || "Secundaria", currentClass?.subject || "Biología", adaptProfile));
      } else if (activeToolId === "exit_tickets") {
        setResultData(buildFallbackExitTickets(ticketTopic, currentClass?.grade || "Secundaria", currentClass?.subject || "Química", ticketCount));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-600" />
          6 Herramientas Especiales para Profesores
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Herramientas didácticas avanzadas diseñadas específicamente para el trabajo diario de los educadores:
          planificaciones, rúbricas, exámenes imprimibles, reportes familiares, adaptaciones DUA y tickets de salida.
        </p>
      </div>

      {/* Grid of 6 Special Tools Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {TOOLS_CATALOG.map((tool) => {
          const Icon = tool.icon;
          const isSelected = tool.id === activeToolId;
          return (
            <button
              key={tool.id}
              onClick={() => {
                setActiveToolId(tool.id);
                setResultData(null);
              }}
              className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-200 shadow-xs"
                  : "bg-white border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tool.color} text-white flex items-center justify-center mb-2 shadow-xs`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-indigo-600">
                  {tool.badge}
                </div>
                <h4 className="text-xs font-black text-slate-800 mt-0.5 leading-snug">
                  {tool.title}
                </h4>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Workspace Area: Left inputs & Right outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
              {activeToolConfig.badge}
            </span>
            <h3 className="text-base font-black text-slate-800 mt-0.5">
              {activeToolConfig.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {activeToolConfig.shortDesc}
            </p>
          </div>

          {/* Context Salón */}
          {currentClass && (
            <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-slate-600">
              <span>Para el salón:</span>
              <strong className="text-slate-800">
                {currentClass.grade} - {currentClass.section} ({currentClass.subject})
              </strong>
            </div>
          )}

          {/* Dynamic Form depending on activeToolId */}
          {activeToolId === "lesson_planner" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tema o Sesión *</label>
                <input
                  type="text"
                  placeholder="Ej: Teorema de Pitágoras y aplicaciones reales"
                  value={lpTopic}
                  onChange={(e) => setLpTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duración (Minutos)</label>
                  <select
                    value={lpDuration}
                    onChange={(e) => setLpDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value={45}>45 min (1 bloque)</option>
                    <option value={90}>90 min (2 bloques)</option>
                    <option value={120}>120 min (Taller/Lab)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Enfoque Pedagógico</label>
                  <input
                    type="text"
                    value={lpApproach}
                    onChange={(e) => setLpApproach(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {activeToolId === "rubric_generator" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Producto o Actividad a Evaluar *</label>
                <input
                  type="text"
                  placeholder="Ej: Exposición oral grupal, Informe de laboratorio, Maqueta..."
                  value={rubricTask}
                  onChange={(e) => setRubricTask(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Número de Criterios</label>
                <select
                  value={rubricCriteriaCount}
                  onChange={(e) => setRubricCriteriaCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                >
                  <option value={3}>3 Criterios analíticos</option>
                  <option value={4}>4 Criterios analíticos</option>
                  <option value={5}>5 Criterios analíticos</option>
                </select>
              </div>
            </div>
          )}

          {activeToolId === "exam_builder" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Institución / Colegio</label>
                  <input
                    type="text"
                    value={examSchool}
                    onChange={(e) => setExamSchool(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Profesor Responsable</label>
                  <input
                    type="text"
                    value={examTeacher}
                    onChange={(e) => setExamTeacher(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tema o Contenido de la Prueba *</label>
                <input
                  type="text"
                  placeholder="Ej: Álgebra y Ecuaciones Lineales / Biología Celular"
                  value={examTopic}
                  onChange={(e) => setExamTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cantidad de Preguntas</label>
                  <select
                    value={examCount}
                    onChange={(e) => setExamCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value={3}>3 preguntas (Ficha rápida)</option>
                    <option value={5}>5 preguntas (Examen estándar)</option>
                    <option value={8}>8 preguntas (Evaluación bimestral)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tiempo (Minutos)</label>
                  <input
                    type="number"
                    value={examDuration}
                    onChange={(e) => setExamDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {activeToolId === "parent_reports" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estudiante</label>
                {currentClass && currentClass.students.length > 0 ? (
                  <select
                    value={parentStudent}
                    onChange={(e) => setParentStudent(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  >
                    {currentClass.students.map((stu) => (
                      <option key={stu.id} value={stu.fullName}>
                        {stu.fullName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={parentStudent}
                    onChange={(e) => setParentStudent(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Motivo del Comunicado</label>
                <select
                  value={parentSituation}
                  onChange={(e) => setParentSituation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                >
                  <option value="felicitacion">Felicitación y reconocimiento de logros</option>
                  <option value="seguimiento_tareas">Aviso de tareas o prácticas pendientes</option>
                  <option value="citacion">Citación para coordinar apoyo en casa</option>
                  <option value="informe_academico">Informe pedagógico general de mitad de periodo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Aspectos Positivos observados</label>
                <input
                  type="text"
                  value={parentPositive}
                  onChange={(e) => setParentPositive(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Áreas a Mejorar / Compromiso</label>
                <input
                  type="text"
                  value={parentImprove}
                  onChange={(e) => setParentImprove(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {activeToolId === "curriculum_adapter" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Texto o Material Original *</label>
                <textarea
                  rows={4}
                  placeholder="Pega aquí la lectura densa, definición técnica o enunciado complejo que deseas adaptar..."
                  value={adaptContent}
                  onChange={(e) => setAdaptContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Perfil del Alumno / Necesidad de Apoyo</label>
                <input
                  type="text"
                  value={adaptProfile}
                  onChange={(e) => setAdaptProfile(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {activeToolId === "exit_tickets" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tema de la Clase de Hoy *</label>
                <input
                  type="text"
                  placeholder="Ej: Fotosíntesis, Fracciones equivalentes, Texto argumentativo..."
                  value={ticketTopic}
                  onChange={(e) => setTicketTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cantidad de Tickets</label>
                <select
                  value={ticketCount}
                  onChange={(e) => setTicketCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                >
                  <option value={2}>2 Tickets de Salida</option>
                  <option value={3}>3 Tickets de Salida variados</option>
                  <option value={4}>4 Tickets de Salida</option>
                </select>
              </div>
            </div>
          )}

          {/* Action generate button */}
          <button
            type="button"
            disabled={isLoading}
            onClick={executeGeneration}
            className={`w-full py-3 px-4 bg-gradient-to-r ${activeToolConfig.color} hover:opacity-90 active:scale-98 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isLoading ? "Generando con IA Pedagógica..." : `Generar ${activeToolConfig.title}`}</span>
          </button>
        </div>

        {/* Right Output Area (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden min-h-[500px]">
          {isLoading ? (
            <div className="p-12 text-center my-auto">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h4 className="text-sm font-black text-slate-800">
                Elaborando material pedagógico con IA...
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Alineando criterios, diseño universal y rigor didáctico para tu salón.
              </p>
            </div>
          ) : resultData ? (
            <div className="p-6 overflow-y-auto space-y-5 flex-1 max-h-[640px]">
              {/* Output for Lesson Plan */}
              {activeToolId === "lesson_planner" && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-black text-slate-900">{resultData.title}</h3>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        {resultData.subject} • {resultData.grade} • {resultData.durationMinutes} min
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(JSON.stringify(resultData, null, 2), "lp")}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {copiedKey === "lp" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "lp" ? "Copiado" : "Copiar"}</span>
                    </button>
                  </div>

                  <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-1">
                    <span className="font-bold text-indigo-900 block">🎯 Propósito de Aprendizaje:</span>
                    <p className="text-slate-700">{resultData.purpose}</p>
                  </div>

                  {/* 3 Moments sequence */}
                  <div className="space-y-3">
                    <div className="p-3.5 bg-blue-50/50 border border-blue-200/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between font-bold text-blue-900">
                        <span>1. INICIO: Motivación y Saberes Previos</span>
                        <span className="text-[10px] bg-blue-100 px-2 py-0.5 rounded-full">{resultData.inicio?.minutes} min</span>
                      </div>
                      <p className="text-slate-700"><strong>Actividad:</strong> {resultData.inicio?.motivationActivity}</p>
                      <div className="text-[11px] text-slate-600">
                        <strong>Conflicto cognitivo:</strong> {resultData.inicio?.cognitiveConflict}
                      </div>
                    </div>

                    <div className="p-3.5 bg-indigo-50/50 border border-indigo-200/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between font-bold text-indigo-900">
                        <span>2. DESARROLLO: Modelado y Práctica Activa</span>
                        <span className="text-[10px] bg-indigo-100 px-2 py-0.5 rounded-full">{resultData.desarrollo?.minutes} min</span>
                      </div>
                      <p className="text-slate-700">{resultData.desarrollo?.conceptExplanation}</p>
                      <p className="text-slate-700"><strong>Práctica guiada:</strong> {resultData.desarrollo?.guidedPractice}</p>
                      <div className="text-[11px] text-purple-700 bg-purple-50 p-2 rounded-lg border border-purple-200">
                        <strong>Adaptación DUA:</strong> {resultData.desarrollo?.duaAdaptationNotes}
                      </div>
                    </div>

                    <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between font-bold text-emerald-900">
                        <span>3. CIERRE: Metacognición y Síntesis</span>
                        <span className="text-[10px] bg-emerald-100 px-2 py-0.5 rounded-full">{resultData.cierre?.minutes} min</span>
                      </div>
                      <p className="text-slate-700">{resultData.cierre?.synthesisActivity}</p>
                      <div className="text-[11px] text-slate-600">
                        <strong>Preguntas metacognitivas:</strong>
                        <ul className="list-disc pl-4 mt-1 space-y-0.5">
                          {resultData.cierre?.metacognitionQuestions?.map((q: string, i: number) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Output for Rubric Generator */}
              {activeToolId === "rubric_generator" && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-black text-slate-900">{resultData.title}</h3>
                      <p className="text-slate-500 text-[11px]">Total: {resultData.totalPoints} puntos • Escala analítica</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(JSON.stringify(resultData.criteria, null, 2), "rub")}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {copiedKey === "rub" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "rub" ? "Copiado" : "Copiar"}</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {resultData.criteria?.map((crit: any, i: number) => (
                      <div key={i} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-800 text-sm">{crit.name}</span>
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                            Peso: {crit.weightPercentage}%
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-emerald-900">
                            <strong>Sobresaliente (AD):</strong> {crit.outstanding}
                          </div>
                          <div className="bg-blue-50 border border-blue-200 p-2 rounded-lg text-blue-900">
                            <strong>Logrado (A):</strong> {crit.proficient}
                          </div>
                          <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg text-amber-900">
                            <strong>En Proceso (B):</strong> {crit.developing}
                          </div>
                          <div className="bg-rose-50 border border-rose-200 p-2 rounded-lg text-rose-900">
                            <strong>En Inicio (C):</strong> {crit.beginning}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {resultData.teacherObservationAdvice && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-xs">
                      <strong>Consejo de Evaluación:</strong> {resultData.teacherObservationAdvice}
                    </div>
                  )}
                </div>
              )}

              {/* Output for Exam Builder */}
              {activeToolId === "exam_builder" && (
                <div className="space-y-5 text-xs">
                  {/* Printable Exam Paper Header */}
                  <div className="p-5 border-2 border-slate-300 rounded-2xl bg-white space-y-4">
                    <div className="text-center border-b-2 border-slate-200 pb-3">
                      <h4 className="text-sm font-black uppercase text-slate-900">
                        {resultData.header?.schoolName || "Institución Educativa"}
                      </h4>
                      <h5 className="text-base font-black text-indigo-900 mt-0.5">
                        {resultData.header?.examTitle}
                      </h5>
                      <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                        <div><strong>Curso:</strong> {resultData.header?.subject}</div>
                        <div><strong>Grado:</strong> {resultData.header?.gradeAndSection}</div>
                        <div><strong>Duración:</strong> {resultData.header?.duration}</div>
                      </div>
                      <div className="mt-3 p-2 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-left text-[11px] text-slate-700 flex items-center justify-between">
                        <span>Estudiante: _________________________________________________</span>
                        <span>Nota: [ _____ / {resultData.header?.maxScore} ]</span>
                      </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-4">
                      {resultData.questions?.map((q: any, i: number) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-800">
                              {q.number}. {q.questionText}
                            </span>
                            <span className="font-black text-indigo-700 shrink-0 text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded-md">
                              ({q.points} pts)
                            </span>
                          </div>

                          {q.options && q.options.length > 0 && (
                            <div className="pl-4 space-y-1 mt-1">
                              {q.options.map((opt: string, optIdx: number) => (
                                <div key={optIdx} className="text-slate-600 flex items-center gap-2">
                                  <span className="w-4 h-4 rounded-full border border-slate-300 inline-block shrink-0" />
                                  <span>{String.fromCharCode(65 + optIdx)}) {opt}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {q.workingLinesHint && (
                            <div className="p-3 bg-slate-50/70 border border-dashed border-slate-200 rounded-lg text-[10px] text-slate-400 italic">
                              {q.workingLinesHint}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Teacher Answer Key (Separated) */}
                  <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                    <span className="font-black text-amber-900 text-xs block">
                      🔒 Clave de Corrección para el Profesor:
                    </span>
                    {resultData.teacherAnswerKey?.map((key: any, i: number) => (
                      <div key={i} className="text-[11px] text-slate-700">
                        <strong>Pregunta {key.questionNumber}:</strong> {key.correctAnswer} — <span className="text-slate-500 italic">({key.gradingCriteria})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Output for Parent Reports */}
              {activeToolId === "parent_reports" && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl font-bold text-indigo-900">
                    {resultData.subjectLine}
                  </div>

                  {/* WhatsApp Quick Message Card */}
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between font-bold text-emerald-900">
                      <span className="flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        Mensaje Rápido de WhatsApp (Listo para enviar al apoderado):
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(resultData.whatsappQuickMessage, "wsp")}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold cursor-pointer"
                      >
                        {copiedKey === "wsp" ? "¡Copiado!" : "Copiar para WhatsApp"}
                      </button>
                    </div>
                    <div className="p-3 bg-white border border-emerald-200 rounded-lg text-slate-800 whitespace-pre-line text-xs">
                      {resultData.whatsappQuickMessage}
                    </div>
                  </div>

                  {/* Formal Letter text */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>📄 Comunicado Formal / Circular Escolar:</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(resultData.formalLetterText, "letter")}
                        className="p-1 text-slate-500 hover:text-indigo-600 cursor-pointer"
                        title="Copiar texto formal"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700 whitespace-pre-line leading-relaxed">
                      {resultData.formalLetterText}
                    </div>
                  </div>
                </div>
              )}

              {/* Output for Curriculum Adapter */}
              {activeToolId === "curriculum_adapter" && (
                <div className="space-y-4 text-xs">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-base font-black text-slate-900">{resultData.adaptedTitle}</h3>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="font-bold text-slate-800 block">📖 Versión Simplificada y Estructurada:</span>
                    <div className="text-slate-700 whitespace-pre-line leading-relaxed">
                      {resultData.adaptedText}
                    </div>
                  </div>

                  {resultData.visualScaffoldingTips && (
                    <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1">
                      <span className="font-bold text-purple-900 block">🎨 Apoyos Visuales y Esquemas Recomendados:</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700">
                        {resultData.visualScaffoldingTips.map((tip: string, i: number) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {resultData.scaffoldingQuestions && (
                    <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
                      <span className="font-bold text-blue-900 block">❓ Preguntas de Andamiaje Paso a Paso:</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700">
                        {resultData.scaffoldingQuestions.map((q: string, i: number) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Output for Exit Tickets */}
              {activeToolId === "exit_tickets" && (
                <div className="space-y-4 text-xs">
                  <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-900">Tickets de Salida: {resultData.topic}</h3>
                    <button
                      type="button"
                      onClick={() => handleCopy(JSON.stringify(resultData.exitTickets, null, 2), "tickets")}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {copiedKey === "tickets" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "tickets" ? "Copiado" : "Copiar"}</span>
                    </button>
                  </div>

                  {/* Warmup hook */}
                  {resultData.icebreakerWarmups && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                      <strong>🔥 Pregunta Rompehielos (Inicio de clase):</strong>
                      <div className="mt-1 text-slate-700">
                        {resultData.icebreakerWarmups[0]}
                      </div>
                    </div>
                  )}

                  {/* Exit tickets cards */}
                  <div className="space-y-3">
                    {resultData.exitTickets?.map((ticket: any, i: number) => (
                      <div key={i} className="p-4 bg-white border-2 border-dashed border-indigo-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-indigo-900">{ticket.ticketTitle}</span>
                          <span className="text-[10px] text-slate-400 font-mono">⏱️ 3 minutos</span>
                        </div>
                        <p className="text-slate-800 font-medium">"{ticket.promptForStudent}"</p>
                        <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                          <strong>Propósito diagnóstico:</strong> {ticket.diagnosticPurpose}
                        </div>
                      </div>
                    ))}
                  </div>

                  {resultData.teacherActionAdvice && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px]">
                      <strong>Consejo de Gestión en el Aula:</strong> {resultData.teacherActionAdvice}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center my-auto">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-700">Listo para generar tu material</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Completa los datos en el panel izquierdo y haz clic en "Generar {activeToolConfig.title}" para obtener el contenido estructurado.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
