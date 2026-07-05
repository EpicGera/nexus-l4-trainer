// Perfil del atleta capturado en el onboarding. NO es cosmético: se serializa
// a un bloque de prompt (athleteProfileBrief) que alimenta la generación de
// capítulos/días — lesiones a evitar, debilidades a atacar, benchmarks de
// cardio para prescribir ritmos, dieta y life-gear para el contexto de
// recuperación. Peso corporal vive aparte (profileMetrics); objetivos en
// athleteObjective.ts. Claves nexus_* → roaman a Firestore por usuario.
//
// Honestidad: todo es opcional. Si el atleta no sabe, hay un DEFAULT sensato
// (ver DEFAULT_PROFILE) — nunca se fabrica un dato como si fuera medido.

export type Sex = "M" | "F" | "X";
export type SkillLevel = "none" | "some" | "rx"; // no lo tengo / en progreso / dominado
export type Level3 = "low" | "mid" | "high";
export type DietApproach =
  | "sin_definir" | "balanceada" | "alta_proteina" | "low_carb"
  | "vegetariana" | "vegana" | "deficit" | "superavit";

export interface AthleteBio {
  sex: Sex | null;
  ageYears: number | null;
  heightCm: number | null;
}

/** Tiempos en SEGUNDOS (o reps para crossovers), null = no medido. */
export interface CardioMarks {
  run1kSec: number | null;
  row500Sec: number | null;
  row2kSec: number | null;
  ski500Sec: number | null;
  bike1kSec: number | null;
  crossoversMax: number | null;
}

export interface AthleteHealth {
  injuries: string;    // lesiones crónicas / dolencias
  weaknesses: string;  // debilidades declaradas por el atleta
}

export interface AthleteDiet {
  approach: DietApproach;
  restrictions: string; // alergias / intolerancias
}

/** Life gear: factores de vida que condicionan la recuperación (encicl. Parte XXIV). */
export interface LifeGear {
  sleep: Level3;
  stress: Level3;
  nutrition: Level3;
}

export interface FullProfile {
  bio: AthleteBio;
  skills: Record<string, SkillLevel>;
  kipping: Record<string, SkillLevel>;
  cardio: CardioMarks;
  health: AthleteHealth;
  diet: AthleteDiet;
  gear: LifeGear;
}

const BIO_KEY = "nexus_athlete_bio";
const SKILLS_KEY = "nexus_skill_levels";
const KIPPING_KEY = "nexus_kipping_levels";
const CARDIO_KEY = "nexus_cardio_marks";
const HEALTH_KEY = "nexus_athlete_health";
const DIET_KEY = "nexus_athlete_diet";
const GEAR_KEY = "nexus_life_gear";
const ONBOARDING_KEY = "nexus_onboarding_done";

export const ONBOARDING_SKILLS: { id: string; label: string }[] = [
  { id: "pull-up", label: "Dominadas" },
  { id: "chest-to-bar", label: "Chest to Bar" },
  { id: "toes-to-bar", label: "Toes to Bar" },
  { id: "handstand-pushup", label: "HSPU" },
  { id: "muscle-up", label: "Muscle-up" },
  { id: "double-under", label: "Double Unders" },
];

/** Técnicas de kipping (eficiencia gimnástica) que el onboarding evalúa. */
export const ONBOARDING_KIPPING: { id: string; label: string }[] = [
  { id: "kip-pullup", label: "Kipping Pull-up" },
  { id: "butterfly", label: "Butterfly" },
  { id: "kip-hspu", label: "Kipping HSPU" },
  { id: "kip-t2b", label: "Kipping T2B" },
];

export const CARDIO_FIELDS: { id: keyof CardioMarks; label: string; unit: "time" | "reps" }[] = [
  { id: "run1kSec", label: "Run 1 km", unit: "time" },
  { id: "row500Sec", label: "Row 500 m", unit: "time" },
  { id: "row2kSec", label: "Row 2 km", unit: "time" },
  { id: "ski500Sec", label: "Ski 500 m", unit: "time" },
  { id: "bike1kSec", label: "Bike 1 km", unit: "time" },
  { id: "crossoversMax", label: "Crossovers máx", unit: "reps" },
];

export const DIET_LABEL: Record<DietApproach, string> = {
  sin_definir: "Sin definir", balanceada: "Balanceada", alta_proteina: "Alta en proteína",
  low_carb: "Baja en carbos", vegetariana: "Vegetariana", vegana: "Vegana",
  deficit: "Déficit calórico", superavit: "Superávit calórico",
};

