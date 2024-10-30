import { Request, Response } from 'express';
import * as authService from '../../../src/services/auth.service';
import { LoginResponse } from '../../../src/types/auth';
import * as authController from '../../../src/controllers/auth.controller';
import { LoginData, SignUpData } from '../../../src/schemas/auth.schema';
import {Role} from "@prisma/client";

describe('Auth Controller', () => {
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn().mockReturnThis();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('signup', () => {
    let req: Partial<Request<never, never, SignUpData>>;

    beforeEach(() => {
      req = {
        body: {
          name: '',
          email: '',
          password: '',
        },
      };
    });

    it('should call signupService and return 201 status on success', async () => {
      const mockUser = {
        name: 'John Doe',
        email: 'john@example.com',
        id: 1,
        passwordHash: 'hashedPassword',
        role: Role.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      req.body = { name: 'John Doe', email: 'john@example.com', password: 'securepassword' };

      const signupServiceMock = jest.spyOn(authService, 'signup').mockResolvedValue(mockUser);

      await authController.signup(req as Request<never, never, SignUpData>, res as Response);

      expect(signupServiceMock).toHaveBeenCalledWith(req.body);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'User registered successfully' });
    });

    it('should return error if signupService throws an error', async () => {
      const signupServiceMock = jest.spyOn(authService, 'signup').mockRejectedValue(new Error('Signup failed'));

      req.body = { name: 'John Doe', email: 'john@example.com', password: 'securepassword' };

      await expect(authController.signup(req as Request<never, never, SignUpData>, res as Response)).rejects.toThrow('Signup failed');
      expect(signupServiceMock).toHaveBeenCalledWith(req.body);
      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    let req: Partial<Request<never, never, LoginData>>;

    beforeEach(() => {
      req = {
        body: {
          email: '',
          password: '',
        },
      };
    });

    it('should call loginService and return user and token on success', async () => {
      const mockResponse: LoginResponse = {
        user: { id: 1, name: 'John Doe', email: 'john@example.com', role: 'CUSTOMER' },
        token: 'mockToken',
      };
      const loginServiceMock = jest.spyOn(authService, 'login').mockResolvedValue(mockResponse);

      req.body = { email: 'john@example.com', password: 'password' };

      await authController.login(req as Request<never, never, LoginData>, res as Response);

      expect(loginServiceMock).toHaveBeenCalledWith(req.body);
      expect(jsonMock).toHaveBeenCalledWith(mockResponse);
    });

    it('should return error if loginService throws an error', async () => {
      const loginServiceMock = jest.spyOn(authService, 'login').mockRejectedValue(new Error('Login failed'));

      req.body = { email: 'john@example.com', password: 'password' };

      await expect(authController.login(req as Request<never, never, LoginData>, res as Response)).rejects.toThrow('Login failed');
      expect(loginServiceMock).toHaveBeenCalledWith(req.body);
      expect(jsonMock).not.toHaveBeenCalled();
    });
  });
});
