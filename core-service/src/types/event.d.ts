import {Event} from "@prisma/client";
import {UpdateEventData} from "../schemas/event.schema";

export type UpdateEventParams = { eventId: number };
export type InternalUpdateEventData = UpdateEventData & { availableTickets?: number };

export type EventWithBookings = Event & {
    bookings: {
        user: {
            id: number;
            name: string;
            email: string;
        };
        id: number;
        ticketCount: number;
    }[];
};
