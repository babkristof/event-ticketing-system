import { expect } from 'chai';
import { UnauthorizedException } from '../../../src/exceptions/UnauthorizedException';
import { ErrorCode } from '../../../src/exceptions/ErrorCode';
import { Response, Request, NextFunction } from 'express';
import * as jwtUtil from '../../../src/utils/jwt.util';
import * as userUtil from '../../../src/utils/user.util';
import sinon from 'sinon';
import * as prisma from '../../../src/database/prismaClient';

import authMiddleware from '../../../src/middlewares/auth.middleware';

const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
const mockPayload = { userId: mockUser.id };

describe('authMiddleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;
    let verifyTokenStub: sinon.SinonStub;
    let toPublicUserStub: sinon.SinonStub;
    let findUniqueStub: sinon.SinonStub;
    let mockPrismaClient: any;

    beforeEach(() => {
        req = { headers: {} };
        res = {};
        next = sinon.spy() as NextFunction;

        verifyTokenStub = sinon.stub(jwtUtil, 'verifyToken');
        toPublicUserStub = sinon.stub(userUtil, 'toPublicUser');
        findUniqueStub = sinon.stub();

        mockPrismaClient = {
            user: {
                findUnique: findUniqueStub,
                create: sinon.stub()
            }
        };
        sinon.stub(prisma, 'getPrismaClient').returns(mockPrismaClient);
    });

    afterEach(() => {
        sinon.restore();
    });

    const setAuthHeader = (token: string) => {
        req.headers = { authorization: `Bearer ${token}` };
    };

    const expectUnauthorizedError = (errorArg: any) => {
        expect(errorArg).to.be.instanceOf(UnauthorizedException);
        expect(errorArg.message).to.equal('Unauthorized');
        expect(errorArg.errorCode).to.equal(ErrorCode.UNAUTHORIZED);
    };

    it('should allow the request if the token is valid and user exists', async () => {
        setAuthHeader('validToken');
        verifyTokenStub.returns(mockPayload);
        toPublicUserStub.returns({ id: mockUser.id, name: mockUser.name, email: mockUser.email });
        findUniqueStub.resolves(mockUser);

        await authMiddleware(req as Request, res as Response, next);

        expect(findUniqueStub.calledOnceWith({ where: { id: mockPayload.userId } })).to.be.true;
        expect(toPublicUserStub.calledOnceWith(mockUser)).to.be.true;
        expect((req as any).user).to.deep.equal({ id: mockUser.id, name: mockUser.name, email: mockUser.email });
        expect((next as sinon.SinonSpy).calledOnce).to.be.true;
    });

    it('should return Unauthorized if authorization header is missing', async () => {
        await authMiddleware(req as Request, res as Response, next);

        expect((next as sinon.SinonSpy).calledOnce).to.be.true;
        const errorArg = (next as sinon.SinonSpy).getCall(0).args[0];
        expectUnauthorizedError(errorArg);
    });

    it('should return Unauthorized if token is invalid', async () => {
        setAuthHeader('invalidToken');
        verifyTokenStub.throws(new Error('Invalid token'));

        await authMiddleware(req as Request, res as Response, next);

        expect((next as sinon.SinonSpy).calledOnce).to.be.true;
        const errorArg = (next as sinon.SinonSpy).getCall(0).args[0];
        expectUnauthorizedError(errorArg);
    });

    it('should return Unauthorized if user does not exist', async () => {
        setAuthHeader('validToken');
        verifyTokenStub.returns(mockPayload);
        findUniqueStub.resolves(null);

        await authMiddleware(req as Request, res as Response, next);

        expect(findUniqueStub.calledOnceWith({ where: { id: mockPayload.userId } })).to.be.true;
        expect((next as sinon.SinonSpy).calledOnce).to.be.true;
        const errorArg = (next as sinon.SinonSpy).getCall(0).args[0];
        expectUnauthorizedError(errorArg);
    });
});