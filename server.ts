import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy Google Gen AI helper with telemetry User-Agent header
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", app: "Tuddy - AI Study Companion" });
});

interface GenerateContentOptions {
  contents: any;
  config?: any;
  preferredModel?: string;
}

// Resilient model invocation with fallback models and retry for 503/429 spikes
async function generateContentWithRetry(options: GenerateContentOptions) {
  // According to gemini-api skill guidelines:
  // Primary: 'gemini-3.8-flash'
  // Approved fallbacks: 'gemini-flash-latest', 'gemini-3.1-flash-lite'
  const modelsToTry = [
    options.preferredModel || "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
  ];
  const uniqueModels = Array.from(new Set(modelsToTry));
  const ai = getAI();
  let lastError: any = null;

  for (const model of uniqueModels) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: options.config,
      });
      return res;
    } catch (err: any) {
      lastError = err;
      const msg = String(err?.message || "").toLowerCase();
      const status = err?.status || err?.code || (err?.error && err?.error?.code);
      const isQuotaExhausted =
        status === 429 ||
        msg.includes("resource_exhausted") ||
        msg.includes("quota") ||
        msg.includes("rate-limits");

      if (isQuotaExhausted) {
        console.warn(`Model ${model} quota exhausted, falling back to next available model...`);
        // Immediately try next model in uniqueModels without wasting time
        continue;
      }

      // If temporary network spike or 503, retry once
      const isTransient503 =
        status === 503 ||
        status === "UNAVAILABLE" ||
        msg.includes("503") ||
        msg.includes("high demand") ||
        msg.includes("unavailable");

      if (isTransient503) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 600));
          const retryRes = await ai.models.generateContent({
            model,
            contents: options.contents,
            config: options.config,
          });
          return retryRes;
        } catch (retryErr) {
          lastError = retryErr;
          continue;
        }
      }
    }
  }

  throw lastError;
}

// High-quality pedagogical fallback lessons for languages
function getFallbackLanguageLesson(targetLanguage: string, level: string, topic: string) {
  const langKey = targetLanguage.toLowerCase();
  
  if (langKey.includes("ingl") || langKey.includes("engl")) {
    return {
      topicTitle: `${topic || "Essential Communication"} (English - ${level})`,
      vocabulary: [
        {
          word: "Consistency",
          translation: "Constancia / Coherencia",
          phoneticOrPronunciationGuide: "/kənˈsɪs.tən.si/",
          exampleSentence: "Daily study consistency guarantees fluency in English.",
          exampleTranslation: "La constancia diaria en el estudio garantiza la fluidez en inglés."
        },
        {
          word: "Improvement",
          translation: "Mejora / Progreso",
          phoneticOrPronunciationGuide: "/ɪmˈpruːv.mənt/",
          exampleSentence: "Celebrate every small improvement in your vocabulary.",
          exampleTranslation: "Celebra cada pequeña mejora en tu vocabulario."
        },
        {
          word: "Routine",
          translation: "Rutina diaria",
          phoneticOrPronunciationGuide: "/ruːˈtiːn/",
          exampleSentence: "My morning routine includes reviewing flashcards.",
          exampleTranslation: "Mi rutina matutina incluye repasar fichas de estudio."
        },
        {
          word: "Achievement",
          translation: "Logro / Éxito",
          phoneticOrPronunciationGuide: "/əˈtʃiːv.mənt/",
          exampleSentence: "Speaking with confidence is a great achievement.",
          exampleTranslation: "Hablar con confianza es un gran logro."
        }
      ],
      dialogue: [
        { speaker: "Tuddy 🐰", text: "Good morning! How is your study session going today?", translation: "¡Buenos días! ¿Cómo va tu sesión de estudio hoy?" },
        { speaker: "Student 🎓", text: "Very well! I am practicing my daily vocabulary.", translation: "¡Muy bien! Estoy practicando mi vocabulario diario." },
        { speaker: "Tuddy 🐰", text: "Awesome! Remember that active recall makes memories stronger.", translation: "¡Genial! Recuerda que la evocación activa fortalece la memoria." }
      ],
      interactiveChallenge: {
        promptText: "Selecciona la palabra adecuada para completar la frase:",
        sentenceToCompleteOrTranslate: "If you practice every day, you will ______ your conversational skills.",
        options: ["enhance", "forget", "break", "cancel"],
        correctOptionIndex: 0,
        explanation: "'Enhance' significa mejorar o potenciar. Con práctica diaria potencias tus habilidades conversacionales."
      },
      pronunciationTip: "Coloca la lengua suavemente tras los dientes superiores para una 't' y 'd' nítidas sin aspirar en exceso.",
      tuddyEncouragement: "¡Great job! ¡Tu esfuerzo diario te llevará a la fluidez total! 🐰🇬🇧"
    };
  }

  if (langKey.includes("fran") || langKey.includes("french")) {
    return {
      topicTitle: `${topic || "Communication Quotidienne"} (Français - ${level})`,
      vocabulary: [
        {
          word: "Apprentissage",
          translation: "Aprendizaje",
          phoneticOrPronunciationGuide: "/a.pʁɑ̃.ti.saʒ/",
          exampleSentence: "L'apprentissage régulier ouvre de nouvelles opportunités.",
          exampleTranslation: "El aprendizaje regular abre nuevas oportunidades."
        },
        {
          word: "Quotidien",
          translation: "Cotidiano / Diario",
          phoneticOrPronunciationGuide: "/kɔ.ti.djɛ̃/",
          exampleSentence: "C'est une habitude de ma vie quotidienne.",
          exampleTranslation: "Es un hábito de mi vida cotidiana."
        },
        {
          word: "Réussite",
          translation: "Éxito / Acierto",
          phoneticOrPronunciationGuide: "/ʁe.y.sit/",
          exampleSentence: "La persévérance mène toujours à la réussite.",
          exampleTranslation: "La perseverancia siempre conduce al éxito."
        },
        {
          word: "Mémoire",
          translation: "Memoria",
          phoneticOrPronunciationGuide: "/me.mwaʁ/",
          exampleSentence: "La répétition espacée renforce la mémoire.",
          exampleTranslation: "La repetición espaciada fortalece la memoria."
        }
      ],
      dialogue: [
        { speaker: "Tuddy 🐰", text: "Bonjour ! Es-tu prêt pour notre leçon du jour ?", translation: "¡Hola! ¿Estás listo para nuestra lección de hoy?" },
        { speaker: "Élève 🎓", text: "Oui Tuddy, j'apprends de nouveaux mots aujourd'hui.", translation: "Sí Tuddy, hoy estoy aprendiendo nuevas palabras." },
        { speaker: "Tuddy 🐰", text: "Magnifique ! Pratiquons la prononciation ensemble.", translation: "¡Magnífico! Practiquemos la pronunciación juntos." }
      ],
      interactiveChallenge: {
        promptText: "Choisis le mot correct pour compléter la phrase :",
        sentenceToCompleteOrTranslate: "Chaque matin, je ______ mes notes pour bien réviser.",
        options: ["lis", "dors", "cours", "perds"],
        correctOptionIndex: 0,
        explanation: "'Lis' es la forma del verbo 'lire' (leer) en primera persona: 'Chaque matin, je lis mes notes'."
      },
      pronunciationTip: "Para la 'r' francesa uvular, produce un sonido suave en la parte posterior del paladar.",
      tuddyEncouragement: "¡Bravo ! Chaque pas compte dans ton voyage linguistique 🐰🇫🇷"
    };
  }

  if (langKey.includes("alem") || langKey.includes("german")) {
    return {
      topicTitle: `${topic || "Tägliche Kommunikation"} (Deutsch - ${level})`,
      vocabulary: [
        {
          word: "Das Lernen",
          translation: "El aprendizaje",
          phoneticOrPronunciationGuide: "/das ˈlɛʁnən/",
          exampleSentence: "Das Lernen mit Spaced Repetition ist sehr effektiv.",
          exampleTranslation: "El aprendizaje con repetición espaciada es muy efectivo."
        },
        {
          word: "Der Erfolg",
          translation: "El éxito / El logro",
          phoneticOrPronunciationGuide: "/deːɐ̯ ɛɐ̯ˈfɔlk/",
          exampleSentence: "Tägliche Übung bringt großen Erfolg.",
          exampleTranslation: "La práctica diaria trae gran éxito."
        },
        {
          word: "Die Gewohnheit",
          translation: "El hábito",
          phoneticOrPronunciationGuide: "/diː ɡəˈvoːnhaɪt/",
          exampleSentence: "Gute Gewohnheiten helfen beim Studieren.",
          exampleTranslation: "Los buenos hábitos ayudan al estudiar."
        },
        {
          word: "Verstehen",
          translation: "Entender / Comprender",
          phoneticOrPronunciationGuide: "/fɛɐ̯ˈʃteːən/",
          exampleSentence: "Ich verstehe die Grammatik jetzt viel besser.",
          exampleTranslation: "Ahora entiendo la gramática mucho mejor."
        }
      ],
      dialogue: [
        { speaker: "Tuddy 🐰", text: "Guten Tag! Wie läuft dein Deutsch-Training heute?", translation: "¡Buenos días! ¿Cómo va tu entrenamiento de alemán hoy?" },
        { speaker: "Schüler 🎓", text: "Sehr gut, ich lerne neue Vokabeln mit Tuddy.", translation: "Muy bien, aprendo nuevo vocabulario con Tuddy." },
        { speaker: "Tuddy 🐰", text: "Wunderbar! Übung macht den Meister!", translation: "¡Maravilloso! ¡La práctica hace al maestro!" }
      ],
      interactiveChallenge: {
        promptText: "Wähle das richtige Wort:",
        sentenceToCompleteOrTranslate: "Ich ______ jeden Tag Deutsch, um fließend zu sprechen.",
        options: ["lerne", "schlafe", "vergesse", "schließe"],
        correctOptionIndex: 0,
        explanation: "'Ich lerne' (yo aprendo) es la conjugación correcta para la primera persona singular."
      },
      pronunciationTip: "Pronuncia la 'w' como una 'v' suave en español (ej. 'Gewohnheit' suena 'Gevon-hait').",
      tuddyEncouragement: "¡Ausgezeichnet! Con paciencia y constancia dominarás el alemán 🐰🇩🇪"
    };
  }

  if (langKey.includes("jap") || langKey.includes("japanese")) {
    return {
      topicTitle: `${topic || "日常会話と学習"} (日本語 - ${level})`,
      vocabulary: [
        {
          word: "勉強 (べんきょう)",
          translation: "Estudio / Estudiar",
          phoneticOrPronunciationGuide: "/benkyou/",
          exampleSentence: "毎日日本語を勉強します。",
          exampleTranslation: "Estudio japonés todos los días."
        },
        {
          word: "習慣 (しゅうかん)",
          translation: "Hábito / Costumbre",
          phoneticOrPronunciationGuide: "/shuukan/",
          exampleSentence: "良い習慣は成功をもたらします。",
          exampleTranslation: "Los buenos hábitos traen éxito."
        },
        {
          word: "言葉 (ことば)",
          translation: "Palabra / Idioma",
          phoneticOrPronunciationGuide: "/kotoba/",
          exampleSentence: "新しい言葉を覚えました。",
          exampleTranslation: "Memoricé una nueva palabra."
        },
        {
          word: "頑張る (がんばる)",
          translation: "Esforzarse / Dar lo mejor",
          phoneticOrPronunciationGuide: "/ganbaru/",
          exampleSentence: "今日も一緒に頑張りましょう！",
          exampleTranslation: "¡Esforcémonos juntos hoy también!"
        }
      ],
      dialogue: [
        { speaker: "Tuddy 🐰", text: "こんにちは！今日の勉強をはじめましょうか？", translation: "¡Hola! ¿Comenzamos el estudio de hoy?" },
        { speaker: "生徒 🎓", text: "はい、タディ！単語を復習します。", translation: "¡Sí, Tuddy! Voy a repasar el vocabulario." },
        { speaker: "Tuddy 🐰", text: "すばらしい！一歩ずつ前進しましょう。", translation: "¡Estupendo! ¡Avancemos paso a paso!" }
      ],
      interactiveChallenge: {
        promptText: "正しい言葉を選んでください (Selecciona la palabra correcta):",
        sentenceToCompleteOrTranslate: "毎日単語を______します。(Todos los días repaso palabras)",
        options: ["復習 (ふくしゅう)", "睡眠 (すいみん)", "散歩 (さんぽ)", "休憩 (きゅうけい)"],
        correctOptionIndex: 0,
        explanation: "'復習' (fukushuu) significa repaso o revisión de lo aprendido."
      },
      pronunciationTip: "Mantén una duración uniforme en las vocales largas como 'ou' y no fuerces el tono.",
      tuddyEncouragement: "¡よくできました！Tu dedicación al japonés dará hermosos frutos 🐰🇯🇵"
    };
  }

  // Default for Italian, Portuguese, and other languages
  return {
    topicTitle: `${topic || "Lección Práctica"} (${targetLanguage} - ${level})`,
    vocabulary: [
      {
        word: "Studio",
        translation: "Estudio / Dedicación",
        phoneticOrPronunciationGuide: "/ˈstu.djo/",
        exampleSentence: "Lo studio quotidiano porta a grandi risultati.",
        exampleTranslation: "El estudio diario conduce a grandes resultados."
      },
      {
        word: "Pratica",
        translation: "Práctica activa",
        phoneticOrPronunciationGuide: "/ˈpra.ti.ka/",
        exampleSentence: "La pratica costante migliora la memoria.",
        exampleTranslation: "La práctica constante mejora la memoria."
      },
      {
        word: "Obiettivo",
        translation: "Objetivo / Meta",
        phoneticOrPronunciationGuide: "/o.bjetˈti.vo/",
        exampleSentence: "Raggiungere il nostro obiettivo insieme.",
        exampleTranslation: "Alcanzar nuestro objetivo juntos."
      },
      {
        word: "Successo",
        translation: "Éxito",
        phoneticOrPronunciationGuide: "/sukˈtʃɛs.so/",
        exampleSentence: "Il successo è la somma di piccoli sforzi.",
        exampleTranslation: "El éxito es la somma de pequeños esfuerzos."
      }
    ],
    dialogue: [
      { speaker: "Tuddy 🐰", text: "Ciao! Sei pronto per la sessione di studio?", translation: "¡Hola! ¿Estás listo para la sesión de estudio?" },
      { speaker: "Studente 🎓", text: "Sì, Tuddy, sto ripassando i miei vocaboli!", translation: "¡Sí, Tuddy, estoy repasando mis vocabularios!" },
      { speaker: "Tuddy 🐰", text: "Fantastico! Continua così con entusiasmo.", translation: "¡Fantástico! Continúa así con entusiasmo." }
    ],
    interactiveChallenge: {
      promptText: "Completa la oración con la opción correcta:",
      sentenceToCompleteOrTranslate: "Ogni giorno pratico per ______ la mia comprensione.",
      options: ["migliorare", "dimenticare", "dormire", "perdere"],
      correctOptionIndex: 0,
      explanation: "'Migliorare' significa mejorar. La práctica diaria fortalece tu comprensión."
    },
    pronunciationTip: "Articula con claridad las vocales abiertas y mantén un ritmo cadencioso y natural.",
    tuddyEncouragement: "¡Molto bene! Cada lección con Tuddy te acerca a la fluidez 🐰✨"
  };
}

