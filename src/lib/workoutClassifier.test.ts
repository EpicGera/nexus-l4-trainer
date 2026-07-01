import { describe, it, expect } from 'vitest';
import { isCardio, isBodyweightOnly } from './workoutClassifier';

describe('workoutClassifier', () => {
  describe('isCardio', () => {
    it('identifies cardio exercises based on name alone', () => {
      expect(isCardio('Row 500m')).toBe(true);
      expect(isCardio('Run 1 mile')).toBe(true);
      expect(isCardio('Assault Bike')).toBe(true);
      expect(isCardio('Remo')).toBe(true);
      expect(isCardio('DU ')).toBe(true);
      expect(isCardio('Double under')).toBe(true);
      expect(isCardio('Ski Erg')).toBe(true);
      expect(isCardio('Echo Bike')).toBe(true);
      expect(isCardio('Bici')).toBe(true);
      expect(isCardio('Correr')).toBe(true);
      expect(isCardio('Soga')).toBe(true);
      expect(isCardio('50 Cal')).toBe(true);
      expect(isCardio('400 metros')).toBe(true);
      expect(isCardio('400 metres')).toBe(true);
      expect(isCardio('Cardio session')).toBe(true);
      expect(isCardio('Hyrox')).toBe(true);
      expect(isCardio('Monoestructural')).toBe(true);
      expect(isCardio('Monostructural')).toBe(true);
      expect(isCardio('Corriendo')).toBe(true);
      expect(isCardio('Metcon')).toBe(true);
    });

    it('identifies cardio exercises case-insensitively', () => {
      expect(isCardio('row 500m')).toBe(true);
      expect(isCardio('rUn 1 mile')).toBe(true);
      expect(isCardio('REMO')).toBe(true);
    });

    it('identifies cardio exercises based on rawItemHtml', () => {
      expect(isCardio('Unknown Exercise', '<p>Row 500m</p>')).toBe(true);
      expect(isCardio('Unknown Exercise', '<span>Run</span>')).toBe(true);
    });

    it('returns false for non-cardio exercises', () => {
      expect(isCardio('Back Squat')).toBe(false);
      expect(isCardio('Deadlift')).toBe(false);
      expect(isCardio('Bench Press')).toBe(false);
      expect(isCardio('Pull-up')).toBe(false); // Pull-up is in isBodyweightOnly, not isCardio
    });

    it('returns false for empty strings', () => {
      expect(isCardio('')).toBe(false);
      expect(isCardio('', '')).toBe(false);
    });

    it('identifies cardio when both name and html are provided', () => {
      expect(isCardio('Warmup', 'Bike 10 mins')).toBe(true);
    });
  });

  describe('isBodyweightOnly', () => {
    it('identifies bodyweight exercises based on name alone', () => {
      expect(isBodyweightOnly('Burpee')).toBe(true);
      expect(isBodyweightOnly('Pull-up')).toBe(true);
      expect(isBodyweightOnly('Pullup')).toBe(true);
      expect(isBodyweightOnly('Dominada')).toBe(true);
      expect(isBodyweightOnly('Push-up')).toBe(true);
      expect(isBodyweightOnly('Pushup')).toBe(true);
      expect(isBodyweightOnly('Flexion')).toBe(true);
      expect(isBodyweightOnly('Sit-up')).toBe(true);
      expect(isBodyweightOnly('Situp')).toBe(true);
      expect(isBodyweightOnly('Abdominal')).toBe(true);
      expect(isBodyweightOnly('T2B')).toBe(true);
      expect(isBodyweightOnly('Toes to bar')).toBe(true);
      expect(isBodyweightOnly('Muscle-up')).toBe(true);
      expect(isBodyweightOnly('Muscleup')).toBe(true);
      expect(isBodyweightOnly('Air squat')).toBe(true);
      expect(isBodyweightOnly('Soga')).toBe(true);
      expect(isBodyweightOnly('DU ')).toBe(true);
      expect(isBodyweightOnly('Double under')).toBe(true);
      expect(isBodyweightOnly('Handstand')).toBe(true);
      expect(isBodyweightOnly('HSPU')).toBe(true);
      expect(isBodyweightOnly('Pistol')).toBe(true);
      expect(isBodyweightOnly('Zancada')).toBe(true);
      expect(isBodyweightOnly('Lunge')).toBe(true);
      expect(isBodyweightOnly('Crawl')).toBe(true);
      expect(isBodyweightOnly('Chin-up')).toBe(true);
      expect(isBodyweightOnly('Dip')).toBe(true);
      expect(isBodyweightOnly('Fondo')).toBe(true);
    });

    it('identifies bodyweight exercises case-insensitively', () => {
      expect(isBodyweightOnly('burpee')).toBe(true);
      expect(isBodyweightOnly('PULL-UP')).toBe(true);
    });

    it('identifies bodyweight exercises based on rawItemHtml', () => {
      expect(isBodyweightOnly('Unknown', '<p>Burpees over bar</p>')).toBe(true);
    });

    it('returns false for non-bodyweight exercises', () => {
      expect(isBodyweightOnly('Back Squat')).toBe(false);
      expect(isBodyweightOnly('Row')).toBe(false);
    });
  });
});
