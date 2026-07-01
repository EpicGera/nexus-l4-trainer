// Chapter library + per-user persistence (Fase 0).
//
// PROBLEM: the board's athlete data (program, structured sessions, completed
// days, legacy per-exercise logs) is keyed by `w1d1`-style ids that COLLIDE
// across chapters, and the program lived in a single `nexus_workouts_override`.
// Loading a new chapter overwrote everything → the prior chapter was destroyed.
//
// DESIGN — snapshot/restore (zero changes to the ~29 data consumers):
//   The "live" keys ALWAYS reflect the ACTIVE chapter:
//     - nexus_workouts_override  (program)
//     - nexus_sessions_v1        (structured sessions)
//     - bare wNdM                (completed days)
//     - nexus_logs_*             (legacy per-exercise logs)
//   Each chapter additionally persists, in its own Firestore docs (≤1 MB each):
//     - nexus_chapters_index            { chapters: ChapterMeta[], activeId }
//     - nexus_chapter_<id>              the program (Database) snapshot
//     - nexus_chapter_data_<id>         { sessions, completed, logs } archive
//   Switching a chapter archives the active live data, then restores the target's.
//   Consulting an inactive chapter reads its snapshot/archive without switching.

import { Database } from "../types/workout";
import { STORAGE_KEYS } from "./storageKeys";

export interface ChapterTheme {
  key: string;
  accent: string; // emphasis color
  band: string; // central band color
  titleGradient: string; // CSS gradient for the day title
  fontKey: string; // font registry key applied to day titles
}

export interface ChapterMeta {
  id: string;
  index: number; // 1-based chapter number
  title: string;
  lore?: string;
  theme: ChapterTheme;
  createdAt: number;
}

interface ChaptersIndex {
  chapters: ChapterMeta[];
  activeId: string;
}

interface AthleteDataBlob {
  sessions: string | null; // raw nexus_sessions_v1 JSON
  completed: Record<string, boolean>; // bare day keys
  logs: Record<string, string>; // nexus_logs_* key → value
}

// ── Live keys + patterns ─────────────────────────────────────────────────────
const LIVE_PROGRAM = STORAGE_KEYS.PROGRAM_OVERRIDE;
const LIVE_SESSIONS = STORAGE_KEYS.SESSIONS;
const LOG_PREFIX = STORAGE_KEYS.LOGS_PREFIX;
const isCompletedDayKey = (k: string) => /^[wW]\d+(?:_day|d)\d+$/.test(k);

const INDEX_KEY = "nexus_chapters_index";
const programKey = (id: string) => `nexus_chapter_${id}`;
const dataKey = (id: string) => `nexus_chapter_data_${id}`;

// ── Theme palettes (assigned by chapter index; refined visually in Fase 2) ───
export const THEME_PALETTES: ChapterTheme[] = [
  { key: "diablo", accent: "#e11d2a", band: "#7f1d1d", titleGradient: "linear-gradient(90deg,#ef4444,#7f1d1d)", fontKey: "diablo" },
  { key: "sunkenrock", accent: "#e0a52a", band: "#134e4a", titleGradient: "linear-gradient(90deg,#f4c430,#b45309)", fontKey: "sunkenrock" },
  { key: "abyss", accent: "#a855f7", band: "#1e1b4b", titleGradient: "linear-gradient(90deg,#a855f7,#312e81)", fontKey: "default" },
  { key: "frost", accent: "#22d3ee", band: "#0e7490", titleGradient: "linear-gradient(90deg,#22d3ee,#0e7490)", fontKey: "default" },
  { key: "ember", accent: "#fb923c", band: "#7c2d12", titleGradient: "linear-gradient(90deg,#fb923c,#7c2d12)", fontKey: "default" },
];
export function themeForIndex(index: number): ChapterTheme {
  return THEME_PALETTES[(Math.max(1, index) - 1) % THEME_PALETTES.length];
}

