import { Booking, Event, Role } from '@prisma/client';
import * as bookingService from '../../../src/services/booking.service';
import * as prisma from '../../../src/database/prismaClient';
import { NotFoundException } from '../../../src/exceptions/NotFoundException';
import { ConflictException } from '../../../src/exceptions/ConflictException';
import logger from '../../../src/config/logger';
import { PublicUser } from '../../../src/types/user';
import { addEmailJob } from '../../../src/queues/email.queue';

jest.mock('../../../src/queues/email.queue', () => ({
  addEmailJob: jest.fn(() => Promise.resolve())
}));

describe('Booking Service', () => {
  let mockPrismaClient: any;
  let mockBooking: Booking;
  let mockEvent: Event;
  let mockUser: PublicUser;
  let loggerSpy: jest.SpyInstance;

  beforeEach(() => {
    mockBooking = {
      id: 1,
      userId: 1,
      eventId: 1,
      ticketCount: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockEvent = {
      id: 1,
      name: 'Sample Event',
      description: 'An example event description',
      date: new Date('2024-11-16T13:15:00.000Z'),
      venue: 'Berlin',
      totalTickets: 100,
      availableTickets: 100,
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: Role.CUSTOMER
    };

    mockPrismaClient = {
      booking: {
        create: jest.fn(),
        findFirst: jest.fn(),
        delete: jest.fn()
      },
      event: {
        findUnique: jest.fn(),
        update: jest.fn()
      },
      $transaction: jest.fn((fn) => fn(mockPrismaClient))
    };

    jest.spyOn(prisma, 'getPrismaClient').mockReturnValue(mockPrismaClient);
    loggerSpy = jest.spyOn(logger, 'info');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new booking and decrement available tickets', async () => {
      mockPrismaClient.event.findUnique.mockResolvedValueOnce(mockEvent);
      mockPrismaClient.booking.create.mockResolvedValueOnce(mockBooking);
      mockPrismaClient.event.update.mockResolvedValueOnce({
        ...mockEvent,
        availableTickets: mockEvent.availableTickets - mockBooking.ticketCount
      });

      const result = await bookingService.create(mockEvent.id, mockUser, mockBooking.ticketCount);

      expect(loggerSpy).toHaveBeenCalledWith(
        `Booking created successfully for user ${mockUser.id} for event ${mockEvent.id}`
      );
      expect(mockPrismaClient.event.findUnique).toHaveBeenCalledWith({ where: { id: mockEvent.id } });
      expect(mockPrismaClient.booking.create).toHaveBeenCalledWith({
        data: { userId: mockBooking.userId, eventId: mockEvent.id, ticketCount: mockBooking.ticketCount }
      });
      expect(mockPrismaClient.event.update).toHaveBeenCalledWith({
        where: { id: mockEvent.id },
        data: { availableTickets: { decrement: mockBooking.ticketCount } }
      });
      expect(result).toEqual(mockBooking);
      expect(addEmailJob).toHaveBeenCalledWith({
        recipient: mockUser.email,
        emailType: 'booking_created_successful',
        userName: mockUser.name,
        eventName: mockEvent.name,
        eventVenue: mockEvent.venue,
        eventTime: mockEvent.date,
        bookingId: mockBooking.id,
        ticketCount: mockBooking.ticketCount
      });
    });

    it('should throw NotFoundException if event is not found', async () => {
      mockPrismaClient.event.findUnique.mockResolvedValueOnce(null);

      await expect(bookingService.create(999, mockUser, mockBooking.ticketCount)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if not enough tickets are available', async () => {
      mockPrismaClient.event.findUnique.mockResolvedValueOnce({ ...mockEvent, availableTickets: 0 });

      await expect(bookingService.create(mockEvent.id, mockUser, mockBooking.ticketCount)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('get', () => {
    it('should retrieve a booking if it exists', async () => {
      mockPrismaClient.booking.findFirst.mockResolvedValueOnce(mockBooking);

      const result = await bookingService.get(mockEvent.id, mockBooking.id);

      expect(mockPrismaClient.booking.findFirst).toHaveBeenCalledWith({
        where: { id: mockBooking.id, eventId: mockEvent.id }
      });
      expect(result).toEqual(mockBooking);
    });

    it('should throw NotFoundException if booking is not found', async () => {
      mockPrismaClient.booking.findFirst.mockResolvedValueOnce(null);

      await expect(bookingService.get(mockEvent.id, 999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a booking and increment available tickets', async () => {
      mockPrismaClient.booking.findFirst.mockResolvedValueOnce(mockBooking);
      mockPrismaClient.booking.delete.mockResolvedValueOnce(mockBooking);
      mockPrismaClient.event.update.mockResolvedValueOnce({
        ...mockEvent,
        availableTickets: mockEvent.availableTickets + mockBooking.ticketCount
      });

      await bookingService.remove(mockEvent.id, mockBooking.id, mockUser);

      expect(loggerSpy).toHaveBeenCalledWith(`Booking 1 canceled successfully for user 1 on event 1`);
      expect(mockPrismaClient.booking.findFirst).toHaveBeenCalledWith({
        where: { id: mockBooking.id, eventId: mockEvent.id }
      });
      expect(mockPrismaClient.booking.delete).toHaveBeenCalledWith({
        where: { id: mockBooking.id }
      });
      expect(mockPrismaClient.event.update).toHaveBeenCalledWith({
        where: { id: mockEvent.id },
        data: { availableTickets: { increment: mockBooking.ticketCount } }
      });
      expect(addEmailJob).toHaveBeenCalledWith({
        recipient: mockUser.email,
        emailType: 'booking_deleted_successful',
        userName: mockUser.name,
        eventName: mockEvent.name,
        eventVenue: mockEvent.venue,
        eventTime: mockEvent.date,
        bookingId: mockBooking.id,
        ticketCount: mockBooking.ticketCount
      });
    });

    it('should throw NotFoundException if booking is not found', async () => {
      mockPrismaClient.booking.findFirst.mockResolvedValueOnce(null);

      await expect(bookingService.remove(mockEvent.id, 999, mockUser)).rejects.toThrow(NotFoundException);
    });
  });
});
