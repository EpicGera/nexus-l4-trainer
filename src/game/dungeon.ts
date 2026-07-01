/**
 * NEXUS: EL ABISMO — procedural dungeon generator.
 *
 * Classic roguelike approach: scatter non-overlapping rooms on a tile grid,
 * connect them with L-shaped corridors, mark a start room and the farthest
 * room as the exit (stairs down, or boss gate on a boss floor). Pure and
 * deterministic given a seed — the canvas engine just renders & populates it.
 */

import { RNG } from "./runContext";

export const TILE = 44; // world px per tile

export const enum Tile {
  Wall = 0,
  Floor = 1,
  Stairs = 2, // descend to next floor
  Exit = 3, // seal the rift (final floor) / boss gate
}

export interface Room {
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number; // center tile x
  cy: number; // center tile y
  kind: "start" | "combat" | "exit";
}

export interface DungeonFloor {
  gw: number; // grid width in tiles
  gh: number; // grid height in tiles
  tiles: Uint8Array;
  rooms: Room[];
  start: Room;
  exit: Room;
  isBoss: boolean;
  depth: number;
}

const GRID_W = 44;
const GRID_H = 34;

function rectsOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
  margin: number,
): boolean {
  return (
    a.x - margin < b.x + b.w &&
    a.x + a.w + margin > b.x &&
    a.y - margin < b.y + b.h &&
    a.y + a.h + margin > b.y
  );
}

function carveRoom(tiles: Uint8Array, gw: number, r: Room) {
  for (let y = r.y; y < r.y + r.h; y++) {
    for (let x = r.x; x < r.x + r.w; x++) {
      tiles[y * gw + x] = Tile.Floor;
    }
  }
}

function carveHCorridor(tiles: Uint8Array, gw: number, x1: number, x2: number, y: number) {
  for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
    tiles[y * gw + x] = Tile.Floor;
    tiles[(y + 1) * gw + x] = Tile.Floor; // 2-wide corridors feel less cramped
  }
}

function carveVCorridor(tiles: Uint8Array, gw: number, y1: number, y2: number, x: number) {
  for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
    tiles[y * gw + x] = Tile.Floor;
    tiles[y * gw + x + 1] = Tile.Floor;
  }
}

/**
 * Generate one dungeon floor.
 * @param seed     deterministic seed
 * @param depth    1-based floor depth
 * @param isBoss   true → exit room is the boss arena gate
 */
export function generateFloor(seed: number, depth: number, isBoss: boolean): DungeonFloor {
  const rng = new RNG(seed ^ (depth * 0x9e3779b1));
  const gw = GRID_W;
  const gh = GRID_H;
  const tiles = new Uint8Array(gw * gh); // all walls

  const rooms: Room[] = [];
  // deeper floors get a touch more rooms
  const targetRooms = Math.min(9, 5 + Math.floor(depth / 1.5));
  let attempts = 0;

  while (rooms.length < targetRooms && attempts < 80) {
    attempts++;
    const w = rng.int(5, 9);
    const h = rng.int(4, 7);
    const x = rng.int(1, gw - w - 2);
    const y = rng.int(1, gh - h - 2);
    const candidate = { x, y, w, h };
    if (rooms.some((r) => rectsOverlap(candidate, r, 1))) continue;
    rooms.push({
      ...candidate,
      cx: Math.floor(x + w / 2),
      cy: Math.floor(y + h / 2),
      kind: "combat",
    });
  }

  // carve rooms
  rooms.forEach((r) => carveRoom(tiles, gw, r));

  // connect rooms sequentially with L corridors between centers
  for (let i = 1; i < rooms.length; i++) {
    const a = rooms[i - 1];
    const b = rooms[i];
    if (rng.chance(0.5)) {
      carveHCorridor(tiles, gw, a.cx, b.cx, a.cy);
      carveVCorridor(tiles, gw, a.cy, b.cy, b.cx);
    } else {
      carveVCorridor(tiles, gw, a.cy, b.cy, a.cx);
      carveHCorridor(tiles, gw, a.cx, b.cx, b.cy);
    }
  }

  // start = first room; exit = farthest room from start by center distance
  const start = rooms[0];
  start.kind = "start";
  let exit = rooms[rooms.length - 1];
  let bestD = -1;
  for (let i = 1; i < rooms.length; i++) {
    const r = rooms[i];
    const d = (r.cx - start.cx) ** 2 + (r.cy - start.cy) ** 2;
    if (d > bestD) {
      bestD = d;
      exit = r;
    }
  }
  exit.kind = "exit";
  tiles[exit.cy * gw + exit.cx] = isBoss ? Tile.Exit : Tile.Stairs;

  return { gw, gh, tiles, rooms, start, exit, isBoss, depth };
}

export function tileAt(floor: DungeonFloor, tx: number, ty: number): number {
  if (tx < 0 || ty < 0 || tx >= floor.gw || ty >= floor.gh) return Tile.Wall;
  return floor.tiles[ty * floor.gw + tx];
}

/** Is the world-space point inside a non-wall tile? */
export function isWalkable(floor: DungeonFloor, wx: number, wy: number): boolean {
  const tx = Math.floor(wx / TILE);
  const ty = Math.floor(wy / TILE);
  return tileAt(floor, tx, ty) !== Tile.Wall;
}

/** Circle-vs-wall test sampling the four cardinal points of the body. */
export function circleHitsWall(floor: DungeonFloor, wx: number, wy: number, r: number): boolean {
  return (
    !isWalkable(floor, wx - r, wy) ||
    !isWalkable(floor, wx + r, wy) ||
    !isWalkable(floor, wx, wy - r) ||
    !isWalkable(floor, wx, wy + r) ||
    !isWalkable(floor, wx, wy)
  );
}

export function roomCenterWorld(room: Room): { x: number; y: number } {
  return { x: (room.cx + 0.5) * TILE, y: (room.cy + 0.5) * TILE };
}
