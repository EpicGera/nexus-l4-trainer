/**
 * Analytics Computing Service for Nexus L4 Coach Applet.
 * Computes RPE Trends, RPE Distributions, and Dyn-RPE Comparison Overtraining Metrics.
 */

export interface ChartDayData {
  name: string;
  rpe: number;
  isReal: boolean;
}

export interface RpeDistributionItem {
  rpeName: string;
  frequency: number;
  displayColor: string;
  isReal: boolean;
}

export interface RpeComparisonResult {
  currentAvg: number;
  priorAvg: number;
  diff: number;
  status: "good" | "warning" | "normal";
  label: string;
  message: string;
  advice: string;
  hasCurrentReal: boolean;
}

/**
 * Computes the 7-day RPE averages for the trend line chart.
 */
export function computeChartData(currentWeek: string, _logsVersion: number): ChartDayData[] {
  const days = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
  return days.map((dayName, idx) => {
    const dayId = `${currentWeek}d${idx + 1}`;
    let rpeSum = 0;
    let rpeCount = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`nexus_logs_${dayId}_`)) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const logs = JSON.parse(raw);
            if (Array.isArray(logs)) {
              logs.forEach((item: any) => {
                const val = parseFloat(item.rpe);
                if (!isNaN(val) && val > 0) {
                  rpeSum += val;
                  rpeCount++;
                }
              });
            }
          }
        } catch {
          // ignore
        }
      }
    }

    const hasRealLogs = rpeCount > 0;
    const avgRpe = hasRealLogs ? parseFloat((rpeSum / rpeCount).toFixed(1)) : null;

    // Seed baseline trend values so it looks polished if they haven't logged entries on a day yet
    let baselineVal = 7.0;
    if (idx === 0) baselineVal = 7.5; // Lunes pesado
    if (idx === 1) baselineVal = 6.0; // Martes flush/técnico
    if (idx === 2) baselineVal = 8.0; // Miércoles HWPO pesado
    if (idx === 3) baselineVal = 7.0; // Jueves potencia
    if (idx === 4) baselineVal = 3.5; // Viernes descanso clínico
    if (idx === 5) baselineVal = 8.5; // Sábado Mayhem chipper pesado
    if (idx === 6) baselineVal = 7.2; // Domingo barra

    return {
      name: dayName,
      rpe: avgRpe !== null ? avgRpe : baselineVal,
      isReal: hasRealLogs,
    };
  });
}

/**
 * Computes the RPE distribution frequency histogram data.
 */
export function computeRpeDistributionData(currentWeek: string, _logsVersion: number): RpeDistributionItem[] {
  const distribution: Record<number, number> = {};
  for (let r = 1; r <= 10; r++) {
    distribution[r] = 0;
  }

  let totalRealLogs = 0;

  // Scan all days of the current week (from 1 to 7)
  for (let dayIdx = 1; dayIdx <= 7; dayIdx++) {
    const dayId = `${currentWeek}d${dayIdx}`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`nexus_logs_${dayId}_`)) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const logs = JSON.parse(raw);
            if (Array.isArray(logs)) {
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
        } catch {
          // ignore
        }
      }
    }
  }

  const hasRealLogs = totalRealLogs > 0;
  if (!hasRealLogs) {
    const baselines = [8, 6, 8, 7, 4, 9, 7]; // rounded baseline values
    baselines.forEach((val) => {
      distribution[val] = (distribution[val] || 0) + 1;
    });
  }

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

/**
 * Computes dynamic RPE comparison and overtraining advice based on prior weeks.
 */
export function computeRpeComparisonInfo(
  currentWeek: string,
  activeDayId: string,
  _logsVersion: number,
): RpeComparisonResult {
  let currentSessionSum = 0;
  let currentSessionCount = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`nexus_logs_${activeDayId}_`)) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const logs = JSON.parse(raw);
          if (Array.isArray(logs)) {
            logs.forEach((item: any) => {
              const val = parseFloat(item.rpe);
              if (!isNaN(val) && val > 0) {
                currentSessionSum += val;
                currentSessionCount++;
              }
            });
          }
        }
      } catch {
        // ignore
      }
    }
  }

  // Baseline values for the 7 weekdays (LUN, MAR, MIÉ, JUE, VIE, SÁB, DOM)
  const baselines = [7.5, 6.0, 8.0, 7.0, 3.5, 8.5, 7.2];
  const activeDayNum = parseInt(activeDayId.split("d")[1] || "1", 10); // 1 to 7
  const dayIdx = activeDayNum - 1;
  const currentBaseline = baselines[dayIdx];

  const hasCurrentReal = currentSessionCount > 0;
  const currentAvg = hasCurrentReal ? currentSessionSum / currentSessionCount : currentBaseline;

  // Prior/Other Weeks RPE: Look at the same weekday index across OTHER weeks
  let otherWeeksSum = 0;
  let otherWeeksCount = 0;
  const otherWeekKeys = ["w1", "w2", "w3", "w4"].filter((wk) => wk !== currentWeek);

  otherWeekKeys.forEach((wk) => {
    const targetDayId = `${wk}d${activeDayNum}`;
    let wkDaySum = 0;
    let wkDayCount = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`nexus_logs_${targetDayId}_`)) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const logs = JSON.parse(raw);
            if (Array.isArray(logs)) {
              logs.forEach((item: any) => {
                const val = parseFloat(item.rpe);
                if (!isNaN(val) && val > 0) {
                  wkDaySum += val;
                  wkDayCount++;
                }
              });
            }
          }
        } catch {
          // ignore
        }
      }
    }

    if (wkDayCount > 0) {
      otherWeeksSum += wkDaySum / wkDayCount;
      otherWeeksCount++;
    } else {
      let weekOffset = 0;
      if (wk === "w1") weekOffset = -0.5;
      else if (wk === "w2") weekOffset = 0;
      else if (wk === "w3") weekOffset = 0.5;
      else if (wk === "w4") weekOffset = -1.5;

      const baselineVal = Math.max(1, Math.min(10, currentBaseline + weekOffset));
      otherWeeksSum += baselineVal;
      otherWeeksCount++;
    }
  });

  const priorAvg = otherWeeksCount > 0 ? otherWeeksSum / otherWeeksCount : currentBaseline;
  const diff = currentAvg - priorAvg;

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
