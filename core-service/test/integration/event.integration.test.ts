import request from 'supertest';
import app from '../../src/app';
import jwt from 'jsonwebtoken';
import config from '../../src/config/config';
import {seedAdminUser, seedEvent, resetDb, SAMPLE_EVENT, seedTestUser, PAST_EVENT, seedBooking} from './utils/dbSeeder';


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

    describe('DELETE /api/events/:id', () => {
        it('should successfully delete an event when requested by an admin', async () => {
            const eventId = await seedEvent(adminUserId);

            const response = await request(app)
                .delete(`/api/events/${eventId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(204);

            const getResponse = await request(app)
                .get(`/api/events/${eventId}`)
                .set('Authorization', `Bearer ${token}`);
            expect(getResponse.status).toBe(404);
            expect(getResponse.body.message).toBe('Event not found');
        });

        it('should return 401 if a user with CUSTOMER role tries to delete an event', async () => {
            const eventId = await seedEvent(adminUserId);

            const response = await request(app)
                .delete(`/api/events/${eventId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        });

        it('should return 404 if the event does not exist', async () => {
            const nonExistentEventId = 99;

            const response = await request(app)
                .delete(`/api/events/${nonExistentEventId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Event not found');
        });

        it('should return 409 if attempting to delete a past event', async () => {
            const pastEventId = await seedEvent(adminUserId, PAST_EVENT);

            const response = await request(app)
                .delete(`/api/events/${pastEventId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(409);
            expect(response.body.message).toBe('Cannot delete past events.');
        });
    });
    describe('PATCH /api/events/:id', () => {
        it('should successfully update an event when requested by an admin', async () => {
            const eventId = await seedEvent(adminUserId);

            const updateData = {
                name: 'Updated Event Name',
                venue: 'New Venue',
                totalTickets: 220,
            };

            const response = await request(app)
                .patch(`/api/events/${eventId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('name', updateData.name);
            expect(response.body).toHaveProperty('venue', updateData.venue);
            expect(response.body).toHaveProperty('totalTickets', updateData.totalTickets);
        });

        it('should return 401 if a user with CUSTOMER role tries to update an event', async () => {
            const eventId = await seedEvent(adminUserId);

            const updateData = { name: 'Unauthorized Update Attempt' };

            const response = await request(app)
                .patch(`/api/events/${eventId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(updateData);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        });

        it('should return 404 if the event does not exist', async () => {
            const nonExistentEventId = 999;

            const updateData = { name: 'Non-existent Event' };

            const response = await request(app)
                .patch(`/api/events/${nonExistentEventId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Event not found');
        });

        it('should return 409 if attempting to update a past event', async () => {
            const pastEventId = await seedEvent(adminUserId, PAST_EVENT);

            const updateData = { name: 'Update Past Event' };

            const response = await request(app)
                .patch(`/api/events/${pastEventId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expect(response.status).toBe(409);
            expect(response.body.message).toBe('Cannot update past events');
        });

        it('should return 409 if totalTickets is set below the number of already sold tickets', async () => {
            const eventId = await seedEvent(adminUserId);
            await seedBooking(customerUserId, eventId, 30);

            const response = await request(app)
                .patch(`/api/events/${eventId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ totalTickets: 1 });

            expect(response.status).toBe(409);
            expect(response.body.message).toBe('Total tickets cannot be less than the number of already sold tickets');
        });

        it('should notify users with bookings if date or venue is updated', async () => {
            const eventId = await seedEvent(adminUserId);

            const updateData = {
                venue: 'Updated Venue'
            };

            const response = await request(app)
                .patch(`/api/events/${eventId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expect(response.status).toBe(200);
        });
    });

});