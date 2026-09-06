import { CampaignPathNode, LanguageLesson } from "../types";

// Helper to construct sinusoidal offsets for visual winding path
const getSinusoidalOffset = (index: number): number => {
  // Oscillates between -30% and +30%
  const pattern = [-20, -32, -22, -8, 12, 28, 32, 18, 0, -18, -32, -20, 0, 22, 32, 18, 0, -22, -30, 0];
  return pattern[index % pattern.length];
};

// ==========================================
// 🇬🇧 INGLÉS (A1 ➔ C1)
// ==========================================
export const ENGLISH_CURRICULUM: CampaignPathNode[] = [
  // UNIDAD 1: A1 (1a) • Fundamentos & Saludos
  {
    id: "en-a1-1",
    nodeIndex: 1,
    type: "lesson",
    level: "A1",
    levelBadge: "Nivel A1 (1a)",
    unitNumber: 1,
    unitTitle: "Unidad 1: Fundamentos y Primeros Saludos (A1)",
    title: "Primeros Saludos & Presentaciones",
    subtitle: "Aprende a saludar, decir tu nombre y pedir cosas educadamente.",
    targetLanguage: "Inglés",
    langCode: "en-US",
    xOffsetPercent: getSinusoidalOffset(0),
    carrotsReward: 10,
    lesson: {
      topicTitle: "Saludos y Cortesía en Inglés",
      targetLanguage: "Inglés",
      level: "A1",
      vocabulary: [
        { word: "Hello", translation: "Hola", phoneticOrPronunciationGuide: "/həˈloʊ/", exampleSentence: "Hello, nice to meet you!", exampleTranslation: "¡Hola, mucho gusto en conocerte!" },
        { word: "Please", translation: "Por favor", phoneticOrPronunciationGuide: "/pliːz/", exampleSentence: "A glass of water, please.", exampleTranslation: "Un vaso de agua, por favor." },
        { word: "Thank you", translation: "Gracias", phoneticOrPronunciationGuide: "/ˈθæŋk juː/", exampleSentence: "Thank you very much for your help.", exampleTranslation: "Muchas gracias por tu ayuda." },
        { word: "My name is...", translation: "Mi nombre es...", phoneticOrPronunciationGuide: "/maɪ neɪm ɪz/", exampleSentence: "My name is Tuddy and I am learning English.", exampleTranslation: "Mi nombre es Tuddy y estoy aprendiendo inglés." }
      ],
      dialogue: [
        { speaker: "Sarah", text: "Good morning! Welcome to the classroom. What is your name?", translation: "¡Buenos días! Bienvenido a la clase. ¿Cómo te llamas?" },
        { speaker: "Tuddy", text: "Hello! My name is Tuddy. Nice to meet you, Sarah!", translation: "¡Hola! Mi nombre es Tuddy. ¡Mucho gusto en conocerte, Sarah!" },
        { speaker: "Sarah", text: "Nice to meet you too, Tuddy! Let's get started.", translation: "¡Mucho gusto en conocerte también, Tuddy! Empecemos." }
      ],
      listeningExercise: {
        audioText: "Hello! Nice to meet you. My name is Tuddy.",
        question: "¿Qué dice Tuddy al presentarse?",
        options: [
          "Hola, mucho gusto en conocerte. Mi nombre es Tuddy.",
          "Adiós, nos vemos mañana en la estación.",
          "¿Dónde está el baño, por favor?",
          "Quiero comprar un billete de avión."
        ],
        correctOptionIndex: 0,
        tip: "Escucha con atención 'Nice to meet you' y 'My name is'."
      },
      readingExercise: {
        passageTitle: "A Morning Greeting",
        passageText: "Good morning! My name is Emma. I am at the university library. When I meet new friends, I always say: 'Hello, please feel at home and thank you for studying together.'",
        question: "¿Qué hace Emma cuando conoce a nuevos amigos?",
        options: [
          "Los saluda amablemente y les agradece por estudiar juntos.",
          "Cierra sus libros y se va inmediatamente.",
          "Pregunta la hora del autobús a Londres.",
          "Pide un café caliente sin azúcar."
        ],
        correctOptionIndex: 0,
        explanation: "Emma afirma expresamente que siempre saluda diciendo 'Hello' y 'thank you for studying together'."
      },
      writingExercise: {
        prompt: "Escribe en inglés: 'Por favor'",
        expectedAnswer: "Please",
        alternativeAcceptable: ["please", "Please!", "please."],
        hint: "Palabra de 6 letras que empieza con P..."
      },
      interactiveChallenge: {
        promptText: "Completa la frase habitual de respuesta: 'Nice to meet you ___'",
        sentenceToCompleteOrTranslate: "Nice to meet you too! (Mucho gusto en conocerte a ti también)",
        options: ["too!", "never!", "yesterday!", "under!"],
        correctOptionIndex: 0,
        explanation: "La respuesta formal y cálida cuando alguien te dice 'Nice to meet you' es agregar 'too' al final."
      },
      pronunciationTip: "Coloca la lengua suavemente entre los dientes al pronunciar la 'th' de 'Thank you'.",
      tuddyEncouragement: "¡Primer paso completado con éxito! Tu camino a C1 empieza aquí 🐰✨"
    }
  },
  {
    id: "en-a1-2",
    nodeIndex: 2,
    type: "story",
    level: "A1",
    levelBadge: "Nivel A1 (1a)",
    unitNumber: 1,
    unitTitle: "Unidad 1: Fundamentos y Primeros Saludos (A1)",
    title: "Cuento: En la Cafetería",
    subtitle: "Pide comida, bebidas y practica números del 1 al 10.",
    targetLanguage: "Inglés",
    langCode: "en-US",
    xOffsetPercent: getSinusoidalOffset(1),
    carrotsReward: 12,
    lesson: {
      topicTitle: "Cuento & Lectura: El primer pedido de café",
      targetLanguage: "Inglés",
      level: "A1",
      vocabulary: [
        { word: "Coffee", translation: "Café", phoneticOrPronunciationGuide: "/ˈkɔː.fi/", exampleSentence: "I would like a hot coffee.", exampleTranslation: "Me gustaría un café caliente." },
        { word: "How much is it?", translation: "¿Cuánto cuesta?", phoneticOrPronunciationGuide: "/haʊ mʌtʃ ɪz ɪt/", exampleSentence: "Excuse me, how much is this muffin?", exampleTranslation: "Disculpe, ¿cuánto cuesta este panecillo?" },
        { word: "Water", translation: "Agua", phoneticOrPronunciationGuide: "/ˈwɔː.tər/", exampleSentence: "Can I have some cold water?", exampleTranslation: "¿Puedo pedir un poco de agua fría?" }
      ],
      dialogue: [
        { speaker: "Barista", text: "Good morning! Can I help you?", translation: "¡Buenos días! ¿En qué puedo ayudarle?" },
        { speaker: "Tuddy", text: "Hello! One black coffee and one glass of water, please.", translation: "¡Hola! Un café negro y un vaso de agua, por favor." },
        { speaker: "Barista", text: "Certainly! That is three dollars, please.", translation: "¡Por supuesto! Son tres dólares, por favor." }
      ],
      readingExercise: {
        passageTitle: "Tuddy's Coffee Break",
        passageText: "Tuddy walks into a quiet coffee shop near the park. He feels very thirsty after a flight. He politely orders one coffee and a fresh glass of water. The friendly barista smiles and gives him a warm muffin as a gift.",
        question: "¿Por qué el barista le regala un muffin a Tuddy?",
        options: [
          "Porque Tuddy fue muy educado al pedir su café y agua.",
          "Porque Tuddy olvidó su billetera en el avión.",
          "Porque la cafetería estaba cerrando.",
          "Porque era el cumpleaños del barista."
        ],
        correctOptionIndex: 0,
        explanation: "El texto resalta la cortesía de Tuddy ('politely orders') y la reacción amigable del barista."
      },
      interactiveChallenge: {
        promptText: "¿Cómo preguntas el precio de un artículo en una tienda en inglés?",
        sentenceToCompleteOrTranslate: "How much is it? (¿Cuánto cuesta?)",
        options: ["How much is it?", "What time are you?", "Where is the sky?", "Who is running?"],
        correctOptionIndex: 0,
        explanation: "'How much is it?' es la fórmula estándar para preguntar el precio de cualquier producto."
      },
      pronunciationTip: "La palabra 'Coffee' acentúa la primera sílaba: COF-fee.",
      tuddyEncouragement: "¡Gran lectura comprensiva! Estás dominando las bases ☕📖"
    }
  },
  {
    id: "en-a1-3",
    nodeIndex: 3,
    type: "chest",
    level: "A1",
    levelBadge: "Nivel A1 (1a)",
    unitNumber: 1,
    unitTitle: "Unidad 1: Fundamentos y Primeros Saludos (A1)",
    title: "Cofre de Recompensas A1",
    subtitle: "¡Abre este cofre para recibir un botín de zanahorias por tu constancia!",
    targetLanguage: "Inglés",
    langCode: "en-US",
    xOffsetPercent: getSinusoidalOffset(2),
    carrotsReward: 15,
    chestRewardCarrots: 15,
  },
  {
    id: "en-a1-4",
    nodeIndex: 4,
    type: "checkpoint",
    level: "A1",
    levelBadge: "Nivel A1 (1a)",
    unitNumber: 1,
    unitTitle: "Unidad 1: Fundamentos y Primeros Saludos (A1)",
    title: "Punto de Control A1: Corona de Inicio",
    subtitle: "Prueba de evaluación para certificar el dominio del Nivel A1 (1a).",
    targetLanguage: "Inglés",
    langCode: "en-US",
    xOffsetPercent: getSinusoidalOffset(3),
    carrotsReward: 20,
    crownNumber: 1,
    lesson: {
      topicTitle: "Evaluación de Hito: Certificación Nivel A1",
      targetLanguage: "Inglés",
      level: "A1",
      vocabulary: [
        { word: "Welcome", translation: "Bienvenido", phoneticOrPronunciationGuide: "/ˈwel.kəm/", exampleSentence: "Welcome to our learning family!", exampleTranslation: "¡Bienvenido a nuestra familia de aprendizaje!" },
        { word: "Goodbye", translation: "Adiós / Hasta luego", phoneticOrPronunciationGuide: "/ɡʊdˈbaɪ/", exampleSentence: "Goodbye, see you next week!", exampleTranslation: "¡Adiós, nos vemos la próxima semana!" }
      ],
      dialogue: [
        { speaker: "Examinador", text: "Hello student! Are you ready for your Level A1 check?", translation: "¡Hola estudiante! ¿Estás listo para tu control de Nivel A1?" },
        { speaker: "Tuddy", text: "Yes, I am ready! I can greet, order food, and introduce myself.", translation: "¡Sí, estoy listo! Puedo saludar, pedir comida y presentarme." }
      ],
      listeningExercise: {
        audioText: "Welcome to London Heathrow! Please have your passport ready.",
        question: "¿Qué documento piden tener preparado?",
        options: ["El pasaporte (passport)", "El boleto del autobús", "Una taza de té", "El cuaderno de notas"],
        correctOptionIndex: 0,
        tip: "La palabra clave es 'passport'."
      },
      interactiveChallenge: {
        promptText: "Elige la frase correcta para despedirte de alguien:",
        sentenceToCompleteOrTranslate: "Goodbye, have a great day!",
        options: ["Goodbye, have a great day!", "Hello, who is that?", "Give me five chairs!", "Today is yesterday."],
        correctOptionIndex: 0,
        explanation: "'Goodbye, have a great day!' es la forma más cordial de despedirse."
      },
      pronunciationTip: "Pronuncia las vocales claras y con seguridad.",
      tuddyEncouragement: "¡CORONA 1 OBTENIDA! Has superado el Nivel A1 de principio a fin 👑🎉"
    }
  },

  // UNIDAD 2: A2 • Rutinas, Direcciones & Ciudad
  {
    id: "en-a2-1",
    nodeIndex: 5,
    type: "lesson",
    level: "A2",
    levelBadge: "Nivel A2 (Elemental)",
    unitNumber: 2,
    unitTitle: "Unidad 2: Vida Diaria, Transporte y Rutinas (A2)",
    title: "Preguntar Direcciones en la Ciudad",
    subtitle: "Aprende a ubicar calles, estaciones de metro y puntos de interés.",
    targetLanguage: "Inglés",
    langCode: "en-US",
    xOffsetPercent: getSinusoidalOffset(4),
    carrotsReward: 15,
    lesson: {
      topicTitle: "Direcciones y Transporte Urbano en Inglés",
      targetLanguage: "Inglés",
      level: "A2",
      vocabulary: [
        { word: "Turn left", translation: "Gira a la izquierda", phoneticOrPronunciationGuide: "/tɜːrn left/", exampleSentence: "Turn left at the traffic light.", exampleTranslation: "Gira a la izquierda en el semáforo." },
        { word: "Turn right", translation: "Gira a la derecha", phoneticOrPronunciationGuide: "/tɜːrn raɪt/", exampleSentence: "Turn right after the museum.", exampleTranslation: "Gira a la derecha después del museo." },
        { word: "Straight ahead", translation: "Todo recto / Derecho", phoneticOrPronunciationGuide: "/streɪt əˈhed/", exampleSentence: "Walk straight ahead for two blocks.", exampleTranslation: "Camina todo recto durante dos cuadras." },
        { word: "Train station", translation: "Estación de trenes", phoneticOrPronunciationGuide: "/treɪn ˈsteɪ.ʃən/", exampleSentence: "The train station is right across the street.", exampleTranslation: "La estación de tren está justo al cruzar la calle." }
      ],
      dialogue: [
        { speaker: "Turista", text: "Excuse me, could you tell me how to get to the subway?", translation: "Disculpe, ¿podría decirme cómo llegar al metro?" },
        { speaker: "Tuddy", text: "Sure! Walk straight ahead and turn left at the bookstore.", translation: "¡Seguro! Camine todo recto y gire a la izquierda en la librería." },
        { speaker: "Turista", text: "Thank you so much for your directions!", translation: "¡Muchas gracias por sus indicaciones!" }
      ],
      listeningExercise: {
        audioText: "Go straight ahead for two blocks, then turn right at the traffic lights.",
        question: "¿Qué debe hacer la persona según la indicación?",
        options: [
          "Caminar recto dos cuadras y luego girar a la derecha en el semáforo.",
          "Tomar un taxi de inmediato hacia el aeropuerto.",
          "Girar a la izquierda antes del puente viejo.",
          "Detenerse y esperar el tren número 4."
        ],
        correctOptionIndex: 0,
        tip: "Escucha 'straight ahead for two blocks' y 'turn right'."
      },
      readingExercise: {
        passageTitle: "Navigating the City",
        passageText: "London is famous for its Underground train network, affectionately known as the Tube. If you get lost, friendly station assistants wearing uniforms are always ready to help travelers find the correct platform.",
        question: "¿Cómo se le conoce popularmente al metro de Londres?",
        options: ["The Tube", "The Skyway", "The Green Bus", "The Ferry"],
        correctOptionIndex: 0,
        explanation: "El texto afirma que la red de metro de Londres es conocida cariñosamente como 'The Tube'."
      },
      writingExercise: {
        prompt: "Traduce al inglés: 'Gira a la izquierda'",
        expectedAnswer: "Turn left",
        alternativeAcceptable: ["turn left", "Turn left.", "turn left!"],
        hint: "Verbo 'turn' + dirección 'left'."
      },
      interactiveChallenge: {
        promptText: "Si quieres decir que algo está 'cerca de aquí', ¿qué expresión usas?",
        sentenceToCompleteOrTranslate: "It is near here / It is close by.",
        options: ["It is near here", "It is moon distance", "Never walk today", "Because it is green"],
        correctOptionIndex: 0,
        explanation: "'It is near here' o 'It is close by' son las formas naturales de indicar proximidad."
      },
      pronunciationTip: "La palabra 'Straight' rima con 'Eight' y no se pronuncia la 'gh'.",
      tuddyEncouragement: "¡Ya te mueves por la ciudad como un local en inglés! 🚇🗺️"
    }
  },
  {
    id: "en-a2-2",
    nodeIndex: 6,
    type: "story",
    level: "A2",
    levelBadge: "Nivel A2 (Elemental)",
    unitNumber: 2,
    unitTitle: "Unidad 2: Vida Diaria, Transporte y Rutinas (A2)",
    title: "Cuento: El Tren Perdido",
    subtitle: "Lectura sobre horarios, billetes y anécdotas en el andén.",
    targetLanguage: "Inglés",
    langCode: "en-US",
    xOffsetPercent: getSinusoidalOffset(5),
    carrotsReward: 16,
    lesson: {
      topicTitle: "Lectura Situacional: Aventura en la Estación",
      targetLanguage: "Inglés",
      level: "A2",
      vocabulary: [
        { word: "Platform", translation: "Andén", phoneticOrPronunciationGuide: "/ˈplæt.fɔːrm/", exampleSentence: "The train departs from platform 3.", exampleTranslation: "El tren sale del andén 3." },
        { word: "Ticket", translation: "Boleto / Billete", phoneticOrPronunciationGuide: "/ˈtɪk.ɪt/", exampleSentence: "Keep your ticket until the end of the trip.", exampleTranslation: "Conserva tu boleto hasta el final del viaje." },
        { word: "Delay", translation: "Retraso", phoneticOrPronunciationGuide: "/dɪˈleɪ/", exampleSentence: "There is a brief delay due to the rain.", exampleTranslation: "Hay un breve retraso debido a la lluvia." }
      ],
      dialogue: [
        { speaker: "Guía", text: "Attention passengers, the 10:15 express is arriving at platform 2.", translation: "Atención pasajeros, el expreso de las 10:15 está llegando al andén 2." },
        { speaker: "Tuddy", text: "Great! That is my train to Edinburgh.", translation: "¡Genial! Ese es mi tren a Edimburgo." }
      ],
      readingExercise: {
        passageTitle: "The Journey North",
        passageText: "Tuddy arrives at King's Cross station with twenty minutes to spare. He buys a hot chocolate and checks the departure monitor. His train to the Scottish capital is on time and departing from platform 9. He finds a cozy window seat.",
        question: "¿Qué compra Tuddy antes de subir al tren?",
        options: [
          "Un chocolate caliente (a hot chocolate).",
          "Un mapa de papel gigante.",
          "Una maleta nueva de cuero.",
          "Un paraguas verde."
        ],
        correctOptionIndex: 0,
        explanation: "El texto especifica con claridad: 'He buys a hot chocolate and checks the departure monitor'."
      },
      interactiveChallenge: {
        promptText: "¿Cuál es la palabra en inglés para 'andén de tren'?",
        sentenceToCompleteOrTranslate: "Platform",
        options: ["Platform", "Runway", "Kitchen", "Elevator"],
        correctOptionIndex: 0,
        explanation: "En estaciones de trenes se utiliza la palabra 'Platform'."
      },
      pronunciationTip: "Pronuncia 'Platform' marcando suavemente ambas sílabas.",
      tuddyEncouragement: "¡Qué fluidez lectora estás desarrollando! 📖🚂"
    }
  },
  {
    id: "en-a2-3",
    nodeIndex: 7,
    type: "chest",
    level: "A2",
    levelBadge: "Nivel A2 (Elemental)",
    unitNumber: 2,
    unitTitle: "Unidad 2: Vida Diaria, Transporte y Rutinas (A2)",
    title: "Cofre de Recompensas A2",
    subtitle: "¡Un cofre con 20 zanahorias para gastar en ropa para Tuddy!",
    targetLanguage: "Inglés",
    langCode: "en-US",
    xOffsetPercent: getSinusoidalOffset(6),
    carrotsReward: 20,
    chestRewardCarrots: 20,
  },
  {
    id: "en-a2-4",
    nodeIndex: 8,
    type: "checkpoint",
    level: "A2",
    levelBadge: "Nivel A2 (Elemental)",
    unitNumber: 2,
    unitTitle: "Unidad 2: Vida Diaria, Transporte y Rutinas (A2)",
    title: "Punto de Control A2: Corona de Plata",
    subtitle: "Certifica tu capacidad para comunicarte en situaciones cotidianas de viaje.",
    targetLanguage: "Inglés",
    langCode: "en-US",
    xOffsetPercent: getSinusoidalOffset(7),
    carrotsReward: 25,
    crownNumber: 2,
    lesson: {
      topicTitle: "Evaluación de Hito: Certificación Nivel A2",
      targetLanguage: "Inglés",
      level: "A2",
      vocabulary: [
        { word: "Routine", translation: "Rutina", phoneticOrPronunciationGuide: "/ruːˈtiːn/", exampleSentence: "My morning routine starts at seven o'clock.", exampleTranslation: "Mi rutina matutina empieza a las siete en punto." },
        { word: "Usually", translation: "Usualmente", phoneticOrPronunciationGuide: "/ˈjuː.ʒu.ə.li/", exampleSentence: "I usually study in the afternoon.", exampleTranslation: "Usualmente estudio por la tarde." }
      ],
      dialogue: [
        { speaker: "Examinador", text: "Tell me about your daily schedule.", translation: "Cuéntame sobre tu horario diario." },
        { speaker: "Tuddy", text: "I wake up, have breakfast, study languages, and practice listening every day.", translation: "Me despierto, desayuno, estudio idiomas y practico audición todos los días." }
      ],
      interactiveChallenge: {
        promptText: "Completa la frase: 'I usually go to sleep ___ 10 PM.'",
        sentenceToCompleteOrTranslate: "I usually go to sleep at 10 PM.",
        options: ["at", "on", "in", "by"],
        correctOptionIndex: 0,
        explanation: "Para referirse a horas específicas en inglés, siempre se utiliza la preposición 'at'."
      },
      pronunciationTip: "Recuerda la preposición 'at' para horas exactas.",
      tuddyEncouragement: "¡CORONA 2 CONSEGUIDA! El nivel A2 está oficialmente en tu bolsillo 👑🥈"
    }
  },

  // UNIDAD 3: B1 • Experiencias Pasadas, Opiniones & Planes
  {
    id: "en-b1-1",
    nodeIndex: 9,
    type: "lesson",
    level: "B1",
    levelBadge: "Nivel B1 (Intermedio)",
    unitNumber: 3,
    unitTitle: "Unidad 3: Experiencias, Opiniones y Planes Futuros (B1)",
    title: "Relatar Anécdotas en Pasado & Futuro",
    subtitle: "Usa el pasado simple, presente perfecto y formula planes futuros con 'will' y 'going to'.",
    targetLanguage: "Inglés",
    langCode: "en-US",
    xOffsetPercent: getSinusoidalOffset(8),
    carrotsReward: 18,
    lesson: {
      topicTitle: "Narración de Experiencias y Planes (B1)",
      targetLanguage: "Inglés",
      level: "B1",
      vocabulary: [
        { word: "Experience", translation: "Experiencia", phoneticOrPronunciationGuide: "/ɪkˈspɪə.ri.əns/", exampleSentence: "It was an unforgettable learning experience.", exampleTranslation: "Fue una experiencia de aprendizaje inolvidable." },
        { word: "I have visited", translation: "He visitado", phoneticOrPronunciationGuide: "/aɪ hæv ˈvɪz.ɪ.tɪd/", exampleSentence: "I have visited three different countries this year.", exampleTranslation: "He visitado tres países diferentes este año." },
        { word: "In my opinion", translation: "En mi opinión", phoneticOrPronunciationGuide: "/ɪn maɪ əˈpɪn.jən/", exampleSentence: "In my opinion, consistency is the key to fluency.", exampleTranslation: "En mi opinión, la constancia es la clave de la fluidez." },
        { word: "Looking forward to", translation: "Esperando con ilusión", phoneticOrPronunciationGuide: "/ˈlʊk.ɪŋ ˈfɔː.wəd tuː/", exampleSentence: "I am looking forward to our next flight.", exampleTranslation: "Estoy esperando con ilusión nuestro próximo vuelo." }
      ],
      dialogue: [
        { speaker: "Amigo", text: "Have you ever traveled alone to another continent?", translation: "¿Alguna vez has viajado solo a otro continente?" },
        { speaker: "Tuddy", text: "Yes! Last summer I flew across Europe. It was challenging, but I improved my conversation skills significantly.", translation: "¡Sí! El verano pasado volé por toda Europa. Fue desafiante, pero mejoré mis habilidades de conversación significativamente." }
      ],
      readingExercise: {
        passageTitle: "Reflections on Language Growth",
        passageText: "When students reach intermediate proficiency, they notice a shift: they stop translating word-for-word and begin expressing their own real emotions and opinions directly in the target language. Mistakes still happen, but communication flows naturally.",
        question: "¿Qué cambio importante ocurre al alcanzar el nivel intermedio?",
        options: [
          "Dejan de traducir palabra por palabra y expresan opiniones directamente.",
          "Memorizan el diccionario completo en una semana.",
          "Nunca vuelven a cometer ningún error gramatical.",
          "Dejan de necesitar practicar la pronunciación."
        ],
        correctOptionIndex: 0,
        explanation: "El texto destaca que los estudiantes 'stop translating word-for-word and begin expressing their own real emotions'."
      },
      interactiveChallenge: {
        promptText: "¿Cuál es la forma correcta para decir 'He vivido aquí durante dos años'?",
        sentenceToCompleteOrTranslate: "I have lived here for two years.",
        options: [
          "I have lived here for two years.",
          "I live here since two years.",
          "I was living here during two days.",
          "I am lived here before."
        ],
        correctOptionIndex: 0,
        explanation: "Con periodos de tiempo acumulado que continúan en el presente, se usa el presente perfecto con 'for': 'have lived here for two years'."
      },
      pronunciationTip: "El presente perfecto contraído suena natural: 'I've visited' en vez de 'I have visited'.",
      tuddyEncouragement: "¡Estás cruzando la frontera del nivel intermedio con maestría! 🚀🐰"
    }
  },
  {
    id: "en-b1-2",
    nodeIndex: 10,
    type: "story",
    level: "B1",
    levelBadge: "Nivel B1 (Intermedio)",
    unitNumber: 3,
    unitTitle: "Unidad 3: Experiencias, Opiniones y Planes Futuros (B1)",
    title: "Cuento: Una Entrevista de Trabajo",
    subtitle: "Comprensión de preguntas profesionales, fortalezas y metas personales.",
    targetLanguage: "Inglés",
    langCode: "en-US",
    xOffsetPercent: getSinusoidalOffset(9),
    carrotsReward: 20,
    lesson: {
      topicTitle: "Comprensión Profesional: La Entrevista",
      targetLanguage: "Inglés",
      level: "B1",
      vocabulary: [
        { word: "Strength", translation: "Fortaleza / Habilidad clave", phoneticOrPronunciationGuide: "/streŋθ/", exampleSentence: "My greatest strength is problem solving.", exampleTranslation: "Mi mayor fortaleza es resolver problemas." },
        { word: "Goal", translation: "Meta / Objetivo", phoneticOrPronunciationGuide: "/ɡoʊl/", exampleSentence: "My goal is to lead international projects.", exampleTranslation: "Mi meta es liderar proyectos internacionales." }
      ],
      dialogue: [
        { speaker: "Entrevistador", text: "What inspired you to apply for this international position?", translation: "¿Qué te inspiró a postularte a esta posición internacional?" },
        { speaker: "Tuddy", text: "I have always enjoyed teamwork and bridging communication across different cultures.", translation: "Siempre he disfrutado del trabajo en equipo y tender puentes de comunicación entre culturas." }
      ],
      interactiveChallenge: {
        promptText: "¿Cómo responderías educadamente sobre tus planes para el próximo año?",
        sentenceToCompleteOrTranslate: "I plan to expand my professional skills and study abroad.",
        options: [
          "I plan to expand my professional skills and study abroad.",
          "I will do nothing at all.",
          "Yesterday was very cold.",
          "No thanks, I don't like computers."
        ],
        correctOptionIndex: 0,
        explanation: "'I plan to expand my skills' es una respuesta estructurada y profesional en B1."
      },
      pronunciationTip: "Cuida la pronunciación de 'strength' terminando en la suave fricativa 'th'.",
      tuddyEncouragement: "¡Nivel profesional activado! Tuddy está muy orgulloso de ti 👔✨"
    }
  },
  {
    id: "en-b1-3",
    nodeIndex: 11,
    type: "chest",
    level: "B1",
    levelBadge: "Nivel B1 (Intermedio)",
    unitNumber: 3,
    unitTitle: "Unidad 3: Experiencias, Opiniones y Planes Futuros (B1)",
    title: "Cofre de Recompensas B1",
    subtitle: "¡25 zanahorias doradas te esperan en este cofre intermedio!",
    targetLanguage: "Inglés",
    langCode: "en-US",
    xOffsetPercent: getSinusoidalOffset(10),
    carrotsReward: 25,
    chestRewardCarrots: 25,
  },
  {
    id: "en-b1-4",
    nodeIndex: 12,
    type: "checkpoint",
    level: "B1",
    levelBadge: "Nivel B1 (Intermedio)",
    unitNumber: 3,
    unitTitle: "Unidad 3: Experiencias, Opiniones y Planes Futuros (B1)",
    title: "Punto de Control B1: Corona de Oro",
    subtitle: "Demuestra tu solvencia para debatir y expresarte con autonomía.",
    targetLanguage: "Inglés",
    langCode: "en-US",
    xOffsetPercent: getSinusoidalOffset(11),
    carrotsReward: 30,
    crownNumber: 3,
    lesson: {
      topicTitle: "Evaluación de Hito: Certificación Nivel B1",
      targetLanguage: "Inglés",
      level: "B1",
      vocabulary: [
        { word: "Although", translation: "Aunque / A pesar de que", phoneticOrPronunciationGuide: "/ɔːlˈðoʊ/", exampleSentence: "Although it was raining, the flight was smooth.", exampleTranslation: "Aunque estaba lloviendo, el vuelo fue suave." },
        { word: "Therefore", translation: "Por lo tanto", phoneticOrPronunciationGuide: "/ˈðer.fɔːr/", exampleSentence: "He studied daily; therefore, he passed effortlessly.", exampleTranslation: "Estudió diariamente; por lo tanto, aprobó sin esfuerzo." }
      ],
      dialogue: [
        { speaker: "Examinador", text: "Can you summarize a book or film that impacted you?", translation: "¿Puedes resumir un libro o película que te haya impactado?" },
        { speaker: "Tuddy", text: "Certainly. It depicted the journey of explorers who learned that courage means taking the first step.", translation: "Por supuesto. Retrataba el viaje de exploradores que aprendieron que el coraje significa dar el primer paso." }
      ],
      interactiveChallenge: {
        promptText: "Elige el conector que expresa contraste:",
        sentenceToCompleteOrTranslate: "She loves tea, whereas I prefer coffee.",
        options: ["whereas", "because", "so", "and"],
        correctOptionIndex: 0,
        explanation: "'Whereas' se utiliza formalmente para contrastar dos realidades distintas."
      },
      pronunciationTip: "Enlaza tus ideas usando conectores como 'However', 'Therefore' y 'Although'.",
      tuddyEncouragement: "¡CORONA 3 ALCANZADA! Has conquistado el Nivel B1, eres oficialmente autónomo 👑🥉"
    }
  },

  // UNIDAD 4: B2 • Argumentación, Debates & Matices Complejos
  {
    id: "en-b2-1",
    nodeIndex: 13,
    type: "lesson",
    level: "B2",
    levelBadge: "Nivel B2 (Intermedio Alto)",
    unitNumber: 4,
    unitTitle: "Unidad 4: Argumentación, Sociedad y Debates (B2)",
    title: "El Arte de Debatir & Argumentar",
    subtitle: "Expresa hipótesis, contrasta ventajas y desventajas, y usa modales avanzados.",
    targetLanguage: "Inglés",
    langCode: "en-US",
    xOffsetPercent: getSinusoidalOffset(12),
    carrotsReward: 22,
    lesson: {
      topicTitle: "Debate y Discurso Argumentativo (B2)",
      targetLanguage: "Inglés",
      level: "B2",
      vocabulary: [
        { word: "Furthermore", translation: "Además / Es más", phoneticOrPronunciationGuide: "/ˌfɝː.ðɚˈmɔːr/", exampleSentence: "Furthermore, renewable energy reduces long-term expenses.", exampleTranslation: "Además, la energía renovable reduce los gastos a largo plazo." },
        { word: "On the other hand", translation: "Por otra parte", phoneticOrPronunciationGuide: "/ɒn ðiː ˈʌð.ər hænd/", exampleSentence: "On the other hand, implementation requires careful planning.", exampleTranslation: "Por otra parte, la implementación requiere una planificación cuidadosa." },
        { word: "Hypothetically speaking", translation: "Hipotéticamente hablando", phoneticOrPronunciationGuide: "/ˌhaɪ.pəˈθet̬.ɪ.kli ˈspiː.kɪŋ/", exampleSentence: "Hypothetically speaking, what would you change?", exampleTranslation: "Hipotéticamente hablando, ¿qué cambiarías?" }
      ],
      dialogue: [
        { speaker: "Moderador", text: "What is your stance regarding remote work versus office culture?", translation: "¿Cuál es tu postura respecto al trabajo remoto frente a la cultura de oficina?" },
        { speaker: "Tuddy", text: "While remote flexibility boosts productivity, face-to-face synergy remains vital for creative brainstorming.", translation: "Si bien la flexibilidad remota aumenta la productividad, la sinergia presencial sigue siendo vital para la lluvia de ideas creativas." }
      ],
      readingExercise: {
        passageTitle: "The Future of Global Collaboration",
        passageText: "Modern industries operate in a truly interconnected ecosystem. Fluency at the B2 level is no longer about just translating sentences; it is about grasping cultural etiquette, reading between the lines, and negotiating win-win outcomes with international partners.",
        question: "¿Qué implica la verdadera fluidez en B2 según el texto?",
        options: [
          "Entender la etiqueta cultural, leer entre líneas y negociar con socios internacionales.",
          "Solo saber traducir oraciones simples sin errores de ortografía.",
          "Aprender a programar computadoras en lugar de hablar.",
          "Vivir permanentemente en un país de habla inglesa."
        ],
        correctOptionIndex: 0,
        explanation: "El texto enfatiza 'grasping cultural etiquette, reading between the lines, and negotiating win-win outcomes'."
      },
      interactiveChallenge: {
        promptText: "Completa la estructura de tercer condicional: 'If we had known earlier, we ___ differently.'",
        sentenceToCompleteOrTranslate: "If we had known earlier, we would have acted differently.",
        options: [
          "would have acted",
          "will act",
          "are acting",
          "had act"
        ],
        correctOptionIndex: 0,
        explanation: "El tercer condicional para situaciones irreales del pasado requiere 'would have' + participio pasado."
      },
      pronunciationTip: "En debates formales, baja el tono al final de oraciones concluyentes para proyectar autoridad.",
      tuddyEncouragement: "¡Qué nivel de pensamiento crítico en inglés! Impresionante 🎓⚡"
    }
  },
  {
    id: "en-b2-2",
    nodeIndex: 14,
    type: "story",
    level: "B2",
    levelBadge: "Nivel B2 (Intermedio Alto)",
    unitNumber: 4,
    unitTitle: "Unidad 4: Argumentación, Sociedad y Debates (B2)",
    title: "Cuento: El Gran Simposio Científico",
    subtitle: "Comprensión de conferencias especializadas e intercambio de ideas.",
    targetLanguage: "Inglés",
    langCode: "en-US",
    xOffsetPercent: getSinusoidalOffset(13),
    carrotsReward: 25,
    lesson: {
      topicTitle: "Comprensión Académica: El Simposio",
      targetLanguage: "Inglés",
      level: "B2",
      vocabulary: [
        { word: "Breakthrough", translation: "Avance crucial / Hito innovador", phoneticOrPronunciationGuide: "/ˈbreɪk.θruː/", exampleSentence: "This discovery marks a scientific breakthrough.", exampleTranslation: "Este descubrimiento marca un hito científico." },
        { word: "Sustainable", translation: "Sostenible", phoneticOrPronunciationGuide: "/səˈsteɪ.nə.bəl/", exampleSentence: "We must adopt sustainable practices immediately.", exampleTranslation: "Debemos adoptar prácticas sostenibles inmediatamente." }
      ],
      dialogue: [
        { speaker: "Dra. Evans", text: "Your hypothesis regarding aerodynamic efficiency was thoroughly proven.", translation: "Su hipótesis sobre la eficiencia aerodinámica fue exhaustivamente probada." },
        { speaker: "Tuddy", text: "Thank you, Dr. Evans! Continuous iteration yielded optimal results.", translation: "¡Gracias, Dra. Evans! La iteración continua produjo resultados óptimos." }
      ],
      interactiveChallenge: {
        promptText: "¿Cuál es el sinónimo más adecuado para 'un avance transformador' en inglés?",
        sentenceToCompleteOrTranslate: "A breakthrough",
        options: ["A breakthrough", "A standstill", "A backstep", "A silence"],
        correctOptionIndex: 0,
        explanation: "'Breakthrough' denota un descubrimiento o logro revolucionario."
      },
      pronunciationTip: "Cuida el acento en 'Breakthrough' en la primera sílaba.",
      tuddyEncouragement: "¡Estás razonando en inglés a nivel universitario! 🔬✨"
    }
  },
  {
    id: "en-b2-3",
    nodeIndex: 15,
    type: "chest",
    level: "B2",
    levelBadge: "Nivel B2 (Intermedio Alto)",
    unitNumber: 4,
    unitTitle: "Unidad 4: Argumentación, Sociedad y Debates (B2)",
    title: "Cofre de Recompensas B2",
    subtitle: "¡35 zanahorias para celebrar tu dominio del Nivel B2!",
    targetLanguage: "Inglés",
    langCode: "en-US",
    xOffsetPercent: getSinusoidalOffset(14),
    carrotsReward: 35,
    chestRewardCarrots: 35,
  },
  {
    id: "en-b2-4",
    nodeIndex: 16,
    type: "checkpoint",
    level: "B2",
    levelBadge: "Nivel B2 (Intermedio Alto)",
    unitNumber: 4,
    unitTitle: "Unidad 4: Argumentación, Sociedad y Debates (B2)",
    title: "Punto de Control B2: Corona de Platino",
    subtitle: "Evaluación avanzada de B2 previa al salto definitivo a la maestría C1.",
    targetLanguage: "Inglés",
    langCode: "en-US",
    xOffsetPercent: getSinusoidalOffset(15),
    carrotsReward: 35,
    crownNumber: 4,
    lesson: {
      topicTitle: "Evaluación de Hito: Certificación Nivel B2",
      targetLanguage: "Inglés",
      level: "B2",
      vocabulary: [
        { word: "In essence", translation: "En esencia", phoneticOrPronunciationGuide: "/ɪn ˈes.əns/", exampleSentence: "In essence, dedication outshines raw talent.", exampleTranslation: "En esencia, la dedicación supera al talento bruto." },
        { word: "Unprecedented", translation: "Sin precedentes", phoneticOrPronunciationGuide: "/ʌnˈpres.ə.den.tɪd/", exampleSentence: "We are witnessing unprecedented progress.", exampleTranslation: "Estamos presenciando un progreso sin precedentes." }
      ],
      dialogue: [
        { speaker: "Comité C1", text: "Candidate Tuddy, demonstrate how you navigate complex diplomatic discussions.", translation: "Candidato Tuddy, demuestre cómo navega debates diplomáticos complejos." },
        { speaker: "Tuddy", text: "By acknowledging counterarguments respectfully while underpinning conclusions with empirical evidence.", translation: "Reconociendo los contraargumentos con respeto mientras respaldo conclusiones con evidencia empírica." }
      ],
      interactiveChallenge: {
        promptText: "Identifica la inversión formal correcta en inglés:",
        sentenceToCompleteOrTranslate: "Rarely have I seen such dedication.",
        options: [
          "Rarely have I seen such dedication.",
          "Rarely I have seen such dedication.",
          "I rarely had seeing such dedication.",
          "Seen I have rarely such dedication."
        ],
        correctOptionIndex: 0,
        explanation: "Con adverbios restrictivos como 'Rarely', el inglés formal invierte el auxiliar y el sujeto: 'Rarely have I seen'."
      },
      pronunciationTip: "La inversión formal 'Rarely have I...' eleva de inmediato el registro estilístico.",
      tuddyEncouragement: "¡CORONA 4 CONQUISTADA! El umbral de la maestría C1 está abierto ante ti 👑💎"
    }
  },

  // UNIDAD 5: C1 • Dominio Operativo Eficaz & Fluidez Nativa
  {
    id: "en-c1-1",
    nodeIndex: 17,
    type: "lesson",
    level: "C1",
    levelBadge: "Nivel C1 (Avanzado / Maestría)",
    unitNumber: 5,
    unitTitle: "Unidad 5: Dominio Operativo Eficaz & Sutilezas Nativas (C1)",
    title: "Modismos Avanzados, Ironía & Metáforas",
    subtitle: "Domina frases idiomáticas complejas, dobles sentidos y sutilezas retóricas.",
    targetLanguage: "Inglés",
    langCode: "en-US",
    xOffsetPercent: getSinusoidalOffset(16),
    carrotsReward: 30,
    lesson: {
      topicTitle: "Retórica y Modismos Avanzados (C1)",
      targetLanguage: "Inglés",
      level: "C1",
      vocabulary: [
        { word: "Beat around the bush", translation: "Andarse por las ramas / Evadir el tema", phoneticOrPronunciationGuide: "/biːt əˈraʊnd ðə bʊʃ/", exampleSentence: "Stop beating around the bush and state your genuine point.", exampleTranslation: "Deja de andarte por las ramas y expón tu punto genuino." },
        { word: "Bite the bullet", translation: "Hacer de tripas corazón / Afrontar lo inevitable", phoneticOrPronunciationGuide: "/baɪt ðə ˈbʊl.ɪt/", exampleSentence: "I had to bite the bullet and rewrite the dissertation from scratch.", exampleTranslation: "Tuve que hacer de tripas corazón y reescribir la tesis desde cero." },
        { word: "Silver lining", translation: "Lado positivo de una adversidad", phoneticOrPronunciationGuide: "/ˈsɪl.vər ˈlaɪ.nɪŋ/", exampleSentence: "Every setback carries a silver lining if you remain observant.", exampleTranslation: "Cada contratiempo tiene un lado positivo si te mantienes observador." }
      ],
      dialogue: [
        { speaker: "Profesor Emérito", text: "Would you argue that literature merely mirrors reality, or actively sculpts societal paradigms?", translation: "¿Sostendría usted que la literatura meramente refleja la realidad, o esculpe activamente los paradigmas sociales?" },
        { speaker: "Tuddy", text: "Without question, it functions as a catalyst. Authors don't simply document human nature; they challenge prevailing conventions.", translation: "Sin duda, funciona como un catalizador. Los autores no se limitan a documentar la naturaleza humana; desafían las convenciones imperantes." }
      ],
      readingExercise: {
        passageTitle: "The Nuance of English Irony",
        passageText: "In high-register British discourse, understatement is the ultimate currency. When someone remarks that a catastrophic storm was 'a bit damp', they aren't failing to perceive danger; rather, they are employing dry wit to demonstrate composure under pressure. Mastering this pragmatic subtlety is the hallmark of true C1 fluency.",
        question: "¿Qué revela el uso del 'understatement' (atenuación irónica) en la cultura británica?",
        options: [
          "Una demostración de compostura y serenidad ante la presión a través del humor sutil.",
          "Una falta de vocabulario para describir tormentas reales.",
          "Un malentendido literal de las condiciones meteorológicas.",
          "Una regla estricta que solo se aplica a niños en edad escolar."
        ],
        correctOptionIndex: 0,
        explanation: "El texto afirma que la atenuación ('understatement') se usa para 'demonstrate composure under pressure' mediante 'dry wit'."
      },
      interactiveChallenge: {
        promptText: "¿Qué significa el modismo nativo: 'Burn the midnight oil'?",
        sentenceToCompleteOrTranslate: "To study or work tirelessly late into the night.",
        options: [
          "Trabajar o estudiar incansablemente hasta altas horas de la noche.",
          "Encender una fogata de campamento en el bosque.",
          "Cocinar una cena con demasiado aceite vegetal.",
          "Despertar tarde en la mañana de un domingo."
        ],
        correctOptionIndex: 0,
        explanation: "'Burn the midnight oil' es una expresión clásica para describir a alguien que se trasnocha estudiando o trabajando."
      },
      pronunciationTip: "El ritmo del habla en C1 utiliza 'connected speech' y silencios estratégicos.",
      tuddyEncouragement: "¡Tu inglés tiene una riqueza y profundidad asombrosas! 🎩🌟"
    }
  },
  {
    id: "en-c1-2",
    nodeIndex: 18,
    type: "story",
    level: "C1",
    levelBadge: "Nivel C1 (Avanzado / Maestría)",
    unitNumber: 5,
    unitTitle: "Unidad 5: Dominio Operativo Eficaz & Sutilezas Nativas (C1)",
    title: "Cuento: La Conferencia de la Real Sociedad",
    subtitle: "Oratoria de alto impacto y defensa de tesis ante un jurado internacional.",
    targetLanguage: "Inglés",
    langCode: "en-US",
    xOffsetPercent: getSinusoidalOffset(17),
    carrotsReward: 35,
    lesson: {
      topicTitle: "Discurso Magistral: La Real Sociedad",
      targetLanguage: "Inglés",
      level: "C1",
      vocabulary: [
        { word: "Eloquent", translation: "Elocuente", phoneticOrPronunciationGuide: "/ˈel.ə.kwənt/", exampleSentence: "Her keynote address was remarkably eloquent.", exampleTranslation: "Su discurso de apertura fue notablemente elocuente." },
        { word: "Paradigm shift", translation: "Cambio de paradigma", phoneticOrPronunciationGuide: "/ˈpær.ə.daɪm ʃɪft/", exampleSentence: "We are undergoing a genuine paradigm shift.", exampleTranslation: "Estamos experimentando un verdadero cambio de paradigma." }
      ],
      dialogue: [
        { speaker: "Decano", text: "Your philosophical defense left the entire auditorium captivated, Tuddy.", translation: "Tu defensa filosófica dejó cautivado a todo el auditorio, Tuddy." },
        { speaker: "Tuddy", text: "True eloquence stems from clarity of conviction and authentic intellectual curiosity.", translation: "La verdadera elocuencia nace de la claridad de convicciones y la auténtica curiosidad intelectual." }
      ],
      interactiveChallenge: {
        promptText: "¿Qué término formal describe una 'contradicción aparente que encierra una verdad profunda'?",
        sentenceToCompleteOrTranslate: "A paradox",
        options: ["A paradox", "A typo", "A blunder", "A rumor"],
        correctOptionIndex: 0,
        explanation: "'A paradox' es la figura retórica que encierra una verdad mediante una aparente contradicción."
      },
      pronunciationTip: "Domina la modulación de voz para mantener la atención del oyente.",
      tuddyEncouragement: "¡Qué brillante elocuencia! Estás a un solo paso de la cúspide 👑🔥"
    }
  },
  {
    id: "en-c1-3",
    nodeIndex: 19,
    type: "chest",
    level: "C1",
    levelBadge: "Nivel C1 (Avanzado / Maestría)",
    unitNumber: 5,
    unitTitle: "Unidad 5: Dominio Operativo Eficaz & Sutilezas Nativas (C1)",
    title: "Gran Cofre Mítico C1",
    subtitle: "¡Un botín legendario de 50 zanahorias para los grandes maestros de la lengua!",
    targetLanguage: "Inglés",
    langCode: "en-US",
    xOffsetPercent: getSinusoidalOffset(18),
    carrotsReward: 50,
    chestRewardCarrots: 50,
  },
  {
    id: "en-c1-4",
    nodeIndex: 20,
    type: "checkpoint",
    level: "C1",
    levelBadge: "Nivel C1 (Avanzado / Maestría)",
    unitNumber: 5,
    unitTitle: "Unidad 5: Dominio Operativo Eficaz & Sutilezas Nativas (C1)",
    title: "Gran Hito Final C1: Corona de Maestría Suprema",
    subtitle: "¡La prueba cumbre del idioma! Certifica tu dominio fluido de principio a fin.",
    targetLanguage: "Inglés",
    langCode: "en-US",
    xOffsetPercent: getSinusoidalOffset(19),
    carrotsReward: 60,
    crownNumber: 5,
    lesson: {
      topicTitle: "Gran Examen de Maestría C1 (Fluidez Total)",
      targetLanguage: "Inglés",
      level: "C1",
      vocabulary: [
        { word: "Mastery", translation: "Maestría / Dominio total", phoneticOrPronunciationGuide: "/ˈmæs.tɚ.i/", exampleSentence: "Language mastery is a lifelong journey of wonder.", exampleTranslation: "La maestría del idioma es un viaje de asombro para toda la vida." },
        { word: "Impeccable", translation: "Impecable", phoneticOrPronunciationGuide: "/ɪmˈpek.ə.bəl/", exampleSentence: "Your articulation and phrasing are impeccable.", exampleTranslation: "Tu articulación y fraseo son impecables." }
      ],
      dialogue: [
        { speaker: "Tribunal Supremo de Idiomas", text: "From your humble A1 greetings in Heathrow to your nuanced philosophical thesis at C1, your trajectory has been exceptional.", translation: "Desde tus humildes saludos de A1 en Heathrow hasta tu matizada tesis filosófica en C1, tu trayectoria ha sido excepcional." },
        { speaker: "Tuddy", text: "Thank you! With steady discipline and Tuddy's guidance, any student can bridge the gap from zero to total fluency.", translation: "¡Gracias! Con disciplina constante y la guía de Tuddy, cualquier estudiante puede acortar la distancia desde cero hasta la fluidez total." }
      ],
      interactiveChallenge: {
        promptText: "¿Cuál es la expresión idiomática más refinada para decir 'lograr algo con gran éxito y distinción'?",
        sentenceToCompleteOrTranslate: "To pass with flying colors",
        options: [
          "To pass with flying colors",
          "To fall out of bed",
          "To jump in the puddle",
          "To lose one's glasses"
        ],
        correctOptionIndex: 0,
        explanation: "'To pass with flying colors' es la expresión idiomática por excelencia para celebrar un éxito rotundo y brillante."
      },
      pronunciationTip: "Habla con la calma y naturalidad de quien piensa directamente en el idioma.",
      tuddyEncouragement: "¡LO HAZ LOGRADO! ¡CORONA SUPREMA C1 CONQUISTADA DE PRINCIPIO A FIN! 🐰👑✈️🎉"
    }
  }
];

