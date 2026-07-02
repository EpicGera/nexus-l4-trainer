// Parsers for legacy nexus_logs_* set values, where weight/reps are free-text
// strings with units baked in ("80 kg", "82,5", "400m", "12 cal", "P. Corporal",
// "Max reps"). Zero imports on purpose — safe leaf for any consumer.

/** First number in the string; understands Spanish comma decimals ("82,5"). */
export const parseLoggedNumber = (v: unknown): number => {
  const s = String(v ?? "").replace(/(\d),(\d)/g, "$1.$2");
  const m = s.match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : 0;
};

// A digit followed by a distance/cal/time unit means the "weight" field holds
// cardio data, not a load — it must not count as tonnage kg.
const NON_LOAD_UNIT_RE =
  /\d\s*(m|mts?|metros?|km|cal(?:s|or[ií]as?)?|min(?:utos?)?|seg(?:undos?)?|s)\b/i;

/**
 * Weight in kg from a legacy logged string. Returns 0 for cardio/time entries
 * ("400m", "12 cal", "45 seg") and for bodyweight text ("P. Corporal") —
 * legacy tonnage counts external load only.
 */
export const parseLoggedWeightKg = (v: unknown): number => {
  const s = String(v ?? "");
  if (NON_LOAD_UNIT_RE.test(s)) return 0;
  return parseLoggedNumber(s);
};
