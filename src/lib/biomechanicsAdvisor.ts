/**
 * L4 Biomechanics Advisor & Dynamic RPE Suggester.
 * Standardizes CF-L4 clinic wisdom, ROM rules, and personalized athlete guidance.
 */
import { AthleteState } from "../types/workout";

export function getSuggestedRpe(
  weightInput: string,
  maxWeight: number,
): { rpe: string; percentage: number } | null {
  if (!weightInput || maxWeight <= 0) return null;
  const cleanWeight = parseFloat(weightInput.replace(/[^0-9.]/g, ""));
  if (isNaN(cleanWeight) || cleanWeight <= 0) return null;

  const percentage = Math.round((cleanWeight / maxWeight) * 100);

  // CF-L4 / PRVN / HWPO Scientific Intensity Scale mapping
  let suggestedRpe = "8";
  if (percentage >= 105) suggestedRpe = "10"; // PR Overload!
  else if (percentage >= 100) suggestedRpe = "10";
  else if (percentage >= 95) suggestedRpe = "9.5";
  else if (percentage >= 90) suggestedRpe = "9";
  else if (percentage >= 85) suggestedRpe = "8.5";
  else if (percentage >= 80) suggestedRpe = "8";
  else if (percentage >= 75) suggestedRpe = "7.5";
  else if (percentage >= 70) suggestedRpe = "7";
  else if (percentage >= 65) suggestedRpe = "6.5";
  else if (percentage >= 60) suggestedRpe = "6";
  else if (percentage >= 50) suggestedRpe = "5";
  else suggestedRpe = "4";

  return { rpe: suggestedRpe, percentage };
}

