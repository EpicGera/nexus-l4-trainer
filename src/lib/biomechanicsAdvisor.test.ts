import { describe, it, expect } from 'vitest';
import { getSuggestedRpe } from './biomechanicsAdvisor';

describe('getSuggestedRpe', () => {
  it('should return null for empty weight input', () => {
    expect(getSuggestedRpe('', 100)).toBeNull();
  });

  it('should return null for invalid max weight', () => {
    expect(getSuggestedRpe('100', 0)).toBeNull();
    expect(getSuggestedRpe('100', -10)).toBeNull();
  });

  it('should return null for invalid parsed weight', () => {
    expect(getSuggestedRpe('abc', 100)).toBeNull();
    expect(getSuggestedRpe('-10', 100)).toBeNull();
  });

  it('should parse weight input correctly', () => {
    // 50 / 100 = 50% => "5"
    expect(getSuggestedRpe('50kg', 100)).toEqual({ rpe: '5', percentage: 50 });
    expect(getSuggestedRpe('50.5 lbs', 100)).toEqual({ rpe: '5', percentage: 51 });
  });

  describe('RPE mappings based on percentage', () => {
    it('should suggest RPE 10 for PR Overload (>= 105%)', () => {
      expect(getSuggestedRpe('105', 100)).toEqual({ rpe: '10', percentage: 105 });
      expect(getSuggestedRpe('110', 100)).toEqual({ rpe: '10', percentage: 110 });
    });

    it('should suggest RPE 10 for PR (>= 100%)', () => {
      expect(getSuggestedRpe('100', 100)).toEqual({ rpe: '10', percentage: 100 });
      expect(getSuggestedRpe('104', 100)).toEqual({ rpe: '10', percentage: 104 });
    });

    it('should suggest RPE 9.5 for >= 95%', () => {
      expect(getSuggestedRpe('95', 100)).toEqual({ rpe: '9.5', percentage: 95 });
      expect(getSuggestedRpe('99', 100)).toEqual({ rpe: '9.5', percentage: 99 });
    });

    it('should suggest RPE 9 for >= 90%', () => {
      expect(getSuggestedRpe('90', 100)).toEqual({ rpe: '9', percentage: 90 });
      expect(getSuggestedRpe('94', 100)).toEqual({ rpe: '9', percentage: 94 });
    });

    it('should suggest RPE 8.5 for >= 85%', () => {
      expect(getSuggestedRpe('85', 100)).toEqual({ rpe: '8.5', percentage: 85 });
      expect(getSuggestedRpe('89', 100)).toEqual({ rpe: '8.5', percentage: 89 });
    });

    it('should suggest RPE 8 for >= 80%', () => {
      expect(getSuggestedRpe('80', 100)).toEqual({ rpe: '8', percentage: 80 });
      expect(getSuggestedRpe('84', 100)).toEqual({ rpe: '8', percentage: 84 });
    });

    it('should suggest RPE 7.5 for >= 75%', () => {
      expect(getSuggestedRpe('75', 100)).toEqual({ rpe: '7.5', percentage: 75 });
      expect(getSuggestedRpe('79', 100)).toEqual({ rpe: '7.5', percentage: 79 });
    });

    it('should suggest RPE 7 for >= 70%', () => {
      expect(getSuggestedRpe('70', 100)).toEqual({ rpe: '7', percentage: 70 });
      expect(getSuggestedRpe('74', 100)).toEqual({ rpe: '7', percentage: 74 });
    });

    it('should suggest RPE 6.5 for >= 65%', () => {
      expect(getSuggestedRpe('65', 100)).toEqual({ rpe: '6.5', percentage: 65 });
      expect(getSuggestedRpe('69', 100)).toEqual({ rpe: '6.5', percentage: 69 });
    });

    it('should suggest RPE 6 for >= 60%', () => {
      expect(getSuggestedRpe('60', 100)).toEqual({ rpe: '6', percentage: 60 });
      expect(getSuggestedRpe('64', 100)).toEqual({ rpe: '6', percentage: 64 });
    });

    it('should suggest RPE 5 for >= 50%', () => {
      expect(getSuggestedRpe('50', 100)).toEqual({ rpe: '5', percentage: 50 });
      expect(getSuggestedRpe('59', 100)).toEqual({ rpe: '5', percentage: 59 });
    });

    it('should suggest RPE 4 for < 50%', () => {
      expect(getSuggestedRpe('49', 100)).toEqual({ rpe: '4', percentage: 49 });
      expect(getSuggestedRpe('10', 100)).toEqual({ rpe: '4', percentage: 10 });
    });
  });
});