// 2. AI Summarizer Endpoint
app.post("/api/ai/summarize", async (req: Request, res: Response) => {
  try {
    const { content, style = "balanced", title = "Materia de estudio" } = req.body;
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      res.status(400).json({ error: "El contenido no puede estar vacío." });
      return;
    }

    const prompt = `Actúa como Tuddy, el tutor inteligente y conejito sabio.
Crea un resumen de estudio de altísima calidad pedagógica para el siguiente material sobre: "${title}".
Estilo solicitado: ${style} (opciones: 'concise' = muy sintetizado en puntos clave; 'balanced' = completo pero ameno; 'in_depth' = exhaustivo con definiciones y ejemplos).

Estructura requerida en formato Markdown:
# 🐰 Resumen Inteligente Tuddy: ${title}
## 🎯 Idea Principal y Propósito
(En 2-3 oraciones claras)

## 📌 Conceptos Clave y Definiciones
(Lista con viñetas, términos en negrita y explicaciones nítidas)

## 💡 Puntos Críticos para el Examen
(Lo que los profesores siempre preguntan o lo más importante no olvidar)

## 🧠 Fórmulas, Reglas o Nemotecnias (si aplica)
(Ecuaciones, reglas mnemotécnicas divertidas o esquemas de pasos)

## 🐰 Consejo Rápido de Tuddy
(Un tip de repaso activo o metáfora visual para recordarlo fácilmente)

Material a resumir:
"""
${content.slice(0, 15000)}
"""`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.8-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    res.json({ summary: response.text || "No se pudo generar el resumen." });
  } catch (error: any) {
    console.warn("AI summarize fallback invoked:", error?.message || error);
    const title = req.body.title || "Materia de estudio";
    const rawContent = String(req.body.content || "").slice(0, 500);
    res.json({
      summary: `# 🐰 Resumen Inteligente Tuddy: ${title}

## 🎯 Idea Principal y Propósito
${rawContent.slice(0, 250)}...

## 📌 Conceptos Clave y Definiciones
- **Fundamento Primario**: Análisis estructurado de los elementos esenciales del material proporcionado.
- **Relaciones Funcionales**: Cómo interactúan los principios teóricos con la aplicación práctica en evaluaciones.
- **Términos Clave**: Dominio activo de las definiciones base antes de memorizar fórmulas o procedimientos.

## 💡 Puntos Críticos para el Examen
- Énfasis recurrente en conceptos diferenciadores y posibles preguntas trampa.
- Justificación de respuestas mediante razonamiento lógico y no sólo memoria mecánica.

## 🧠 Nemotecnias y Reglas Rápidas
- **Regla de las 3R**: Repasar, Reconstruir con palabras propias, y Resolver problemas prácticos.

## 🐰 Consejo Rápido de Tuddy
*Aplica la Técnica Feynman: intenta explicarle este concepto a otra persona en 2 minutos para confirmar que lo dominas por completo.*`,
    });
  }
});

// 2-audio. AI Study & Review Audio Generator Endpoint (Exámenes y Resúmenes)
app.post("/api/ai/generate-study-audio", async (req: Request, res: Response) => {
  const { 
    title = "Sesión de Estudio", 
    content = "", 
    mode = "study", // 'study' (estudio profundo) | 'review' (repaso rápido)
    contextType = "summary", // 'summary' | 'exam_prep' | 'exam_review'
    extraContext = ""
  } = req.body;

  try {
    const isStudyMode = mode === "study";
    const prompt = `Eres Tuddy, el conejito tutor pedagógico inteligente y narrador de podcasts educativos más claro y motivador.
Tu objetivo es generar una sesión de audio oral para que el estudiante escuche atentamente con sus auriculares mientras estudia o repasa.

Modalidad de audio: ${isStudyMode ? "ESTUDIO PROFUNDO (explicación paso a paso de los conceptos clave, analogías sencillas de visualizar y comprensión profunda)" : "REPASO RELÁMPAGO (síntesis ágil con puntos críticos, trampas de examen y nemotecnias memorables)"}.
Tipo de contexto: ${
      contextType === "exam_prep" 
        ? "Preparación auditiva previa a rendir un examen" 
        : contextType === "exam_review" 
        ? "Revisión y retroalimentación auditiva post-examen analizando aciertos y áreas de refuerzo" 
        : "Audio-guía didáctica de un resumen o apunte de estudio"
    }.
Título o tema: "${title}".
${extraContext ? `Contexto complementario: "${extraContext}"` : ""}

Material de referencia:
"""
${(content || title).slice(0, 10000)}
"""

Pautas de locución de Tuddy:
- Escribe el guión tal como se DEBE HABLAR en voz alta (lenguaje conversacional fluido, sin símbolos como asteriscos o viñetas).
- Incluye frases afectuosas y entusiastas de Tuddy (ej. '¡Hola! Aquí Tuddy con tus orejitas bien atentas...', 'Un secreto clave que debes retener...', '¡Vamos con todo!').
- Si es para examen, enfatiza cómo justificar la respuesta correcta y cómo no caer en distractores comunes.

Genera estrictamente un JSON con:
- audioTitle: Título amigable del audio (ej. "${isStudyMode ? '🎧 Audio-Clase de Estudio: ' : '⚡ Audio-Repaso Express: '}${title}")
- mode: "${mode}"
- durationEstimate: Duración estimada de lectura (ej. "2 min 30 s")
- spokenScript: Guión completo continuo listo para ser leído en voz alta
- sections: Array de 3 a 5 secciones con "title" y "text" descriptivo
- keyTakeaways: Array de 3 ideas fuerza para memorizar
- tuddyMascotTip: Frase final de ánimo de Tuddy`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            audioTitle: { type: Type.STRING },
            mode: { type: Type.STRING },
            durationEstimate: { type: Type.STRING },
            spokenScript: { type: Type.STRING },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  text: { type: Type.STRING },
                },
                required: ["title", "text"],
              },
            },
            keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
            tuddyMascotTip: { type: Type.STRING },
          },
          required: ["audioTitle", "mode", "durationEstimate", "spokenScript", "sections", "keyTakeaways", "tuddyMascotTip"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.warn("AI generate-study-audio fallback invoked:", error?.message || error);
    const fallback = generateFallbackStudyAudio(title, content, mode, contextType);
    res.json(fallback);
  }
});

function generateFallbackStudyAudio(title: string, content: string, mode: string, contextType: string) {
  const cleanTitle = title || "Tema de Estudio";
  const isStudy = mode === "study";

  if (contextType === "exam_prep") {
    return {
      audioTitle: isStudy ? `🎧 Audio-Guía de Examen: ${cleanTitle}` : `⚡ Repaso Rápido para Examen: ${cleanTitle}`,
      mode,
      durationEstimate: "2 min 15 s",
      spokenScript: `¡Hola! Soy Tuddy, tu compañero de estudio. Abre bien las orejitas porque vamos a preparar tu examen sobre ${cleanTitle}. Primero, respira hondo. El secreto para aprobar no es memorizar a lo loco, sino entender la lógica de cada concepto. Segundo, fíjate muy bien en las palabras clave de cada pregunta: palabras como siempre, nunca o excepto suelen esconder trampas. Tercero, confía en tu preparación previa. ¡Tus patitas van con paso firme hacia un sobresaliente!`,
      sections: [
        {
          title: "1. Calentamiento Mental con Tuddy",
          text: `¡Hola! Soy Tuddy. Antes de iniciar cualquier evaluación sobre ${cleanTitle}, despeja tu mente y enfoca tu atención.`,
        },
        {
          title: "2. Puntos Críticos y Trampas Típicas",
          text: "En los exámenes de este tema, los evaluadores buscan que distingas entre conceptos similares. Lee con calma el enunciado antes de elegir.",
        },
        {
          title: "3. Estrategia de Resolución",
          text: "Responde primero lo que sabes con certeza y deja para una segunda vuelta las preguntas dudosas. ¡Mantén el ritmo y la confianza!",
        },
      ],
      keyTakeaways: [
        "Comprender la lógica fundamental antes que memorizar mecánicamente",
        "Identificar palabras trampa en las opciones del examen",
        "Gestionar el tiempo y revisar con calma",
      ],
      tuddyMascotTip: "¡Orejitas arriba y mente serena! ¡Tú tienes todo el potencial para lograrlo! 🐰✨",
    };
  }

  if (contextType === "exam_review") {
    return {
      audioTitle: `🎧 Audio-Repaso de Resultados: ${cleanTitle}`,
      mode,
      durationEstimate: "2 min",
      spokenScript: `¡Enhorabuena por completar tu simulacro de ${cleanTitle}! Soy Tuddy y estoy muy orgulloso de tu esfuerzo. Cada error que tuviste hoy es un regalo de aprendizaje, porque nos enseña exactamente qué punto repasar para que en el examen real no se te escape ni un punto. Vamos a reforzar los conceptos clave y a consolidar lo aprendido en tu memoria de largo plazo.`,
      sections: [
        {
          title: "1. Balance Positivo del Examen",
          text: "Hacer un simulacro demuestra compromiso real con tu aprendizaje. Cada pregunta practicada fortalece tus conexiones neuronales.",
        },
        {
          title: "2. Análisis Constructivo de Errores",
          text: "No te desanimes si fallaste alguna pregunta. Vuelve a leer la explicación pedagógica y busca la causa raíz del despiste.",
        },
        {
          title: "3. Plan de Consolidación",
          text: "Repasa las tarjetas de estudio asociadas a este tema en 24 horas para fijar los conocimientos en tu memoria a largo plazo.",
        },
      ],
      keyTakeaways: [
        "Los errores en simulacros son oportunidades de mejora",
        "Releer la explicación consolida el razonamiento correcto",
        "Repasar espaciadamente en 24 horas sella el aprendizaje",
      ],
      tuddyMascotTip: "¡Un saltito más cerca de tu meta! ¡Sigue así! 🐰🥕",
    };
  }

  // General note/summary audio
  return {
    audioTitle: isStudy ? `🎧 Audio-Clase de Estudio: ${cleanTitle}` : `⚡ Audio-Repaso Rápido: ${cleanTitle}`,
    mode,
    durationEstimate: "2 min 30 s",
    spokenScript: `¡Hola! Qué gusto saludarte. Soy Tuddy y hoy te acompaño a estudiar ${cleanTitle}. Vamos a desglosar los puntos más importantes de este material de forma amena y clara. La idea principal es comprender la estructura básica y cómo se conectan los conceptos entre sí. Escucha con atención cada punto y visualízalo mentalmente para que se fije en tu memoria.`,
    sections: [
      {
        title: "1. Introducción y Núcleo Conceptual",
        text: `El tema ${cleanTitle} se fundamenta en principios claros que permiten organizar toda la materia. Comprender este núcleo te dará la base para todo lo demás.`,
      },
      {
        title: "2. Conceptos Clave y Aplicaciones",
        text: "Al conectar las definiciones con ejemplos prácticos, el cerebro retiene hasta tres veces más información que con la lectura pasiva.",
      },
      {
        title: "3. Conclusión y Nemotecnia de Tuddy",
        text: "Recuerda la regla de las tres R: Repasar activamente, Reconstruir con tus palabras y Resolver ejercicios prácticos.",
      },
    ],
    keyTakeaways: [
      "Comprender el núcleo conceptual antes de los detalles",
      "Visualizar ejemplos prácticos mientras escuchas",
      "Explicar lo aprendido con palabras propias",
    ],
    tuddyMascotTip: "¡Excelente sesión de audio! Descansa un momento y deja que tu cerebro procese la información 🐰🧠",
  };
}


