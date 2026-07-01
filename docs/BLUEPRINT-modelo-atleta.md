# Blueprint — Nexus L4: pivot Firestore-native + modelo de datos completo (input mínimo)

> Documento de diseño para revisión. Identificadores de código en inglés (consistencia con
> el codebase); prosa en español. Filosofía rectora: **el atleta ingresa lo mínimo; la riqueza
> se autoría (catálogo) y se deriva (fórmulas).** Nada se compra, todo se entrena.

## Orden de ejecución

| Fase | Qué | Estado |
|---|---|---|
| **1** | Default = plantilla limpia, no leer hoja salvo opt-in, roaming cross-device | ✅ desplegada |
| **1.5** | Purga de fugas: `exportService`/`historyUtils` usan el programa vivo; `workouts.ts` ya no se bundlea | ✅ desplegada |
| **2** | Sacar el scope `spreadsheets` del login → permiso on-demand | ✅ desplegada |
| **3** | Modelo de datos completo + input mínimo (CrossFit-específico) | ⏳ tras revisión de este doc |

---

## Fase 2 — Permiso de Sheets on-demand (spec)

**Objetivo:** el login por defecto pide solo identidad (sin fricción). El scope `spreadsheets` se
solicita únicamente cuando el atleta usa una función de Sheets (vincular hoja / exportar).

- `firebase.ts`: quitar `googleProvider.addScope('…/spreadsheets')` del provider por defecto y
  el `scopes:[SHEETS_SCOPE]` del login nativo. El login queda con scopes básicos (perfil/email).
- Nueva función `requestSheetsAccess(): Promise<string|null>` — reauth incremental que agrega el
  scope `spreadsheets` y devuelve el access token. En web: `signInWithPopup` con un provider que
  tiene el scope. En nativo: `signInWithGoogle({ scopes:[SHEETS_SCOPE], useCredentialManager:false })`.
- Llamadas: `fetchWorkoutsFromSheet`, `exportToGoogleSheets`, `handleLinkSheet` piden el token vía
  `getAccessToken() ?? requestSheetsAccess()` justo antes de la operación.
- Resultado: usuario nuevo entra sin pantalla de permisos de Google; solo la ve quien opta por Sheets.
- Verificación: login limpio sin prompt de permisos; export sigue funcionando tras `requestSheetsAccess`.

---

## Fase 3 — Modelo completo + input mínimo (CrossFit-específico)

### 3.0 Principio: por qué "completo" no carga al atleta
El atleta toca lo mismo en el modelo MVP o en el completo. La diferencia es cuánto pre-cargamos y
derivamos. Las tres fuentes de riqueza que el atleta NO toca:
1. **Catálogo de movimientos** (etiquetado una vez).
2. **La prescripción / WOD** (ya codifica reps, %carga, dominio temporal, formato).
3. **Motor de derivación** (fórmulas).

### 3.1 Fundamento CrossFit (lo que el modelo debe medir)
- **10 habilidades** físicas: cardio-respiratoria, stamina, fuerza, flexibilidad, potencia,
  velocidad, coordinación, agilidad, equilibrio, precisión.
- **3 sistemas energéticos**: fosfágeno (<10 s), glucolítico (~10 s–2 min), oxidativo (>2 min).
- **3 modalidades** M/G/W: Monoestructural (cardio), Gimnástico, Halterofilia.
- **Moneda universal = TRABAJO y POTENCIA.** Intensidad = potencia media = (fuerza·distancia)/tiempo.
  Es lo único que compara a través de las 3 dimensiones (un Fran y un 5RM se comparan en potencia).

### 3.2 Catálogo de movimientos (autoría única, compartido)
Bundleado como JSON + tipos; override/extensión por Firestore. Borrador inicial generable por IA,
curado por coach.

