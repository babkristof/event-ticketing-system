import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';

let containerInstance: StartedPostgreSqlContainer | null = null;

export async function getContainer(): Promise<StartedPostgreSqlContainer> {
  if (!containerInstance) {
    containerInstance = await new PostgreSqlContainer('postgres:17.0')
      .withDatabase('testdb')
      .withUsername('testuser')
      .withPassword('testpassword')
      .start();
  }
  return containerInstance;
}

export async function stopContainer(): Promise<void> {
  if (containerInstance) {
    await containerInstance.stop();
    containerInstance = null;
  }
}
