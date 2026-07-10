import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { getAccessToken, requestSheetsAccess, clearAccessToken } from "./firebase";
import { exportToGoogleSheets } from "./sheets";
import { loadCachedWorkouts, getDefaultProgram } from "./sheetImport";
import { cleanExerciseLabel, getCleanExerciseName } from "./historyUtils";
import { parseDayId, type DayStatus } from "./storageKeys";
import { parseLoggedNumber, parseLoggedWeightKg } from "./logParse";
import { AthleteState, DayWorkout, DayVariation } from "../types/workout";

// Lightweight global toast: any component listening to "nexus_toast" renders it.
type ToastKind = "success" | "error" | "info";
export const emitToast = (
  message: string,
  kind: ToastKind = "success",
  durationMs = 6000
) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("nexus_toast", { detail: { message, kind, durationMs } })
  );
};

// --- TXT Export ---
export const handleMonthTextExport = () => {
  let fullText = "PROGRAMACIÓN COMPLETA - MES 1\n";
  fullText += "========================================================\n\n";

  const weeks = ["w1", "w2", "w3", "w4"];
  const weekNames = [
    "SEMANA 1 (ACUMULACIÓN)",
    "SEMANA 2 (INTENSIFICACIÓN)",
    "SEMANA 3 (PEAK WEEK)",
    "SEMANA 4 (DELOAD)",
  ];

  // Export the live per-user program, not the bundled personal snapshot.
  const database = loadCachedWorkouts() || getDefaultProgram();
  weeks.forEach((weekKey, wIdx) => {
    const weekPlan = database[weekKey];
    if (!weekPlan) return;

    fullText += `### ${weekNames[wIdx]} ###\n\n`;

    weekPlan.days.forEach((day) => {
      fullText += `DÍA: ${day.name} - ${day.title}\n`;
      fullText += `--------------------------------------------------------\n`;

      day.variations.forEach((variation) => {
        if (day.hasTabs) {
          fullText += `\n>> VARIANTE: ${variation.tabName}\n\n`;
        }

        const blocks = [
          { name: "WARM-UP", data: variation.warmup },
          { name: "FUERZA", data: variation.strength },
          { name: "METCON", data: variation.metcon },
          { name: "ACCESORIOS", data: variation.accessories },
        ];

        blocks.forEach((block) => {
          if (
            block.data.items.length === 0 &&
            !block.data.title &&
            !block.data.scheme
          )
            return;
          fullText += `[${block.name}]\n`;
          if (block.data.title) fullText += `${block.data.title}\n`;
          if (block.data.scheme) fullText += `${block.data.scheme}\n`;
          block.data.items.forEach((item) => {
            const strippedItem = item.replace(/<[^>]*>?/gm, "");
            fullText += `- ${strippedItem}\n`;
          });
          fullText += `\n`;
        });
      });

      fullText += `\n========================================================\n\n`;
    });
  });

  const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "Programa_Mes_1_L4.txt");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Collect telemetry from the real log keys ("nexus_logs_<dayId>_<exercise>")
// and map each set to the row shape expected by exportToGoogleSheets.
const collectTelemetryRows = (): any[] => {
  const telemetryRows: any[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith("nexus_logs_")) continue;
    try {
      const logs = JSON.parse(localStorage.getItem(key) || "[]");
      if (!Array.isArray(logs) || logs.length === 0) continue;

      const withoutPrefix = key.slice("nexus_logs_".length);
      const firstUnderscore = withoutPrefix.indexOf("_");
      const dayId =
        firstUnderscore === -1
          ? withoutPrefix
          : withoutPrefix.slice(0, firstUnderscore);
      const derivedName =
        firstUnderscore === -1
          ? ""
          : withoutPrefix.slice(firstUnderscore + 1).replace(/_/g, " ");

      logs.forEach((set: any, idx: number) => {
        const notes = [
          set.rir && set.rir !== "N/D" ? `RIR ${set.rir}` : "",
          set.tiempo ? `Tiempo ${set.tiempo}` : "",
          set.rondas ? `Rondas ${set.rondas}` : "",
        ]
          .filter(Boolean)
          .join(" · ");

        telemetryRows.push({
          timestamp: set.timestamp ?? Date.now(),
          weekId: dayId.slice(0, 2).toUpperCase(),
          dayId,
          blockId: set.block ?? "",
          exerciseName:
            (set.exName && String(set.exName).trim()) ||
            cleanExerciseLabel(derivedName) ||
            derivedName,
          setsReps: `S${idx + 1} x ${set.reps ?? ""}`,
          weightKg: set.weight ?? "",
          rpe: set.rpe ?? "",
          notes,
        });
      });
    } catch {
      // ignore malformed entries
    }
  }
  return telemetryRows;
};

// Heuristic: did a Sheets call fail because the OAuth token was rejected?
// Native Google access tokens (GoogleAuthUtil) are short-lived (~1h), so an
// expired token is the common cause of a retryable failure.
const isAuthError = (err: any): boolean =>
  /\b401\b|\b403\b|unauthenticated|invalid authentication|invalid credentials|access[_ ]token|permission_denied|expired/i.test(
    String(err?.message ?? err)
  );