// ==========================================
// 🇫🇷 FRANCÉS (A1 ➔ C1)
// ==========================================
export const FRENCH_CURRICULUM: CampaignPathNode[] = ENGLISH_CURRICULUM.map((node, idx) => {
  if (node.level === "A1") {
    return {
      ...node,
      id: `fr-a1-${node.nodeIndex}`,
      targetLanguage: "Francés",
      langCode: "fr-FR",
      unitTitle: "Unité 1 : Fondations et Premières Salutations (A1)",
      title: node.type === "chest" ? "Coffre aux Trésors A1" : node.type === "checkpoint" ? "Point de Contrôle A1 : Couronne Débutant" : node.type === "story" ? "Histoire : Au Café Parisien" : "Premières Salutations & Politesse",
      subtitle: "Apprends à te présenter, dire 'Bonjour' et commander avec élégance.",
      lesson: node.lesson ? {
        ...node.lesson,
        topicTitle: "Salutations et Politesse en Français (A1)",
        targetLanguage: "Francés",
        vocabulary: [
          { word: "Bonjour", translation: "Buenos días / Hola", phoneticOrPronunciationGuide: "/bɔ̃.ʒuʁ/", exampleSentence: "Bonjour, comment allez-vous ?", exampleTranslation: "Buenos días, ¿cómo está usted?" },
          { word: "S'il vous plaît", translation: "Por favor", phoneticOrPronunciationGuide: "/sil vu plɛ/", exampleSentence: "Un café au lait, s'il vous plaît.", exampleTranslation: "Un café con leche, por favor." },
          { word: "Merci beaucoup", translation: "Muchas gracias", phoneticOrPronunciationGuide: "/mɛʁ.si bo.ku/", exampleSentence: "Merci beaucoup pour votre aide !", exampleTranslation: "¡Muchas gracias por su ayuda!" },
          { word: "Je m'appelle...", translation: "Me llamo...", phoneticOrPronunciationGuide: "/ʒə ma.pɛl/", exampleSentence: "Je m'appelle Tuddy et j'apprends le français.", exampleTranslation: "Me llamo Tuddy y estoy aprendiendo francés." }
        ],
        interactiveChallenge: {
          promptText: "¿Cuál es la forma más educada de decir 'Por favor' en francés formal?",
          sentenceToCompleteOrTranslate: "S'il vous plaît",
          options: ["S'il vous plaît", "Au revoir jamais", "Donne-moi tout", "La table verte"],
          correctOptionIndex: 0,
          explanation: "'S'il vous plaît' es la fórmula universal y respetuosa de cortesía en francés."
        },
        tuddyEncouragement: "¡Magnifique! Tu primer paso hacia el C1 en francés 🐰🥐"
      } : undefined
    };
  } else if (node.level === "A2") {
    return {
      ...node,
      id: `fr-a2-${node.nodeIndex}`,
      targetLanguage: "Francés",
      langCode: "fr-FR",
      unitTitle: "Unité 2 : Vie Quotidienne, Métro et Déplacements (A2)",
      title: node.type === "chest" ? "Coffre aux Trésors A2" : node.type === "checkpoint" ? "Point de Contrôle A2 : Couronne d'Argent" : node.type === "story" ? "Histoire : Promenade à Montmartre" : "Demander son Chemin dans Paris",
      subtitle: "Navigue dans le métro, commande au restaurant et raconte ta journée.",
    };
  } else if (node.level === "B1") {
    return {
      ...node,
      id: `fr-b1-${node.nodeIndex}`,
      targetLanguage: "Francés",
      langCode: "fr-FR",
      unitTitle: "Unité 3 : Expériences, Projets et Opinions (B1)",
      title: node.type === "chest" ? "Coffre aux Trésors B1" : node.type === "checkpoint" ? "Point de Contrôle B1 : Couronne d'Or" : node.type === "story" ? "Histoire : Le Voyage en Train TGV" : "Raconter des Souvenirs & Projets",
      subtitle: "Utilise le passé composé, l'imparfait et exprime tes goûts avec assurance.",
    };
  } else if (node.level === "B2") {
    return {
      ...node,
      id: `fr-b2-${node.nodeIndex}`,
      targetLanguage: "Francés",
      langCode: "fr-FR",
      unitTitle: "Unité 4 : Débats de Société et Argumentation (B2)",
      title: node.type === "chest" ? "Coffre aux Trésors B2" : node.type === "checkpoint" ? "Point de Contrôle B2 : Couronne de Platine" : node.type === "story" ? "Histoire : Le Débat Culturel" : "L'Art de l'Argumentation",
      subtitle: "Subjonctif, nuances stylistiques et débats d'actualité.",
    };
  } else {
    return {
      ...node,
      id: `fr-c1-${node.nodeIndex}`,
      targetLanguage: "Francés",
      langCode: "fr-FR",
      unitTitle: "Unité 5 : Maîtrise et Finesse Rhétorique (C1)",
      title: node.type === "chest" ? "Grand Coffre Mythique C1" : node.type === "checkpoint" ? "Couronne Suprême de Maîtrise C1" : node.type === "story" ? "Histoire : La Conférence Littéraire" : "Expressions Idiomatiques & Rhétorique",
      subtitle: "Éloquence suprême, figures de style et fluidité totale de A1 à C1.",
    };
  }
});

