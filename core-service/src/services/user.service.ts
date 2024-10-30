import { getPrismaClient } from "../database/prismaClient";
import {UserWithBookings} from "../types/user";
import {NotFoundException} from "../exceptions/NotFoundException";
import logger from "../config/logger";


export const me = async (userId: number): Promise<UserWithBookings> => {
    const user = await fetchUserWithBookings(userId);
    if (!user) throw new NotFoundException('User not found');
    logger.info(`Fetched profile data for user ID: ${userId}`);
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        bookings: user.bookings.map(({ id, ticketCount, event }) => ({
            id,
            ticketCount,
            eventId: event.id,
            eventName: event.name,
            eventDate: event.date,
            eventVenue: event.venue,
        })),
    };
};

const fetchUserWithBookings = async (userId: number) => {
    return getPrismaClient().user.findUnique({
        where: { id: userId },
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
};