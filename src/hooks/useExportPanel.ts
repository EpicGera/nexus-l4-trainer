import { useState, useEffect, useRef } from "react";
import { AthleteState } from "../types/workout";
import {
  handleMonthTextExport as serviceMonthTextExport,
  handleExportGoogleSheets as serviceExportGoogleSheets,
  handleBatchPDFExport as serviceBatchPDFExport,
  handleGenerateMonthlyReportPDF as serviceGenerateMonthlyReportPDF,
  handleExportDayJPG as serviceExportDayJPG,
  handleExportLocalHistory as serviceExportLocalHistory,
  handleExportLocalHistoryCSV as serviceExportLocalHistoryCSV,
  handleExportDayMarkdown as serviceExportDayMarkdown,
} from "../lib/exportService";

export function useExportPanel(
  athlete: AthleteState,
  currentWeek: string,
  completedDays: Record<string, boolean>,
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
  const [exportPhotoFilter, setExportPhotoFilter] = useState<"none" | "vibrant" | "grayscale" | "sepia" | "duotone">("none");
  const [exportCardHeightLimit, setExportCardHeightLimit] = useState<number>(65);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [blockPositions, setBlockPositions] = useState<{ [key: string]: { x: number; y: number } }>({});
  const [previewScale, setPreviewScale] = useState(1);

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

  const handleExportDayJPG = () => {
    if (!activeDay || !activeVariation) return;
    serviceExportDayJPG(activeDay, activeVariation, currentWeek, setIsExportingJPG);
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
  };
}
