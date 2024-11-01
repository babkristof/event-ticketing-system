import { PublicUser } from './user';

export interface AuthPayload {
  userId: number;
}

export interface LoginResponse {
  user: PublicUser;
  token: string;
}
