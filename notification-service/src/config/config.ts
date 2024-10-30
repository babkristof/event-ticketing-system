import {RedisOptions} from 'bullmq';
import * as dotenv from 'dotenv';
import * as process from "node:process";
dotenv.config();

export const config = {
    env: process.env.NODE_ENV || 'development',
}

export const redisConfig: RedisOptions = {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379')
};

export const emailConfig = {
    host: process.env.EMAIL_HOST || 'localhost',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    auth: process.env.NODE_ENV === 'production' ? {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    } : undefined,
    secure: process.env.NODE_ENV === 'production',
};