import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/HttpException';
import logger from '../config/logger';
import { ErrorResponse } from '../types/errorResponse';

export const errorMiddleware = (error: HttpException, req: Request, res: Response, _next: NextFunction) => {
    const statusCode = error.statusCode || 500;
    let response: ErrorResponse = {
        message: error.message,
        errorCode: error.errorCode || 'UNKNOWN_ERROR'
    };
    if (error.errors) {
        response.errors = error.errors;
    }

    logger.error(`[${req.method}] ${req.url} - ${statusCode} - ${error.message}`);
    if (process.env.NODE_ENV === 'development') {
        logger.debug(`Stack trace: ${error.stack}`);
    }

    res.status(statusCode).json(response);
};
