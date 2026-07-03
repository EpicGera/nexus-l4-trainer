import React, { useState, useEffect, useMemo, useRef } from "react";
import { svgIcons } from "./components/icons/BlockIcons";
import { getCleanExerciseName } from "./lib/historyUtils";
import { AthleteState, Database, ProgramBlock } from "./types/workout";
import { INTENTION_META, GEAR_LABEL } from "./lib/blockMeta";
import { ensureChaptersInitialized, createChapter, getActiveChapter, ChapterTheme } from "./lib/chapterStore";
import { loadCustomFont } from "./lib/customFont";
import { SYSTEM_VERSION, SYSTEM_NAME, SYSTEM_TAGLINE } from "./lib/version";
import { getProgramTodayPosition } from "./lib/programStart";
import { getDayReward } from "./lib/sideQuests";
import { useSideQuests } from "./hooks/useSideQuests";
import { useCloudSync } from "./hooks/useCloudSync";
import { useSheetSwipe } from "./hooks/useSheetSwipe";
import { useVariationSwipe } from "./hooks/useVariationSwipe";
import { useExportPanel } from "./hooks/useExportPanel";
import {
  fetchWorkoutsFromSheet,
  loadCachedWorkouts,
  saveCachedWorkouts,
  backfillLocalLogsFromDatabase,
  getDefaultProgram,
  isUsingCustomSheet,
} from "./lib/sheetImport";
import CoachChat from "./components/CoachChat";
import Confetti from "./components/Confetti";
import { AchievementNotification } from "./components/AchievementNotification";
import WorkoutTimer from "./components/WorkoutTimer";
import BrzyckiCalculator from "./components/BrzyckiCalculator";
import NavigationHeader from "./components/NavigationHeader";
import BrandInspirationAccordion from "./components/BrandInspirationAccordion";
import HistoryTable from "./components/HistoryTable";
import RpeAnalyticsPanel from "./components/RpeAnalyticsPanel";
import ProfileSummaryCard from "./components/ProfileSummaryCard";
import LensTabs from "./components/ui/LensTabs";
import ShareCardOverlay from "./components/ShareCardOverlay";
import WorkoutBlockCard from "./components/WorkoutBlockCard";
import TelemetryBoard from "./components/TelemetryBoard";
import ResetConfirmModal from "./components/ResetConfirmModal";
import Toast from "./components/Toast";
import ProfileModal from "./components/ProfileModal";
import ExportCustomizationPanel from "./components/ExportCustomizationPanel";
import WarriorScreen from "./components/WarriorScreen";
import SessionWizard from "./components/SessionWizard";
import { getSessionForDay } from "./lib/sessionStore";
import { getMonthlyVolumeStats } from "./lib/exportService";
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
  Dumbbell,
  TrendingUp,
  UserCheck,
  LayoutDashboard,
  Camera,
  Share2,
  Settings2,
  ChevronDown,
  List,
  Columns,
  Rows3,
  CloudLightning,
  ShieldCheck,
  LogOut,
  Clock,
  Users,
  X,
  Maximize,
  MousePointer2,
} from "lucide-react";

// Firebase core & sync integration
import { auth, googleProvider, googleSignIn, getAccessToken } from "./lib/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { pushAllLocalToCloud } from "./lib/syncEngine";
import { getAutoFollow, setAutoFollow } from "./lib/storageKeys";
import { pushAthleteStats } from "./lib/athleteStats";
import { exportToGoogleSheets } from "./lib/sheets";

// Custom extracted components to optimize monolith App.tsx size
import DailyMissionPanel from "./components/DailyMissionPanel";
import ActiveDayHeader from "./components/ActiveDayHeader";
import CloudSyncPanel from "./components/CloudSyncPanel";
import { generateSidequest, tagChapterInspiration } from "./services/aiService";
import {
  WEEK_COLOR_MAPPING,
  WEEK_ACCENT_COLORS,
  ACCENT_COLORS_MAP,
  WEEK_MID_BAND_COLORS,
  resolveBlockBrand,
  MASTER_ACHIEVEMENTS,
} from "./lib/constants";

// Neutral defaults for a fresh install — each athlete sets their own profile.
const DEFAULT_ATHLETE: AthleteState = {
  identity: "ATLETA NEXUS",
  level: "Atleta de Box // En Progresión ⚡",
  restriction: "RPE 8/10 MÁX (Control Biomecánico Sano)",
  condition: "Listo para entrenar",
  equipment: {
    grebas: "Rodilleras de Neoprene",
    amuleto: "Calleras",
    filtro: "Muñequeras",
  },
};

const formatItemWithTeamVolume = (itemText: string, size: number) => {
  return itemText;
};

// Adaptive grid column count for the "GRILLA" full-program view (up to 6).
// Static literals so Tailwind v4 keeps these classes in the build.
const FULLVIEW_XL_COLS: Record<number, string> = {
  1: "xl:grid-cols-1",
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
  5: "xl:grid-cols-5",
  6: "xl:grid-cols-6",
};

