// Block inspiration tagging (Fase 3). Each flexible block can carry an
// `inspiration` brand key (HAEDO | MAYHEM | HWPO | PRVN). It is classified ONCE
// at import/generate — by AI when a key is configured (see aiService
// `classifyChapterBlocks`), else by the keyword heuristic here. These helpers
// are pure (no AI / no storage) so they are trivially unit-testable.

import { Database, ProgramBlock } from "../types/workout";
import { resolveBlockBrandKey, BrandKey } from "./constants";

/** Stable id for a block within a program: dayId::blockKey. */
export function blockInspirationId(dayId: string, blockKey: string): string {
  return `${dayId}::${blockKey}`;
}

/** Visit every flexible block in the program. */
export function forEachBlock(
  program: Database,
  fn: (dayId: string, block: ProgramBlock, tabName: string) => void,
): void {
  Object.values(program || {}).forEach((week) => {
    (week?.days || []).forEach((day) => {
      (day.variations || []).forEach((v) => {
        (v.blocks || []).forEach((b) => fn(day.id, b, v.tabName || ""));
      });
    });
  });
}

/**
 * Heuristic inspiration map (the fallback when no AI is configured):
 * dayId::blockKey → BrandKey, from the keyword resolver.
 */
export function heuristicInspirationMap(program: Database): Record<string, BrandKey> {
  const map: Record<string, BrandKey> = {};
  forEachBlock(program, (dayId, b, tabName) => {
    map[blockInspirationId(dayId, b.key)] = resolveBlockBrandKey(tabName, b.title, b.items);
  });
  return map;
}

/**
 * Return a NEW program with each block's `inspiration` set from the map (keys
 * absent from the map are left untouched). Non-mutating.
 */
export function applyInspirationMap(
  program: Database,
  map: Record<string, string>,
): Database {
  const next: Database = {};
  Object.entries(program || {}).forEach(([wk, week]) => {
    next[wk] = {
      ...week,
      days: (week?.days || []).map((day) => ({
        ...day,
        variations: (day.variations || []).map((v) => ({
          ...v,
          blocks: v.blocks
            ? v.blocks.map((b) => {
                const insp = map[blockInspirationId(day.id, b.key)];
                return insp ? { ...b, inspiration: insp } : b;
              })
            : v.blocks,
        })),
      })),
    };
  });
  return next;
}

/** Compact block list for an AI classification prompt. */
export function blocksForPrompt(
  program: Database,
): { id: string; title: string; items: string[] }[] {
  const out: { id: string; title: string; items: string[] }[] = [];
  forEachBlock(program, (dayId, b) => {
    out.push({
      id: blockInspirationId(dayId, b.key),
      title: b.title,
      items: (b.items || []).slice(0, 6),
    });
  });
  return out;
}
