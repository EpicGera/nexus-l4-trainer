// FILE_PATH: src/components/EnrichmentToggle.tsx
// ACTION: CREATE
// DESCRIPTION: Reusable enrichment toggle (Light/Enriched) with visual depth
//   indicator and animated segmented control. Persists to localStorage.
// ---------------------------------------------------------

import React, { useState, useEffect } from "react";

interface EnrichmentToggleProps {
  value: boolean;
  onChange: (enriched: boolean) => void;
  compact?: boolean;
}

const LS_KEY = "nexus_enriched_mode";

export default function EnrichmentToggle({ value, onChange, compact = false }: EnrichmentToggleProps) {
  const handleToggle = (enriched: boolean) => {
    onChange(enriched);
    localStorage.setItem(LS_KEY, String(enriched));
  };

  const barCount = value ? 3 : 1;

  return (
    <div className={`${compact ? "" : "bg-black/30 border border-white/10 rounded-sm p-3"}`}>
      {/* Segmented control */}
      <div
        className="relative flex rounded-sm overflow-hidden border border-white/10"
        style={{ height: compact ? 28 : 34 }}
      >
        {/* Sliding highlight */}
        <div
          className="absolute top-0 bottom-0 rounded-sm transition-all duration-200 ease-out"
          style={{
            width: "50%",
            left: value ? "50%" : "0%",
            background: value
              ? "linear-gradient(135deg, rgba(59,130,246,0.35), rgba(139,92,246,0.25))"
              : "rgba(255,255,255,0.08)",
            borderRight: value ? "none" : "1px solid rgba(255,255,255,0.06)",
            borderLeft: value ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}
        />
        {/* Light button */}
        <button
          type="button"
          onClick={() => handleToggle(false)}
          className={`relative z-10 flex-1 flex items-center justify-center gap-1 font-mono uppercase tracking-wider transition-colors duration-200 border-0 bg-transparent cursor-pointer ${
            compact ? "text-[8px]" : "text-[10px]"
          } ${!value ? "text-white font-bold" : "text-neutral-500"}`}
        >
          ⚡ Ligero
        </button>
        {/* Enriched button */}
        <button
          type="button"
          onClick={() => handleToggle(true)}
          className={`relative z-10 flex-1 flex items-center justify-center gap-1 font-mono uppercase tracking-wider transition-colors duration-200 border-0 bg-transparent cursor-pointer ${
            compact ? "text-[8px]" : "text-[10px]"
          } ${value ? "text-blue-300 font-bold" : "text-neutral-500"}`}
        >
          🧬 Enriquecido
        </button>
      </div>

      {/* Depth indicator + description (hidden in compact mode) */}
      {!compact && (
        <div className="mt-2.5 flex items-start gap-3">
          {/* Depth bars */}
          <div className="flex items-center gap-1 pt-0.5 shrink-0">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-sm transition-all duration-300 ease-out"
                style={{
                  width: 6,
                  height: 14,
                  background: i <= barCount
                    ? value
                      ? `rgba(59,130,246,${0.4 + i * 0.2})`
                      : "rgba(255,255,255,0.3)"
                    : "rgba(255,255,255,0.07)",
                  transform: i <= barCount ? "scaleY(1)" : "scaleY(0.6)",
                  transformOrigin: "bottom",
                }}
              />
            ))}
          </div>
          {/* Description text */}
          <p
            className="text-[10px] font-mono leading-relaxed transition-colors duration-200"
            style={{ color: value ? "rgb(147,197,253)" : "rgb(163,163,163)" }}
          >
            {value
              ? "Metodología profunda: árboles de decisión, protocolos de bloque, cues técnicos y psicología del atleta."
              : "Coaching L4 con las reglas generales. Rápido y eficiente."}
          </p>
        </div>
      )}
    </div>
  );
}
