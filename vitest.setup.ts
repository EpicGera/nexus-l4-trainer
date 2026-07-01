import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase config to avoid invalid-api-key errors during tests
vi.mock('./src/lib/firebase', () => ({
  db: {},
  auth: {},
  googleProvider: {},
  googleSignIn: vi.fn(),
  getAccessToken: vi.fn(),
}));

vi.mock('jspdf', () => ({
  jsPDF: vi.fn(() => ({
    text: vi.fn(),
    save: vi.fn(),
    addPage: vi.fn(),
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    setFont: vi.fn(),
    rect: vi.fn(),
    setFillColor: vi.fn(),
    setDrawColor: vi.fn(),
    setLineWidth: vi.fn(),
  })),
}));

vi.mock('html-to-image', () => ({
  toPng: vi.fn(() => Promise.resolve('data:image/png;base64,mock')),
}));
