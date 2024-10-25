import dotenv from 'dotenv';

dotenv.config();

const config = {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL
}

if (!config.databaseUrl) {
    throw new Error('DATABASE_URL is not defined in the environment');
}
export default config;