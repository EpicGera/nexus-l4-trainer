// ---------------------------------------------------------------------------
// Codegen: Google Sheet (Resultados_y_RPE)  ->  src/data/workouts.ts
//
// Reads the "Resultados_y_RPE" tab of the L4 training sheet and generates the
// app's WORKOUT_DATABASE (offline-first, no runtime network/auth dependency).
//
// Usage:
//   node scripts/generate-workouts.mjs                 # fetch the public sheet
//   node scripts/generate-workouts.mjs path/to.csv     # use a local CSV export
//
// The sheet must be link-viewable ("Anyone with the link -> Viewer") when
// fetching over the network. Re-run whenever the sheet changes.
// ---------------------------------------------------------------------------

import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Diablo-2 themed day names/titles (gamification lore) — single source of truth,
// shared with the runtime importer (src/lib/sheetImport.ts).
const DAY_LORE = JSON.parse(
  readFileSync(resolve(ROOT, "src/data/dayLore.json"), "utf8"),
);

const SHEET_ID = "1N5lMWWTIWDsIq9zWi-n77DRMWiAu8_Tr7pkjLrczYNM";
const SHEET_TAB = "Resultados_y_RPE";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
  SHEET_TAB,
)}`;

// ----------------------------- CSV parsing ---------------------------------

/** Minimal RFC-4180 CSV parser (handles quoted fields with commas/newlines). */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c === "\r") {
      // ignore; \n handles the line break
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// --------------------------- domain mapping --------------------------------

const DAY_INDEX = {
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
  domingo: 7,
};
const DAY_NAME = {
  1: "LUNES",
  2: "MARTES",
  3: "MIÉRCOLES",
  4: "JUEVES",
  5: "VIERNES",
  6: "SÁBADO",
  7: "DOMINGO",
};

const stripAccents = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Map a sheet "Bloque" label to one of the 4 canonical app buckets. */
function bucketOf(bloque) {
  const b = stripAccents(bloque.toLowerCase());
  if (b.includes("finisher")) return "accessories";
  if (
    /(descanso|recuperaci|logro|estado f|snc|proximo|cero carga|movil|warm|calent|activaci|estrateg|flujo|gimn|social)/.test(
      b,
    )
  )
    return "warmup";
  if (/(fuerza|strength|estabiliz)/.test(b)) return "strength";
  if (/(metcon|wod|boss|flush|sprint|cardio)/.test(b)) return "metcon";
  if (/(accesor|reinforce|cooldown)/.test(b)) return "accessories";
  return "accessories";
}

const BLOCK_NUM = { warmup: "01", strength: "02", metcon: "03", accessories: "04" };
const BLOCK_FALLBACK_TITLE = {
  warmup: "01. WARM-UP",
  strength: "02. FUERZA",
  metcon: "03. METCON",
  accessories: "04. ACCESORIOS",
};

/** Pretty block title from the first contributing sheet label. */
function blockTitle(bucket, rawLabel) {
  const clean = rawLabel.replace(/\s*-\s*finisher/i, "").trim();
  return `${BLOCK_NUM[bucket]}. ${clean.toUpperCase()}`;
}

/** mm:ss from a "(Time Cap 8:00)" / "(Cap 6 Min)" / "(Cap: 35 Min)" fragment. */
function extractCap(s) {
  let m = s.match(/cap[:\s]*?(\d+):(\d{2})/i);
  if (m) return `${parseInt(m[1], 10)}:${m[2]}`;
  m = s.match(/cap[:\s]*?(\d+)\s*min/i);
  if (m) return `${parseInt(m[1], 10)}:00`;
  return null;
}

/**
 * Normalize a free-text sheet scheme into the canonical grammar that
 * src/lib/protocolParser.ts understands (so the workout timer behaves).
 */
function normalizeScheme(raw, bucket) {
  const s = (raw || "").trim();
  if (!s) return "";
  const U = s.toUpperCase();

  // Work/rest intervals: "Intervalos 4 Rondas (3' ON / 1' OFF)" or "5 Min ON / 1 Min OFF x 3 Rondas"
  const onOff = U.match(/(\d+)\s*['′"]?\s*(?:MIN|M)?\s*ON\s*\/\s*(\d+)\s*['′"]?\s*(?:MIN|M)?\s*OFF/);
  if (onOff) {
    const rounds = (U.match(/(\d+)\s*RONDAS/) || [])[1] || "4";
    return `${onOff[1]} Min ON / ${onOff[2]} Min OFF x ${rounds} Rondas`;
  }

  // "2 Cada 1:30 x 5 Series"  ->  Every 1:30 x 5
  const cada = U.match(/CADA\s*(\d+):(\d{2})\s*X\s*(\d+)/);
  if (cada) return `Every ${parseInt(cada[1], 10)}:${cada[2]} x ${cada[3]}`;

  // EMOM N (min)
  const emom = U.match(/EMOM\s*(\d+)/);
  if (emom) return `EMOM ${emom[1]} MIN`;

  // AMRAP "N x M min" (DO YOU BLEED) -> duration is M
  const amrapNx = U.match(/AMRAP\s*\d+\s*X\s*(\d+)\s*MIN/);
  if (amrapNx) return `AMRAP ${amrapNx[1]} MIN`;
  // AMRAP N min
  const amrap = U.match(/AMRAP\s*(\d+)/);
  if (amrap) return `AMRAP ${amrap[1]} MIN`;

  // Strength NxM @ % : "4x6 @ 65-70% RM (Tempo 21X1 / Rest 90s)"
  const nxmPct = U.match(/(\d+)\s*X\s*(\d+)\s*(?:REPS?)?\s*@?\s*(\d+(?:-\d+)?)\s*%/);
  if (nxmPct) {
    const rest = U.match(/REST\s*(\d+)\s*S/);
    return rest
      ? `${nxmPct[1]}x${nxmPct[2]} @ ${nxmPct[3]}% | Rest ${rest[1]}s`
      : `${nxmPct[1]}x${nxmPct[2]} @ ${nxmPct[3]}%`;
  }
  // Complex "4x3 reps (Complejo al 60% ...)"
  const nxmComplex = U.match(/(\d+)\s*X\s*(\d+)\s*REPS?\s*\(COMPLEJO\s*AL\s*(\d+)\s*%/);
  if (nxmComplex) return `${nxmComplex[1]}x${nxmComplex[2]} @ ${nxmComplex[3]}%`;

  // Descending rep schemes 21-15-9 with optional cap
  if (/\d+-\d+-\d+/.test(U)) {
    const cap = extractCap(s);
    const base = (U.match(/(\d+-\d+-\d+)/) || [])[1];
    return cap ? `${base} | Cap ${cap}` : base;
  }

  // "N Rondas Por Tiempo - ..."  (metcon rounds for time)
  const rondasPT = U.match(/(\d+)\s*RONDAS\s*POR\s*TIEMPO/);
  if (rondasPT) return `${rondasPT[1]} Rondas Por Tiempo`;

  // Chipper / Por Tiempo with a cap
  if (/CHIPPER|POR\s*TIEMPO|ACUMULAR/.test(U)) {
    const cap = extractCap(s);
    return cap ? `Por Tiempo | Cap ${cap}` : "Por Tiempo";
  }

  // "3 rondas 10 min cap"
  const rondasCap = U.match(/(\d+)\s*RONDAS.*?(\d+)\s*MIN\s*CAP/);
  if (rondasCap) return `${rondasCap[1]} Rondas | Cap ${rondasCap[2]}:00`;

  // Strength/accessory NxM (no %): "3x10 por pierna (18kg)", "3x15 reps"
  const nxm = U.match(/(\d+)\s*X\s*(\d+)/);
  if (nxm) return `${nxm[1]} Series`;

  // Continuous minutes / Zona 2: "35 min (...)", "30 Minutos Zona 1-2", "15 MIN ZONA 2"
  const mins = U.match(/(\d+)\s*MIN(?:UTOS)?/);
  if (mins) {
    if (/ZONA|CONTINU|REMO|BIKE|SKI|CARDIO|FLUSH|CAMINATA/.test(U))
      return `${mins[1]} Minutos Continuos`;
    if (bucket === "metcon") return `${mins[1]} Minutos Continuos`;
    return `${mins[1]} Minutos`;
  }

  // Generic rounds: "3 Rondas", "4 Rondas:", "Fuerza-Resistencia 4 Rondas:"
  const rondas = U.match(/(\d+)\s*RONDAS?/);
  if (rondas) return `${rondas[1]} Rondas`;
  const series = U.match(/(\d+)\s*SERIES?/);
  if (series) return `${series[1]} Series`;

  // Descriptive / qualitative — leave as-is (timer falls back sensibly).
  return s;
}

// ------------------------------ items --------------------------------------

const cleanName = (txt) =>
  txt
    .replace(/<[^>]*>/g, "")
    .replace(/^(?:min\s+\d+:\s*)?\d+(?:\/\d+)?\s*(?:cal|reps?|m|x\d+)?\s+/i, "")
    .replace(/\s*\([^)]*kg[^)]*\)/gi, "")
    .replace(/\s*@\s*[\d%-]+\s*%?/gi, "")
    .trim();

/** Normalize a "Kg Levantados" cell into a "NNkg" string, or "" for bodyweight/blank. */
function normalizeKg(raw) {
  const v = (raw || "").trim();
  if (!v) return "";
  if (/body\s*weight|^bw$/i.test(stripAccents(v))) return "";
  const n = v.replace(/\s*kg\s*/i, "").replace(",", ".").trim();
  if (/^\d+(\.\d+)?$/.test(n)) return `${n}kg`;
  return "";
}

const esc = (s) => s.replace(/'/g, "’"); // avoid clashing with class='cue'

/** Build one display item: clean name + cue with rep detail / load / RPE / notes. */
function buildItem(r) {
  const ejercicio = (r.ejercicio || "").trim();
  if (!ejercicio) return null;

  // Rep detail = part of the scheme after the protocol separator " - "
  const esquema = (r.esquema || "").trim();
  let detail = "";
  const dash = esquema.split(/\s+-\s+/);
  if (dash.length > 1) detail = dash.slice(1).join(" - ").trim();

  const cueParts = [];
  if (detail) cueParts.push(esc(detail));

  if (bucketOf(r.bloque) === "strength") {
    const tr = (r.tempoRest || "").trim();
    if (/tempo|rest/i.test(tr)) cueParts.push(esc(tr));
  }

  const reg = [];
  const kg = normalizeKg(r.kg);
  if (kg) reg.push(kg);
  if (r.rpe && /^\d+(\.\d+)?$/.test(r.rpe.trim())) reg.push(`RPE ${r.rpe.trim()}`);
  if ((r.pr || "").includes("🏆")) reg.push("🏆 PR");
  if (reg.length) cueParts.push(`Registro: ${reg.join(" · ")}`);

  const notas = (r.notas || "").trim();
  if (notas) cueParts.push(esc(notas));

  const cue = cueParts.length
    ? ` <span class='cue'>${cueParts.join(" · ")}</span>`
    : "";

  return `${ejercicio}${cue}`;
}

// ------------------------------- build -------------------------------------

async function loadCsv() {
  const arg = process.argv[2];
  const local = arg ? resolve(arg) : resolve(ROOT, "sheet_main.csv");
  if (arg && existsSync(local)) {
    console.log(`Reading local CSV: ${local}`);
    return readFileSync(local, "utf8");
  }
  try {
    console.log(`Fetching sheet: ${CSV_URL}`);
    const res = await fetch(CSV_URL);
    const body = await res.text();
    if (res.ok && !body.startsWith("<!DOCTYPE")) return body;
    console.warn("Network fetch did not return CSV (sheet private?).");
  } catch (e) {
    console.warn(`Network fetch failed: ${e.message}`);
  }
  if (existsSync(local)) {
    console.log(`Falling back to local CSV: ${local}`);
    return readFileSync(local, "utf8");
  }
  throw new Error(
    "Could not load sheet. Make it link-viewable, or pass a local CSV path.",
  );
}

function build(rows) {
  const header = rows[0].map((h) => h.trim());
  // Accept both the long original names and the short ones the gscript renames to.
  const col = (...names) => header.findIndex((h) => names.includes(h));
  const idx = {
    semana: col("Semana"),
    dia: col("Día", "Dia"),
    bloque: col("Bloque"),
    ejercicio: col("Ejercicio"),
    esquema: col("Esquema Pautado", "Esquema"),
    tempoRest: col("Tempo / Rest", "Descanso"),
    kg: col("Kg Levantados", "Kilos"),
    rpe: col("RPE"),
    pr: col("PR del Mes (Auto)", "PR"),
    notas: col("Notas y Comentarios", "Notas"),
  };

  // group: week -> dayIndex -> rows[]
  const weeks = {};
  for (const raw of rows.slice(1)) {
    const semana = (raw[idx.semana] || "").trim();
    const wm = semana.match(/Semana\s*(\d+)/i);
    if (!wm) continue; // section header / blank row
    const w = parseInt(wm[1], 10);
    const diaKey = stripAccents((raw[idx.dia] || "").trim().toLowerCase());
    const di = DAY_INDEX[diaKey];
    if (!di) continue;
    const row = {
      bloque: (raw[idx.bloque] || "").trim(),
      ejercicio: raw[idx.ejercicio] || "",
      esquema: raw[idx.esquema] || "",
      tempoRest: raw[idx.tempoRest] || "",
      kg: raw[idx.kg] || "",
      rpe: raw[idx.rpe] || "",
      pr: raw[idx.pr] || "",
      notas: raw[idx.notas] || "",
    };
    if (!row.bloque && !row.ejercicio.trim()) continue;
    ((weeks[w] ||= {})[di] ||= []).push(row);
  }

  const db = {};
  const unmappedSchemes = new Set();

  for (let w = 1; w <= 4; w++) {
    const days = [];
    for (let di = 1; di <= 7; di++) {
      const dayRows = (weeks[w] && weeks[w][di]) || [];

      const buckets = { warmup: [], strength: [], metcon: [], accessories: [] };
      const labels = {};
      let completed = false;

      for (const r of dayRows) {
        const bucket = bucketOf(r.bloque);
        buckets[bucket].push(r);
        if (!labels[bucket]) labels[bucket] = r.bloque || BLOCK_FALLBACK_TITLE[bucket];
        if (r.rpe && /^\d+(\.\d+)?$/.test(r.rpe.trim())) completed = true;
      }

      const makeBlock = (bucket) => {
        const rs = buckets[bucket];
        if (rs.length === 0)
          return { title: BLOCK_FALLBACK_TITLE[bucket], scheme: "", items: [] };
        const scheme = normalizeScheme(rs[0].esquema, bucket);
        if (scheme && rs[0].esquema && scheme === rs[0].esquema.trim())
          unmappedSchemes.add(rs[0].esquema.trim());
        return {
          title: blockTitle(bucket, labels[bucket]),
          scheme,
          items: rs.map(buildItem).filter(Boolean),
        };
      };

      const warmup = makeBlock("warmup");
      const strength = makeBlock("strength");
      const metcon = makeBlock("metcon");
      const accessories = makeBlock("accessories");

      // Day title: primary lift -> primary metcon -> warmup -> rest
      const primary =
        (buckets.strength[0] && buckets.strength[0].ejercicio) ||
        (buckets.metcon[0] && buckets.metcon[0].ejercicio) ||
        (buckets.warmup[0] && buckets.warmup[0].ejercicio) ||
        "Sesión L4";
      const id = `w${w}d${di}`;
      const lore = DAY_LORE[id] || {};

      days.push({
        id,
        name: lore.name || DAY_NAME[di],
        title: lore.title || cleanName(primary) || "Sesión L4",
        isCompleted: completed,
        hasTabs: false,
        variations: [
          { tabName: "RX · REGISTRO REAL", warmup, strength, metcon, accessories },
        ],
      });
    }
    db[`w${w}`] = { days };
  }

  return { db, unmappedSchemes };
}

// ------------------------------- main --------------------------------------

const csv = await loadCsv();
const rows = parseCsv(csv);
const { db, unmappedSchemes } = build(rows);

const banner = `// AUTO-GENERATED — do not edit by hand.
// Source: Google Sheet "${SHEET_TAB}"
//   https://docs.google.com/spreadsheets/d/${SHEET_ID}
// Regenerate: node scripts/generate-workouts.mjs
`;

const out = `import { Database } from '../types/workout';

${banner}
export const WORKOUT_DATABASE: Database = ${JSON.stringify(db, null, 2)};
`;

const target = resolve(ROOT, "src/data/workouts.ts");
writeFileSync(target, out, "utf8");

const dayCount = Object.values(db).reduce((a, w) => a + w.days.length, 0);
const itemCount = Object.values(db).reduce(
  (a, w) =>
    a +
    w.days.reduce(
      (b, d) =>
        b +
        ["warmup", "strength", "metcon", "accessories"].reduce(
          (c, k) => c + d.variations[0][k].items.length,
          0,
        ),
      0,
    ),
  0,
);

console.log(`\n✓ Wrote ${target}`);
console.log(`  weeks: ${Object.keys(db).length} · days: ${dayCount} · items: ${itemCount}`);
if (unmappedSchemes.size) {
  console.log(`\n⚠ Schemes left verbatim (review if timer behaves oddly):`);
  [...unmappedSchemes].sort().forEach((s) => console.log(`   · ${s}`));
}
