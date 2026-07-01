import React, { useState } from "react";
import { SectionCard, Field, TXT } from "./ui/primitives";
import {
  CARDIO_MACHINES, MACHINE_LABEL, CardioMachine, convertDistance, distanceToBikeCal,
  SHUTTLE_NOTE, GYM_SUBSTITUTIONS,
} from "../lib/substitution";

// Matriz de sustitución L4 (cap. 45B): conversor aeróbico + referencia de gimnasia.
export default function SubstitutionCard() {
  const [meters, setMeters] = useState(400);
  const [from, setFrom] = useState<CardioMachine>("run");
  const others = CARDIO_MACHINES.filter((m) => m !== from);

  return (
    <SectionCard title="Matriz de sustitución" subtitle="Equivalencias aeróbicas y de gimnasia (Mayhem · cap. 45B)">
      <div className="flex flex-wrap items-end gap-3 mb-3">
        <Field label="Distancia (m)">
          <input
            type="number"
            min="0"
            step="50"
            value={meters}
            onChange={(e) => setMeters(parseFloat(e.target.value) || 0)}
            className="w-28 bg-black/60 border border-white/15 rounded-sm h-[38px] px-3 text-white font-mono text-sm focus:outline-none focus:border-electric-blue"
          />
        </Field>
        <Field label="En">
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value as CardioMachine)}
            className="bg-black/60 border border-white/15 rounded-sm h-[38px] px-3 text-white font-mono text-sm focus:outline-none focus:border-electric-blue"
          >
            {CARDIO_MACHINES.map((m) => (
              <option key={m} value={m}>{MACHINE_LABEL[m]}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {others.map((m) => (
          <div key={m} className="rounded-sm border border-white/10 bg-black/40 p-2 text-center">
            <div className="text-[9px] font-mono uppercase text-neutral-400">{MACHINE_LABEL[m]}</div>
            <div className="text-base font-brutalist text-white">
              {convertDistance(meters, from, m)}
              <span className="text-[9px] text-neutral-500"> m</span>
            </div>
          </div>
        ))}
        <div className="rounded-sm border border-amber-500/30 bg-amber-500/5 p-2 text-center">
          <div className="text-[9px] font-mono uppercase text-amber-400">Bike cal</div>
          <div className="text-base font-brutalist text-amber-300">
            {distanceToBikeCal(meters, from)}
            <span className="text-[9px] text-amber-500/70"> cal</span>
          </div>
        </div>
      </div>
      <p className="mt-2 text-[9px] font-mono text-neutral-500 uppercase">{SHUTTLE_NOTE}</p>

      <div className="mt-4 space-y-2">
        <div className={TXT.label}>Sustituciones de gimnasia</div>
        {GYM_SUBSTITUTIONS.map((g) => (
          <div key={g.movement} className="bg-black/40 border border-white/10 rounded-sm px-3 py-2">
            <div className="text-[11px] font-mono text-white font-bold">{g.movement}</div>
            <ul className="mt-1 space-y-0.5">
              {g.subs.map((s, i) => (
                <li key={i} className="text-[10px] font-mono text-neutral-400 flex gap-1.5">
                  <span className="text-electric-blue">→</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
