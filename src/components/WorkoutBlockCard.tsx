import DOMPurify from 'isomorphic-dompurify';
import React from "react";
import { DayWorkout, DayVariation, ProgramBlock } from "../types/workout";
import WorkoutTimer from "./WorkoutTimer";
import BrandInspirationAccordion from "./BrandInspirationAccordion";
import WorkoutHistoryControl from "./WorkoutHistoryControl";
import { getCleanExerciseName, isCueOrNote } from "../lib/historyUtils";
import { resolveBlockItems } from "../lib/blockGrouping";
import { parseDayId } from "../lib/storageKeys";
import { resolveWmRange, wmRangeLabel } from "../lib/workingMax";
import { ENERGY_META, TIMEDOMAIN_META } from "../lib/blockMeta";
import { cleanBlockTitle } from "../lib/titleClean";

interface WorkoutBlockCardProps {
  blockType: "warmup" | "strength" | "metcon" | "accessories";
  /**
   * Explicit block to render (flexible multi-block programs). When omitted the
   * card falls back to `activeVariation[blockType]` (legacy four-block path).
   * `blockType` still drives theming (icon/bg) and warmup-vs-logger rendering,
   * so pass the block's bucket as `blockType` for flexible blocks.
   */
  block?: ProgramBlock;
  /** Unique suffix for timer/accordion/log keys (two blocks may share a bucket). */
  keySuffix?: string;
  activeVariation: DayVariation;
  activeDay: DayWorkout | null;
  isColumns?: boolean;
  enableThemedBackgrounds: boolean;
  backgroundImage: string;
  icon: React.ReactNode;
  globalRpeAvg: number;
  teamSize: number;
  currentVariationIndex: number;
  formatItemWithTeamVolume: (item: string, teamSize: number) => string;
  renderExplicitTimeCapBlock: (scheme: string, type: string, isColumns?: boolean) => React.ReactNode;
  handleVariationTouchStart?: (e: React.TouchEvent) => void;
  handleVariationTouchMove?: (e: React.TouchEvent) => void;
  handleVariationTouchEnd?: (e: React.TouchEvent) => void;
  isHistoryExpanded?: boolean;
  onToggleHistory?: () => void;
}

