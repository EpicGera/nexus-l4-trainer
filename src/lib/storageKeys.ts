// Single source of truth for localStorage key schemes. Before this, the
// `nexus_*` keys and the dayId parsing were hand-rolled in ~10 files, and the
// week parse (`dayId.substring(1,2)`) silently broke at week 10+ (w10 → "1").
//
// ponytail: this centralizes the canonical key VALUES and the dayId/log-key
// FORMAT (the fiddly exercise-name encoding). Read-site `startsWith` checks in
// consumers may still inline the prefix — the prefix string is stable; the
// encoding is what was worth pulling into one place.

export const STORAGE_KEYS = {
  SESSIONS: "nexus_sessions_v1",
  LOGS_PREFIX: "nexus_logs_",
  PROGRAM_OVERRIDE: "nexus_workouts_override",
  SOURCE_SHEET_ID: "nexus_source_sheet_id",
  CATALOG_OVERRIDES: "nexus_catalog_overrides",
  INPUT_OVERRIDES: "nexus_input_overrides",
} as const;

/** "w12d3" → { week: 12, day: 3 }. Null when malformed. Accepts multi-digit weeks. */
export const parseDayId = (dayId: string): { week: number; day: number } | null => {
  const m = /^w(\d+)d(\d+)$/i.exec(String(dayId).trim());
  return m ? { week: Number(m[1]), day: Number(m[2]) } : null;
};

/**
 * Legacy per-exercise log key: `nexus_logs_<dayId>_<Exercise_Name>`.
 * Keeps the historical `\s+ -> _` encoding so keys already in localStorage
 * still match — do NOT change the encoding without a migration.
 */
export const buildLogsKey = (dayId: string, exerciseName: string): string =>
  `${STORAGE_KEYS.LOGS_PREFIX}${dayId}_${exerciseName.replace(/\s+/g, "_")}`;
