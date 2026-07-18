---
name: Nexus L4
description: Consola de entrenamiento del atleta — programa, registra y autorregula con datos reales.
colors:
  grafito-fondo: "#242429"
  grafito-franja: "#2c2c33"
  negro-consola: "#131318"
  negro-tile: "#1c1c23"
  tinta-blanca: "#ffffff"
  tinta-cuerpo: "#e8e8ee"
  tinta-label: "#bcbcca"
  tinta-muted: "#cdcdd6"
  tinta-faint: "#a2a2b0"
  linea: "#26262c"
  linea-fuerte: "#2f2f38"
  rojo-intensidad: "#ff453a"
  cian-telemetria: "#35d6f0"
  ambar-estado: "#ffb020"
  verde-mejora: "#34e08c"
  birome-coach: "#ffd54a"
typography:
  display:
    fontFamily: "Anton, Impact, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "0.05em"
  headline:
    fontFamily: "Anton, Impact, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.375
    letterSpacing: "0.12em"
  body:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.625rem"
    fontWeight: 700
    letterSpacing: "0.15em"
  micro:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.469rem"
    fontWeight: 700
    letterSpacing: "0.1em"
  micro-2:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.531rem"
    fontWeight: 700
    letterSpacing: "0.08em"
  data-sm:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.688rem"
    fontWeight: 400
    letterSpacing: "0.05em"
  data-md:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.813rem"
    fontWeight: 700
    letterSpacing: "normal"
  hand:
    fontFamily: "Caveat, Segoe Print, cursive"
    fontSize: "0.9375rem"
    lineHeight: 1.25
rounded:
  card: "7px"
  tile: "5px"
  chip: "4px"
spacing:
  tile: "12px"
  card: "20px"
components:
  button-primary:
    backgroundColor: "{colors.tinta-blanca}"
    textColor: "#000000"
    rounded: "{rounded.tile}"
    padding: "8px 12px"
    height: "34px"
  button-ghost:
    backgroundColor: "{colors.negro-tile}"
    textColor: "{colors.tinta-cuerpo}"
    rounded: "{rounded.tile}"
    padding: "8px 12px"
    height: "34px"
  button-danger:
    backgroundColor: "{colors.rojo-intensidad}"
    textColor: "{colors.tinta-blanca}"
    rounded: "{rounded.tile}"
    padding: "8px 12px"
    height: "34px"
  button-good:
    backgroundColor: "{colors.verde-mejora}"
    textColor: "#000000"
    rounded: "{rounded.tile}"
    padding: "8px 12px"
    height: "34px"
  card:
    backgroundColor: "{colors.negro-consola}"
    rounded: "{rounded.card}"
    padding: "{spacing.card}"
  stat-tile:
    backgroundColor: "{colors.negro-tile}"
    rounded: "{rounded.tile}"
    padding: "{spacing.tile}"
  input:
    backgroundColor: "{colors.negro-tile}"
    textColor: "{colors.tinta-blanca}"
    rounded: "{rounded.tile}"
    height: "38px"
    padding: "0 12px"
---

# Design System: Nexus L4

## 1. Overview

**Creative North Star: "La Consola del Atleta"**

