import { GoogleGenAI } from "@google/genai";
import { getProvider, getClaudeKey, getGeminiKey } from "../lib/aiKeys";
import { ChapterRequest, AthleteEvaluation, buildChapterPrompt, localChapterProgram } from "../lib/chapterCreator";
import { getAlwaysOnDirectives, getChapterEnrichment, getAuditEnrichment, getChatCoachEnrichment } from '../lib/encyclopediaContext';
import { Database } from "../types/workout";
import { blocksForPrompt, heuristicInspirationMap, applyInspirationMap } from "../lib/blockInspiration";

/** Assemble system prompt with always-on directives + optional enrichment. */
function buildSystemPrompt(base: string, enrichment?: string): string {
  const directives = getAlwaysOnDirectives();
  return enrichment
    ? `${base}\n\n${directives}\n\n${enrichment}`
    : `${base}\n\n${directives}`;
}

let aiClient: GoogleGenAI | null = null;
let aiClientKey = "";
function getGeminiClient(): GoogleGenAI | null {
  const key = getGeminiKey();
  if (!key) return null;
  if (!aiClient || aiClientKey !== key) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
    aiClientKey = key;
  }
  return aiClient;
}

// ── Anthropic (Claude) — direct browser call with the user's own local key ──
const CLAUDE_MODEL = "claude-haiku-4-5-20251001";
interface GenOpts {
  system: string;
  prompt?: string;
  json?: boolean;
  temperature?: number;
  messages?: { role: string; content: string }[];
}

async function callClaude(opts: GenOpts): Promise<string> {
  const key = getClaudeKey();
  if (!key) throw new Error("no-claude-key");
  const messages =
    opts.messages && opts.messages.length
      ? opts.messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }))
      : [{ role: "user", content: opts.prompt || "" }];
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      temperature: opts.temperature ?? 0.7,
      system: opts.system + (opts.json ? "\n\nRespondé ÚNICAMENTE con JSON válido, sin markdown ni texto extra." : ""),
      messages,
    }),
  });
  if (!res.ok) throw new Error(`Claude ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return Array.isArray(data?.content)
    ? data.content.filter((c: any) => c.type === "text").map((c: any) => c.text).join("")
    : "";
}

/**
 * Provider-routed single-shot text generation. Uses Claude when the user picked
 * it and supplied a key, else Gemini (local or env key), else falls back to the
 * other configured provider. Returns null when no provider is configured.
 */
async function generateText(opts: GenOpts): Promise<string | null> {
  if (getProvider() === "claude" && getClaudeKey()) return callClaude(opts);
  const ai = getGeminiClient();
  if (ai) {
    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: opts.prompt || "",
      config: {
        systemInstruction: opts.system,
        temperature: opts.temperature ?? 0.7,
        ...(opts.json ? { responseMimeType: "application/json" } : {}),
      },
    });
    return response.text || "";
  }
  if (getClaudeKey()) return callClaude(opts);
  return null;
}

async function generateContentWithRetry(ai: GoogleGenAI, params: any, retries = 3, initialDelay = 1000): Promise<any> {
  let delay = initialDelay;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      const errMsg = String(err?.message || err || "").toUpperCase();
      const statusCode = err?.status || err?.code || 0;
      const isTransient = 
        statusCode === 503 || 
        statusCode === 429 || 
        errMsg.includes("503") || 
        errMsg.includes("429") || 
        errMsg.includes("UNAVAILABLE") || 
        errMsg.includes("RESOURCE HAS BEEN EXHAUSTED") ||
        errMsg.includes("HIGH DEMAND") ||
        errMsg.includes("TEMPORARY") ||
        errMsg.includes("UNREACHABLE");

      if (isTransient && attempt < retries) {
        console.warn(`[Gemini API] Transient error (status: ${statusCode}, msg: "${errMsg}"). Retrying attempt ${attempt}/${retries} in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        throw err;
      }
    }
  }
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

