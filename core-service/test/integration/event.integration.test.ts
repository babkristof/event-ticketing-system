import request from 'supertest';
import app from '../../src/app';
import jwt from 'jsonwebtoken';
import config from '../../src/config/config';
import {seedAdminUser, seedEvent, resetDb, SAMPLE_EVENT, seedTestUser} from './utils/dbSeeder';


describe('Event Routes Integration Tests', () => {
    let token: string;
    let userToken: string;
    let adminUserId: number;
    let customerUserId: number;

    beforeEach(async () => {
        await resetDb();
        adminUserId = await seedAdminUser();
        customerUserId = await seedTestUser()

        token = jwt.sign({ userId: adminUserId }, config.jwt.secret, { expiresIn: '1h' });
        userToken = jwt.sign({ userId: customerUserId }, config.jwt.secret, { expiresIn: '1h' });

    });

    afterEach(async () => {
        await resetDb();
    });

    describe('POST /api/events', () => {
        it('should successfully create an event with valid data', async () => {
            const response = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${token}`)
                .send(SAMPLE_EVENT);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
        });

        it('should return 400 for invalid event data', async () => {
            const invalidEventData = { ...SAMPLE_EVENT, totalTickets: -5 };

            const response = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${token}`)
                .send(invalidEventData);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Request validation failed');
        });

        it('should return 401 if a user with CUSTOMER role tries to create an event', async () => {
            const response = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${userToken}`)
                .send(SAMPLE_EVENT);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        });
    });

    describe('GET /api/events', () => {
        it('should retrieve a list of events', async () => {
            await seedEvent(adminUserId);

            const response = await request(app)
                .get('/api/events')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body[0]).toHaveProperty('name', SAMPLE_EVENT.name);
        });

        it('should return an empty array if no events exist', async () => {
            const response = await request(app)
                .get('/api/events')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body).toHaveLength(0);
        });
    });

    describe('GET /api/events/:id', () => {
        it('should retrieve an event by ID', async () => {
            const eventId = await seedEvent(adminUserId);

            const response = await request(app)
                .get(`/api/events/${eventId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('name', SAMPLE_EVENT.name);
        });

        it('should return 404 if the event is not found', async () => {
            const nonExistentEventId = 99;

            const response = await request(app)
                .get(`/api/events/${nonExistentEventId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Event not found');
        });

        it('should return 400 for an invalid event ID format', async () => {
            const response = await request(app)
                .get('/api/events/invalid-id')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Request validation failed');
        });
        it('should return 401 if a user with CUSTOMER role tries to get an event by ID', async () => {
            const eventId = await seedEvent(adminUserId);

            const response = await request(app)
                .get(`/api/events/${eventId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        });
    });
});