```ts
type Modality = "M" | "G" | "W";
type Pattern =
  | "squat" | "hinge" | "horizontal-push" | "vertical-push"
  | "horizontal-pull" | "vertical-pull" | "carry" | "core"
  | "olympic" | "monostructural" | "gymnastics-skill";
type GeneralSkill =
  | "cardio" | "stamina" | "strength" | "flexibility" | "power"
  | "speed" | "coordination" | "agility" | "balance" | "accuracy";
type WorkModel = "load-displacement" | "erg-calories" | "distance" | "bodyweight" | "none";

interface Exercise {
  id: string;                 // slug canónico, ej. "barbell-back-squat"
  name: string;               // display
  aliases: string[];          // para mapear nombres libres (migración)
  modality: Modality;
  pattern: Pattern;
  loadType: "external" | "bodyweight" | "bodyweight+load" | "machine" | "timed" | "distance";
  unilateral: boolean;
  skills: GeneralSkill[];     // subconjunto de las 10 que estresa
  // modelo de trabajo:
  workModel: WorkModel;
  displacementM?: number;     // ROM por rep (external / bodyweight)
  bodyweightFraction?: number;// fracción de BW desplazada (gimnástico), ej. pull-up ~1.0, air squat ~0.85
}
```

Ejemplos:
```jsonc
{ "id":"barbell-back-squat","name":"Back Squat","modality":"W","pattern":"squat",
  "loadType":"external","skills":["strength","power"],"workModel":"load-displacement","displacementM":0.5 }
{ "id":"pull-up","name":"Pull-up","modality":"G","pattern":"vertical-pull",
  "loadType":"bodyweight+load","skills":["strength","coordination"],"workModel":"bodyweight",
  "bodyweightFraction":1.0,"displacementM":0.6 }
{ "id":"row-erg","name":"Row (erg)","modality":"M","pattern":"monostructural",
  "loadType":"machine","skills":["cardio","stamina"],"workModel":"erg-calories" }
```

### 3.2.1 El catálogo es ABIERTO (open-world) — nunca rompe
El catálogo NO es cerrado ni un portero. Principio: **el logueo nunca depende del catálogo.** Un
`LoggedSet` guarda siempre `exerciseName` + los números, exista o no la entrada. El catálogo solo
*enriquece* el análisis. Cuando llega un movimiento nuevo (ej. el Capítulo 2 / Acto II que todavía no
existe):
1. `resolveExercise(name)` busca por id/nombre/alias (exacto + fuzzy). Si pega → análisis completo.
2. Si NO pega → `resolveOrInfer(name, ctx)` **infiere** modalidad/patrón/skills desde el nombre + el
   contexto del bloque (warmup/strength/metcon, ¿llevó carga?), y lo marca `source:"inferred"`,
   `confidence:"low"`. **Nunca devuelve null, nunca crashea.**
3. La inferencia es **honesta**: `workModel` por defecto = `"none"` → no inventa trabajo/potencia para un
   movimiento desconocido. Lo que NO necesita taxonomía sigue andando (volumen kg = peso×reps, RPE,
   carga sRPE, e1RM). Solo el trabajo por desplazamiento y un split M/G/W *confiable* esperan una entrada real.
4. El análisis muestra los inferidos como **"sin clasificar"** en los desgloses taxonómicos (no los mete
   mal en una categoría). El atleta/coach ve qué falta clasificar.

**Cómo crece el catálogo (sin release de código):**
- **Overrides por usuario/coach** en `users/{uid}/catalog/{exerciseId}` (ver §3.3). Catálogo efectivo = núcleo
  bundleado ∪ overrides. Un movimiento nuevo se agrega/corrige al instante y roamea por Firestore.
- **Onboarding de catálogo por programa:** al cargar un mes nuevo, los movimientos sin match se encolan;
  el coach/IA genera sus entradas (igual que se autoró el núcleo) y se curan.
- **Clasificar en 1–2 toques** desde la UI cuando aparece un "sin clasificar" (M/G/W + patrón) → escribe un
  override de usuario. Opcional.

Implementado en `src/data/exerciseCatalog.ts` (`resolveExercise`/`inferExercise`/`resolveOrInfer`) con tests.