function generateLocalFallbackAudit(promptText: string): string {
  const normalized = promptText.toLowerCase();
  
  let isValentin = false;
  let isLuk = false;
  
  if (normalized.includes("squat clean") || normalized.includes("back squat") || normalized.includes("jumping squat") || normalized.includes("sprawl") || normalized.includes("syncro") || normalized.includes("thruster") || normalized.includes("valentin")) {
    isValentin = true;
  }
  if (normalized.includes("sumo") || normalized.includes("swing") || normalized.includes("cross back") || normalized.includes("lunge") || normalized.includes("vitaliza") || normalized.includes("abs cortos") || normalized.includes("luk") || normalized.includes("balde")) {
    isLuk = true;
  }
  
  if (!isValentin && !isLuk) {
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
  
  return "STIMULUS PROTOCOL L4: MANTENER LA VELOCIDAD DE TRABAJO DIARIA EN EL DIAPASÓN DEL METCON RECOMENDADO";
}

export async function generateSidequest(dayId: string, dayName: string, dayTitle: string, variation: any) {
  const prompt = `Genera una misión secundaria única para este día de entrenamiento de CrossFit:
- Día: ${dayId} (${dayName}) - Título: ${dayTitle}
- Ejercicios de hoy: ${JSON.stringify(variation || {})}

Devuelve únicamente la misión, en español, en letras MAYÚSCULAS, como si se escribiera con tiza blanca en un pizarrón de CrossFit real. Debe ser corta (menos de 100 caracteres) y extremadamente enfática en un objetivo técnico, de pacing, de biomecánica o de recuperación. No saludes ni des explicaciones extras.`;
  try {
    const text = await generateText({ system: NEXUS_L4_SIDEQUEST_SYSTEM_INSTRUCTION, prompt, temperature: 0.8 });
    const quest = (text || "").trim().toUpperCase();
    return { sidequest: quest || generateLocalFallbackSidequest(dayId, dayName, dayTitle, variation) };
  } catch (err) {
    console.error("AI sidequest failed:", err);
    return { sidequest: generateLocalFallbackSidequest(dayId, dayName, dayTitle, variation) };
  }
}

export async function generateAudit(prompt: string, enriched = false) {
  if (!prompt) {
    throw new Error("No prompt supplied");
  }
  try {
    const system = buildSystemPrompt(NEXUS_L4_SYSTEM_INSTRUCTION, enriched ? getAuditEnrichment() : undefined);
    const text = await generateText({ system, prompt, temperature: 0.7 });
    if (text && text.trim()) return { analysis: text };
    return { analysis: generateLocalFallbackAudit(prompt) };
  } catch (err: any) {
    console.error("AI audit failed:", err);
    return {
      analysis: generateLocalFallbackAudit(prompt),
      warning: "Model API call failed. Using local L4 clinical expert fallback.",
    };
  }
}

export async function generateChat(messages: any[], currentWorkouts: any, athlete: any, activeWeek: any, activeDayId: string, sideQuests: any, dailyGoals: any, enriched = false) {
  if (!messages || !Array.isArray(messages)) {
    throw new Error("No messages supplied");
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

  const enrichedSystemPrompt = buildSystemPrompt(systemPrompt, enriched ? getChatCoachEnrichment() : undefined);

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

  // Claude path — user picked Claude and supplied a local key.
  if (getProvider() === "claude" && getClaudeKey()) {
    try {
      const claudeText = await callClaude({
        system: enrichedSystemPrompt + "\n\n" + contextPrompt,
        json: true,
        temperature: 0.7,
        messages: (messages && messages.length ? messages : [{ role: "user", content: "Hola coach" }]).map(
          (m: any) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }),
        ),
      });
      return JSON.parse(claudeText);
    } catch (e) {
      console.error("Claude chat failed, falling back to Gemini/local:", e);
    }
  }

  if (!ai) {
    console.log("No VITE_GEMINI_API_KEY found, returning local mock chat partner...");
    
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
      aiFeedback: "Excelente ejecución. Se procesaron tus esfuerzos de forma simulada. Conecta tu VITE_GEMINI_API_KEY en el frontend (.env) para desatar feedback clínico L4 dinámico real.",
      completedAt: new Date().toISOString()
    };

    const mockedLogs: Record<string, any> = {};
    mockedLogs[`nexus_logs_${activeDayId}_Back_Squat`] = [
      { "id": "log-demo-1", "weight": "100", "reps": "8", "rpe": "8", "rir": "2", "timestamp": Date.now() }
    ];

    return {
      message: "¡Excelente reporte, Nephalem! (MODO DEMO LOCAL 🧪) He evaluado tu reporte con mi sensor clínico biológico. Has completado tu Misión Secundaria de hoy demostrando una técnica excelente y un control preciso del psoas ilíaco. He validado tu Side Quest de hoy, otorgándote +100 EXP y un ítem legendario en tu mazo de botín. ¡Suave es rápido, pecho arriba!",
      updatedWorkouts: null,
      updatedAthlete: null,
      updatedSideQuests: mockedQuests,
      updatedLogs: mockedLogs,
      coachNotes: ["Misión Secundaria Evaluada en Modo Local."]
    };
  }

  try {
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

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: contentsParts,
      config: {
        systemInstruction: enrichedSystemPrompt,
        temperature: 0.7,
        responseMimeType: "application/json",
      }
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("Empty response from AI");
    }

    const parsed = JSON.parse(textResult);
    return parsed;
  } catch (error: any) {
    console.error("AI Assistant conversational error:", error);
    return {
      message: "¡Ups! El cerebro de Nexus L4 ha experimentado una fluctuación en los fosfágenos. Por favor reitera tu pedido o revisa la consola.",
      updatedWorkouts: null,
      updatedAthlete: null,
      updatedSideQuests: null,
      updatedLogs: null,
      coachNotes: ["Fluctuación de energía central."]
    };
  }
}

