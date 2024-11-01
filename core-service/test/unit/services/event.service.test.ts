import {Booking, Event, User} from '@prisma/client';
import * as eventService from '../../../src/services/event.service';
import * as prisma from '../../../src/database/prismaClient';
import { NotFoundException } from '../../../src/exceptions/NotFoundException';
import logger from '../../../src/config/logger';
import {addEmailJob} from "../../../src/queues/email.queue";
import {ConflictException} from "../../../src/exceptions/ConflictException";


jest.mock('../../../src/queues/email.queue', () => ({
    addEmailJob: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../../src/config/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
}));

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
                delete: jest.fn(),
                update: jest.fn()
            },
            booking: {
                findMany: jest.fn(),
            },
            $transaction: jest.fn((fn) => fn(mockPrismaClient)),
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
            const eventData = { eventId: 1 };

            const result = await eventService.get(eventData);

            expect(mockPrismaClient.event.findUnique).toHaveBeenCalledWith({ where: { id: eventData.eventId } });
            expect(result).toEqual(mockEvent);
        });

        it('should throw NotFoundException if event is not found', async () => {
            mockPrismaClient.event.findUnique.mockResolvedValueOnce(null);
            const eventData = { eventId: 999 };

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

    describe('remove', () => {
        let mockEvent: Event;
        let mockBookings: Booking[];
        let mockUser: User;

        beforeEach(() => {
            mockEvent = {
                id: 1,
                name: 'Sample Event',
                description: 'An example event description',
                date: new Date('2024-11-16T13:15:00.000Z'), // Future date
                venue: 'Berlin',
                totalTickets: 200,
                availableTickets: 200,
                createdBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockUser = {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                passwordHash: 'hashedpassword',
                role: 'CUSTOMER',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockBookings = [
                {
                    id: 1,
                    userId: mockUser.id,
                    user: mockUser,
                    eventId: mockEvent.id,
                    event: mockEvent,
                    ticketCount: 2,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as Booking,
            ];

            jest.clearAllMocks();
        });

        it('should successfully delete an event and send email notifications', async () => {
            mockPrismaClient.event.findUnique.mockResolvedValueOnce(mockEvent);
            mockPrismaClient.booking.findMany.mockResolvedValueOnce(mockBookings);

            await eventService.remove({ eventId: mockEvent.id});

            expect(mockPrismaClient.event.findUnique).toHaveBeenCalledWith({ where: { id: mockEvent.id } });
            expect(mockPrismaClient.$transaction).toHaveBeenCalled();
            expect(mockPrismaClient.event.delete).toHaveBeenCalledWith({ where: { id: mockEvent.id } });

            expect(addEmailJob).toHaveBeenCalledWith({
                recipient: mockUser.email,
                emailType: 'event_deleted_by_admin',
                userName: mockUser.name,
                eventName: mockEvent.name,
                eventVenue: mockEvent.venue,
                eventTime: mockEvent.date,
                ticketCount: mockBookings[0].ticketCount,
                bookingId: mockBookings[0].id,
            });
            expect(logger.info).toHaveBeenCalledWith(`Event with ID ${mockEvent.id} and all associated bookings were deleted successfully`);
        });

        it('should throw ConflictException if attempting to delete a past event', async () => {
            const pastEvent = { ...mockEvent, date: new Date('2022-11-16T13:15:00.000Z') };
            mockPrismaClient.event.findUnique.mockResolvedValueOnce(pastEvent);

            await expect(eventService.remove({ eventId: pastEvent.id})).rejects.toThrow(ConflictException);
            expect(logger.error).toHaveBeenCalledWith('Cannot delete past events.');
        });

        it('should throw NotFoundException if event does not exist', async () => {
            mockPrismaClient.event.findUnique.mockResolvedValueOnce(null);

            await expect(eventService.remove({eventId: 999})).rejects.toThrow(NotFoundException);
            expect(mockPrismaClient.event.delete).not.toHaveBeenCalled();
        });

        it('should log an error if email sending fails for a booking', async () => {
            const emailJobError = new Error('Email sending failed');
            mockPrismaClient.event.findUnique.mockResolvedValueOnce(mockEvent);
            mockPrismaClient.booking.findMany.mockResolvedValueOnce(mockBookings);
            (addEmailJob as jest.Mock).mockRejectedValueOnce(emailJobError);

            await eventService.remove({ eventId: mockEvent.id});

            expect(logger.error).toHaveBeenCalledWith(`Failed to send cancellation email to user ID ${mockUser.id}`, { error: emailJobError });
        });
    });



    describe('Event Service - Update Function', () => {
        let mockEvent: Event;
        let mockUser: User;
        let mockBookings: Booking[];

        beforeEach(() => {
            mockEvent = {
                id: 1,
                name: 'Sample Event',
                description: 'An example event description',
                date: new Date('2024-11-16T13:15:00.000Z'),
                venue: 'Berlin',
                totalTickets: 200,
                availableTickets: 180,
                createdBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockUser = {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                passwordHash: 'hashedpassword',
                role: 'CUSTOMER',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockBookings = [
                {
                    id: 1,
                    userId: mockUser.id,
                    user: mockUser,
                    eventId: mockEvent.id,
                    ticketCount: 2,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as Booking,
            ];
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should update the event and notify users if date or venue changes', async () => {
            mockPrismaClient.event.findUnique.mockResolvedValueOnce({ ...mockEvent, bookings: mockBookings });
            mockPrismaClient.event.update.mockResolvedValueOnce({ ...mockEvent, venue: 'New Venue' });

            const updateData = { venue: 'New Venue' };
            const result = await eventService.update(mockEvent.id, updateData);

            expect(mockPrismaClient.event.update).toHaveBeenCalledWith({
                where: { id: mockEvent.id },
                data: expect.objectContaining(updateData),
            });
            expect(result.venue).toBe('New Venue');
            expect(addEmailJob).toHaveBeenCalledTimes(mockBookings.length);
        });

        it('should not notify users if irrelevant fields are updated', async () => {
            mockPrismaClient.event.findUnique.mockResolvedValueOnce({ ...mockEvent, bookings: mockBookings });
            mockPrismaClient.event.update.mockResolvedValueOnce(mockEvent);

            const updateData = { name: 'Updated Name' };
            await eventService.update(mockEvent.id, updateData);

            expect(mockPrismaClient.event.update).toHaveBeenCalledWith({
                where: { id: mockEvent.id },
                data: expect.objectContaining(updateData),
            });
            expect(addEmailJob).not.toHaveBeenCalled();
        });

        it('should throw ConflictException if updating past events', async () => {
            const pastEvent = { ...mockEvent, date: new Date('2022-11-16T13:15:00.000Z') };
            mockPrismaClient.event.findUnique.mockResolvedValueOnce(pastEvent);

            await expect(eventService.update(mockEvent.id, {})).rejects.toThrow(ConflictException);
        });

        it('should throw ConflictException if reducing total tickets below sold tickets', async () => {
            mockPrismaClient.event.findUnique.mockResolvedValueOnce(mockEvent);

            const updateData = { totalTickets: 15 };
            await expect(eventService.update(mockEvent.id, updateData)).rejects.toThrow(ConflictException);
        });

        it('should adjust available tickets if total tickets are increased', async () => {
            const increasedTicketsEvent = { ...mockEvent, availableTickets: 200 };
            mockPrismaClient.event.findUnique.mockResolvedValueOnce(mockEvent);
            mockPrismaClient.event.update.mockResolvedValueOnce(increasedTicketsEvent);

            const updateData = { totalTickets: 220 };
            const result = await eventService.update(mockEvent.id, updateData);

            expect(mockPrismaClient.event.update).toHaveBeenCalledWith({
                where: { id: mockEvent.id },
                data: expect.objectContaining({ totalTickets: 220, availableTickets: 200 }),
            });
            expect(result.availableTickets).toBe(200);
        });

        it('should log an error if email notification fails', async () => {
            const emailError = new Error('Email sending failed');
            (addEmailJob as jest.Mock).mockRejectedValueOnce(emailError);

            mockPrismaClient.event.findUnique.mockResolvedValueOnce({ ...mockEvent, bookings: mockBookings });
            mockPrismaClient.event.update.mockResolvedValueOnce({ ...mockEvent, venue: 'New Venue' });

            await eventService.update(mockEvent.id, { venue: 'New Venue' });

            expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to send update notification email'), { error: emailError });
        });
    });


});
