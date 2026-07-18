---
target: pizarron diario
total_score: 27
p0_count: 1
p1_count: 1
timestamp: 2026-07-17T01-52-42Z
slug: src-app-tsx-pizarron-diario
---
Method: dual-agent (A: design-director re-review · B: detect.mjs + grep + browser attempt)

## Design Health Score

| # | Heuristica | Score | Hallazgo clave |
|---|-----------|-------|-----------------|
| 1 | Visibilidad del estado | 3 | Missed/undo visible en command bar |
| 2 | Coincidencia mundo real/voz | 3 | Rest day en registro; DailyMissionPanel mantiene diccion gamer rigida al lado |
| 3 | Control y libertad | 3 | Undo real |
| 4 | Consistencia y estandares | 2 | DailyMissionPanel.tsx sigue en amber-500/zinc-900/emerald-400 sin tocar, mismo sheet |
| 5 | Prevencion de errores | 3 | window.confirm guarda accion destructiva |
| 6 | Reconocimiento > memoria | 3 | Iconos + labels + tooltips |
| 7 | Flexibilidad y eficiencia | 3 | Sin cambios |
| 8 | Estetica minimalista | 2 | Cluster flotante ahora 2 filas, mas masa visual en zona del pulgar |
| 9 | Recuperacion de errores | 3 | Undo presente |
| 10 | Ayuda y documentacion | 3 | Tooltips en botones flotantes |

Total: 27/40 - Aceptable (+2 vs corrida anterior de 25).

## Veredicto Anti-Patterns

Fix quirurgico a las lineas exactas citadas, no al patron: DailyMissionPanel.tsx (componente vecino, mismo sheet) sigue con color crudo; NavigationHeader.tsx tiene lineas hermanas (120, 154) bajo el piso de 7.5px recien documentado.

Scan deterministico: 44 hallazgos (bajo de 88). bounce-easing: 0 confirmado. design-system-font-size: 44 (bajo de 86), mayoria limitacion de deteccion string-vs-rem, pero 2 reales en NavigationHeader.tsx:120,154. Grep dirigido: 1 color crudo sin migrar en App.tsx:2970 (hover:bg-neutral-700, menu de story).

Overlay visual no disponible (dev server no aceptaba conexiones); sin servidores quedaron corriendo.

## Overall Impression

Los dos fixes reales (descubribilidad de dia perdido, motion sin rebote) aterrizaron limpios. El resto resolvio el sintoma citado, no la enfermedad: el mismo patron de color-fuera-de-token y texto-bajo-el-piso sigue vivo a centimetros de donde se corrigio.

## What's Working

- "Marcar perdido" / "Perdido - deshacer": inline, confirm guard, undo real.
- Motion: los dos animate-bounce de la capa flotante ahora son animate-spin/animate-pulse.
- Copy del dia de descanso: limpio, en registro.

## Priority Issues

[P0] Dos sistemas de color en el mismo sheet: DailyMissionPanel.tsx (App.tsx:1817, primero en renderizarse) usa amber-500/amber-300/amber-400/zinc-100/zinc-900/zinc-300/zinc-400/emerald-500/emerald-400 crudos.
Fix: migrar a tokens ya usados correctamente en el mismo archivo.

[P1] Piso de 7.5px aplicado a una linea, no al patron: NavigationHeader.tsx:120 y :154 siguen bajo el piso.
Fix: subir a 7.5px minimo.

[P2] Cluster del pulgar crecio: pill "Marcar perdido" (~22-24px) bajo el spec de boton (34px) y el minimo de plataforma (44px), separado de la barra principal.
Fix: subir a 34px y fusionar en la misma fila.

[P3] Cyan crudo residual en story menu (App.tsx ~3091, ~3178): cyan-400 en vez de --color-sem-cyan.

[P3] App.tsx:2970 hover:bg-neutral-700 sin migrar.

## Persona Red Flags

Casey: pill de dia perdido es blanco chico separado de la barra principal, riesgo de toque impreciso entre series.

## Minor Observations

- bg-signal-red y --color-sem-red mismo hex, dos nombres: fragilidad de mantenimiento.
- animate-bounce sigue en WorkoutTimer.tsx:712,783 y TimerSetupForm.tsx:229, fuera de alcance.
- Panel Exportaciones & Utilidades (Datos & Nube) tiene paleta cruda propia, fuera de alcance.

## Questions to Consider

- El fix se hizo grepeando archivos citados en vez de nombres de clase en todo el arbol?
- Marcar perdido es accion rara o frecuente? Si es frecuente merece el peso visual de ANOTAR WOD.
