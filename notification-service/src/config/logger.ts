import winston from 'winston';
import path from 'path';
import 'winston-daily-rotate-file';
import {config} from './config';

const logDirectory = path.join(__dirname, '..', '..', 'logs');

const winstonFormat = winston.format.printf((obj) => {
    const { level, message, timestamp, stack } = obj;
    return `${timestamp}: ${level}: ${stack || message}`;
});
const logger = winston.createLogger({
    level: config.env === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winstonFormat,
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        }),

        new winston.transports.DailyRotateFile({
            filename: path.join(logDirectory, 'app-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
        }),

        new winston.transports.DailyRotateFile({
            filename: path.join(logDirectory, 'error-%DATE%.log'),
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
        }),
    ],
});

export default logger;