// ==========================================
// 🇩🇪 ALEMÁN (A1 ➔ C1)
// ==========================================
export const GERMAN_CURRICULUM: CampaignPathNode[] = ENGLISH_CURRICULUM.map((node) => {
  const isA1 = node.level === "A1";
  const isA2 = node.level === "A2";
  const isB1 = node.level === "B1";
  const isB2 = node.level === "B2";
  const levelPrefix = isA1 ? "de-a1" : isA2 ? "de-a2" : isB1 ? "de-b1" : isB2 ? "de-b2" : "de-c1";

  return {
    ...node,
    id: `${levelPrefix}-${node.nodeIndex}`,
    targetLanguage: "Alemán",
    langCode: "de-DE",
    unitTitle: isA1
      ? "Einheit 1: Grundlagen und Erste Begrüßungen (A1)"
      : isA2
      ? "Einheit 2: Alltag, Reisen und Orientierung (A2)"
      : isB1
      ? "Einheit 3: Erfahrungen und Zukunftspläne (B1)"
      : isB2
      ? "Einheit 4: Diskussionen und Gesellschaft (B2)"
      : "Einheit 5: Meisterschaft und Sprachbeherrschung (C1)",
    title: node.type === "chest"
      ? `Belohnungstruhe ${node.level}`
      : node.type === "checkpoint"
      ? `Prüfung ${node.level}: Krone ${node.crownNumber}`
      : node.type === "story"
      ? `Lesegeschichte (${node.level})`
      : `Lektion: Deutsch ${node.level}`,
    subtitle: isA1
      ? "Lerne dich vorzustellen, 'Guten Tag' zu sagen und die Grundlagen."
      : isA2
      ? "Orientierung in der Stadt, Pünktlichkeit und alltägliche Dialoge."
      : isB1
      ? "Erfahrungen schildern, Perfekt & Präteritum sicher anwenden."
      : isB2
      ? "Komplexe Themen debattieren und Meinungen präzise begründen."
      : "Meisterschaft in deutscher Rhetorik und idiomatischen Feinheiten.",
  };
});

// ==========================================
// 🇯🇵 JAPONÉS (A1 ➔ C1)
// ==========================================
export const JAPANESE_CURRICULUM: CampaignPathNode[] = ENGLISH_CURRICULUM.map((node) => {
  const isA1 = node.level === "A1";
  const isA2 = node.level === "A2";
  const isB1 = node.level === "B1";
  const isB2 = node.level === "B2";
  const levelPrefix = isA1 ? "ja-a1" : isA2 ? "ja-a2" : isB1 ? "ja-b1" : isB2 ? "ja-b2" : "ja-c1";

  return {
    ...node,
    id: `${levelPrefix}-${node.nodeIndex}`,
    targetLanguage: "Japonés",
    langCode: "ja-JP",
    unitTitle: isA1
      ? "第1課: 初めての挨拶と基本表現 (A1)"
      : isA2
      ? "第2課: 日常会話と駅での案内 (A2)"
      : isB1
      ? "第3課: 経験と将来の計画 (B1)"
      : isB2
      ? "第4課: 社会的な議論と丁寧語 (B2)"
      : "第5課: 日本語の達人・最高峰 (C1)",
    title: node.type === "chest"
      ? `宝箱 ${node.level} (Cofre de Zanahorias)`
      : node.type === "checkpoint"
      ? `合格関門 ${node.level}: 冠の印 ${node.crownNumber}`
      : node.type === "story"
      ? `物語読解 (${node.level})`
      : `日本語レッスン (${node.level})`,
    subtitle: isA1
      ? "Konnichiwa, Hajimemashite y fórmulas de cortesía esenciales."
      : isA2
      ? "Desplazarse en tren shinkansen, pedir en restaurantes y compras."
      : isB1
      ? "Formas Te, Ta, Nai y expresión de sentimientos y opiniones."
      : isB2
      ? "Keigo (lenguaje honorífico) y debates de actualidad."
      : "Fluidez nativa, expresiones idiomáticas y matices de sutileza japonesa.",
  };
});

// ==========================================
// 🇮🇹 ITALIANO (A1 ➔ C1)
// ==========================================
export const ITALIAN_CURRICULUM: CampaignPathNode[] = ENGLISH_CURRICULUM.map((node) => {
  const isA1 = node.level === "A1";
  const isA2 = node.level === "A2";
  const isB1 = node.level === "B1";
  const isB2 = node.level === "B2";
  const levelPrefix = isA1 ? "it-a1" : isA2 ? "it-a2" : isB1 ? "it-b1" : isB2 ? "it-b2" : "it-c1";

  return {
    ...node,
    id: `${levelPrefix}-${node.nodeIndex}`,
    targetLanguage: "Italiano",
    langCode: "it-IT",
    unitTitle: isA1
      ? "Unità 1: Saluti Fondamentali e Cortesia (A1)"
      : isA2
      ? "Unità 2: Vita Quotidiana e Viaggio (A2)"
      : isB1
      ? "Unità 3: Esperienze e Racconti (B1)"
      : isB2
      ? "Unità 4: Dibattiti e Cultura (B2)"
      : "Unità 5: Padronanza Suprema e Retorica (C1)",
    title: node.type === "chest"
      ? `Forziere dei Premi ${node.level}`
      : node.type === "checkpoint"
      ? `Traguardo ${node.level}: Corona ${node.crownNumber}`
      : node.type === "story"
      ? `Storia di Lettura (${node.level})`
      : `Lezione d'Italiano (${node.level})`,
    subtitle: isA1
      ? "Ciao, buongiorno, piacere di conoscerti e le basi della lingua."
      : isA2
      ? "Orientamento, trattoria italiana e routine quotidiana."
      : isB1
      ? "Passato prossimo, imperfetto ed espressione di gusti personali."
      : isB2
      ? "Congiuntivo, dibattiti sociali e sfumature culturali."
      : "Piena padronanza, eleganza stilistica e modi di dire autentici.",
  };
});

// ==========================================
// 🇧🇷 PORTUGUÉS (A1 ➔ C1)
// ==========================================
export const PORTUGUESE_CURRICULUM: CampaignPathNode[] = ENGLISH_CURRICULUM.map((node) => {
  const isA1 = node.level === "A1";
  const isA2 = node.level === "A2";
  const isB1 = node.level === "B1";
  const isB2 = node.level === "B2";
  const levelPrefix = isA1 ? "pt-a1" : isA2 ? "pt-a2" : isB1 ? "pt-b1" : isB2 ? "pt-b2" : "pt-c1";

  return {
    ...node,
    id: `${levelPrefix}-${node.nodeIndex}`,
    targetLanguage: "Portugués",
    langCode: "pt-BR",
    unitTitle: isA1
      ? "Unidade 1: Primeiros Passos e Saudações (A1)"
      : isA2
      ? "Unidade 2: Cotidiano e Direções na Cidade (A2)"
      : isB1
      ? "Unidade 3: Experiências e Planos Futuros (B1)"
      : isB2
      ? "Unidade 4: Debates e Sociedade (B2)"
      : "Unidade 5: Fluência Total e Maestria (C1)",
    title: node.type === "chest"
      ? `Baú de Recompensas ${node.level}`
      : node.type === "checkpoint"
      ? `Ponto de Controle ${node.level}: Coroa ${node.crownNumber}`
      : node.type === "story"
      ? `História e Leitura (${node.level})`
      : `Lição de Português (${node.level})`,
    subtitle: isA1
      ? "Olá, tudo bem? Apresentações e palavras gentis de cortesia."
      : isA2
      ? "Transporte, pedidos em padarias e rotinas no Rio de Janeiro."
      : isB1
      ? "Pretérito perfeito e imperfeito, memórias e viagens."
      : isB2
      ? "Expressões de opinião, subjuntivo e temas contemporâneos."
      : "Fluência nativa, gírias culturais e domínio do A1 ao C1.",
  };
});

// Helper for Pro languages curriculum generation
const createLanguageCurriculum = (
  targetLanguage: string,
  langCode: string,
  prefix: string,
  unitTitles: [string, string, string, string, string],
  subtitles: [string, string, string, string, string],
  lessonWord: string
): CampaignPathNode[] => {
  return ENGLISH_CURRICULUM.map((node) => {
    const isA1 = node.level === "A1";
    const isA2 = node.level === "A2";
    const isB1 = node.level === "B1";
    const isB2 = node.level === "B2";
    const levelPrefix = isA1 ? `${prefix}-a1` : isA2 ? `${prefix}-a2` : isB1 ? `${prefix}-b1` : isB2 ? `${prefix}-b2` : `${prefix}-c1`;
    const unitIdx = isA1 ? 0 : isA2 ? 1 : isB1 ? 2 : isB2 ? 3 : 4;

    return {
      ...node,
      id: `${levelPrefix}-${node.nodeIndex}`,
      targetLanguage,
      langCode,
      unitTitle: unitTitles[unitIdx],
      title: node.type === "chest"
        ? `Cofre de Zanahorias ${node.level} (${targetLanguage})`
        : node.type === "checkpoint"
        ? `Punto de Control ${node.level}: Corona ${node.crownNumber}`
        : node.type === "story"
        ? `Historia Cultural (${node.level})`
        : `${lessonWord} (${node.level})`,
      subtitle: subtitles[unitIdx],
    };
  });
};

// ==========================================
// 10 IDIOMAS PRO EXCLUSIVOS 👑
// ==========================================
export const KOREAN_CURRICULUM = createLanguageCurriculum(
  "Coreano",
  "ko-KR",
  "ko",
  [
    "Unidad 1: Hangeul y Saludos Básicos (A1)",
    "Unidad 2: Vida Diaria en Seúl y Comida (A2)",
    "Unidad 3: Conversaciones y K-Dramas (B1)",
    "Unidad 4: Honoríficos y Sociedad Coreana (B2)",
    "Unidad 5: Maestría Lingüística y Fluidez Nativa (C1)",
  ],
  [
    "Annyeonghaseyo, lectura de caracteres Hangeul y presentaciones.",
    "Pedir en restaurantes de Hongdae, transporte en metro y compras.",
    "Formas verbales intermedias, expresar emociones y planes.",
    "Lenguaje formal jondaenmal, debates y expresiones complejas.",
    "Dichos tradicionales, fluidez absoluta de A1 a C1.",
  ],
  "Lección de Coreano"
);

export const CHINESE_CURRICULUM = createLanguageCurriculum(
  "Chino Mandarín",
  "zh-CN",
  "zh",
  [
    "Unidad 1: Pinyin, Tonos y Primeros Saludos (A1)",
    "Unidad 2: Rutina en Pekín y Caracteres Hanzi (A2)",
    "Unidad 3: Negocios y Viajes por China (B1)",
    "Unidad 4: Estructuras Gramaticales y Cultura (B2)",
    "Unidad 5: Proverbios Chengyu y Fluidez Total (C1)",
  ],
  [
    "Nǐ hǎo, domina los 4 tonos y los primeros radicales.",
    "Pedir té, regatear en mercados y decir direcciones.",
    "Estructuras gramaticales intermedias (Bǎ, Bèi) y citas.",
    "Artículos periodísticos, debates y vocabulario profesional.",
    "Sabiduría clásica china y dominio completo de A1 a C1.",
  ],
  "Lección de Chino Mandarín"
);

export const RUSSIAN_CURRICULUM = createLanguageCurriculum(
  "Ruso",
  "ru-RU",
  "ru",
  [
    "Unidad 1: Alfabeto Cirílico y Saludos (A1)",
    "Unidad 2: La Ciudad, Clima y Rutinas (A2)",
    "Unidad 3: Los Casos Rusos y Experiencias (B1)",
    "Unidad 4: Verbos de Movimiento y Literatura (B2)",
    "Unidad 5: Maestría en San Petersburgo (C1)",
  ],
  [
    "Privet, Zdravstvuyte, lectura fluida del cirílico y cortesía.",
    "Moverse en Moscú, cafeterías y descripciones cotidianas.",
    "Genitivo, dativo, acusativo y preposicional sin miedo.",
    "Verbos prefijados, matices poéticos y debates de actualidad.",
    "Fluidez avanzada, soltura oratoria y perfección gramatical.",
  ],
  "Lección de Ruso"
);

export const ARABIC_CURRICULUM = createLanguageCurriculum(
  "Árabe",
  "ar-SA",
  "ar",
  [
    "Unidad 1: Caligrafía Árabe y Saludos de Paz (A1)",
    "Unidad 2: Mercado Zoco y Hospitalidad (A2)",
    "Unidad 3: Historias, Familia y Tradición (B1)",
    "Unidad 4: Árabe Estándar Moderno (Fus'ha) (B2)",
    "Unidad 5: Elocuencia y Poesía Árabe (C1)",
  ],
  [
    "Marhaban, As-salamu alaykum y trazos de las 28 letras.",
    "Hospitalidad tradicional, regateo y orientación urbana.",
    "Raíces trilíteras, tiempos verbales y ricas narraciones.",
    "Medios de comunicación árabes, ensayos y debates formales.",
    "Riqueza léxica suprema y dominio completo de A1 a C1.",
  ],
  "Lección de Árabe"
);

export const DUTCH_CURRICULUM = createLanguageCurriculum(
  "Holandés",
  "nl-NL",
  "nl",
  [
    "Unidad 1: Saludos en Ámsterdam y Pronunciación (A1)",
    "Unidad 2: En Bicicleta por los Canales (A2)",
    "Unidad 3: Trabajo y Cultura 'Gezellig' (B1)",
    "Unidad 4: Gramática Holandesa Avanzada (B2)",
    "Unidad 5: Maestría Lingüística Neerlandesa (C1)",
  ],
  [
    "Hallo, goedemorgen, presentaciones y la famosa pronunciación 'g'.",
    "Comprar flores, pedir en cafeterías y viajar en tren.",
    "Conversaciones fluidas, vida laboral y bienestar.",
    "Inversión de oraciones, expresiones modales y debates.",
    "Dominio nativo holandés de principio a fin.",
  ],
  "Lección de Holandés"
);

export const SWEDISH_CURRICULUM = createLanguageCurriculum(
  "Sueco",
  "sv-SE",
  "sv",
  [
    "Unidad 1: Hej y Fundamentos Nórdicos (A1)",
    "Unidad 2: La Hora del Fika y Vida Diaria (A2)",
    "Unidad 3: Naturaleza Escandinava y Viajes (B1)",
    "Unidad 4: Sociedad Sueca y Opiniones (B2)",
    "Unidad 5: Maestría en Estocolmo (C1)",
  ],
  [
    "Hej, God morgon, entonación musical y sonidos 'sj' y 'sk'.",
    "Disfrutar del fika, compras y direcciones en Gamla Stan.",
    "Tiempos pasados, orden de palabras V2 y naturaleza nórdica.",
    "Debates sobre sostenibilidad, cultura y bienestar.",
    "Fluidez escandinava absoluta de A1 a C1.",
  ],
  "Lección de Sueco"
);

export const GREEK_CURRICULUM = createLanguageCurriculum(
  "Griego",
  "el-GR",
  "el",
  [
    "Unidad 1: El Alfabeto Griego y Saludos (A1)",
    "Unidad 2: Islas del Egeo y Gastronomía (A2)",
    "Unidad 3: Raíces Etimológicas y Anécdotas (B1)",
    "Unidad 4: Filosofía y Discusión Contemporánea (B2)",
    "Unidad 5: Retórica y Fluidez en Atenas (C1)",
  ],
  [
    "Geia sas, Kalimera, lectura del alfabeto alfa a omega.",
    "Pedir en tabernas, pedir indicaciones y números.",
    "Conexión con raíces científicas universales y verbos.",
    "Debates sobre historia, arte y sociedad griega moderna.",
    "Fluidez clásica y moderna impecable de A1 a C1.",
  ],
  "Lección de Griego"
);

