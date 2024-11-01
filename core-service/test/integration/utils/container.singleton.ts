import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { GenericContainer, StartedTestContainer } from 'testcontainers';

let postgresContainer: StartedPostgreSqlContainer | null = null;
let redisContainer: StartedTestContainer | null = null;

export async function getDbContainer(): Promise<StartedPostgreSqlContainer> {
  if (!postgresContainer) {
    postgresContainer = await new PostgreSqlContainer('postgres:17.0')
      .withDatabase('testdb')
      .withUsername('testuser')
      .withPassword('testpassword')
      .start();
  }
  return postgresContainer;
}

export async function getRedisContainer(): Promise<StartedTestContainer> {
  if (!redisContainer) {
    redisContainer = await new GenericContainer('redis:7').withExposedPorts(6379).start();
  }
  process.env.REDIS_PORT = redisContainer.getFirstMappedPort().toString();
  return redisContainer;
}

export async function stopContainers(): Promise<void> {
  if (postgresContainer) {
    await postgresContainer.stop();
    postgresContainer = null;
  }
  if (redisContainer) {
    await redisContainer.stop();
    redisContainer = null;
  }
}
