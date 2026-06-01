import { render } from '@testing-library/react';
import ExerciseLogger from './ExerciseLogger';
import { expect, test } from 'vitest';

test('ExerciseLogger sanitizes rawItemHtml', () => {
  const malicousHtml = '<img src=x onerror=alert(1)>';
  const { container } = render(<ExerciseLogger dayId="1" exerciseName="Squat" rawItemHtml={malicousHtml} />);
  expect(container.innerHTML).not.toContain('onerror');
});