### 3.3 Esquema Firestore (por usuario)
```
users/{uid}/
  profile/main         → { identity, levelTitle, knownOneRm:Record<exId,kg>, units, ... }
  profile/bodyweight/{date} → { kg, date }            // o array en main
  profile/stats        → derivado (extiende athleteStats actual; ver 3.4)
  program/current      → Database (el plan; ya roamea vía nexus_workouts_override)
  program/history/{id} → snapshots de planes anteriores

  sessions/{sessionId} → {
    date,            // ISO real (primera clase)
    dayId, programWeek, completed,
    durationMin|null,
    sessionRpe|null,            // 0..10 (Foster sRPE)
    readiness?: { sleepH, soreness, stress },   // opcional, default neutral
    metcon?: { format:"amrap"|"fortime"|"emom"|"intervals"|"max",
               capSec?,        // ventana fija conocida (AMRAP/EMOM/intervalos) — de la prescripción
               timeSec?,       // RESULTADO (For Time / chipper): tiempo final si terminó
               finished?,      // For Time: ¿completó antes del cap?
               repsAtCap?,     // For Time NO terminado: reps completadas al pegar el cap
               rounds?, reps?, // RESULTADO (AMRAP / rounds)
               scaling:"rx"|"scaled"|"mixed",
               movementScaling?: Record<exerciseId,
                  { type:"rx"|"load"|"reps"|"assist"|"sub"|"range", detail? }>,  // estructurado por movimiento
               scaledNotes?,   // texto libre — respaldo para escalado dinámico ("rondas 1-3 RX, luego banded")
               estimateApprox? // true si scaling≠rx y el trabajo/potencia es estimación aproximada
             },
    notes,
    derived?: { totalWorkJ, avgPowerW, modalityMix:{M,G,W}, energyMix, loadAU }  // denormalizado
  }
  sessions/{sessionId}/sets/{setId} → {
    exerciseId, exerciseName,
    weightKg|null, isBodyweight, addedLoadKg|null,
    reps|null, distanceM|null, calories|null, timeSec|null,
    rpe|null, rir|null, tempo|null,
    setType:"warmup"|"working"|"amrap"|"failure", ts,
    derived?: { workJ, e1rmKg }
  }

  benchmarks/{id}      → { type:"lift-1rm"|"named-wod", exerciseId?|wodName?,
                           resultKg?|timeSec?|rounds?+reps?, rx:boolean, date, sessionId? }
  readiness/{date}     → { sleepH, soreness, stress }   // si se prefiere fuera de session
```
Claves del cambio vs hoy: **número como número** (no strings con unidad), **identidad de ejercicio**
(catálogo, no nombre visible), **set/sesión/benchmark separados**, **fecha real**.

### 3.4 Motor de derivación (fórmulas) — funciones puras + tests
- **Trabajo por rep**: `Wrep = loadKg · 9.81 · displacementM`. Gimnástico:
  `((bodyweightFraction·BWkg) + addedLoadKg) · 9.81 · displacementM`. Erg: de calorías→joules
  (`kcal·4184`). Distancia/timed: según `workModel`.
- **Potencia de sesión**: `avgPowerW = ΣworkJ / workingTimeSec`. → curva de potencia por dominio temporal.
- **e1RM** (canónico para fuerza, normaliza reps): Epley `1RM = w·(1 + reps/30)` (válido reps≲12).
  PR de un lift = max e1RM. Reemplaza el "PR = kg máximo" actual.
- **Carga (Foster)**: `loadAU = sessionRpe · durationMin`. Semanal = Σ(7 d).
  **Monotonía** = media(carga diaria)/SD(carga diaria). **Strain** = cargaSemanal · monotonía.
  **ACWR** = agudo(7 d)/crónico(28 d); sweet spot 0.8–1.3; >1.5 riesgo. ← medidor de fatiga/Abismo.
- **Mezcla modal**: share de `workJ` por M/G/W. **Sistema energético**: por dominio temporal +
  estructura de intervalos. **10 skills**: exposición+desempeño por tags del catálogo → radar 0..100.
- **Mapa modal-temporal (Hopper)**: modalidad (M/G/W) × dominio temporal
  (sprint <2 min / corto 2–8 / medio 8–20 / largo >20); celdas puntuadas por desempeño relativo.
  Los huecos = debilidades.
