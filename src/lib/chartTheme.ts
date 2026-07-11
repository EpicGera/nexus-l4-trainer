// Tema único para todos los charts de recharts (revamp "A×B humanizada").
// Colores semánticos: cian = dato medido (serie principal), rojo = intensidad/hoy,
// ámbar = estado/perdido, verde = mejora. Tooltip = tarjeta flotante sin borde.
// Reemplaza los neones/grises hardcodeados dispersos por sección.

export const CHART = {
  grid: "#26262c",       // --color-line (rejilla tenue sobre tarjeta)
  axis: "#2f2f38",       // --color-line-strong
  tick: { fill: "#bcbcca", fontSize: 11, fontFamily: "JetBrains Mono, monospace", fontWeight: 700 },
  /** orden de prioridad de series: cian (dato) → blanco → rojo → gris */
  series: ["#35d6f0", "#ffffff", "#ff453a", "#a2a2b0"] as const,
  accent: "#ff453a",     // --color-sem-red
  accentSoft: "#ff6b61",
  cyan: "#35d6f0",       // --color-sem-cyan (dato medido)
  amber: "#ffb020",      // --color-sem-amber (estado / día perdido)
  green: "#34e08c",      // --color-sem-green (mejora)
  missed: "#ffb020",     // aro del día perdido
  today: "#ff453a",      // punto de hoy
  pen: "#ffd54a",        // anotación manuscrita del coach
  tooltip: {
    backgroundColor: "#1c1c23",
    border: "none",
    borderRadius: 6,
    boxShadow: "0 18px 40px -12px rgba(0,0,0,.72)",
    fontSize: 11,
    fontFamily: "JetBrains Mono, monospace",
    color: "#ffffff",
  } as Record<string, string | number>,
} as const;

/** Props para los RadarChart: polígono cian (dato medido), relleno translúcido. */
export const radarProps = {
  stroke: "#35d6f0",
  fill: "#35d6f0",
  fillOpacity: 0.22,
} as const;
