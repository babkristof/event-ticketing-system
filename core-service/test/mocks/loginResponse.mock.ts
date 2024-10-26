import { LoginResponse } from '../../src/types/auth';

// Mock user data
export const mockPublicUser = {
    id: 1,
    name: 'John Doe',
    email: 'johndoe@example.com',
};

// Mock login response data
export const mockLoginResponse: LoginResponse = {
    user: mockPublicUser,
    token: 'mocked.jwt.token.here', // Placeholder token string
};