export const TURKISH_CURRICULUM = createLanguageCurriculum(
  "Turco",
  "tr-TR",
  "tr",
  [
    "Unidad 1: Merhaba y Armonía Vocálica (A1)",
    "Unidad 2: El Bazar de Estambul y Rutinas (A2)",
    "Unidad 3: Sufijos Aglutinantes y Emociones (B1)",
    "Unidad 4: Conversaciones Profundas y Medios (B2)",
    "Unidad 5: Maestría entre Dos Continentes (C1)",
  ],
  [
    "Merhaba, Günaydın, cortesía turca y las 8 vocales.",
    "Tomar té çay, compras en bazares y transporte por el Bósforo.",
    "El fascinante sistema de sufijos y tiempos narrativos.",
    "Noticias, expresiones populares y oraciones subordinadas.",
    "Dominio oratorio fluido de A1 a C1 con Tuddy.",
  ],
  "Lección de Turco"
);

export const POLISH_CURRICULUM = createLanguageCurriculum(
  "Polaco",
  "pl-PL",
  "pl",
  [
    "Unidad 1: Cześć y Fonética Polaca (A1)",
    "Unidad 2: Cracovia, Varsovia y Comidas (A2)",
    "Unidad 3: Declinaciones y Anécdotas (B1)",
    "Unidad 4: Subjuntivo y Argumentación (B2)",
    "Unidad 5: Maestría de la Lengua Polaca (C1)",
  ],
  [
    "Dzień dobry, Cześć, pronunciación de sz, cz, rz y nasalidad.",
    "Pedir pierogi, navegar la ciudad y hacer planes.",
    "Navegar los 7 casos gramaticales con claridad.",
    "Debates, literatura y redacción fluida.",
    "Fluidez nativa y precisión gramatical de A1 a C1.",
  ],
  "Lección de Polaco"
);

export const HINDI_CURRICULUM = createLanguageCurriculum(
  "Hindi",
  "hi-IN",
  "hi",
  [
    "Unidad 1: Devanagari y Namaste (A1)",
    "Unidad 2: Calles de Delhi y Hospitalidad (A2)",
    "Unidad 3: Cine Bollywood y Expresiones (B1)",
    "Unidad 4: Estructuras Compuestas y Diálogos (B2)",
    "Unidad 5: Elocuencia y Tradición Hindi (C1)",
  ],
  [
    "Namaste, Aap kaise hain, trazos sagrados Devanagari.",
    "Sabores de especias, regateo cordial y direcciones.",
    "Formas verbales habituales, continuas y compuestas.",
    "Narrativas, debates contemporáneos y cultura india.",
    "Fluidez y riqueza expresiva de A1 a C1.",
  ],
  "Lección de Hindi"
);

