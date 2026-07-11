import React from "react";
import {
  CloudLightning,
  ShieldCheck,
  LogOut,
  RefreshCw,
  Link2,
  FolderUp,
  FileJson,
} from "lucide-react";
import { signOut, User } from "firebase/auth";
import { auth, googleSignIn } from "../lib/firebase";
import { pushAllLocalToCloud } from "../lib/syncEngine";
import {
  getSourceSheetId,
  setSourceSheetId,
  isUsingCustomSheet,
  clearCachedWorkouts,
  getTemplateCopyUrl,
  parseCsvToDatabase,
  parseJsonToDatabase,
  summarizeDatabase,
} from "../lib/sheetImport";
import { emitToast, handleExportProgramJSON } from "../lib/exportService";
import { auditProgram, AuditResult } from "../lib/auditProgram";
import {
  getProvider, setProvider, getClaudeKey, setClaudeKey, getGeminiKey, setGeminiKey, AiProvider,
} from "../lib/aiKeys";
import ChapterCreator from "./ChapterCreator";
import ChapterSwitcher from "./ChapterSwitcher";
import {
  publishProgram,
  listPrograms,
  deleteProgram,
  entryToDatabase,
  CatalogEntry,
} from "../lib/programCatalog";
import { summarizeDatabase as summarizeDb } from "../lib/sheetImport";
import { Database } from "../types/workout";

interface CloudSyncPanelProps {
  currentUser: User | null;
  isCloudSyncing: boolean;
  setIsCloudSyncing: (syncing: boolean) => void;
  syncStatus: {
    hasPendingWrites: boolean;
    isOnline: boolean;
  };
  setConfettiTrigger: React.Dispatch<React.SetStateAction<number>>;
  onRefreshFromSheet?: () => void;
  isRefreshingSheet?: boolean;
  // Program import/export: load a coach/AI-generated plan (CSV/JSON) and
  // download the active program as a JSON template.
  currentDatabase?: Database;
  onProgramImported?: (db: Database, meta?: { title?: string; lore?: string }) => void;
}

