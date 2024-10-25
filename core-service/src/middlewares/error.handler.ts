import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/HttpException';
import { ZodError } from 'zod';
import { BadRequestException } from '../exceptions/BadRequestException';
import { InternalException } from '../exceptions/InternalException';
import logger from '../config/logger';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const errorHandler = (method: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await method(req, res, next);
    } catch (error: unknown) {
      let exception: HttpException;
      if (error instanceof HttpException) {
        exception = error;
      } else if (error instanceof ZodError) {
        logger.debug(`Validation error for [${req.method}] ${req.url} - ${JSON.stringify(error.errors)}`);
        exception = new BadRequestException('Request validation failed');
      } else {
        logger.error(`Unexpected error for [${req.method}] ${req.url} - ${error}`);
        exception = new InternalException('Something went wrong');
      }
      next(exception);
    }
  };
};
