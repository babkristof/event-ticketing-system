import { Event } from '@prisma/client';
import * as eventService from '../../../src/services/event.service';
import * as prisma from '../../../src/database/prismaClient';
import { NotFoundException } from '../../../src/exceptions/NotFoundException';
import logger from '../../../src/config/logger';

describe('Event Service', () => {
    let mockPrismaClient: any;
    let mockEvent: Event;

    beforeEach(() => {
        mockEvent = {
            id: 1,
            name: 'Sample Event',
            description: 'An example event description',
            date: new Date('2024-11-16T13:15:00.000Z'),
            venue: 'Berlin',
            totalTickets: 200,
            availableTickets: 200,
            createdBy: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        mockPrismaClient = {
            event: {
                create: jest.fn(),
                findUnique: jest.fn(),
                findMany: jest.fn(),
            },
        };

        jest.spyOn(prisma, 'getPrismaClient').mockReturnValue(mockPrismaClient);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new event successfully', async () => {
            mockPrismaClient.event.create.mockResolvedValueOnce(mockEvent);
            const eventData = {
                name: 'Sample Event',
                description: 'An example event description',
                date: new Date('2024-11-16T13:15:00.000Z'),
                venue: 'Berlin',
                totalTickets: 200,
            };

            const result = await eventService.create(eventData, 1);

            expect(mockPrismaClient.event.create).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockEvent);
        });
    });

    describe('get', () => {
        it('should return an event if found', async () => {
            mockPrismaClient.event.findUnique.mockResolvedValueOnce(mockEvent);
            const eventData = { id: 1 };

            const result = await eventService.get(eventData);

            expect(mockPrismaClient.event.findUnique).toHaveBeenCalledWith({ where: { id: eventData.id } });
            expect(result).toEqual(mockEvent);
        });

        it('should throw NotFoundException if event is not found', async () => {
            mockPrismaClient.event.findUnique.mockResolvedValueOnce(null);
            const eventData = { id: 999 };

            await expect(eventService.get(eventData)).rejects.toThrow(NotFoundException);
        });
    });

    describe('getAll', () => {
        it('should return all events', async () => {
            mockPrismaClient.event.findMany.mockResolvedValueOnce([mockEvent]);

            const result = await eventService.getAll();

            expect(mockPrismaClient.event.findMany).toHaveBeenCalledTimes(1);
            expect(result).toEqual([mockEvent]);
        });

        it('should log a message if no events are found', async () => {
            mockPrismaClient.event.findMany.mockResolvedValueOnce([]);
            const loggerSpy = jest.spyOn(logger, 'debug');

            const result = await eventService.getAll();

            expect(result).toEqual([]);
            expect(loggerSpy).toHaveBeenCalledWith('No events found in the database.');
        });
    });
});
