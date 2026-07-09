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
import { SectionCard, Field, Input } from "./ui/primitives";
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
  dailyGoals: Record<string, string>;
  onSaveGoal: (key: string, text: string) => void;
}

type Lens = "intensidad" | "volumen" | "espectro" | "metas";

const LENS_TABS: { key: Lens; label: string }[] = [
  { key: "intensidad", label: "Intensidad" },
  { key: "volumen", label: "Volumen" },
  { key: "espectro", label: "Espectro" },
  { key: "metas", label: "Metas" },
];

const LENS_KEY = "nexus_rpe_lens";

/**
 * RPE & Metas sheet — split into four focused lenses (one segmented control, no
 * nesting) so the athlete sees a single intent at a time instead of a 12-section
 * scroll. Only the active lens renders.
 *  · Intensidad — prescribed cycle + real RPE + fatigue/CNS
 *  · Volumen    — real tonnage + monthly PDF
 *  · Espectro   — today's biomechanics + program spectrum (modality/patterns/e1RM)
 *  · Metas      — editable per-day goals for the active week
 */
export default function RpeAnalyticsPanel({
  currentWeek,
  activeDay,
  currentVariationIndex,
  logsVersion,
  handleGenerateMonthlyReportPDF,
  getMonthlyVolumeStats,
  database,
  dailyGoals,
  onSaveGoal,
}: RpeAnalyticsPanelProps) {
  const accentColor = WEEK_ACCENT_COLORS[currentWeek]?.color || "#00f0ff";
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
        <div className="flex flex-col space-y-5">
          <HelpNote title="Cómo leer esta lente">
            Todos los gráficos se alimentan de lo que <strong>registrás</strong> (cargas, reps y RPE,
            vía INCURSIÓN o carga manual) del capítulo activo. RPE = esfuerzo percibido (1–10);
            RIR = repeticiones en reserva (10 − RPE). Si un gráfico sale vacío, ese tramo aún no tiene registros.
          </HelpNote>
          <HelpNote title="Ciclo prescrito vs. real">
            El RPE objetivo de cada semana es tu vara: comparalo con tu RPE real para ver si vas suave,
            en punto, o pasado. Más abajo, la fatiga acumulada sobre el SNC te avisa cuándo meter recuperación.
          </HelpNote>
          <RpeProgressionSection
            currentWeek={currentWeek}
            weekIntention={database?.[currentWeek]?.meta?.intention}
          />
          <WeeklyRpeSection
            currentWeek={currentWeek}
            activeDayId={activeDay?.id ?? null}
            logsVersion={logsVersion}
            accentColor={accentColor}
          />
          <FatigueAndIntensitySection currentWeek={currentWeek} />
          <AutoregulationSection currentWeek={currentWeek} />
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

      {lens === "metas" && (
        <MetasLens
          currentWeek={currentWeek}
          activeDayId={activeDay?.id ?? null}
          dailyGoals={dailyGoals}
          onSaveGoal={onSaveGoal}
        />
      )}
    </div>
  );
}

const DAY_LABELS = ["Día 1", "Día 2", "Día 3", "Día 4", "Día 5", "Día 6", "Día 7"];

/** Lightweight editor for the active week's per-day goals (finally a home for "Metas"). */
function MetasLens({
  currentWeek,
  activeDayId,
  dailyGoals,
  onSaveGoal,
}: {
  currentWeek: string;
  activeDayId: string | null;
  dailyGoals: Record<string, string>;
  onSaveGoal: (key: string, text: string) => void;
}) {
  // Local draft so typing is smooth; persist on blur.
  const [draft, setDraft] = useState<Record<string, string>>({});
  const valueFor = (key: string) =>
    draft[key] !== undefined ? draft[key] : dailyGoals[key] || "";

  return (
    <SectionCard
      title={`Metas · ${currentWeek.toUpperCase()}`}
      subtitle="Objetivo declarado por día de la semana activa. Se edita y guarda en el acto."
    >
      <div className="flex flex-col gap-3">
        {DAY_LABELS.map((label, i) => {
          const key = `${currentWeek}d${i + 1}`;
          const isActive = activeDayId === key;
          return (
            <Field
              key={key}
              label={label}
              hint={isActive ? "hoy" : undefined}
              className={isActive ? "ring-1 ring-electric-blue/40 rounded-sm p-1" : ""}
            >
              <Input
                value={valueFor(key)}
                placeholder="Sin meta declarada…"
                onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                onBlur={(e) => onSaveGoal(key, e.target.value.trim())}
              />
            </Field>
          );
        })}
      </div>
    </SectionCard>
  );
}
