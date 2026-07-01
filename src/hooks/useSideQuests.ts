import { useEffect, useMemo, useRef, useState } from "react";
import type { DayWorkout, DayVariation } from "../types/workout";
import { getDayReward } from "../lib/sideQuests";
import { generateSidequest } from "../services/aiService";

export interface SideQuestEntry {
  completed: boolean;
  proofText: string;
  proofFileName: string;
  checkedRom: boolean;
  checkedBio: boolean;
  checkedRpe: boolean;
  rewardItem: string;
  xpEarned: number;
  completedAt?: string;
}

export function useSideQuests(
  activeDay: DayWorkout | undefined,
  activeVariation: DayVariation | undefined,
  checkAndUnlockAchievement: (id: string) => void,
) {
  const [dailyGoals, setDailyGoals] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("nexus_daily_goals");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      // Semana 1 (Acumulación)
      w1d1: "ESTABLECER VALORES BASE CON MOVIMIENTOS CONTROLADOS",
      w1d2: "FLUSH CARDIOVASCULAR SUAVE PARA LIMPIAR LA CADENA POSTERIOR",
      w1d3: "MANTENER RPE BAJO EN CADA COMPLEJO OLÍMPICO",
      w1d4: "TRABAJO DE ACCESORIOS CON CONTRASTES EXCENTRÍCOS EXIGENTES",
      w1d5: "ZONA AERÓBICA BAJA Y LIBERACIÓN MIOFASCIAL COMPLETA",
      w1d6: "PARTNER FLOW CO-OP CON FOCO EN ACUMULACIÓN DE VOLUMEN SANO",
      w1d7: "RECARGA EN EQUIPO: DIETA PRAGMÁTICA DE GLUCÓGENO Y APAGADO SNC",

      // Semana 2 (Intensificación)
      w2d1: "AUMENTAR INTENSIDAD CONTROLADA EN BACK SQUATS (RPE Máx 6)",
      w2d2: "PRACTICAR TRANSICIONES FLUIDAS EN PULL-UPS CON AGARRE DE GANCHO",
      w2d3: "COMPLEJO OLÍMPICO PESADO SIN PERDER EL NEUTRO LUMBAR",
      w2d4: "POTENCIA: INTERVALOS CUBIERTOS EXACTOS SOBRE LA SOGA",
      w2d5: "FLUSH REGENERATIVO PLANIFICADO DE 30 MINUTOS EN PAREJA",
      w2d6: "SÁBADO DE EQUIPO: EJECUTAR SINERGIA SINCRO CON LUK",
      w2d7: "SNC RESET TOTAL: CONEXIÓN CEREBRO-MÚSCULO COMPARTIDA EN DOMINGO",

      // Semana 3 (Peak Week/Ápex)
      w3d1: "ALCANZAR ÁPEX TÉCNICO EN EL COMPLEX DE CO-OP EN PAREJAS",
      w3d2: "SOSTENER VELOCIDAD DE SALIDA BAJO FATIGA EN EL METCON",
      w3d3: "FUERZA DE AGARRE: MAXIMIZAR TENSIÓN EXCENTRICA EN ACCESORIOS SÓLIDOS",
      w3d4: "REGULAR EL CARDIO EN HAEDO FRACCIONANDO PERFECTAMENTE CADA SET",
      w3d5: "CALIDAD DEL RANGO DE MOVIMIENTO ANTES QUE LA CARGA",
      w3d6: "EXECUCIÓN CLÍNICA EXIGENTE CON PRECISIÓN MÁXIMA DE COMPAÑERO",
      w3d7: "ALINEACIÓN INTEGRAL BAJO FATIGA Y DIETA DE ENERGÍA",

      // Semana 4 (Deload / Descarga)
      w4d1: "MANTENER VELOCIDAD DE BARRA CON BAJO PESO AL 50%",
      w4d2: "ACTIVACIÓN SUAVE CON ESTIRAMIENTO PASIVO ASISTIDO",
      w4d3: "REDUCIR EL VOLUMEN METABÓLICO EN EL METCON LIGERO CO-OP",
      w4d4: "DRILLS TÉCNICOS SUTILES CON BASTÓN PVC O BARRA VACÍA",
      w4d5: "PROTEGER LUMBARES Y DESCOMPRESIÓN ESPINAL EN BARRA",
      w4d6: "PARTNER CO-OP SUAVE SIN ACUMULAR LACTATO NI AGOTAR SNC",
      w4d7: "ACTO I SELLADO: PREPARAR EL CUERPO PARA EL DESIERTO (ACTO II)",
    };
  });

  const [isGeneratingQuest, setIsGeneratingQuest] = useState(false);

  const [sideQuests, setSideQuests] = useState<Record<string, SideQuestEntry>>(
    () => {
      const saved = localStorage.getItem("nexus_daily_quests_v2");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
      return {};
    },
  );

  const [lightningFlash, setLightningFlash] = useState(false);

  const totalSideQuestXp = useMemo(() => {
    return Object.values(sideQuests)
      .filter((q: any) => q.completed)
      .reduce((acc: number, q: any) => acc + (q.xpEarned || 0), 0);
  }, [sideQuests]);

  const earnedLootList = useMemo(() => {
    return Object.values(sideQuests)
      .filter((q: any) => q.completed && q.rewardItem)
      .map((q: any) => q.rewardItem);
  }, [sideQuests]);

  // States to trigger a violent shake / electric flash animation on the day title
  const [dayTitleAlertTrigger, setDayTitleAlertTrigger] = useState(false);
  const prevQuestCompletedRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!activeDay?.id) return;
    const currentlyCompleted = !!sideQuests[activeDay.id]?.completed;
    const previouslyCompleted = !!prevQuestCompletedRef.current[activeDay.id];

    if (currentlyCompleted && !previouslyCompleted) {
      // Trigger side quest completed excitement!
      setDayTitleAlertTrigger(true);
      setTimeout(() => {
        setDayTitleAlertTrigger(false);
      }, 1500);

      // Also trigger lightning flash
      setLightningFlash(true);
      setTimeout(() => {
        setLightningFlash(false);
      }, 1200);
    }

    // Save current state as historical context
    const updatedHistory = { ...prevQuestCompletedRef.current };
    Object.keys(sideQuests).forEach((key) => {
      updatedHistory[key] = !!sideQuests[key]?.completed;
    });
    prevQuestCompletedRef.current = updatedHistory;
  }, [sideQuests, activeDay?.id]);

  const handleFetchSideQuest = async () => {
    if (!activeDay) return;
    setIsGeneratingQuest(true);
    try {
      const data = await generateSidequest(activeDay.id, activeDay.name, activeDay.title, activeVariation);
      if (data && data.sidequest) {
        const updated = {
          ...dailyGoals,
          [activeDay.id]: data.sidequest.trim().toUpperCase(),
        };
        setDailyGoals(updated);
        localStorage.setItem("nexus_daily_goals", JSON.stringify(updated));
      }
    } catch (e) {
      console.error("Error rolling sidequest:", e);
    } finally {
      setIsGeneratingQuest(false);
    }
  };

  // Auto-fetch sidequest if none exists for activeDay
  useEffect(() => {
    if (activeDay && !dailyGoals[activeDay.id] && !isGeneratingQuest) {
      handleFetchSideQuest();
    }
  }, [activeDay?.id, dailyGoals]);

  const handleValidateQuest = (
    dayId: string,
    proofText: string,
    proofFileName: string,
    checkedRom: boolean,
    checkedBio: boolean,
    checkedRpe: boolean,
  ) => {
    const rewards = getDayReward(dayId);

    // play spectacular lightning strobe flash!
    setLightningFlash(true);
    setTimeout(() => {
      setLightningFlash(false);
    }, 1200);

    const updated = {
      ...sideQuests,
      [dayId]: {
        completed: true,
        proofText,
        proofFileName,
        checkedRom,
        checkedBio,
        checkedRpe,
        rewardItem: rewards.item,
        xpEarned: rewards.xp,
        completedAt: new Date().toISOString(),
      },
    };
    setSideQuests(updated);
    localStorage.setItem("nexus_daily_quests_v2", JSON.stringify(updated));

    // Unlock achievement if complete clinical indicators are satisfied
    if (checkedRom && checkedBio && checkedRpe) {
      setTimeout(() => checkAndUnlockAchievement("clinical_sec"), 800);
    }
  };

  const handleResetQuest = (dayId: string) => {
    const updated = { ...sideQuests };
    delete updated[dayId];
    setSideQuests(updated);
    localStorage.setItem("nexus_daily_quests_v2", JSON.stringify(updated));
  };

  return {
    dailyGoals,
    setDailyGoals,
    sideQuests,
    setSideQuests,
    isGeneratingQuest,
    lightningFlash,
    setLightningFlash,
    totalSideQuestXp,
    earnedLootList,
    dayTitleAlertTrigger,
    handleFetchSideQuest,
    handleValidateQuest,
    handleResetQuest,
  };
}
