import { describe, it, expect } from 'vitest';

export function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  // Brzycki formula
  return weight * (36 / (37 - reps));
}

describe('Brzycki Calculator', () => {
    it('should return the weight if reps is 1', () => {
        expect(calculate1RM(100, 1)).toBe(100);
    });

    it('should calculate 1RM correctly for multiple reps', () => {
        const oneRM = calculate1RM(100, 5);
        expect(oneRM).toBeCloseTo(112.5); // 100 * (36 / 32) = 112.5
    });
});
