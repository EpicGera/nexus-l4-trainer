/**
 * Advanced Protocol Parser for PRVN, Mayhem & HWPO schemes.
 * Converts natural-language workout schemes (e.g. "Every 2:30", "Tabata", "AMRAP")
 * into actionable intervals and timers.
 */
export function parseProtocol(title: string, scheme: string, blockName: string = "") {
  const combinedStr = `${blockName} ${title} ${scheme}`.toUpperCase();

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

  // 0. Warmup fixed protocol: default 10 minutes max completion, 1:30 min rest. Can be overridden by cap.
  if (
    combinedStr.includes("WARM-UP") ||
    combinedStr.includes("WARMUP") ||
    combinedStr.includes("CALENTAMIENTO") ||
    combinedStr.includes("ENTRADITA")
  ) {
    return {
      type: "INTERVAL",
      name: "PUESTA A PUNTO L4",
      work: capWorkSeconds > 0 ? capWorkSeconds : 600,
      rest: 90, // 1:30 rest to set up the next block
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
    /(\d+)\s*(MIN|M|S|SEG|'')?\s*ON\s*\/\s*(\d+)\s*(MIN|M|S|SEG|'')?\s*OFF/i,
  );
  if (onOffMatch) {
    const workVal = parseInt(onOffMatch[1], 10);
    const workUnit = onOffMatch[2] || "MIN";
    const workIsSeconds = ["S", "SEG", "''"].some((u) =>
      workUnit.startsWith(u),
    );
    const workSeconds = workIsSeconds ? workVal : workVal * 60;

    const restVal = parseInt(onOffMatch[3], 10);
    const restUnit = onOffMatch[4] || "MIN";
    const restIsSeconds = ["S", "SEG", "''"].some((u) =>
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
  // Check special EOMOM/E2MOM
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

  const amrapMatch =
    combinedStr.match(/AMRAP\s*(\d+)/i) ||
    combinedStr.match(/(\d+)\s*MINUTOS/i) ||
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

  // 5. Explicit strength rest tags: REST 90S, REST 2MIN, REST 2:30
  const restMatch =
    combinedStr.match(/REST\s*(\d+)\s*S/i) ||
    combinedStr.match(/REST\s*(\d+)\s*(?:SEGUNDOS|SEG)?/i);
  if (restMatch) {
    const roundMatch =
      combinedStr.match(
        /(\d+)\s*(?:RONDAS|SERIES|RNDS|SETS|ROUNDS|VUELTAS)/i,
      ) || combinedStr.match(/(?:X|\*)\s*(\d+)/i);
    const r = roundMatch ? parseInt(roundMatch[1], 10) : 4;
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
    combinedStr.match(/REST\s*(\d+)[:.](\d+)/i);
  if (restMinMatch) {
    const mins = parseInt(restMinMatch[1], 10);
    const secs = restMinMatch[2] ? parseInt(restMinMatch[2], 10) : 0;
    const roundMatch =
      combinedStr.match(
        /(\d+)\s*(?:RONDAS|SERIES|RNDS|SETS|ROUNDS|VUELTAS)/i,
      ) || combinedStr.match(/(?:X|\*)\s*(\d+)/i);
    const r = roundMatch ? parseInt(roundMatch[1], 10) : 4;
    return {
      type: "STRENGTH",
      name: "TRABAJO Y DESCANSO",
      work: 120, // 2:00 minutes of execution window per set
      rest: mins * 60 + secs,
      rounds: r,
    };
  }

  // 6. Generic Rounds match (e.g., 3 RONDAS, 4 SERIES - default rest indicator)
  const generalRoundsMatch = combinedStr.match(
    /(\d+)\s*(?:RONDAS|SERIES|SETS|VUELTAS)/i,
  );
  if (generalRoundsMatch) {
    const r = parseInt(generalRoundsMatch[1], 10);
    return {
      type: "STRENGTH",
      name: "FUERZA RECOMENDADA",
      work: 120, // 2:00 minutes of execution window per set
      rest: 90,
      rounds: r,
    };
  }

  if (combinedStr.includes("FOR TIME") || combinedStr.includes("POR TIEMPO")) {
    return {
      type: "FOR_TIME",
      name: "POR TIEMPO",
      work: 0,
      rest: 0,
      rounds: 1,
    };
  }

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

  // Fallback defaults
  return {
    type: "NORMAL",
    name: "TEMPORIZADOR LIBRE",
    work: 0,
    rest: 60,
    rounds: 1,
  };
}