- **Volumen por patrón** (sets/reps/tonelaje por `Pattern` por semana). **Adherencia** = pautado vs hecho.

`profile/stats` se extiende con: `e1rmPrs`, `weeklyLoadAU`, `acwr`, `monotony`, `strain`,
`modalMap`, `energyBalance`, `skillsRadar`, `patternVolume`, `adherencePct`, `powerCurve`.

### 3.5 Input del atleta — DOS modos sobre el mismo modelo
Ambos modos escriben los mismos `sessions`/`sets` estructurados. Una capa de datos, dos UIs.

**A) Wizard guiado ("INCURSIÓN") — la UX especial.** Flujo full-screen paso a paso que recorre los
bloques del día, tematizado como iniciar una incursión al Abismo (leitmotif). Para el durante/post
entreno. Mínimos toques:
- **Fuerza**: una "estación" por ejercicio. Fila pre-rellenada con la prescripción (`4×5 @70%`); si
  hay 1RM conocido/estimado, el peso se sugiere. Atleta confirma/ajusta peso + RPE (RIR auto) →
  "siguiente". Botón "aplicar a todas las series".
- **Metcon**: una pantalla → score (tiempo / rondas+reps / reps) + toggle RX/escalado (+ pesos por
  movimiento solo si llevó carga, pre-rellenados).
- **Cierre ("SELLAR SESIÓN")**: dial sRPE (1 toque) + duración (auto del timer) + readiness opcional
  (sliders sueño/dolor/estrés, default neutral, salteable). Feedback de recompensa (XP/botín, confeti,
  el flash de RPE≥9 ya existente).
- Barra de progreso por bloques (como "limpiar salas"). Objetivo: un WOD típico = **3–5 toques**.

**B) Entrada manual (inline).** El logger por ejercicio (ExerciseLogger refactorizado), siempre
disponible en cada movimiento de la pantalla diaria. Para power users: loguear fuera de orden, editar
una serie puntual, agregar sets ad-hoc, registrar sin entrar al wizard. Mismos campos, misma escritura
estructurada.

Regla: el wizard es el camino feliz (guiado, rápido); el manual es el control fino. Nunca un chipper
de formularios.

**Periódico** (cualquiera de los dos): peso corporal cuando se pesa; 1RM ingresado o inferido por e1RM.

### 3.5.1 UX especial de logueo — lenguaje visual
Acorde al estilo del proyecto (oscuro pure-black/zinc-950, headers `font-brutalist`, labels mono,
acentos neón electric-blue/cyan, rose para intensidad alta, leitmotif ARPG "EL ABISMO"):
- Registrar una serie = "forjar" — confirm satisfactorio, reutiliza el flash/flama de RPE≥9 ya existente.
- Wizard = framing de "incursión/run" con progreso por salas; sellar la sesión = cerrar la run con botín.
- Carga relativa, e1RM y RPE con el código de color ya establecido (emerald→amber→orange→rose).
- TODO sobre el sistema de diseño unificado (ver §3.9), no inline a medida.

### 3.5.2 Captura de resultado SEGÚN PROTOCOLO (format-aware)
La pantalla de resultado del metcon lee el `format` de la prescripción y muestra SOLO los campos que
ese formato puntúa. El tiempo es métrica de primera clase: se captura siempre, pero de distinta forma.

| Formato | El atleta ingresa | Tiempo (cómo entra) |
|---|---|---|
| **AMRAP** (X min) | rondas + reps | cap = X, conocido (prescripción) |
| **For Time** (cap Y) | tiempo final (o reps si pega el cap) + ¿terminó? | tiempo = el resultado |
| **EMOM** (N min) | reps/min logrados o completó-falló | ventana = N, conocida |
| **Intervalos / Tabata** | reps por intervalo | work:rest, conocido |
| **Fuerza** | peso × reps por serie | sin tiempo (descanso opc.) |
| **Max esfuerzo** (dist/cal/peso) | el máximo | tiempo si la prueba lo tiene |

Por qué importa el tiempo (lo usa el motor §3.4): potencia = trabajo/tiempo; **dominio temporal**
(sprint/corto/medio/largo) → clasificación de sistema energético; pace en cardio; duración de sesión →
carga sRPE. Las reps son igual de centrales: entran al cálculo de trabajo (reps × desplazamiento × carga)
y al volumen por patrón.

