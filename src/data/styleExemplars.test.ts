import { describe, it, expect } from "vitest";
import {
  STYLE_EXEMPLARS, selectExemplars, exemplarsPromptBlock, loadedBrands, StyleExemplar,
} from "./styleExemplars";

describe("styleExemplars", () => {
  it("hay ADN de HWPO sembrado y cubre structure/strength/accessory/metcon", () => {
    const hwpo = STYLE_EXEMPLARS.filter((e) => e.brand === "HWPO");
    expect(hwpo.length).toBeGreaterThanOrEqual(4);
    const facets = new Set(hwpo.map((e) => e.facet));
    ["structure", "strength", "accessory", "metcon", "scaling"].forEach((f) => expect(facets.has(f as any)).toBe(true));
    // el facet de escalado NO duplica ratios (fusionados al Apéndice G de la
    // enciclopedia, única fuente de verdad) — referencia en vez de números propios
    const scaling = hwpo.find((e) => e.facet === "scaling")!;
    expect(scaling.pattern).toMatch(/Apéndice G/);
    expect(scaling.example).not.toMatch(/\d(\.\d)?:\d/); // sin ratios tipo "1.5:1" hardcodeados
    expect(loadedBrands()).toContain("HWPO");
  });

  it("selectExemplars prioriza los facets pedidos y no repite facet", () => {
    const sel = selectExemplars({ preferFacets: ["strength", "metcon"], max: 3 });
    expect(sel.length).toBe(3);
    expect(sel[0].facet).toBe("strength");
    expect(sel[1].facet).toBe("metcon");
    expect(new Set(sel.map((e) => e.facet)).size).toBe(3); // sin facets repetidos
  });

  it("reparte entre escuelas cuando hay varias (no monopoliza una)", () => {
    const pool: StyleExemplar[] = [
      { brand: "HWPO", facet: "strength", pattern: "a", example: "a" },
      { brand: "PRVN", facet: "strength", pattern: "b", example: "b" },
      { brand: "HWPO", facet: "metcon", pattern: "c", example: "c" },
      { brand: "MAYHEM", facet: "metcon", pattern: "d", example: "d" },
    ];
    // primero strength → HWPO (count 0), luego metcon → prefiere MAYHEM/PRVN sobre HWPO (count 1)
    const sel = selectExemplars({ preferFacets: ["strength", "metcon"], max: 2, pool });
    expect(sel[0].brand).toBe("HWPO");
    expect(sel[1].brand).not.toBe("HWPO");
  });

  it("exemplarsPromptBlock nombra las escuelas y pide combinar sin copiar", () => {
    const block = exemplarsPromptBlock(selectExemplars({ max: 3 }));
    expect(block).toContain("HWPO");
    expect(block).toMatch(/combin|mejor de cada/i);
    expect(block).toMatch(/no copies/i);
    expect(exemplarsPromptBlock([])).toBe("");
  });
});
