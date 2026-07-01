import { describe, it, expect } from 'vitest';
import { getCleanExerciseName, isCueOrNote } from './historyUtils';

describe('isCueOrNote', () => {
    it('flags coaching cues that open with a label + colon', () => {
        expect(isCueOrNote('Foco: Fuerza base para soltar las bandas elásticas. Cero kipping.')).toBe(true);
        expect(isCueOrNote('Nota: mantené la espalda neutra')).toBe(true);
        expect(isCueOrNote('Objetivo: técnica impecable')).toBe(true);
        expect(isCueOrNote('Enfoque: cadena posterior')).toBe(true);
        expect(isCueOrNote('<strong>Tip:</strong> respirá en la bajada')).toBe(true);
        expect(isCueOrNote('  ')).toBe(true); // empty/blank is never a movement
    });

    it('flags cues with a leading emoji / bullet before the label', () => {
        expect(isCueOrNote('🎯 Foco: Rodillas activas.')).toBe(true);
        expect(isCueOrNote('✦ Nota: respiración 2s')).toBe(true);
    });

    it('flags bracket-wrapped labels like [NOTA]: and [TIP]:', () => {
        expect(isCueOrNote('[NOTA]: Particioná T2B desde la primera ronda: 12-9 en el 21, 8-7 en el 15.')).toBe(true);
        expect(isCueOrNote('[NOTA]: Uso obligatorio de Straps para anular la fatiga de los flexores del antebrazo.')).toBe(true);
        expect(isCueOrNote('[TIP]: respirá en la bajada')).toBe(true);
        expect(isCueOrNote('[IMPORTANTE]: no soltar la barra')).toBe(true);
    });

    it('flags items that are wholly a cue span (the data marker)', () => {
        expect(isCueOrNote("<span class='cue'>🎯 Foco: Romper la inercia sin doblar la espalda.</span>")).toBe(true);
        expect(isCueOrNote('<span class="cue">Lavado de ácido láctico para descargar el SNC</span>')).toBe(true);
    });

    it('flags rep-scheme header lines that end with a colon', () => {
        expect(isCueOrNote('21 - 15 - 9 Reps de:')).toBe(true);
    });

    it('does NOT flag a real movement that carries an inline cue span', () => {
        expect(isCueOrNote("10 Air Squats (Temp 3011) <span class='cue'>🎯 Foco: Rodillas activas.</span>")).toBe(false);
    });

    it('flags group/collective instructions (grupal, de equipo, en equipo)', () => {
        expect(isCueOrNote('Calentamiento grupal')).toBe(true);
        expect(isCueOrNote('Calentamiento de equipo')).toBe(true);
        expect(isCueOrNote('Juegos de calentamiento en equipo')).toBe(true);
    });

    it('flags prohibitions / rules', () => {
        expect(isCueOrNote('Prohibido agitarse')).toBe(true);
        expect(isCueOrNote('Prohibida la compensación lumbar')).toBe(true);
    });

    it('flags instructional prefixes (Práctica de, Sincronización de)', () => {
        expect(isCueOrNote('Práctica de transiciones y pesos')).toBe(true);
        expect(isCueOrNote('Sincronización de movimientos y estrategia de pacing con la pareja')).toBe(true);
    });

    it('flags meta-coaching imperatives (Entrenar la/el [concept])', () => {
        expect(isCueOrNote('Entrenar la frustración si hay tropiezos')).toBe(true);
        expect(isCueOrNote('Entrenar el pacing interno')).toBe(true);
    });

    it('flags multi-sentence motivational notes (period + uppercase outside parens)', () => {
        expect(isCueOrNote('Última semana de intensidad máxima antes del deload. A vaciarse.')).toBe(true);
    });

    it('flags cue keyword at start (with or without colon): "Foco en X", "Foco: X", "Enfoque de X"', () => {
        expect(isCueOrNote('Foco en verticalidad del torso, velocidad de subida, sin esfuerzo máximo')).toBe(true);
        expect(isCueOrNote('Enfoque de cadera al frente')).toBe(true);
        expect(isCueOrNote('Objetivo: mantener la espalda neutra')).toBe(true);
    });

    it('flags tempo prescriptions ("Tempo 21X1: …")', () => {
        expect(isCueOrNote('Tempo 21X1: Construcción de fuerza pura.')).toBe(true);
        expect(isCueOrNote('Tempo 21X1: Baja en 2s, pausa 1s, sube rápido.')).toBe(true);
        expect(isCueOrNote('Tempo 3010: bajar lento')).toBe(true);
    });

    it('flags week-level annotations ("Semana …")', () => {
        expect(isCueOrNote('Semana más pesada, usar cinturón si es necesario')).toBe(true);
        expect(isCueOrNote('Semana de intensificación máxima')).toBe(true);
    });

    it('flags conditional coaching hedges ("si es necesario")', () => {
        expect(isCueOrNote('Usar cinturón si es necesario')).toBe(true);
    });

    it('flags CERO prohibition directive', () => {
        expect(isCueOrNote('CERO llegar al fallo muscular, puramente sanguíneo')).toBe(true);
    });

    it('flags "Puramente X" intensity directive', () => {
        expect(isCueOrNote('Puramente postural, nada pesado')).toBe(true);
    });

    it('flags gerund-start coaching: "Puliendo la X", "Trabajando el X"', () => {
        expect(isCueOrNote('Puliendo la velocidad de caída')).toBe(true);
        expect(isCueOrNote('Trabajando el pacing interno')).toBe(true);
        expect(isCueOrNote('Mejorando la sincronización de brazos')).toBe(true);
    });

    it('does NOT flag movement gerunds (caminando, corriendo, saltando + no article)', () => {
        expect(isCueOrNote('Caminando Lunges')).toBe(false);
        expect(isCueOrNote('Corriendo 400m')).toBe(false);
    });

    it('flags completion/milestone notes', () => {
        expect(isCueOrNote('Ciclo 2: Sun-Ken Rock Completado.')).toBe(true);
        expect(isCueOrNote('Bloque completado con éxito')).toBe(true);
    });

    it('flags social warmup markers (risas)', () => {
        expect(isCueOrNote('Juegos y risas con la banda')).toBe(true);
    });

    it('flags EMOM rest minutes ("Min 3: Descanso", "Min 4: Rest")', () => {
        expect(isCueOrNote('Min 3: Descanso')).toBe(true);
        expect(isCueOrNote('Descanso')).toBe(true);
        expect(isCueOrNote('Descanso activo')).toBe(true);
        expect(isCueOrNote('Min 4: Rest')).toBe(true);
    });

    it('does NOT flag real exercises that contain descanso mid-text', () => {
        // "descanso" at end → cue; mid-text on a named exercise is unusual and
        // the end-anchor prevents false positives for "Squat con descanso isométrico"
        expect(isCueOrNote('Min 1: 10 Cal Row suaves')).toBe(false);
        expect(isCueOrNote('Min 2: 8 Push-ups fáciles')).toBe(false);
    });

    it('does NOT flag real movements (including timed/labelled exercise lines)', () => {
        expect(isCueOrNote('5x3 Pull-ups Excéntricos (Bajada de 4 segundos)')).toBe(false);
        expect(isCueOrNote('Strict Press con Barra - 4x5')).toBe(false);
        expect(isCueOrNote('Min 1: 8 Deadlifts')).toBe(false); // time label, not a cue
        expect(isCueOrNote('Farmer Carry Muy Pesado - 40 Metros')).toBe(false);
        expect(isCueOrNote('400m Run')).toBe(false);
        expect(isCueOrNote('Toes-to-Bar (Aprovechar el skill, tirar 12-9, 8-7, etc.)')).toBe(false);
    });
});

