import { describe, it, expect } from "vitest";
import { zoneForDepth, ZONES } from "./zones";

describe("zoneForDepth (secuencia de actos CALLE → SUBTE → AZOTEA)", () => {
  it("recorre los tres actos en un descenso estándar de 3 pisos", () => {
    expect(zoneForDepth(1, 3).id).toBe("calle");
    expect(zoneForDepth(2, 3).id).toBe("subte");
    expect(zoneForDepth(3, 3).id).toBe("azotea");
  });

  it("el último piso es siempre la azotea, aun con más o menos pisos", () => {
    expect(zoneForDepth(1, 1).id).toBe("azotea");
    expect(zoneForDepth(4, 4).id).toBe("azotea");
    expect(zoneForDepth(3, 4).id).toBe("subte"); // intermedio extra = subte
    expect(zoneForDepth(5, 3).id).toBe("azotea"); // clamp por encima del fondo
  });

  it("cada zona tiene identidad completa para el renderer", () => {
    Object.values(ZONES).forEach((z) => {
      expect(z.name).toMatch(/^ACTO /);
      [z.wall, z.wallTop, z.floor, z.accentRgb].forEach((rgb) =>
        expect(rgb).toMatch(/^\d+,\d+,\d+$/),
      );
      expect(z.bg).toMatch(/^#/);
      expect(z.accent).toMatch(/^#/);
    });
  });
});
