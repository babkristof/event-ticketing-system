import { NextFunction, Response } from 'express';
import sinon from 'sinon';
import { Role } from '@prisma/client';
import roleMiddleware from '../../../src/middlewares/role.middleware';
import { UnauthorizedException } from '../../../src/exceptions/UnauthorizedException';
import {expect} from "chai";
import {AuthenticatedRequest} from "../../../src/types/express";

describe('Role Middleware', () => {
    let req: Partial<AuthenticatedRequest>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = { user: { id: 1, name: 'Admin', email: 'admin@example.com', role: Role.ADMIN } };
        res = {};
        next = sinon.spy() as NextFunction;
    });

    it('should allow access for admin if it has required role', () => {
        roleMiddleware(Role.ADMIN)(req as AuthenticatedRequest, res as Response, next);

        expect((next as sinon.SinonSpy).calledOnce).to.be.true;
        expect((next as sinon.SinonSpy).getCall(0).args.length).to.equal(0); // No errors passed
    });

    it('should allow access for customer if it has required role', () => {
        req.user!.role = Role.CUSTOMER;
        roleMiddleware(Role.CUSTOMER)(req as AuthenticatedRequest, res as Response, next);

        expect((next as sinon.SinonSpy).calledOnce).to.be.true;
        expect((next as sinon.SinonSpy).getCall(0).args.length).to.equal(0); // No errors passed
    });

    it('should throw UnauthorizedException if user does not have required role', () => {
        req.user!.role = Role.CUSTOMER;

        roleMiddleware(Role.ADMIN)(req as AuthenticatedRequest, res as Response, next);

        const errorArg = (next as sinon.SinonSpy).getCall(0).args[0];
        expect(errorArg).to.be.instanceOf(UnauthorizedException);
        expect(errorArg.message).to.equal('Unauthorized');
    });

    it('should throw UnauthorizedException if user does not have required role', () => {
        req.user!.role = Role.ADMIN;

        roleMiddleware(Role.CUSTOMER)(req as AuthenticatedRequest, res as Response, next);

        const errorArg = (next as sinon.SinonSpy).getCall(0).args[0];
        expect(errorArg).to.be.instanceOf(UnauthorizedException);
        expect(errorArg.message).to.equal('Unauthorized');
    });
});
