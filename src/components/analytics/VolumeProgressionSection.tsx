import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Area } from "recharts";
import { Zap, ShieldAlert, TrendingUp, FileText } from "lucide-react";
import { ACCENT_COLORS_MAP } from "../../lib/constants";

interface VolumeProgressionSectionProps {
  currentWeek: string;
  handleGenerateMonthlyReportPDF: () => void;
  getMonthlyVolumeStats: () => { totalLogsCount: number; totalVolume: number };
}

export default function VolumeProgressionSection({
  currentWeek,
  handleGenerateMonthlyReportPDF,
  getMonthlyVolumeStats,
}: VolumeProgressionSectionProps) {
  const plannedVolume = {
    w1: 4500,
    w2: 6800,
    w3: 8400,
    w4: 3800,
  };

  // Obtain real volume loaded per week
  const getWeeklyRealVolumes = () => {
    const realVolume = { w1: 0, w2: 0, w3: 0, w4: 0 };
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("nexus_logs_")) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const parts = key.split("_");
              const dayId = parts[2] || "";
              const wkKey = dayId.substring(0, 2);
              if (
                wkKey &&
                realVolume[wkKey as keyof typeof realVolume] !== undefined
              ) {
                parsed.forEach((log) => {
                  const wt = parseFloat(log.weight) || 0;
                  const rp = parseFloat(log.reps) || 0;
                  realVolume[wkKey as keyof typeof realVolume] += wt * rp;
                });
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Error reading volume for total progression chart:", err);
    }
    return realVolume;
  };

  const realVolume = getWeeklyRealVolumes();

  const chartData = [
    {
      week: "w1",
      name: "SEMANA 1",
      phase: "ACUMULACIÓN",
      planned: plannedVolume.w1,
      real: realVolume.w1 > 0 ? Math.round(realVolume.w1) : 0,
      desc: "Fase Inicial: Adaptación Neural de Volumen regular.",
      color: "#00F0FF",
      rpeTarget: "RPE 6-7",
    },
    {
      week: "w2",
      name: "SEMANA 2",
      phase: "INTENSIFICACIÓN",
      planned: plannedVolume.w2,
      real: realVolume.w2 > 0 ? Math.round(realVolume.w2) : 0,
      desc: "Mayor Torque: Rampa hacia intensities de alta velocidad.",
      color: "#BD00FF",
      rpeTarget: "RPE 7-8",
    },
    {
      week: "w3",
      name: "SEMANA 3",
      phase: "PICO (BOSS FIGHT)",
      planned: plannedVolume.w3,
      real: realVolume.w3 > 0 ? Math.round(realVolume.w3) : 0,
      desc: "Esfuerzo Terminal: Pico de sobrecarga neuromuscular.",
      color: "#FF007F",
      rpeTarget: "RPE 8-9",
    },
    {
      week: "w4",
      name: "SEMANA 4",
      phase: "DESCARGA (DELOAD)",
      planned: plannedVolume.w4,
      real: realVolume.w4 > 0 ? Math.round(realVolume.w4) : 0,
      desc: "Supercompensación: Regeneración de tejidos blandos y SNC.",
      color: "#FF5A00",
      rpeTarget: "RPE 5-6",
    },
  ];

  const totalPlanned =
    plannedVolume.w1 + plannedVolume.w2 + plannedVolume.w3 + plannedVolume.w4;
  const totalReal =
    realVolume.w1 + realVolume.w2 + realVolume.w3 + realVolume.w4;

  const isW4Overdoing = realVolume.w4 > plannedVolume.w4 * 1.15;

  const currentPhaseLabel =
    currentWeek === "w1"
      ? "ACUMULACIÓN INICIAL"
      : currentWeek === "w2"
        ? "INTENSIFICACIÓN"
        : currentWeek === "w3"
          ? "PICO DE ESFUERZO / ÁPEX"
          : currentWeek === "w4"
            ? "DESCARGA (DELOAD)"
            : "RUTINA FUERA DE CICLO";

  const stats = getMonthlyVolumeStats();

  let activeColor = "#1F51FF";
  const savedColorId = localStorage.getItem("nexus_custom_accent_color");
  if (savedColorId && ACCENT_COLORS_MAP[savedColorId]) {
    activeColor = ACCENT_COLORS_MAP[savedColorId].color;
  }

  // Calculate accumulated histories for diagnostic info
  const getWeeklyL4AuditStats = () => {
    const realWVolumes = [0, 0, 0, 0];
    const realWRpeSum = [0, 0, 0, 0];
    const realWRpeCount = [0, 0, 0, 0];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("nexus_logs_")) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              parsed.forEach((log: any) => {
                const wt =
                  parseFloat(
                    log.weight
                      ? log.weight.toString().replace(/[^0-9.]/g, "")
                      : "0"
                  ) || 0;
                const rp =
                  parseFloat(
                    log.reps
                      ? log.reps.toString().replace(/[^0-9.]/g, "")
                      : "0"
                  ) || 0;
                const rpe = parseFloat(log.rpe) || 0;

                const parts = key.split("_");
                const dayId = parts[2] || "";
                const wkKey = dayId.substring(0, 2);

                let idx = -1;
                if (wkKey === "w1") idx = 0;
                else if (wkKey === "w2") idx = 1;
                else if (wkKey === "w3") idx = 2;
                else if (wkKey === "w4") idx = 3;

                if (idx !== -1) {
                  realWVolumes[idx] += wt * rp;
                  if (rpe > 0) {
                    realWRpeSum[idx] += rpe;
                    realWRpeCount[idx]++;
                  }
                }
              });
            }
          }
        }
      }
    } catch {}

    const w1RpeAvg = realWRpeCount[0] > 0 ? realWRpeSum[0] / realWRpeCount[0] : 0;
    const w2RpeAvg = realWRpeCount[1] > 0 ? realWRpeSum[1] / realWRpeCount[1] : 0;
    const w3RpeAvg = realWRpeCount[2] > 0 ? realWRpeSum[2] / realWRpeCount[2] : 0;
    const w4RpeAvg = realWRpeCount[3] > 0 ? realWRpeSum[3] / realWRpeCount[3] : 0;

    let totalVolumeStr = (
      realWVolumes[0] +
      realWVolumes[1] +
      realWVolumes[2] +
      realWVolumes[3]
    ).toLocaleString("es-ES") + " kg";

    let stateFeedback = "PERFIL BIOMECÁNICO BALANCEADO SANO";
    let messageBody =
      "Tus datos volumétricos reflejan un incremento paulatino en la carga de trabajo. Te encuentras en un estado de supercompensación óptima.";

    if (w3RpeAvg > 8.5 && realWVolumes[2] > 11000) {
      stateFeedback = "ALERTA: VOLUMEN CRÍTICO REDUNDANTE";
      messageBody =
        "Tu tonelaje acumulado en la Semana 3 supera los límites biomecánicos recomendados por encima del 15% de desvío. Tus lumbares corren riesgo severo de torques nocivos.";
    }

    return { realWVolumes, w1RpeAvg, w2RpeAvg, w3RpeAvg, w4RpeAvg, totalVolumeStr, messageBody };
  };

  const { realWVolumes, w1RpeAvg, w2RpeAvg, w3RpeAvg, w4RpeAvg, totalVolumeStr, messageBody } = getWeeklyL4AuditStats();

  return (
    <div className="space-y-6">
      {/* REAL WEEKLY VOLUME VS PLANNED */}
      <section
        className="p-5 border bg-pure-black/40 backdrop-blur-xs transition-all duration-300 rounded-sm border-white/10 shadow-sm mt-6 text-left"
        id="totalVolumeChartSection"
      >
        <header className="px-4 py-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-zinc-900 border border-white/10 rounded-xs mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-[#00f0ff]" />
            <div>
              <h3 className="text-sm font-brutalist italic text-white uppercase tracking-wider leading-none">
                PROGRESO DEL VOLUMEN ACUMULADO SEMANAL
              </h3>
              <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest mt-1">
                // MONITOREO DEL TONELAJE (KG * REPS) • INTENSIFICACIÓN VS. DELOAD (CF-L4)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#00f0ff] font-extrabold border bg-[#00f0ff]/5 border-[#00f0ff]/10 px-2 py-0.5 rounded">
              FASE ACTUAL: {currentPhaseLabel}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
          <div className="lg:col-span-1 flex flex-col space-y-4">
            <div className="bg-zinc-950 p-4 border border-white/5 space-y-3 rounded text-left">
              <span className="text-[10px] font-mono tracking-widest text-neutral-400 font-bold uppercase block pb-1 border-b border-white/5">
                <img src="/logo.svg" className="w-3 h-3 object-contain inline-block align-middle mr-1" alt="" /> TONELAJE ADQUIRIDO
              </span>
              <div className="space-y-2">
                <div>
                  <div className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest leading-none">
                    PLANI_VOLUME_TOTAL
                  </div>
                  <div className="text-xl font-black font-brutalist text-white tracking-widest">
                    {totalPlanned.toLocaleString()}{" "}
                    <span className="text-[10px] text-neutral-500 font-mono">
                      kg
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest leading-none">
                    REAL_VOLUME_TOTAL
                  </div>
                  <div className="text-xl font-black font-brutalist text-electric-blue tracking-widest">
                    {totalReal > 0 ? totalReal.toLocaleString() : "0"}{" "}
                    <span className="text-[10px] text-neutral-500 font-mono">
                      kg
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-[2px] bg-white/5 w-full my-1" />
              <p className="text-[9px] font-mono text-neutral-400 leading-normal">
                El tonelaje total es el indicador biomecánico clave. Las semanas 1, 2 y 3 escalan el estímulo (<span className="text-white">Intensificación</span>) para maximizar la tensión muscular, mientras la Semana 4 limpia receptores con una vaciada profunda (<span className="text-white">Deload</span>) de volumen.
              </p>
            </div>

            <div className="bg-zinc-950 p-4 border border-white/5 rounded text-left">
              <span className="text-[10px] font-mono tracking-widest text-yellow-400 font-bold uppercase block pb-1 border-b border-white/5">
                🩺 DIAGNÓSTICO CLÍNICO L4
              </span>
              <div className="text-[10px] font-mono text-neutral-400 leading-relaxed pt-2.5 space-y-2">
                {currentWeek === "w4" ? (
                  isW4Overdoing ? (
                    <div className="space-y-1.5 p-2 bg-rose-950/20 border border-rose-500/30 text-rose-400 rounded-sm">
                      <strong className="text-[10px] block uppercase font-black tracking-wider">
                        ⚠️ ALERTA: SOBREVOLUMEN EN DESCARGA
                      </strong>
                      <p className="text-[9px] leading-tight text-rose-300">
                        Tu tonelaje de descarga real supera el límite seguro de {plannedVolume.w4} kg. Estás saboteando tu regeneración neuro-articular con volumen basura.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1 p-2 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 rounded-sm">
                      <strong className="text-[10px] block">✓ DESCARGA PERFECTA</strong>
                      <p className="text-[9px]">
                        Preservando tu maná neural perfectamente. Tu regeneración tisular progresa a nivel óptimo.
                      </p>
                    </div>
                  )
                ) : (
                  <p>
                    Operando en fase de carga activa. Supervisa la fatiga articular. Tu porcentaje del volumen planeado completado es del{" "}
                    <span className="text-white font-bold">
                      {totalPlanned > 0 ? ((totalReal / totalPlanned) * 100).toFixed(0) : 0}%
                    </span>
                    .
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 h-[280px] bg-black/40 border border-white/5 rounded p-4 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 15, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis
                  dataKey="name"
                  stroke="#666"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "#333" }}
                />
                <YAxis
                  stroke="#666"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "#333" }}
                  name="Volumen"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09090b",
                    borderColor: "#333",
                    fontSize: 10,
                    fontFamily: "monospace",
                  }}
                  labelStyle={{ color: "#fff", fontWeight: "bold" }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 9, fontFamily: "monospace" }}
                  verticalAlign="top"
                  height={36}
                />
                <Bar
                  dataKey="planned"
                  fill="#333"
                  name="Planificado (Target)"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={50}
                  animationDuration={1000}
                />
                <Area
                  type="monotone"
                  dataKey="real"
                  fillOpacity={0.2}
                  fill="#00f0ff"
                  stroke="#00f0ff"
                  strokeWidth={2}
                  name="Tonelaje Real Realizado"
                  animationDuration={1500}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* HISTORIAL NEXUS AUDITOR CARD */}
      <section className="bg-zinc-950 p-5 border border-white/5 rounded-sm text-left font-mono text-[9px] relative mt-6 no-print">
        <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/10 pb-3 mb-3">
          <ShieldAlert size={14} className="text-yellow-500" />
          NEXUS PANEL AUDITOR L4 • HISTORIAL DE CARGA ACUMULADA EN CURSO
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center mt-2 pb-3 border-b border-white/5">
          <div className="bg-black border border-white/5 p-2 rounded">
            <p className="text-neutral-500 uppercase tracking-widest">Semana 1 Acumulación</p>
            <p className="text-white text-[13px] font-black mt-1">
              {realWVolumes[0].toLocaleString("es-ES")} kg
            </p>
            <p className="text-[8px] text-zinc-500 pt-1">
              RPE Promedio: {w1RpeAvg > 0 ? w1RpeAvg.toFixed(1) : "N/A"}
            </p>
          </div>
          <div className="bg-black border border-white/5 p-2 rounded">
            <p className="text-neutral-500 uppercase tracking-widest">Semana 2 Intensificación</p>
            <p className="text-white text-[13px] font-black mt-1">
              {realWVolumes[1].toLocaleString("es-ES")} kg
            </p>
            <p className="text-[8px] text-zinc-500 pt-1">
              RPE Promedio: {w2RpeAvg > 0 ? w2RpeAvg.toFixed(1) : "N/A"}
            </p>
          </div>
          <div className="bg-black border border-white/5 p-2 rounded">
            <p className="text-white font-bold uppercase tracking-widest text-[#00f0ff]">
              Semana 3 Apex Pico
            </p>
            <p className="text-white text-[13px] font-black mt-1 text-[#00f0ff]">
              {realWVolumes[2].toLocaleString("es-ES")} kg
            </p>
            <p className="text-[8px] text-zinc-500 pt-1">
              RPE Promedio: {w3RpeAvg > 0 ? w3RpeAvg.toFixed(1) : "N/A"}
            </p>
          </div>
          <div className="bg-black border border-white/5 p-2 rounded">
            <p className="text-neutral-500 uppercase tracking-widest">Semana 4 Descarga</p>
            <p className="text-white text-[13px] font-black mt-1">
              {realWVolumes[3].toLocaleString("es-ES")} kg
            </p>
            <p className="text-[8px] text-zinc-500 pt-1">
              RPE Promedio: {w4RpeAvg > 0 ? w4RpeAvg.toFixed(1) : "N/A"}
            </p>
          </div>
        </div>

        <div className="pt-3 flex flex-col md:flex-row items-stretch justify-between gap-4 font-mono text-[9px]">
          <div className="space-y-1">
            <div className="text-zinc-500 font-bold uppercase tracking-wider">
              RESPUESTA SISTÉMICA DE ATLETA (NEXUS ANALYTIC ID_11a):
            </div>
            <p className="text-neutral-300 leading-normal max-w-2xl">
              {messageBody}
            </p>
          </div>
          <div className="bg-black/50 border border-white/5 p-3 rounded shrink-0 self-center md:self-auto text-right">
            <div className="text-zinc-500 uppercase">Tonelaje Consolidado:</div>
            <div className="text-base text-white font-black font-brutalist tracking-wider">
              {totalVolumeStr}
            </div>
          </div>
        </div>
      </section>

      {/* PDF REPORT EXPORT TRIGGER */}
      <section className="p-5 border bg-zinc-950/60 backdrop-blur-xs transition-all duration-300 rounded-sm border-white/10 shadow-sm mt-6 mb-12 text-left">
        <header className="px-4 py-2 flex items-center justify-between bg-zinc-900 border border-white/10 rounded-xs mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} style={{ color: activeColor }} />
            <h3 className="text-sm font-brutalist italic text-white uppercase tracking-wider">
              INFORMES CONSOLIDADOS DEL MES DE ENTRENAMIENTO
            </h3>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#00f0ff] font-extrabold border border-cyan-500/30 bg-cyan-950/30 px-2 py-0.5 rounded">
            Reporte PDF Mensual Clínico
          </span>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2 space-y-1.5 font-mono text-[10px] text-neutral-400">
            <p className="text-white font-bold uppercase tracking-wider">
              Análisis de Sobrecarga, Volumen (Kg) y Picos de Fatiga (RPE)
            </p>
            <p className="leading-relaxed text-left font-mono">
              Genera un reporte clínico formal en formato PDF de todo el mes de entrenamiento. Compila de manera automática el acumulado de volumen (tonelaje real cargado), la relación del volumen por microciclo y la tendencia del RPE semanal comparada contra la base basal establecida del mes anterior.
            </p>
            <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1 text-white text-[9.5px]">
              <span>
                Series Registradas:{" "}
                <strong className="text-[#00f0ff]">
                  {stats.totalLogsCount} series
                </strong>
              </span>
              <span>•</span>
              <span>
                Tonelaje Total:{" "}
                <strong style={{ color: activeColor }}>
                  {stats.totalVolume.toLocaleString("de-DE")} kg
                </strong>
              </span>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <button
              onClick={handleGenerateMonthlyReportPDF}
              className="flex items-center gap-2 px-5 py-3 border font-mono text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all cursor-pointer shadow-md rounded-xs shrink-0"
              style={{ minHeight: "44px" }}
            >
              <FileText size={15} />
              EXPORTAR AUDITORÍA PDF
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
