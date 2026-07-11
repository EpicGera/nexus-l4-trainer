import { useState } from "react";
import RpeProgressionSection from "./analytics/RpeProgressionSection";
import WeeklyRpeSection from "./analytics/WeeklyRpeSection";
import BiomechanicsSection from "./analytics/BiomechanicsSection";
import MuscleMapSection from "./analytics/MuscleMapSection";
import FatigueAndIntensitySection from "./analytics/FatigueAndIntensitySection";
import VolumeProgressionSection from "./analytics/VolumeProgressionSection";
import AchievedStimulusSection from "./analytics/AchievedStimulusSection";
import AutoregulationSection from "./analytics/AutoregulationSection";
import TrainingAnalysis from "./TrainingAnalysis";
import HelpNote from "./ui/HelpNote";
import LensTabs from "./ui/LensTabs";
import { WEEK_ACCENT_COLORS } from "../lib/constants";

interface RpeAnalyticsPanelProps {
  currentWeek: string;
  activeDay: any;
  currentVariationIndex: number;
  logsVersion: number;
  handleGenerateMonthlyReportPDF: () => void;
  getMonthlyVolumeStats: () => {
    weeklyVolume: Record<string, number>;
    weeklyCount: Record<string, number>;
    weeklyRpeSum: Record<string, number>;
    weeklyRpeCount: Record<string, number>;
    totalVolume: number;
    totalLogsCount: number;
  };
  database?: any;
}

type Lens = "intensidad" | "volumen" | "espectro";

const LENS_TABS: { key: Lens; label: string }[] = [
  { key: "intensidad", label: "Intensidad" },
  { key: "volumen", label: "Volumen" },
  { key: "espectro", label: "Espectro" },
];

const LENS_KEY = "nexus_rpe_lens";

/**
 * RPE sheet — split into three focused lenses (one segmented control, no
 * nesting) so the athlete sees a single intent at a time instead of a 12-section
 * scroll. Only the active lens renders. Las metas por día viven ahora en el
 * pizarrón (derivadas del JSON), no en una solapa editable.
 *  · Intensidad — prescribed cycle + real RPE + fatigue/CNS
 *  · Volumen    — real tonnage + monthly PDF
 *  · Espectro   — today's biomechanics + program spectrum (modality/patterns/e1RM)
 */
export default function RpeAnalyticsPanel({
  currentWeek,
  activeDay,
  currentVariationIndex,
  logsVersion,
  handleGenerateMonthlyReportPDF,
  getMonthlyVolumeStats,
  database,
}: RpeAnalyticsPanelProps) {
  const accentColor = WEEK_ACCENT_COLORS[currentWeek]?.color || "#FAFAFA";
  const [lens, setLens] = useState<Lens>(
    () => (localStorage.getItem(LENS_KEY) as Lens) || "intensidad",
  );
  const changeLens = (k: string) => {
    setLens(k as Lens);
    localStorage.setItem(LENS_KEY, k);
  };

  return (
    <div className="flex flex-col space-y-5">
      <LensTabs tabs={LENS_TABS} active={lens} onChange={changeLens} accent={accentColor} />

      {lens === "intensidad" && (
        // Bento: en ≥lg rejilla de 2 columnas; el chart semanal y la progresión
        // ocupan la fila completa, fatiga y autorregulación van lado a lado.
        <div className="flex flex-col space-y-5 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0 lg:items-start">
          <HelpNote title="Cómo leer esta lente" className="lg:col-span-2">
            Todos los gráficos se alimentan de lo que <strong>registrás</strong> (cargas, reps y RPE,
            vía INCURSIÓN o carga manual) del capítulo activo. RPE = esfuerzo percibido (1–10);
            RIR = repeticiones en reserva (10 − RPE). Si un gráfico sale vacío, ese tramo aún no tiene registros.
          </HelpNote>
          <div className="lg:col-span-2">
            <RpeProgressionSection
              currentWeek={currentWeek}
              weekIntention={database?.[currentWeek]?.meta?.intention}
            />
          </div>
          <div className="lg:col-span-2">
            <WeeklyRpeSection
              currentWeek={currentWeek}
              activeDayId={activeDay?.id ?? null}
              logsVersion={logsVersion}
              accentColor={accentColor}
            />
          </div>
          <FatigueAndIntensitySection currentWeek={currentWeek} />
          <AutoregulationSection currentWeek={currentWeek} intention={database?.[currentWeek]?.meta?.intention} />
        </div>
      )}

      {lens === "volumen" && (
        <div className="flex flex-col space-y-5">
          <HelpNote title="Tonelaje y reporte">
            Volumen real (kg movidos) por semana con tu RPE encima. El botón genera un PDF del mes para
            guardar o compartir tu progreso.
          </HelpNote>
          <VolumeProgressionSection
            currentWeek={currentWeek}
            handleGenerateMonthlyReportPDF={handleGenerateMonthlyReportPDF}
            getMonthlyVolumeStats={getMonthlyVolumeStats}
          />
        </div>
      )}

      {lens === "espectro" && (
        <div className="flex flex-col space-y-5">
          <HelpNote title="Espectro del estímulo">
            Cómo se reparte tu trabajo: el radar muestra la sesión de hoy; abajo, la cobertura del
            programa entre sistemas energéticos, dominios temporales, patrones y modalidades. Sirve para
            detectar redundancia y huecos del espectro.
          </HelpNote>
          <MuscleMapSection
            activeDay={activeDay}
            currentVariationIndex={currentVariationIndex}
          />
          <BiomechanicsSection
            activeDay={activeDay}
            currentVariationIndex={currentVariationIndex}
          />
          <AchievedStimulusSection />
          <TrainingAnalysis database={database} />
        </div>
      )}
    </div>
  );
}
