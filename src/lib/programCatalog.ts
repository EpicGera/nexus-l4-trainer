// Public program catalog — Firestore collection `programCatalog`.
// Any signed-in athlete can publish their active program; everyone can browse
// and install entries with one tap. The program travels as a JSON string
// (same shape parseJsonToDatabase accepts), keeping each entry atomic and
// clear of Firestore's nested-array restrictions.

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "./firebase";
import { Database } from "../types/workout";
import { parseJsonToDatabase, summarizeDatabase } from "./sheetImport";

export interface CatalogEntry {
  id: string;
  title: string;
  description: string;
  authorUid: string;
  authorName: string;
  updatedAt: string;
  weeks: number;
  days: number;
  items: number;
  programJson: string;
}

const COLLECTION = "programCatalog";
// Firestore caps documents at ~1MB; leave headroom for the metadata fields.
const MAX_JSON_BYTES = 950_000;

export async function publishProgram(
  user: { uid: string; displayName?: string | null },
  title: string,
  description: string,
  database: Database
): Promise<string> {
  const cleanTitle = title.trim();
  if (!cleanTitle) throw new Error("Poné un título al programa antes de publicarlo.");

  const summary = summarizeDatabase(database);
  if (summary.days === 0 || summary.items === 0) {
    throw new Error("El programa activo está vacío — no hay nada para publicar.");
  }

  const programJson = JSON.stringify(database);
  if (programJson.length > MAX_JSON_BYTES) {
    throw new Error("El programa es demasiado grande para el catálogo (máx ~950KB).");
  }

  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, COLLECTION), {
    title: cleanTitle.slice(0, 120),
    description: description.trim().slice(0, 500),
    authorUid: user.uid,
    authorName: (user.displayName || "Atleta Nexus").slice(0, 80),
    createdAt: now,
    updatedAt: now,
    weeks: summary.weeks,
    days: summary.days,
    items: summary.items,
    programJson,
  });
  return ref.id;
}

export async function listPrograms(max = 50): Promise<CatalogEntry[]> {
  const q = query(
    collection(db, COLLECTION),
    orderBy("updatedAt", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  const out: CatalogEntry[] = [];
  snap.forEach((d: any) => {
    const data = d.data();
    if (!data?.programJson || !data?.title) return;
    out.push({
      id: d.id,
      title: String(data.title),
      description: String(data.description || ""),
      authorUid: String(data.authorUid || ""),
      authorName: String(data.authorName || "Atleta"),
      updatedAt: String(data.updatedAt || ""),
      weeks: Number(data.weeks) || 0,
      days: Number(data.days) || 0,
      items: Number(data.items) || 0,
      programJson: String(data.programJson),
    });
  });
  return out;
}

export async function deleteProgram(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

/** Parse a catalog entry back into an installable Database. */
export function entryToDatabase(entry: CatalogEntry): Database {
  return parseJsonToDatabase(entry.programJson);
}