// ── Index read/write ─────────────────────────────────────────────────────────
function readIndex(): ChaptersIndex | null {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return null;
    const idx = JSON.parse(raw);
    if (idx && Array.isArray(idx.chapters) && typeof idx.activeId === "string") return idx as ChaptersIndex;
  } catch {
    /* ignore */
  }
  return null;
}

function writeIndex(idx: ChaptersIndex): void {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(idx));
  } catch {
    /* ignore */
  }
}

function notifyChange(): void {
  try {
    window.dispatchEvent(new Event("nexus_chapter_changed"));
    window.dispatchEvent(new Event("nexus_logs_updated"));
  } catch {
    /* no window */
  }
}

// ── Live athlete-data snapshot/restore ───────────────────────────────────────
function collectActiveAthleteData(): AthleteDataBlob {
  const blob: AthleteDataBlob = { sessions: localStorage.getItem(LIVE_SESSIONS), completed: {}, logs: {} };
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (isCompletedDayKey(k)) {
      if (localStorage.getItem(k) === "true") blob.completed[k] = true;
    } else if (k.startsWith(LOG_PREFIX)) {
      const v = localStorage.getItem(k);
      if (v != null) blob.logs[k] = v;
    }
  }
  return blob;
}

function clearActiveAthleteData(): void {
  const toRemove: string[] = [LIVE_SESSIONS];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (isCompletedDayKey(k) || k.startsWith(LOG_PREFIX)) toRemove.push(k);
  }
  toRemove.forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  });
}

function applyAthleteData(blob: AthleteDataBlob | null): void {
  clearActiveAthleteData();
  if (!blob) return;
  try {
    if (blob.sessions != null) localStorage.setItem(LIVE_SESSIONS, blob.sessions);
    Object.keys(blob.completed || {}).forEach((k) => {
      if (blob.completed[k]) localStorage.setItem(k, "true");
    });
    Object.entries(blob.logs || {}).forEach(([k, v]) => localStorage.setItem(k, v));
  } catch {
    /* ignore */
  }
}

/** Persist the active chapter's program snapshot + athlete-data archive. */
function archiveActive(activeId: string): void {
  try {
    const prog = localStorage.getItem(LIVE_PROGRAM);
    if (prog != null) localStorage.setItem(programKey(activeId), prog);
    localStorage.setItem(dataKey(activeId), JSON.stringify(collectActiveAthleteData()));
  } catch {
    /* ignore */
  }
}

