import { useState } from "react";

export function useSheetSwipe() {
  const [transitionDirection, setTransitionDirection] = useState<
    "left" | "right"
  >("right");

  // Multi-sheet paging states
  const [activeSheet, setActiveSheet] = useState<number>(0); // 0: Pizarrón Diario, 1: RPE & Progresiones, 2: Perfil y Telemetría, 3: Guerrero
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const handleNextSheet = () => {
    setTransitionDirection("right"); // "se moverá a la derecha"
    setActiveSheet((prev) => (prev + 1) % 4);
  };

  const handlePrevSheet = () => {
    setTransitionDirection("left"); // "la pantalla se moverá a la izquierda"
    setActiveSheet((prev) => (prev - 1 + 4) % 4);
  };

  const handleSetActiveSheetWithDirection = (index: number) => {
    if (index > activeSheet) {
      setTransitionDirection("right");
    } else if (index < activeSheet) {
      setTransitionDirection("left");
    }
    setActiveSheet(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const isSwipeLeft = distance > 75; // Swipe left -> go next page
    const isSwipeRight = distance < -75; // Swipe right -> go prev page

    if (isSwipeLeft) {
      handleNextSheet();
    } else if (isSwipeRight) {
      handlePrevSheet();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  return {
    activeSheet,
    transitionDirection,
    handleNextSheet,
    handlePrevSheet,
    handleSetActiveSheetWithDirection,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
