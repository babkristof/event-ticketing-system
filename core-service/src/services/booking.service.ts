import {Booking} from '@prisma/client';
import {NotFoundException} from "../exceptions/NotFoundException";
import {ErrorCode} from "../exceptions/ErrorCode";
import {ConflictException} from "../exceptions/ConflictException";
import { getPrismaClient } from '../database/prismaClient';


export const create = async (eventId: number, userId: number, ticketCount: number): Promise<Booking> => {
    return getPrismaClient().$transaction(async (tx) => {
        const event = await tx.event.findUnique({where: {id: eventId}});
        if (!event) throw new NotFoundException('Event not found', ErrorCode.EVENT_NOT_FOUND);
        if (event.availableTickets < ticketCount) throw new ConflictException('Not enough tickets available', ErrorCode.NOT_ENOUGH_TICKET);

        const booking = await tx.booking.create({
            data: {userId, eventId, ticketCount},
        });
        await tx.event.update({
            where: {id: eventId},
            data: {availableTickets: {decrement: ticketCount}},
        });
        return booking;
    });
};

export const get = async (eventId: number, bookingId: number): Promise<Booking> => {
    const booking = await getPrismaClient().booking.findFirst({
        where: { id: bookingId, eventId },
    });
    if (!booking) throw new NotFoundException('Booking not found', ErrorCode.BOOKING_NOT_FOUND);
    return booking;
};


export const remove = async (eventId: number, bookingId: number): Promise<void> => {
    await getPrismaClient().$transaction(async (tx) => {
        const booking = await tx.booking.findFirst({
            where: { id: bookingId, eventId },
        });
        if (!booking) throw new NotFoundException('Booking not found', ErrorCode.BOOKING_NOT_FOUND);

        await tx.booking.delete({
            where: { id: bookingId },
        });
        await tx.event.update({
            where: { id: eventId },
            data: { availableTickets: { increment: booking.ticketCount } },
        });
    });
};