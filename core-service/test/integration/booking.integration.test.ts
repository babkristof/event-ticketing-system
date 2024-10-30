import request from 'supertest';
import app from '../../src/app';
import jwt from 'jsonwebtoken';
import config from '../../src/config/config';
import { seedAdminUser, seedEvent, seedTestUser, resetDb } from './utils/dbSeeder';

describe('Booking Routes Integration Tests', () => {
    let adminToken: string;
    let customerToken: string;
    let adminUserId: number;
    let customerUserId: number;
    let eventId: number;

    beforeEach(async () => {
        await resetDb();
        adminUserId = await seedAdminUser();
        customerUserId = await seedTestUser();
        eventId = await seedEvent(adminUserId);

        adminToken = jwt.sign({ userId: adminUserId }, config.jwt.secret, { expiresIn: '1h' });
        customerToken = jwt.sign({ userId: customerUserId }, config.jwt.secret, { expiresIn: '1h' });
    });

    afterEach(async () => {
        await resetDb();
    });

    describe('POST /api/events/:eventId/bookings', () => {
        it('should successfully create a booking with valid data', async () => {
            const bookingData = { ticketCount: 2 };

            const response = await request(app)
                .post(`/api/events/${eventId}/bookings`)
                .set('Authorization', `Bearer ${customerToken}`)
                .send(bookingData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('ticketCount', bookingData.ticketCount);
        });

        it('should return 400 if ticket count is invalid', async () => {
            const invalidBookingData = { ticketCount: -5 };

            const response = await request(app)
                .post(`/api/events/${eventId}/bookings`)
                .set('Authorization', `Bearer ${customerToken}`)
                .send(invalidBookingData);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Request validation failed');
        });

        it('should return 401 if an admin tries to create a booking', async () => {
            const bookingData = { ticketCount: 2 };

            const response = await request(app)
                .post(`/api/events/${eventId}/bookings`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(bookingData);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        });
    });

    describe('GET /api/events/:eventId/bookings/:bookingId', () => {
        let bookingId: number;

        beforeEach(async () => {
            const bookingResponse = await request(app)
                .post(`/api/events/${eventId}/bookings`)
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ ticketCount: 2 });
            bookingId = bookingResponse.body.id;
        });

        it('should retrieve a booking by ID', async () => {
            const response = await request(app)
                .get(`/api/events/${eventId}/bookings/${bookingId}`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', bookingId);
            expect(response.body).toHaveProperty('ticketCount', 2);
        });

        it('should return 404 if the booking is not found', async () => {
            const response = await request(app)
                .get(`/api/events/${eventId}/bookings/999`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Booking not found');
        });

        it('should return 400 if booking ID format is invalid', async () => {
            const response = await request(app)
                .get(`/api/events/${eventId}/bookings/invalid-id`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Request validation failed');
        });
    });

    describe('DELETE /api/events/:eventId/bookings/:bookingId', () => {
        let bookingId: number;

        beforeEach(async () => {
            const bookingResponse = await request(app)
                .post(`/api/events/${eventId}/bookings`)
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ ticketCount: 2 });
            bookingId = bookingResponse.body.id;
        });

        it('should delete a booking with valid ID', async () => {
            const response = await request(app)
                .delete(`/api/events/${eventId}/bookings/${bookingId}`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(204);
        });

        it('should return 404 if the booking does not exist', async () => {
            const response = await request(app)
                .delete(`/api/events/${eventId}/bookings/999`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Booking not found');
        });

        it('should return 400 if booking ID format is invalid', async () => {
            const response = await request(app)
                .delete(`/api/events/${eventId}/bookings/invalid-id`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Request validation failed');
        });
    });
});
