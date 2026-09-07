/** Unit tests cover the deterministic engines only — they are pure TS, no RN runtime. */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts'],
};
