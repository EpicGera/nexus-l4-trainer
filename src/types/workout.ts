export interface WarmupBlock {
  title: string;
  scheme: string;
  items: string[];
}

export interface StrengthBlock {
  title: string;
  scheme: string;
  items: string[];
}

export interface MetconBlock {
  title: string;
  scheme: string;
  items: string[];
}

export interface AccessoriesBlock {
  title: string;
  scheme: string;
  items: string[];
}

export interface DayVariation {
  tabName: string;
  warmup: WarmupBlock;
  strength: StrengthBlock;
  metcon: MetconBlock;
  accessories: AccessoriesBlock;
}

export interface DayWorkout {
  id: string; // e.g., "w1d1"
  name: string; // "LUNES"
  title: string; // "La Guarida del Mal"
  isCompleted: boolean;
  hasTabs?: boolean;
  variations: DayVariation[];
}

export interface WeekPlan {
  days: DayWorkout[];
}

export interface Database {
  [key: string]: WeekPlan;
}

export interface AthleteState {
  identity: string;
  level: string;
  restriction: string;
  condition: string;
  equipment: {
    grebas: string;
    amuleto: string;
    filtro: string;
  };
}
