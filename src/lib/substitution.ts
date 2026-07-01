// Matriz de sustitución L4 (enciclopedia cap. 45B, estándar Mayhem). Ratios
// aeróbicos del motor WODForge + sustituciones de gimnasia. El cuerpo entiende
// de gasto cardíaco, no de máquina: estas equivalencias preservan el estímulo.

export type CardioMachine = "run" | "row" | "ski" | "bike";

/** Distancia equivalente relativa a la carrera: Carrera 1.0 = Remo/Ski 1.25 = Bike 2.0. */
export const DISTANCE_RATIO: Record<CardioMachine, number> = {
  run: 1.0,
  row: 1.25,
  ski: 1.25,
  bike: 2.0,
};

export const MACHINE_LABEL: Record<CardioMachine, string> = {
  run: "Carrera",
  row: "Remo",
  ski: "SkiErg",
  bike: "BikeErg",
};

export const CARDIO_MACHINES: CardioMachine[] = ["run", "row", "ski", "bike"];

/** Convierte una distancia (m) de una máquina a otra, a igual gasto metabólico. */
export function convertDistance(meters: number, from: CardioMachine, to: CardioMachine): number {
  if (!(meters > 0)) return 0;
  const runEquiv = meters / DISTANCE_RATIO[from];
  return Math.round(runEquiv * DISTANCE_RATIO[to]);
}

/** Calorías aprox. en Assault/Echo Bike: 400 m de carrera (o 500 m de remo) ≈ 30 cal. */
export function distanceToBikeCal(meters: number, from: CardioMachine): number {
  if (!(meters > 0)) return 0;
  const runEquiv = meters / DISTANCE_RATIO[from];
  return Math.round(runEquiv * (30 / 400));
}

/** 100 m de shuttle (con frenos y giros) ≈ 10 cal Assault / 12 cal Bike-Ski. */
export const SHUTTLE_NOTE = "100 m Shuttle ≈ 10 cal Assault · 12 cal Bike/Ski";

export interface GymSubstitution {
  movement: string;
  subs: string[];
}

export const GYM_SUBSTITUTIONS: GymSubstitution[] = [
  {
    movement: "Handstand Walk",
    subs: [
      "Wall Walks o Bear Crawls (escala por patrón)",
      "SkiErg o DB Strict Press pesado (si el objetivo era quemar hombro bajo fatiga)",
    ],
  },
  {
    movement: "Rope Climb",
    subs: [
      "4–5 Strict Pull-ups por cada trepada (tracción estricta)",
      "Sled Pulls pesados mano a mano (si el hombro está irritado)",
    ],
  },
  {
    movement: "Muscle-Up (anillas/barra)",
    subs: [
      "Burpee Pull-up 1:1 (falta de habilidad)",
      "Burpee Pull-up 2:1 (falta de material)",
    ],
  },
];
