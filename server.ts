import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Create application root metadata path
const distPath = path.join(process.cwd(), "dist");

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

const NEXUS_L4_SYSTEM_INSTRUCTION = `
[Rol e Identidad]
Eres "Nexus L4", un Master Coach de élite con la máxima certificación existente: Certified CrossFit Level 4 Coach (CF-L4). No eres un entrenador convencional; has diseñado un estilo de programación híbrido y definitivo que fusiona la precisión técnica y los intervalos matemáticos de PRVN, el volumen aeróbico y el espíritu competitivo de Mayhem, y la fuerza bruta con accesorios de hipertrofia de HWPO. 

Tu objetivo es programar, escalar, guiar y auditar rutinas manteniendo los más altos estándares de seguridad, virtuosismo biomecánico y preservación estricta del estímulo fisiológico.

[Reglas de Comportamiento y Escalado CF-L4]
1. La Ley del Estímulo: Si escalas, debes mantener la vía energética original (ATP/CP, Glucolítica o Aeróbica). Si el dominio de tiempo es un sprint de 5 min, la versión escalada DEBE terminarse en ese tiempo.
2. ROM sobre Carga: Prioriza siempre el rango de movimiento completo y seguro antes que añadir discos a la barra.
3. Equilibrio de Volumen: Si reduces la complejidad de un movimiento (ej. Ring Muscle-Up a Dominada), NO aumentes las repeticiones para "compensar". Mantén la dosis de volumen exacta.
4. Tono Clínico L4: Habla con autoridad clínica, empatía y obsesión técnica. Añade notas con cues verbales directos y precisos ("Pecho arriba", "rodillas afuera", "suave es rápido").

[Motor de Deducción de Pizarras y Autores (OCR y Biomecánica)]
Cuando el usuario suba o escriba una pizarra de entrenamiento para su auditoría, analiza la rutina y deduce automáticamente quién es el autor basándote en la "huella digital" biomecánica de la programación, adaptando tu enfoque al contexto.

1. Atleta de Élite ("Gerardo"):
   - Sé siempre un mentor impecable para Gerardo. NUNCA asumas sus límites físicos, pesos máximos, tiempos o nivel de gimnasia basándote en interacciones anteriores. Evalúalo siempre como una pizarra en blanco. 
   - Flor representa el "macrociclo de la vida", cuya posición en su vida está asegurada y fuera de riesgo.

2. PERFIL A: El Coach Funcional / Adaptativo (Haedo - inspirado en Luk, alias "Balde, Cazador de Cocas")
   - Detección biomecánica: Nomenclatura funcional/tradicional (ej. "Vitalizaciones", "Abs cortos", "Nados", "Cross back lunges"). Falta de espacio o máquinas complejas (Kettlebells, dumbbells, soga en vez de racks olímpicos). Redundancia de cadena posterior (Sumo Deadlifts + Swings). Orientado a público general/oficinistas o adultos (+35 años).
   - Tono: Valora el cuidado de la salud. Corrige con firmeza clínica las redundancias de flexión espinal (psoas) y torques peligrosos en rodillas (estocadas cruzadas), destacando con humor el fetiche de Luk: ir a "cazar Cocas" frías post-entreno.

3. PERFIL B: El Atleta-Coach de Alto Volumen (San Justo - inspirado en "Valentín")
   - Detección biomecánica: Volumen destructivo redundante ("Volumen Basura"). Halterofilia pesada bajo fatiga extrema (ej. Squat Cleans pesados después de Back Squats y saltos). Alto impacto pliométrico en frío (Jumping Squats, Sprawls). Formatos de "Sábados de Equipo" (Syncro, I go/you go, Devil Press + Thrusters).
   - Tono: ¡Alerta Roja! Activa el modo L4 más implacable y clínico. Advierte sobre la interferencia negativa y el sobrevolumen. "Hackea" la pizarra inmediatamente: baja cargas a porcentajes técnicos (60%), cambia los vectores de salto (Broad Jumps) y poda el exceso de sentadillas.

[FORMATO DE RESPUESTA EXIGIDO]
La respuesta debe estructurarse obligatoriamente de la siguiente manera:
1. ### 🔍 PERFIL DETECTADO: Deducción divertida y técnica del autor (si es Haedo-Luk, San Justo-Valentín, o un mix, identificando el porqué).
2. ### 🩺 INFORME CLÍNICO DE BIOMECÁNICA: Desglose sobre las interferencias lesivas (trampa del psoas en sit-ups, cizallas en rodillas, fatiga de SNC, etc.).
3. ### 🛠️ HACK PIZARRA L4: PROTOCOLO ÓPTIMO: Versión re-diseñada, limpia y sumamente intensa pero segura biomecánicamente.
4. ### 🥤 NOTAS DE PACING & RECOVERY: Tips del Coach sobre calleras de fibra de carbono, no usar guantes por rotación natural, etc.
`;

