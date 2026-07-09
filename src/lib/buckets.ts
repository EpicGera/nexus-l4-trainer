// Color por bucket para el pizarrón y el dashboard. Mono + un acento: la
// diferenciación real la dan el peso tipográfico y el borde, no 4 neones.
// Reemplaza el objeto BUCKET_COLOR neón que vivía inline en App.tsx.

import { BlockBucket } from "../types/workout";

export const BUCKET_COLOR: Record<BlockBucket, string> = {
  warmup: "#71717A",      // gris — preparación, bajo énfasis
  strength: "#FAFAFA",    // blanco — el trabajo principal
  metcon: "#DC2626",      // acento — el estímulo que define el día
  accessories: "#A1A1AA", // gris claro — soporte
};
