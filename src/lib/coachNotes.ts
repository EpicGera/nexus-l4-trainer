// Motor de "notas del coach" (revamp dirección E, toque humano). Puro y
// determinista: dado un puñado de datos ya calculados por las pantallas, devuelve
// las anotaciones manuscritas que el coach escribiría encima de la UI. Sin IA,
// sin costo, sin leer localStorage (los inputs los pasa cada componente → testeable).
//
// Regla de oro: si no hay nada que decir, no hay nota. El silencio también es
// humano — máx. una nota por `target`.

export type CoachTarget =
  | "rpe-hero"   // KPI grande de RPE promedio
  | "rpe-chart"  // sobre el gráfico de RPE (usa meta.dayIndex)
  | "days"       // fila de chips de días
  | "autoreg"    // tarjeta de autorregulación
  | "strength"   // tarjeta de fuerza relativa
  | "rank"       // tarjeta de rango/XP (Guerrero)
  | "radar"      // radar de atributos (usa meta.attr)
  | "fatigue";   // tarjeta de fatiga/monotonía

export interface CoachNote {
  id: string;
  target: CoachTarget;
  text: string;
  tone: "pen"; // por ahora todas van en birome; el color lo pone CoachNote
  meta?: Record<string, number | string>;
}

export interface CoachInputs {
  /** Semilla de determinismo (p.ej. "w4"): la misma semana elige la misma variante. */
  week: string;
  todayIndex?: number | null; // 0=L … 6=D

  rpeAvg?: number | null;
  rpeTarget?: number | null;
  /** Día de mayor desvío real sobre lo prescrito. */
  rpePeak?: { dayIndex: number; real: number; prescribed: number } | null;

  /** Índice del día marcado "perdido" esta semana, o null. */
  missedDayIndex?: number | null;

  /** Sugerencia de Working Max: Puntaje Nexus y si el sistema la habilita. */
  autoreg?: { puntajeNexus: number; accepted: boolean } | null;

  /** Fuerza relativa por levantamiento, `pct` = fracción del estándar (0..1). */
  liftRatios?: { name: string; pct: number }[];

  xpPerWeek?: number | null;
  xpToNext?: number | null;

  /** Atributos del Guerrero (0..100). */
  radar?: { attr: string; value: number }[];

  /** Índice de monotonía del entrenamiento. */
  monotony?: number | null;
}

// ── determinismo: hash de string → entero, para elegir variante estable ──────
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
/** Elige una variante de forma estable por (semana + regla): no cambia en cada
 *  render, pero no es siempre la misma frase entre semanas. */
function pick<T>(variants: T[], seed: string): T {
  return variants[hashStr(seed) % variants.length];
}

const DAY_NAMES = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

/**
 * Calcula las notas del coach a partir de datos ya derivados. Determinista.
 */
