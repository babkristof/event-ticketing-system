import { getDbContainer, getRedisContainer } from './container.singleton';
import { getPrismaClient } from '../../../src/database/prismaClient';
import { execSync } from 'node:child_process';

export default async () => {
  await getRedisContainer();
  const dbContainer = await getDbContainer();
  const dbHost = dbContainer.getHost();
  const dbPort = dbContainer.getMappedPort(5432);
  const userName = dbContainer.getUsername();
  const password = dbContainer.getPassword();
  process.env.DATABASE_URL = `postgresql://${userName}:${password}@${dbHost}:${dbPort}/testdb`;

  await getPrismaClient().$connect();
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
};
