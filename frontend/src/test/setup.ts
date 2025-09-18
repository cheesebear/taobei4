import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// Mock fetch for API tests
global.fetch = vi.fn();

// Setup test environment
beforeEach(() => {
  vi.clearAllMocks();
});
