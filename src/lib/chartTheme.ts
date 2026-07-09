// Tema único para todos los charts de recharts. Estética "dashboard de datos"
// (excel moderno), no videojuego: grises de estructura, tinta clara legible y
// UN acento rojo. Reemplaza los neones hardcodeados dispersos por sección.

export const CHART = {
  grid: "#27272A",       // --color-line
  axis: "#3F3F46",       // --color-line-strong
  tick: { fill: "#A1A1AA", fontSize: 11, fontFamily: "JetBrains Mono, monospace" },
  /** orden de prioridad de series: blanco → gris → acento → gris oscuro */
  series: ["#FAFAFA", "#A1A1AA", "#DC2626", "#52525B"] as const,
  accent: "#DC2626",
  accentSoft: "#EF4444",
  tooltip: {
    backgroundColor: "#0A0A0A",
    border: "1px solid #3F3F46",
    borderRadius: 2,
    fontSize: 11,
    fontFamily: "JetBrains Mono, monospace",
    color: "#FAFAFA",
  } as Record<string, string | number>,
} as const;

/** Props mono para los RadarChart (el polígono se conserva, sin neón). */
export const radarProps = {
  stroke: "#FAFAFA",
  fill: "#FAFAFA",
  fillOpacity: 0.08,
} as const;