// Descriptores + sugerencias del life gear (mostrados en el onboarding).
export const GEAR_DIMENSIONS: {
  id: keyof LifeGear; label: string; levels: Record<Level3, { desc: string; tip: string }>;
}[] = [
  {
    id: "sleep", label: "Sueño",
    levels: {
      low: { desc: "< 6 h o irregular", tip: "priorizá volumen conservador y descargas más frecuentes" },
      mid: { desc: "6–7 h", tip: "recuperación aceptable; vigilá los picos de intensidad" },
      high: { desc: "7–9 h estable", tip: "tolerás más volumen e intensidad" },
    },
  },
  {
    id: "stress", label: "Estrés",
    levels: {
      high: { desc: "Alto / crónico", tip: "el estrés drena la recuperación: evitá acumular fatiga sistémica" },
      mid: { desc: "Moderado", tip: "manejable con buena higiene de descanso" },
      low: { desc: "Bajo", tip: "ventana amplia para intensificar" },
    },
  },
  {
    id: "nutrition", label: "Nutrición",
    levels: {
      low: { desc: "Descuidada", tip: "la recuperación va a limitar el rendimiento; empezá por lo básico" },
      mid: { desc: "Aceptable", tip: "suficiente para progresar a ritmo moderado" },
      high: { desc: "Cuidada / con plan", tip: "soporta cargas altas y ganancias más rápidas" },
    },
  },
];

// ── Defaults sensatos (cuando el atleta no sabe) ────────────────────────────
export const DEFAULT_PROFILE: FullProfile = {
  bio: { sex: null, ageYears: null, heightCm: null },
  skills: {},
  kipping: {},
  cardio: { run1kSec: null, row500Sec: null, row2kSec: null, ski500Sec: null, bike1kSec: null, crossoversMax: null },
  health: { injuries: "", weaknesses: "" },
  diet: { approach: "sin_definir", restrictions: "" },
  gear: { sleep: "mid", stress: "mid", nutrition: "mid" }, // vida "promedio": el default neutro
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...(JSON.parse(raw) as object) } as T : fallback;
  } catch {
    return fallback;
  }
}
function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("nexus_logs_updated"));
  } catch {
    /* storage restricted — ignore */
  }
}

export function getAthleteBio(): AthleteBio {
  const b = readJson<AthleteBio>(BIO_KEY, DEFAULT_PROFILE.bio);
  return {
    sex: b.sex ?? null,
    ageYears: typeof b.ageYears === "number" && b.ageYears > 0 ? b.ageYears : null,
    heightCm: typeof b.heightCm === "number" && b.heightCm > 0 ? b.heightCm : null,
  };
}
export const setAthleteBio = (bio: AthleteBio) => writeJson(BIO_KEY, bio);
export const getSkillLevels = () => readJson<Record<string, SkillLevel>>(SKILLS_KEY, {});
export const setSkillLevels = (l: Record<string, SkillLevel>) => writeJson(SKILLS_KEY, l);
export const getKippingLevels = () => readJson<Record<string, SkillLevel>>(KIPPING_KEY, {});
export const setKippingLevels = (l: Record<string, SkillLevel>) => writeJson(KIPPING_KEY, l);
export const getCardioMarks = () => readJson<CardioMarks>(CARDIO_KEY, DEFAULT_PROFILE.cardio);
export const setCardioMarks = (c: CardioMarks) => writeJson(CARDIO_KEY, c);
export const getHealth = () => readJson<AthleteHealth>(HEALTH_KEY, DEFAULT_PROFILE.health);
export const setHealth = (h: AthleteHealth) => writeJson(HEALTH_KEY, h);
export const getDiet = () => readJson<AthleteDiet>(DIET_KEY, DEFAULT_PROFILE.diet);
export const setDiet = (d: AthleteDiet) => writeJson(DIET_KEY, d);
export const getLifeGear = () => readJson<LifeGear>(GEAR_KEY, DEFAULT_PROFILE.gear);
export const setLifeGear = (g: LifeGear) => writeJson(GEAR_KEY, g);

export function getFullProfile(): FullProfile {
  return {
    bio: getAthleteBio(), skills: getSkillLevels(), kipping: getKippingLevels(),
    cardio: getCardioMarks(), health: getHealth(), diet: getDiet(), gear: getLifeGear(),
  };
}

