import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/HttpException';
import logger from '../config/logger';
import config from '../config/config';
import { ErrorResponse } from '../types/errorResponse';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware = (error: HttpException, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = error.statusCode || 500;
  const response: ErrorResponse = {
    message: error.message,
    errorCode: error.errorCode || 'UNKNOWN_ERROR'
  };
  if (error.errors) {
    response.errors = error.errors;
  }

  logger.error(`[${req.method}] ${req.url} - ${statusCode} - ${error.message}`);
  if (config.env === 'development') {
    logger.debug(`Stack trace: ${error.stack}`);
  }

  res.status(statusCode).json(response);
};
