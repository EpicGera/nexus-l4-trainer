// Runtime importer: Google Sheet (Resultados_y_RPE) -> WORKOUT_DATABASE.
//
// Mirrors scripts/generate-workouts.mjs (the offline codegen) but runs in the
// browser, reading the sheet live via the Google Sheets API with the user's
// OAuth token (the app already requests the `spreadsheets` scope). The public
// CSV endpoint can't be used from the browser (no CORS); the Sheets API can.

import { Database, DayVariation, DayWorkout, ProgramBlock, BlockBucket, WeekMeta, BlockIntention, EnergySystem, BlockTimeDomain } from "../types/workout";
import { getAccessToken, requestSheetsAccess } from "./firebase";
import { STORAGE_KEYS, buildLogsKey } from "./storageKeys";
import { isCueOrNote } from "./cueDetection";
import dayLore from "../data/dayLore.json";
// Neutral starter program (no personal results) bundled for new users. This is
// the SAME file offered for download, so there's a single source of truth.
import cleanProgramRaw from "../../public/nexus_plantilla_limpia.json";

const DAY_LORE = dayLore as Record<string, { name: string; title: string }>;

/**
 * The default program shown when the athlete has no per-user program yet.
 * App is Firestore-native: a user's real program lives in their account
 * (localStorage `nexus_workouts_override`, roamed to Firestore by the sync
 * engine). Until they import/create one, this clean template is the starter —
 * deliberately NOT the codegen'd `workouts.ts`, which carries personal loads.
 * Cloned so callers can't mutate the bundled module object.
 */
export function getDefaultProgram(): Database {
  return JSON.parse(JSON.stringify(cleanProgramRaw)) as Database;
}

// Optional WODForge template offered via Google's native "/copy" page (the
// bound Apps Script travels with the copy). Linking a sheet is now an opt-in
// power feature — the app never reads it unless the user explicitly links one.
const TEMPLATE_SHEET_ID = "1N5lMWWTIWDsIq9zWi-n77DRMWiAu8_Tr7pkjLrczYNM";

/** Google's native make-a-copy page for the WODForge template. */
export function getTemplateCopyUrl(): string {
  return `https://docs.google.com/spreadsheets/d/${TEMPLATE_SHEET_ID}/copy`;
}

const SHEET_ID_KEY = STORAGE_KEYS.SOURCE_SHEET_ID;
const SHEET_TAB = "Resultados_y_RPE";
const CACHE_KEY = STORAGE_KEYS.PROGRAM_OVERRIDE;

/**
 * Spreadsheet the app reads the program from — ONLY when the user explicitly
 * linked their own. Returns "" otherwise (no shared/default sheet), so no
 * athlete ever reads another's data. Sheet import is opt-in.
 */
export function getSourceSheetId(): string {
  try {
    return localStorage.getItem(SHEET_ID_KEY) || "";
  } catch {
    return "";
  }
}

export function isUsingCustomSheet(): boolean {
  try {
    return !!localStorage.getItem(SHEET_ID_KEY);
  } catch {
    return false;
  }
}

/**
 * Link the user's own WODForge sheet. Accepts a full Google Sheets URL or a
 * raw spreadsheet id; empty input unlinks the sheet (back to the in-app /
 * Firestore program, no shared default). Returns the stored id, "" when
 * unlinked, or null when the input couldn't be parsed.
 */
export function setSourceSheetId(urlOrId: string): string | null {
  const s = String(urlOrId || "").trim();
  try {
    if (!s) {
      localStorage.removeItem(SHEET_ID_KEY);
      return "";
    }
    const fromUrl = s.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    const id = fromUrl
      ? fromUrl[1]
      : /^[a-zA-Z0-9-_]{25,}$/.test(s)
        ? s
        : null;
    if (!id) return null;
    localStorage.setItem(SHEET_ID_KEY, id);
    return id;
  } catch {
    return null;
  }
}

type Bucket = "warmup" | "strength" | "metcon" | "accessories";

const DAY_INDEX: Record<string, number> = {
  lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6, domingo: 7,
};
const DAY_NAME: Record<number, string> = {
  1: "LUNES", 2: "MARTES", 3: "MIÉRCOLES", 4: "JUEVES", 5: "VIERNES", 6: "SÁBADO", 7: "DOMINGO",
};

const stripAccents = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