export default function WorkoutBlockCard({
  blockType,
  block,
  keySuffix,
  activeVariation,
  activeDay,
  isColumns = false,
  enableThemedBackgrounds,
  backgroundImage,
  icon,
  globalRpeAvg,
  teamSize,
  currentVariationIndex,
  formatItemWithTeamVolume,
  renderExplicitTimeCapBlock,
  handleVariationTouchStart,
  handleVariationTouchMove,
  handleVariationTouchEnd,
  isHistoryExpanded = false,
  onToggleHistory,
}: WorkoutBlockCardProps) {
  const blockData = block ?? activeVariation[blockType];
  const slot = keySuffix ?? blockType;
  const capitalizedBlockName = blockType === "accessories"
    ? "Accessories"
    : blockType.charAt(0).toUpperCase() + blockType.slice(1);

  return (
    <section
      className={`flex flex-col transition-all duration-300 rounded-none min-w-0 break-words h-full bg-zinc-950 shadow-[0_15px_45px_rgba(0,0,0,0.7)] relative overflow-hidden ${
        isColumns ? "gap-5 p-5 xl:p-6 xl:min-h-[680px]" : "gap-4 p-4 sm:p-5"
      }`}
      onTouchStart={handleVariationTouchStart}
      onTouchMove={handleVariationTouchMove}
      onTouchEnd={handleVariationTouchEnd}
    >
      {enableThemedBackgrounds && (
        <div className="absolute inset-x-0 top-0 h-[380px] pointer-events-none z-0">
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              backgroundImage: `url('${backgroundImage}')`,
              backgroundSize: "cover",
              backgroundPosition: "center 25%",
              opacity: 0.7,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/10 via-zinc-950/70 to-zinc-950" />
        </div>
      )}

      <header className="relative z-10 px-4 py-3 flex items-center justify-between gap-2 bg-electric-blue shadow-md shadow-electric-blue/40 min-h-[78px] border-l-[7px] border-amber-400">
        <h2
          className={`font-brutalist italic leading-[0.9] tracking-[-0.02em] text-pure-black break-words min-w-0 flex-1 ${
            isColumns
              ? "text-[28px] sm:text-[33px] lg:text-[40px] xl:text-[46px]"
              : "text-4xl sm:text-5xl lg:text-6xl"
          }`}
          style={{ overflowWrap: "anywhere" }}
        >
          {cleanBlockTitle(blockData.title)}
        </h2>
        <div className="shrink-0">{icon}</div>
      </header>

      {/* Derived metadata chips (flexible blocks only): time domain · energy system · cap */}
      {block && (block.timeDomain || block.energySystem || block.capSec != null) && (
        <div className="relative z-10 flex flex-wrap gap-1.5 px-1">
          {block.timeDomain && (
            <span
              className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] px-2 py-0.5 border border-white/25 text-neutral-200 cursor-help"
              title={TIMEDOMAIN_META[block.timeDomain].hint}
            >
              {TIMEDOMAIN_META[block.timeDomain].label}
            </span>
          )}
          {block.energySystem && (
            <span
              className="text-[10px] font-mono font-black uppercase tracking-[0.12em] px-2 py-0.5 text-pure-black cursor-help"
              style={{
                backgroundColor: ENERGY_META[block.energySystem].color,
                boxShadow: `0 0 10px ${ENERGY_META[block.energySystem].color}80`,
              }}
              title={ENERGY_META[block.energySystem].hint}
            >
              {ENERGY_META[block.energySystem].label}
            </span>
          )}
          {block.capSec != null && (
            <span
              className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] px-2 py-0.5 border border-amber-400/60 text-amber-300"
              title="Time Cap — escudo de fatiga (enciclopedia cap. 43)"
            >
              CAP {Math.round(block.capSec / 60)}′
            </span>
          )}
        </div>
      )}

      <div className="relative z-10 space-y-4 flex-grow flex flex-col justify-between">
        <div className="space-y-4 pt-1">
          {renderExplicitTimeCapBlock(
            blockData.scheme,
            blockType,
            isColumns,
          )}
          <BrandInspirationAccordion
            tabName={activeVariation.tabName}
            title={blockData.title}
            items={blockData.items}
            blockId={`${slot}_${activeDay?.id || "default"}`}
            inspiration={block?.inspiration}
          />
          <WorkoutTimer
            key={`${slot}-${activeDay?.id}-${currentVariationIndex}`}
            dayId={`${activeDay?.id || "default"}-var${currentVariationIndex}-${slot}`}
            title={blockData.title}
            scheme={blockData.scheme}
            items={blockData.items}
            blockName={capitalizedBlockName}
            highRpeDetected={globalRpeAvg >= 9}
          />

          <ul
            className={`font-condensed font-bold tracking-wide ${
              isColumns
                ? "text-[19px] xl:text-[21px] space-y-3.5"
                : "text-[24px] space-y-4"
            }`}
          >
            {resolveBlockItems(blockData.items).map((entry, idx) => {
              const item = blockData.items[idx];
              const formattedItem = formatItemWithTeamVolume(item, teamSize);

              // Coaching cue / note — render as guidance regardless of block type
              // (warmup blocks also contain [NOTA]: items that must not log).
              if (isCueOrNote(formattedItem)) {
                return (
                  <li
                    key={idx}
                    className="list-none normal-case min-w-0 break-words pb-1 last:pb-0"
                  >
                    <div
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formattedItem) }}
                      className="text-[15px] sm:text-base font-condensed font-semibold italic text-amber-300 border-l-[3px] border-amber-400 pl-3 py-0.5"
                    />
                  </li>
                );
              }

              // Lift header ("Heavy Deadlift - Levantamiento Principal") — a title
              // for the "-> " tiers below it, never an evaluable station itself.
              if (entry.role === "header") {
                return (
                  <li
                    key={idx}
                    className="list-none normal-case min-w-0 break-words pt-1 pb-0.5 first:pt-0"
                  >
                    <div
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formattedItem) }}
                      className="text-sm sm:text-base font-bold uppercase tracking-wide text-white"
                    />
                  </li>
                );
              }

              // "-> " set tier — prescription detail of the header above it.
              // Shown as guidance; logged once against the lift in INCURSIÓN.
              if (entry.role === "subline") {
                return (
                  <li
                    key={idx}
                    className="list-none normal-case min-w-0 break-words pb-1 last:pb-0 pl-2"
                  >
                    <div
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formattedItem) }}
                      className="text-[13px] sm:text-sm font-condensed text-neutral-300 border-l-2 border-[#3F3F46] pl-3 py-0.5"
                    />
                  </li>
                );
              }

              if (blockType === "warmup") {
                return (
                  <li
                    key={idx}
                    className="relative pl-6 normal-case text-white min-w-0 break-words py-1.5 text-left w-full"
                  >
                    <span
                      aria-hidden="true" className="absolute left-0 top-1.5 h-[1.45em] w-4 flex items-center justify-center select-none font-sans text-[15px] text-neon-pink"
                    >
                      ✦
                    </span>
                    <div
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formattedItem) }}
                      className="flex-1 min-w-0"
                    />
                  </li>
                );
              }

              // Plain plan item (the board is a read-only plan; logging happens
              // in INCURSIÓN). Working Max: if this block's scheme is `% WM` and
              // the athlete has a 1RM for this lift, append the derived load chip.
              const cleanEx = getCleanExerciseName(formattedItem);
              const wm = resolveWmRange(blockData.scheme, cleanEx);
              const itemHtml = wm
                ? `${formattedItem} <span class='cue wm-chip'>${wmRangeLabel(wm)}</span>`
                : formattedItem;

              return (
                <li
                  key={idx}
                  className="relative pl-6 normal-case text-white min-w-0 break-words py-1.5 text-left w-full"
                >
                  <span aria-hidden="true" className="absolute left-0 top-1.5 h-[1.45em] w-4 flex items-center justify-center select-none font-sans text-[15px] text-neon-pink">
                    ✦
                  </span>
                  <div
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(itemHtml) }}
                    className="flex-1 min-w-0"
                  />
                </li>
              );
            })}
          </ul>
        </div>

        {/* COLLAPSIBLE QUICK HISTORY BLOCK FOR NON-WARMUP BLOCKS */}
        {blockType !== "warmup" && onToggleHistory && (
          <WorkoutHistoryControl
            items={blockData.items}
            isHistoryExpanded={isHistoryExpanded}
            onToggleHistory={onToggleHistory}
            currentWeek={(() => { const p = activeDay?.id ? parseDayId(activeDay.id) : null; return p ? `w${p.week}` : "w2"; })()}
          />
        )}
      </div>
    </section>
  );
}
