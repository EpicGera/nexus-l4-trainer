import React, { useRef, useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, Download, Check, Power, Pencil, Trash2, Cloud, CloudOff, Loader2, Type, Upload } from "lucide-react";
import {
  listChapters, getActiveChapterId, getActiveChapter, switchToChapter, viewChapterProgram, updateChapterMeta, deleteChapter, ChapterMeta,
} from "../lib/chapterStore";
import { auth } from "../lib/firebase";
import { pushAllLocalToCloud } from "../lib/syncEngine";
import { toCanonicalProgram } from "../lib/canonicalProgram";
import { FONT_OPTIONS, fontFamilyFor } from "../lib/dayTheme";
import { setCustomFontFromFile } from "../lib/customFont";

const ADMIN_EMAIL = "iannace.g@gmail.com";

// Chapter library menu (Fase 0): the active chapter shows lit; inactive ones are
// dimmed but fully consultable (days/exercises read-only) and shareable. No data
// is ever destroyed — switching archives/restores per chapter. Chapters persist
// to Firestore automatically (syncEngine monkeypatches localStorage); the cloud
// button below forces an immediate backup, and the trash removes a chapter
// locally AND from the cloud.
export default function ChapterSwitcher() {
  const [, force] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [cloudState, setCloudState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const fontInputRef = useRef<HTMLInputElement>(null);
  const chapters = listChapters();
  const activeId = getActiveChapterId();
  const activeChapter = getActiveChapter();
  const user = auth.currentUser;
  const isAdmin = (user?.email || "").toLowerCase() === ADMIN_EMAIL;

  if (chapters.length === 0) return null;

  const onActivate = (id: string) => {
    if (switchToChapter(id)) force((v) => v + 1);
  };

  const onDelete = (c: ChapterMeta) => {
    if (c.id === activeId || chapters.length <= 1) return;
    const ok = window.confirm(
      `¿Eliminar el capítulo "${c.title}"?\n\nSe borra su programa y resultados de este dispositivo y de la nube. No se puede deshacer.`,
    );
    if (!ok) return;
    deleteChapter(c.id);
    if (expanded === c.id) setExpanded(null);
    force((v) => v + 1);
  };

  const onSetFont = (fontKey: string) => {
    if (!activeChapter) return;
    updateChapterMeta(activeChapter.id, { theme: { ...activeChapter.theme, fontKey } });
    force((v) => v + 1);
  };

  const onUploadFont = async (file: File | undefined) => {
    if (!file || !activeChapter) return;
    try {
      await setCustomFontFromFile(file);
      onSetFont("custom");
    } catch {
      window.alert("No se pudo cargar la fuente. Probá con un archivo .woff2 / .ttf / .otf.");
    }
  };

  const onCloudSave = async () => {
    if (!user || cloudState === "saving") return;
    setCloudState("saving");
    try {
      await pushAllLocalToCloud(user.uid);
      setCloudState("saved");
      setTimeout(() => setCloudState("idle"), 2500);
    } catch {
      setCloudState("error");
      setTimeout(() => setCloudState("idle"), 3500);
    }
  };

  const onRename = (c: ChapterMeta) => {
    const next = window.prompt("Renombrar capítulo:", c.title);
    if (next && next.trim() && next.trim() !== c.title) {
      updateChapterMeta(c.id, { title: next.trim().slice(0, 60) });
      force((v) => v + 1);
    }
  };

  const onShare = (c: ChapterMeta) => {
    const db = viewChapterProgram(c.id);
    if (!db) return;
    // Export the CANONICAL form (single blocks[], no legacy lanes) so other
    // frontends consume it unambiguously. Re-importable here too.
    const canonical = toCanonicalProgram(db, { title: c.title, lore: c.lore });
    const blob = new Blob([JSON.stringify(canonical, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Nexus_L4_${c.title.replace(/[^\w]+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-5 pt-4 border-t border-[#3F3F46] text-left space-y-3">
      <label className="text-[10px] font-mono font-black tracking-widest text-neutral-300 uppercase flex items-center gap-1.5">
        <BookOpen size={12} /> BIBLIOTECA DE CAPÍTULOS ({chapters.length})
      </label>
      <p className="text-[9px] font-mono text-neutral-500 uppercase leading-relaxed">
        El capítulo activo se muestra encendido. Los anteriores quedan guardados y consultables —
        nada se destruye al cargar uno nuevo.
      </p>

      {/* Cloud backup status + manual force-save */}
      <div className="flex items-center justify-between gap-2 border border-[#3F3F46] bg-white/[0.03] px-2.5 py-2 rounded-sm">
        <span className="flex items-center gap-1.5 text-[9px] font-mono text-neutral-400 min-w-0">
          {user ? (
            <>
              <Cloud size={12} className="text-emerald-400 shrink-0" />
              <span className="truncate">Se guardan en la nube automáticamente</span>
            </>
          ) : (
            <>
              <CloudOff size={12} className="text-amber-400 shrink-0" />
              <span className="truncate">Sin sesión — sólo en este dispositivo</span>
            </>
          )}
        </span>
        {user && (
          <button
            type="button"
            onClick={onCloudSave}
            disabled={cloudState === "saving"}
            title="Forzar guardado de todos los capítulos en la nube"
            className="shrink-0 flex items-center gap-1 text-[9px] font-mono font-black uppercase tracking-wider px-2 py-1 rounded-sm bg-[#27272A] text-neutral-200 hover:bg-white hover:text-black transition-all cursor-pointer disabled:opacity-60"
          >
            {cloudState === "saving" ? (
              <><Loader2 size={11} className="animate-spin" /> GUARDANDO</>
            ) : cloudState === "saved" ? (
              <><Check size={11} className="text-emerald-400" /> GUARDADO</>
            ) : cloudState === "error" ? (
              <>ERROR — REINTENTAR</>
            ) : (
              <><Cloud size={11} /> GUARDAR</>
            )}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {chapters.map((c) => {
          const isActive = c.id === activeId;
          const isOpen = expanded === c.id;
          const db = isOpen ? viewChapterProgram(c.id) : null;
          return (
            <div
              key={c.id}
              className={`border rounded-sm transition-all ${isActive ? "border-white/25 bg-white/[0.04]" : "border-[#3F3F46] bg-black/40 opacity-60 hover:opacity-100"}`}
            >
              <div className="flex items-center gap-2 p-2.5">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : c.id)}
                  className="text-neutral-400 hover:text-white cursor-pointer shrink-0"
                  title="Consultar"
                >
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-black text-white truncate">
                      {String(c.index).padStart(2, "0")} · {c.title}
                    </span>
                    {isActive && (
                      <span className="shrink-0 text-[8px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm" style={{ backgroundColor: `${c.theme.accent}22`, color: c.theme.accent }}>
                        EN CURSO
                      </span>
                    )}
                  </div>
                  {c.lore && <div className="text-[9px] font-mono text-neutral-500 truncate">{c.lore}</div>}
                </div>
                <button
                  type="button"
                  onClick={() => onRename(c)}
                  title="Renombrar capítulo"
                  className="shrink-0 p-1.5 text-neutral-400 hover:text-white cursor-pointer"
                >
                  <Pencil size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => onShare(c)}
                  title="Descargar / compartir (JSON)"
                  className="shrink-0 p-1.5 text-neutral-400 hover:text-white cursor-pointer"
                >
                  <Download size={13} />
                </button>
                {!isActive && chapters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDelete(c)}
                    title="Eliminar capítulo (local + nube)"
                    className="shrink-0 p-1.5 text-neutral-500 hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
                {isActive ? (
                  <span className="shrink-0 p-1.5 text-emerald-400" title="Activo"><Check size={14} /></span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onActivate(c.id)}
                    title="Activar este capítulo"
                    className="shrink-0 flex items-center gap-1 text-[9px] font-mono font-black uppercase tracking-wider px-2 py-1.5 rounded-sm bg-[#27272A] text-neutral-200 hover:bg-white hover:text-black transition-all cursor-pointer"
                  >
                    <Power size={11} /> ACTIVAR
                  </button>
                )}
              </div>

              {isOpen && db && (
                <div className="border-t border-white/5 px-3 py-2 space-y-1.5 max-h-56 overflow-y-auto">
                  {Object.keys(db)
                    .filter((k) => /^w\d+$/i.test(k))
                    .flatMap((wk) => db[wk].days.map((d) => ({ wk, d })))
                    .map(({ wk, d }) => {
                      const v = d.variations?.[0];
                      const blocks = v?.blocks?.length || 0;
                      const items = v
                        ? v.blocks?.length
                          ? v.blocks.reduce((s, b) => s + b.items.length, 0)
                          : (v.warmup?.items.length || 0) + (v.strength?.items.length || 0) + (v.metcon?.items.length || 0) + (v.accessories?.items.length || 0)
                        : 0;
                      return (
                        <div key={d.id} className="flex items-center justify-between gap-2 text-[10px] font-mono">
                          <span className="text-neutral-300 truncate">
                            <span className="text-neutral-600">{wk.toUpperCase()}·{d.name}</span> {d.title}
                          </span>
                          <span className="text-neutral-500 shrink-0">{blocks || "—"} bloq · {items} ej</span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Admin-only: title font picker for the active chapter (Fase 2) */}
      {isAdmin && activeChapter && (
        <div className="mt-4 pt-4 border-t border-[#3F3F46] space-y-2">
          <label className="text-[10px] font-mono font-black tracking-widest text-neutral-300 uppercase flex items-center gap-1.5">
            <Type size={12} /> TIPOGRAFÍA DEL TÍTULO · ADMIN
          </label>
          <p className="text-[9px] font-mono text-neutral-500 uppercase">
            Fuente del título del día para el capítulo activo. El generador siempre usa la estándar.
          </p>
          <select
            value={activeChapter.theme.fontKey || "default"}
            onChange={(e) => onSetFont(e.target.value)}
            className="w-full bg-black/50 border border-[#3F3F46] text-neutral-200 text-[11px] font-mono px-2 py-2 rounded-sm focus:outline-none focus:border-white/40 cursor-pointer"
          >
            {FONT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
          {/* live preview in the selected face */}
          <div
            className="border border-[#3F3F46] bg-black/40 px-3 py-3 text-center text-white text-2xl truncate"
            style={{ fontFamily: fontFamilyFor(activeChapter.theme.fontKey) || undefined }}
          >
            {activeChapter.title || "NEXUS L4"}
          </div>
          <input
            ref={fontInputRef}
            type="file"
            accept=".woff2,.woff,.ttf,.otf,font/*"
            className="hidden"
            onChange={(e) => { onUploadFont(e.target.files?.[0]); e.currentTarget.value = ""; }}
          />
          <button
            type="button"
            onClick={() => fontInputRef.current?.click()}
            title="Subir una fuente propia (.woff2 / .ttf / .otf) — se guarda solo en este dispositivo"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-mono font-black uppercase tracking-wider border border-[#3F3F46] bg-[#18181B] text-neutral-200 hover:bg-[#27272A] cursor-pointer rounded-sm"
          >
            <Upload size={12} /> Subir fuente (.woff2 / .ttf / .otf)
          </button>
        </div>
      )}
    </div>
  );
}