// ── Phase 4: Chapter Creator (monthly program generation) ───────────────────

const NEXUS_CHAPTER_SYSTEM = `
Eres "Nexus L4", Master Coach CF-L4. Generás una PROGRACIÓN MENSUAL (capítulo de 4 semanas) fundamentada
en la metodología NEXUS: Mayhem (disponibilidad, microciclo que respira, técnico en fresco), PRVN
(cobertura de espectro, slot de debilidad, pacing), HWPO (intención de bloque + métricas testigo,
adherencia), CF-L4 (mecánica→consistencia→intensidad, escalado que preserva el estímulo). Jerarquía de
veto innegociable: salud > recuperación > adherencia > rendimiento. No inventás datos del atleta; usás su
evaluación. Cargas mayoritariamente técnicas; base aeróbica como mayor parte del acondicionamiento.
REGLA DE CARGA INNEGOCIABLE: todo movimiento que use peso (barra, mancuernas, kettlebell, balón, lastre) se
prescribe SIEMPRE con su carga como "% WM" (ej. "Back Squat — 4×6 @ 70% WM", "KB Swing — 20 reps @ 100% WM").
Nunca dejes un movimiento con peso sin carga ni uses kg absoluto si hay base WMD.
Respondés ÚNICAMENTE con el JSON pedido (sin markdown, sin texto extra).`;

function extractJson(text: string): string {
  const t = (text || "").trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) return fence[1].trim();
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  return first >= 0 && last > first ? t.slice(first, last + 1) : t;
}

export interface ChapterResult {
  program: any;
  newMovements: { name: string; modality: string; pattern: string; note?: string }[];
  blockIntention: string;
  witnessMetrics: string[];
  lore: string;
  warning?: string;
}