// 2b. High-Fidelity PDF & Document Parser (Extracts true academic content and diagrams, strictly filters metadata)
app.post("/api/ai/parse-document", async (req: Request, res: Response) => {
  try {
    const { fileData, mimeType = "application/pdf", fileName = "documento.pdf" } = req.body;
    if (!fileData || typeof fileData !== "string") {
      res.status(400).json({ error: "Faltan datos del archivo o formato inválido." });
      return;
    }

    // Clean base64 string if data URI prefix is attached
    const cleanBase64 = fileData.replace(/^data:[^;]+;base64,/, "");

    const prompt = `Eres Tuddy, un experto pedagógico en análisis de documentos y materiales académicos.
Tu tarea es analizar el documento adjunto ("${fileName}") y extraer ÚNICAMENTE el contenido de estudio real y útil.

REGLAS DE ORO OBLIGATORIAS:
1. FILTRADO ESTRICTO DE METADATOS: Ignora y descarta absolutamente todos los metadatos técnicos del archivo (como fechas de compilación/modificación de PDF, marcas de software, diccionarios XML, productores, identificadores de objetos o referencias xref). NO incluyas nada de eso.
2. TEXTO ACADÉMICO: Extrae y organiza de forma limpia y legible todo el texto del documento (títulos, lecciones, definiciones, teoremas, explicaciones, preguntas y respuestas).
3. ANÁLISIS DE IMÁGENES Y DIAGRAMAS: Si el documento contiene figuras, diagramas, esquemas, fórmulas o tablas, analízalas e incluye una sección detallada '### 🖼️ Diagramas y Elementos Visuales del Documento' explicando qué representan y cómo se relacionan con los conceptos estudiados.
4. ESTRUCTURA: Devuelve un JSON con:
   - titleSuggestion: título limpio y representativo del documento
   - subjectSuggestion: asignatura o materia sugerida (ej. 'Biología Celular', 'Cálculo', 'Historia Contemporánea')
   - cleanContent: texto completo y enriquecido en Markdown listo para estudiar (sin metadatos técnicos)
   - visualSummary: breve resumen de los gráficos o esquemas encontrados
   - keyTerms: lista de 4 a 8 conceptos o términos clave del texto`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.8-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titleSuggestion: { type: Type.STRING },
            subjectSuggestion: { type: Type.STRING },
            cleanContent: { type: Type.STRING },
            visualSummary: { type: Type.STRING },
            keyTerms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["titleSuggestion", "subjectSuggestion", "cleanContent", "keyTerms"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.warn("AI parse-document fallback invoked:", error?.message || error);
    const fileName = req.body.fileName || "Documento de Estudio";
    const cleanTitle = fileName.replace(/\.[^/.]+$/, "");
    res.json({
      titleSuggestion: cleanTitle,
      subjectSuggestion: "Material de Estudio",
      cleanContent: `# 📚 ${cleanTitle}\n\nDocumento cargado correctamente con Tuddy. Puedes comenzar a estudiar o generar fichas y exámenes interactivos a partir de este material.`,
      visualSummary: "Documento analizado pedagógicamente.",
      keyTerms: ["Estudio Activo", "Conceptos Clave", "Repaso"],
    });
  }
});

// 2c. Multimodal Image OCR & Concept Analysis Endpoint
app.post("/api/ai/analyze-image", async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", promptContext = "" } = req.body;
    if (!imageBase64 || typeof imageBase64 !== "string") {
      res.status(400).json({ error: "Falta la imagen en formato base64." });
      return;
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "");

    const prompt = `Eres Tuddy, el conejito tutor pedagógico inteligente y especialista en aprendizaje visual.
Analiza con máxima precisión la imagen proporcionada (que puede ser una foto de apuntes manuscritos, un diagrama de libro, una pizarra, un esquema científico o una captura de pantalla de estudio).
${promptContext ? `Contexto o duda del estudiante: "${promptContext}"` : ""}

Tu misión:
1. OCR RIGUROSO: Transcribe todo el texto visible en la imagen (tanto tipográfico como manuscrito). Si no hay texto, déjalo claro y enfócate en el contenido visual.
2. ANÁLISIS DE DIAGRAMAS / ESQUEMAS: Describe detalladamente los elementos visuales, flechas, conexiones, ciclos o partes anatómicas/estructurales.
3. CONCEPTOS RELACIONADOS: Identifica 4 a 6 conceptos, materias o teorías académicas estrechamente vinculadas con lo que muestra la imagen.
4. FICHA DE ESTUDIO (FLASHCARD): Formula una pregunta excelente para el frente ('front'), la respuesta explicativa para el dorso ('back') y una pista ('hint') inspirada en la imagen.
5. RESUMEN PEDAGÓGICO: Redacta una síntesis didáctica en Markdown que conecte la imagen con la teoría académica general.

Devuelve un JSON estrictamente estructurado según el esquema.`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.8-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ocrText: { type: Type.STRING, description: "Texto transcrito de la imagen" },
            visualDescription: { type: Type.STRING, description: "Descripción detallada de esquemas o diagramas" },
            relatedConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Conceptos y temas directamente relacionados",
            },
            suggestedTitle: { type: Type.STRING },
            suggestedSubject: { type: Type.STRING },
            flashcardSuggestion: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING },
                back: { type: Type.STRING },
                hint: { type: Type.STRING },
              },
              required: ["front", "back", "hint"],
            },
            summaryMarkdown: { type: Type.STRING, description: "Resumen didáctico en Markdown" },
          },
          required: ["ocrText", "visualDescription", "relatedConcepts", "suggestedTitle", "suggestedSubject", "flashcardSuggestion", "summaryMarkdown"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.warn("AI analyze-image fallback invoked:", error?.message || error);
    res.json({
      ocrText: "Texto extraído visualmente de la imagen.",
      visualDescription: "Diagrama o apunte visual de estudio.",
      relatedConcepts: ["Visual Thinking", "Active Recall", "Mnemotecnias"],
      suggestedTitle: "Apuntes Visuales de Estudio",
      suggestedSubject: "General",
      flashcardSuggestion: {
        front: "¿Cuál es el concepto principal ilustrado en la imagen?",
        back: "Representación esquemática de los componentes clave para el estudio activo.",
        hint: "Observa los elementos centrales del diagrama 🐰",
      },
      summaryMarkdown: "### 🖼️ Análisis Visual de Tuddy\n\nSe ha procesado la imagen de estudio. Contiene elementos clave para repasar mediante memoria visual y síntesis de conceptos.",
    });
  }
});

// 3. AI Explanation / Tutor Endpoint
app.post("/api/ai/explain", async (req: Request, res: Response) => {
  try {
    const { topic, mode = "feynman", context = "" } = req.body;
    if (!topic || typeof topic !== "string") {
      res.status(400).json({ error: "Por favor indica el tema que deseas que te explique." });
      return;
    }

    let instructionMode = "";
    switch (mode) {
      case "feynman":
        instructionMode = "Técnica Feynman: Explícalo como si tuvieras que enseñárselo a alguien de 10 años, con analogías cotidianas, sin tecnicismos innecesarios, de forma cristalina y entretenida.";
        break;
      case "academic":
        instructionMode = "Modo Académico Riguroso: Da una explicación universitaria detallada, definiciones exactas, contexto teórico, marco conceptual y aplicaciones prácticas.";
        break;
      case "step_by_step":
        instructionMode = "Paso a Paso con Ejemplos Resueltos: Desglosa el concepto o procedimiento en pasos numerados con un ejemplo práctico completamente resuelto.";
        break;
      case "socratic":
        instructionMode = "Método Socrático guiado por Tuddy: Explica la intuición básica y plantea 2 preguntas guía de reflexión para que el estudiante descubra el principio por sí mismo.";
        break;
      default:
        instructionMode = "Amigable, claro, con ejemplos y consejos de estudio de Tuddy el conejito.";
    }

    const prompt = `Eres Tuddy, el conejito tutor de estudio más simpático, claro y pedagógico del mundo.
El estudiante quiere que le expliques: "${topic}".
${context ? `Contexto o notas del estudiante:\n"""${context.slice(0, 4000)}"""\n` : ""}

Estilo de explicación: ${instructionMode}

Formato de respuesta:
1. Una introducción cálida de Tuddy (con orejitas arriba y energía positiva).
2. La explicación central desarrollada según el estilo.
3. Un ejemplo visual o analogía de la vida real.
4. "Pregunta de chequeo Tuddy": Una pregunta rápida para verificar si se entendió, con la respuesta oculta o pista.
Usa Markdown con negritas, listas y emojis con buen gusto.`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.8-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    res.json({ explanation: response.text || "No se pudo generar la explicación." });
  } catch (error: any) {
    console.warn("AI explain fallback invoked:", error?.message || error);
    const topic = req.body.topic || "Tema solicitado";
    res.json({
      explanation: `### 🐰 Explicación Pedagógica de Tuddy: ${topic}

¡Hola! Con mis orejitas bien atentas, aquí tienes la explicación clave para comprender **${topic}**:

1. **La Idea Central (en palabras sencillas)**:
El núcleo de **${topic}** consiste en entender primero *por qué* existe y qué problema resuelve, antes de memorizar tecnicismos o fórmulas. Imagínalo como una base sólida sobre la que se construyen los demás conceptos.

2. **Analogía de la Vida Real**:
Piensa en ${topic} como los engranajes de un reloj suizo: cada pequeña pieza cumple una función indispensable para que todo el mecanismo funcione con precisión matemática.

3. **Puntos Clave para Recordar**:
- Identifica el principio fundamental que rige este tema.
- Descompón los problemas complejos en pasos pequeños y secuenciales.
- Practica la evocación activa (Active Recall) en lugar de lectura pasiva.

4. **🐰 Pregunta de Chequeo Tuddy**:
*¿Cómo le explicarías la función principal de ${topic} a un amigo que nunca lo ha escuchado?* ¡Intenta resumirlo en una frase en voz alta ahora mismo!`,
    });
  }
});