// ==========================================
// 🇪🇸 ESPAÑOL (A1 ➔ C1) - Para estudiantes de habla inglesa u otras lenguas
// ==========================================
export const SPANISH_CURRICULUM: CampaignPathNode[] = [
  // UNIDAD 1: A1 • Fundamentos y Primeros Saludos
  {
    id: "es-a1-1",
    nodeIndex: 1,
    type: "lesson",
    level: "A1",
    levelBadge: "Nivel A1 (1a)",
    unitNumber: 1,
    unitTitle: "Unidad 1: Fundamentos y Primeros Saludos (A1)",
    title: "Primeros Saludos & Cortesía",
    subtitle: "Aprende a saludar, decir tu nombre y pedir cosas educadamente en español.",
    targetLanguage: "Español",
    langCode: "es-ES",
    xOffsetPercent: getSinusoidalOffset(0),
    carrotsReward: 10,
    lesson: {
      topicTitle: "Saludos y Cortesía en Español",
      targetLanguage: "Español",
      level: "A1",
      vocabulary: [
        { word: "Hola", translation: "Hello", phoneticOrPronunciationGuide: "/ˈo.la/", exampleSentence: "¡Hola! Mucho gusto en conocerte.", exampleTranslation: "Hello! Nice to meet you." },
        { word: "Por favor", translation: "Please", phoneticOrPronunciationGuide: "/poɾ faˈβoɾ/", exampleSentence: "Un café, por favor.", exampleTranslation: "A coffee, please." },
        { word: "Gracias", translation: "Thank you", phoneticOrPronunciationGuide: "/ˈɡɾa.sjas/", exampleSentence: "Muchas gracias por tu ayuda.", exampleTranslation: "Thank you very much for your help." },
        { word: "Me llamo...", translation: "My name is...", phoneticOrPronunciationGuide: "/me ˈʝa.mo/", exampleSentence: "Me llamo Tuddy y soy tu compañero de estudio.", exampleTranslation: "My name is Tuddy and I am your study companion." }
      ],
      dialogue: [
        { speaker: "Sofía", text: "¡Buenos días! Bienvenido a Madrid. ¿Cómo te llamas?", translation: "Good morning! Welcome to Madrid. What is your name?" },
        { speaker: "Tuddy", text: "¡Hola! Me llamo Tuddy. ¡Mucho gusto en conocerte, Sofía!", translation: "Hello! My name is Tuddy. Nice to meet you, Sofía!" },
        { speaker: "Sofía", text: "¡Mucho gusto también, Tuddy! Empecemos a aprender.", translation: "Nice to meet you too, Tuddy! Let's start learning." }
      ],
      listeningExercise: {
        audioText: "¡Hola! Mucho gusto en conocerte. Me llamo Tuddy y estoy aquí para ayudarte.",
        question: "¿Qué dice Tuddy al presentarse?",
        options: [
          "Hola, mucho gusto en conocerte. Me llamo Tuddy.",
          "Adiós, nos vemos mañana por la tarde.",
          "¿Dónde está la estación de metro más cercana?",
          "No tengo tiempo para estudiar hoy."
        ],
        correctOptionIndex: 0,
        tip: "Presta atención a las palabras 'Hola' y 'Me llamo'."
      },
      readingExercise: {
        passageTitle: "Un saludo matutino",
        passageText: "Cada mañana en la plaza, los vecinos se saludan con una sonrisa: '¡Buenos días! ¿Cómo estás?'. Siempre responden: 'Muy bien, gracias, ¿y tú?'. La cortesía y la calidez son esenciales en la vida cotidiana.",
        question: "¿Cómo se saludan habitualmente por las mañanas?",
        options: [
          "Diciendo '¡Buenos días! ¿Cómo estás?'",
          "Sin decir nada y caminando deprisa",
          "Pidiendo la cuenta directamente",
          "Mirando el reloj en silencio"
        ],
        correctOptionIndex: 0,
        explanation: "El texto explica que los vecinos se saludan diciendo '¡Buenos días! ¿Cómo estás?'."
      },
      writingExercise: {
        prompt: "Traduce al español: 'Thank you very much'",
        expectedAnswer: "Muchas gracias",
        alternativeAcceptable: ["muchas gracias", "Muchas gracias.", "¡Muchas gracias!"],
        hint: "Palabra 'muchas' + 'gracias'."
      },
      interactiveChallenge: {
        promptText: "¿Cuál es la forma más cordial y común de pedir algo?",
        sentenceToCompleteOrTranslate: "Por favor",
        options: ["Por favor", "Hasta luego", "Ayer por la tarde", "Demasiado tarde"],
        correctOptionIndex: 0,
        explanation: "'Por favor' es la fórmula universal de cortesía en español."
      }
    }
  },
  {
    id: "es-a1-2",
    nodeIndex: 2,
    type: "lesson",
    level: "A1",
    levelBadge: "Nivel A1 (1b)",
    unitNumber: 1,
    unitTitle: "Unidad 1: Fundamentos y Primeros Saludos (A1)",
    title: "En la Cafetería y Restaurante",
    subtitle: "Aprende a pedir café, tapas y la cuenta con fluidez y soltura.",
    targetLanguage: "Español",
    langCode: "es-ES",
    xOffsetPercent: getSinusoidalOffset(1),
    carrotsReward: 10,
    lesson: {
      topicTitle: "Pedir en una Cafetería en Español",
      targetLanguage: "Español",
      level: "A1",
      vocabulary: [
        { word: "Un café con leche", translation: "A coffee with milk", phoneticOrPronunciationGuide: "/un kaˈfe kon ˈle.tʃe/", exampleSentence: "Quisiera un café con leche y una tostada.", exampleTranslation: "I would like a coffee with milk and toast." },
        { word: "¿Cuánto cuesta?", translation: "How much does it cost?", phoneticOrPronunciationGuide: "/ˈkwan.to ˈkwes.ta/", exampleSentence: "¿Cuánto cuesta este pastel de chocolate?", exampleTranslation: "How much is this chocolate cake?" },
        { word: "La cuenta, por favor", translation: "The bill, please", phoneticOrPronunciationGuide: "/la ˈkwen.ta poɾ faˈβoɾ/", exampleSentence: "Camarero, ¿nos trae la cuenta, por favor?", exampleTranslation: "Waiter, could you bring us the bill, please?" },
        { word: "Está delicioso", translation: "It is delicious", phoneticOrPronunciationGuide: "/esˈta de.liˈsjo.so/", exampleSentence: "¡Este postre está delicioso!", exampleTranslation: "This dessert is delicious!" }
      ],
      dialogue: [
        { speaker: "Camarero", text: "¡Buenas tardes! ¿Qué desea tomar?", translation: "Good afternoon! What would you like to drink?" },
        { speaker: "Tuddy", text: "Buenas tardes. Un café con leche y agua sin gas, por favor.", translation: "Good afternoon. A coffee with milk and still water, please." },
        { speaker: "Camarero", text: "¡Enseguida se lo traigo!", translation: "Right away!" }
      ],
      listeningExercise: {
        audioText: "Camarero, ¿podría traerme la cuenta, por favor?",
        question: "¿Qué está solicitando el cliente?",
        options: [
          "La cuenta para pagar su consumo.",
          "El menú del día de mañana.",
          "La hora del próximo autobús.",
          "Un libro de gramática española."
        ],
        correctOptionIndex: 0,
        tip: "Identifica la frase clave 'la cuenta, por favor'."
      },
      readingExercise: {
        passageTitle: "La cultura del café en España",
        passageText: "Tomar un café a media mañana es una tradición social muy querida. Los amigos se reúnen para charlar, compartir unas tapas y relajarse durante media hora antes de continuar su jornada.",
        question: "¿Qué representa tomar un café a media mañana en España?",
        options: [
          "Un momento social para charlar y compartir.",
          "Una obligación estricta de trabajo.",
          "Una competición deportiva entre amigos.",
          "Un examen silencioso en una biblioteca."
        ],
        correctOptionIndex: 0,
        explanation: "El texto resalta que es una tradición social para reunirse, conversar y relajarse."
      },
      writingExercise: {
        prompt: "Traduce al español: 'The bill, please'",
        expectedAnswer: "La cuenta, por favor",
        alternativeAcceptable: ["la cuenta por favor", "La cuenta por favor", "La cuenta, por favor."],
        hint: "'La cuenta' + coma + 'por favor'."
      },
      interactiveChallenge: {
        promptText: "Para preguntar el precio de algo, dices:",
        sentenceToCompleteOrTranslate: "¿Cuánto cuesta?",
        options: ["¿Cuánto cuesta?", "¿Dónde vives?", "¿Qué hora es?", "¿Quién es él?"],
        correctOptionIndex: 0,
        explanation: "'¿Cuánto cuesta?' pregunta específicamente el valor o precio de un artículo."
      }
    }
  },
  {
    id: "es-a1-3",
    nodeIndex: 3,
    type: "story",
    level: "A1",
    levelBadge: "Nivel A1 (1c)",
    unitNumber: 1,
    unitTitle: "Unidad 1: Fundamentos y Primeros Saludos (A1)",
    title: "Historia Cultural: El Mercado de San Miguel",
    subtitle: "Pasea entre puestos de frutas, jamón y queso, practicando números y compras.",
    targetLanguage: "Español",
    langCode: "es-ES",
    xOffsetPercent: getSinusoidalOffset(2),
    carrotsReward: 12,
    lesson: {
      topicTitle: "El Mercado Tradicional en Madrid",
      targetLanguage: "Español",
      level: "A1",
      vocabulary: [
        { word: "Frutas frescas", translation: "Fresh fruits", phoneticOrPronunciationGuide: "/ˈfɾu.tas ˈfɾes.kas/", exampleSentence: "Compré naranjas y fresas muy frescas.", exampleTranslation: "I bought very fresh oranges and strawberries." },
        { word: "Un kilo", translation: "One kilo", phoneticOrPronunciationGuide: "/un ˈki.lo/", exampleSentence: "Deme un kilo de manzanas rojas, por favor.", exampleTranslation: "Give me one kilo of red apples, please." },
        { word: "Queso curado", translation: "Cured cheese", phoneticOrPronunciationGuide: "/ˈke.so kuˈɾa.ðo/", exampleSentence: "Este queso manchego curado tiene un sabor increíble.", exampleTranslation: "This cured Manchego cheese has an incredible flavor." },
        { word: "Aquí tiene", translation: "Here you go", phoneticOrPronunciationGuide: "/aˈki ˈtje.ne/", exampleSentence: "Aquí tiene su cambio y su recibo.", exampleTranslation: "Here is your change and your receipt." }
      ],
      dialogue: [
        { speaker: "Vendedor", text: "¡Hola! ¿Qué le ponemos hoy?", translation: "Hello! What can I get for you today?" },
        { speaker: "Tuddy", text: "Un kilo de manzanas y medio kilo de queso, por favor.", translation: "One kilo of apples and half a kilo of cheese, please." },
        { speaker: "Vendedor", text: "¡Perfecto! Son cinco euros en total. Aquí tiene.", translation: "Perfect! That is five euros in total. Here you go." }
      ],
      listeningExercise: {
        audioText: "Son cinco euros en total. Aquí tiene su compra y muchas gracias.",
        question: "¿Cuál es el precio final de la compra?",
        options: ["Cinco euros", "Cincuenta euros", "Quince euros", "Dos euros"],
        correctOptionIndex: 0,
        tip: "Escucha el número 'cinco euros'."
      },
      readingExercise: {
        passageTitle: "Colores en el Mercado",
        passageText: "El mercado está lleno de colores vibrantes y aromas deliciosos. En los puestos de fruta brillan las naranjas de Valencia y las aceitunas verdes aliñadas con hierbas aromáticas.",
        question: "¿De dónde son las naranjas famosas que brillan en los puestos?",
        options: ["De Valencia", "De París", "De Londres", "De Tokio"],
        correctOptionIndex: 0,
        explanation: "El texto menciona específicamente 'las naranjas de Valencia'."
      },
      writingExercise: {
        prompt: "Escribe en español: 'Here you go'",
        expectedAnswer: "Aquí tiene",
        alternativeAcceptable: ["aqui tiene", "Aquí tienes", "aqui tienes"],
        hint: "Palabra 'Aquí' + forma verbal 'tiene'."
      },
      interactiveChallenge: {
        promptText: "Si quieres medio kilogramo de un producto, pides:",
        sentenceToCompleteOrTranslate: "Medio kilo, por favor.",
        options: ["Medio kilo, por favor", "Diez litros de agua", "Mil kilómetros", "Ninguno de ellos"],
        correctOptionIndex: 0,
        explanation: "'Medio kilo' indica media unidad de peso."
      }
    }
  },
  {
    id: "es-a1-4",
    nodeIndex: 4,
    type: "checkpoint",
    level: "A1",
    crownNumber: 1,
    levelBadge: "Corona 1 (A1)",
    unitNumber: 1,
    unitTitle: "Unidad 1: Fundamentos y Primeros Saludos (A1)",
    title: "Punto de Control: Despegue hacia la Fluidez",
    subtitle: "Demuestra tu dominio de saludos, números básicos y peticiones cotidianas.",
    targetLanguage: "Español",
    langCode: "es-ES",
    xOffsetPercent: getSinusoidalOffset(3),
    carrotsReward: 15,
    lesson: {
      topicTitle: "Punto de Control de Nivel A1",
      targetLanguage: "Español",
      level: "A1",
      vocabulary: [
        { word: "Encantado/a", translation: "Delighted / Nice to meet you", phoneticOrPronunciationGuide: "/en.kanˈta.ðo/", exampleSentence: "Encantado de conocerte.", exampleTranslation: "Delighted to meet you." },
        { word: "¿De dónde eres?", translation: "Where are you from?", phoneticOrPronunciationGuide: "/de ˈðon.de ˈe.ɾes/", exampleSentence: "¿De dónde eres tú?", exampleTranslation: "Where are you from?" },
        { word: "Vivo en...", translation: "I live in...", phoneticOrPronunciationGuide: "/ˈbi.βo en/", exampleSentence: "Vivo en una ciudad muy bonita.", exampleTranslation: "I live in a very pretty city." },
        { word: "Hasta luego", translation: "See you later", phoneticOrPronunciationGuide: "/ˈas.ta ˈlwe.ɣo/", exampleSentence: "Hasta luego, que tengas buen día.", exampleTranslation: "See you later, have a good day." }
      ],
      dialogue: [
        { speaker: "Profesor", text: "¡Felicidades por llegar al punto de control! ¿Estás listo para el reto?", translation: "Congratulations on reaching the checkpoint! Are you ready for the challenge?" },
        { speaker: "Tuddy", text: "¡Sí, estoy muy entusiasmado y listo para responder todo!", translation: "Yes, I am very excited and ready to answer everything!" },
        { speaker: "Profesor", text: "¡Excelente! Comencemos la evaluación de la Corona 1.", translation: "Excellent! Let's begin the Crown 1 assessment." }
      ],
      listeningExercise: {
        audioText: "¡Hola a todos! Encantado de conocerles. Vivo en Madrid y estudio español todos los días.",
        question: "¿Qué hace la persona que habla?",
        options: [
          "Vive en Madrid y estudia español a diario.",
          "Vive en Londres y no le gustan los idiomas.",
          "Está buscando una estación de tren en Berlín.",
          "Trabaja en un barco de pesca en el norte."
        ],
        correctOptionIndex: 0,
        tip: "Presta atención a 'Vivo en Madrid' y 'estudio español'."
      },
      readingExercise: {
        passageTitle: "La meta del viaje",
        passageText: "Aprender un nuevo idioma abre puertas maravillosas a nuevas amistades y aventuras. Cada lección que completas es un paso firme hacia la fluidez y la confianza personal.",
        question: "¿Qué beneficio principal resalta el texto al aprender un nuevo idioma?",
        options: [
          "Abre puertas a nuevas amistades y aventuras.",
          "Te obliga a no viajar nunca al extranjero.",
          "Hace que olvides tu lengua materna.",
          "Reduce tus horas de sueño cada noche."
        ],
        correctOptionIndex: 0,
        explanation: "El texto afirma directamente que abre puertas a nuevas amistades y aventuras."
      },
      writingExercise: {
        prompt: "Traduce al español: 'See you later'",
        expectedAnswer: "Hasta luego",
        alternativeAcceptable: ["hasta luego", "Hasta luego.", "¡Hasta luego!"],
        hint: "'Hasta' + 'luego'."
      },
      interactiveChallenge: {
        promptText: "Para responder amablemente a '¿De dónde eres?', dices:",
        sentenceToCompleteOrTranslate: "Soy de...",
        options: ["Soy de España / Soy de México", "Tengo tres años", "No quiero comer", "El sol es amarillo"],
        correctOptionIndex: 0,
        explanation: "'Soy de...' es la fórmula estándar para indicar tu lugar de origen."
      }
    }
  },
  {
    id: "es-a1-5",
    nodeIndex: 5,
    type: "chest",
    level: "A1",
    levelBadge: "Nivel A1 (Recompensa)",
    unitNumber: 1,
    unitTitle: "Unidad 1: Fundamentos y Primeros Saludos (A1)",
    title: "Cofre de Zanahorias A1 (Español)",
    subtitle: "¡Has completado con éxito la Unidad 1 de Español! Abre este cofre para reclamar tus zanahorias.",
    targetLanguage: "Español",
    langCode: "es-ES",
    xOffsetPercent: getSinusoidalOffset(4),
    carrotsReward: 20
  },
  // UNIDAD 2: A2 • Rutinas, Direcciones y Vida Urbana
  {
    id: "es-a2-1",
    nodeIndex: 6,
    type: "lesson",
    level: "A2",
    levelBadge: "Nivel A2 (Elemental)",
    unitNumber: 2,
    unitTitle: "Unidad 2: Vida Diaria, Transporte y Rutinas (A2)",
    title: "Preguntar Direcciones en la Ciudad",
    subtitle: "Aprende a ubicar calles, estaciones de metro y monumentos históricos.",
    targetLanguage: "Español",
    langCode: "es-ES",
    xOffsetPercent: getSinusoidalOffset(5),
    carrotsReward: 15,
    lesson: {
      topicTitle: "Direcciones y Transporte Urbano",
      targetLanguage: "Español",
      level: "A2",
      vocabulary: [
        { word: "Gira a la izquierda", translation: "Turn left", phoneticOrPronunciationGuide: "/ˈxi.ɾa a la iθˈkjeɾ.da/", exampleSentence: "Gira a la izquierda en el semáforo.", exampleTranslation: "Turn left at the traffic light." },
        { word: "Gira a la derecha", translation: "Turn right", phoneticOrPronunciationGuide: "/ˈxi.ɾa a la deˈɾe.tʃa/", exampleSentence: "Gira a la derecha después de la farmacia.", exampleTranslation: "Turn right after the pharmacy." },
        { word: "Todo recto", translation: "Straight ahead", phoneticOrPronunciationGuide: "/ˈto.ðo ˈrek.to/", exampleSentence: "Camina todo recto durante dos calles.", exampleTranslation: "Walk straight ahead for two blocks." },
        { word: "La estación de tren", translation: "The train station", phoneticOrPronunciationGuide: "/la es.taˈsjon de tɾen/", exampleSentence: "La estación de tren está cruzando la avenida.", exampleTranslation: "The train station is across the avenue." }
      ],
      dialogue: [
        { speaker: "Viajero", text: "Disculpe, ¿podría indicarme dónde está la boca de metro?", translation: "Excuse me, could you tell me where the subway entrance is?" },
        { speaker: "Tuddy", text: "¡Claro! Siga todo recto y gire a la izquierda en la esquina.", translation: "Sure! Continue straight ahead and turn left at the corner." },
        { speaker: "Viajero", text: "¡Muchas gracias por su amable ayuda!", translation: "Thank you very much for your kind help!" }
      ],
      listeningExercise: {
        audioText: "Camine todo recto dos manzanas y luego doble a la derecha junto al parque.",
        question: "¿Qué instrucción da la voz?",
        options: [
          "Caminar recto dos manzanas y doblar a la derecha junto al parque.",
          "Tomar un taxi directamente al aeropuerto internacional.",
          "Quedarse quieto esperando al autobús número diez.",
          "Cruzar el río en barco."
        ],
        correctOptionIndex: 0,
        tip: "Escucha 'todo recto' y 'doble a la derecha'."
      },
      readingExercise: {
        passageTitle: "Moverse por la ciudad",
        passageText: "El transporte público en las ciudades hispanohablantes es rápido, económico y seguro. El metro y los autobuses urbanos conectan todos los barrios con el centro histórico.",
        question: "¿Qué características destaca el texto sobre el transporte público?",
        options: [
          "Es rápido, económico y seguro.",
          "Es excesivamente caro y peligroso.",
          "Solo funciona una hora al día.",
          "No tiene paradas en el centro."
        ],
        correctOptionIndex: 0,
        explanation: "El texto afirma textualmente que es rápido, económico y seguro."
      },
      writingExercise: {
        prompt: "Traduce al español: 'Turn right'",
        expectedAnswer: "Gira a la derecha",
        alternativeAcceptable: ["gira a la derecha", "Gire a la derecha", "gire a la derecha"],
        hint: "Verbo 'gira' + 'a la derecha'."
      },
      interactiveChallenge: {
        promptText: "Si algo está muy cerca, dices:",
        sentenceToCompleteOrTranslate: "Está aquí al lado / Está muy cerca.",
        options: ["Está aquí al lado", "Está en la luna", "Nunca llegaremos", "Es un coche azul"],
        correctOptionIndex: 0,
        explanation: "'Está aquí al lado' expresa proximidad inmediata."
      }
    }
  },
  {
    id: "es-a2-2",
    nodeIndex: 7,
    type: "lesson",
    level: "A2",
    levelBadge: "Nivel A2 (Rutinas)",
    unitNumber: 2,
    unitTitle: "Unidad 2: Vida Diaria, Transporte y Rutinas (A2)",
    title: "Mi Rutina Diaria y Horarios",
    subtitle: "Habla sobre a qué hora te levantas, estudias y qué haces en tu tiempo libre.",
    targetLanguage: "Español",
    langCode: "es-ES",
    xOffsetPercent: getSinusoidalOffset(6),
    carrotsReward: 15,
    lesson: {
      topicTitle: "Rutinas Diarias y Verbos Reflexivos",
      targetLanguage: "Español",
      level: "A2",
      vocabulary: [
        { word: "Me levanto", translation: "I wake up / get up", phoneticOrPronunciationGuide: "/me leˈβan.to/", exampleSentence: "Me levanto a las siete de la mañana.", exampleTranslation: "I get up at seven in the morning." },
        { word: "Desayunar", translation: "To have breakfast", phoneticOrPronunciationGuide: "/de.sa.ʝuˈnaɾ/", exampleSentence: "Suelo desayunar fruta y tostadas.", exampleTranslation: "I usually have fruit and toast for breakfast." },
        { word: "Estudiar con Tuddy", translation: "To study with Tuddy", phoneticOrPronunciationGuide: "/es.tuˈðjaɾ kon ˈtu.di/", exampleSentence: "Estudio media hora con Tuddy cada tarde.", exampleTranslation: "I study half an hour with Tuddy every afternoon." },
        { word: "Acostarse", translation: "To go to bed", phoneticOrPronunciationGuide: "/a.kosˈtaɾ.se/", exampleSentence: "Me acuesto temprano para descansar bien.", exampleTranslation: "I go to bed early to rest well." }
      ],
      dialogue: [
        { speaker: "Carlos", text: "¿A qué hora sueles empezar a estudiar tus asignaturas?", translation: "What time do you usually start studying your subjects?" },
        { speaker: "Tuddy", text: "Empiezo a las cuatro de la tarde, justo después del almuerzo.", translation: "I start at four in the afternoon, right after lunch." },
        { speaker: "Carlos", text: "¡Qué buen hábito de estudio tienes organizado!", translation: "What a great study habit you have organized!" }
      ],
      listeningExercise: {
        audioText: "Todos los días me levanto temprano, repaso mis fichas de memoria y practico idiomas.",
        question: "¿Qué hace la persona cada mañana?",
        options: [
          "Se levanta temprano, repasa fichas y practica idiomas.",
          "Duerme hasta el mediodía sin hacer nada.",
          "Pierde el autobús de la escuela.",
          "Cocina una tarta de cumpleaños."
        ],
        correctOptionIndex: 0,
        tip: "Escucha 'me levanto temprano' y 'repaso mis fichas'."
      },
      readingExercise: {
        passageTitle: "Un día productivo",
        passageText: "Tener un horario fijo ayuda a mantener la concentración. El método Pomodoro divide el trabajo en bloques de veinticinco minutos con pausas breves para recargar energía.",
        question: "¿En qué consiste el método Pomodoro según el texto?",
        options: [
          "En bloques de veinticinco minutos de estudio con pausas breves.",
          "En estudiar ocho horas seguidas sin descansar jamás.",
          "En comer solo tomates durante la semana.",
          "En ver televisión mientras se hacen los deberes."
        ],
        correctOptionIndex: 0,
        explanation: "El texto especifica bloques de 25 minutos con pausas breves."
      },
      writingExercise: {
        prompt: "Traduce al español: 'I wake up at seven'",
        expectedAnswer: "Me levanto a las siete",
        alternativeAcceptable: ["me levanto a las siete", "Me despierto a las siete", "me despierto a las siete"],
        hint: "'Me levanto' + 'a las siete'."
      },
      interactiveChallenge: {
        promptText: "Para decir que haces algo habitualmente, usas la estructura:",
        sentenceToCompleteOrTranslate: "Suelo + infinitivo (ej: Suelo estudiar)",
        options: ["Suelo estudiar", "Ayer comí", "Nunca jamás", "Quizás mañana"],
        correctOptionIndex: 0,
        explanation: "'Soler + infinitivo' expresa hábito o costumbre en español."
      }
    }
  },
  {
    id: "es-a2-3",
    nodeIndex: 8,
    type: "story",
    level: "A2",
    levelBadge: "Nivel A2 (Historia)",
    unitNumber: 2,
    unitTitle: "Unidad 2: Vida Diaria, Transporte y Rutinas (A2)",
    title: "Historia: El Tren de Alta Velocidad",
    subtitle: "Viaja en el AVE de Madrid a Barcelona admirando los paisajes y practicando el pasado.",
    targetLanguage: "Español",
    langCode: "es-ES",
    xOffsetPercent: getSinusoidalOffset(7),
    carrotsReward: 15,
    lesson: {
      topicTitle: "Viajes en Tren y Anécdotas Pasadas",
      targetLanguage: "Español",
      level: "A2",
      vocabulary: [
        { word: "El billete", translation: "The ticket", phoneticOrPronunciationGuide: "/el biˈʎe.te/", exampleSentence: "Compré el billete de tren por internet.", exampleTranslation: "I bought the train ticket online." },
        { word: "El andén", translation: "The platform", phoneticOrPronunciationGuide: "/el anˈden/", exampleSentence: "El tren sale del andén número tres.", exampleTranslation: "The train departs from platform number three." },
        { word: "Puntual", translation: "Punctual / on time", phoneticOrPronunciationGuide: "/punˈtwal/", exampleSentence: "El tren llegó muy puntual a la estación.", exampleTranslation: "The train arrived very punctually at the station." },
        { word: "El paisaje", translation: "The landscape", phoneticOrPronunciationGuide: "/el paiˈsa.xe/", exampleSentence: "Miraba el paisaje por la ventanilla.", exampleTranslation: "I was looking at the landscape through the window." }
      ],
      dialogue: [
        { speaker: "Revisor", text: "¡Buenos días! ¿Puedo ver su billete y documento?", translation: "Good morning! May I see your ticket and ID?" },
        { speaker: "Tuddy", text: "Por supuesto, aquí tiene mi billete en el teléfono.", translation: "Of course, here is my ticket on my phone." },
        { speaker: "Revisor", text: "Todo en orden. ¡Que disfrute de su viaje a Barcelona!", translation: "Everything in order. Enjoy your trip to Barcelona!" }
      ],
      listeningExercise: {
        audioText: "Atención señores pasajeros: el tren con destino a Barcelona va a efectuar su salida por la vía tres.",
        question: "¿Qué anuncia la megafonía de la estación?",
        options: [
          "La salida del tren con destino a Barcelona por la vía tres.",
          "La cancelación de todos los vuelos a Nueva York.",
          "El cierre de la cafetería de la estación.",
          "La llegada de un barco al puerto."
        ],
        correctOptionIndex: 0,
        tip: "Identifica 'tren con destino a Barcelona' y 'vía tres'."
      },
      readingExercise: {
        passageTitle: "La velocidad y el confort",
        passageText: "El tren de alta velocidad recorre seiscientos kilómetros en apenas dos horas y media. Los pasajeros pueden leer tranquilamente, conectarse a internet o contemplar los campos dorados de Castilla y Aragón.",
        question: "¿Cuánto tarda el tren en recorrer los 600 kilómetros?",
        options: ["Apenas dos horas y media", "Doce horas enteras", "Tres semanas", "Cinco minutos"],
        correctOptionIndex: 0,
        explanation: "El texto afirma que tarda 'apenas dos horas y media'."
      },
      writingExercise: {
        prompt: "Traduce al español: 'The train is on time'",
        expectedAnswer: "El tren es puntual",
        alternativeAcceptable: ["el tren es puntual", "El tren está a tiempo", "el tren llega a tiempo"],
        hint: "'El tren' + 'es puntual' / 'está a tiempo'."
      },
      interactiveChallenge: {
        promptText: "Para indicar de dónde sale el tren, buscas:",
        sentenceToCompleteOrTranslate: "El andén / la vía indicada.",
        options: ["El andén o la vía", "El buzón de cartas", "El garaje de bicicletas", "La azotea del edificio"],
        correctOptionIndex: 0,
        explanation: "Los trenes parten y llegan a los andenes o vías de la estación."
      }
    }
  },
  {
    id: "es-a2-4",
    nodeIndex: 9,
    type: "checkpoint",
    level: "A2",
    crownNumber: 2,
    levelBadge: "Corona 2 (A2)",
    unitNumber: 2,
    unitTitle: "Unidad 2: Vida Diaria, Transporte y Rutinas (A2)",
    title: "Punto de Control: Maestro Urbano",
    subtitle: "Consolida tu aprendizaje de direcciones, horarios y experiencias de viaje.",
    targetLanguage: "Español",
    langCode: "es-ES",
    xOffsetPercent: getSinusoidalOffset(8),
    carrotsReward: 18,
    lesson: {
      topicTitle: "Consolidación de Nivel A2",
      targetLanguage: "Español",
      level: "A2",
      vocabulary: [
        { word: "El fin de semana", translation: "The weekend", phoneticOrPronunciationGuide: "/el fin de seˈma.na/", exampleSentence: "¿Qué hiciste el fin de semana pasado?", exampleTranslation: "What did you do last weekend?" },
        { word: "Visitar un museo", translation: "To visit a museum", phoneticOrPronunciationGuide: "/bi.siˈtaɾ un muˈse.o/", exampleSentence: "Ayer visité el Museo del Prado.", exampleTranslation: "Yesterday I visited the Prado Museum." },
        { word: "Fue genial", translation: "It was great", phoneticOrPronunciationGuide: "/fwe xeˈnjal/", exampleSentence: "La excursión fue genial e inolvidable.", exampleTranslation: "The trip was great and unforgettable." },
        { word: "Hacer planes", translation: "To make plans", phoneticOrPronunciationGuide: "/aˈseɾ ˈpla.nes/", exampleSentence: "Estamos haciendo planes para las vacaciones.", exampleTranslation: "We are making plans for the holidays." }
      ],
      dialogue: [
        { speaker: "Amigo", text: "¿Qué tal fue tu visita a la ciudad el fin de semana pasado?", translation: "How was your visit to the city last weekend?" },
        { speaker: "Tuddy", text: "¡Fue fantástica! Caminé por el centro histórico y probé platos típicos.", translation: "It was fantastic! I walked through the historic center and tried typical dishes." },
        { speaker: "Amigo", text: "¡Me alegro mucho! Tu español ha mejorado enormemente.", translation: "I'm so glad! Your Spanish has improved tremendously." }
      ],
      listeningExercise: {
        audioText: "El sábado pasado fuimos al museo de arte y luego cenamos en un restaurante tradicional.",
        question: "¿Qué actividades realizaron el sábado pasado?",
        options: [
          "Fueron al museo de arte y cenaron en un restaurante tradicional.",
          "Se quedaron en casa limpiando el garaje todo el día.",
          "Fueron a esquiar a una montaña lejana sin nieve.",
          "Vendieron su coche en el mercado."
        ],
        correctOptionIndex: 0,
        tip: "Escucha 'fuimos al museo de arte' y 'cenamos'."
      },
      readingExercise: {
        passageTitle: "El placer de viajar",
        passageText: "Viajar no solo nos permite conocer nuevos monumentos, sino también sumergirnos en la gastronomía, los ritmos de vida y las expresiones únicas de cada región.",
        question: "¿Qué nos permite viajar según la lectura?",
        options: [
          "Conocer monumentos, gastronomía y ritmos de vida regionales.",
          "Estar siempre desconectados de cualquier persona.",
          "Gastar todo el dinero sin aprender nada nuevo.",
          "Quedarnos en el mismo hotel sin salir a la calle."
        ],
        correctOptionIndex: 0,
        explanation: "El texto subraya la inmersión en monumentos, comida y cultura regional."
      },
      writingExercise: {
        prompt: "Traduce al español: 'It was great'",
        expectedAnswer: "Fue genial",
        alternativeAcceptable: ["fue genial", "Estuvo genial", "estuvo genial", "Fue fantástico"],
        hint: "'Fue' + 'genial'."
      },
      interactiveChallenge: {
        promptText: "¿Cuál es el tiempo verbal adecuado para acciones pasadas puntuales y terminadas?",
        sentenceToCompleteOrTranslate: "Pretérito perfecto simple (indefinido): comí, viajé, aprendí.",
        options: ["Pretérito perfecto simple (viajé, comí)", "Futuro lejano (viajaré)", "Condicional simple (viajaría)", "Presente continuo (estoy viajando)"],
        correctOptionIndex: 0,
        explanation: "El pretérito indefinido expresa acciones completadas en el pasado."
      }
    }
  },
  {
    id: "es-a2-5",
    nodeIndex: 10,
    type: "chest",
    level: "A2",
    levelBadge: "Nivel A2 (Recompensa)",
    unitNumber: 2,
    unitTitle: "Unidad 2: Vida Diaria, Transporte y Rutinas (A2)",
    title: "Cofre de Zanahorias A2 (Español)",
    subtitle: "¡Has completado el Nivel Elemental A2! Reclama tu botín de zanahorias para vestir a Tuddy.",
    targetLanguage: "Español",
    langCode: "es-ES",
    xOffsetPercent: getSinusoidalOffset(9),
    carrotsReward: 20
  },
  // UNIDAD 3: B1 • Anécdotas, Opiniones y Planes
  {
    id: "es-b1-1",
    nodeIndex: 11,
    type: "lesson",
    level: "B1",
    levelBadge: "Nivel B1 (Intermedio)",
    unitNumber: 3,
    unitTitle: "Unidad 3: Anécdotas, Cultura y Expresión Intermedia (B1)",
    title: "Contar Historias y Experiencias",
    subtitle: "Combina pretérito imperfecto e indefinido para narrar recuerdos vívidos.",
    targetLanguage: "Español",
    langCode: "es-ES",
    xOffsetPercent: getSinusoidalOffset(10),
    carrotsReward: 15,
    lesson: {
      topicTitle: "Narrativa en Pasado: Imperfecto vs. Indefinido",
      targetLanguage: "Español",
      level: "B1",
      vocabulary: [
        { word: "Cuando era pequeño/a", translation: "When I was young", phoneticOrPronunciationGuide: "/ˈkwan.do ˈe.ɾa peˈke.ɲo/", exampleSentence: "Cuando era pequeño, me encantaba leer cuentos.", exampleTranslation: "When I was little, I loved reading stories." },
        { word: "De repente", translation: "Suddenly", phoneticOrPronunciationGuide: "/de reˈpen.te/", exampleSentence: "Estudiábamos y, de repente, empezó a llover.", exampleTranslation: "We were studying and suddenly it started raining." },
        { word: "Mientras tanto", translation: "Meanwhile", phoneticOrPronunciationGuide: "/ˈmjen.tɾas ˈtan.to/", exampleSentence: "Yo cocinaba; mientras tanto, él ponía la mesa.", exampleTranslation: "I was cooking; meanwhile, he was setting the table." },
        { word: "Un recuerdo inolvidable", translation: "An unforgettable memory", phoneticOrPronunciationGuide: "/un reˈkweɾ.ðo i.nol.βiˈða.βle/", exampleSentence: "Aquel viaje a Granada fue un recuerdo inolvidable.", exampleTranslation: "That trip to Granada was an unforgettable memory." }
      ],
      dialogue: [
        { speaker: "Laura", text: "¿Qué hacías cuando vivías en Salamanca?", translation: "What did you used to do when you lived in Salamanca?" },
        { speaker: "Tuddy", text: "Iba a la biblioteca todos los días y paseaba por la Plaza Mayor al atardecer.", translation: "I used to go to the library every day and stroll around the Plaza Mayor at dusk." },
        { speaker: "Laura", text: "¡Qué bella época! Salamanca tiene una atmósfera mágica para estudiantes.", translation: "What a beautiful time! Salamanca has a magical atmosphere for students." }
      ],
      listeningExercise: {
        audioText: "Hacía mucho sol aquella tarde cuando de repente sonaron las campanas de la catedral antigua.",
        question: "¿Qué describe la escena escuchada?",
        options: [
          "El tiempo soleado y el sonido repentino de las campanas.",
          "Una tormenta de nieve que paralizó la autopista.",
          "Un avión despegando hacia Tokio en la noche.",
          "Un partido de fútbol que terminó en empate."
        ],
        correctOptionIndex: 0,
        tip: "Distingue la descripción de fondo 'hacía mucho sol' de la acción 'sonaron'."
      },
      readingExercise: {
        passageTitle: "La magia de narrar",
        passageText: "En español, el contraste entre el pretérito imperfecto (que describe el escenario o acciones habituales) y el pretérito indefinido (que marca eventos puntuales) permite pintar relatos con enorme profundidad emocional y teatralidad.",
        question: "¿Cuál es la función del pretérito imperfecto en la narración?",
        options: [
          "Describir el escenario y las circunstancias habituales de fondo.",
          "Indicar exclusivamente el futuro del próximo año.",
          "Expresar órdenes imperativas a los oyentes.",
          "Hacer preguntas sobre matemáticas."
        ],
        correctOptionIndex: 0,
        explanation: "El texto resalta que el imperfecto describe el escenario y las circunstancias habituales."
      },
      writingExercise: {
        prompt: "Traduce al español: 'Suddenly'",
        expectedAnswer: "De repente",
        alternativeAcceptable: ["de repente", "De pronto", "de pronto"],
        hint: "Dos palabras: 'De' + 'repente'."
      },
      interactiveChallenge: {
        promptText: "Para decir 'While I was studying...', dices:",
        sentenceToCompleteOrTranslate: "Mientras estudiaba...",
        options: ["Mientras estudiaba...", "Después estudiaré...", "Nunca estudié...", "Mañana estudio..."],
        correctOptionIndex: 0,
        explanation: "'Mientras + imperfecto' establece una acción continua en el pasado."
      }
    }
  },
  {
    id: "es-b1-2",
    nodeIndex: 12,
    type: "lesson",
    level: "B1",
    levelBadge: "Nivel B1 (Opinión)",
    unitNumber: 3,
    unitTitle: "Unidad 3: Anécdotas, Cultura y Expresión Intermedia (B1)",
    title: "Dar Opiniones y Argumentar",
    subtitle: "Aprende a expresar tu punto de vista con 'En mi opinión', 'Creo que' y conectores.",
    targetLanguage: "Español",
    langCode: "es-ES",
    xOffsetPercent: getSinusoidalOffset(11),
    carrotsReward: 15,
    lesson: {
      topicTitle: "Expresar Opiniones y Conectores Lógicos",
      targetLanguage: "Español",
      level: "B1",
      vocabulary: [
        { word: "En mi opinión", translation: "In my opinion", phoneticOrPronunciationGuide: "/en mi o.piˈnjon/", exampleSentence: "En mi opinión, la lectura diaria transforma la mente.", exampleTranslation: "In my opinion, daily reading transforms the mind." },
        { word: "Desde mi punto de vista", translation: "From my point of view", phoneticOrPronunciationGuide: "/ˈdez.ðe mi ˈpun.to ðe ˈβis.ta/", exampleSentence: "Desde mi punto de vista, es la mejor solución.", exampleTranslation: "From my point of view, it is the best solution." },
        { word: "Sin embargo", translation: "However / Nevertheless", phoneticOrPronunciationGuide: "/sin emˈbaɾ.ɣo/", exampleSentence: "Es difícil; sin embargo, no nos rendiremos.", exampleTranslation: "It is difficult; however, we will not give up." },
        { word: "Por lo tanto", translation: "Therefore", phoneticOrPronunciationGuide: "/poɾ lo ˈtan.to/", exampleSentence: "Estudiamos mucho; por lo tanto, aprobaremos el examen.", exampleTranslation: "We study hard; therefore, we will pass the exam." }
      ],
      dialogue: [
        { speaker: "Profesora", text: "¿Qué opinas sobre el impacto de la tecnología en el aprendizaje?", translation: "What do you think about the impact of technology on learning?" },
        { speaker: "Tuddy", text: "En mi opinión, las herramientas interactivas facilitan la comprensión si se usan con disciplina.", translation: "In my opinion, interactive tools make comprehension easier if used with discipline." },
        { speaker: "Profesora", text: "¡Un argumento muy sensato y bien estructurado, Tuddy!", translation: "A very sensible and well-structured argument, Tuddy!" }
      ],
      listeningExercise: {
        audioText: "Desde mi punto de vista, la constancia diaria es mucho más efectiva que estudiar horas la noche anterior.",
        question: "¿Qué defiende la persona en su intervención?",
        options: [
          "Que la constancia diaria supera a estudiar de golpe la noche anterior.",
          "Que nunca se debe repasar para los exámenes.",
          "Que es mejor faltar a clase todos los viernes.",
          "Que los libros de texto deben eliminarse."
        ],
        correctOptionIndex: 0,
        tip: "Identifica la idea clave: 'la constancia diaria es mucho más efectiva'."
      },
      readingExercise: {
        passageTitle: "El arte de dialogar",
        passageText: "El intercambio de puntos de vista enriquece a toda comunidad estudiantil. Usar conectores como 'por un lado', 'sin embargo' y 'en conclusión' otorga elegancia y claridad a nuestras exposiciones orales y escritas.",
        question: "¿Qué beneficio aportan los conectores discursivos según el texto?",
        options: [
          "Otorgan elegancia y claridad a las exposiciones.",
          "Hacen que los textos sean completamente incomprensibles.",
          "Reducen el vocabulario disponible.",
          "Provocan errores ortográficos."
        ],
        correctOptionIndex: 0,
        explanation: "El texto afirma que aportan elegancia y claridad a las exposiciones orales y escritas."
      },
      writingExercise: {
        prompt: "Traduce al español: 'In my opinion'",
        expectedAnswer: "En mi opinión",
        alternativeAcceptable: ["en mi opinion", "en mi opinión", "En mi opinion"],
        hint: "'En' + 'mi' + 'opinión'."
      },
      interactiveChallenge: {
        promptText: "Para contrastar dos ideas contrarias, utilizas el conector:",
        sentenceToCompleteOrTranslate: "Sin embargo / No obstante.",
        options: ["Sin embargo", "Por lo tanto", "Además", "En primer lugar"],
        correctOptionIndex: 0,
        explanation: "'Sin embargo' introduce un matiz o contraste directo."
      }
    }
  },
  {
    id: "es-b1-3",
    nodeIndex: 13,
    type: "story",
    level: "B1",
    levelBadge: "Nivel B1 (Cultura)",
    unitNumber: 3,
    unitTitle: "Unidad 3: Anécdotas, Cultura y Expresión Intermedia (B1)",
    title: "Historia: La Noche de San Juan",
    subtitle: "Descubre las tradiciones mediterráneas de fuego, mar y deseos nocturnos.",
    targetLanguage: "Español",
    langCode: "es-ES",
    xOffsetPercent: getSinusoidalOffset(12),
    carrotsReward: 16,
    lesson: {
      topicTitle: "Celebraciones Populares y Tradiciones",
      targetLanguage: "Español",
      level: "B1",
      vocabulary: [
        { word: "La hoguera", translation: "The bonfire", phoneticOrPronunciationGuide: "/la oˈɣe.ɾa/", exampleSentence: "Encendieron una gran hoguera en la playa.", exampleTranslation: "They lit a large bonfire on the beach." },
        { word: "Pedir un deseo", translation: "To make a wish", phoneticOrPronunciationGuide: "/peˈðiɾ un deˈse.o/", exampleSentence: "Al saltar las olas, pedí un deseo con mucha fe.", exampleTranslation: "While jumping the waves, I made a wish with great faith." },
        { word: "La medianoche", translation: "Midnight", phoneticOrPronunciationGuide: "/la me.ðjaˈno.tʃe/", exampleSentence: "A medianoche todos se bañan en el mar.", exampleTranslation: "At midnight everyone bathes in the sea." },
        { word: "Celebrar con música", translation: "To celebrate with music", phoneticOrPronunciationGuide: "/se.leˈβɾaɾ kon ˈmu.si.ka/", exampleSentence: "Celebramos con música, guitarra y baile.", exampleTranslation: "We celebrated with music, guitar and dance." }
      ],
      dialogue: [
        { speaker: "Amiga", text: "¡Esta noche es la más mágica del verano! ¿Has escrito tus deseos en el papel?", translation: "Tonight is the most magical night of the summer! Have you written your wishes on paper?" },
        { speaker: "Tuddy", text: "¡Sí! Escribí mis metas académicas para quemarlas en la hoguera de San Juan.", translation: "Yes! I wrote my academic goals to burn them in the Saint John's bonfire." },
        { speaker: "Amiga", text: "¡Seguro que con tu esfuerzo y dedicación se cumplirán todas!", translation: "Surely with your effort and dedication they will all come true!" }
      ],
      listeningExercise: {
        audioText: "La playa estaba iluminada por cientos de hogueras y el sonido de las olas se mezclaba con las risas.",
        question: "¿Qué ambiente se describe en la grabación?",
        options: [
          "Una playa iluminada por hogueras con música y risas.",
          "Una fábrica industrial silenciosa y cerrada.",
          "Un aeropuerto vacío durante la madrugada.",
          "Una biblioteca donde todos deben susurrar."
        ],
        correctOptionIndex: 0,
        tip: "Escucha 'playa iluminada por cientos de hogueras'."
      },
      readingExercise: {
        passageTitle: "El ritual del fuego y el agua",
        passageText: "La noche del veintitrés de junio celebra la llegada del solsticio de verano. El fuego simboliza la purificación y la renovación de energías, mientras que el agua de mar representa la salud y la buena fortuna para el nuevo ciclo.",
        question: "¿Qué simboliza el fuego en esta festividad tradicional?",
        options: [
          "La purificación y renovación de energías.",
          "El frío intenso del invierno.",
          "La necesidad de apagar todas las luces.",
          "La tristeza del final del año escolar."
        ],
        correctOptionIndex: 0,
        explanation: "El texto especifica que el fuego simboliza la purificación y la renovación de energías."
      },
      writingExercise: {
        prompt: "Traduce al español: 'To make a wish'",
        expectedAnswer: "Pedir un deseo",
        alternativeAcceptable: ["pedir un deseo", "Hacer un deseo", "hacer un deseo"],
        hint: "'Pedir' + 'un deseo'."
      },
      interactiveChallenge: {
        promptText: "¿Cuándo se celebra la noche de San Juan tradicionalmente?",
        sentenceToCompleteOrTranslate: "La noche del 23 de junio.",
        options: ["La noche del 23 de junio", "El primero de enero", "El 31 de octubre", "El 15 de agosto"],
        correctOptionIndex: 0,
        explanation: "Se celebra en la víspera del 24 de junio (la noche del 23)."
      }
    }
  },
  {
    id: "es-b1-4",
    nodeIndex: 14,
    type: "checkpoint",
    level: "B1",
    crownNumber: 3,
    levelBadge: "Corona 3 (B1)",
    unitNumber: 3,
    unitTitle: "Unidad 3: Anécdotas, Cultura y Expresión Intermedia (B1)",
    title: "Punto de Control: Narrador Intermedio",
    subtitle: "Evalúa tu capacidad de relatar sucesos pasados y articular argumentos complejos.",
    targetLanguage: "Español",
    langCode: "es-ES",
    xOffsetPercent: getSinusoidalOffset(13),
    carrotsReward: 20,
    lesson: {
      topicTitle: "Evaluación Intermedia B1",
      targetLanguage: "Español",
      level: "B1",
      vocabulary: [
        { word: "Por un lado... por otro", translation: "On one hand... on the other", phoneticOrPronunciationGuide: "/poɾ un ˈla.ðo/", exampleSentence: "Por un lado es rápido; por otro, requiere paciencia.", exampleTranslation: "On one hand it is fast; on the other, it requires patience." },
        { word: "Tener en cuenta", translation: "To take into account", phoneticOrPronunciationGuide: "/teˈneɾ en ˈkwen.ta/", exampleSentence: "Hay que tener en cuenta todos los factores.", exampleTranslation: "We must take into account all factors." },
        { word: "A lo largo de", translation: "Throughout / Along", phoneticOrPronunciationGuide: "/a lo ˈlaɾ.ɣo ðe/", exampleSentence: "A lo largo del curso aprendimos muchísimo.", exampleTranslation: "Throughout the course we learned a great deal." },
        { word: "En conclusión", translation: "In conclusion", phoneticOrPronunciationGuide: "/en kon.kluˈsjon/", exampleSentence: "En conclusión, el esfuerzo siempre vale la pena.", exampleTranslation: "In conclusion, effort is always worth it." }
      ],
      dialogue: [
        { speaker: "Examinador", text: "¡Has demostrado un progreso admirable! Cuéntame tu mayor logro.", translation: "You have shown admirable progress! Tell me about your greatest achievement." },
        { speaker: "Tuddy", text: "A lo largo de este nivel logré mantener conversaciones fluidas y comprender textos culturales.", translation: "Throughout this level I managed to hold fluent conversations and understand cultural texts." },
        { speaker: "Examinador", text: "¡Excelente! Has alcanzado con honores la Corona 3.", translation: "Excellent! You have achieved Crown 3 with honors." }
      ],
      listeningExercise: {
        audioText: "Teniendo en cuenta el esfuerzo y la práctica diaria, los estudiantes lograron superar todos los objetivos propuestos.",
        question: "¿Qué concluye el informe escuchado?",
        options: [
          "Que los estudiantes lograron superar todos los objetivos gracias a la práctica diaria.",
          "Que nadie aprobó la evaluación del curso.",
          "Que se cancelan los exámenes del próximo semestre.",
          "Que las clases serán exclusivamente por correspondencia postal."
        ],
        correctOptionIndex: 0,
        tip: "Escucha 'lograron superar todos los objetivos propuestos'."
      },
      readingExercise: {
        passageTitle: "La consolidación de la autonomía",
        passageText: "El nivel intermedio B1 representa el salto a la autonomía comunicativa: el estudiante ya no depende de frases memorizadas, sino que es capaz de improvisar, relatar imprevistos y justificar sus opiniones personales.",
        question: "¿Qué define principalmente el nivel B1?",
        options: [
          "El salto hacia la autonomía comunicativa e improvisación.",
          "Aprender únicamente a decir 'hola' y 'adiós'.",
          "Olvidar toda la gramática aprendida.",
          "Depender completamente de un traductor automático."
        ],
        correctOptionIndex: 0,
        explanation: "El texto define el B1 como el salto hacia la autonomía comunicativa e improvisación."
      },
      writingExercise: {
        prompt: "Traduce al español: 'In conclusion'",
        expectedAnswer: "En conclusión",
        alternativeAcceptable: ["en conclusion", "en conclusión", "En conclusion"],
        hint: "'En' + 'conclusión'."
      },
      interactiveChallenge: {
        promptText: "Para resumir tu postura al final de un debate, usas:",
        sentenceToCompleteOrTranslate: "En conclusión / Para terminar.",
        options: ["En conclusión", "Hola de nuevo", "Ayer por la tarde", "No tengo ni idea"],
        correctOptionIndex: 0,
        explanation: "'En conclusión' introduce el cierre sintético de un argumento."
      }
    }
  },
  {
    id: "es-b1-5",
    nodeIndex: 15,
    type: "chest",
    level: "B1",
    levelBadge: "Nivel B1 (Recompensa)",
    unitNumber: 3,
    unitTitle: "Unidad 3: Anécdotas, Cultura y Expresión Intermedia (B1)",
    title: "Cofre de Zanahorias B1 (Español)",
    subtitle: "¡Has conquistado el nivel B1! Desbloquea este cofre repleto de zanahorias para Tuddy.",
    targetLanguage: "Español",
    langCode: "es-ES",
    xOffsetPercent: getSinusoidalOffset(14),
    carrotsReward: 20
  },
  // UNIDAD 4: B2 • Modo Subjuntivo, Hipótesis y Debates
  {
    id: "es-b2-1",
    nodeIndex: 16,
    type: "lesson",
    level: "B2",
    levelBadge: "Nivel B2 (Avanzado)",
    unitNumber: 4,
    unitTitle: "Unidad 4: Debates, Hipótesis y Modo Subjuntivo (B2)",
    title: "El Fascinante Modo Subjuntivo",
    subtitle: "Domina deseos, dudas y emociones: 'Espero que tengas un buen viaje'.",
    targetLanguage: "Español",
    langCode: "es-ES",
    xOffsetPercent: getSinusoidalOffset(15),
    carrotsReward: 18,
    lesson: {
      topicTitle: "El Presente de Subjuntivo: Deseos y Probabilidades",
      targetLanguage: "Español",
      level: "B2",
      vocabulary: [
        { word: "Espero que tengas...", translation: "I hope you have...", phoneticOrPronunciationGuide: "/esˈpe.ɾo ke ˈten.ɡas/", exampleSentence: "Espero que tengas un día maravilloso.", exampleTranslation: "I hope you have a wonderful day." },
        { word: "Ojalá", translation: "Hopefully / God grant", phoneticOrPronunciationGuide: "/o.xaˈla/", exampleSentence: "¡Ojalá haga buen tiempo este fin de semana!", exampleTranslation: "Hopefully the weather is nice this weekend!" },
        { word: "Es importante que estudiemos", translation: "It is important that we study", phoneticOrPronunciationGuide: "/es im.poɾˈtan.te ke es.tuˈðje.mos/", exampleSentence: "Es importante que estudiemos con constancia.", exampleTranslation: "It is important that we study consistently." },
        { word: "Dudo que sea verdad", translation: "I doubt it is true", phoneticOrPronunciationGuide: "/ˈdu.ðo ke ˈse.a βeɾˈðað/", exampleSentence: "Dudo que sea tan complicado como dicen.", exampleTranslation: "I doubt it is as complicated as they say." }
      ],
      dialogue: [
        { speaker: "Marta", text: "¿Crees que Tuddy apruebe el examen de certificación mañana?", translation: "Do you think Tuddy will pass the certification exam tomorrow?" },
        { speaker: "Profesor", text: "No me cabe duda; espero que mantenga la calma y confíe en su preparación.", translation: "I have no doubt; I hope he stays calm and trusts in his preparation." },
        { speaker: "Marta", text: "¡Ojalá saque la calificación máxima!", translation: "Hopefully he gets the highest grade!" }
      ],
      listeningExercise: {
        audioText: "Es fundamental que todos los alumnos comprendan las instrucciones antes de que comience la prueba.",
        question: "¿Qué se requiere según la indicación?",
        options: [
          "Que los alumnos comprendan las instrucciones antes de que empiece la prueba.",
          "Que todos entreguen el examen en blanco inmediatamente.",
          "Que se vayan a casa a dormir.",
          "Que apaguen las luces del aula."
        ],
        correctOptionIndex: 0,
        tip: "Escucha la estructura de subjuntivo: 'es fundamental que comprendan'."
      },
      readingExercise: {
        passageTitle: "La riqueza del subjuntivo",
        passageText: "El modo subjuntivo es uno de los tesoros más expresivos del español: no describe hechos comprobados de la realidad objetiva, sino el mundo subjetivo de los deseos, las incertidumbres, las valoraciones y las esperanzas humanas.",
        question: "¿Qué expresa el modo subjuntivo en español?",
        options: [
          "El mundo subjetivo de los deseos, incertidumbres y esperanzas.",
          "Exclusivamente hechos científicos matemáticos comprobados.",
          "Cálculos numéricos de física cuántica.",
          "Palabras sin ningún significado gramatical."
        ],
        correctOptionIndex: 0,
        explanation: "El texto afirma que expresa el mundo subjetivo de deseos, dudas y valoraciones."
      },
      writingExercise: {
        prompt: "Traduce al español: 'Hopefully!'",
        expectedAnswer: "¡Ojalá!",
        alternativeAcceptable: ["Ojalá", "ojala", "¡Ojala!", "ojalá"],
        hint: "Palabra de origen árabe: 'Ojalá'."
      },
      interactiveChallenge: {
        promptText: "Tras la expresión de duda 'Dudo que...', ¿qué modo verbal se utiliza?",
        sentenceToCompleteOrTranslate: "Modo Subjuntivo (ej: Dudo que venga).",
        options: ["Modo Subjuntivo", "Modo Imperativo", "Infinitivo compuesto", "Futuro de indicativo"],
        correctOptionIndex: 0,
        explanation: "La duda y la negación de la certeza exigen el modo subjuntivo."
      }
    }
  },
  {
    id: "es-b2-2",
    nodeIndex: 17,
    type: "lesson",
    level: "B2",
    levelBadge: "Nivel B2 (Debate)",
    unitNumber: 4,
    unitTitle: "Unidad 4: Debates, Hipótesis y Modo Subjuntivo (B2)",
    title: "Debates Contemporáneos y Sociedad",
    subtitle: "Argumenta con elegancia sobre medio ambiente, tecnología y el futuro.",
    targetLanguage: "Español",
    langCode: "es-ES",
    xOffsetPercent: getSinusoidalOffset(16),
    carrotsReward: 18,
    lesson: {
      topicTitle: "Argumentación Avanzada y Pensamiento Crítico",
      targetLanguage: "Español",
      level: "B2",
      vocabulary: [
        { word: "El desarrollo sostenible", translation: "Sustainable development", phoneticOrPronunciationGuide: "/el de.saˈro.ʝo sos.teˈni.βle/", exampleSentence: "Debemos promover el desarrollo sostenible y las energías limpias.", exampleTranslation: "We must promote sustainable development and clean energies." },
        { word: "A pesar de que...", translation: "Even though / In spite of the fact that", phoneticOrPronunciationGuide: "/a peˈsaɾ ðe ke/", exampleSentence: "A pesar de que existen retos, avanzamos con optimismo.", exampleTranslation: "Even though challenges exist, we move forward with optimism." },
        { word: "Poner en tela de juicio", translation: "To call into question", phoneticOrPronunciationGuide: "/poˈneɾ en ˈte.la ðe ˈxwi.sjo/", exampleSentence: "Es sano poner en tela de juicio dogmas establecidos.", exampleTranslation: "It is healthy to call established dogmas into question." },
        { word: "Una perspectiva prometedora", translation: "A promising perspective", phoneticOrPronunciationGuide: "/ˈu.na peɾs.pekˈti.βa pɾo.me.teˈðo.ɾa/", exampleSentence: "La inteligencia artificial ofrece una perspectiva prometedora.", exampleTranslation: "Artificial intelligence offers a promising perspective." }
      ],
      dialogue: [
        { speaker: "Moderador", text: "¿Qué postura defienden frente a la transición energética en las ciudades?", translation: "What position do you defend regarding energy transition in cities?" },
        { speaker: "Tuddy", text: "A pesar de los costes iniciales, invertir en transporte eléctrico garantiza salud y sostenibilidad futura.", translation: "Despite initial costs, investing in electric transport guarantees future health and sustainability." },
        { speaker: "Moderador", text: "¡Una argumentación contundente y bien fundamentada!", translation: "A compelling and well-grounded argument!" }
      ],
      listeningExercise: {
        audioText: "Es imprescindible que los gobiernos y los ciudadanos colaboren estrechamente para proteger la biodiversidad del planeta.",
        question: "¿Cuál es la idea principal que transmite el mensaje?",
        options: [
          "La colaboración mutua entre gobiernos y ciudadanos para proteger la biodiversidad.",
          "Que los ciudadanos no tienen ninguna responsabilidad ecológica.",
          "Que el medio ambiente no necesita ningún cuidado.",
          "Que las ciudades deben talar todos sus parques."
        ],
        correctOptionIndex: 0,
        tip: "Escucha 'es imprescindible que colaboren estrechamente'."
      },
      readingExercise: {
        passageTitle: "La educación del siglo XXI",
        passageText: "El pensamiento crítico no consiste en criticar destructivamente, sino en analizar la evidencia, contrastar fuentes y formular hipótesis respaldadas por datos objetivos y empatía humana.",
        question: "¿En qué consiste el pensamiento crítico según el texto?",
        options: [
          "En analizar evidencias, contrastar fuentes y usar empatía.",
          "En rechazar cualquier tipo de conocimiento científico.",
          "En memorizar sin cuestionar nada en absoluto.",
          "En evitar cualquier tipo de lectura profunda."
        ],
        correctOptionIndex: 0,
        explanation: "El texto define el pensamiento crítico como análisis de evidencia, contraste de fuentes y empatía."
      },
      writingExercise: {
        prompt: "Traduce al español: 'Sustainable development'",
        expectedAnswer: "El desarrollo sostenible",
        alternativeAcceptable: ["desarrollo sostenible", "Desarrollo sostenible", "el desarrollo sostenible"],
        hint: "'El desarrollo' + 'sostenible'."
      },
      interactiveChallenge: {
        promptText: "La locución 'Poner en tela de juicio' significa:",
        sentenceToCompleteOrTranslate: "Dudar o cuestionar la veracidad de algo.",
        options: ["Dudar o cuestionar algo", "Coser una prenda de ropa", "Comprar una tela nueva", "Ir a un tribunal de justicia"],
        correctOptionIndex: 0,
        explanation: "'Poner en tela de juicio' es una expresión idiomática formal para cuestionar algo."
      }
    }
  },
  {
    id: "es-b2-3",
    nodeIndex: 18,
    type: "story",
    level: "B2",
    levelBadge: "Nivel B2 (Literatura)",
    unitNumber: 4,
    unitTitle: "Unidad 4: Debates, Hipótesis y Modo Subjuntivo (B2)",
    title: "Historia: El Ingenioso Hidalgo",
    subtitle: "Aventúrate con Don Quijote y Sancho Panza en el corazón de la literatura universal.",
    targetLanguage: "Español",
    langCode: "es-ES",
    xOffsetPercent: getSinusoidalOffset(17),
    carrotsReward: 20,
    lesson: {
      topicTitle: "Literatura Clásica Hispana y Miguel de Cervantes",
      targetLanguage: "Español",
      level: "B2",
      vocabulary: [
        { word: "Molinillos de viento", translation: "Windmills", phoneticOrPronunciationGuide: "/mo.liˈni.ʎos de ˈbjen.to/", exampleSentence: "Don Quijote confundió los molinos de viento con gigantes.", exampleTranslation: "Don Quixote mistook the windmills for giants." },
        { word: "La cordura y la locura", translation: "Sanity and madness", phoneticOrPronunciationGuide: "/la koɾˈðu.ɾa i la loˈku.ɾa/", exampleSentence: "La frontera entre la cordura y la locura es fascinante.", exampleTranslation: "The border between sanity and madness is fascinating." },
        { word: "Un caballero andante", translation: "A knight-errant", phoneticOrPronunciationGuide: "/un ka.βaˈʝe.ɾo anˈdan.te/", exampleSentence: "Deseaba ser un caballero andante y desfacer entuertos.", exampleTranslation: "He wished to be a knight-errant and undo wrongs." },
        { word: "La lealtad", translation: "Loyalty", phoneticOrPronunciationGuide: "/la le.alˈtað/", exampleSentence: "Sancho Panza demostró una lealtad inquebrantable.", exampleTranslation: "Sancho Panza demonstrated unwavering loyalty." }
      ],
      dialogue: [
        { speaker: "Sancho", text: "Mire vuestra merced que aquellos no son gigantes, sino molinos de viento.", translation: "Look, your grace, those are not giants, but windmills." },
        { speaker: "Don Quijote", text: "Bien se parece que no estás cursado en esto de las aventuras; son gigantes, ¡y yo lucharé contra ellos!", translation: "It clearly shows you are not well-versed in adventures; they are giants, and I will fight them!" },
        { speaker: "Tuddy", text: "¡Qué diálogo tan sublime entre el idealismo y el realismo terrenal!", translation: "What a sublime dialogue between idealism and earthly realism!" }
      ],
      listeningExercise: {
        audioText: "En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo.",
        question: "¿A qué obra cumbre de la literatura pertenecen estas inmortales palabras?",
        options: [
          "Don Quijote de la Mancha de Miguel de Cervantes.",
          "Cien años de soledad de Gabriel García Márquez.",
          "La Ilíada de Homero.",
          "Hamlet de William Shakespeare."
        ],
        correctOptionIndex: 0,
        tip: "Reconoce la famosa frase inicial: 'En un lugar de la Mancha'."
      },
      readingExercise: {
        passageTitle: "La dualidad humana",
        passageText: "La relación entre Don Quijote y Sancho Panza encarna las dos facetas del alma humana: el anhelo noble de transformar el mundo con ideales elevados y la sabiduría práctica y bondadosa enraizada en la realidad.",
        question: "¿Qué encarnan Don Quijote y Sancho Panza?",
        options: [
          "El idealismo noble y el realismo bondadoso del ser humano.",
          "Dos soldados en una guerra espacial moderna.",
          "Dos reyes que no hablaban entre sí.",
          "Personajes que nunca existieron en los libros."
        ],
        correctOptionIndex: 0,
        explanation: "El texto resalta la dualidad entre ideales nobles y sabiduría práctica."
      },
      writingExercise: {
        prompt: "Traduce al español: 'Loyalty'",
        expectedAnswer: "La lealtad",
        alternativeAcceptable: ["lealtad", "Lealtad", "la lealtad"],
        hint: "'La lealtad'."
      },
      interactiveChallenge: {
        promptText: "¿Quién escribió 'Don Quijote de la Mancha'?",
        sentenceToCompleteOrTranslate: "Miguel de Cervantes Saavedra.",
        options: ["Miguel de Cervantes", "Pablo Neruda", "Federico García Lorca", "Jorge Luis Borges"],
        correctOptionIndex: 0,
        explanation: "Miguel de Cervantes Saavedra es el autor de la inmortal novela de 1605."
      }
    }
  },
  {
    id: "es-b2-4",
    nodeIndex: 19,
    type: "checkpoint",
    level: "B2",
    crownNumber: 4,
    levelBadge: "Corona 4 (B2)",
    unitNumber: 4,
    unitTitle: "Unidad 4: Debates, Hipótesis y Modo Subjuntivo (B2)",
    title: "Punto de Control: Orador Avanzado",
    subtitle: "Supera el reto de fluidez B2 demostrando precisión sintáctica y sutileza discursiva.",
    targetLanguage: "Español",
    langCode: "es-ES",
    xOffsetPercent: getSinusoidalOffset(18),
    carrotsReward: 22,
    lesson: {
      topicTitle: "Consolidación de Nivel B2",
      targetLanguage: "Español",
      level: "B2",
      vocabulary: [
        { word: "Por mucho que intentes...", translation: "No matter how much you try...", phoneticOrPronunciationGuide: "/poɾ ˈmu.tʃo ke inˈten.tes/", exampleSentence: "Por mucho que intentes desanimarme, persistiré.", exampleTranslation: "No matter how much you try to discourage me, I will persist." },
        { word: "En caso de que...", translation: "In case...", phoneticOrPronunciationGuide: "/en ˈka.so ðe ke/", exampleSentence: "En caso de que tengas preguntas, Tuddy te ayudará.", exampleTranslation: "In case you have questions, Tuddy will help you." },
        { word: "Con tal de que...", translation: "As long as / Provided that...", phoneticOrPronunciationGuide: "/kon tal de ke/", exampleSentence: "Iremos al viaje con tal de que termines tus repasos.", exampleTranslation: "We will go on the trip provided that you finish your reviews." },
        { word: "A menos que...", translation: "Unless...", phoneticOrPronunciationGuide: "/a ˈme.nos ke/", exampleSentence: "No saldremos a menos que cese la tormenta.", exampleTranslation: "We will not go out unless the storm stops." }
      ],
      dialogue: [
        { speaker: "Examinador", text: "¡Llegamos a la prueba de la Corona 4! ¿Cómo valoras tu dominio del subjuntivo?", translation: "We have arrived at the Crown 4 test! How do you evaluate your mastery of the subjunctive?" },
        { speaker: "Tuddy", text: "Me siento seguro; ahora puedo formular hipótesis complejas con tal de que preste atención a los conectores.", translation: "I feel confident; now I can formulate complex hypotheses provided that I pay attention to connectors." },
        { speaker: "Examinador", text: "¡Impecable respuesta! Has superado con maestría el Nivel B2.", translation: "Flawless response! You have mastered Level B2." }
      ],
      listeningExercise: {
        audioText: "A menos que desarrollemos hábitos constantes de estudio, será muy difícil consolidar el vocabulario a largo plazo.",
        question: "¿Qué condición se establece en la afirmación?",
        options: [
          "La necesidad de hábitos constantes para consolidar el vocabulario a largo plazo.",
          "Que estudiar una sola vez al año es suficiente.",
          "Que los hábitos diarios perjudican la memoria.",
          "Que el vocabulario se aprende sin ningún esfuerzo."
        ],
        correctOptionIndex: 0,
        tip: "Atento al conector condicional 'A menos que desarrollemos...'."
      },
      readingExercise: {
        passageTitle: "La cima de la precisión",
        passageText: "El nivel B2 es el estándar internacional exigido por universidades y empresas globales: certifica que el hablante no solo comprende ideas complejas, sino que interactúa con hablantes nativos con fluidez espontánea sin tensión alguna.",
        question: "¿Qué certifica el nivel B2 a nivel internacional?",
        options: [
          "Comprensión de ideas complejas e interacción espontánea sin tensión.",
          "Saber contar únicamente del uno al diez.",
          "Traducir palabra por palabra con diccionario físico.",
          "No ser capaz de opinar en ninguna reunión."
        ],
        correctOptionIndex: 0,
        explanation: "El texto afirma que certifica comprensión de ideas complejas y fluidez espontánea."
      },
      writingExercise: {
        prompt: "Traduce al español: 'Unless...'",
        expectedAnswer: "A menos que",
        alternativeAcceptable: ["a menos que", "A no ser que", "a no ser que"],
        hint: "'A menos que'."
      },
      interactiveChallenge: {
        promptText: "El conector 'Con tal de que...' exige siempre:",
        sentenceToCompleteOrTranslate: "Verbo en modo subjuntivo.",
        options: ["Verbo en modo subjuntivo", "Verbo en pasado simple", "Un sustantivo sin verbo", "Una preposición en inglés"],
        correctOptionIndex: 0,
        explanation: "'Con tal de que' es una locución condicional que rige obligatoriamente subjuntivo."
      }
    }
  },
  {
    id: "es-b2-5",
    nodeIndex: 20,
    type: "chest",
    level: "B2",
    levelBadge: "Nivel B2 (Recompensa)",
    unitNumber: 4,
    unitTitle: "Unidad 4: Debates, Hipótesis y Modo Subjuntivo (B2)",
    title: "Cofre de Zanahorias B2 (Español)",
    subtitle: "¡Impresionante logro! Has superado el Nivel B2. Disfruta de esta copiosa recompensa de zanahorias.",
    targetLanguage: "Español",
    langCode: "es-ES",
    xOffsetPercent: getSinusoidalOffset(19),
    carrotsReward: 25
  },
  // UNIDAD 5: C1 • Elocuencia, Modismos y Fluidez Nativa
  {
    id: "es-c1-1",
    nodeIndex: 21,
    type: "lesson",
    level: "C1",
    levelBadge: "Nivel C1 (Maestría)",
    unitNumber: 5,
    unitTitle: "Unidad 5: Elocuencia, Modismos y Maestría Total (C1)",
    title: "Expresiones Idiomáticas y Dichos Populares",
    subtitle: "Aprende las frases hechas que usan los nativos: 'Ponerse las pilas', 'Estar en las nubes'.",
    targetLanguage: "Español",
    langCode: "es-ES",
    xOffsetPercent: getSinusoidalOffset(0),
    carrotsReward: 20,
    lesson: {
      topicTitle: "Modismos y Giros Lingüísticos del Español",
      targetLanguage: "Español",
      level: "C1",
      vocabulary: [
        { word: "Ponerse las pilas", translation: "To get one's act together / To power up", phoneticOrPronunciationGuide: "/poˈneɾ.se las ˈpi.las/", exampleSentence: "Hay examen la próxima semana: ¡toca ponerse las pilas!", exampleTranslation: "There's an exam next week: time to get our act together!" },
        { word: "Estar en las nubes", translation: "To daydream / To have one's head in the clouds", phoneticOrPronunciationGuide: "/esˈtaɾ en las ˈnu.βes/", exampleSentence: "Disculpa, no te escuché, estaba en las nubes pensando en el proyecto.", exampleTranslation: "Sorry, I didn't hear you, I was daydreaming about the project." },
        { word: "Tomar el pelo", translation: "To pull someone's leg / To tease", phoneticOrPronunciationGuide: "/toˈmaɾ el ˈpe.lo/", exampleSentence: "¿Me estás tomando el pelo o es en serio?", exampleTranslation: "Are you pulling my leg or are you serious?" },
        { word: "De sol a sol", translation: "From dawn to dusk", phoneticOrPronunciationGuide: "/de sol a sol/", exampleSentence: "Estudió de sol a sol para obtener la beca de excelencia.", exampleTranslation: "He studied from dawn to dusk to obtain the excellence scholarship." }
      ],
      dialogue: [
        { speaker: "Amiga", text: "¡Tuddy! Te veo muy concentrado hoy, ¿no estabas ayer en las nubes?", translation: "Tuddy! You look very focused today, weren't you daydreaming yesterday?" },
        { speaker: "Tuddy", text: "¡Sí! Pero hoy me he puesto las pilas de verdad para dominar todas las lecciones.", translation: "Yes! But today I truly got my act together to master all the lessons." },
        { speaker: "Amiga", text: "¡Así se habla! Quien se esfuerza de sol a sol siempre recoge grandes frutos.", translation: "That's the spirit! Whoever strives from dawn to dusk always reaps great rewards." }
      ],
      listeningExercise: {
        audioText: "No le hagas caso a Juan, solo te está tomando el pelo; pero más vale que nos pongamos las pilas con la entrega.",
        question: "¿Qué significado tienen los dos modismos empleados en el audio?",
        options: [
          "Juan solo está bromeando, y deben activarse y trabajar con energía.",
          "Juan le está cortando el cabello en una peluquería.",
          "Tienen que comprar pilas y baterías eléctricas.",
          "Están buscando nubes en el cielo azul."
        ],
        correctOptionIndex: 0,
        tip: "'Tomar el pelo' significa bromear; 'ponerse las pilas' significa ponerse en acción."
      },
      readingExercise: {
        passageTitle: "El alma de los refranes",
        passageText: "Los modismos y refranes condensan siglos de agudeza popular. Hablar en nivel C1 significa trascender la traducción literal para sentir las resonancias culturales, el doble sentido y la ironía afectuosa del idioma.",
        question: "¿Qué reflejan los modismos según el texto?",
        options: [
          "Siglos de agudeza popular y resonancias culturales.",
          "Errores que nunca deben usarse en el lenguaje.",
          "Fórmulas matemáticas de álgebra.",
          "Nombres de marcas comerciales."
        ],
        correctOptionIndex: 0,
        explanation: "El texto afirma que condensan siglos de agudeza popular y resonancias culturales."
      },
      writingExercise: {
        prompt: "Traduce al español el modismo: 'To get one's act together / To power up'",
        expectedAnswer: "Ponerse las pilas",
        alternativeAcceptable: ["ponerse las pilas", "Ponerse las pilas."],
        hint: "'Ponerse' + 'las pilas'."
      },
      interactiveChallenge: {
        promptText: "Si alguien está despistado o soñando despierto, dices que:",
        sentenceToCompleteOrTranslate: "Está en las nubes.",
        options: ["Está en las nubes", "Está en el suelo", "Está bajo el agua", "Está detrás de la puerta"],
        correctOptionIndex: 0,
        explanation: "'Estar en las nubes' significa estar distraído o absorto en sus pensamientos."
      }
    }
  },
  {
    id: "es-c1-2",
    nodeIndex: 22,
    type: "lesson",
    level: "C1",
    levelBadge: "Nivel C1 (Retórica)",
    unitNumber: 5,
    unitTitle: "Unidad 5: Elocuencia, Modismos y Maestría Total (C1)",
    title: "Retórica, Persuasión y Matices",
    subtitle: "Aprende a formular discursos cautivadores con ritmo, metáforas y cadencia.",
    targetLanguage: "Español",
    langCode: "es-ES",
    xOffsetPercent: getSinusoidalOffset(1),
    carrotsReward: 20,
    lesson: {
      topicTitle: "Oratoria, Discurso Académico y Estilística",
      targetLanguage: "Español",
      level: "C1",
      vocabulary: [
        { word: "Ciertamente", translation: "Certainly / Indeed", phoneticOrPronunciationGuide: "/sjeɾ.taˈmen.te/", exampleSentence: "Ciertamente, el conocimiento es el tesoro más imperecedero.", exampleTranslation: "Certainly, knowledge is the most imperishable treasure." },
        { word: "En aras de...", translation: "For the sake of...", phoneticOrPronunciationGuide: "/en ˈa.ɾas ðe/", exampleSentence: "Trabajamos en aras del bienestar común.", exampleTranslation: "We work for the sake of common welfare." },
        { word: "Un abanico de posibilidades", translation: "A wide range of possibilities", phoneticOrPronunciationGuide: "/un a.βaˈni.ko ðe po.si.βi.liˈða.ðes/", exampleSentence: "Este proyecto abre un abanico inmenso de posibilidades.", exampleTranslation: "This project opens an immense range of possibilities." },
        { word: "Irrevocablemente", translation: "Irrevocably", phoneticOrPronunciationGuide: "/i.re.βo.kaˈβleˈmen.te/", exampleSentence: "La sociedad ha cambiado irrevocablemente con la era digital.", exampleTranslation: "Society has irrevocably changed with the digital era." }
      ],
      dialogue: [
        { speaker: "Colega", text: "¿Cómo resumirías la meta de nuestro plan de estudios?", translation: "How would you summarize the goal of our study plan?" },
        { speaker: "Tuddy", text: "Actuamos en aras de la excelencia académica, abriendo un abanico infinito de posibilidades a cada estudiante.", translation: "We act for the sake of academic excellence, opening an infinite range of possibilities for each student." },
        { speaker: "Colega", text: "¡Qué precisión y belleza verbal, Tuddy! Tu nivel de elocuencia es inspirador.", translation: "What precision and verbal beauty, Tuddy! Your level of eloquence is inspiring." }
      ],
      listeningExercise: {
        audioText: "Es innegable que, en aras del progreso científico, debemos fomentar la curiosidad intelectual desde la más tierna infancia.",
        question: "¿Qué mensaje primordial se defiende en la intervención?",
        options: [
          "Fomentar la curiosidad intelectual en aras del progreso científico.",
          "Prohibir el estudio de las ciencias naturales.",
          "Cerrar los laboratorios de investigación.",
          "Memorizar fórmulas sin comprenderlas."
        ],
        correctOptionIndex: 0,
        tip: "Escucha 'en aras del progreso científico' y 'fomentar la curiosidad'."
      },
      readingExercise: {
        passageTitle: "La arquitectura del idioma",
        passageText: "En el nivel C1, el estudiante se convierte en un artesano del lenguaje: elige las palabras no solo por su significado denotativo, sino por su sonoridad, su cadencia rítmica y su capacidad para emocionar al oyente más exigente.",
        question: "¿Cómo se describe al estudiante en el nivel C1?",
        options: [
          "Como un artesano del lenguaje que cuida sonoridad, ritmo y emoción.",
          "Como un principiante que comete errores en cada frase.",
          "Como alguien que solo sabe traducir textos técnicos de memoria.",
          "Como un espectador pasivo que no participa."
        ],
        correctOptionIndex: 0,
        explanation: "El texto afirma que el estudiante es un artesano del lenguaje que cuida sonoridad, cadencia y emoción."
      },
      writingExercise: {
        prompt: "Traduce al español la locución formal: 'For the sake of...'",
        expectedAnswer: "En aras de",
        alternativeAcceptable: ["en aras de", "En aras de..."],
        hint: "'En' + 'aras' + 'de'."
      },
      interactiveChallenge: {
        promptText: "La metáfora 'un abanico de posibilidades' alude a:",
        sentenceToCompleteOrTranslate: "Una amplia y variada gama de opciones.",
        options: ["Una amplia variedad de opciones", "Un objeto para darse aire en verano", "Un solo camino estrecho", "Una puerta cerrada con llave"],
        correctOptionIndex: 0,
        explanation: "Metáfora que ilustra diversidad y amplitud de alternativas."
      }
    }
  },
  {
    id: "es-c1-3",
    nodeIndex: 23,
    type: "story",
    level: "C1",
    levelBadge: "Nivel C1 (Filosofía)",
    unitNumber: 5,
    unitTitle: "Unidad 5: Elocuencia, Modismos y Maestría Total (C1)",
    title: "Historia: La Biblioteca de Babel",
    subtitle: "Reflexiona con Jorge Luis Borges sobre el infinito, los espejos y el laberinto de la mente.",
    targetLanguage: "Español",
    langCode: "es-ES",
    xOffsetPercent: getSinusoidalOffset(2),
    carrotsReward: 22,
    lesson: {
      topicTitle: "Pensamiento Filosófico y Borges",
      targetLanguage: "Español",
      level: "C1",
      vocabulary: [
        { word: "El laberinto", translation: "The labyrinth", phoneticOrPronunciationGuide: "/el la.βeˈɾin.to/", exampleSentence: "El laberinto de la memoria desafía la lógica lineal.", exampleTranslation: "The labyrinth of memory defies linear logic." },
        { word: "Infinito", translation: "Infinite", phoneticOrPronunciationGuide: "/in.fiˈni.to/", exampleSentence: "El universo de los libros es inagotable e infinito.", exampleTranslation: "The universe of books is inexhaustible and infinite." },
        { word: "Un espejo", translation: "A mirror", phoneticOrPronunciationGuide: "/un esˈpe.xo/", exampleSentence: "Los espejos duplican la realidad y desconciertan al caminante.", exampleTranslation: "Mirrors duplicate reality and bewilder the traveler." },
        { word: "Eternidad", translation: "Eternity", phoneticOrPronunciationGuide: "/e.teɾ.niˈðað/", exampleSentence: "Las grandes ideas trascienden el tiempo hacia la eternidad.", exampleTranslation: "Great ideas transcend time toward eternity." }
      ],
      dialogue: [
        { speaker: "Lector", text: "¿Qué representa la Biblioteca infinita según Borges?", translation: "What does the infinite Library represent according to Borges?" },
        { speaker: "Tuddy", text: "Representa el universo entero: una arquitectura hexagonal incesante donde cada combinación de letras ya fue escrita.", translation: "It represents the entire universe: an incessant hexagonal architecture where every combination of letters has already been written." },
        { speaker: "Lector", text: "¡Una meditación deslumbrante sobre el conocimiento y los límites humanos!", translation: "A dazzling meditation on knowledge and human limits!" }
      ],
      listeningExercise: {
        audioText: "El universo, que otros llaman la Biblioteca, se compone de un número indefinido, y tal vez infinito, de galerías hexagonales.",
        question: "¿Cómo concibe Borges el universo en este célebre pasaje?",
        options: [
          "Como una Biblioteca de galerías hexagonales indefinidas e infinitas.",
          "Como un estadio de fútbol moderno.",
          "Como un desierto sin ningún libro ni palabra.",
          "Como una pequeña habitación cerrada."
        ],
        correctOptionIndex: 0,
        tip: "Escucha 'El universo, que otros llaman la Biblioteca'."
      },
      readingExercise: {
        passageTitle: "La búsqueda del sentido",
        passageText: "Borges plantea que en algún anaquel recóndito de la Biblioteca existe un libro que contiene la justificación y el catálogo de todos los demás. La búsqueda incansable de ese volumen es la metáfora de la sed de saber del ser humano.",
        question: "¿Qué simboliza la búsqueda de ese libro único?",
        options: [
          "La incansable sed de saber y de sentido del ser humano.",
          "El deseo de ganar dinero rápido.",
          "La necesidad de aprender a nadar.",
          "Una receta de cocina olvidada."
        ],
        correctOptionIndex: 0,
        explanation: "El texto afirma que es la metáfora de la sed de saber del ser humano."
      },
      writingExercise: {
        prompt: "Traduce al español: 'The labyrinth'",
        expectedAnswer: "El laberinto",
        alternativeAcceptable: ["el laberinto", "Laberinto", "laberinto"],
        hint: "'El laberinto'."
      },
      interactiveChallenge: {
        promptText: "El adjetivo 'inagotable' describe algo que:",
        sentenceToCompleteOrTranslate: "Nunca se acaba ni se agota.",
        options: ["Nunca se acaba ni se agota", "Se termina en dos segundos", "Está roto", "Tiene color verde"],
        correctOptionIndex: 0,
        explanation: "'Inagotable' significa que no se puede agotar por grande o abundante que sea."
      }
    }
  },
  {
    id: "es-c1-4",
    nodeIndex: 24,
    type: "checkpoint",
    level: "C1",
    crownNumber: 5,
    levelBadge: "Corona 5 (C1)",
    unitNumber: 5,
    unitTitle: "Unidad 5: Elocuencia, Modismos y Maestría Total (C1)",
    title: "Punto de Control: La Corona de Oro de Tuddy",
    subtitle: "El desafío supremo de fluidez, erudición y expresión nativa en español.",
    targetLanguage: "Español",
    langCode: "es-ES",
    xOffsetPercent: getSinusoidalOffset(3),
    carrotsReward: 25,
    lesson: {
      topicTitle: "Evaluación Suprema de Nivel C1",
      targetLanguage: "Español",
      level: "C1",
      vocabulary: [
        { word: "Paradigma", translation: "Paradigm", phoneticOrPronunciationGuide: "/pa.ɾaˈðiɣ.ma/", exampleSentence: "Este método representa un cambio de paradigma en el aprendizaje.", exampleTranslation: "This method represents a paradigm shift in learning." },
        { word: "Sin parangón", translation: "Unparalleled / Matchless", phoneticOrPronunciationGuide: "/sin pa.ɾaŋˈɡon/", exampleSentence: "Tu dedicación ha sido un ejemplo sin parangón.", exampleTranslation: "Your dedication has been an unparalleled example." },
        { word: "Plenitud", translation: "Fullness / Plenitude", phoneticOrPronunciationGuide: "/ple.niˈtuð/", exampleSentence: "Alcanzar la fluidez plena es un sentimiento de inmensa plenitud.", exampleTranslation: "Reaching full fluency is a feeling of immense plenitude." },
        { word: "Inquebrantable", translation: "Unshakeable", phoneticOrPronunciationGuide: "/iŋ.ke.βɾanˈta.βle/", exampleSentence: "Mantuviste una disciplina inquebrantable a lo largo del viaje.", exampleTranslation: "You maintained unshakeable discipline throughout the journey." }
      ],
      dialogue: [
        { speaker: "Gran Maestro Tuddy", text: "¡Has llegado a la cumbre de la Campaña de Español! ¿Qué sientes al contemplar todo tu camino recorrido?", translation: "You have arrived at the summit of the Spanish Campaign! What do you feel as you gaze upon your entire journey?" },
        { speaker: "Estudiante", text: "Siento una profunda plenitud; el español es ahora parte viva de mi pensamiento y mi voz.", translation: "I feel a profound fullness; Spanish is now a living part of my thought and voice." },
        { speaker: "Gran Maestro Tuddy", text: "¡Te otorgo con inmenso orgullo la Corona 5 de Oro! ¡Eres un auténtico maestro políglota!", translation: "I award you with immense pride the Gold Crown 5! You are a true polyglot master!" }
      ],
      listeningExercise: {
        audioText: "Quien domina las palabras forja su propio destino: felicidades por culminar con honores esta travesía lingüística sin parangón.",
        question: "¿Qué mensaje solemne proclama el audio final?",
        options: [
          "Felicita por culminar con honores una travesía lingüística sin parangón.",
          "Advierte de que hay que repetir el nivel A1 desde cero.",
          "Ordena apagar el teléfono móvil.",
          "Dice que los idiomas ya no son necesarios."
        ],
        correctOptionIndex: 0,
        tip: "Celebra 'culminar con honores esta travesía lingüística sin parangón'."
      },
      readingExercise: {
        passageTitle: "La corona del políglota",
        passageText: "Dominar un idioma en nivel C1 no es solo conocer su gramática: es abrazar una nueva cosmovisión, conectar con millones de almas y expandir la propia identidad hacia horizontes infinitos.",
        question: "¿Qué significa verdaderamente dominar un idioma según el texto final?",
        options: [
          "Abrazar una nueva cosmovisión y expandir la identidad hacia horizontes infinitos.",
          "Aprender únicamente a pasar pruebas escritas.",
          "Olvidar a los amigos de la infancia.",
          "Nunca más volver a estudiar."
        ],
        correctOptionIndex: 0,
        explanation: "El texto afirma que es abrazar una nueva cosmovisión y expandir la identidad hacia horizontes infinitos."
      },
      writingExercise: {
        prompt: "Traduce al español la palabra erudita: 'Unparalleled / Matchless'",
        expectedAnswer: "Sin parangón",
        alternativeAcceptable: ["sin parangon", "sin parangón", "Sin parangon"],
        hint: "'Sin' + 'parangón'."
      },
      interactiveChallenge: {
        promptText: "¡Pregunta de Maestría C1! ¿Cuál es el significado de 'cambio de paradigma'?",
        sentenceToCompleteOrTranslate: "Una transformación profunda en el modelo o enfoque de comprensión.",
        options: ["Una transformación profunda de modelo", "Un error ortográfico", "Un cambio de moneda extranjera", "Un tren que cambia de vía"],
        correctOptionIndex: 0,
        explanation: "Un cambio de paradigma es una revolución en el modo de entender y abordar la realidad."
      }
    }
  },
  {
    id: "es-c1-5",
    nodeIndex: 25,
    type: "chest",
    level: "C1",
    levelBadge: "Nivel C1 (Cofre Legendario)",
    unitNumber: 5,
    unitTitle: "Unidad 5: Elocuencia, Modismos y Maestría Total (C1)",
    title: "Gran Cofre Legendario de Tuddy (Español C1)",
    subtitle: "¡Has completado el camino clásico! Reclama 30 zanahorias doradas y desbloquea los niveles infinitos continuos.",
    targetLanguage: "Español",
    langCode: "es-ES",
    xOffsetPercent: getSinusoidalOffset(4),
    carrotsReward: 30
  }
];

