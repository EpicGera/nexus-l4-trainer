import { useState } from "react";

export function useLayoutState() {
  const [desktopLayout, setDesktopLayout] = useState<"sidebar" | "columns">(() => {
    return (localStorage.getItem("nexus_desktop_layout") as "sidebar" | "columns") || "columns";
  });

  const [headerHeight, setHeaderHeight] = useState<number>(115);

  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [scrollY, setScrollY] = useState(0);

  const [isExporting, setIsExporting] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showShareOverlay, setShowShareOverlay] = useState(false);
  const [shareData, setShareData] = useState<{ elementId: string; type: "day" | "block" } | null>(null);

  return {
    desktopLayout, setDesktopLayout,
    headerHeight, setHeaderHeight,
    mousePos, setMousePos,
    scrollY, setScrollY,
    isExporting, setIsExporting,
    showExportPanel, setShowExportPanel,
    showShareOverlay, setShowShareOverlay,
    shareData, setShareData
  };
}
