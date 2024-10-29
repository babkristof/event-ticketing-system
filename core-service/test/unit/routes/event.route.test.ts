import request from 'supertest';
import app from '../../../src/app';  // Ensure app is the last import to initialize stubs first
import * as eventController from '../../../src/controllers/event.controller';
import * as authMiddleware from '../../../src/middlewares/auth.middleware';
import * as roleMiddleware from '../../../src/middlewares/role.middleware';
import { Role } from '@prisma/client';
import {NextFunction, Request, Response} from "express";

jest.mock('../../../src/middlewares/auth.middleware');
jest.mock('../../../src/middlewares/role.middleware');
jest.mock('../../../src/controllers/event.controller');

describe('Event Route Validations', () => {
    beforeEach(() => {
        (authMiddleware.default as jest.Mock).mockImplementation((req, _res, next) => {
            req.user = { id: 1, name: 'Admin', email: 'admin@example.com', role: Role.ADMIN };
            next();
        });

        (roleMiddleware.default as jest.Mock).mockImplementation((requiredRole: Role) => {
            return (req: Request, _res: Response, next: NextFunction) => {
                req.user = { id: 1, name: 'Admin', email: 'admin@example.com', role: requiredRole };
                next();
            };
        });

        (eventController.createEvent as jest.Mock).mockImplementation((_req, res) => {
            res.status(201).json({ id: 1 });
        });
        (eventController.getEvent as jest.Mock).mockImplementation((_req, res) => {
            res.status(200).json({ id: 1, name: 'Sample Event' });
        });
        (eventController.getEvents as jest.Mock).mockImplementation((_req, res) => {
            res.status(200).json([{ id: 1, name: 'Sample Event' }]);
        });
    });

    afterEach(() => {
        jest.clearAllMocks(); // Reset all mocks after each test
    });

    describe('POST /api/events', () => {
        const validEventData = {
            name: 'New Event',
            description: 'Description for new event',
            date: '2024-11-16T14:15',
            venue: 'Sample Venue',
            totalTickets: 100
        };
        const invalidEventData = [
            { desc: 'missing name', data: { description: 'Desc', date: '2024-11-16T14:15', venue: 'Venue', totalTickets: 100 } },
            { desc: 'missing description', data: { name: 'Event', date: '2024-11-16T14:15', venue: 'Venue', totalTickets: 100 } },
            { desc: 'invalid date', data: { name: 'Event', description: 'Desc', date: 'invalid-date', venue: 'Venue', totalTickets: 100 } },
            { desc: 'negative tickets', data: { name: 'Event', description: 'Desc', date: '2024-11-16T14:15', venue: 'Venue', totalTickets: -5 } }
        ];

        it('should successfully create an event with valid data', async () => {
            const response = await request(app).post('/api/events').send(validEventData);

            expect(eventController.createEvent).toHaveBeenCalledTimes(1);
            expect(response.status).toBe(201);
            expect(response.body).toEqual({ id: 1 });
        });

        invalidEventData.forEach(({ desc, data }) => {
            it(`should return 400 if request body is ${desc}`, async () => {
                const response = await request(app).post('/api/events').send(data);

                expect(response.status).toBe(400);
                expect(response.body.message).toBe('Request validation failed');
            });
        });
    });

    describe('GET /api/events/:id', () => {
        it('should retrieve an event with a valid ID', async () => {
            const response = await request(app).get('/api/events/1');

            expect(eventController.getEvent).toHaveBeenCalledTimes(1);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ id: 1, name: 'Sample Event' });
        });

        it('should return 400 for an invalid event ID format', async () => {
            const response = await request(app).get('/api/events/invalid-id');

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Request validation failed');
        });

        it('should return 400 for a negative event ID', async () => {
            const response = await request(app).get('/api/events/-13');

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Request validation failed');
        });
    });

    describe('GET /api/events', () => {
        it('should retrieve a list of events', async () => {
            const response = await request(app).get('/api/events');

            expect(eventController.getEvents).toHaveBeenCalledTimes(1);
            expect(response.status).toBe(200);
            expect(response.body).toEqual([{ id: 1, name: 'Sample Event' }]);
        });
    });
});