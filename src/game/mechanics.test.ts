import { describe, it, expect } from "vitest";
import {
  plateauShieldAfterHit,
  plateauShieldRegen,
  spawnPlanForDepth,
  PLATEAU_REGEN_DELAY_SEC,
} from "./mechanics";

describe("EL PLATEAU — escudo que solo rompen los críticos", () => {
  it("los golpes normales rebotan; los críticos lo bajan", () => {
    expect(plateauShieldAfterHit(100, 40, false)).toBe(100);
    expect(plateauShieldAfterHit(100, 40, true)).toBe(60);
    expect(plateauShieldAfterHit(30, 99, true)).toBe(0); // no baja de 0
  });

  it("roto queda roto (no revive con más golpes)", () => {
    expect(plateauShieldAfterHit(0, 50, true)).toBe(0);
    expect(plateauShieldRegen(0, 120, 999, 1)).toBe(0);
  });

  it("regenera solo tras el delay sin críticos, con tope en el máximo", () => {
    expect(plateauShieldRegen(50, 120, PLATEAU_REGEN_DELAY_SEC - 1, 1)).toBe(50);
    expect(plateauShieldRegen(50, 120, PLATEAU_REGEN_DELAY_SEC, 1)).toBeGreaterThan(50);
    expect(plateauShieldRegen(119, 120, 99, 10)).toBe(120);
    expect(plateauShieldRegen(120, 120, 99, 1)).toBe(120);
  });
});

describe("spawnPlanForDepth — tabla de aparición por acto", () => {
  it("acto 1: sin lesión ni plateau; acto 2: lesión; acto final: ambos", () => {
    expect(spawnPlanForDepth(1, 3)).toEqual({ lesionChancePerRoom: 0, plateauOnFloor: false });
    expect(spawnPlanForDepth(2, 3)).toEqual({ lesionChancePerRoom: 0.35, plateauOnFloor: false });
    expect(spawnPlanForDepth(3, 3)).toEqual({ lesionChancePerRoom: 0.35, plateauOnFloor: true });
  });

  it("un descenso de un solo piso no mete mini-jefe", () => {
    expect(spawnPlanForDepth(1, 1).plateauOnFloor).toBe(false);
  });
});
