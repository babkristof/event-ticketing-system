import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.debug({
    method: req.method,
    url: req.url,
    body: req.body,
    message: 'Incoming request'
  });
  next();
};
