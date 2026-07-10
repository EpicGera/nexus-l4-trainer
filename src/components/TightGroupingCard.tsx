import React, { useState } from "react";
import { SectionCard, Field } from "./ui/primitives";
import { parseSplits, tightGrouping, fmtSec, GROUPING_META } from "../lib/tightGrouping";

// Agrupación estricta (cap. 43): herramienta de coach para auditar el pacing de
// un metcon de intervalos. El atleta pega los tiempos por ronda y ve la calidad.
export default function TightGroupingCard() {
  const [raw, setRaw] = useState("");
  const splits = parseSplits(raw);
  const result = tightGrouping(splits);
  const meta = result ? GROUPING_META[result.verdict] : null;

  return (
    <SectionCard title="Agrupación estricta" subtitle="Pacing de intervalos: la desviación entre rondas (cap. 43)">
      <Field label="Tiempos por ronda (ej: 1:52 1:54 1:53)">
        <input
          type="text"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="1:52, 1:54, 1:53, 1:55"
          className="w-full bg-black/60 border border-[#3F3F46] rounded-sm h-[38px] px-3 text-white font-mono text-sm focus:outline-none focus:border-electric-blue"
        />
      </Field>

      {result && meta ? (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="rounded-sm border border-[#3F3F46] bg-black/40 p-2 text-center">
              <div className="text-[9px] font-mono uppercase text-neutral-400">Rondas</div>
              <div className="text-base font-brutalist text-white">{result.count}</div>
            </div>
            <div className="rounded-sm border border-[#3F3F46] bg-black/40 p-2 text-center">
              <div className="text-[9px] font-mono uppercase text-neutral-400">Media</div>
              <div className="text-base font-brutalist text-white">{fmtSec(result.meanSec)}</div>
            </div>
            <div className="rounded-sm border border-[#3F3F46] bg-black/40 p-2 text-center">
              <div className="text-[9px] font-mono uppercase text-neutral-400">Spread</div>
              <div className="text-base font-brutalist text-white">{fmtSec(result.spreadSec)}</div>
            </div>
            <div className="rounded-sm border p-2 text-center" style={{ borderColor: `${meta.color}55` }}>
              <div className="text-[9px] font-mono uppercase text-neutral-400">CV</div>
              <div className="text-base font-brutalist" style={{ color: meta.color }}>{result.cvPct}%</div>
            </div>
          </div>

          {/* per-round bars relative to mean */}
          <div className="space-y-1">
            {splits.map((s, i) => {
              const rel = result.meanSec > 0 ? s / (result.slowestSec || 1) : 0;
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-neutral-500 w-6 shrink-0">R{i + 1}</span>
                  <div className="flex-1 h-2 rounded-sm bg-[#18181B] overflow-hidden">
                    <div className="h-full rounded-sm" style={{ width: `${rel * 100}%`, backgroundColor: meta.color, opacity: 0.8 }} />
                  </div>
                  <span className="text-[9px] font-mono text-neutral-400 w-10 text-right shrink-0">{fmtSec(s)}</span>
                </div>
              );
            })}
          </div>

          <div className="rounded-sm border px-3 py-2" style={{ borderColor: `${meta.color}55`, backgroundColor: `${meta.color}0d` }}>
            <span className="text-[11px] font-mono font-black uppercase tracking-wider" style={{ color: meta.color }}>
              {meta.label}
            </span>
            <p className="text-[10px] font-mono text-neutral-400 mt-0.5">{meta.hint}</p>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-[10px] font-mono text-neutral-500 uppercase">
          Pegá al menos 2 tiempos para ver la dispersión y el veredicto de pacing.
        </p>
      )}
    </SectionCard>
  );
}
