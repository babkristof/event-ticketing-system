import request from 'supertest';
import app from '../../src/app';
import { seedTestUser, resetDb, REGISTERED_USER } from './utils/dbSeeder';

describe('Auth Integration Tests', () => {
  const SIGNUP_URL = '/api/auth/signup';
  const LOGIN_URL = '/api/auth/login';
  const USER_REGISTERED_SUCCESS_MSG = 'User registered successfully';
  const USER_EXISTS_MSG = 'User already exists!';
  const VALIDATION_FAILED_MSG = 'Request validation failed';
  const INVALID_PASSWORD_MSG = 'Incorrect password';
  const USER_NOT_EXISTS_MSG = 'User does not exist!';

  afterEach(resetDb);
  afterAll(async () => {
    await resetDb();
  });

  describe('POST /api/auth/signup', () => {
    it('should successfully sign up a user', async () => {
      const response = await request(app).post(SIGNUP_URL).send(REGISTERED_USER);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', USER_REGISTERED_SUCCESS_MSG);
    });
    it('should not allowed to register with case varian of existing email', async () => {
      await seedTestUser();
      const response = await request(app).post(SIGNUP_URL).send({
        name: REGISTERED_USER.name,
        email: REGISTERED_USER.email.toUpperCase(),
        password: REGISTERED_USER.password
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', USER_EXISTS_MSG);
    });
    it('should return 400 for registering an already existing email', async () => {
      await seedTestUser();
      const response = await request(app).post(SIGNUP_URL).send(REGISTERED_USER);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', USER_EXISTS_MSG);
    });
    it('should return 400 for invalid name', async () => {
      const response = await request(app).post(SIGNUP_URL).send({
        name: 1234,
        email: 'valid@example.com',
        password: 'validpassword'
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', VALIDATION_FAILED_MSG);
    });
    it('should return 400 for invalid email', async () => {
      const response = await request(app).post(SIGNUP_URL).send({
        name: 'valid name',
        email: 'valid@example',
        password: 'validpassword'
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', VALIDATION_FAILED_MSG);
    });
    it('should return 400 for invalid email', async () => {
      const response = await request(app).post(SIGNUP_URL).send({
        name: 'valid name',
        email: 'valid@example.com',
        password: 'inv'
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', VALIDATION_FAILED_MSG);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should successfully login with valid credentials', async () => {
      await seedTestUser();

      const response = await request(app).post(LOGIN_URL).send({
        email: REGISTERED_USER.email,
        password: REGISTERED_USER.password
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(REGISTERED_USER.email);
    });
    it('should allow to login with case variant of existing email', async () => {
      await seedTestUser();
      const response = await request(app).post(LOGIN_URL).send({
        email: REGISTERED_USER.email.toUpperCase(),
        password: REGISTERED_USER.password
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(REGISTERED_USER.email);
    });
    it('should should not login with invalid password', async () => {
      await seedTestUser();

      const response = await request(app).post(LOGIN_URL).send({
        email: REGISTERED_USER.email,
        password: 'invalidPassword'
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', INVALID_PASSWORD_MSG);
    });

    it('should should not login with non existing email', async () => {
      await seedTestUser();

      const response = await request(app).post(LOGIN_URL).send({
        email: 'nonExisting@email.com',
        password: REGISTERED_USER.password
      });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', USER_NOT_EXISTS_MSG);
    });
    it('should should not login with invalid email', async () => {
      await seedTestUser();

      const response = await request(app).post(LOGIN_URL).send({
        email: 'nonExisting@email',
        password: REGISTERED_USER.password
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', VALIDATION_FAILED_MSG);
    });
  });
});
