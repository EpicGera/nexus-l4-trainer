import { useState } from "react";

export function useBlockSwipe(
  activeVariation: any,
  activeBlockTab: string,
  setActiveBlockTab: (tab: any) => void,
  activeFlexKey: string,
  setActiveFlexKey: (key: string) => void,
  desktopLayout: string,
) {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [touchEndY, setTouchEndY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Solo permitir swipe si estamos en modo sidebar (que en mobile actúa como barra superior de tabs)
    if (desktopLayout !== "sidebar") return;
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
    setTouchEndX(null);
    setTouchEndY(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (desktopLayout !== "sidebar") return;
    setTouchEndX(e.targetTouches[0].clientX);
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (desktopLayout !== "sidebar" || touchStartX === null || touchEndX === null) return;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY !== null && touchEndY !== null ? touchStartY - touchEndY : 0;

    // Swipe debe ser marcadamente horizontal
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      const isSwipeLeft = diffX > 50; // swipe left -> block siguiente
      const isSwipeRight = diffX < -50; // swipe right -> block anterior

      if (activeVariation?.blocks?.length) {
        // Flexible blocks
        const flexBlocks = activeVariation.blocks;
        const currentIdx = flexBlocks.findIndex((b: any) => b.key === activeFlexKey);
        const activeIdx = currentIdx >= 0 ? currentIdx : 0;
        if (isSwipeLeft && activeIdx < flexBlocks.length - 1) {
          setActiveFlexKey(flexBlocks[activeIdx + 1].key);
        } else if (isSwipeRight && activeIdx > 0) {
          setActiveFlexKey(flexBlocks[activeIdx - 1].key);
        }
      } else {
        // Standard 4 blocks
        const blockTabs = ["warmup", "strength", "metcon", "accessories"] as const;
        const currentIdx = blockTabs.indexOf(activeBlockTab as any);
        if (isSwipeLeft && currentIdx < blockTabs.length - 1) {
          setActiveBlockTab(blockTabs[currentIdx + 1]);
        } else if (isSwipeRight && currentIdx > 0) {
          setActiveBlockTab(blockTabs[currentIdx - 1]);
        }
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
    setTouchEndX(null);
    setTouchEndY(null);
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
