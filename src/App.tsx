import React, { useState, useEffect, useMemo, useRef } from "react";
import { jsPDF } from "jspdf";
import { computeChartData, computeRpeDistributionData, computeRpeComparisonInfo } from "./lib/analyticsService";
import { svgIcons } from "./components/icons/BlockIcons";
import { toPng } from "html-to-image";
import { WORKOUT_DATABASE } from "./data/workouts";
import { AthleteState } from "./types/workout";
import CoachChat from "./components/CoachChat";
import ExerciseLogger from "./components/ExerciseLogger";
import Confetti from "./components/Confetti";
import { AchievementNotification } from "./components/AchievementNotification";
import WorkoutTimer from "./components/WorkoutTimer";
import BrzyckiCalculator from "./components/BrzyckiCalculator";
import NavigationHeader from "./components/NavigationHeader";
import BrandInspirationAccordion from "./components/BrandInspirationAccordion";
import HistoryTable from "./components/HistoryTable";
import RpeAnalyticsPanel from "./components/RpeAnalyticsPanel";
import ShareCardOverlay from "./components/ShareCardOverlay";
import WorkoutBlockCard from "./components/WorkoutBlockCard";
import TelemetryBoard from "./components/TelemetryBoard";
import ResetConfirmModal from "./components/ResetConfirmModal";
import ProfileModal from "./components/ProfileModal";
import ExportCustomizationPanel from "./components/ExportCustomizationPanel";
import {
  handleMonthTextExport as serviceMonthTextExport,
  handleExportGoogleSheets as serviceExportGoogleSheets,
  handleBatchPDFExport as serviceBatchPDFExport,
  handleGenerateMonthlyReportPDF as serviceGenerateMonthlyReportPDF,
  handleExportDayJPG as serviceExportDayJPG,
  handleExportLocalHistory as serviceExportLocalHistory,
  handleExportLocalHistoryCSV as serviceExportLocalHistoryCSV,
  getMonthlyVolumeStats,
} from "./lib/exportService";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import {
  CheckCircle2,
  Sparkles,
  Award,
  Upload,
  FileText,
  Check,
  RotateCcw,
  Edit2,
  Zap,
  Trophy,
  ShieldAlert,
  BadgeCheck,
  Dices,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  TrendingUp,
  UserCheck,
  LayoutDashboard,
  Camera,
  Share2,
  List,
  Columns,
  CloudLightning,
  ShieldCheck,
  LogOut,
  Clock,
  Users,
} from "lucide-react";

// Firebase core & sync integration
import { auth, googleProvider, googleSignIn, getAccessToken, initAuth } from "./lib/firebase";
import { signInWithPopup, signOut, User } from "firebase/auth";
import { initializeSyncEngine, pushAllLocalToCloud } from "./lib/syncEngine";
import { exportToGoogleSheets } from "./lib/sheets";

// Custom extracted components to optimize monolith App.tsx size
import DailyMissionPanel from "./components/DailyMissionPanel";
import ActiveDayHeader from "./components/ActiveDayHeader";
import CloudSyncPanel from "./components/CloudSyncPanel";
import {
  WEEK_COLOR_MAPPING,
  WEEK_ACCENT_COLORS,
  ACCENT_COLORS_MAP,
  WEEK_MID_BAND_COLORS,
  getWeekOfProgram,
  resolveBlockBrand,
  MASTER_ACHIEVEMENTS,
} from "./lib/constants";

// Default initial athlete parameters matching elite system definitions
const DEFAULT_ATHLETE: AthleteState = {
  identity: "GERARDO & FLOR",
  level: "CF-L4 Master Coach // Elite Athlete ⚡",
  restriction: "RPE 8/10 MÁX (Control Biomecánico Sano)",
  condition: "Recuperación Sistémica Post-Competencia",
  equipment: {
    grebas: "Rodilleras de Neoprene de 7mm",
    amuleto: "Calleras de Fibra de Carbono",
    filtro: "Tape Elástico de Pulgares",
  },
};

const formatItemWithTeamVolume = (itemText: string, size: number) => {
  return itemText;
};

