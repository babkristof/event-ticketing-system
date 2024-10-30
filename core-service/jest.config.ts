import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/test/unit/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    collectCoverage: true,
    coverageDirectory: 'coverage/unit',
    collectCoverageFrom: [
        'src/**/*.{ts,js}',
        '!src/**/*.d.ts',
        '!src/**/server.ts'
    ],
};

export default config;
