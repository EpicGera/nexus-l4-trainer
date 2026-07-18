// Color por bucket para el pizarrón y el dashboard. Mono + un acento: la
// diferenciación real la dan el peso tipográfico y el borde, no 4 neones.
// Reemplaza el objeto BUCKET_COLOR neón que vivía inline en App.tsx.

import { BlockBucket } from "../types/workout";

// Tokens de DESIGN.md, no hex sueltos: mismo mapeo mono+acento, ahora
// trazable a --color-label / --color-ink / --color-sem-red.
export const BUCKET_COLOR: Record<BlockBucket, string> = {
  warmup: "var(--color-ink-faint)",  // gris — preparación, bajo énfasis
  strength: "var(--color-ink)",      // blanco — el trabajo principal
  metcon: "var(--color-sem-red)",    // acento — el estímulo que define el día (intensidad)
  accessories: "var(--color-label)", // gris claro — soporte
};
