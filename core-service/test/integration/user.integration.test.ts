import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app';
import jwt from 'jsonwebtoken';
import config from '../../src/config/config';
import {getPrismaClient} from "../../src/database/prismaClient";
import {hashPassword} from "../../src/utils/password.util";

const REGISTERED_USER = {
    name: 'registeredUser',
    email: 'registered@example.com',
    password: 'hashedpassword'
};


describe('/me Endpoint Integration Tests', function () {
    const USER_ME_ENDPOINT = '/api/users/me';
    const UNAUTHORIZED_MSG = 'Unauthorized';
    let token: string;

    beforeEach(async () => {
        await resetDb();
        const userId = await seedTestUser();

        token = jwt.sign({ userId: userId }, config.jwt.secret, { expiresIn: '1h' });
    });

    afterEach(async () => {
        await resetDb();
    });

    it('should return user profile if token is valid', async () => {
        const response = await request(app)
            .get(USER_ME_ENDPOINT)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('email', REGISTERED_USER.email);
    });

    it('should return 401 if token is missing', async () => {
        const response = await request(app).get(USER_ME_ENDPOINT);

        expect(response.status).to.equal(401);
        expect(response.body).to.have.property('message', UNAUTHORIZED_MSG);
    });

    it('should return 401 if token is invalid', async () => {
        const response = await request(app)
            .get(USER_ME_ENDPOINT)
            .set('Authorization', 'Bearer invalidToken');

        expect(response.status).to.equal(401);
        expect(response.body).to.have.property('message', UNAUTHORIZED_MSG);
    });
});

async function seedTestUser(): Promise<number> {
    const createdUser = await getPrismaClient().user.create({
        data: {
            name: REGISTERED_USER.name,
            email: REGISTERED_USER.email,
            passwordHash: await hashPassword(REGISTERED_USER.password)
        }
    });
    return createdUser.id;
}

async function resetDb() {
    await getPrismaClient().$transaction([getPrismaClient().user.deleteMany()]);
}