/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  roots: ['<rootDir>/src'],

  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.(test|spec).(ts|tsx|js)",
    "<rootDir>/src/**/*.(test|spec).(ts|tsx|js)"
  ],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],

  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx,js,jsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**"
  ],

  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text', 'text-summary'],

  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
};