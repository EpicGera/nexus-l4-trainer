import { describe, it, expect } from 'vitest';
import { getCleanExerciseName } from './historyUtils';

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
