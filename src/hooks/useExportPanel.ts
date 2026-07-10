import { useState, useEffect, useRef } from "react";
import { toPng } from "html-to-image";
import { Capacitor } from "@capacitor/core";
import { AthleteState } from "../types/workout";
import { applyPersonFx } from "../lib/personFx";
import { renderStoryVideo, type StoryEffect, type StoryFx } from "../lib/videoExport";
import type { DayStatus } from "../lib/storageKeys";

export type PhotoFilter = "none" | "vibrant" | "grayscale" | "sepia" | "duotone" | "silueta" | "neon";
import {
  handleMonthTextExport as serviceMonthTextExport,
  handleExportGoogleSheets as serviceExportGoogleSheets,
  handleBatchPDFExport as serviceBatchPDFExport,
  handleGenerateMonthlyReportPDF as serviceGenerateMonthlyReportPDF,
  handleExportDayJPG as serviceExportDayJPG,
  handleShareVideo as serviceShareVideo,
  handleExportLocalHistory as serviceExportLocalHistory,
  handleExportLocalHistoryCSV as serviceExportLocalHistoryCSV,
  handleExportDayMarkdown as serviceExportDayMarkdown,
  emitToast,
} from "../lib/exportService";

export function useExportPanel(
  athlete: AthleteState,
  currentWeek: string,
  completedDays: Record<string, DayStatus>,
  activeDay: any,
  activeVariation: any,
) {
  const [isExportingJPG, setIsExportingJPG] = useState(false);
  const [isExportingSheets, setIsExportingSheets] = useState(false);
  // STORY share menu: photo + customization are folded behind this toggle so the
  // default export row is just the clean STORY button (Fase 7).
  const [showStoryMenu, setShowStoryMenu] = useState(false);
  const [exportBgImage, setExportBgImage] = useState<string | null>(null);
  const [exportLayout, setExportLayout] = useState<"center" | "left" | "right">("center");
  const [exportVerticalLayout, setExportVerticalLayout] = useState<"top" | "center" | "bottom">("center");
  const [exportCardWidth, setExportCardWidth] = useState<"compact" | "standard" | "wide">("standard");
  const [exportAthleteName, setExportAthleteName] = useState(athlete.identity);
  const [exportInspiration, setExportInspiration] = useState("MASTER L4 · MODO RX");
  const [exportCardBlur, setExportCardBlur] = useState(true);
  const [exportCardOpacity, setExportCardOpacity] = useState(85);
  const [exportTheme, setExportTheme] = useState("nexus"); // nexus·cyberpunk·monochrome·wodfrg·brutalist·synthwave·editorial·holo
  const [exportPhotoFilter, setExportPhotoFilter] = useState<PhotoFilter>("none");
  const [isFxProcessing, setIsFxProcessing] = useState(false);
  // la foto ORIGINAL se guarda aparte: los FX de personas (silueta/neon)
  // pre-procesan en canvas y reemplazan exportBgImage; volver a un filtro CSS
  // restaura el original
  const bgOriginalRef = useRef<string | null>(null);
  const [exportCardHeightLimit, setExportCardHeightLimit] = useState<number>(65);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [blockPositions, setBlockPositions] = useState<{ [key: string]: { x: number; y: number } }>({});
  const [previewScale, setPreviewScale] = useState(1);

  // Selector explícito de variación para la Story: null = seguir la pestaña
  // activa; si el usuario elige ESPECIAL, la Story sale de ese día.
  const [storyVariationTab, setStoryVariationTab] = useState<string | null>(null);
  const storyVariation =
    (storyVariationTab && activeDay?.variations?.find((v: any) => v.tabName === storyVariationTab)) ||
    activeVariation;
  // reset al cambiar de día
  useEffect(() => {
    setStoryVariationTab(null);
    clearVideoBg();
  }, [activeDay?.id]);

  // ── Story VIDEO (Fase A) ──
  const [videoMode, setVideoMode] = useState(false);
  const [videoEffect, setVideoEffect] = useState<StoryEffect>("kenburns");
  // Efectos opcionales combinables (destellos/shake por beat, stardust, glitch 70s).
  const [videoFx, setVideoFx] = useState<StoryFx>({});
  const toggleVideoFx = (k: keyof StoryFx) =>
    setVideoFx((prev) => ({ ...prev, [k]: !prev[k] }));
  const [videoDurationSec, setVideoDurationSec] = useState<10 | 15>(10);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioName, setAudioName] = useState<string | null>(null);
  const [audioOffsetSec, setAudioOffsetSec] = useState(0);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  // Clip de video de FONDO (opcional). Guardamos el File (para decodificar su
  // audio), un object URL en ref (para revoke) y en estado (para los previews),
  // y la duración sondeada del clip.
  const [videoBgFile, setVideoBgFile] = useState<File | null>(null);
  const [videoBgName, setVideoBgName] = useState<string | null>(null);
  const [videoBgUrl, setVideoBgUrl] = useState<string | null>(null);
  const [videoBgDurationSec, setVideoBgDurationSec] = useState<number | null>(null);
  const videoBgUrlRef = useRef<string | null>(null);

  // Duración efectiva del export con clip: la del clip, con tope de 15s.
  const CLIP_MAX_SEC = 15;
  const clipExportSec = Math.min(videoBgDurationSec ?? CLIP_MAX_SEC, CLIP_MAX_SEC);

  const clearVideoBg = () => {
    if (videoBgUrlRef.current) { URL.revokeObjectURL(videoBgUrlRef.current); videoBgUrlRef.current = null; }
    setVideoBgFile(null);
    setVideoBgName(null);
    setVideoBgUrl(null);
    setVideoBgDurationSec(null);
  };
  const handleVideoBgFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (videoBgUrlRef.current) URL.revokeObjectURL(videoBgUrlRef.current);
    const url = URL.createObjectURL(file);
    videoBgUrlRef.current = url;
    setVideoBgFile(file);
    setVideoBgName(file.name);
    setVideoBgUrl(url);
    setVideoBgDurationSec(null);
    // sondear la duración del clip
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      // ponytail: algunos webm (p.ej. de captureStream) reportan duración basura
      // (0/Infinity) hasta un seek; solo aceptamos una lectura plausible.
      if (Number.isFinite(probe.duration) && probe.duration >= 0.5) {
        setVideoBgDurationSec(probe.duration);
      }
    };
    probe.src = url;
  };
  // Limpiar el object URL al desmontar.
  useEffect(() => () => { if (videoBgUrlRef.current) URL.revokeObjectURL(videoBgUrlRef.current); }, []);

  const handleAudioFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const arrayBuf = await file.arrayBuffer();
      const ctx = new AudioContext();
      const decoded = await ctx.decodeAudioData(arrayBuf);
      await ctx.close();
      setAudioBuffer(decoded);
      setAudioName(file.name);
      setAudioOffsetSec(0);
    } catch {
      emitToast("❌ No se pudo leer el audio (formato no soportado).", "error");
    }
  };

  const handleExportDayVideo = async () => {
    if (!activeDay || !storyVariation) return;
    setIsExportingVideo(true);
    setVideoProgress(0);
    try {
      try { await (document as any).fonts?.ready; } catch { /* captura igual */ }
      await new Promise((r) => setTimeout(r, 300));
      const node = document.getElementById("nexus-share-card-temp");
      if (!node) { emitToast("❌ No se encontró la plantilla de exportación.", "error"); return; }
      const overlayPng = await toPng(node, {
        width: 1080, height: 1920, pixelRatio: 1,
        style: { transform: "scale(1)", transformOrigin: "top left", width: "1080px", height: "1920px" },
      });

      // Audio: la música local manda; si no hay y hay clip, se usa el audio del clip.
      let audio = audioBuffer ? { buffer: audioBuffer, offsetSec: audioOffsetSec } : undefined;
      if (!audio && videoBgFile) {
        try {
          const ctx = new AudioContext();
          const decoded = await ctx.decodeAudioData(await videoBgFile.arrayBuffer());
          await ctx.close();
          audio = { buffer: decoded, offsetSec: 0 };
        } catch { /* clip sin pista de audio decodificable → video mudo */ }
      }

      // Los efectos de beat necesitan audio: si no hay, se ignoran silenciosamente.
      const fx: StoryFx = {
        beatFlash: videoFx.beatFlash && !!audio,
        beatShake: videoFx.beatShake && !!audio,
        stardust: videoFx.stardust,
        retro70s: videoFx.retro70s,
      };
      const { blob, ext } = await renderStoryVideo({
        overlayPng,
        effect: videoEffect,
        // con clip: dura lo que dura el clip (tope 15s); sin clip: selector 10/15
        durationSec: videoBgFile ? clipExportSec : videoDurationSec,
        audio,
        videoBg: videoBgFile && videoBgUrlRef.current ? { url: videoBgUrlRef.current } : undefined,
        fx,
        onProgress: setVideoProgress,
      });
      await serviceShareVideo(blob, ext, activeDay, currentWeek);
    } catch (err: any) {
      emitToast("❌ Error al generar el video: " + (err?.message ?? String(err)), "error", 8000);
    } finally {
      setIsExportingVideo(false);
      setVideoProgress(0);
    }
  };

  useEffect(() => {
    const updateScale = () => {
      const scaleW = window.innerWidth / 1150;
      const scaleH = window.innerHeight / 2050;
      setPreviewScale(Math.min(scaleW, scaleH));
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [isFullscreenPreview]);

  const exportFileInputRef = useRef<HTMLInputElement>(null);

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

  const fxToast = (message: string, kind: "success" | "error" = "error") =>
    window.dispatchEvent(new CustomEvent("nexus_toast", { detail: { message, kind, durationMs: 5000 } }));

  const runPersonFx = async (source: string, mode: "silueta" | "neon") => {
    setIsFxProcessing(true);
    try {
      setExportBgImage(await applyPersonFx(source, mode));
    } catch (err: any) {
      fxToast(err?.message || "No se pudo aplicar el efecto");
      setExportBgImage(source);
      setExportPhotoFilter("none");
    } finally {
      setIsFxProcessing(false);
    }
  };

  const ingestPhoto = (dataUrl: string) => {
    bgOriginalRef.current = dataUrl;
    if (exportPhotoFilter === "silueta" || exportPhotoFilter === "neon") {
      void runPersonFx(dataUrl, exportPhotoFilter);
    } else {
      setExportBgImage(dataUrl);
    }
  };

  /** Mismo nombre de API que antes: los FX de personas procesan async, el resto restaura el original. */
  const selectPhotoFilter = (f: PhotoFilter) => {
    setExportPhotoFilter(f);
    const original = bgOriginalRef.current;
    if (!original) return;
    if (f === "silueta" || f === "neon") void runPersonFx(original, f);
    else setExportBgImage(original);
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        ingestPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Tomar la foto con la app: nativo → plugin de cámara; web → input capture.
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const handleTakePhoto = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
        const photo = await Camera.getPhoto({
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
          quality: 90,
        });
        if (photo.dataUrl) ingestPhoto(photo.dataUrl);
      } catch {
        /* cámara cancelada/denegada — sin drama */
      }
    } else {
      cameraInputRef.current?.click();
    }
  };

  const handleExportDayJPG = () => {
    if (!activeDay || !storyVariation) return;
    serviceExportDayJPG(activeDay, storyVariation, currentWeek, setIsExportingJPG);
  };

  const handleExportDayMarkdown = () => {
    if (!activeDay || !activeVariation) return;
    serviceExportDayMarkdown(activeDay, activeVariation, currentWeek, athlete);
  };

  const handleExportLocalHistory = () => {
    serviceExportLocalHistory();
  };

  const handleExportLocalHistoryCSV = (context?: {
    dayName?: string;
    dayTitle?: string;
  }) => {
    serviceExportLocalHistoryCSV(context);
  };

  return {
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
    setExportPhotoFilter: selectPhotoFilter,
    isFxProcessing,
    cameraInputRef,
    handleTakePhoto,
    exportCardHeightLimit,
    setExportCardHeightLimit,
    isFullscreenPreview,
    setIsFullscreenPreview,
    blockPositions,
    setBlockPositions,
    previewScale,
    setPreviewScale,
    storyVariation,
    storyVariationTab,
    setStoryVariationTab,
    videoMode,
    setVideoMode,
    videoEffect,
    setVideoEffect,
    videoFx,
    toggleVideoFx,
    videoDurationSec,
    setVideoDurationSec,
    audioName,
    audioBuffer,
    audioOffsetSec,
    setAudioOffsetSec,
    handleAudioFile,
    videoBgFile,
    videoBgName,
    videoBgUrl,
    videoBgDurationSec,
    clipExportSec,
    handleVideoBgFile,
    clearVideoBg,
    isExportingVideo,
    videoProgress,
    handleExportDayVideo,
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
  };
}
