import { describe, it, expect } from 'vitest';
import { parseProtocol } from './protocolParser';

describe('parseProtocol', () => {
  it('should parse warmup protocols', () => {
    // Basic warmup
    expect(parseProtocol('Warm-up', '10 Minutos', '')).toEqual({
      type: 'INTERVAL',
      name: 'PUESTA A PUNTO L4',
      work: 600,
      rest: 90,
      rounds: 1,
    });

    // Warmup with cap
    expect(parseProtocol('Calentamiento', 'CAP 5:00', '')).toEqual({
      type: 'INTERVAL',
      name: 'PUESTA A PUNTO L4',
      work: 300,
      rest: 90,
      rounds: 1,
    });
  });

  it('should parse tabata protocols', () => {
    // Standard Tabata
    expect(parseProtocol('Workout', 'Tabata', '')).toEqual({
      type: 'INTERVAL',
      name: 'TABATA (CARIOCAS)',
      work: 20,
      rest: 10,
      rounds: 8,
    });

    // Multiple Tabatas
    expect(parseProtocol('Workout', '3 Tabatas', '')).toEqual({
      type: 'INTERVAL',
      name: 'TABATA (CARIOCAS)',
      work: 20,
      rest: 10,
      rounds: 8, // The current implementation defaults to 8 rounds regardless of '3 Tabatas'.
    });
  });

  it('should parse ON/OFF intervals', () => {
    expect(parseProtocol('Workout', '40s ON / 20s OFF x 5', '')).toEqual({
      type: 'INTERVAL',
      name: 'INTERVALOS',
      work: 40,
      rest: 20,
      rounds: 5,
    });

    expect(parseProtocol('Workout', '1 MIN ON / 30S OFF x 4', '')).toEqual({
      type: 'INTERVAL',
      name: 'INTERVALOS',
      work: 60,
      rest: 30,
      rounds: 4,
    });
  });

  it('should parse EMOMs', () => {
    expect(parseProtocol('Workout', 'EMOM 15 MIN', '')).toEqual({
      type: 'EMOM',
      name: 'EMOM',
      work: 60,
      rest: 0,
      rounds: 15,
    });

    expect(parseProtocol('Workout', 'E2MOM x 6', '')).toEqual({
      type: 'EMOM',
      name: 'E2MOM',
      work: 120,
      rest: 0,
      rounds: 6,
    });

    expect(parseProtocol('Workout', 'EVERY 1:30 X 10', '')).toEqual({
      type: 'EMOM',
      name: 'EVERY BLOCK',
      work: 90,
      rest: 0,
      rounds: 10,
    });
  });

  it('should parse Time Caps', () => {
    expect(parseProtocol('Workout', 'CAP 8:00', '')).toEqual({
      type: 'AMRAP',
      name: 'FOR TIME (A CAP)',
      work: 480,
      rest: 0,
      rounds: 1,
    });
  });

  it('should parse AMRAPs', () => {
    expect(parseProtocol('Workout', 'AMRAP 12 MIN', '')).toEqual({
      type: 'AMRAP',
      name: 'AMRAP',
      work: 720,
      rest: 0,
      rounds: 1,
    });

    expect(parseProtocol('Workout', '25 MIN AMRAP', '')).toEqual({
      type: 'AMRAP',
      name: 'AMRAP',
      work: 1500,
      rest: 0,
      rounds: 1,
    });
  });

  it('should parse Countdown timers', () => {
    expect(parseProtocol('Workout', '35 Minutos Continuos', '')).toEqual({
      type: 'AMRAP',
      name: 'COUNTDOWN',
      work: 2100,
      rest: 0,
      rounds: 1,
    });

    expect(parseProtocol('Workout', '10 Minutos | 2 Rondas', '')).toEqual({
      type: 'INTERVAL',
      name: 'BLOQUES TEMPORIZADOS',
      work: 300,
      rest: 30,
      rounds: 2,
    });
  });

  it('should parse Strength with explicit rest', () => {
    expect(parseProtocol('Workout', '4x6 REST 90S', '')).toEqual({
      type: 'STRENGTH',
      name: 'TRABAJO Y DESCANSO',
      work: 120,
      rest: 90,
      rounds: 4,
    });

    expect(parseProtocol('Workout', '5 Series REST 2MIN', '')).toEqual({
      type: 'AMRAP',
      name: 'COUNTDOWN',
      work: 120,
      rest: 0,
      rounds: 1,
    });
  });

  it('should parse Strength NxM', () => {
    expect(parseProtocol('Workout', '4x6 @ 65-70%', '')).toEqual({
      type: 'STRENGTH',
      name: 'FUERZA PROGRAMADA',
      work: 120,
      rest: 90, // Default rest when not inline
      rounds: 4,
    });

    expect(parseProtocol('Workout', '3x8 REST 120', '')).toEqual({
      type: 'STRENGTH',
      name: 'TRABAJO Y DESCANSO',
      work: 120,
      rest: 120,
      rounds: 3,
    });
  });

  it('should handle generic rounds based on block type', () => {
    // METCON defaults to FOR_TIME
    expect(parseProtocol('Workout', '5 RONDAS', 'METCON')).toEqual({
      type: 'FOR_TIME',
      name: 'FOR TIME',
      work: 900, // 15 min default cap
      rest: 0,
      rounds: 5,
    });

    // METCON with explicit cap
    expect(parseProtocol('Workout', '5 RONDAS CAP 20', 'METCON')).toEqual({
      type: 'AMRAP',
      name: 'FOR TIME (A CAP)',
      work: 1200, // Cap overrides
      rest: 0,
      rounds: 1,
    });

    // ACCESSORIES defaults to STRENGTH
    expect(parseProtocol('Workout', '3 Series', 'ACCESSORIES')).toEqual({
      type: 'STRENGTH',
      name: 'ACCESORIOS',
      work: 240, // 12 min cap / 3 rounds
      rest: 60,
      rounds: 3,
    });

    // Generic defaults to STRENGTH
    expect(parseProtocol('Workout', '4 Series alternadas', '')).toEqual({
      type: 'STRENGTH',
      name: 'FUERZA RECOMENDADA',
      work: 120,
      rest: 90,
      rounds: 4,
    });
  });

  it('should parse FOR TIME explicitly', () => {
    expect(parseProtocol('Workout', 'FOR TIME', '')).toEqual({
      type: 'FOR_TIME',
      name: 'POR TIEMPO',
      work: 0,
      rest: 0,
      rounds: 1,
    });
  });

  it('should parse descending rep schemes', () => {
    expect(parseProtocol('Workout', '21-15-9', '')).toEqual({
      type: 'FOR_TIME',
      name: 'POR TIEMPO',
      work: 0,
      rest: 0,
      rounds: 1,
    });
  });

  it('should fallback to STRENGTH for FUERZA or %', () => {
    expect(parseProtocol('Workout', 'Back Squat 80%', '')).toEqual({
      type: 'STRENGTH',
      name: 'FUERZA RECOMENDADA',
      work: 120,
      rest: 90,
      rounds: 4,
    });

    expect(parseProtocol('Fuerza Pura', 'Heavy single', '')).toEqual({
      type: 'STRENGTH',
      name: 'FUERZA RECOMENDADA',
      work: 120,
      rest: 90,
      rounds: 4,
    });
  });

  it('should parse descriptive schemes to L4 Activation', () => {
    expect(parseProtocol('Workout', 'Enfoque Core', '')).toEqual({
      type: 'STRENGTH',
      name: 'ACTIVACIÓN L4',
      work: 120,
      rest: 60,
      rounds: 3,
    });
  });

  it('should fallback to NORMAL for unrecognized schemes', () => {
    expect(parseProtocol('Workout', 'Just run', '')).toEqual({
      type: 'NORMAL',
      name: 'TEMPORIZADOR LIBRE',
      work: 0,
      rest: 60,
      rounds: 1,
    });
  });
});