describe('getCleanExerciseName', () => {
    it('should strip HTML tags', () => {
        expect(getCleanExerciseName('<strong>Deadlift</strong>')).toBe('Deadlift');
        expect(getCleanExerciseName('<p>Squat</p>')).toBe('Squat');
        expect(getCleanExerciseName('Bench Press<br/>')).toBe('Bench Press');
    });

    it('should strip reps and times at the start', () => {
        expect(getCleanExerciseName('15 Box Step-overs')).toBe('Box Step-overs');
        expect(getCleanExerciseName('Min 1: 8 Deadlifts')).toBe('Deadlifts');
        expect(getCleanExerciseName('4x4 Squats')).toBe('Squats');
        expect(getCleanExerciseName('10 reps Pushups')).toBe('Pushups');
        expect(getCleanExerciseName('12/10 calories Rowing')).toBe('Rowing');
    });

    it('should strip parenthesized text with "barra" or "kg"', () => {
        expect(getCleanExerciseName('Deadlift (con barra)')).toBe('Deadlift');
        expect(getCleanExerciseName('Squat (100kg)')).toBe('Squat');
        expect(getCleanExerciseName('Bench Press (barra)')).toBe('Bench Press');
        expect(getCleanExerciseName('Row (50 kg)')).toBe('Row');
    });

    it('should strip weight indicators with "@"', () => {
        expect(getCleanExerciseName('Bench @ 80%')).toBe('Bench');
        expect(getCleanExerciseName('Squat @100kg')).toBe('Squat');
        expect(getCleanExerciseName('Deadlift @ 70% (1RM)')).toBe('Deadlift');
        expect(getCleanExerciseName('Overhead Press @-5%')).toBe('Overhead Press');
    });

    it('should strip long parentheses (instructions > 15 chars)', () => {
        expect(getCleanExerciseName('Pullups (very long instruction inside here)')).toBe('Pullups');
        expect(getCleanExerciseName('Curls (slow eccentric phase)')).toBe('Curls');
    });

    it('should keep short parentheses that are not weights or instructions', () => {
        expect(getCleanExerciseName('Lunge (Left)')).toBe('Lunge (Left)');
        expect(getCleanExerciseName('Lunge (Right)')).toBe('Lunge (Right)');
    });

    it('should handle multiple cleanups at once', () => {
        expect(getCleanExerciseName('<p>Min 1: 8 Deadlifts (con barra) @ 80%</p>')).toBe('Deadlifts');
        expect(getCleanExerciseName('15 Squats (100kg) (slow eccentric phase)')).toBe('Squats');
    });

    it('should return empty string if only removed parts are provided', () => {
        expect(getCleanExerciseName('<p></p>')).toBe('');
        expect(getCleanExerciseName('15 reps')).toBe('');
        expect(getCleanExerciseName('(con barra)')).toBe('');
    });

    it('should not modify a clean exercise name', () => {
        expect(getCleanExerciseName('Deadlift')).toBe('Deadlift');
        expect(getCleanExerciseName('Squat')).toBe('Squat');
        expect(getCleanExerciseName('Pullups')).toBe('Pullups');
    });
});