function bucketOf(bloque: string): Bucket {
  const b = stripAccents(bloque.toLowerCase());
  if (b.includes("finisher")) return "accessories";
  if (/(descanso|recuperaci|logro|estado f|snc|proximo|cero carga|movil|warm|calent|activaci|estrateg|flujo|gimn|social)/.test(b)) return "warmup";
  if (/(fuerza|strength|estabiliz)/.test(b)) return "strength";
  if (/(metcon|wod|boss|flush|sprint|cardio)/.test(b)) return "metcon";
  if (/(accesor|reinforce|cooldown)/.test(b)) return "accessories";
  return "accessories";
}

const BLOCK_NUM: Record<Bucket, string> = { warmup: "01", strength: "02", metcon: "03", accessories: "04" };
const BLOCK_FALLBACK: Record<Bucket, string> = {
  warmup: "01. WARM-UP", strength: "02. FUERZA", metcon: "03. METCON", accessories: "04. ACCESORIOS",
};

function blockTitle(bucket: Bucket, rawLabel: string): string {
  const clean = rawLabel.replace(/\s*-\s*finisher/i, "").trim();
  return `${BLOCK_NUM[bucket]}. ${clean.toUpperCase()}`;
}

function extractCap(s: string): string | null {
  let m = s.match(/cap[:\s]*?(\d+):(\d{2})/i);
  if (m) return `${parseInt(m[1], 10)}:${m[2]}`;
  m = s.match(/cap[:\s]*?(\d+)\s*min/i);
  if (m) return `${parseInt(m[1], 10)}:00`;
  return null;
}

