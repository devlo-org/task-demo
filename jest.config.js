module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageReporters: ['text', 'lcov', 'clover'],
  verbose: true,
  // Ignore TypeScript build errors in tests
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
};
