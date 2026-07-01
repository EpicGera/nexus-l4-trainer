// FILE_PATH: src/lib/encyclopediaContext.ts
// ACTION: CREATE
// DESCRIPTION: Imports the NEXUS encyclopedia via Vite ?raw, parses it by
//   ## PARTE headers, and exports segmented context functions for each AI feature.
// ---------------------------------------------------------

import encyclopediaRaw from '../../docs/NEXUSL4V7.MD?raw';

// ── Parse the encyclopedia into a Map<partKey, content> ──────────────────────
// V7 uses h1 ("# PARTE") for parts and folds the glossary into "## Apéndice J".
// Legacy v2 used h2 ("## PARTE") and a standalone "## GLOSARIO ESENCIAL". The
// parser accepts both header levels so it survives either document.

function parseParts(raw: string): Map<string, string> {
  const map = new Map<string, string>();

  // Collect all "PARTE" boundaries (h1 in V7, h2 in legacy).
  const boundaries: { index: number; label: string }[] = [];
  const lineRegex = /^#{1,2}\s*PARTE\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  while ((match = lineRegex.exec(raw)) !== null) {
    boundaries.push({ index: match.index, label: match[1].trim() });
  }

  // CIERRE (h1 in V7, h2 in legacy) closes the final part.
  const cierreMatch = raw.match(/^#{1,2}\s*CIERRE/m);
  const docEnd = cierreMatch ? cierreMatch.index! : raw.length;

  for (let i = 0; i < boundaries.length; i++) {
    const start = boundaries[i].index;
    const end = i + 1 < boundaries.length ? boundaries[i + 1].index : docEnd;
    const label = boundaries[i].label;
    // Extract the roman numeral from "I — ...", "XVIII — ...", "XXIV — ..." etc.
    const romanMatch = label.match(/^([IVXLCDM]+)\b/);
    const key = romanMatch ? romanMatch[1] : label.substring(0, 6);
    map.set(key, raw.substring(start, end).trim());
  }

  // Glossary special key. Legacy: standalone "## GLOSARIO ESENCIAL". V7: it is
  // "## Apéndice J — Glosario ..." inside the appendix part — capture only that
  // block (bounded by the next part/header) so always-on calls stay lean.
  const glossaryMatch = raw.match(/^#{1,3}\s*(GLOSARIO ESENCIAL|Apéndice J\b)[^\n]*$/m);
  if (glossaryMatch && glossaryMatch.index != null) {
    const gStart = glossaryMatch.index;
    const after = raw.slice(gStart + glossaryMatch[0].length);
    const nextHeader = after.search(/^#{1,2}\s/m);
    const gEnd = nextHeader >= 0 ? gStart + glossaryMatch[0].length + nextHeader : raw.length;
    map.set("GLOSARIO", raw.substring(gStart, gEnd).trim());
  }

  return map;
}

const parts = parseParts(encyclopediaRaw);

function getParts(...keys: string[]): string {
  return keys.map(k => parts.get(k) || "").filter(Boolean).join("\n\n---\n\n");
}

// ── Exported context functions ───────────────────────────────────────────────

/**
 * Always-on AI directives (Part XVIII + Glossary). Injected in ALL AI calls
 * regardless of enrichment toggle. ~1,200 tokens.
 * NOTE: in V7 the LLM directives live in Part XVIII and the glossary is
 * Appendix J (captured under the "GLOSARIO" key by the parser).
 */
export function getAlwaysOnDirectives(): string {
  const content = getParts("XVIII", "GLOSARIO");
  if (!content) return "";
  return [
    "=== DIRECTIVAS NEXUS PARA IA (VINCULANTES) ===",
    "Estas directivas son constitucionales y deben respetarse en toda interacción.",
    "",
    content,
    "",
    "=== FIN DIRECTIVAS ===",
  ].join("\n");
}

/**
 * Chapter Creator enrichment (Parts II, III, IV, V, VIII, XXIV). ~5,200 tokens.
 * Provides: Mayhem microcycles, PRVN chaos prep, HWPO blocks (Working Max +
 * Doble Progresión), CF-L4 decision trees, energy systems, recovery protocols,
 * and the Lifestyle Gears (Part XXIV) that set a block's intention/intensity
 * ceiling.
 */
export function getChapterEnrichment(): string {
  const content = getParts("II", "III", "IV", "V", "VIII", "XXIV");
  if (!content) return "";
  return [
    "=== CONTEXTO METODOLÓGICO NEXUS (ENCICLOPEDIA) ===",
    "Usá este conocimiento profundo para fundamentar tus decisiones de programación.",
    "Este material proviene de la enciclopedia NEXUS de coaching CF-L4.",
    "",
    content,
    "",
    "=== FIN CONTEXTO METODOLÓGICO ===",
  ].join("\n");
}

/**
 * Whiteboard audit enrichment (Parts V, IX, X, XI, XII, XIII). ~3,000 tokens.
 * Provides: decision trees, strength/oly/gymnastics cues, conditioning design,
 * scaling theory, pain management, red flags.
 */
export function getAuditEnrichment(): string {
  const content = getParts("V", "IX", "X", "XI", "XII", "XIII");
  if (!content) return "";
  return [
    "=== CONTEXTO METODOLÓGICO NEXUS (ENCICLOPEDIA) ===",
    "Usá este conocimiento profundo para fundamentar tu auditoría clínica.",
    "Incluye cues técnicos, árboles de decisión y protocolos de escalado.",
    "",
    content,
    "",
    "=== FIN CONTEXTO METODOLÓGICO ===",
  ].join("\n");
}

/**
 * Chat coaching enrichment (Parts V, VI, VII, VIII, XV, XVII, XXIV). ~4,300 tokens.
 * Provides: decision trees, athlete psychology, decision engine, recovery,
 * the adaptable athlete-profile system (Part XV), box folklore, and nutrition +
 * Lifestyle Gears (Part XXIV) for lifestyle/fueling coaching questions.
 */
export function getChatCoachEnrichment(): string {
  const content = getParts("V", "VI", "VII", "VIII", "XV", "XVII", "XXIV");
  if (!content) return "";
  return [
    "=== CONTEXTO METODOLÓGICO NEXUS (ENCICLOPEDIA) ===",
    "Usá este conocimiento profundo para fundamentar tu coaching clínico.",
    "Incluye psicología del atleta, árboles de decisión y casos prácticos.",
    "",
    content,
    "",
    "=== FIN CONTEXTO METODOLÓGICO ===",
  ].join("\n");
}
