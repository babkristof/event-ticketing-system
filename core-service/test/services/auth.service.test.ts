import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import * as passwordUtil from '../../src/utils/password.util';
import * as userUtils from '../../src/utils/user.util';
import {getAuthenticatedUser, loginService, signupService} from "../../src/services/auth.service";
import {Role} from "@prisma/client";
import * as prisma from "../../src/database/prismaClient";
import {BadRequestException} from "../../src/exceptions/BadRequestException";
import {NotFoundException} from "../../src/exceptions/NotFoundException";
chai.use(chaiAsPromised);


describe('Auth Service', () => {
    let mockPrismaClient: any;
    let mockUser: any;

    beforeEach(() => {
        mockUser = {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            passwordHash: 'hashedPassword',
            role: Role.CUSTOMER,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        mockPrismaClient = {
            user: {
                findUnique: sinon.stub().resolves(null), // Default to no user found
                create: sinon.stub(),
            },
        };
        sinon.stub(prisma, 'getPrismaClient').returns(mockPrismaClient);
    })
    afterEach(() => {
        sinon.restore();
    });

    describe('signupService', () => {
        it('should create a new user with hashed password', async () => {
            mockPrismaClient.user.findUnique.resolves(null);
            mockPrismaClient.user.create.resolves(mockUser);
            sinon.stub(passwordUtil, 'hashPassword').resolves('hashedPassword');

            const result = await signupService({ name: 'John Doe', email: 'john@example.com', password: 'password' });

            expect(mockPrismaClient.user.findUnique.calledOnce).to.be.true;
            expect(mockPrismaClient.user.create.calledOnce).to.be.true;
            expect(result).to.deep.equal(mockUser);
        });

        it('should throw BadRequestException if user already exists', async () => {
            mockPrismaClient.user.findUnique.resolves(mockUser); // Simulate existing user

            await expect(
                signupService({ name: 'John Doe', email: 'existing@example.com', password: 'password' })
            ).to.be.rejectedWith(BadRequestException);
        });

    });

    describe('loginService', () => {
        beforeEach(() => {
            sinon.stub(userUtils, 'toPublicUser').returns({ id: 1, name: 'John Doe', email: 'john@example.com' });
        });
        it('should return a token and user data on successful login', async () => {
            mockPrismaClient.user.findUnique.resolves(mockUser);
            sinon.stub(passwordUtil, 'comparePassword').resolves(true);

            const result = await loginService({ email: 'john@example.com', password: 'password' });

            expect(result).to.have.property('token').that.is.a('string');
            expect(result.user).to.deep.equal({ id: 1, name: 'John Doe', email: 'john@example.com' });
        });

        it('should throw NotFoundException if user does not exist', async () => {
            mockPrismaClient.user.findUnique.resolves(null);

            await expect(loginService({ email: 'nonexistent@example.com', password: 'password' }))
                .to.be.rejectedWith(NotFoundException);
        });

        it('should throw BadRequestException if password is incorrect', async () => {
            mockPrismaClient.user.findUnique.resolves(mockUser);
            sinon.stub(passwordUtil, 'comparePassword').resolves(false);

            await expect(loginService({ email: 'john@example.com', password: 'wrongpassword' }))
                .to.be.rejectedWith(BadRequestException);
        });
    });

    describe('getAuthenticatedUser', () => {
        it('should return the user if found', async () => {
            mockPrismaClient.user.findUnique.resolves(mockUser);

            const result = await getAuthenticatedUser(1);
            expect(result).to.deep.equal(mockUser);
        });

        it('should throw NotFoundException if user is not found', async () => {
            mockPrismaClient.user.findUnique.resolves(null);

            await expect(getAuthenticatedUser(999)).to.be.rejectedWith(NotFoundException);
        });

    });
});