export function getBiomechanicalTips(
  exerciseName: string,
  athlete: AthleteState,
): string[] {
  const tips: string[] = [];

  const levelUpper = (athlete.level || "").toUpperCase();
  const grebasUpper = (athlete.equipment?.grebas || "").toUpperCase();
  const amuletoUpper = (athlete.equipment?.amuleto || "").toUpperCase();
  const filtroUpper = (athlete.equipment?.filtro || "").toUpperCase();
  const nameUpper = exerciseName.toUpperCase();

  // 1. Core CF-L4 Rules
  if (
    nameUpper.includes("SQUAT") ||
    nameUpper.includes("SENTADILLA") ||
    nameUpper.includes("THRUSTER") ||
    nameUpper.includes("CLEAN")
  ) {
    tips.push(
      "\u2695\ufe0f **ROM sobre Carga [CF-L4]**: Prioriza siempre el rango de movimiento completo y profundo (rompe el paralelo) antes de añadir más discos a la barra. Empuja las rodillas hacia fuera.",
    );
  }

  if (
    nameUpper.includes("SNATCH") ||
    nameUpper.includes("CLEAN") ||
    nameUpper.includes("DEADLIFT") ||
    nameUpper.includes("PESO MUERTO") ||
    nameUpper.includes("CARGADA")
  ) {
    tips.push(
      "\ud83c\udfcb\ufe0f **Física de Agarre [CF-L4]**: Activa el agarre de gancho (*Hook Grip*) para descargar la fatiga de tus antebrazos y mejorar la transferencia de fuerza vertical.",
    );
  }

  if (
    nameUpper.includes("PULL-UP") ||
    nameUpper.includes("MUSCLE-UP") ||
    nameUpper.includes("DOMINADA") ||
    nameUpper.includes("T2B") ||
    nameUpper.includes("TOES")
  ) {
    tips.push(
      "\ud83d\udd90\ufe0f **Evita los Guantes [CF-L4]**: No uses guantes en la barra olímpica o de gimnasia. Provocan deslizamiento multicapa. Utiliza calleras de fibra de carbono directamente con magnesio con el pliegue táctico (*Dowel Effect*).",
    );
  }

  if (
    nameUpper.includes("SIT-UP") ||
    nameUpper.includes("L-SIT") ||
    nameUpper.includes("ABDOMINAL")
  ) {
    tips.push(
      "\u26a0\ufe0f **Trampa del Psoas [CF-L4]**: Los sit-ups completos fatigan severamente el psoas ilíaco comprimiendo la zona lumbar. Recomiendo sustituir por abdominales cortos (crunch) o planchas anti-extensión.",
    );
  }

  // 2. Class/Level personalized strategy
  if (levelUpper.includes("PRVN")) {
    tips.push(
      "\ud83e\uddec **Estrategia PRVN**: Calidad e intervalos estrictos. Respeta el estímulo original. Si tu RPE sube de lo pautado por fatiga, prioriza velocidad de barra reduciendo peso.",
    );
  } else if (levelUpper.includes("HWPO")) {
    tips.push(
      "\u26d3\ufe0f **Estrategia HWPO (Mat Fraser)**: La consistencia es lo primero. Tus accesorios no son 'por tiempo', mantén la fase excéntrica lenta (tempo de calidad). \u00a1Trabajo duro paga!",
    );
  } else if (levelUpper.includes("MAYHEM")) {
    tips.push(
      "\ud83c\udf0b **Estrategia Mayhem (Rich Froning)**: Volumen exigente. Ejecuta idealmente la rutina de activación 'Hip Halo' (glute bridges/walks) para un correcto reclutamiento neural.",
    );
  } else if (
    levelUpper.includes("HAEDO") ||
    levelUpper.includes("BALDE") ||
    levelUpper.includes("LUK")
  ) {
    tips.push(
      "\u2695\ufe0f **Estrategia Haedo (Balde)**: Salud y longevidad en adultos activos. Atención a redundancias de flexión de columna. \u00a1Buen trabajo! Prep\u00e1rate una Coca-Cola bien fr\u00eda para reponer gluc\u00f3geno post-entreno.",
    );
  } else if (
    levelUpper.includes("PEAK") ||
    levelUpper.includes("SAN JUSTO") ||
    levelUpper.includes("VALENT\u00cdN")
  ) {
    tips.push(
      "\ud83d\udea8 **Estrategia San Justo (Alerta de Volumen Basura)**: Cuidado con la halterofilia pesada sobre fatiga plyo extrema. Regula tus cargas al ~60% ante el menor indicio de quiebre t\u00e9cnico.",
    );
  }

  // 3. Equipment personalized enhancements
  if (
    amuletoUpper.includes("CARBONO") ||
    amuletoUpper.includes("DOWEL") ||
    amuletoUpper.includes("CALLERA")
  ) {
    tips.push(
      "\ud83d\udd90\ufe0f **Pliegue Táctico en Calleras [CF-L4]**: El uso del pliegue táctico (*Dowel Effect*) de tus calleras de fibra de carbono optimiza la fricción y reduce drásticamente la fatiga prematura de tu agarre colgante.",
    );
  } else if (
    amuletoUpper.includes("HOOK") ||
    amuletoUpper.includes("TAPE") ||
    amuletoUpper.includes("ZANCADA")
  ) {
    tips.push(
      "\ud83c\udfcb\ufe0f **Soporte de Hook Grip [CF-L4]**: El tape elástico protege el tejido cutáneo de los pulgares, permitiendo tracciones intensas sin inhibición voluntaria por dolor focal.",
    );
  }

  if (
    grebasUpper.includes("RODILLERA") ||
    grebasUpper.includes("NEOPRENE") ||
    grebasUpper.includes("COMPRESIÓN") ||
    grebasUpper.includes("PLACA") ||
    grebasUpper.includes("BANQUETE") ||
    grebasUpper.includes("GLUCÓGENO")
  ) {
    tips.push(
      "\ud83e\uddb5 **Compresión de Neoprene [CF-L4]**: Las rodilleras de compresión de neoprene elevan la temperatura local, optimizando la viscosidad articular y la propiocepción durante la sentadilla profunda.",
    );
  }

  if (
    filtroUpper.includes("BEBIDA") ||
    filtroUpper.includes("RECONSTITUYENTE") ||
    filtroUpper.includes("RECUPERADOR") ||
    filtroUpper.includes("COCA") ||
    filtroUpper.includes("FR\u00cdA") ||
    filtroUpper.includes("AIRE") ||
    filtroUpper.includes("CARDI")
  ) {
    tips.push(
      "\ud83e\udd64 **Saturación de Glucógeno [CF-L4]**: Reposición sistemática de carbohidratos simples intra/post esfuerzo para catalizar inmediatamente la resíntesis de energía y optimizar la homeostasis.",
    );
  }

  // Default clinical guard
  if (tips.length === 0) {
    tips.push(
      "\u2695\ufe0f **Estímulo Óptimo Nexus L4**: Asegura el rango de completo movimiento (ROM). Controla el tempo excéntrico de cada repetición.",
    );
  }

  return tips;
}
