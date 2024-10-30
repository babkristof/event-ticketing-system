import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/test/unit/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js', 'json'],
};

export default config;
