import { z } from 'zod';

export const createBookingSchema = z.object({
    ticketCount: z.number().positive("Ticket count must be positive").max(100, "You can book a maximum of 100 tickets at a time"),
});

export const getBookingSchema = z.object({
    eventId: z.preprocess(
        (val) => (typeof val === "string" ? parseInt(val, 10) : val),
        z.number().int().positive("Event ID must be a positive integer")
    ),
    bookingId: z.preprocess(
        (val) => (typeof val === "string" ? parseInt(val, 10) : val),
        z.number().int().positive("Booking ID must be a positive integer")
    ),
});

export type CreateBookingData = z.infer<typeof createBookingSchema>;