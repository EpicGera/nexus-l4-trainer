import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { getAccessToken, googleSignIn } from "./firebase";
import { exportToGoogleSheets } from "./sheets";
import { WORKOUT_DATABASE } from "../data/workouts";
import { AthleteState, DayWorkout, DayVariation } from "../types/workout";

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

  weeks.forEach((weekKey, wIdx) => {
    const weekPlan = WORKOUT_DATABASE[weekKey];
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

// --- Google Sheets Export ---
export const handleExportGoogleSheets = async (
  setIsExportingSheets: (loading: boolean) => void
) => {
  setIsExportingSheets(true);
  try {
    let token = await getAccessToken();
    if (!token) {
      const authResult = await googleSignIn();
      if (authResult?.accessToken) {
        token = authResult.accessToken;
      } else {
        throw new Error("No se pudo obtener el token de acceso.");
      }
    }

    const telemetryRows = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("log_")) {
        try {
          const rowLogs = JSON.parse(localStorage.getItem(key) || "[]");
          if (Array.isArray(rowLogs)) telemetryRows.push(...rowLogs);
        } catch {
          // ignore
        }
      }
    }

    const sheetUrl = await exportToGoogleSheets(token, telemetryRows);
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
interface CachedLogStats {
  volume: number;
  rpeSum: number;
  rpeCount: number;
  isValid: boolean;
}

const statsCache = new Map<string, { raw: string; stats: CachedLogStats }>();

export const getMonthlyVolumeStats = () => {
  const weeklyVolume: Record<string, number> = { w1: 0, w2: 0, w3: 0, w4: 0, w5: 0, w6: 0 };
  const weeklyCount: Record<string, number> = { w1: 0, w2: 0, w3: 0, w4: 0, w5: 0, w6: 0 };
  const weeklyRpeSum: Record<string, number> = { w1: 0, w2: 0, w3: 0, w4: 0, w5: 0, w6: 0 };
  const weeklyRpeCount: Record<string, number> = { w1: 0, w2: 0, w3: 0, w4: 0, w5: 0, w6: 0 };

  let totalVolume = 0;
  let totalLogsCount = 0;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("nexus_logs_")) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parts = key.split("_");
          const dayId = parts[2] || "";
          const wkKey = dayId.substring(0, 2);

          if (wkKey && weeklyVolume[wkKey] !== undefined) {
            let stats: CachedLogStats;
            const cached = statsCache.get(key);

            if (cached && cached.raw === raw) {
              stats = cached.stats;
            } else {
              stats = { volume: 0, rpeSum: 0, rpeCount: 0, isValid: false };
              try {
                const parsedLogs = JSON.parse(raw);
                if (Array.isArray(parsedLogs) && parsedLogs.length > 0) {
                  stats.isValid = true;
                  parsedLogs.forEach((set: any) => {
                    const wt = parseFloat(set.weight) || 0;
                    const rp = parseFloat(set.reps) || 0;
                    stats.volume += wt * rp;

                    const rpVal = parseFloat(set.rpe);
                    if (!isNaN(rpVal) && rpVal > 0) {
                      stats.rpeSum += rpVal;
                      stats.rpeCount++;
                    }
                  });
                }
              } catch (e) {
                // Ignore parse errors
              }
              statsCache.set(key, { raw, stats });
            }

            if (stats.isValid) {
              weeklyCount[wkKey]++;
              totalLogsCount++;

              weeklyVolume[wkKey] += stats.volume;
              totalVolume += stats.volume;

              weeklyRpeSum[wkKey] += stats.rpeSum;
              weeklyRpeCount[wkKey] += stats.rpeCount;
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("Error calculating monthly stats:", e);
  }

  return { weeklyVolume, weeklyCount, weeklyRpeSum, weeklyRpeCount, totalVolume, totalLogsCount };
};

// --- Weekly PDF Export ---
export const handleBatchPDFExport = (
  currentWeek: string,
  completedDays: Record<string, boolean>
) => {
  const activeWeekPlan = WORKOUT_DATABASE[currentWeek];
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
      isCompleted: !!completedDays[dayId],
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
  doc.text(`Frecuencia de Sesiones Loggeadas: ~${avgSessionPerWeek} por semana activa`, 15, currentY + 26);

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
    doc.text(`${stats.weeklyCount[wk]} sets`, 70, currentY + 6.5);
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

// --- Daily JPG Export ---
export const handleExportDayJPG = (
  activeDay: DayWorkout,
  activeVariation: DayVariation,
  currentWeek: string,
  setIsExportingJPG: (loading: boolean) => void
) => {
  setIsExportingJPG(true);

  setTimeout(() => {
    const node = document.getElementById("nexus-share-card-temp");
    if (!node) {
      alert("Error: No se pudo encontrar la plantilla de exportación.");
      setIsExportingJPG(false);
      return;
    }

    toPng(node, {
      quality: 1.0,
      backgroundColor: "#f8fafc",
      width: 1080,
      height: 1920,
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
        width: "1080px",
        height: "1920px",
      },
    })
      .then(async (dataUrl) => {
        setIsExportingJPG(false);
        const safeDayName = activeDay.name.toLowerCase();
        const safeTitleName = activeDay.title
          .trim()
          .replace(/[^a-zA-Z0-9_\-]/g, "_");
        const filename = `Nexus_L4_${currentWeek.toUpperCase()}_${safeDayName}_${safeTitleName}.jpg`;

        if (navigator.share) {
          try {
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], filename, { type: "image/jpeg" });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: `Nexus L4 - ${activeDay.title}`,
                text: `¡Mi sesión de hoy en Nexus L4!\nProgreso: ${activeDay.title}`,
                files: [file],
              });
              return;
            }
          } catch (error) {
            // Web Share API error, falling back to download
          }
        }

        const link = document.createElement("a");
        link.download = filename;
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error("Oops, something went wrong with JPG generation!", error);
        setIsExportingJPG(false);
      });
  }, 300);
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

// --- Telemetry backup CSV ---
export const handleExportLocalHistoryCSV = () => {
  try {
    let csvContent = "\uFEFFSemana,Día,Ejercicio,Serie,Peso,Reps,RPE,RIR,Fecha\n";
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("nexus_logs_")) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const logs = JSON.parse(value);
            if (Array.isArray(logs)) {
              const parts = key.split("_");
              const dayIdStr = parts[2] || "";
              let semanaStr = "";
              let diaStr = "";
              if (dayIdStr.length >= 4) {
                semanaStr = dayIdStr.substring(0, 2).toUpperCase();
                diaStr = dayIdStr.substring(2).toUpperCase();
              } else {
                diaStr = dayIdStr;
              }

              const exerciseName = parts
                .slice(3)
                .join(" ")
                .replace(/"/g, '""');

              logs.forEach((log: any, index: number) => {
                const peso = (log.weight || "").replace(/"/g, '""');
                const reps = (log.reps || "").replace(/"/g, '""');
                const rpe = (log.rpe || "").replace(/"/g, '""');
                const rir = (log.rir || "").replace(/"/g, '""');
                let dateStr = "";
                if (log.timestamp) {
                  const d = new Date(log.timestamp);
                  dateStr = d.toLocaleDateString() + " " + d.toLocaleTimeString();
                }

                csvContent += `"${semanaStr}","${diaStr}","${exerciseName}","${index + 1}","${peso}","${reps}","${rpe}","${rir}","${dateStr}"\n`;
              });
            }
          } catch {
            // Ignore non-json
          }
        }
      }
    }
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Nexus_L4_Telemetria_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error al exportar CSV:", err);
    alert("Error al intentar exportar la telemetría CSV.");
  }
};