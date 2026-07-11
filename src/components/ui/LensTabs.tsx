import React from "react";

interface LensTabsProps {
  tabs: { key: string; label: string }[];
  active: string;
  onChange: (key: string) => void;
  /** Hex accent for the active segment (defaults to electric-blue). */
  accent?: string;
  className?: string;
}

/**
 * Color de texto legible sobre un fondo hex: negro si el fondo es claro, blanco
 * si es oscuro (luminancia relativa WCAG). Evita el blanco-sobre-blanco cuando el
 * acento es claro (paleta "Blanco"/"Hielo" o el casi-blanco de la semana). Si el
 * acento no es un hex parseable (p.ej. `var(--...)`), asume oscuro → texto blanco.
 */
function readableTextOn(bg?: string): string {
  // Sin hex parseable (p.ej. el default `var(--color-sem-red)` #ff453a, lum≈0.27):
  // negro contrasta mejor que blanco para todo lum>0.18, así que el fallback es negro.
  if (!bg) return "#0b0b0e";
  const m = /^#?([0-9a-f]{6})$/i.exec(bg.trim());
  if (!m) return "#0b0b0e";
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  // Cruce WCAG donde el negro empieza a ganarle al blanco ≈ 0.18.
  return lum > 0.18 ? "#0b0b0e" : "#fff";
}

/**
 * One segmented control per sheet to switch between focused "lenses". Keeps each
 * view to a single intent instead of an endless analytics scroll — only the
 * active lens renders. Do not nest these; one per tab (see plan: "sin abuso de
 * creación de segmentos").
 */
export default function LensTabs({
  tabs,
  active,
  onChange,
  accent,
  className = "",
}: LensTabsProps) {
  return (
    <div
      role="tablist"
      className={`grid gap-1 bg-[color:var(--color-card)] p-1 rounded-[var(--radius-card)] shadow-[var(--shadow-card)] ${className}`}
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
      {tabs.map((t) => {
        const sel = t.key === active;
        // El acento por defecto es el rojo señal; una hoja puede pasar otro (p.ej.
        // el acento de la semana) y respetamos ese override.
        const activeBg = accent || "var(--color-sem-red)";
        return (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={sel}
            onClick={() => onChange(t.key)}
            className={`py-2.5 px-1 text-[11px] font-mono font-black tracking-widest uppercase rounded-[var(--radius-tile)] transition-all cursor-pointer ${
              sel
                ? "shadow-[0_6px_18px_-4px_rgba(0,0,0,.45)]"
                : "text-[color:var(--color-label)] hover:text-white hover:bg-[color:var(--color-card-2)]"
            }`}
            // El texto del segmento activo contrasta con el acento (negro sobre
            // acento claro, blanco sobre oscuro) — nunca blanco-sobre-blanco.
            style={sel ? { backgroundColor: activeBg, color: readableTextOn(accent) } : undefined}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