**Revelado condicional (For Time):** "¿Terminó?" → "Sí" pide `timeSec`; "No (cap)" oculta el tiempo y
revela `repsAtCap` (reps completadas al pegar el cap). Un campo según el caso, nunca los dos.

### 3.5.3 Escalado — estructurado, con opción "MIXTO" para el escalado dinámico
El escalado no es un flag binario (se pierde info y rompe el análisis). Tres niveles, de menor a mayor esfuerzo:
- **Default (1 toque):** `RX` · `Escalado` · `MIXTO`. `MIXTO` reconoce la realidad CrossFit: el atleta hace
  RX hasta que revienta, escala, a veces vuelve a subir/bajar dentro del mismo WOD.
- **Profundidad opcional (si Escalado/Mixto):** por movimiento, una opción rápida — `carga↓` · `reps↓` ·
  `asistido/banda` · `sustituido` · `rango↓` (+ detalle, ej. "WB 9→6 kg", "pull-up banded"). El atleta llena
  solo lo que cambió; lo demás queda RX.
- **Respaldo:** `scaledNotes` texto libre para el caso dinámico ("rondas 1-3 RX, después banded").

**Honestidad del motor:** con `scaling≠"rx"` el trabajo/potencia se marca `estimateApprox=true` — el análisis
muestra la estimación pero advierte que es aproximada (consistente con la política analítica del proyecto:
no fabricar precisión). Los PRs de fuerza/e1RM no se ven afectados (vienen de series de fuerza limpias).
Tensión con "input mínimo" resuelta así: default liviano (1 toque), profundidad 100% opcional.

### 3.6 Migración (una sola vez)
Backfill de `nexus_logs_*` (strings) → `sessions`+`sets` estructurados: parsear números, mapear
nombre→`exerciseId` por alias (fuzzy); sin match → stub de catálogo "uncategorized". Conservar
el display string para la UI durante la transición.

### 3.7 Mapeo al videojuego (EL ABISMO)
`characterBuilder` pasa a leer las stats ricas:
- `power` ← mejor **e1RM** (no kg crudo).  `vitality` ← consistencia/semanas perfectas.
- `stamina` ← **trabajo total (J)** (no solo tonelaje).
- Nuevo **"corrupción/peligro"** ← ACWR/strain.  `skills`/loadout ← taxonomía del catálogo (determinista).
- **Mapa del mundo** ← `modalMap`: las celdas débiles = mazmorras a conquistar.
- **Benchmarks** (Fran, Grace, Murph…) = jefes con récord.

### 3.8 Orden interno de la Fase 3
0. **Sistema de diseño** (§3.9): extender `primitives.tsx` con los átomos que faltan (Input/NumberField,
   RpeDial, ProgressBar, ModalSheet/WizardShell). Substrato del wizard y del logger.
1. Catálogo (JSON + tipos), borrador IA + curado.
2. Tipos `set`/`session` estructurados; el logger escribe números (mantiene display string).
3. Migración/backfill.
4. Motor de derivación (funciones puras + tests).
5. Extensión de `profile/stats` + wiring Firestore.
6. UI de logueo: **wizard "INCURSIÓN"** + **logger manual** refactor, ambos sobre los átomos del paso 0.
7. UI de análisis (mapa modal, curva de potencia, radar honesto).
8. Rewire del juego (`characterBuilder` sobre stats nuevas).
Deploy + verificación tras cada sub-paso (la web es el entregable primario).

### 3.9 Unificación del sistema de diseño
**Hallazgo 2026-06-14:** el estilo NO está unificado. `src/components/ui/primitives.tsx` existe y es
bueno (SectionCard/StatBox/NexusButton/Pill/EmptyState + tokens TXT) pero **solo lo usan 5 componentes**
(los 4 de `analytics/` + TelemetryBoard). El núcleo —App.tsx (185 `className` inline), ExerciseLogger,
CloudSyncPanel, WarriorScreen, el juego— usa Tailwind a medida con sus propios botones/cards/inputs.

