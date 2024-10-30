import { UnauthorizedException } from '../../../src/exceptions/UnauthorizedException';
import { ErrorCode } from '../../../src/exceptions/ErrorCode';
import { Response, Request, NextFunction } from 'express';
import * as jwtUtil from '../../../src/utils/jwt.util';
import * as userUtil from '../../../src/utils/user.util';
import * as prisma from '../../../src/database/prismaClient';
import authMiddleware from '../../../src/middlewares/auth.middleware';

const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
const mockPayload = { userId: mockUser.id };

describe('authMiddleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;
    let verifyTokenMock: jest.SpyInstance;
    let toPublicUserMock: jest.SpyInstance;
    let findUniqueMock: jest.Mock;
    let mockPrismaClient: any;

    beforeEach(() => {
        req = { headers: {} };
        res = {};
        next = jest.fn();

        verifyTokenMock = jest.spyOn(jwtUtil, 'verifyToken');
        toPublicUserMock = jest.spyOn(userUtil, 'toPublicUser');
        findUniqueMock = jest.fn();

        mockPrismaClient = {
            user: {
                findUnique: findUniqueMock,
                create: jest.fn()
            }
        };
        jest.spyOn(prisma, 'getPrismaClient').mockReturnValue(mockPrismaClient);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const setAuthHeader = (token: string) => {
        req.headers = { authorization: `Bearer ${token}` };
    };

    const expectUnauthorizedError = (errorArg: any) => {
        expect(errorArg).toBeInstanceOf(UnauthorizedException);
        expect(errorArg.message).toBe('Unauthorized');
        expect(errorArg.errorCode).toBe(ErrorCode.UNAUTHORIZED);
    };

    it('should allow the request if the token is valid and user exists', async () => {
        setAuthHeader('validToken');
        verifyTokenMock.mockReturnValue(mockPayload);
        toPublicUserMock.mockReturnValue({ id: mockUser.id, name: mockUser.name, email: mockUser.email });
        findUniqueMock.mockResolvedValue(mockUser);

        await authMiddleware(req as Request, res as Response, next);

        expect(findUniqueMock).toHaveBeenCalledWith({ where: { id: mockPayload.userId } });
        expect(toPublicUserMock).toHaveBeenCalledWith(mockUser);
        expect((req as any).user).toEqual({ id: mockUser.id, name: mockUser.name, email: mockUser.email });
        expect(next).toHaveBeenCalledTimes(1);
    });

    it('should return Unauthorized if authorization header is missing', async () => {
        await authMiddleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledTimes(1);
        const errorArg = (next as jest.Mock).mock.calls[0][0];
        expectUnauthorizedError(errorArg);
    });

    it('should return Unauthorized if token is invalid', async () => {
        setAuthHeader('invalidToken');
        verifyTokenMock.mockImplementation(() => {
            throw new Error('Invalid token');
        });

        await authMiddleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledTimes(1);
        const errorArg = (next as jest.Mock).mock.calls[0][0];
        expectUnauthorizedError(errorArg);
    });

    it('should return Unauthorized if user does not exist', async () => {
        setAuthHeader('validToken');
        verifyTokenMock.mockReturnValue(mockPayload);
        findUniqueMock.mockResolvedValue(null);

        await authMiddleware(req as Request, res as Response, next);

        expect(findUniqueMock).toHaveBeenCalledWith({ where: { id: mockPayload.userId } });
        expect(next).toHaveBeenCalledTimes(1);
        const errorArg = (next as jest.Mock).mock.calls[0][0];
        expectUnauthorizedError(errorArg);
    });
});
