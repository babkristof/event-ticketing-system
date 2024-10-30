import { Request, Response } from 'express';
import { me } from '../../../src/controllers/user.controller';
import * as userService from '../../../src/services/user.service';
import { UserWithBookings } from '../../../src/types/user';
import {AuthenticatedRequest} from "../../../src/types/express";

jest.mock('../../../src/services/user.service');

describe('User Controller - me', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockUser: UserWithBookings;

    beforeEach(() => {
        mockRequest = {
            user: { id: 1 },
        } as Partial<Request> as AuthenticatedRequest;

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as Partial<Response>;

        mockUser = {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            role: 'CUSTOMER',
            bookings: [
                {
                    id: 1,
                    ticketCount: 2,
                    eventId: 1,
                    eventName: 'Sample Event',
                    eventDate: new Date('2024-11-16T13:15:00.000Z'),
                    eventVenue: 'Berlin',
                },
            ],
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return user data with bookings if user exists', async () => {
        (userService.me as jest.Mock).mockResolvedValueOnce(mockUser);

        await me(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(userService.me).toHaveBeenCalledWith(1);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });
});
