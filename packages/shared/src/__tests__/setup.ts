// Global test setup for shared package
import 'jest';

// Mock date-fns functions if needed for consistent testing
jest.mock('date-fns', () => {
  const originalModule = jest.requireActual('date-fns');
  return {
    ...originalModule,
    // Keep original implementations but allow for mocking when needed
  };
});

// Extend Jest matchers if needed
declare global {
  namespace jest {
    interface Matchers<R> {
      // Add custom matchers here if needed
    }
  }
}