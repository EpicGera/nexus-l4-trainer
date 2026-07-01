import { useMemo, useState } from "react";
import { Gauge } from "lucide-react";
import { puntajeNexus } from "../../lib/nexusScore";
import { proposeAdjustments, Adjustment } from "../../lib/autoregulate";
import { evaluateAthlete } from "../../lib/chapterCreator";
import { getWmAdjustFactor, setWmAdjustFactor, setOneRepMax } from "../../lib/workingMax";
import { emitToast } from "../../lib/exportService";
import { SectionCard, StatBox, Pill, NexusButton, EmptyState, TXT } from "../ui/primitives";

const PERF_TONE: Record<string, "good" | "neutral" | "warn" | "danger"> = {
  bajo: "good", banda: "neutral", sobre: "warn", arraso: "good", completo: "neutral", dnf: "danger",
};
const PERF_ES: Record<string, string> = {
  bajo: "fácil", banda: "en banda", sobre: "duro", arraso: "arrasó", completo: "completó", dnf: "DNF",
};

/**
 * Puntaje Nexus + autorregulación asistida. Mide el rendimiento real de la
 * semana vs la prescripción y propone ajustar el Working Max de la próxima — el
 * atleta confirma (nunca automático). Vive en la lente "Intensidad".
 */
export default function AutoregulationSection({ currentWeek }: { currentWeek: string }) {
  const [refresh, setRefresh] = useState(0);
  const { score, result } = useMemo(() => {
    const sc = puntajeNexus(currentWeek);
    const evalA = evaluateAthlete();
    return { score: sc, result: proposeAdjustments(sc, { acwr: evalA.acwr }) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeek, refresh]);

  const actionable = result.adjustments.filter((a) => a.deltaPct !== 0 || a.kind === "pr-bump");

  const applyAll = () => {
    let n = 0;
    for (const a of actionable) {
      if (a.kind === "pr-bump" && a.newOneRmKg) {
        setOneRepMax(a.exerciseId, a.newOneRmKg);
        n++;
      } else if (a.kind === "wm-up" || a.kind === "wm-down") {
        const cur = getWmAdjustFactor(a.exerciseId);
        setWmAdjustFactor(a.exerciseId, cur * (1 + a.deltaPct / 100));
        n++;
      }
    }
    emitToast(`✅ ${n} ajuste(s) aplicado(s). Las cargas % WM de la próxima semana ya los reflejan.`, "success", 7000);
    setRefresh((r) => r + 1);
  };

  return (
    <SectionCard
      title="MOTOR DE AUTORREGULACIÓN (PUNTAJE NEXUS)"
      icon={<Gauge size={15} className="text-cyan-300" />}
      subtitle="Tu rendimiento real vs lo prescrito esta semana, y el ajuste sugerido para la próxima"
      badge={score.hasData ? <Pill tone={score.score >= 65 ? "good" : score.score < 40 ? "danger" : "neutral"}>{score.score}/100</Pill> : <Pill tone="neutral">SIN DATOS</Pill>}
    >
      {!score.hasData ? (
        <EmptyState
          message="Sin registros de esta semana"
          hint="Registrá tus sesiones con INCURSIÓN: el motor compara tu RPE real con la banda objetivo y tu resultado de metcon con el timecap, y propone subir o bajar la carga."
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatBox label="Puntaje" value={score.score} unit="/100" tone={score.score >= 65 ? "good" : score.score < 40 ? "danger" : "neutral"} />
            <StatBox label="Sesiones" value={score.sessions} />
            <StatBox label="RPE máx" value={score.maxRpe || "—"} tone={score.maxRpe >= 9.5 ? "danger" : "neutral"} />
          </div>
          <p className="text-[11px] font-mono text-neutral-300">{score.status}.</p>

          {(score.lifts.length > 0 || score.metcons.length > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {score.lifts.map((l) => (
                <Pill key={l.exerciseId} tone={PERF_TONE[l.perf]}>
                  {l.name}: RPE {l.avgRpe} · {PERF_ES[l.perf]}
                </Pill>
              ))}
              {score.metcons.map((m, i) => (
                <Pill key={`m${i}`} tone={PERF_TONE[m.perf]}>
                  Metcon {m.format}: {PERF_ES[m.perf]}
                </Pill>
              ))}
            </div>
          )}

          {result.vetoed && (
            <p className="text-[10px] font-mono text-amber-400 border-l-2 border-amber-500/50 pl-2 leading-relaxed">
              ⚠ Subidas de carga VETADAS: {result.vetoReason}. Solo se permiten holds / bajadas (veto salud &gt; rendimiento).
            </p>
          )}

          {actionable.length > 0 ? (
            <div className="space-y-2">
              <div className={TXT.label}>Ajustes propuestos para la próxima semana</div>
              <ul className="space-y-1.5">
                {actionable.map((a, i) => (
                  <li key={i} className="text-[11px] font-mono text-neutral-300 flex items-start gap-2">
                    <AdjustTag a={a} />
                    <span className="flex-1 leading-snug">{a.reason}</span>
                  </li>
                ))}
              </ul>
              <NexusButton variant="primary" className="w-full" onClick={applyAll}>
                ⚙ Aplicar {actionable.length} ajuste(s)
              </NexusButton>
            </div>
          ) : (
            <p className="text-[10px] font-mono text-neutral-500">
              Sin ajustes: estás en la dosis prescrita. Mantené la carga.
            </p>
          )}
        </div>
      )}
    </SectionCard>
  );
}

function AdjustTag({ a }: { a: Adjustment }) {
  const tone = a.kind === "wm-up" ? "good" : a.kind === "wm-down" ? "warn" : "accent";
  const label = a.kind === "pr-bump" ? `PR ${a.newOneRmKg}kg` : `${a.deltaPct > 0 ? "+" : ""}${a.deltaPct}% WM`;
  return <Pill tone={tone}>{label}</Pill>;
}
