// Pure cue/note detection + exercise-name cleaning. NO imports — kept
// dependency-free so the importer (sheetImport.ts) can mark cues at build time
// without a circular dependency through historyUtils.ts.

// Strip cue/registro noise to get a clean exercise label for the CSV and sheet
// matching. e.g. "Back Squat Registro: 80kg · RPE 7" -> "Back Squat",
// "Wall Balls 15 reps · Registro: 9kg" -> "Wall Balls".
export const cleanExerciseLabel = (rawOrName: string): string => {
  let s = String(rawOrName).replace(/<[^>]*>/g, " ");
  s = s.split("·")[0]; // drop everything after the first middot cue
  s = s.replace(/\bRegistro\s*:.*$/i, ""); // drop "Registro: ..."
  s = s.replace(/\bTiempo\s+restante\b.*$/i, "");
  s = s.replace(/\b\d+\s*(reps|repeticiones|cal|calorie|calories|m|metros|min)\b.*$/i, "");
  s = s.replace(/\(\s*[\d.]+\s*kg\s*\)/gi, ""); // "(9kg)"
  s = s.replace(/@\s*[\d%.\-]+(?:kg)?/gi, ""); // "@ 65%" / "@ 80kg"
  s = s.replace(/[·•|–—:-]+\s*$/g, ""); // trailing separators
  s = s.replace(/\s{2,}/g, " ").trim();
  return s;
};

