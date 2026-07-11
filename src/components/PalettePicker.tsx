import React, { useEffect, useRef, useState } from "react";
import { Palette, Check } from "lucide-react";
import { THEME_PALETTES, ChapterTheme } from "../lib/chapterStore";

interface PalettePickerProps {
  /** key del tema activo del capítulo (para marcar el seleccionado). */
  activeKey?: string;
  onSelect: (theme: ChapterTheme) => void;
}

/**
 * Selector de paleta de la programación mensual: 10 combinaciones de color
 * únicas. Un botón con swatch abre un popover con las opciones; elegir una
 * aplica el tema al capítulo activo (accent, banda y gradiente del título).
 */
export default function PalettePicker({ activeKey, onSelect }: PalettePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const active = THEME_PALETTES.find((t) => t.key === activeKey) ?? THEME_PALETTES[0];

  // Cerrar al hacer click afuera o con Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Elegir la paleta de color de tu programación"
        className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-tile)] bg-[color:var(--color-card)] text-[color:var(--color-ink-2)] hover:text-white shadow-[var(--shadow-card)] transition-all text-[11px] sm:text-xs font-brutalist tracking-wider font-extrabold uppercase cursor-pointer active:scale-95"
      >
        <Palette size={15} aria-hidden="true" />
        <span
          className="w-3.5 h-3.5 rounded-full shrink-0 ring-1 ring-white/20"
          style={{ background: active.accent }}
        />
        <span className="hidden sm:inline">{active.label ?? "Paleta"}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-[60] mt-2 w-60 p-2 rounded-[var(--radius-card)] bg-[color:var(--color-card)] shadow-[var(--shadow-card)] grid grid-cols-2 gap-1.5"
        >
          {THEME_PALETTES.map((t) => {
            const sel = t.key === active.key;
            return (
              <button
                key={t.key}
                role="menuitemradio"
                aria-checked={sel}
                type="button"
                onClick={() => {
                  onSelect(t);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-[var(--radius-tile)] transition-colors cursor-pointer text-left ${
                  sel
                    ? "bg-[color:var(--color-card-2)]"
                    : "hover:bg-[color:var(--color-card-2)]"
                }`}
              >
                <span
                  className="w-5 h-5 rounded-full shrink-0 ring-1 ring-white/20"
                  style={{ background: t.titleGradient }}
                />
                <span className="flex-1 min-w-0 truncate font-mono text-[11px] font-bold uppercase tracking-wide text-[color:var(--color-ink-2)]">
                  {t.label ?? t.key}
                </span>
                {sel && <Check size={13} className="shrink-0 text-[color:var(--color-sem-green)]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
