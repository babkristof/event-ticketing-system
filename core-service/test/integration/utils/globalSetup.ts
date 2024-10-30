import { getContainer } from './container.singleton';
import { getPrismaClient } from '../../../src/database/prismaClient';
import { execSync } from 'node:child_process';

export default async () => {
  const container = await getContainer();
  const dbHost = container.getHost();
  const dbPort = container.getMappedPort(5432);
  const userName = container.getUsername();
  const password = container.getPassword();
  process.env.DATABASE_URL = `postgresql://${userName}:${password}@${dbHost}:${dbPort}/testdb`;

  await getPrismaClient().$connect();
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
};