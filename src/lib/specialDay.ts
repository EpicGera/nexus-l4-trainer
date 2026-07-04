// Día especial por JSON: un día suelto (mismo contrato de bloques del programa,
// ver docs/GUIA-generar-programa-IA-externa.md) se agrega como pestaña ESPECIAL
// del día elegido. El original queda intacto; el wizard y todos los cálculos lo
// consumen como cualquier variación (deriveBlockMeta corre en el parse).
//
// Reuso deliberado: el día se envuelve en { w1: { days: [día] } } para pasar
// por el MISMO gate (auditProgram, Capa 1) y el MISMO parser del programa
// completo — cero contratos paralelos.

import { Database, DayVariation } from "../types/workout";
import { parseJsonToDatabase } from "./sheetImport";
import { auditProgram, AuditResult } from "./auditProgram";
import { parseDayId } from "./storageKeys";

export const SPECIAL_TAB = "ESPECIAL";

export function parseSpecialDayJson(text: string): { variation: DayVariation; audit: AuditResult } {
  let raw: any;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("El archivo no es JSON válido.");
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("El JSON debe ser un objeto de día (con variations o bloques bN_...).");
  }

  // acepta un día completo ({ title, variations: [...] }) o una variación suelta
  const day = Array.isArray(raw.variations)
    ? raw
    : { title: raw.title || "DÍA ESPECIAL", variations: [raw] };
  const wrapped = { w1: { days: [day] } };

  const audit = auditProgram(wrapped);
  if (!audit.ok) {
    const first = audit.issues.find((i) => i.severity === "error");
    throw new Error(`El día no pasó la auditoría: ${first?.message ?? "errores en el JSON"}`);
  }

  const db = parseJsonToDatabase(JSON.stringify(audit.normalized));
  const v = db?.w1?.days?.[0]?.variations?.[0];
  const itemCount = v
    ? (v.blocks?.reduce((s, b) => s + b.items.length, 0) ??
      v.warmup.items.length + v.strength.items.length + v.metcon.items.length + v.accessories.items.length)
    : 0;
  if (!v || itemCount === 0) {
    throw new Error("El JSON no contiene ejercicios legibles.");
  }
  v.tabName = SPECIAL_TAB; // marcador único: una ESPECIAL por día
  return { variation: v, audit };
}

/** Agrega (o reemplaza) la pestaña ESPECIAL del día. Devuelve una base nueva. */
export function injectSpecialVariation(
  db: Database,
  dayId: string,
  variation: DayVariation,
): Database {
  return mapDay(db, dayId, (vars) => [...vars.filter((v) => v.tabName !== SPECIAL_TAB), variation]);
}

/** Quita la pestaña ESPECIAL del día (no-op si no hay). */
export function removeSpecialVariation(db: Database, dayId: string): Database {
  return mapDay(db, dayId, (vars) => vars.filter((v) => v.tabName !== SPECIAL_TAB));
}

export function hasSpecialVariation(db: Database, dayId: string): boolean {
  const parsed = parseDayId(dayId);
  const day = parsed ? db[`w${parsed.week}`]?.days?.find((d) => d.id === dayId) : null;
  return !!day?.variations?.some((v) => v.tabName === SPECIAL_TAB);
}

function mapDay(
  db: Database,
  dayId: string,
  fn: (vars: DayVariation[]) => DayVariation[],
): Database {
  const parsed = parseDayId(dayId);
  if (!parsed) return db;
  const wk = `w${parsed.week}`;
  const week = db[wk];
  if (!week) return db;
  return {
    ...db,
    [wk]: {
      ...week,
      days: week.days.map((d) => (d.id === dayId ? { ...d, variations: fn(d.variations) } : d)),
    },
  };
}