export default function App() {
  // --- STATE ---
  const [realTime, setRealTime] = useState(new Date());

  const [currentWeek, setCurrentWeek] = useState<string>(() => {
    if (getAutoFollow()) {
      // posición REAL del programa (ancla del capítulo), no semana calendario
      return getProgramTodayPosition().week;
    }
    const saved = localStorage.getItem("nexus_current_week_slug");
    return saved && ["w1", "w2", "w3", "w4"].includes(saved) ? saved : "w2";
  });

  const [currentDayIndex, setCurrentDayIndex] = useState<number>(() => {
    if (getAutoFollow()) {
      return getProgramTodayPosition().dayIndex;
    }
    const saved = localStorage.getItem("nexus_current_day_idx");
    return saved ? Math.max(0, Math.min(6, parseInt(saved, 10))) : 0;
  });

  // Active chapter theme — drives the app-wide accent so each chapter has its own
  // emphasis color (Fase 2). Refreshed on chapter change / cloud sync.
  const [chapterTheme, setChapterTheme] = useState<ChapterTheme | null>(
    () => getActiveChapter()?.theme || null,
  );
  const [teamSize, setTeamSize] = useState<number>(() => {
    const saved = localStorage.getItem("nexus_team_size");
    return saved ? Math.max(1, Math.min(4, parseInt(saved, 10))) : 1;
  });
  const [desktopLayout, setDesktopLayout] = useState<"sidebar" | "grid" | "papiro">(
    () => {
      const saved = localStorage.getItem("nexus_desktop_layout");
      if (saved === "sidebar" || saved === "grid" || saved === "papiro") return saved;
      if (saved === "columns") return "grid"; // migrate the old obsolete 4-column view
      return "sidebar";
    },
  );
  const [activeBlockTab, setActiveBlockTab] = useState<
    "warmup" | "strength" | "metcon" | "accessories"
  >("warmup");
  // Active tab key for the flexible-block sidebar (programs with blocks[]).
  const [activeFlexKey, setActiveFlexKey] = useState<string>("");
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
  const [wizardOpen, setWizardOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileLens, setProfileLens] = useState<"perfil" | "datos" | "logros">(
    () => (localStorage.getItem("nexus_profile_lens") as "perfil" | "datos" | "logros") || "perfil",
  );
  const {
    currentUser,
    isCloudSyncing,
    setIsCloudSyncing,
    syncStatus,
    syncWithRealTime,
    setSyncWithRealTime,
    manualSyncState,
    setManualSyncState,
    handleToggleSync,
  } = useCloudSync(setCurrentWeek, setCurrentDayIndex);

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
  // Measured height of the sticky day-title band, so the variation tabs can pin
  // directly beneath it instead of scrolling away under it (Fase 7). Measured
  // inside ActiveDayHeader (a wrapper here would break its position:sticky).
  const [dayHeaderHeight, setDayHeaderHeight] = useState<number>(0);

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
      
      // Defer side effects outside the react state update/render lifecycle
      setTimeout(() => {
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
      }, 0);

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
          // Fresh installs start with nothing completed — progress is earned.
          result[dayId] = saved === "true";
        }
      });
      return result;
    },
  );

  const activeColorSet = useMemo(() => {
    // Chapter accent drives the global emphasis color (--color-electric-blue);
    // fall back to the per-week palette when no chapter theme is available.
    if (chapterTheme?.accent) {
      return { color: chapterTheme.accent, shadow: `0 0 15px 2px ${chapterTheme.accent}99` };
    }
    return WEEK_ACCENT_COLORS[currentWeek] || WEEK_ACCENT_COLORS.w2;
  }, [chapterTheme, currentWeek]);

  const midBandColor = useMemo(() => {
    if (chapterTheme?.band) {
      return {
        bg: chapterTheme.band,
        text: "#ffffff",
        bgStyle: { background: chapterTheme.titleGradient || chapterTheme.band },
      };
    }
    return WEEK_MID_BAND_COLORS[currentWeek] || WEEK_MID_BAND_COLORS.w2;
  }, [chapterTheme, currentWeek]);

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

  // Workout program: defaults to the codegen'd snapshot, but can be refreshed
  // live from the Google Sheet (cached to localStorage across reloads).
  const [database, setDatabase] = useState<Database>(
    () => loadCachedWorkouts() || getDefaultProgram(),
  );
  
  // Auto-extract historical logs from imported program text to feed the analytics charts
  useEffect(() => {
    backfillLocalLogsFromDatabase(database);
  }, [database]);

  // The Google Sheet is the source of truth for what's been done: a day with
  // logged RPE comes back as `isCompleted`. Reflect that in the UI's completed
  // map (union only — never un-complete a day the athlete marked locally) and
  // persist it so it survives reloads and roams via the sync engine.
  useEffect(() => {
    setCompletedDays((prev) => {
      let changed = false;
      const next = { ...prev };
      Object.values(database).forEach((week) => {
        week.days.forEach((day) => {
          if (day.isCompleted && !next[day.id]) {
            next[day.id] = true;
            try {
              localStorage.setItem(day.id, "true");
            } catch {
              /* storage restricted — ignore */
            }
            changed = true;
          }
        });
      });
      return changed ? next : prev;
    });
  }, [database]);

  const [isRefreshingSheet, setIsRefreshingSheet] = useState(false);

  const activeWeekPlan = database[currentWeek];
  const activeDay = activeWeekPlan?.days[currentDayIndex];

  const {
    currentVariationIndex,
    setCurrentVariationIndex,
    handleVariationTouchStart,
    handleVariationTouchMove,
    handleVariationTouchEnd,
  } = useVariationSwipe(
    currentWeek,
    currentDayIndex,
    activeDay?.variations.length || 0,
  );

  const activeVariation =
    activeDay?.variations[currentVariationIndex] || activeDay?.variations[0];

  const {
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
  } = useSideQuests(activeDay, activeVariation, checkAndUnlockAchievement);

  const handleRefreshFromSheet = async () => {
    setIsRefreshingSheet(true);
    try {
      const fresh = await fetchWorkoutsFromSheet();
      setDatabase(fresh);
      saveCachedWorkouts(fresh);
      window.dispatchEvent(new Event("nexus_logs_updated"));
    } catch (e: any) {
      console.error("Refresh from sheet failed:", e);
      alert(e?.message || "No se pudo refrescar desde la hoja.");
    } finally {
      setIsRefreshingSheet(false);
    }
  };


  const {
    isExportingJPG,
    setIsExportingJPG,
    isExportingSheets,
    setIsExportingSheets,
    showStoryMenu,
    setShowStoryMenu,
    exportBgImage,
    setExportBgImage,
    exportLayout,
    setExportLayout,
    exportVerticalLayout,
    setExportVerticalLayout,
    exportCardWidth,
    setExportCardWidth,
    exportAthleteName,
    setExportAthleteName,
    exportInspiration,
    setExportInspiration,
    exportCardBlur,
    setExportCardBlur,
    exportCardOpacity,
    setExportCardOpacity,
    exportTheme,
    setExportTheme,
    exportPhotoFilter,
    setExportPhotoFilter,
    exportCardHeightLimit,
    setExportCardHeightLimit,
    isFullscreenPreview,
    setIsFullscreenPreview,
    blockPositions,
    setBlockPositions,
    previewScale,
    setPreviewScale,
    exportFileInputRef,
    handleMonthTextExport,
    handleExportGoogleSheets,
    handleBatchPDFExport,
    handleGenerateMonthlyReportPDF,
    handleBgImageUpload,
    handleExportDayJPG,
    handleExportDayMarkdown,
    handleExportLocalHistory,
    handleExportLocalHistoryCSV,
  } = useExportPanel(athlete, currentWeek, completedDays, activeDay, activeVariation);

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

  // --- INTRO GLITCH ---
  const [isIntroGlitching, setIsIntroGlitching] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsIntroGlitching(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const reloadAllLocalStorageState = () => {
      const checkSync = getAutoFollow();
      setSyncWithRealTime(checkSync);

      // Refresh the active chapter theme so the app-wide accent follows the
      // chapter (this handler runs on nexus_chapter_changed and cloud sync).
      setChapterTheme(getActiveChapter()?.theme || null);

      // NOTE: do NOT re-derive currentWeek/currentDayIndex here. This handler
      // runs on every `nexus_cloud_synced` (the realtime Firestore listener
      // fires periodically), so recomputing the week/day from `now` would yank
      // the user's manual navigation back to "today" mid-session — the bug where
      // scrolling week 3/4 snapped to w2d1. The initial week/day is set once by
      // the useState initializers; manual nav and the sync toggle own it after.

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

      // Reload completed days with the same defaults as the initial mount
      const completed: Record<string, boolean> = {};
      ["w1", "w2", "w3", "w4"].forEach((week) => {
        for (let d = 1; d <= 7; d++) {
          const dayId = `${week}d${d}`;
          completed[dayId] = localStorage.getItem(dayId) === "true";
        }
      });
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

      // Pull the cloud-synced program into view (cross-device roaming): the
      // sync engine writes nexus_workouts_override to localStorage, so reflect
      // it in state here instead of waiting for a manual page reload.
      const syncedProgram = loadCachedWorkouts();
      if (syncedProgram) setDatabase(syncedProgram);

      // Force logs visual logger re-renders
      setLogsVersion((v) => v + 1);
    };

    // Initialize the chapter library (wraps any pre-existing program as c1) and
    // reload board state whenever the active chapter changes (snapshot/restore).
    ensureChaptersInitialized(JSON.stringify(loadCachedWorkouts() || getDefaultProgram()));
    setChapterTheme(getActiveChapter()?.theme || null);
    loadCustomFont(); // re-inject an admin-uploaded title font, if any
    window.addEventListener("nexus_cloud_synced", reloadAllLocalStorageState);
    window.addEventListener("nexus_chapter_changed", reloadAllLocalStorageState);
    return () => {
      window.removeEventListener(
        "nexus_cloud_synced",
        reloadAllLocalStorageState,
      );
      window.removeEventListener(
        "nexus_chapter_changed",
        reloadAllLocalStorageState,
      );
    };
  }, []);

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const [logsVersion, setLogsVersion] = useState(0);
  const [confettiTrigger, setConfettiTrigger] = useState<number>(0);
  const [rpeTrendRange, setRpeTrendRange] = useState<number>(30);
  const [lastLoggingPercentage, setLastLoggingPercentage] = useState<number>(0);
  const [completedCompExercises, setCompletedCompExercises] = useState<{
    [key: string]: boolean;
  }>({});
  const [showRpeDemo, setShowRpeDemo] = useState<boolean>(true);

  const {
    activeSheet,
    transitionDirection,
    handleNextSheet,
    handlePrevSheet,
    handleSetActiveSheetWithDirection,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useSheetSwipe();

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

  // Keep the canonical athlete-stats doc (users/{uid}/profile/stats) fresh:
  // debounce-push whenever training data changes and a user is signed in.
  useEffect(() => {
    if (!currentUser) return;
    const timer = setTimeout(() => {
      pushAthleteStats(currentUser.uid).catch((e) =>
        console.warn("No se pudo actualizar el perfil de stats:", e),
      );
    }, 2500);
    return () => clearTimeout(timer);
  }, [currentUser, logsVersion, completedDays, unlockedAchievements, sideQuests, athlete]);

  // On sign-in, pull the latest program + completion state from the athlete's
  // linked Google Sheet so previously completed days appear automatically.
  // Only runs when the user explicitly linked their own sheet (opt-in) and a
  // token is already granted — so we never read a shared/default sheet and
  // never force a second popup. The manual "Refrescar" button can prompt.
  useEffect(() => {
    if (!currentUser || !isUsingCustomSheet()) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token || cancelled) return;
        const fresh = await fetchWorkoutsFromSheet();
        if (cancelled) return;
        setDatabase(fresh);
        saveCachedWorkouts(fresh);
        window.dispatchEvent(new Event("nexus_logs_updated"));
      } catch (e) {
        console.warn("Auto-refresh desde la hoja falló:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  // Enforce automatic synchronization when enabled
  useEffect(() => {
    if (syncWithRealTime) {
      // Today's program week + day. When a program start date is set, the week
      // is computed from elapsed days since the start (see lib/programStart);
      // otherwise it falls back to the legacy calendar-based week.
      const { week: computedWeekStr, dayIndex: computedDayIdx } =
        getProgramTodayPosition(realTime);

      if (currentWeek !== computedWeekStr) {
        setCurrentWeek(computedWeekStr);
      }
      if (currentDayIndex !== computedDayIdx) {
        setCurrentDayIndex(computedDayIdx);
      }
    }
  }, [realTime, syncWithRealTime, currentWeek, currentDayIndex]);

  // --- SAVE TO LOCALSTORAGE ---
  useEffect(() => {
    localStorage.setItem("nexus_current_week_slug", currentWeek);
  }, [currentWeek]);

  useEffect(() => {
    localStorage.setItem("nexus_current_day_idx", String(currentDayIndex));
  }, [currentDayIndex]);

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

  const markDayComplete = (dayId: string) => {
    setCompletedDays((prev) => {
      if (prev[dayId]) return prev;
      const nextMap = { ...prev, [dayId]: true };
      setTimeout(() => {
        setConfettiTrigger((v) => v + 1);
        localStorage.setItem(dayId, "true");
        window.dispatchEvent(new Event("nexus_logs_updated"));

        let totalCompleted = 0;
        Object.keys(database).forEach((week) => {
          database[week].days.forEach((day) => {
            if (nextMap[day.id]) totalCompleted++;
          });
        });
        if (totalCompleted >= 1) checkAndUnlockAchievement("first_day");
        if (totalCompleted >= 5) checkAndUnlockAchievement("five_days");

        let weekCount = 0;
        for (let d = 1; d <= 7; d++) {
          if (nextMap[`${currentWeek}d${d}`]) weekCount++;
        }
        if (weekCount === 7) checkAndUnlockAchievement("perfect_week");
      }, 0);
      return nextMap;
    });
  };

  // Calculate dynamic RPG XP
  const getXpProgress = () => {
    let totalCompleted = 0;
    Object.keys(database).forEach((week) => {
      database[week].days.forEach((day) => {
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
      // Build the exact key the loggers write (clean name + underscores),
      // otherwise no log is ever found and the percentage stays at 0.
      const cleanName = getCleanExerciseName(item).replace(/\s+/g, "_");
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
        resetting[dayId] = false;
        localStorage.setItem(dayId, "false");
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
    setTimeout(() => {
      window.dispatchEvent(new Event("nexus_athlete_updated"));
    }, 0);

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
        className={`px-3 py-2.5 font-mono flex flex-col justify-center w-full min-h-[54px] uppercase select-none shadow-[inset_0_2px_4px_rgba(255,255,255,0.25)] rounded-none text-center leading-[1.05] gap-1 border-l-[6px] border-amber-400`}
      >
        <span
          className={`font-brutalist not-italic tracking-[0.01em] uppercase ${
            isColumns
              ? "text-[18px] xl:text-[20px]"
              : "text-[19px] md:text-[22px] lg:text-[25px]"
          } drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]`}
          title={mainText}
        >
          {mainText}
        </span>
        {restText && (
          <span
            className={`font-sans font-bold tracking-[0.18em] uppercase opacity-90 ${
              isColumns
                ? "text-[10px] xl:text-[11px]"
                : "text-[11px] md:text-[12px] lg:text-[13px]"
            }`}
          >
            {restText}
          </span>
        )}
      </div>
    );
  };

  // Single source of props for the story card: the hidden export template and
  // the live preview inside the editor panel stay perfectly in sync.
  const shareCardProps =
    activeDay && activeVariation
      ? {
          activeDay,
          activeVariation,
          currentWeek,
          exportBgImage,
          exportTheme,
          exportLayout,
          exportAthleteName,
          exportInspiration,
          exportCardOpacity,
          exportCardBlur,
          exportCardWidth,
          exportVerticalLayout,
          exportPhotoFilter,
          exportCardHeightLimit,
          teamSize,
          activeColorSet,
          midBandColor,
          formatItemWithTeamVolume,
          getDerivedInspiration,
          blockPositions,
          setBlockPositions,
        }
      : null;

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
        exportTheme={exportTheme}
        setExportTheme={setExportTheme}
        exportInspiration={exportInspiration}
        setExportInspiration={setExportInspiration}
        exportCardBlur={exportCardBlur}
        setExportCardBlur={setExportCardBlur}
        exportCardOpacity={exportCardOpacity}
        setExportCardOpacity={setExportCardOpacity}
        exportCardHeightLimit={exportCardHeightLimit}
        setExportCardHeightLimit={setExportCardHeightLimit}
        exportPhotoFilter={exportPhotoFilter}
        setExportPhotoFilter={setExportPhotoFilter}
        onExport={handleExportDayJPG}
        isExporting={isExportingJPG}
        isFullscreenPreview={isFullscreenPreview}
        setIsFullscreenPreview={setIsFullscreenPreview}
        preview={
          shareCardProps ? (
            <ShareCardOverlay {...shareCardProps} previewMode />
          ) : null
        }
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

  // Generic renderer for a flexible, ordered program block. Themes the card by
  // the block's bucket (icon/background) and gives each block a unique key slot
  // so two blocks sharing a bucket (e.g. skill + strength) don't collide.
  const blockBgByBucket = {
    warmup: warmupBg,
    strength: strengthBg,
    metcon: metconBg,
    accessories: accessoriesBg,
  } as const;
  const renderBlockCard = (b: ProgramBlock, isColumns = false) => (
    <WorkoutBlockCard
      key={b.key}
      blockType={b.bucket}
      block={b}
      keySuffix={b.key}
      activeVariation={activeVariation!}
      activeDay={activeDay}
      isColumns={isColumns}
      enableThemedBackgrounds={enableThemedBackgrounds}
      backgroundImage={blockBgByBucket[b.bucket]}
      icon={svgIcons[b.bucket]}
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

  // Day share actions — STORY JPG (primary) with the "+ FOTO" attach folded in
  // as a borderless secondary. (PROGRAMA DEL DÍA / Markdown lives in the month
  // toolbar now.) Single source of truth for every board layout.
  const renderDayExportActions = (columns = false) => (
    <>
      {activeDay && (
        <div className={`mt-6 no-print w-full${columns ? " col-span-full" : ""}`}>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={exportFileInputRef}
            onChange={handleBgImageUpload}
          />
          <div className="flex w-full overflow-hidden rounded-sm">
            <button
              type="button"
              onClick={handleExportDayJPG}
              disabled={isExportingJPG}
              className="flex-grow flex items-center justify-center gap-2.5 px-6 py-4 font-brutalist text-xs sm:text-sm tracking-widest font-extrabold uppercase transition-all duration-300 border-none bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-white shadow-sm hover:shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer text-center"
              title="Exportar los ejercicios de este día a una imagen en formato IG Story"
            >
              <Share2 size={18} className={`${isExportingJPG ? "animate-spin text-amber-200" : "text-amber-100 "}`} />
              <span>{isExportingJPG ? "EXPORTANDO..." : "STORY JPG"}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowStoryMenu((s) => !s);
              }}
              aria-expanded={showStoryMenu}
              className={`shrink-0 flex items-center justify-center gap-1.5 px-4 py-4 font-brutalist text-[11px] tracking-wider font-extrabold uppercase transition-all duration-300 border-none active:scale-95 cursor-pointer ${showStoryMenu ? "bg-amber-700/60 text-amber-100" : "bg-amber-900/40 hover:bg-amber-800/50 text-amber-300"}`}
              title="Opciones de la imagen: foto de fondo y personalización"
            >
              <Settings2 size={16} />
              <span>OPCIONES</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${showStoryMenu ? "rotate-180" : ""}`} />
            </button>
          </div>

          {showStoryMenu && (
            <div className="mt-2 space-y-3 border border-white/10 bg-black/40 p-3 rounded-sm">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  exportFileInputRef.current?.click();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 font-brutalist text-[11px] tracking-wider font-extrabold uppercase transition-all duration-300 border border-white/10 bg-amber-900/30 hover:bg-amber-800/40 text-amber-300 active:scale-95 cursor-pointer"
                title="Adjuntar una foto tuya de fondo para la imagen"
              >
                <Camera size={16} />
                <span>{exportBgImage ? "CAMBIAR FOTO DE FONDO" : "ADJUNTAR FOTO DE FONDO"}</span>
              </button>
              {renderExportCustomizationPanel()}
            </div>
          )}
        </div>
      )}
    </>
  );


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
                    setAutoFollow(false);
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

            {/* DAY MARKDOWN EXPORT (moved here, renamed) */}
            {activeDay && (
              <button
                onClick={handleExportDayMarkdown}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-700 to-indigo-800 hover:from-indigo-600 hover:to-indigo-700 text-white rounded shadow-sm active:scale-95 transition-all text-[11px] sm:text-xs font-brutalist tracking-wider font-extrabold uppercase shrink-0 cursor-pointer self-start sm:self-auto"
                title="Exportar el programa del día actual a Markdown para el coach"
              >
                <FileText size={14} className="text-indigo-200" />
                <span>PROGRAMA DEL DÍA</span>
              </button>
            )}
          </div>
        </div>
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
                          setAutoFollow(false);
                          setCurrentDayIndex(idx);
                        }}
                      >
                        {["L", "M", "M", "J", "V", "S", "D"][idx] ??
                          day.name.charAt(0)}
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

                <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] 2xl:text-[11rem] font-black tracking-tighter leading-none uppercase flex flex-wrap justify-center items-center gap-x-4 transition-all duration-300 min-h-[5.5rem] md:min-h-[7rem] z-10">
                  <span>{activeDay.name}</span>
                  <img 
                    src="/logo.svg" 
                    alt="Nexus L4" 
                    className="align-middle w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain cursor-pointer transition-all duration-300 hover:scale-110 inline-block"
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
                      className="bg-zinc-900 text-white border-2 border-white/20 focus:border-electric-blue/50 font-brutalist text-5xl sm:text-6xl md:text-7xl uppercase px-4 py-1.5 focus:outline-none text-center max-w-[480px] inline-block transition-colors"
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
              onHeightChange={setDayHeaderHeight}
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
                  {activeWeekPlan?.meta?.intention ? (
                    <span style={{ color: INTENTION_META[activeWeekPlan.meta.intention].color }}>
                      {INTENTION_META[activeWeekPlan.meta.intention].label}
                      {activeWeekPlan.meta.inferred && (
                        <span
                          className="ml-1 text-[8px] align-super font-mono text-neutral-500"
                          title="Intención inferida del contenido del programa"
                        >
                          auto
                        </span>
                      )}
                    </span>
                  ) : currentWeek === "w1" ? (
                    "ACUMULACIÓN"
                  ) : currentWeek === "w2" ? (
                    "INTENSIFICACIÓN"
                  ) : currentWeek === "w3" ? (
                    "PEAK WEEK / ÁPEX"
                  ) : (
                    "DELOAD / DESCARGA"
                  )}
                  {activeWeekPlan?.meta?.gear != null && (
                    <span className="ml-2 text-[9px] font-mono tracking-normal bg-white/10 px-1.5 py-0.5 rounded text-neutral-300 align-middle">
                      {GEAR_LABEL[activeWeekPlan.meta.gear] || `GEAR ${activeWeekPlan.meta.gear}`}
                    </span>
                  )}
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
            {/* Pinned directly under the sticky day title so the variation tabs
                stay reachable while scrolling the board (Fase 7). */}
            {activeDay && (
              <div
                id="tabContainer"
                className="sticky z-[55] flex flex-col md:flex-row gap-4 mb-6 py-2.5 justify-between items-center max-w-7xl mx-auto w-full px-6 md:px-10 no-print bg-zinc-950/80 backdrop-blur-md"
                style={{ top: `${headerHeight + dayHeaderHeight}px` }}
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
                      setDesktopLayout("grid");
                      localStorage.setItem("nexus_desktop_layout", "grid");
                    }}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-mono font-black tracking-widest uppercase transition-all duration-250 flex items-center gap-1.5 cursor-pointer ${
                      desktopLayout === "grid"
                        ? "bg-electric-blue text-black font-black shadow-sm"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    <Columns size={10} className="shrink-0" />
                    <span>GRILLA</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDesktopLayout("papiro");
                      localStorage.setItem("nexus_desktop_layout", "papiro");
                    }}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-mono font-black tracking-widest uppercase transition-all duration-250 flex items-center gap-1.5 cursor-pointer ${
                      desktopLayout === "papiro"
                        ? "bg-electric-blue text-black font-black shadow-sm"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    <Rows3 size={10} className="shrink-0" />
                    <span>PAPIRO</span>
                  </button>
                </div>
              </div>
            )}

            {/* 5. MAIN BOARD BRUTALIST GRID */}
            <div className="w-full px-6 md:px-10 flex flex-col flex-grow">
              {activeVariation ? (
                desktopLayout === "sidebar" ? (
                  <div className="w-full flex-grow max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 md:gap-8 items-start relative select-none">
                    {activeVariation.blocks?.length ? (() => {
                      const flexBlocks = activeVariation.blocks!;
                      const active = flexBlocks.find((b) => b.key === activeFlexKey) || flexBlocks[0];
                      const BUCKET_COLOR: Record<string, string> = {
                        warmup: "#1F51FF", strength: "#ff0055", metcon: "#00f0ff", accessories: "#a124ff",
                      };
                      return (
                        <>
                          <aside className="w-full lg:w-72 shrink-0 space-y-3 no-print">
                            <div className="text-[10px] font-mono tracking-widest text-[#00f0ff] uppercase pb-2 mb-3 flex justify-between items-center">
                              <span>// SESIÓN DE ENTRENAMIENTO</span>
                              <span>[{flexBlocks.length} BLOQUES]</span>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
                              {flexBlocks.map((b) => {
                                const c = BUCKET_COLOR[b.bucket] || "#1F51FF";
                                const isOn = active.key === b.key;
                                return (
                                  <button
                                    key={b.key}
                                    onClick={() => setActiveFlexKey(b.key)}
                                    className={`group w-full text-left p-3.5 sm:p-4 border transition-all duration-200 uppercase relative overflow-hidden cursor-pointer rounded-xs ${isOn ? "text-white shadow-sm" : "border-white/10 hover:border-white/30 bg-[#000000]/60 text-neutral-400 hover:text-white"}`}
                                    style={isOn ? { borderColor: c, backgroundColor: `${c}26` } : undefined}
                                  >
                                    <div className="flex justify-between items-start mb-1 font-brutalist gap-1.5">
                                      <span className="text-xs sm:text-[13px] font-extrabold tracking-wider truncate" style={isOn ? { color: c } : undefined}>
                                        {b.title || b.key}
                                      </span>
                                      <span className="text-[8.5px] font-mono tracking-tight shrink-0 bg-white/10 px-1.5 py-0.5 rounded font-extrabold text-neutral-300">
                                        {b.items.length}
                                      </span>
                                    </div>
                                    <div className="text-[9px] font-mono truncate text-neutral-500 group-hover:text-neutral-400 tracking-wider">
                                      {b.scheme || "—"}
                                    </div>
                                    {isOn && <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: c }} />}
                                  </button>
                                );
                              })}
                            </div>
                          </aside>
                          <div className="flex-grow w-full h-full min-h-[420px] transition-all duration-300" id="workoutBoard">
                            <motion.div
                              key={active.key}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.18, ease: "easeInOut" }}
                              className="h-full"
                            >
                              {renderBlockCard(active, false)}
                            </motion.div>
                            {renderDayExportActions()}
                          </div>
                        </>
                      );
                    })() : (
                    <>
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

                      {renderDayExportActions()}
                    </div>
                    </>
                    )}
                  </div>
                ) : desktopLayout === "papiro" ? (
                  // Papiro: a single wide column, block 1 → last, top to bottom.
                  <main
                    className="w-full flex-grow max-w-4xl mx-auto flex flex-col gap-6"
                    id="workoutBoard"
                    onTouchStart={handleVariationTouchStart}
                    onTouchMove={handleVariationTouchMove}
                    onTouchEnd={handleVariationTouchEnd}
                  >
                    {activeVariation.blocks?.length
                      ? activeVariation.blocks.map((b) => renderBlockCard(b, false))
                      : (
                        <>
                          {renderWarmupBlock(false)}
                          {renderStrengthBlock(false)}
                          {renderMetconBlock(false)}
                          {renderAccessoriesBlock(false)}
                        </>
                      )}
                    {renderDayExportActions(false)}
                  </main>
                ) : (
                  // Grilla: adaptive columns (up to 6) — fewer blocks, fewer columns.
                  <main
                    className={`w-full flex-grow grid grid-cols-1 md:grid-cols-2 ${FULLVIEW_XL_COLS[Math.min(6, Math.max(1, activeVariation.blocks?.length || 4))]} gap-6 items-stretch`}
                    id="workoutBoard"
                    onTouchStart={handleVariationTouchStart}
                    onTouchMove={handleVariationTouchMove}
                    onTouchEnd={handleVariationTouchEnd}
                  >
                    {activeVariation.blocks?.length
                      ? activeVariation.blocks.map((b) => renderBlockCard(b, true))
                      : (
                        <>
                          {renderWarmupBlock(true)}
                          {renderStrengthBlock(true)}
                          {renderMetconBlock(true)}
                          {renderAccessoriesBlock(true)}
                        </>
                      )}

                    {renderDayExportActions(true)}
                  </main>
                )
              ) : (
                activeDay && (
                  <main className="w-full flex-grow" id="workoutBoard">
                    {/* Default rest day whiteboard rendering */}
                    <section className="col-span-1 flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/15 bg-pure-black/95 text-center space-y-6">
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
              database={database}
              dailyGoals={dailyGoals}
              onSaveGoal={(key, text) => {
                setDailyGoals((prev) => {
                  const updated = { ...prev, [key]: text };
                  localStorage.setItem("nexus_daily_goals", JSON.stringify(updated));
                  return updated;
                });
              }}
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
            className="px-6 md:px-10 flex-grow flex flex-col gap-5"
          >
            <LensTabs
              tabs={[
                { key: "perfil", label: "Perfil" },
                { key: "datos", label: "Datos & Nube" },
                { key: "logros", label: "Logros" },
              ]}
              active={profileLens}
              onChange={(k) => {
                setProfileLens(k as "perfil" | "datos" | "logros");
                localStorage.setItem("nexus_profile_lens", k);
              }}
              accent={activeColorSet.color}
            />

            {profileLens === "perfil" && (
              <ProfileSummaryCard
                athlete={athlete}
                onEdit={() => setShowProfileModal(true)}
              />
            )}

            {profileLens === "datos" && (
              <> {/* Datos & Nube lens */}
            {/* CLOUD PERSISTENCE PANEL: SECURE SYNC ENGINE */}
            <CloudSyncPanel
              currentUser={currentUser}
              isCloudSyncing={isCloudSyncing}
              setIsCloudSyncing={setIsCloudSyncing}
              syncStatus={syncStatus}
              setConfettiTrigger={setConfettiTrigger}
              onRefreshFromSheet={handleRefreshFromSheet}
              isRefreshingSheet={isRefreshingSheet}
              currentDatabase={database}
              onProgramImported={(db, meta) => {
                // A new chapter — never overwrite the prior one. createChapter
                // archives the current chapter and starts this one fresh; it
                // sets the live program, so reflect it in state here.
                createChapter(
                  { title: meta?.title || "NUEVO CAPÍTULO", lore: meta?.lore },
                  db,
                );
                setDatabase(db);
                setCurrentVariationIndex(0);
                setCompletedDays(() => {
                  const fresh: Record<string, boolean> = {};
                  ["w1", "w2", "w3", "w4"].forEach((w) => {
                    for (let d = 1; d <= 7; d++) fresh[`${w}d${d}`] = false;
                  });
                  return fresh;
                });
                window.dispatchEvent(new Event("nexus_logs_updated"));
                // Fase 3: classify each block's inspiration ONCE (AI when a key
                // is configured, else the keyword heuristic), then persist the
                // tagged program into the now-active chapter (LIVE_PROGRAM).
                tagChapterInspiration(db)
                  .then((tagged) => {
                    setDatabase(tagged);
                    saveCachedWorkouts(tagged);
                  })
                  .catch((e) => console.error("tagChapterInspiration failed:", e));
              }}
            />

            {/* 1RM BRZYCKI CALIBRATOR TOOL */}
            <section className="mt-4">
              <BrzyckiCalculator />
            </section>
              </>
            )}

            {profileLens === "logros" && (
            <TelemetryBoard
              athlete={athlete}
              currentWeek={currentWeek}
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
            )}
          </motion.div>
        )}

        {activeSheet === 3 && (
          <motion.div
            key="sheet-guerrero"
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
            className="px-4 md:px-10 flex-grow flex flex-col"
          >
            <WarriorScreen
              athlete={athlete}
              currentXp={currentXp}
              xpPercentage={xpPercentage}
              unlockedAchievements={unlockedAchievements}
              activeColorSet={activeColorSet}
              currentWeek={currentWeek}
              currentDayIndex={currentDayIndex}
              activeDayId={activeDay?.id ?? `${currentWeek}d${currentDayIndex + 1}`}
              activeDayName={activeDay?.title || activeDay?.name || "LA GRIETA"}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. CUSTOM CONFIRM BRUTALIST DIALOGS (Replaces standard popup blockages) */}
      <AnimatePresence>
        {showResetModal && (
          <ResetConfirmModal
            key="reset-modal"
            onConfirm={handleConfirmReset}
            onCancel={() => setShowResetModal(false)}
          />
        )}


        {/* GLOBAL TOAST NOTIFICATIONS (CSV export feedback, etc.) */}
        <Toast key="global-toast" />

        {/* BRUTALIST CF-L4 ACHIEVEMENT UNLOCKED POPUP BANNER */}
        {activeAchievement && (
          <div key="achievement-banner" className="fixed inset-0 bg-transparent pointer-events-none flex items-start justify-center z-[200] p-4 text-center pt-12 md:pt-16">
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
            key="profile-modal"
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
        currentWorkouts={database as any}
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

      {/* 9. DECORATION COMPACT FOOTER — pb clears the floating buttons. */}
      <footer className="mt-8 pt-6 pb-24 opacity-40" data-purpose="footer-texture">
        <div className="flex justify-between border-t border-white/40 py-4 text-xs font-condensed font-bold uppercase tracking-wider">
          <span>{SYSTEM_NAME} // {SYSTEM_VERSION}</span>
          <span>READY FOR IMPACT // {SYSTEM_TAGLINE}</span>
        </div>
      </footer>

      {/* 9.5 FULLSCREEN INTERACTIVE PREVIEW MODAL */}
      {isFullscreenPreview && shareCardProps && (
        <div className="fixed inset-0 z-[999] bg-[#0a0a0f]/95 backdrop-blur-md flex flex-col no-print items-center justify-center overflow-hidden">
          {/* Header Controls */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto">
              <MousePointer2 className="text-amber-500 animate-bounce" size={20} />
              <span className="font-mono text-xs font-black tracking-widest text-amber-500 uppercase drop-shadow-md bg-black/40 px-2 py-1 rounded">
                MODO INTERACTIVO: ARRASTRAR ELEMENTOS
              </span>
            </div>
            
            <div className="flex items-center gap-3 pointer-events-auto">
              <button
                onClick={() => setBlockPositions({})}
                className="bg-red-900/80 hover:bg-red-800 text-white font-mono text-xs font-black tracking-widest px-4 py-2 uppercase rounded border border-red-500/30 transition-all active:scale-95 cursor-pointer"
              >
                RESET LAYOUT
              </button>
              <button
                onClick={() => setIsFullscreenPreview(false)}
                className="bg-zinc-800/80 hover:bg-zinc-700 text-white p-2 rounded-full border border-zinc-600/50 transition-all active:scale-95 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Interactive Card Container */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* The scale factor should ensure it fits perfectly within the viewport */}
            <div className="pointer-events-auto" style={{ transform: `scale(${previewScale})`, transformOrigin: "center" }}>
              <ShareCardOverlay {...shareCardProps} interactiveMode={true} previewMode={true} dragScale={previewScale} />
            </div>
          </div>
          
          {/* Bottom Export Button */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
            <button
              onClick={() => {
                setIsFullscreenPreview(false);
                setTimeout(handleExportDayJPG, 300);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-white font-mono text-sm font-black tracking-widest px-8 py-4 uppercase rounded shadow-[0_10px_30px_rgba(245,158,11,0.3)] transition-all active:scale-95 cursor-pointer"
            >
              <Share2 size={18} />
              CONFIRMAR Y EXPORTAR
            </button>
          </div>
        </div>
      )}

      {/* 9.7 STRUCTURED LOGGING — WIZARD "INCURSIÓN" */}
      {activeDay && activeVariation && (() => {
        const existingSession = getSessionForDay(activeDay.id);
        return (
        <>
          <button
            onClick={() => setWizardOpen(true)}
            title={existingSession ? "Editar la sesión registrada" : "Registrar la sesión paso a paso"}
            className="fixed bottom-5 left-5 z-[90] no-print bg-electric-blue text-black hover:bg-white font-brutalist text-xs tracking-widest uppercase px-4 py-3 rounded-sm shadow-lg shadow-electric-blue/20 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            {existingSession ? "✎ EDITAR INCURSIÓN" : "⚔ INCURSIÓN"}
          </button>
          <SessionWizard
            open={wizardOpen}
            onClose={() => setWizardOpen(false)}
            dayId={activeDay.id}
            dayName={activeDay.name}
            dayTitle={activeDay.title}
            variation={activeVariation}
            initialSession={existingSession}
            onSealed={(session) => {
              markDayComplete(session.dayId || activeDay.id);
            }}
          />
        </>
        );
      })()}

      {/* 10. HIDDEN OFF-SCREEN CARD FOR JPG EXPORT */}
      {shareCardProps && <ShareCardOverlay {...shareCardProps} />}
    </div>
  );
}
