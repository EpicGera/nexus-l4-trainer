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
                ? "text-white shadow-[0_6px_18px_-4px_rgba(255,69,58,.55)]"
                : "text-[color:var(--color-label)] hover:text-white hover:bg-[color:var(--color-card-2)]"
            }`}
            style={sel ? { backgroundColor: activeBg } : undefined}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
