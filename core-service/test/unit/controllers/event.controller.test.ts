import { Response } from 'express';
import { createEvent, getEvent, getEvents } from '../../../src/controllers/event.controller';
import * as eventService from '../../../src/services/event.service';
import { Event } from '@prisma/client';
import { AuthenticatedRequest } from '../../../src/types/express';

jest.mock('../../../src/services/event.service');

describe('Event Controller', () => {
    let mockRequest: Partial<AuthenticatedRequest>;
    let mockResponse: Partial<Response>;
    let mockEvent: Event;

    beforeEach(() => {
        mockEvent = {
            id: 1,
            name: 'Sample Event',
            description: 'A description of the sample event',
            date: new Date('2024-11-16T13:15:00.000Z'),
            venue: 'Berlin',
            totalTickets: 100,
            availableTickets: 100,
            createdBy: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as Partial<Response>;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createEvent', () => {
        it('should create a new event and return its ID', async () => {
            mockRequest = {
                body: {
                    name: 'Sample Event',
                    description: 'A description of the sample event',
                    date: '2024-11-16T13:15:00.000Z',
                    venue: 'Berlin',
                    totalTickets: 100,
                },
                user: { id: 1 },
            } as AuthenticatedRequest;

            (eventService.create as jest.Mock).mockResolvedValueOnce(mockEvent);

            await createEvent(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(eventService.create).toHaveBeenCalledWith(mockRequest.body, mockRequest.user!.id);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({ id: mockEvent.id });
        });
    });

    describe('getEvent', () => {
        it('should return event details when the event is found', async () => {
            mockRequest = {
                params: { id: '1' },
            } as AuthenticatedRequest;

            (eventService.get as jest.Mock).mockResolvedValueOnce(mockEvent);

            await getEvent(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(eventService.get).toHaveBeenCalledWith(mockRequest.params);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockEvent);
        });
    });

    describe('getEvents', () => {
        it('should return a list of events', async () => {
            (eventService.getAll as jest.Mock).mockResolvedValueOnce([mockEvent]);

            await getEvents(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(eventService.getAll).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith([mockEvent]);
        });
    });
});
