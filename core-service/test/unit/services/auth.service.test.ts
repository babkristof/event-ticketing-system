import * as passwordUtil from '../../../src/utils/password.util';
import * as userUtils from '../../../src/utils/user.util';
import { getAuthenticatedUser, login, signup } from '../../../src/services/auth.service';
import { Role } from '@prisma/client';
import * as prisma from '../../../src/database/prismaClient';
import { BadRequestException } from '../../../src/exceptions/BadRequestException';
import { NotFoundException } from '../../../src/exceptions/NotFoundException';
import logger from '../../../src/config/logger';

describe('Auth Service', () => {
  let mockPrismaClient: any;
  let mockUser: any;
  let loggerSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashedPassword',
      role: Role.CUSTOMER,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockPrismaClient = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn()
      }
    };
    jest.spyOn(prisma, 'getPrismaClient').mockReturnValue(mockPrismaClient);
    loggerSpy = jest.spyOn(logger, 'info');
    warnSpy = jest.spyOn(logger, 'warn');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signupService', () => {
    it('should create a new user with hashed password', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValueOnce(null);
      mockPrismaClient.user.create.mockResolvedValueOnce(mockUser);
      jest.spyOn(passwordUtil, 'hashPassword').mockResolvedValueOnce('hashedPassword');

      const result = await signup({ name: 'John Doe', email: 'john@example.com', password: 'password' });

      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaClient.user.create).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalledWith(`New user registered with email: john@example.com`);
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException if user already exists', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValueOnce(mockUser);

      await expect(signup({ name: mockUser.name, email: mockUser.email, password: 'password' })).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('loginService', () => {
    beforeEach(() => {
      jest
        .spyOn(userUtils, 'toPublicUser')
        .mockReturnValue({ id: 1, name: 'John Doe', email: 'john@example.com', role: 'CUSTOMER' });
    });

    it('should return a token and user data on successful login', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValueOnce(mockUser);
      jest.spyOn(passwordUtil, 'comparePassword').mockResolvedValueOnce(true);

      const result = await login({ email: 'john@example.com', password: 'password' });

      expect(loggerSpy).toHaveBeenCalledWith(`User 1 logged in successfully`);
      expect(result).toHaveProperty('token', expect.any(String));
      expect(result.user).toEqual({ id: 1, name: 'John Doe', email: 'john@example.com', role: 'CUSTOMER' });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValueOnce(null);

      await expect(login({ email: 'nonexistent@example.com', password: 'password' })).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException if password is incorrect', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValueOnce(mockUser);
      jest.spyOn(passwordUtil, 'comparePassword').mockResolvedValueOnce(false);

      await expect(login({ email: 'john@example.com', password: 'wrongpassword' })).rejects.toThrow(
        BadRequestException
      );
      expect(warnSpy).toHaveBeenCalledWith(`Failed login attempt for user john@example.com`);
    });
  });

  describe('getAuthenticatedUser', () => {
    it('should return the user if found', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValueOnce(mockUser);

      const result = await getAuthenticatedUser(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValueOnce(null);

      await expect(getAuthenticatedUser(999)).rejects.toThrow(NotFoundException);
    });
  });
});
