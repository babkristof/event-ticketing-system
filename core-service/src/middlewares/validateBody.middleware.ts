import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { BadRequestException } from '../exceptions/BadRequestException';
import logger from '../config/logger';

export const validateBody = (schema: ZodSchema<unknown>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.debug(`Validation error for [${req.method}] ${req.url} - ${JSON.stringify(error.errors)}`);
        next(new BadRequestException('Request validation failed'));
      } else {
        next(error);
      }
    }
  };
};
