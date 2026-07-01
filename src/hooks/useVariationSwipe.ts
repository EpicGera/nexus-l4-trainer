import { useState, useEffect } from "react";

export function useVariationSwipe(
  currentWeek: string,
  currentDayIndex: number,
  activeDayVariationsCount: number,
) {
  const [currentVariationIndex, setCurrentVariationIndex] = useState<number>(0);

  // Variation swipe states
  const [variationTouchStartX, setVariationTouchStartX] = useState<
    number | null
  >(null);
  const [variationTouchStartY, setVariationTouchStartY] = useState<
    number | null
  >(null);
  const [variationTouchEndX, setVariationTouchEndX] = useState<number | null>(
    null,
  );
  const [variationTouchEndY, setVariationTouchEndY] = useState<number | null>(
    null,
  );

  const handleVariationTouchStart = (e: React.TouchEvent) => {
    // Stop propagation to avoid driving sheet swipe on parent elements
    e.stopPropagation();
    setVariationTouchStartX(e.targetTouches[0].clientX);
    setVariationTouchStartY(e.targetTouches[0].clientY);
    setVariationTouchEndX(null);
    setVariationTouchEndY(null);
  };

  const handleVariationTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    setVariationTouchEndX(e.targetTouches[0].clientX);
    setVariationTouchEndY(e.targetTouches[0].clientY);
  };

  const handleVariationTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (variationTouchStartX === null || variationTouchEndX === null) return;
    const diffX = variationTouchStartX - variationTouchEndX;
    const diffY =
      variationTouchStartY !== null && variationTouchEndY !== null
        ? variationTouchStartY - variationTouchEndY
        : 0;

    // Validate that the swipe is primarily horizontal
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      const isSwipeLeft = diffX > 50; // Swipe left -> next variation
      const isSwipeRight = diffX < -50; // Swipe right -> prev variation

      const numVariations = activeDayVariationsCount;
      if (numVariations > 1) {
        if (isSwipeLeft) {
          setCurrentVariationIndex((prev) => (prev + 1) % numVariations);
        } else if (isSwipeRight) {
          setCurrentVariationIndex(
            (prev) => (prev - 1 + numVariations) % numVariations,
          );
        }
      }
    }
    setVariationTouchStartX(null);
    setVariationTouchStartY(null);
    setVariationTouchEndX(null);
    setVariationTouchEndY(null);
  };

  // Reset variation index on day or week change
  useEffect(() => {
    setCurrentVariationIndex(0);
  }, [currentWeek, currentDayIndex]);

  return {
    currentVariationIndex,
    setCurrentVariationIndex,
    handleVariationTouchStart,
    handleVariationTouchMove,
    handleVariationTouchEnd,
  };
}