export async function generateChapter(
  req: ChapterRequest,
  evaluation: AthleteEvaluation,
): Promise<ChapterResult> {
  const prompt = buildChapterPrompt(req, evaluation);
  try {
    const chapterSystem = buildSystemPrompt(NEXUS_CHAPTER_SYSTEM, req.enriched ? getChapterEnrichment() : undefined);
    const text = await generateText({ system: chapterSystem, prompt, json: true, temperature: 0.85 });
    if (text && text.trim()) {
      const parsed = JSON.parse(extractJson(text));
      if (parsed && parsed.program) {
        return {
          program: parsed.program,
          newMovements: Array.isArray(parsed.newMovements) ? parsed.newMovements : [],
          blockIntention: String(parsed.blockIntention || req.blockIntention || evaluation.recommendedIntention),
          witnessMetrics: Array.isArray(parsed.witnessMetrics) ? parsed.witnessMetrics.map(String) : [],
          lore: String(parsed.lore || req.bossInspiration || ""),
        };
      }
    }
  } catch (e) {
    console.error("generateChapter failed:", e);
  }
  // Local fallback (no AI key, or generation failed): the LOCAL ENGINE builds a
  // real, periodized, VARIED chapter from the catalog (seeded so each chapter
  // differs) — not the same neutral template every time.
  const local = localChapterProgram(req, evaluation);
  return {
    program: local.program,
    newMovements: [],
    blockIntention: local.blockIntention,
    witnessMetrics: local.witnessMetrics,
    lore: local.lore,
    warning:
      "Capítulo generado por el motor LOCAL de Nexus (sin IA): periodizado y variado, basado en tu " +
      "evaluación. Configurá tu llave de IA en PERFIL & BIO para generación más rica y temática.",
  };
}

// ── Día especial generado por IA ────────────────────────────────────────────
export interface SpecialDayRequest {
  /** enfoque libre: "metcon largo aeróbico", "fuerza de pierna + gimnasia", "hero WOD" */
  focus: string;
  minutes?: number;
  equipment?: string;
  /** perfil del atleta (athleteProfileBrief) — restricciones y contexto */
  profileBrief?: string;
  /** resumen de la evaluación (evaluateAthlete().summary) */
  evaluationSummary?: string;
}

const NEXUS_DAY_SYSTEM = `Eres "Nexus L4", Master Coach CF-L4. Generás UN (1) DÍA de entrenamiento CrossFit
fundamentado en la metodología NEXUS (Mayhem/PRVN/HWPO/CF-L4). Veto innegociable: salud > recuperación >
adherencia > rendimiento — respetá lesiones declaradas, escalá skills no dominados, no inventes datos del
atleta. REGLA DE CARGA: todo movimiento con peso se prescribe con "% WM" (ej. "Back Squat — 5×3 @ 80% WM").
Cada metcon declara su esquema (AMRAP/For Time/EMOM/intervalos con duración). Respondés ÚNICAMENTE el JSON
pedido, sin markdown ni texto extra.`;

/**
 * Genera un día suelto listo para inyectar como pestaña ESPECIAL. Devuelve un
 * JSON string con la forma que consume parseSpecialDayJson
 * ({ title, variations:[{ b1_warmup, b2_strength, b3_metcon, b4_accessories }] }).
 * Lanza si no hay proveedor de IA o la generación falla (no hay fallback local:
 * un día especial es a pedido y explícito).
 */
export async function generateSpecialDay(req: SpecialDayRequest): Promise<string> {
  if (!(getClaudeKey() || getGeminiKey())) {
    throw new Error("Configurá tu llave de IA en PERFIL & BIO para generar días con IA.");
  }
  const prompt = [
    `Generá UN día especial de CrossFit con este ENFOQUE: ${req.focus}.`,
    req.minutes ? `Duración objetivo de la sesión: ${req.minutes} min.` : "",
    req.equipment ? `Material disponible: ${req.equipment}.` : "Material: estándar de box.",
    req.profileBrief ? `PERFIL DEL ATLETA (respetá lesiones, atacá debilidades, escalá skills no dominados, prescribí cardio relativo a sus benchmarks):\n${req.profileBrief}` : "",
    req.evaluationSummary ? `EVALUACIÓN:\n${req.evaluationSummary}` : "",
    "",
    "Respondé SOLO JSON con esta forma exacta (un día, una variación):",
    '{ "title": "<nombre temático del día>", "variations": [ {',
    '  "b1_warmup": { "title": "01. WARM-UP", "scheme": "", "items": ["..."] },',
    '  "b2_strength": { "title": "02. FUERZA", "scheme": "5x3 @ 80% WM", "items": ["Back Squat"] },',
    '  "b3_metcon": { "title": "03. METCON", "scheme": "AMRAP 14 Min", "items": ["15 Cal Row", "12 Wall Balls (9kg)", "9 Pull-ups"] },',
    '  "b4_accessories": { "title": "04. ACCESORIOS", "scheme": "3 Series", "items": ["..."] }',
    "} ] }",
    "Incluí al menos un metcon con su esquema (duración explícita). Omití bloques que no apliquen al enfoque.",
  ].filter(Boolean).join("\n");

  const system = buildSystemPrompt(NEXUS_DAY_SYSTEM);
  const text = await generateText({ system, prompt, json: true, temperature: 0.85 });
  if (!text || !text.trim()) throw new Error("La IA no devolvió contenido. Reintentá.");
  const parsed = JSON.parse(extractJson(text));
  if (!parsed || !Array.isArray(parsed.variations) || !parsed.variations.length) {
    throw new Error("La IA devolvió una forma inesperada. Reintentá.");
  }
  return JSON.stringify(parsed);
}