// --- Google Sheets Export ---
export const handleExportGoogleSheets = async (
  setIsExportingSheets: (loading: boolean) => void
) => {
  setIsExportingSheets(true);
  try {
    // Get a usable token, optionally forcing a fresh interactive sign-in.
    const obtainToken = async (forceSignIn: boolean): Promise<string> => {
      if (!forceSignIn) {
        const existing = await getAccessToken();
        if (existing) return existing;
      }
      // Request the Sheets scope on demand (default login doesn't carry it).
      const token = await requestSheetsAccess();
      if (token) return token;
      throw new Error("No se pudo obtener el acceso a Google Sheets.");
    };

    const telemetryRows = collectTelemetryRows();

    let sheetUrl: string;
    try {
      sheetUrl = await exportToGoogleSheets(await obtainToken(false), telemetryRows);
    } catch (err: any) {
      // The cached token may have expired (common on native). Clear it, sign in
      // again for a fresh token, and retry the export exactly once.
      if (!isAuthError(err)) throw err;
      clearAccessToken();
      sheetUrl = await exportToGoogleSheets(await obtainToken(true), telemetryRows);
    }

    alert(
      `Exportación exitosa. Puedes ver tu hoja de cálculo en:\n\n${sheetUrl}`
    );
  } catch (err: any) {
    alert(
      `Error al exportar a Google Sheets:\n${err.message || String(err)}`
    );
  } finally {
    setIsExportingSheets(false);
  }
};

// --- Statistics Compilation ---
export const getMonthlyVolumeStats = () => {
  // Dynamic week keys — the old fixed w1..w6 dicts silently dropped week 7+.
  const weeklyVolume: Record<string, number> = {};
  const weeklyCount: Record<string, number> = {};
  const weeklyRpeSum: Record<string, number> = {};
  const weeklyRpeCount: Record<string, number> = {};

  let totalVolume = 0;
  let totalLogsCount = 0;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("nexus_logs_")) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsedLogs = JSON.parse(raw);
          if (Array.isArray(parsedLogs) && parsedLogs.length > 0) {
            const parts = key.split("_");
            const dayId = parts[2] || "";
            const parsed = parseDayId(dayId);
            // Multi-digit safe: "w10d1" → "w10" (not "w1", the old
            // substring(0,2) bug). Any week number counts.
            const wkKey = parsed ? `w${parsed.week}` : "";

            if (wkKey) {
              weeklyCount[wkKey] = (weeklyCount[wkKey] || 0) + 1;
              totalLogsCount++;

              parsedLogs.forEach((set) => {
                const wt = parseLoggedWeightKg(set.weight);
                const rp = parseLoggedNumber(set.reps);
                weeklyVolume[wkKey] = (weeklyVolume[wkKey] || 0) + wt * rp;
                totalVolume += wt * rp;

                const rpVal = parseFloat(set.rpe);
                if (!isNaN(rpVal) && rpVal > 0) {
                  weeklyRpeSum[wkKey] = (weeklyRpeSum[wkKey] || 0) + rpVal;
                  weeklyRpeCount[wkKey] = (weeklyRpeCount[wkKey] || 0) + 1;
                }
              });
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("Error calculating monthly stats:", e);
  }

  return {
    weeklyVolume,
    weeklyCount,
    weeklyRpeSum,
    weeklyRpeCount,
    totalVolume,
    totalLogsCount,
  };
};