// =========================================================================
// INFINITE CAMPAIGN CURRICULUM GENERATOR (NIVELES INFINITOS)
// Genera unidades procedurales dinámicas (Unidad 6, 7, 8, ... hasta el infinito)
// garantizando que el usuario siempre tenga niveles nuevos por descubrir.
// =========================================================================

interface InfiniteUnitTemplate {
  title: string;
  subtitle: string;
  topic: string;
  level: "C1+" | "C2" | "C2+" | "Maestría" | "Políglota" | "Élite" | "Leyenda";
  badge: string;
  vocab: Array<{ word: string; translation: string; pronunciation: string; example: string; exampleTrans: string }>;
  dialogueTopic: string;
  passageTitle: string;
  passageText: string;
  question: string;
  options: [string, string, string, string];
  challengePrompt: string;
  challengeAnswer: string;
}

const INFINITE_TEMPLATES: InfiniteUnitTemplate[] = [
  {
    title: "Modismos Avanzados y Jerga Cultural",
    subtitle: "Sumérgete en la ironía sutil, modismos coloquiales y el humor nativo.",
    topic: "Expresiones Idiomáticas y Sutilezas Coloquiales",
    level: "C1+",
    badge: "Nivel C1+ (Avanzado Continuo)",
    vocab: [
      { word: "Dar en el clavo", translation: "To hit the nail on the head", pronunciation: "/daɾ en el ˈkla.βo/", example: "Tu análisis dio exactamente en el clavo.", exampleTrans: "Your analysis hit the nail right on the head." },
      { word: "Por si las moscas", translation: "Just in case", pronunciation: "/poɾ si las ˈmos.kas/", example: "Llevo el paraguas por si las moscas.", exampleTrans: "I'm taking an umbrella just in case." },
      { word: "Estar en su salsa", translation: "To be in one's element", pronunciation: "/esˈtaɾ en su ˈsal.sa/", example: "Hablando de ciencia, Tuddy está en su salsa.", exampleTrans: "Talking about science, Tuddy is in his element." },
      { word: "A pedir de boca", translation: "According to plan / Smoothly", pronunciation: "/a peˈðiɾ ðe ˈβo.ka/", example: "Todo salió a pedir de boca en la presentación.", exampleTrans: "Everything went smoothly in the presentation." }
    ],
    dialogueTopic: "Debate distendido sobre anécdotas cotidianas y refranes.",
    passageTitle: "La vivacidad del lenguaje callejero",
    passageText: "El idioma evoluciona en las plazas, en las cafeterías y en las conversaciones espontáneas. Dominar modismos permite descifrar el subtexto y la cercanía que ninguna regla rígida de gramática puede enseñar por sí sola.",
    question: "¿Qué permite descifrar el dominio de los modismos según la lectura?",
    options: ["El subtexto y la cercanía afectiva en la conversación.", "El precio exacto del billete de metro.", "Las matemáticas de la física cuántica.", "El horario de apertura de una tienda."],
    challengePrompt: "La frase 'dar en el clavo' significa acertar plenamente.",
    challengeAnswer: "Dar en el clavo"
  },
  {
    title: "Debates y Argumentación Crítica",
    subtitle: "Defiende tesis complejas en política, ética científica y filosofía moderna.",
    topic: "Retórica Dialéctica y Discurso Racional",
    level: "C2",
    badge: "Nivel C2 (Maestría Nativa)",
    vocab: [
      { word: "Una encrucijada ética", translation: "An ethical dilemma / crossroads", pronunciation: "/ˈu.na eŋ.kɾu.siˈxa.ða ˈe.ti.ka/", example: "Nos encontramos ante una encrucijada ética decisiva.", exampleTrans: "We find ourselves at a decisive ethical crossroads." },
      { word: "Soslayar", translation: "To evade / To circumvent", pronunciation: "/sos.laˈʝaɾ/", example: "No podemos soslayar la gravedad del asunto.", exampleTrans: "We cannot evade the seriousness of the matter." },
      { word: "Piedra angular", translation: "Cornerstone", pronunciation: "/ˈpje.ðɾa aŋ.ɡuˈlaɾ/", example: "La honestidad es la piedra angular de la investigación.", exampleTrans: "Honesty is the cornerstone of research." },
      { word: "Sin menoscabo de...", translation: "Without prejudice to / Without undermining", pronunciation: "/sin me.nosˈka.βo ðe/", example: "Avanzamos sin menoscabo de nuestros principios.", exampleTrans: "We advance without undermining our principles." }
    ],
    dialogueTopic: "Mesa redonda sobre ética e inteligencia artificial con Tuddy.",
    passageTitle: "El valor del discernimiento",
    passageText: "La madurez dialéctica no radica en imponer opiniones a través de la vehemencia, sino en articular objeciones fundadas, reconocer las virtudes del adversario y construir síntesis más ricas a partir del desacuerdo.",
    question: "¿En qué radica la madurez dialéctica según el texto?",
    options: ["En articular objeciones fundadas y construir síntesis enriquecedoras.", "En gritar más fuerte que los demás en la sala.", "En no escuchar las opiniones de los otros.", "En abandonar el debate antes de empezar."],
    challengePrompt: "La metáfora 'piedra angular' se refiere al fundamento esencial de algo.",
    challengeAnswer: "Piedra angular"
  },
  {
    title: "Cultura, Cine y Literatura Universal",
    subtitle: "Analiza obras maestras, metáforas poéticas y el lenguaje audiovisual.",
    topic: "Análisis Estético y Reseña Cultural",
    level: "C2+",
    badge: "Nivel C2+ (Elocuencia Superior)",
    vocab: [
      { word: "Cliaroscuro", translation: "Chiaroscuro / Contrast", pronunciation: "/kja.ɾosˈku.ɾo/", example: "La película utiliza un claroscuro visual cautivador.", exampleTrans: "The movie uses a captivating visual chiaroscuro." },
      { word: "Evocador", translation: "Evocative", pronunciation: "/e.βo.kaˈðoɾ/", example: "El poema tiene un ritmo profundamente evocador.", exampleTrans: "The poem has a deeply evocative rhythm." },
      { word: "Metáfora fecunda", translation: "Fruitful metaphor", pronunciation: "/meˈta.fo.ɾa feˈkun.da/", example: "Borges construye una metáfora fecunda del infinito.", exampleTrans: "Borges builds a fruitful metaphor of infinity." },
      { word: "Sublime", translation: "Sublime", pronunciation: "/suˈβli.me/", example: "La interpretación musical fue sencillamente sublime.", exampleTrans: "The musical performance was simply sublime." }
    ],
    dialogueTopic: "Comentario crítico sobre la novela y el cine contemporáneo.",
    passageTitle: "El arte como espejo del tiempo",
    passageText: "Las expresiones artísticas dialogan con las inquietudes de su época. Al profundizar en el vocabulario estético, dotamos a nuestra voz de la sutileza necesaria para apreciar los matices de la belleza y la creatividad humana.",
    question: "¿Qué función cumple el vocabulario estético en la comunicación?",
    options: ["Dota a nuestra voz de la sutileza para apreciar matices artísticos.", "Hace que las canciones duren menos tiempo.", "Obliga a mirar películas sin subtítulos.", "Elimina los instrumentos de la orquesta."],
    challengePrompt: "Un texto o imagen que despierta recuerdos intensos es:",
    challengeAnswer: "Evocador"
  },
  {
    title: "Negocios Globales y Diplomacia",
    subtitle: "Estrategias de negociación de alto nivel, cortesía ejecutiva y acuerdos internacionales.",
    topic: "Comunicación Profesional y Oratoria Diplomática",
    level: "Maestría",
    badge: "Nivel Maestría (Liderazgo Global)",
    vocab: [
      { word: "Llegar a un consenso", translation: "To reach a consensus", pronunciation: "/ʝeˈɣaɾ a un konˈsen.so/", example: "Las partes lograron llegar a un consenso constructivo.", exampleTrans: "The parties managed to reach a constructive consensus." },
      { word: "Una propuesta vinculante", translation: "A binding proposal", pronunciation: "/ˈu.na pɾoˈpwes.ta biŋ.kuˈlan.te/", example: "Presentaron una propuesta formal y vinculante.", exampleTrans: "They presented a formal and binding proposal." },
      { word: "Tender puentes", translation: "To build bridges", pronunciation: "/tenˈdeɾ ˈpwen.tes/", example: "La diplomacia busca tender puentes entre culturas.", exampleTrans: "Diplomacy seeks to build bridges between cultures." },
      { word: "De mutuo acuerdo", translation: "By mutual agreement", pronunciation: "/de ˈmu.two aˈkweɾ.ðo/", example: "Firmaron el convenio de mutuo acuerdo.", exampleTrans: "They signed the agreement by mutual agreement." }
    ],
    dialogueTopic: "Simulación de cumbre multilateral con Tuddy como embajador de paz.",
    passageTitle: "El poder de la diplomacia",
    passageText: "La verdadera negociación no busca vencer al interlocutor, sino crear valor compartido donde ambas partes encuentren beneficio mutuo y duradero. La precisión lingüística previene malentendidos y cimenta la confianza duradera.",
    question: "¿Cuál es el objetivo primordial de la negociación diplomática según el texto?",
    options: ["Crear valor compartido y beneficio mutuo duradero.", "Derrotar y humillar a la otra parte.", "Firmar sin leer los documentos.", "Cancelar todas las reuniones."],
    challengePrompt: "La expresión diplomática para acercar posturas entre partes opuestas es:",
    challengeAnswer: "Tender puentes"
  },
  {
    title: "Filosofía, Ciencia y Actualidad Cósmica",
    subtitle: "Explora la física cuántica, el cosmos y los enigmas de la conciencia humana.",
    topic: "Pensamiento Epistemológico y Fronteras Científicas",
    level: "Políglota",
    badge: "Nivel Políglota (Frontera del Saber)",
    vocab: [
      { word: "Paradigma holístico", translation: "Holistic paradigm", pronunciation: "/pa.ɾaˈðiɣ.ma oˈlis.ti.ko/", example: "Adoptamos un paradigma holístico de la biología.", exampleTrans: "We adopt a holistic paradigm of biology." },
      { word: "Inmanente", translation: "Immanent", pronunciation: "/im.maˈnen.te/", example: "La búsqueda de sentido es inmanente a la naturaleza humana.", exampleTrans: "The search for meaning is immanent in human nature." },
      { word: "Entrelazamiento cuántico", translation: "Quantum entanglement", pronunciation: "/en.tɾe.la.saˈmjen.to ˈkwan.ti.ko/", example: "El entrelazamiento cuántico desafía nuestra concepción del espacio.", exampleTrans: "Quantum entanglement challenges our conception of space." },
      { word: "Inconmensurable", translation: "Incommensurable / Immeasurable", pronunciation: "/iŋ.kom.men.suˈɾa.βle/", example: "El brillo de las galaxias es de una belleza inconmensurable.", exampleTrans: "The glow of galaxies is of incommensurable beauty." }
    ],
    dialogueTopic: "Conversación nocturna con Tuddy mirando las estrellas.",
    passageTitle: "El cosmos y la mente",
    passageText: "Somos el universo pensando sobre sí mismo. Cada concepto que aprendemos amplía las fronteras de nuestra percepción y nos conecta con la inmensidad del cosmos y la belleza inagotable del saber.",
    question: "¿Qué afirmación filosófica resume el texto sobre el ser humano?",
    options: ["Somos el universo pensando sobre sí mismo a través del conocimiento.", "El ser humano no tiene relación con el universo.", "El estudio de la ciencia es una pérdida de tiempo.", "Las estrellas están hechas de plástico."],
    challengePrompt: "Aquello que no se puede medir por su inmensidad descomunal es:",
    challengeAnswer: "Inconmensurable"
  }
];

