/**
 * Analytics Computing Service for Nexus L4 Coach Applet.
 * Computes RPE Trends, RPE Distributions, and Dyn-RPE Comparison Overtraining Metrics.
 *
 * HONESTY RULE: these functions never fabricate data. Days without logs return
 * `rpe: null` / zero frequencies, and comparisons are only produced when both
 * sides have real registered values. The UI decides how to render absence
 * (empty states), not this service.
 */

export interface ChartDayData {
  name: string;
  rpe: number | null;
  isReal: boolean;
}

export interface RpeDistributionItem {
  rpeName: string;
  frequency: number;
  displayColor: string;
  isReal: boolean;
}

export interface RpeComparisonResult {
  /** false when there is not enough real data to compare — UI shows empty state */
  hasComparison: boolean;
  currentAvg: number | null;
  priorAvg: number | null;
  diff: number | null;
  status: "good" | "warning" | "normal";
  label: string;
  message: string;
  advice: string;
  hasCurrentReal: boolean;
}

// Global cache to avoid redundant localStorage scanning and JSON parsing.
// The cache is keyed on logsVersion: callers MUST bump logsVersion whenever any
// nexus_logs_* entry changes (App.tsx does this on every log write) so a stale
// snapshot is never served.
let globalLogsCache: Record<string, any[]> | null = null;
let lastLogsVersion = -1;

/**
 * Clears the in-memory logs cache. Call this when localStorage is wiped out-of-band
 * (e.g. a full data reset or sign-out) so the next read re-scans from scratch.
 */
export function resetLogsCache(): void {
  globalLogsCache = null;
  lastLogsVersion = -1;
}

/**
 * Retrieves and parses all nexus_logs from localStorage.
 * Uses logsVersion for cache invalidation.
 */
function getParsedNexusLogs(logsVersion: number): Record<string, any[]> {
  if (globalLogsCache !== null && logsVersion === lastLogsVersion) {
    return globalLogsCache;
  }

  const cache: Record<string, any[]> = {};

  // Using Object.keys is significantly faster than localStorage.key(i) loops
  const keys = Object.keys(localStorage);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key.startsWith("nexus_logs_")) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const logs = JSON.parse(raw);
          if (Array.isArray(logs)) {
            cache[key] = logs;
          }
        }
      } catch {
        // ignore malformed JSON
      }
    }
  }

  globalLogsCache = cache;
  lastLogsVersion = logsVersion;
  return cache;
}

/**
 * Computes the 7-day RPE averages for the trend line chart.
 * Days without real logs return `rpe: null` (charts skip them with connectNulls).
 */
export function computeChartData(currentWeek: string, logsVersion: number): ChartDayData[] {
  const days = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
  const logsCache = getParsedNexusLogs(logsVersion);

  return days.map((dayName, idx) => {
    const dayId = `${currentWeek}d${idx + 1}`;
    const dayPrefix = `nexus_logs_${dayId}_`;
    let rpeSum = 0;
    let rpeCount = 0;

    for (const key in logsCache) {
      if (key.startsWith(dayPrefix)) {
        const logs = logsCache[key];
        logs.forEach((item: any) => {
          const val = parseFloat(item.rpe);
          if (!isNaN(val) && val > 0) {
            rpeSum += val;
            rpeCount++;
          }
        });
      }
    }

    const hasRealLogs = rpeCount > 0;
    return {
      name: dayName,
      rpe: hasRealLogs ? parseFloat((rpeSum / rpeCount).toFixed(1)) : null,
      isReal: hasRealLogs,
    };
  });
}

/**
 * Computes the RPE distribution frequency histogram data for the current week.
 * All-zero frequencies (isReal: false on every item) mean "no data yet".
 */
export function computeRpeDistributionData(currentWeek: string, logsVersion: number): RpeDistributionItem[] {
  const distribution: Record<number, number> = {};
  for (let r = 1; r <= 10; r++) {
    distribution[r] = 0;
  }

  let totalRealLogs = 0;
  const logsCache = getParsedNexusLogs(logsVersion);

  // Scan all days of the current week (from 1 to 7)
  for (let dayIdx = 1; dayIdx <= 7; dayIdx++) {
    const dayId = `${currentWeek}d${dayIdx}`;
    const dayPrefix = `nexus_logs_${dayId}_`;

    for (const key in logsCache) {
      if (key.startsWith(dayPrefix)) {
        const logs = logsCache[key];
        logs.forEach((item: any) => {
          const val = parseFloat(item.rpe);
          if (!isNaN(val) && val >= 1 && val <= 10) {
            const rounded = Math.round(val);
            distribution[rounded] = (distribution[rounded] || 0) + 1;
            totalRealLogs++;
          }
        });
      }
    }
  }

  const hasRealLogs = totalRealLogs > 0;

  return Array.from({ length: 10 }, (_, i) => {
    const rpeVal = i + 1;
    return {
      rpeName: `RPE ${rpeVal}`,
      frequency: distribution[rpeVal],
      displayColor:
        rpeVal <= 4
          ? "#39FF14"
          : rpeVal <= 7
            ? "#CCFF00"
            : rpeVal <= 9
              ? "#FF007F"
              : "#FF0000",
      isReal: hasRealLogs,
    };
  });
}

