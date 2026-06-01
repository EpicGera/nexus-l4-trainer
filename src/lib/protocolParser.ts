// FILE_PATH: src/lib/protocolParser.ts
// ACTION: OVERWRITE
// DESCRIPTION: Complete rewrite to handle ALL workout scheme patterns intelligently.
// Covers: AMRAP, EMOM, E2MOM, Tabata, ON/OFF intervals, Time Caps, NxM strength,
// N Minutos countdown, pipe-separated configs, descriptive scheme fallback.
// ---------------------------------------------------------

/**
 * Advanced Protocol Parser for PRVN, Mayhem & HWPO schemes.
 * Converts natural-language workout schemes (e.g. "Every 2:30", "Tabata", "AMRAP")
 * into actionable intervals and timers.
 */
export function parseProtocol(title: string, scheme: string, blockName: string = "") {
  const combinedStr = `${blockName} ${title} ${scheme}`.toUpperCase();
  const schemeUpper = scheme.toUpperCase().trim();
  const blockUpper = blockName.toUpperCase().trim();

  // Attempt to parse Time Caps first to use globally where relevant
  let capWorkSeconds = 0;
  const timeCapAfterMatch = combinedStr.match(
    /(?:TIME\s*CAP|CAP)\s*(\d+)(?::(\d+))?/i,
  );
  if (timeCapAfterMatch) {
    const mins = parseInt(timeCapAfterMatch[1], 10);
    const secs = timeCapAfterMatch[2] ? parseInt(timeCapAfterMatch[2], 10) : 0;
    capWorkSeconds = mins * 60 + secs;
  } else {
    const timeCapBeforeMatch = combinedStr.match(
      /(\d+)(?::(\d+))?\s*(?:MIN|MINUTOS|M)?\s*CAP/i,
    );
    if (timeCapBeforeMatch) {
      const mins = parseInt(timeCapBeforeMatch[1], 10);
      const secs = timeCapBeforeMatch[2]
        ? parseInt(timeCapBeforeMatch[2], 10)
        : 0;
      capWorkSeconds = mins * 60 + secs;
    }
  }

  // 0. Warmup standard protocol: default 10 minutes max completion, 1:30 min rest. Can be overridden by cap.
  if (
    combinedStr.includes("WARM-UP") ||
    combinedStr.includes("WARMUP") ||
    combinedStr.includes("CALENTAMIENTO") ||
    combinedStr.includes("ENTRADITA")
  ) {
    // Check if warmup has an explicit time (e.g., "15 Minutos" in the scheme)
    const warmupMinMatch = schemeUpper.match(/(\d+)\s*(?:MINUTOS|MIN)/i);
    const warmupTime = warmupMinMatch ? parseInt(warmupMinMatch[1], 10) * 60 : (capWorkSeconds > 0 ? capWorkSeconds : 600);
    return {
      type: "INTERVAL",
      name: "PUESTA A PUNTO L4",
      work: warmupTime,
      rest: 90, // 1:30 rest to set up the next block
      rounds: 1,
    };
  }

  // 0b. Mobility / Recovery sessions with explicit time
  if (
    combinedStr.includes("MOVILIDAD") ||
    combinedStr.includes("REGENERATIV")
  ) {
    const mobilityMinMatch = schemeUpper.match(/(\d+)\s*(?:MINUTOS|MIN)/i);
    const mobilityTime = mobilityMinMatch ? parseInt(mobilityMinMatch[1], 10) * 60 : 600;
    return {
      type: "INTERVAL",
      name: "MOVILIDAD L4",
      work: mobilityTime,
      rest: 60,
      rounds: 1,
    };
  }

  // 1. Tabata match
  if (combinedStr.includes("TABATA")) {
    return {
      type: "INTERVAL",
      name: "TABATA (CARIOCAS)",
      work: 20,
      rest: 10,
      rounds: 8,
    };
  }

  // 2. Work/Rest Intervals match: e.g. "4 MIN ON / 1 MIN OFF X 4 RONDAS" or "40" ON / 20" OFF x 8"
  // Supports minutes (MIN, M) and seconds (S, SEG, ")
  const onOffMatch = combinedStr.match(
    /(\d+)\s*(MIN|M|S|SEG|''|")?\s*ON\s*\/\s*(\d+)\s*(MIN|M|S|SEG|''|")?\s*OFF/i,
  );
  if (onOffMatch) {
    const workVal = parseInt(onOffMatch[1], 10);
    const workUnit = onOffMatch[2] || "MIN";
    const workIsSeconds = ["S", "SEG", "''", '"'].some((u) =>
      workUnit.startsWith(u),
    );
    const workSeconds = workIsSeconds ? workVal : workVal * 60;

    const restVal = parseInt(onOffMatch[3], 10);
    const restUnit = onOffMatch[4] || "MIN";
    const restIsSeconds = ["S", "SEG", "''", '"'].some((u) =>
      restUnit.startsWith(u),
    );
    const restSeconds = restIsSeconds ? restVal : restVal * 60;

    // Detect rounds
    const roundMatch =
      combinedStr.match(
        /(?:X|\*)\s*(\d+)\s*(?:RONDAS|SERIES|RNDS|SETS|ROUND|VUELTAS)?/i,
      ) ||
      combinedStr.match(/(\d+)\s*(?:RONDAS|SERIES|RNDS|SETS|ROUNDS|VUELTAS)/i);
    const rounds = roundMatch ? parseInt(roundMatch[1], 10) : 4;

    return {
      type: "INTERVAL",
      name: "INTERVALOS",
      work: workSeconds,
      rest: restSeconds,
      rounds: rounds,
    };
  }

  // 3. EMOM / E2MOM matches (e.g., E2MOM x 6, EMOM 15 MIN, EVERY 1:30 X 10)
  // Check special EOMOM/E2MOM/E4MOM
  const exmomMatch = combinedStr.match(/E(\d+)(MOM|S)\s*(?:X\s*(\d+))?/i);
  if (exmomMatch) {
    const value = parseInt(exmomMatch[1], 10);
    const unit = exmomMatch[2].toUpperCase();
    const isSeconds = unit === "S";
    const interval = isSeconds ? value : value * 60;

    const roundsMatch =
      combinedStr.match(/(?:X|\*)\s*(\d+)/) ||
      combinedStr.match(/(\d+)\s*(?:RONDAS|SERIES|SETS|ROUNDS)/);
    const rounds = roundsMatch
      ? parseInt(roundsMatch[1], 10)
      : isSeconds
        ? 8
        : 10;

    return {
      type: "EMOM",
      name: `E${value}${unit}`,
      work: interval,
      rest: 0,
      rounds: rounds,
    };
  }

  // EVERY MM:SS or EVERY X MIN
  const everyMatch = combinedStr.match(
    /EVERY\s*(\d+)(?::(\d+))?\s*(MIN|M|S|SEG)?\s*(?:X\s*(\d+))?/i,
  );
  if (everyMatch) {
    let interval = 60;
    if (everyMatch[2]) {
      // MM:SS pattern (e.g., EVERY 2:30)
      const m = parseInt(everyMatch[1], 10);
      const s = parseInt(everyMatch[2], 10);
      interval = m * 60 + s;
    } else {
      const val = parseInt(everyMatch[1], 10);
      const unit = everyMatch[3] || "MIN";
      const isSeconds = ["S", "SEG"].some((u) => unit.startsWith(u));
      interval = isSeconds ? val : val * 60;
    }

    const rounds = everyMatch[4] ? parseInt(everyMatch[4], 10) : 6;
    return {
      type: "EMOM",
      name: "EVERY BLOCK",
      work: interval,
      rest: 0,
      rounds: rounds,
    };
  }

  // Common EMOM (e.g. EMOM 15 MIN)
  const emomMatch = combinedStr.match(/EMOM\s*(\d+)/i);
  if (emomMatch) {
    const mins = parseInt(emomMatch[1], 10);
    return {
      type: "EMOM",
      name: "EMOM",
      work: 60,
      rest: 0,
      rounds: mins,
    };
  }

  // 4. Time CAPS (e.g., CAP 8:00, CAP 15MIN, TIME CAP 20, 15 MIN CAP, 10 MIN CAP)
  if (capWorkSeconds > 0) {
    return {
      type: "AMRAP",
      name: "FOR TIME (A CAP)",
      work: capWorkSeconds,
      rest: 0,
      rounds: 1,
    };
  }

  // 5. AMRAP explicit (e.g. AMRAP 12 MIN, AMRAP 25)
  const amrapMatch =
    combinedStr.match(/AMRAP\s*(\d+)/i) ||
    combinedStr.match(/(\d+)\s*MIN\s*AMRAP/i);
  if (amrapMatch) {
    const mins = parseInt(amrapMatch[1], 10);
    return {
      type: "AMRAP",
      name: "AMRAP",
      work: mins * 60,
      rest: 0,
      rounds: 1,
    };
  }

  // 6. "N Minutos Continuos/Zona 2/Alternados/Aeróbico" — Pure countdown timers
  //    e.g. "35 Minutos Continuos", "30 Minutos Zona 2", "35 Minutos Alternados"
  const minutesContinuousMatch = schemeUpper.match(/(?<!REST\s*)(?<!REST\s*\d+\s*[Xx]\s*\d+\s*)(\d+)\s*(?:MINUTOS|MIN)\s*(?:CONTINUOS|CONTINUO|ZONA\s*\d|ALTERNADOS?|AER[OÓ]BICO|FLUSH)?/i);
  if (minutesContinuousMatch) {
    const mins = parseInt(minutesContinuousMatch[1], 10);
    // Check if there's also a round count with pipe separator: "10 Minutos | 2 Rondas"
    const pipeRoundMatch = schemeUpper.match(
      /\|\s*(\d+)\s*(?:RONDAS|SERIES|VUELTAS|ROUNDS)/i,
    );
    if (pipeRoundMatch) {
      const roundCount = parseInt(pipeRoundMatch[1], 10);
      const perRoundWork = Math.floor((mins * 60) / roundCount);
      return {
        type: "INTERVAL",
        name: "BLOQUES TEMPORIZADOS",
        work: perRoundWork,
        rest: 30, // Brief transition rest between rounds
        rounds: roundCount,
      };
    }
    return {
      type: "AMRAP",
      name: "COUNTDOWN",
      work: mins * 60,
      rest: 0,
      rounds: 1,
    };
  }

  // 7. Explicit strength rest tags: REST 90S, REST 2MIN, REST 2:30
  const restMatch =
    combinedStr.match(/REST\s*(\d+)\s*S/i) ||
    combinedStr.match(/REST\s*(\d+)\s*(?:SEGUNDOS|SEG)?/i);
  if (restMatch) {
    // Extract series count from NxM pattern or explicit rounds
    const nxmMatch = combinedStr.match(/(\d+)\s*[Xx]\s*\d+/);
    const roundMatch =
      combinedStr.match(
        /(\d+)\s*(?:RONDAS|SERIES|RNDS|SETS|ROUNDS|VUELTAS)/i,
      ) || combinedStr.match(/(?:X|\*)\s*(\d+)/i);
    const r = nxmMatch
      ? parseInt(nxmMatch[1], 10)
      : roundMatch
        ? parseInt(roundMatch[1], 10)
        : 4;
    return {
      type: "STRENGTH",
      name: "TRABAJO Y DESCANSO",
      work: 120, // 2:00 minutes of execution window per set
      rest: parseInt(restMatch[1], 10),
      rounds: r,
    };
  }

  const restMinMatch =
    combinedStr.match(/REST\s*(\d+)\s*(?:MIN|MINUTOS)/i) ||
    combinedStr.match(/REST\s*(\d+)[:.:](\d+)/i);
  if (restMinMatch) {
    const mins = parseInt(restMinMatch[1], 10);
    const secs = restMinMatch[2] ? parseInt(restMinMatch[2], 10) : 0;
    const nxmMatch = combinedStr.match(/(\d+)\s*[Xx]\s*\d+/);
    const roundMatch =
      combinedStr.match(
        /(\d+)\s*(?:RONDAS|SERIES|RNDS|SETS|ROUNDS|VUELTAS)/i,
      ) || combinedStr.match(/(?:X|\*)\s*(\d+)/i);
    const r = nxmMatch
      ? parseInt(nxmMatch[1], 10)
      : roundMatch
        ? parseInt(roundMatch[1], 10)
        : 4;
    return {
      type: "STRENGTH",
      name: "TRABAJO Y DESCANSO",
      work: 120, // 2:00 minutes of execution window per set
      rest: mins * 60 + secs,
      rounds: r,
    };
  }

  // 8. NxM strength pattern (e.g., "4x6 @ 65-70%", "4x3 @ 60%", "4x8 | Tempo 3021")
  //    Extract N as number of sets/rounds explicitly
  const nxmStrengthMatch = schemeUpper.match(/(\d+)\s*[Xx]\s*(\d+)/);
  if (nxmStrengthMatch) {
    const sets = parseInt(nxmStrengthMatch[1], 10);
    // Check for explicit rest in the same scheme
    const inlineRestMatch = schemeUpper.match(/REST\s*(\d+)/i);
    const restTime = inlineRestMatch ? parseInt(inlineRestMatch[1], 10) : 90;
    return {
      type: "STRENGTH",
      name: "FUERZA PROGRAMADA",
      work: 120, // 2:00 minutes of execution window per set
      rest: restTime,
      rounds: sets,
    };
  }

  // 9. Generic Rounds match (e.g., 3 RONDAS, 4 SERIES, "4 Series alternadas", "4 Series (Por turnos)")
  //    BLOCK-TYPE AWARE: metcon blocks with "N Rondas" → FOR_TIME with 15 min cap
  //    accessories blocks with "N Series" → STRENGTH with 12 min cap
  //    strength blocks → STRENGTH with 2:00 work / 1:30 rest intervals
  const generalRoundsMatch = combinedStr.match(
    /(\d+)\s*(?:RONDAS|SERIES|SETS|VUELTAS)/i,
  );
  if (generalRoundsMatch) {
    const r = parseInt(generalRoundsMatch[1], 10);

    // METCON blocks: "5 Rondas" = FOR TIME with countdown cap
    if (blockUpper === "METCON") {
      const metconCap = capWorkSeconds > 0 ? capWorkSeconds : 15 * 60; // Default 15 min cap
      return {
        type: "FOR_TIME",
        name: "FOR TIME",
        work: metconCap,
        rest: 0,
        rounds: r,
      };
    }

    // ACCESSORIES blocks: "3 Series" = STRENGTH with 12 min cap as total work window
    if (blockUpper === "ACCESSORIES" || blockUpper === "ACCESORIOS") {
      const accCap = capWorkSeconds > 0 ? capWorkSeconds : 12 * 60; // Default 12 min cap
      return {
        type: "STRENGTH",
        name: "ACCESORIOS",
        work: Math.floor(accCap / r), // Distribute cap across rounds
        rest: 60,
        rounds: r,
      };
    }

    // Default STRENGTH behavior for strength blocks and others
    return {
      type: "STRENGTH",
      name: "FUERZA RECOMENDADA",
      work: 120, // 2:00 minutes of execution window per set
      rest: 90,
      rounds: r,
    };
  }

  // 10. FOR TIME / POR TIEMPO (explicit, with no cap — stopwatch mode)
  if (combinedStr.includes("FOR TIME") || combinedStr.includes("POR TIEMPO")) {
    return {
      type: "FOR_TIME",
      name: "POR TIEMPO",
      work: 0,
      rest: 0,
      rounds: 1,
    };
  }

  // 11. Descending rep schemes (e.g., "21-15-9", "15-12-9") without explicit cap
  const descendingMatch = schemeUpper.match(/^\d+(?:-\d+){1,}/);
  if (descendingMatch) {
    return {
      type: "FOR_TIME",
      name: "POR TIEMPO",
      work: 0,
      rest: 0,
      rounds: 1,
    };
  }

  // 12. FUERZA fallback (title contains FUERZA or %)
  if (combinedStr.includes("FUERZA") || combinedStr.includes("%")) {
    const roundMatch =
      combinedStr.match(
        /(\d+)\s*(?:RONDAS|SERIES|RNDS|SETS|ROUNDS|VUELTAS)/i,
      ) || combinedStr.match(/(?:X|\*)\s*(\d+)/i);
    const r = roundMatch ? parseInt(roundMatch[1], 10) : 4;
    return {
      type: "STRENGTH",
      name: "FUERZA RECOMENDADA",
      work: 120, // 2:00 minutes of execution window per set
      rest: 90,
      rounds: r,
    };
  }

  // 13. Descriptive/qualitative schemes with smart defaults
  //     e.g., "Enfoque Core", "Isometric Focus", "Ligero"
  //     These have no time data, so provide sensible L4 defaults
  if (
    combinedStr.includes("ENFOQUE") ||
    combinedStr.includes("FOCUS") ||
    combinedStr.includes("ISOMETRIC") ||
    combinedStr.includes("LIGERO") ||
    combinedStr.includes("LIGHT") ||
    combinedStr.includes("ESTABILIZACI")
  ) {
    return {
      type: "STRENGTH",
      name: "ACTIVACIÓN L4",
      work: 120,
      rest: 60,
      rounds: 3,
    };
  }

  // Fallback defaults
  return {
    type: "NORMAL",
    name: "TEMPORIZADOR LIBRE",
    work: 0,
    rest: 60,
    rounds: 1,
  };
}