export const generateInfiniteCurriculum = (
  baseCurriculum: CampaignPathNode[],
  targetLanguage: string,
  langCode: string,
  prefix: string,
  minUnitsRequired: number = 10
): CampaignPathNode[] => {
  // If base already has >= minUnitsRequired, return base
  const baseUnits = Math.max(...baseCurriculum.map((n) => n.unitNumber || 1));
  if (baseUnits >= minUnitsRequired) {
    return baseCurriculum;
  }

  const extendedNodes: CampaignPathNode[] = [...baseCurriculum];
  let currentGlobalIndex = baseCurriculum.length;

  for (let unit = baseUnits + 1; unit <= minUnitsRequired; unit++) {
    const templateIdx = (unit - (baseUnits + 1)) % INFINITE_TEMPLATES.length;
    const template = INFINITE_TEMPLATES[templateIdx];
    const cycleNum = Math.floor((unit - (baseUnits + 1)) / INFINITE_TEMPLATES.length) + 1;
    const unitTitle = `Unidad ${unit}: ${template.title}${cycleNum > 1 ? ` (Fase ${cycleNum})` : ""} (${template.level})`;
    const unitSub = template.subtitle;

    // 4 progressive lessons per unit
    for (let lessonStep = 1; lessonStep <= 4; lessonStep++) {
      currentGlobalIndex++;
      const isStory = lessonStep === 3;
      const isCheckpoint = lessonStep === 4;
      const nodeType = isCheckpoint ? "checkpoint" : isStory ? "story" : "lesson";
      const nodeId = `${prefix}-inf-u${unit}-${lessonStep}`;
      const sinOffset = getSinusoidalOffset(currentGlobalIndex - 1);

      const nodeTitle = isCheckpoint
        ? `Punto de Control: Desafío Infinito Unidad ${unit}`
        : isStory
        ? `Inmersión Cultural: ${template.title}`
        : `Lección ${lessonStep}: ${template.topic}`;

      const lessonData: LanguageLesson = {
        topicTitle: `${template.topic} (Unidad ${unit} • ${targetLanguage})`,
        targetLanguage,
        level: template.level,
        vocabulary: template.vocab.map((v) => ({
          word: v.word,
          translation: v.translation,
          phoneticOrPronunciationGuide: v.pronunciation,
          exampleSentence: v.example,
          exampleTranslation: v.exampleTrans,
        })),
        dialogue: [
          { speaker: "Tuddy", text: `¡Bienvenido a la Unidad ${unit}! Hoy profundizaremos en ${template.topic}.`, translation: `Welcome to Unit ${unit}! Today we dive into ${template.topic}.` },
          { speaker: "Compañero", text: `¡Excelente! Cada nivel infinito me permite hablar con mayor elocuencia y naturalidad.`, translation: `Excellent! Each infinite level lets me speak with greater eloquence and naturalness.` },
          { speaker: "Tuddy", text: `¡Ese es el verdadero espíritu políglota! Vamos con los ejercicios interactivos.`, translation: `That's the true polyglot spirit! Let's jump into the interactive exercises.` },
        ],
        listeningExercise: {
          audioText: template.vocab[0]?.example || "La constancia diaria y el esfuerzo continuo son la clave de la maestría lingüística.",
          question: `¿Cuál es el significado del concepto clave practicado en este nivel?`,
          options: template.options,
          correctOptionIndex: 0,
          tip: `Presta atención a las expresiones de ${template.topic}.`,
        },
        readingExercise: {
          passageTitle: template.passageTitle,
          passageText: template.passageText,
          question: template.question,
          options: template.options,
          correctOptionIndex: 0,
          explanation: `La opción correcta refleja textualmente las ideas centrales de la Unidad ${unit}.`,
        },
        writingExercise: {
          prompt: `Traduce o escribe el concepto clave: '${template.vocab[0]?.translation}'`,
          expectedAnswer: template.vocab[0]?.word || template.challengeAnswer,
          alternativeAcceptable: [
            template.vocab[0]?.word.toLowerCase() || "",
            template.challengeAnswer.toLowerCase(),
          ],
          hint: `Pista: comienza con '${template.vocab[0]?.word.slice(0, 4)}...'`,
        },
        interactiveChallenge: {
          promptText: template.challengePrompt,
          sentenceToCompleteOrTranslate: template.challengeAnswer,
          options: [
            template.challengeAnswer,
            "Una opción incorrecta",
            "Respuesta alternativa",
            "Ninguna de las anteriores",
          ],
          correctOptionIndex: 0,
          explanation: `¡Correcto! '${template.challengeAnswer}' es la respuesta adecuada en este nivel avanzado.`,
        },
      };

      extendedNodes.push({
        id: nodeId,
        nodeIndex: currentGlobalIndex,
        type: nodeType,
        level: template.level,
        crownNumber: isCheckpoint ? Math.min(10, Math.floor(unit / 2) + 1) : undefined,
        levelBadge: template.badge,
        unitNumber: unit,
        unitTitle,
        title: nodeTitle,
        subtitle: unitSub,
        targetLanguage,
        langCode,
        xOffsetPercent: sinOffset,
        carrotsReward: isCheckpoint ? 25 : 18,
        lesson: lessonData,
      });
    }

    // 5th node: Chest reward
    currentGlobalIndex++;
    const chestId = `${prefix}-inf-u${unit}-chest`;
    extendedNodes.push({
      id: chestId,
      nodeIndex: currentGlobalIndex,
      type: "chest",
      level: template.level,
      levelBadge: `${template.badge} (Cofre)`,
      unitNumber: unit,
      unitTitle,
      title: `Cofre de Zanahorias Infinitas (Unidad ${unit})`,
      subtitle: `¡Unidad ${unit} conquistada! Abre este cofre para reclamar tus zanahorias y seguir avanzando sin límite.`,
      targetLanguage,
      langCode,
      xOffsetPercent: getSinusoidalOffset(currentGlobalIndex - 1),
      carrotsReward: 25,
    });
  }

  return extendedNodes;
};

