import { LoginResponse } from '../../../src/types/auth';

export const mockPublicUser = {
    id: 1,
    name: 'John Doe',
    email: 'johndoe@example.com',
};

export const mockLoginResponse: LoginResponse = {
    user: mockPublicUser,
    token: 'mocked.jwt.token.here',
};
