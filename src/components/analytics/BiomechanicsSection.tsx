import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from "recharts";
import { Sparkles } from "lucide-react";
import { CHART, radarProps } from "../../lib/chartTheme";

interface BiomechanicsSectionProps {
  activeDay: any;
  currentVariationIndex: number;
}

export default function BiomechanicsSection({
  activeDay,
  currentVariationIndex,
}: BiomechanicsSectionProps) {
  if (!activeDay) return null;

  // Get active variation (today's workout schedule)
  const activeVar = activeDay.variations[currentVariationIndex] || activeDay.variations[0];
  if (!activeVar) return null;

  // Build the lists of today's exercises
  const exercisesList: { originalName: string; cleanName: string; category: string }[] = [];

  // Grab items
  if (activeVar.strength?.items) {
    activeVar.strength.items.forEach((item: string) => {
      exercisesList.push({
        originalName: item,
        cleanName: item.replace(/<[^>]*>/g, "").trim(),
        category: "Fuerza",
      });
    });
  }
  if (activeVar.metcon?.items) {
    activeVar.metcon.items.forEach((item: string) => {
      exercisesList.push({
        originalName: item,
        cleanName: item.replace(/<[^>]*>/g, "").trim(),
        category: "Metcon",
      });
    });
  }
  if (activeVar.accessories?.items) {
    activeVar.accessories.items.forEach((item: string) => {
      exercisesList.push({
        originalName: item,
        cleanName: item.replace(/<[^>]*>/g, "").trim(),
        category: "Accesorios",
      });
    });
  }

  // Default static biomechanics vectors mappings that match PRVN methodology
  const mapping: { [key: string]: { knee?: number; hip?: number; pull?: number; push?: number; core?: number } } = {
    SQUAT: { knee: 8, hip: 3, core: 5 },
    SENTADILLA: { knee: 8, hip: 3, core: 5 },
    CLEAN: { knee: 6, hip: 9, pull: 7, push: 2, core: 7 },
    SNATCH: { knee: 5, hip: 9, pull: 8, push: 4, core: 8 },
    DEADLIFT: { knee: 1, hip: 9, pull: 7, core: 8 },
    PESO: { knee: 1, hip: 9, pull: 7, core: 8 },
    PULL: { pull: 8, core: 3 },
    DOMINADA: { pull: 8, core: 3 },
    PRESS: { push: 9, core: 6 },
    JERK: { knee: 4, hip: 4, push: 9, core: 8 },
    THRUSTER: { knee: 7, hip: 5, push: 8, core: 8 },
    RUN: { knee: 5, hip: 4, core: 3 },
    ROW: { knee: 4, hip: 6, pull: 5, core: 4 },
    REM: { knee: 4, hip: 6, pull: 5, core: 4 },
    BIKE: { knee: 7, core: 2 },
    ECHO: { knee: 7, push: 4, pull: 4, core: 3 },
    BURPEE: { knee: 4, hip: 4, push: 5, core: 4 },
    DOUBLE: { knee: 3, core: 3 },
    DU: { knee: 3, core: 3 },
    LUNGE: { knee: 8, hip: 5, core: 5 },
    ESTOCADA: { knee: 8, hip: 5, core: 5 },
    CRUNCH: { core: 9 },
    ABS: { core: 9 },
  };

  let kneeSum = 0, kneeCnt = 0;
  let hipSum = 0, hipCnt = 0;
  let pullSum = 0, pullCnt = 0;
  let pushSum = 0, pushCnt = 0;
  let coreSum = 0, coreCnt = 0;

  exercisesList.forEach((ex) => {
    const up = ex.cleanName.toUpperCase();
    let matched = false;

    Object.keys(mapping).forEach((key) => {
      if (up.includes(key)) {
        matched = true;
        const val = mapping[key];
        if (val.knee) { kneeSum += val.knee; kneeCnt++; }
        if (val.hip) { hipSum += val.hip; hipCnt++; }
        if (val.pull) { pullSum += val.pull; pullCnt++; }
        if (val.push) { pushSum += val.push; pushCnt++; }
        if (val.core) { coreSum += val.core; coreCnt++; }
      }
    });

    // Simple category baseline defaults if not explicitly matched
    if (!matched) {
      if (ex.category === "Fuerza") {
        kneeSum += 5; kneeCnt++;
        hipSum += 5; hipCnt++;
        pullSum += 4; pullCnt++;
        coreSum += 4; coreCnt++;
      } else if (ex.category === "Metcon") {
        kneeSum += 3; kneeCnt++;
        hipSum += 3; hipCnt++;
        coreSum += 5; coreCnt++;
      } else {
        coreSum += 4; coreCnt++;
      }
    }
  });

  const kneeFinal = kneeCnt > 0 ? (kneeSum / kneeCnt) : 1.5;
  const hipFinal = hipCnt > 0 ? (hipSum / hipCnt) : 1.5;
  const pullFinal = pullCnt > 0 ? (pullSum / pullCnt) : 1.5;
  const pushFinal = pushCnt > 0 ? (pushSum / pushCnt) : 1.5;
  const coreFinal = coreCnt > 0 ? (coreSum / coreCnt) : 1.5;

  const radarData = [
    { subject: "VÍAS RODILLAS (FLEX/EXT)", A: Number(kneeFinal.toFixed(1)), fullMark: 10 },
    { subject: "BISAGRA CADERA (CADENA POST)", A: Number(hipFinal.toFixed(1)), fullMark: 10 },
    { subject: "TRACCIÓN (PULL EN LATS)", A: Number(pullFinal.toFixed(1)), fullMark: 10 },
    { subject: "EMPUJE (PRESS/JERK)", A: Number(pushFinal.toFixed(1)), fullMark: 10 },
    { subject: "MIDLINE / ANTIESTÁTICO CORE", A: Number(coreFinal.toFixed(1)), fullMark: 10 },
  ];

  // Find biomechanics recommendation
  let diagnostic = "Ejes distribuidos de manera proporcional.";
  let urgentAlert = "";

  if (kneeFinal > 6.5) {
    diagnostic = "ALTA CARGA EN CUÁDRICEPS: Prioriza cuidar torque en rodillas. Evita acumular estocadas cruzadas.";
  } else if (hipFinal > 6.5) {
    diagnostic = "TENSIÓN SEVERA EN CADENA POSTERIOR: Flexores de cadera y lumbares exigidos. Estira el psoas ilíaco.";
  } else if (coreFinal > 6.5) {
    diagnostic = "SOBRECARGA DEL CORE CENTRAL: Alta tensión intraabdominal por compuestos. Excelente transmisión de fuerza.";
  }

  if (exercisesList.some(e => e.cleanName.toUpperCase().includes("SIT-UP") || e.cleanName.toUpperCase().includes("L-SIT"))) {
    urgentAlert = "⚠️ DETECTADO ACTIVACIÓN FORZADA DEL PSOAS (SIT-UPS/L-SITS). ¡RECOMIENDA SUSTITUIR POR CRUNCH RECTO O PLANK ANTIESTÁTICA!";
  }

  return (
    <section className="p-5 border bg-[var(--color-surface-1)] border-[var(--color-line)] rounded-sm flex flex-col text-left space-y-4 shadow-sm">
      <h3 className="text-xs font-mono font-bold text-[var(--color-ink)] uppercase tracking-widest flex items-center gap-2 border-b border-[var(--color-line)] pb-2">
        <Sparkles size={14} className="text-[var(--color-ink-muted)]" />
        DIAGNÓSTICO BIOMECÁNICO DEL DÍA (MAP DE VECTORES)
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
        <div className="lg:col-span-3 h-[255px] bg-[var(--color-surface-0)] border border-[var(--color-line)] rounded-xs p-2 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke={CHART.grid} />
              <PolarAngleAxis
                dataKey="subject"
                stroke={CHART.axis}
                tick={{ fill: CHART.tick.fill, fontSize: 11, fontFamily: "monospace" }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 10]}
                stroke={CHART.grid}
                tick={{ fill: CHART.tick.fill, fontSize: 9 }}
              />
              <Radar
                 name="Dosis de Torque"
                 dataKey="A"
                 {...radarProps}
              />
              <Tooltip contentStyle={CHART.tooltip} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 space-y-3 font-mono text-[11px]">
          <div className="bg-[var(--color-surface-2)] border border-[var(--color-line)] p-3 rounded space-y-1">
            <span className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest leading-none block">
              ANÁLISIS DE INTERFERENCIAS (VÍAS NEURONALES)
            </span>
            <p className="text-[var(--color-ink-muted)] leading-normal">
              {diagnostic}
            </p>
            {urgentAlert && (
              <div className="bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/40 p-2.5 rounded-sm text-[var(--color-accent-soft)] text-[10px] font-black uppercase mt-2.5 leading-normal">
                {urgentAlert}
              </div>
            )}
          </div>
          <div className="space-y-1 bg-[var(--color-surface-0)] p-2.5 border border-[var(--color-line)] rounded">
            <h4 className="font-extrabold text-[var(--color-ink-muted)] text-[10px] uppercase tracking-wider">
              EJERCICIOS CAPTURADOS EN EL MAPEO:
            </h4>
            {exercisesList.length === 0 ? (
              <div className="text-[var(--color-ink-faint)] italic">Ningún ejercicio parseado hoy.</div>
            ) : (
              <ul className="list-disc list-inside space-y-0.5 text-[var(--color-ink-muted)]">
                {exercisesList.map((e, idx) => (
                  <li key={idx}>
                    <span className="text-[var(--color-ink)]">{e.cleanName}</span> ({e.category})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
