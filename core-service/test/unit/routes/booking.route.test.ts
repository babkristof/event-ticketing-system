import request from 'supertest';
import app from '../../../src/app';
import * as bookingController from '../../../src/controllers/booking.controller';
import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

jest.mock('../../../src/middlewares/auth.middleware', () =>
  jest.fn((req, _res, next) => {
    req.user = { id: 1, name: 'Customer', email: 'customer@example.com', role: Role.CUSTOMER };
    next();
  })
);

jest.mock('../../../src/middlewares/role.middleware', () =>
  jest.fn(() => (req: Request, _res: Response, next: NextFunction) => {
    req.user = { id: 1, name: 'Customer', email: 'customer@example.com', role: Role.CUSTOMER };
    next();
  })
);

jest.mock('../../../src/controllers/booking.controller', () => ({
  createBooking: jest.fn((_req, res) => res.status(201).json({ id: 1 })),
  getBooking: jest.fn((_req, res) => res.status(200).json({ id: 1, ticketCount: 2 })),
  cancelBooking: jest.fn((_req, res) => res.status(204).send())
}));

describe('Booking Route Validations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/events/:eventId/bookings', () => {
    const validBookingData = { ticketCount: 2 };
    const eventId = '1';

    it('should create a booking with valid data', async () => {
      const response = await request(app)
        .post(`/api/events/${eventId}/bookings`)
        .set('Authorization', 'Bearer validToken')
        .send(validBookingData);

      expect(bookingController.createBooking).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ id: 1 });
    });

    it('should return 400 if ticketCount is missing', async () => {
      const response = await request(app)
        .post(`/api/events/${eventId}/bookings`)
        .set('Authorization', 'Bearer validToken')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Request validation failed');
    });

    it('should return 400 if ticketCount is not positive', async () => {
      const response = await request(app)
        .post(`/api/events/${eventId}/bookings`)
        .set('Authorization', 'Bearer validToken')
        .send({ ticketCount: -1 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Request validation failed');
    });
  });

  describe('GET /api/events/:eventId/bookings/:bookingId', () => {
    const eventId = '1';
    const bookingId = '1';

    it('should retrieve a booking with valid eventId and bookingId', async () => {
      const response = await request(app)
        .get(`/api/events/${eventId}/bookings/${bookingId}`)
        .set('Authorization', 'Bearer validToken');

      expect(bookingController.getBooking).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: 1, ticketCount: 2 });
    });

    it('should return 400 if bookingId is not a positive integer', async () => {
      const response = await request(app)
        .get(`/api/events/${eventId}/bookings/invalid-id`)
        .set('Authorization', 'Bearer validToken');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Request validation failed');
    });
  });

  describe('DELETE /api/events/:eventId/bookings/:bookingId', () => {
    const eventId = '1';
    const bookingId = '1';

    it('should delete a booking with valid eventId and bookingId', async () => {
      const response = await request(app)
        .delete(`/api/events/${eventId}/bookings/${bookingId}`)
        .set('Authorization', 'Bearer validToken');

      expect(bookingController.cancelBooking).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(204);
    });

    it('should return 400 if bookingId is not a positive integer', async () => {
      const response = await request(app)
        .delete(`/api/events/${eventId}/bookings/invalid-id`)
        .set('Authorization', 'Bearer validToken');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Request validation failed');
    });
  });
});
