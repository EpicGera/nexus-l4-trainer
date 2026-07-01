// FILE_PATH: scripts/generate-clean-template.ts
// ACTION: OVERWRITE
// DESCRIPTION: Generates a clean JSON program template by stripping ALL personal
//   data (weights, RPEs, PRs, registration notes, training diary entries) from
//   the active WORKOUT_DATABASE. Preserves program structure only.
// ---------------------------------------------------------

import { WORKOUT_DATABASE } from "../src/data/workouts";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "node:url";

// --- Patterns that indicate PERSONAL training notes (must be stripped) ---
const PERSONAL_NOTE_PATTERNS = [
  // First-person Spanish training diary language
  /\bhice\b/i, /\bhizo\b/i, /\bhicimos\b/i,
  /\bbaje\b/i, /\bbajé\b/i, /\bsubí\b/i, /\bsubio\b/i,
  /\bpodía\b/i, /\bpodia\b/i, /\bpude\b/i,
  /\bse sintieron?\b/i, /\bsentí\b/i,
  /\bcambiado por\b/i, /\bcambié\b/i,
  /\bfueron alrededor\b/i, /\bfueron\s+\d/i,
  /\bprimera ronda\b/i, /\bsegunda ronda\b/i, /\btercer(a)? ronda\b/i,
  /\bunbroken\b/i,
  // Specific performance breakdowns (12+9, 8+7, 4+4+4, etc.)
  /\d+\s*\+\s*\d+\s*(bar|push|pull)?/i,
  // Wattage readings (personal performance data)
  /\d+\s*watts?\b/i,
  // Explicit registration/log markers
  /\bRegistro\b/i,
  /🏆/,
  // RPE values as standalone
  /\bRPE\s*\d/i,
  // "ESCALADO" is a personal scaling note
  /\bESCALADO\b/i,
  // "Cumple Balde" is a box-specific personal context
  /\bCumple Balde\b/i,
  // "[plan: estimado" is internal planning note
  /\[plan:/i,
];

function isPersonalNote(text: string): boolean {
  return PERSONAL_NOTE_PATTERNS.some((p) => p.test(text));
}

/**
 * Cleans a single exercise item string:
 * 1. Strips <span class='cue'>...</span> personal data tags
 * 2. Strips personal training diary notes after " — " separator
 * 3. Preserves workout prescription info (rep counts, prescribed weights, exercise cues)
 */
function cleanItem(item: string): string {
  let text = item.trim();

  // Step 1: Handle cue spans
  const spanMatch = text.match(/^(.*?)\s*<span class='cue'>(.*?)<\/span>\s*$/);
  if (spanMatch) {
    const exerciseName = spanMatch[1].trim();
    const cueContent = spanMatch[2].trim();

    // Split cue content by " · " separator and filter personal data
    const parts = cueContent.split(/\s*·\s*/);
    const cleanParts = parts.filter((part) => {
      const p = part.trim();
      if (/^Registro:/i.test(p)) return false;
      if (/^RPE\s*\d/i.test(p)) return false;
      if (/🏆/.test(p)) return false;
      if (/^\d+(\.\d+)?kg$/i.test(p)) return false;
      if (isPersonalNote(p)) return false;
      return true;
    });

    text =
      cleanParts.length > 0
        ? `${exerciseName} — ${cleanParts.join(" · ")}`
        : exerciseName;
  }

  // Step 2: Handle personal notes embedded after " — " in the item text
  if (text.includes(" — ")) {
    const dashParts = text.split(" — ");
    const exerciseBase = dashParts[0].trim();
    const afterDash = dashParts.slice(1).join(" — ").trim();

    if (isPersonalNote(afterDash)) {
      // The entire afterDash is a personal note — strip it entirely
      text = exerciseBase;
    } else {
      // Check if part of the afterDash is personal — try splitting by ". " or ", "
      // to see if there's a mix of prescription + personal note
      const sentences = afterDash.split(/(?:\.(?:\s|$)|,\s+(?=[A-Z]))/);
      if (sentences.length > 1) {
        const cleanSentences = sentences.filter(
          (s) => s.trim() && !isPersonalNote(s),
        );
        text =
          cleanSentences.length > 0
            ? `${exerciseBase} — ${cleanSentences.join(". ").trim()}`
            : exerciseBase;
      }
    }
  }

  // Step 3: Final cleanup — remove any remaining personal markers
  // Remove trailing " · " artifacts
  text = text.replace(/\s*·\s*$/, "").trim();
  // Remove empty parens
  text = text.replace(/\(\s*\)/g, "").trim();

  return text;
}

function cleanBlock(block: {
  title: string;
  scheme: string;
  items: string[];
}) {
  return {
    title: block.title,
    scheme: block.scheme,
    items: block.items.map(cleanItem),
  };
}

// Build the clean database
const cleanDb: Record<string, any> = {};

for (const [weekKey, week] of Object.entries(WORKOUT_DATABASE)) {
  cleanDb[weekKey] = {
    days: week.days.map((day) => ({
      id: day.id,
      name: day.name,
      title: day.title,
      isCompleted: false, // Always false for template
      hasTabs: day.hasTabs,
      variations: day.variations.map((v) => ({
        tabName: v.tabName,
        warmup: cleanBlock(v.warmup),
        strength: cleanBlock(v.strength),
        metcon: cleanBlock(v.metcon),
        accessories: cleanBlock(v.accessories),
      })),
    })),
  };
}

// Write to public/ so it's accessible as a static asset
const __dir = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(__dir, "../public/nexus_plantilla_limpia.json");
fs.writeFileSync(outPath, JSON.stringify(cleanDb, null, 2), "utf-8");

console.log(`✅ Plantilla limpia generada: ${outPath}`);

// Print summary
let totalDays = 0;
let totalItems = 0;
for (const week of Object.values(cleanDb)) {
  for (const day of (week as any).days) {
    totalDays++;
    for (const v of day.variations) {
      totalItems +=
        v.warmup.items.length +
        v.strength.items.length +
        v.metcon.items.length +
        v.accessories.items.length;
    }
  }
}
console.log(
  `   ${Object.keys(cleanDb).length} semanas · ${totalDays} días · ${totalItems} ejercicios`,
);
console.log(
  `   Todos los registros personales (kg, RPE, PR, notas de diario) fueron eliminados.`,
);

// Verification: check for any remaining personal data patterns
const jsonStr = JSON.stringify(cleanDb);
const leaks: string[] = [];
if (/Registro:/i.test(jsonStr)) leaks.push("Registro:");
if (/RPE \d/i.test(jsonStr)) leaks.push("RPE values");
if (/🏆/.test(jsonStr)) leaks.push("🏆 PR markers");
if (/\bhice\b/i.test(jsonStr)) leaks.push('"hice" (personal note)');
if (/\bbaje\b/i.test(jsonStr)) leaks.push('"baje" (personal note)');
if (/\bunbroken\b/i.test(jsonStr)) leaks.push('"unbroken" (personal note)');
if (/\bse sintieron\b/i.test(jsonStr)) leaks.push('"se sintieron" (personal note)');
if (/\d+\s*watts/i.test(jsonStr)) leaks.push("wattage readings");
if (/\bESCALADO\b/i.test(jsonStr)) leaks.push("ESCALADO marker");
if (/\[plan:/i.test(jsonStr)) leaks.push("[plan:] planning notes");

if (leaks.length) {
  console.warn(`\n⚠️  ADVERTENCIA: Se detectaron posibles datos personales remanentes:`);
  leaks.forEach((l) => console.warn(`   - ${l}`));
} else {
  console.log(`\n✅ VERIFICACIÓN: No se detectaron datos personales remanentes.`);
}
