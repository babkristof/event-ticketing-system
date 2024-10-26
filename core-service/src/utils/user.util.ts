import { User } from '@prisma/client';
import { PublicUser } from '../types/auth';

export const toPublicUser = (user: User): PublicUser => {
  const { id, name, email } = user;
  return { id, name, email };
};