import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { X, Swords, Skull, ChevronLeft, ChevronRight } from "lucide-react";
import { computeAthleteStats } from "../lib/athleteStats";
import { buildCharacter, collectLoggedMovements, GameCharacter } from "./characterBuilder";
import { AbyssEngine, HudState, GameResult } from "./engine";
import { buildRunContext, getBossWindow } from "./runContext";
import { HERO_DESIGNS, drawHero } from "./heroDesign";

interface AbyssGameProps {
  onClose: () => void;
  week: string;
  dayIndex: number;
  dayId: string;
  dayName: string;
}

interface BestRecord {
  runs: number;
  victories: number;
  bestDepth: number;
  bestKills: number;
  bestTimeMs: number | null;
  bossDefeats: number;
}

const BEST_KEY = "nexus_abyss_best"; // nexus_* → roams with the athlete's account
const HERO_KEY = "nexus_abyss_hero";

function loadBest(): BestRecord {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return {
        runs: Number(p.runs) || 0,
        victories: Number(p.victories) || 0,
        bestDepth: Number(p.bestDepth) || 0,
        bestKills: Number(p.bestKills) || 0,
        bestTimeMs: typeof p.bestTimeMs === "number" ? p.bestTimeMs : null,
        bossDefeats: Number(p.bossDefeats) || 0,
      };
    }
  } catch {
    /* ignore */
  }
  return { runs: 0, victories: 0, bestDepth: 0, bestKills: 0, bestTimeMs: null, bossDefeats: 0 };
}

function saveBest(result: GameResult): BestRecord {
  const prev = loadBest();
  const next: BestRecord = {
    runs: prev.runs + 1,
    victories: prev.victories + (result.victory ? 1 : 0),
    bestDepth: Math.max(prev.bestDepth, result.depth),
    bestKills: Math.max(prev.bestKills, result.kills),
    bestTimeMs:
      result.victory && (prev.bestTimeMs === null || result.timeMs < prev.bestTimeMs)
        ? result.timeMs
        : prev.bestTimeMs,
    bossDefeats: prev.bossDefeats + (result.bossDefeated ? 1 : 0),
  };
  localStorage.setItem(BEST_KEY, JSON.stringify(next));
  return next;
}

function loadHeroIndex(): number {
  const n = parseInt(localStorage.getItem(HERO_KEY) || "0", 10);
  return Number.isFinite(n) ? ((n % HERO_DESIGNS.length) + HERO_DESIGNS.length) % HERO_DESIGNS.length : 0;
}

function fmtTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Renders a hero design into a crisp canvas portrait (idle breathing pose). */
function HeroPortrait({ index, size, animated }: { index: number; size: number; animated?: boolean }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    const render = () => {
      ctx.clearRect(0, 0, size, size);
      drawHero(
        ctx,
        HERO_DESIGNS[index],
        {
          x: size / 2, y: size * 0.86, faceLeft: false, moving: false,
          walkPhase: 0, attack: 0, cast: 0, guard: false, hurt: 0,
          t: performance.now() / 1000,
        },
        size / 46,
      );
      if (animated) raf = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(raf);
  }, [index, size, animated]);
  return <canvas ref={ref} width={size} height={size} style={{ width: size, height: size }} />;
}

type Phase = "intro" | "playing" | "result";

