---
target: pizarron diario
total_score: 25
p0_count: 0
p1_count: 2
timestamp: 2026-07-17T00-26-11Z
slug: src-app-tsx-pizarron-diario
---
Method: ⚠️ DEGRADED: single-context (sub-agent Task calls for Assessment A and B both failed on weekly API limit; ran both assessments sequentially inline, A before reading B's detector output)

## Design Health Score

| # | Heuristica | Score | Hallazgo clave |
|---|-----------|-------|-----------------|
| 1 | Visibilidad del estado del sistema | 3 | Feedback claro en la mayoria de acciones; "marcar perdido" sin confirmacion visual fuera del menu donde vive |
| 2 | Coincidencia con el mundo real | 3 | Vocabulario coach/box correcto; rest-day rompe registro con jerga gamer-fantasy aislada |
| 3 | Control y libertad del usuario | 2 | "Deshacer" existe mas requiere encontrar el camino correcto primero |
| 4 | Consistencia y estandares | 1 | Dos sistemas de color: tokens DESIGN.md vs Tailwind crudo (amber-400, neutral-800, red-900, zinc-800, #111111) |
| 5 | Prevencion de errores | 3 | window.confirm nativo antes de marcar perdido; funcional pero fuera de marca |
| 6 | Reconocimiento antes que memoria | 2 | "Marcar perdido" enterrado bajo icono de engranaje etiquetado "Opciones de imagen y papiro" |
| 7 | Flexibilidad y eficiencia | 3 | Command bar flotante pensada para una mano |
| 8 | Estetica y diseno minimalista | 3 | WorkoutBlockCard disciplinada; desorden en capas flotantes superpuestas |
| 9 | Recuperacion de errores | 3 | Undo claro una vez encontrado |
| 10 | Ayuda y documentacion | 2 | Sin ayuda contextual; tooltips title="" presentes pero invisibles en mobile |

**Total: 25/40 - Aceptable.**

## Veredicto Anti-Patterns

No se ve "hecho por IA" en el sentido generico: el sistema de tarjetas y tipografia lee con identidad propia. El slop esta en paletas de color paralelas sin disciplina y jerga tonal inconsistente (rest day).

Scan deterministico (detect.mjs sobre App.tsx, RecapPanel.tsx, BlockImagesCard.tsx, NavigationHeader.tsx, primitives.tsx): 88 hallazgos. 86 son design-system-font-size (advisory, senal repetida de escala tipografica nunca codificada, precede al DESIGN.md recien escrito). 2 reales de bounce-easing: App.tsx:2538 (icono sync exportando a Sheets) y App.tsx:2776 (icono "arrastrar" en modo interactivo) — ambos violan la regla de motion sin rebote.

Overlays visuales: no disponibles en esta corrida degradada.

## Overall Impression

El pizarron en si (tarjeta de bloque, chips de dia, tabs de bloque) sigue el sistema de diseno casi al pie de la letra. El problema esta en las capas flotantes construidas en momentos distintos con paletas distintas — justo donde se cierra un dia como "perdido", una accion con carga emocional que queda enterrada.

## What's Working

- WorkoutBlockCard: sombra como estructura, cero bordes de contorno, scrim parejo sobre fondo tematico.
- Chips de dia (siempre 7, L-D, fantasma punteado): resuelve continuidad semanal sin fabricar datos.
- CoachNote condicional sobre los chips: aparece solo cuando hay algo real que decir.

## Priority Issues

**[P1] Dos paletas de color compitiendo en la misma superficie**
Por que importa: DESIGN.md fija 5 acentos con significado; botones flotantes de compartir/story usan amber-400/neutral-800/red-900/zinc-800/#111111 fuera de token, pisando el significado ya asignado al ambar (estado/XP/rango).
Fix: reemplazar por --color-card, --color-card-2, --color-sem-red, --color-label en command bar, menu de story y modal de preview fullscreen (App.tsx ~2845-2920, ~2772-2836).
Comando sugerido: /impeccable colorize

**[P1] "Marcar dia perdido" no es descubrible**
Por que importa: accion de estado central (XP, % semana, autorregulacion) vive tras un icono de engranaje etiquetado "Opciones de la imagen y papiro" dentro de "AJUSTES DE EXPORTACION" (App.tsx:2864-2909). Nielsen #6 falla.
Fix: sacarla del menu de exportacion; ubicarla junto a la command bar "ANOTAR WOD" o en el chip del dia activo.
Comando sugerido: /impeccable layout + /impeccable clarify

**[P2] animate-bounce viola la propia regla de motion**
Por que importa: DESIGN.md prohibe easing elastico/rebote; App.tsx:2538 y 2776 usan animate-bounce de Tailwind.
Fix: pulso de opacidad o ease-out-quart en transform.
Comando sugerido: /impeccable animate

**[P2] Registro tonal inconsistente en el dia de descanso**
Por que importa: "PORTAL REGENT" / "PRESUPUESTO DE MANA" (App.tsx:2319-2330) introduce jerga fantasy-RPG ausente en el resto del pizarron; PRODUCT.md pide epica ganada desde datos reales, no gratuita.
Fix: reescribir con el vocabulario del resto del pizarron.
Comando sugerido: /impeccable clarify

**[P3] Escala tipografica no codificada — 86 tamanos arbitrarios**
Por que importa: senal unica repetida, no 86 bugs distintos; la app nunca tuvo escala real, solo convencion visual.
Fix: ampliar la escala de DESIGN.md a los pasos con intencion real, o consolidar. No urgente salvo inversion dedicada.
Comando sugerido: /impeccable typeset (opcional)

## Persona Red Flags

**Casey (movil, una mano, entre series)**: zona inferior con 3 capas flotantes compitiendo (command bar ANOTAR WOD + cluster camara/ajustes + menu de story deslizante) — alto riesgo de toque accidental.

**Jordan (primera vez)**: "PORTAL REGENT"/"PRESUPUESTO DE MANA" en dia de descanso no significa nada sin conocimiento previo de jerga gamer no ensenada en ningun otro lado.

## Minor Observations

- Branding "NEXUS L4 MASTER" baja a text-[5.5px] en <320px (NavigationHeader.tsx:98), por debajo del piso de 10px que el propio sistema establece.
- RecapPanel.tsx mezcla text-neutral-400/300 con tokens --color-label/--color-ink-2 en el mismo componente.
- Boton "Deshacer" de dia perdido sin jerarquia visual que lo distinga como salida de emergencia (heuristica #3).

## Questions to Consider

- La accion de cerrar un dia como "perdido" merece mas peso emocional en el diseno dado que PRODUCT.md promete "apoyo", no solo registro binario?
- Deberian los botones de compartir/story bajar un nivel jerarquico para que el pulgar de Casey no elija entre tres acciones a la vez?
