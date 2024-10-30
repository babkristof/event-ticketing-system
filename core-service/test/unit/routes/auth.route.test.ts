import request from 'supertest';
import { mockLoginResponse } from '../mocks/loginResponse.mock';
import app from '../../../src/app';
import * as authController from '../../../src/controllers/auth.controller';

jest.mock("../../../src/controllers/auth.controller");

describe('Auth Route Validations', () => {
  let signupMock: any;
  let loginMock: any;
  beforeAll(() => {
    signupMock = jest.spyOn(authController, 'signup').mockImplementation(async (_req, res) => {
      res.status(201).json({ message: 'User registered successfully' });
    });
    loginMock = jest.spyOn(authController, 'login').mockImplementation(async (_req, res) => {
      res.json(mockLoginResponse);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/signup', () => {
    const validSignupData = {
      name: 'validname',
      email: 'valid@email.com',
      password: 'validpassword'
    };

    it('should successfully sign up with valid data', async () => {
      const response = await request(app).post('/api/auth/signup').send(validSignupData);

      expect(signupMock).toHaveBeenCalledTimes(1);
      expect(signupMock.mock.calls[0][0].body).toEqual(validSignupData);
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'User registered successfully' });
    });

    it('should remove leading and trailing spaces from name, email, and password', async () => {
      const response = await request(app).post('/api/auth/signup').send({
        name: '   namewithspaces   ',
        email: '   email@example.com   ',
        password: '   passwordwithspaces   '
      });

      expect(signupMock).toHaveBeenCalledTimes(1);
      expect(signupMock.mock.calls[0][0].body).toEqual({
        name: 'namewithspaces',
        email: 'email@example.com',
        password: 'passwordwithspaces'
      });
      expect(response.status).toBe(201);
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
      { desc: 'password with spaces', data: { name: 'JohnDoe', email: 'john@example.com', password: '  m   ' } }
    ];

    invalidSignupData.forEach(({ desc, data }) => {
      it(`should return 400 if request body is ${desc}`, async () => {
        const response = await request(app).post('/api/auth/signup').send(data);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Request validation failed');
      });
    });
  });

  describe('POST /api/auth/login', () => {
    const validLoginData = {
      email: 'email@example.com',
      password: 'passwordwithspaces'
    };

    it('should successfully login with valid data', async () => {
      const response = await request(app).post('/api/auth/login').send(validLoginData);

      expect(loginMock).toHaveBeenCalledTimes(1);
      expect(loginMock.mock.calls[0][0].body).toEqual(validLoginData);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLoginResponse);
    });

    it('should remove leading and trailing spaces from email and password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: '   email@example.com   ',
        password: '   passwordwithspaces   '
      });

      expect(loginMock).toHaveBeenCalledTimes(1);
      expect(loginMock.mock.calls[0][0].body).toEqual({
        email: 'email@example.com',
        password: 'passwordwithspaces'
      });
      expect(response.status).toBe(200);
    });

    const invalidLoginData = [
      { desc: 'missing email', data: { password: 'password' } },
      { desc: 'missing password', data: { email: 'john@example.com' } },
      { desc: 'empty email', data: { email: '', password: 'password' } },
      { desc: 'invalid email', data: { email: 'invalid-email', password: 'password' } },
      { desc: 'empty password', data: { email: 'john@example.com', password: '' } },
      { desc: 'password with spaces', data: { email: 'john@example.com', password: '   m    ' } }
    ];

    invalidLoginData.forEach(({ desc, data }) => {
      it(`should return 400 if login request body is ${desc}`, async () => {
        const response = await request(app).post('/api/auth/login').send(data);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Request validation failed');
      });
    });
  });
});