Nexus L4 es un HUD de videojuego serio: telemetría, rangos y misiones sobre fondo oscuro, con el coach como narrador. La pantalla es la consola donde el atleta lee su partida real — el fondo grafito (#242429) es la sala a oscuras, y las tarjetas negras mate (#131318) flotan sobre él como paneles de instrumentos, sin un solo borde. La jerarquía la construyen la tipografía (Anton en mayúsculas para títulos y números, monospacio para labels y datos) y cuatro colores que significan, nunca decoran. Encima de esa precisión de máquina aparece la mano humana: la birome amarilla del coach (#ffd54a) anota, rodea valores y resalta — generada por reglas sobre datos reales, jamás como adorno fijo.

El sistema rechaza explícitamente la app de fitness genérica tipo Strava/Fitbod (cards blancas, gradientes azul-violeta, anillos de actividad) y el neón gamer que grita: la épica sale de marcas que suben y skills que se desbloquean, no de glow gratuito.

**Key Characteristics:**
- Fondo más claro que las tarjetas: las superficies oscuras flotan con sombra, nunca con borde.
- Cuatro colores semánticos estrictos: rojo=intensidad, cian=datos, ámbar=estado, verde=mejora.
- Doble voz tipográfica: Anton brutalista para lo épico, monospacio para lo medible, Caveat para el coach.
- Operable entre series: tiles compactos, botones de 34px+, valores tabulares legibles de un vistazo.
- Motion que comunica estado (150–250ms, pulsos de alerta RPE), con `prefers-reduced-motion` global.

## 2. Colors

Paleta drenched-oscura de consola: dos negros de superficie sobre grafito, tinta blanca, y cinco acentos que son vocabulario, no decoración.

### Primary
- **Rojo Intensidad** (#ff453a): intensidad, alerta, "hoy", PRs. Es el acento heredado (`--color-accent`) y el pulso de los estados RPE críticos. Botones destructivos/urgentes.
- **Cian Telemetría** (#35d6f0): datos, medición, bloque activo, focus ring y valores calculados (chip de Working Max). Todo lo que la máquina midió o derivó.
- **Ámbar Estado** (#ffb020): estado, atención, XP, rango.
- **Verde Mejora** (#34e08c): mejora, OK, completado.

### Secondary
- **Birome del Coach** (#ffd54a): exclusivo de la voz humana — notas Caveat, elipses Scribble, resaltador `.mark-hl`. Nunca se usa como color de UI genérico.

### Neutral
- **Grafito Fondo** (#242429) con franja radial (#2c2c33): el único fondo de página; gradiente radial fijo desde arriba.
- **Negro Consola** (#131318): superficie de tarjeta elevada.
- **Negro Tile** (#1c1c23): tile interno, botones ghost, inputs.
- **Tinta Blanca** (#ffffff) / **Tinta Cuerpo** (#e8e8ee): títulos y valores / texto secundario.
- **Tinta Label** (#bcbcca): labels monospacio bold — el mínimo permitido para texto.
- **Línea** (#26262c) / **Línea Fuerte** (#2f2f38): divisores internos únicamente (headers/footers de modal, dashed de empty states). Nunca contorno de tarjeta.

### Named Rules
**La Regla del Color con Significado.** Cada acento ES un mensaje: rojo=intensidad, cian=datos, ámbar=estado, verde=mejora, birome=voz del coach. Prohibido usar un acento fuera de su significado o inventar un quinto.
**La Regla del Piso de Contraste.** Ningún texto por debajo de Tinta Label (#bcbcca) sobre tarjeta. Los grises legacy (#a1a1aa, #71717a) están remapeados hacia arriba; no regresarlos.

## 3. Typography

**Display Font:** Anton (con Impact fallback) — siempre uppercase.
**Body Font:** Inter (base de página) + JetBrains Mono (datos, labels, cuerpo de tarjetas).
**Label/Mono Font:** JetBrains Mono. **Voz del coach:** Caveat (manuscrita).
**Condensada:** Roboto Condensed, solo para cues de ejercicios.

**Character:** Brutalismo de gimnasio con precisión de instrumento: Anton grita los números que importan, el monospacio los certifica, y Caveat los humaniza. Tres voces con roles fijos; nunca se mezclan en el mismo rol.

### Hierarchy
- **Display / bigValue** (Anton 900, 1.875rem/text-3xl, lh 1, tabular-nums): el número protagonista de cada StatBox o métrica.
- **Headline / título de sección** (Anton, 0.875rem, tracking 0.12em, uppercase): título de toda SectionCard.
- **Title / subtítulo** (JetBrains Mono bold, 0.625rem, uppercase, tracking wider): subtítulo bajo el título de sección.
- **Body** (JetBrains Mono, 0.75rem, lh 1.625, color tinta-cuerpo): cuerpo dentro de tarjetas; prosa larga usa Inter.
- **Label** (JetBrains Mono bold, 0.625rem/10px, uppercase, tracking 0.15em, color tinta-label): etiquetas de datos y botones.
- **Micro / micro-2** (JetBrains Mono bold, 7.5–8.5px, tracking apretado): auditoría del código encontró un segundo escalón real por debajo del label, usado consistentemente (36+ usos de 9px, 12+ de 8.5px) para contadores de movimientos, badges de sidebar y sufijos de unidad dentro de listas compactas. Es un paso legítimo de densidad, no ruido — documentado acá en vez de perseguirlo línea por línea.
- **Data-sm / data-md** (JetBrains Mono, 11–13px): texto de dato secundario en tarjetas densas (nombres de movimiento, valores inline) entre Label y Body.
- **Mano del coach** (Caveat, 0.9375rem, lh 1.25, color birome): notas con rotación leve (±2°).

### Named Rules
**La Regla de los 7.5px.** El piso real es 7.5px (micro), reservado a contadores y badges dentro de listas compactas — nunca a texto que el atleta necesita leer sin acercarse. Cualquier tamaño por debajo de 7.5px (la app tenía restos de 5.5–7px en el branding del header en viewports angostos) es un bug de legibilidad, no un paso de la escala; subir esos casos al mínimo de 7.5px o al Label de 10px si es texto identificador.
**La Regla de las Tres Voces.** Anton = épica (títulos/números), Mono = medición (labels/datos), Caveat = coach (solo notas generadas por datos). Un rol por voz; Anton nunca en cuerpo, Caveat nunca en UI.

## 4. Elevation

La sombra ES la estructura. Las tarjetas no tienen borde: flotan sobre un fondo más claro mediante sombras grandes y difusas, y esa flotación define la jerarquía (página → tarjeta → tile interno plano). Los bordes quedan reservados a divisores internos y al dashed de los empty states; un borde alrededor de una tarjeta es una regresión ("jaula").

### Shadow Vocabulary
- **Sombra de tarjeta** (`box-shadow: 0 26px 60px -14px rgb(0 0 0 / 0.85), 0 6px 18px rgb(0 0 0 / 0.5)`): toda SectionCard y ModalSheet.
- **Sombra flotante** (`box-shadow: 0 14px 32px -8px rgb(0 0 0 / 0.65)`): botones primarios y elementos que se despegan al interactuar.
- **Sombra de acento** (ej. `0 10px 26px -6px rgba(255,69,58,.6)`): botones danger/good y Ticks; el glow toma el color semántico del elemento, nunca es decorativo.

### Named Rules
**La Regla Sin Jaula.** Prohibido `border` como contorno de tarjeta o tile. Si algo necesita separarse, se eleva (sombra) o cambia de superficie (card → card-2).

## 5. Components

Tactiles y contundentes: botones que se hunden (`active:scale-95`), monospacio en mayúsculas, feedback físico inmediato — hechos para dedos con tiza.

### Buttons (NexusButton)
- **Shape:** esquinas apenas curvas (5px), altura mínima 34px, padding 8×12px.
- **Primary:** blanco sobre negro (#ffffff / texto negro), extrabold, sombra flotante; hover se despega 1px (`-translate-y-px`).
- **Hover / Focus:** transición ~150ms; focus ring cian 2px global vía `:focus-visible`.
- **Ghost:** Negro Tile + tinta-cuerpo, hover aclara a #26262e. **Danger/Good:** rojo/verde semántico con sombra de su propio color.
- **Estados:** `active:scale-95`, `disabled:opacity-30`.
- **Status-btn** (completar día): Anton 1.5rem uppercase full-width; completado invierte a blanco/negro.

### Chips (Pill / Tick)
- **Pill:** monospacio bold 10px uppercase, radio 5px; tonos neutral/good/warn/danger/accent (fondo semántico pleno, texto negro o blanco según contraste).
- **Tick:** cuadradito 20×20px junto al título de sección, color semántico pleno con sombra de su color.

### Cards / Containers (SectionCard / StatBox)
- **Corner Style:** 7px tarjeta, 5px tile.
- **Background:** Negro Consola; tiles internos Negro Tile.
- **Shadow Strategy:** sombra de tarjeta siempre; tiles internos planos (la tarjeta ya flota).
- **Border:** ninguno (Regla Sin Jaula).
- **Internal Padding:** 20px tarjeta, 12px tile.

### Inputs / Fields
- **Style:** sin borde, fondo Negro Tile, radio 5px, altura 38px, texto mono blanco; unidad (kg/reps) como sufijo mono 10px dentro del campo.
- **Focus:** ring cian 2px (`focus:ring-2` sem-cyan), transición de sombra.
- **Placeholder:** tinta-faint; **Field** envuelve con label mono 10px uppercase.
- **RpeDial:** radiogroup de botones; seleccionado toma el color del esfuerzo (blanco ≤7, ámbar 8, rojo 9+) con texto negro.

### Navigation
- **Tabs (`.tab-btn` / LensTabs):** mono bold 12px uppercase compacto; activo = fondo cian con texto negro, inactivo negro/blanco con hover translúcido.
- **Header:** fijo, notch-safe (`env(safe-area-inset-top)`), branding Anton.

### CoachNote / Scribble (componente firma)
La voz humana del sistema: nota Caveat en birome amarilla con rotación leve, elipse SVG dibujada a mano alrededor de valores clave, y resaltador `.mark-hl` (barrido amarillo translúcido). Solo aparecen cuando el motor de coachNotes los genera desde datos reales; si no hay nada que decir, silencio.

## 6. Do's and Don'ts

### Do:
- **Do** hacer flotar toda superficie con sombra sobre el fondo más claro; jerarquía = elevación + tipografía.
- **Do** usar cada acento solo con su significado (rojo=intensidad, cian=datos, ámbar=estado, verde=mejora) y la birome solo para la voz del coach.
- **Do** mantener valores numéricos en Anton `tabular-nums` y labels en JetBrains Mono 10px uppercase tracking 0.15em.
- **Do** dar feedback físico: `active:scale-95`, hover que despega 1px, transiciones 150–250ms, y alternativa `prefers-reduced-motion` para todo.
- **Do** usar EmptyState (dashed + mensaje honesto) en vez de datos fabricados.

### Don't:
- **Don't** parecer la app de fitness genérica tipo Strava/Fitbod: nada de cards blancas, gradientes azul-violeta, anillos de actividad ni tono corporativo (anti-referencia literal de PRODUCT.md).
- **Don't** poner borde de contorno a tarjetas o tiles (la "jaula" está prohibida); los divisores viven solo dentro de modales y empty states.
- **Don't** bajar texto de 10px ni usar grises por debajo de Tinta Label (#bcbcca) sobre tarjeta.
- **Don't** usar la birome amarilla como acento de UI, ni glow/neón decorativo: la sombra de color solo acompaña a su elemento semántico.
- **Don't** mezclar voces tipográficas: Anton nunca en cuerpo ni labels, Caveat nunca en controles.
