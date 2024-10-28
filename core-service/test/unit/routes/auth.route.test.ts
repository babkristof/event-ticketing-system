import request from 'supertest';
import { expect } from 'chai';
import sinon from 'sinon';
import * as authController from '../../../src/controllers/auth.controller';
import { mockLoginResponse } from '../mocks/loginResponse.mock';
const signupStub = sinon.stub(authController, 'signup').callsFake(async (_req, res) => {
    res.status(201).json({ message: 'User registered successfully' });
});
const loginStub = sinon.stub(authController, 'login').callsFake(async (_req, res) => {
    res.json(mockLoginResponse);
});
import app from '../../../src/app';

describe('Auth Route Validations', () => {
    before(() => {
        signupStub.resetHistory();
    });

    afterEach(() => {
        sinon.restore();
        sinon.resetHistory();
    });
    after(() => {
        sinon.reset();
    });

    describe('POST /api/auth/signup', () => {
        afterEach(() => {
            signupStub.resetHistory();
        });
    const invalidSignupData = [
        { desc: 'missing name', data: { email: 'john@example.com', password: 'password' } },
        { desc: 'missing password', data: { name: 'JohnDoe', email: 'john@example.com' } },
        { desc: 'missing email', data: { name: 'JohnDoe', password: 'password' } },
        { desc: 'empty name', data: { name: '', email: 'john@example.com', password: 'password' } },
        { desc: 'too long name', data: { name: 'a'.repeat(100), email: 'john@example.com', password: 'password' } },
        { desc: 'name with spaces', data: { name: '     ', email: 'john@example.com', password: 'password' } },
        { desc: 'empty email', data: { name: 'JohnDoe', email: '', password: 'password' } },
        { desc: 'invalid email', data: { name: 'JohnDoe', email: 'invalid-email', password: 'password' } },
        { desc: 'empty password', data: { name: 'JohnDoe', email: 'john@example.com', password: '' } },
        { desc: 'password with spaces', data: { name: 'JohnDoe', email: 'john@example.com', password: '  m   ' } },
    ];
        it('should successfully sign up with valid data', async () => {
            const validSignupData = {
                name: 'validname',
                email: 'valid@email.com',
                password: 'validpassword',
            }
            const response = await request(app)
                .post('/api/auth/signup')
                .send(validSignupData);

            expect(signupStub.calledOnce).to.be.true;
            const calledWith = signupStub.getCall(0).args[0].body;
            expect(calledWith).to.deep.equal(validSignupData);
            expect(response.status).to.equal(201);
        });

        it('should remove leading and trailing spaces from name, email, and password in /signup', async () => {
            const response = await request(app)
                .post('/api/auth/signup')
                .send({
                    name: '   namewithspaces   ',
                    email: '   email@example.com   ',
                    password: '   passwordwithspaces   ',
                });

            expect(signupStub.calledOnce).to.be.true;
            const calledWith = signupStub.getCall(0).args[0].body;
            expect(calledWith).to.deep.equal({
                name: 'namewithspaces',
                email: 'email@example.com',
                password: 'passwordwithspaces',
            });
            expect(response.status).to.equal(201);
        });

    invalidSignupData.forEach(({ desc, data }) => {

        it(`should return 400 if request body is ${desc}`, async () => {
            const response = await request(app)
                .post('/api/auth/signup')
                .send(data);

            expect(response.status).to.equal(400);
            expect(response.body.message).to.equal('Request validation failed');
        });

        });
    });
    describe('POST /api/auth/login', () => {
        afterEach(() => {
            loginStub.resetHistory();
        });
        const invalidLoginData = [
            { desc: 'missing email', data: { password: 'password' } },
            { desc: 'missing password', data: { email: 'john@example.com' } },
            { desc: 'empty email', data: { email: '', password: 'password' } },
            { desc: 'invalid email', data: { email: 'invalid-email', password: 'password' } },
            { desc: 'empty password', data: { email: 'john@example.com', password: '' } },
            { desc: 'password with spaces', data: { email: 'john@example.com', password: '   m    ' } },
        ];
        it('should successfully login with valid data', async () => {
            const validLoginData = {
                email: 'email@example.com',
                password: 'passwordwithspaces',
            }
            const response = await request(app)
                .post('/api/auth/login')
                .send(validLoginData);

            expect(loginStub.calledOnce).to.be.true;
            const calledWith = loginStub.getCall(0).args[0].body;
            expect(calledWith).to.deep.equal(validLoginData);
            expect(response.status).to.equal(200);
        });

        it('should remove leading and trailing spaces from email and password in /login', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: '   email@example.com   ',
                    password: '   passwordwithspaces   ',
                });

            expect(loginStub.calledOnce).to.be.true;
            const calledWith = loginStub.getCall(0).args[0].body;
            expect(calledWith).to.deep.equal({
                email: 'email@example.com',
                password: 'passwordwithspaces',
            });
            expect(response.status).to.equal(200);
        });


        invalidLoginData.forEach(({ desc, data }) => {
            it(`should return 400 if login request body is ${desc}`, async () => {
                const response = await request(app)
                    .post('/api/auth/login')
                    .send(data);

                expect(response.status).to.equal(400);
                expect(response.body.message).to.equal('Request validation failed');
            });
        });
    });
});