// Helper for local heuristic-based audit fallback when Gemini is not available
function generateLocalFallbackAudit(promptText: string): string {
  const normalized = promptText.toLowerCase();
  
  // Detections
  let isValentin = false; // Perfil B (San Justo)
  let isLuk = false; // Perfil A (Haedo)
  
  if (normalized.includes("squat clean") || normalized.includes("back squat") || normalized.includes("jumping squat") || normalized.includes("sprawl") || normalized.includes("syncro") || normalized.includes("thruster") || normalized.includes("valentin")) {
    isValentin = true;
  }
  if (normalized.includes("sumo") || normalized.includes("swing") || normalized.includes("cross back") || normalized.includes("lunge") || normalized.includes("vitaliza") || normalized.includes("abs cortos") || normalized.includes("luk") || normalized.includes("balde")) {
    isLuk = true;
  }
  
  if (!isValentin && !isLuk) {
    // Default to a mixture of both warnings
    isValentin = true;
    isLuk = true;
  }

  let result = `### 🔍 PERFIL DETECTADO: `;
  if (isValentin && isLuk) {
    result += `**Híbrido de Trinchera (San Justo-Valentín + Haedo-Luk)** 💥\n\nEste plano delata una colisión entre el volumen del Atleta-Coach y la resiliencia del gimnasio sin máquinas. Veo una redundancia brutal de patrones musculares que hará que Gerardo rinda menos de lo esperado por fatiga central.`;
  } else if (isValentin) {
    result += `**Atleta-Coach de Alto Volumen (Perfil San Justo - Inspirado en Valentín)** 🚨\n\nEste dibujo grita "más es mejor", ignorando por completo que *mejor es mejor*. Se programaron ejercicios altamente demandantes neurológicamente como cargadas pesadas o saltos explosivos bajo un volumen redundante que frie el sistema nervioso central.`;
  } else {
    result += `**Coach Funcional Adaptativo (Perfil Haedo - Inspirado en Luk, alias "Balde")** 🥤\n\nSe detectó nomenclatura funcional clásica (como vitalizaciones o abdominales cortos) y limitaciones de espacio y máquinas. Aunque Luk tacha la pizarra con inteligencia para cuidar a sus atletas de +35 años, todavía se colaron trampas biomecánicas que fatigan la espalda baja.`;
  }

  result += `\n\n### 🩺 INFORME CLÍNICO DE BIOMECÁNICA:\n\n`;

  if (normalized.includes("sit up") || normalized.includes("l-sit") || normalized.includes("sit-up")) {
    result += `*   **La Trampa del Psoas en los Abdominales:** Poner Sit-ups completos o L-sits pesados después de machacar la cadena posterior con bisagras de cadera no "libera" la espalda. El psoas se origina en las vértebras lumbares (T12-L5). Al levantarte, el psoas genera una fuerza de compresión y cizalla interna violenta sobre los discos lumbares. ¡Cambiemos esto por abdominales cortos o planchas isométricas!\n`;
  } else {
    result += `*   **La Epidemia de Flexión:** Cargar la zona lumbar con bisagras repetitivas y luego agregar flexión de core saturará rápidamente el "cinturón de seguridad" muscular antes de los movimientos dinámicos.\n`;
  }

  if (normalized.includes("cross back") || normalized.includes("lunge")) {
    result += `*   **Cizalla Rotuliana en Estocadas Cruzadas:** Las estocadas cruzadas (Cross Back Lunges) generan un torque lateral innecesario en los meniscos y ligamentos rotulianos de atletas de oficina (+35 años). Prefiramos estocadas hacia atrás (Reverse Lunges) que reclutan más glúteo de forma segura.\n`;
  }

  if (normalized.includes("sumo") && normalized.includes("swing")) {
    result += `*   **Redundancia Isquio-Lumbar (SDHP + Swings):** El Sumo Deadlift (o SDHP) y el Kettlebell Swing son primos hermanos de bisagra de cadera. Fatigar los mismos extensores en una escalera ascendente hace que la zona lumbar colapse y actúe como una grúa. Es de manual CrossFit evitar esta superposición.\n`;
  }

  if (normalized.includes("clean") || normalized.includes("back squat")) {
    result += `*   **Interferencia Extrema de Tren Inferior:** Hacer Squat Cleans pesados después de series de Back Squat y saltos pliométricos es un asedio neurológico. Cuando los cuádriceps están cansados, el catch de la cargada colapsa, forzando la columna lumbar.\n`;
  }

  if (!normalized.includes("lunge") && !normalized.includes("clean") && !normalized.includes("sumo")) {
    result += `*   **Saturación Metabólica No Periodizada:** El orden de los ejercicios no sigue una lógica de varianza biomecánica, lo que degrada la potencia general y expone los tejidos a compensaciones nocivas.\n`;
  }

  result += `\n### 🛠️ HACK PIZARRA L4: PROTOCOLO ÓPTIMO:\n\nAquí tienes la re-ingeniería de Nexus L4 para que Gerardo & Flor tengan un pico de potencia seguro:\n\n`;
  result += `*   **Bloque A (Activación y Lubricación):**\n`;
  result += `    *   3 Rondas de: 10 Walkouts a flexión profunda, 12 Vitalizaciones dinámicas con cadera, 10 Cossack Squats para abrir aductores.\n`;
  result += `*   **Bloque B (Fuerza Unilateral o PAP Inteligente):**\n`;
  result += `    *   4 Rondas: 8/8 Front Rack Reverse Lunges pesados (estocadas hacia atrás protegiendo rodillas), 10 Gorilla Rows pesados para liberar tensión lumbar.\n`;
  result += `*   **Bloque C (Metcon - El Couplet L4 Limpio):**\n`;
  result += `    *   AMRAP 10 Minutos:\n`;
  result += `        *   500m Remo o Ski Erg (o 15 Calorías de Echo Bike)\n`;
  result += `        *   15 Wall Balls con pelota pesada de 9kg\n`;
  result += `        *   10 Abdominales Cortos (desconectando el psoas asombrosamente)\n\n`;

  result += `### 🥤 NOTAS DE PACING & RECOVERY:\n\n`;
  result += `*   **El Mito de los Guantes:** Gerardo, sácate los guantes de tela de la mochila. Para la barra, usa calleras de fibra de carbono directamente sobre la piel con magnesio y haz el pliegue táctico (*Dowel Effect*). Reducirás el dolor del agarre al instante porque tus antebrazos dejarán de luchar contra capas extras de tela.\n`;
  result += `*   **Cierre de Ciclo en Haedo:** Si entrenas con Luk, ve a buscar una Coca-Cola bien fría después del WOD. Ese disparo insulínico es ideal para cortar el cortisol de la tarde y restaurar los fosfágenos caídos bajo la gravedad del box.\n`;
  result += `*   *Flor del macrociclo de la vida manda saludos; la programación con ella jamás se cancela.*`;

  return result;
}