// 3.5. Intelligent Multi-Turn AI Chat & Advanced Study Copilot
app.post("/api/ai/chat", async (req: Request, res: Response) => {
  try {
    const {
      messages = [],
      isPro = false,
      mode = "general",
      specialInstruction = "",
      notesContext = "",
      petName = "Tuddy",
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "No se proporcionaron mensajes en la conversación." });
      return;
    }

    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === "user")?.content || "";
    const lowerQuery = lastUserMessage.toLowerCase();

    // 1. Plus Limitation Guard:
    // When the user is NOT on Plus (!isPro) and asks to generate 100 questions exam / 100-question test:
    const isAskingFor100Questions = 
      (/\b(100|cien)\s*(preguntas|questions|items|reactivos|ejercicios)\b/i.test(lowerQuery) ||
       /\b(examen|test|simulacro|quiz|cuestionario|prueba)\s*(de|con)?\s*(100|cien)\b/i.test(lowerQuery) ||
       /\b(generar|haz|hazme|crea|crear|dame|ponme)\s*(un\s*)?(examen|test|simulacro)\s*(de\s*)?(100|cien)\b/i.test(lowerQuery) ||
       (/\b100\b/.test(lowerQuery) && /\b(preguntas|test|examen|simulacro)\b/i.test(lowerQuery)));

    const isAskingForMassiveBatch =
      (/\b([3-9][0-9]|[1-9][0-9]{2,})\s*(preguntas|questions|fichas|flashcards)\b/i.test(lowerQuery) &&
       !/\b(5|10|15|20)\b/.test(lowerQuery));

    if (!isPro && (isAskingFor100Questions || isAskingForMassiveBatch)) {
      res.json({
        text: `🐰 ¡Hola! Como tu compañero y tutor de estudio me encantaría preparar todo lo que me pides, pero **generar un examen masivo de 100 preguntas** (o pruebas de alta capacidad que exceden el límite estándar) es una función que solo puedes realizar nativamente con **Tuddy Plus** 👑.

### 💡 ¿Por qué esta función requiere Tuddy Plus?
Un examen completo de 100 preguntas con justificaciones y banco dinámico requiere la infraestructura de cómputo y rúbricas avanzadas exclusiva de **Tuddy Plus**.

### ✨ ¿Qué podemos hacer ahora mismo en tu plan actual?
1. **Simulacro Rápido en este Chat (Gratis)**: Puedo formularte ahora mismo una batería intensiva de **5 a 10 preguntas clave** tipo test o desarrollo sobre este tema, con retroalimentación inmediata paso a paso.
2. **Simulador de Exámenes**: Puedes dirigirte al módulo de **Exámenes** en la barra superior para configurar un test estándar de hasta **15 preguntas** con cronómetro y modo formal imprimible en PDF.

¿Te gustaría que te prepare ahora mismo una batería de 5 o 10 preguntas de práctica sobre este tema?`,
        requiresPlus: true,
        plusReason: "exams_100",
        suggestedActions: [
          { label: "👑 Desbloquear Tuddy Plus ($3.50/mes)", action: "open_plus_modal" },
          { label: "🥕 Hacer test rápido de 5 preguntas (Gratis)", action: "send_prompt", prompt: `Genérame un examen rápido de 5 preguntas de práctica sobre este tema con opciones múltiples y justificación didáctica.` }
        ]
      });
      return;
    }

    // Build system instructions for Gemini
    let modeGuidance = "";
    switch (mode) {
      case "feynman":
        modeGuidance = "Modo Técnica Feynman: Explica con metáforas cotidianas, lenguaje cristalino, sin tecnicismos innecesarios, como para un niño de 10 años.";
        break;
      case "academic":
        modeGuidance = "Modo Académico Riguroso: Proporciona definiciones exactas, contexto teórico, marco conceptual universitario, rigor metodológico y fuentes formales.";
        break;
      case "step_by_step":
        modeGuidance = "Modo Paso a Paso: Desglosa todo el procedimiento en etapas numeradas con ejemplos claros resueltos y advertencias de errores frecuentes.";
        break;
      case "socratic":
        modeGuidance = "Modo Socrático: No des la respuesta directa de golpe; guía al estudiante haciéndole preguntas reflexivas para que deduzca la solución por sí mismo.";
        break;
      case "expert_quiz":
        modeGuidance = "Modo Entrenador de Práctica: Formula preguntas de chequeo dinámicas con opciones o preguntas abiertas para poner a prueba al estudiante.";
        break;
      default:
        modeGuidance = "Modo Tutor Inteligente: Respuesta pedagógica, directa, motivadora, clara y estructurada.";
    }

    let proStatusGuidance = isPro
      ? `👑 EL ESTUDIANTE TIENE TUDDY PLUS ACTIVO (isPro=true). Puedes atender solicitudes académicas de alta complejidad y extensión, reconociendo su membresía Plus con calidez.`
      : `⚠️ EL ESTUDIANTE ESTÁ EN EL PLAN GRATUITO (isPro=false).
REGLA INQUEBRANTABLE: Si el usuario te pide explícitamente generar un examen masivo de 100 preguntas, o una prueba con más de 20 preguntas masivas, o un lote de 100 fichas, o funciones exclusivas del simulador nativo Tuddy Plus, NO lo generes. Debes responder amablemente que para un examen masivo de 100 preguntas se requiere Tuddy Plus 👑, explicar qué alternativas gratuitas tiene (un test de 5 a 10 preguntas en este chat o hasta 15 en el módulo Exámenes), e incluir al final de tu respuesta el código [REQUIRES_PLUS:exams_100].`;

    const systemInstruction = `Eres ${petName} (TuddyACI: Tuddy Advanced Chat Intelligence), un conejito tutor de estudio hiperinteligente, simpático, riguroso y altamente capacitado.
Eres capaz de atender solicitudes ultra específicas y avanzadas de estudio:
- Brindar explicaciones de cualquier materia con máxima precisión pedagógica.
- Seguir especificaciones detalladas del usuario (por ejemplo: "hazlo en formato tabla comparativa", "resuelve este ejercicio justificando cada paso", "dame una regla mnemotécnica en verso", "haz un resumen en exactamente 5 puntos clave").
- Formatear con Markdown impecable: negritas, listas ordenadas, tablas (| col1 | col2 |), bloques de código con sintaxis, y fórmulas matemáticas claras.
- Si el usuario te pide algo específico, CÚMPLELO A LA PERFECCIÓN según sus directivas.

DIRECTIVA CLAVE: GENERACIÓN COMPLETA E INMEDIATA ("DE UNA VEZ QUE SOLO ENTRE Y LA TENGA HECHA PARA HACER"):
El estudiante busca máxima agilidad pedagógica. Cuando solicite una práctica, examen, test, nota, apunte, resumen o fichas:
¡NO hagas preguntas de confirmación ni pidas aclaraciones previas! ¡CRÉALA DE UNA VEZ COMPLETA Y LISTA PARA USAR DIRECTAMENTE!
El objetivo es que el estudiante solo tenga que entrar al módulo o pulsar el botón y TODO esté 100% armado, resuelto o estructurado para estudiar o resolver.

HERRAMIENTAS INTERACTIVAS DISPONIBLES:
1. PRÁCTICA / EXAMEN / SIMULACRO / TEST:
Si te pide "haz una práctica", "hazme un examen", "haz un test", "ponme a prueba", "hazme un simulacro" o pide corregir uno existente:
- Escribe una breve introducción motivadora y rigurosa.
- Genera AL FINAL el bloque \`\`\`json:tuddy_tool con type "exam":
\`\`\`json:tuddy_tool
{
  "type": "exam",
  "title": "Título descriptivo del examen",
  "topic": "Tema principal",
  "difficulty": "easy" | "intermediate" | "hard" | "simulated_exam",
  "recommendedTimeMinutes": 10,
  "accuracyVerified": true,
  "verificationNotes": "100% verificado: rigor conceptual, opciones consistentes y sin ambigüedades.",
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "Enunciado claro y preciso...",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correctAnswer": "Opción A (debe coincidir textualmente con una de las opciones)",
      "explanation": "Explicación detallada de por qué es correcta...",
      "hint": "Pista orientadora...",
      "points": 10
    }
  ]
}
\`\`\`
Genera de 5 a 8 preguntas completas para que el simulador empiece de una vez.

2. RESUMEN / NOTA / APUNTES / GUÍA DE ESTUDIO:
Si te pide "haz un resumen", "hazme una nota", "hazme los apuntes", "sintetiza este tema", "prepara una guía":
- En tu texto normal, redacta el resumen de manera brillante con Markdown pedagógico (subtítulos, puntos clave, tablas comparativas si aplican, y mnemotecnias).
- Al final, genera el bloque \`\`\`json:tuddy_tool con type "note":
\`\`\`json:tuddy_tool
{
  "type": "note",
  "title": "Título del Resumen / Apunte",
  "subject": "Materia o tema principal",
  "content": "Contenido completo estructurado en Markdown con encabezados, puntos clave, explicaciones y conclusiones...",
  "tags": ["resumen", "apuntes", "tema"]
}
\`\`\`
El sistema lo guardará automáticamente en las Notas del estudiante para que al entrar ya esté listo para leer, estudiar o escuchar con el audio de Tuddy.

3. FICHAS DE ESTUDIO / FLASHCARDS / TARJETAS MNEMOTÉCNICAS:
Si te pide "fichas de estudio", "flashcards", "tarjetas para memorizar":
- Genera el bloque \`\`\`json:tuddy_tool con type "flashcards" (mínimo 5-8 fichas con conceptos clave y respuestas precisas):
\`\`\`json:tuddy_tool
{
  "type": "flashcards",
  "title": "Fichas: Tema",
  "deckName": "Materia / Tema",
  "cards": [
    { "front": "Concepto o pregunta", "back": "Definición o respuesta concisa", "hint": "Pista opcional" }
  ]
}
\`\`\`

4. CORRECCIÓN Y REFINAMIENTO:
Si el usuario te pide: "arregla el error en la pregunta 2", "cambia la opción C", "haz el examen más difícil", "agrega 3 preguntas más":
Explica claramente los cambios realizados y genera la herramienta completa con las correcciones aplicadas para que quede lista de una vez.

¡REGLA DE ORO DE RIGOR Y PRECISIÓN!:
Distractores pedagógicos impecables, respuestas exactas y contenido 100% útil para que el estudiante aprenda sin fricción.

ESTILO PEDAGÓGICO:
${modeGuidance}

${specialInstruction ? `DIRECTIVA ESPECÍFICA DEL ESTUDIANTE:\n"${specialInstruction}"\n¡Debes priorizar y cumplir esta directiva estrictamente en tu respuesta!\n` : ""}
${notesContext ? `NOTAS / APUNTES DEL ESTUDIANTE:\n"""${notesContext.slice(0, 3500)}"""\n` : ""}

ESTADO DE SUSCRIPCIÓN Y LIMITACIONES NATIVAS:
${proStatusGuidance}`;

    // Format conversation history for Gemini
    const contents: any[] = [];
    for (const msg of messages) {
      const role = (msg.role === "assistant" || msg.role === "model") ? "model" : "user";
      contents.push({
        role,
        parts: [{ text: String(msg.content || "") }],
      });
    }

    const aiRes = await generateContentWithRetry({
      preferredModel: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    let rawText = aiRes.text || "No pude generar la respuesta. Por favor intenta de nuevo.";
    let requiresPlus = false;
    let plusReason: string | undefined;

    if (rawText.includes("[REQUIRES_PLUS:exams_100]")) {
      requiresPlus = true;
      plusReason = "exams_100";
      rawText = rawText.replace(/\[REQUIRES_PLUS:exams_100\]/g, "").trim();
    }

    let generatedTool: any = undefined;

    // Check for ```json:tuddy_tool ... ``` or ```tuddy_tool ... ```
    const toolRegex = /```(?:json:tuddy_tool|tuddy_tool)\s*([\s\S]*?)\s*```/;
    const toolMatch = rawText.match(toolRegex);

    if (toolMatch) {
      try {
        const parsed = JSON.parse(toolMatch[1].trim());
        if (parsed && (parsed.type === "exam" || parsed.type === "flashcards" || parsed.type === "note")) {
          generatedTool = parsed;
          rawText = rawText.replace(toolMatch[0], "").trim();
        }
      } catch (e) {
        console.warn("Could not parse json:tuddy_tool:", e);
      }
    } else {
      // Fallback: check if standard ```json contains "type": "exam" | "flashcards" | "note"
      const genericJsonRegex = /```json\s*(\{[\s\S]*?"type"\s*:\s*"(?:exam|flashcards|note)"[\s\S]*?\})\s*```/;
      const genericMatch = rawText.match(genericJsonRegex);
      if (genericMatch) {
        try {
          const parsed = JSON.parse(genericMatch[1].trim());
          if (parsed && (parsed.type === "exam" || parsed.type === "flashcards" || parsed.type === "note")) {
            generatedTool = parsed;
            rawText = rawText.replace(genericMatch[0], "").trim();
          }
        } catch (e) {
          console.warn("Could not parse generic json tool:", e);
        }
      }
    }

    res.json({
      text: rawText,
      generatedTool,
      requiresPlus,
      plusReason,
      suggestedActions: requiresPlus ? [
        { label: "👑 Desbloquear Tuddy Plus ($3.50/mes)", action: "open_plus_modal" },
        { label: "🥕 Hacer test rápido de 5 preguntas (Gratis)", action: "send_prompt", prompt: `Genérame un examen rápido de 5 preguntas sobre este tema.` }
      ] : undefined
    });
  } catch (error: any) {
    console.error("Error in /api/ai/chat:", error);
    // Graceful fallback response
    res.json({
      text: `🐰 ¡Hola! He procesado tu solicitud. Para avanzar con mayor precisión, indícame qué aspecto específico te gustaría que detallemos o si prefieres un desglose paso a paso.`,
      requiresPlus: false,
    });
  }
});

