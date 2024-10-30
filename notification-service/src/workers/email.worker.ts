import { Worker } from 'bullmq';
import {redisConfig} from '../config/config';
import { sendEmail } from '../services/email.service';
import { EmailData, emailDataSchema } from '../schemas/email.schema';
import logger from "../config/logger";

const emailWorker = new Worker<EmailData>('emailQueue', async job => {
    logger.info(`Processing job ${job.id} of type ${job.name}`, { jobData: job.data });
    try {
        const emailData = emailDataSchema.parse(job.data);
        await sendEmail(emailData);
        logger.info(`Successfully processed job ${job.id}`);
    } catch (err) {
        logger.error(`Failed to process job ${job.id}`, err);
        throw err;
    }
}, { connection: redisConfig });

emailWorker.on('failed', (job, err) => {
    if (job) {
        logger.error(`Job failed: ${job.id}`, { error: err });
    } else {
        logger.error('An undefined job failed', { error: err });
    }
});

emailWorker.on('completed', job => {
    logger.info(`Job completed successfully: ${job.id}`);
});
export default emailWorker;