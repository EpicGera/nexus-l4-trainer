import DOMPurify from "dompurify";
import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { parseProtocol } from "../lib/protocolParser";
import TimerSetupForm from "./timer/TimerSetupForm";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Zap,
  Heart,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Clock,
  SkipForward,
  Square,
} from "lucide-react";

interface WorkoutTimerProps {
  dayId: string;
  title?: string;
  scheme?: string;
  items?: string[];
  blockName?: string;
  key?: string | number;
  highRpeDetected?: boolean;
}


export default function WorkoutTimer({
  dayId,
  title = "",
  scheme = "",
  items = [],
  blockName = "",
  highRpeDetected = false,
}: WorkoutTimerProps) {
  // Config states
  const [isMuted, setIsMuted] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<
    "default" | "granted" | "denied" | "unsupported"
  >(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "unsupported";
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Simulated Heart Rate
  const [heartRate, setHeartRate] = useState<number>(75);
  const [isHighHRManual, setIsHighHRManual] = useState<boolean>(false);

  // Notification Flash State
  const [flashType, setFlashType] = useState<"WORK" | "REST" | "DONE" | null>(
    null,
  );

  // Parse standard protocol settings from title and scheme
  const smartConfig = useMemo(
    () => parseProtocol(title, scheme, blockName),
    [scheme, title, blockName],
  );

  // Operational states (with manual on-the-fly override dials)
  const [workOverride, setWorkOverride] = useState<number | null>(null);
  const [restOverride, setRestOverride] = useState<number | null>(null);
  const [roundsOverride, setRoundsOverride] = useState<number | null>(null);

  // Active values (checking overrides)
  const activeWork =
    workOverride !== null ? workOverride : smartConfig.work || 0;
  const activeRest =
    restOverride !== null ? restOverride : smartConfig.rest || 0;
  const activeRounds =
    roundsOverride !== null ? roundsOverride : smartConfig.rounds || 1;

  const [smartState, setSmartState] = useState<
    "IDLE" | "WORK" | "REST" | "DONE"
  >("IDLE");
  const [smartRound, setSmartRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);

  // Pause flag for the smart timer. Pausing keeps the active phase (WORK/REST)
  // and the remaining time intact instead of collapsing back to IDLE.
  const [isPaused, setIsPaused] = useState(false);

  // Automated custom interval choices (work/rest rounds) when protocol lacks explicit guidelines
  const [showAutoSetup, setShowAutoSetup] = useState(false);
  const [customIntervalConfigured, setCustomIntervalConfigured] =
    useState(false);
  const [tempWork, setTempWork] = useState(60);
  const [tempRest, setTempRest] = useState(90);
  const [tempRounds, setTempRounds] = useState(4);

  // Secondary independent stopwatch
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchPlaying, setIsStopwatchPlaying] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopwatchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // Wall-clock anchors. By comparing against Date.now() on every tick instead of
  // decrementing a counter, the timer stays accurate even when the browser throttles
  // setInterval (background tab, screen off on mobile) — critical for a WOD clock.
  const phaseEndRef = useRef<number | null>(null); // epoch ms when the current phase ends
  const swBaseRef = useRef<number | null>(null); // epoch ms baseline for the stopwatch
  const lastBeepRef = useRef<number>(-1); // last whole-second we already beeped for

  const isRunning =
    (smartState === "WORK" || smartState === "REST") && !isPaused;

  // Tone generator (Athletic retro beeps)
  const playChimeNote = (
    freq: number,
    duration: number,
    type: OscillatorType = "sine",
  ) => {
    if (isMuted) return;
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    try {
      const p = await Notification.requestPermission();
      setNotificationPermission(p);
      if (p === "granted") {
        new Notification("⏱️ Smart Timer Activo", {
          body: "Bip sonoro e indicadores de fase listos de acuerdo al protocolo L4.",
          tag: "timer-setup",
        });
      }
    } catch (err) {}
  };

  const triggerAlarm = (
    message: string,
    type: "WORK" | "REST" | "DONE" | null = null,
  ) => {
    if (type) setFlashType(type);

    // Gym double chime
    playChimeNote(587.33, 0.25, "triangle"); // D5
    setTimeout(() => playChimeNote(880.0, 0.45, "sine"), 120); // A5

    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        const notif = new Notification("⏱️ Nexus L4 Clock", {
          body: message,
          tag: "workout-rest",
          requireInteraction: true,
        });
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (err) {}
    }
    setTimeout(() => setFlashType(null), 3000);
  };

  // Anchor a fresh countdown phase to the wall clock.
  const startPhase = (seconds: number) => {
    phaseEndRef.current = Date.now() + seconds * 1000;
    lastBeepRef.current = -1;
    setTimeLeft(seconds);
  };

  // Transition into a timed phase (also auto-starts the global stopwatch).
  const enterPhase = (state: "WORK" | "REST", seconds: number) => {
    setIsPaused(false);
    setSmartState(state);
    startPhase(seconds);
    setIsStopwatchPlaying(true);
  };

  // Reset Smart Timer parameters
  const initializeSmartTimer = () => {
    setSmartState("IDLE");
    setSmartRound(1);
    setIsPaused(false);
    phaseEndRef.current = null;
    lastBeepRef.current = -1;

    if (activeWork > 0) {
      setTimeLeft(activeWork);
    } else {
      setTimeLeft(activeRest || 90);
    }
  };

  // Reset overrides when block/day changes
  useEffect(() => {
    setWorkOverride(null);
    setRestOverride(null);
    setRoundsOverride(null);
    setSmartState("IDLE");
    setSmartRound(1);
    setIsPaused(false);
    setShowAutoSetup(false);
    setCustomIntervalConfigured(false);
    phaseEndRef.current = null;
    swBaseRef.current = null;
    lastBeepRef.current = -1;

    // Apply initial parsing values directly
    const defaultWork = smartConfig.work || 0;
    const defaultRest = smartConfig.rest || 0;
    if (defaultWork > 0) {
      setTimeLeft(defaultWork);
    } else {
      setTimeLeft(defaultRest || 90);
    }

    setStopwatchTime(0);
    setIsStopwatchPlaying(false);
  }, [dayId, smartConfig]);

  // Dynamically update timeLeft when overrides change and the timer is in IDLE mode
  useEffect(() => {
    if (smartState === "IDLE" && smartRound === 1) {
      if (activeWork > 0) {
        setTimeLeft(activeWork);
      } else {
        setTimeLeft(activeRest || 90);
      }
    }
  }, [activeWork, activeRest, smartState, smartRound]);

  // HR Simulation rules
  useEffect(() => {
    if (isHighHRManual) {
      setHeartRate(165 + Math.floor(Math.random() * 6));
      return;
    }
    const isActive =
      smartState === "WORK" || smartState === "REST" || isStopwatchPlaying;
    if (isActive) {
      if (smartState === "WORK" || isStopwatchPlaying) {
        setHeartRate((prev) =>
          Math.min(
            182,
            prev < 115 ? 115 : prev + Math.floor(Math.random() * 3),
          ),
        );
      } else if (smartState === "REST") {
        setHeartRate((prev) =>
          Math.max(88, prev - Math.floor(Math.random() * 2) - 1),
        );
      }
    } else {
      setHeartRate((prev) =>
        prev > 74
          ? prev - Math.floor(Math.random() * 2) - 1
          : prev + Math.floor(Math.random() * 2),
      );
    }
  }, [timeLeft, stopwatchTime, smartState, isStopwatchPlaying, isHighHRManual]);

  // Handle phase transitions
  const handlePhaseComplete = () => {
    if (activeWork > 0 && activeRest > 0) {
      // Alternating intervals
      if (smartState === "WORK") {
        triggerAlarm("¡TRABAJO TERMINADO! Entrando en descanso.", "REST");
        setSmartState("REST");
        startPhase(activeRest);
      } else {
        // Increment round
        const nextRound = smartRound + 1;
        if (nextRound > activeRounds) {
          triggerAlarm(
            "¡BLOQUE COMPLETADO! Buen trabajo, Everyday Athlete.",
            "DONE",
          );
          setSmartState("DONE");
          phaseEndRef.current = null;
          setTimeLeft(0);
        } else {
          triggerAlarm(`¡RONDA ${nextRound}! A trabajar.`, "WORK");
          setSmartRound(nextRound);
          setSmartState("WORK");
          startPhase(activeWork);
        }
      }
    } else if (activeWork > 0) {
      // Work only intervals
      const nextRound = smartRound + 1;
      if (nextRound > activeRounds) {
        triggerAlarm(
          "¡BLOQUE COMPLETADO! Buen trabajo, Everyday Athlete.",
          "DONE",
        );
        setSmartState("DONE");
        phaseEndRef.current = null;
        setTimeLeft(0);
      } else {
        triggerAlarm(`¡RONDA ${nextRound}! A trabajar.`, "WORK");
        setSmartRound(nextRound);
        setSmartState("WORK");
        startPhase(activeWork);
      }
    } else {
      // Rest only intervals
      triggerAlarm("¡DESCANSO COMPLETADO!", "DONE");
      setSmartState("DONE");
      phaseEndRef.current = null;
      setTimeLeft(0);
    }
  };

  // Countdown engine — anchored to the wall clock so it survives tab/background throttling.
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // On (re)entry — e.g. resuming from pause — re-anchor from the stored remaining time.
    if (phaseEndRef.current === null) {
      phaseEndRef.current = Date.now() + timeLeft * 1000;
    }

    const tick = () => {
      const end = phaseEndRef.current;
      if (end === null) return;
      const remaining = Math.max(0, Math.round((end - Date.now()) / 1000));

      // Climbing warning beeps on the final 3 seconds (once per whole second).
      if (
        remaining <= 3 &&
        remaining >= 1 &&
        remaining !== lastBeepRef.current
      ) {
        lastBeepRef.current = remaining;
        if (smartState === "WORK") {
          const notes: Record<number, number> = {
            3: 523.25,
            2: 587.33,
            1: 659.25,
          };
          playChimeNote(notes[remaining], 0.15, "triangle");
        } else {
          playChimeNote(880.0, 0.08, "triangle");
        }
      }

      if (Date.now() >= end) {
        setTimeLeft(0);
        handlePhaseComplete();
      } else {
        setTimeLeft(remaining);
      }
    };

    tick(); // reflect resume / visibility changes immediately
    intervalRef.current = setInterval(tick, 250);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, smartState, smartRound, activeWork, activeRest, activeRounds]);

  // Re-sync immediately when returning to the tab (snappier than waiting for the next tick).
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && isRunning) {
        const end = phaseEndRef.current;
        if (end === null) return;
        const remaining = Math.max(0, Math.round((end - Date.now()) / 1000));
        if (Date.now() >= end) handlePhaseComplete();
        else setTimeLeft(remaining);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, smartState, smartRound, activeWork, activeRest, activeRounds]);

  // Independent stopwatch — also wall-clock anchored.
  useEffect(() => {
    if (isStopwatchPlaying) {
      if (swBaseRef.current === null) {
        swBaseRef.current = Date.now() - stopwatchTime * 1000;
      }
      const tick = () => {
        if (swBaseRef.current === null) return;
        setStopwatchTime(Math.floor((Date.now() - swBaseRef.current) / 1000));
      };
      tick();
      stopwatchIntervalRef.current = setInterval(tick, 250);
    } else {
      // Freeze the baseline so a later resume continues from the same value.
      swBaseRef.current = null;
    }
    return () => {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
        stopwatchIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStopwatchPlaying]);

  // Manual on-the-fly adjusters. Centralised so the +/- dials stay in sync with the
  // wall-clock anchor (shifting phaseEndRef) instead of just nudging the displayed value.
  const adjustWork = (delta: number) => {
    setWorkOverride((prev) =>
      Math.max(0, (prev !== null ? prev : smartConfig.work || 0) + delta),
    );
    if (smartState === "WORK" || smartState === "IDLE") {
      setTimeLeft((t) => Math.max(0, t + delta));
      if (phaseEndRef.current !== null) phaseEndRef.current += delta * 1000;
    }
  };

  const adjustRest = (delta: number) => {
    setRestOverride((prev) =>
      Math.max(0, (prev !== null ? prev : smartConfig.rest || 0) + delta),
    );
    if (smartState === "REST" || (smartState === "IDLE" && activeWork === 0)) {
      setTimeLeft((t) => Math.max(0, t + delta));
      if (phaseEndRef.current !== null) phaseEndRef.current += delta * 1000;
    }
  };

  const adjustRounds = (delta: number) => {
    setRoundsOverride((prev) =>
      Math.max(1, (prev !== null ? prev : smartConfig.rounds || 1) + delta),
    );
  };

  const toggleSmartPlay = () => {
    if (smartState === "IDLE" || smartState === "DONE") {
      if (
        smartConfig.type === "NORMAL" &&
        !customIntervalConfigured &&
        workOverride === null
      ) {
        setShowAutoSetup(true);
        playChimeNote(523.25, 0.15, "sine"); // C5
        return;
      }

      if (smartState === "DONE") initializeSmartTimer();

      const nextPhase = activeWork > 0 ? "WORK" : "REST";
      enterPhase(nextPhase, nextPhase === "WORK" ? activeWork : activeRest || 90);
      playChimeNote(660.0, 0.12, "sine");

      if (notificationPermission === "default") requestNotificationPermission();
    } else if (smartState === "WORK" || smartState === "REST") {
      if (isPaused) {
        // Resume — re-anchor the countdown from the stored remaining time.
        phaseEndRef.current = Date.now() + timeLeft * 1000;
        lastBeepRef.current = -1;
        setIsPaused(false);
        playChimeNote(660.0, 0.1, "sine");
      } else {
        // Pause — keep the phase and remaining time intact.
        setIsPaused(true);
        playChimeNote(440.0, 0.1, "sine");
      }
    }
  };

  const skipPhase = () => {
    if (smartState === "WORK" || smartState === "REST") {
      playChimeNote(783.99, 0.15, "triangle"); // Note G5
      setIsPaused(false);
      handlePhaseComplete();
    }
  };

  const stopSmartPlay = () => {
    setWorkOverride(null);
    setRestOverride(null);
    setRoundsOverride(null);
    setCustomIntervalConfigured(false);
    setShowAutoSetup(false);
    initializeSmartTimer();
    stopStopwatch(); // Reset and stop global stopwatch too on "REINICIAR AMBOS"
  };

  const detenerReloj = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (stopwatchIntervalRef.current) {
      clearInterval(stopwatchIntervalRef.current);
      stopwatchIntervalRef.current = null;
    }

    setSmartState("IDLE");
    setSmartRound(1);
    setIsPaused(false);
    setIsStopwatchPlaying(false);
    setStopwatchTime(0);
    phaseEndRef.current = null;
    swBaseRef.current = null;
    lastBeepRef.current = -1;

    if (activeWork > 0) {
      setTimeLeft(activeWork);
    } else {
      setTimeLeft(activeRest || 90);
    }

    playChimeNote(330.0, 0.25, "sine");
  };

  const toggleStopwatch = () => {
    if (notificationPermission === "default") requestNotificationPermission();
    setIsStopwatchPlaying(!isStopwatchPlaying);
    playChimeNote(660.0, 0.1, "sine");
  };

  const stopStopwatch = () => {
    setIsStopwatchPlaying(false);
    setStopwatchTime(0);
    swBaseRef.current = null;
    playChimeNote(330.0, 0.2, "sine");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const renderSetupForm = (isFull: boolean) => {
    return (
      <TimerSetupForm
        isFull={isFull}
        tempWork={tempWork}
        tempRest={tempRest}
        tempRounds={tempRounds}
        setTempWork={setTempWork}
        setTempRest={setTempRest}
        setTempRounds={setTempRounds}
        formatTime={formatTime}
        onStartSeries={() => {
          setWorkOverride(tempWork);
          setRestOverride(tempRest);
          setRoundsOverride(tempRounds);
          setCustomIntervalConfigured(true);
          setSmartRound(1);
          enterPhase("WORK", tempWork);
          setShowAutoSetup(false);
          playChimeNote(660, 0.15, "triangle");
          if (notificationPermission === "default")
            requestNotificationPermission();
        }}
        onOnlyRest={() => {
          setCustomIntervalConfigured(false);
          setSmartRound(1);
          enterPhase("REST", tempRest);
          setShowAutoSetup(false);
          playChimeNote(587.33, 0.1, "sine");
        }}
        onCancel={() => {
          setShowAutoSetup(false);
        }}
      />
    );
  };

  const isLowTime =
    (smartState === "WORK" || smartState === "REST") &&
    timeLeft <= 10 &&
    timeLeft > 0;
  const isHighIntensity = heartRate >= 145;

  const renderProgress = () => {
    if (!isExpanded && !isFullscreen) return null;
    let total = 90;
    if (smartState === "WORK") total = activeWork || 1;
    else if (smartState === "REST") total = activeRest || 90;
    else total = activeWork || activeRest || 90;

    const pct = total > 0 ? (timeLeft / total) * 100 : 0;
    return (
      <div
        className={`absolute bottom-0 left-0 right-0 ${isFullscreen ? "h-3" : "h-1"} bg-black/30`}
      >
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            smartState === "WORK"
              ? "bg-rose-500"
              : smartState === "REST"
                ? "bg-emerald-400"
                : "bg-electric-blue"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  };

  // Render Compact Badge (Collapsed state)
  if (!isExpanded && !isFullscreen) {
    return (
      <div
        className="relative no-print w-full rounded-sm p-3 border border-transparent bg-zinc-950/60 backdrop-blur-xs hover:bg-neutral-900 transition-all cursor-pointer shadow-md"
        onClick={() => setIsExpanded(true)}
        role="button"
        tabIndex={0}
        aria-label="Abrir Smart Timer"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setIsExpanded(true); }
        }}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Clock size={24} className="text-electric-blue shrink-0" />
            <div className="flex flex-col items-start justify-center">
              <span className="text-sm font-condensed font-black tracking-widest text-[#00F0FF] uppercase">
                SMART TIMER
              </span>
            </div>

            {/* Status tags */}
            {(smartState === "WORK" || smartState === "REST") && (
              <span
                className={`text-[10px] px-2 py-0.5 ml-2 font-mono rounded font-bold uppercase ${
                  smartState === "WORK"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {smartState === "WORK" ? "WORK" : "REST"} {formatTime(timeLeft)}
                {isPaused ? " ⏸" : ""}
              </span>
            )}

            {isStopwatchPlaying && smartState === "IDLE" && (
              <span className="text-[10px] px-2 py-0.5 ml-2 font-mono rounded font-bold bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30">
                CRONO {formatTime(stopwatchTime)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono uppercase tracking-wider shrink-0">
            <span>ABRIR</span>
            <ChevronDown size={14} className="text-neutral-400" />
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERING FULLSCREEN MODE ---
  if (isFullscreen) {
    return createPortal(
      <div
        className={`fixed inset-0 z-[999999] bg-black text-white flex flex-col justify-between p-4 sm:p-6 md:p-8 h-screen w-screen overflow-y-auto overflow-x-hidden font-sans transition-all duration-300 ${
          flashType === "WORK" || (smartState === "WORK" && isLowTime)
            ? "shadow-[inset_0_0_155px_rgba(224,30,74,0.65)] border-8 border-rose-500/90"
            : flashType === "REST" || (smartState === "REST" && isLowTime)
              ? "shadow-[inset_0_0_155px_rgba(16,185,129,0.65)] border-8 border-emerald-500/90"
              : flashType === "DONE"
                ? "shadow-[inset_0_0_155px_rgba(0,240,255,0.65)] border-8 border-[#00F0FF]/90"
                : smartState === "WORK"
                  ? "shadow-[inset_0_0_100px_rgba(244,63,94,0.35)] border-4 border-rose-500/40"
                  : smartState === "REST"
                    ? "shadow-[inset_0_0_100px_rgba(16,185,129,0.35)] border-4 border-emerald-500/40"
                    : "border-0"
        }`}
      >
        {renderProgress()}

        {/* TOP STATUS BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#3F3F46] pb-3 w-full gap-3 shrink-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-[#00F0FF] animate-bounce" />
              <span className="font-mono text-xs text-[#00F0FF] tracking-widest font-black uppercase">
                CRONÓMETRO COMPETICIÓN NEXUS L4
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-condensed font-black tracking-wide text-neutral-200 uppercase mt-0.5 truncate">
              {title || "SMART TIMER"}
            </h1>
          </div>

          {/* Quick utility controls */}
          <div className="flex items-center gap-3 shrink-0 z-10">
            <button
              onClick={() => setIsMuted(!isMuted)}
              aria-label={isMuted ? "Activar sonido" : "Silenciar"}
              aria-pressed={isMuted}
              className="p-2 sm:p-3 rounded-md bg-neutral-900 border border-[#3F3F46] text-neutral-400 hover:text-white transition-all cursor-pointer"
            >
              {isMuted ? <VolumeX size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
            </button>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md border text-xs sm:text-sm font-mono ${
                isHighIntensity
                  ? "border-rose-500 text-rose-500 bg-rose-500/10 animate-pulse"
                  : "border-[#3F3F46] text-neutral-400"
              }`}
            >
              <Heart
                size={14}
                className={isHighIntensity ? "fill-current" : ""}
              />
              <span>{heartRate} lpm</span>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 sm:p-3 rounded-md bg-neutral-900 border border-[#3F3F46] text-neutral-400 hover:text-white transition-all cursor-pointer"
              aria-label="Salir de pantalla completa"
              title="Salir de pantalla completa"
            >
              <Minimize2 size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* TITAN PANEL GRID (Main Titan clock + sidebar stopwatch info) */}
        {showAutoSetup ? (
          <div className="flex-grow flex items-center justify-center w-full my-2 sm:my-4 z-10 p-4">
            {renderSetupForm(true)}
          </div>
        ) : (
          <div className="flex-grow flex flex-col lg:flex-row items-center justify-center w-full my-2 sm:my-4 gap-4 lg:gap-10 min-h-0 z-10">
            {/* Titans Column */}
            <div className="flex-grow flex flex-col justify-center items-center text-center w-full min-w-0">
              {/* Active stage label */}
              <div className="mb-0.5 shrink-0 z-10">
                {smartState === "WORK" && (
                  <span className="text-xl sm:text-2xl font-mono tracking-widest font-black text-rose-500 bg-rose-500/10 px-4 py-1 border border-rose-500/20 rounded-full animate-pulse">
                    {isPaused ? "PAUSA" : "¡TRABAJO!"}
                  </span>
                )}
                {smartState === "REST" && (
                  <span className="text-xl sm:text-2xl font-mono tracking-widest font-black text-emerald-400 bg-emerald-400/10 px-4 py-1 border border-emerald-400/20 rounded-full animate-pulse">
                    {isPaused ? "PAUSA" : "¡DESCANSO!"}
                  </span>
                )}
                {smartState === "IDLE" && (
                  <span className="text-xl sm:text-2xl font-mono tracking-widest font-black text-amber-400 bg-amber-400/10 px-4 py-1 border border-amber-400/20 rounded-full">
                    PREPARADO
                  </span>
                )}
                {smartState === "DONE" && (
                  <span className="text-xl sm:text-2xl font-mono tracking-widest font-black text-[#00F0FF] bg-[#00F0FF]/10 px-4 py-1 border border-[#00F0FF]/25 rounded-full animate-bounce">
                    LOGRADO
                  </span>
                )}
              </div>

              {/* GIANT COUNTDOWN TIMER */}
              <div
                className={`text-[31vw] xs:text-[29vw] sm:text-[18rem] md:text-[23rem] lg:text-[27rem] xl:text-[32rem] font-black font-mono leading-none tracking-tighter select-none tabular-nums truncate transition-colors duration-300 z-10 ${
                  smartState === "WORK"
                    ? "text-rose-500 font-black"
                    : smartState === "REST"
                      ? "text-emerald-400"
                      : smartState === "DONE"
                        ? "text-[#00F0FF]"
                        : "text-neutral-300"
                }`}
                style={{
                  textShadow: '0 0 30px rgba(255,255,255,0.4), 0 0 60px rgba(255,255,255,0.15), 0 0 100px rgba(255,255,255,0.08)',
                  WebkitTextStroke: '2px rgba(255,255,255,0.15)',
                }}
              >
                {formatTime(timeLeft)}
              </div>

              {/* PROTOCOLO LABELS AND MANUAL ADJUSTERS (Work, Rest, Rounds) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl w-full bg-neutral-900 border border-white/5 rounded-xl p-3 sm:p-4 mt-1 shrink-0 shadow-2xl z-10">
                {/* Work Adjuster */}
                <div className="flex flex-col items-center border-r border-[#3F3F46] pr-2">
                  <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-bold">
                    TRABAJO
                  </span>
                  <span className="text-sm sm:text-lg font-condensed font-bold text-white mt-0.5">
                    {activeWork ? `${formatTime(activeWork)}` : "S/D"}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <button
                      onClick={() => adjustWork(-10)}
                      className="min-h-[40px] px-3 bg-neutral-950 border border-[#3F3F46] rounded text-[11px] hover:bg-neutral-800 transition-colors cursor-pointer text-neutral-300"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => adjustWork(10)}
                      className="min-h-[40px] px-3 bg-neutral-950 border border-[#3F3F46] rounded text-[11px] hover:bg-neutral-800 transition-colors cursor-pointer text-neutral-300"
                    >
                      +10
                    </button>
                  </div>
                </div>

                {/* Rest Adjuster */}
                <div className="flex flex-col items-center border-r border-[#3F3F46] px-2">
                  <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-bold">
                    DESCANSO
                  </span>
                  <span className="text-sm sm:text-lg font-condensed font-bold text-emerald-400 mt-0.5">
                    {formatTime(activeRest)}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <button
                      onClick={() => adjustRest(-5)}
                      className="min-h-[40px] px-3 bg-neutral-950 border border-[#3F3F46] rounded text-[11px] hover:bg-neutral-800 transition-colors cursor-pointer text-neutral-300"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => adjustRest(5)}
                      className="min-h-[40px] px-3 bg-neutral-950 border border-[#3F3F46] rounded text-[11px] hover:bg-neutral-800 transition-colors cursor-pointer text-neutral-300"
                    >
                      +5
                    </button>
                  </div>
                </div>

                {/* Rounds Adjuster */}
                <div className="flex flex-col items-center pl-1">
                  <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-bold">
                    RONDA
                  </span>
                  <span className="text-sm sm:text-lg font-condensed font-bold text-[#00F0FF] mt-0.5">
                    {smartRound}/{activeRounds}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <button
                      onClick={() => adjustRounds(-1)}
                      className="min-h-[40px] px-3 bg-neutral-950 border border-[#3F3F46] rounded text-[11px] hover:bg-neutral-800 transition-colors cursor-pointer text-neutral-300"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => adjustRounds(1)}
                      className="min-h-[40px] px-3 bg-neutral-950 border border-[#3F3F46] rounded text-[11px] hover:bg-neutral-800 transition-colors cursor-pointer text-neutral-300"
                    >
                      +1
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SECONDARY SIDEBAR: AUXILIARY STOPWATCH */}
            <div className="lg:w-80 w-full bg-neutral-900/85 p-3 sm:p-4 rounded-xl border border-white/5 flex flex-row lg:flex-col justify-between items-center sm:items-stretch shrink-0 shadow-xl gap-3 sm:gap-4 z-10">
              <div className="flex flex-row lg:flex-col items-center lg:items-stretch gap-4 lg:gap-0 flex-grow">
                <div className="flex items-center gap-2 border-b-0 lg:border-b border-[#3F3F46] pb-0 lg:pb-2 mb-0 lg:mb-3">
                  <Clock size={15} className="text-[#00F0FF]" />
                  <span className="font-mono text-[10px] sm:text-xs text-neutral-400 tracking-wider font-bold uppercase truncate">
                    GLOBAL
                  </span>
                  {isStopwatchPlaying && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-ping" />
                  )}
                </div>

                <div className="text-left lg:text-center py-0 lg:py-2">
                  <div className="text-2xl sm:text-3xl lg:text-5xl font-black font-mono text-white tracking-widest tabular-nums leading-none">
                    {formatTime(stopwatchTime)}
                  </div>
                </div>
              </div>

              {/* Stopwatch Actions */}
              <div className="flex lg:grid lg:grid-cols-2 gap-1.5 shrink-0">
                <button
                  onClick={toggleStopwatch}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded font-bold uppercase tracking-wider text-[10px] sm:text-xs font-mono transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    isStopwatchPlaying
                      ? "bg-orange-500/15 text-orange-400 border border-orange-500/20 hover:bg-orange-500/25"
                      : "bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/20 hover:bg-[#00F0FF]/25"
                  }`}
                >
                  {isStopwatchPlaying ? (
                    <Pause size={12} />
                  ) : (
                    <Play size={12} />
                  )}
                  <span>{isStopwatchPlaying ? "PAUSA" : "START"}</span>
                </button>
                <button
                  onClick={stopStopwatch}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded bg-neutral-950 border border-[#3F3F46] text-neutral-400 hover:text-white transition-all text-[10px] sm:text-xs font-mono font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>RESET</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FULLSCREEN MARQUEE EXERCISE LIST */}
        {items && items.length > 0 && (
          <div className="w-full overflow-hidden border-t border-[#3F3F46] py-2.5 shrink-0 z-10">
            <div
              className="flex whitespace-nowrap"
              style={{
                animation: `marquee ${Math.max(15, items.length * 5)}s linear infinite`,
              }}
            >
              {[...items, ...items].map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-neutral-400 uppercase tracking-wider mr-8 shrink-0"
                >
                  <img src="/logo.svg" className="w-3.5 h-3.5 shrink-0 object-contain" alt="Logo" />
                  <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.replace(/<span[^>]*>.*?<\/span>/gi, '')) }} />
                </span>
              ))}
            </div>
            <style>{`
              @keyframes marquee {
                0% { transform: translateX(0%); }
                100% { transform: translateX(-50%); }
              }
            `}</style>
          </div>
        )}

        {/* BOTTOM TIMER ACTIONS ROW */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 shrink-0 border-t border-[#3F3F46] pt-3.5 w-full z-10">
          {smartState === "WORK" && activeRest > 0 && (
            <button
              onClick={() => {
                triggerAlarm(
                  "¡TRABAJO TERMINADO! Entrando en descanso.",
                  "REST",
                );
                enterPhase("REST", activeRest);
              }}
              className="px-6 py-3 sm:px-8 sm:py-3.5 rounded-full bg-emerald-500 font-black text-black uppercase tracking-widest text-[10px] sm:text-xs transition-all shadow-lg hover:scale-105 cursor-pointer animate-pulse flex items-center gap-1.5"
            >
              <Zap size={15} className="fill-current" />
              <span>INICIAR DESCANSO ({formatTime(activeRest)})</span>
            </button>
          )}

          {smartState === "REST" && (
            <button
              onClick={skipPhase}
              className="px-6 py-3 sm:px-8 sm:py-3.5 rounded-full bg-rose-500 text-black font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all shadow-lg hover:scale-105 cursor-pointer flex items-center gap-1.5"
            >
              <SkipForward size={15} className="fill-current" />
              <span>TERMINAR DESCANSO (SERIE LISTA)</span>
            </button>
          )}

          <button
            onClick={toggleSmartPlay}
            className={`px-8 py-4 sm:px-11 sm:py-5 rounded-full font-black uppercase tracking-widest text-xs sm:text-sm transition-all focus:outline-none flex items-center gap-2 shadow-2xl hover:scale-105 cursor-pointer ${
              smartState === "WORK" || smartState === "REST"
                ? "bg-amber-400 text-black hover:bg-amber-300 shadow-amber-400/40 ring-4 ring-amber-400/30 font-black"
                : "bg-emerald-400 text-black hover:bg-emerald-300 hover:shadow-emerald-400/75 ring-8 ring-emerald-400/20 shadow-[0_0_35px_rgba(52,211,153,0.55)] animate-pulse font-black"
            }`}
          >
            {isRunning ? (
              <Pause size={18} className="fill-current" />
            ) : (
              <Play size={18} className="fill-current" />
            )}
            <span>
              {isRunning
                ? "PAUSAR CONTEO"
                : isPaused
                  ? "REANUDAR"
                  : "EMPEZAR PROTOCOLO"}
            </span>
          </button>

          {(smartState === "WORK" ||
            smartState === "REST" ||
            timeLeft < (activeWork || 0)) && (
            <button
              type="button"
              onClick={detenerReloj}
              className="px-8 py-4 sm:px-11 sm:py-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest text-xs sm:text-sm transition-all focus:outline-none flex items-center gap-2 shadow-2xl hover:scale-105 cursor-pointer border border-rose-500/20"
            >
              <Square size={18} className="fill-current" />
              <span>DETENER RELOJ</span>
            </button>
          )}

          {(smartState === "WORK" || smartState === "REST") && (
            <button
              onClick={skipPhase}
              className="px-4 py-3 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 hover:bg-indigo-600/30 transition-all font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 cursor-pointer hover:scale-105"
              title="Avanzar de fase manualmente"
            >
              <SkipForward size={12} />
              <span>SALTAR FASE</span>
            </button>
          )}

          <button
            onClick={stopSmartPlay}
            className="px-4 py-3 rounded-full bg-neutral-900 border border-[#3F3F46] text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 cursor-pointer hover:scale-105"
          >
            <RotateCcw size={12} />
            <span>REINICIAR AMBOS</span>
          </button>

          <button
            onClick={() => setIsFullscreen(false)}
            className="px-5 py-3 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-lg hover:scale-105 cursor-pointer"
          >
            SALIR DEL RELOJ
          </button>
        </div>
      </div>,
      document.body,
    );
  }

  // --- RENDERING EXPANDED IN-LINE CARD MODE ---
  return (
    <div
      className={`relative transition-all duration-300 no-print flex flex-col overflow-hidden w-full rounded-xl p-4 md:p-6 my-4 shadow-xl border ${
        flashType === "WORK"
          ? "border-rose-500 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.3)] text-rose-100"
          : flashType === "REST"
            ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.3)] text-emerald-100"
            : flashType === "DONE"
              ? "border-[#00F0FF] bg-[#00F0FF]/10 shadow-[0_0_20px_rgba(0,240,255,0.3)] text-[#00F0FF]"
              : isLowTime
                ? "border-rose-500/50 bg-rose-500/10 text-rose-200"
                : "border-transparent bg-zinc-950/90"
      }`}
    >
      {renderProgress()}

      {/* Header Info */}
      <div className="flex flex-wrap justify-between items-center z-10 w-full mb-4 gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <Zap
            size={14}
            className={
              flashType || isLowTime
                ? "text-rose-500 animate-pulse"
                : "text-electric-blue"
            }
          />
          <span className="font-mono text-[10px] text-neutral-400 tracking-widest uppercase font-black">
            SMART TIMER
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] shrink-0">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
          <button
            type="button"
            onClick={() => setIsHighHRManual(!isHighHRManual)}
            className={`flex items-center gap-1 p-1.5 rounded border transition-colors cursor-pointer ${
              isHighIntensity
                ? "border-rose-500 text-rose-400 animate-pulse bg-rose-500/10"
                : "border-[#3F3F46] bg-zinc-900 text-neutral-400"
            }`}
          >
            <Heart
              size={12}
              className={isHighIntensity ? "fill-current" : ""}
            />{" "}
            {heartRate}
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 px-3 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 font-extrabold font-mono tracking-widest uppercase flex items-center gap-1.5 transition-all cursor-pointer hover:scale-102"
          >
            <Maximize2 size={12} className="stroke-[3px]" />
            <span>PANTALLA COMPLETA</span>
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronUp size={13} />
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      {showAutoSetup ? (
        <div className="w-full relative z-10 pb-2">
          {renderSetupForm(false)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 z-10 w-full relative content-center pb-2">
          {/* SMART TIMER PANEL */}
          <div
            className={`flex flex-col p-4 w-full justify-center rounded-lg border ${
              highRpeDetected
                ? "border-transparent shadow-[0_0_20px_rgba(225,29,72,0.35)] animate-pulse"
                : flashType === "WORK"
                  ? "bg-rose-500/20 border-rose-500"
                  : flashType === "REST"
                    ? "bg-emerald-500/20 border-emerald-500"
                    : flashType === "DONE"
                      ? "bg-[#00F0FF]/25 border-[#00F0FF]"
                      : isLowTime
                        ? "bg-rose-500/5 border-rose-500/40"
                        : "bg-black/40 border-transparent"
            }`}
          >
            <div className="flex justify-between items-start mb-2 gap-2">
              <div className="flex flex-col overflow-hidden">
                <span
                  className={`text-[9px] font-mono tracking-widest uppercase font-black ${
                    smartState === "WORK"
                      ? "text-rose-400"
                      : smartState === "REST"
                        ? "text-emerald-400"
                        : "text-neutral-400"
                  }`}
                >
                  {smartConfig.name || "TEMPORIZADOR"}
                </span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider truncate mt-0.5">
                  {smartConfig.type === "INTERVAL" ||
                  smartConfig.type === "EMOM"
                    ? `Ronda: ${smartRound}/${activeRounds}`
                    : "Cuenta regresiva"}{" "}
                  <span
                    className={
                      smartState === "WORK"
                        ? "text-rose-400 font-black"
                        : smartState === "REST"
                          ? "text-emerald-400 font-black"
                          : "text-neutral-500"
                    }
                  >
                    ({isPaused ? "PAUSA" : smartState})
                  </span>
                </span>
              </div>

              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={toggleSmartPlay}
                  className={`p-1.5 rounded transition-colors flex items-center justify-center cursor-pointer ${
                    smartState === "WORK" || smartState === "REST"
                      ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                      : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                  }`}
                >
                  {isRunning ? (
                    <Pause size={14} />
                  ) : (
                    <Play size={14} />
                  )}
                </button>
                {(smartState === "WORK" || smartState === "REST") && (
                  <button
                    type="button"
                    onClick={skipPhase}
                    className="p-1.5 bg-indigo-950/80 border border-indigo-900/30 text-indigo-400 hover:bg-indigo-900/30 rounded transition-colors flex items-center justify-center cursor-pointer"
                    title="Avanzar de fase"
                  >
                    <SkipForward size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={detenerReloj}
                  className="p-1.5 bg-rose-950/20 text-rose-400 hover:text-white hover:bg-rose-900/40 rounded transition-colors flex items-center justify-center cursor-pointer"
                  title="Detener reloj (Retiene ajustes)"
                >
                  <Square size={14} />
                </button>
                <button
                  type="button"
                  onClick={stopSmartPlay}
                  className="p-1.5 bg-zinc-900 text-neutral-400 hover:text-white rounded transition-colors flex items-center justify-center cursor-pointer"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            <div
              className={`text-5xl font-mono font-black tracking-tight select-none tabular-nums py-2 ${
                flashType === "WORK" || isLowTime || smartState === "WORK"
                  ? "text-rose-500"
                  : flashType === "REST" || smartState === "REST"
                    ? "text-emerald-400"
                    : flashType === "DONE"
                      ? "text-[#00F0FF]"
                      : "text-neutral-300"
              }`}
              style={{
                textShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.2)',
                WebkitTextStroke: '1px rgba(255,255,255,0.12)',
              }}
            >
              {formatTime(timeLeft)}
            </div>

            {/* INLINE MANUAL ADJUSTERS (Work, Rest, Rounds) */}
            <div className="grid grid-cols-3 gap-2 w-full bg-black/40 border border-white/5 rounded-lg p-2.5 mt-2">
              {/* Work Adjuster */}
              <div className="flex flex-col items-center border-r border-[#3F3F46] pr-1">
                <span className="text-[8px] font-mono tracking-widest text-neutral-500 uppercase font-bold">TRABAJO</span>
                <span className="text-xs font-condensed font-bold text-white mt-0.5">
                  {activeWork ? formatTime(activeWork) : "S/D"}
                </span>
                <div className="flex items-center gap-0.5 mt-1">
                  <button
                    type="button"
                    onClick={() => adjustWork(-10)}
                    className="p-0.5 px-1.5 bg-neutral-950 border border-[#3F3F46] rounded text-[8px] hover:bg-neutral-800 transition-colors cursor-pointer text-neutral-400"
                  >-10</button>
                  <button
                    type="button"
                    onClick={() => adjustWork(10)}
                    className="p-0.5 px-1.5 bg-neutral-950 border border-[#3F3F46] rounded text-[8px] hover:bg-neutral-800 transition-colors cursor-pointer text-neutral-400"
                  >+10</button>
                </div>
              </div>
              {/* Rest Adjuster */}
              <div className="flex flex-col items-center border-r border-[#3F3F46] px-1">
                <span className="text-[8px] font-mono tracking-widest text-neutral-500 uppercase font-bold">DESCANSO</span>
                <span className="text-xs font-condensed font-bold text-emerald-400 mt-0.5">
                  {formatTime(activeRest)}
                </span>
                <div className="flex items-center gap-0.5 mt-1">
                  <button
                    type="button"
                    onClick={() => adjustRest(-5)}
                    className="p-0.5 px-1.5 bg-neutral-950 border border-[#3F3F46] rounded text-[8px] hover:bg-neutral-800 transition-colors cursor-pointer text-neutral-400"
                  >-5</button>
                  <button
                    type="button"
                    onClick={() => adjustRest(5)}
                    className="p-0.5 px-1.5 bg-neutral-950 border border-[#3F3F46] rounded text-[8px] hover:bg-neutral-800 transition-colors cursor-pointer text-neutral-400"
                  >+5</button>
                </div>
              </div>
              {/* Rounds Adjuster */}
              <div className="flex flex-col items-center pl-1">
                <span className="text-[8px] font-mono tracking-widest text-neutral-500 uppercase font-bold">RONDA</span>
                <span className="text-xs font-condensed font-bold text-[#00F0FF] mt-0.5">
                  {smartRound}/{activeRounds}
                </span>
                <div className="flex items-center gap-0.5 mt-1">
                  <button
                    type="button"
                    onClick={() => adjustRounds(-1)}
                    className="p-0.5 px-1.5 bg-neutral-950 border border-[#3F3F46] rounded text-[8px] hover:bg-neutral-800 transition-colors cursor-pointer text-neutral-400"
                  >-1</button>
                  <button
                    type="button"
                    onClick={() => adjustRounds(1)}
                    className="p-0.5 px-1.5 bg-neutral-950 border border-[#3F3F46] rounded text-[8px] hover:bg-neutral-800 transition-colors cursor-pointer text-neutral-400"
                  >+1</button>
                </div>
              </div>
            </div>

            {/* MARQUEE EXERCISE LIST */}
            {items && items.length > 0 && (
              <div className="w-full overflow-hidden mt-2.5 border-t border-white/5 pt-2">
                <div
                  className="flex whitespace-nowrap animate-marquee"
                  style={{
                    animation: `marquee ${Math.max(15, items.length * 5)}s linear infinite`,
                  }}
                >
                  {[...items, ...items].map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 uppercase tracking-wider mr-6 shrink-0"
                    >
                      <img src="/logo.svg" className="w-3 h-3 shrink-0 object-contain" alt="Logo" />
                      <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.replace(/<span[^>]*>.*?<\/span>/gi, '')) }} />
                    </span>
                  ))}
                </div>
                <style>{`
                  @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                  }
                `}</style>
              </div>
            )}

            {/* DYNAMIC REST PHASING IN-CARD BUTTONS */}
            {smartState === "WORK" && activeRest > 0 && (
              <button
                type="button"
                onClick={() => {
                  triggerAlarm(
                    "¡TRABAJO TERMINADO! Entrando en descanso.",
                    "REST",
                  );
                  enterPhase("REST", activeRest);
                }}
                className="mt-1 w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all rounded-md flex items-center justify-center gap-1.5 shadow-md cursor-pointer animate-pulse"
              >
                <Zap size={12} className="fill-current" />
                <span>INICIAR DESCANSO ({formatTime(activeRest)})</span>
              </button>
            )}

            {smartState === "REST" && (
              <button
                type="button"
                onClick={skipPhase}
                className="mt-1 w-full py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs transition-all rounded-md flex items-center justify-center gap-1.5 border border-rose-500/30 cursor-pointer text-center"
              >
                <SkipForward size={12} />
                <span>TERMINAR DESCANSO (EMPEZAR SERIE)</span>
              </button>
            )}

            {/* Quick preset selector buttons */}
            {(smartConfig.type === "NORMAL" ||
              smartConfig.type === "STRENGTH" ||
              smartState === "IDLE" ||
              smartState === "REST") && (
              <div className="flex flex-col mt-2.5">
                <span className="text-[8px] font-mono font-black tracking-widest text-neutral-400 uppercase mb-1">
                  PREAJUSTES DE DESCANSO INMEDIATOS:
                </span>
                <div className="flex flex-wrap gap-1">
                  {[30, 45, 60, 90, 120].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => {
                        setRestOverride(s);
                        enterPhase("REST", s);
                        playChimeNote(660, 0.1, "sine");
                        if (notificationPermission === "default")
                          requestNotificationPermission();
                      }}
                      className={`text-[9px] px-1.5 py-1 rounded font-mono font-black transition-all cursor-pointer ${
                        timeLeft === s && smartState === "REST"
                          ? "bg-emerald-400 text-black font-black font-mono shadow-md scale-105"
                          : "bg-neutral-900 border border-white/5 text-neutral-400 hover:text-white hover:bg-neutral-800"
                      }`}
                    >
                      {s}s REPOSO
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* STOPWATCH PANEL */}
          <div className="flex flex-col p-4 w-full justify-center bg-black/40 rounded-lg border border-white/5">
            <div className="flex justify-between items-start mb-2 gap-2">
              <div className="flex flex-col overflow-hidden">
                <span className="text-[9px] font-mono tracking-widest text-[#00F0FF] uppercase font-black">
                  CRONÓMETRO
                </span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider truncate mt-0.5">
                  Tiempo de sesión
                </span>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={toggleStopwatch}
                  className="p-1.5 bg-[#00F0FF]/15 text-[#00F0FF] hover:bg-[#00F0FF]/25 border border-[#00F0FF]/25 rounded transition-colors flex items-center justify-center cursor-pointer"
                >
                  {isStopwatchPlaying ? (
                    <Pause size={14} />
                  ) : (
                    <Play size={14} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={stopStopwatch}
                  className="p-1.5 bg-zinc-900 text-neutral-400 hover:text-white rounded transition-colors flex items-center justify-center cursor-pointer"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            <div className="text-5xl font-mono font-black tracking-tight text-neutral-300 py-2 tabular-nums">
              {formatTime(stopwatchTime)}
            </div>
          </div>
        </div>
      )}

      {/* Global Bottom Control Bar for Extended In-line Card */}
      <div className="flex flex-wrap gap-2.5 justify-center mt-3 pt-3 border-t border-white/5 w-full z-10">
        <button
          type="button"
          onClick={toggleSmartPlay}
          className={`px-5 py-2 rounded-full font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 shadow-md ${
            smartState === "WORK" || smartState === "REST"
              ? "bg-amber-400 text-black hover:bg-amber-300 shadow-amber-400/20"
              : "bg-emerald-400 text-black hover:bg-emerald-300 shadow-emerald-400/20"
          }`}
        >
          {isRunning ? (
            <Pause size={12} className="fill-current" />
          ) : (
            <Play size={12} className="fill-current" />
          )}
          <span>
            {isRunning ? "PAUSAR" : isPaused ? "REANUDAR" : "INICIAR RELOJ"}
          </span>
        </button>

        {(smartState === "WORK" ||
          smartState === "REST" ||
          timeLeft < (activeWork || 0)) && (
          <button
            type="button"
            onClick={detenerReloj}
            className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 shadow-md border border-rose-500/20 shadow-rose-600/20"
          >
            <Square size={11} className="fill-current" />
            <span>DETENER RELOJ</span>
          </button>
        )}

        {(smartState === "WORK" || smartState === "REST") && (
          <button
            type="button"
            onClick={skipPhase}
            className="px-4 py-2 rounded-full bg-zinc-900 border border-[#3F3F46] text-neutral-300 hover:text-white hover:bg-neutral-800 transition-all font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 cursor-pointer hover:scale-105"
          >
            <SkipForward size={11} />
            <span>SALTAR FASE</span>
          </button>
        )}

        <button
          type="button"
          onClick={stopSmartPlay}
          className="px-4 py-2 rounded-full bg-zinc-900 border border-[#3F3F46] text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 cursor-pointer hover:scale-105"
        >
          <RotateCcw size={11} />
          <span>REINICIAR ALL</span>
        </button>
      </div>
    </div>
  );
}
