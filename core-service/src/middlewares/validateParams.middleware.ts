import { NextFunction, Request, Response} from 'express';
import { ZodError, ZodSchema } from 'zod';
import { BadRequestException } from '../exceptions/BadRequestException';
import logger from '../config/logger';

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      console.log('REQPARAMSS1', req.params);
      req.params = schema.parse(req.params);
      console.log('REQPARAMSS22', req.params);
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
