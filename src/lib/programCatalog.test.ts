import { describe, it, expect, beforeEach, vi } from "vitest";

const { addDocMock, getDocsMock, deleteDocMock } = vi.hoisted(() => ({
  addDocMock: vi.fn(),
  getDocsMock: vi.fn(),
  deleteDocMock: vi.fn(),
}));

vi.mock("./firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  addDoc: addDocMock,
  getDocs: getDocsMock,
  deleteDoc: deleteDocMock,
  collection: vi.fn(() => "col"),
  doc: vi.fn(() => "docref"),
  query: vi.fn(() => "query"),
  orderBy: vi.fn(),
  limit: vi.fn(),
}));

import {
  publishProgram,
  listPrograms,
  entryToDatabase,
  CatalogEntry,
} from "./programCatalog";
import { parseJsonToDatabase } from "./sheetImport";

const SAMPLE_PROGRAM = parseJsonToDatabase(
  JSON.stringify({
    w1: [
      { title: "Día 1", strength: { items: ["Back Squat 5x5"] } },
      { title: "Día 2", metcon: { items: ["AMRAP burpees", "Wall balls"] } },
    ],
  })
);

describe("publishProgram", () => {
  beforeEach(() => {
    addDocMock.mockReset().mockResolvedValue({ id: "prog-123" });
  });

  it("publishes the program with metadata, summary and JSON payload", async () => {
    const id = await publishProgram(
      { uid: "user-1", displayName: "Gera" },
      "  Mes 2 — Acto II  ",
      "El desierto",
      SAMPLE_PROGRAM
    );

    expect(id).toBe("prog-123");
    const payload = addDocMock.mock.calls[0][1];
    expect(payload.title).toBe("Mes 2 — Acto II");
    expect(payload.description).toBe("El desierto");
    expect(payload.authorUid).toBe("user-1");
    expect(payload.authorName).toBe("Gera");
    expect(payload.weeks).toBe(1);
    expect(payload.days).toBe(2);
    expect(payload.items).toBe(3);
    expect(typeof payload.programJson).toBe("string");
    // the payload roundtrips back into the same program
    expect(parseJsonToDatabase(payload.programJson)).toEqual(SAMPLE_PROGRAM);
  });

  it("rejects an empty title and an empty program", async () => {
    await expect(
      publishProgram({ uid: "u" }, "   ", "", SAMPLE_PROGRAM)
    ).rejects.toThrow(/título/);
    await expect(
      publishProgram({ uid: "u" }, "Mes X", "", {} as any)
    ).rejects.toThrow(/vacío/);
    expect(addDocMock).not.toHaveBeenCalled();
  });

  it("falls back to a default author name", async () => {
    await publishProgram({ uid: "u2", displayName: null }, "Plan", "", SAMPLE_PROGRAM);
    expect(addDocMock.mock.calls[0][1].authorName).toBe("Atleta Nexus");
  });
});

describe("listPrograms", () => {
  it("maps documents and skips entries without title or payload", async () => {
    const docs = [
      {
        id: "a",
        data: () => ({
          title: "Mes 1",
          authorUid: "u1",
          authorName: "Gera",
          updatedAt: "2026-06-11T00:00:00.000Z",
          weeks: 4,
          days: 28,
          items: 100,
          programJson: "{}",
        }),
      },
      { id: "b", data: () => ({ title: "", programJson: "{}" }) },
      { id: "c", data: () => ({ title: "Sin payload" }) },
    ];
    getDocsMock.mockResolvedValue({
      forEach: (cb: (d: any) => void) => docs.forEach(cb),
    });

    const entries = await listPrograms();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ id: "a", title: "Mes 1", weeks: 4 });
  });
});

describe("entryToDatabase", () => {
  it("roundtrips a published entry back into an installable Database", () => {
    const entry: CatalogEntry = {
      id: "x",
      title: "Mes 2",
      description: "",
      authorUid: "u1",
      authorName: "Gera",
      updatedAt: "",
      weeks: 1,
      days: 2,
      items: 3,
      programJson: JSON.stringify(SAMPLE_PROGRAM),
    };
    expect(entryToDatabase(entry)).toEqual(SAMPLE_PROGRAM);
  });
});
