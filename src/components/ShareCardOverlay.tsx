import DOMPurify from "isomorphic-dompurify";
// FILE_PATH: src/components/ShareCardOverlay.tsx
// ACTION: OVERWRITE
// DESCRIPTION: Implement dark black backgrounds for block headers, always render them in white text, use premium vector-based SVG diamond symbols representing the Google Material Design diamond icon, and ensure block headers are correctly labeled.
// ---------------------------------------------------------
import React, { useRef } from "react";
import { motion } from "motion/react";
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
  exportTheme?: string;
  exportInspiration: string;
  exportCardOpacity: number;
  exportCardBlur: boolean;
  exportCardWidth: "compact" | "standard" | "wide";
  exportVerticalLayout: "top" | "center" | "bottom";
  exportPhotoFilter: "none" | "vibrant" | "grayscale" | "sepia" | "duotone" | "silueta" | "neon";
  exportCardHeightLimit: number;
  teamSize: number;
  activeColorSet: { color: string; hover?: string; pulse?: string; text?: string; shadow?: string };
  midBandColor: { bg: string; text?: string; color?: string; border?: string; bgStyle?: React.CSSProperties };
  formatItemWithTeamVolume: (item: string, teamSize: number) => string;
  getDerivedInspiration: (tabName: string) => string;
  // When true, renders a scaled-down live preview instead of the hidden
  // off-screen export template (and omits the export id so html-to-image
  // keeps capturing the full-size copy).
  previewMode?: boolean;
  interactiveMode?: boolean;
  blockPositions?: { [key: string]: { x: number; y: number } };
  setBlockPositions?: React.Dispatch<React.SetStateAction<{ [key: string]: { x: number; y: number } }>>;
  // Scale applied to the interactive editor container (CSS transform: scale()).
  // Pointer deltas are divided by this so dragged elements track the cursor 1:1
  // and the stored card-space position matches what's exported.
  dragScale?: number;
}