// --- Weekly PDF Export ---
export const handleBatchPDFExport = (
  currentWeek: string,
  completedDays: Record<string, DayStatus>
) => {
  const activeWeekPlan = (loadCachedWorkouts() || getDefaultProgram())[currentWeek];
  if (!activeWeekPlan) return;

  const days = activeWeekPlan.days;
  const weekLabel =
    currentWeek === "w1"
      ? "ACUMULACIÓN"
      : currentWeek === "w2"
        ? "INTENSIFICACIÓN"
        : currentWeek === "w3"
          ? "PEAK WEEK / ÁPEX"
          : "DELOAD / DESCARGA";

  const targetRpe =
    currentWeek === "w1"
      ? "RPE 6 - 7"
      : currentWeek === "w2"
        ? "RPE 7 - 8"
        : currentWeek === "w3"
          ? "RPE 8 - 9"
          : "RPE 6 (MÁXIMA CALIDAD)";

  const weeklyData: any[] = [];
  let grandTotalSets = 0;
  let rpeCountMap: Record<number, number> = { 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
  let totalRpeSum = 0;
  let totalRpeCount = 0;

  days.forEach((day) => {
    const dayId = day.id;
    const dayLogsForThisDay: any[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`nexus_logs_${dayId}_`)) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const exerciseName = key
                .substring(`nexus_logs_${dayId}_`.length)
                .replace(/_/g, " ");
              dayLogsForThisDay.push({
                exerciseName,
                sets: parsed,
              });

              parsed.forEach((set: any) => {
                grandTotalSets++;
                const val = parseFloat(set.rpe);
                if (!isNaN(val) && val > 0) {
                  totalRpeSum += val;
                  totalRpeCount++;
                  const rounded = Math.min(10, Math.max(6, Math.round(val)));
                  rpeCountMap[rounded] = (rpeCountMap[rounded] || 0) + 1;
                }
              });
            }
          }
        } catch {
          // ignore
        }
      }
    }

    weeklyData.push({
      dayCode: dayId,
      dayName: day.name,
      isCompleted: completedDays[dayId] === "completed",
      logs: dayLogsForThisDay,
      originalDayData: day,
    });
  });

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const BRAND_BLUE = [31, 81, 255];
  const BLACK_DARK = [14, 14, 17];
  const GRAY_TEXT = [100, 110, 120];

  let currentY = 15;

  doc.setFillColor(BLACK_DARK[0], BLACK_DARK[1], BLACK_DARK[2]);
  doc.rect(10, currentY, 190, 30, "F");

  doc.setDrawColor(BRAND_BLUE[0], BRAND_BLUE[1], BRAND_BLUE[2]);
  doc.setLineWidth(1.2);
  doc.line(10, currentY + 30, 200, currentY + 30);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text("REPORTE SEMANAL", 15, currentY + 11);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text(
    `NEXUS L4 // MACROCICLO INDIVIDUALIZADO // ${currentWeek.toUpperCase()}`,
    15,
    currentY + 17
  );

  doc.setFontSize(8);
  doc.setTextColor(GRAY_TEXT[0], GRAY_TEXT[1], GRAY_TEXT[2]);
  doc.text(
    `FECHA: ${new Date().toLocaleDateString()}  SISTEMA DE AUDIO CLÍNICO: ACTIVO`,
    15,
    currentY + 23
  );

  doc.setFillColor(25, 25, 30);
  doc.rect(10, currentY + 34, 190, 22, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(31, 81, 255);
  doc.text("MÉTRICAS CLAVE DE CONTROL PARA EL COACH", 15, currentY + 41);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`Bloque de Carga Semana: ${weekLabel}`, 15, currentY + 47);
  doc.text(
    `Series Totales Ejecutadas: ${grandTotalSets}  -  Objetivo del Microciclo: ${targetRpe}`,
    15,
    currentY + 52
  );

  const avgRpe = totalRpeCount > 0 ? totalRpeSum / totalRpeCount : 0;
  doc.setFont("Helvetica", "bold");
  doc.text(
    `RPE Promedio de Trabajo: ${avgRpe > 0 ? `${avgRpe.toFixed(1)} / 10` : "SIN DATOS"}`,
    120,
    currentY + 47
  );

  currentY += 62;

  weeklyData.forEach((dayData) => {
    if (currentY > 260) {
      doc.addPage();
      currentY = 15;
    }

    doc.setFillColor(35, 35, 45);
    doc.rect(10, currentY, 190, 8, "F");

    doc.setDrawColor(dayData.isCompleted ? 16 : 220, dayData.isCompleted ? 185 : 53, dayData.isCompleted ? 129 : 69);
    doc.setLineWidth(0.6);
    doc.rect(10, currentY, 190, 8);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);

    const checkmarkMarker = dayData.isCompleted ? "[ COMPLETO ] " : "[ PENDIENTE ] ";
    doc.text(`${checkmarkMarker}${dayData.dayName} - ${dayData.originalDayData.title}`, 14, currentY + 5.5);

    currentY += 12;

    if (dayData.logs.length === 0) {
      doc.setFont("Helvetica", "oblique");
      doc.setFontSize(8);
      doc.setTextColor(GRAY_TEXT[0], GRAY_TEXT[1], GRAY_TEXT[2]);
      doc.text("No se encontraron registros de telemetría de cargas para este día.", 15, currentY);
      currentY += 8;
    } else {
      dayData.logs.forEach((logItem: any) => {
        if (currentY > 270) {
          doc.addPage();
          currentY = 15;
        }

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(255, 255, 255);
        doc.text(logItem.exerciseName.toUpperCase(), 15, currentY);
        currentY += 4.5;

        let seriesText = "";
        logItem.sets.forEach((set: any, sIdx: number) => {
          const formattedWeight = set.weight ? `${set.weight}kg` : "P.C.";
          seriesText += `S${sIdx + 1}: ${formattedWeight} x ${set.reps} @ RPE ${set.rpe} `;
          if (set.rir && set.rir !== "N/D") seriesText += `[RIR ${set.rir}]`;
          seriesText += "   ";
        });

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(160, 160, 170);
        doc.text(seriesText, 17, currentY);
        currentY += 7;
      });
    }
  });

  doc.save(`Nexus_L4_Reporte_${currentWeek.toUpperCase()}_v1.pdf`);
};

