import { describe, it, expect } from "vitest";
import {
  generateFloor,
  isWalkable,
  circleHitsWall,
  tileAt,
  roomCenterWorld,
  Tile,
  TILE,
} from "./dungeon";

describe("generateFloor", () => {
  it("is deterministic for the same seed/depth", () => {
    const a = generateFloor(12345, 1, false);
    const b = generateFloor(12345, 1, false);
    expect(Array.from(a.tiles)).toEqual(Array.from(b.tiles));
    expect(a.rooms.length).toBe(b.rooms.length);
  });

  it("different seeds produce different layouts", () => {
    const a = generateFloor(1, 1, false);
    const b = generateFloor(2, 1, false);
    expect(Array.from(a.tiles)).not.toEqual(Array.from(b.tiles));
  });

  it("always carves at least a few rooms with a start and an exit", () => {
    for (let seed = 0; seed < 30; seed++) {
      const f = generateFloor(seed * 7919 + 1, 1, false);
      expect(f.rooms.length).toBeGreaterThanOrEqual(3);
      expect(f.start.kind).toBe("start");
      expect(f.exit.kind).toBe("exit");
      // exit must not be the same room as start
      expect(f.exit).not.toBe(f.start);
    }
  });

  it("marks stairs on a normal floor and an exit gate on a boss floor", () => {
    const normal = generateFloor(99, 1, false);
    expect(normal.tiles[normal.exit.cy * normal.gw + normal.exit.cx]).toBe(Tile.Stairs);
    expect(normal.isBoss).toBe(false);

    const boss = generateFloor(99, 3, true);
    expect(boss.tiles[boss.exit.cy * boss.gw + boss.exit.cx]).toBe(Tile.Exit);
    expect(boss.isBoss).toBe(true);
  });

  it("start and exit room centers are walkable floor", () => {
    const f = generateFloor(555, 2, false);
    expect(tileAt(f, f.start.cx, f.start.cy)).not.toBe(Tile.Wall);
    expect(tileAt(f, f.exit.cx, f.exit.cy)).not.toBe(Tile.Wall);
  });

  it("borders are solid walls (no walking off the grid)", () => {
    const f = generateFloor(31, 1, false);
    for (let x = 0; x < f.gw; x++) {
      expect(tileAt(f, x, 0)).toBe(Tile.Wall);
      expect(tileAt(f, x, f.gh - 1)).toBe(Tile.Wall);
    }
  });
});

describe("collision helpers", () => {
  it("treats out-of-bounds as walls", () => {
    const f = generateFloor(7, 1, false);
    expect(isWalkable(f, -10, -10)).toBe(false);
    expect(tileAt(f, -1, -1)).toBe(Tile.Wall);
  });

  it("circleHitsWall is true at the start room center only when the body pokes a wall", () => {
    const f = generateFloor(7, 1, false);
    const c = roomCenterWorld(f.start);
    // dead center of a room with a small radius: walkable
    expect(circleHitsWall(f, c.x, c.y, 4)).toBe(false);
  });

  it("roomCenterWorld converts tile center to world pixels", () => {
    const f = generateFloor(7, 1, false);
    const c = roomCenterWorld(f.start);
    expect(c.x).toBeCloseTo((f.start.cx + 0.5) * TILE);
    expect(c.y).toBeCloseTo((f.start.cy + 0.5) * TILE);
  });
});
