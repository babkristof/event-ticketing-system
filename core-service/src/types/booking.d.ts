import {Booking} from "@prisma/client";

export type EventParams = { eventId: string };
export type EventBookingParams = { eventId: string; bookingId: string };


export type BookingDetail = {
    id: Booking['id'];
    eventId: number;
    eventName: string;
    eventDate: Date;
    eventVenue: string;
    ticketCount: number;
};