export function isOnboardingDone(): boolean {
  try { return localStorage.getItem(ONBOARDING_KEY) === "true"; } catch { return false; }
}
export function markOnboardingDone(): void {
  try { localStorage.setItem(ONBOARDING_KEY, "true"); } catch { /* ignore */ }
}

export function needsOnboarding(opts: { hasBodyweight: boolean; hasOneRm: boolean; hasSessions: boolean }): boolean {
  if (isOnboardingDone()) return false;
  return !opts.hasBodyweight && !opts.hasOneRm && !opts.hasSessions;
}

// ── Serialización a prompt (la parte que HACE ÚTIL al onboarding) ────────────
const mmss = (sec: number | null): string | null => {
  if (sec == null || sec <= 0) return null;
  return `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, "0")}`;
};

/**
 * Renderiza el perfil como bloque de restricciones/contexto para el generador.
 * Se inyecta en el prompt del capítulo: lesiones a EVITAR, debilidades a
 * ATACAR, benchmarks de cardio para prescribir ritmos, dieta y life-gear para
 * calibrar volumen/recuperación. Devuelve "" si no hay nada declarado.
 */
export function athleteProfileBrief(p: FullProfile = getFullProfile()): string {
  const lines: string[] = [];

  const demo: string[] = [];
  if (p.bio.sex) demo.push(p.bio.sex === "M" ? "masculino" : p.bio.sex === "F" ? "femenino" : "otro");
  if (p.bio.ageYears) demo.push(`${p.bio.ageYears} años`);
  if (p.bio.heightCm) demo.push(`${p.bio.heightCm} cm`);
  if (demo.length) lines.push(`Atleta: ${demo.join(", ")}.`);

  const cardio = CARDIO_FIELDS.map((f) => {
    const v = p.cardio[f.id];
    if (v == null || v <= 0) return null;
    return f.unit === "reps" ? `${f.label} ${v}` : `${f.label} ${mmss(v)}`;
  }).filter(Boolean);
  if (cardio.length) lines.push(`Benchmarks de cardio (prescribí ritmos/objetivos relativos a esto): ${cardio.join(", ")}.`);

  const strongKip = Object.entries(p.kipping).filter(([, v]) => v === "rx").map(([id]) => id);
  const weakKip = Object.entries(p.kipping).filter(([, v]) => v === "none").map(([id]) => id);
  if (weakKip.length) lines.push(`Kipping AÚN NO dominado (programá progresiones, evitá volúmenes altos que exijan la técnica): ${weakKip.join(", ")}.`);
  if (strongKip.length) lines.push(`Kipping dominado: ${strongKip.join(", ")}.`);

  // solo lo EXPLÍCITAMENTE marcado "none" (un skill sin responder es desconocido, no ausente)
  const missingSkills = ONBOARDING_SKILLS.filter((s) => p.skills[s.id] === "none").map((s) => s.label);
  if (missingSkills.length) lines.push(`Skills que el atleta NO tiene todavía (escalá o programá progresión, no las prescribas Rx en volumen): ${missingSkills.join(", ")}.`);

  if (p.health.injuries.trim())
    lines.push(`LESIONES / DOLENCIAS CRÓNICAS a respetar (evitá o escalá los patrones que las agravan; el veto salud>recuperación>adherencia manda): ${p.health.injuries.trim()}.`);
  if (p.health.weaknesses.trim())
    lines.push(`Debilidades declaradas a ATACAR con slot dedicado (PRVN): ${p.health.weaknesses.trim()}.`);

  if (p.diet.approach !== "sin_definir" || p.diet.restrictions.trim()) {
    const d = [`Dieta: ${DIET_LABEL[p.diet.approach]}`];
    if (p.diet.restrictions.trim()) d.push(`restricciones: ${p.diet.restrictions.trim()}`);
    lines.push(d.join(" — ") + ". (Contexto de recuperación/composición corporal.)");
  }

  const gearTips = GEAR_DIMENSIONS
    .map((dim) => {
      const lvl = p.gear[dim.id];
      // solo destacamos los niveles que condicionan la carga (no el "mid" neutro)
      if (lvl === "mid") return null;
      const meta = dim.levels[lvl];
      return `${dim.label} ${meta.desc.toLowerCase()} → ${meta.tip}`;
    })
    .filter(Boolean);
  if (gearTips.length) lines.push(`Life-gear (calibrá volumen/intensidad y descargas): ${gearTips.join("; ")}.`);

  return lines.join("\n");
}
