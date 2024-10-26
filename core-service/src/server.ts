import app from './app';
import config from './config/config';
import logger from './config/logger';
import {getPrismaClient} from './database/prismaClient';

app.listen(config.port, () => {
  logger.info(`Server is running on port ${config.port}`);
});

process.on('SIGINT', async () => {
  logger.debug('SIGINT signal received: closing HTTP server');
  await getPrismaClient().$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.debug('SIGTERM signal received: closing HTTP server');
  await getPrismaClient().$disconnect();
  process.exit(0);
});