// Coaching cues / notes that must NEVER be treated as trainable movements.
// Logging reps/RPE/weight against a cue pollutes the volume/AU/power math, so
// these are filtered out of loggable stations and rendered as guidance instead.
//
// A standalone item is a cue when ANY of these hold:
//   1. wholly a <span class='cue'>…</span> (the data's own cue marker);
//   2. text opens with a cue label + colon, allowing leading emoji/bullet;
//   3. header line ending with a colon ("21-15-9 Reps de:");
//   4. group/collective instruction (grupal, de equipo, en equipo);
//   5. prohibition/rule ("Prohibido agitarse");
//   6. instructional prefix ("Práctica de …", "Sincronización de …");
//   7. meta-coaching imperative ("Entrenar la frustración …");
//   8. multi-sentence motivational note outside parens ("X. Y.").
// An inline cue appended to a real movement leaves loggable text after
// stripping, so it stays a movement.
//
// sheetImport.buildItem() now calls isCueOrNote at import time and wraps any
// note row in the cue span, so most items are classified once at the source.
// These runtime patterns remain the fallback for data cached before that.
const CUE_SPAN_RE =
  /<span[^>]*class\s*=\s*["'][^"']*\bcue\b[^"']*["'][^>]*>[\s\S]*?<\/span>/gi;
const CUE_LABEL_RE =
  /^[^\p{L}]*(foco|enfoque|nota|notas|objetivo|objetivos|meta|metas|tip|tips|cue|cues|record[aá](?:te|r)?|importante|atenci[oó]n|atencion|ojo|clave|consejo|consejos|coach|instrucci[oó]n|aviso|regla|principio|mentalidad|mindset|pacing|estrategia|t[eé]cnica|respiraci[oó]n)[^\p{L}]*:/iu;

/** True when an item is a coaching cue/note rather than a trainable movement. */
export const isCueOrNote = (raw: string): boolean => {
  const html = String(raw ?? "");
  // 1) Item is ENTIRELY a coaching-cue span — nothing loggable remains.
  if (/class\s*=\s*["'][^"']*\bcue\b/i.test(html)) {
    const remainder = html.replace(CUE_SPAN_RE, "").replace(/<[^>]*>/g, "").trim();
    if (remainder === "") return true;
  }
  const text = html.replace(/<[^>]*>/g, "").trim();
  if (!text) return true;
  if (CUE_LABEL_RE.test(text)) return true;  // "🎯 Foco:", "Nota:", …
  if (text.endsWith(":")) return true;         // header: "21-15-9 Reps de:"

  // 4) Group/collective instructions — never individually trackable movements.
  if (/\b(grupal|de\s+equipo|en\s+equipo)\b/i.test(text)) return true;

  // 5) Prohibitions / rules ("Prohibido agitarse", "CERO llegar al fallo").
  if (/^[^\p{L}]*(prohibid[ao]|cero\s+\p{L})/iu.test(text)) return true;

  // 6) Instructional prefix: "Práctica de X", "Sincronización de X".
  if (/^[^\p{L}]*(pr[aá]ctica|sincronizaci[oó]n)\s+de\b/iu.test(text)) return true;

  // 6b) Cue keyword at start (colon optional): "Foco en X", "Foco: X", "Enfoque de X".
  //     Any item whose first meaningful word is Foco/Enfoque/Objetivo is coaching.
  if (/^[^\p{L}]*(foco|enfoque|objetivo)\b/iu.test(text)) return true;

  // 6c) Tempo prescription: "Tempo 21X1: description" — speed cue, not a movement.
  if (/^[^\p{L}]*tempo\s+\S+:/iu.test(text)) return true;

  // 6d) Week-level annotation: "Semana más pesada…", "Semana de intensificación".
  if (/^[^\p{L}]*semana\b/iu.test(text)) return true;

  // 6e) Conditional coaching hedge: "…si es necesario" marks advice, not reps.
  if (/\bsi\s+es\s+necesario\b/i.test(text)) return true;

  // 7) Meta-coaching imperative: "Entrenar la/el [concept]", "Puramente X".
  if (/^[^\p{L}]*(entrenar\s+(la?|el?|las?|los?)\s+\w+|puramente\b)/iu.test(text)) return true;

  // 8) Multi-sentence note (period + space + uppercase outside parens).
  //    Exercises are single-clause; two full sentences signal a motivational note.
  if (/\.\s+[A-ZÁÉÍÓÚÑÜ]/.test(text.replace(/\([^)]*\)/g, ""))) return true;

  // 9) Gerund-start coaching instruction: "Puliendo la X", "Trabajando el X".
  //    Requires an article after the gerund so movement gerunds don't match
  //    (e.g. "Caminando Lunges" has no article; "caminando/corriendo/saltando"
  //    are excluded explicitly).
  if (
    /^[^\p{L}]*(?!(?:caminand|corriend|saltand|nadand|trotand|remand|pedaleand))\p{L}+(?:ando|iendo)\s+(?:la?s?|el|los|una?)\b/iu.test(text)
  ) return true;

  // 10) Completion / milestone notes ("Ciclo 2: Sun-Ken Rock Completado.").
  if (/\bcompletad[ao]\b/i.test(text)) return true;

  // 11) Social warmup markers — "risas" never appears in exercise names.
  if (/\brisas?\b/i.test(text)) return true;

  // 12) Rest / recovery minutes: "Min 3: Descanso", "Min 4: Rest", etc.
  //     These are EMOM structure items — never a set you log.
  if (/\b(?:descanso(?:\s+activo)?|rest(?:\s+period)?)\s*$/i.test(text)) return true;

  return false;
};

// Extract a clean name for query and display
export const getCleanExerciseName = (itemText: string): string => {
  let cleaned = itemText.replace(/<[^>]*>/g, "").trim();

  // Strip reps and times at the start of the item (e.g. "15 Box Step-overs", "Min 1: 8 Deadlifts", "4x4 ")
  cleaned = cleaned.replace(
    /^(Min\s+\d+:\s*)?\d+(\/\d+)?\s*(cal|calorie|calories|reps|repeticiones|m|crossovers|x\d+)?\s+/i,
    "",
  );

  // Strip parenthesized text if it is long (e.g. instructions/cues) or contains weight indicators like "barra" or "kg"
  cleaned = cleaned.replace(/\s*\([^)]*barra[^)]*\)/i, "");
  cleaned = cleaned.replace(/\s*\([^)]*kg[^)]*\)/i, "");
  cleaned = cleaned.replace(/\s*@\s*[\d%-]+(?:kg)?(?:\s*\(.*\))?/gi, "");
  cleaned = cleaned.replace(/\s*\([\d%-]+kg\)/gi, "");
  cleaned = cleaned.replace(/\s*\([^)]{15,}\)/g, ""); // strip parentheses with 15+ characters

  // Also clean if the entire string is just reps
  if (/^\d*\s*(cal|calorie|calories|reps|repeticiones|m|crossovers|x\d+)?$/i.test(cleaned)) {
      cleaned = "";
  }

  return cleaned.trim();
};
