import { Worker } from 'bullmq';
import { redisConfig } from '../config/config';
import { sendEmail } from '../services/email.service';
import { EmailData, emailDataSchema } from '../schemas/email.schema';

const emailWorker = new Worker<EmailData>('emailQueue', async job => {
    try {
        const emailData = emailDataSchema.parse(job.data);
        await sendEmail(emailData);
    } catch (err) {
        console.error(`Failed to process job ${job.id}`, err);
        throw err;
    }
}, { connection: redisConfig });

emailWorker.on('failed', (job, err) => {
    if (job) {
        console.error(`Job failed: ${job.id}`, err);
    } else {
        console.error(`Undefined job failed`, err);
    }});

export default emailWorker;