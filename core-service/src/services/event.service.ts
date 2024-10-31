import { Event } from '@prisma/client';
import {CreateEventData, GetEventData} from "../schemas/event.schema";
import {getPrismaClient} from "../database/prismaClient";
import {NotFoundException} from "../exceptions/NotFoundException";
import {ErrorCode} from "../exceptions/ErrorCode";
import logger from "../config/logger";
import {addEmailJob} from "../queues/email.queue";
import {EmailJobData} from "../types/email";
import {ConflictException} from "../exceptions/ConflictException";

export const create = async (eventData: CreateEventData, userId: number): Promise<Event> => {
    const newEvent = await getPrismaClient().event.create({
        data: {
            name: eventData.name,
            description: eventData.description,
            date: eventData.date,
            venue: eventData.venue,
            totalTickets: eventData.totalTickets,
            availableTickets: eventData.totalTickets,
            createdBy: userId,
        }
    });
    logger.info(`Event created successfully with ID: ${newEvent.id}`);
    return newEvent;

};

export const get = async (eventData: GetEventData): Promise<Event> => {
    const event = await getPrismaClient().event.findUnique({where: {id: eventData.eventId}});
    if(!event) {
        throw new NotFoundException('Event not found', ErrorCode.EVENT_NOT_FOUND);
    }
    logger.debug(`Fetched event with ID: ${eventData.eventId}`);
    return event;
};


export const getAll = async (): Promise<Event[]> => {
    const events = await getPrismaClient().event.findMany();
    if(events.length === 0) {
        logger.debug('No events found in the database.');
    }
    return events;
};

export const remove = async (getEventData: GetEventData): Promise<void> => {
    await getPrismaClient().$transaction(async (tx) => {
        const event = await tx.event.findUnique({ where: { id: getEventData.eventId } });
        if (!event) {
            throw new NotFoundException('Event not found', ErrorCode.EVENT_NOT_FOUND);
        }
        if (new Date(event.date) <= new Date()) {
            logger.error('Cannot delete past events.');
            throw new ConflictException('Cannot delete past events.',ErrorCode.EVENT_IS_IN_THE_PAST);
        }
        const bookings = await tx.booking.findMany({
            where: { eventId: getEventData.eventId},
            include: { user: true },
        });
        await tx.event.delete({ where: { id: getEventData.eventId } });

        logger.info(`Event with ID ${getEventData.eventId} and all associated bookings were deleted successfully`);

        await Promise.all(bookings.map((booking) => {
            const emailData: EmailJobData = {
                recipient: booking.user.email,
                emailType: 'event_deleted_by_admin',
                userName: booking.user.name,
                eventName: event.name,
                eventVenue: event.venue,
                eventTime: event.date,
                ticketCount: booking.ticketCount,
                bookingId: booking.id,
            };
            return addEmailJob(emailData).catch((err) => {
                logger.error(`Failed to send cancellation email to user ID ${booking.user.id}`, { error: err });
            });
        }));
    });
};
