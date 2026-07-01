import { describe, it, expect } from "vitest";
import { cleanBlockTitle } from "./titleClean";

describe("cleanBlockTitle", () => {
  it("converts a trailing classification parenthetical to a · subtitle", () => {
    expect(cleanBlockTitle("SKILL (GIMNASIA EMPUJE INVERTIDO)")).toBe(
      "SKILL · GIMNASIA EMPUJE INVERTIDO",
    );
  });

  it("strips HTML and bracketed notes, collapses whitespace", () => {
    expect(cleanBlockTitle("02.  FUERZA <span>x</span>")).toBe("02. FUERZA x");
    expect(cleanBlockTitle("METCON [NOTA]: pacing suave")).toBe("METCON pacing suave");
  });

  it("leaves clean titles untouched", () => {
    expect(cleanBlockTitle("01. WARM-UP")).toBe("01. WARM-UP");
    expect(cleanBlockTitle("03. METCON")).toBe("03. METCON");
  });

  it("never produces a bare '· X' when there is no leading label", () => {
    expect(cleanBlockTitle("(GIMNASIA)")).toBe("(GIMNASIA)");
  });

  it("handles empty / nullish input", () => {
    expect(cleanBlockTitle("")).toBe("");
    expect(cleanBlockTitle(undefined as unknown as string)).toBe("");
  });
});
