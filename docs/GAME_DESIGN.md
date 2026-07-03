# NEXUS: EL ABISMO — Documento de Diseño (v1)

> ARPG hack & slash estilo **Diablo II**, con la atmósfera pesada, oscura y
> ocultista de **Shin Megami Tensei / Persona**, en ambientación **actual**.
> No hay clases: hay UN solo personaje — **el Eco del atleta** — que se
> construye con los datos REALES de entrenamiento registrados en la app.

---

## 1. Concepto

Cuando el atleta entrena en el box, forja algo más que músculo: forja un **Eco**
— una versión de sí mismo que existe del otro lado. A medianoche, el box se
convierte en una grieta hacia **El Abismo**: una ciudad moderna invertida,
oscura, donde las debilidades humanas toman forma física.

El jugador desciende con su Eco a sellar grietas, enfrentando oleadas de
**Sombras** — manifestaciones de la pereza, la excusa y el estancamiento —
hasta llegar al jefe de cada grieta.

**La regla de oro del juego: nada se compra, todo se entrena.**
No hay tienda de stats. La única forma de hacer más fuerte al Eco es entrenar
en el mundo real y registrarlo en la app.

## 2. Atmósfera y dirección de arte

- **Paleta**: negro profundo, gris hormigón, acentos rojo sangre y púrpura
  eléctrico. Luna carmesí permanente. Niebla baja.
- **Escenario**: calles y estructuras urbanas actuales (asfalto, rejas,
  containers, luces de sodio) corrompidas por geometría imposible — el sello
  SMT: lo cotidiano vuelto siniestro.
- **UI**: brutalist + diagonal cuts estilo Persona — tipografía pesada,
  alto contraste, banners diagonales en pantallas de victoria/derrota.
- **Audio (futuro)**: drones graves, percusión industrial, coros distantes.

## 3. El personaje único: el Eco

No se elige clase ni se asignan puntos. El Eco se **deriva** del documento
canónico de stats (`users/{uid}/profile/stats`, calculado por
`computeAthleteStats()`):

| Stat del juego | Fuente real | Efecto en el juego |
|---|---|---|
| **VITALIDAD** (HP) | Días completados + semanas perfectas | Vida máxima |
| **PODER** (daño base) | Mejor PR en kg | Daño de golpes y habilidades |
| **AGUANTE** (voluntad máx + regen) | Tonelaje total + series | Recurso para habilidades |
| **TÉCNICA** (crítico %) | RPE promedio cerca del rango óptimo | Prob. de golpe crítico ×2 |
| **VOLUNTAD** (velocidad + esquive) | Logros + misiones secundarias | Velocidad de movimiento |
| **NIVEL** | XP total de la app | Escala global + rango (Recluta→Titán) |

## 4. Habilidades: cada movimiento de CrossFit es un poder

El juego escanea la bitácora real (`nexus_logs_*`). Si el atleta registró un
patrón de movimiento, el poder correspondiente se desbloquea. **El daño de cada
poder escala con el PR real de ese movimiento.**

| Patrón real (detección) | Poder del Eco | Arquetipo en juego |
|---|---|---|
| Deadlift / Peso Muerto | **FALLA SÍSMICA** | Slam AoE alrededor del Eco |
| Squat / Sentadilla | **COLOSO** | Postura: +armadura temporal |
| Snatch / Arranque | **ARRANQUE VOLTAICO** | Dash relámpago con daño en línea |
| Clean / Cargada | **GRAVEDAD INVERSA** | Atrae enemigos y los daña |
| Press / Jerk / Push | **PRENSA CELESTIAL** | Estallido con empuje (knockback) |
| Pull-up / Dominadas / Row vertical | **GARRA ASCENDENTE** | Gancho de alto daño single-target |
| Thruster / Wall Ball | **PROPULSOR** | Proyectil de onda |
| Kettlebell / Swing | **PÉNDULO DE HIERRO** | Giro de daño en área amplia |
| Run / Row / Bike / Ski (cardio) | **SOBREMARCHA** | Ráfaga de velocidad |
| Burpee | **SEGUNDO ALIENTO** | Auto-curación (1 vez por grieta) |

- Golpe básico siempre disponible (combo de puños/codos — el Eco pelea a mano).
- Máximo **4 poderes equipados** por descenso; se priorizan los de mayor PR.
- Más variedad real en el box ⇒ más build options en el Abismo.

## 5. Enemigos (manifestaciones)

| Sombra | Manifestación de | Comportamiento |
|---|---|---|
| **Larva de Pereza** | el "hoy no entreno" | Rápida, débil, ataca en enjambre |
| **Carcelero de Excusas** | la excusa crónica | Lento, tanque, golpe pesado |
| **EL SEDENTARIO** (jefe) | la rendición total | Masivo, embiste, invoca larvas |

Futuro: La Lesión (debuff), El Plateau (escudo que solo rompen los críticos),
Los 4 Jinetes del Sedentarismo como jefes de acto.

## 6. Estructura de juego (fase 1 — implementada)

- **Grieta = arena de oleadas**: 5 oleadas; la 5ª es el jefe con séquito.
- Cámara top-down con seguimiento, hit-flash, números de daño, partículas,
  screen shake. Vista y "feel" Diablo-like.
- **Controles**: WASD/flechas + click (desktop) · joystick virtual + botones
  de ataque/poderes (Android/touch).
- Victoria ⇒ "GRIETA SELLADA" + resumen (oleadas, bajas, tiempo).
  Derrota ⇒ "LA SOMBRA TE CONSUMIÓ".
- Mejor resultado persiste en `nexus_abyss_best` (clave `nexus_*` ⇒ se
  sincroniza a la cuenta del atleta y viaja entre dispositivos).

## 7. Roadmap

| Fase | Contenido |
|---|---|
| **1 ✅** | Crawl procedural jugable embebido en la app, stats+poderes reales, jefe, persistencia de récord |
| **2 ✅** | Actos/zonas (CALLE → SUBTE → AZOTEA, `zones.ts`), La Lesión y El Plateau (`mechanics.ts`), reliquias cosméticas por logros reales (`cosmetics.ts`), reintento por acto (`nexus_abyss_progress`). PRD: `docs/PRD-ABISMO-FASE2.md` |
| 3 | Lectura directa de `users/{uid}/profile/stats` desde un cliente standalone (el juego como app aparte) |
| 4 | Grietas co-op con el crew real (`nexus_crew`) y leaderboards de box |

## 8. Arquitectura técnica

```
src/game/
  skills.ts            ← catálogo de poderes + detección por nombre de ejercicio (puro, testeado)
  characterBuilder.ts  ← AthleteStatsDoc + bitácora → GameCharacter (puro, testeado)
  engine.ts            ← motor canvas 2D: loop, entidades, IA, colisiones, VFX
  AbyssGame.tsx        ← overlay React: intro, HUD, controles táctiles, resultado
```

- El motor no conoce React ni Firestore: recibe un `GameCharacter` y un canvas.
- `characterBuilder` es la frontera de datos: todo lo real entra por ahí.
- El juego nunca escribe stats del atleta — solo lee. Su única escritura es el
  récord (`nexus_abyss_best`).
