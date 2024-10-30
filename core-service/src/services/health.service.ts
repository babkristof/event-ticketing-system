import Redis from 'ioredis';
import {getPrismaClient} from "../database/prismaClient";
import logger from "../config/logger";

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const checkDatabase = async (): Promise<'up' | 'down'> => {
    try {
        await getPrismaClient().$queryRaw`SELECT 1`;
        return 'up';
    } catch(error) {
        logger.error('Database health check: down', { error });
        return 'down';
    }
};

export const checkRedis = async (): Promise<'up' | 'down'> => {
    try {
        await redisClient.ping();
        return 'up';
    } catch(error) {
        logger.error('Redis health check: down', { error });
        return 'down';
    }
};

export const getHealthStatus = async () => {
    const [database, redis] = await Promise.all([checkDatabase(), checkRedis()]);
    const status = database === 'up' && redis === 'up' ? 'healthy' : 'unhealthy';
    logger.info('Health check completed', { status, database, redis });

    return {
        status,
        database,
        redis,
    };
};