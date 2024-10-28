import chai, { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response } from 'express';
import * as authService from '../../../src/services/auth.service';
import { LoginResponse } from '../../../src/types/auth';
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

import * as authController from '../../../src/controllers/auth.controller';


describe('Auth Controller', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    let jsonStub: sinon.SinonStub;
    let statusStub: sinon.SinonStub;

    beforeEach(() => {
        req = {
            body: {},
        };
        jsonStub = sinon.stub().returnsThis();
        statusStub = sinon.stub().returns({ json: jsonStub });

        res = {
            status: statusStub,
            json: jsonStub,
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    after(() => {
        sinon.reset();
    });

    describe('signup', () => {
        it('should call signupService and return 201 status on success', async () => {

            req.body = { name: 'John Doe', email: 'john@example.com', password: 'securepassword' };

            await authController.signup(req as Request, res as Response);

            expect(statusStub.calledOnceWith(201)).to.be.true;
            expect(jsonStub.calledOnceWith({ message: 'User registered successfully' })).to.be.true;
        });
        it('should return error if signupService throws an error', async () => {
            const signupServiceStub = sinon.stub(authService, 'signupService').rejects(new Error('Signup failed'));

            req.body = { name: 'John Doe', email: 'john@example.com', password: 'securepassword' };

            await expect(authController.signup(req as Request, res as Response)).to.be.rejectedWith('Signup failed');
            expect(signupServiceStub.calledOnceWithExactly(req.body)).to.be.true;
            expect(statusStub.notCalled).to.be.true;
            expect(jsonStub.notCalled).to.be.true;
        });
    });

    describe('login', () => {
        it('should call loginService and return user and token on success', async () => {
            const mockResponse: LoginResponse = {
                user: { id: 1, name: 'John Doe', email: 'john@example.com' },
                token: 'mockToken',
            };
            const loginServiceStub = sinon.stub(authService, 'loginService').resolves(mockResponse);

            req.body = { email: 'john@example.com', password: 'password' };

            await authController.login(req as Request, res as Response);

            expect(loginServiceStub.calledOnceWithExactly(req.body)).to.be.true;
            expect(jsonStub.calledOnceWith(mockResponse)).to.be.true;
        });

        it('should return error if loginService throws an error', async () => {
            const loginServiceStub = sinon.stub(authService, 'loginService').rejects(new Error('Login failed'));

            req.body = { email: 'john@example.com', password: 'password' };

            await expect(authController.login(req as Request, res as Response)).to.be.rejectedWith('Login failed');
            expect(loginServiceStub.calledOnceWithExactly(req.body)).to.be.true;
            expect(jsonStub.notCalled).to.be.true;
        });
    });
});
