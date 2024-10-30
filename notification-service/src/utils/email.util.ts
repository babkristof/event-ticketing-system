import nodemailer, { Transporter } from 'nodemailer';
import { emailConfig } from "../config/config";
import logger from "../config/logger";

let transporter: Transporter | null = null;

export const getTransporter = (): Transporter => {
    if (!transporter) {
        logger.info('Initializing email transporter');
        try {
            transporter = nodemailer.createTransport({
                host: emailConfig.host,
                port: emailConfig.port,
                auth: emailConfig.auth,
                secure: emailConfig.secure,
            });
            logger.info('Email transporter initialized');
        } catch (err) {
            logger.error('Failed to initialize email transporter', { error: err });
            throw err;
        }
    }
    return transporter;
};