import { describe, it, expect } from 'vitest';
import { parseProtocol } from './protocolParser';

describe('parseProtocol', () => {
  it('should parse WARMUP protocol correctly', () => {
    expect(parseProtocol('Warm-up 1', '15 Minutos', 'WARMUP')).toEqual({
      type: 'INTERVAL',
      name: 'PUESTA A PUNTO L4',
      work: 900, // 15 * 60
      rest: 90,
      rounds: 1,
    });

    expect(parseProtocol('Calentamiento', '', '')).toEqual({
      type: 'INTERVAL',
      name: 'PUESTA A PUNTO L4',
      work: 600, // default 10 minutes
      rest: 90,
      rounds: 1,
    });
  });

  it('should parse MOBILITY protocol correctly', () => {
    expect(parseProtocol('Movilidad', '10 Minutos', '')).toEqual({
      type: 'INTERVAL',
      name: 'MOVILIDAD L4',
      work: 600,
      rest: 60,
      rounds: 1,
    });
  });

  it('should parse TABATA protocol correctly', () => {
    expect(parseProtocol('Workout', 'Tabata something', 'METCON')).toEqual({
      type: 'INTERVAL',
      name: 'TABATA (CARIOCAS)',
      work: 20,
      rest: 10,
      rounds: 8,
    });
  });

  it('should parse INTERVALS correctly (ON/OFF)', () => {
    expect(parseProtocol('Workout', '40" ON / 20" OFF x 8', 'METCON')).toEqual({
      type: 'INTERVAL',
      name: 'INTERVALOS',
      work: 40,
      rest: 20,
      rounds: 8,
    });

    expect(parseProtocol('Workout', '4 MIN ON / 1 MIN OFF X 4 RONDAS', 'METCON')).toEqual({
      type: 'INTERVAL',
      name: 'INTERVALOS',
      work: 240,
      rest: 60,
      rounds: 4,
    });
  });

  it('should parse EMOM / E2MOM correctly', () => {
    expect(parseProtocol('Workout', 'E2MOM x 6', 'METCON')).toEqual({
      type: 'EMOM',
      name: 'E2MOM',
      work: 120,
      rest: 0,
      rounds: 6,
    });

    expect(parseProtocol('Workout', 'EVERY 2:30 X 10', 'METCON')).toEqual({
      type: 'EMOM',
      name: 'EVERY BLOCK',
      work: 150,
      rest: 0,
      rounds: 10,
    });

    expect(parseProtocol('Workout', 'EMOM 15 MIN', 'METCON')).toEqual({
      type: 'EMOM',
      name: 'EMOM',
      work: 60,
      rest: 0,
      rounds: 15,
    });
  });

  it('should parse TIME CAPS correctly', () => {
    expect(parseProtocol('Workout', 'TIME CAP 15:30', 'METCON')).toEqual({
      type: 'AMRAP',
      name: 'FOR TIME (A CAP)',
      work: 15 * 60 + 30, // 930
      rest: 0,
      rounds: 1,
    });

    expect(parseProtocol('Workout', '10 MIN CAP', 'METCON')).toEqual({
      type: 'AMRAP',
      name: 'FOR TIME (A CAP)',
      work: 600,
      rest: 0,
      rounds: 1,
    });
  });

  it('should parse AMRAP correctly', () => {
    expect(parseProtocol('Workout', 'AMRAP 12 MIN', 'METCON')).toEqual({
      type: 'AMRAP',
      name: 'AMRAP',
      work: 720, // 12 * 60
      rest: 0,
      rounds: 1,
    });
  });

  it('should parse Continuous Minutes correctly', () => {
    expect(parseProtocol('Workout', '35 Minutos Continuos', 'METCON')).toEqual({
      type: 'AMRAP',
      name: 'COUNTDOWN',
      work: 35 * 60, // 2100
      rest: 0,
      rounds: 1,
    });

    expect(parseProtocol('Workout', '10 Minutos Zona 2 | 2 Rondas', 'METCON')).toEqual({
      type: 'INTERVAL',
      name: 'BLOQUES TEMPORIZADOS',
      work: 300, // 600 / 2
      rest: 30,
      rounds: 2,
    });
  });

  it('should parse REST explicit correctly', () => {
    expect(parseProtocol('Workout', 'REST 90S, 4 RONDAS', 'STRENGTH')).toEqual({
      type: 'STRENGTH',
      name: 'TRABAJO Y DESCANSO',
      work: 0,
      rest: 90,
      rounds: 4,
    });

    expect(parseProtocol('Workout', 'REST 2 MIN, 4x5', 'STRENGTH')).toEqual({
      type: 'STRENGTH',
      name: 'TRABAJO Y DESCANSO',
      work: 0,
      rest: 120,
      rounds: 4,
    });
  });

  it('should parse NxM Strength patterns correctly', () => {
    expect(parseProtocol('Workout', '4x6 @ 65-70%', 'STRENGTH')).toEqual({
      type: 'STRENGTH',
      name: 'FUERZA PROGRAMADA',
      work: 0,
      rest: 90, // default rest
      rounds: 4,
    });

    expect(parseProtocol('Workout', '4x8 | REST 120', 'STRENGTH')).toEqual({
      type: 'STRENGTH',
      name: 'FUERZA PROGRAMADA',
      work: 0,
      rest: 120,
      rounds: 4,
    });
  });

  it('should parse General Rounds correctly depending on block', () => {
    expect(parseProtocol('Workout', '5 Rondas', 'METCON')).toEqual({
      type: 'FOR_TIME',
      name: 'FOR TIME',
      work: 900, // 15 min default cap
      rest: 0,
      rounds: 5,
    });

    expect(parseProtocol('Workout', '3 Series', 'ACCESSORIES')).toEqual({
      type: 'STRENGTH',
      name: 'ACCESORIOS',
      work: 240, // 12 * 60 / 3
      rest: 60,
      rounds: 3,
    });

    expect(parseProtocol('Workout', '4 Rondas', 'STRENGTH')).toEqual({
      type: 'STRENGTH',
      name: 'FUERZA RECOMENDADA',
      work: 0,
      rest: 90,
      rounds: 4,
    });
  });

  it('should parse FOR TIME explicitly', () => {
    expect(parseProtocol('Workout', 'FOR TIME', 'METCON')).toEqual({
      type: 'FOR_TIME',
      name: 'POR TIEMPO',
      work: 0,
      rest: 0,
      rounds: 1,
    });
  });

  it('should parse descending rep schemes correctly', () => {
    expect(parseProtocol('Workout', '21-15-9', 'METCON')).toEqual({
      type: 'FOR_TIME',
      name: 'POR TIEMPO',
      work: 0,
      rest: 0,
      rounds: 1,
    });
  });

  it('should fallback to FUERZA correctly', () => {
    expect(parseProtocol('Fuerza', 'Some scheme', '')).toEqual({
      type: 'STRENGTH',
      name: 'FUERZA RECOMENDADA',
      work: 0,
      rest: 90,
      rounds: 4,
    });

    expect(parseProtocol('Workout', '100% RM', '')).toEqual({
      type: 'STRENGTH',
      name: 'FUERZA RECOMENDADA',
      work: 0,
      rest: 90,
      rounds: 4,
    });
  });

  it('should parse Descriptive schemes with defaults', () => {
    expect(parseProtocol('Workout', 'Enfoque Core', '')).toEqual({
      type: 'STRENGTH',
      name: 'ACTIVACIÓN L4',
      work: 0,
      rest: 60,
      rounds: 3,
    });
  });

  it('should return fallback default for unknown schemes', () => {
    expect(parseProtocol('Random', 'Something else entirely', 'Unknown')).toEqual({
      type: 'NORMAL',
      name: 'TEMPORIZADOR LIBRE',
      work: 0,
      rest: 60,
      rounds: 1,
    });
  });
});