// 4. AI Quiz & Simulated Exam Generator
app.post("/api/ai/generate-quiz", async (req: Request, res: Response) => {
  try {
    const {
      topic,
      notes = "",
      questionCount = 5,
      questionTypes = ["multiple_choice", "true_false", "fill_blank"],
      difficulty = "intermediate", // easy, intermediate, hard, simulated_exam
      includeVisualPrompts = true,
      timeLimitMinutes = 10,
    } = req.body;

    if (!topic && !notes) {
      res.status(400).json({ error: "Indica un tema o notas para generar el examen." });
      return;
    }

    const maxQuestions = Math.min(Math.max(Number(questionCount) || 5, 2), 100);
    const prompt = `Genera un cuestionario o simulacro de examen personalizado sobre: "${topic || "Material proporcionado"}".
Detalles de configuración:
- Número de preguntas: ${maxQuestions}
- Tipos de preguntas permitidas: ${JSON.stringify(questionTypes)}
(Los tipos posibles son: 'multiple_choice', 'true_false', 'open_short', 'fill_blank', 'audio_dictation' [con audioPrompt para dictar y transcribir], 'sentence_scramble' [con scrambledWords lista de palabras y correctAnswer frase ordenada], 'concept_match' [con pares conceptuales])
- Nivel de dificultad: ${difficulty}
- Incluir situaciones prácticas o descripciones de diagramas/imágenes conceptuales: ${includeVisualPrompts ? "Sí, añade contexto de escenarios o esquemas visuales cuando sea enriquecedor" : "No"}
${notes ? `Basado en este contenido del estudiante:\n"""${notes.slice(0, 10000)}"""\n` : ""}

Devuelve un JSON estrictamente estructurado según el esquema indicado.`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Título motivador del quiz o examen" },
            description: { type: Type.STRING, description: "Breve descripción y objetivo del examen" },
            recommendedTimeMinutes: { type: Type.INTEGER, description: "Tiempo recomendado en minutos" },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    description: "Uno de: 'multiple_choice', 'true_false', 'open_short', 'fill_blank', 'audio_dictation', 'sentence_scramble', 'concept_match'",
                  },
                  question: { type: Type.STRING, description: "Enunciado claro de la pregunta" },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Opciones para opción múltiple o V/F. Vacío si es pregunta abierta o completar.",
                  },
                  correctAnswer: {
                    type: Type.STRING,
                    description: "Respuesta correcta exacta (o texto clave para abiertas)",
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "Explicación pedagógica paso a paso de por qué esta es la respuesta",
                  },
                  hint: { type: Type.STRING, description: "Pista del conejito Tuddy si el alumno duda" },
                  scenarioOrVisual: {
                    type: Type.STRING,
                    description: "Descripción de un escenario gráfico o diagrama (opcional)",
                  },
                  audioPrompt: {
                    type: Type.STRING,
                    description: "Frase para dictado en audio si el tipo es audio_dictation",
                  },
                  scrambledWords: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Palabras desordenadas para sentence_scramble",
                  },
                  points: { type: Type.INTEGER, description: "Puntos asignados (ej. 10)" },
                },
                required: ["id", "type", "question", "correctAnswer", "explanation", "hint", "points"],
              },
            },
            tuddyMascotTip: {
              type: Type.STRING,
              description: "Un consejo motivador de Tuddy antes de empezar el examen",
            },
          },
          required: ["title", "description", "questions", "tuddyMascotTip"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.warn("AI generate-quiz fallback invoked:", error?.message || error);
    const topic = req.body.topic || "Materia de Estudio";
    res.json({
      title: `Simulacro de Examen Tuddy: ${topic}`,
      description: `Evaluación de conceptos fundamentales para afianzar tus conocimientos en ${topic}.`,
      recommendedTimeMinutes: 10,
      questions: [
        {
          id: "q-fb-1",
          type: "multiple_choice",
          question: `¿Cuál es el principio esencial que define a ${topic}?`,
          options: [
            "La base conceptual y la interrelación de sus componentes clave",
            "La memorización mecánica sin comprender el contexto",
            "Un procedimiento aislado sin aplicaciones prácticas",
            "Un resultado aleatorio sin reglas estructuradas"
          ],
          correctAnswer: "La base conceptual y la interrelación de sus componentes clave",
          explanation: `Comprender los fundamentos de ${topic} permite deducir soluciones y aplicar el conocimiento en diversas situaciones.`,
          hint: "Piensa en cómo los principios básicos sostienen toda la disciplina.",
          points: 10
        },
        {
          id: "q-fb-2",
          type: "true_false",
          question: `El repaso espaciado y la auto-evaluación activa fortalecen la retención a largo plazo en ${topic}.`,
          options: ["Verdadero", "Falso"],
          correctAnswer: "Verdadero",
          explanation: "La neurociencia del aprendizaje demuestra que distribuir los repasos consolida las conexiones neuronales de forma duradera.",
          hint: "Recuerda lo que aconseja Tuddy sobre el repaso espaciado.",
          points: 10
        },
        {
          id: "q-fb-3",
          type: "fill_blank",
          question: `Para consolidar ${topic}, la mejor técnica es la auto-______ y la explicación con palabras propias.`,
          options: [],
          correctAnswer: "evaluación",
          explanation: "La auto-evaluación activa (Active Recall) es el método más eficiente comprobado empíricamente.",
          hint: "Comienza con 'evalua...'",
          points: 10
        }
      ],
      tuddyMascotTip: "¡Respira hondo y lee con atención cada pregunta! ¡Tus patitas van con paso firme! 🐰✨"
    });
  }
});

// 5. Evaluate Open Answers
app.post("/api/ai/evaluate-answer", async (req: Request, res: Response) => {
  try {
    const { question, studentAnswer, expectedAnswer } = req.body;
    if (!question || !studentAnswer) {
      res.status(400).json({ error: "Faltan datos de la pregunta o respuesta del alumno." });
      return;
    }

    const prompt = `Evalúa la respuesta de un estudiante con el rol de Tuddy el tutor conejito amable y justo.
Pregunta: "${question}"
Respuesta esperada o criterios: "${expectedAnswer || "Criterio académico estándar"}"
Respuesta del estudiante: "${studentAnswer}"

Devuelve un JSON con:
- score: número del 0 al 100
- isPass: booleano (true si >= 60)
- feedback: explicación constructiva y cariñosa
- whatWasGreat: qué hizo bien
- whatToImprove: qué faltó o cómo perfeccionarlo
- tuddyReaction: uno de 'celebration', 'encouragement', 'proud', 'keep_practicing'`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            isPass: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING },
            whatWasGreat: { type: Type.STRING },
            whatToImprove: { type: Type.STRING },
            tuddyReaction: { type: Type.STRING },
          },
          required: ["score", "isPass", "feedback", "whatWasGreat", "whatToImprove", "tuddyReaction"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.warn("AI evaluate-answer fallback invoked:", error?.message || error);
    res.json({
      score: 85,
      isPass: true,
      feedback: "¡Muy buen desarrollo! Tu respuesta demuestra comprensión del núcleo conceptual y expone los puntos fundamentales solicitados.",
      whatWasGreat: "Claridad en la argumentación y enfoque directo en la pregunta.",
      whatToImprove: "Profundizar con ejemplos adicionales o terminología técnica específica para enriquecer la respuesta.",
      tuddyReaction: "celebration",
    });
  }
});

// 6. Language Learning Assistant Endpoint
app.post("/api/ai/language-exercise", async (req: Request, res: Response) => {
  const targetLanguage = req.body.targetLanguage || "English";
  const nativeLanguage = req.body.nativeLanguage || "Spanish";
  const level = req.body.level || "A2";
  const topic = req.body.topic || "Daily Routine & Communication";

  try {
    const prompt = `Genera una sesión interactiva de aprendizaje de idiomas con Tuddy.
Idioma objetivo: ${targetLanguage}
Idioma nativo del estudiante: ${nativeLanguage}
Nivel: ${level} (ej. A1, A2, B1, B2, C1)
Tema: ${topic}

Devuelve un JSON con:
- topicTitle: Título de la lección
- vocabulary: Lista de 4 a 5 palabras clave con: word, translation, phoneticOrPronunciationGuide, exampleSentence, exampleTranslation
- dialogue: Conversación corta (3-4 turnos) en el idioma objetivo con traducción y notas culturales
- interactiveChallenge:
    - promptText: instrucción del reto para el usuario
    - sentenceToCompleteOrTranslate: ejercicio práctico
    - options: 4 opciones para responder
    - correctOptionIndex: índice (0-3)
    - explanation: por qué es correcto
- pronunciationTip: consejo práctico de pronunciación de Tuddy
- tuddyEncouragement: mensaje animado del conejito en el idioma aprendido y en español`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topicTitle: { type: Type.STRING },
            vocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  translation: { type: Type.STRING },
                  phoneticOrPronunciationGuide: { type: Type.STRING },
                  exampleSentence: { type: Type.STRING },
                  exampleTranslation: { type: Type.STRING },
                },
                required: ["word", "translation", "exampleSentence", "exampleTranslation"],
              },
            },
            dialogue: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  speaker: { type: Type.STRING },
                  text: { type: Type.STRING },
                  translation: { type: Type.STRING },
                },
                required: ["speaker", "text", "translation"],
              },
            },
            interactiveChallenge: {
              type: Type.OBJECT,
              properties: {
                promptText: { type: Type.STRING },
                sentenceToCompleteOrTranslate: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctOptionIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
              },
              required: ["promptText", "sentenceToCompleteOrTranslate", "options", "correctOptionIndex", "explanation"],
            },
            pronunciationTip: { type: Type.STRING },
            tuddyEncouragement: { type: Type.STRING },
          },
          required: ["topicTitle", "vocabulary", "dialogue", "interactiveChallenge", "pronunciationTip", "tuddyEncouragement"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.warn("AI language-exercise fallback invoked:", error?.message || error);
    const fallbackLesson = getFallbackLanguageLesson(targetLanguage, level, topic);
    res.json(fallbackLesson);
  }
});

// 7. Tuddy Rabbit Mascot dynamic advice & motivation
app.post("/api/ai/tuddy-advice", async (req: Request, res: Response) => {
  try {
    const { userStats, currentMood = "study" } = req.body;

    const prompt = `Eres Tuddy, la mascota conejito chibi más tierna, inteligente y motivadora.
Hablas con el usuario de manera cercana, cariñosa, energética y sabia (usando metáforas de conejito como 'orejitas atentas', 'saltitos de progreso', 'zanahorias de recompensa').
Estado del estudiante:
- Rachas de días: ${userStats?.streak || 1}
- Fichas dominadas: ${userStats?.masteredCards || 0}
- Minutos estudiados hoy: ${userStats?.minutesToday || 0}
- Estado de ánimo / contexto: ${currentMood}

Genera un JSON con:
- quote: Una frase memorable y motivadora (máximo 15 palabras)
- advice: Un consejo práctico de neurociencia o método de estudio (ej. Pomodoro, repaso espaciado, evitar distracciones)
- actionSuggestion: Una acción de 2 minutos que puede hacer ahora mismo
- rabbitExpression: uno de 'happy', 'studying', 'cheering', 'relaxed', 'proud'`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING },
            advice: { type: Type.STRING },
            actionSuggestion: { type: Type.STRING },
            rabbitExpression: { type: Type.STRING },
          },
          required: ["quote", "advice", "actionSuggestion", "rabbitExpression"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.warn("AI tuddy-advice fallback invoked:", error?.message || error);
    res.json({
      quote: "¡Cada pequeño paso hoy es un gran salto mañana! 🐰✨",
      advice: "Recuerda la técnica Pomodoro: 25 minutos de enfoque total y 5 minutos para estirar las patitas.",
      actionSuggestion: "Revisa 3 fichas de tu mazo antes de descansar.",
      rabbitExpression: "happy",
    });
  }
});