Plan:
- **Extender** `primitives.tsx` con los átomos faltantes (inputs, dial RPE, progress, modal/wizard shell)
  manteniendo las reglas de legibilidad ya definidas (≥10px, neutral-400+ contraste, un acento por sección).
- **Construir la nueva UX de logueo 100% sobre primitives** desde el día 1 (no regresar a inline).
- **Migrar progresivamente** las pantallas bespoke a primitives, priorizando las que toca el flujo de
  logueo (pantalla diaria + ExerciseLogger). App.tsx completo es grande → migración oportunista, no de golpe.
- Resultado: un solo lenguaje visual; la UX especial de logueo se siente parte del todo, no un parche.

---

## Fase 4 — Creador de Capítulos (programación mensual asistida por IA)

Visión (usuario 2026-06-14): el atleta co-crea el próximo "capítulo" (mes / Acto). Dice en qué se inspiran
sus bosses y semi-bosses; la IA arma el theming + la programación, pregunta cuántos días por semana
entrena, evalúa los resultados reales del atleta (si los hay) y crea la programación mensual y los
ejercicios. **Fundamentado en `docs/NEXUSL4V7.MD`** (la constitución metodológica) — esa enciclopedia
es el grounding/sistema-prompt del generador.

**Entradas:** inspiración de bosses/semi-bosses (lore) · días por semana (+ duración de sesión, material) ·
resultados del atleta (stats derivados: e1RM, huecos del mapa modal, ACWR, adherencia, debilidad prioritaria)
— si no hay historial, capítulo de línea de base (evaluación primero, CF-L4 cap.21).

**Proceso (mapeado a la enciclopedia):**
1. **Evaluación** (CF-L4: la evaluación precede a la prescripción; árbol de decisión 5, debilidad prioritaria):
   lee stats/historial → identifica debilidad, huecos modales, balance energético, readiness.
2. **Intención de bloque** (HWPO cap.17): declara intención dominante (acumulación/intensificación/
   realización/restauración) + 2-3 métricas testigo.
3. **Microciclo** (Mayhem cap.7): arma la semana según días/semana — gestión de interferencia, técnico en
   fresco, alternancia pesado/acondicionamiento/flujo, slot de debilidad (PRVN cap.12), mezcla de sistemas
   energéticos con base aeróbica (cap.30). Deload por reglas (cap.18).
4. **Materialización:** sesiones concretas → `Database` estructurada; movimientos resueltos vía catálogo;
   movimientos nuevos → **crea entradas de catálogo** (open-world §3.2.1). Nombres de día/bosses tematizados
   con la inspiración del atleta (leitmotif EL ABISMO).
5. **Seguridad** (jerarquía de veto cap.28; directivas IA Parte XVIII): veto médico/recuperación/adherencia
   vinculante, escalado que preserva estímulo, sesión mínima viable definida, no inventa historial, declara
   incertidumbre, justifica cada pieza en formato L4.
6. **Salida:** `Database` (programa) + entradas de catálogo nuevas + intención de bloque + métricas testigo +
   el lore tematizado → carga por el path existente (`parseJsonToDatabase`) → roamea por Firestore.

**Tecnología:** sobre `aiService.ts` + infra de `CoachChat`; valida la salida contra el schema `Database` +
el catálogo; consume `profile/stats` + el motor de derivación.

**Dependencias / orden:** requiere el motor de derivación (para evaluar resultados) + el modelo estructurado +
el catálogo. Es **Fase 4**, posterior al motor (Paso 3) y las UIs de logueo. Para un atleta nuevo sin
resultados, genera igual un capítulo de evaluación (assessment-first).

## Notas
- `useWorkoutState.ts` eliminado (2026-07-01) junto a `useLayoutState.ts`/`useSyncState.ts` — eran
  código muerto sin referencias.
- `workouts.ts` queda como artefacto de codegen / backup, fuera del grafo de bundle.
- El template `/copy` (`TEMPLATE_SHEET_ID`) aún apunta al workbook del dueño; reemplazar por uno limpio
  si se mantiene el flujo de Sheets.
