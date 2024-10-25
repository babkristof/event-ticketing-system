import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL as string,
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: process.env.JWT_EXPIRES_IN
  },
  saltRounds: process.env.SALT_ROUNDS
};

if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is not defined in the environment');
}
if (!config.jwt.secret) {
  throw new Error('JWT_SECRET is not defined in the environment');
}
export default config;
