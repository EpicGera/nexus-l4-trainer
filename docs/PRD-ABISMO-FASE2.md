# PRD — EL ABISMO, Fase 2

> Documento de requisitos para una sesión autónoma larga (Fable 5).
> Fuente de verdad de diseño: `docs/GAME_DESIGN.md` (v1). Este PRD convierte
> la fila "Fase 2" de su roadmap en hitos ejecutables. Si algo contradice a
> GAME_DESIGN.md, gana GAME_DESIGN.md.

## 1. Objetivo

Extender la arena de oleadas (Fase 1, ya implementada y jugable) a una
estructura de **actos**: tres zonas con identidad propia, dos enemigos nuevos
con mecánicas (La Lesión, El Plateau) y **loot cosmético** derivado de logros
reales del atleta. La regla de oro sigue intacta: **nada se compra, todo se
entrena** — el loot es visual, jamás otorga stats.

## 2. Restricciones de arquitectura (no negociables)

- `src/game/engine.ts` no conoce React ni Firestore. Recibe `GameCharacter`
  y un canvas. Toda extensión del motor respeta esto.
- `src/game/characterBuilder.ts` es la única frontera de datos reales
  (stats + bitácora → juego). Los cosméticos por logros entran por ahí.
- El juego **solo lee** datos del atleta. Sus únicas escrituras son claves
  `nexus_abyss_*` (récord y, ahora, progreso de actos), que viajan con la
  cuenta por el prefijo `nexus_`.
- Lógica nueva pura (actos, spawns, mecánicas de enemigos, mapeo
  logro→cosmético) va en módulos puros con test, como `skills.ts` y
  `characterBuilder.ts`.
- TypeScript estricto, sin dependencias nuevas. Canvas 2D como hasta ahora.
- Controles existentes (WASD/click y táctil) deben funcionar igual en las
  tres zonas. No romper la Fase 1: la grieta simple sigue existiendo como
  primer acto.

## 3. Hitos

### Hito 1 — Actos y zonas: CALLE → SUBTE → AZOTEA

- Un descenso ahora son 3 actos secuenciales. Cada acto = arena de oleadas
  (reutilizar el sistema de Fase 1) con jefe al final del acto.
- Identidad por zona vía paleta y props del canvas (asfalto/containers,
  túneles/luz de sodio, azotea/luna carmesí) — dirección de arte de
  GAME_DESIGN.md §2. No hace falta tileset externo: formas + paleta.
- Transición entre actos: pantalla breve estilo Persona (banner diagonal,
  nombre del acto), curación parcial del Eco.
- Progreso del descenso en `nexus_abyss_progress`; el récord por descenso
  completo reemplaza/extiende `nexus_abyss_best` sin romper el dato viejo.

**Aceptación:** partida completa CALLE→AZOTEA jugable en desktop y touch;
derrota en acto 2 o 3 permite reintentar desde el inicio del acto; `npm test`
en verde con tests de la lógica de secuencia de actos.

### Hito 2 — Enemigos con mecánica: LA LESIÓN y EL PLATEAU

- **La Lesión** (aparece desde el acto 2): al golpear aplica debuff visible
  (movilidad o daño reducido por tiempo). El debuff se limpia al terminar la
  oleada.
- **El Plateau** (mini-jefe, acto 3): escudo que SOLO rompen los golpes
  críticos — hace que TÉCNICA (RPE real) importe. Sin críticos suficientes,
  el escudo se regenera.
- Ambos con telegraph claro (wind-up visible) para que el "feel" Diablo-like
  no se vuelva injusto en touch.

**Aceptación:** ambas mecánicas cubiertas por tests puros (aplicación/expiración
del debuff; escudo solo cede a críticos); aparecen en sus actos según spawn
table testeada.

### Hito 3 — Loot cosmético por logros reales

- Mapeo puro logro-real → cosmético (aura, color de trail, marca en el HUD),
  en un módulo nuevo tipo `cosmetics.ts` con test. Ejemplos: semana perfecta
  → aura; PR nuevo → trail; racha de días → marca de rango en HUD.
- `characterBuilder` expone los cosméticos desbloqueados en `GameCharacter`;
  el motor solo los renderiza. Cero efecto en stats.
- Pantalla de resumen post-descenso muestra cosméticos desbloqueados.

**Aceptación:** test del mapeo logro→cosmético; un atleta sin logros juega
igual (sin errores, sin cosméticos); la regla "solo visual" verificable en el
tipo (los cosméticos no tocan campos de stats).

## 4. Forma de trabajo del agente

- Autónomo, hito por hito, commits atómicos por feature. No avanzar de hito
  sin su criterio de aceptación cumplido (`npm test` + build en verde).
- Sin placeholders ni `// TODO`. Si un requisito es ambiguo, resolver con la
  opción más simple que respete GAME_DESIGN.md y anotarla en el commit.
- No tocar nada fuera de `src/game/` salvo lo mínimo para exponer cosméticos
  en `characterBuilder` y las claves `nexus_abyss_*`.
- Al cerrar cada hito: nota breve de qué se simplificó y qué quedó para
  Fase 3 (cliente standalone) o Fase 4 (co-op), sin implementarlas.
