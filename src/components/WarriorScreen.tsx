import React, { useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import AbyssGame from "../game/AbyssGame";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { Swords, Shield, Flame, Zap, Trophy, Star, Crown, Dumbbell } from "lucide-react";
import { computeAthleteStats, AthleteStatsDoc } from "../lib/athleteStats";
import { MASTER_ACHIEVEMENTS } from "../lib/constants";

interface WarriorScreenProps {
  athlete: { identity: string; level: string };
  currentXp: number;
  xpPercentage: number;
  unlockedAchievements: string[];
  activeColorSet: { color: string; shadow: string };
  /** program context for the dungeon: enemy naming + boss-day window */
  currentWeek: string;
  currentDayIndex: number;
  activeDayId: string;
  activeDayName: string;
}

const RANK_THRESHOLDS = [
  { xp: 0, rank: "Recluta", tier: "I", color: "#6B7280" },
  { xp: 1000, rank: "Guerrero", tier: "II", color: "#3B82F6" },
  { xp: 1500, rank: "Centurión", tier: "III", color: "#8B5CF6" },
  { xp: 2500, rank: "Gladiador", tier: "IV", color: "#F59E0B" },
  { xp: 4000, rank: "Campeón", tier: "V", color: "#EF4444" },
  { xp: 6000, rank: "Leyenda", tier: "VI", color: "#10B981" },
  { xp: 10000, rank: "Titán", tier: "VII", color: "#EC4899" },
];

function getRank(xp: number) {
  let current = RANK_THRESHOLDS[0];
  for (const t of RANK_THRESHOLDS) {
    if (xp >= t.xp) current = t;
    else break;
  }
  const idx = RANK_THRESHOLDS.indexOf(current);
  const next = RANK_THRESHOLDS[idx + 1];
  const progressToNext = next
    ? ((xp - current.xp) / (next.xp - current.xp)) * 100
    : 100;
  return { ...current, next, progressToNext };
}

function deriveAttributes(stats: AthleteStatsDoc) {
  const maxPrWeight = Object.values(stats.prs).reduce(
    (max, pr) => Math.max(max, pr.weightKg),
    0
  );
  const fuerza = Math.min(100, Math.round((maxPrWeight / 200) * 100));
  const resistencia = Math.min(
    100,
    Math.round((stats.daysCompleted / 28) * 100)
  );
  const consistencia = Math.min(
    100,
    Math.round((stats.perfectWeeks / 4) * 100)
  );
  const volumen = Math.min(
    100,
    Math.round((stats.totalVolumeKg / 50000) * 100)
  );
  const tecnica =
    stats.avgRpe !== null
      ? Math.min(100, Math.round(((10 - Math.abs(stats.avgRpe - 7.5)) / 3) * 100))
      : 30;
  const determinacion = Math.min(
    100,
    Math.round(
      ((stats.achievements.length + stats.questsCompleted) / 12) * 100
    )
  );
  return [
    { attr: "Fuerza", value: fuerza, icon: "💪", fullMark: 100 },
    { attr: "Resistencia", value: resistencia, icon: "🫀", fullMark: 100 },
    { attr: "Consistencia", value: consistencia, icon: "🔗", fullMark: 100 },
    { attr: "Volumen", value: volumen, icon: "🏋️", fullMark: 100 },
    { attr: "Técnica", value: tecnica, icon: "🎯", fullMark: 100 },
    { attr: "Determinación", value: determinacion, icon: "🔥", fullMark: 100 },
  ];
}

function formatWeight(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
  return `${Math.round(kg)}kg`;
}

export default function WarriorScreen({
  athlete,
  currentXp,
  xpPercentage,
  unlockedAchievements,
  activeColorSet,
  currentWeek,
  currentDayIndex,
  activeDayId,
  activeDayName,
}: WarriorScreenProps) {
  const [showAbyss, setShowAbyss] = useState(false);
  const stats = useMemo(() => computeAthleteStats(), []);
  const rank = useMemo(() => getRank(currentXp), [currentXp]);
  const attributes = useMemo(() => deriveAttributes(stats), [stats]);
  const powerLevel = useMemo(
    () => Math.round(attributes.reduce((s, a) => s + a.value, 0) / attributes.length),
    [attributes]
  );

  const topPRs = useMemo(() => {
    return Object.entries(stats.prs)
      .sort((a, b) => b[1].weightKg - a[1].weightKg)
      .slice(0, 6)
      .map(([name, pr]) => ({
        name: name.replace(/_/g, " "),
        ...pr,
      }));
  }, [stats]);

  const weeklyVolume = useMemo(() => {
    return Object.entries(stats.weeklyVolumeKg)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([week, vol]) => ({
        week: week.toUpperCase().replace("W", "S"),
        volume: Math.round(vol),
      }));
  }, [stats]);

  const achievementData = useMemo(() => {
    return MASTER_ACHIEVEMENTS.map((a) => ({
      ...a,
      unlocked: unlockedAchievements.includes(a.id),
    }));
  }, [unlockedAchievements]);

  return (
    <div className="space-y-5 pb-12">
      {/* ═══ RANK CARD ═══ */}
      <section className="relative overflow-hidden border-2 border-white/10 bg-gradient-to-br from-[#0D0D14] via-[#111118] to-[#0A0A10] p-5">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `radial-gradient(ellipse at 30% 20%, ${rank.color}44 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, ${activeColorSet.color}33 0%, transparent 50%)`,
          }}
        />
        <div className="relative flex items-start gap-4">
          {/* Avatar placeholder */}
          <div
            className="w-20 h-20 shrink-0 border-2 flex items-center justify-center text-4xl"
            style={{
              borderColor: rank.color,
              boxShadow: `0 0 20px ${rank.color}33`,
              background: `linear-gradient(135deg, ${rank.color}15 0%, transparent 100%)`,
            }}
          >
            <Swords size={36} style={{ color: rank.color }} />
          </div>

          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-[10px] font-brutalist tracking-[0.2em] px-2 py-0.5 uppercase"
                style={{
                  backgroundColor: `${rank.color}20`,
                  color: rank.color,
                  border: `1px solid ${rank.color}40`,
                }}
              >
                {rank.rank} {rank.tier}
              </span>
              <span className="text-[10px] font-mono text-neutral-500">
                PWR {powerLevel}
              </span>
            </div>
            <h2 className="text-lg font-brutalist tracking-wider text-white truncate">
              {athlete.identity}
            </h2>
            <p className="text-[11px] font-condensed text-neutral-400 truncate">
              {athlete.level}
            </p>

            {/* XP to next rank */}
            <div className="mt-2">
              <div className="flex justify-between text-[9px] font-mono text-neutral-500 mb-0.5">
                <span>{currentXp} XP</span>
                <span>
                  {rank.next
                    ? `${rank.next.rank} ${rank.next.tier} — ${rank.next.xp} XP`
                    : "RANGO MÁXIMO"}
                </span>
              </div>
              <div className="h-2 bg-neutral-900 border border-white/5 overflow-hidden">
                <div
                  className="h-full transition-all duration-700"
                  style={{
                    width: `${rank.progressToNext}%`,
                    background: `linear-gradient(90deg, ${rank.color}, ${rank.next?.color || rank.color})`,
                    boxShadow: `0 0 8px ${rank.color}66`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="relative grid grid-cols-4 gap-2 mt-4">
          {[
            {
              label: "Días",
              value: stats.daysCompleted,
              icon: <Shield size={14} />,
              color: "#3B82F6",
            },
            {
              label: "Volumen",
              value: formatWeight(stats.totalVolumeKg),
              icon: <Dumbbell size={14} />,
              color: "#8B5CF6",
            },
            {
              label: "Semanas ★",
              value: stats.perfectWeeks,
              icon: <Crown size={14} />,
              color: "#F59E0B",
            },
            {
              label: "Series",
              value: stats.totalSets,
              icon: <Flame size={14} />,
              color: "#EF4444",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/[0.03] border border-white/5 p-2 text-center"
            >
              <div
                className="flex justify-center mb-1 opacity-70"
                style={{ color: s.color }}
              >
                {s.icon}
              </div>
              <div className="text-sm font-brutalist text-white">{s.value}</div>
              <div className="text-[8px] font-condensed text-neutral-500 uppercase tracking-wider">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ═══ ENTER THE ABYSS ═══ */}
        <button
          onClick={() => setShowAbyss(true)}
          className="relative w-full mt-4 py-3.5 border-2 border-red-700/60 bg-gradient-to-r from-red-950/60 via-black to-red-950/60 hover:border-red-500 transition-all active:scale-[0.99] cursor-pointer overflow-hidden group"
        >
          <div
            className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
            style={{
              background:
                "repeating-linear-gradient(115deg, #dc2626 0 10px, transparent 10px 30px)",
            }}
          />
          <span className="relative font-brutalist text-red-400 group-hover:text-red-300 tracking-[0.25em] text-base italic">
            ⚔ DESCENDER AL ABISMO
          </span>
          <span className="relative block text-[9px] font-mono text-neutral-500 uppercase tracking-wider mt-0.5">
            ARPG — tu Eco pelea con tus stats y PRs reales
          </span>
        </button>
      </section>

      {/* ═══ ATTRIBUTES RADAR ═══ */}
      <section className="border-2 border-white/10 bg-[#0D0D14] p-4">
        <h3 className="text-xs font-brutalist tracking-[0.15em] text-neutral-400 mb-3 flex items-center gap-2">
          <Zap size={14} className="text-amber-400" />
          ATRIBUTOS DEL GUERRERO
        </h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={attributes} outerRadius="75%">
              <PolarGrid
                stroke="#ffffff08"
                gridType="polygon"
              />
              <PolarAngleAxis
                dataKey="attr"
                tick={{
                  fill: "#9CA3AF",
                  fontSize: 10,
                  fontFamily: "monospace",
                }}
              />
              <Radar
                name="Atributos"
                dataKey="value"
                stroke={rank.color}
                fill={rank.color}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        {/* Attribute list */}
        <div className="grid grid-cols-3 gap-1.5 mt-2">
          {attributes.map((a) => (
            <div key={a.attr} className="flex items-center gap-1.5 px-1.5 py-1 bg-white/[0.02] border border-white/5">
              <span className="text-sm">{a.icon}</span>
              <div className="flex-grow min-w-0">
                <div className="text-[9px] font-condensed text-neutral-500 uppercase">
                  {a.attr}
                </div>
                <div className="h-1 bg-neutral-800 mt-0.5">
                  <div
                    className="h-full"
                    style={{
                      width: `${a.value}%`,
                      background: rank.color,
                      opacity: 0.7,
                    }}
                  />
                </div>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">
                {a.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ TOP PRs — "HABILIDADES" ═══ */}
      {topPRs.length > 0 && (
        <section className="border-2 border-white/10 bg-[#0D0D14] p-4">
          <h3 className="text-xs font-brutalist tracking-[0.15em] text-neutral-400 mb-3 flex items-center gap-2">
            <Trophy size={14} className="text-amber-400" />
            HABILIDADES MÁXIMAS (PRs)
          </h3>
          <div className="space-y-1.5">
            {topPRs.map((pr, i) => (
              <div
                key={pr.name}
                className="flex items-center gap-3 px-3 py-2 bg-white/[0.02] border border-white/5"
              >
                <span
                  className="text-xs font-brutalist w-5 text-center"
                  style={{
                    color: i === 0 ? "#F59E0B" : i === 1 ? "#9CA3AF" : i === 2 ? "#CD7F32" : "#6B7280",
                  }}
                >
                  #{i + 1}
                </span>
                <div className="flex-grow min-w-0">
                  <div className="text-xs font-condensed text-white truncate capitalize">
                    {pr.name.toLowerCase()}
                  </div>
                  <div className="text-[9px] font-mono text-neutral-500">
                    {pr.reps && pr.reps !== "0" ? `${pr.reps} reps` : "1RM"} · {pr.dayId.replace(/^w(\d+)d(\d+)$/i, "S$1 D$2")}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className="text-sm font-brutalist"
                    style={{
                      color: i === 0 ? "#F59E0B" : "#E5E7EB",
                    }}
                  >
                    {pr.weightKg}kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══ WEEKLY VOLUME — "PODER SEMANAL" ═══ */}
      {weeklyVolume.length > 0 && (
        <section className="border-2 border-white/10 bg-[#0D0D14] p-4">
          <h3 className="text-xs font-brutalist tracking-[0.15em] text-neutral-400 mb-3 flex items-center gap-2">
            <Flame size={14} className="text-orange-400" />
            PODER SEMANAL (VOLUMEN KG)
          </h3>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyVolume}
                margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
              >
                <XAxis
                  dataKey="week"
                  tick={{ fill: "#6B7280", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6B7280", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatWeight(v)}
                />
                <Tooltip
                  contentStyle={{
                    background: "#111",
                    border: "1px solid #333",
                    fontSize: 11,
                    fontFamily: "monospace",
                  }}
                  formatter={(v: number) => [`${v.toLocaleString()} kg`, "Volumen"]}
                />
                <Bar dataKey="volume" radius={[2, 2, 0, 0]}>
                  {weeklyVolume.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={rank.color}
                      fillOpacity={0.4 + (idx / weeklyVolume.length) * 0.5}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* ═══ ACHIEVEMENTS — "INSIGNIAS" ═══ */}
      <section className="border-2 border-white/10 bg-[#0D0D14] p-4">
        <h3 className="text-xs font-brutalist tracking-[0.15em] text-neutral-400 mb-3 flex items-center gap-2">
          <Star size={14} className="text-yellow-400" />
          INSIGNIAS ({unlockedAchievements.length}/{achievementData.length})
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {achievementData.map((a) => (
            <div
              key={a.id}
              className={`relative border p-3 text-center transition-all ${
                a.unlocked
                  ? "border-white/15 bg-white/[0.03]"
                  : "border-white/5 bg-white/[0.01] opacity-30 grayscale"
              }`}
            >
              <div className="text-2xl mb-1">{a.icon}</div>
              <div
                className="text-[9px] font-brutalist tracking-wider truncate"
                style={{ color: a.unlocked ? a.color : "#6B7280" }}
              >
                {a.title.replace(/\s*[^\w\s]*$/g, "")}
              </div>
              <div className="text-[8px] font-mono text-neutral-600 mt-0.5 uppercase">
                {a.rarity}
              </div>
              {a.unlocked && (
                <div
                  className="absolute top-1 right-1 w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: a.color,
                    boxShadow: `0 0 6px ${a.color}`,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ STATS FOOTER ═══ */}
      <div className="text-center text-[9px] font-mono text-neutral-600 pb-4">
        {stats.movementsLogged} movimientos · {stats.totalSets} series ·{" "}
        {stats.avgRpe !== null ? `RPE ${stats.avgRpe}` : "sin RPE"} ·{" "}
        {Object.keys(stats.prs).length} PRs registrados
      </div>

      {/* ═══ THE ABYSS (fullscreen ARPG overlay) ═══ */}
      <AnimatePresence>
        {showAbyss && (
          <AbyssGame
            key="abyss-game"
            onClose={() => setShowAbyss(false)}
            week={currentWeek}
            dayIndex={currentDayIndex}
            dayId={activeDayId}
            dayName={activeDayName}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
