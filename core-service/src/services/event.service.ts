import {Event, Prisma} from '@prisma/client';
import {CreateEventData, GetEventData, UpdateEventData} from "../schemas/event.schema";
import {getPrismaClient} from "../database/prismaClient";
import {NotFoundException} from "../exceptions/NotFoundException";
import {ErrorCode} from "../exceptions/ErrorCode";
import logger from "../config/logger";
import {addEmailJob} from "../queues/email.queue";
import {EmailJobData} from "../types/email";
import {ConflictException} from "../exceptions/ConflictException";
import {EventWithBookings, InternalUpdateEventData} from "../types/event";

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


export const update = async (eventId: number, updateData: UpdateEventData): Promise<Event> => {
    const internalUpdateData = prepareInternalUpdateData(updateData);

    return  getPrismaClient().$transaction(async (tx) => {
        const existingEvent = await fetchExistingEvent(tx, eventId);
        validateEventUpdate(existingEvent, internalUpdateData);

        const shouldNotifyUsers = shouldSendNotifications(existingEvent, internalUpdateData);

        const updatedEvent = await tx.event.update({
            where: { id: eventId },
            data: internalUpdateData,
        });

        logger.info(`Event with ID ${eventId} successfully updated`);

        if (shouldNotifyUsers) {
            await notifyBookedUsers(existingEvent, internalUpdateData);
        }

        return updatedEvent;
    });
};


const fetchExistingEvent = async (tx: Prisma.TransactionClient, eventId: number): Promise<EventWithBookings> => {
    const event = await tx.event.findUnique({
        where: { id: eventId },
        include: {
            bookings: { include: { user: true } },
        },
    });

    if (!event) {
        throw new NotFoundException('Event not found', ErrorCode.EVENT_NOT_FOUND);
    }

    return event;
};

const validateEventUpdate = (existingEvent: EventWithBookings, updateData: InternalUpdateEventData) => {
    if (new Date(existingEvent.date) <= new Date()) {
        throw new ConflictException('Cannot update past events', ErrorCode.EVENT_IS_IN_THE_PAST);
    }

    const soldTickets = existingEvent.totalTickets - existingEvent.availableTickets;
    if (updateData.totalTickets && updateData.totalTickets < soldTickets) {
        throw new ConflictException('Total tickets cannot be less than the number of already sold tickets', ErrorCode.INSUFFICIENT_TICKET_COUNT);
    }

    if (updateData.totalTickets) {
        updateData.availableTickets = updateData.totalTickets - soldTickets;
    }
};

const shouldSendNotifications = (existingEvent: EventWithBookings, updateData: InternalUpdateEventData): boolean => {
    const dateChanged = !!updateData.date && updateData.date.getTime() !== existingEvent.date.getTime();
    const venueChanged = !!updateData.venue && updateData.venue !== existingEvent.venue;
    return dateChanged || venueChanged;
};

const prepareInternalUpdateData = (updateData: UpdateEventData): InternalUpdateEventData => ({
    ...updateData,
});

const notifyBookedUsers = async (existingEvent: EventWithBookings, updateData: InternalUpdateEventData) => {
    const notifications = existingEvent.bookings.map((booking) => {
        const emailData: EmailJobData = {
            recipient: booking.user.email,
            emailType: 'event_updated_by_admin',
            userName: booking.user.name,
            eventName: existingEvent.name,
            eventVenue: updateData.venue || existingEvent.venue,
            eventTime: updateData.date || existingEvent.date,
            ticketCount: booking.ticketCount,
            bookingId: booking.id,
        };
        return addEmailJob(emailData).catch((err) => {
            logger.error(`Failed to send update notification email to user ID ${booking.user.id}`, { error: err });
        });
    });

    await Promise.all(notifications);
};