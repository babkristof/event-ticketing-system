import { NextFunction, Response } from 'express';
import { Role } from '@prisma/client';
import roleMiddleware from '../../../src/middlewares/role.middleware';
import { UnauthorizedException } from '../../../src/exceptions/UnauthorizedException';
import { AuthenticatedRequest } from '../../../src/types/express';

describe('Role Middleware', () => {
    let req: Partial<AuthenticatedRequest>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = { user: { id: 1, name: 'Admin', email: 'admin@example.com', role: Role.ADMIN } };
        res = {};
        next = jest.fn();
    });

    it('should allow access for admin if it has required role', () => {
        roleMiddleware(Role.ADMIN)(req as AuthenticatedRequest, res as Response, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith();
    });

    it('should allow access for customer if it has required role', () => {
        req.user!.role = Role.CUSTOMER;
        roleMiddleware(Role.CUSTOMER)(req as AuthenticatedRequest, res as Response, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith();
    });

    it('should throw UnauthorizedException if user does not have required role', () => {
        req.user!.role = Role.CUSTOMER;

        roleMiddleware(Role.ADMIN)(req as AuthenticatedRequest, res as Response, next);

        const errorArg = (next as jest.Mock).mock.calls[0][0];
        expect(errorArg).toBeInstanceOf(UnauthorizedException);
        expect(errorArg.message).toBe('Unauthorized');
    });

    it('should throw UnauthorizedException if user does not have required role', () => {
        req.user!.role = Role.ADMIN;

        roleMiddleware(Role.CUSTOMER)(req as AuthenticatedRequest, res as Response, next);

        const errorArg = (next as jest.Mock).mock.calls[0][0];
        expect(errorArg).toBeInstanceOf(UnauthorizedException);
        expect(errorArg.message).toBe('Unauthorized');
    });
});