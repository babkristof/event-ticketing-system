import { Event } from '@prisma/client';
import {CreateEventData, GetEventData} from "../schemas/event.schema";
import {getPrismaClient} from "../database/prismaClient";
import {NotFoundException} from "../exceptions/NotFoundException";
import {ErrorCode} from "../exceptions/ErrorCode";
import logger from "../config/logger";

export const create = async (eventData: CreateEventData, userId: number): Promise<Event> => {
    return getPrismaClient().event.create({
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
};

export const get = async (eventData: GetEventData): Promise<Event> => {
    const event = await getPrismaClient().event.findUnique({where: {id: eventData.eventId}});
    if(!event) {
        throw new NotFoundException('Event not found', ErrorCode.EVENT_NOT_FOUND);
    }
    return event;
};


export const getAll = async (): Promise<Event[]> => {
    const events = await getPrismaClient().event.findMany();
    if(events.length === 0) {
        logger.debug('No events found in the database.');
    }
    return events;
};