export default function AbyssGame({ onClose, week, dayIndex, dayId, dayName }: AbyssGameProps) {
  const character: GameCharacter = useMemo(
    () => buildCharacter(computeAthleteStats(), collectLoggedMovements()),
    [],
  );
  const run = useMemo(
    () => buildRunContext({ week, dayIndex, dayId, dayName }),
    [week, dayIndex, dayId, dayName],
  );
  const bossWindow = useMemo(() => getBossWindow(week, dayIndex), [week, dayIndex]);

  const [phase, setPhase] = useState<Phase>("intro");
  const [heroIndex, setHeroIndex] = useState<number>(loadHeroIndex);
  const [hud, setHud] = useState<HudState | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [best, setBest] = useState<BestRecord>(loadBest);
  const runNonce = useRef(Math.floor(Math.random() * 1e9));

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<AbyssEngine | null>(null);
  const lastHudPush = useRef(0);
  const joyOrigin = useRef<{ x: number; y: number; id: number } | null>(null);
  const [joy, setJoy] = useState<{ bx: number; by: number; tx: number; ty: number } | null>(null);

  const pickHero = (idx: number) => {
    const n = ((idx % HERO_DESIGNS.length) + HERO_DESIGNS.length) % HERO_DESIGNS.length;
    setHeroIndex(n);
    localStorage.setItem(HERO_KEY, String(n));
  };

  // lock background scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // engine lifecycle
  useEffect(() => {
    if (phase !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    const engine = new AbyssEngine(canvas, {
      character,
      heroVariantIndex: heroIndex,
      run,
      runNonce: runNonce.current,
      onEnd: (res) => {
        setResult(res);
        setBest(saveBest(res));
        setPhase("result");
      },
      onHud: (h) => {
        const now = performance.now();
        if (now - lastHudPush.current > 100) {
          lastHudPush.current = now;
          setHud(h);
        }
      },
    });
    engineRef.current = engine;
    engine.start();

    const onResize = () => {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      engine.destroy();
      engineRef.current = null;
    };
  }, [phase, character, heroIndex, run]);

  const startRun = () => {
    runNonce.current = Math.floor(Math.random() * 1e9);
    setResult(null);
    setHud(null);
    setPhase("playing");
  };

  // ── touch joystick (left half), with a visible base + thumb ─────────────
  const JOY_R = 52; // px radius of the joystick travel
  const onJoyDown = (e: React.PointerEvent) => {
    joyOrigin.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setJoy({ bx: e.clientX, by: e.clientY, tx: e.clientX, ty: e.clientY });
  };
  const onJoyMove = (e: React.PointerEvent) => {
    const o = joyOrigin.current;
    if (!o || o.id !== e.pointerId) return;
    const rawDx = e.clientX - o.x;
    const rawDy = e.clientY - o.y;
    const dist = Math.hypot(rawDx, rawDy);
    const cap = dist > JOY_R ? JOY_R / dist : 1;
    setJoy({ bx: o.x, by: o.y, tx: o.x + rawDx * cap, ty: o.y + rawDy * cap });
    const nx = (rawDx / JOY_R);
    const ny = (rawDy / JOY_R);
    const nlen = Math.hypot(nx, ny);
    const ncap = nlen > 1 ? 1 / nlen : 1;
    engineRef.current?.setMoveVector(nx * ncap, ny * ncap);
  };
  const onJoyUp = (e: React.PointerEvent) => {
    if (joyOrigin.current?.id !== e.pointerId) return;
    joyOrigin.current = null;
    setJoy(null);
    engineRef.current?.setMoveVector(0, 0);
  };

  const variant = HERO_DESIGNS[heroIndex];

  // ════════════════════════════════════════════════════════════════════════
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-[#050507] flex flex-col select-none"
      style={{ touchAction: "none" }}
    >
      {/* ── INTRO + HERO SELECT ────────────────────────────────────────── */}
      {phase === "intro" && (
        <div className="flex-grow overflow-y-auto flex items-center justify-center p-5">
          <div className="max-w-lg w-full space-y-4">
            <div className="relative py-5 overflow-hidden">
              <div
                className="absolute inset-0 opacity-20"
                style={{ background: "repeating-linear-gradient(115deg, #dc2626 0 14px, transparent 14px 38px)" }}
              />
              <h1 className="relative text-4xl sm:text-5xl font-brutalist text-white tracking-wider leading-none italic">
                EL ABISMO
              </h1>
              <p className="relative text-[11px] font-mono text-red-500 uppercase tracking-[0.3em] mt-2 font-bold">
                NEXUS // DESCENSO A LA GRIETA
              </p>
            </div>

            {/* boss-day banner */}
            {bossWindow.isBossDay ? (
              <div className="border-2 border-red-600 bg-red-950/40 p-3 text-center">
                <div className="text-[11px] font-brutalist text-red-300 tracking-wider">
                  ☠ {bossWindow.label}
                </div>
                <div className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider mt-1">
                  En el fondo de la grieta espera el jefe del capítulo.
                </div>
              </div>
            ) : (
              <div className="border border-white/10 bg-black/50 p-2.5 text-center text-[9px] font-mono text-neutral-500 uppercase tracking-wider">
                Crawl procedural · el jefe solo aparece el día de pico (S3) y la apertura de descarga (S4)
              </div>
            )}

            {/* ── HERO SELECT ─────────────────────────────────────────── */}
            <div className="border border-white/15 bg-black/70 p-4">
              <div className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-3">
                ELEGÍ TU ECO ({heroIndex + 1}/{HERO_DESIGNS.length})
              </div>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => pickHero(heroIndex - 1)}
                  className="text-neutral-500 hover:text-white p-2 cursor-pointer active:scale-90"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="border-2 p-1 bg-[#0b0b12]"
                    style={{ borderColor: variant.colors.accent }}
                  >
                    <HeroPortrait index={heroIndex} size={104} animated />
                  </div>
                  <span
                    className="text-sm font-brutalist tracking-wider mt-1"
                    style={{ color: variant.colors.accent }}
                  >
                    {variant.name}
                  </span>
                  <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider">
                    {variant.build} · {variant.weapon}
                  </span>
                </div>
                <button
                  onClick={() => pickHero(heroIndex + 1)}
                  className="text-neutral-500 hover:text-white p-2 cursor-pointer active:scale-90"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
              {/* quick picker row */}
              <div className="grid grid-cols-10 gap-1 mt-3">
                {HERO_DESIGNS.map((v, i) => (
                  <button
                    key={v.id}
                    onClick={() => pickHero(i)}
                    className={`aspect-square border flex items-center justify-center bg-[#0b0b12] cursor-pointer transition-all ${
                      i === heroIndex ? "border-2" : "border-white/10 opacity-60 hover:opacity-100"
                    }`}
                    style={i === heroIndex ? { borderColor: v.colors.accent } : undefined}
                    title={v.name}
                  >
                    <HeroPortrait index={i} size={28} />
                  </button>
                ))}
              </div>
              <p className="text-[9px] font-mono text-neutral-600 uppercase tracking-wider mt-2 text-center">
                El sprite es estético — tus stats salen siempre de tu entrenamiento real
              </p>
            </div>

            {/* The Eco — real stats */}
            <div className="border border-white/15 bg-black/70 p-4 space-y-3">
              <div className="flex justify-between items-baseline border-b border-white/10 pb-2">
                <span className="text-sm font-brutalist text-white tracking-wider">{character.identity}</span>
                <span className="text-[10px] font-mono text-red-400 font-bold tracking-wider">
                  {character.rank} · NIVEL {character.level}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-center">
                {[
                  { l: "VIT", v: character.vitality },
                  { l: "PODER", v: character.power },
                  { l: "AGUANTE", v: character.stamina },
                  { l: "CRIT", v: `${Math.round(character.critChance * 100)}%` },
                  { l: "VEL", v: character.moveSpeed },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="text-[9px] font-mono text-neutral-500 uppercase">{s.l}</div>
                    <div className="text-sm font-brutalist text-white">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Loadout */}
            <div className="border border-white/15 bg-black/70 p-4 space-y-2">
              <div className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                PODERES ({character.loadout.length}/4) — desbloqueados por tu bitácora real
              </div>
              {character.loadout.length === 0 ? (
                <p className="text-[11px] font-mono text-neutral-500 leading-relaxed">
                  Tu Eco baja solo con los puños. Registrá movimientos (deadlift, squat,
                  snatch, burpees…) para desbloquear poderes.
                </p>
              ) : (
                character.loadout.map((s, i) => (
                  <div key={s.id} className="flex items-start gap-2.5">
                    <span className="text-base w-6 text-center shrink-0">{s.glyph}</span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-brutalist text-white tracking-wider">
                        [{i + 1}] {s.name}
                        {s.sourcePrKg > 0 && (
                          <span className="text-red-400 font-mono text-[10px] ml-2">PR {s.sourcePrKg}kg</span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-neutral-500 italic leading-snug">
                        {s.flavor} <span className="text-neutral-600">— {s.sourceMovement}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {best.runs > 0 && (
              <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider text-center">
                Récord: piso {best.bestDepth} · {best.bestKills} bajas · {best.victories}/{best.runs} selladas
                {best.bossDefeats > 0 && ` · ${best.bossDefeats} jefes caídos`}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={startRun}
                className="flex-grow bg-red-700 hover:bg-red-600 text-white font-brutalist py-3.5 text-lg tracking-[0.2em] transition-all active:scale-95 cursor-pointer"
              >
                DESCENDER
              </button>
              <button
                onClick={onClose}
                className="px-5 bg-neutral-900 border border-white/15 text-neutral-400 hover:text-white font-mono text-[11px] uppercase tracking-wider transition-all cursor-pointer"
              >
                VOLVER
              </button>
            </div>
            <p className="text-[9px] font-mono text-neutral-600 uppercase tracking-wider text-center">
              WASD/flechas mover · click/J golpear · 1-4 poderes · escaleras = bajar · táctil: joystick + botones
            </p>
          </div>
        </div>
      )}

      {/* ── PLAYING ────────────────────────────────────────────────────── */}
      {phase === "playing" && (
        <div className="relative flex-grow overflow-hidden">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          <div className="absolute top-0 left-0 right-0 p-3 flex items-start justify-between gap-3 pointer-events-none">
            <div className="space-y-1.5 w-52 max-w-[45vw]">
              <div className="h-3.5 bg-black/80 border border-white/20 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-200"
                  style={{ width: `${hud ? (hud.hp / hud.maxHp) * 100 : 100}%` }}
                />
              </div>
              <div className="h-2 bg-black/80 border border-white/20 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-violet-700 to-violet-400 transition-all duration-200"
                  style={{ width: `${hud ? (hud.will / hud.maxWill) * 100 : 100}%` }}
                />
              </div>
              <div className="text-[9px] font-mono text-neutral-400">{hud ? `${hud.hp}/${hud.maxHp}` : ""}</div>
            </div>

            <div className="text-center">
              <div className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-[0.25em]">
                PISO {hud?.depth ?? 1}/{hud?.totalFloors ?? 3}
              </div>
              <div className="text-[9px] font-mono text-neutral-500">
                {hud?.enemiesLeft ?? 0} sombras · {hud?.kills ?? 0} bajas
              </div>
              <div className="text-[9px] font-mono text-amber-400/90 uppercase tracking-wider mt-0.5">
                {hud?.objective ?? ""}
              </div>
            </div>

            <button
              onClick={onClose}
              className="pointer-events-auto bg-black/70 border border-white/20 text-neutral-400 hover:text-white p-2 cursor-pointer"
              title="Abandonar la grieta"
            >
              <X size={16} />
            </button>
          </div>

          {hud?.onExit && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none">
              <div className="bg-emerald-950/80 border border-emerald-500/50 px-3 py-1 text-[10px] font-mono text-emerald-300 uppercase tracking-wider animate-pulse">
                ▼ portal activo
              </div>
            </div>
          )}

          {/* joystick zone (left half) */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1/2 touch-none"
            onPointerDown={onJoyDown}
            onPointerMove={onJoyMove}
            onPointerUp={onJoyUp}
            onPointerCancel={onJoyUp}
          >
            {/* idle hint joystick (shown until first touch) */}
            {!joy && (
              <div className="absolute bottom-8 left-8 w-[104px] h-[104px] rounded-full border-2 border-white/15 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-full border-2 border-white/25 bg-white/5" />
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-neutral-500 uppercase tracking-widest whitespace-nowrap">
                  mover
                </span>
              </div>
            )}
          </div>

          {/* visible joystick that follows the touch */}
          {joy && (
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute rounded-full border-2 border-white/25 bg-black/30"
                style={{ left: joy.bx - 56, top: joy.by - 56, width: 112, height: 112 }}
              />
              <div
                className="absolute rounded-full border-2 border-red-400/80 bg-red-500/30 shadow-[0_0_14px_rgba(239,68,68,0.5)]"
                style={{ left: joy.tx - 27, top: joy.ty - 27, width: 54, height: 54 }}
              />
            </div>
          )}

          {/* action buttons */}
          <div className="absolute bottom-5 right-4 flex items-end gap-2.5">
            <div className="flex flex-col gap-2">
              {character.loadout.map((s, i) => {
                const ready = hud ? hud.skillReadiness[i] >= 1 : true;
                const dead = s.archetype === "heal" && hud?.healUsed;
                return (
                  <button
                    key={s.id}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      engineRef.current?.pressSkill(i);
                    }}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg transition-all ${
                      dead
                        ? "border-white/10 bg-black/60 opacity-30"
                        : ready
                          ? "border-violet-400 bg-violet-950/70 active:scale-90"
                          : "border-white/15 bg-black/70 opacity-50"
                    }`}
                    style={
                      !ready && hud
                        ? { background: `conic-gradient(rgba(139,92,246,0.45) ${hud.skillReadiness[i] * 360}deg, rgba(0,0,0,0.7) 0deg)` }
                        : undefined
                    }
                    title={s.name}
                  >
                    {s.glyph}
                  </button>
                );
              })}
            </div>
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                engineRef.current?.pressAttack();
              }}
              className="w-[72px] h-[72px] rounded-full border-2 border-red-500 bg-red-950/70 flex items-center justify-center active:scale-90 transition-all"
              title="Golpear"
            >
              <Swords size={28} className="text-red-300" />
            </button>
          </div>
        </div>
      )}

      {/* ── RESULT ─────────────────────────────────────────────────────── */}
      {phase === "result" && result && (
        <div className="flex-grow flex items-center justify-center p-5">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full space-y-5 text-center"
          >
            <div className="relative py-7 overflow-hidden">
              <div
                className="absolute inset-0 opacity-25"
                style={{ background: `repeating-linear-gradient(115deg, ${result.victory ? "#10b981" : "#dc2626"} 0 14px, transparent 14px 38px)` }}
              />
              {result.victory ? (
                <h2 className="relative text-3xl sm:text-4xl font-brutalist text-emerald-400 tracking-wider italic">
                  {result.bossDefeated ? "EL SEDENTARIO CAYÓ" : "GRIETA SELLADA"}
                </h2>
              ) : (
                <h2 className="relative text-3xl sm:text-4xl font-brutalist text-red-500 tracking-wider italic flex items-center justify-center gap-3">
                  <Skull size={30} /> LA SOMBRA TE CONSUMIÓ
                </h2>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { l: "PISO", v: `${result.depth}/${run.totalFloors}` },
                { l: "BAJAS", v: result.kills },
                { l: "TIEMPO", v: fmtTime(result.timeMs) },
              ].map((s) => (
                <div key={s.l} className="bg-black/70 border border-white/15 p-3">
                  <div className="text-[9px] font-mono text-neutral-500 uppercase">{s.l}</div>
                  <div className="text-xl font-brutalist text-white">{s.v}</div>
                </div>
              ))}
            </div>

            <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
              Récord: piso {best.bestDepth} · {best.bestKills} bajas · {best.victories}/{best.runs} selladas
              {best.bossDefeats > 0 && ` · ${best.bossDefeats} jefes caídos`}
            </div>

            <p className="text-[11px] font-mono text-neutral-400 leading-relaxed">
              {result.bossDefeated
                ? "Sellaste el capítulo. El jefe no vuelve hasta la próxima ventana."
                : result.victory
                  ? "El Eco vuelve más liviano. Lo que entrenes mañana, lo vas a sentir acá."
                  : "El Abismo no perdona lo que no se entrena. Volvé al box — y volvé a bajar."}
            </p>

            <div className="flex gap-3">
              <button
                onClick={startRun}
                className="flex-grow bg-red-700 hover:bg-red-600 text-white font-brutalist py-3 text-base tracking-[0.2em] transition-all active:scale-95 cursor-pointer"
              >
                DESCENDER OTRA VEZ
              </button>
              <button
                onClick={onClose}
                className="px-5 bg-neutral-900 border border-white/15 text-neutral-400 hover:text-white font-mono text-[11px] uppercase tracking-wider transition-all cursor-pointer"
              >
                SALIR
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
