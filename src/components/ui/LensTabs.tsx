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
      className={`grid gap-1 bg-black/70 p-1 border border-white/10 rounded-sm ${className}`}
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
      {tabs.map((t) => {
        const sel = t.key === active;
        return (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={sel}
            onClick={() => onChange(t.key)}
            className={`py-2.5 px-1 text-[11px] font-mono font-black tracking-widest uppercase rounded-sm transition-all cursor-pointer ${
              sel
                ? "text-black shadow-lg"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
            style={sel ? { backgroundColor: accent || "#1F51FF" } : undefined}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