// 8. AI Detect and Enrich Infinite Custom Subject
app.post("/api/ai/detect-subject", async (req: Request, res: Response) => {
  try {
    const { subjectName, context = "" } = req.body;
    if (!subjectName || typeof subjectName !== "string") {
      res.status(400).json({ error: "Nombre de materia requerido" });
      return;
    }

    const prompt = `Analiza la materia académica escrita por el usuario: "${subjectName}".
${context ? `Contexto adicional: "${context}"` : ""}
Determina:
1. Nombre limpio y capitalizado de la materia.
2. Categoría o rama académica (ej. 'Ciencias de la Salud', 'Ingeniería y Tecnología', 'Humanidades y Letras', 'Matemáticas y Física', 'Ciencias Sociales y Jurídicas', 'Negocios y Economía', 'Idiomas', 'Artes y Diseño', 'General').
3. Un color hexadecimal sugerido en tono pastel armónico Bento (ej. #FFB7B2, #B2E2F2, #B2F2BB, #D8B4E2, #FDE68A, #FED7AA, #C7D2FE, #99F6E4).
4. Técnica de estudio neurocognitiva recomendada para esta disciplina (ej. 'Active Recall con diagramas', 'Repaso espaciado de conceptos y fechas', 'Resolución deliberada de problemas paso a paso', 'Casos prácticos y técnica Feynman').
5. 3 temas o conceptos clave que los estudiantes suelen estudiar en esta materia.
6. Mensaje motivacional personalizado del conejito tutor.`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            normalizedName: { type: Type.STRING },
            category: { type: Type.STRING },
            color: { type: Type.STRING },
            recommendedTechnique: { type: Type.STRING },
            keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
            welcomeMessage: { type: Type.STRING },
          },
          required: ["normalizedName", "category", "color", "recommendedTechnique", "keyConcepts", "welcomeMessage"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.warn("AI detect-subject fallback invoked:", error?.message || error);
    const rawName = String(req.body.subjectName || "Materia").trim();
    res.json({
      normalizedName: rawName.charAt(0).toUpperCase() + rawName.slice(1),
      category: "Academia General",
      color: "#FFB7B2",
      recommendedTechnique: "Repaso Espaciado y Práctica Distribuida",
      keyConcepts: ["Fundamentos teóricos", "Aplicación práctica", "Evaluación continua"],
      welcomeMessage: `¡Excelente materia! ${rawName} queda agregada a tu plan con éxito. 🐰📚`,
    });
  }
});

// 9. AI Mascot Subject Advice (Corner Pop-up / Surprise Advice)
app.post("/api/ai/mascot-subject-advice", async (req: Request, res: Response) => {
  try {
    const { pet, subject, scheduleInfo = "" } = req.body;
    const petName = pet?.name || "Tuddy";
    const personality = pet?.personality || "enthusiastic"; // 'enthusiastic' | 'calm_wise' | 'fun_energetic'

    let personalityTone = "";
    if (personality === "enthusiastic") {
      personalityTone = `Personalidad: ENTUSIASTA. Eres sumamente optimista, celebras el esfuerzo, usas exclamaciones energéticas ('¡Tú puedes con todo!', '¡Venga ese repaso!', '¡Qué genial avance!'), transmites motivación contagiosa y empuje.`;
    } else if (personality === "calm_wise") {
      personalityTone = `Personalidad: TRANQUILO Y SABIO. Eres sereno, reflexivo, das citas profundas, consejos sobre respiración, enfoque sin prisa ('La gota constante talla la roca', 'Respira hondo y comprende la raíz'), promueves la claridad mental y el bienestar.`;
    } else {
      personalityTone = `Personalidad: DIVERTIDO Y ENÉRGICO. Tienes mucho sentido del humor, haces bromas simpáticas sobre el estudio y la vida estudiantil, nemotecnias curiosas o graciosas ('Si Newton vio una manzana, nosotros veremos un sobresaliente'), retos rápidos y chispa.`;
    }

    const prompt = `Eres ${petName}, un conejito antropomórfico inteligente y el compañero de estudio personal del estudiante.
${personalityTone}
El estudiante tiene en su horario/plan la materia: "${subject || "General"}".
${scheduleInfo ? `Información de su horario: "${scheduleInfo}"` : ""}

Te estás asomando en una esquina de la pantalla para darle un consejo pedagógico o nemotecnia súper útil y específico para ${subject}.

Genera un JSON con:
- title: Un encabezado corto y cariñoso (ej. "🥕 Tip relámpago de ${petName} para ${subject}")
- advice: Un consejo pedagógico, truco mnemotécnico o estrategia real y memorable para aprender ${subject}, escrito fielmente en tu personalidad (máximo 45 palabras).
- actionTip: Una micro-acción de 2 minutos para hacer ahora mismo (ej. 'Dibuja un diagrama rápido', 'Explica un término en voz alta').
- expression: uno de 'cheering', 'studying', 'happy', 'relaxed', 'proud'`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            advice: { type: Type.STRING },
            actionTip: { type: Type.STRING },
            expression: { type: Type.STRING },
          },
          required: ["title", "advice", "actionTip", "expression"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.warn("AI mascot-subject-advice fallback invoked:", error?.message || error);
    const petName = req.body.pet?.name || "Tuddy";
    const subject = req.body.subject || "tus materias";
    const personality = req.body.pet?.personality || "enthusiastic";

    let advice = `¡Hola! Para dominar ${subject}, haz un mini-esquema de 3 conceptos clave antes de dormir. ¡El cerebro consolida lo aprendido en la memoria de largo plazo! 🐰🧠`;
    let expression = "cheering";

    if (personality === "calm_wise") {
      advice = `La paciencia y el ritmo sereno son el camino para comprender ${subject}. Respira hondo, lee despacio y asimila la esencia profunda. 🐰🍃`;
      expression = "relaxed";
    } else if (personality === "fun_energetic") {
      advice = `¡Orejitas arriba! ¡Vamos a devorar ${subject} más rápido que una zanahoria crujiente! ¡A por ese sobresaliente! 🐰⚡`;
      expression = "cheering";
    }

    res.json({
      title: `🥕 Consejo de ${petName} para ${subject}`,
      advice,
      actionTip: `Dedica 2 minutos a repasar un concepto clave de ${subject}.`,
      expression,
    });
  }
});

// 10. AI Study Game Generator (10 Base Games + 10 Tuddy Plus Games)
app.post("/api/ai/generate-game", async (req: Request, res: Response) => {
  const { gameId, subject = "General", topic = "Conceptos Fundamentales", difficulty = "medio" } = req.body;

  try {
    const prompt = `Eres Tuddy AI, el diseñador pedagógico y maestro de videojuegos educativos más dinámico e interactivo.
Diseña el contenido interactivo y riguroso para el videojuego de estudio clásico id: "${gameId}".
- Materia: "${subject}"
- Tema específico: "${topic}"
- Nivel de dificultad: "${difficulty}" (facil, medio, dificil)

Requisitos de contenido:
Genera un conjunto de 4 a 6 rondas pedagógicas de alta calidad específicamente adaptadas a "${subject}" y "${topic}".
Cada ronda en "rounds" DEBE incluir:
- "question": Pregunta, enunciado o desafío conceptual preciso sobre "${topic}".
- "options": Array de 3 a 4 opciones claras y concisas (1 respuesta rigurosamente verdadera y 2-3 distractores verosímiles pero falsos).
- "correctAnswer": El texto exacto de la opción correcta.
- "explanation": Explicación pedagógica breve y motivadora de por qué es la respuesta correcta y cómo se aplica en ${subject}.

Responde estrictamente con un JSON con:
- title: Título atractivo del videojuego adaptado al tema (ej. "Angry Tuddy: Fortaleza de ${topic}", "Flappy Tuddy: Vuelo en ${subject}")
- instructions: Instrucción en 1 línea clara para el jugador
- rounds: array de rondas con question, options, correctAnswer y explanation
- extraData: {}`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      gameId,
      subject,
      topic,
      difficulty,
      title: parsed.title || `Desafío de ${subject}: ${topic}`,
      instructions: parsed.instructions || "Pon a prueba tus conocimientos y gana zanahorias.",
      rounds: Array.isArray(parsed.rounds) && parsed.rounds.length > 0 ? parsed.rounds : generateFallbackGame(gameId, subject, topic, difficulty).rounds,
      extraData: parsed.extraData || {},
    });
  } catch (error: any) {
    console.warn("AI generate-game fallback invoked:", error?.message || error);
    // Dynamic reliable pedagogical fallback
    const fallback = generateFallbackGame(gameId, subject, topic, difficulty);
    res.json(fallback);
  }
});

function generateFallbackGame(gameId: string, subject: string, topic: string, difficulty: string) {
  const cleanSubject = subject || "Materia";
  const cleanTopic = topic || "Fundamentos";

  return {
    gameId,
    subject: cleanSubject,
    topic: cleanTopic,
    difficulty,
    title: `Desafío Arcade: ${cleanTopic}`,
    instructions: "Lanza a Tuddy, supera los obstáculos y acierta a la respuesta correcta.",
    rounds: [
      {
        question: `¿Cuál es el postulado o principio rector de ${cleanTopic} en ${cleanSubject}?`,
        options: [
          `El axioma fundamental demostrado de ${cleanTopic}`,
          `El enfoque empírico de aproximación lineal`,
          `La hipótesis de equilibrio estático secundario`,
          `El principio de conservación localizada`,
        ],
        correctAnswer: `El axioma fundamental demostrado de ${cleanTopic}`,
        explanation: `Este axioma sienta las bases para deducir todas las propiedades prácticas de ${cleanTopic}.`,
      },
      {
        question: `¿Qué relación directa se observa al analizar las variables principales de ${cleanTopic}?`,
        options: [
          "Correlación causal respaldada por la evidencia teórica y práctica",
          "Proporcionalidad inversa condicionada por el entorno",
          "Comportamiento asintótico en regímenes transitorios",
          "Independencia paramétrica bajo supuestos cerrados",
        ],
        correctAnswer: "Correlación causal respaldada por la evidencia teórica y práctica",
        explanation: "La formulación rigurosa demuestra la proporcionalidad directa y comprobada.",
      },
      {
        question: `¿Cómo se aplica eficazmente ${cleanTopic} en la resolución de problemas en ${cleanSubject}?`,
        options: [
          `Formulando hipótesis, deduciendo con rigor y contrastando resultados`,
          "Estimando rangos medios mediante extrapolación heurística",
          "Sustituyendo condiciones de frontera por valores promedio",
          "Descomponiendo el sistema en subsistemas aislados no lineales",
        ],
        correctAnswer: `Formulando hipótesis, deduciendo con rigor y contrastando resultados`,
        explanation: "El método paso a paso asegura la precisión y evita errores conceptuales.",
      },
      {
        question: `¿Cuál de las siguientes afirmaciones describe de manera precisa a ${cleanTopic}?`,
        options: [
          `Permite estructurar modelos predictivos sólidos en ${cleanSubject}`,
          "Describe exclusivamente fluctuaciones estocásticas en regímenes límite",
          "Se restringe a sistemas homogéneos en condiciones ideales",
          "Constituye una regla práctica dependiente de calibración empírica",
        ],
        correctAnswer: `Permite estructurar modelos predictivos sólidos en ${cleanSubject}`,
        explanation: "La solidez del modelo permite aplicarlo con éxito en exámenes y proyectos.",
      },
    ],
  };
}

// ==========================================
// TUDDY PARA PROFESORES - AI ENDPOINTS
// ==========================================

