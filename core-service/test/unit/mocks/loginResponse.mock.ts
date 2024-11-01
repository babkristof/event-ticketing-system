import { LoginResponse } from '../../../src/types/auth';
import { Role } from '@prisma/client';

export const mockPublicUser = {
  id: 1,
  name: 'John Doe',
  email: 'johndoe@example.com',
  role: Role.CUSTOMER
};

export const mockLoginResponse: LoginResponse = {
  user: mockPublicUser,
  token: 'mocked.jwt.token.here'
};