function readArchive(id: string): AthleteDataBlob | null {
  try {
    const raw = localStorage.getItem(dataKey(id));
    return raw ? (JSON.parse(raw) as AthleteDataBlob) : null;
  } catch {
    return null;
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Wrap any pre-existing program as Chapter 1 the first time the model runs.
 * `fallbackProgramRaw` (the default/active program JSON) is snapshotted for c1
 * when no live override exists yet, so a fresh install still has a consultable
 * chapter program.
 */
export function ensureChaptersInitialized(fallbackProgramRaw?: string): ChaptersIndex {
  const existing = readIndex();
  if (existing && existing.chapters.length) return existing;
  const theme = themeForIndex(1);
  const c1: ChapterMeta = {
    id: "c1",
    index: 1,
    title: "ACTO I — ANDARIEL",
    lore: "El descenso original. Inspiración: Diablo.",
    theme,
    createdAt: Date.now(),
  };
  // Snapshot the live program as c1 (don't disturb live data); fall back to the
  // default program for fresh installs that have no override yet.
  const prog = localStorage.getItem(LIVE_PROGRAM) ?? fallbackProgramRaw ?? null;
  if (prog != null) {
    try { localStorage.setItem(programKey("c1"), prog); } catch { /* ignore */ }
  }
  const idx: ChaptersIndex = { chapters: [c1], activeId: "c1" };
  writeIndex(idx);
  return idx;
}

export function listChapters(): ChapterMeta[] {
  return (readIndex()?.chapters || []).slice().sort((a, b) => a.index - b.index);
}

export function getActiveChapterId(): string {
  return readIndex()?.activeId || "c1";
}

export function getChapterMeta(id: string): ChapterMeta | null {
  return readIndex()?.chapters.find((c) => c.id === id) || null;
}

export function getActiveChapter(): ChapterMeta | null {
  const idx = readIndex();
  return idx ? idx.chapters.find((c) => c.id === idx.activeId) || null : null;
}

/** Update mutable fields (title/lore/theme) of a chapter. */
export function updateChapterMeta(id: string, patch: Partial<ChapterMeta>): void {
  const idx = readIndex();
  if (!idx) return;
  const c = idx.chapters.find((x) => x.id === id);
  if (!c) return;
  Object.assign(c, patch, { id: c.id, index: c.index });
  writeIndex(idx);
  notifyChange();
}

/** Switch the active chapter, archiving the current and restoring the target. */
export function switchToChapter(id: string): boolean {
  const idx = ensureChaptersInitialized();
  if (id === idx.activeId) return false;
  if (!idx.chapters.some((c) => c.id === id)) return false;
  archiveActive(idx.activeId);
  // Load target program into the live key.
  try {
    const targetProg = localStorage.getItem(programKey(id));
    if (targetProg != null) localStorage.setItem(LIVE_PROGRAM, targetProg);
    else localStorage.removeItem(LIVE_PROGRAM);
  } catch {
    /* ignore */
  }
  applyAthleteData(readArchive(id));
  idx.activeId = id;
  writeIndex(idx);
  notifyChange();
  return true;
}

/** Create a new chapter from an imported/generated program; it becomes active. */
export function createChapter(
  opts: { title: string; lore?: string; theme?: ChapterTheme },
  program: Database,
): ChapterMeta {
  const idx = ensureChaptersInitialized();
  archiveActive(idx.activeId);
  const index = (idx.chapters.reduce((m, c) => Math.max(m, c.index), 0) || 0) + 1;
  const id = `c${index}_${Date.now().toString(36)}`;
  const meta: ChapterMeta = {
    id,
    index,
    title: opts.title || `ACTO ${index}`,
    lore: opts.lore,
    theme: opts.theme || themeForIndex(index),
    createdAt: Date.now(),
  };
  // New chapter starts fresh: live program = imported, athlete data cleared.
  try {
    localStorage.setItem(LIVE_PROGRAM, JSON.stringify(program));
    localStorage.setItem(programKey(id), JSON.stringify(program));
  } catch {
    /* ignore */
  }
  clearActiveAthleteData();
  idx.chapters.push(meta);
  idx.activeId = id;
  writeIndex(idx);
  notifyChange();
  return meta;
}

export function deleteChapter(id: string): void {
  const idx = readIndex();
  if (!idx || idx.chapters.length <= 1) return; // never delete the last chapter
  if (id === idx.activeId) return; // can't delete the active chapter
  idx.chapters = idx.chapters.filter((c) => c.id !== id);
  writeIndex(idx);
  try {
    localStorage.removeItem(programKey(id));
    localStorage.removeItem(dataKey(id));
  } catch {
    /* ignore */
  }
  notifyChange();
}

/** Read a chapter's program (live when active, snapshot otherwise). */
export function viewChapterProgram(id: string): Database | null {
  try {
    const raw = id === getActiveChapterId() ? localStorage.getItem(LIVE_PROGRAM) : localStorage.getItem(programKey(id));
    if (!raw) return null;
    const db = JSON.parse(raw);
    return db && typeof db === "object" ? (db as Database) : null;
  } catch {
    return null;
  }
}

/** Read a chapter's structured sessions (live when active, archive otherwise). */
export function getChapterSessionsRaw(id: string): string | null {
  if (id === getActiveChapterId()) return localStorage.getItem(LIVE_SESSIONS);
  return readArchive(id)?.sessions ?? null;
}

/** Read a chapter's completed-day map (live when active, archive otherwise). */
export function getChapterCompleted(id: string): Record<string, boolean> {
  if (id === getActiveChapterId()) {
    const out: Record<string, boolean> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && isCompletedDayKey(k) && localStorage.getItem(k) === "true") out[k] = true;
    }
    return out;
  }
  return readArchive(id)?.completed ?? {};
}