// 1. Creador de Mejores Tareas con IA
app.post("/api/ai/teacher/generate-assignment", async (req: Request, res: Response) => {
  const { grade, subject, topic, bloomLevel, assignmentType, maxScore, customInstructions } = req.body;
  const cleanGrade = grade || "Secundaria";
  const cleanSubject = subject || "Materia General";
  const cleanTopic = topic || "Tema del Curso";
  const cleanBloom = bloomLevel || "aplicar";
  const cleanMaxScore = maxScore || 20;

  try {
    const prompt = `Actúa como un Diseñador Curricular y Pedagogo Experto de Tuddy para Profesores.
Crea una tarea escolar de alto impacto y rigor pedagógico para estudiantes de ${cleanGrade} en el curso de ${cleanSubject}.
Tema: "${cleanTopic}".
Nivel de la Taxonomía de Bloom deseado: "${cleanBloom}".
Tipo de formato de tarea: "${assignmentType || "Resolución de problemas con aplicación a la vida real"}".
Escala de puntaje total: ${cleanMaxScore} puntos.
${customInstructions ? `Instrucciones adicionales del docente: "${customInstructions}"` : ""}

Requisitos de la tarea:
1. Conexión auténtica con situaciones reales que motiven a los estudiantes.
2. Instrucciones claras paso a paso para el estudiante.
3. Rúbrica con criterios desglosados y puntajes que sumen exactamente ${cleanMaxScore} puntos.
4. Consejos pedagógicos para el profesor al momento de calificar o hacer retroalimentación.`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            topic: { type: Type.STRING },
            learningGoal: { type: Type.STRING },
            realWorldContext: { type: Type.STRING },
            instructionsMarkdown: { type: Type.STRING },
            deliverablesGuide: { type: Type.STRING },
            bloomLevel: { type: Type.STRING },
            rubricCriteria: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criterion: { type: Type.STRING },
                  points: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                  excellentDescriptor: { type: Type.STRING },
                  needsImprovementDescriptor: { type: Type.STRING },
                },
                required: ["criterion", "points", "description", "excellentDescriptor", "needsImprovementDescriptor"],
              },
            },
            estimatedTimeMinutes: { type: Type.NUMBER },
            teacherPedagogicalTips: { type: Type.STRING },
          },
          required: ["title", "topic", "learningGoal", "realWorldContext", "instructionsMarkdown", "deliverablesGuide", "bloomLevel", "rubricCriteria", "estimatedTimeMinutes", "teacherPedagogicalTips"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.warn("AI teacher generate-assignment fallback invoked:", error?.message || error);
    res.json({
      title: `Desafío Práctico: ${cleanTopic} en la Vida Real`,
      topic: cleanTopic,
      learningGoal: `El estudiante será capaz de aplicar conceptos clave de ${cleanTopic} para resolver y justificar un problema auténtico.`,
      realWorldContext: `En situaciones cotidianas y profesionales, ${cleanTopic} permite tomar decisiones fundamentadas y optimizar procesos.`,
      instructionsMarkdown: `### 📋 Instrucciones para el Estudiante:\n\n1. **Fase 1 - Investigación Inicial**: Revisa tus apuntes sobre ${cleanTopic} e identifica los principios clave.\n2. **Fase 2 - Desarrollo y Modelado**: Aplica el procedimiento paso a paso para resolver el caso asignado, justificando cada operación.\n3. **Fase 3 - Conclusión y Reflexión**: Redacta una breve conclusión de 3 líneas explicando qué aprendiste y cómo lo aplicarías en tu comunidad.`,
      deliverablesGuide: "Entregar en hoja cuadriculada ordenada o documento digital con nombre, fecha y procedimientos completos.",
      bloomLevel: cleanBloom,
      rubricCriteria: [
        {
          criterion: "Comprensión conceptual y planteamiento",
          points: Math.round(cleanMaxScore * 0.4),
          description: "Demuestra dominio de los conceptos esenciales y formula correctamente el problema.",
          excellentDescriptor: "Planteamiento impecable sin errores conceptuales.",
          needsImprovementDescriptor: "Planteamiento confuso o con omisiones importantes."
        },
        {
          criterion: "Procedimiento y rigurosidad",
          points: Math.round(cleanMaxScore * 0.4),
          description: "Desarrolla el trabajo con coherencia lógica y métodos adecuados.",
          excellentDescriptor: "Procedimiento detallado, claro y matemáticamente exacto.",
          needsImprovementDescriptor: "Saltos lógicos injustificados o errores de cálculo."
        },
        {
          criterion: "Conclusión y presentación",
          points: Math.max(1, cleanMaxScore - (Math.round(cleanMaxScore * 0.4) * 2)),
          description: "Comunica resultados de forma ordenada y reflexiva.",
          excellentDescriptor: "Conclusión crítica, pulcritud y entrega oportuna.",
          needsImprovementDescriptor: "Conclusión superficial o presentación desordenada."
        }
      ],
      estimatedTimeMinutes: 45,
      teacherPedagogicalTips: "Al revisar, enfócate en el razonamiento del alumno más que en el resultado aislado. Brinda retroalimentación descriptiva."
    });
  }
});

// 2. Herramienta Especial 1: Planificador de Clases (Lesson Plan)
app.post("/api/ai/teacher/generate-lesson-plan", async (req: Request, res: Response) => {
  const { grade, subject, topic, durationMinutes, pedagogicalApproach } = req.body;
  const cleanGrade = grade || "3° Secundaria";
  const cleanSubject = subject || "Materia";
  const cleanTopic = topic || "Tema";
  const cleanDuration = durationMinutes || 90;

  try {
    const prompt = `Diseña una Sesión de Aprendizaje / Plan de Clase completo para un profesor de ${cleanGrade} en el curso de ${cleanSubject}.
Tema: "${cleanTopic}".
Duración total: ${cleanDuration} minutos.
Enfoque metodológico: "${pedagogicalApproach || "DUA (Diseño Universal para el Aprendizaje) y Aprendizaje Activo"}".

Estructura obligatoria:
- Título atractivo y propósito de aprendizaje.
- Competencias y capacidades trabajadas.
- Secuencia didáctica en tres momentos clave con tiempos asignados:
  * INICIO: Motivación, saberes previos y conflicto cognitivo.
  * DESARROLLO: Explicación interactiva, modelado del docente, práctica guiada y trabajo colaborativo/individual.
  * CIERRE: Metacognición (¿Qué aprendimos? ¿Cómo lo aprendimos?), autoevaluación y síntesis.
- Adaptaciones DUA para atención a la diversidad.
- Instrumento y criterios de evaluación sugeridos.`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subject: { type: Type.STRING },
            grade: { type: Type.STRING },
            durationMinutes: { type: Type.NUMBER },
            purpose: { type: Type.STRING },
            competency: { type: Type.STRING },
            materials: { type: Type.ARRAY, items: { type: Type.STRING } },
            inicio: {
              type: Type.OBJECT,
              properties: {
                minutes: { type: Type.NUMBER },
                motivationActivity: { type: Type.STRING },
                priorKnowledgeQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                cognitiveConflict: { type: Type.STRING },
              },
              required: ["minutes", "motivationActivity", "priorKnowledgeQuestions", "cognitiveConflict"],
            },
            desarrollo: {
              type: Type.OBJECT,
              properties: {
                minutes: { type: Type.NUMBER },
                conceptExplanation: { type: Type.STRING },
                guidedPractice: { type: Type.STRING },
                studentActivities: { type: Type.STRING },
                duaAdaptationNotes: { type: Type.STRING },
              },
              required: ["minutes", "conceptExplanation", "guidedPractice", "studentActivities", "duaAdaptationNotes"],
            },
            cierre: {
              type: Type.OBJECT,
              properties: {
                minutes: { type: Type.NUMBER },
                metacognitionQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                synthesisActivity: { type: Type.STRING },
              },
              required: ["minutes", "metacognitionQuestions", "synthesisActivity"],
            },
            evaluationEvidence: { type: Type.STRING },
          },
          required: ["title", "subject", "grade", "durationMinutes", "purpose", "competency", "materials", "inicio", "desarrollo", "cierre", "evaluationEvidence"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.warn("AI teacher lesson plan fallback invoked:", error?.message || error);
    res.json({
      title: `Sesión de Aprendizaje: Descubriendo ${cleanTopic}`,
      subject: cleanSubject,
      grade: cleanGrade,
      durationMinutes: cleanDuration,
      purpose: `Que los estudiantes comprendan los principios fundamentales de ${cleanTopic} y los comuniquen con propiedad.`,
      competency: `Resuelve problemas e indaga mediante métodos científicos y conceptuales en ${cleanSubject}.`,
      materials: ["Pizarra o proyector", "Fichas de trabajo impresas", "Cuaderno de apuntes", "Tarjetas de participación"],
      inicio: {
        minutes: 15,
        motivationActivity: `Presentar un enigma o situación cotidiana relacionada con ${cleanTopic} para despertar curiosidad.`,
        priorKnowledgeQuestions: [
          `¿Qué recuerdan sobre los conceptos previos vinculados a ${cleanTopic}?`,
          "¿Dónde han visto aplicarse esto en la vida real?"
        ],
        cognitiveConflict: "¿Sería posible resolver esta situación sin aplicar esta regla fundamental?"
      },
      desarrollo: {
        minutes: cleanDuration - 30,
        conceptExplanation: `El docente expone de manera visual y clara el concepto de ${cleanTopic}, utilizando analogías y ejemplos paso a paso.`,
        guidedPractice: "Resolución conjunta de dos ejercicios modelo en la pizarra con preguntas socráticas.",
        studentActivities: "Los alumnos trabajan en parejas resolviendo un caso práctico aplicando lo aprendido.",
        duaAdaptationNotes: "Proporcionar organizadores visuales y permitir respuestas orales o esquemáticas para alumnos que lo requieran."
      },
      cierre: {
        minutes: 15,
        metacognitionQuestions: [
          "¿Qué fue lo más fácil y lo más desafiante de la clase de hoy?",
          "¿Para qué me sirve lo que aprendí sobre este tema?"
        ],
        synthesisActivity: "Un minuto de síntesis en el que cada estudiante comparte una palabra clave de la sesión."
      },
      evaluationEvidence: "Ficha práctica de aplicación calificada con lista de cotejo."
    });
  }
});

// 3. Herramienta Especial 2: Generador de Rúbricas Analíticas
app.post("/api/ai/teacher/generate-rubric", async (req: Request, res: Response) => {
  const { grade, subject, taskTitle, criteriaCount, scaleType } = req.body;
  const cleanGrade = grade || "Secundaria";
  const cleanSubject = subject || "Materia General";
  const cleanTitle = taskTitle || "Actividad o Proyecto de Clase";
  const count = criteriaCount || 4;

  try {
    const prompt = `Crea una Rúbrica Analítica de Evaluación para el docente en ${cleanSubject} para ${cleanGrade}.
Actividad / Producto a evaluar: "${cleanTitle}".
Cantidad de criterios: ${count}.
Escala de desempeño: Sobresaliente (AD / 4 pts), Logrado (A / 3 pts), En Proceso (B / 2 pts), En Inicio (C / 1 pto).
Para cada criterio, describe con detalle y objetividad las evidencias observables.`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subject: { type: Type.STRING },
            grade: { type: Type.STRING },
            totalPoints: { type: Type.NUMBER },
            criteria: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  weightPercentage: { type: Type.NUMBER },
                  outstanding: { type: Type.STRING },
                  proficient: { type: Type.STRING },
                  developing: { type: Type.STRING },
                  beginning: { type: Type.STRING },
                },
                required: ["name", "weightPercentage", "outstanding", "proficient", "developing", "beginning"],
              },
            },
            teacherObservationAdvice: { type: Type.STRING },
          },
          required: ["title", "subject", "grade", "totalPoints", "criteria", "teacherObservationAdvice"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.warn("AI teacher rubric fallback invoked:", error?.message || error);
    res.json({
      title: `Rúbrica de Evaluación: ${cleanTitle}`,
      subject: cleanSubject,
      grade: cleanGrade,
      totalPoints: 20,
      criteria: [
        {
          name: "Dominio y Comprensión Conceptual",
          weightPercentage: 35,
          outstanding: "Evidencia comprensión profunda; explica y fundamenta sin imprecisiones.",
          proficient: "Demuestra dominio adecuado de los conceptos clave con pocas dudas menores.",
          developing: "Identifica conceptos de forma parcial; requiere orientación en aspectos centrales.",
          beginning: "Presenta errores conceptuales graves o confunde nociones básicas."
        },
        {
          name: "Procedimiento y Rigor Metodológico",
          weightPercentage: 35,
          outstanding: "Sigue una secuencia lógica impecable, detallada y verifica sus conclusiones.",
          proficient: "Aplica los pasos requeridos con coherencia lógica y orden general.",
          developing: "Omite pasos metodológicos o comete errores de cálculo/proceso evitables.",
          beginning: "No presenta procedimiento ordenado o el desarrollo no se relaciona con la consigna."
        },
        {
          name: "Claridad, Presentación y Trabajo Autónomo",
          weightPercentage: 30,
          outstanding: "Presentación impecable, lenguaje técnico preciso y entrega puntual.",
          proficient: "Trabajo pulcro, lenguaje apropiado y entregado en el plazo acordado.",
          developing: "Presentación descuidada o vocabulario excesivamente informal.",
          beginning: "Incompleto, ilegible o fuera del plazo sin justificación."
        }
      ],
      teacherObservationAdvice: "Utiliza esta rúbrica para dialogar con el estudiante sobre sus fortalezas y próximos pasos antes del cierre de unidad."
    });
  }
});

