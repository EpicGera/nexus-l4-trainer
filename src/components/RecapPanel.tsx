import React, { useMemo, useState } from "react";
import { Download, FileText, X } from "lucide-react";
import { loadSessions } from "../lib/sessionStore";
import { computeWeekRecap, computeMonthRecap } from "../lib/recap";
import { exportRecapPng, exportRecapPdf } from "../lib/recapExport";

interface Props {
  variant: "week" | "month";
  week: string; // "w1".."w4" (para el recap semanal)
  onClose?: () => void;
}

const MODAL_LABEL: Record<string, string> = { M: "CARDIO", G: "GIMNASIA", W: "PESAS" };

/** Recap del pizarrón (domingos): resumen de la semana o del mes, exportable. */
export default function RecapPanel({ variant, week, onClose }: Props) {
  const [busy, setBusy] = useState(false);
  const data = useMemo(() => {
    const sessions = loadSessions();
    return variant === "month"
      ? { month: computeMonthRecap(sessions) }
      : { wk: computeWeekRecap(sessions, week) };
  }, [variant, week]);

  const nodeId = "nexus-recap-node";
  const stamp = new Date().toISOString().slice(0, 10);
  const fnameBase = variant === "month" ? `Nexus_Recap_Mes_${stamp}` : `Nexus_Recap_${week.toUpperCase()}_${stamp}`;

  const run = async (fn: (id: string, f: string) => Promise<void>, ext: string) => {
    setBusy(true);
    try { await fn(nodeId, `${fnameBase}.${ext}`); } finally { setBusy(false); }
  };

  const Stat = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="border border-[#3F3F46] p-3 text-center">
      <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-2xl font-brutalist font-black text-white tabular-nums leading-none">{value}</div>
    </div>
  );
  const ModalBar = ({ m, pct }: { m: string; pct: number }) => (
    <div className="mb-1.5 last:mb-0">
      <div className="flex justify-between text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-0.5">
        <span>{MODAL_LABEL[m]}</span><span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-[#18181B]"><div className="h-full bg-white" style={{ width: `${pct}%` }} /></div>
    </div>
  );

  return (
    <div className="w-full border border-[#3F3F46] bg-[#0A0A0A] rounded-none mb-6 relative">
      {onClose && (
        <button onClick={onClose} className="absolute top-2 right-2 text-neutral-500 hover:text-white p-1 cursor-pointer z-10" title="Cerrar recap">
          <X size={16} />
        </button>
      )}

      {/* Nodo exportable */}
      <div id={nodeId} className="p-6 bg-[#0A0A0A]">
        <div className="border-b border-[#3F3F46] pb-3 mb-4">
          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.3em]">NEXUS L4 · RESUMEN</div>
          <h2 className="text-3xl font-brutalist font-black text-white tracking-tight uppercase leading-none mt-1">
            {variant === "month" ? "RECAP DEL MES" : `RECAP · SEMANA ${data.wk!.weekNumber}`}
          </h2>
        </div>

        {variant === "week" && data.wk && (
          <>
            <p className="text-[12px] font-mono text-neutral-300 leading-relaxed mb-4">{data.wk.headline}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              <Stat label="Sesiones" value={data.wk.sessions} />
              <Stat label="Tonelaje" value={<>{data.wk.tonnageKg.toLocaleString("es-ES")}<span className="text-[10px] text-neutral-500 ml-1">kg</span></>} />
              <Stat label="Trabajo" value={<>{data.wk.workKJ}<span className="text-[10px] text-neutral-500 ml-1">kJ</span></>} />
              <Stat label="RPE prom" value={data.wk.avgRpe ?? "—"} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <div className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-2">Balance modal</div>
                {(["M", "G", "W"] as const).map((m) => <ModalBar key={m} m={m} pct={data.wk!.modalBalance[m]} />)}
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-2">Movimientos top</div>
                {data.wk.topMovements.length ? data.wk.topMovements.map((mv) => (
                  <div key={mv.name} className="flex justify-between text-[11px] font-mono text-neutral-300 mb-1">
                    <span className="truncate pr-2">{mv.name}</span>
                    <span className="text-white shrink-0">{mv.tonnageKg > 0 ? `${mv.tonnageKg.toLocaleString("es-ES")} kg` : `${mv.reps} reps`}</span>
                  </div>
                )) : <div className="text-[11px] font-mono text-neutral-600">Sin registros</div>}
              </div>
            </div>
            {data.wk.marks.length > 0 && (
              <div className="mt-5 pt-3 border-t border-[#3F3F46]">
                <div className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-2">Mejores marcas (e1RM estimado)</div>
                <div className="flex flex-wrap gap-2">
                  {data.wk.marks.map((mk) => (
                    <span key={mk.name} className="text-[11px] font-mono border border-white/20 px-2 py-1 text-white">{mk.name} <span className="text-neutral-400">{mk.e1rmKg}kg</span></span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {variant === "month" && data.month && (
          <>
            <p className="text-[12px] font-mono text-neutral-300 leading-relaxed mb-4">{data.month.headline}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              <Stat label="Sesiones" value={data.month.totalSessions} />
              <Stat label="Tonelaje" value={<>{data.month.totalTonnageKg.toLocaleString("es-ES")}<span className="text-[10px] text-neutral-500 ml-1">kg</span></>} />
              <Stat label="Trabajo" value={<>{data.month.totalWorkKJ}<span className="text-[10px] text-neutral-500 ml-1">kJ</span></>} />
              <Stat label="RPE prom" value={data.month.avgRpe ?? "—"} />
            </div>
            {/* Evolución semanal: barras de tonelaje + RPE */}
            <div className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-2">Evolución semanal (tonelaje)</div>
            <div className="space-y-1.5 mb-5">
              {(() => { const max = Math.max(1, ...data.month!.weeks.map((w) => w.tonnageKg)); return data.month!.weeks.map((w) => (
                <div key={w.week}>
                  <div className="flex justify-between text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-0.5">
                    <span>SEM {w.weekNumber}{w.weekNumber === 4 ? " · descarga" : ""}</span>
                    <span>{w.tonnageKg.toLocaleString("es-ES")} kg{w.avgRpe != null ? ` · RPE ${w.avgRpe}` : ""}</span>
                  </div>
                  <div className="h-2 bg-[#18181B]"><div className={`h-full ${w.weekNumber === 4 ? "bg-signal-red" : "bg-white"}`} style={{ width: `${(w.tonnageKg / max) * 100}%` }} /></div>
                </div>
              )); })()}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <div className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-2">Balance modal del mes</div>
                {(["M", "G", "W"] as const).map((m) => <ModalBar key={m} m={m} pct={data.month!.modalBalance[m]} />)}
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-2">Mejores marcas del mes</div>
                {data.month.marks.length ? data.month.marks.map((mk) => (
                  <div key={mk.name} className="flex justify-between text-[11px] font-mono text-neutral-300 mb-1">
                    <span className="truncate pr-2">{mk.name}</span><span className="text-white shrink-0">{mk.e1rmKg}kg</span>
                  </div>
                )) : <div className="text-[11px] font-mono text-neutral-600">Sin marcas</div>}
              </div>
            </div>
          </>
        )}

        <div className="mt-5 pt-3 border-t border-[#3F3F46] text-[9px] font-mono text-neutral-600 uppercase tracking-widest text-center">
          Resumen del pizarrón · el detalle completo vive en RPE & METAS
        </div>
      </div>

      {/* Acciones (fuera del nodo exportado) */}
      <div className="flex gap-2 p-4 pt-0">
        <button onClick={() => run(exportRecapPng, "png")} disabled={busy}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-white/20 text-white font-brutalist text-[11px] tracking-widest uppercase hover:bg-white hover:text-black transition-all cursor-pointer disabled:opacity-40">
          <Download size={14} /> PNG
        </button>
        <button onClick={() => run(exportRecapPdf, "pdf")} disabled={busy}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-white/20 text-white font-brutalist text-[11px] tracking-widest uppercase hover:bg-white hover:text-black transition-all cursor-pointer disabled:opacity-40">
          <FileText size={14} /> PDF
        </button>
      </div>
    </div>
  );
}
