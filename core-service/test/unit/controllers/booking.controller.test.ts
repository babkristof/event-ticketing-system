import { Response } from 'express';
import { createBooking, getBooking, cancelBooking } from '../../../src/controllers/booking.controller';
import * as bookingService from '../../../src/services/booking.service';
import { AuthenticatedRequest } from '../../../src/types/express';
import { CreateBookingData } from '../../../src/schemas/booking.schema';
import { EventBookingParams, EventParams } from '../../../src/types/booking';
import {Role} from "@prisma/client";

jest.mock('../../../src/services/booking.service');

describe('Booking Controller', () => {
    let mockRequest: Partial<AuthenticatedRequest<CreateBookingData, EventParams>>;
    let mockResponse: Partial<Response>;
    let mockStatus: jest.Mock;
    let mockJson: jest.Mock;
    let mockSend: jest.Mock;

    const mockBooking = {
        id: 1,
        ticketCount: 2,
        eventId: 1,
        userId: 1,
    };

    beforeEach(() => {
        mockStatus = jest.fn().mockReturnThis();
        mockJson = jest.fn();
        mockSend = jest.fn();

        mockResponse = {
            status: mockStatus,
            json: mockJson,
            send: mockSend,
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createBooking', () => {
        it('should create a booking and return the booking data with status 201', async () => {
            mockRequest = {
                body: { ticketCount: 2 } as CreateBookingData,
                params: { eventId: '1' } as EventParams,
                user: { id: 1, name: 'name', email: 'email@email.com', role: Role.CUSTOMER },
            };

            (bookingService.create as jest.Mock).mockResolvedValueOnce(mockBooking);

            await createBooking(
                mockRequest as AuthenticatedRequest<CreateBookingData, EventParams>,
                mockResponse as Response
            );

            expect(bookingService.create).toHaveBeenCalledWith(1, mockRequest.user!.id, mockRequest.body!.ticketCount);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockBooking);
        });
    });

    describe('getBooking', () => {
        it('should return the booking data with status 200 if found', async () => {
            const mockRequest: Partial<AuthenticatedRequest<CreateBookingData, EventBookingParams>> = {
                params: { eventId: '1', bookingId: '1' } as EventBookingParams,
                user: { id: 1, name: 'name', email: 'email@email.com', role: Role.CUSTOMER },
            };

            (bookingService.get as jest.Mock).mockResolvedValueOnce(mockBooking);

            await getBooking(
                mockRequest as AuthenticatedRequest<{}, EventBookingParams>,
                mockResponse as Response
            );

            expect(bookingService.get).toHaveBeenCalledWith(1, 1);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockBooking);
        });
    });

    describe('cancelBooking', () => {
        it('should cancel the booking and return status 204', async () => {
            const mockRequest: Partial<AuthenticatedRequest<CreateBookingData, EventBookingParams>> = {
                params: { eventId: '1', bookingId: '1' } as EventBookingParams,
                user: { id: 1, name: 'name', email: 'email@email.com', role: Role.CUSTOMER },
            };

            await cancelBooking(
                mockRequest as AuthenticatedRequest<{}, EventBookingParams>,
                mockResponse as Response
            );

            expect(bookingService.remove).toHaveBeenCalledWith(1, 1);
            expect(mockResponse.status).toHaveBeenCalledWith(204);
            expect(mockResponse.send).toHaveBeenCalled();
        });
    });
});