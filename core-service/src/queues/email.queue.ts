import {JobsOptions, Queue} from 'bullmq';
import  config  from '../config/config';
import { EmailJobData } from '../types/email';

export const emailJobOptions: JobsOptions= {
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 5000,
    },
}
export const emailQueue = new Queue<EmailJobData>('emailQueue', { connection: { host: config.redis.host, port: config.redis.port }, ...emailJobOptions });

export const addEmailJob = async (emailData: EmailJobData) => {
    await emailQueue.add('sendEmail', emailData, {
        attempts: 3,
    });
};