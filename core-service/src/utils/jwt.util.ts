import jwt from 'jsonwebtoken';
import config from '../config/config';

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwt.secret) as { userId: number };
};
