/**
 * L4 Dynamic RPE Suggester: mapea %1RM a un RPE sugerido en la escala CF-L4.
 */
export function getSuggestedRpe(
  weightInput: string,
  maxWeight: number,
): { rpe: string; percentage: number } | null {
  if (!weightInput || maxWeight <= 0) return null;
  const cleanWeight = parseFloat(weightInput.replace(/[^0-9.-]/g, ""));
  if (isNaN(cleanWeight) || cleanWeight <= 0) return null;

  const percentage = Math.round((cleanWeight / maxWeight) * 100);

  // CF-L4 / PRVN / HWPO Scientific Intensity Scale mapping
  let suggestedRpe = "8";
  if (percentage >= 105) suggestedRpe = "10"; // PR Overload!
  else if (percentage >= 100) suggestedRpe = "10";
  else if (percentage >= 95) suggestedRpe = "9.5";
  else if (percentage >= 90) suggestedRpe = "9";
  else if (percentage >= 85) suggestedRpe = "8.5";
  else if (percentage >= 80) suggestedRpe = "8";
  else if (percentage >= 75) suggestedRpe = "7.5";
  else if (percentage >= 70) suggestedRpe = "7";
  else if (percentage >= 65) suggestedRpe = "6.5";
  else if (percentage >= 60) suggestedRpe = "6";
  else if (percentage >= 50) suggestedRpe = "5";
  else suggestedRpe = "4";

  return { rpe: suggestedRpe, percentage };
}

