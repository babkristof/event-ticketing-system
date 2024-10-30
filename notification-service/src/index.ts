import emailWorker from './workers/email.worker';
import logger from "./config/logger";

logger.info('Starting email worker...');
emailWorker.run().catch(err => {
    logger.error('Worker failed to start:', err);
});