export default function App() {
  // --- STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState({
    hasPendingWrites: false,
    fromCache: false,
    isOnline: navigator.onLine,
    lastSyncTime: Date.now()
  });

  const [realTime, setRealTime] = useState(new Date());
  const [syncWithRealTime, setSyncWithRealTime] = useState<boolean>(() => {
    const saved = localStorage.getItem("nexus_sync_real_time");
    return saved !== "false"; // Defaults to true
  });

  const [currentWeek, setCurrentWeek] = useState<string>(() => {
    const savedSync = localStorage.getItem("nexus_sync_real_time") !== "false";
    if (savedSync) {
      return getWeekOfProgram(new Date());
    }
    const saved = localStorage.getItem("nexus_current_week_slug");
    return saved && ["w1", "w2", "w3", "w4"].includes(saved) ? saved : "w2";
  });

  const [currentDayIndex, setCurrentDayIndex] = useState<number>(() => {
    const savedSync = localStorage.getItem("nexus_sync_real_time") !== "false";
    if (savedSync) {
      const jsDay = new Date().getDay();
      return jsDay === 0 ? 6 : jsDay - 1;
    }
    const saved = localStorage.getItem("nexus_current_day_idx");
    return saved ? Math.max(0, Math.min(6, parseInt(saved, 10))) : 0;
  });

  const [currentVariationIndex, setCurrentVariationIndex] = useState<number>(0);
  const [teamSize, setTeamSize] = useState<number>(() => {
    const saved = localStorage.getItem("nexus_team_size");
    return saved ? Math.max(1, Math.min(4, parseInt(saved, 10))) : 1;
  });
  const [desktopLayout, setDesktopLayout] = useState<"sidebar" | "columns">(
    () => {
      const saved = localStorage.getItem("nexus_desktop_layout");
      return saved === "sidebar" || saved === "columns" ? saved : "sidebar";
    },
  );
  const [activeBlockTab, setActiveBlockTab] = useState<
    "warmup" | "strength" | "metcon" | "accessories"
  >("warmup");
  const [rpeViewMode, setRpeViewMode] = useState<"full" | "condensed">("full");
  const [trainingCycle, setTrainingCycle] = useState<
    "fase1" | "fase2" | "fase3"
  >("fase1");
  const [athlete, setAthlete] = useState<AthleteState>(() => {
    const saved = localStorage.getItem("nexus_athlete_state");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return DEFAULT_ATHLETE;
  });
  const [showResetModal, setShowResetModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [manualSyncState, setManualSyncState] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const [tempAthlete, setTempAthlete] = useState<AthleteState>(() => {
    const saved = localStorage.getItem("nexus_athlete_state");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return DEFAULT_ATHLETE;
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [headerHeight, setHeaderHeight] = useState<number>(115);

  // Selector de color de acento para la temática del panel clínico
  const [customAccentColor, setCustomAccentColor] = useState<string>(() => {
    return localStorage.getItem("nexus_custom_accent_color") || "default";
  });

  // Mouse position and scroll tracker for #uiDayTitle reactive gradient backdrop
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Gamified achievements states
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(
    () => {
      const saved = localStorage.getItem("nexus_unlocked_achievements");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
      return [];
    },
  );
  const [activeAchievement, setActiveAchievement] = useState<{
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity: string;
    color: string;
  } | null>(null);

  const checkAndUnlockAchievement = (id: string) => {
    setUnlockedAchievements((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem("nexus_unlocked_achievements", JSON.stringify(next));

      const found = MASTER_ACHIEVEMENTS.find((a) => a.id === id);
      if (found) {
        // Trigger screen pop for exactly 3 seconds as requested
        setActiveAchievement(found);
        setTimeout(() => {
          setActiveAchievement(null);
        }, 3000);

        // Push notification for CoachChat overlay
        window.dispatchEvent(
          new CustomEvent("nexus_push_notification", {
            detail: {
              message: `¡Meta Alcanzada! Desbloqueaste la insignia: ${found.title}`,
              type: "goal",
            },
          }),
        );
      }
      return next;
    });
  };

  // Background configurations & toggle setting
  const [enableThemedBackgrounds, setEnableThemedBackgrounds] =
    useState<boolean>(() => {
      const saved = localStorage.getItem("nexus_enable_themed_backgrounds");
      return saved !== "false"; // Default to true
    });
  const [warmupBg, setWarmupBg] = useState<string>(() => {
    return (
      localStorage.getItem("nexus_bg_warmup") ||
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop"
    );
  });
  const [strengthBg, setStrengthBg] = useState<string>(() => {
    return (
      localStorage.getItem("nexus_bg_strength") ||
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop"
    );
  });
  const [metconBg, setMetconBg] = useState<string>(() => {
    const saved = localStorage.getItem("nexus_bg_metcon");
    if (
      saved ===
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop"
    ) {
      return "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=800&auto=format&fit=crop";
    }
    return (
      saved ||
      "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=800&auto=format&fit=crop"
    );
  });
  const [accessoriesBg, setAccessoriesBg] = useState<string>(() => {
    const saved = localStorage.getItem("nexus_bg_accessories");
    if (
      saved ===
      "https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=800&auto=format&fit=crop"
    ) {
      return "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop";
    }
    return (
      saved ||
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop"
    );
  });

  // Completed state tracking
  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>(
    () => {
      const result: Record<string, boolean> = {};
      ["w1", "w2", "w3", "w4"].forEach((week) => {
        for (let d = 1; d <= 7; d++) {
          const dayId = `${week}d${d}`;
          const saved = localStorage.getItem(dayId);
          if (saved !== null) {
            result[dayId] = saved === "true";
          } else {
            // Default: Week 1 completed by default to showcase progress
            result[dayId] = week === "w1";
          }
        }
      });
      return result;
    },
  );

  const activeColorSet = useMemo(() => {
    return WEEK_ACCENT_COLORS[currentWeek] || WEEK_ACCENT_COLORS.w2;
  }, [currentWeek]);

  const midBandColor = useMemo(() => {
    return WEEK_MID_BAND_COLORS[currentWeek] || WEEK_MID_BAND_COLORS.w2;
  }, [currentWeek]);

  const activeBgColorClass = useMemo(() => {
    return WEEK_COLOR_MAPPING[currentWeek] || "bg-neon-pink";
  }, [currentWeek]);

  const stats = useMemo(() => {
    return getMonthlyVolumeStats();
  }, [completedDays]);

  const globalRpeAvg = useMemo(() => {
    let totalPoints = 0;
    let totalCount = 0;
    Object.keys(stats.weeklyRpeSum).forEach((wk) => {
      totalPoints += stats.weeklyRpeSum[wk];
      totalCount += stats.weeklyRpeCount[wk];
    });
    return totalCount > 0 ? totalPoints / totalCount : 0;
  }, [stats]);

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
  const activeWeekPlan = WORKOUT_DATABASE[currentWeek];
  const activeDay = activeWeekPlan?.days[currentDayIndex];
  const activeVariation =
    activeDay?.variations[currentVariationIndex] || activeDay?.variations[0];

  const [isGeneratingQuest, setIsGeneratingQuest] = useState(false);
  const [isExportingJPG, setIsExportingJPG] = useState(false);
  const [isExportingSheets, setIsExportingSheets] = useState(false);
  const [exportBgImage, setExportBgImage] = useState<string | null>(null);
  const [exportLayout, setExportLayout] = useState<"center" | "left" | "right">(
    "center",
  );
  const [exportAthleteName, setExportAthleteName] = useState<string>("");
  const [exportInspiration, setExportInspiration] = useState<string>("");
  const [exportCardOpacity, setExportCardOpacity] = useState<number>(45);
  const [exportCardBlur, setExportCardBlur] = useState<boolean>(true);
  const [exportCardWidth, setExportCardWidth] = useState<"compact" | "standard" | "wide">("wide");
  const [exportVerticalLayout, setExportVerticalLayout] = useState<"top" | "center" | "bottom">("center");
  const [exportSilhouetteEffect, setExportSilhouetteEffect] = useState<"none" | "lighten" | "screen" | "overlay">("none");
  const [exportOverlayImage, setExportOverlayImage] = useState<string | null>(null);
  const [exportOverlayX, setExportOverlayX] = useState<number>(0);
  const [exportOverlayY, setExportOverlayY] = useState<number>(0);
  const [exportOverlayScale, setExportOverlayScale] = useState<number>(100);
  const [exportOverlayOpacity, setExportOverlayOpacity] = useState<number>(100);
  const [exportOverlayZ, setExportOverlayZ] = useState<"front" | "back">("front");
  const [exportCardHeightLimit, setExportCardHeightLimit] = useState<number>(45);
  const exportFileInputRef = useRef<HTMLInputElement>(null);
  const exportOverlayFileInputRef = useRef<HTMLInputElement>(null);

  const getDerivedInspiration = (tabName: string) => {
    const upper = tabName.toUpperCase();
    if (
      upper.includes("HAEDO") ||
      upper.includes("LUK") ||
      upper.includes("BALDE")
    )
      return "HAEDO INSPIRED";
    if (upper.includes("SAN JUSTO") || upper.includes("VALENTIN"))
      return "MAYHEM INSPIRED";
    if (upper.includes("MODO SOLO")) return "PRVN INSPIRED";
    if (upper.includes("MURPH")) return "HERO WOD INSPIRED";
    return "PRVN / HWPO INSPIRED";
  };

  // --- SIDE QUEST STATS & POOL ---
  const [sideQuests, setSideQuests] = useState<
    Record<
      string,
      {
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
    >
  >(() => {
    const saved = localStorage.getItem("nexus_daily_quests_v2");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  const [lightningFlash, setLightningFlash] = useState(false);

  // --- INTRO GLITCH ---
  const [isIntroGlitching, setIsIntroGlitching] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsIntroGlitching(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  const QUEST_LOOT_POOL = useMemo(
    () => [
      "Calleras de Carbono Rex (Tracción Mecánica Optimizada)",
      "Magnesio Profesional Antihumedad (Evita deslizamientos)",
      "Electrolitos Sódicos Concentrados (Soporte Mineral)",
      "Rodilleras de Neoprene 7mm (Estabilidad y Compresión)",
      "Muñequeras de Soporte Rígido (Estabilidad en Front Rack)",
      "Rodilleras de Compresión Anatómicas (Eficiencia Articular)",
      "Vendaje Neuromuscular Kinesiotape (Estabilidad Propioceptiva)",
      "Carbohidratos Simples Intra-entreno (Saturación de Glucógeno)",
      "Grip Gel con Sílice (Optimización de Agarre de Gancho)",
      "Cinturón Lumbar de Cuero 4'' (Aumento de Presión Intraabdominal)",
    ],
    [],
  );

  const getDayReward = (dayId: string) => {
    let hash = 0;
    for (let i = 0; i < dayId.length; i++) {
      hash = dayId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const lootIndex = Math.abs(hash) % QUEST_LOOT_POOL.length;
    const xp = 120 + (Math.abs(hash) % 9) * 10; // 120 - 200 XP
    return {
      item: QUEST_LOOT_POOL[lootIndex],
      xp: xp,
    };
  };

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

  // --- CLOUD SYNC LIFE CYCLES ---
  useEffect(() => {
    const cleanup = initializeSyncEngine((user, isSyncing) => {
      setCurrentUser(user);
      setIsCloudSyncing(isSyncing);
    });
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    const handleSyncStatus = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setSyncStatus(customEvent.detail);
      }
    };
    window.addEventListener("nexus_sync_status", handleSyncStatus);
    return () => {
      window.removeEventListener("nexus_sync_status", handleSyncStatus);
    };
  }, []);

  useEffect(() => {
    const reloadAllLocalStorageState = () => {
      const checkSync =
        localStorage.getItem("nexus_sync_real_time") !== "false";
      setSyncWithRealTime(checkSync);

      const savedWeek = localStorage.getItem("nexus_current_week_slug") || "w2";
      setCurrentWeek(savedWeek);

      const savedDayIdx = localStorage.getItem("nexus_current_day_idx");
      setCurrentDayIndex(savedDayIdx ? parseInt(savedDayIdx, 10) : 0);

      const savedAthlete = localStorage.getItem("nexus_athlete_state");
      if (savedAthlete) {
        try {
          const parsed = JSON.parse(savedAthlete);
          setAthlete(parsed);
          setTempAthlete(parsed);
        } catch (e) {
          console.error(e);
        }
      }

      // Reload completed days from localStorage
      const completed: Record<string, boolean> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          !key.startsWith("nexus_") &&
          (key.includes("completed") || key.startsWith("w"))
        ) {
          const val = localStorage.getItem(key);
          if (val === "true") {
            completed[key] = true;
          }
        }
      }
      setCompletedDays(completed);

      const savedGoals = localStorage.getItem("nexus_daily_goals");
      if (savedGoals) {
        try {
          setDailyGoals(JSON.parse(savedGoals));
        } catch (e) {
          console.error(e);
        }
      }

      const savedQuests = localStorage.getItem("nexus_daily_quests_v2");
      if (savedQuests) {
        try {
          setSideQuests(JSON.parse(savedQuests));
        } catch (e) {
          console.error(e);
        }
      }

      // Force logs visual logger re-renders
      setLogsVersion((v) => v + 1);
    };

    window.addEventListener("nexus_cloud_synced", reloadAllLocalStorageState);
    return () => {
      window.removeEventListener(
        "nexus_cloud_synced",
        reloadAllLocalStorageState,
      );
    };
  }, []);

  // Side Quest proof states
  const [proofInput, setProofInput] = useState("");
  const [selectedProofFileName, setSelectedProofFileName] = useState("");
  const [romCheck, setRomCheck] = useState(false);
  const [bioCheck, setBioCheck] = useState(false);
  const [rpeCheck, setRpeCheck] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

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
      const timer = setTimeout(() => {
        setDayTitleAlertTrigger(false);
      }, 1500);

      // Also trigger lightning flash
      setLightningFlash(true);
      const lTimer = setTimeout(() => {
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

  useEffect(() => {
    if (activeDay) {
      setProofInput(sideQuests[activeDay.id]?.proofText || "");
      setSelectedProofFileName(sideQuests[activeDay.id]?.proofFileName || "");
      setRomCheck(sideQuests[activeDay.id]?.checkedRom || false);
      setBioCheck(sideQuests[activeDay.id]?.checkedBio || false);
      setRpeCheck(sideQuests[activeDay.id]?.checkedRpe || false);
    }
  }, [activeDay?.id, sideQuests]);

  // Auto-fetch sidequest if none exists for activeDay
  useEffect(() => {
    if (activeDay && !dailyGoals[activeDay.id] && !isGeneratingQuest) {
      handleFetchSideQuest();
    }
  }, [activeDay?.id, dailyGoals]);

  const [logsVersion, setLogsVersion] = useState(0);
  const [confettiTrigger, setConfettiTrigger] = useState<number>(0);
  const [showBlastId, setShowBlastId] = useState<string | null>(null);
  const [rpeTrendRange, setRpeTrendRange] = useState<number>(30);
  const [lastLoggingPercentage, setLastLoggingPercentage] = useState<number>(0);
  const [transitionDirection, setTransitionDirection] = useState<
    "left" | "right"
  >("right");
  const [completedCompExercises, setCompletedCompExercises] = useState<{
    [key: string]: boolean;
  }>({});
  const [showRpeDemo, setShowRpeDemo] = useState<boolean>(true);

  // Multi-sheet paging states
  const [activeSheet, setActiveSheet] = useState<number>(0); // 0: Pizarrón Diario, 1: RPE & Progresiones, 2: Perfil y Telemetría
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Variation swipe states
  const [variationTouchStartX, setVariationTouchStartX] = useState<
    number | null
  >(null);
  const [variationTouchStartY, setVariationTouchStartY] = useState<
    number | null
  >(null);
  const [variationTouchEndX, setVariationTouchEndX] = useState<number | null>(
    null,
  );
  const [variationTouchEndY, setVariationTouchEndY] = useState<number | null>(
    null,
  );

  const handleVariationTouchStart = (e: React.TouchEvent) => {
    // Stop propagation to avoid driving sheet swipe on parent elements
    e.stopPropagation();
    setVariationTouchStartX(e.targetTouches[0].clientX);
    setVariationTouchStartY(e.targetTouches[0].clientY);
    setVariationTouchEndX(null);
    setVariationTouchEndY(null);
  };

  const handleVariationTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    setVariationTouchEndX(e.targetTouches[0].clientX);
    setVariationTouchEndY(e.targetTouches[0].clientY);
  };

  const handleVariationTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (variationTouchStartX === null || variationTouchEndX === null) return;
    const diffX = variationTouchStartX - variationTouchEndX;
    const diffY =
      variationTouchStartY !== null && variationTouchEndY !== null
        ? variationTouchStartY - variationTouchEndY
        : 0;

    // Validate that the swipe is primarily horizontal
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      const isSwipeLeft = diffX > 50; // Swipe left -> next variation
      const isSwipeRight = diffX < -50; // Swipe right -> prev variation

      const numVariations = activeDay?.variations.length || 0;
      if (numVariations > 1) {
        if (isSwipeLeft) {
          setCurrentVariationIndex((prev) => (prev + 1) % numVariations);
        } else if (isSwipeRight) {
          setCurrentVariationIndex(
            (prev) => (prev - 1 + numVariations) % numVariations,
          );
        }
      }
    }
    setVariationTouchStartX(null);
    setVariationTouchStartY(null);
    setVariationTouchEndX(null);
    setVariationTouchEndY(null);
  };

  const handleNextSheet = () => {
    setTransitionDirection("right"); // "se moverá a la derecha"
    setActiveSheet((prev) => (prev + 1) % 3);
  };

  const handlePrevSheet = () => {
    setTransitionDirection("left"); // "la pantalla se moverá a la izquierda"
    setActiveSheet((prev) => (prev - 1 + 3) % 3);
  };

  const handleSetActiveSheetWithDirection = (index: number) => {
    if (index > activeSheet) {
      setTransitionDirection("right");
    } else if (index < activeSheet) {
      setTransitionDirection("left");
    }
    setActiveSheet(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const isSwipeLeft = distance > 75; // Swipe left -> go next page
    const isSwipeRight = distance < -75; // Swipe right -> go prev page

    if (isSwipeLeft) {
      handleNextSheet();
    } else if (isSwipeRight) {
      handlePrevSheet();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  useEffect(() => {
    const handleLogsUpdate = () => {
      setLogsVersion((prev) => prev + 1);
    };
    window.addEventListener("nexus_logs_updated", handleLogsUpdate);
    window.addEventListener("storage", handleLogsUpdate);
    return () => {
      window.removeEventListener("nexus_logs_updated", handleLogsUpdate);
      window.removeEventListener("storage", handleLogsUpdate);
    };
  }, []);

  // Real-time dynamic stopwatch tick
  useEffect(() => {
    const timer = setInterval(() => {
      setRealTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Enforce automatic synchronization when enabled
  useEffect(() => {
    if (syncWithRealTime) {
      const now = realTime;
      const computedWeekStr = getWeekOfProgram(now);
      const jsDay = now.getDay();
      const computedDayIdx = jsDay === 0 ? 6 : jsDay - 1; // Mon -> 0, ..., Sun -> 6

      if (currentWeek !== computedWeekStr) {
        setCurrentWeek(computedWeekStr);
      }
      if (currentDayIndex !== computedDayIdx) {
        setCurrentDayIndex(computedDayIdx);
      }
    }
  }, [realTime, syncWithRealTime, currentWeek, currentDayIndex]);

  const chartData = useMemo(() => {
    return computeChartData(currentWeek, logsVersion);
  }, [currentWeek, logsVersion]);

  const rpeDistributionData = useMemo(() => {
    return computeRpeDistributionData(currentWeek, logsVersion);
  }, [currentWeek, logsVersion]);

  // --- DYNAMIC RPE COMPARISON & OVERTRAINING DETECTOR (CF-L4) ---
  const rpeComparisonInfo = useMemo(() => {
    if (!activeDay) return null;
    return computeRpeComparisonInfo(currentWeek, activeDay.id, logsVersion);
  }, [activeDay, currentWeek, logsVersion]);

  // --- SAVE TO LOCALSTORAGE ---
  useEffect(() => {
    localStorage.setItem("nexus_current_week_slug", currentWeek);
  }, [currentWeek]);

  useEffect(() => {
    localStorage.setItem("nexus_current_day_idx", String(currentDayIndex));
  }, [currentDayIndex]);

  // Reset variation index on day or week change
  useEffect(() => {
    setCurrentVariationIndex(0);
  }, [currentWeek, currentDayIndex]);

  // --- COLLAPSIBLE QUICK HISTORY FOR THE 4 TRAINING BLOCKS ---
  const [expandedBlockHistory, setExpandedBlockHistory] = useState<
    Record<string, boolean>
  >({
    warmup: false,
    strength: false,
    metcon: false,
    accessories: false,
  });

  // Extract a compact version keeping reps and protocol but stripping cue text
  const getCompactSidebarText = (itemText: string): string => {
    let cleaned = itemText.replace(
      /<span\s+class(?:Name)?=['"]cue['"]>[\s\S]*?<\/span>/gi,
      "",
    );
    cleaned = cleaned.replace(/<[^>]*>/g, "").trim();
    return cleaned;
  };

  const toggleDayCompleted = (dayId: string) => {
    setCompletedDays((prev) => {
      const nextState = !prev[dayId];
      if (nextState) {
        setConfettiTrigger((v) => v + 1);
        setShowBlastId(dayId);
        setTimeout(() => setShowBlastId(null), 1500);
      }
      localStorage.setItem(dayId, String(nextState));
      // Dispatch custom logs update event to refresh statistics automatically
      window.dispatchEvent(new Event("nexus_logs_updated"));

      const nextMap = { ...prev, [dayId]: nextState };

      // Compute total completed days to unlock milestones
      let totalCompleted = 0;
      Object.keys(WORKOUT_DATABASE).forEach((week) => {
        WORKOUT_DATABASE[week].days.forEach((day) => {
          if (nextMap[day.id]) {
            totalCompleted++;
          }
        });
      });

      if (nextState) {
        if (totalCompleted >= 1) {
          setTimeout(() => checkAndUnlockAchievement("first_day"), 500);
        }
        if (totalCompleted >= 5) {
          setTimeout(() => checkAndUnlockAchievement("five_days"), 750);
        }

        // Check for a perfect week (all 7 days completed)
        let activeWeekCompletedCount = 0;
        for (let d = 1; d <= 7; d++) {
          if (nextMap[`${currentWeek}d${d}`]) {
            activeWeekCompletedCount++;
          }
        }
        if (activeWeekCompletedCount === 7) {
          setTimeout(() => checkAndUnlockAchievement("perfect_week"), 1000);
        }
      }

      return nextMap;
    });
  };

  // Calculate dynamic RPG XP
  const getXpProgress = () => {
    let totalCompleted = 0;
    Object.keys(WORKOUT_DATABASE).forEach((week) => {
      WORKOUT_DATABASE[week].days.forEach((day) => {
        if (completedDays[day.id]) {
          totalCompleted++;
        }
      });
    });
    // Escalado de XP (base de 100 XP por día completado) + 800 XP base + XP de Side Quests
    const currentXp = 800 + totalCompleted * 100 + totalSideQuestXp;
    const percentage = Math.min((currentXp / 2000) * 100, 100);
    return { currentXp, percentage };
  };

  const handleMonthTextExport = () => {
    serviceMonthTextExport();
  };

  const handleExportGoogleSheets = () => {
    serviceExportGoogleSheets(setIsExportingSheets);
  };

  const handleBatchPDFExport = () => {
    serviceBatchPDFExport(currentWeek, completedDays);
  };
  const handleGenerateMonthlyReportPDF = () => {
    serviceGenerateMonthlyReportPDF(athlete);
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setExportBgImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOverlayImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setExportOverlayImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportDayJPG = () => {
    if (!activeDay || !activeVariation) return;
    serviceExportDayJPG(activeDay, activeVariation, currentWeek, setIsExportingJPG);
  };

  const { currentXp, percentage: xpPercentage } = getXpProgress();

  // Weekly Completion: Count how many of the 7 days are complete for currentWeek (w1, w2, w3, w4)
  const weeklyCompletionInfo = useMemo(() => {
    let completedCount = 0;
    for (let d = 1; d <= 7; d++) {
      if (completedDays[`${currentWeek}d${d}`]) {
        completedCount++;
      }
    }
    const percentage = Math.min(100, Math.round((completedCount / 7) * 100));
    return { completedCount, percentage };
  }, [completedDays, currentWeek]);

  // Active Day Logging Achievement: Percentage of physical exercises that have at least one saved log
  const activeDayLoggingPercentage = useMemo(() => {
    if (!activeDay || !activeVariation) return 0;

    const allExercises: string[] = [
      ...(activeVariation.warmup?.items || []),
      ...(activeVariation.strength?.items || []),
      ...(activeVariation.metcon?.items || []),
      ...(activeVariation.accessories?.items || []),
    ];

    if (allExercises.length === 0) return 0;

    let loggedCount = 0;
    allExercises.forEach((item) => {
      const cleanName = item.replace(/<[^>]*>/g, "").trim();
      const key = `nexus_logs_${activeDay.id}_${cleanName}`;
      const val = localStorage.getItem(key);
      if (val) {
        try {
          const sets = JSON.parse(val);
          if (Array.isArray(sets) && sets.length > 0) {
            loggedCount++;
          }
        } catch {
          // ignore
        }
      }
    });

    return Math.min(100, Math.round((loggedCount / allExercises.length) * 100));
  }, [activeDay, activeVariation, logsVersion]);

  // Trigger celebration particles when the active day's routines are 100% completed
  useEffect(() => {
    if (
      activeDayLoggingPercentage === 100 &&
      lastLoggingPercentage < 100 &&
      lastLoggingPercentage > 0
    ) {
      setConfettiTrigger((prev) => prev + 1);
    }
    setLastLoggingPercentage(activeDayLoggingPercentage);
  }, [activeDayLoggingPercentage, lastLoggingPercentage]);

  // Reset progress handlers
  const handleConfirmReset = () => {
    localStorage.clear();
    const resetting: Record<string, boolean> = {};
    ["w1", "w2", "w3", "w4"].forEach((week) => {
      for (let d = 1; d <= 7; d++) {
        const dayId = `${week}d${d}`;
        // Re-set default: Week 1 is pre-completed
        resetting[dayId] = week === "w1";
        localStorage.setItem(dayId, week === "w1" ? "true" : "false");
      }
    });
    setCompletedDays(resetting);
    setCurrentWeek("w2");
    setCurrentDayIndex(0);
    setCurrentVariationIndex(0);
    setAthlete(DEFAULT_ATHLETE);
    setShowResetModal(false);
  };

  const handleUpdateAthlete = (updated: AthleteState) => {
    setAthlete(updated);
    localStorage.setItem("nexus_athlete_state", JSON.stringify(updated));
    window.dispatchEvent(new Event("nexus_athlete_updated"));

    // Check for level/discipline-based achievements
    if (updated.level) {
      const lvlUpper = updated.level.toUpperCase();
      if (lvlUpper.includes("HWPO GRIND")) {
        setTimeout(() => checkAndUnlockAchievement("fraser_grind"), 600);
      } else if (
        lvlUpper.includes("HAEDO ADAPTIVE") ||
        lvlUpper.includes("BALDE")
      ) {
        setTimeout(() => checkAndUnlockAchievement("adaptive_coke"), 600);
      }
    }
  };

  const startEditingName = () => {
    setTempName(athlete.identity);
    setIsEditingName(true);
  };

  const saveName = () => {
    setIsEditingName(false);
    if (tempName.trim()) {
      handleUpdateAthlete({
        ...athlete,
        identity: tempName.trim().toUpperCase(),
      });
    }
  };

  const handleToggleSync = () => {
    const nextSync = !syncWithRealTime;
    setSyncWithRealTime(nextSync);
    localStorage.setItem("nexus_sync_real_time", String(nextSync));
    if (nextSync) {
      const now = new Date();
      const autoWeek = getWeekOfProgram(now);
      const jsDay = now.getDay();
      const autoDayIndex = jsDay === 0 ? 6 : jsDay - 1;

      setCurrentWeek(autoWeek);
      setCurrentDayIndex(autoDayIndex);
    }
  };

  const handleFetchSideQuest = async () => {
    if (!activeDay) return;
    setIsGeneratingQuest(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/sidequest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayId: activeDay.id,
          dayName: activeDay.name,
          dayTitle: activeDay.title,
          variation: activeVariation,
        }),
      });
      const data = await response.json();
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

  const handleExportLocalHistory = () => {
    serviceExportLocalHistory();
  };

  const handleExportLocalHistoryCSV = () => {
    serviceExportLocalHistoryCSV();
  };

  const renderExplicitTimeCapBlock = (
    schemeText: string,
    blockType: "warmup" | "strength" | "metcon" | "accessories",
    isColumns = false,
  ) => {
    if (!schemeText) return null;

    let summaryText = schemeText.trim();

    // Helper functions for common shortening
    const cleanStr = (s: string) =>
      s
        .replace(/MINUTOS|MINS/gi, "MIN")
        .replace(/SEGUNDOS|SECS/gi, "SEG")
        .replace(/RONDAS/gi, "RONDAS")
        .replace(/SERIES/gi, "SERIES");

    let mainText = cleanStr(summaryText);
    let restText = "";

    // 1. Separate Rest/Pausa/Descanso text to a secondary line
    if (mainText.includes("|")) {
      const parts = mainText.split("|");
      mainText = parts[0].trim();
      restText = parts.slice(1).join(" | ").trim();
    } else {
      const restRegex =
        /\b(\d+["']?\s*(?:S|SEG|SECS|SEGUNDOS|M|MIN)?\s*(?:REST|PAUSA|DESCANSO).*)|(?:REST|PAUSA|DESCANSO)\b(.*)/i;
      const match = mainText.match(restRegex);
      if (match) {
        restText = match[0].trim();
        mainText = mainText.replace(restRegex, "").trim();
      }
    }

    // Clean up trailing/leading junk from maintext
    mainText = mainText.replace(/(^[-/,]+|[-/,]+$)/g, "").trim();

    const mainTextUpper = mainText.toUpperCase();
    const restTextUpper = restText.toUpperCase();
    const hasCap =
      /(?:CAP|TIME CAP|TC)\s*\d+/i.test(mainTextUpper) ||
      /(?:CAP|TIME CAP|TC)\s*\d+/i.test(restTextUpper);

    // 2. Default Time Caps injected as secondary text if missing and needed
    if (blockType === "warmup") {
      if (!hasCap && !mainTextUpper.includes("MIN")) {
        restText += (restText ? " | " : "") + "10 MIN CAP";
      }
    } else if (blockType === "strength") {
      if (!hasCap) {
        restText += (restText ? " | " : "") + "15 MIN CAP";
      }
      if (
        !restTextUpper.includes("DESCANSO") &&
        !mainTextUpper.includes("DESCANSO") &&
        !restTextUpper.includes("REST") &&
        !mainTextUpper.includes("REST") &&
        !mainTextUpper.includes("PAUSA") &&
        !restTextUpper.includes("PAUSA")
      ) {
        restText +=
          (restText ? " | " : "") + "DESCANSO ENTRE SERIES: 90S - 120S";
      }
    } else if (blockType === "metcon") {
      if (
        !mainTextUpper.includes("AMRAP") &&
        !mainTextUpper.includes("FOR TIME") &&
        !mainTextUpper.includes("EMOM") &&
        !mainTextUpper.includes("TABATA")
      ) {
        if (mainTextUpper.includes("RONDAS")) {
          mainText = `FOR TIME: ${mainText}`;
        }
      }
      if (!hasCap && !mainTextUpper.includes("MIN")) {
        restText += (restText ? " | " : "") + "15 MIN CAP";
      }
    } else if (blockType === "accessories") {
      if (!hasCap) {
        restText += (restText ? " | " : "") + "12 MIN CAP";
      }
      if (
        !restTextUpper.includes("DESCANSO") &&
        !mainTextUpper.includes("DESCANSO") &&
        !restTextUpper.includes("REST") &&
        !mainTextUpper.includes("REST") &&
        !mainTextUpper.includes("PAUSA") &&
        !restTextUpper.includes("PAUSA")
      ) {
        restText +=
          (restText ? " | " : "") + "DESCANSO ENTRE SERIES: 60S - 90S";
      }
    }

    return (
      <div
        style={{ ...midBandColor.bgStyle, color: midBandColor.text }}
        className={`px-3 py-2 font-mono flex flex-col justify-center w-full min-h-[48px] uppercase select-none shadow-[inset_0_2px_4px_rgba(255,255,255,0.25)] rounded-none text-center leading-tight gap-0.5`}
      >
        <span
          className={`font-sans font-black tracking-wide uppercase ${
            isColumns
              ? "text-[11px] xl:text-[12px]"
              : "text-[13px] md:text-[14px] lg:text-[15px]"
          } drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]`}
          title={mainText}
        >
          {mainText}
        </span>
        {restText && (
          <span
            className={`font-sans font-bold tracking-widest uppercase opacity-90 ${
              isColumns
                ? "text-[8.5px] xl:text-[9px]"
                : "text-[9.5px] md:text-[10px] lg:text-[11px]"
            }`}
          >
            {restText}
          </span>
        )}
      </div>
    );
  };

  const renderExportCustomizationPanel = () => {
    return (
      <ExportCustomizationPanel
        exportBgImage={exportBgImage}
        setExportBgImage={setExportBgImage}
        exportLayout={exportLayout}
        setExportLayout={setExportLayout}
        exportVerticalLayout={exportVerticalLayout}
        setExportVerticalLayout={setExportVerticalLayout}
        exportCardWidth={exportCardWidth}
        setExportCardWidth={setExportCardWidth}
        exportAthleteName={exportAthleteName}
        setExportAthleteName={setExportAthleteName}
        exportInspiration={exportInspiration}
        setExportInspiration={setExportInspiration}
        exportCardBlur={exportCardBlur}
        setExportCardBlur={setExportCardBlur}
        exportCardOpacity={exportCardOpacity}
        setExportCardOpacity={setExportCardOpacity}
        exportOverlayImage={exportOverlayImage}
        setExportOverlayImage={setExportOverlayImage}
        exportOverlayX={exportOverlayX}
        setExportOverlayX={setExportOverlayX}
        exportOverlayY={exportOverlayY}
        setExportOverlayY={setExportOverlayY}
        exportOverlayScale={exportOverlayScale}
        setExportOverlayScale={setExportOverlayScale}
        exportOverlayZ={exportOverlayZ}
        setExportOverlayZ={setExportOverlayZ}
        exportCardHeightLimit={exportCardHeightLimit}
        setExportCardHeightLimit={setExportCardHeightLimit}
        handleOverlayImageUpload={handleOverlayImageUpload}
      />
    );
  };

  const renderWarmupBlock = (isColumns = false) => {
    return (
      <WorkoutBlockCard
        blockType="warmup"
        activeVariation={activeVariation!}
        activeDay={activeDay}
        isColumns={isColumns}
        enableThemedBackgrounds={enableThemedBackgrounds}
        backgroundImage={warmupBg}
        icon={svgIcons.warmup}
        globalRpeAvg={globalRpeAvg}
        teamSize={teamSize}
        currentVariationIndex={currentVariationIndex}
        formatItemWithTeamVolume={formatItemWithTeamVolume}
        renderExplicitTimeCapBlock={renderExplicitTimeCapBlock}
        handleVariationTouchStart={handleVariationTouchStart}
        handleVariationTouchMove={handleVariationTouchMove}
        handleVariationTouchEnd={handleVariationTouchEnd}
      />
    );
  };

  const renderStrengthBlock = (isColumns = false) => {
    return (
      <WorkoutBlockCard
        blockType="strength"
        activeVariation={activeVariation!}
        activeDay={activeDay}
        isColumns={isColumns}
        enableThemedBackgrounds={enableThemedBackgrounds}
        backgroundImage={strengthBg}
        icon={svgIcons.strength}
        globalRpeAvg={globalRpeAvg}
        teamSize={teamSize}
        currentVariationIndex={currentVariationIndex}
        formatItemWithTeamVolume={formatItemWithTeamVolume}
        renderExplicitTimeCapBlock={renderExplicitTimeCapBlock}
        handleVariationTouchStart={handleVariationTouchStart}
        handleVariationTouchMove={handleVariationTouchMove}
        handleVariationTouchEnd={handleVariationTouchEnd}
        isHistoryExpanded={expandedBlockHistory.strength}
        onToggleHistory={() =>
          setExpandedBlockHistory((prev) => ({
            ...prev,
            strength: !prev.strength,
          }))
        }
      />
    );
  };

  const renderMetconBlock = (isColumns = false) => {
    return (
      <WorkoutBlockCard
        blockType="metcon"
        activeVariation={activeVariation!}
        activeDay={activeDay}
        isColumns={isColumns}
        enableThemedBackgrounds={enableThemedBackgrounds}
        backgroundImage={metconBg}
        icon={svgIcons.metcon}
        globalRpeAvg={globalRpeAvg}
        teamSize={teamSize}
        currentVariationIndex={currentVariationIndex}
        formatItemWithTeamVolume={formatItemWithTeamVolume}
        renderExplicitTimeCapBlock={renderExplicitTimeCapBlock}
        handleVariationTouchStart={handleVariationTouchStart}
        handleVariationTouchMove={handleVariationTouchMove}
        handleVariationTouchEnd={handleVariationTouchEnd}
        isHistoryExpanded={expandedBlockHistory.metcon}
        onToggleHistory={() =>
          setExpandedBlockHistory((prev) => ({
            ...prev,
            metcon: !prev.metcon,
          }))
        }
      />
    );
  };

  const renderAccessoriesBlock = (isColumns = false) => {
    return (
      <WorkoutBlockCard
        blockType="accessories"
        activeVariation={activeVariation!}
        activeDay={activeDay}
        isColumns={isColumns}
        enableThemedBackgrounds={enableThemedBackgrounds}
        backgroundImage={accessoriesBg}
        icon={svgIcons.accessories}
        globalRpeAvg={globalRpeAvg}
        teamSize={teamSize}
        currentVariationIndex={currentVariationIndex}
        formatItemWithTeamVolume={formatItemWithTeamVolume}
        renderExplicitTimeCapBlock={renderExplicitTimeCapBlock}
        handleVariationTouchStart={handleVariationTouchStart}
        handleVariationTouchMove={handleVariationTouchMove}
        handleVariationTouchEnd={handleVariationTouchEnd}
        isHistoryExpanded={expandedBlockHistory.accessories}
        onToggleHistory={() =>
          setExpandedBlockHistory((prev) => ({
            ...prev,
            accessories: !prev.accessories,
          }))
        }
      />
    );
  };


  return (
    <div
      style={
        {
          "--color-electric-blue": activeColorSet.color,
          "--shadow-blue-glow": activeColorSet.shadow,
          "--header-height": `${headerHeight}px`,
          paddingTop: `calc(${headerHeight}px + env(safe-area-inset-top, 0px))`, // Explicit pt-safe padding calculation preventing menu overlaps and including env(safe-area-inset-top)
        } as React.CSSProperties
      }
      className="text-white font-sans min-h-screen flex flex-col app-content-wrapper select-none relative overflow-x-clip pt-safe"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Confetti trigger={confettiTrigger} />
      <AnimatePresence>
        {activeAchievement && (
          <AchievementNotification
            achievement={activeAchievement}
            onClose={() => setActiveAchievement(null)}
          />
        )}
      </AnimatePresence>
      <NavigationHeader
        activeSheet={activeSheet}
        setActiveSheet={handleSetActiveSheetWithDirection}
        syncWithRealTime={syncWithRealTime}
        currentWeek={currentWeek}
        realTime={realTime}
        handleToggleSync={handleToggleSync}
        activeDayName={activeWeekPlan?.days[currentDayIndex]?.name}
        setShowProfileModal={setShowProfileModal}
        onHeightChange={setHeaderHeight}
      />

      {/* Dynamic Lightning Flash Overlay */}
      <AnimatePresence>
        {lightningFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.95, 0.4, 1, 0],
              backgroundColor: [
                "rgba(251,191,36,0)",
                "rgba(251,191,36,0.95)",
                "rgba(34,212,238,0.9)",
                "rgba(255,255,255,1)",
                "rgba(0,0,0,0)",
              ],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] pointer-events-none flex flex-col items-center justify-center border-[20px] border-amber-400"
          >
            <div className="text-center text-black font-mono select-none drop-shadow-sm filter p-8 bg-amber-400 border-4 border-black rotate-[-2deg] max-w-lg mx-4">
              <div className="text-8xl md:text-9xl">⚡</div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mt-4">
                NUEVO PR REGISTRADO
              </h2>
              <p className="text-sm md:text-md font-bold font-mono tracking-widest mt-2 uppercase bg-black text-white px-4 py-1.5 inline-block">
                SISTEMA VALIDADO • CAPACIDAD INCREMENTADA
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic hot brutalist backstripe column inside the board canvas with color matching the active week */}
      <div
        aria-hidden="true"
        className={`fixed top-0 bottom-0 left-[43%] w-[14%] -z-10 opacity-20 pointer-events-none select-none transition-all duration-500 ${activeBgColorClass}`}
      />

      {/* 1. WEEK SELECTION HORIZONTAL BAR */}
      <div className="w-full bg-white/5 backdrop-blur-md border-y border-white/10 mb-2 no-print">
        <div className="mx-auto px-6 md:px-10 flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-4">
          <div
            id="weekNav"
            className="flex gap-4 overflow-x-auto scrollbar-hide text-3xl"
          >
            {["w1", "w2", "w3", "w4"].map((w) => {
              const isActive = w === currentWeek;
              return (
                <button
                  key={w}
                  className={`px-4 py-2 border-b-4 transition-all font-brutalist tracking-[0.15em] text-xl cursor-pointer ${
                    isActive
                      ? "text-electric-blue border-electric-blue font-black shadow-[0_4px_10px_rgba(0,212,255,0.4)]"
                      : "text-white/80 border-transparent hover:text-white hover:border-white/40"
                  }`}
                  onClick={() => {
                    setSyncWithRealTime(false);
                    localStorage.setItem("nexus_sync_real_time", "false");
                    setCurrentWeek(w);
                  }}
                >
                  SEM {w.replace("w", "")}
                </button>
              );
            })}
          </div>

          {/* EXPORT ROW */}
          <div className="flex gap-2 w-full sm:w-auto h-full items-center justify-start sm:justify-end shrink-0">
            {/* TEXT EXPORT TRIGGER */}
            <button
              onClick={handleMonthTextExport}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-white border border-transparent rounded shadow-sm hover:shadow-sm active:scale-95 transition-all text-[11px] sm:text-xs font-brutalist tracking-wider font-extrabold uppercase shrink-0 cursor-pointer self-start sm:self-auto"
              title="Exportar programa completo del mes a archivo de texto (TXT) para auditar"
            >
              <FileText size={14} className="text-zinc-400" />
              <span className="hidden sm:inline">TXT MES</span>
            </button>

            {/* GOOGLE SHEETS EXPORT TRIGGER */}
            <button
              onClick={handleExportGoogleSheets}
              disabled={isExportingSheets}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white border border-transparent rounded shadow-sm hover:shadow-sm active:scale-95 transition-all text-[11px] sm:text-xs font-brutalist tracking-wider font-extrabold uppercase shrink-0 cursor-pointer self-start sm:self-auto"
              title="Sincronizar programación y resultados con Google Sheets"
            >
              <Upload size={14} className={isExportingSheets ? 'animate-bounce text-[#a7f3d0]' : 'text-[#a7f3d0]'} />
              <span>{isExportingSheets ? 'SINC. SHEETS...' : 'SYNC SHEETS'}</span>
            </button>

            {/* BATCH WEEK PDF EXPORT TRIGGER */}
            <button
              id="btn-quick-pdf"
              onClick={handleBatchPDFExport}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white border border-transparent rounded shadow-sm hover:shadow-sm active:scale-95 transition-all text-[11px] sm:text-xs font-brutalist tracking-wider font-extrabold uppercase shrink-0 cursor-pointer self-start sm:self-auto"
              title="Exportar reporte consolidado de toda la semana de entrenamiento actual a PDF con distribución de RPE"
            >
              <FileText size={14} className=" text-[#00f0ff]" />
              <span>EXPORTAR SEMANA</span>
            </button>
          </div>
        </div>
      </div>

      {/* FLOATING NEXT/PREV NAVIGATION BUTTONS (DESKTOP ONLY) */}
      <div className="hidden lg:block no-print">
        <button
          onClick={handlePrevSheet}
          className="fixed left-4 top-1/2 -translate-y-1/2 z-45 bg-[#0A0A0E]/90 hover:bg-electric-blue/20 border-2 border-white/10 hover:border-electric-blue text-white rounded-full p-3.5 shadow-lg active:scale-90 transition-all cursor-pointer group  shadow-sm"
          title="Ver pantalla anterior (Deslizar Izquierda)"
        >
          <ChevronLeft
            size={22}
            className="group-hover:text-electric-blue transition-colors"
          />
        </button>
        <button
          onClick={handleNextSheet}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-45 bg-[#0A0A0E]/90 hover:bg-electric-blue/20 border-2 border-white/10 hover:border-electric-blue text-white rounded-full p-3.5 shadow-lg active:scale-90 transition-all cursor-pointer group  shadow-sm"
          title="Ver pantalla siguiente (Deslizar Derecha)"
        >
          <ChevronRight
            size={22}
            className="group-hover:text-electric-blue transition-colors"
          />
        </button>
      </div>

      {/* THREE INTERACTIVE SHEETS CONTAINER */}
      <AnimatePresence mode="wait">
        {activeSheet === 0 && (
          <motion.div
            key="sheet-workout"
            initial={{
              opacity: 0,
              x: transitionDirection === "right" ? 300 : -300,
            }}
            animate={{ opacity: 1, x: 0 }}
            exit={{
              opacity: 0,
              x: transitionDirection === "right" ? -300 : 300,
            }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="flex-grow flex flex-col"
          >
            {/* 2. DAY SELECTION FILTER CHIPS */}
            <div className="w-full bg-white/5 backdrop-blur-md mb-2 md:mb-4 no-print relative border-b border-white/5">
              {/* Degradiente inferior indicando colores de la semana al deslizador de abajo */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1 z-0 shadow-sm"
                style={{
                  background: `linear-gradient(90deg, ${midBandColor.bg} 0%, ${activeColorSet.color} 100%)`,
                }}
              />
              <div className="mx-auto px-6 md:px-10 relative z-10">
                <div
                  id="dayNav"
                  className="flex gap-2 overflow-x-auto py-3 scrollbar-hide text-xl"
                >
                  {activeWeekPlan?.days.map((day, idx) => {
                    const isCompleted = completedDays[day.id];
                    const isActive = idx === currentDayIndex;

                    let statusClass =
                      "text-white/70 hover:bg-white/10 hover:text-white bg-white/5";
                    let activeStyle = {};
                    if (isCompleted) {
                      statusClass =
                        "text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-100 bg-emerald-500/5";
                    }
                    if (isActive) {
                      if (isCompleted) {
                        statusClass = "bg-emerald-500 text-black font-black";
                      } else {
                        statusClass = "text-black font-black shadow-md";
                        activeStyle = {
                          background: `linear-gradient(135deg, ${midBandColor.bg} 0%, ${activeColorSet.color} 100%)`,
                          boxShadow: `0 0 15px ${activeColorSet.color}60`,
                        };
                      }
                    }

                    return (
                      <button
                        key={day.id}
                        className={`px-5 py-2.5 rounded-none font-brutalist text-lg tracking-[0.2em] transition-all cursor-pointer ${statusClass}`}
                        style={activeStyle}
                        onClick={() => {
                          setSyncWithRealTime(false);
                          localStorage.setItem("nexus_sync_real_time", "false");
                          setCurrentDayIndex(idx);
                        }}
                      >
                        {day.name.charAt(0)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. HERO WHITEBOARD HEADER */}
            {activeDay && (
              <header
                className="mb-2 text-center flex flex-col justify-center items-center relative"
                data-purpose="page-title"
              >
                <div className="mb-2 md:mb-4 z-10 flex gap-3 select-none items-center">
                  <img src="/logo.svg" alt="" className="w-6 h-6 md:w-8 md:h-8 object-contain animate-pulse" />
                  <img src="/logo.svg" alt="" className="w-6 h-6 md:w-8 md:h-8 object-contain animate-pulse" style={{ animationDelay: "150ms" }} />
                  <img src="/logo.svg" alt="" className="w-6 h-6 md:w-8 md:h-8 object-contain animate-pulse" style={{ animationDelay: "300ms" }} />
                </div>
                <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] 2xl:text-[11rem] font-black tracking-tighter leading-none uppercase flex flex-wrap justify-center items-center gap-x-4 transition-all duration-300 min-h-[5.5rem] md:min-h-[7rem] z-10">
                  <span>{activeDay.name}</span>
                  <img 
                    src="/logo.svg" 
                    alt="Nexus L4" 
                    className="align-middle w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain cursor-pointer transition-all duration-300 hover:scale-110 inline-block"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.filter = `drop-shadow(0 0 12px var(--color-electric-blue)) drop-shadow(0 0 25px var(--color-electric-blue))`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.filter = "none";
                    }}
                  />
                  {isEditingName ? (
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onBlur={saveName}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveName();
                        if (e.key === "Escape") setIsEditingName(false);
                      }}
                      className="bg-zinc-900 text-white border-2 border-electric-blue font-brutalist text-5xl sm:text-6xl md:text-7xl uppercase px-4 py-1.5 focus:outline-none text-center max-w-[480px] shadow-blue-glow inline-block"
                      autoFocus
                    />
                  ) : (
                    <span
                      className="text-white hover:text-electric-blue cursor-pointer transition-all relative group inline-flex items-center gap-2 border-0"
                      onClick={startEditingName}
                      title="Haz clic para cambiar nombre de atleta"
                    >
                      <span>{athlete.identity}</span>
                      <span className="text-2xl md:text-3xl text-electric-blue opacity-50 group-hover:opacity-100 transition-opacity">
                        ✎
                      </span>
                    </span>
                  )}
                </h1>
              </header>
            )}

            {/* STICKY DAY TITLE WRAPPER WITH REACTIVE BRUTALIST BACKDROP */}
            <ActiveDayHeader
              activeDay={activeDay}
              completedDays={completedDays}
              headerHeight={headerHeight}
              mousePos={mousePos}
              setMousePos={setMousePos}
              scrollY={scrollY}
              isIntroGlitching={isIntroGlitching}
              dayTitleAlertTrigger={dayTitleAlertTrigger}
            />

            {/* HERO WHITEBOARD SUBHEADER & GOAL */}
            {activeDay && (
              <div
                className="mb-6 md:mb-10 text-center flex flex-col justify-center items-center"
                data-purpose="page-sub-title"
              >
                <div
                  id="uiWeekIndicator"
                  className="text-xs sm:text-sm md:text-base lg:text-lg text-white/95 font-bold tracking-[0.25em] mt-5 md:mt-8 font-condensed inline-block border-y border-white/25 py-2 px-8 bg-pure-black/70"
                >
                  ACTO I • SEMANA {currentWeek.replace("w", "")} •{" "}
                  {currentWeek === "w1"
                    ? "ACUMULACIÓN"
                    : currentWeek === "w2"
                      ? "INTENSIFICACIÓN"
                      : currentWeek === "w3"
                        ? "PEAK WEEK / ÁPEX"
                        : "DELOAD / DESCARGA"}
                </div>

                <DailyMissionPanel
                  dayId={activeDay.id}
                  dailyGoalText={dailyGoals[activeDay.id] || ""}
                  isGeneratingQuest={isGeneratingQuest}
                  sideQuestCompleted={!!sideQuests[activeDay.id]?.completed}
                  questData={sideQuests[activeDay.id]}
                  rewards={getDayReward(activeDay.id)}
                  isHelpOpen={isHelpOpen}
                  setIsHelpOpen={setIsHelpOpen}
                  dayTitleAlertTrigger={dayTitleAlertTrigger}
                  handleFetchSideQuest={handleFetchSideQuest}
                  handleResetQuest={handleResetQuest}
                  mousePos={mousePos}
                />
              </div>
            )}

            {/* 4. SUB-TABS (VARIATIONS & DESKTOP LAYOUT CONTROL) */}
            {activeDay && (
              <div
                id="tabContainer"
                className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center max-w-7xl mx-auto w-full px-6 md:px-10 no-print"
              >
                {/* Variations Selector Tabs */}
                <div className="flex gap-2.5 flex-wrap justify-center md:justify-start">
                  {activeDay.variations.length > 1 &&
                    activeDay.variations.map((v, idx) => {
                      const isActive = idx === currentVariationIndex;
                      const tabBrand = resolveBlockBrand(
                        v.tabName,
                        v.warmup?.title || "",
                        v.warmup?.items || [],
                      );
                      let shortTag = "";
                      if (tabBrand.emblem.includes("HAEDO"))
                        shortTag = "🪣 HAEDO";
                      else if (tabBrand.emblem.includes("MAYHEM"))
                        shortTag = "🔥 MAYHEM";
                      else if (tabBrand.emblem.includes("HWPO"))
                        shortTag = "⛓️ HWPO";
                      else shortTag = "🧬 PRVN";
                      return (
                        <button
                          key={idx}
                          className={`tab-btn ${isActive ? "active" : ""} flex items-center gap-1.5`}
                          onClick={() => setCurrentVariationIndex(idx)}
                          id={`tab_variation_btn_${idx}`}
                        >
                          <span>{v.tabName}</span>
                          <span
                            className={`text-[7px] px-1 py-0.5 rounded font-mono font-black tracking-tighter ${
                              isActive
                                ? "bg-black/40 text-[#00f0ff] border border-[#00f0ff]/35"
                                : "bg-white/5 text-neutral-400 border border-transparent"
                            }`}
                          >
                            {shortTag}
                          </span>
                        </button>
                      );
                    })}
                </div>

                {/* Desktop Layout Switcher - Elegant Minimalist Pill Segmented Control */}
                <div className="flex bg-[#000000]/40 rounded-full p-0.5 select-none shadow-[rgba(0,0,0,0.4)_0px_2px_8px] no-print">
                  <button
                    type="button"
                    onClick={() => {
                      setDesktopLayout("sidebar");
                      localStorage.setItem("nexus_desktop_layout", "sidebar");
                    }}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-mono font-black tracking-widest uppercase transition-all duration-250 flex items-center gap-1.5 cursor-pointer ${
                      desktopLayout === "sidebar"
                        ? "bg-electric-blue text-black font-black shadow-sm"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    <LayoutDashboard size={10} className="shrink-0" />
                    <span>SIDEBAR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDesktopLayout("columns");
                      localStorage.setItem("nexus_desktop_layout", "columns");
                    }}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-mono font-black tracking-widest uppercase transition-all duration-250 flex items-center gap-1.5 cursor-pointer ${
                      desktopLayout === "columns"
                        ? "bg-electric-blue text-black font-black shadow-sm"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    <Columns size={10} className="shrink-0" />
                    <span>4 COLUMNAS</span>
                  </button>
                </div>
              </div>
            )}

            {/* 5. MAIN BOARD BRUTALIST GRID */}
            <div className="w-full px-6 md:px-10 flex flex-col flex-grow">
              {activeVariation ? (
                desktopLayout === "sidebar" ? (
                  <div className="w-full flex-grow max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 md:gap-8 items-start relative select-none">
                    {/* SIDEBAR DE BLOQUES EN COMPUTADORAS / BARRA DE TABS EN MÓVILES */}
                    <aside className="w-full lg:w-72 shrink-0 space-y-3 no-print">
                      <div className="text-[10px] font-mono tracking-widest text-[#00f0ff] uppercase pb-2 mb-3 flex justify-between items-center">
                        <span>// SESIÓN DE ENTRENAMIENTO</span>
                        <span>[4 BLOQUES]</span>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
                        <button
                          onClick={() => setActiveBlockTab("warmup")}
                          className={`group w-full text-left p-3.5 sm:p-4 border transition-all duration-200 uppercase relative overflow-hidden cursor-pointer rounded-xs ${
                            activeBlockTab === "warmup"
                              ? "border-electric-blue bg-electric-blue/15 text-white shadow-sm"
                              : "border-white/10 hover:border-white/30 bg-[#000000]/60 text-neutral-400 hover:text-white"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1 font-brutalist">
                            <span
                              className={`text-xs sm:text-[14px] font-extrabold tracking-wider ${activeBlockTab === "warmup" ? "text-electric-blue" : "text-neutral-300 group-hover:text-white"}`}
                            >
                              01. CALENTAMIENTO
                            </span>
                            <span className="text-[8.5px] font-mono tracking-tight shrink-0 bg-white/10 px-1.5 py-0.5 rounded font-extrabold text-neutral-300">
                              {activeVariation.warmup.items.length} MOV.
                            </span>
                          </div>
                          <div className="text-[9px] font-mono truncate text-neutral-500 group-hover:text-neutral-400 tracking-wider">
                            {activeVariation.warmup.title || "Preparación"}
                          </div>

                          {/* COMPACT LIST OF EXERCISES inside the sidebar tab button */}
                          <div className="mt-2.5 pt-2 border-t border-white/5 space-y-1 hidden lg:block">
                            {activeVariation.warmup.items
                              .slice(0, 5)
                              .map((item, idx) => (
                                <div
                                  key={idx}
                                  className="text-[8.5px] text-neutral-400 group-hover:text-neutral-300 font-condensed tracking-wide flex items-center gap-1.5 normal-case truncate"
                                  title={getCompactSidebarText(item)}
                                >
                                  <span className="w-1 h-1 rounded-full bg-electric-blue shrink-0 " />
                                  <span className="truncate">
                                    {getCompactSidebarText(item)}
                                  </span>
                                </div>
                              ))}
                            {activeVariation.warmup.items.length > 5 && (
                              <div className="text-[7.5px] text-neutral-500 font-mono tracking-tight pt-0.5 pl-2 uppercase text-left">
                                + {activeVariation.warmup.items.length - 5}{" "}
                                más...
                              </div>
                            )}
                          </div>

                          {activeBlockTab === "warmup" && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-electric-blue" />
                          )}
                        </button>

                        <button
                          onClick={() => setActiveBlockTab("strength")}
                          className={`group w-full text-left p-3.5 sm:p-4 border transition-all duration-200 uppercase relative overflow-hidden cursor-pointer rounded-xs ${
                            activeBlockTab === "strength"
                              ? "border-[#ff0055] bg-[#ff0055]/15 text-white shadow-sm"
                              : "border-white/10 hover:border-white/30 bg-[#000000]/60 text-neutral-400 hover:text-white"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1 font-brutalist">
                            <span
                              className={`text-xs sm:text-[14px] font-extrabold tracking-wider ${activeBlockTab === "strength" ? "text-[#ff0055]" : "text-neutral-300 group-hover:text-white"}`}
                            >
                              02. FUERZA / OLY
                            </span>
                            <span className="text-[8.5px] font-mono tracking-tight shrink-0 bg-white/10 px-1.5 py-0.5 rounded font-extrabold text-neutral-300">
                              {activeVariation.strength.items.length} MOVS.
                            </span>
                          </div>
                          <div className="text-[9px] font-mono truncate text-neutral-500 group-hover:text-neutral-400 tracking-wider">
                            {activeVariation.strength.title || "Desarrollo"}
                          </div>

                          {/* COMPACT LIST OF EXERCISES inside the sidebar tab button */}
                          <div className="mt-2.5 pt-2 border-t border-white/5 space-y-1 hidden lg:block">
                            {activeVariation.strength.items
                              .slice(0, 5)
                              .map((item, idx) => (
                                <div
                                  key={idx}
                                  className="text-[8.5px] text-neutral-400 group-hover:text-neutral-300 font-condensed tracking-wide flex items-center gap-1.5 normal-case truncate"
                                  title={getCompactSidebarText(item)}
                                >
                                  <span className="w-1 h-1 rounded-full bg-[#ff0055] shrink-0 " />
                                  <span className="truncate">
                                    {getCompactSidebarText(item)}
                                  </span>
                                </div>
                              ))}
                            {activeVariation.strength.items.length > 5 && (
                              <div className="text-[7.5px] text-neutral-500 font-mono tracking-tight pt-0.5 pl-2 uppercase text-left">
                                + {activeVariation.strength.items.length - 5}{" "}
                                más...
                              </div>
                            )}
                          </div>

                          {activeBlockTab === "strength" && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff0055]" />
                          )}
                        </button>

                        <button
                          onClick={() => setActiveBlockTab("metcon")}
                          className={`group w-full text-left p-3.5 sm:p-4 border transition-all duration-200 uppercase relative overflow-hidden cursor-pointer rounded-xs ${
                            activeBlockTab === "metcon"
                              ? "border-[#00f0ff] bg-[#00f0ff]/15 text-white shadow-sm"
                              : "border-white/10 hover:border-white/30 bg-[#000000]/60 text-neutral-400 hover:text-white"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1 font-brutalist">
                            <span
                              className={`text-xs sm:text-[14px] font-extrabold tracking-wider ${activeBlockTab === "metcon" ? "text-[#00f0ff]" : "text-neutral-300 group-hover:text-white"}`}
                            >
                              03. METCON / WOD
                            </span>
                            <span className="text-[8.5px] font-mono tracking-tight shrink-0 bg-white/10 px-1.5 py-0.5 rounded font-extrabold text-neutral-300">
                              {activeVariation.metcon.items.length} MOVS.
                            </span>
                          </div>
                          <div className="text-[9px] font-mono truncate text-neutral-500 group-hover:text-neutral-400 tracking-wider">
                            {activeVariation.metcon.title || "Metcon"}
                          </div>

                          {/* COMPACT LIST OF EXERCISES inside the sidebar tab button */}
                          <div className="mt-2.5 pt-2 border-t border-white/5 space-y-1 hidden lg:block">
                            {activeVariation.metcon.items
                              .slice(0, 5)
                              .map((item, idx) => (
                                <div
                                  key={idx}
                                  className="text-[8.5px] text-neutral-400 group-hover:text-neutral-300 font-condensed tracking-wide flex items-center gap-1.5 normal-case truncate"
                                  title={getCompactSidebarText(item)}
                                >
                                  <span className="w-1 h-1 rounded-full bg-[#00f0ff] shrink-0 " />
                                  <span className="truncate">
                                    {getCompactSidebarText(item)}
                                  </span>
                                </div>
                              ))}
                            {activeVariation.metcon.items.length > 5 && (
                              <div className="text-[7.5px] text-neutral-500 font-mono tracking-tight pt-0.5 pl-2 uppercase text-left">
                                + {activeVariation.metcon.items.length - 5}{" "}
                                más...
                              </div>
                            )}
                          </div>

                          {activeBlockTab === "metcon" && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00f0ff]" />
                          )}
                        </button>

                        <button
                          onClick={() => setActiveBlockTab("accessories")}
                          className={`group w-full text-left p-3.5 sm:p-4 border transition-all duration-200 uppercase relative overflow-hidden cursor-pointer rounded-xs ${
                            activeBlockTab === "accessories"
                              ? "border-[#a124ff] bg-[#a124ff]/15 text-white shadow-sm"
                              : "border-white/10 hover:border-white/30 bg-[#000000]/60 text-neutral-400 hover:text-white"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1 font-brutalist">
                            <span
                              className={`text-xs sm:text-[14px] font-extrabold tracking-wider ${activeBlockTab === "accessories" ? "text-[#a124ff]" : "text-neutral-300 group-hover:text-white"}`}
                            >
                              04. ACCESORIOS / ACC
                            </span>
                            <span className="text-[8.5px] font-mono tracking-tight shrink-0 bg-white/10 px-1.5 py-0.5 rounded font-extrabold text-neutral-300">
                              {activeVariation.accessories.items.length} MOVS.
                            </span>
                          </div>
                          <div className="text-[9px] font-mono truncate text-neutral-500 group-hover:text-neutral-400 tracking-wider">
                            {activeVariation.accessories.title || "Longevidad"}
                          </div>

                          {/* COMPACT LIST OF EXERCISES inside the sidebar tab button */}
                          <div className="mt-2.5 pt-2 border-t border-white/5 space-y-1 hidden lg:block">
                            {activeVariation.accessories.items
                              .slice(0, 5)
                              .map((item, idx) => (
                                <div
                                  key={idx}
                                  className="text-[8.5px] text-neutral-400 group-hover:text-neutral-300 font-condensed tracking-wide flex items-center gap-1.5 normal-case truncate"
                                  title={getCompactSidebarText(item)}
                                >
                                  <span className="w-1 h-1 rounded-full bg-[#a124ff] shrink-0 " />
                                  <span className="truncate">
                                    {getCompactSidebarText(item)}
                                  </span>
                                </div>
                              ))}
                            {activeVariation.accessories.items.length > 5 && (
                              <div className="text-[7.5px] text-neutral-500 font-mono tracking-tight pt-0.5 pl-2 uppercase text-left">
                                + {activeVariation.accessories.items.length - 5}{" "}
                                más...
                              </div>
                            )}
                          </div>

                          {activeBlockTab === "accessories" && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#a124ff]" />
                          )}
                        </button>
                      </div>
                    </aside>

                    {/* CONTENEDOR PRINCIPAL DEL BLOQUE ACTIVO */}
                    <div
                      className="flex-grow w-full h-full min-h-[420px] transition-all duration-300"
                      id="workoutBoard"
                    >
                      <AnimatePresence mode="wait">
                        {activeBlockTab === "warmup" && (
                          <motion.div
                            key="warmup"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="h-full"
                          >
                            {renderWarmupBlock()}
                          </motion.div>
                        )}
                        {activeBlockTab === "strength" && (
                          <motion.div
                            key="strength"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="h-full"
                          >
                            {renderStrengthBlock()}
                          </motion.div>
                        )}
                        {activeBlockTab === "metcon" && (
                          <motion.div
                            key="metcon"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="h-full"
                          >
                            {renderMetconBlock()}
                          </motion.div>
                        )}
                        {activeBlockTab === "accessories" && (
                          <motion.div
                            key="accessories"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="h-full"
                          >
                            {renderAccessoriesBlock()}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* DYNAMIC COMPLETION TOGGLE FOR THE ACTIVE DAY */}
                      {activeDay && (
                        <div className="mt-6 flex flex-col sm:flex-row gap-4 no-print w-full">
                          <motion.button
                            whileHover={{ scale: 1.015 }}
                            whileTap={{ scale: 0.985 }}
                            onClick={() => toggleDayCompleted(activeDay.id)}
                            className={`flex-grow status-btn flex items-center justify-center gap-2.5 ${completedDays[activeDay.id] ? "completed shadow-sm border border-emerald-400/50" : ""}`}
                          >
                            {completedDays[activeDay.id] ? (
                              <motion.span
                                initial={{ scale: 0.85, rotate: -15 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="flex items-center gap-2 justify-center relative"
                              >
                                <BadgeCheck
                                  size={24}
                                  className="text-zinc-950 shrink-0 "
                                />
                                <span className="font-extrabold text-zinc-950 tracking-wider">
                                  MISIÓN COMPLETA (COMPLETADO)
                                </span>

                                {showBlastId === activeDay.id && (
                                  <motion.div
                                    className="absolute inset-0 m-auto w-full h-full rounded bg-emerald-300 pointer-events-none"
                                    initial={{ scale: 1, opacity: 0.8 }}
                                    animate={{ scale: 2.5, opacity: 0 }}
                                    transition={{
                                      duration: 0.6,
                                      ease: "easeOut",
                                    }}
                                  />
                                )}
                                {showBlastId === activeDay.id && (
                                  <motion.div
                                    className="absolute inset-0 m-auto w-full h-full rounded bg-white pointer-events-none"
                                    initial={{ scale: 0.5, opacity: 1 }}
                                    animate={{ scale: 3.5, opacity: 0 }}
                                    transition={{
                                      duration: 0.8,
                                      ease: "easeOut",
                                      delay: 0.1,
                                    }}
                                  />
                                )}
                              </motion.span>
                            ) : (
                              <span className="font-extrabold tracking-wider">
                                MARCAR DÍA COMO COMPLETADO
                              </span>
                            )}
                          </motion.button>

                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={exportFileInputRef}
                            onChange={handleBgImageUpload}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              exportFileInputRef.current?.click();
                            }}
                            className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-none font-brutalist text-xs sm:text-sm tracking-widest font-extrabold uppercase transition-all duration-300 border-2 border-amber-600/30 bg-[#0A0A0E] hover:bg-amber-600/10 text-amber-500 shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer text-center"
                            title="Adjuntar una foto tuya de fondo para Instagram"
                          >
                            <Camera size={18} />
                            <span>
                              {exportBgImage ? "CAMBIAR RELIEVE" : "+ FOTO"}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={handleExportDayJPG}
                            disabled={isExportingJPG}
                            className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-none font-brutalist text-xs sm:text-sm tracking-widest font-extrabold uppercase transition-all duration-300 border-none bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-white shadow-sm hover:shadow-sm hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer text-center"
                            title="Exportar los ejercicios de este día a una imagen en formato IG Story"
                          >
                            <Share2
                              size={18}
                              className={`${isExportingJPG ? "animate-spin text-amber-200" : "text-amber-100 "}`}
                            />
                            <span>
                              {isExportingJPG ? "EXPORTANDO..." : "STORY JPG"}
                            </span>
                          </button>
                        </div>
                      )}
                      {renderExportCustomizationPanel()}
                    </div>
                  </div>
                ) : (
                  <main
                    className="w-full flex-grow grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch"
                    id="workoutBoard"
                    onTouchStart={handleVariationTouchStart}
                    onTouchMove={handleVariationTouchMove}
                    onTouchEnd={handleVariationTouchEnd}
                  >
                    {renderWarmupBlock(true)}
                    {renderStrengthBlock(true)}
                    {renderMetconBlock(true)}
                    {renderAccessoriesBlock(true)}

                    {/* DYNAMIC COMPLETION TOGGLE FOR THE ACTIVE DAY */}
                    {activeDay && (
                      <div className="mt-6 flex flex-col sm:flex-row gap-4 no-print w-full col-span-full">
                        <motion.button
                          whileHover={{ scale: 1.015 }}
                          whileTap={{ scale: 0.985 }}
                          onClick={() => toggleDayCompleted(activeDay.id)}
                          className={`flex-grow status-btn flex items-center justify-center gap-2.5 ${completedDays[activeDay.id] ? "completed shadow-sm border border-emerald-400/50" : ""}`}
                        >
                          {completedDays[activeDay.id] ? (
                            <motion.span
                              initial={{ scale: 0.85, rotate: -15 }}
                              animate={{ scale: 1, rotate: 0 }}
                              className="flex items-center gap-2 justify-center relative"
                            >
                              <BadgeCheck
                                size={24}
                                className="text-zinc-950 shrink-0 "
                              />
                              <span className="font-extrabold text-zinc-950 tracking-wider">
                                MISIÓN COMPLETA (COMPLETADO)
                              </span>

                              {showBlastId === activeDay.id && (
                                <motion.div
                                  className="absolute inset-0 m-auto w-full h-full rounded bg-emerald-300 pointer-events-none"
                                  initial={{ scale: 1, opacity: 0.8 }}
                                  animate={{ scale: 2.5, opacity: 0 }}
                                  transition={{
                                    duration: 0.6,
                                    ease: "easeOut",
                                  }}
                                />
                              )}
                              {showBlastId === activeDay.id && (
                                <motion.div
                                  className="absolute inset-0 m-auto w-full h-full rounded bg-white pointer-events-none"
                                  initial={{ scale: 0.5, opacity: 1 }}
                                  animate={{ scale: 3.5, opacity: 0 }}
                                  transition={{
                                    duration: 0.8,
                                    ease: "easeOut",
                                    delay: 0.1,
                                  }}
                                />
                              )}
                            </motion.span>
                          ) : (
                            <span className="font-extrabold tracking-wider">
                              MARCAR DÍA COMO COMPLETADO
                            </span>
                          )}
                        </motion.button>

                        <div className="flex bg-[#0A0A0E] border-2 border-amber-600/30">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={exportFileInputRef}
                            onChange={handleBgImageUpload}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              exportFileInputRef.current?.click();
                            }}
                            className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-none font-brutalist text-xs sm:text-sm tracking-widest font-extrabold uppercase transition-all duration-300 hover:bg-amber-600/10 text-amber-500 shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer text-center border-none"
                            title="Adjuntar una foto tuya de fondo para Instagram"
                          >
                            <Camera size={18} />
                            <span>
                              {exportBgImage ? "CAMBIAR RELIEVE/FOTO" : "+ FOTO"}
                            </span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={handleExportDayJPG}
                          disabled={isExportingJPG}
                          className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-none font-brutalist text-xs sm:text-sm tracking-widest font-extrabold uppercase transition-all duration-300 border-none bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-white shadow-sm hover:shadow-sm hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer text-center"
                          title="Exportar los ejercicios de este día a una imagen en formato IG Story"
                        >
                          <Share2
                            size={18}
                            className={`${isExportingJPG ? "animate-spin text-amber-200" : "text-amber-100 "}`}
                          />
                          <span>
                            {isExportingJPG ? "EXPORTANDO..." : "STORY JPG"}
                          </span>
                        </button>
                      </div>
                    )}
                    {renderExportCustomizationPanel()}
                  </main>
                )
              ) : (
                activeDay && (
                  <main className="w-full flex-grow" id="workoutBoard">
                    {/* Default rest day whiteboard rendering */}
                    <section className="col-span-1 flex flex-col items-center justify-center p-12 border-4 border-dashed border-electric-blue/40 bg-pure-black/95 text-center space-y-6">
                      <div className="text-5xl md:text-7xl font-brutalist text-electric-blue tracking-wider">
                        REST DAY - PORTAL REGENT
                      </div>
                      <div className="max-w-xl space-y-4">
                        <p className="text-xl md:text-2xl font-condensed font-bold tracking-wide text-neutral-300">
                          LÍMITES DE ADHERENCIA RESPETADOS // RECARGANDO
                          CAPACIDAD NEURAL
                        </p>
                        <div className="border-t border-white/20 pt-4 text-base text-white/40 font-condensed">
                          PRESUPUESTO DE MANÁ: OPTIMIZADO // REGENERACIÓN
                          COMPLETA PARA EL PRÓXIMO IMPACTO
                        </div>
                      </div>

                      <div className="w-full mt-4 max-w-md no-print">
                        <motion.button
                          whileHover={{ scale: 1.015 }}
                          whileTap={{ scale: 0.985 }}
                          onClick={() => toggleDayCompleted(activeDay.id)}
                          className={`status-btn flex items-center justify-center gap-2.5 ${completedDays[activeDay.id] ? "completed shadow-sm border border-emerald-400/50" : ""}`}
                        >
                          {completedDays[activeDay.id] ? (
                            <motion.span
                              initial={{ scale: 0.85, rotate: -15 }}
                              animate={{ scale: 1, rotate: 0 }}
                              className="flex items-center gap-2 justify-center"
                            >
                              <BadgeCheck
                                size={24}
                                className="text-zinc-950 shrink-0 "
                              />
                              <span className="font-extrabold text-zinc-950 tracking-wider">
                                MISIÓN COMPLETA (COMPLETADO)
                              </span>
                            </motion.span>
                          ) : (
                            <span className="font-extrabold tracking-wider">
                              MARCAR DÍA COMO COMPLETADO
                            </span>
                          )}
                        </motion.button>
                      </div>
                    </section>
                  </main>
                )
              )}
            </div>
          </motion.div>
        )}

        {activeSheet === 1 && (
          <motion.div
            key="sheet-rpe"
            initial={{
              opacity: 0,
              x: transitionDirection === "right" ? 300 : -300,
            }}
            animate={{ opacity: 1, x: 0 }}
            exit={{
              opacity: 0,
              x: transitionDirection === "right" ? -300 : 300,
            }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="px-6 md:px-10 flex-grow flex flex-col space-y-6"
          >
            <RpeAnalyticsPanel
              currentWeek={currentWeek}
              activeDay={activeDay}
              currentVariationIndex={currentVariationIndex}
              logsVersion={logsVersion}
              handleGenerateMonthlyReportPDF={handleGenerateMonthlyReportPDF}
              getMonthlyVolumeStats={getMonthlyVolumeStats}
            />
          </motion.div>
        )}

        {activeSheet === 2 && (
          <motion.div
            key="sheet-telemetry"
            initial={{
              opacity: 0,
              x: transitionDirection === "right" ? 300 : -300,
            }}
            animate={{ opacity: 1, x: 0 }}
            exit={{
              opacity: 0,
              x: transitionDirection === "right" ? -300 : 300,
            }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="px-6 md:px-10 flex-grow flex flex-col"
          >
            {/* CLOUD PERSISTENCE PANEL: SECURE SYNC ENGINE */}
            <CloudSyncPanel
              currentUser={currentUser}
              isCloudSyncing={isCloudSyncing}
              setIsCloudSyncing={setIsCloudSyncing}
              syncStatus={syncStatus}
              setConfettiTrigger={setConfettiTrigger}
            />

            {/* 1RM BRZYCKI CALIBRATOR TOOL */}
            <section className="mt-4">
              <BrzyckiCalculator />
            </section>

            {/* 6. BOTTOM TELEMETRY BOARD: PROGRESS, PARTY & L4 GEAR ACCENTS */}
            <TelemetryBoard
              athlete={athlete}
              currentWeek={currentWeek}
              chartData={chartData}
              rpeDistributionData={rpeDistributionData}
              rpeComparisonInfo={rpeComparisonInfo}
              currentXp={currentXp}
              xpPercentage={xpPercentage}
              weeklyCompletionInfo={weeklyCompletionInfo}
              activeDay={activeDay}
              activeDayLoggingPercentage={activeDayLoggingPercentage}
              earnedLootList={earnedLootList}
              currentUser={currentUser}
              manualSyncState={manualSyncState}
              setManualSyncState={setManualSyncState}
              setShowResetModal={setShowResetModal}
              setShowProfileModal={setShowProfileModal}
              setTempAthlete={setTempAthlete}
              handleExportLocalHistory={handleExportLocalHistory}
              handleExportLocalHistoryCSV={handleExportLocalHistoryCSV}
              activeColorSet={activeColorSet}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. CUSTOM CONFIRM BRUTALIST DIALOGS (Replaces standard popup blockages) */}
      <AnimatePresence>
        {showResetModal && (
          <ResetConfirmModal
            onConfirm={handleConfirmReset}
            onCancel={() => setShowResetModal(false)}
          />
        )}

        {/* BRUTALIST CF-L4 ACHIEVEMENT UNLOCKED POPUP BANNER */}
        {activeAchievement && (
          <div className="fixed inset-0 bg-transparent pointer-events-none flex items-start justify-center z-[200] p-4 text-center pt-12 md:pt-16">
            <motion.div
              initial={{ y: -80, scale: 0.9, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: -80, scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
              className="pointer-events-auto max-w-sm sm:max-w-md w-full bg-black/95 backdrop-blur-md border-2 p-5 relative overflow-hidden flex flex-col items-center select-none shadow-[0_15px_40px_rgba(0,0,0,0.85)]"
              style={{
                borderColor: activeAchievement.color,
                boxShadow: `0 0 35px ${activeAchievement.color}25`,
              }}
            >
              {/* aesthetic color bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: activeAchievement.color }}
              />

              <div className="flex items-center gap-3 w-full">
                <div
                  className="rounded-none p-3 text-3xl shrink-0 flex items-center justify-center border"
                  style={{
                    backgroundColor: `${activeAchievement.color}15`,
                    borderColor: `${activeAchievement.color}40`,
                    color: activeAchievement.color,
                  }}
                >
                  {activeAchievement.icon}
                </div>

                <div className="text-left flex-grow min-w-0">
                  <div className="flex justify-between items-center bg-white/0">
                    <span
                      className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 tracking-wider"
                      style={{
                        backgroundColor: `${activeAchievement.color}20`,
                        color: activeAchievement.color,
                      }}
                    >
                      LOGRO DE RENDIMIENTO • {activeAchievement.rarity}
                    </span>
                    <button
                      onClick={() => setActiveAchievement(null)}
                      className="text-neutral-500 hover:text-white transition-colors p-1"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                  <h4
                    className="text-sm sm:text-base font-brutalist tracking-wider text-pure-white leading-tight mt-1 uppercase"
                    style={{ color: activeAchievement.color }}
                  >
                    {activeAchievement.title}
                  </h4>
                  <p className="font-condensed text-neutral-300 font-bold text-[10px] sm:text-xs mt-1 leading-normal">
                    {activeAchievement.description}
                  </p>
                </div>
              </div>

              {/* Countdown progress loading bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-900 overflow-hidden">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="h-full"
                  style={{ backgroundColor: activeAchievement.color }}
                />
              </div>
            </motion.div>
          </div>
        )}

        {showProfileModal && (
          <ProfileModal
            tempAthlete={tempAthlete}
            setTempAthlete={setTempAthlete}
            unlockedAchievements={unlockedAchievements}
            customAccentColor={customAccentColor}
            setCustomAccentColor={setCustomAccentColor}
            enableThemedBackgrounds={enableThemedBackgrounds}
            setEnableThemedBackgrounds={setEnableThemedBackgrounds}
            warmupBg={warmupBg}
            setWarmupBg={setWarmupBg}
            strengthBg={strengthBg}
            setStrengthBg={setStrengthBg}
            metconBg={metconBg}
            setMetconBg={setMetconBg}
            accessoriesBg={accessoriesBg}
            setAccessoriesBg={setAccessoriesBg}
            handleUpdateAthlete={handleUpdateAthlete}
            onClose={() => setShowProfileModal(false)}
          />
        )}
      </AnimatePresence>

      {/* 8. FLOATING INTUITIVE COACH AI CHAT */}
      <CoachChat
        currentWorkouts={WORKOUT_DATABASE as any}
        onUpdateWorkouts={() => {}}
        activeWeek={currentWeek}
        activeDayId={activeDay?.id || "w2d1"}
        athlete={athlete}
        onUpdateAthlete={handleUpdateAthlete}
        sideQuests={sideQuests}
        dailyGoals={dailyGoals}
        onUpdateSideQuests={(updatedQuests) => {
          setSideQuests(updatedQuests);
          localStorage.setItem(
            "nexus_daily_quests_v2",
            JSON.stringify(updatedQuests),
          );
        }}
        onTriggerLightning={() => {
          setLightningFlash(true);
          setTimeout(() => {
            setLightningFlash(false);
          }, 1200);
        }}
      />

      {/* 9. DECORATION COMPACT FOOTER */}
      <footer className="mt-8 pt-6 opacity-30" data-purpose="footer-texture">
        <div className="flex justify-between border-t border-white py-4 text-xs font-condensed font-bold uppercase tracking-wider">
          <span>nexus crossfit SYSTEM // v4.0</span>
          <span>READY FOR IMPACT // CF-L4 COACH PLATFORM</span>
        </div>
      </footer>

      {/* 10. HIDDEN OFF-SCREEN CARD FOR JPG EXPORT */}
      {activeDay && activeVariation && (
        <ShareCardOverlay
          activeDay={activeDay}
          activeVariation={activeVariation}
          currentWeek={currentWeek}
          exportBgImage={exportBgImage}
          exportLayout={exportLayout}
          exportAthleteName={exportAthleteName}
          exportInspiration={exportInspiration}
          exportCardOpacity={exportCardOpacity}
          exportCardBlur={exportCardBlur}
          exportCardWidth={exportCardWidth}
          exportVerticalLayout={exportVerticalLayout}
          exportSilhouetteEffect={exportSilhouetteEffect}
          exportOverlayImage={exportOverlayImage}
          exportOverlayX={exportOverlayX}
          exportOverlayY={exportOverlayY}
          exportOverlayScale={exportOverlayScale}
          exportOverlayOpacity={exportOverlayOpacity}
          exportOverlayZ={exportOverlayZ}
          exportCardHeightLimit={exportCardHeightLimit}
          teamSize={teamSize}
          activeColorSet={activeColorSet}
          midBandColor={midBandColor}
          formatItemWithTeamVolume={formatItemWithTeamVolume}
          getDerivedInspiration={getDerivedInspiration}
        />
      )}
    </div>
  );
}
