// Datos demográficos + de habilidad del atleta, capturados en el onboarding.
// Peso corporal vive aparte (profileMetrics); acá van sexo, edad, altura y el
// nivel de skills. Claves nexus_* → roaman a Firestore por usuario.
//
// Estos datos dan CONTEXTO al punto de referencia inicial (fuerza relativa,
// expectativas por sexo/edad) sin fabricar nada: si el atleta no los ingresa,
// el análisis degrada honestamente igual que antes.

export type Sex = "M" | "F" | "X";
export type SkillLevel = "none" | "some" | "rx"; // no lo tengo / en progreso / dominado

export interface AthleteBio {
  sex: Sex | null;
  ageYears: number | null;
  heightCm: number | null;
}

const BIO_KEY = "nexus_athlete_bio";
const SKILLS_KEY = "nexus_skill_levels";
const ONBOARDING_KEY = "nexus_onboarding_done";

/** Skills gimnásticos clave que el onboarding pregunta (id → label). */
export const ONBOARDING_SKILLS: { id: string; label: string }[] = [
  { id: "pull-up", label: "Dominadas" },
  { id: "chest-to-bar", label: "Chest to Bar" },
  { id: "toes-to-bar", label: "Toes to Bar" },
  { id: "handstand-pushup", label: "HSPU" },
  { id: "muscle-up", label: "Muscle-up" },
  { id: "double-under", label: "Double Unders" },
];

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
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
  const b = readJson<Partial<AthleteBio>>(BIO_KEY, {});
  return {
    sex: b.sex ?? null,
    ageYears: typeof b.ageYears === "number" && b.ageYears > 0 ? b.ageYears : null,
    heightCm: typeof b.heightCm === "number" && b.heightCm > 0 ? b.heightCm : null,
  };
}
export function setAthleteBio(bio: AthleteBio): void {
  writeJson(BIO_KEY, bio);
}

export function getSkillLevels(): Record<string, SkillLevel> {
  return readJson<Record<string, SkillLevel>>(SKILLS_KEY, {});
}
export function setSkillLevels(levels: Record<string, SkillLevel>): void {
  writeJson(SKILLS_KEY, levels);
}

export function isOnboardingDone(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === "true";
  } catch {
    return false;
  }
}
export function markOnboardingDone(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, "true");
  } catch {
    /* ignore */
  }
}

/**
 * ¿Es un atleta nuevo que debería ver el onboarding? True cuando no completó
 * el onboarding Y no tiene datos que sugieran uso previo (evita molestar a
 * usuarios existentes que ya tienen historial pero nunca vieron el wizard).
 */
export function needsOnboarding(opts: { hasBodyweight: boolean; hasOneRm: boolean; hasSessions: boolean }): boolean {
  if (isOnboardingDone()) return false;
  return !opts.hasBodyweight && !opts.hasOneRm && !opts.hasSessions;
}