export function computeCoachNotes(i: CoachInputs): CoachNote[] {
  const notes: CoachNote[] = [];
  const seedFor = (rule: string) => `${i.week}:${rule}`;

  // 1 · RPE promedio vs objetivo prescrito
  if (i.rpeAvg != null && i.rpeTarget != null) {
    const dev = i.rpeAvg - i.rpeTarget;
    if (dev >= 0.5) {
      const d = dev.toFixed(1);
      notes.push({
        id: "rpe-vs-target",
        target: "rpe-hero",
        tone: "pen",
        text: pick(
          [
            `vas ${d} arriba del objetivo — bajá un cambio`,
            `${d} por encima de lo pedido. no fuerces de más`,
            `te fuiste ${d} arriba del target esta semana`,
          ],
          seedFor("rpe-hi"),
        ),
      });
    } else if (dev <= -0.5) {
      const d = Math.abs(dev).toFixed(1);
      notes.push({
        id: "rpe-vs-target",
        target: "rpe-hero",
        tone: "pen",
        text: pick(
          [
            `vas ${d} por debajo — te queda margen para apretar`,
            `${d} abajo del objetivo. podés meterle un poco más`,
            `suave esta semana (${d} bajo target)`,
          ],
          seedFor("rpe-lo"),
        ),
      });
    }
  }

  // 2 · Pico de RPE por encima de lo prescrito (anotación sobre el chart)
  if (i.rpePeak && i.rpePeak.real - i.rpePeak.prescribed >= 1.0) {
    notes.push({
      id: "rpe-peak",
      target: "rpe-chart",
      tone: "pen",
      text: pick(["acá te pasaste", "ojo acá", "este día te fuiste"], seedFor("peak")),
      meta: { dayIndex: i.rpePeak.dayIndex },
    });
  }

  // 3 · Día perdido ya pasado esta semana
  if (
    i.missedDayIndex != null &&
    i.todayIndex != null &&
    i.todayIndex > i.missedDayIndex
  ) {
    const dn = DAY_NAMES[i.missedDayIndex] ?? "un día";
    notes.push({
      id: "missed-day",
      target: "days",
      tone: "pen",
      text: pick(
        [`el ${dn} pasó — hoy volvemos ↑`, `quedó pendiente el ${dn}. seguimos`, `perdiste el ${dn}, nada más. a lo que sigue`],
        seedFor("missed"),
      ),
    });
  }

  // 4 · Autorregulación merecida (rendiste sobre lo prescrito)
  if (i.autoreg && i.autoreg.accepted && i.autoreg.puntajeNexus > 100) {
    const p = Math.round(i.autoreg.puntajeNexus);
    notes.push({
      id: "autoreg-earned",
      target: "autoreg",
      tone: "pen",
      text: pick(
        [`rendiste ${p} sobre lo prescrito — te lo ganaste 💪`, `${p} de puntaje: subir el max es justo`, `te lo ganaste, ${p} sobre lo pedido`],
        seedFor("autoreg"),
      ),
    });
  }

  // 5 · Un levantamiento quedó atrás (los demás bien)
  if (i.liftRatios && i.liftRatios.length >= 2) {
    const sorted = [...i.liftRatios].sort((a, b) => a.pct - b.pct);
    const weakest = sorted[0];
    const rest = sorted.slice(1);
    const restAvg = rest.reduce((s, r) => s + r.pct, 0) / rest.length;
    if (weakest.pct < 0.6 && restAvg >= 0.8) {
      notes.push({
        id: "lift-lagging",
        target: "strength",
        tone: "pen",
        text: pick(
          [`el ${weakest.name.toLowerCase()} quedó atrás — dale prioridad`, `subí el ${weakest.name.toLowerCase()}, está rezagado`, `${weakest.name.toLowerCase()}: 2 sesiones/sem hasta emparejar`],
          seedFor("lift"),
        ),
        meta: { name: weakest.name },
      });
    }
  }

  // 6 · Ritmo de XP al próximo rango
  if (i.xpPerWeek != null && i.xpPerWeek > 0 && i.xpToNext != null && i.xpToNext > 0) {
    const weeks = Math.ceil(i.xpToNext / i.xpPerWeek);
    notes.push({
      id: "xp-pace",
      target: "rank",
      tone: "pen",
      text: pick(
        [`~${weeks} semanas al ritmo actual. no aflojes`, `si seguís así, ${weeks} semanas al próximo rango`, `${weeks} semanas más y subís de rango`],
        seedFor("xp"),
      ),
      meta: { weeks },
    });
  }

  // 7 · Atributo más débil del radar
  if (i.radar && i.radar.length >= 3) {
    const vals = i.radar.map((r) => r.value);
    const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
    const weakest = i.radar.reduce((m, r) => (r.value < m.value ? r : m), i.radar[0]);
    if (weakest.value < 55 && avg - weakest.value >= 15) {
      notes.push({
        id: "radar-weak",
        target: "radar",
        tone: "pen",
        text: pick(["a trabajar", "acá flojeás", "tu punto débil"], seedFor("radar")),
        meta: { attr: weakest.attr },
      });
    }
  }

  // 8 · Monotonía alta (todo el estímulo parecido)
  if (i.monotony != null && i.monotony > 2.0) {
    notes.push({
      id: "monotony-high",
      target: "fatigue",
      tone: "pen",
      text: pick(
        ["todos los días parecidos — variá el estímulo", "mucha monotonía. meté variedad", "romper la rutina te va a hacer bien"],
        seedFor("mono"),
      ),
    });
  }

  return notes;
}

/** Atajo: la nota para un target dado (o null). Máx. una por target. */
export function noteFor(notes: CoachNote[], target: CoachTarget): CoachNote | null {
  return notes.find((n) => n.target === target) ?? null;
}
