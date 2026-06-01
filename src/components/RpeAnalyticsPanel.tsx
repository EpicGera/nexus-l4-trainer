import RpeProgressionSection from "./analytics/RpeProgressionSection";
import BiomechanicsSection from "./analytics/BiomechanicsSection";
import FatigueAndIntensitySection from "./analytics/FatigueAndIntensitySection";
import VolumeProgressionSection from "./analytics/VolumeProgressionSection";

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
}

export default function RpeAnalyticsPanel({
  currentWeek,
  activeDay,
  currentVariationIndex,
  handleGenerateMonthlyReportPDF,
  getMonthlyVolumeStats,
}: RpeAnalyticsPanelProps) {
  return (
    <div className="flex flex-col space-y-6">
      {/* 1. Week targets, monthly reference averages, and full 10-level RPE board */}
      <RpeProgressionSection currentWeek={currentWeek} />

      {/* 2. Biomechanics Radar mapping, diagnostic recommendations and captured exercises */}
      <BiomechanicsSection
        activeDay={activeDay}
        currentVariationIndex={currentVariationIndex}
      />

      {/* 3. Area charts, fatigue indexes (CNS Load), and stress-load margins */}
      <FatigueAndIntensitySection currentWeek={currentWeek} />

      {/* 4. Total volume progressions, raw tonnage reports, and PDF print exports */}
      <VolumeProgressionSection
        currentWeek={currentWeek}
        handleGenerateMonthlyReportPDF={handleGenerateMonthlyReportPDF}
         getMonthlyVolumeStats={getMonthlyVolumeStats}
      />
    </div>
  );
}
