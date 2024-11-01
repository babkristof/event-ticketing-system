import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/integration/**/*.test.ts'],
  globalSetup: '<rootDir>/test/integration/utils/globalSetup.ts',
  globalTeardown: '<rootDir>/test/integration/utils/globalTeardown.ts',
  collectCoverage: true,
  coverageDirectory: 'coverage/integration'
};

export default config;