// ── Fase 3: AI block inspiration classification ─────────────────────────────

const NEXUS_CLASSIFY_SYSTEM = `Sos "Nexus L4", Master Coach CF-L4. Clasificás cada bloque de entrenamiento según la "huella" de programación que mejor lo representa, eligiendo UNA de estas cuatro inspiraciones:
- "PRVN": precisión e intervalos de Tia-Clair Toomey. Velocidad de barra, gimnasia higiénica, EMOM/intervalos medidos, dobles, pacing.
- "MAYHEM": volumen aeróbico y espíritu competitivo de Froning. Formatos de equipo/sincro, chippers largos, resistencia, relevos.
- "HWPO": grind de fuerza bruta de Mat Fraser. Fuerza pesada (back squat, deadlift, cleans pesados), hipertrofia, accesorios de alta tensión.
- "HAEDO": coach funcional adaptativo (Luk "Balde"). Movimientos funcionales, kettlebells/soga, cuidado espinal, público +35.
Respondé ÚNICAMENTE con JSON: un objeto que mapea cada "id" de bloque a su clave de inspiración. Ejemplo: {"w1d1::b1_": "HWPO", "w1d1::b2_": "PRVN"}.`;

/**
 * Classify each block's inspiration brand with ONE AI call. Returns a map
 * dayId::blockKey → "PRVN"|"MAYHEM"|"HWPO"|"HAEDO", or null when no provider is
 * configured / the call fails (the caller then falls back to the heuristic).
 */
export async function classifyChapterBlocks(program: Database): Promise<Record<string, string> | null> {
  const blocks = blocksForPrompt(program);
  if (!blocks.length) return null;
  const prompt = `Clasificá la inspiración de cada bloque. Bloques:\n${JSON.stringify(blocks)}`;
  try {
    const text = await generateText({ system: NEXUS_CLASSIFY_SYSTEM, prompt, json: true, temperature: 0.2 });
    if (!text || !text.trim()) return null;
    const parsed = JSON.parse(extractJson(text));
    if (!parsed || typeof parsed !== "object") return null;
    const valid = new Set(["PRVN", "MAYHEM", "HWPO", "HAEDO"]);
    const map: Record<string, string> = {};
    for (const [id, v] of Object.entries(parsed)) {
      const key = String(v).toUpperCase();
      if (valid.has(key)) map[id] = key;
    }
    return Object.keys(map).length ? map : null;
  } catch (e) {
    console.error("classifyChapterBlocks failed:", e);
    return null;
  }
}

/**
 * Tag every block's `inspiration` on a chapter program: AI when available
 * (overriding), keyword heuristic everywhere else. Returns a NEW program and
 * never throws — safe to fire-and-forget after an import.
 */
export async function tagChapterInspiration(program: Database): Promise<Database> {
  const heur = heuristicInspirationMap(program);
  let aiMap: Record<string, string> | null = null;
  try {
    aiMap = await classifyChapterBlocks(program);
  } catch {
    aiMap = null;
  }
  return applyInspirationMap(program, { ...heur, ...(aiMap || {}) });
}
