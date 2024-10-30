import * as userService from '../../../src/services/user.service';
import * as prisma from '../../../src/database/prismaClient';
import { NotFoundException } from '../../../src/exceptions/NotFoundException';
import {  Role } from '@prisma/client';
import {UserWithBookings} from "../../../src/types/user";

describe('User Service', () => {
    let mockPrismaClient: any;
    let mockUser: UserWithBookings;

    beforeEach(() => {
        mockUser = {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            role: Role.CUSTOMER,
            bookings: [
                {
                    id: 1,
                    ticketCount: 2,
                    event: {
                        id: 1,
                        name: 'Sample Event',
                        date: new Date('2024-11-16T13:15:00.000Z'),
                        venue: 'Berlin',
                    },
                },
            ],
        };

        mockPrismaClient = {
            user: {
                findUnique: jest.fn(),
            },
        };

        jest.spyOn(prisma, 'getPrismaClient').mockReturnValue(mockPrismaClient);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('me', () => {
        it('should return user data with bookings if user exists', async () => {
            mockPrismaClient.user.findUnique.mockResolvedValueOnce(mockUser);

            const result = await userService.me(mockUser.id);

            expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
                where: { id: mockUser.id },
                include: {
                    bookings: {
                        include: {
                            event: {
                                select: {
                                    id: true,
                                    name: true,
                                    date: true,
                                    venue: true,
                                },
                            },
                        },
                    },
                },
            });

            expect(result).toEqual({
                id: mockUser.id,
                name: mockUser.name,
                email: mockUser.email,
                role: mockUser.role,
                bookings: [
                    {
                        id: mockUser.bookings[0].id,
                        ticketCount: mockUser.bookings[0].ticketCount,
                        eventId: mockUser.bookings[0].event.id,
                        eventName: mockUser.bookings[0].event.name,
                        eventDate: mockUser.bookings[0].event.date,
                        eventVenue: mockUser.bookings[0].event.venue,
                    },
                ],
            });
        });

        it('should throw NotFoundException if user does not exist', async () => {
            mockPrismaClient.user.findUnique.mockResolvedValueOnce(null);

            await expect(userService.me(999)).rejects.toThrow(NotFoundException);
        });
    });
});