export default function CloudSyncPanel({
  currentUser,
  isCloudSyncing,
  setIsCloudSyncing,
  syncStatus,
  setConfettiTrigger,
  onRefreshFromSheet,
  isRefreshingSheet = false,
  currentDatabase,
  onProgramImported,
}: CloudSyncPanelProps) {
  const [sheetInput, setSheetInput] = React.useState("");
  const [customSheet, setCustomSheet] = React.useState(isUsingCustomSheet());

  // ── AI provider keys (LOCAL only — never synced to Firestore) ──────────
  const [aiProvider, setAiProvider] = React.useState<AiProvider>(getProvider());
  const [geminiKeyInput, setGeminiKeyInput] = React.useState(getGeminiKey());
  const [claudeKeyInput, setClaudeKeyInput] = React.useState(getClaudeKey());
  const saveAiSettings = () => {
    setProvider(aiProvider);
    setGeminiKey(geminiKeyInput);
    setClaudeKey(claudeKeyInput);
    emitToast(
      `✅ IA guardada (solo en este dispositivo). Proveedor activo: ${aiProvider === "claude" ? "Claude" : "Gemini"}.`,
      "success",
      7000,
    );
  };
  const programFileRef = React.useRef<HTMLInputElement | null>(null);

  // ── Public program catalog state ──────────────────────────────────────
  const [catalogOpen, setCatalogOpen] = React.useState(false);
  const [catalogLoading, setCatalogLoading] = React.useState(false);
  const [catalogError, setCatalogError] = React.useState("");
  const [catalogEntries, setCatalogEntries] = React.useState<CatalogEntry[]>([]);
  const [publishTitle, setPublishTitle] = React.useState("");
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [auditReport, setAuditReport] = React.useState<AuditResult | null>(null);

  const loadCatalog = async () => {
    setCatalogLoading(true);
    setCatalogError("");
    try {
      // Firestore can hang on flaky connections — don't leave the button
      // stuck on "CARGANDO..." forever.
      const entries = await Promise.race([
        listPrograms(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("El catálogo no respondió. Revisá tu conexión e intentá de nuevo.")),
            10000,
          ),
        ),
      ]);
      setCatalogEntries(entries);
    } catch (e: any) {
      setCatalogError(
        e?.message?.includes("permission") || e?.code === "permission-denied"
          ? "El catálogo todavía no está habilitado en el servidor (falta desplegar las reglas)."
          : e?.message || String(e),
      );
    } finally {
      setCatalogLoading(false);
      setCatalogOpen(true);
    }
  };

  const handlePublish = async () => {
    if (!currentUser || !currentDatabase) return;
    setIsPublishing(true);
    try {
      await publishProgram(currentUser, publishTitle, "", currentDatabase);
      emitToast(`✅ Programa publicado en el catálogo: ${publishTitle.trim()}`, "success", 8000);
      setPublishTitle("");
      if (catalogOpen) await loadCatalog();
    } catch (e: any) {
      emitToast("❌ No se pudo publicar: " + (e?.message ?? String(e)), "error", 9000);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleInstall = (entry: CatalogEntry) => {
    if (!onProgramImported) return;
    try {
      const dbase = entryToDatabase(entry);
      const s = summarizeDb(dbase);
      onProgramImported(dbase, { title: entry.title });
      emitToast(
        `✅ Instalado: ${entry.title} (${s.weeks} semana(s) · ${s.days} días)`,
        "success",
        8000,
      );
    } catch (e: any) {
      emitToast("❌ Programa inválido: " + (e?.message ?? String(e)), "error", 9000);
    }
  };

  const handleDeleteEntry = async (entry: CatalogEntry) => {
    if (!window.confirm(`¿Eliminar "${entry.title}" del catálogo público?`)) return;
    try {
      await deleteProgram(entry.id);
      emitToast("🗑 Programa eliminado del catálogo", "success");
      await loadCatalog();
    } catch (e: any) {
      emitToast("❌ No se pudo eliminar: " + (e?.message ?? String(e)), "error", 8000);
    }
  };

  const handleProgramFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file || !onProgramImported) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        const text = String(reader.result || "").trim();
        if (!text) throw new Error("El archivo está vacío.");
        const isJson = text.startsWith("{") || text.startsWith("[");

        // Layer 1 audit (JSON only): validate + apply safe fixes (clean titles)
        // BEFORE import. Hard errors gate the import; warnings auto-normalize and
        // are surfaced in a report so the athlete/IA can fix the source.
        let importText = text;
        let audit: AuditResult | null = null;
        if (isJson) {
          let raw: unknown;
          try { raw = JSON.parse(text); }
          catch { throw new Error("JSON inválido: revisá comas, llaves y comillas."); }
          audit = auditProgram(raw);
          setAuditReport(audit);
          if (!audit.ok) {
            const errs = audit.issues.filter((i) => i.severity === "error").map((i) => i.message).join(" · ");
            throw new Error("La auditoría bloqueó la carga: " + errs);
          }
          importText = JSON.stringify(audit.normalized);
        } else {
          setAuditReport(null);
        }

        const db = isJson ? parseJsonToDatabase(importText) : parseCsvToDatabase(importText);
        const summary = summarizeDatabase(db);
        if (summary.days === 0 || summary.items === 0) {
          throw new Error(
            "El archivo no contiene días o ejercicios reconocibles. Revisá el formato (plantilla JSON o CSV estilo WODForge).",
          );
        }
        onProgramImported(db, { title: file.name.replace(/\.(json|csv|txt)$/i, "").toUpperCase() });
        const fixNote = audit
          ? ` · ⚙ ${audit.stats.titlesFixed} títulos limpiados · ${audit.stats.unreadableItems} ítem(s) no auto-legibles`
          : "";
        emitToast(
          `✅ Programa cargado: ${summary.weeks} semana(s) · ${summary.days} días · ${summary.items} ejercicios${fixNote}`,
          "success",
          8000,
        );
      } catch (err: any) {
        emitToast(
          "❌ No se pudo cargar el programa: " + (err?.message ?? String(err)),
          "error",
          9000,
        );
      }
    };
    reader.readAsText(file);
  };

  const handleLinkSheet = () => {
    const result = setSourceSheetId(sheetInput);
    if (result === null) {
      emitToast(
        "❌ No se reconoció la planilla. Pegá el link completo de Google Sheets o su ID.",
        "error",
        7000
      );
      return;
    }
    clearCachedWorkouts();
    const nowCustom = isUsingCustomSheet();
    setCustomSheet(nowCustom);
    setSheetInput("");
    emitToast(
      nowCustom
        ? "✅ Planilla vinculada. Tocá ↻ REFRESCAR para cargar tu programa."
        : "✅ Planilla desvinculada. Seguís usando tu programa guardado en tu cuenta.",
      "success",
      8000
    );
  };

  return (
    <section
      className="mt-4 p-5 border border-[color:var(--color-line)] bg-pure-black/95 relative overflow-hidden"
      data-purpose="cloud-sync-panel"
    >
      <div className="absolute top-0 right-0 p-3 select-none pointer-events-none opacity-5 font-brutalist text-6xl text-white">
        CLOUD
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[color:var(--color-line)] pb-4 mb-4">
        <div className="space-y-1">
          <h4 className="text-xl font-brutalist tracking-wider text-pure-white flex items-center gap-2">
            <CloudLightning className="text-electric-blue" size={20} />
            SISTEMA DE PERSISTENCIA EN LA NUBE
          </h4>
          <p className="text-[10px] font-mono tracking-widest text-[#00f0ff] uppercase">
            // REGISTRO Y TRACKING METABÓLICO SEGURO
          </p>
        </div>

        {currentUser ? (
          <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 text-emerald-400 font-mono text-[10px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            <span>SINCRO ACTIVO ● CONECTADO</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-500/30 px-3 py-1 text-amber-400 font-mono text-[10px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            <span>
              OFFLINE EN LA NUBE (ALMACENAMIENTO REMOTO DESACTIVADO)
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Left Column: Description */}
        <div className="space-y-2 text-left">
          <p className="font-condensed text-neutral-400 font-bold text-xs sm:text-sm leading-relaxed">
            La Ley del Estímulo CF-L4 exige precisión absoluta. Al
            registrarte en la nube, todos tus entrenamientos, cargas
            reales, históricos de RPE, perfiles de volumen de trabajo y
            misiones diarias se respaldan de inmediato.
          </p>
          <p className="font-mono text-[10px] text-neutral-500 leading-normal uppercase">
            * Compatible con múltiples dispositivos. Inicia sesión en tu
            box mediante tu móvil o tableta para ver tus RMs y cargas de
            trabajo al instante.
          </p>
        </div>

        {/* Middle Column: User details or login trigger */}
        <div className="bg-[#0b0c10] border border-white/5 p-4 flex flex-col justify-center min-h-[110px]">
          {currentUser ? (
            <div className="flex items-center gap-3 text-left">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || ""}
                  className="w-12 h-12 rounded-full border-2 border-electric-blue shrink-0 shadow-md shadow-electric-blue/10"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 bg-electric-blue/20 border-2 border-electric-blue flex items-center justify-center text-white font-brutalist text-xl rounded-full shrink-0">
                  {currentUser.displayName
                    ? currentUser.displayName[0].toUpperCase()
                    : "U"}
                </div>
              )}
              <div className="space-y-0.5 overflow-hidden">
                <div className="text-md font-bold font-brutalist text-white tracking-wide truncate">
                  {currentUser.displayName || "ATLETA ACTIVO"}
                </div>
                <div className="text-[10px] font-mono text-neutral-400 truncate uppercase">
                  {currentUser.email}
                </div>
                <div className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
                  <ShieldCheck size={10} /> VERIFICADO [CF-L4 ACCESO]
                </div>
                <div className="text-[9px] font-mono whitespace-nowrap flex items-center gap-1 uppercase tracking-wider mt-0.5">
                  {syncStatus.hasPendingWrites ? (
                    <span className="text-amber-400 flex items-center gap-1 animate-pulse">
                      ● SINCRO ACTIVA (RESPALDO PENDIENTE...)
                    </span>
                  ) : !syncStatus.isOnline ? (
                    <span className="text-blue-400 flex items-center gap-1">
                      ● BASE DE DATOS SIN RED (MODO SEGURO ACTIVO)
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1">
                      ● COLA SINCRO AL DÍA (TIEMPO REAL)
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-center py-2">
              <p className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest leading-relaxed">
                SINCRO DESACTIVADO // SIN SESIÓN INICIADA
              </p>
              <div className="text-[9px] font-mono text-neutral-500">
                CONECTA GOOGLE AUTH PARA ACTIVAR EL RESPALDO
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Actions */}
        <div className="flex flex-col gap-2.5 h-full justify-center">
          {currentUser ? (
            <>
              <button
                onClick={async () => {
                  if (!currentUser) return;
                  setIsCloudSyncing(true);
                  try {
                    await pushAllLocalToCloud(currentUser.uid);
                    setConfettiTrigger((v) => v + 1);
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setIsCloudSyncing(false);
                  }
                }}
                disabled={isCloudSyncing}
                className="w-full bg-electric-blue text-pure-white hover:bg-white hover:text-pure-black font-brutalist py-2.5 px-4 text-xs tracking-widest uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 select-none shadow-md shadow-electric-blue/15 disabled:opacity-50"
              >
                {isCloudSyncing
                  ? "SINCRO-RESPALDO EN PROCESO..."
                  : "🚀 SUBIR HISTORIAL COMPLETO"}
              </button>
              <button
                onClick={async () => {
                  try {
                    await signOut(auth);
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="w-full bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white hover:border-white font-mono py-2 text-[10px] tracking-widest uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut size={11} /> CERRAR ACCESO SEGURO
              </button>
            </>
          ) : (
            <button
              onClick={async () => {
                try {
                  await googleSignIn();
                } catch (e) {
                  console.error(e);
                }
              }}
              className="w-full bg-pure-white text-pure-black hover:bg-neutral-200 font-brutalist py-3.5 px-4 text-xs tracking-widest uppercase transition-all duration-200 cursor-pointer shadow-lg hover:shadow-white/5 flex items-center justify-center gap-2 select-none font-bold"
            >
              🔐 INICIAR SESIÓN CON GOOGLE
            </button>
          )}

          {onRefreshFromSheet && customSheet && (
            <button
              onClick={onRefreshFromSheet}
              disabled={isRefreshingSheet}
              title="Vuelve a leer la programación desde tu Google Sheet"
              className="w-full bg-neutral-950 border border-electric-blue/40 text-electric-blue hover:bg-electric-blue hover:text-pure-black font-mono py-2 text-[10px] tracking-widest uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw
                size={11}
                className={isRefreshingSheet ? "animate-spin" : ""}
              />
              {isRefreshingSheet
                ? "REFRESCANDO PROGRAMA..."
                : "↻ REFRESCAR PROGRAMA DESDE LA HOJA"}
            </button>
          )}
        </div>
      </div>

      {/* PER-USER PROGRAM SHEET — ONBOARDING IN 3 STEPS */}
      <div className="mt-5 pt-4 border-t border-[color:var(--color-line)] text-left space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-[10px] font-mono font-black tracking-widest text-electric-blue uppercase flex items-center gap-1.5">
            <Link2 size={11} /> VINCULAR GOOGLE SHEETS (OPCIONAL)
          </label>
          <p className="text-[9px] font-mono uppercase">
            {customSheet ? (
              <span className="text-emerald-400">
                ● USANDO TU PLANILLA: …{getSourceSheetId().slice(-10)}
              </span>
            ) : (
              <span className="text-neutral-500">
                ● TU PROGRAMA VIVE EN TU CUENTA (FIRESTORE)
              </span>
            )}
          </p>
        </div>

        <p className="text-[9px] font-mono text-neutral-500 uppercase leading-relaxed">
          No necesitás Google Sheets: tu programa, cargas y RPE se guardan en tu
          cuenta y se sincronizan solos. Vincular una planilla es opcional —
          para quienes prefieren editar su rutina en Sheets.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Paso 1: copiar la plantilla */}
          <div className="bg-[#0b0c10] border border-white/5 p-3 flex flex-col gap-2">
            <span className="text-[9px] font-mono font-black text-neutral-400 uppercase tracking-widest">
              1 · CREÁ TU COPIA
            </span>
            <p className="text-[9px] font-mono text-neutral-500 leading-relaxed uppercase">
              Google te crea tu propio WODForge con los macros y dashboards
              incluidos, en tu Drive.
            </p>
            <a
              href={getTemplateCopyUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto text-center bg-emerald-500/15 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-pure-black font-mono py-2 px-3 text-[10px] font-black tracking-widest uppercase transition-all duration-200 cursor-pointer"
            >
              📋 COPIAR PLANTILLA
            </a>
          </div>

          {/* Paso 2: instrucción */}
          <div className="bg-[#0b0c10] border border-white/5 p-3 flex flex-col gap-2">
            <span className="text-[9px] font-mono font-black text-neutral-400 uppercase tracking-widest">
              2 · COPIÁ EL LINK DE TU PLANILLA
            </span>
            <p className="text-[9px] font-mono text-neutral-500 leading-relaxed uppercase">
              Con tu copia abierta en Google Sheets, copiá la dirección desde
              la barra del navegador o con el botón Compartir.
            </p>
          </div>

          {/* Paso 3: vincular */}
          <div className="bg-[#0b0c10] border border-white/5 p-3 flex flex-col gap-2">
            <span className="text-[9px] font-mono font-black text-neutral-400 uppercase tracking-widest">
              3 · VINCULALA A LA APP
            </span>
            <input
              type="text"
              value={sheetInput}
              onChange={(e) => setSheetInput(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/…"
              spellCheck={false}
              className="w-full bg-pure-black border border-[color:var(--color-line)] text-white font-mono text-[10px] px-2.5 py-2 rounded focus:outline-none focus:border-electric-blue transition-colors"
            />
            <button
              onClick={handleLinkSheet}
              className="mt-auto bg-electric-blue/15 border border-electric-blue/50 text-electric-blue hover:bg-electric-blue hover:text-pure-black font-mono py-2 px-3 text-[10px] font-black tracking-widest uppercase transition-all duration-200 cursor-pointer"
            >
              GUARDAR PLANILLA
            </button>
          </div>
        </div>

        <p className="text-[8.5px] font-mono text-neutral-600 uppercase leading-relaxed">
          * Tu planilla y tu programa se sincronizan con tu cuenta — los vas a
          tener en cualquier dispositivo donde inicies sesión. Para volver a la
          planilla por defecto, guardá con el campo vacío.
        </p>
      </div>

      {/* AI PROVIDER — PRIVATE LOCAL KEYS (Gemini / Claude) */}
      <div className="mt-5 pt-4 border-t border-[color:var(--color-line)] text-left space-y-3">
        <label className="text-[10px] font-mono font-black tracking-widest text-[#00f0ff] uppercase flex items-center gap-1.5">
          🧠 INTELIGENCIA ARTIFICIAL (LLAVES PRIVADAS)
        </label>
        <p className="text-[9px] font-mono text-neutral-500 uppercase leading-relaxed">
          Elegí el motor de IA y pegá tu propia API key. Se guardan
          <span className="text-emerald-400"> SOLO en este dispositivo</span> (localStorage); no viajan a
          Firestore ni a ningún servidor nuestro. Cada usuario usa su propia llave.
        </p>

        <div className="flex gap-2">
          {(["gemini", "claude"] as AiProvider[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAiProvider(p)}
              className={`flex-1 font-mono text-[11px] tracking-widest uppercase py-2 rounded border transition-colors cursor-pointer ${
                aiProvider === p
                  ? "bg-[#00f0ff] text-pure-black border-[#00f0ff] font-black"
                  : "bg-[#0b0c10] text-neutral-300 border-[color:var(--color-line)]"
              }`}
            >
              {p === "gemini" ? "Google Gemini" : "Anthropic Claude"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">Gemini API key</span>
            <input
              type="password"
              value={geminiKeyInput}
              onChange={(e) => setGeminiKeyInput(e.target.value)}
              placeholder="AIza…"
              spellCheck={false}
              autoComplete="off"
              className="w-full bg-pure-black border border-[color:var(--color-line)] text-white font-mono text-[10px] px-2.5 py-2 rounded focus:outline-none focus:border-[#00f0ff]"
            />
          </div>
          <div>
            <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">Claude (Anthropic) API key</span>
            <input
              type="password"
              value={claudeKeyInput}
              onChange={(e) => setClaudeKeyInput(e.target.value)}
              placeholder="sk-ant-…"
              spellCheck={false}
              autoComplete="off"
              className="w-full bg-pure-black border border-[color:var(--color-line)] text-white font-mono text-[10px] px-2.5 py-2 rounded focus:outline-none focus:border-[#00f0ff]"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={saveAiSettings}
          className="w-full bg-[#00f0ff]/15 border border-[#00f0ff]/50 text-[#00f0ff] hover:bg-[#00f0ff] hover:text-pure-black font-mono py-2.5 px-4 text-[10px] font-black tracking-widest uppercase transition-all duration-200 cursor-pointer"
        >
          GUARDAR LLAVES (LOCAL)
        </button>
        <p className="text-[8.5px] font-mono text-neutral-600 uppercase leading-relaxed">
          * Sin llave configurada, las funciones de IA usan el fallback local heurístico. La llave de
          Claude habilita llamadas directas del navegador a Anthropic con tu propia cuenta.
        </p>
      </div>

      {/* CHAPTER LIBRARY — switch / consult / share saved chapters */}
      {onProgramImported && <ChapterSwitcher />}

      {/* CHAPTER CREATOR — AI monthly program generation */}
      {onProgramImported && (
        <div className="mt-5">
          <ChapterCreator onInstall={onProgramImported} currentProgram={currentDatabase} />
        </div>
      )}

      {/* COACH/AI MONTHLY PROGRAM: LOAD CSV/JSON + JSON TEMPLATE */}
      {onProgramImported && (
        <div className="mt-5 pt-4 border-t border-[color:var(--color-line)] text-left space-y-3">
          <label className="text-[10px] font-mono font-black tracking-widest text-amber-500 uppercase flex items-center gap-1.5">
            <FolderUp size={11} /> PROGRAMACIÓN MENSUAL (COACH / IA)
          </label>
          <p className="text-[9px] font-mono text-neutral-500 uppercase leading-relaxed">
            Cargá una rutina generada con tu coach o con IA: un archivo JSON
            con la estructura de la plantilla, o un CSV estilo WODForge
            (columnas Semana, Día, Bloque, Ejercicio, Esquema…). El programa
            cargado reemplaza al activo y se sincroniza con tu cuenta.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="file"
              accept=".csv,.json,text/csv,application/json,text/plain"
              className="hidden"
              ref={programFileRef}
              onChange={handleProgramFile}
            />
            <button
              type="button"
              onClick={() => programFileRef.current?.click()}
              className="flex-1 bg-amber-500/15 border border-amber-500/50 text-amber-400 hover:bg-amber-500 hover:text-pure-black font-mono py-2.5 px-4 text-[10px] font-black tracking-widest uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FolderUp size={12} /> CARGAR PROGRAMA (CSV / JSON)
            </button>
            {currentDatabase && (
              <button
                type="button"
                onClick={() => handleExportProgramJSON(currentDatabase)}
                title="Descargá el programa activo como JSON para que tu coach o la IA genere el próximo mes con la misma estructura"
                className="flex-1 bg-neutral-950 border border-[color:var(--color-line)] text-neutral-300 hover:text-white hover:border-white font-mono py-2.5 px-4 text-[10px] font-black tracking-widest uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FileJson size={12} /> DESCARGAR PLANTILLA JSON
              </button>
            )}
          </div>
          <p className="text-[8.5px] font-mono text-neutral-600 uppercase leading-relaxed">
            * Workflow: descargá la plantilla → pedile a tu coach o IA el mes
            siguiente con esa misma estructura → cargá el archivo acá. Para
            compartir tu programa con otros atletas, usá el catálogo público
            de abajo.
          </p>

          {auditReport && auditReport.issues.length > 0 && (
            <div className="border border-[color:var(--color-line)] bg-black/50 rounded-sm p-3 space-y-2 text-left">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-black tracking-widest text-amber-400 uppercase">
                  🛡 Auditoría del JSON
                </span>
                <button
                  type="button"
                  onClick={() => setAuditReport(null)}
                  className="text-[9px] font-mono text-neutral-500 hover:text-white uppercase cursor-pointer"
                >
                  cerrar
                </button>
              </div>
              <p className="text-[9px] font-mono text-neutral-400 uppercase leading-relaxed">
                {auditReport.stats.titlesFixed} título(s) limpiados automáticamente ·{" "}
                {auditReport.stats.unreadableItems} ítem(s) que el auto-registro NO puede leer
                (escribí series/reps/carga/tiempo en el texto del ejercicio):
              </p>
              <ul className="space-y-1 max-h-44 overflow-y-auto">
                {auditReport.issues
                  .filter((i) => /No legible/.test(i.message))
                  .slice(0, 20)
                  .map((i, idx) => (
                    <li key={idx} className="text-[9px] font-mono text-rose-300/90 leading-snug">
                      <span className="text-neutral-500">{i.where}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
          <a
            href="/nexus_plantilla_limpia.json"
            download="Nexus_L4_Plantilla_Limpia.json"
            className="block text-center bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-pure-black font-mono py-2 px-4 text-[10px] font-black tracking-widest uppercase transition-all duration-200 cursor-pointer"
          >
            📄 DESCARGAR PLANTILLA LIMPIA (SIN DATOS PERSONALES)
          </a>
          <a
            href="/GUIA-generar-programa-IA-externa.md"
            download="Nexus_L4_Guia_Generar_Programa_IA.md"
            className="block text-center bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] hover:bg-[#00f0ff] hover:text-pure-black font-mono py-2 px-4 text-[10px] font-black tracking-widest uppercase transition-all duration-200 cursor-pointer mt-2"
          >
            🤖 GUÍA PARA IA EXTERNA (CÓMO ARMAR EL MES)
          </a>
        </div>
      )}

      {/* PUBLIC PROGRAM CATALOG */}
      {onProgramImported && (
        <div className="mt-5 pt-4 border-t border-[color:var(--color-line)] text-left space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-[10px] font-mono font-black tracking-widest text-[#00f0ff] uppercase flex items-center gap-1.5">
              🌐 CATÁLOGO PÚBLICO DE PROGRAMAS
            </label>
            <button
              type="button"
              onClick={() => (catalogOpen ? setCatalogOpen(false) : loadCatalog())}
              className="shrink-0 bg-neutral-950 border border-[#00f0ff]/40 text-[#00f0ff] hover:bg-[#00f0ff] hover:text-pure-black font-mono py-2 px-4 text-[10px] font-black tracking-widest uppercase transition-all duration-200 cursor-pointer"
            >
              {catalogLoading
                ? "CARGANDO..."
                : catalogOpen
                  ? "OCULTAR CATÁLOGO"
                  : "VER CATÁLOGO"}
            </button>
          </div>
          <p className="text-[9px] font-mono text-neutral-500 uppercase leading-relaxed">
            Programas publicados por la comunidad: instalá cualquiera con un
            toque. {currentUser ? "Publicá el tuyo con un título." : "Iniciá sesión para publicar el tuyo."}
          </p>

          {/* Publish row (signed-in only) */}
          {currentUser && currentDatabase && (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={publishTitle}
                onChange={(e) => setPublishTitle(e.target.value)}
                placeholder="Ej. MES 2 — ACTO II: EL DESIERTO"
                spellCheck={false}
                maxLength={120}
                className="flex-1 bg-[#0b0c10] border border-[color:var(--color-line)] text-white font-mono text-[11px] px-3 py-2.5 rounded uppercase focus:outline-none focus:border-[#00f0ff] transition-colors"
              />
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing || !publishTitle.trim()}
                className="shrink-0 bg-[#00f0ff]/15 border border-[#00f0ff]/50 text-[#00f0ff] hover:bg-[#00f0ff] hover:text-pure-black font-mono py-2.5 px-5 text-[10px] font-black tracking-widest uppercase transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              >
                {isPublishing ? "PUBLICANDO..." : "📢 PUBLICAR PROGRAMA ACTIVO"}
              </button>
            </div>
          )}

          {/* Catalog list */}
          {catalogOpen && (
            <div className="space-y-2">
              {catalogError ? (
                <p className="text-[10px] font-mono text-amber-400 uppercase leading-relaxed bg-amber-950/30 border border-amber-500/30 p-3">
                  ⚠ {catalogError}
                </p>
              ) : catalogEntries.length === 0 && !catalogLoading ? (
                <p className="text-[10px] font-mono text-neutral-500 uppercase p-3 border border-white/5 bg-[#0b0c10]">
                  El catálogo está vacío — sé el primero en publicar un programa.
                </p>
              ) : (
                catalogEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 bg-[#0b0c10] border border-white/5 p-3"
                  >
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="text-xs font-brutalist tracking-wider text-white truncate uppercase">
                        {entry.title}
                      </div>
                      <div className="text-[9px] font-mono text-neutral-500 uppercase">
                        {entry.authorName} ·{" "}
                        {entry.weeks} sem · {entry.days} días · {entry.items} ejercicios
                        {entry.updatedAt
                          ? ` · ${new Date(entry.updatedAt).toLocaleDateString("es-AR")}`
                          : ""}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleInstall(entry)}
                        className="bg-emerald-500/15 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-pure-black font-mono py-1.5 px-3.5 text-[9px] font-black tracking-widest uppercase transition-all duration-200 cursor-pointer"
                      >
                        ⬇ INSTALAR
                      </button>
                      {currentUser && entry.authorUid === currentUser.uid && (
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(entry)}
                          className="bg-red-950/60 border border-red-800/40 text-red-400 hover:bg-red-900 font-mono py-1.5 px-3 text-[9px] font-black tracking-widest uppercase transition-all duration-200 cursor-pointer"
                        >
                          BORRAR
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
