import { User } from '@prisma/client';
import {PublicUser} from "../types/user";

export const toPublicUser = (user: User): PublicUser => {
  const { id, name, email, role } = user;
  return { id, name, email, role };
};