// --- Monthly PDF Consolidate ---
export const handleGenerateMonthlyReportPDF = (athlete: AthleteState) => {
  const stats = getMonthlyVolumeStats();
  const baselineRpes: Record<string, number> = {
    w1: 6.7,
    w2: 7.3,
    w3: 8.1,
    w4: 5.7,
  };
  const scheduledRpeTargets: Record<string, number> = {
    w1: 6.5,
    w2: 7.5,
    w3: 8.5,
    w4: 5.5,
  };
  const weekLabels: Record<string, string> = {
    w1: "Acumulación Técnica (Semana 1)",
    w2: "Intensificación Neural (Semana 2)",
    w3: "Pico / Boss Fight (Semana 3)",
    w4: "Descarga / Regeneración (Semana 4)",
  };

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const BRAND_BLUE = [31, 81, 255];
  const TECH_CYAN = [0, 240, 255];
  const BLACK_DARK = [14, 14, 17];

  let currentY = 15;

  doc.setFillColor(BLACK_DARK[0], BLACK_DARK[1], BLACK_DARK[2]);
  doc.rect(10, currentY, 190, 32, "F");

  doc.setDrawColor(BRAND_BLUE[0], BRAND_BLUE[1], BRAND_BLUE[2]);
  doc.setLineWidth(1.2);
  doc.line(10, currentY + 32, 200, currentY + 32);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("CONSOLIDADO DE RENDIMIENTO MENSUAL - NEXUS L4", 15, currentY + 11);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(TECH_CYAN[0], TECH_CYAN[1], TECH_CYAN[2]);
  doc.text("ESTADÍSTICAS GLOBALES DEL MACROCICLO DE ENTRENAMIENTO", 15, currentY + 17);

  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 160);
  doc.text(`ATLETA: ${athlete.identity.toUpperCase()}  -  RESTRICCIÓN PRE-PROGRAMADA: ${athlete.restriction}`, 15, currentY + 23);
  doc.text(`NIVEL REGISTRADO: ${athlete.level}  -  SISTEMA ESTADÍSTICO DE CARGAS: ACTIVO`, 15, currentY + 28);

  currentY += 38;

  doc.setFillColor(25, 25, 30);
  doc.rect(10, currentY, 190, 30, "F");
  doc.setDrawColor(80, 80, 95);
  doc.setLineWidth(0.3);
  doc.rect(10, currentY, 190, 30);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("MÉTRICAS CLAVE CONSOLIDADAS DEL MES", 15, currentY + 7);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Volumen Acumulado Total (Carga x Reps): ${stats.totalVolume.toLocaleString()} kg`, 15, currentY + 14);
  doc.text(`Ejercicios Totales con Telemetría Registrada: ${stats.totalLogsCount} movimientos`, 15, currentY + 20);

  const activeWeeks = Object.keys(stats.weeklyCount).filter((k) => stats.weeklyCount[k] > 0);
  const avgSessionPerWeek = activeWeeks.length > 0 ? (stats.totalLogsCount / activeWeeks.length).toFixed(1) : "0.0";
  doc.text(`Movimientos Registrados: ~${avgSessionPerWeek} por semana activa`, 15, currentY + 26);

  currentY += 36;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(31, 81, 255);
  doc.text("ANÁLISIS COMPARATIVO DE VOLUMEN DE CARGA COMPLETO", 10, currentY);
  currentY += 5;

  const tableHeaderY = currentY;
  doc.setFillColor(35, 35, 45);
  doc.rect(10, tableHeaderY, 190, 8, "F");
  doc.rect(10, tableHeaderY, 190, 8);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("Microciclo (Semana)", 13, tableHeaderY + 5.5);
  doc.text("Movimientos Loggeados", 70, tableHeaderY + 5.5);
  doc.text("Volumen Semanal (kg)", 115, tableHeaderY + 5.5);
  doc.text("RPE Promedio", 160, tableHeaderY + 5.5);

  currentY += 8;

  const wks = ["w1", "w2", "w3", "w4"];
  wks.forEach((wk) => {
    doc.rect(10, currentY, 190, 10);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);

    doc.text(weekLabels[wk] || wk.toUpperCase(), 13, currentY + 6.5);
    doc.text(`${stats.weeklyCount[wk] || 0} movs.`, 70, currentY + 6.5);
    doc.text(`${stats.weeklyVolume[wk]?.toLocaleString() || "0"} kg`, 115, currentY + 6.5);

    const rpeAvg = stats.weeklyRpeCount[wk] > 0 ? stats.weeklyRpeSum[wk] / stats.weeklyRpeCount[wk] : 0;
    doc.setFont("Helvetica", "bold");
    if (rpeAvg > 0) {
      doc.text(`${rpeAvg.toFixed(1)} / 10`, 160, currentY + 6.5);
    } else {
      doc.text("N/D", 160, currentY + 6.5);
    }
    currentY += 10;
  });

  currentY += 10;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(31, 81, 255);
  doc.text("AUDITORÍA DE PRECISIÓN DE INTENSIDAD (RPE vs. DESIGN TARGET)", 10, currentY);
  currentY += 5;

  doc.setFillColor(35, 35, 45);
  doc.rect(10, currentY, 190, 8, "F");
  doc.rect(10, currentY, 190, 8);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("Fase", 13, currentY + 5.5);
  doc.text("Target Programado", 70, currentY + 5.5);
  doc.text("Promedio Registrado", 115, currentY + 5.5);
  doc.text("Desviación Biomecánica", 160, currentY + 5.5);

  currentY += 8;

  wks.forEach((wk) => {
    doc.rect(10, currentY, 190, 10);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);

    doc.text(wk.toUpperCase(), 13, currentY + 6.5);
    const target = scheduledRpeTargets[wk] || 0;
    doc.text(`${target.toFixed(1)} @ RPE`, 70, currentY + 6.5);

    const realAvg = stats.weeklyRpeCount[wk] > 0 ? stats.weeklyRpeSum[wk] / stats.weeklyRpeCount[wk] : 0;
    if (realAvg > 0) {
      doc.text(`${realAvg.toFixed(2)} @ RPE`, 115, currentY + 6.5);
      const diff = realAvg - target;
      doc.setFont("Helvetica", "bold");
      if (Math.abs(diff) <= 0.5) {
        doc.setTextColor(16, 185, 129);
        doc.text(`${diff > 0 ? "+" : ""}${diff.toFixed(2)} (PRECISIÓN ALTA)`, 160, currentY + 6.5);
      } else {
        doc.setTextColor(239, 68, 68);
        doc.text(`${diff > 0 ? "+" : ""}${diff.toFixed(2)} (SOBRESTREZ L4)`, 160, currentY + 6.5);
      }
    } else {
      doc.text("SIN REGISTROS", 115, currentY + 6.5);
      doc.text("N/D", 160, currentY + 6.5);
    }
    currentY += 10;
  });

  currentY += 12;

  doc.setFillColor(15, 23, 42);
  doc.rect(10, currentY, 190, 30, "F");
  doc.setDrawColor(31, 81, 255);
  doc.setLineWidth(0.5);
  doc.rect(10, currentY, 190, 30);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(TECH_CYAN[0], TECH_CYAN[1], TECH_CYAN[2]);
  doc.text("VEREDICTO CLÍNICO RECOMENDADO POR EL HEAD COACH (CF-L4)", 15, currentY + 7);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);

  let recommendationLine1 = "Mantener control postural estricto. Monitorear lumbares en la transición de cadera.";
  let recommendationLine2 = "El balance de acumulado e intensidad es excelente. Continuar registrando RPE.";

  const peakRpeAvg = stats.weeklyRpeCount["w3"] > 0 ? stats.weeklyRpeSum["w3"] / stats.weeklyRpeCount["w3"] : 0;
  if (peakRpeAvg > 9.0) {
    recommendationLine1 = "¡ALERTA SNC! El promedio de RPE en Peak Week indica fatiga sistémica acumulada.";
    recommendationLine2 = "Acción: Extender la fase de deload de la semana 4, RPE estricto < 6.0.";
  }

  doc.text(recommendationLine1, 15, currentY + 14);
  doc.text(recommendationLine2, 15, currentY + 20);
  doc.text("Firmado mecánicamente: Nexus L4 Clinical Advisory Suite  -  Consigo un café frío para balance de glucógeno.", 15, currentY + 26);

  doc.save(`Consolidado_Mensual_L4_${athlete.identity.toUpperCase().replace(/\s+/g, "_")}.pdf`);
};

// --- Daily JPG Export (IG Story 1080x1920) ---
// On Android/iOS (Capacitor) the WebView has no Web Share API and <a download>
// does nothing, so the image is written via Filesystem and shared with the
// native share sheet (same pattern as the CSV export). On web it tries the
// Web Share API with the file and falls back to a plain download.
export const handleExportDayJPG = async (
  activeDay: DayWorkout,
  activeVariation: DayVariation,
  currentWeek: string,
  setIsExportingJPG: (loading: boolean) => void
) => {
  setIsExportingJPG(true);
  try {
    // Wait for webfonts so the capture doesn't render with fallback fonts.
    try {
      await (document as any).fonts?.ready;
    } catch {
      // ignore — capture anyway
    }
    await new Promise((resolve) => setTimeout(resolve, 300));

    const node = document.getElementById("nexus-share-card-temp");
    if (!node) {
      emitToast("❌ No se encontró la plantilla de exportación.", "error");
      return;
    }

    // pixelRatio: 2 generates a 2160x3840 ultra-high-res PNG (lossless)
    // for pristine Instagram Story quality.
    const dataUrl = await toPng(node, {
      backgroundColor: "#f8fafc",
      width: 1080,
      height: 1920,
      pixelRatio: 2,
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
        width: "1080px",
        height: "1920px",
      },
    });

    const safeDayName = sanitizeForFilename(activeDay.name).toLowerCase();
    const safeTitleName = sanitizeForFilename(activeDay.title);
    const filename = `Nexus_L4_${currentWeek.toUpperCase()}_${safeDayName}_${safeTitleName}.png`;
    const shareTitle = `Nexus L4 — ${activeDay.title}`;
    const shareText = `¡Mi sesión de hoy en Nexus L4!\n${activeDay.name} · ${activeDay.title}`;

    // ── NATIVE (Android / iOS via Capacitor) ─────────────────────────────
    if (Capacitor.isNativePlatform()) {
      const base64Data = dataUrl.split(",")[1];
      const writeResult = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Cache,
      });

      try {
        await Share.share({
          title: shareTitle,
          text: shareText,
          url: writeResult.uri,
          dialogTitle: "Compartir Story de Nexus L4",
        });
      } catch (shareErr: any) {
        // User dismissing the share sheet is fine; on real failures keep a
        // copy in Documents so the image is reachable from the Files app.
        if (!/cancel/i.test(shareErr?.message ?? "")) {
          await Filesystem.writeFile({
            path: filename,
            data: base64Data,
            directory: Directory.Documents,
            recursive: true,
          });
          emitToast(`✅ Story guardada en Documentos/${filename}`, "success", 8000);
        }
      }
      return;
    }

    // ── WEB ──────────────────────────────────────────────────────────────
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], filename, { type: "image/jpeg" });

    if (
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [file] })
    ) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, files: [file] });
        return;
      } catch (error: any) {
        if (error?.name === "AbortError") return;
        console.log("Web Share API error, falling back to download:", error);
      }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    emitToast(`✅ Story descargada: ${filename}`, "success");
  } catch (error: any) {
    console.error("Error generando la Story JPG:", error);
    emitToast(
      "❌ Error al generar la imagen: " + (error?.message ?? String(error)),
      "error",
      8000
    );
  } finally {
    setIsExportingJPG(false);
  }
};

// --- Story VIDEO share (Fase A) ---
// Recibe el blob ya renderizado (mp4/webm) y lo comparte con el MISMO patrón
// nativo/web que la Story JPG. webm no siempre lo acepta Instagram → aviso.
export const handleShareVideo = async (
  blob: Blob,
  ext: "mp4" | "webm",
  activeDay: DayWorkout,
  currentWeek: string,
) => {
  const safeDayName = sanitizeForFilename(activeDay.name).toLowerCase();
  const safeTitleName = sanitizeForFilename(activeDay.title);
  const filename = `Nexus_L4_${currentWeek.toUpperCase()}_${safeDayName}_${safeTitleName}.${ext}`;
  const mime = ext === "mp4" ? "video/mp4" : "video/webm";
  const shareTitle = `Nexus L4 — ${activeDay.title}`;
  const shareText = `¡Mi sesión de hoy en Nexus L4!\n${activeDay.name} · ${activeDay.title}`;

  try {
    if (Capacitor.isNativePlatform()) {
      // blob → base64 sin cargar dos veces en memoria (archivos de ~10-15 MB).
      const base64Data: string = await new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onerror = () => reject(new Error("No se pudo leer el video."));
        fr.onloadend = () => resolve(String(fr.result).split(",")[1]);
        fr.readAsDataURL(blob);
      });
      const writeResult = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Cache,
      });
      try {
        await Share.share({ title: shareTitle, text: shareText, url: writeResult.uri, dialogTitle: "Compartir video de Nexus L4" });
      } catch (shareErr: any) {
        if (!/cancel/i.test(shareErr?.message ?? "")) {
          await Filesystem.writeFile({ path: filename, data: base64Data, directory: Directory.Documents, recursive: true });
          emitToast(`✅ Video guardado en Documentos/${filename}`, "success", 8000);
        }
      }
      if (ext === "webm") emitToast("ℹ️ Video en formato webm: Instagram puede no aceptarlo — compartilo por WhatsApp.", "info", 9000);
      return;
    }

    // ── WEB ──
    const file = new File([blob], filename, { type: mime });
    if (typeof navigator.share === "function" && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, files: [file] });
        return;
      } catch (error: any) {
        if (error?.name === "AbortError") return;
      }
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    emitToast(`✅ Video descargado: ${filename}`, "success");
  } catch (error: any) {
    emitToast("❌ Error al compartir el video: " + (error?.message ?? String(error)), "error", 8000);
  }
};

// --- Daily Markdown Export ---
export const handleExportDayMarkdown = (
  activeDay: DayWorkout,
  activeVariation: DayVariation,
  currentWeek: string,
  athlete: AthleteState
) => {
  let mdContent = `# NEXUS L4 - REPORTE DE ENTRENAMIENTO\n\n`;
  mdContent += `**Atleta:** ${athlete.identity.toUpperCase()}\n`;
  mdContent += `**Semana:** ${currentWeek.toUpperCase()}\n`;
  mdContent += `**Día:** ${activeDay.name} - ${activeDay.title}\n`;
  mdContent += `**Variante:** ${activeVariation.tabName}\n`;
  mdContent += `**Fecha:** ${new Date().toLocaleDateString()}\n\n`;
  mdContent += `---\n\n`;

  const blocks = [
    { name: "WARM-UP", data: activeVariation.warmup },
    { name: "FUERZA", data: activeVariation.strength },
    { name: "METCON", data: activeVariation.metcon },
    { name: "ACCESORIOS", data: activeVariation.accessories },
  ];

  blocks.forEach((block) => {
    if (block.data.items.length === 0 && !block.data.title && !block.data.scheme) return;
    
    mdContent += `## ${block.name}: ${block.data.title || ''}\n`;
    if (block.data.scheme) mdContent += `*${block.data.scheme}*\n\n`;
    
    block.data.items.forEach((item) => {
      const strippedItem = item.replace(/<[^>]*>?/gm, "").trim();
      mdContent += `### ✦ ${strippedItem}\n`;

      // Derive the same key the loggers use (getCleanExerciseName + underscores)
      // so the markdown report finds the saved sets.
      const exerciseName = getCleanExerciseName(item);
      const cleanName = exerciseName.replace(/\s+/g, '_');
      const logKey = `nexus_logs_${activeDay.id}_${cleanName}`;
      
      try {
        const rawLogs = localStorage.getItem(logKey);
        if (rawLogs) {
          const logs = JSON.parse(rawLogs);
          if (Array.isArray(logs) && logs.length > 0) {
            mdContent += `\n**Registro de Series:**\n`;
            logs.forEach((log: any, index: number) => {
              const peso = log.weight ? `${log.weight}` : "P.C.";
              const rpeStr = log.rpe ? ` | RPE: ${log.rpe}` : "";
              const rirStr = log.rir && log.rir !== "N/D" ? ` | RIR: ${log.rir}` : "";
              mdContent += `- Serie ${index + 1}: ${peso} x ${log.reps}${rpeStr}${rirStr}\n`;
            });
            mdContent += `\n`;
          } else {
            mdContent += `\n*Sin registro de series.*\n\n`;
          }
        } else {
          mdContent += `\n*Sin registro de series.*\n\n`;
        }
      } catch (e) {
        mdContent += `\n*Sin registro de series.*\n\n`;
      }
    });
    mdContent += `\n---\n\n`;
  });

  const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const safeDayName = activeDay.name.toLowerCase();
  const safeTitleName = activeDay.title.trim().replace(/[^a-zA-Z0-9_\-]/g, "_");
  link.download = `Nexus_L4_${currentWeek.toUpperCase()}_${safeDayName}_${safeTitleName}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// --- Program template JSON (for coach/AI-generated monthly plans) ---
// Downloads the active program as JSON so a coach or AI can generate the next
// month with the exact same structure, ready for "Cargar Programa".
export const handleExportProgramJSON = async (database: Record<string, any>) => {
  try {
    const json = JSON.stringify(database, null, 2);
    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `Nexus_L4_Programa_${stamp}.json`;

    if (Capacitor.isNativePlatform()) {
      const writeResult = await Filesystem.writeFile({
        path: filename,
        data: json,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
        recursive: true,
      });
      emitToast(`✅ Plantilla guardada en Documentos/${filename}`, "success", 8000);
      try {
        await Share.share({
          title: "Nexus L4 — Plantilla de Programa (JSON)",
          text: "Plantilla del programa para generar la próxima rutina (coach/IA).",
          url: writeResult.uri,
          dialogTitle: "Compartir plantilla JSON",
        });
      } catch {
        // user dismissed the share sheet — file is already saved
      }
      return;
    }

    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    emitToast(`✅ Plantilla descargada: ${filename}`, "success");
  } catch (err: any) {
    console.error("Error exportando plantilla JSON:", err);
    emitToast(
      "❌ Error al exportar la plantilla: " + (err?.message ?? String(err)),
      "error",
      8000
    );
  }
};

// --- Telemetry Backup JSON ---
export const handleExportLocalHistory = () => {
  try {
    const backupData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("nexus_logs_")) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            backupData[key] = JSON.parse(value);
          } catch {
            backupData[key] = value;
          }
        }
      }
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nexus_l4_logs_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error exporting local history:", err);
  }
};

// Build the telemetry CSV string from localStorage (single source of truth).
// Protocol-aware format — strength fills Kilos/Reps; metcons fill Rondas/RepsExtra/
// Tiempo; cardio fills Tiempo (never Kilos). The importer maps by HEADER name so
// column order/extra columns are safe.
// Header: Semana,Día,Bloque,Ejercicio,Serie,Kilos,Reps,Rondas,RepsExtra,Tiempo,RPE,RIR,Fecha
const buildTelemetryCSV = (): string => {
  const WEEK_NAMES: Record<string, string> = {
    w1: "SEMANA 1", w2: "SEMANA 2", w3: "SEMANA 3",
    w4: "SEMANA 4", w5: "SEMANA 5", w6: "SEMANA 6",
  };
  const DAY_NAMES: Record<string, string> = {
    d1: "Lunes", d2: "Martes", d3: "Miércoles",
    d4: "Jueves", d5: "Viernes", d6: "Sábado", d7: "Domingo",
  };
  const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
  const numOnly = (v: any) => String(v ?? "").replace(/[^0-9.]/g, "");

  let csvContent =
    "﻿Semana,Día,Bloque,Ejercicio,Serie,Kilos,Reps,Rondas,RepsExtra,Tiempo,RPE,RIR,Fecha\n";

  const logKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("nexus_logs_")) logKeys.push(k);
  }
  logKeys.sort();

  for (const key of logKeys) {
    const value = localStorage.getItem(key);
    if (!value) continue;
    try {
      const logs = JSON.parse(value);
      if (!Array.isArray(logs) || logs.length === 0) continue;

      const withoutPrefix = key.replace("nexus_logs_", "");
      const firstUnderscore = withoutPrefix.indexOf("_");
      const dayId = firstUnderscore === -1 ? withoutPrefix : withoutPrefix.slice(0, firstUnderscore);
      const exRaw = firstUnderscore === -1 ? "" : withoutPrefix.slice(firstUnderscore + 1);

      const weekKey = dayId.slice(0, 2);
      const dayKey = dayId.slice(2);

      const semana = WEEK_NAMES[weekKey] ?? weekKey.toUpperCase();
      const dia = DAY_NAMES[dayKey] ?? dayKey.toUpperCase();
      // Prefer the clean label stored by the wizard; else derive + clean from key.
      const derivedName = exRaw.replace(/_/g, " ");

      logs.forEach((log: any, idx: number) => {
        const bloque = String(log.block ?? "");
        const ejercicio =
          (log.exName && String(log.exName).trim()) ||
          cleanExerciseLabel(derivedName) ||
          derivedName;

        const kilos = numOnly(log.weight);
        // Strip only the "reps" suffix: "6 reps" → "6", but cardio entries
        // like "5000m / 300cal" must stay readable (numOnly would mash them
        // into "5000300"). WODForge aggregates Kilos/Rondas/RepsExtra/Tiempo,
        // not Reps, so free text here is safe for the importer.
        const reps = String(log.reps ?? "")
          .replace(/\s*reps$/i, "")
          .trim();
        const rondas = numOnly(log.rondas);
        const repsExtra = numOnly(log.repsExtra);
        const tiempo = String(log.tiempo ?? "").trim(); // keep "mm:ss" as-is
        const rpe = String(log.rpe ?? "");
        const rir = String(log.rir ?? "");
        let fecha = "";
        if (log.timestamp) fecha = new Date(log.timestamp).toLocaleDateString("es-AR");

        csvContent +=
          `${esc(semana)},${esc(dia)},${esc(bloque)},${esc(ejercicio)},${idx + 1},` +
          `${esc(kilos)},${esc(reps)},${esc(rondas)},${esc(repsExtra)},${esc(tiempo)},` +
          `${esc(rpe)},${esc(rir)},${esc(fecha)}\n`;
      });
    } catch {
      // skip malformed entries
    }
  }

  return csvContent;
};

// Sanitize a label so it is safe to use inside a filename.
const sanitizeForFilename = (s: string): string =>
  String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[^a-zA-Z0-9]+/g, "-") // non-alphanumeric → dash
    .replace(/^-+|-+$/g, "") // trim dashes
    .slice(0, 40);

// --- Telemetry backup CSV ---
// On Android (Capacitor): saves the file to the public Documents folder, shows a
// toast with the exact path, then opens the share sheet. On desktop: downloads it.
// Compatible with WODForge macros.gs "📥 Importar CSV (desde App)".
//
// `context` lets callers embed the completed day in the filename + share title,
// e.g. { dayName: "LUNES", dayTitle: "La Guarida del Mal" }.
export const handleExportLocalHistoryCSV = async (context?: {
  dayName?: string;
  dayTitle?: string;
}) => {
  try {
    const csvContent = buildTelemetryCSV();

    // Build a date + time stamp: 2026-06-07_19-55
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}_${pad(now.getHours())}-${pad(now.getMinutes())}`;

    // Optional day label (name + title) for the filename and share title.
    const dayParts = [context?.dayName, context?.dayTitle]
      .filter(Boolean)
      .map((p) => sanitizeForFilename(String(p)))
      .filter(Boolean);
    const dayLabelFile = dayParts.length ? `_${dayParts.join("_")}` : "";
    const dayLabelHuman = [context?.dayName, context?.dayTitle]
      .filter(Boolean)
      .join(" — ");

    const filename = `Nexus_L4${dayLabelFile}_${stamp}.csv`;
    const shareTitle = dayLabelHuman
      ? `Nexus L4 — ${dayLabelHuman}`
      : "Nexus L4 — Telemetría de Entrenamiento";

    // ── NATIVE (Android / iOS via Capacitor) ──────────────────────────────
    if (Capacitor.isNativePlatform()) {
      // Write to the public Documents directory so it's findable in Files app.
      const writeResult = await Filesystem.writeFile({
        path: filename,
        data: csvContent,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
        recursive: true,
      });

      const prettyPath = `Documentos/${filename}`;
      emitToast(`✅ CSV guardado en ${prettyPath}`, "success", 8000);

      // Offer to share it (WhatsApp / Drive / Gmail…) right away.
      try {
        await Share.share({
          title: shareTitle,
          text: dayLabelHuman
            ? `${dayLabelHuman} · ${now.toLocaleDateString("es-AR")} ${pad(now.getHours())}:${pad(now.getMinutes())}`
            : `Exportación ${now.toLocaleDateString("es-AR")}`,
          url: writeResult.uri,
          dialogTitle: "Enviar CSV de Nexus L4",
        });
      } catch (shareErr: any) {
        // User dismissing the share sheet is fine — the file is already saved.
        if (shareErr?.message && !/cancel/i.test(shareErr.message)) {
          console.warn("Share dismissed/failed:", shareErr);
        }
      }
      return;
    }

    // ── WEB (desktop browser) ─────────────────────────────────────────────
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Try Web Share API with a file first (some mobile browsers)
    if (
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function"
    ) {
      const file = new File([blob], filename, { type: "text/csv" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: shareTitle,
          text: dayLabelHuman
            ? `${dayLabelHuman} · ${now.toLocaleDateString("es-AR")}`
            : `Exportación ${now.toLocaleDateString("es-AR")}`,
          files: [file],
        });
        emitToast("✅ CSV compartido", "success");
        return;
      }
    }

    // Plain download fallback
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    emitToast(`✅ CSV descargado: ${filename}`, "success", 8000);
  } catch (err: any) {
    if (err?.name !== "AbortError") {
      console.error("Error al exportar CSV:", err);
      emitToast(
        "❌ Error al exportar CSV: " + (err?.message ?? String(err)),
        "error",
        8000
      );
    }
  }
};