function normalizeScheme(raw: string, bucket: Bucket): string {
  const s = (raw || "").trim();
  if (!s) return "";
  const U = s.toUpperCase();

  const onOff = U.match(/(\d+)\s*['′"]?\s*(?:MIN|M)?\s*ON\s*\/\s*(\d+)\s*['′"]?\s*(?:MIN|M)?\s*OFF/);
  if (onOff) {
    const rounds = (U.match(/(\d+)\s*RONDAS/) || [])[1] || "4";
    return `${onOff[1]} Min ON / ${onOff[2]} Min OFF x ${rounds} Rondas`;
  }
  const cada = U.match(/CADA\s*(\d+):(\d{2})\s*X\s*(\d+)/);
  if (cada) return `Every ${parseInt(cada[1], 10)}:${cada[2]} x ${cada[3]}`;
  const emom = U.match(/EMOM\s*(\d+)/);
  if (emom) return `EMOM ${emom[1]} MIN`;
  const amrapNx = U.match(/AMRAP\s*\d+\s*X\s*(\d+)\s*MIN/);
  if (amrapNx) return `AMRAP ${amrapNx[1]} MIN`;
  const amrap = U.match(/AMRAP\s*(\d+)/);
  if (amrap) return `AMRAP ${amrap[1]} MIN`;
  const nxmPct = U.match(/(\d+)\s*X\s*(\d+)\s*(?:REPS?)?\s*@?\s*(\d+(?:-\d+)?)\s*%/);
  if (nxmPct) {
    const rest = U.match(/REST\s*(\d+)\s*S/);
    return rest ? `${nxmPct[1]}x${nxmPct[2]} @ ${nxmPct[3]}% | Rest ${rest[1]}s` : `${nxmPct[1]}x${nxmPct[2]} @ ${nxmPct[3]}%`;
  }
  const nxmComplex = U.match(/(\d+)\s*X\s*(\d+)\s*REPS?\s*\(COMPLEJO\s*AL\s*(\d+)\s*%/);
  if (nxmComplex) return `${nxmComplex[1]}x${nxmComplex[2]} @ ${nxmComplex[3]}%`;
  if (/\d+-\d+-\d+/.test(U)) {
    const cap = extractCap(s);
    const base = (U.match(/(\d+-\d+-\d+)/) || [])[1];
    return cap ? `${base} | Cap ${cap}` : base;
  }
  const rondasPT = U.match(/(\d+)\s*RONDAS\s*POR\s*TIEMPO/);
  if (rondasPT) return `${rondasPT[1]} Rondas Por Tiempo`;
  if (/CHIPPER|POR\s*TIEMPO|ACUMULAR/.test(U)) {
    const cap = extractCap(s);
    return cap ? `Por Tiempo | Cap ${cap}` : "Por Tiempo";
  }
  const rondasCap = U.match(/(\d+)\s*RONDAS.*?(\d+)\s*MIN\s*CAP/);
  if (rondasCap) return `${rondasCap[1]} Rondas | Cap ${rondasCap[2]}:00`;
  const nxm = U.match(/(\d+)\s*X\s*(\d+)/);
  if (nxm) return `${nxm[1]} Series`;
  const mins = U.match(/(\d+)\s*MIN(?:UTOS)?/);
  if (mins) {
    if (/ZONA|CONTINU|REMO|BIKE|SKI|CARDIO|FLUSH|CAMINATA/.test(U)) return `${mins[1]} Minutos Continuos`;
    if (bucket === "metcon") return `${mins[1]} Minutos Continuos`;
    return `${mins[1]} Minutos`;
  }
  const rondas = U.match(/(\d+)\s*RONDAS?/);
  if (rondas) return `${rondas[1]} Rondas`;
  const series = U.match(/(\d+)\s*SERIES?/);
  if (series) return `${series[1]} Series`;
  return s;
}

const cleanName = (txt: string) =>
  txt
    .replace(/<[^>]*>/g, "")
    .replace(/^(?:min\s+\d+:\s*)?\d+(?:\/\d+)?\s*(?:cal|reps?|m|x\d+)?\s+/i, "")
    .replace(/\s*\([^)]*kg[^)]*\)/gi, "")
    .replace(/\s*@\s*[\d%-]+\s*%?/gi, "")
    .trim();

function normalizeKg(raw: string): string {
  const v = (raw || "").trim();
  if (!v) return "";
  if (/body\s*weight|^bw$/i.test(stripAccents(v))) return "";
  const n = v.replace(/\s*kg\s*/i, "").replace(",", ".").trim();
  return /^\d+(\.\d+)?$/.test(n) ? `${n}kg` : "";
}

const esc = (s: string) => s.replace(/'/g, "’");

/**
 * Wrap a standalone coaching note in the cue span at import time so every
 * consumer treats it as guidance, never a loggable movement. No-op on a real
 * movement, on an empty string, or on an item that already carries a cue span.
 */
const markCueItem = (item: string): string => {
  if (!item) return item;
  if (/class\s*=\s*["'][^"']*\bcue\b/i.test(item)) return item;
  return isCueOrNote(item) ? `<span class='cue'>${esc(item)}</span>` : item;
};

interface RawRow {
  bloque: string; ejercicio: string; esquema: string; tempoRest: string;
  kg: string; rpe: string; pr: string; notas: string;
}

function buildItem(r: RawRow): string | null {
  const ejercicio = (r.ejercicio || "").trim();
  if (!ejercicio) return null;

  // A coaching note in the Ejercicio column (e.g. "[NOTA]: …", "Foco: …") is
  // not a movement. Mark it as a cue span at the source so every consumer
  // (board render, wizard, analytics) treats it as guidance — instead of each
  // re-running the isCueOrNote regex at render time.
  if (isCueOrNote(ejercicio)) return markCueItem(ejercicio);

  const esquema = (r.esquema || "").trim();
  let detail = "";
  const dash = esquema.split(/\s+-\s+/);
  if (dash.length > 1) detail = dash.slice(1).join(" - ").trim();

  const cueParts: string[] = [];
  if (detail) cueParts.push(esc(detail));
  if (bucketOf(r.bloque) === "strength") {
    const tr = (r.tempoRest || "").trim();
    if (/tempo|rest/i.test(tr)) cueParts.push(esc(tr));
  }
  const reg: string[] = [];
  const kg = normalizeKg(r.kg);
  if (kg) reg.push(kg);
  if (r.rpe && /^\d+(\.\d+)?$/.test(r.rpe.trim())) reg.push(`RPE ${r.rpe.trim()}`);
  if ((r.pr || "").includes("🏆")) reg.push("🏆 PR");
  if (reg.length) cueParts.push(`Registro: ${reg.join(" · ")}`);
  const notas = (r.notas || "").trim();
  if (notas) cueParts.push(esc(notas));

  const cue = cueParts.length ? ` <span class='cue'>${cueParts.join(" · ")}</span>` : "";
  return `${ejercicio}${cue}`;
}

/** Minimal RFC-4180 CSV parser (quoted fields with commas/newlines). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

export function rowsToDatabase(rows: string[][]): Database {
  if (!rows.length) return {};
  const header = rows[0].map((h) => (h || "").trim());
  // Accept both the long original names and the short ones the gscript renames to.
  const col = (...names: string[]) => header.findIndex((h) => names.includes(h));
  const idx = {
    semana: col("Semana"), dia: col("Día", "Dia"), bloque: col("Bloque"),
    ejercicio: col("Ejercicio"), esquema: col("Esquema Pautado", "Esquema"),
    tempoRest: col("Tempo / Rest", "Descanso"), kg: col("Kg Levantados", "Kilos"),
    rpe: col("RPE"), pr: col("PR del Mes (Auto)", "PR"), notas: col("Notas y Comentarios", "Notas"),
  };
  const at = (r: string[], i: number) => (i >= 0 && i < r.length ? r[i] || "" : "");

  const weeks: Record<number, Record<number, RawRow[]>> = {};
  for (const raw of rows.slice(1)) {
    const semana = at(raw, idx.semana).trim();
    const wm = semana.match(/Semana\s*(\d+)/i);
    if (!wm) continue;
    const w = parseInt(wm[1], 10);
    const di = DAY_INDEX[stripAccents(at(raw, idx.dia).trim().toLowerCase())];
    if (!di) continue;
    const row: RawRow = {
      bloque: at(raw, idx.bloque).trim(),
      ejercicio: at(raw, idx.ejercicio),
      esquema: at(raw, idx.esquema),
      tempoRest: at(raw, idx.tempoRest),
      kg: at(raw, idx.kg),
      rpe: at(raw, idx.rpe),
      pr: at(raw, idx.pr),
      notas: at(raw, idx.notas),
    };
    if (!row.bloque && !row.ejercicio.trim()) continue;
    ((weeks[w] ||= {})[di] ||= []).push(row);
  }

  const db: Database = {};
  for (let w = 1; w <= 4; w++) {
    const days: DayWorkout[] = [];
    for (let di = 1; di <= 7; di++) {
      const dayRows = (weeks[w] && weeks[w][di]) || [];
      const buckets: Record<Bucket, RawRow[]> = { warmup: [], strength: [], metcon: [], accessories: [] };
      const labels: Partial<Record<Bucket, string>> = {};
      let completed = false;
      for (const r of dayRows) {
        const b = bucketOf(r.bloque);
        buckets[b].push(r);
        if (!labels[b]) labels[b] = r.bloque || BLOCK_FALLBACK[b];
        if (r.rpe && /^\d+(\.\d+)?$/.test(r.rpe.trim())) completed = true;
      }
      const makeBlock = (b: Bucket) => {
        const rs = buckets[b];
        if (rs.length === 0) return { title: BLOCK_FALLBACK[b], scheme: "", items: [] };
        return {
          title: blockTitle(b, labels[b] || BLOCK_FALLBACK[b]),
          scheme: normalizeScheme(rs[0].esquema, b),
          items: rs.map(buildItem).filter((x): x is string => Boolean(x)),
        };
      };
      const primary =
        (buckets.strength[0] && buckets.strength[0].ejercicio) ||
        (buckets.metcon[0] && buckets.metcon[0].ejercicio) ||
        (buckets.warmup[0] && buckets.warmup[0].ejercicio) ||
        "Sesión L4";
      const variation: DayVariation = {
        tabName: "RX · REGISTRO REAL",
        warmup: makeBlock("warmup"),
        strength: makeBlock("strength"),
        metcon: makeBlock("metcon"),
        accessories: makeBlock("accessories"),
      };
      const id = `w${w}d${di}`;
      const lore = DAY_LORE[id];
      days.push({
        id,
        name: lore?.name || DAY_NAME[di],
        title: lore?.title || cleanName(primary) || "Sesión L4",
        isCompleted: completed,
        hasTabs: false,
        variations: [variation],
      });
    }
    db[`w${w}`] = { days };
  }
  return db;
}

export function parseCsvToDatabase(csv: string): Database {
  return rowsToDatabase(parseCsv(csv));
}

// ------------------------ JSON program import ------------------------------
// Accepts the Database shape ({ w1: { days: [...] }, ... }) with generous
// normalization, so plans generated by coaches/AI load even when fields are
// missing: ids, day names, tabNames and empty blocks are derived.

function normalizeBlock(raw: any): { title: string; scheme: string; items: string[] } {
  const b = raw && typeof raw === "object" ? raw : {};
  return {
    title: String(b.title ?? ""),
    scheme: String(b.scheme ?? ""),
    items: Array.isArray(b.items)
      ? b.items.map((x: any) => markCueItem(String(x ?? "").trim())).filter(Boolean)
      : [],
  };
}

const LEGACY_BLOCK_KEYS = ["warmup", "strength", "metcon", "accessories"];

/**
 * Bucket a flexible block onto one of the four legacy lanes, reading BOTH the
 * source key (e.g. "b2_skill") and the human title (e.g. "HALTEROFILIA TÉCNICA").
 * Skill/oly/gymnastics work counts as strength; grunt/finisher/armadura as
 * accessories. Used only to keep backward-compatible consumers fed; the
 * canonical structure lives in `blocks[]`.
 */
function bucketForBlock(key: string, title: string): BlockBucket {
  const s = stripAccents(`${key} ${title}`.toLowerCase());
  if (/(warm|calent|activaci|movil|tejido blando|despertar|romwod|gowod)/.test(s)) return "warmup";
  if (/(fuerza|strength|halterof|halter|snatch|clean|jerk|squat|deadlift|press|skill|habilidad|gimnas|gymnast|tecnic|olimpic|oly)/.test(s)) return "strength";
  if (/(metcon|wod|boss|flush|sprint|cardio|amrap|for time|emom|intervalo|zona|continu|\brun\b|row|remo|bike|bici|ski)/.test(s)) return "metcon";
  if (/(accesor|finisher|grunt|armadura|pacto|logro|reinforce|cooldown)/.test(s)) return "accessories";
  return "accessories";
}

/** Ordering: `bN_` prefix wins, then the four legacy lanes, then source order. */
function blockOrderIndex(key: string, fallbackPos: number): number {
  const m = key.match(/^b(\d+)_/i);
  if (m) return parseInt(m[1], 10);
  const legacy = LEGACY_BLOCK_KEYS.indexOf(key.toLowerCase());
  if (legacy >= 0) return legacy + 1;
  return 100 + fallbackPos;
}

// ── Derived block metadata: Time Cap, time domain, energy system ────────────

/** Parse a Time Cap (minutes, may be fractional) from a scheme. */
function parseCapMin(U: string): number | null {
  let m = U.match(/CAP\s*(\d+):(\d{2})/);
  if (m) return parseInt(m[1], 10) + parseInt(m[2], 10) / 60;
  m = U.match(/CAP\s*(\d+)\s*MIN/);
  if (m) return parseInt(m[1], 10);
  return null;
}

/** Total minutes a conditioning block lasts, inferred from its scheme. */
function schemeDurationMin(scheme: string): number | null {
  const U = (scheme || "").toUpperCase();
  const onOff = U.match(/(\d+)\s*(?:MIN|M|['′])?\s*ON\s*\/\s*(\d+)\s*(?:MIN|M|['′])?\s*OFF/);
  if (onOff) {
    const on = parseInt(onOff[1], 10);
    const off = parseInt(onOff[2], 10);
    const r = U.match(/(\d+)\s*RONDAS/) || U.match(/X\s*(\d+)/);
    const rounds = r ? parseInt(r[1], 10) : 4;
    return (on + off) * rounds;
  }
  const amrap = U.match(/AMRAP\s*(\d+)/);
  if (amrap) return parseInt(amrap[1], 10);
  const emom = U.match(/EMOM\s*(\d+)/);
  if (emom) return parseInt(emom[1], 10);
  const cap = parseCapMin(U);
  if (cap != null) return cap;
  const range = U.match(/(\d+)\s*-\s*(\d+)\s*MIN/);
  if (range) return parseInt(range[2], 10);
  const mins = U.match(/(\d+)\s*MIN/);
  if (mins) return parseInt(mins[1], 10);
  return null;
}

/** Time-domain bucket — same thresholds as trainingEngine.timeDomain. */
function toTimeDomain(min: number): BlockTimeDomain {
  const sec = min * 60;
  if (sec < 120) return "sprint";
  if (sec < 480) return "short";
  if (sec < 1200) return "medium";
  return "long";
}

function deriveEnergySystem(scheme: string, td: BlockTimeDomain | null): EnergySystem | undefined {
  const s = stripAccents((scheme || "").toLowerCase());
  if (/zona\s*[12]|conversacional|continu|flush|regenerativ/.test(s)) return "oxidative";
  if (!td) return undefined;
  if (td === "sprint" || td === "short") return "glycolytic";
  if (td === "medium") return "mixed";
  return "oxidative"; // long
}

/** Best-effort metadata derived from a block's bucket + scheme (never fabricates). */
export function deriveBlockMeta(
  bucket: BlockBucket,
  scheme: string,
): Pick<ProgramBlock, "capSec" | "timeDomain" | "energySystem"> {
  const out: Pick<ProgramBlock, "capSec" | "timeDomain" | "energySystem"> = {};
  const capMin = parseCapMin((scheme || "").toUpperCase());
  if (capMin != null) out.capSec = Math.round(capMin * 60);
  if (bucket === "metcon") {
    const min = schemeDurationMin(scheme);
    if (min != null && min > 0) {
      out.timeDomain = toTimeDomain(min);
      out.energySystem = deriveEnergySystem(scheme, out.timeDomain);
    } else {
      const es = deriveEnergySystem(scheme, null);
      if (es) out.energySystem = es;
    }
  }
  return out;
}

function isBlockLike(val: any): boolean {
  return (
    !!val &&
    typeof val === "object" &&
    !Array.isArray(val) &&
    ("items" in val || "title" in val || "scheme" in val)
  );
}

/** Build a canonical ProgramBlock from a raw block object + its resolved key. */
function toProgramBlock(raw: any, key: string): ProgramBlock {
  const nb = normalizeBlock(raw);
  const bucket: BlockBucket =
    typeof raw?.bucket === "string" && LEGACY_BLOCK_KEYS.includes(raw.bucket)
      ? (raw.bucket as BlockBucket)
      : bucketForBlock(key, nb.title);
  const block: ProgramBlock = { key, ...nb, bucket, ...deriveBlockMeta(bucket, nb.scheme) };
  // Preserve an AI-classified inspiration tag (Fase 3) across re-imports.
  if (typeof raw?.inspiration === "string" && raw.inspiration) block.inspiration = raw.inspiration;
  return block;
}

/**
 * Pull the ordered block list off a variation object.
 *
 * Precedence: an explicit `blocks` ARRAY is the canonical source of truth — when
 * present it wins and the legacy fixed fields are IGNORED, so we never drop a
 * second same-bucket block (e.g. two strength pieces) nor import an empty day.
 * Otherwise we scan block-like properties: the fixed four
 * (warmup/strength/metcon/accessories), the `bN_name` flexible form, or any
 * other named block object — ordered by `bN_` index, else legacy lane, else
 * source order.
 */
function extractBlocks(v: any): ProgramBlock[] {
  if (!v || typeof v !== "object") return [];
  if (Array.isArray(v.blocks) && v.blocks.length) {
    return v.blocks
      .filter((b: any) => isBlockLike(b))
      .map((b: any, i: number) => {
        const key = typeof b?.key === "string" && b.key.trim() ? b.key.trim() : `b${i + 1}_block`;
        return toProgramBlock(b, key);
      });
  }
  const ordered = Object.keys(v)
    .filter((k) => k !== "tabName" && k !== "blocks" && isBlockLike(v[k]))
    .map((key, i) => ({ key, ord: blockOrderIndex(key, i), block: toProgramBlock(v[key], key) }))
    .sort((a, b) => a.ord - b.ord);
  return ordered.map((x) => x.block);
}

// ── Week metadata: block intention + Lifestyle Gear ─────────────────────────

const INTENTION_ALIASES: Record<string, BlockIntention> = {
  acumulacion: "acumulacion", accumulation: "acumulacion", base: "acumulacion", volumen: "acumulacion",
  intensificacion: "intensificacion", intensification: "intensificacion", intenso: "intensificacion",
  realizacion: "realizacion", peak: "realizacion", "peak week": "realizacion", pico: "realizacion", realization: "realizacion",
  restauracion: "restauracion", restoration: "restauracion", deload: "restauracion", descarga: "restauracion", recuperacion: "restauracion",
};

function normalizeIntention(v: unknown): BlockIntention | undefined {
  return INTENTION_ALIASES[stripAccents(String(v ?? "").toLowerCase().trim())];
}

/** Infer the week's intention from day titles + block schemes (keyword scan). */
function inferWeekIntention(days: DayWorkout[]): BlockIntention | undefined {
  const hay = stripAccents(
    days
      .map((d) => {
        const blockText = d.variations
          .map((v) =>
            v.blocks?.length
              ? v.blocks.map((b) => `${b.title} ${b.scheme}`).join(" ")
              : `${v.warmup.scheme} ${v.strength.scheme} ${v.metcon.scheme}`,
          )
          .join(" ");
        return `${d.title} ${blockText}`;
      })
      .join(" ")
      .toLowerCase(),
  );
  if (/\bdeload\b|descarga|lavado neural|cicatrices|vigilancia pasiva|meditacion en la roca|mente de agua/.test(hay)) return "restauracion";
  if (/\bpeak\b|peak week|furia del boss|fuerza pico/.test(hay)) return "realizacion";
  if (/intensificaci|rompe-?huesos|maxima intensidad/.test(hay)) return "intensificacion";
  return undefined;
}

function normalizeWeekMeta(raw: unknown, days: DayWorkout[]): WeekMeta | undefined {
  const m = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  let intention = normalizeIntention(m.intention);
  let inferred = false;
  if (!intention) {
    intention = inferWeekIntention(days);
    inferred = !!intention;
  }
  const g = Number(m.gear);
  const gear = Number.isFinite(g) && g >= 1 && g <= 5 ? Math.round(g) : undefined;
  if (!intention && gear == null) return undefined;
  return {
    ...(intention ? { intention } : {}),
    ...(gear != null ? { gear } : {}),
    ...(inferred ? { inferred: true } : {}),
  };
}

const emptyLane = () => ({ title: "", scheme: "", items: [] as string[] });

/**
 * Collapse the ordered blocks into the four legacy lanes (merging items when
 * several blocks share a bucket) so the board, export, wizard and engine keep
 * working until they read `blocks[]` natively.
 */
function deriveLegacyLanes(blocks: ProgramBlock[]) {
  const lanes: Record<BlockBucket, { title: string; scheme: string; items: string[] }> = {
    warmup: emptyLane(), strength: emptyLane(), metcon: emptyLane(), accessories: emptyLane(),
  };
  for (const b of blocks) {
    const lane = lanes[b.bucket];
    if (!lane.title && b.title) lane.title = b.title;
    if (!lane.scheme && b.scheme) lane.scheme = b.scheme;
    lane.items.push(...b.items);
  }
  return lanes;
}

export function parseJsonToDatabase(text: string): Database {
  let raw: any;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("El archivo no es JSON válido.");
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("El JSON debe ser un objeto { w1: { days: [...] }, ... }.");
  }

  // Accept the canonical interchange form { schemaVersion, weeks: [{ week, days,
  // intention?, gear? }] } by projecting it onto the internal { w1: {...} } map.
  if (Array.isArray(raw.weeks)) {
    const mapped: Record<string, any> = {};
    raw.weeks.forEach((w: any, i: number) => {
      const n = Number.isFinite(Number(w?.week)) ? Number(w.week) : i + 1;
      mapped[`w${n}`] = {
        days: Array.isArray(w?.days) ? w.days : [],
        meta: {
          ...(w?.intention ? { intention: w.intention } : {}),
          ...(w?.gear != null ? { gear: w.gear } : {}),
        },
      };
    });
    raw = mapped;
  }

  const db: Database = {};
  Object.keys(raw).forEach((key) => {
    const wk = key.toLowerCase().trim();
    if (!/^w\d+$/.test(wk)) return;
    const weekRaw = raw[key];
    const daysRaw = Array.isArray(weekRaw?.days)
      ? weekRaw.days
      : Array.isArray(weekRaw)
        ? weekRaw
        : null;
    if (!daysRaw) return;

    const days: DayWorkout[] = daysRaw.slice(0, 7).map((d: any, i: number) => {
      const dayNum = i + 1;
      // Accept a variations array, or a flat day carrying the blocks directly.
      const variationsRaw =
        Array.isArray(d?.variations) && d.variations.length ? d.variations : [d];
      const variations: DayVariation[] = variationsRaw.map((v: any, vi: number) => {
        const blocks = extractBlocks(v);
        const lanes = deriveLegacyLanes(blocks);
        // Attach blocks[] whenever the source is genuinely flexible: an explicit
        // `blocks` array, a non-legacy key (bN_/custom name), more than four
        // blocks, OR two blocks sharing a bucket (e.g. two strength pieces) —
        // any of which the four legacy lanes cannot represent without loss.
        // Plain four-block programs keep their exact legacy shape (blocks omitted).
        const bucketCounts = blocks.reduce<Record<string, number>>((acc, b) => {
          acc[b.bucket] = (acc[b.bucket] || 0) + 1;
          return acc;
        }, {});
        const hasFlexible =
          (Array.isArray(v?.blocks) && v.blocks.length > 0) ||
          blocks.length > 4 ||
          blocks.some((b) => !LEGACY_BLOCK_KEYS.includes(b.key.toLowerCase())) ||
          Object.values(bucketCounts).some((c) => c > 1);
        return {
          tabName: String(
            v?.tabName ??
              (variationsRaw.length > 1 ? `PLAN ${String.fromCharCode(65 + vi)}` : "ÚNICO"),
          ),
          warmup: lanes.warmup,
          strength: lanes.strength,
          metcon: lanes.metcon,
          accessories: lanes.accessories,
          ...(hasFlexible ? { blocks } : {}),
        };
      });
      return {
        id:
          typeof d?.id === "string" && /^w\d+d\d+$/.test(d.id.trim())
            ? d.id.trim()
            : `${wk}d${dayNum}`,
        name: String(d?.name ?? DAY_NAME[dayNum] ?? `DÍA ${dayNum}`),
        title: String(d?.title ?? ""),
        isCompleted: false,
        hasTabs: variations.length > 1,
        variations,
      };
    });
    if (days.length) {
      const metaRaw = Array.isArray(weekRaw) ? undefined : (weekRaw as any)?.meta;
      const meta = normalizeWeekMeta(metaRaw, days);
      db[wk] = meta ? { days, meta } : { days };
    }
  });

  if (!Object.keys(db).length) {
    throw new Error("No se encontraron semanas válidas (claves w1, w2, …).");
  }
  return db;
}

/** Quick counts for import-confirmation messages. */
export function summarizeDatabase(db: Database): {
  weeks: number;
  days: number;
  items: number;
} {
  let days = 0;
  let items = 0;
  Object.values(db).forEach((week) => {
    week.days.forEach((day) => {
      days++;
      day.variations.forEach((v) => {
        items += v.blocks?.length
          ? v.blocks.reduce((s, b) => s + b.items.length, 0)
          : v.warmup.items.length +
            v.strength.items.length +
            v.metcon.items.length +
            v.accessories.items.length;
      });
    });
  });
  return { weeks: Object.keys(db).length, days, items };
}

/** Extracts historical log data embedded in the database and seeds localStorage */
export function backfillLocalLogsFromDatabase(db: Database) {
  const now = Date.now();
  let addedCount = 0;

  for (const [weekKey, week] of Object.entries(db)) {
    const w = parseInt(weekKey.replace('w', '')) || 1;
    for (const day of week.days) {
      const d = parseInt(day.id.replace(/w\d+d/, '')) || 1;
      
      // Calculate realistic chronological timestamps so the charts span correctly
      const daysAgo = (4 - w) * 7 + (7 - d);
      const timestamp = now - daysAgo * 24 * 60 * 60 * 1000;

      for (const variation of day.variations) {
        for (const bucket of ['warmup', 'strength', 'metcon', 'accessories'] as const) {
          for (const item of variation[bucket].items) {
            const match = item.match(/^(.*?)\s*<span class='cue'>(.*?)<\/span>/);
            if (!match) continue;
            
            const exerciseName = match[1].replace(/<[^>]+>/g, '').trim();
            const cue = match[2];

            if (!cue.includes("Registro:")) continue;

            let weight = "";
            let rpe = "";
            let reps = "1";

            const parts = cue.split('·').map(p => p.trim());
            for (const p of parts) {
              if (p.startsWith('Registro:')) {
                const regVal = p.replace('Registro:', '').trim();
                if (regVal.toUpperCase().startsWith('RPE')) {
                  rpe = regVal.replace(/[^\d.]/g, '');
                } else {
                  weight = regVal.replace(/[^\d.]/g, '');
                }
              } else if (p.toUpperCase().startsWith('RPE')) {
                rpe = p.replace(/[^\d.]/g, '');
              }
            }

            if (!rpe && !weight) continue;

            const logKey = buildLogsKey(day.id, exerciseName);

            if (!localStorage.getItem(logKey)) {
              const logEntry = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                weight,
                reps,
                rpe,
                timestamp
              };
              localStorage.setItem(logKey, JSON.stringify([logEntry]));
              addedCount++;
            }
          }
        }
      }
    }
  }
  
  if (addedCount > 0) {
    console.log(`[Backfill] Extraídos y sincronizados ${addedCount} registros históricos para los gráficos.`);
    // Trigger global event so charts re-render immediately
    window.dispatchEvent(new CustomEvent('nexus_storage_changed'));
  }
}

// --------------------------- cache + live fetch ----------------------------

export function loadCachedWorkouts(): Database | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const db = JSON.parse(raw);
    return db && typeof db === "object" && db.w1 ? (db as Database) : null;
  } catch {
    return null;
  }
}

export function saveCachedWorkouts(db: Database): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(db));
  } catch {
    /* storage full / restricted — ignore */
  }
}

export function clearCachedWorkouts(): void {
  try { localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
}

/** Fetch the sheet live via the Sheets API using the user's OAuth token. */
export async function fetchWorkoutsFromSheet(): Promise<Database> {
  const sheetId = getSourceSheetId();
  if (!sheetId) {
    throw new Error(
      "No hay planilla vinculada. Tu programa vive en tu cuenta; vincular una Google Sheet es opcional (panel de la nube).",
    );
  }
  let token = await getAccessToken();
  if (!token) {
    // First Sheets use this session — request the scope on demand.
    token = await requestSheetsAccess();
  }
  if (!token) {
    throw new Error("Necesitás dar acceso a Google Sheets para refrescar desde la hoja.");
  }
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(SHEET_TAB)}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) {
    throw new Error(`La hoja no respondió (${r.status}). Verificá tus permisos de acceso.`);
  }
  const data = await r.json();
  const values: string[][] = data.values || [];
  if (values.length < 2) throw new Error("La hoja no devolvió datos.");
  return rowsToDatabase(values);
}
