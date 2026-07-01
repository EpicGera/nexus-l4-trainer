// Canonical program interchange format (single source of truth, no legacy lanes).
//
// WHY: the internal `Database` carries a DOUBLE model — the four fixed lanes
// (warmup/strength/metcon/accessories) AND a flexible `blocks[]`. Keeping both in
// sync is the root cause of data-loss bugs (e.g. a second strength block dropped
// into a single lane). The canonical format below is what we EXPORT and share
// with other frontends: ONE ordered `blocks[]` per variation, weeks as an array.
// The React app keeps deriving legacy lanes internally for its old consumers, but
// nothing outside this app should ever see them.

import { Database, BlockBucket } from "../types/workout";
import { parseJsonToDatabase, deriveBlockMeta } from "./sheetImport";

export const CANONICAL_SCHEMA_VERSION = "1.0";

export interface CanonicalBlock {
  key: string;
  bucket: BlockBucket;
  title: string;
  scheme: string;
  items: string[];
  capSec?: number;
  timeDomain?: string;
  energySystem?: string;
  inspiration?: string;
}

export interface CanonicalVariation {
  tabName: string;
  blocks: CanonicalBlock[];
}

export interface CanonicalDay {
  id: string;
  name: string;
  title: string;
  variations: CanonicalVariation[];
}

export interface CanonicalWeek {
  week: number;
  intention?: string;
  gear?: number;
  days: CanonicalDay[];
}

export interface CanonicalProgram {
  schemaVersion: string;
  title?: string;
  lore?: string;
  weeks: CanonicalWeek[];
}

/** Keep only the canonical block fields, dropping undefined ones, and derive
 *  metcon metadata (capSec/timeDomain/energySystem) from the scheme when absent
 *  — so the canonical output is self-sufficient regardless of the source. */
function cleanBlock(b: any, fallbackKey: string): CanonicalBlock {
  const bucket: BlockBucket = (b?.bucket as BlockBucket) || "accessories";
  const scheme = String(b?.scheme ?? "");
  const out: CanonicalBlock = {
    key: typeof b?.key === "string" && b.key.trim() ? b.key.trim() : fallbackKey,
    bucket,
    title: String(b?.title ?? ""),
    scheme,
    items: Array.isArray(b?.items) ? b.items.map((x: any) => String(x ?? "")) : [],
  };
  const meta = deriveBlockMeta(bucket, scheme);
  const capSec = b?.capSec != null ? b.capSec : meta.capSec;
  const timeDomain = b?.timeDomain || meta.timeDomain;
  const energySystem = b?.energySystem || meta.energySystem;
  if (capSec != null) out.capSec = capSec;
  if (timeDomain) out.timeDomain = timeDomain;
  if (energySystem) out.energySystem = energySystem;
  if (b?.inspiration) out.inspiration = b.inspiration;
  return out;
}

/** A legacy lane is real content if it has items OR a non-empty scheme; a bare
 *  placeholder title (e.g. "02. FUERZA" with nothing else) is dropped. */
function laneHasContent(lane: any): boolean {
  if (!lane) return false;
  const hasItems = Array.isArray(lane.items) && lane.items.length > 0;
  const hasScheme = typeof lane.scheme === "string" && lane.scheme.trim().length > 0;
  return hasItems || hasScheme;
}

const LANE_ORDER: { bucket: BlockBucket; prefix: string }[] = [
  { bucket: "warmup", prefix: "b1" },
  { bucket: "strength", prefix: "b2" },
  { bucket: "metcon", prefix: "b3" },
  { bucket: "accessories", prefix: "b4" },
];

/** Build canonical blocks for a variation: use blocks[] when present, else derive
 *  from the four legacy lanes (only non-empty), so nothing is ever lost. */
function variationBlocks(v: any): CanonicalBlock[] {
  if (Array.isArray(v?.blocks) && v.blocks.length) {
    return v.blocks.map((b: any, i: number) => cleanBlock(b, `b${i + 1}_block`));
  }
  return LANE_ORDER.flatMap(({ bucket, prefix }) => {
    const lane = v?.[bucket];
    return laneHasContent(lane) ? [cleanBlock({ ...lane, bucket }, `${prefix}_${bucket}`)] : [];
  });
}

/** Convert the internal Database to the canonical, blocks-only interchange form. */
export function toCanonicalProgram(
  db: Database,
  meta?: { title?: string; lore?: string },
): CanonicalProgram {
  const weeks: CanonicalWeek[] = Object.keys(db || {})
    .filter((k) => /^w\d+$/i.test(k))
    .sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10))
    .map((wk) => {
      const week = db[wk];
      const w: CanonicalWeek = {
        week: parseInt(wk.slice(1), 10),
        days: (week.days || []).map((d) => ({
          id: d.id,
          name: d.name,
          title: d.title,
          variations: (d.variations || []).map((v) => ({
            tabName: v.tabName,
            blocks: variationBlocks(v),
          })),
        })),
      };
      if (week.meta?.intention) w.intention = week.meta.intention;
      if (week.meta?.gear != null) w.gear = week.meta.gear;
      return w;
    });

  return {
    schemaVersion: CANONICAL_SCHEMA_VERSION,
    ...(meta?.title ? { title: meta.title } : {}),
    ...(meta?.lore ? { lore: meta.lore } : {}),
    weeks,
  };
}

/** Read a canonical program back into the internal Database (legacy lanes are
 *  re-derived for back-compat by the shared parser). */
export function fromCanonicalProgram(c: CanonicalProgram | object): Database {
  return parseJsonToDatabase(JSON.stringify(c));
}