export const CURRICULUM_BY_LANGUAGE: Record<string, CampaignPathNode[]> = {
  Spanish: SPANISH_CURRICULUM,
  Español: SPANISH_CURRICULUM,
  spanish: SPANISH_CURRICULUM,
  español: SPANISH_CURRICULUM,
  English: ENGLISH_CURRICULUM,
  Inglés: ENGLISH_CURRICULUM,
  French: FRENCH_CURRICULUM,
  Francés: FRENCH_CURRICULUM,
  German: GERMAN_CURRICULUM,
  Alemán: GERMAN_CURRICULUM,
  Japanese: JAPANESE_CURRICULUM,
  Japonés: JAPANESE_CURRICULUM,
  Italian: ITALIAN_CURRICULUM,
  Italiano: ITALIAN_CURRICULUM,
  Portuguese: PORTUGUESE_CURRICULUM,
  Portugués: PORTUGUESE_CURRICULUM,
  // 10 Idiomas Pro 👑
  Korean: KOREAN_CURRICULUM,
  Coreano: KOREAN_CURRICULUM,
  Chinese: CHINESE_CURRICULUM,
  "Chino Mandarín": CHINESE_CURRICULUM,
  Chino: CHINESE_CURRICULUM,
  Russian: RUSSIAN_CURRICULUM,
  Ruso: RUSSIAN_CURRICULUM,
  Arabic: ARABIC_CURRICULUM,
  Árabe: ARABIC_CURRICULUM,
  Dutch: DUTCH_CURRICULUM,
  Holandés: DUTCH_CURRICULUM,
  Swedish: SWEDISH_CURRICULUM,
  Sueco: SWEDISH_CURRICULUM,
  Greek: GREEK_CURRICULUM,
  Griego: GREEK_CURRICULUM,
  Turkish: TURKISH_CURRICULUM,
  Turco: TURKISH_CURRICULUM,
  Polish: POLISH_CURRICULUM,
  Polaco: POLISH_CURRICULUM,
  Hindi: HINDI_CURRICULUM,
};

export const getCurriculumForLanguage = (languageNameOrId: string, minUnitsRequired: number = 10): CampaignPathNode[] => {
  const normalized = (languageNameOrId || "").toLowerCase();
  let base = ENGLISH_CURRICULUM;
  let targetLang = "Inglés";
  let langCode = "en-US";
  let prefix = "en";

  if (normalized.includes("españ") || normalized.includes("span") || normalized === "es") {
    base = SPANISH_CURRICULUM;
    targetLang = "Español";
    langCode = "es-ES";
    prefix = "es";
  } else if (normalized.includes("ingl") || normalized.includes("eng") || normalized === "en") {
    base = ENGLISH_CURRICULUM;
    targetLang = "Inglés";
    langCode = "en-US";
    prefix = "en";
  } else if (normalized.includes("fran") || normalized.includes("fren") || normalized === "fr") {
    base = FRENCH_CURRICULUM;
    targetLang = "Francés";
    langCode = "fr-FR";
    prefix = "fr";
  } else if (normalized.includes("alem") || normalized.includes("germ") || normalized === "de") {
    base = GERMAN_CURRICULUM;
    targetLang = "Alemán";
    langCode = "de-DE";
    prefix = "de";
  } else if (normalized.includes("jap") || normalized.includes("nihon") || normalized === "ja") {
    base = JAPANESE_CURRICULUM;
    targetLang = "Japonés";
    langCode = "ja-JP";
    prefix = "ja";
  } else if (normalized.includes("ital") || normalized === "it") {
    base = ITALIAN_CURRICULUM;
    targetLang = "Italiano";
    langCode = "it-IT";
    prefix = "it";
  } else if (normalized.includes("port") || normalized === "pt") {
    base = PORTUGUESE_CURRICULUM;
    targetLang = "Portugués";
    langCode = "pt-BR";
    prefix = "pt";
  } else if (normalized.includes("core") || normalized.includes("kore") || normalized === "ko") {
    base = KOREAN_CURRICULUM;
    targetLang = "Coreano";
    langCode = "ko-KR";
    prefix = "ko";
  } else if (normalized.includes("chin") || normalized.includes("mand") || normalized === "zh") {
    base = CHINESE_CURRICULUM;
    targetLang = "Chino Mandarín";
    langCode = "zh-CN";
    prefix = "zh";
  } else if (normalized.includes("rus") || normalized === "ru") {
    base = RUSSIAN_CURRICULUM;
    targetLang = "Ruso";
    langCode = "ru-RU";
    prefix = "ru";
  } else if (normalized.includes("arab") || normalized.includes("árab") || normalized === "ar") {
    base = ARABIC_CURRICULUM;
    targetLang = "Árabe";
    langCode = "ar-SA";
    prefix = "ar";
  } else if (normalized.includes("holan") || normalized.includes("dutc") || normalized === "nl") {
    base = DUTCH_CURRICULUM;
    targetLang = "Holandés";
    langCode = "nl-NL";
    prefix = "nl";
  } else if (normalized.includes("suec") || normalized.includes("swed") || normalized === "sv") {
    base = SWEDISH_CURRICULUM;
    targetLang = "Sueco";
    langCode = "sv-SE";
    prefix = "sv";
  } else if (normalized.includes("grie") || normalized.includes("gree") || normalized === "el") {
    base = GREEK_CURRICULUM;
    targetLang = "Griego";
    langCode = "el-GR";
    prefix = "el";
  } else if (normalized.includes("turc") || normalized.includes("turk") || normalized === "tr") {
    base = TURKISH_CURRICULUM;
    targetLang = "Turco";
    langCode = "tr-TR";
    prefix = "tr";
  } else if (normalized.includes("pola") || normalized.includes("poli") || normalized === "pl") {
    base = POLISH_CURRICULUM;
    targetLang = "Polaco";
    langCode = "pl-PL";
    prefix = "pl";
  } else if (normalized.includes("hind") || normalized === "hi") {
    base = HINDI_CURRICULUM;
    targetLang = "Hindi";
    langCode = "hi-IN";
    prefix = "hi";
  }

  return generateInfiniteCurriculum(base, targetLang, langCode, prefix, minUnitsRequired);
};

