import { User } from '@prisma/client';

export type PublicUser = Pick<User, 'id' | 'name' | 'email'>;

export interface AuthPayload {
  userId: number;
}

export interface LoginResponse {
  user: PublicUser;
  token: string;
}
