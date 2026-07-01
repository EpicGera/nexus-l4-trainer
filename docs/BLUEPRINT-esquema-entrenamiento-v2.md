# Blueprint — Redefinición del esquema de entrenamiento (v2)

> Motivado por la enciclopedia `docs/NEXUSL4V7.MD` (Working Max, Doble Progresión, Time
> Caps como escudo, intención de bloque, sistemas energéticos, matriz de sustitución,
> Engranajes) y por la necesidad de **importar programas con estructuras de bloques
> distintas** a la fija de 4 (ej. el "capítulo 2" estilo competidor con `b1_warmup`,
> `b2_skill`, `b3_strength`, `b4_metcon`, `b5_accessories`, `b4_grunt`, `b3_finisher`…).

Este documento es el contrato de la redefinición. Cada fase es backward-compatible: los
programas viejos (4 bloques fijos) siguen funcionando sin cambios.

---

## Fase A — Bloques flexibles y ordenados  ✅ HECHO (import + render nativo)

**Hecho:**
- `src/types/workout.ts`: nuevo `ProgramBlock { key, title, scheme, items, bucket }` y
  `DayVariation.blocks?: ProgramBlock[]` (opcional, canónico cuando existe).
- `src/lib/sheetImport.ts`: `parseJsonToDatabase` extrae **cualquier** bloque (`bN_*` o las
  4 claves fijas), preserva el orden (por número de prefijo `bN_`), y **deriva las 4 lanes
  legacy** (mergeando ítems) para no romper tablero/export/wizard/engine.
  - `bucketForBlock(key,title)`: skill/halterofilia/gimnasia → `strength`; grunt/finisher/
    armadura → `accessories`; flush/boss/run/row → `metcon`; warmup/movilidad → `warmup`.
- `summarizeDatabase` cuenta `blocks[]` cuando existe.
- Tests: `src/lib/flexibleBlocks.test.ts` (import del capítulo-2, orden, bucketing, legacy intacto).

**Render nativo (HECHO):**
- `WorkoutBlockCard.tsx`: ahora acepta `block?: ProgramBlock` + `keySuffix?` opcionales.
  Cuando vienen, renderiza ese bloque (tema por `blockType`=bucket) con keys únicas para
  timer/accordion (dos bloques pueden compartir bucket). Sin `block` → camino legacy intacto.
- `App.tsx`: helper `renderBlockCard(b, isColumns)` (icono/fondo por bucket). Cuando
  `activeVariation.blocks?.length`: layout columnas mapea los bloques en grid; layout sidebar
  los apila en orden. Si no hay `blocks[]`, las 4 renderers legacy y las 4 tabs siguen igual.
- Verificado en preview: programa flexible → 5 bloques nativos en orden (columnas y sidebar);
  programa legacy → 4 bloques intactos; sin errores de consola.

**Pendiente menor (Fase A-polish, opcional):** en el layout sidebar flexible no hay tabs ni
botones de export (se muestran apilados); el logging por bloque sigue siendo por ejercicio.
Export/Share/Wizard siguen leyendo las 4 lanes derivadas hasta migrarlos.

---

## Fase B — Intención de bloque y Engranaje (periodización declarada)  ✅ HECHO

- `types/workout.ts`: `BlockIntention` canónico (acumulacion/intensificacion/realizacion/
  restauracion — mismos valores que chapterCreator) + `WeekMeta { intention?, gear?, inferred? }`
  + `WeekPlan.meta?`.
- `sheetImport.ts`: acepta `w1: { meta: { intention, gear }, days: [...] }`. `normalizeIntention`
  con alias (deload→restauracion, peak→realizacion…); `inferWeekIntention` (scan de títulos +
  schemes) cuando no hay meta, marcando `inferred:true`; `gear` clamped 1–5. Backward-compatible.
- `lib/blockMeta.ts`: `INTENTION_META` (label/short/color) + `GEAR_LABEL`.
- `App.tsx`: el indicador de semana (`#uiWeekIndicator`) ahora usa `meta.intention` real (con
  color + marca "auto" si inferida) y un chip de Gear; cae al default hardcodeado si no hay meta.
- Tests: `src/lib/weekMeta.test.ts`. Verificado en preview (explícita realizacion+gear4; inferida deload·auto).

---

## Fase C — Working Max (resolución de `% WM`)  ✅ HECHO

- `src/lib/workingMax.ts`: store `nexus_athlete_1rm` (syncable), `getWorkingMax` (0.9·1RM),
  `parseWmPct` (exige token `WM`, ignora `%` sin WM y kg absolutos), `resolveWmRange(scheme,
  exerciseName)` (resuelve vía `resolveOrInfer` + WM → rango kg), `wmRangeLabel`. Tests:
  `src/lib/workingMax.test.ts`.
- `ProfileModal.tsx`: sección "MARCAS DE FUERZA (1RM) // WORKING MAX" — inputs por
  `MAIN_LIFTS`, muestra WM debajo. Escribe live (dispatch `nexus_logs_updated`).
- `WorkoutBlockCard.tsx`: chip `≈ X–Y kg` (`.cue.wm-chip`, acento electric-blue) al lado del
  ejercicio cuando el scheme del bloque tiene `% WM` y hay 1RM. Sin 1RM → no aparece.
- Verificado en preview: Front Squat 1RM 100 + `4x6 @ 65-70% WM` → `≈ 58.5–63 kg`; sin 1RM, sin chip.
- Pendiente opcional: autopoblar 1RM desde logs vía `trainingEngine.estimate1RM` (Epley).