const NO_COMPARISON: RpeComparisonResult = {
  hasComparison: false,
  currentAvg: null,
  priorAvg: null,
  diff: null,
  status: "normal",
  label: "SIN DATOS SUFICIENTES",
  message: "Registrá series con RPE en al menos dos semanas para comparar ciclos.",
  advice: "Usá el logger o el wizard de fin de día para alimentar esta métrica.",
  hasCurrentReal: false,
};

/**
 * Compares today's average RPE against the SAME weekday in other weeks that
 * actually have registered data. Returns hasComparison: false when either side
 * lacks real logs — no synthetic baselines are ever invented.
 */
export function computeRpeComparisonInfo(
  currentWeek: string,
  activeDayId: string,
  logsVersion: number,
): RpeComparisonResult {
  let currentSessionSum = 0;
  let currentSessionCount = 0;

  const logsCache = getParsedNexusLogs(logsVersion);
  const activeDayPrefix = `nexus_logs_${activeDayId}_`;

  for (const key in logsCache) {
    if (key.startsWith(activeDayPrefix)) {
      const logs = logsCache[key];
      logs.forEach((item: any) => {
        const val = parseFloat(item.rpe);
        if (!isNaN(val) && val > 0) {
          currentSessionSum += val;
          currentSessionCount++;
        }
      });
    }
  }

  const hasCurrentReal = currentSessionCount > 0;
  if (!hasCurrentReal) {
    return NO_COMPARISON;
  }

  const currentAvg = parseFloat((currentSessionSum / currentSessionCount).toFixed(1));

  // Prior weeks: same weekday index across OTHER weeks — only real data counts.
  const activeDayNum = parseInt(activeDayId.split("d")[1] || "1", 10); // 1 to 7
  let otherWeeksSum = 0;
  let otherWeeksCount = 0;
  const otherWeekKeys = ["w1", "w2", "w3", "w4"].filter((wk) => wk !== currentWeek);

  otherWeekKeys.forEach((wk) => {
    const targetDayPrefix = `nexus_logs_${wk}d${activeDayNum}_`;
    let wkDaySum = 0;
    let wkDayCount = 0;

    for (const key in logsCache) {
      if (key.startsWith(targetDayPrefix)) {
        const logs = logsCache[key];
        logs.forEach((item: any) => {
          const val = parseFloat(item.rpe);
          if (!isNaN(val) && val > 0) {
            wkDaySum += val;
            wkDayCount++;
          }
        });
      }
    }

    if (wkDayCount > 0) {
      otherWeeksSum += wkDaySum / wkDayCount;
      otherWeeksCount++;
    }
  });

  if (otherWeeksCount === 0) {
    return {
      ...NO_COMPARISON,
      hasCurrentReal: true,
      currentAvg,
      message: "Hoy promediás RPE " + currentAvg + ", pero todavía no hay registros del mismo día en otras semanas.",
    };
  }

  const priorAvg = parseFloat((otherWeeksSum / otherWeeksCount).toFixed(1));
  const diff = parseFloat((currentAvg - priorAvg).toFixed(1));

  let status: "good" | "warning" | "normal" = "normal";
  let label = "ESTABLE // NOMINAL";
  let message = "Intensidad en rango óptimo de supercompensación.";
  let advice = "Sistemas neurales intactos. Continúa con los intervalos y descansos mandatorios.";

  if (diff >= 0.8) {
    status = "warning";
    label = "⚠️ RIESGO ALTO // SOBRECARGA";
    message = "Desviación neural considerable detectada en la sesión.";
    advice = "SNC fatigado. Reduce la carga activa en un 10-15% en el próximo bloque y prioriza ROM.";
  } else if (diff <= -0.8) {
    status = "good";
    label = "⚡ EXCELENTE // INTACTO";
    message = "Adaptación metabólica con sobrecompensación positiva.";
    advice = "La fatiga percibida disminuyó respecto al ciclo previo. Permite excelente aceleración de barra.";
  }

  return {
    hasComparison: true,
    currentAvg,
    priorAvg,
    diff,
    status,
    label,
    message,
    advice,
    hasCurrentReal,
  };
}
