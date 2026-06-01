// FILE_PATH: src/components/ShareCardOverlay.tsx
// ACTION: OVERWRITE
// DESCRIPTION: Implement dark black backgrounds for block headers, always render them in white text, use premium vector-based SVG diamond symbols representing the Google Material Design diamond icon, and ensure block headers are correctly labeled.
// ---------------------------------------------------------
import React from "react";
import { DayWorkout, DayVariation, AthleteState } from "../types/workout";

const cleanItemText = (htmlText: string): string => {
  if (!htmlText) return "";
  let cleaned = htmlText;
  // 1. Strip out span with class cue or className cue
  cleaned = cleaned.replace(/<span\s+[^>]*class(?:Name)?\s*=\s*['"]\s*cue\s*['"][^>]*>[\s\S]*?<\/span>/gi, "");
  // 2. Strip out any remaining HTML tags (like <span class='cue'> if something was malformed)
  cleaned = cleaned.replace(/<[^>]*>/g, "");
  // 3. Strip out common pattern indicators if they somehow leak (e.g. 🎯 ... to end of line)
  cleaned = cleaned.replace(/(?:🎯|⚠️|💡).*$/g, "");
  return cleaned.trim();
};

interface ShareCardOverlayProps {
  activeDay: DayWorkout;
  activeVariation: DayVariation;
  currentWeek: string;
  exportBgImage: string | null;
  exportLayout: "center" | "left" | "right";
  exportAthleteName: string;
  exportInspiration: string;
  exportCardOpacity: number;
  exportCardBlur: boolean;
  exportCardWidth: "compact" | "standard" | "wide";
  exportVerticalLayout: "top" | "center" | "bottom";
  exportSilhouetteEffect: "none" | "lighten" | "screen" | "overlay";
  exportOverlayImage: string | null;
  exportOverlayX: number;
  exportOverlayY: number;
  exportOverlayScale: number;
  exportOverlayOpacity: number;
  exportOverlayZ: "front" | "back";
  exportCardHeightLimit: number;
  teamSize: number;
  activeColorSet: { color: string; hover?: string; pulse?: string; text?: string; shadow?: string };
  midBandColor: { bg: string; text?: string; color?: string; border?: string; bgStyle?: React.CSSProperties };
  formatItemWithTeamVolume: (item: string, teamSize: number) => string;
  getDerivedInspiration: (tabName: string) => string;
}

export default function ShareCardOverlay({
  activeDay,
  activeVariation,
  currentWeek,
  exportBgImage,
  exportLayout,
  exportAthleteName,
  exportInspiration,
  exportCardOpacity,
  exportCardBlur,
  exportCardWidth,
  exportVerticalLayout,
  exportSilhouetteEffect,
  exportOverlayImage,
  exportOverlayX,
  exportOverlayY,
  exportOverlayScale,
  exportOverlayOpacity,
  exportOverlayZ,
  exportCardHeightLimit,
  teamSize,
  activeColorSet,
  midBandColor,
  formatItemWithTeamVolume,
  getDerivedInspiration,
}: ShareCardOverlayProps) {
  const cleanedWarmup = activeVariation.warmup.items
    .map(cleanItemText)
    .filter((item) => item.length > 0);
  const cleanedStrength = activeVariation.strength.items
    .map(cleanItemText)
    .filter((item) => item.length > 0);
  const cleanedMetcon = activeVariation.metcon.items
    .map(cleanItemText)
    .filter((item) => item.length > 0);
  const cleanedAccessories = activeVariation.accessories.items
    .map(cleanItemText)
    .filter((item) => item.length > 0);

  return (
    <div
      style={{
        position: "absolute",
        left: "-2000px",
        top: "-3000px",
        width: "1080px",
        height: "1920px",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        id="nexus-share-card-temp"
        className="flex flex-col justify-between overflow-hidden relative"
        style={{
          width: "1080px",
          height: "1920px",
          boxSizing: "border-box",
          fontFamily: '"Inter", sans-serif',
          background: exportBgImage ? "#000" : "#f8fafc",
        }}
      >
        {/* Background Image Layer */}
        {exportBgImage && (
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${exportBgImage})`,
            }}
          />
        )}

        {/* Gradient Overlay for text readability or Biomechanical Theme Base */}
        {exportBgImage ? (
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(5, 5, 8, 0.2) 0%, rgba(5, 5, 8, 0) 35%, rgba(5, 5, 8, 0) 65%, rgba(5, 5, 8, 0.35) 100%)",
            }}
          />
        ) : (
          <div
            className="absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(31, 81, 255, 0.45) 0%, rgba(255, 0, 127, 0.4) 45%, rgba(14, 14, 17, 0.98) 95%)",
            }}
          />
        )}

        {/* Premium Top Bar */}
        <div
          className="absolute top-0 left-0 right-0 h-4.5 z-30 shadow-sm"
          style={{
            background: `linear-gradient(90deg, ${midBandColor.bg} 0%, ${activeColorSet.color} 100%)`,
            boxShadow: `0 0 25px ${activeColorSet.color}B3`,
          }}
        />

        {/* Tech Corner HUD Markers for the Entire Outer Frame */}
        {exportBgImage && (
          <div className="absolute inset-0 z-20 pointer-events-none p-6 font-mono text-[9px] text-zinc-550/80">
            <div className="absolute top-8 left-8 border-t-2 border-l-2 w-5 h-5" style={{ borderColor: `${activeColorSet.color}60` }} />
            <div className="absolute top-8 right-8 border-t-2 border-r-2 w-5 h-5" style={{ borderColor: `${activeColorSet.color}60` }} />
            <div className="absolute bottom-8 left-8 border-b-2 border-l-2 w-5 h-5" style={{ borderColor: `${activeColorSet.color}60` }} />
            <div className="absolute bottom-8 right-8 border-b-2 border-r-2 w-5 h-5" style={{ borderColor: `${activeColorSet.color}60` }} />
            
            {/* Telemetry labels */}
            <div className="absolute top-9 left-16 uppercase tracking-[0.25em]" style={{ color: activeColorSet.color }}>SYSTEM COMPILATION: ACTIVE</div>
          </div>
        )}

        <div className="relative z-20 flex flex-col h-full px-8 pt-12 pb-8">
          {/* MAIN HEADER AREA - PROFESSIONAL AND COMPACT */}
          <div className="mb-4 w-full flex justify-between items-start">
            <div
              className="flex w-full justify-between items-center border-b pb-4"
              style={{
                borderColor: exportBgImage
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(0,0,0,0.1)",
              }}
            >
              <div className="flex flex-col items-start text-left">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="h-2 w-2 rounded-full animate-pulse"
                    style={{ 
                      backgroundColor: activeColorSet.color,
                      boxShadow: `0 0 10px ${activeColorSet.color}`
                    }}
                  />
                  <span
                    className={`font-mono text-base font-black tracking-[0.3em] uppercase ${exportBgImage ? "text-zinc-400" : "text-zinc-650"}`}
                  >
                    SEMANA{" "}
                    <span style={{ color: activeColorSet.color }}>
                      {currentWeek.toUpperCase().replace("W", "")}
                    </span>
                  </span>
                </div>
                <div className="flex items-baseline gap-4 flex-wrap">
                  <h1
                    className="text-[95px] font-black uppercase leading-none m-0 tracking-tighter italic text-left inline-block"
                    style={{
                      fontFamily: '"Anton", "Impact", sans-serif',
                      color: "#ffffff",
                      paddingRight: "18px",
                      textShadow: `0 0 12px ${activeColorSet.color}, 0 0 25px ${midBandColor.bg}B3, 0 0 45px ${activeColorSet.color}40`,
                    }}
                  >
                    {activeDay.name}
                  </h1>
                  {exportAthleteName && (
                    <span
                      className="text-[44px] font-black uppercase italic tracking-wider leading-none text-left inline-block"
                      style={{
                        fontFamily: '"Anton", "Impact", sans-serif',
                        color: activeColorSet.color,
                        textShadow: `0 0 12px ${activeColorSet.color}B3, 0 0 25px ${midBandColor.bg}80`,
                      }}
                    >
                      {exportAthleteName}
                    </span>
                  )}
                </div>
                <div
                  className="text-3xl font-black tracking-tighter mt-1.5 uppercase text-left text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] font-condensed"
                  style={{ fontFamily: '"Roboto Condensed", sans-serif' }}
                >
                  {activeDay.title}
                </div>
              </div>

              <div className="flex flex-col items-end justify-center flex-shrink-0 ml-8">
                <div
                  className="w-20 h-20 rounded-full overflow-hidden bg-black flex-shrink-0"
                  style={{ mixBlendMode: "screen", opacity: 0.85 }}
                >
                  <img
                    src="/emblema.jpg"
                    alt="Nexus Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                {!exportAthleteName && (
                  <div
                    className="inline-block border rounded-none px-3 py-1 font-mono text-[8px] font-black tracking-widest uppercase mt-2"
                    style={{
                      borderColor: activeColorSet.color,
                      color: activeColorSet.color,
                      backgroundColor: `${activeColorSet.color}1E`,
                    }}
                  >
                    {activeVariation.tabName}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BOTTOM WORKOUT CARDS AREA - DYNAMICS SIDE COLUMNS OR FULL WIDTH */}
          <div
            className={`flex flex-col ${
              exportLayout === "left"
                ? `mr-auto flex-1 ${
                    exportVerticalLayout === "top"
                      ? "justify-start pt-6 pb-2"
                      : exportVerticalLayout === "bottom"
                        ? "justify-end pt-2 pb-6"
                        : "justify-center py-4"
                  }`
                : exportLayout === "right"
                  ? `ml-auto flex-1 ${
                      exportVerticalLayout === "top"
                        ? "justify-start pt-6 pb-2"
                        : exportVerticalLayout === "bottom"
                          ? "justify-end pt-2 pb-6"
                          : "justify-center py-4"
                    }`
                  : "mx-auto mt-auto pb-4 justify-end"
            }`}
            style={{
              width:
                exportLayout === "center"
                  ? exportCardWidth === "compact"
                    ? "820px"
                    : exportCardWidth === "standard"
                      ? "920px"
                      : "1020px"
                  : exportCardWidth === "compact"
                    ? "440px"
                    : exportCardWidth === "standard"
                      ? "510px"
                      : "580px",
              maxWidth:
                exportLayout === "center"
                  ? exportCardWidth === "compact"
                    ? "820px"
                    : exportCardWidth === "standard"
                      ? "920px"
                      : "1020px"
                  : exportCardWidth === "compact"
                    ? "440px"
                    : exportCardWidth === "standard"
                      ? "510px"
                      : "580px",
            }}
          >
            <div
              className={`px-4 py-5 rounded-2xl relative overflow-hidden flex flex-col gap-3.5 shadow-[0_25px_70px_rgba(0,0,0,0.9)] ${
                exportBgImage
                  ? "border"
                  : "bg-white border border-black/5"
              }`}
              style={{
                maxHeight: `${1920 * (exportCardHeightLimit / 100)}px`,
                overflow: "hidden",
                borderColor: exportBgImage
                  ? `rgba(255, 255, 255, ${0.12 * (exportCardOpacity / 100)})`
                  : "rgba(0, 0, 0, 0.05)",
                zIndex: exportOverlayZ === "back" ? 12 : "auto",
                backgroundColor: exportBgImage
                  ? `rgba(10, 10, 15, ${exportCardOpacity / 100})`
                  : "rgb(255, 255, 255)",
                backdropFilter: exportBgImage && exportCardBlur && exportCardOpacity > 0
                  ? "blur(20px) saturate(160%)"
                  : "none",
                boxShadow: exportBgImage
                  ? `0 35px 85px rgba(0,0,0,0.9), inset 0 0 50px rgba(255,255,255,${0.06 * (exportCardOpacity / 100)})`
                  : "0 10px 30px rgba(0,0,0,0.03)",
              }}
            >
              {/* Inner Double Border Simulation using absolute CSS for high-fi HUD feel */}
              {exportBgImage && exportCardOpacity > 0 && (
                <div 
                  className="absolute inset-1 pointer-events-none rounded-[12px] border border-dashed border-white/[0.07]"
                />
              )}

              {/* Corner Indicators for Hud Container */}
              {exportBgImage && (
                <>
                  <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l pointer-events-none" style={{ borderColor: `${activeColorSet.color}80` }} />
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r pointer-events-none" style={{ borderColor: `${activeColorSet.color}80` }} />
                  <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l pointer-events-none" style={{ borderColor: `${activeColorSet.color}80` }} />
                  <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r pointer-events-none" style={{ borderColor: `${activeColorSet.color}80` }} />
                </>
              )}

              {/* Dynamic Silhouette Layer */}
              {exportBgImage && exportSilhouetteEffect !== "none" && (
                <div
                  className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none transition-all duration-300"
                  style={{
                    backgroundImage: `url(${exportBgImage})`,
                    mixBlendMode: exportSilhouetteEffect as any,
                    opacity: 0.8,
                    filter: "contrast(140%) brightness(110%) saturate(130%)",
                  }}
                />
              )}
              
              <div
                className={
                  exportLayout === "left" || exportLayout === "right"
                    ? "flex flex-col gap-5 w-full z-10"
                    : "grid grid-cols-4 gap-x-4 gap-y-0 items-stretch w-full z-10"
                }
              >
                {/* Warmup */}
                {cleanedWarmup.length > 0 && (
                  <div
                    className="flex flex-col gap-1 min-w-0 pr-1 text-left"
                    style={{
                      borderLeft: `3px solid ${activeColorSet.color}`,
                      paddingLeft: "10px",
                    }}
                  >
                    <div
                      className="flex flex-col gap-1 w-full p-2 rounded-lg mb-2 border text-left"
                      style={{
                        backgroundColor: "rgba(0, 0, 0, 0.75)",
                        borderColor: "rgba(255, 255, 255, 0.12)"
                      }}
                    >
                      <span
                        className={`font-mono font-black tracking-widest uppercase text-white ${
                          exportLayout === "left" || exportLayout === "right"
                            ? "text-[20px]"
                            : "text-[14px]"
                        }`}
                      >
                        CALENTAMIENTO
                      </span>
                      {activeVariation.warmup.scheme && (
                        <div className="w-full flex mt-0.5">
                          <span
                            className={`font-mono font-black uppercase tracking-widest rounded px-1.5 py-0.5 whitespace-normal break-words text-left bg-white/10 text-white/90 border border-white/15 ${
                              exportLayout === "left" || exportLayout === "right"
                                ? "text-[11px]"
                                : "text-[9px]"
                            }`}
                          >
                            {activeVariation.warmup.scheme}
                          </span>
                        </div>
                      )}
                    </div>
                    <ul
                      className={`font-condensed font-bold leading-tight space-y-1.5 overflow-hidden text-left ${
                        exportBgImage ? "text-zinc-100" : "text-zinc-800"
                      } ${
                        exportLayout === "left" || exportLayout === "right"
                          ? "text-[26px]"
                          : "text-[19px]"
                      }`}
                      style={{ 
                        fontFamily: '"Roboto Condensed", sans-serif',
                        textShadow: exportBgImage ? "0 2px 5px rgba(0,0,0,0.95)" : "none",
                      }}
                    >
                      {cleanedWarmup.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-left leading-tight">
                          <svg
                            className="shrink-0 mt-1.5 w-3 h-3"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            style={{
                              color: activeColorSet.color,
                              filter: `drop-shadow(0 0 5px ${activeColorSet.color})`,
                            }}
                          >
                            <path d="M12 2L2 12L12 22L22 12L12 2Z" />
                          </svg>
                          <span
                            className="break-words min-w-0 text-left normal-case flex-1"
                            dangerouslySetInnerHTML={{ __html: item }}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Strength */}
                {cleanedStrength.length > 0 && (
                  <div
                    className="flex flex-col gap-1 min-w-0 pr-1 text-left"
                    style={{
                      borderLeft: `3px solid ${activeColorSet.color}`,
                      paddingLeft: "10px",
                    }}
                  >
                    <div
                      className="flex flex-col gap-1 w-full p-2 rounded-lg mb-2 border text-left"
                      style={{
                        backgroundColor: "rgba(0, 0, 0, 0.75)",
                        borderColor: "rgba(255, 255, 255, 0.12)"
                      }}
                    >
                      <span
                        className={`font-mono font-black tracking-widest uppercase text-white ${
                          exportLayout === "left" || exportLayout === "right"
                            ? "text-[20px]"
                            : "text-[14px]"
                        }`}
                      >
                        FUERZA
                      </span>
                      {activeVariation.strength.scheme && (
                        <div className="w-full flex mt-0.5">
                          <span
                            className={`font-mono font-black uppercase tracking-widest rounded px-1.5 py-0.5 whitespace-normal break-words text-left bg-white/10 text-white/90 border border-white/15 ${
                              exportLayout === "left" || exportLayout === "right"
                                ? "text-[11px]"
                                : "text-[9px]"
                            }`}
                          >
                            {activeVariation.strength.scheme}
                          </span>
                        </div>
                      )}
                    </div>
                    <ul
                      className={`font-condensed font-bold leading-tight space-y-1.5 overflow-hidden text-left ${
                        exportBgImage ? "text-zinc-100" : "text-zinc-800"
                      } ${
                        exportLayout === "left" || exportLayout === "right"
                          ? "text-[26px]"
                          : "text-[19px]"
                      }`}
                      style={{ 
                        fontFamily: '"Roboto Condensed", sans-serif',
                        textShadow: exportBgImage ? "0 2px 5px rgba(0,0,0,0.95)" : "none",
                      }}
                    >
                      {cleanedStrength.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-left leading-tight">
                          <svg
                            className="shrink-0 mt-1.5 w-3 h-3"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            style={{
                              color: activeColorSet.color,
                              filter: `drop-shadow(0 0 5px ${activeColorSet.color})`,
                            }}
                          >
                            <path d="M12 2L2 12L12 22L22 12L12 2Z" />
                          </svg>
                          <span
                            className="break-words min-w-0 text-left normal-case flex-1"
                            dangerouslySetInnerHTML={{ __html: item }}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Metcon */}
                {cleanedMetcon.length > 0 && (
                  <div
                    className="flex flex-col gap-1 min-w-0 pr-1 text-left"
                    style={{
                      borderLeft: `3px solid ${activeColorSet.color}`,
                      paddingLeft: "10px",
                    }}
                  >
                    <div
                      className="flex flex-col gap-1 w-full p-2 rounded-lg mb-2 border text-left"
                      style={{
                        backgroundColor: "rgba(0, 0, 0, 0.75)",
                        borderColor: "rgba(255, 255, 255, 0.12)"
                      }}
                    >
                      <span
                        className={`font-mono font-black tracking-widest uppercase text-white ${
                          exportLayout === "left" || exportLayout === "right"
                            ? "text-[20px]"
                            : "text-[14px]"
                        }`}
                      >
                        METCON
                      </span>
                      {activeVariation.metcon.scheme && (
                        <div className="w-full flex mt-0.5">
                          <span
                            className={`font-mono font-black uppercase tracking-widest rounded px-1.5 py-0.5 whitespace-normal break-words text-left bg-white/10 text-white/90 border border-white/15 ${
                              exportLayout === "left" || exportLayout === "right"
                                ? "text-[11px]"
                                : "text-[9px]"
                            }`}
                          >
                            {activeVariation.metcon.scheme}
                          </span>
                        </div>
                      )}
                    </div>
                    <ul
                      className={`font-condensed font-bold leading-tight space-y-1.5 overflow-hidden text-left ${
                        exportBgImage ? "text-zinc-100" : "text-zinc-800"
                      } ${
                        exportLayout === "left" || exportLayout === "right"
                          ? "text-[26px]"
                          : "text-[19px]"
                      }`}
                      style={{ 
                        fontFamily: '"Roboto Condensed", sans-serif',
                        textShadow: exportBgImage ? "0 2px 5px rgba(0,0,0,0.95)" : "none",
                      }}
                    >
                      {cleanedMetcon.map((item, idx) => {
                        const formattedItem = formatItemWithTeamVolume(item, teamSize);
                        return (
                          <li key={idx} className="flex items-start gap-2.5 text-left leading-tight">
                            <svg
                              className="shrink-0 mt-1.5 w-3 h-3"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              style={{
                                color: activeColorSet.color,
                                filter: `drop-shadow(0 0 5px ${activeColorSet.color})`,
                              }}
                            >
                              <path d="M12 2L2 12L12 22L22 12L12 2Z" />
                            </svg>
                            <span
                              className="break-words min-w-0 text-left normal-case flex-1"
                              dangerouslySetInnerHTML={{ __html: formattedItem }}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Accessories */}
                {cleanedAccessories.length > 0 && (
                  <div
                    className="flex flex-col gap-1 min-w-0 pr-1 text-left"
                    style={{
                      borderLeft: `3px solid ${activeColorSet.color}`,
                      paddingLeft: "10px",
                    }}
                  >
                    <div
                      className="flex flex-col gap-1 w-full p-2 rounded-lg mb-2 border text-left"
                      style={{
                        backgroundColor: "rgba(0, 0, 0, 0.75)",
                        borderColor: "rgba(255, 255, 255, 0.12)"
                      }}
                    >
                      <span
                        className={`font-mono font-black tracking-widest uppercase text-white ${
                          exportLayout === "left" || exportLayout === "right"
                            ? "text-[20px]"
                            : "text-[14px]"
                        }`}
                      >
                        ACCESORIOS
                      </span>
                      {activeVariation.accessories.scheme && (
                        <div className="w-full flex mt-0.5">
                          <span
                            className={`font-mono font-black uppercase tracking-widest rounded px-1.5 py-0.5 whitespace-normal break-words text-left bg-[#10b981]/25 text-[#aefbe2] border border-[#10b981]/45 ${
                              exportLayout === "left" || exportLayout === "right"
                                ? "text-[11px]"
                                : "text-[9px]"
                            }`}
                          >
                            {activeVariation.accessories.scheme}
                          </span>
                        </div>
                      )}
                    </div>
                    <ul
                      className={`font-condensed font-bold leading-tight space-y-1.5 overflow-hidden text-left ${
                        exportBgImage ? "text-zinc-100" : "text-zinc-800"
                      } ${
                        exportLayout === "left" || exportLayout === "right"
                          ? "text-[26px]"
                          : "text-[19px]"
                      }`}
                      style={{ 
                        fontFamily: '"Roboto Condensed", sans-serif',
                        textShadow: exportBgImage ? "0 2px 5px rgba(0,0,0,0.95)" : "none",
                      }}
                    >
                      {cleanedAccessories.map((item, idx) => {
                        const formattedItem = formatItemWithTeamVolume(item, teamSize);
                        return (
                          <li key={idx} className="flex items-start gap-2.5 text-left leading-tight">
                            <svg
                              className="shrink-0 mt-1.5 w-3 h-3"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              style={{
                                color: activeColorSet.color,
                                filter: `drop-shadow(0 0 5px ${activeColorSet.color})`,
                              }}
                            >
                              <path d="M12 2L2 12L12 22L22 12L12 2Z" />
                            </svg>
                            <span
                              className="break-words min-w-0 text-left normal-case flex-1"
                              dangerouslySetInnerHTML={{ __html: formattedItem }}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Transparent PNG Silhouette Sticker Layer */}
        {exportBgImage && exportOverlayImage && (
          <div
            className="absolute pointer-events-none"
            style={{
              zIndex: exportOverlayZ === "front" ? 25 : 5,
              left: `calc(50% + ${exportOverlayX}%)`,
              bottom: `${exportOverlayY}px`,
              transform: `translateX(-50%) scale(${exportOverlayScale / 100})`,
              width: "1080px",
              height: "1920px",
              display: "flex",
              justifyContent: "center",
              alignItems: "end",
              opacity: exportOverlayOpacity / 100,
            }}
          >
            <img
              src={exportOverlayImage}
              alt="Transparent 3D Silhouette Overlay"
              className="max-h-full object-contain"
              style={{
                filter: "drop-shadow(0 20px 50px rgba(0,0,0,0.85))",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
