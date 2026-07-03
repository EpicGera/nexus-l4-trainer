/**
 * NEXUS: EL ABISMO — Fase 2: actos/zonas.
 *
 * Cada descenso atraviesa tres actos con identidad visual propia:
 * CALLE (luz de sodio) → SUBTE (fluorescente frío) → AZOTEA (luna carmesí).
 * Puro: el engine solo consume la paleta; los colores de muro/piso van como
 * "r,g,b" porque el renderer les aplica su propio alpha (fog of war).
 */

export interface ZoneTheme {
  id: "calle" | "subte" | "azotea";
  /** Banner de transición + HUD. */
  name: string;
  /** Clear color del canvas. */
  bg: string;
  /** "r,g,b" — bloque de muro. */
  wall: string;
  /** "r,g,b" — highlight superior del muro. */
  wallTop: string;
  /** "r,g,b" — baldosa de piso. */
  floor: string;
  /** "r,g,b" — tinte de la grilla del piso. */
  accentRgb: string;
  /** Color CSS del acto (banner, detalles). */
  accent: string;
}

export const ZONES: Record<ZoneTheme["id"], ZoneTheme> = {
  calle: {
    id: "calle",
    name: "ACTO I — LA CALLE",
    bg: "#060505",
    wall: "30,26,24",
    wallTop: "82,64,42", // sodio sobre hormigón
    floor: "17,16,16",
    accentRgb: "245,158,11",
    accent: "#f59e0b",
  },
  subte: {
    id: "subte",
    name: "ACTO II — EL SUBTE",
    bg: "#040607",
    wall: "20,28,30",
    wallTop: "46,84,80", // fluorescente frío sobre azulejo
    floor: "12,16,17",
    accentRgb: "34,211,238",
    accent: "#22d3ee",
  },
  azotea: {
    id: "azotea",
    name: "ACTO III — LA AZOTEA",
    bg: "#070409",
    wall: "28,20,36",
    wallTop: "96,52,92", // luna carmesí sobre geometría imposible
    floor: "16,12,22",
    accentRgb: "220,38,38",
    accent: "#dc2626",
  },
};

/**
 * Mapea profundidad → acto. El último piso siempre es LA AZOTEA (ahí vive el
 * jefe); el primero LA CALLE; todo lo intermedio, EL SUBTE.
 */
export function zoneForDepth(depth: number, totalFloors: number): ZoneTheme {
  if (depth >= totalFloors) return ZONES.azotea;
  if (depth <= 1) return ZONES.calle;
  return ZONES.subte;
}
