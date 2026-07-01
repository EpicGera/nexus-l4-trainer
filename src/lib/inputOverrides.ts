// Per-movement input-mode overrides: when the athlete corrects what the wizard
// asks for a movement ("this logs calories, not reps"), we remember it by
// normalized name so the right inputs come up next time. Separate from the
// analytics classification (classifyMovement / nexus_catalog_overrides) — this
// is only about which fields to show. Stored nexus_-prefixed so it syncs.

import { STORAGE_KEYS } from "./storageKeys";
import type { InputMode } from "./inputSignals";

const KEY = STORAGE_KEYS.INPUT_OVERRIDES;

const norm = (s: string) =>
  String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function load(): Record<string, InputMode> {
  try {
    const raw = localStorage.getItem(KEY);
    const o = raw ? JSON.parse(raw) : {};
    return o && typeof o === "object" && !Array.isArray(o) ? o : {};
  } catch {
    return {};
  }
}

/** The athlete's saved input mode for a movement name, or null. */
export function getInputOverride(name: string): InputMode | null {
  const n = norm(name);
  return n ? load()[n] ?? null : null;
}

/** Remember (or clear, when null) the input mode for a movement name. */
export function setInputOverride(name: string, mode: InputMode | null): void {
  const n = norm(name);
  if (!n) return;
  try {
    const all = load();
    if (mode == null) delete all[n];
    else all[n] = mode;
    localStorage.setItem(KEY, JSON.stringify(all));
    if (typeof window !== "undefined") window.dispatchEvent(new Event("nexus_logs_updated"));
  } catch {
    /* storage restricted — ignore */
  }
}