export default function ShareCardOverlay({
  activeDay,
  activeVariation,
  currentWeek,
  exportBgImage,
  exportLayout,
  exportAthleteName,
  exportTheme = "nexus",
  exportInspiration,
  exportCardOpacity,
  exportCardBlur,
  exportCardWidth,
  exportVerticalLayout,
  exportPhotoFilter,
  exportCardHeightLimit,
  teamSize,
  activeColorSet: defaultColorSet,
  midBandColor: defaultMidBandColor,
  formatItemWithTeamVolume,
  getDerivedInspiration,
  previewMode = false,
  interactiveMode = false,
  blockPositions = {},
  setBlockPositions,
  dragScale = 1,
}: ShareCardOverlayProps) {
  let activeColorSet = defaultColorSet;
  let midBandColor = defaultMidBandColor;

  if (exportTheme === "cyberpunk") {
    activeColorSet = { color: "#06b6d4", text: "#f472b6" }; // Cyan with Pink text
    midBandColor = { bg: "#f472b6" }; // Pink band
  } else if (exportTheme === "monochrome") {
    activeColorSet = { color: "#ffffff", text: "#000000" };
    midBandColor = { bg: "#52525b" }; // Zinc-600
  } else if (exportTheme === "wodfrg") {
    activeColorSet = { color: "#dc2626", text: "#ffffff" }; // Red-600
    midBandColor = { bg: "#000000" }; // Black band
  } else if (exportTheme === "brutalist") {
    activeColorSet = { color: "#fbbf24", text: "#0a0a0a" }; // Amber slab + black text
    midBandColor = { bg: "#fbbf24" };
  } else if (exportTheme === "synthwave") {
    activeColorSet = { color: "#22d3ee", text: "#f0abfc" }; // Cyan + magenta text
    midBandColor = { bg: "#d946ef" }; // Magenta band
  } else if (exportTheme === "editorial") {
    activeColorSet = { color: "#e5e5e5", text: "#111111" }; // Near-white ink
    midBandColor = { bg: "#1a1a1a" };
  } else if (exportTheme === "holo") {
    activeColorSet = { color: "#a78bfa", text: "#67e8f9" }; // Iridescent violet + cyan
    midBandColor = { bg: "#22d3ee" };
  }

  // Structural Theme Overrides
  const themeConfig = {
    cardRadius: "rounded-2xl",
    blockRadius: "rounded-lg",
    blockBg: "rgba(0, 0, 0, 0.75)",
    blockBorder: "rgba(255, 255, 255, 0.12)",
    blockText: "text-white",
    schemeBadge: "bg-white/10 text-white/90 border-white/15",
    listFont: '"Roboto Condensed", sans-serif',
    titleFont: '"Anton", "Impact", sans-serif',
    titleItalic: "italic",
    listColor: exportBgImage ? "text-zinc-100" : "text-zinc-800",
    headerSkew: "skewX(0deg)",
    leftBorder: `3px solid ${activeColorSet.color}`,
    scanlines: false,
    grain: false,
    outerBorder: "border-black/5"
  };

  if (exportTheme === "cyberpunk") {
    themeConfig.cardRadius = "rounded-none";
    themeConfig.blockRadius = "rounded-none";
    themeConfig.blockBg = "rgba(0, 0, 0, 0.9)";
    themeConfig.blockBorder = activeColorSet.color;
    themeConfig.blockText = "text-[#f472b6]"; // Pink text for headers
    themeConfig.schemeBadge = "bg-[#f472b6]/10 text-[#f472b6] border-[#f472b6]/30";
    themeConfig.listFont = '"Fira Code", "Courier New", monospace';
    themeConfig.titleFont = '"Fira Code", "Courier New", monospace';
    themeConfig.titleItalic = "not-italic";
    themeConfig.leftBorder = `1px solid ${activeColorSet.color}`;
    themeConfig.scanlines = true;
    themeConfig.outerBorder = `border-2 border-[${activeColorSet.color}]`;
  } else if (exportTheme === "monochrome") {
    themeConfig.cardRadius = "rounded-none";
    themeConfig.blockRadius = "rounded-none";
    themeConfig.blockBg = "transparent";
    themeConfig.blockBorder = "transparent";
    themeConfig.blockText = "text-white";
    themeConfig.schemeBadge = "bg-white/10 text-white border-white/30";
    themeConfig.listFont = '"Inter", sans-serif';
    themeConfig.titleFont = '"Inter", sans-serif';
    themeConfig.titleItalic = "not-italic";
    themeConfig.leftBorder = "none";
    themeConfig.outerBorder = "border-0";
  } else if (exportTheme === "wodfrg") {
    themeConfig.cardRadius = "rounded-[4px]";
    themeConfig.blockRadius = "rounded-none";
    themeConfig.blockBg = "rgba(255, 255, 255, 0.95)";
    themeConfig.blockBorder = "rgba(255, 255, 255, 0.95)";
    themeConfig.blockText = "text-black";
    themeConfig.schemeBadge = "bg-black/10 text-black border-black/20";
    themeConfig.listFont = '"Anton", "Impact", sans-serif';
    themeConfig.titleFont = '"Anton", "Impact", sans-serif';
    themeConfig.titleItalic = "italic";
    themeConfig.headerSkew = "skewX(-8deg)";
    themeConfig.leftBorder = `6px solid ${activeColorSet.color}`;
    themeConfig.outerBorder = `border-4 border-[${activeColorSet.color}]`;
  } else if (exportTheme === "brutalist") {
    // Anton slab, flat high-contrast color blocks, hard square edges, amber spine.
    themeConfig.cardRadius = "rounded-none";
    themeConfig.blockRadius = "rounded-none";
    themeConfig.blockBg = "rgba(10, 10, 12, 0.92)";
    themeConfig.blockBorder = activeColorSet.color;
    themeConfig.blockText = "text-white";
    themeConfig.schemeBadge = "bg-amber-400 text-black border-amber-400";
    themeConfig.listFont = '"Roboto Condensed", sans-serif';
    themeConfig.titleFont = '"Anton", "Impact", sans-serif';
    themeConfig.titleItalic = "italic";
    themeConfig.leftBorder = `8px solid ${activeColorSet.color}`;
    themeConfig.outerBorder = `border-4 border-[${activeColorSet.color}]`;
  } else if (exportTheme === "synthwave") {
    // Magenta→cyan glow, retro grid (scanlines), rounded soft chrome.
    themeConfig.cardRadius = "rounded-xl";
    themeConfig.blockRadius = "rounded-md";
    themeConfig.blockBg = "rgba(20, 8, 40, 0.82)";
    themeConfig.blockBorder = activeColorSet.color;
    themeConfig.blockText = "text-[#f0abfc]";
    themeConfig.schemeBadge = "bg-[#d946ef]/15 text-[#f0abfc] border-[#d946ef]/40";
    themeConfig.listFont = '"Roboto Condensed", sans-serif';
    themeConfig.titleFont = '"Anton", "Impact", sans-serif';
    themeConfig.titleItalic = "italic";
    themeConfig.leftBorder = `3px solid ${activeColorSet.color}`;
    themeConfig.scanlines = true;
    themeConfig.outerBorder = `border-2 border-[${activeColorSet.color}]`;
  } else if (exportTheme === "editorial") {
    // Magazine/poster: serif headings, lots of air, subtle paper grain.
    themeConfig.cardRadius = "rounded-none";
    themeConfig.blockRadius = "rounded-none";
    themeConfig.blockBg = "rgba(245, 245, 240, 0.94)";
    themeConfig.blockBorder = "rgba(0, 0, 0, 0.12)";
    themeConfig.blockText = "text-neutral-900";
    themeConfig.schemeBadge = "bg-black text-white border-black";
    themeConfig.listFont = '"Roboto Condensed", sans-serif';
    themeConfig.titleFont = '"Playfair Display", "Georgia", serif';
    themeConfig.titleItalic = "italic";
    themeConfig.leftBorder = `2px solid #111111`;
    themeConfig.grain = true;
    themeConfig.outerBorder = "border border-black/20";
  } else if (exportTheme === "holo") {
    // Chromatic aberration + scanlines + iridescent sweep.
    themeConfig.cardRadius = "rounded-2xl";
    themeConfig.blockRadius = "rounded-lg";
    themeConfig.blockBg = "rgba(8, 10, 24, 0.85)";
    themeConfig.blockBorder = activeColorSet.color;
    themeConfig.blockText = "text-[#67e8f9]";
    themeConfig.schemeBadge = "bg-[#a78bfa]/15 text-[#67e8f9] border-[#a78bfa]/40";
    themeConfig.listFont = '"Roboto Condensed", sans-serif';
    themeConfig.titleFont = '"Anton", "Impact", sans-serif';
    themeConfig.titleItalic = "italic";
    themeConfig.leftBorder = `3px solid ${activeColorSet.color}`;
    themeConfig.scanlines = true;
    themeConfig.outerBorder = `border-2 border-[${activeColorSet.color}]`;
  }

  // Background-photo treatment (CSS filter) — replaces the removed silhouette
  // blend with a non-destructive photo grade. Duotone adds a tinted overlay.
  const photoFilterCss =
    exportPhotoFilter === "vibrant"
      ? "contrast(115%) saturate(150%) brightness(105%)"
      : exportPhotoFilter === "grayscale"
        ? "grayscale(100%) contrast(110%)"
        : exportPhotoFilter === "sepia"
          ? "sepia(70%) contrast(105%) brightness(105%)"
          : exportPhotoFilter === "duotone"
            ? "grayscale(100%) contrast(120%)"
            : "none";

  // Manual pointer-based dragging. Framer-motion's `drag` measures pointer
  // movement in viewport pixels and ignores the CSS `scale()` applied to the
  // fullscreen editor, so elements lagged behind the cursor (≈1/3 speed on a
  // phone) and the saved positions came out wrong. We translate the pointer
  // delta back into card-space (÷ scale) and write the live transform straight
  // to the DOM — no React re-render during the drag, so the heavy list items
  // aren't re-sanitised on every move — committing to state only on release so
  // the hidden export template renders exactly where the user left things.
  const scale = dragScale || 1;
  const elementRefs = useRef<Record<string, HTMLElement | null>>({});
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
  } | null>(null);

  const dragProps = (id: string) => {
    const committed = blockPositions[id] || { x: 0, y: 0 };

    if (!interactiveMode) {
      return {
        style: {
          transform: `translate(${committed.x}px, ${committed.y}px)`,
          position: "relative" as const,
          zIndex: "auto",
        },
      };
    }

    // Commit the active drag (whichever element it is) to React state so BOTH
    // the live editor and the hidden export template (#nexus-share-card-temp)
    // render from the same committed positions. Committing on every release is
    // what makes the moves survive export and makes "RESET LAYOUT" able to
    // clear them — an uncommitted imperative move would silently revert on
    // export and ignore reset (React's recorded transform would still be 0,0).
    const finishDrag = (clientX: number, clientY: number) => {
      const d = dragRef.current;
      if (!d) return;
      const nx = d.baseX + (clientX - d.startX) / scale;
      const ny = d.baseY + (clientY - d.startY) / scale;
      dragRef.current = null;
      setBlockPositions?.((prev) => ({ ...prev, [d.id]: { x: nx, y: ny } }));
    };

    return {
      ref: (el: HTMLElement | null) => {
        elementRefs.current[id] = el;
      },
      onPointerDown: (e: React.PointerEvent) => {
        // Stop the press from bubbling to an outer draggable (e.g. the workout
        // container that wraps the individual blocks) so only one element moves.
        e.stopPropagation();

        dragRef.current = {
          id,
          startX: e.clientX,
          startY: e.clientY,
          baseX: committed.x,
          baseY: committed.y,
        };

        // Track the pointer on `window` for the rest of the gesture. Relying on
        // the element's own onPointerMove/Up (even with setPointerCapture) was
        // unreliable for the smaller header/footer/block elements — when the
        // routing failed they never committed, so only the big central
        // container survived export/reset. window listeners always fire,
        // wherever the finger goes, so every element commits.
        const handleMove = (ev: PointerEvent) => {
          const d = dragRef.current;
          if (!d) return;
          const nx = d.baseX + (ev.clientX - d.startX) / scale;
          const ny = d.baseY + (ev.clientY - d.startY) / scale;
          const el = elementRefs.current[d.id];
          if (el) el.style.transform = `translate(${nx}px, ${ny}px)`;
        };
        const handleUp = (ev: PointerEvent) => {
          window.removeEventListener("pointermove", handleMove);
          window.removeEventListener("pointerup", handleUp);
          window.removeEventListener("pointercancel", handleUp);
          finishDrag(ev.clientX, ev.clientY);
        };
        window.addEventListener("pointermove", handleMove);
        window.addEventListener("pointerup", handleUp);
        window.addEventListener("pointercancel", handleUp);
      },
      style: {
        transform: `translate(${committed.x}px, ${committed.y}px)`,
        cursor: "grab",
        zIndex: 50,
        position: "relative" as const,
        touchAction: "none" as const,
      },
    };
  };

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

  const card = (
      <div
        id={previewMode ? undefined : "nexus-share-card-temp"}
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
              filter: photoFilterCss,
            }}
          />
        )}

        {/* Duotone tint: accent color blended over the grayscaled photo */}
        {exportBgImage && exportPhotoFilter === "duotone" && (
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              backgroundColor: activeColorSet.color,
              mixBlendMode: "color",
              opacity: 0.55,
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
          <div className="absolute inset-0 z-20 pointer-events-none p-6 font-mono text-[9px] text-zinc-500/80">
            <div className="absolute top-8 left-8 border-t-2 border-l-2 w-5 h-5" style={{ borderColor: `${activeColorSet.color}60` }} />
            <div className="absolute top-8 right-8 border-t-2 border-r-2 w-5 h-5" style={{ borderColor: `${activeColorSet.color}60` }} />
            <div className="absolute bottom-8 left-8 border-b-2 border-l-2 w-5 h-5" style={{ borderColor: `${activeColorSet.color}60` }} />
            <div className="absolute bottom-8 right-8 border-b-2 border-r-2 w-5 h-5" style={{ borderColor: `${activeColorSet.color}60` }} />
            
            {/* Telemetry labels */}
            <div className="absolute top-9 left-16 uppercase tracking-[0.25em]" style={{ color: activeColorSet.color }}>SYSTEM COMPILATION: ACTIVE</div>
          </div>
        )}

        <div className="relative z-20 flex flex-col h-full px-8 pt-12 pb-8 pointer-events-none">
          {/* MAIN HEADER AREA - PROFESSIONAL AND COMPACT */}
          <div className="mb-4 w-full flex justify-between items-start pointer-events-none">
            <div
              className="flex w-full justify-between items-center border-b pb-4 pointer-events-none"
              style={{
                borderColor: exportBgImage
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(0,0,0,0.1)",
              }}
            >
              <div className="flex flex-col items-start text-left pointer-events-none">
                <motion.div {...dragProps("headerWeek")} className="flex items-center gap-3 mb-2 pointer-events-auto w-fit">
                  <span
                    className="h-2 w-2 rounded-full animate-pulse"
                    style={{ 
                      backgroundColor: activeColorSet.color,
                      boxShadow: `0 0 10px ${activeColorSet.color}`
                    }}
                  />
                  <span
                    className={`font-mono text-base font-black tracking-[0.3em] uppercase ${exportBgImage ? "text-zinc-400" : "text-zinc-600"}`}
                  >
                    SEMANA{" "}
                    <span style={{ color: activeColorSet.color }}>
                      {currentWeek.toUpperCase().replace("W", "")}
                    </span>
                  </span>
                </motion.div>
                <div className="flex items-baseline gap-4 flex-wrap pointer-events-none">
                  <motion.h1
                    {...dragProps("headerDay")}
                    className={`text-[95px] font-black uppercase leading-none m-0 tracking-tighter ${themeConfig.titleItalic} text-left inline-block pointer-events-auto w-fit`}
                    style={{
                      fontFamily: themeConfig.titleFont,
                      color: "#ffffff",
                      paddingRight: "18px",
                      textShadow: `0 0 12px ${activeColorSet.color}, 0 0 25px ${midBandColor.bg}B3, 0 0 45px ${activeColorSet.color}40`,
                      // Merge the drag transform LAST so the committed position is
                      // actually applied — without this the explicit style above
                      // overrides dragProps' transform and the element reverts on
                      // export / ignores reset.
                      ...(dragProps("headerDay").style as any),
                    }}
                  >
                    {activeDay.name}
                  </motion.h1>
                  {exportAthleteName && (
                    <motion.span
                      {...dragProps("headerAthlete")}
                      className={`text-[44px] font-black uppercase ${themeConfig.titleItalic} tracking-wider leading-none text-left inline-block pointer-events-auto w-fit`}
                      style={{
                        fontFamily: themeConfig.titleFont,
                        color: activeColorSet.color,
                        textShadow: `0 0 12px ${activeColorSet.color}B3, 0 0 25px ${midBandColor.bg}80`,
                        ...(dragProps("headerAthlete").style as any),
                      }}
                    >
                      {exportAthleteName}
                    </motion.span>
                  )}
                </div>
                <motion.div
                  {...dragProps("headerSub")}
                  className="text-3xl font-black tracking-tighter mt-1.5 uppercase text-left text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] font-condensed pointer-events-auto w-fit"
                  style={{
                    fontFamily: '"Roboto Condensed", sans-serif',
                    ...(dragProps("headerSub").style as any),
                  }}
                >
                  {activeDay.title}
                </motion.div>
              </div>

              <motion.div {...dragProps("headerLogo")} className="flex flex-col items-end justify-center flex-shrink-0 ml-8 pointer-events-auto w-fit">
                <img
                  src="/logo.svg"
                  alt="Nexus Logo"
                  className="w-20 h-20 object-contain flex-shrink-0 drop-shadow-[0_0_8px_rgba(255,255,255,0.25)]"
                  style={{ opacity: 0.85 }}
                />
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
              </motion.div>
            </div>
          </div>

          {/* BOTTOM WORKOUT CARDS AREA - DYNAMICS SIDE COLUMNS OR FULL WIDTH */}
          <motion.div
            {...dragProps("workoutContainer")}
            className={`flex flex-col pointer-events-auto ${
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
                  : `mx-auto flex-1 ${
                      exportVerticalLayout === "top"
                        ? "justify-start pt-6 pb-2"
                        : exportVerticalLayout === "center"
                          ? "justify-center py-4"
                          : "justify-end pt-2 pb-4"
                    }`
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
              ...(dragProps("workoutContainer").style as any),
            }}
          >
            <div
              className={`px-4 py-5 ${themeConfig.cardRadius} relative overflow-hidden flex flex-col gap-3.5 shadow-[0_25px_70px_rgba(0,0,0,0.9)] ${
                exportBgImage
                  ? "border " + themeConfig.outerBorder
                  : "bg-white border " + themeConfig.outerBorder
              }`}
              style={{
                maxHeight: `${1920 * (exportCardHeightLimit / 100)}px`,
                overflow: "hidden",
                borderColor: exportBgImage
                  ? `rgba(255, 255, 255, ${0.12 * (exportCardOpacity / 100)})`
                  : "rgba(0, 0, 0, 0.05)",
                zIndex: "auto",
                backgroundColor: exportBgImage
                  ? `rgba(10, 10, 15, ${previewMode ? exportCardOpacity / 100 : Math.min((exportCardOpacity + 15) / 100, 0.95)})`
                  : "rgb(255, 255, 255)",
                backdropFilter: exportBgImage && exportCardBlur && exportCardOpacity > 0 && previewMode
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

              {/* Theme Scanlines Layer (cyberpunk · synthwave · holo) */}
              {themeConfig.scanlines && exportBgImage && (
                <div
                  className="absolute inset-0 z-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
                    backgroundSize: "100% 4px, 6px 100%",
                    mixBlendMode: "overlay"
                  }}
                />
              )}

              {/* Theme Grain Layer (editorial paper texture) */}
              {themeConfig.grain && exportBgImage && (
                <div
                  className="absolute inset-0 z-0 pointer-events-none"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
                    backgroundSize: "120px 120px",
                    mixBlendMode: "multiply",
                    opacity: 0.12,
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
                  <motion.div
                    {...dragProps("warmup")}
                    className="flex flex-col gap-1 min-w-0 pr-1 text-left"
                    style={{
                      borderLeft: themeConfig.leftBorder,
                      paddingLeft: "10px",
                      ...(dragProps("warmup").style as any),
                    }}
                  >
                    <div
                      className={`flex flex-col gap-1 w-full p-2 mb-2 border text-left ${themeConfig.blockRadius}`}
                      style={{
                        backgroundColor: themeConfig.blockBg,
                        borderColor: themeConfig.blockBorder,
                        transform: themeConfig.headerSkew,
                        transformOrigin: "left center"
                      }}
                    >
                      <span
                        className={`font-mono font-black tracking-widest uppercase ${themeConfig.blockText} ${
                          exportLayout === "left" || exportLayout === "right"
                            ? "text-[20px]"
                            : "text-[14px]"
                        }`}
                        style={{
                           transform: themeConfig.headerSkew !== "skewX(0deg)" ? "skewX(8deg)" : "none",
                           display: "inline-block"
                        }}
                      >
                        CALENTAMIENTO
                      </span>
                      {activeVariation.warmup.scheme && (
                        <div className="w-full flex mt-0.5">
                          <span
                            className={`font-mono font-black uppercase tracking-widest rounded px-1.5 py-0.5 whitespace-normal break-words text-left border ${themeConfig.schemeBadge} ${
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
                      className={`font-condensed font-bold leading-tight space-y-1.5 overflow-hidden text-left ${themeConfig.listColor} ${
                        exportLayout === "left" || exportLayout === "right"
                          ? "text-[26px]"
                          : "text-[19px]"
                      }`}
                      style={{ 
                        fontFamily: themeConfig.listFont,
                        textShadow: exportBgImage ? "0 2px 5px rgba(0,0,0,0.95)" : "none",
                      }}
                    >
                      {cleanedWarmup.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-left leading-tight">
                          <img
                            src="/logo.svg"
                            className="shrink-0 mt-1.5 w-3 h-3 object-contain"
                            style={{
                              filter: `drop-shadow(0 0 5px ${activeColorSet.color})`,
                            }}
                            alt="Logo"
                          />
                          <span
                            className="break-words min-w-0 text-left normal-case flex-1"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item) }}
                          />
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Strength */}
                {cleanedStrength.length > 0 && (
                  <motion.div
                    {...dragProps("strength")}
                    className="flex flex-col gap-1 min-w-0 pr-1 text-left"
                    style={{
                      borderLeft: themeConfig.leftBorder,
                      paddingLeft: "10px",
                      ...(dragProps("strength").style as any),
                    }}
                  >
                    <div
                      className={`flex flex-col gap-1 w-full p-2 mb-2 border text-left ${themeConfig.blockRadius}`}
                      style={{
                        backgroundColor: themeConfig.blockBg,
                        borderColor: themeConfig.blockBorder,
                        transform: themeConfig.headerSkew,
                        transformOrigin: "left center"
                      }}
                    >
                      <span
                        className={`font-mono font-black tracking-widest uppercase ${themeConfig.blockText} ${
                          exportLayout === "left" || exportLayout === "right"
                            ? "text-[20px]"
                            : "text-[14px]"
                        }`}
                        style={{
                           transform: themeConfig.headerSkew !== "skewX(0deg)" ? "skewX(8deg)" : "none",
                           display: "inline-block"
                        }}
                      >
                        FUERZA
                      </span>
                      {activeVariation.strength.scheme && (
                        <div className="w-full flex mt-0.5">
                          <span
                            className={`font-mono font-black uppercase tracking-widest rounded px-1.5 py-0.5 whitespace-normal break-words text-left border ${themeConfig.schemeBadge} ${
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
                      className={`font-condensed font-bold leading-tight space-y-1.5 overflow-hidden text-left ${themeConfig.listColor} ${
                        exportLayout === "left" || exportLayout === "right"
                          ? "text-[26px]"
                          : "text-[19px]"
                      }`}
                      style={{ 
                        fontFamily: themeConfig.listFont,
                        textShadow: exportBgImage ? "0 2px 5px rgba(0,0,0,0.95)" : "none",
                      }}
                    >
                      {cleanedStrength.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-left leading-tight">
                          <img
                            src="/logo.svg"
                            className="shrink-0 mt-1.5 w-3 h-3 object-contain"
                            style={{
                              filter: `drop-shadow(0 0 5px ${activeColorSet.color})`,
                            }}
                            alt="Logo"
                          />
                          <span
                            className="break-words min-w-0 text-left normal-case flex-1"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item) }}
                          />
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Metcon */}
                {cleanedMetcon.length > 0 && (
                  <motion.div
                    {...dragProps("metcon")}
                    className="flex flex-col gap-1 min-w-0 pr-1 text-left"
                    style={{
                      borderLeft: themeConfig.leftBorder,
                      paddingLeft: "10px",
                      ...(dragProps("metcon").style as any),
                    }}
                  >
                    <div
                      className={`flex flex-col gap-1 w-full p-2 mb-2 border text-left ${themeConfig.blockRadius}`}
                      style={{
                        backgroundColor: themeConfig.blockBg,
                        borderColor: themeConfig.blockBorder,
                        transform: themeConfig.headerSkew,
                        transformOrigin: "left center"
                      }}
                    >
                      <span
                        className={`font-mono font-black tracking-widest uppercase ${themeConfig.blockText} ${
                          exportLayout === "left" || exportLayout === "right"
                            ? "text-[20px]"
                            : "text-[14px]"
                        }`}
                        style={{
                           transform: themeConfig.headerSkew !== "skewX(0deg)" ? "skewX(8deg)" : "none",
                           display: "inline-block"
                        }}
                      >
                        METCON
                      </span>
                      {activeVariation.metcon.scheme && (
                        <div className="w-full flex mt-0.5">
                          <span
                            className={`font-mono font-black uppercase tracking-widest rounded px-1.5 py-0.5 whitespace-normal break-words text-left border ${themeConfig.schemeBadge} ${
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
                      className={`font-condensed font-bold leading-tight space-y-1.5 overflow-hidden text-left ${themeConfig.listColor} ${
                        exportLayout === "left" || exportLayout === "right"
                          ? "text-[26px]"
                          : "text-[19px]"
                      }`}
                      style={{ 
                        fontFamily: themeConfig.listFont,
                        textShadow: exportBgImage ? "0 2px 5px rgba(0,0,0,0.95)" : "none",
                      }}
                    >
                      {cleanedMetcon.map((item, idx) => {
                        const formattedItem = formatItemWithTeamVolume(item, teamSize);
                        return (
                          <li key={idx} className="flex items-start gap-2.5 text-left leading-tight">
                            <img
                              src="/logo.svg"
                              className="shrink-0 mt-1.5 w-3 h-3 object-contain"
                              style={{
                                filter: `drop-shadow(0 0 5px ${activeColorSet.color})`,
                              }}
                              alt="Logo"
                            />
                            <span
                              className="break-words min-w-0 text-left normal-case flex-1"
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formattedItem) }}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </motion.div>
                )}

                {/* Accessories */}
                {cleanedAccessories.length > 0 && (
                  <motion.div
                    {...dragProps("accessories")}
                    className="flex flex-col gap-1 min-w-0 pr-1 text-left"
                    style={{
                      borderLeft: themeConfig.leftBorder,
                      paddingLeft: "10px",
                      ...(dragProps("accessories").style as any),
                    }}
                  >
                    <div
                      className={`flex flex-col gap-1 w-full p-2 mb-2 border text-left ${themeConfig.blockRadius}`}
                      style={{
                        backgroundColor: themeConfig.blockBg,
                        borderColor: themeConfig.blockBorder,
                        transform: themeConfig.headerSkew,
                        transformOrigin: "left center"
                      }}
                    >
                      <span
                        className={`font-mono font-black tracking-widest uppercase ${themeConfig.blockText} ${
                          exportLayout === "left" || exportLayout === "right"
                            ? "text-[20px]"
                            : "text-[14px]"
                        }`}
                        style={{
                           transform: themeConfig.headerSkew !== "skewX(0deg)" ? "skewX(8deg)" : "none",
                           display: "inline-block"
                        }}
                      >
                        ACCESORIOS
                      </span>
                      {activeVariation.accessories.scheme && (
                        <div className="w-full flex mt-0.5">
                          <span
                            className={`font-mono font-black uppercase tracking-widest rounded px-1.5 py-0.5 whitespace-normal break-words text-left border ${themeConfig.schemeBadge} ${
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
                      className={`font-condensed font-bold leading-tight space-y-1.5 overflow-hidden text-left ${themeConfig.listColor} ${
                        exportLayout === "left" || exportLayout === "right"
                          ? "text-[26px]"
                          : "text-[19px]"
                      }`}
                      style={{ 
                        fontFamily: themeConfig.listFont,
                        textShadow: exportBgImage ? "0 2px 5px rgba(0,0,0,0.95)" : "none",
                      }}
                    >
                      {cleanedAccessories.map((item, idx) => {
                        const formattedItem = formatItemWithTeamVolume(item, teamSize);
                        return (
                          <li key={idx} className="flex items-start gap-2.5 text-left leading-tight">
                            <img
                              src="/logo.svg"
                              className="shrink-0 mt-1.5 w-3 h-3 object-contain"
                              style={{
                                filter: `drop-shadow(0 0 5px ${activeColorSet.color})`,
                              }}
                              alt="Logo"
                            />
                            <span
                              className="break-words min-w-0 text-left normal-case flex-1"
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formattedItem) }}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </motion.div>
                )}
              </div>

            </div>
          </motion.div>

          {/* FOOTER SEAL: branding + inspiration stamp (editable from the panel) */}
          <div
            className="flex justify-between items-center pt-5 mt-3 border-t pointer-events-none"
            style={{
              borderColor: exportBgImage
                ? "rgba(255,255,255,0.14)"
                : "rgba(0,0,0,0.08)",
            }}
          >
            <motion.span
              {...dragProps("footerSeal")}
              className={`font-mono text-[17px] font-black tracking-[0.4em] uppercase pointer-events-auto w-fit ${
                exportBgImage ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              NEXUS L4 // {currentWeek.toUpperCase()}
            </motion.span>
            <motion.span
              {...dragProps("footerInspiration")}
              className="font-mono text-[19px] font-black tracking-[0.28em] uppercase px-5 py-2.5 border rounded pointer-events-auto w-fit"
              style={{
                color: activeColorSet.color,
                borderColor: `${activeColorSet.color}59`,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                textShadow: `0 0 14px ${activeColorSet.color}80`,
                ...(dragProps("footerInspiration").style as any),
              }}
            >
              {(
                exportInspiration.trim() ||
                getDerivedInspiration(activeVariation.tabName)
              ).toUpperCase()}
            </motion.span>
          </div>
        </div>

      </div>
  );

  // Scaled-down live preview (used inside the IG Story editor panel)
  if (previewMode && !interactiveMode) {
    const PREVIEW_WIDTH = 270;
    const scale = PREVIEW_WIDTH / 1080;
    return (
      <div
        style={{
          width: `${PREVIEW_WIDTH}px`,
          height: `${Math.round(1920 * scale)}px`,
          overflow: "hidden",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.65)",
          pointerEvents: "none",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: "1080px",
            height: "1920px",
          }}
        >
          {card}
        </div>
      </div>
    );
  }

  // Interactive full-size mode (rendered inside a scaled container)
  if (interactiveMode) {
    return (
      <div
        style={{
          width: "1080px",
          height: "1920px",
          position: "relative",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        {card}
      </div>
    );
  }

  // Hidden off-screen template captured by html-to-image on export
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
      {card}
    </div>
  );
}