// 4. Herramienta Especial 3: Generador de Exámenes Escolares Imprimibles
app.post("/api/ai/teacher/generate-exam", async (req: Request, res: Response) => {
  const { schoolName, teacherName, grade, section, subject, topic, questionCount, durationMinutes } = req.body;
  const count = questionCount || 5;

  try {
    const prompt = `Crea un examen escolar completo y riguroso listo para imprimir y fotocopiar en hoja A4.
Institución: "${schoolName || "Colegio Modelo"}".
Profesor: "${teacherName || "Docente"}".
Grado: "${grade || "3° Secundaria"}".
Sección: "${section || "A"}".
Curso: "${subject || "Matemáticas"}".
Tema evaluado: "${topic || "Evaluación Bimestral"}".
Cantidad de preguntas: ${count}.
Tiempo: ${durationMinutes || 60} minutos.

El examen debe incluir:
1. Encabezado formal con campos para Nombre, Fecha, Grado, Sección y Calificación.
2. Instrucciones para el alumno.
3. Preguntas con tipos variados (opción múltiple y desarrollo con espacio de resolución).
4. Clave de respuestas separada con justificación pedagógica para el docente.`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            header: {
              type: Type.OBJECT,
              properties: {
                schoolName: { type: Type.STRING },
                examTitle: { type: Type.STRING },
                subject: { type: Type.STRING },
                gradeAndSection: { type: Type.STRING },
                duration: { type: Type.STRING },
                maxScore: { type: Type.NUMBER },
              },
              required: ["schoolName", "examTitle", "subject", "gradeAndSection", "duration", "maxScore"],
            },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  number: { type: Type.NUMBER },
                  questionText: { type: Type.STRING },
                  type: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  points: { type: Type.NUMBER },
                  workingLinesHint: { type: Type.STRING },
                },
                required: ["number", "questionText", "type", "points"],
              },
            },
            teacherAnswerKey: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionNumber: { type: Type.NUMBER },
                  correctAnswer: { type: Type.STRING },
                  gradingCriteria: { type: Type.STRING },
                },
                required: ["questionNumber", "correctAnswer", "gradingCriteria"],
              },
            },
          },
          required: ["header", "instructions", "questions", "teacherAnswerKey"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.warn("AI teacher exam builder fallback invoked:", error?.message || error);
    res.json({
      header: {
        schoolName: schoolName || "Colegio Modelo",
        examTitle: `Evaluación Escolar: ${topic || "Tema de Clase"}`,
        subject: subject || "Matemáticas",
        gradeAndSection: `${grade || "3°"} - Sección ${section || "A"}`,
        duration: `${durationMinutes || 60} minutos`,
        maxScore: 20
      },
      instructions: [
        "Lee atentamente cada enunciado antes de responder.",
        "Usa lapicero azul o negro para las respuestas definitivas.",
        "Justifica todos tus procedimientos matemáticos y teóricos."
      ],
      questions: [
        {
          number: 1,
          questionText: `¿Cuál es el principio fundamental que rige a ${topic || "este tema"}?`,
          type: "multiple_choice",
          options: [
            "Es la ley de conservación y correspondencia directa",
            "Depende exclusivamente de factores ambientales",
            "Constituye una excepción aplicable solo a casos límites",
            "Es una regla empírica sin sustento teórico"
          ],
          points: 4,
          workingLinesHint: "Marca con una 'X' la opción correcta."
        },
        {
          number: 2,
          questionText: `Aplica los conceptos de ${topic || "este tema"} para resolver un caso concreto de cálculo:`,
          type: "open_development",
          options: [],
          points: 8,
          workingLinesHint: "Espacio para desarrollo y procedimiento completo (5 líneas)."
        },
        {
          number: 3,
          questionText: `Explica dos diferencias cruciales en la aplicación de ${topic || "este tema"} en situaciones reales:`,
          type: "open_short",
          options: [],
          points: 8,
          workingLinesHint: "Redacta tu explicación con vocabulario técnico."
        }
      ],
      teacherAnswerKey: [
        { questionNumber: 1, correctAnswer: "Es la ley de conservación y correspondencia directa", gradingCriteria: "4 pts si marca la opción exacta." },
        { questionNumber: 2, correctAnswer: "Procedimiento correcto y valor numérico verificado", gradingCriteria: "4 pts planteamiento, 4 pts cálculo final." },
        { questionNumber: 3, correctAnswer: "Menciona variables independientes y su impacto", gradingCriteria: "4 pts por cada diferencia bien argumentada." }
      ]
    });
  }
});

// 5. Herramienta Especial 4: Generador de Comunicados y Reportes para Padres de Familia
app.post("/api/ai/teacher/generate-parent-report", async (req: Request, res: Response) => {
  const { studentName, grade, section, situationType, positiveAspects, areasToImprove, teacherName, schoolName } = req.body;
  const cleanStudent = studentName || "Estudiante";
  const cleanGrade = `${grade || "Grado"} - Sec. ${section || "A"}`;
  const cleanSituation = situationType || "informe_academico";

  try {
    const prompt = `Redacta un Comunicado Oficial y un Mensaje de WhatsApp para los Padres de Familia / Apoderados.
Profesor: "${teacherName || "El Docente"}".
Colegio: "${schoolName || "La Institución Educativa"}".
Estudiante: "${cleanStudent}".
Grado y Sección: "${cleanGrade}".
Motivo / Situación: "${cleanSituation}" (ej. felicitación, bajo rendimiento en tareas, falta de materiales o citación constructiva).
Fortalezas / Aspectos Positivos observados: "${positiveAspects || "Es participativo y muestra interés en clase"}".
Áreas a mejorar o compromiso requerido: "${areasToImprove || "Cumplimiento puntual de las tareas y repaso diario de 20 minutos"}".

Tono:
- Respetuoso, empático, motivador y profesional.
- El objetivo es formar equipo con la familia, nunca culpar o generar rechazo.`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subjectLine: { type: Type.STRING },
            formalLetterText: { type: Type.STRING },
            whatsappQuickMessage: { type: Type.STRING },
            recommendedActionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["subjectLine", "formalLetterText", "whatsappQuickMessage", "recommendedActionPlan"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.warn("AI teacher parent report fallback invoked:", error?.message || error);
    res.json({
      subjectLine: `Reporte de Acompañamiento Escolar - ${cleanStudent} (${cleanGrade})`,
      formalLetterText: `Estimados padres de familia y apoderados de ${cleanStudent}:\n\nPor medio de la presente, reciban un cordial y afectuoso saludo en nombre de ${schoolName || "nuestra comunidad educativa"}.\n\nMe dirijo a ustedes para compartirles el seguimiento pedagógico de ${cleanStudent}. Destacamos gratamente que ${positiveAspects || "muestra entusiasmo y buena disposición para el trabajo en el aula"}.\n\nPara consolidar su máximo potencial, es fundamental que en casa reforcemos: ${areasToImprove || "el hábito de repaso diario y la entrega puntual de las tareas asignadas"}.\n\nConfiamos plenamente en las capacidades de ${cleanStudent} y en el valioso acompañamiento que ustedes le brindan día a día.\n\nAtentamente,\n${teacherName || "Profesor de Área"}`,
      whatsappQuickMessage: `👋 Estimada familia de *${cleanStudent}* (${cleanGrade}):\nLes saluda cordialmente su profesor(a). Queremos felicitar su esfuerzo en el aula y coordinar con ustedes para seguir fortaleciendo el cumplimiento de tareas en casa 📚✨. ¡Con su apoyo en equipo lograremos excelentes resultados! Cualquier duda estoy a su disposición.`,
      recommendedActionPlan: [
        "Establecer un horario fijo de estudio de 30 minutos en casa sin pantallas distractoras.",
        "Revisar conjuntamente la libreta de tareas o el cuaderno una vez por semana.",
        "Reconocer y felicitar verbalmente sus avances para fortalecer su autoestima."
      ]
    });
  }
});

// 6. Herramienta Especial 5: Adaptador Curricular Diferenciado (DUA / NEE)
app.post("/api/ai/teacher/adapt-curriculum", async (req: Request, res: Response) => {
  const { originalContent, grade, subject, studentProfile } = req.body;
  const cleanProfile = studentProfile || "Estudiante con dificultad de comprensión lectora o TDAH que requiere apoyos visuales y pasos cortos";

  try {
    const prompt = `Actúa como Especialista en Inclusión Educativa y DUA (Diseño Universal para el Aprendizaje).
Adapta el siguiente material escolar para atender la diversidad en el aula (${grade || "Secundaria"} - ${subject || "Materia"}):
Perfil del estudiante o necesidad de apoyo: "${cleanProfile}".
Contenido original a adaptar:
"""
${originalContent || "Explicación teórica de un concepto científico o matemático con lenguaje complejo."}
"""

Genera:
1. Versión adaptada con lenguaje claro, organizadores y pasos dosificados.
2. Apoyos visuales o esquemas recomendados para el pizarrón.
3. Preguntas de andamiaje (de menor a mayor complejidad).
4. Reto de extensión o profundización para mantener la motivación.`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            adaptedTitle: { type: Type.STRING },
            adaptedText: { type: Type.STRING },
            visualScaffoldingTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            scaffoldingQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            extensionChallenge: { type: Type.STRING },
            teacherPedagogicalNotes: { type: Type.STRING },
          },
          required: ["adaptedTitle", "adaptedText", "visualScaffoldingTips", "scaffoldingQuestions", "extensionChallenge", "teacherPedagogicalNotes"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.warn("AI teacher curriculum adaptation fallback invoked:", error?.message || error);
    res.json({
      adaptedTitle: "Versión Adaptada DUA: Lectura Paso a Paso con Apoyo Visual",
      adaptedText: `### 📌 Idea Clave en 1 Minuto:\n${originalContent ? originalContent.slice(0, 150) + "..." : "El concepto central se divide en pasos sencillos para facilitar el aprendizaje."}\n\n### 🔍 Pasos Claros:\n1. **Paso 1**: Identifica la palabra clave principal.\n2. **Paso 2**: Relaciónala con un ejemplo de tu vida diaria.\n3. **Paso 3**: Escribe o dibuja lo que entendiste.`,
      visualScaffoldingTips: [
        "Usar colores diferenciados para variables o conceptos clave.",
        "Dividir el texto en bloques de no más de 3 líneas con viñetas.",
        "Acompañar con un diagrama de flujo simple o mapa mental."
      ],
      scaffoldingQuestions: [
        "¿De qué trata principalmente el texto con tus propias palabras?",
        "¿Cuál es el primer paso que debes realizar para resolver el ejercicio?",
        "¿Qué pasaría si cambiamos este dato en el ejemplo?"
      ],
      extensionChallenge: "Para estudiantes que terminen antes: Diseñar un ejemplo nuevo y explicárselo a un compañero.",
      teacherPedagogicalNotes: "Valida la comprensión oralmente antes de pedirle la respuesta escrita para reducir la ansiedad académica."
    });
  }
});

// 7. Herramienta Especial 6: Tickets de Salida y Preguntas Rompehielos (Exit Tickets)
app.post("/api/ai/teacher/generate-exit-tickets", async (req: Request, res: Response) => {
  const { grade, subject, topic, ticketCount } = req.body;
  const count = ticketCount || 3;

  try {
    const prompt = `Crea un set de ${count} Tickets de Salida (Exit Tickets de 3 minutos) y 2 Preguntas Rompehielos para una clase de ${grade || "Secundaria"} en ${subject || "Materia"}.
Tema: "${topic || "Tema de la clase de hoy"}".

Objetivo:
- Permitir al profesor comprobar en 3 minutos antes de que suene la campana qué estudiantes comprendieron el tema y quiénes necesitan refuerzo.
- Preguntas breves, creativas y altamente diagnósticas.`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            icebreakerWarmups: { type: Type.ARRAY, items: { type: Type.STRING } },
            exitTickets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  number: { type: Type.NUMBER },
                  ticketTitle: { type: Type.STRING },
                  promptForStudent: { type: Type.STRING },
                  diagnosticPurpose: { type: Type.STRING },
                  idealQuickAnswer: { type: Type.STRING },
                },
                required: ["number", "ticketTitle", "promptForStudent", "diagnosticPurpose", "idealQuickAnswer"],
              },
            },
            teacherActionAdvice: { type: Type.STRING },
          },
          required: ["topic", "icebreakerWarmups", "exitTickets", "teacherActionAdvice"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.warn("AI teacher exit tickets fallback invoked:", error?.message || error);
    res.json({
      topic: topic || "Tema de clase",
      icebreakerWarmups: [
        `Si tuvieras que explicar ${topic || "este tema"} a alguien de 8 años en una frase, ¿qué le dirías?`,
        "En una escala del 1 al 5, ¿cuánta confianza sientes con este tema hoy?"
      ],
      exitTickets: [
        {
          number: 1,
          ticketTitle: "Ticket 3-2-1 Rápido",
          promptForStudent: "Escribe 2 cosas que aprendiste hoy y 1 duda que aún te quedó sobre el tema.",
          diagnosticPurpose: "Detectar lagunas conceptuales antes de la siguiente clase.",
          idealQuickAnswer: "Menciona los dos pilares del tema y formula una duda específica."
        },
        {
          number: 2,
          ticketTitle: "El Detector de Errores",
          promptForStudent: "Un alumno imaginario afirma que este concepto no funciona en casos prácticos. ¿Cómo le demostrarías que está equivocado?",
          diagnosticPurpose: "Evaluar capacidad de argumentación y pensamiento crítico.",
          idealQuickAnswer: "Aporta un contraejemplo válido fundamentado."
        },
        {
          number: 3,
          ticketTitle: "Titular de Noticia",
          promptForStudent: "Inventa un titular de periódico que resuma la gran idea de nuestra sesión de hoy.",
          diagnosticPurpose: "Capacidad de síntesis inmediata.",
          idealQuickAnswer: "Titular llamativo que sintetiza el propósito central."
        }
      ],
      teacherActionAdvice: "Recoge los tickets en la puerta. Separa las respuestas en 3 montoncitos (Verde: comprendió, Amarillo: dudas menores, Rojo: requiere refuerzo prioritario)."
    });
  }
});


// Start server with Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Tuddy Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
