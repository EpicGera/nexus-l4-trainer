import { describe, it, expect } from "vitest";
import { detectDayType, dayVisual, fontFamilyFor } from "./dayTheme";
import { THEME_PALETTES } from "./chapterStore";

describe("dayTheme (Fase 2)", () => {
  it("classifies day types by title", () => {
    // real boss battles: Saturday BOSS FIGHT + Friday Solo Run
    expect(detectDayType("BOSS FIGHT: El Sindicato de Seúl")).toBe("boss");
    expect(detectDayType("La Prueba de la Banda (Solo Run)")).toBe("boss");
    // the word "boss" used thematically is NOT a battle
    expect(detectDayType("La Furia del Boss (Peak Week)")).toBe("default");
    expect(detectDayType("Dominio Territorial", "Team WOD parejas I Go You Go")).toBe("team");
    expect(detectDayType("La Prueba de Resiliencia (Resistencia Bruta)")).toBe("volume");
    expect(detectDayType("El Camino del Boss (Recuperación)")).toBe("recovery");
    expect(detectDayType("Día de Fuerza normal")).toBe("default");
  });

  it("paleta adulta: boss=rojo señal, resto mono; default = acento del capítulo", () => {
    const ch = THEME_PALETTES[0];
    // boss conserva el rojo (único acento); el resto pasa a mono (sin verde/naranja)
    expect(dayVisual("BOSS FIGHT", ch).accent).toBe("#DC2626");
    expect(dayVisual("Team WOD parejas", ch).accent).toBe("#FAFAFA");
    expect(dayVisual("Resistencia Bruta volumen", ch).accent).toBe("#FAFAFA");
    expect(dayVisual("El Camino (Recuperación)", ch).accent).toBe("#A1A1AA");
    // default uses the chapter accent
    expect(dayVisual("Lunes de Fuerza", ch).accent).toBe(ch.accent);
  });

  it("maps chapter fontKey to a family; default is empty (standard face)", () => {
    expect(fontFamilyFor("diablo")).toContain("Pirata One");
    expect(fontFamilyFor("sunkenrock")).toContain("Black Ops One");
    expect(fontFamilyFor("default")).toBe("");
    expect(fontFamilyFor(undefined)).toBe("");
  });
});