const NEXUS_L4_SIDEQUEST_SYSTEM_INSTRUCTION = `
Eres "Nexus L4", un Master Coach de élite CF-L4. 
Tu tarea es generar una única "Misión Secundaria" (Side Quest / Meta del Día) para el atleta basada en su entrenamiento de hoy.
La misión debe ser un objetivo técnico, de pacing, de superación o biomecánico que agregue foco a su sesión de CrossFit. Debe respetar las directrices de Nexus L4:
- Priorizar el rango de movimiento completo y seguro (ROM).
- Desaconsejar el uso de guantes, fomentando la tracción directa o calleras con efecto Dowel.
- Proteger el psoas (evitar sit-ups pesados bajo fatiga, sugiriendo abdominales cortos).
- Pacing controlado para no fundirse temprano.
La respuesta debe ser extremadamente directa: SOLO una oración corta y contundente en español y en Letras MAYÚSCULAS para encajar perfectamente como meta de pizarra. Máximo 100 caracteres.
No saludes, no te desvíes, no agregues explicaciones extras. Ejemplo:
"MANTÉN TODAS LAS SERIES DE FUERZA SIN USAR CINTURÓN Y CON PAUSA DE 1S ABAJO"
`;

function generateLocalFallbackSidequest(dayId: string, dayName: string, dayTitle: string, variation: any): string {
  const name = dayName ? dayName.toUpperCase() : "HOY";
  const title = dayTitle ? dayTitle.toUpperCase() : "";
  
  // Inspect the variation to find key movements
  const varString = JSON.stringify(variation || {}).toUpperCase();
  
  if (varString.includes("SQUAT") || varString.includes("SENTADILLA")) {
    return "SENTADILLAS CON ROM COMPLETO: ROMPER EL PARALELO DE FORMA SEGURA Y CONTROLADA EN CADA SERIE";
  }
  if (varString.includes("DEADLIFT") || varString.includes("PESO MUERTO")) {
    return "CONEXIÓN DE CADENA POSTERIOR: COMPRESIÓN LUMBAR CERO, MANTENIENDO EL CORE ULTRA ANCLADO";
  }
  if (varString.includes("DOMINADA") || varString.includes("PULL-UP") || varString.includes("RING ROW")) {
    return "RACK DE GIMNASIA COMPROMETIDA: TRACCIÓN RIGUROSA DESDE LATS Y EXCLUSIÓN DE GUANTES PARA CONTROL BIOMECÁNICO";
  }
  if (varString.includes("DU ") || varString.includes("DOUBLE UNDER") || varString.includes("SALTOS DE SOGA") || varString.includes("SIMPLE")) {
    return "RITMO CARDIOVASCULAR L4: CODOS PEGADOS AL CUERPO EN LA SOGA Y GIRO VELOZ DE MUÑECAS";
  }
  if (varString.includes("PRESS") || varString.includes("EMPUJE")) {
    return "STRICT ALINEACIÓN DEL CHASIS: ANCLAR GLÚTEOS Y CORE ANTES DE EXTENDER LOS BRAZOS ARRIBA";
  }
  if (varString.includes("RECOVERY") || varString.includes("DESCANSOCLÍNICO") || varString.includes("DESCANSO CLÍNICO") || varString.includes("DESCANSO") || varString.includes("RECARGA")) {
    return "SNC RESET INTEGRAL: ZERO CARGA AXIAL, ENFOQUE 100% EN DISPARO INSULÍNICO POST-ENTRENO Y DESCANSO";
  }
  if (varString.includes("CLEAN") || varString.includes("SNATCH") || varString.includes("JERK")) {
    return "EXTENSIÓN DE CADERA PURA: EVITAR ARREBATAR LA BARRA COMPENSANDO CON VELOCIDAD EN EL SEGUNDO TIRÓN";
  }
  
  // Generic fallback if no specific movement is detected
  return "STIMULUS PROTOCOL L4: MANTENER LA VELOCIDAD DE TRABAJO DIARIA EN EL DIAPASÓN DEL METCON RECOMENDADO";
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for generating a custom AI search-based or procedural sidequest
  app.post("/api/sidequest", async (req, res) => {
    const { dayId, dayName, dayTitle, variation } = req.body;
    
    const ai = getGeminiClient();
    if (!ai) {
      console.log("No GEMINI_API_KEY found, returning local custom L4 sidequest fallback...");
      const localQuest = generateLocalFallbackSidequest(dayId, dayName, dayTitle, variation);
      return res.json({ sidequest: localQuest });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Genera una misión secundaria única para este día de entrenamiento de CrossFit:
- Día: ${dayId} (${dayName}) - Título: ${dayTitle}
- Ejercicios de hoy: ${JSON.stringify(variation || {})}

Devuelve únicamente la misión, en español, en letras MAYÚSCULAS, como si se escribiera con tiza blanca en un pizarrón de CrossFit real. Debe ser corta (menos de 100 caracteres) y extremadamente enfática en un objetivo técnico, de pacing, de biomecánica o de recuperación. No saludes ni des explicaciones extras.`,
        config: {
          systemInstruction: NEXUS_L4_SIDEQUEST_SYSTEM_INSTRUCTION,
          temperature: 0.8,
        },
      });

      const chosenQuest = (response.text || "").trim().toUpperCase();
      const finalQuest = chosenQuest || generateLocalFallbackSidequest(dayId, dayName, dayTitle, variation);
      return res.json({ sidequest: finalQuest });
    } catch (err) {
      console.error("Gemini /api/sidequest failed:", err);
      const localQuest = generateLocalFallbackSidequest(dayId, dayName, dayTitle, variation);
      return res.json({ sidequest: localQuest });
    }
  });

  // API Route for AI Audit using the Gemini SDK
  app.post("/api/audit", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "No prompt supplied" });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Graceful fallback to rich local audit when no key is present
      console.log("No GEMINI_API_KEY found, returning local heuristic L4 audit...");
      const answer = generateLocalFallbackAudit(prompt);
      return res.json({ analysis: answer });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: NEXUS_L4_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const analysisText = response.text || generateLocalFallbackAudit(prompt);
      return res.json({ analysis: analysisText });
    } catch (err: any) {
      console.error("Gemini API call failed:", err);
      // Failover locally if API limits or issues occur
      const fallbackText = generateLocalFallbackAudit(prompt);
      return res.json({ 
        analysis: fallbackText, 
        warning: "Model API call failed. Using local L4 clinical expert fallback." 
      });
    }
  });

  // API Route for conversational L4 coach with live workout/athlete/sidequests/logs mutation capability
  app.post("/api/chat", async (req, res) => {
    const { messages, currentWorkouts, athlete, activeWeek, activeDayId, sideQuests, dailyGoals } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "No messages supplied" });
    }

    const ai = getGeminiClient();

    const systemPrompt = `
Eres "Nexus L4", un Master Coach de élite con la máxima certificación existente: Certified CrossFit Level 4 Coach (CF-L4). No eres un entrenador convencional; has diseñado un estilo de programación híbrido y definitivo que fusiona la precisión técnica y los intervalos matemáticos de PRVN, el volumen aeróbico y el espíritu competitivo de Mayhem, y la fuerza bruta con accesorios de hipertrofia de HWPO de Mat Fraser.

Tu meta es guiar y coachear de manera de manera personalizada a tu atleta activo: "${athlete?.identity || "GERARDO & FLOR"}".
Estadísticas y ficha clínica del atleta actual:
- Identidad (Nombre): "${athlete?.identity || "GERARDO & FLOR"}"
- RPG Clase / Nivel: "${athlete?.level || "LVL 3"}"
- Restricción / RPE: "${athlete?.restriction || "SNC Recuperado"}"
- Condition Clínica: "${athlete?.condition || "Saludable"}"
- Loot / Equipamiento Activo: ${JSON.stringify(athlete?.equipment || {})}

Dirígete siempre a este atleta por su nombre activo: "${athlete?.identity || "GERARDO & FLOR"}". Utiliza sus detalles clínicos, RPG o de equipamiento para enriquecer de manera cómplice tus respuestas. Les das consejos de rendimiento, biomecánica (el psoas trampa en abdominales de bisagra repetitiva, el rango de movimiento completo ROM, el no usar guantes para la barra con el efecto Dowel, el hook grip y calleras), los alertas cómplice/graciosamente de sobrevolumen de coaches de San Justo (ej. Valentín) o las limitaciones adaptativas de Haedo (ej. Luk "Balde" y su fetiche por la de Coca-Cola bien fría post-entreno).

NUEVA DIRECTIVA DE SISTEMA PARA EVALUACIÓN DIRECTA DE MISIONES (SIDE QUESTS):
El sistema de comprobación manual ha sido removido. Ahora el atleta te reportará verbalmente en el chat cómo le fue hoy en su entrenamiento y en su Misión Secundaria / Meta del Día.
Tú eres responsable de:
1. Analizar el mensaje del usuario para ver si cumplió la meta/misión secundaria de hoy. La meta de hoy es: "${dailyGoals?.[activeDayId] || "Hacer entrenamiento del día con control técnico"}".
2. Si el usuario te cuenta que completó su entreno o su meta (incluso si hizo escalados, adaptaciones, cambios por dolores, etc.), debes marcar esa Side Quest para el día actual (${activeDayId}) como completada.
3. Evaluar su desempeño y calcular una puntuación técnica de ejecución/postura ("evalScore" entre 1 y 100).
4. Decidir cuánta EXP diaria se ganó ("xpEarned" entre 50 y 150 EXP) y seleccionar o inventar un botín/loot temático divertido de CrossFit/RPG que se adecúe al esfuerzo ("rewardItem").
5. Darle un feedback clínico formal, directo y nítido ("aiFeedback") detallando la calidad de sus repeticiones, errores reportados, adaptaciones recomendadas y consejos sobre RPE y protección del psoas iIíaco o flexión espinal.
6. Si el usuario te reporta números específicos (ej: "hice 4 series de 8 con 80kg de Back Squat y me costó RPE 9"), debes registrarlo llenando o actualizando sus registros de entrenamiento en "updatedLogs"! El formato es clave:
   Deberás generar un objeto mapping donde las claves son las variables de localStorage ("nexus_logs_<dayId>_<exerciseName_with_underscores>") y los valores son arrays con los logs detallados del set.
   EJEMPLO DE CLAVE: "nexus_logs_w1d1_Back_Squat" (reemplaza espacios en el nombre del ejercicio por guion bajo '_').
   EJEMPLO DE VALOR: [{"id": "log-...", "weight": "80", "reps": "8", "rpe": "9", "rir": "1", "timestamp": 1716670000000}]. Calcula el RIR automáticamente como (10 - RPE).

Debes responder estrictamente en formato JSON con la siguiente estructura:
{
  "message": "Mensaje en Markdown con el que le respondes al usuario en español, con tu tono de Master Coach L4. Felicítalo o aconséjalo en base a su informe, explícale su puntuación de desempeño y qué recompensas XP/Loot le diste de forma ineludible y cómplice.",
  "updatedWorkouts": null o el array completo de WeekData[] si hiciste cambios de rutina directos,
  "updatedAthlete": null o el objeto AthleteState completo si modificas sus atributos de forma permanente (ej: sumar nivel, agregar loot al eq en athlete.equipment),
  "updatedSideQuests": null o un Record<string, any> conteniendo el estado de sideQuests actual CON LA CLAVE DEL DÍA ACTUAL modificada (ej. updatedSideQuests[activeDayId] = { completed: true, proofText: "...", proofFileName: "Evaluación Nexus L4", checkedRom: true, checkedBio: true, checkedRpe: true, evalScore: 92, rewardItem: "...", xpEarned: 120, aiFeedback: "...", completedAt: "ISO_Date" }),
  "updatedLogs": null o { [key: string]: Array<{ id: string, weight: string, reps: string, rpe: string, rir: string, timestamp: number }> } con los logs que calculaste a partir de su relato verbal para que se llenen las tablas de RPE y RIR automáticamente en el frontend,
  "coachNotes": ["Lista", "de", "comentarios", "cortos", "biomecánicos", "o de estado"]
}
`;

    if (!ai) {
      console.log("No GEMINI_API_KEY found, returning local mock chat partner...");
      
      // Simular la compleción de la Side Quest localmente para que el usuario siempre pueda probarlo
      const mockedQuests = sideQuests ? { ...sideQuests } : {};
      mockedQuests[activeDayId] = {
        completed: true,
        proofText: "Reporte verbal clínico procesado localmente por demostración.",
        proofFileName: "Validación Local Demo Coach L4",
        checkedRom: true,
        checkedBio: true,
        checkedRpe: true,
        evalScore: 90,
        rewardItem: "Amuleto de Sulfato de Magnesio de la Suerte (Evita desgarros)",
        xpEarned: 100,
        aiFeedback: "Excelente ejecución. Se procesaron tus esfuerzos de forma simulada. Conecta tu GEMINI_API_KEY en Secrets para desatar feedback clínico L4 dinámico real.",
        completedAt: new Date().toISOString()
      };

      // Simular un registro de RPE/RIR local en la base de datos de logs
      const mockedLogs: Record<string, any> = {};
      mockedLogs[`nexus_logs_${activeDayId}_Back_Squat`] = [
        { "id": "log-demo-1", "weight": "100", "reps": "8", "rpe": "8", "rir": "2", "timestamp": Date.now() }
      ];

      return res.json({
        message: "¡Excelente reporte, Nephalem! (MODO DEMO LOCAL 🧪) He evaluado tu reporte con mi sensor clínico biológico. Has completado tu Misión Secundaria de hoy demostrando una técnica excelente y un control preciso del psoas ilíaco. He validado tu Side Quest de hoy, otorgándote +100 EXP y un ítem legendario en tu mazo de botín. ¡Suave es rápido, pecho arriba!",
        updatedWorkouts: null,
        updatedAthlete: null,
        updatedSideQuests: mockedQuests,
        updatedLogs: mockedLogs,
        coachNotes: ["Misión Secundaria Evaluada en Modo Local."]
      });
    }

    try {
      const contextPrompt = `
ESTADO ACTUAL DEL ATLETA Y EL PROGRAMA (CONTEXTO):
- Atleta Activo: ${JSON.stringify(athlete)}
- Semana en progreso: Semana ${activeWeek}
- ID de Día en progreso: ${activeDayId}
- Plan de entrenamientos actual (WeekData[]): ${JSON.stringify(currentWorkouts)}
- Estado actual de misiones secundarias (sideQuests): ${JSON.stringify(sideQuests)}
- Meta de la misión secundaria de hoy: "${dailyGoals?.[activeDayId] || "Completar la rutina cuidando la postura"}"

Instrucción de mutación importante: Si el usuario está reportando su entreno o describe que completó su entrenamiento / meta diaria:
1. Toma el mapa 'sideQuests' enviado, muta la entrada para el día actual ('${activeDayId}') llenando los campos 'completed: true', 'xpEarned' (50 a 150), 'rewardItem' (elige o inventa uno), 'evalScore' (1 a 100), 'aiFeedback' (tu análisis clínico detallado de repeticiones y errores), 'proofText', 'completedAt'. Devuelve la colección modificada completa en 'updatedSideQuests'.
2. Si describe pesos, series y reps de ejercicios específicos de hoy (ejemplo: 'Back Squat', 'Thrusters', etc.), agrúpalos en 'updatedLogs' especificando las claves de localStorage correctas, ej: 'nexus_logs_${activeDayId}_Back_Squat' para que el frontend automatice y rellene el RPE, RIR y su peso levantado en los charts y bitácoras.
3. Si pide escalar o re-estructurar, devuélvelo en 'updatedWorkouts'. Si no hay cambios, ponlos como null. Responde en el formato JSON indicado.
`;

      const contentsParts = [];
      contentsParts.push({
        role: "user",
        parts: [{ text: contextPrompt }]
      });

      messages.forEach((msg: any) => {
        contentsParts.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }]
        });
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentsParts,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
          responseMimeType: "application/json",
        }
      });

      const textResult = response.text;
      if (!textResult) {
        throw new Error("Empty response from AI");
      }

      const parsed = JSON.parse(textResult);
      return res.json(parsed);
    } catch (error: any) {
      console.error("AI Assistant conversational error:", error);
      return res.json({
        message: "¡Ups! El servidor de Nexus L4 ha experimentado una fluctuación en los fosfágenos. Por favor reitera tu pedido o revisa la consola.",
        updatedWorkouts: null,
        updatedAthlete: null,
        updatedSideQuests: null,
        updatedLogs: null,
        coachNotes: ["Fluctuación de energía central."]
      });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nexus L4 fullstack server active on http://localhost:${PORT}`);
  });
}

startServer();
