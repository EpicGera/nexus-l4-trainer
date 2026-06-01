import DOMPurify from "isomorphic-dompurify";
import React from "react";
import { DayWorkout, DayVariation } from "../types/workout";
import WorkoutTimer from "./WorkoutTimer";
import BrandInspirationAccordion from "./BrandInspirationAccordion";
import ExerciseLogger from "./ExerciseLogger";
import WorkoutHistoryControl from "./WorkoutHistoryControl";
import { getCleanExerciseName } from "../lib/historyUtils";
import DOMPurify from 'dompurify';

interface WorkoutBlockCardProps {
  blockType: "warmup" | "strength" | "metcon" | "accessories";
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
  const blockData = activeVariation[blockType];
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

      <header className="relative z-10 px-4 py-2 flex items-center justify-between bg-electric-blue shadow-md shadow-electric-blue/40 min-h-[76px] lg:h-[76px]">
        <h2 className="text-[20px] lg:text-2xl font-brutalist italic leading-tight text-pure-black">
          {blockData.title}
        </h2>
        <div className="shrink-0 ml-2">{icon}</div>
      </header>

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
            blockId={`${blockType}_${activeDay?.id || "default"}`}
          />
          <WorkoutTimer
            key={`${blockType}-${activeDay?.id}-${currentVariationIndex}`}
            dayId={`${activeDay?.id || "default"}-var${currentVariationIndex}-${blockType}`}
            title={blockData.title}
            scheme={blockData.scheme}
            items={blockData.items}
            blockName={capitalizedBlockName}
            highRpeDetected={globalRpeAvg >= 9}
          />

          <ul
            className={`font-condensed font-bold tracking-wide ${
              isColumns
                ? "text-base xl:text-[17.5px] space-y-3.5"
                : "text-xl space-y-4"
            }`}
          >
            {blockData.items.map((item, idx) => {
              const formattedItem = formatItemWithTeamVolume(item, teamSize);
              
              if (blockType === "warmup") {
                return (
                  <li
                    key={idx}
                    className="relative pl-6 normal-case text-neutral-200 min-w-0 break-words py-1.5 text-left w-full"
                  >
                    <span
                      className="absolute left-0 top-1.5 h-[1.45em] w-4 flex items-center justify-center select-none font-sans text-[14px] text-white"
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

              return (
                <li
                  key={idx}
                  className="normal-case text-neutral-200 min-w-0 break-words pb-1 last:pb-0"
                >
                  <ExerciseLogger
                    dayId={activeDay?.id || ""}
                    exerciseName={getCleanExerciseName(formattedItem)}
                    rawItemHtml={formattedItem}
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
            currentWeek={(activeDay?.id && activeDay.id.startsWith("w") ? activeDay.id.substring(0, 2) : "w2")}
          />
        )}
      </div>
    </section>
  );
}
