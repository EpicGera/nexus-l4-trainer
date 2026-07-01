// Athlete bodyweight — feeds the derivation engine (bodyweight-movement work).
// Stored under a nexus_-prefixed key so it roams to Firestore per user.

const BW_KEY = "nexus_bodyweight_kg";
export const DEFAULT_BW = 75;

export function getBodyweightKg(): number {
  try {
    const v = parseFloat(localStorage.getItem(BW_KEY) || "");
    return v > 0 ? v : DEFAULT_BW;
  } catch {
    return DEFAULT_BW;
  }
}

export function setBodyweightKg(kg: number): void {
  try {
    if (kg > 0) {
      localStorage.setItem(BW_KEY, String(kg));
      window.dispatchEvent(new Event("nexus_logs_updated"));
    }
  } catch {
    /* storage restricted — ignore */
  }
}