---

## Fase D — Metadata por bloque (sistema energético, dominio de tiempo, Time Cap)  ✅ HECHO

- `types/workout.ts`: `EnergySystem` + `BlockTimeDomain` + campos opcionales en `ProgramBlock`:
  `capSec?`, `timeDomain?`, `energySystem?`.
- `sheetImport.ts`: `deriveBlockMeta(bucket, scheme)` — `parseCapMin` (Cap N / Cap N:MM),
  `schemeDurationMin` (AMRAP/EMOM/intervalos on-off×rondas/Cap/rango/N MIN), `toTimeDomain`
  (umbrales de trainingEngine), `deriveEnergySystem` (Zona/continuo/flush→oxidative; si no,
  por dominio: sprint/short→glycolytic, medium→mixed, long→oxidative). Solo deriva
  timeDomain/energySystem para bucket `metcon`; `capSec` para cualquier bloque con Cap.
  Aplicado en `extractBlocks`. Nunca fabrica datos.
- `lib/blockMeta.ts`: `ENERGY_META` + `TIMEDOMAIN_LABEL`.
- `WorkoutBlockCard.tsx`: fila de chips (dominio · sistema energético coloreado · `CAP N′` ámbar)
  solo para bloques flexibles que traen la metadata.
- Tests: `src/lib/blockDerivedMeta.test.ts`. Verificado en preview (For Time cap 20 → LARGO·OXIDATIVO·CAP 20′).
- Pendiente opcional: `scalingHint`/matriz de sustitución (cap. 45B).

---

## Fase E — Modelo de análisis y atleta  ✅ HECHO (cobertura del espectro)

- `src/lib/programCoverage.ts`: `programCoverage(db)` → cuenta los bloques metcon por
  `energySystem` y `timeDomain` (metadata Fase D), detecta huecos (sistemas puros sin exposición
  + dominios vacíos; "mixto" excluido de huecos). Tests: `programCoverage.test.ts`.
- `TrainingAnalysis.tsx`: nueva card "COBERTURA DEL ESPECTRO (PRVN)" — barras por sistema
  energético (color), grilla de dominios, línea de "Huecos". Recibe `database` (App la pasa).
  Renderiza incluso sin sesiones (es del plan); null en programas legacy sin `blocks[]`.
- Verificado en preview: 3 metcons (medium/mixed, long/oxidative, short/glycolytic) → huecos
  detectados = FOSFÁGENO · SPRINT.

## Pendientes — TODOS HECHOS ✅ (2026-06-19)

- **Autopoblar 1RM desde logs (Epley):** `workingMax.estimateOneRepMaxesFromLogs()` (max Epley
  por exerciseId sobre `loadSessions`). ProfileModal: botón "⚡ Estimar 1RM desde mis logs"
  (completa vacíos) + hint clickeable "logs ≈N" por levantamiento. Tests `estimateOneRm.test.ts`.
- **Matriz de sustitución (cap. 45B):** `lib/substitution.ts` (ratios Carrera 1.0 = Remo/Ski 1.25 =
  Bike 2.0; cal; shuttle) + `SubstitutionCard` (conversor interactivo + subs de gimnasia) en
  TrainingAnalysis. Tests `substitution.test.ts`.
- **Sidebar flexible con tabs + export:** la sidebar flexible pasó de apilada a tabbed (tabs por
  bloque coloreadas por bucket, un bloque activo por vez vía `activeFlexKey`) + `renderDayExportActions()`
  reutilizable. Verificado: cambia de bloque, con export.
- **Tight Grouping (cap. 43):** `lib/tightGrouping.ts` (parse mm:ss, SD/CV, veredicto élite/sólida/
  aceptable/dispersa) + `TightGroupingCard` (herramienta de coach, sin tocar logging). Tests
  `tightGrouping.test.ts`. Verificado (élite vs dispersa).

Suite: 205 tests. Arco v2 + todos los pendientes cerrados.

### Cierre final (2026-06-20)

- **Splits por ronda (Tight Grouping automático):** `MetconResult.splits?: number[]`. El wizard
  (SessionWizard) tiene un campo "Tiempos por ronda (opcional)" en el step de metcon → `parseSplits`
  → `metcon.splits` al sellar (≥2). `TrainingAnalysis` recolecta sesiones con splits y muestra la
  card "AGRUPACIÓN REGISTRADA" (veredicto por sesión vía `tightGrouping`). La `TightGroupingCard`
  manual sigue para cálculos ad-hoc. Verificado: élite (112–114) y dispersa (100–145).
- **DRY export actions:** `renderDayExportActions(columns?)` es la única fuente; reemplazó las 2
  copias inline (sidebar legacy + columnas) y la usa también la sidebar flexible. Cambio visual
  mínimo en columnas (+FOTO sin div wrapper). Verificado en ambos layouts.

---

## Compatibilidad y secuencia

- **Backward-compat**: `blocks[]`, `meta`, y la metadata por bloque son TODAS opcionales. Un
  programa de 4 bloques sin nada de esto se comporta exactamente como antes.
- **Orden sugerido**: A-render → C (Working Max, alto valor visible) → B (intención) →
  D (metadata metcon) → E (análisis). Cada una entra detrás de tests + deploy.
- **Fuente de verdad del formato**: `docs/GUIA-generar-programa-IA-externa.md` (§2.4) +
  `src/lib/flexibleBlocks.test.ts` como prueba viva del importador.
