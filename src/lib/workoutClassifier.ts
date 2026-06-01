/**
 * Classification utilities for PRVN, Mayhem & HWPO workouts.
 * Determines if a given exercise is cardio or bodyweight-only.
 */
export function isCardio(exerciseName: string, rawItemHtml?: string): boolean {
  const combined = `${exerciseName} ${rawItemHtml || ""}`.toUpperCase();
  return (
    combined.includes("REMO") ||
    combined.includes("ROW") ||
    combined.includes("SKI") ||
    combined.includes("BIKE") ||
    combined.includes("ASSAULT") ||
    combined.includes("ECHO") ||
    combined.includes("BICI") ||
    combined.includes("RUN") ||
    combined.includes("CORRER") ||
    combined.includes("DU ") ||
    combined.includes("DOUBLE UNDER") ||
    combined.includes("SOGA") ||
    combined.includes("CAL") ||
    combined.includes("METROS") ||
    combined.includes("METRES") ||
    combined.includes("CARDIO") ||
    combined.includes("HYROX") ||
    combined.includes("MONOESTRUCTURAL") ||
    combined.includes("MONOSTRUCTURAL") ||
    combined.includes("CORRIENDO") ||
    combined.includes("METCON")
  );
}

export function isBodyweightOnly(
  exerciseName: string,
  rawItemHtml?: string,
): boolean {
  const combined = `${exerciseName} ${rawItemHtml || ""}`.toUpperCase();
  return (
    combined.includes("BURPEE") ||
    combined.includes("PULL-UP") ||
    combined.includes("PULLUP") ||
    combined.includes("DOMINADA") ||
    combined.includes("PUSH-UP") ||
    combined.includes("PUSHUP") ||
    combined.includes("FLEXION") ||
    combined.includes("SIT-UP") ||
    combined.includes("SITUP") ||
    combined.includes("ABDOMINAL") ||
    combined.includes("T2B") ||
    combined.includes("TOES") ||
    combined.includes("MUSCLE-UP") ||
    combined.includes("MUSCLEUP") ||
    combined.includes("AIR SQUAT") ||
    combined.includes("SOGA") ||
    combined.includes("DU ") ||
    combined.includes("DOUBLE UNDER") ||
    combined.includes("HANDSTAND") ||
    combined.includes("HSPU") ||
    combined.includes("PISTOL") ||
    combined.includes("ZANCADA") ||
    combined.includes("LUNGE") ||
    combined.includes("CRAWL") ||
    combined.includes("CHIN-UP") ||
    combined.includes("DIP") ||
    combined.includes("FONDO")
  );
}
